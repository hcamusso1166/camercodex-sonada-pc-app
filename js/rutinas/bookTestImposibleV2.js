const BOOK_DATA = {
  basePath: "../books",
  indexPath: "../books/index.json",
};

const MAX_LINE_NUMBER = 20;
const MAX_LINE_CARD_SUM = 20;
const DEV_MULTIANTENNA_SIM_ENABLED = true;
const DEV_MULTIANTENNA_DEFAULT_SLOTS = [20, 20, 4, 1, 5];

const routineState = {
  books: [],
  currentBook: null,
  currentSelection: null,
  lastDeviceSeq: -1,
  logs: [],
  deviceConnected: false,
  deviceConnectionState: "disconnected",
  startShowButtonDefaultLabel: "",
};

const ui = {
  startShowButton: null,
  replayAudioButton: null,
  stopAudioButton: null,
  deviceStatusLabel: null,
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
    multiAntennaSimCard: null,
  multiAntennaSlotInputs: [],
  multiAntennaInjectButton: null,
};

let showAudio;

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initBookTestImposibleV2Routine);
} else {
  initBookTestImposibleV2Routine();
}

async function initBookTestImposibleV2Routine() {
  bindUiElements();
  setupAudio();
  resetRoutineState();
  bindEvents();
  await preloadBooks();
  logInfo("Rutina inicializada en modo móvil/audio (sin Teleprompter).", "INIT");
}

function bindUiElements() {
  ui.startShowButton = document.getElementById("connectBleButton") || document.getElementById("startShowButton");
  routineState.startShowButtonDefaultLabel = ui.startShowButton?.textContent || "Conectar MrCamerDev1.0";
  ui.replayAudioButton = document.getElementById("replayAudioButton");
  ui.stopAudioButton = document.getElementById("stopAudioButton");
  ui.deviceStatusLabel = document.getElementById("deviceStatusLabel") || document.getElementById("tpStatusLabel");
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
  
  ui.multiAntennaSimCard = document.getElementById("multiAntennaSimCard");
  ui.multiAntennaSlotInputs = [1, 2, 3, 4, 5]
    .map(slotNumber => document.getElementById(`multiAntennaSlot${slotNumber}`))
    .filter(Boolean);
  ui.multiAntennaInjectButton = document.getElementById("injectMultiAntennaSelectionButton");
}

function bindEvents() {
  ui.startShowButton?.addEventListener("click", () => showAudio?.enableFromUserGesture());
  ui.replayAudioButton?.addEventListener("click", () => showAudio?.replay());
  ui.stopAudioButton?.addEventListener("click", () => showAudio?.stop("Audio detenido por operador."));
  bindMultiAntennaSimulatorEvents();
}

function bindMultiAntennaSimulatorEvents() {
  if (!DEV_MULTIANTENNA_SIM_ENABLED) {
    ui.multiAntennaSimCard?.setAttribute("hidden", "hidden");
    return;
  }

  if (!ui.multiAntennaSimCard || !ui.multiAntennaInjectButton || ui.multiAntennaSlotInputs.length !== DEV_MULTIANTENNA_DEFAULT_SLOTS.length) {
    logError("[SIM][ERROR] Simulador multiantena incompleto en HTML.", "SIM");
    return;
  }

  ui.multiAntennaSimCard.removeAttribute("hidden");
  ui.multiAntennaSlotInputs.forEach((input, index) => {
    if (input.value === "") {
      input.value = String(DEV_MULTIANTENNA_DEFAULT_SLOTS[index]);
    }
  });
  ui.multiAntennaInjectButton.addEventListener("click", injectMultiAntennaSelectionFromUi);
  logInfo("[SIM] Multiantena UX habilitada", "SIM");
}

function readMultiAntennaSlotsFromUi() {
  return ui.multiAntennaSlotInputs.map(input => {
    const rawValue = String(input.value || "").trim();
    if (!/^\d+$/.test(rawValue)) {
      return null;
    }
    const slotValue = Number.parseInt(rawValue, 10);
    return Number.isInteger(slotValue) && slotValue >= 0 ? slotValue : null;
  });
}

function sumMultiAntennaSlots(slots) {
  return {
    page: slots[0] + slots[1] + slots[2],
    line: slots[3] + slots[4],
  };
}

function validateMultiAntennaSlots(slots) {
  if (slots.length !== DEV_MULTIANTENNA_DEFAULT_SLOTS.length || slots.some(slot => !Number.isInteger(slot) || slot < 0)) {
    return "Slots inválidos";
  }

  const { page, line } = sumMultiAntennaSlots(slots);
  if (page <= 0 || line <= 0 || line > MAX_LINE_NUMBER) {
    return "Página o renglón fuera de rango";
  }

  return "";
}

async function injectMultiAntennaSelectionFromUi() {
  if (!routineState.currentBook) {
    const message = "Primero resolvé el libro desde MrCamerDev1.0 antes de inyectar selección multiantena.";
    updatePayloadStatus(message, true);
    logError("[SIM][ERROR] No hay libro actual resuelto", "SIM");
    return;
  }

  const slots = readMultiAntennaSlotsFromUi();
  const slotsLabel = slots.map(slot => (slot == null ? "null" : String(slot))).join(",");
  logInfo(`[SIM] Slots recibidos: [${slotsLabel}]`, "SIM");

  const validationError = validateMultiAntennaSlots(slots);
  if (validationError) {
    const isInvalidSlots = validationError === "Slots inválidos";
    updatePayloadStatus(validationError, true);
    logError(`[SIM][ERROR] ${validationError}`, "SIM");
    if (!isInvalidSlots) {
      logError(`[SIM][ERROR] Rango permitido: page > 0, line 1..${MAX_LINE_NUMBER}. Suma de cartas clásica hasta ${MAX_LINE_CARD_SUM}.`, "SIM");
    }
    return;
  }

  const { page, line } = sumMultiAntennaSlots(slots);
  logInfo(`[SIM] Selección calculada -> page=${page} line=${line}`, "SIM");
  if (line > MAX_LINE_CARD_SUM) {
    logInfo(`[SIM] Renglón ${line} supera suma clásica ${MAX_LINE_CARD_SUM}, permitido por máximo extendido ${MAX_LINE_NUMBER}.`, "SIM");
  }
  logInfo("[SIM] Inyectando selección multiantena en flujo V2", "SIM");

  await handleDeviceSelectionEvent({
    page,
    line,
    source: "UX_SIM_MULTI",
  });
}

function setupAudio() {
  showAudio = new window.BookTestImposibleV2ShowAudio({
    onLog: appendLog,
    onStatus: renderAudioStatus,
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

function registrarBookTestImposibleV2(payload = {}) {
  const normalizedPayload = normalizeDevicePayload(payload);

  if (normalizedPayload.seq > 0 && normalizedPayload.seq <= routineState.lastDeviceSeq) {
    logInfo(`Lectura ignorada por seq viejo (seq=${normalizedPayload.seq}, last=${routineState.lastDeviceSeq}).`, "EVENT");
    return;
  }
  if (normalizedPayload.seq > 0) {
    routineState.lastDeviceSeq = normalizedPayload.seq;
  }

  const payloadLabel = normalizedPayload.rawValue || normalizedPayload.bookCode || "—";
  logInfo(
    `Payload MrCamer recibido: ${JSON.stringify({ valor: payloadLabel, antennaId: normalizedPayload.antennaId, seq: normalizedPayload.seq })}`,
    "BLE"
  );

  const explicitBookCode = normalizedPayload.bookCode;
  const inferredBookCode = inferBookCodeFromPayload(normalizedPayload);
  const bookCode = explicitBookCode || inferredBookCode;
  const shouldTreatAsBook = normalizedPayload.page == null
    && normalizedPayload.line == null
    && (isPrimaryAntenna(normalizedPayload.antennaId) || !routineState.currentBook);

  if (bookCode && shouldTreatAsBook) {
    handleBookPayload(bookCode);
    return;
  }

const selectionPayload = parseSelectionPayload(normalizedPayload);
  if (selectionPayload) {
    if (selectionPayload.bookCode && (!routineState.currentBook || selectionPayload.bookCode !== bookCode)) {
      handleBookPayload(selectionPayload.bookCode);
    } else if (explicitBookCode && !routineState.currentBook) {
      handleBookPayload(explicitBookCode);
    }

    handleDeviceSelectionEvent(selectionPayload);
    return;
  }

  if (bookCode) {
    handleBookPayload(bookCode);
    return;
  }

  const errorMessage = `Payload BTI v2 no reconocido: '${payloadLabel}'.`;
  updatePayloadStatus(errorMessage, true);
  logError(errorMessage, "BLE");
}

function handleBookPayload(bookCode) {
  const resolvedBook = resolveBookByDeviceCode(bookCode);
  routineState.currentBook = resolvedBook;
  routineState.currentSelection = null;
  showAudio.stop("Audio cancelado por nuevo libro.");
  showAudio.setQueue([], { label: "BOOK_RESET" });

  clearSelectionView();

  if (!resolvedBook) {
    const errorMessage = `No se pudo mapear bookCode '${bookCode}'.`;
    updatePayloadStatus(errorMessage, true);
    renderBookInfo(null, bookCode);
    logError(errorMessage, "MAP");
    return;
  }

  renderBookInfo(resolvedBook, bookCode);
  updatePayloadStatus(`Libro resuelto desde MrCamerDev1.0: ${resolvedBook.title}.`, false);
  logInfo(`Libro resuelto para code '${bookCode}': ${resolvedBook.bookId}.`, "MAP");
}

async function handleDeviceSelectionEvent(selectionPayload) {
  showAudio.stop("Audio cancelado por nueva selección.");

  if (!routineState.currentBook) {
    const errorMessage = "Llegó selección pero no hay libro actual resuelto.";
    updatePayloadStatus(errorMessage, true);
    logError(errorMessage, "DATA");
    return;
  }

  try {
    const selection = await resolveSelection(routineState.currentBook, selectionPayload.page, selectionPayload.line);
    routineState.currentSelection = selection;
    renderSelection(selection);
    updatePayloadStatus(`Selección resuelta: pág ${selection.pageNumber}, línea ${selection.lineNumber}.`, false);
    logInfo(`Selección resuelta para ${selection.book.bookId}.`, "DATA");

    const requestedLine = Number(selectionPayload.line ?? selection.lineNumber ?? 0);
    if (!Number.isInteger(requestedLine) || requestedLine <= 0 || requestedLine > MAX_LINE_NUMBER) {
      logError(`[AUDIO] Línea inválida para show-time: ${requestedLine}. Rango permitido 1..${MAX_LINE_NUMBER}.`, "AUDIO");
      return;
    }
    await showAudio.playClassicLineAudio(selection.book.bookId, selection.pageNumber, requestedLine);
  } catch (error) {
    updatePayloadStatus(error.message, true);
    logError(error.message, "DATA");
    clearSelectionView();
  }
}

function normalizeDevicePayload(payload) {
  const rawValue = String(payload.valor || payload.value || payload.rawValue || "").trim();
  const mvalor = String(payload.mvalor || rawValue.slice(0, 2) || "").trim();
  const color = payload.color != null ? String(payload.color).trim() : rawValue[2] || "";
  const dorso = payload.dorso != null ? String(payload.dorso).trim() : rawValue[3] || "";

  return {
    ...payload,
    rawValue,
    mvalor,
    color,
    dorso,
    bookCode: payload.bookCode != null ? String(payload.bookCode).trim() : "",
    page: toPositiveInteger(payload.page),
    line: toPositiveInteger(payload.line || payload.renglon),
    antennaId: toPositiveInteger(payload.antennaId),
    seq: toPositiveInteger(payload.seq),
  };
}

function inferBookCodeFromPayload(payload) {
  const explicit = payload.bookCode || payload.mvalor || payload.rawValue;
  if (!explicit) {
    return "";
  }
  const digits = String(explicit).trim().match(/\d+/)?.[0] || "";
  if (!digits) {
    return String(explicit).trim();
  }
  return digits.padStart(2, "0").slice(-2);
}

function parseSelectionPayload(payload) {
  if (payload.page != null && payload.line != null) {
    return {
      page: payload.page,
      line: payload.line,
      bookCode: payload.bookCode || "",
    };
  }

  const raw = String(payload.rawValue || "").trim();
  const compact = raw.replace(/[^0-9]/g, "");

  if (/^\d{4}$/.test(compact)) {
    return {
      page: Number.parseInt(compact.slice(0, 2), 10),
      line: Number.parseInt(compact.slice(2, 4), 10),
      bookCode: payload.bookCode || "",
    };
  }

  if (/^\d{5}$/.test(compact)) {
    return {
      page: Number.parseInt(compact.slice(0, 3), 10),
      line: Number.parseInt(compact.slice(3, 5), 10),
      bookCode: payload.bookCode || "",
    };
  }

  const page = toPositiveInteger(payload.mvalor);
  const line = toPositiveInteger(`${payload.color || ""}${payload.dorso || ""}`);
  if (page != null && line != null) {
    return {
      page,
      line,
      bookCode: payload.bookCode || "",
    };
  }

  return null;
}

function toPositiveInteger(value) {
  if (value == null || value === "") {
    return null;
  }
  const number = Number.parseInt(String(value).trim(), 10);
  return Number.isInteger(number) && number > 0 ? number : null;
}

function isPrimaryAntenna(antennaId) {
  return antennaId === 1 || antennaId === 9 || antennaId == null;
}

async function resolveSelection(book, page, line) {
  if (!Number.isInteger(page) || page <= 0) {
    throw new Error(`Página inválida recibida: ${page}.`);
  }
  if (!Number.isInteger(line) || line <= 0) {
    throw new Error(`Renglón inválido recibido: ${line}.`);
  }
if (line > MAX_LINE_NUMBER) {
    throw new Error(`Renglón inválido recibido: ${line}. Máximo soportado ${MAX_LINE_NUMBER}.`);
  }
  if (line > MAX_LINE_CARD_SUM) {
    logInfo(
      `Renglón ${line} por encima de suma de cartas (${MAX_LINE_CARD_SUM}); permitido por capacidad extendida hasta ${MAX_LINE_NUMBER}.`,
      "DATA"
    );
  }

  const pagePath = buildPagePath(book, page);
  logInfo(`Resolviendo página desde: ${pagePath}`, "DATA");
  const pageData = await loadJson(pagePath, `No se pudo cargar la página ${page}`);

  const sayLines = extractSayLines(pageData);
  if (!sayLines.length) {
    throw new Error(`La página ${page} no contiene líneas SAY utilizables.`);
  }

  const normalizedLine = normalizeShowSelectionLine(page, line);
  const lineIndex = normalizedLine - 1;
  if (lineIndex < 0 || lineIndex >= sayLines.length) {
    throw new Error(`Renglón fuera de rango. La página ${page} tiene ${sayLines.length} líneas reales.`);
  }

  if (page === 9) {
    logInfo("Página 009 cargada", "DATA");
  }
  logInfo(`SAY lines: ${sayLines.length}`, "DATA");

  const windowLines = resolveSayWindow(sayLines, normalizedLine);
  const pageHash = buildPageHash(sayLines);
  const lineHash = buildLineHash(sayLines[lineIndex]);
  const windowHash = buildWindowHash(windowLines);

  logInfo(`pageHash=${pageHash}`, "HASH");
  logInfo(`lineHash=${lineHash}`, "HASH");
  logInfo(`windowHash=${windowHash}`, "HASH");
  logInfo(`Ventana resuelta con ${windowLines.length} línea(s)`, "VIEW");

  logTpCanonicalAlignment(page, normalizedLine, windowLines, pageHash, windowHash);

  return {
    book,
    pageNumber: page,
    lineNumber: normalizedLine,
    selectedLine: sayLines[lineIndex],
    sayLines,
    windowLines,
    pageHash,
    lineHash,
    windowHash,
    previewLines: buildPreviewLines(sayLines, lineIndex),
  };
}

function normalizeShowSelectionLine(page, line) {
  void page;
  return line;
}

function resolveSayWindow(sayLines, selectedLine) {
  return window.BookTestImposibleV2Canonical?.resolveSayWindow(sayLines, selectedLine)
    || buildPreviewLines(sayLines, Math.max(0, selectedLine - 1)).map(item => item.text);
}

function buildPageHash(sayLines) {
  return window.BookTestImposibleV2Canonical?.buildPageHash(sayLines) || "00000000";
}

function buildWindowHash(windowLines) {
  return window.BookTestImposibleV2Canonical?.buildWindowHash(windowLines) || "00000000";
}

function buildLineHash(line) {
  return window.BookTestImposibleV2Canonical?.buildLineHash(line) || "00000000";
}

function logTpCanonicalAlignment(page, selectedLine, appWindowLines, appPageHash, appWindowHash) {
  if (page !== 9 || selectedLine <= 0) {
    return;
  }

  const tpSayLines = window.BookTestImposibleV2Canonical?.getTpCanonicalPage009SayLines?.() || [];
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

function resolveBookByDeviceCode(bookCodeRaw) {
  const codeRaw = String(bookCodeRaw || "").trim().toUpperCase();
  const numericCode = codeRaw.match(/\d+/)?.[0] || "";
  const normalizedNumericCode = numericCode ? numericCode.padStart(2, "0").slice(-2) : "";
  const code = normalizedNumericCode || codeRaw;
  if (!code || code === "----") {
    return null;
  }

  const tagPrefix = code.slice(0, 2);

  const exact = routineState.books.find(book => {
    const candidates = [book.tag, book.bookId, book.id, book.slug, book.tpCode]
      .filter(Boolean)
      .map(value => String(value).trim().toUpperCase());
    return candidates.includes(code) || candidates.includes(codeRaw);
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
  routineState.lastDeviceSeq = -1;
  routineState.logs = [];
  routineState.deviceConnected = false;
  setDeviceConnectionState("disconnected");

  updatePayloadStatus("Conectá MrCamerDev1.0 y acercá el payload del libro.", false);
  renderDeviceStatus("No conectado");
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


function setBookTestImposibleV2DeviceState(state, deviceLabel = "") {
  routineState.deviceConnected = state === "connected";
  routineState.deviceConnectionState = state;

  if (state === "connected") {
    renderDeviceStatus(deviceLabel ? `Conectado (${deviceLabel})` : "Conectado");
    updatePayloadStatus("MrCamerDev1.0 conectado. Esperando payload de libro (01 = Narnia: El sobrino del mago).", false);
    return;
  }

  renderDeviceStatus("No conectado");
  updatePayloadStatus("MrCamerDev1.0 desconectado. Selección previa conservada.", false);
}

function renderDeviceStatus(label) {
  if (ui.deviceStatusLabel) {
    ui.deviceStatusLabel.textContent = label;
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

function setDeviceConnectionState(state) {
  routineState.deviceConnectionState = state;
  if (!ui.startShowButton) {
    return;
  }

  if (state === "connecting") {
    ui.startShowButton.disabled = true;
    ui.startShowButton.textContent = "Conectando MrCamerDev1.0...";
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

window.registrarBookTestImposibleV2 = registrarBookTestImposibleV2;
window.resetBookTestImposibleV2 = resetRoutineState;
window.setBookTestImposibleV2DeviceState = setBookTestImposibleV2DeviceState;

window.bookTestImposibleV2Dev = {
  buildPagePath,
  buildPreviewLines,
  resolveBookByDeviceCode,
  parseSelectionPayload,
  resolveSayWindow,
  buildPageHash,
  buildWindowHash,
  buildLineHash,
  sumMultiAntennaSlots,
  injectMultiAntennaSelectionFromUi,
};