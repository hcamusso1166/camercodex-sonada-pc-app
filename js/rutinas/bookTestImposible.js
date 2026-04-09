const BOOK_DATA = {
  basePath: "../books",
  indexPath: "../books/index.json",
};

const routineState = {
  books: [],
  currentBook: null,
  currentSelection: null,
  lastTpSeq: -1,
  logs: [],
  tpConnected: false,
  tpConnectionState: "disconnected",
  startShowButtonDefaultLabel: "",
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
  resolvedPageHash: null,
  resolvedLineHash: null,
  resolvedWindowHash: null,
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
  routineState.startShowButtonDefaultLabel = ui.startShowButton?.textContent || "Iniciar show / conectar TP";
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
  ui.resolvedPageHash = document.getElementById("resolvedPageHash");
  ui.resolvedLineHash = document.getElementById("resolvedLineHash");
  ui.resolvedWindowHash = document.getElementById("resolvedWindowHash");

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
  if (routineState.tpConnectionState === "connected" || isTpAdapterConnected()) {
    routineState.tpConnectionState = "connected";
    logInfo("Conexión ignorada: TP ya conectado.", "BLE");
    return;
  }

  if (routineState.tpConnectionState === "connecting") {
    logInfo("Conexión ignorada: TP en proceso de conexión.", "BLE");
    return;
  }

  if (routineState.tpConnectionState !== "disconnected") {
    return;
  }

  try {
    showAudio.enableFromUserGesture();
    setTpConnectionState("connecting");
    updatePayloadStatus("Conectando al TP...", false);
    await tpAdapter.connect();
    setTpConnectionState("connected");
    routineState.tpConnected = true;
    renderTpStatus("TP conectado");
    updatePayloadStatus("Sesión show-time activa. Esperando eventos TP.", false);
  } catch (error) {
    setTpConnectionState("disconnected");
    logError(`No se pudo iniciar show: ${error.message}`, "BLE");
    renderTpStatus("TP no conectado");
    updatePayloadStatus(error.message, true);
  }
}
  
function onTpDisconnected() {
  setTpConnectionState("disconnected");
  routineState.tpConnected = false;
  showAudio?.stop("Audio detenido por desconexión TP.");
  renderTpStatus("TP desconectado");
  updatePayloadStatus("Conexión BLE cerrada. Selección previa conservada.", false);
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

        if (selection.pageNumber === 9) {
      await showAudio.playClassicLineAudio(selection.book.bookId, selection.pageNumber, selection.lineNumber);
      return;
    }
    
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
  showAudio.setQueue([], { label: "CLEARED_RESET" });
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

  const sayLines = extractSayLines(pageData);
  if (!sayLines.length) {
    throw new Error(`La página ${page} no contiene líneas SAY utilizables.`);
  }

  const lineIndex = line - 1;
  if (lineIndex < 0 || lineIndex >= sayLines.length) {
    throw new Error(`Renglón fuera de rango. La página ${page} tiene ${sayLines.length} líneas.`);
  }

  if (page === 9) {
    logInfo("Página 009 cargada", "DATA");
  }
  logInfo(`SAY lines: ${sayLines.length}`, "DATA");

  const windowLines = resolveSayWindow(sayLines, line);
  const pageHash = buildPageHash(sayLines);
  const lineHash = buildLineHash(sayLines[lineIndex]);
  const windowHash = buildWindowHash(windowLines);

  logInfo(`pageHash=${pageHash}`, "HASH");
  logInfo(`lineHash=${lineHash}`, "HASH");
  logInfo(`windowHash=${windowHash}`, "HASH");
  logInfo(`Ventana resuelta con ${windowLines.length} línea(s)`, "VIEW");

  logTpCanonicalAlignment(page, line, windowLines, pageHash, windowHash);

  return {
    book,
    pageNumber: page,
    lineNumber: line,
    selectedLine: sayLines[lineIndex],
    sayLines,
    windowLines,
    pageHash,
    lineHash,
    windowHash,
    previewLines: buildPreviewLines(sayLines, lineIndex),
  };
}

function resolveSayWindow(sayLines, selectedLine) {
  return window.BookTestImposibleCanonical?.resolveSayWindow(sayLines, selectedLine)
    || buildPreviewLines(sayLines, Math.max(0, selectedLine - 1)).map(item => item.text);
}

function buildPageHash(sayLines) {
  return window.BookTestImposibleCanonical?.buildPageHash(sayLines) || "00000000";
}

function buildWindowHash(windowLines) {
  return window.BookTestImposibleCanonical?.buildWindowHash(windowLines) || "00000000";
}

function buildLineHash(line) {
  return window.BookTestImposibleCanonical?.buildLineHash(line) || "00000000";
}

function logTpCanonicalAlignment(page, selectedLine, appWindowLines, appPageHash, appWindowHash) {
  if (page !== 9 || selectedLine <= 0) {
    return;
  }

  const tpSayLines = window.BookTestImposibleCanonical?.getTpCanonicalPage009SayLines?.() || [];
  const tpWindowLines = resolveSayWindow(tpSayLines, selectedLine);
  const tpPageHash = buildPageHash(tpSayLines);
  const tpWindowHash = buildWindowHash(tpWindowLines);

  logInfo("Page 009 canonical SAY loaded", "TP");
  logInfo(`pageHash=${tpPageHash}`, "TP");
  logInfo(`windowHash=${tpWindowHash}`, "TP");
  logInfo(`selectedLine=${selectedLine}`, "TP");
  logInfo(`windowLines=${tpWindowLines.length}`, "TP");

  if (tpPageHash !== appPageHash || tpWindowHash !== appWindowHash || tpWindowLines.join("\n") !== appWindowLines.join("\n")) {
    logError("Desalineación detectada entre app y resolución local TP canónica.", "TP");
  }
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
async function resolveLocalLineTakes(bookId, page, line, assetExistsChecker) {
  const parts = ["p1", "p2", "p3"];
  const resolved = [];

  for (const part of parts) {
    const candidates = buildLineTakeCandidates(bookId, page, line, part);
    let found = null;

    for (const candidate of candidates) {
      const ok = await assetExistsChecker(candidate);
      console.log("CHECK", { part, candidate, ok });
      if (ok) {
        found = candidate;
        break;
      }
    }

    if (!found) {
      return [];
    }

    resolved.push(found);
  }

  return resolved;
}

async function buildShowAudioQueue(selection) {
  const warnings = [];
const bookId = selection.book.bookId || selection.book.id;

  const takes = await resolveLocalLineTakes(bookId, selection.pageNumber, selection.lineNumber, assetExists);
  if (!takes.length) {
    warnings.push("No se encontraron takes locales para la línea seleccionada.");
    return { queue: [], warnings };
  }

    const queue = [
    { type: "audio", src: takes[0], label: "take:p1" },
    { type: "pause", ms: 700, label: "pause:p1-p2" },
    { type: "audio", src: takes[1], label: "take:p2" },
    { type: "pause", ms: 900, label: "pause:p2-p3" },
    { type: "audio", src: takes[2], label: "take:p3" },
  ];

  const titleCandidates = buildMetaAudioCandidates(bookId, "title");
  const authorCandidates = buildMetaAudioCandidates(bookId, "author");
  const title = await resolveFirstExisting(titleCandidates, assetExists);
  const author = await resolveFirstExisting(authorCandidates, assetExists);

  if (title) {
    queue.push({ type: "pause", ms: 1000, label: "pause:after-p3" });
    queue.push({ type: "audio", src: title, label: "book:title" });
  } else {
    warnings.push(`Asset faltante: ${titleCandidates[0]}`);
  }

  if (author) {
    if (title) {
      queue.push({ type: "pause", ms: 350, label: "pause:title-author" });
    } else {
      queue.push({ type: "pause", ms: 1000, label: "pause:after-p3" });
    }
    queue.push({ type: "audio", src: author, label: "book:author" });
  } else {
    warnings.push(`Asset faltante: ${authorCandidates[0]}`);
  }

  warnings.push("Audio numérico de página/renglón diferido en fase mínima.");

  return { queue, warnings };
}

function pad3(value) {
  return String(value).padStart(3, "0");
}

function pad2(value) {
  return String(value).padStart(2, "0");
}

function buildMetaAudioCandidates(bookId, kind) {
  return [
    `../books/${bookId}/audios/_meta/${kind}.mp3`,
  ];
}

function buildLineTakeCandidates(bookId, page, line, part) {
  const pageFolder = `../books/${bookId}/audios/page-${pad3(page)}`;

  return [
    `${pageFolder}/line-${pad3(line)}_${part}.mp3`,
    `${pageFolder}/line-${pad2(line)}_${part}.mp3`,
  ];
}

async function resolveFirstExisting(candidates, assetExistsChecker) {
  for (const candidate of candidates) {
    if (await assetExistsChecker(candidate)) {
      return candidate;
    }
  }
  return null;
}

async function resolveLocalLineTakes(bookId, page, line, assetExistsChecker) {
  const parts = ["p1", "p2", "p3"];
  const resolved = [];

  for (const part of parts) {
    const candidates = buildLineTakeCandidates(bookId, page, line, part);

    let found = null;
    for (const candidate of candidates) {
      if (await assetExistsChecker(candidate)) {
        found = candidate;
        break;
      }
    }

    if (!found) {
      return [];
    }

    resolved.push(found);
  }

  return resolved;
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

function extractSayLines(pageData) {
  const candidates = [
    pageData?.sayLines,
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
  setTpConnectionState("disconnected");

  updatePayloadStatus("Esperando inicio de show.", false);
  renderTpStatus("TP no conectado");
  renderAudioStatus({
    state: "idle",
    message: "Esperando cola de audio.",
    queueLength: 0,
    currentIndex: -1,
  });
  renderBookInfo(null, "—");
  clearSelectionView();
  renderLog();
  refreshAudioButtons();
}

function renderTpStatus(label) {
  if (ui.tpStatusLabel) {
    ui.tpStatusLabel.textContent = label;
  }
}

function renderAudioStatus(statusPayload, detail = "") {
  if (!ui.audioStatusLabel) {
    return;
  }
const payload = typeof statusPayload === "object" && statusPayload
    ? statusPayload
    : {
      state: statusPayload || "idle",
      message: detail || "",
      queueLength: 0,
      currentIndex: -1,
    };
  const state = payload.state || "idle";
  const message = payload.message || "";
  ui.audioStatusLabel.textContent = message ? `${state} (${message})` : state;
  refreshAudioButtons(state);
}

function refreshAudioButtons(currentAudioState) {
  const state = currentAudioState || showAudio?.status || "idle";
  if (ui.replayAudioButton) {
    ui.replayAudioButton.disabled = !(showAudio?.lastPlayableQueue?.length > 0);
  }
  if (ui.stopAudioButton) {
    ui.stopAudioButton.disabled = state !== "playing";
  }
}

function isTpAdapterConnected() {
  return Boolean(tpAdapter?.device?.gatt?.connected || tpAdapter?.server?.connected);
}

function setTpConnectionState(state) {
  routineState.tpConnectionState = state;
  if (!ui.startShowButton) {
    return;
  }

  if (state === "connecting") {
    ui.startShowButton.disabled = true;
    ui.startShowButton.textContent = "Conectando TP...";
    return;
  }

  ui.startShowButton.disabled = false;
  ui.startShowButton.textContent = routineState.startShowButtonDefaultLabel;
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
  if (ui.resolvedPageHash) ui.resolvedPageHash.textContent = "—";
  if (ui.resolvedLineHash) ui.resolvedLineHash.textContent = "—";
  if (ui.resolvedWindowHash) ui.resolvedWindowHash.textContent = "—";
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

  if (ui.resolvedPageHash) ui.resolvedPageHash.textContent = selection.pageHash || "—";
  if (ui.resolvedLineHash) ui.resolvedLineHash.textContent = selection.lineHash || "—";
  if (ui.resolvedWindowHash) ui.resolvedWindowHash.textContent = selection.windowHash || "—";
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
  resolveSayWindow,
  buildPageHash,
  buildWindowHash,
  buildLineHash,
};
