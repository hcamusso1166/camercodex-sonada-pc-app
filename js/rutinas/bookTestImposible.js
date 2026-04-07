const BOOK_DATA = {
  basePath: "../books",
  indexPath: "../books/index.json",
};


const AUDIO_DATA = {
  baseNumbersPath: "../audios/suma",
};
const routineState = {
  books: [],
  currentBook: null,
  currentSelection: null,
  lastTpSeq: -1,
  logs: [],
  tpConnected: false,
};

const ui = {
  startShowButton: null,
  replayAudioButton: null,
  stopAudioButton: null,
  tpStatusLabel: null,
  audioStatusLabel: null,
  payloadStatus: null,
  resolvedBookTitle: null,
  resolvedBookAuthor: null,
  resolvedBookCode: null,
  resolvedPage: null,
  resolvedLine: null,
  resolvedContextList: null,
  routineLog: null,
};

let tpAdapter;
let showAudio;

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initBookTestImposibleRoutine);
} else {
  initBookTestImposibleRoutine();
}

async function initBookTestImposibleRoutine() {
  bindUiElements();
  bindEvents();
  setupAudioAndBle();
  resetRoutineState();
  await preloadBooks();
  logInfo("Rutina inicializada en modo show-time (esperando conexión TP).", "INIT");
}

function bindUiElements() {
  ui.startShowButton = document.getElementById("startShowButton");
  ui.replayAudioButton = document.getElementById("replayAudioButton");
  ui.stopAudioButton = document.getElementById("stopAudioButton");
  ui.tpStatusLabel = document.getElementById("tpStatusLabel");
  ui.audioStatusLabel = document.getElementById("audioStatusLabel");
  ui.payloadStatus = document.getElementById("payloadStatus");

  ui.resolvedBookTitle = document.getElementById("resolvedBookTitle");
  ui.resolvedBookAuthor = document.getElementById("resolvedBookAuthor");
  ui.resolvedBookCode = document.getElementById("resolvedBookCode");
  ui.resolvedPage = document.getElementById("resolvedPage");
  ui.resolvedLine = document.getElementById("resolvedLine");
  ui.resolvedContextList = document.getElementById("resolvedContextList");

  ui.routineLog = document.getElementById("routineLog");
}

function bindEvents() {
ui.startShowButton?.addEventListener("click", onStartShowClick);
  ui.replayAudioButton?.addEventListener("click", () => showAudio?.replay());
  ui.stopAudioButton?.addEventListener("click", () => showAudio?.stop("Audio detenido por operador."));
}

function setupAudioAndBle() {
  showAudio = new window.BookTestImposibleShowAudio({
    onLog: appendLog,
    onStatus: renderAudioStatus,
  });

  tpAdapter = new window.BookTestImposibleTpAdapter({
    onLog: appendLog,
    onEvent: onTpEvent,
    onDisconnected: onTpDisconnected,
  });
}

async function preloadBooks() {
  try {
    const booksIndex = await loadJson(BOOK_DATA.indexPath, "No se pudo cargar books/index.json");
    const books = normalizeBooksIndex(booksIndex).map(normalizeBookMetadata);
    routineState.books = books;
    logInfo(`Index cargado con ${books.length} libro(s).`, "DATA");
  } catch (error) {
    logError(error.message, "DATA");
    updatePayloadStatus(error.message, true);
  }
}

async function onStartShowClick() {
  try {
    showAudio.enableFromUserGesture();
    updatePayloadStatus("Conectando al TP...", false);
    await tpAdapter.connect();
    routineState.tpConnected = true;
    renderTpStatus("TP conectado");
    updatePayloadStatus("Sesión show-time activa. Esperando eventos TP.", false);
  } catch (error) {
    logError(`No se pudo iniciar show: ${error.message}`, "BLE");
    renderTpStatus("TP no conectado");
    updatePayloadStatus(error.message, true);
  }
}
  
function onTpDisconnected() {
  routineState.tpConnected = false;
  renderTpStatus("TP desconectado");
  updatePayloadStatus("Conexión BLE cerrada.", true);
}

async function onTpEvent(event) {
  if (event.tpSeq <= routineState.lastTpSeq) {
    logInfo(`Evento ignorado por tpSeq viejo (tpSeq=${event.tpSeq}, last=${routineState.lastTpSeq}).`, "EVENT");
    return;
  }

  routineState.lastTpSeq = event.tpSeq;
  logInfo(`Procesando ${event.msgTypeName} con tpSeq=${event.tpSeq}.`, "EVENT");

  if (event.msgTypeName === "BOOK") {
    handleBookEvent(event);
    return;
  }

  if (event.msgTypeName === "SELECTION") {
    await handleSelectionEvent(event);
    return;
  }

  if (event.msgTypeName === "CLEARED") {
    handleClearedEvent(event);
    return;
  }

  if (event.msgTypeName === "SNAPSHOT") {
    await handleSnapshotEvent(event);
    return;
  }

  logInfo(`msgType no manejado: ${event.msgTypeName}.`, "EVENT");
}

function handleBookEvent(event) {
  const resolvedBook = resolveBookByTpCode(event.bookCode);
  routineState.currentBook = resolvedBook;
  routineState.currentSelection = null;
  showAudio.stop("Audio cancelado por nuevo evento BOOK.");
  showAudio.setQueue([], { label: "BOOK_RESET" });

  clearSelectionView();

  if (!resolvedBook) {
    const errorMessage = `No se pudo mapear bookCode '${event.bookCode}'.`;
    updatePayloadStatus(errorMessage, true);
    renderBookInfo(null, event.bookCode);
    logError(errorMessage, "MAP");
    return;
  }

  renderBookInfo(resolvedBook, event.bookCode);
  updatePayloadStatus(`Libro resuelto: ${resolvedBook.title}.`, false);
  logInfo(`Libro resuelto para code '${event.bookCode}': ${resolvedBook.bookId}.`, "MAP");
}

async function handleSelectionEvent(event) {
  showAudio.stop("Audio cancelado por nuevo evento SELECTION.");

  if (!routineState.currentBook) {
    const errorMessage = "Llegó SELECTION pero no hay libro actual resuelto.";
    updatePayloadStatus(errorMessage, true);
    logError(errorMessage, "DATA");
    return;
  }

  try {
    const selection = await resolveSelection(routineState.currentBook, event.page, event.line);
    routineState.currentSelection = selection;
    renderSelection(selection);
    updatePayloadStatus(`Selección resuelta: pág ${selection.pageNumber}, línea ${selection.lineNumber}.`, false);
    logInfo(`Selección resuelta para ${selection.book.bookId}.`, "DATA");

    const queueResult = await buildShowAudioQueue(selection);
    showAudio.setQueue(queueResult.queue, { label: `tpSeq ${event.tpSeq}` });
    queueResult.warnings.forEach(warning => logInfo(warning, "AUDIO"));
    if (queueResult.queue.length) {
      await showAudio.playQueue();
    }
  } catch (error) {
    updatePayloadStatus(error.message, true);
    logError(error.message, "DATA");
    clearSelectionView();
  }
}

async function handleSnapshotEvent(event) {
  logInfo("SNAPSHOT recibido; sincronizando estado parcial disponible.", "EVENT");

  if (event.stateBits.bookValid && event.bookCode && event.bookCode !== "----") {
    handleBookEvent(event);
  }

  if (event.stateBits.selectionValid && event.page > 0 && event.line > 0) {
    await handleSelectionEvent(event);
  }
}

function handleClearedEvent(event) {
  showAudio.stop("Audio cancelado por evento CLEARED.");
  routineState.currentSelection = null;
  clearSelectionView();
  updatePayloadStatus(`Selección limpiada por TP (tpSeq=${event.tpSeq}).`, false);
  logInfo("Selección visual limpia tras CLEARED.", "EVENT");
}

async function resolveSelection(book, page, line) {
  if (!Number.isInteger(page) || page <= 0) {
    throw new Error(`Página inválida recibida: ${page}.`);
  }
  if (!Number.isInteger(line) || line <= 0) {
    throw new Error(`Renglón inválido recibido: ${line}.`);
  }

  const pagePath = buildPagePath(book, page);
  logInfo(`Resolviendo página desde: ${pagePath}`, "DATA");
  const pageData = await loadJson(pagePath, `No se pudo cargar la página ${page}`);

  const lines = extractLines(pageData);
  if (!lines.length) {
    throw new Error(`La página ${page} no contiene líneas utilizables.`);
  }

  const lineIndex = line - 1;
  if (lineIndex < 0 || lineIndex >= lines.length) {
    throw new Error(`Renglón fuera de rango. La página ${page} tiene ${lines.length} líneas.`);
  }

  return {
    book,
    pageNumber: page,
    lineNumber: line,
    selectedLine: lines[lineIndex],
    previewLines: buildPreviewLines(lines, lineIndex),
  };
}

function buildPreviewLines(lines, selectedIndex) {
  const preview = [];
  for (let offset = 0; offset < 4; offset += 1) {
    const idx = selectedIndex + offset;
    if (idx >= lines.length) {
      break;
    }
    preview.push({
      lineNumber: idx + 1,
      text: lines[idx],
      isSelected: offset === 0,
      offset,
    });
  }
  return preview;
}

async function buildShowAudioQueue(selection) {
  const queue = [];
  const warnings = [];

  const bookAudioCandidates = [
    `${normalizeRootPath(selection.book.root)}/audio/title.mp3`,
    `${normalizeRootPath(selection.book.root)}/title.mp3`,
    `${normalizeRootPath(selection.book.root)}/audio/author.mp3`,
    `${normalizeRootPath(selection.book.root)}/author.mp3`,
  ];

  for (const src of bookAudioCandidates) {
    if (await assetExists(src)) {
      queue.push({ src, label: `book:${src}` });
    } else {
      warnings.push(`Asset faltante: ${src}`);
    }
  }

  const pageNumberAudio = await buildNumberAudio(selection.pageNumber);
  if (!pageNumberAudio.length) {
    warnings.push(`No se encontró audio numérico para página ${selection.pageNumber}.`);
  }
  queue.push(...pageNumberAudio.map(src => ({ src, label: `page:${selection.pageNumber}` })));

  const lineNumberAudio = await buildNumberAudio(selection.lineNumber);
  if (!lineNumberAudio.length) {
    warnings.push(`No se encontró audio numérico para renglón ${selection.lineNumber}.`);
  }
  queue.push(...lineNumberAudio.map(src => ({ src, label: `line:${selection.lineNumber}` })));

  const firstLineTakes = await findLineTakeAudios(selection);
  if (!firstLineTakes.length) {
    warnings.push("No se encontraron takes locales para la línea seleccionada.");
  }
  queue.push(...firstLineTakes.map(src => ({ src, label: `take:${src}` })));

  return { queue, warnings };
}

async function findLineTakeAudios(selection) {
  const pageSlug = String(selection.pageNumber).padStart(3, "0");
  const lineSlug = String(selection.lineNumber).padStart(2, "0");
  const root = normalizeRootPath(selection.book.root);

  const candidates = [
    `${root}/audio/pages/page-${pageSlug}/line-${lineSlug}-take1.mp3`,
    `${root}/audio/pages/page-${pageSlug}/line-${lineSlug}-take2.mp3`,
    `${root}/audio/pages/page-${pageSlug}/line-${lineSlug}-take3.mp3`,
    `${root}/audio/page-${pageSlug}/line-${lineSlug}-take1.mp3`,
    `${root}/audio/page-${pageSlug}/line-${lineSlug}-take2.mp3`,
    `${root}/audio/page-${pageSlug}/line-${lineSlug}-take3.mp3`,
  ];

  const found = [];
  for (const src of candidates) {
    if (await assetExists(src)) {
      found.push(src);
    }
  }
  return found;
}

async function buildNumberAudio(number) {
  const directPath = `${AUDIO_DATA.baseNumbersPath}/${number}.mp3`;
  if (await assetExists(directPath)) {
    return [directPath];
  }
  return [];
}

function resolveBookByTpCode(bookCodeRaw) {
  const code = String(bookCodeRaw || "").trim().toUpperCase();
  if (!code || code === "----") {
    return null;
  }

  const tagPrefix = code.slice(0, 2);

  const exact = routineState.books.find(book => {
    const candidates = [book.tag, book.bookId, book.id, book.slug, book.tpCode]
      .filter(Boolean)
      .map(value => String(value).trim().toUpperCase());
    return candidates.includes(code);
  });
  if (exact) {
    return exact;
  }

  const byTagPrefix = routineState.books.find(book => {
    const tag = String(book.tag || "").trim().toUpperCase();
    return Boolean(tag) && tagPrefix === tag;
  });

  return byTagPrefix || null;
}

async function assetExists(path) {
  try {
    const response = await fetch(path, { cache: "no-store" });
    return response.ok;
  } catch (error) {
    return false;
  }
}

async function loadJson(path, errorPrefix) {
  let response;

  try {
    response = await fetch(path, { cache: "no-store" });
  } catch (error) {
    throw new Error(`${errorPrefix}: error de red/carga local (${path}).`);
  }

  if (!response.ok) {
    throw new Error(`${errorPrefix}: HTTP ${response.status} (${path}).`);
  }

  try {
    return await response.json();
  } catch (error) {
    throw new Error(`${errorPrefix}: JSON mal formado (${path}).`);
  }
}

function normalizeBooksIndex(indexData) {
  if (Array.isArray(indexData)) {
    return indexData;
  }

  if (Array.isArray(indexData?.books)) {
    return indexData.books;
  }

  throw new Error("books/index.json no tiene estructura válida (array o { books: [] }).");
}

function normalizeBookMetadata(rawBook) {
  const bookId = getBookId(rawBook);
  return {
    ...rawBook,
    bookId,
    title: rawBook.title || rawBook.name || "(sin título)",
    author: rawBook.author || rawBook.autor || "(sin autor)",
    root: rawBook.root || `${BOOK_DATA.basePath}/${bookId}`,
  };
}

function getBookId(rawBook) {
  return rawBook?.bookId || rawBook?.id || rawBook?.slug || "";
}

function normalizeRootPath(rootPath) {
  if (!rootPath || typeof rootPath !== "string") {
    return "";
  }

  if (rootPath.startsWith("../") || rootPath.startsWith("./")) {
    return rootPath;
  }

  if (rootPath.startsWith("books/")) {
    return `../${rootPath}`;
  }

  return `${BOOK_DATA.basePath}/${rootPath.replace(/^\/+/, "")}`;
}

function buildPagePath(book, page) {
  const pageSlug = String(page).padStart(3, "0");
  return `${normalizeRootPath(book.root)}/pages/page-${pageSlug}.json`;
}

function extractLines(pageData) {
  const candidates = [
    pageData?.lines,
    pageData?.lineas,
    pageData?.content?.lines,
    pageData?.data?.lines,
  ].filter(Boolean);

  const list = candidates.find(Array.isArray);
  if (!list) {
    return [];
  }

  return list
    .map(item => {
      if (typeof item === "string") {
        return item.trim();
      }
      if (item && typeof item === "object") {
        return (item.text || item.content || item.line || "").trim();
      }
      return "";
    })
    .filter(Boolean);
}

function resetRoutineState() {
  routineState.currentBook = null;
  routineState.currentSelection = null;
  routineState.lastTpSeq = -1;
  routineState.logs = [];
  routineState.tpConnected = false;

  updatePayloadStatus("Esperando inicio de show.", false);
  renderTpStatus("TP no conectado");
  renderAudioStatus("detenido", "");
  renderBookInfo(null, "—");
  clearSelectionView();
  renderLog();
}

function renderTpStatus(label) {
  if (ui.tpStatusLabel) {
    ui.tpStatusLabel.textContent = label;
  }
}

function renderAudioStatus(status, detail = "") {
  if (!ui.audioStatusLabel) {
    return;
  }
  ui.audioStatusLabel.textContent = detail ? `${status} (${detail})` : status;
}

function renderBookInfo(book, code = "—") {
  ui.resolvedBookTitle.textContent = book?.title || "—";
  ui.resolvedBookAuthor.textContent = book?.author || "—";
  ui.resolvedBookCode.textContent = code || "—";
}

function clearSelectionView() {
    ui.resolvedPage.textContent = "—";
  ui.resolvedLine.textContent = "—";
  ui.resolvedContextList.innerHTML = "<li>—</li>";
}

function renderSelection(selection) {
  ui.resolvedPage.textContent = String(selection.pageNumber);
  ui.resolvedLine.textContent = String(selection.lineNumber);
  ui.resolvedContextList.innerHTML = "";

  selection.previewLines.forEach(item => {
    const li = document.createElement("li");
    const prefix = item.offset === 0 ? "Elegida" : `Siguiente ${item.offset}`;
    li.textContent = `${prefix} (L${item.lineNumber}): ${item.text}`;
    if (item.isSelected) {
      li.style.fontWeight = "700";
    }
    ui.resolvedContextList.appendChild(li);
  });
}

function updatePayloadStatus(message, isError) {
  if (!ui.payloadStatus) {
    return;
  }
  ui.payloadStatus.textContent = message;
  ui.payloadStatus.style.color = isError ? "#f56c6c" : "#b8bcc6";
}

function logInfo(message, source = "INFO") {
  appendLog("INFO", source, message);
}

function logError(message, source = "ERROR") {
  appendLog("ERROR", source, message);
}

function appendLog(level, source, message) {
  const timestamp = new Date().toLocaleTimeString("es-AR", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });

  routineState.logs.push(`[${timestamp}] [${level}] [${source}] ${message}`);
  renderLog();
}

function renderLog() {
  if (!ui.routineLog) {
    return;
  }
  ui.routineLog.textContent = routineState.logs.length ? routineState.logs.join("\n") : "Sin eventos todavía.";
  ui.routineLog.scrollTop = ui.routineLog.scrollHeight;
}

window.bookTestImposibleDev = {
  buildPagePath,
  buildPreviewLines,
  resolveBookByTpCode,
};
