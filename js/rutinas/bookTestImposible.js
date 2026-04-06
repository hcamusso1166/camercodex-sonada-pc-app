(function () {
  const INITIAL_STATE = {
    tpConnectionState: "TP no conectado",
    bookId: null,
    bookTitle: "Sin libro",
    page: "-",
    line: "-",
    logs: [],
  };

    const MOCK_PAYLOAD = {
    bookId: "narnia-el-sobrino-del-mago",
    bookTitle: "El sobrino del mago",
    page: 25,
    line: 7,
  };

 const state = { ...INITIAL_STATE };

 const ui = {
    tpConnectionState: null,
    bookTitle: null,
    bookPage: null,
    bookLine: null,
    log: null,
    simulateButton: null,
    clearButton: null,
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initBookTestImposible);
  } else {
    initBookTestImposible();
  }

function initBookTestImposible() {
    ui.tpConnectionState = document.getElementById("tpConnectionState");
    ui.bookTitle = document.getElementById("bookTitle");
    ui.bookPage = document.getElementById("bookPage");
    ui.bookLine = document.getElementById("bookLine");
    ui.log = document.getElementById("bookTestLog");
    ui.simulateButton = document.getElementById("simulatePayloadButton");
    ui.clearButton = document.getElementById("clearStateButton");

    renderState();
    bindEvents();
    addLog("Rutina inicializada en modo autónomo (sin BLE estándar).");
    connectToTeleprompterBle();
  }

  function bindEvents() {
    if (ui.simulateButton) {
      ui.simulateButton.addEventListener("click", simulatePayload);
    }

    if (ui.clearButton) {
      ui.clearButton.addEventListener("click", clearState);
    }
  }

  function renderState() {
    if (ui.tpConnectionState) ui.tpConnectionState.textContent = state.tpConnectionState;
    if (ui.bookTitle) ui.bookTitle.textContent = state.bookTitle;
    if (ui.bookPage) ui.bookPage.textContent = String(state.page);
    if (ui.bookLine) ui.bookLine.textContent = String(state.line);
    renderLog();
  }

  function applyPayload(payload) {
    if (!payload || typeof payload !== "object") {
      addLog("Payload inválido: no se aplicaron cambios.");
      return;
    }

    state.bookId = payload.bookId || null;
    state.bookTitle = payload.bookTitle || "Sin libro";
    state.page = Number.isFinite(payload.page) ? payload.page : "-";
    state.line = Number.isFinite(payload.line) ? payload.line : "-";

    renderState();
    addLog(`Payload aplicado: ${JSON.stringify(payload)}`);
  }

  function simulatePayload() {
    applyPayload(MOCK_PAYLOAD);
  }

  function clearState() {
    state.bookId = null;
    state.bookTitle = "Sin libro";
    state.page = "-";
    state.line = "-";

    renderState();
    addLog("Estado limpiado manualmente.");
  }

  function addLog(message) {
    const timestamp = new Date().toLocaleTimeString("es-AR", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });

    state.logs.unshift(`[${timestamp}] ${message}`);
    state.logs = state.logs.slice(0, 30);
    renderLog();
  }

  function renderLog() {
    if (!ui.log) return;

    if (!state.logs.length) {
      ui.log.innerHTML = '<p class="booktest-log-empty">Sin eventos todavía.</p>';
      return;
    }

    ui.log.innerHTML = state.logs
      .map((entry) => `<p>${escapeHtml(entry)}</p>`)
      .join("");
  }

  function escapeHtml(text) {
    return String(text)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#39;");
  }

  function connectToTeleprompterBle() {
    addLog("Stub TP BLE listo: pendiente implementación futura.");
    return Promise.resolve(null);
  }

  window.bookTestImposible = {
    applyPayload,
    clearState,
    simulatePayload,
    connectToTeleprompterBle,
  };
})();