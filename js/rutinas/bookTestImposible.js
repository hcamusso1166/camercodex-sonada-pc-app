const BOOK_DATA = {
  basePath: "../books",
  indexPath: "../books/index.json",
};

const routineState = {
  payload: null,
  resolved: null,
  error: null,
  logs: [],
};

const ui = {
  payloadBookId: null,
  payloadPage: null,
  payloadLine: null,
  applyButton: null,
  clearButton: null,
  payloadStatus: null,
  resolvedBookTitle: null,
  resolvedBookAuthor: null,
  resolvedPage: null,
  resolvedLine: null,
  resolvedLineText: null,
  resolvedContextList: null,
  routineLog: null,
};

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initBookTestImposibleRoutine);
} else {
    initBookTestImposibleRoutine();
}

function initBookTestImposibleRoutine() {
  bindUiElements();
  bindEvents();
  resetRoutineState();
  logInfo("Rutina inicializada en modo simulación manual (sin BLE TP).", "INIT");
}

function bindUiElements() {
  ui.payloadBookId = document.getElementById("payloadBookId");
  ui.payloadPage = document.getElementById("payloadPage");
  ui.payloadLine = document.getElementById("payloadLine");
  ui.applyButton = document.getElementById("applyPayloadButton");
  ui.clearButton = document.getElementById("clearPayloadButton");
  ui.payloadStatus = document.getElementById("payloadStatus");

  ui.resolvedBookTitle = document.getElementById("resolvedBookTitle");
  ui.resolvedBookAuthor = document.getElementById("resolvedBookAuthor");
  ui.resolvedPage = document.getElementById("resolvedPage");
  ui.resolvedLine = document.getElementById("resolvedLine");
  ui.resolvedLineText = document.getElementById("resolvedLineText");
  ui.resolvedContextList = document.getElementById("resolvedContextList");

  ui.routineLog = document.getElementById("routineLog");
}

function bindEvents() {
  if (ui.applyButton) {
    ui.applyButton.addEventListener("click", onApplyPayloadClick);
  }

  if (ui.clearButton) {
    ui.clearButton.addEventListener("click", () => {
      resetRoutineState();
      logInfo("Estado limpiado manualmente.", "UI");
    });
  }
}
  
function readPayloadFromInputs() {
  const payload = {
    bookId: (ui.payloadBookId?.value || "").trim(),
    page: Number.parseInt(ui.payloadPage?.value, 10),
    line: Number.parseInt(ui.payloadLine?.value, 10),
  };

  if (!payload.bookId) {
    throw new Error("bookId es obligatorio.");
  }

    if (!Number.isInteger(payload.page) || payload.page <= 0) {
    throw new Error("page debe ser un entero mayor que 0.");
  }

    if (!Number.isInteger(payload.line) || payload.line <= 0) {
    throw new Error("line debe ser un entero mayor que 0.");
  }

    return payload;
}

async function onApplyPayloadClick() {
  try {
    const payload = readPayloadFromInputs();
    routineState.payload = payload;
    routineState.error = null;
    updatePayloadStatus(`Aplicando payload: ${JSON.stringify(payload)}`, false);
    logInfo(`Payload aplicado: ${JSON.stringify(payload)}`, "EVENT");

    const resolved = await resolvePayload(payload);
    routineState.resolved = resolved;
    routineState.error = null;

    renderResolvedData();
    updatePayloadStatus("Payload resuelto correctamente.", false);
    logInfo(
      `Línea resuelta con éxito (${resolved.book.title} | pág ${resolved.pageNumber} | línea ${resolved.lineNumber}).`,
      "DATA"
    );
  } catch (error) {
    routineState.resolved = null;
    routineState.error = error;

    renderResolvedData();
    updatePayloadStatus(error.message, true);
    logError(error.message);
  }
}

async function resolvePayload(payload) {
  const booksIndex = await loadJson(BOOK_DATA.indexPath, "No se pudo cargar books/index.json");
  const books = normalizeBooksIndex(booksIndex);

    const book = books.find(item => getBookId(item) === payload.bookId);
  if (!book) {
    throw new Error(`No se encontró bookId '${payload.bookId}' en books/index.json.`);
  }

  const normalizedBook = normalizeBookMetadata(book);
  logInfo(`Libro encontrado: ${normalizedBook.title} (${normalizedBook.author}).`, "DATA");

  const bookInfoPath = buildBookInfoPath(normalizedBook);
  try {
    await loadJson(bookInfoPath, "No se pudo cargar el book.json del libro");
  } catch (error) {
    logInfo(`book.json no disponible o inválido en ${bookInfoPath}. Se continúa con index.json.`, "WARN");
  }

  const pagePath = buildPagePath(normalizedBook, payload.page);
  logInfo(`Resolviendo página desde: ${pagePath}`, "DATA");

  const pageData = await loadJson(pagePath, `No se pudo cargar la página ${payload.page}.`);
  const lines = extractLines(pageData);

  if (!lines.length) {
    throw new Error(`La página ${payload.page} no contiene líneas utilizables.`);
  }

  const lineIndex = payload.line - 1;
  if (lineIndex < 0 || lineIndex >= lines.length) {
    throw new Error(
      `Línea fuera de rango. Página ${payload.page} tiene ${lines.length} líneas y se pidió línea ${payload.line}.`
    );
  }

  const selectedLine = lines[lineIndex];
  const context = buildContextLines(lines, lineIndex);

  return {
    payload,
    book: normalizedBook,
    pageNumber: payload.page,
    lineNumber: payload.line,
    selectedLine,
    context,
  };
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

function buildBookInfoPath(book) {
  return `${normalizeRootPath(book.root)}/book.json`;
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

function buildContextLines(lines, selectedIndex) {
  const start = Math.max(0, selectedIndex - 1);
  const end = Math.min(lines.length - 1, selectedIndex + 1);
  const context = [];

  for (let i = start; i <= end; i += 1) {
    context.push({
      lineNumber: i + 1,
      text: lines[i],
      isSelected: i === selectedIndex,
    });
  }

    return context;
}

function resetRoutineState() {
  routineState.payload = null;
  routineState.resolved = null;
  routineState.error = null;
  routineState.logs = [];

  updatePayloadStatus("Esperando payload...", false);
  clearResolvedData();
  renderLog();
}

function clearResolvedData() {
  if (ui.resolvedBookTitle) ui.resolvedBookTitle.textContent = "—";
  if (ui.resolvedBookAuthor) ui.resolvedBookAuthor.textContent = "—";
  if (ui.resolvedPage) ui.resolvedPage.textContent = "—";
  if (ui.resolvedLine) ui.resolvedLine.textContent = "—";
  if (ui.resolvedLineText) ui.resolvedLineText.textContent = "—";

  if (ui.resolvedContextList) {
    ui.resolvedContextList.innerHTML = "<li>—</li>";
  }
}

function renderResolvedData() {
  if (!routineState.resolved) {
    clearResolvedData();
    return;
  }

  const { book, pageNumber, lineNumber, selectedLine, context } = routineState.resolved;

  if (ui.resolvedBookTitle) ui.resolvedBookTitle.textContent = book.title;
  if (ui.resolvedBookAuthor) ui.resolvedBookAuthor.textContent = book.author;
  if (ui.resolvedPage) ui.resolvedPage.textContent = String(pageNumber);
  if (ui.resolvedLine) ui.resolvedLine.textContent = String(lineNumber);
  if (ui.resolvedLineText) ui.resolvedLineText.textContent = selectedLine;

  if (ui.resolvedContextList) {
    ui.resolvedContextList.innerHTML = "";
    context.forEach(item => {
      const li = document.createElement("li");
      li.textContent = `${item.lineNumber}. ${item.text}`;
      if (item.isSelected) {
        li.style.fontWeight = "700";
      }
      ui.resolvedContextList.appendChild(li);
    });
  }
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
  })

    routineState.logs.push(`[${timestamp}] [${level}] [${source}] ${message}`);
  renderLog();
}

function renderLog() {
  if (!ui.routineLog) {
    return;
  }
  window.bookTestImposibleDev = {
  resolvePayload,
  buildPagePath,
  }};
