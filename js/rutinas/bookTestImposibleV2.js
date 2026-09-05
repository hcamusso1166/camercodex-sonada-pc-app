const BOOK_DATA = {
  basePath: "../books",
  indexPath: "../books/index.json",
};

const MAX_LINE_NUMBER = 20;
const MAX_LINE_CARD_SUM = 20;
const DEV_MULTIANTENNA_SIM_ENABLED = true;
const DEV_MULTIANTENNA_DEFAULT_SLOTS = [20, 20, 4, 1, 5];
const BTI_V2_BOOK_DEVICE_NAME = "MrCamerDev1.0";
const BTI_V2_Q5_DEVICE_NAME = "MrCamerDev_Q5";
const BTI_V2_ANTENNA8_DEBOUNCE_MS = 1200;
const BTI_V2_Q5_ANTENNA_IDS = Object.freeze([2, 3, 4, 5, 6]);
const BTI_V2_DETECTOR_COMMANDS = Object.freeze({
  PAUSE: Object.freeze([0x43, 0x41, 0x01, 0x00]),
  RESUME: Object.freeze([0x43, 0x41, 0x01, 0x01]),
});
const BTI_V2_PHASES = Object.freeze({
  DETECCION: "DETECCION",
  RESOLUCION: "RESOLUCION",
  WAITING_GATE_FOR_READING_TARGET_1: "WAITING_GATE_FOR_READING_TARGET_1",
  PLAYING_READING_TARGET_1: "PLAYING_READING_TARGET_1",
  WAITING_GATE_FOR_READING_TARGET_2: "WAITING_GATE_FOR_READING_TARGET_2",
  PLAYING_READING_TARGET_2: "PLAYING_READING_TARGET_2",
  WAITING_IMAGE_ENCORE_TRIGGER: "WAITING_IMAGE_ENCORE_TRIGGER",
  IMAGE_ENCORE_RESOLVING: "IMAGE_ENCORE_RESOLVING",
  IMAGE_ENCORE_PLAYING: "IMAGE_ENCORE_PLAYING",
  ROUTINE_FINISHED: "ROUTINE_FINISHED",
  WAITING_GATE_FOR_ENCORE_FINAL: "WAITING_GATE_FOR_ENCORE_FINAL",
  ENCORE_FINAL: "ENCORE_FINAL",
  WAIT_BOOK_DEVICE: "WAIT_BOOK_DEVICE",
  WAIT_Q5_DEVICE: "WAIT_Q5_DEVICE",
  LISTENING: "LISTENING",
  LOCKED: "LOCKED",
  PLAYING: "PLAYING",
  COMPLETE: "COMPLETE",
  ERROR: "ERROR",
});

const routineState = {
  books: [],
  currentBook: null,
  currentSelection: null,
  phase: BTI_V2_PHASES.WAIT_BOOK_DEVICE,
  bookDeviceState: { connected: false, connecting: false, deviceName: BTI_V2_BOOK_DEVICE_NAME },
  q5DeviceState: { connected: false, connecting: false, deviceName: BTI_V2_Q5_DEVICE_NAME },
  q5Slots: { 2: null, 3: null, 4: null, 5: null, 6: null },
  selectionLocked: false,
  lockedSelection: null,
  currentGateStep: 0,
  readingProgress: [false, false],
  imageEncore: null,
  preparedImageEncore: null,
  preparedImageAudioPath: null,
  imageEncoreTriggerConsumed: false,
  lastAntenna8GateAt: 0,
  ignoredLockedPacketLogged: false,
  lastDeviceSeq: -1,
  logs: [],
  deviceConnected: false,
  deviceConnectionState: "disconnected",
  startShowButtonDefaultLabel: "",
};

const ui = {
  startShowButton: null,
  connectQ5Button: null,
  replayAudioButton: null,
  stopAudioButton: null,
  deviceStatusLabel: null,
  bookDeviceStatusLabel: null,
  q5DeviceStatusLabel: null,
  audioStatusLabel: null,
  phaseStatusLabel: null,
  payloadStatus: null,
  resolvedBookTitle: null,
  resolvedBookAuthor: null,
  resolvedBookCode: null,
  resolvedPage: null,
  resolvedLine: null,
  resolvedContextList: null,
  routineLog: null,
  multiAntennaSimCard: null,
  multiAntennaSlotInputs: [],
  multiAntennaInjectButton: null,
  simulateAntenna8GateButton: null,
  devResetFlowButton: null,
  newDetectionButton: null,
};

let showAudio;
let detectionAudioState = createDetectionAudioState();
let showSketchSequence = 0;

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
  ui.connectQ5Button = document.getElementById("connectQ5BleButton");
  ui.replayAudioButton = document.getElementById("replayAudioButton");
  ui.stopAudioButton = document.getElementById("stopAudioButton");
  ui.deviceStatusLabel = document.getElementById("deviceStatusLabel") || document.getElementById("tpStatusLabel");
  ui.bookDeviceStatusLabel = document.getElementById("bookDeviceStatusLabel") || ui.deviceStatusLabel;
  ui.q5DeviceStatusLabel = document.getElementById("q5DeviceStatusLabel");
  ui.audioStatusLabel = document.getElementById("audioStatusLabel");
  ui.phaseStatusLabel = document.getElementById("phaseStatusLabel");
  ui.payloadStatus = document.getElementById("payloadStatus");

  ui.resolvedBookTitle = document.getElementById("resolvedBookTitle");
  ui.resolvedBookAuthor = document.getElementById("resolvedBookAuthor");
  ui.resolvedBookCode = document.getElementById("resolvedBookCode");
  ui.resolvedPage = document.getElementById("resolvedPage");
  ui.resolvedLine = document.getElementById("resolvedLine");
  ui.resolvedContextList = document.getElementById("resolvedContextList");

  ui.routineLog = document.getElementById("routineLog");
  
  ui.multiAntennaSimCard = document.getElementById("multiAntennaSimCard");
  ui.multiAntennaSlotInputs = [1, 2, 3, 4, 5]
    .map(slotNumber => document.getElementById(`multiAntennaSlot${slotNumber}`))
    .filter(Boolean);
  ui.multiAntennaInjectButton = document.getElementById("injectMultiAntennaSelectionButton");
  ui.simulateAntenna8GateButton = document.getElementById("simulateAntenna8GateButton");
  ui.devResetFlowButton = document.getElementById("devResetFlowButton");
  ui.newDetectionButton = document.getElementById("newDetectionButton");
}

function bindEvents() {
  ui.startShowButton?.addEventListener("click", () => showAudio?.enableFromUserGesture());
  ui.connectQ5Button?.addEventListener("click", () => showAudio?.enableFromUserGesture());
  ui.replayAudioButton?.addEventListener("click", replayLockedSelection);
  ui.stopAudioButton?.addEventListener("click", stopBtiV2AudioIfPlaying);
  ui.newDetectionButton?.addEventListener("click", resetBtiV2FlowForNewDetection);
  bindMultiAntennaSimulatorEvents();
}

function bindMultiAntennaSimulatorEvents() {
  if (!DEV_MULTIANTENNA_SIM_ENABLED) {
    ui.multiAntennaSimCard?.setAttribute("hidden", "hidden");
    return;
  }

  if (!ui.multiAntennaSimCard || !ui.multiAntennaInjectButton || ui.multiAntennaSlotInputs.length !== DEV_MULTIANTENNA_DEFAULT_SLOTS.length) {
    logError("[MANUAL][ERROR] Elección manual multiantena incompleta en HTML.", "MANUAL");
    return;
  }

  ui.multiAntennaSimCard.removeAttribute("hidden");
  ui.multiAntennaSlotInputs.forEach((input, index) => {
    if (input.value === "") {
      input.value = String(DEV_MULTIANTENNA_DEFAULT_SLOTS[index]);
    }
  });
  ui.multiAntennaInjectButton.addEventListener("click", injectMultiAntennaSelectionFromUi);
  ui.simulateAntenna8GateButton?.addEventListener("click", () => simulateAntenna8GateFromDev());
  ui.devResetFlowButton?.addEventListener("click", resetBtiV2FlowForNewDetection);
  updateMultiAntennaSimulatorVisibility();
  logInfo("[MANUAL] Elección manual multiantena habilitada", "MANUAL");
}

function updateMultiAntennaSimulatorVisibility() {
  if (!ui.multiAntennaSimCard) return;

  const shouldShowSimulator = DEV_MULTIANTENNA_SIM_ENABLED;
  ui.multiAntennaSimCard.toggleAttribute("hidden", !shouldShowSimulator);
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
  const slots = readMultiAntennaSlotsFromUi();
  const slotsLabel = slots.map(slot => (slot == null ? "null" : String(slot))).join(",");
  logInfo(`[MANUAL] Slots recibidos: [${slotsLabel}]`, "MANUAL");

  const validationError = validateMultiAntennaSlots(slots);
  if (validationError) {
    const isInvalidSlots = validationError === "Slots inválidos";
    updatePayloadStatus(validationError, true);
    logError(`[MANUAL][ERROR] ${validationError}`, "MANUAL");
    if (!isInvalidSlots) {
      logError(`[MANUAL][ERROR] Rango permitido: page > 0, line 1..${MAX_LINE_NUMBER}. Suma de cartas clásica hasta ${MAX_LINE_CARD_SUM}.`, "MANUAL");
    }
    return;
  }

  const { page, line } = sumMultiAntennaSlots(slots);
  logInfo(`[MANUAL] Selección calculada -> page=${page} line=${line}`, "MANUAL");
  if (line > MAX_LINE_CARD_SUM) {
    logInfo(`[MANUAL] Renglón ${line} supera suma clásica ${MAX_LINE_CARD_SUM}, permitido por máximo extendido ${MAX_LINE_NUMBER}.`, "MANUAL");
  }
  logInfo("[MANUAL] Inyectando selección multiantena en flujo V2", "MANUAL");

  updateQ5SlotsFromValues(slots, "UX_MANUAL_ESCAPE");
    updatePayloadStatus(routineState.currentBook
    ? "Selección manual cargada. Usá Siguiente Audio ▶ para bloquear."
    : "Selección manual cargada. Esperando libro y Siguiente Audio ▶.",
    false);
}

function simulateAntenna8GateFromDev() {
  registrarBookTestImposibleV2({
    sourceRole: "q5Device",
    deviceName: BTI_V2_Q5_DEVICE_NAME,
    antennaId: 8,
    valor: "0002",
    mvalor: "02",
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
  const sourceRole = payload.sourceRole || inferSourceRole(payload, normalizedPayload);
  handleBtiV2Packet(normalizedPayload, sourceRole);
}

function inferSourceRole(payload, normalizedPayload) {
  if (payload.deviceName === BTI_V2_Q5_DEVICE_NAME) return "q5Device";
  if (payload.deviceName === BTI_V2_BOOK_DEVICE_NAME) return "bookDevice";
  if (BTI_V2_Q5_ANTENNA_IDS.includes(normalizedPayload.antennaId)) return "q5Device";
  return "bookDevice";
}

async function handleBtiV2Packet(normalizedPayload, sourceRole) {
  const antennaId = normalizedPayload.antennaId;
  const payloadValue = normalizePayloadValue(normalizedPayload);

  if (sourceRole === "q5Device" && antennaId === 8) {
    if (payloadValue !== 2) {
      logInfo("[BTI_V2] Ignoring antenna 8 gate with non-02 payload", "BLE");
      return;
    }
    if (!shouldAcceptAntenna8Gate()) return;
    logInfo("[BTI_V2] Antenna 8 gate received", "BLE");
    logInfo("[BTI_V2] Antenna 8 gate accepted", "BLE");
    if (!routineState.selectionLocked) {
      await handleDetectionFinishGate();
      return;
    }
        await handleAntenna8Gate();
    return;
  }

  if (routineState.selectionLocked && antennaId >= 1 && antennaId <= 6) {
    logInfo(`[BTI_V2] Ignoring detection antenna because selection is locked ${JSON.stringify({ antennaId })}`, "BLE");
    return;
  }

  if (sourceRole === "q5Device") {
    handleQ5DevicePacket(normalizedPayload);
    return;
  }

  handleBookDevicePacket(normalizedPayload);
}

function normalizePayloadValue(payload) {
  const candidates = [payload.controlValue, payload.payloadValue, payload.value, payload.rawValue, payload.valor, payload.mvalor];
  for (const candidate of candidates) {
    if (candidate == null || candidate === "") continue;
    if (typeof candidate === "number" && Number.isFinite(candidate)) return Number(candidate);
    const digits = String(candidate).trim().replace(/[^0-9]/g, "");
    if (!digits) continue;
    const value = Number.parseInt(digits, 10);
    if (Number.isInteger(value)) return value;
  }
  return null;
}

function shouldAcceptAntenna8Gate() {
  const now = Date.now();
  if (now - routineState.lastAntenna8GateAt < BTI_V2_ANTENNA8_DEBOUNCE_MS) {
    logInfo("[BTI_V2] Ignoring antenna 8 gate because of debounce", "BLE");
    return false;
  }
  routineState.lastAntenna8GateAt = now;
  return true;
}

function handleBookDevicePacket(normalizedPayload) {
  if (normalizedPayload.antennaId !== 1) {
    return;
  }
logInfo("[BTI_V2] Book packet received", "BLE");

const payloadLabel = normalizedPayload.rawValue || normalizedPayload.bookCode || "—";
  const bookCode = normalizedPayload.bookCode || inferBookCodeFromPayload(normalizedPayload);
  if (!bookCode) {
    updatePayloadStatus(`Payload de libro no reconocido: '${payloadLabel}'.`, true);
    return;
  }
  handleBookPayload(bookCode);
}

function handleQ5DevicePacket(normalizedPayload) {
  const antennaId = normalizedPayload.antennaId;
  if (!BTI_V2_Q5_ANTENNA_IDS.includes(antennaId)) {
    return;
  }

  const value = normalizeQ5Value(normalizedPayload);
  if (value == null) {
    updatePayloadStatus(`Lectura Q5 inválida para antena ${antennaId}.`, true);
    return;
  }

  const previousValue = routineState.q5Slots[antennaId];
  routineState.q5Slots[antennaId] = value;
  const slotNumber = getQ5SlotNumberFromAntennaId(antennaId);
  logInfo(`[BTI_V2] Q5 slot updated ${JSON.stringify({ antennaId, slotNumber, previousValue, value })}`, "BLE");
  maybeAnnounceQ5SlotDetected(antennaId, value);
  renderQ5Progress();
  maybeAnnounceQ5Complete();
}

function normalizeQ5Value(payload) {
  const candidates = [payload.card, payload.cardValue, payload.value, payload.rawValue, payload.valor, payload.mvalor];
  for (const candidate of candidates) {
    const digits = String(candidate ?? "").trim().replace(/[^0-9]/g, "");
    if (!digits) continue;
    const value = Number.parseInt(digits, 10);
    if (Number.isInteger(value) && value > 0) return value;
  }
  return null;
}

function updateQ5SlotsFromValues(slots, source = "DEV") {
  BTI_V2_Q5_ANTENNA_IDS.forEach((antennaId, index) => {
    const value = slots[index];
    if (Number.isInteger(value) && value >= 0) {
      const previousValue = routineState.q5Slots[antennaId];
      routineState.q5Slots[antennaId] = value;
      const slotNumber = getQ5SlotNumberFromAntennaId(antennaId);
      logInfo(`[BTI_V2] Q5 slot updated ${JSON.stringify({ antennaId, slotNumber, previousValue, value, source })}`, "BLE");
      maybeAnnounceQ5SlotDetected(antennaId, value);
    }
  });
  renderQ5Progress();
  maybeAnnounceQ5Complete();
}

function isQ5Complete(slots) {
  return BTI_V2_Q5_ANTENNA_IDS.every(antennaId => slots[antennaId] != null);
}

function getQ5SlotNumberFromAntennaId(antennaId) {
  if (!BTI_V2_Q5_ANTENNA_IDS.includes(antennaId)) return null;
  return antennaId - 1;
}

function createDetectionAudioState() {
  return {
    lastAnnouncedBookId: null,
    announcedSlotValues: new Map(),
    lastAnnouncedPageLineKey: null,
  };
}

function resetDetectionAudioState() {
  detectionAudioState = createDetectionAudioState();
}

function maybeAnnounceDetectionBookTitle(resolvedBook) {
  if (routineState.selectionLocked) return;
  const bookId = resolvedBook?.bookId || resolvedBook?.id;
  if (!bookId) return;
  if (detectionAudioState.lastAnnouncedBookId === bookId) {
    logInfo("[BTI_V2] Skipping detection book audio because it was already announced", "AUDIO");
    return;
  }

  detectionAudioState.lastAnnouncedBookId = bookId;
  logInfo("[BTI_V2] Detection audio: book title", "AUDIO");
  playBtiV2DetectionBookTitleAudio(resolvedBook);
}

function maybeAnnounceQ5SlotDetected(antennaId, value) {
  if (routineState.selectionLocked) return;
  if (!BTI_V2_Q5_ANTENNA_IDS.includes(antennaId)) return;
  const slotNumber = getQ5SlotNumberFromAntennaId(antennaId);
  if (detectionAudioState.announcedSlotValues.get(slotNumber) === value) {
    logInfo(`[BTI_V2] Skipping detection slot audio because slot value was already announced ${JSON.stringify({ antennaId, slotNumber, value })}`, "AUDIO");
    return;
  }

  detectionAudioState.announcedSlotValues.set(slotNumber, value);
  logInfo(`[BTI_V2] Detection audio: slot detected ${JSON.stringify({ antennaId, slotNumber, value })}`, "AUDIO");
  playBtiV2DetectionSlotAudio(slotNumber);
}

function maybeAnnounceQ5Complete() {
  if (routineState.selectionLocked) return;
  if (!isQ5Complete(routineState.q5Slots)) return;

  const { page, line } = getQ5PageLine(routineState.q5Slots);
  const pageLineKey = `${page}:${line}`;
  if (detectionAudioState.lastAnnouncedPageLineKey === pageLineKey) {
    logInfo(`[BTI_V2] Skipping detection page/line audio because values were already announced ${JSON.stringify({ page, line })}`, "AUDIO");
    return;
  }
  detectionAudioState.lastAnnouncedPageLineKey = pageLineKey;
  logInfo(`[BTI_V2] Q5 complete ${JSON.stringify({ page, line })}`, "BLE");
  logInfo(`[BTI_V2] Detection audio: page and line ${JSON.stringify({ page, line })}`, "AUDIO");
  playBtiV2DetectionPageLineAudio({ page, line });
}

function enqueueBtiV2DetectionAudio(queue, context = {}) {
  showAudio?.enqueueAuxiliaryQueue?.(queue, context);
}

function playBtiV2DetectionBookTitleAudio(book) {
  enqueueBtiV2DetectionAudio(showAudio?.buildDetectionBookTitleQueue?.(book) || [], {
    errorPrefix: "[BTI_V2] Detection book title audio missing",
    emptyMessage: "[BTI_V2] Detection book title audio missing",
  });
}

function playBtiV2DetectionSlotAudio(slotNumber) {
  enqueueBtiV2DetectionAudio(showAudio?.buildDetectionSlotQueue?.(slotNumber) || [], {
    errorPrefix: `[BTI_V2] Detection slot audio missing for slot ${slotNumber}`,
    emptyMessage: `[BTI_V2] Detection slot audio missing for slot ${slotNumber}`,
  });
}

function playBtiV2DetectionPageLineAudio({ page, line }) {
  enqueueBtiV2DetectionAudio(showAudio?.buildDetectionPageLineQueue?.({ page, line }) || [], {
    errorPrefix: "[BTI_V2] Detection page and line audio missing",
    emptyMessage: "[BTI_V2] Detection page and line audio missing",
  });
}

function getQ5PageLine(slots) {
  return {
    page: Number(slots[2]) + Number(slots[3]) + Number(slots[4]),
    line: Number(slots[5]) + Number(slots[6]),
  };
}

function sendBtiV2DetectorCommand(commandName) {
  const command = BTI_V2_DETECTOR_COMMANDS[commandName];
  if (!command) return;

  ["bookDevice", "q5Device"].forEach(sourceRole => {
    const payload = Uint8Array.from(command);
    let writeResult;
    try {
      writeResult = window.writeBtiV2DetectorControl(sourceRole, payload);
    } catch (error) {
      logError(`[BTI_V2] ${commandName} failed for ${sourceRole}: ${error.message || error}`, "BLE");
      return;
    }
    Promise.resolve(writeResult)
      .then(() => logInfo(`[BTI_V2] ${commandName} sent to ${sourceRole}`, "BLE"))
      .catch(error => logError(`[BTI_V2] ${commandName} failed for ${sourceRole}: ${error.message || error}`, "BLE"));
  });
}

async function tryLockAndStartShow() {
  return handleDetectionFinishGate();
}

async function handleDetectionFinishGate() {
  if (routineState.selectionLocked) return;
  if (routineState.phase !== BTI_V2_PHASES.DETECCION && routineState.phase !== BTI_V2_PHASES.LISTENING) {
    updatePayloadStatus("La detección no está lista para bloquear en esta etapa.", true);
    return;
  }
  if (!routineState.currentBook || !isQ5Complete(routineState.q5Slots)) {
    updatePayloadStatus("Falta detectar libro o completar las 5 antenas del Q5.", true);
    return;
  }

  const { page, line } = getQ5PageLine(routineState.q5Slots);
  try {
    const selection = await resolveSelection(routineState.currentBook, page, line);
    routineState.currentSelection = selection;
    routineState.selectionLocked = true;
    routineState.phase = BTI_V2_PHASES.RESOLUCION;
    routineState.currentGateStep = 0;
    routineState.readingProgress = [false, false];
    routineState.lockedSelection = {
      book: routineState.currentBook,
      page,
      line,
      q5Slots: { ...routineState.q5Slots },
      resolved: selection,
      lockedAt: Date.now(),
    };
    prepareImageEncore(selection);
    logInfo("[BTI_V2] Detection completed by antenna 8", "BLE");
    logInfo("[BTI_V2] Selection locked", "BLE");
    sendBtiV2DetectorCommand("PAUSE");
    updateMultiAntennaSimulatorVisibility();
    renderSelection(selection);
    updatePayloadStatus("Selección fijada. Reproduciendo libro, página y renglón.", false);
    renderDeviceStatuses();
    logInfo("[BTI_V2] Playing resolution audio: book/page/line once", "AUDIO");
    await playResolutionAudio(selection);
    routineState.phase = BTI_V2_PHASES.WAITING_GATE_FOR_READING_TARGET_1;
    logInfo("[BTI_V2] Waiting antenna 8 for reading target 1", "BLE");
    updatePayloadStatus("Selección fijada. Esperando Antena 8 para reproducir el renglón elegido.", false);
    renderDeviceStatuses();
  } catch (error) {
    routineState.phase = BTI_V2_PHASES.ERROR;
    updatePayloadStatus(error.message, true);
    logError(error.message, "DATA");
  }
}

async function handleAntenna8Gate() {
if (routineState.phase === BTI_V2_PHASES.COMPLETE || routineState.phase === BTI_V2_PHASES.ROUTINE_FINISHED) {
    logInfo("[BTI_V2] Ignoring antenna 8 gate because sequence is complete. Use Nueva detección to restart.", "BLE");
    return;
  }
  const selection = routineState.lockedSelection?.resolved;
  if (!selection) {
    updatePayloadStatus("No hay selección fijada para avanzar.", true);
    return;
  }
  if (routineState.phase === BTI_V2_PHASES.WAITING_GATE_FOR_READING_TARGET_1) {
    routineState.phase = BTI_V2_PHASES.PLAYING_READING_TARGET_1;
    logInfo("[BTI_V2] Playing reading target 1 twice", "AUDIO");
    renderDeviceStatuses();
    if (await playReadingTarget(selection, 0)) {
      routineState.readingProgress[0] = true;
      renderSelection(selection);
    }
    routineState.phase = BTI_V2_PHASES.WAITING_GATE_FOR_READING_TARGET_2;
    logInfo("[BTI_V2] Waiting antenna 8 for reading target 2", "BLE");
    updatePayloadStatus("Esperando Antena 8 para reproducir el segundo renglón.", false);
    renderDeviceStatuses();
    return;
  }
  if (routineState.phase === BTI_V2_PHASES.WAITING_GATE_FOR_READING_TARGET_2) {
    routineState.phase = BTI_V2_PHASES.PLAYING_READING_TARGET_2;
    logInfo("[BTI_V2] Playing reading target 2 twice", "AUDIO");
    renderDeviceStatuses();
    if (await playReadingTarget(selection, 1)) {
      routineState.readingProgress[1] = true;
      renderSelection(selection);
    }
    routineState.phase = BTI_V2_PHASES.WAITING_IMAGE_ENCORE_TRIGGER;
    routineState.imageEncoreTriggerConsumed = false;
    logInfo("[IMAGE-ENCORE] Waiting antenna 8 for image encore", "BLE");
    updatePayloadStatus("Revelación completada. Esperando Antena 8 para ENCORE DE IMAGEN.", false);
    renderDeviceStatuses();
    return;
  }
  if (routineState.phase === BTI_V2_PHASES.WAITING_IMAGE_ENCORE_TRIGGER) {
    await startImageEncore(selection);
    return;
  }
  if ([BTI_V2_PHASES.IMAGE_ENCORE_RESOLVING, BTI_V2_PHASES.IMAGE_ENCORE_PLAYING].includes(routineState.phase)) {
    logInfo("[IMAGE-ENCORE] duplicate antenna 8 ignored", "BLE");
    return;
  }
  logInfo(`[BTI_V2] Ignoring antenna 8 gate in phase ${routineState.phase}`, "BLE");
}

async function startImageEncore(selection) {
  if (routineState.imageEncoreTriggerConsumed) {
    logInfo("[IMAGE-ENCORE] duplicate trigger ignored", "BLE");
    return;
  }
  routineState.imageEncoreTriggerConsumed = true;
  routineState.phase = BTI_V2_PHASES.IMAGE_ENCORE_RESOLVING;
  renderDeviceStatuses();

  const bookId = selection.book.bookId || selection.book.id;
  const sourcePage = selection.pageNumber;
  logInfo("[IMAGE-ENCORE] trigger accepted antenna=8", "BLE");
  logInfo(`[IMAGE-ENCORE] book=${bookId} sourcePage=${sourcePage}`, "BTI_V2");

  try {
    const triggerStartedAt = performance.now();
    const prepared = routineState.preparedImageEncore;
    const result = prepared?.bookId === bookId && prepared?.sourcePage === sourcePage
      ? prepared
      : prepareImageEncore(selection);
    routineState.imageEncore = result;
    renderImageEncore(result);

    if (!result.found) {
      logInfo(`[IMAGE-ENCORE] no image found book=${bookId} sourcePage=${sourcePage}`, "BTI_V2");
      routineState.phase = BTI_V2_PHASES.ROUTINE_FINISHED;
      updatePayloadStatus("ENCORE DE IMAGEN finalizado sin imagen posterior.", false);
      renderDeviceStatuses();
      return;
    }

    void sendImageEncoreShowSketch(result);
    logInfo(`[IMAGE-ENCORE] targetPage=${result.targetPage} imageId=${result.imageId}`, "BTI_V2");
    logInfo(`[IMAGE-ENCORE] pageDistance=${result.numberedPageDistance} turnCount=${result.turnCount} navigation=${result.navigationType}`, "BTI_V2");
    routineState.phase = BTI_V2_PHASES.IMAGE_ENCORE_PLAYING;
    renderDeviceStatuses();
    logInfo(`[IMAGE-ENCORE] triggerToPlayMs=${(performance.now() - triggerStartedAt).toFixed(2)}`, "BTI_V2");
    await playImageEncoreAudio(result);
    routineState.phase = BTI_V2_PHASES.ROUTINE_FINISHED;
    logInfo("[IMAGE-ENCORE] complete", "BTI_V2");
    updatePayloadStatus("ENCORE DE IMAGEN finalizado. Podés iniciar una nueva detección.", false);
    renderDeviceStatuses();
  } catch (error) {
    routineState.phase = BTI_V2_PHASES.ERROR;
    updatePayloadStatus(error.message, true);
    logError(error.message, "BTI_V2");
    renderDeviceStatuses();
  }
}

async function sendImageEncoreShowSketch(result) {
  if (!result?.found) return;

  const request = {
    sequence: showSketchSequence,
    book: result.bookId,
    page: result.targetPage,
    image: result.imageId,
  };
  showSketchSequence = (showSketchSequence + 1) >>> 0;

  try {
    await window.sendShowSketchToQ5(request);
    logInfo(`[SHOW_SKETCH] sent sequence=${request.sequence} book=${request.book} page=${request.page} image=${request.image}`, "SHOW_SKETCH");
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    logError(`[SHOW_SKETCH] send failed; Image Encore continues without retry: ${message}`, "SHOW_SKETCH");
  }
}

function clearPreparedImageEncore() {
  if (routineState.preparedImageAudioPath) showAudio?.clearPreloaded(routineState.preparedImageAudioPath);
  routineState.preparedImageEncore = null;
  routineState.preparedImageAudioPath = null;
}

  function prepareImageEncore(selection) {
  clearPreparedImageEncore();
  const bookId = selection?.book?.bookId || selection?.book?.id;
  const sourcePage = Number(selection?.pageNumber);
  const startedAt = performance.now();
  logInfo(`[IMAGE-ENCORE] preparing book=${bookId} sourcePage=${sourcePage}`, "BTI_V2");
  const result = window.BookTestImposibleV2ImageEncore.resolveManifestBookImage({
    bookId,
    sourcePage,
    images: selection.runtimeManifest.images,
  });
  routineState.preparedImageEncore = result;
  if (!result.found) {
    logInfo(`[IMAGE-ENCORE] no image found book=${bookId} sourcePage=${sourcePage}`, "BTI_V2");
    return result;
  }
  const audioPath = `../books/${window.BookTestImposibleV2ImageEncore.buildImageAudioPath({
    bookId,
    page: result.targetPage,
    imageId: result.imageId,
    take: "p1",
  })}`;
  routineState.preparedImageAudioPath = audioPath;
  showAudio?.preload(audioPath);
  logInfo(`[IMAGE-ENCORE] prepared targetPage=${result.targetPage} imageId=${result.imageId} resolveMs=${(performance.now() - startedAt).toFixed(2)}`, "BTI_V2");
  logInfo(`[IMAGE-ENCORE] audio preload requested path=${audioPath}`, "AUDIO");
  return result;
}

async function playImageEncoreAudio(result) {
  const queue = window.BookTestImposibleV2ImageEncore.buildImageAudioQueue({
    bookId: result.bookId,
    page: result.targetPage,
    imageId: result.imageId,
  });
  queue.forEach(item => {
    if (item.type === "audio") {
      logInfo(`[IMAGE-ENCORE] playing ${item.src.replace(/^..\/books\//, "")}`, "AUDIO");
    }
  });
  await playQueueItems(queue, "No hay audios disponibles para la imagen del Encore.");
}

function renderImageEncore(result) {
  if (!ui.resolvedContextList) return;
  const header = document.createElement("li");
  header.textContent = "ENCORE DE IMAGEN";
  header.style.fontWeight = "700";
  ui.resolvedContextList.appendChild(header);

  const lines = result.found
    ? [
      `Página seleccionada: ${result.sourcePage}`,
      `Página de la imagen: ${result.targetPage}`,
      `Instrucción: ${result.navigationText}`,
    ]
    : [
      `Página seleccionada: ${result.sourcePage}`,
      `Instrucción: ${result.navigationText}`,
    ];

  lines.forEach(text => {
    const li = document.createElement("li");
    li.textContent = text;
    ui.resolvedContextList.appendChild(li);
  });
}

function buildReadingTargetQueue(selection, targetIndex) {
  const target = selection.readingPlan.targets[targetIndex];
  const partCount = window.BookTestImposibleV2RuntimeManifest.resolveReadingPartCount(selection.runtimeManifest, target.pageNumber, target.lineNumber);
  const context = showAudio.resolveReadingContext(selection.book.bookId, target.pageNumber, target.lineNumber, partCount);
  const takes = showAudio.getClassicTakeUrls(context);
  return showAudio.playClassicReadingTwoTakes(context, takes);
}

function buildResolutionQueue(selection) {
  const context = showAudio.resolveReadingContext(selection.book.bookId, selection.pageNumber, selection.lineNumber);
  return showAudio.buildResolutionBookPageLineOnceQueue(context);
}

async function playQueueItems(queue, emptyMessage = "No hay audios disponibles para reproducir.") {
  if (!queue.length) {
    updatePayloadStatus(emptyMessage, true);
    return;
  }
  showAudio.setQueue(queue.map(item => ({ ...item })), { label: `bti-v2-phase:${routineState.phase}` });
  await showAudio.playQueue();
}

async function playResolutionAudio(selection) {
  await playQueueItems(buildResolutionQueue(selection), "No hay audios disponibles para el anuncio libro/página/renglón.");
}

async function playReadingTarget(selection, targetIndex) {
  await playQueueItems(buildReadingTargetQueue(selection, targetIndex), `No hay audios disponibles para reading target ${targetIndex + 1}.`);
  return showAudio.status === "completed";
}

async function replayLockedSelection() {
  const selection = routineState.lockedSelection?.resolved;
  if (!selection) {
    await showAudio?.replay();
    return;
  }
  logInfo("[BTI_V2] Replay locked selection requested", "AUDIO");
  const queue = [
    ...buildResolutionQueue(selection),
    ...buildReadingTargetQueue(selection, 0),
    ...buildReadingTargetQueue(selection, 1),
  ];
  await playQueueItems(queue, "No hay cola disponible para Replay.");
    if (showAudio?.status === "completed") {
    logInfo("Encore Final, lectura mental de la imagen visualizada", "BTI_V2");
    logInfo("Sequence complete", "BTI_V2");
  }
}

function stopBtiV2AudioIfPlaying() {
  showAudio?.stop("Reproducción detenida. Selección fijada; esperando siguiente avance por Antena 8 si corresponde.");
  if (routineState.selectionLocked) {
    updatePayloadStatus("Reproducción detenida. Selección fijada. Esperando siguiente avance por Antena 8 si corresponde.", false);
  }
}

function handleBookPayload(bookCode) {
  const resolvedBook = resolveBookByDeviceCode(bookCode);
  if (!resolvedBook) {
    const errorMessage = `No se pudo mapear bookCode '${bookCode}'.`;
    updatePayloadStatus(errorMessage, true);
    renderBookInfo(null, bookCode);
    logError(errorMessage, "MAP");
    return;
  }

    const previousBookId = routineState.currentBook?.bookId || null;
  const isSameBook = previousBookId === resolvedBook.bookId;
  routineState.currentBook = resolvedBook;
  if (!routineState.selectionLocked && !isSameBook) {
    routineState.currentSelection = null;
    clearSelectionView();
    if (previousBookId) {
      logInfo(`[BTI_V2] Book changed during detection ${JSON.stringify({ previousBookId, newBookId: resolvedBook.bookId })}`, "MAP");
    }
  }

  renderBookInfo(resolvedBook, bookCode);
  updatePayloadStatus(isQ5Complete(routineState.q5Slots) ? `Libro resuelto: ${resolvedBook.title}. Q5 completo. Esperando Antena 8 payload 02 para fijar.` : `Libro resuelto desde MrCamerDev1.0: ${resolvedBook.title}. Esperando selección multiantena.`, false);
  logInfo(`Libro resuelto para code '${bookCode}': ${resolvedBook.bookId}.`, "MAP");
  maybeAnnounceDetectionBookTitle(resolvedBook);
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
    routineState.readingProgress = [false, false];
    renderSelection(selection);
    updatePayloadStatus(`Selección resuelta: pág ${selection.pageNumber}, línea ${selection.lineNumber}.`, false);
    logInfo(`Selección resuelta para ${selection.book.bookId}.`, "DATA");

    await playQueueItems([
      ...buildResolutionQueue(selection),
      ...buildReadingTargetQueue(selection, 0),
      ...buildReadingTargetQueue(selection, 1),
    ]);
    if (showAudio.status === "completed") {
      routineState.readingProgress = [true, true];
      renderSelection(selection);
    }
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
  if (line > MAX_LINE_CARD_SUM) {
    logInfo(
      `Renglón ${line} por encima de suma de cartas (${MAX_LINE_CARD_SUM}); se validará contra lineCount.`,
      "DATA"
    );
  }

  const normalizedLine = normalizeShowSelectionLine(page, line);
  const manifest = await window.BookTestImposibleV2RuntimeManifest.loadRuntimeManifest(
    book,
    path => loadJson(path, `No se pudo cargar runtime manifest de ${book.bookId}`)
  );
  return window.BookTestImposibleV2RuntimeManifest.resolveSelection(manifest, book, page, normalizedLine);
}

function normalizeShowSelectionLine(page, line) {
  void page;
  return line;
}

function pad3(value) {
  return String(value).padStart(3, "0");
}

function buildImageTakePath(bookId, page, imageId, part) {
  return `${bookId}/audios/page-${pad3(page)}/images/${imageId}_${part}.mp3`;
}

function buildImageTakeCandidates(bookId, page, imageId, part) {
  return [
    `../books/${buildImageTakePath(bookId, page, imageId, part)}`,
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

async function resolveLocalImageTakes(bookId, page, imageId, assetExistsChecker) {
  const parts = ["p1", "p2", "p3"];
  const resolved = [];

  for (const part of parts) {
    const candidates = buildImageTakeCandidates(bookId, page, imageId, part);
    const found = await resolveFirstExisting(candidates, assetExistsChecker);

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


function resetRoutineState() {
  resetDetectionAudioState();
  routineState.currentBook = null;
  routineState.currentSelection = null;
  routineState.phase = BTI_V2_PHASES.DETECCION;
  routineState.bookDeviceState = { connected: false, connecting: false, deviceName: BTI_V2_BOOK_DEVICE_NAME };
  routineState.q5DeviceState = { connected: false, connecting: false, deviceName: BTI_V2_Q5_DEVICE_NAME };
  routineState.q5Slots = { 2: null, 3: null, 4: null, 5: null, 6: null };
  routineState.selectionLocked = false;
  routineState.lockedSelection = null;
  routineState.currentGateStep = 0;
  routineState.readingProgress = [false, false];
  routineState.imageEncore = null;
  clearPreparedImageEncore();
  routineState.imageEncoreTriggerConsumed = false;
  routineState.lastAntenna8GateAt = 0;
  routineState.ignoredLockedPacketLogged = false;
  routineState.lastDeviceSeq = -1;
  routineState.logs = [];
  routineState.deviceConnected = false;
  setDeviceConnectionState("disconnected");

  updatePayloadStatus("Conectá MrCamerDev1.0 y acercá el payload del libro.", false);
  logInfo("[BTI_V2] Phase DETECCION", "INIT");
  renderDeviceStatuses();
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
  updateMultiAntennaSimulatorVisibility();
}

function resetBtiV2FlowForNewDetection() {
  const wasSelectionLocked = routineState.selectionLocked;
  stopBtiV2AudioIfPlaying();
  resetDetectionAudioState();
  routineState.currentBook = null;
  routineState.currentSelection = null;
  routineState.phase = BTI_V2_PHASES.DETECCION;
  routineState.q5Slots = { 2: null, 3: null, 4: null, 5: null, 6: null };
  routineState.selectionLocked = false;
  routineState.lockedSelection = null;
  routineState.currentGateStep = 0;
  routineState.readingProgress = [false, false];
  routineState.imageEncore = null;
  clearPreparedImageEncore();
  routineState.imageEncoreTriggerConsumed = false;
  routineState.lastAntenna8GateAt = 0;
  routineState.ignoredLockedPacketLogged = false;
  renderBookInfo(null, "—");
  clearSelectionView();
  updateMultiAntennaSimulatorVisibility();
  renderDeviceStatuses();
  if (wasSelectionLocked) {
    sendBtiV2DetectorCommand("RESUME");
  }
  logInfo("[BTI_V2] Flow reset for new detection", "BLE");
  logInfo("[BTI_V2] Devices remain connected after reset", "BLE");
  logInfo("[BTI_V2] Detection antennas re-enabled", "BLE");
}


function setBookTestImposibleV2DeviceState(state, deviceLabel = "", sourceRole = "") {
  const role = sourceRole || (deviceLabel === BTI_V2_Q5_DEVICE_NAME ? "q5Device" : "bookDevice");
  const target = role === "q5Device" ? routineState.q5DeviceState : routineState.bookDeviceState;
  target.connected = state === "connected";
  target.connecting = state === "connecting";

  if (state === "connected") {
logInfo(role === "q5Device" ? "[BTI_V2] Q5 device connected" : "[BTI_V2] Book device connected", "BLE");
  }

  if (!routineState.selectionLocked && ![BTI_V2_PHASES.ERROR].includes(routineState.phase)) {
    routineState.phase = BTI_V2_PHASES.DETECCION;
  }

  renderDeviceStatuses();
}

function renderDeviceStatuses() {
  renderPhaseStatus();
  renderDeviceStatus(formatDeviceState(routineState.bookDeviceState));
  if (ui.q5DeviceStatusLabel) {
    ui.q5DeviceStatusLabel.textContent = formatDeviceState(routineState.q5DeviceState);
  }

  if (ui.connectQ5Button) {
    ui.connectQ5Button.disabled = !routineState.bookDeviceState.connected || routineState.q5DeviceState.connected || routineState.q5DeviceState.connecting;
    ui.connectQ5Button.classList.toggle("connectButton", routineState.bookDeviceState.connected && !routineState.q5DeviceState.connected);
    ui.connectQ5Button.classList.toggle("connectButton--pulse", routineState.bookDeviceState.connected && !routineState.q5DeviceState.connected && !routineState.q5DeviceState.connecting);
  }
  ui.startShowButton?.classList.toggle("connectButton--pulse", !routineState.bookDeviceState.connected && !routineState.bookDeviceState.connecting);

if (routineState.phase === BTI_V2_PHASES.COMPLETE || routineState.phase === BTI_V2_PHASES.ROUTINE_FINISHED) {
    updatePayloadStatus("Secuencia finalizada. Selección fijada. Podés repetir, detener o iniciar una nueva detección.", false);
  } else if (routineState.selectionLocked) {
    updatePayloadStatus("Selección fijada. Esperando/ejecutando avances por Antena 8.", false);
  } else if (!routineState.bookDeviceState.connected) {
    updatePayloadStatus("Conectá MrCamerDev1.0 para detectar el libro.", false);
  } else if (!routineState.q5DeviceState.connected) {
    updatePayloadStatus("MrCamerDev1.0 conectado. Ahora conectá MrCamerDev_Q5.", false);
  } else {
    updatePayloadStatus("Dispositivos conectados. Etapa: Detección. Esperando libro y selección multiantena.", false);
  }
}

function renderPhaseStatus() {
  if (!ui.phaseStatusLabel) return;
  const labels = {
    [BTI_V2_PHASES.DETECCION]: "Detección",
    [BTI_V2_PHASES.RESOLUCION]: "Resolución",
    [BTI_V2_PHASES.WAITING_GATE_FOR_READING_TARGET_1]: "Esperando avance",
    [BTI_V2_PHASES.PLAYING_READING_TARGET_1]: "Reproduciendo",
    [BTI_V2_PHASES.WAITING_GATE_FOR_READING_TARGET_2]: "Esperando avance",
    [BTI_V2_PHASES.PLAYING_READING_TARGET_2]: "Reproduciendo",
    [BTI_V2_PHASES.WAITING_IMAGE_ENCORE_TRIGGER]: "Esperando Encore de imagen",
    [BTI_V2_PHASES.IMAGE_ENCORE_RESOLVING]: "Resolviendo Encore de imagen",
    [BTI_V2_PHASES.IMAGE_ENCORE_PLAYING]: "Encore de imagen",
    [BTI_V2_PHASES.ROUTINE_FINISHED]: "Finalizado",
    [BTI_V2_PHASES.WAITING_GATE_FOR_ENCORE_FINAL]: "Esperando avance",
    [BTI_V2_PHASES.ENCORE_FINAL]: "Encore Final",
    [BTI_V2_PHASES.COMPLETE]: "Finalizado",
    [BTI_V2_PHASES.ERROR]: "Error",
  };
  ui.phaseStatusLabel.textContent = labels[routineState.phase] || "Detección";
}

function formatDeviceState(deviceState) {
  let label = "pendiente";
  if (deviceState.connecting) label = "conectando";
  else if (deviceState.connected) label = "conectado";
  else if (routineState.phase === BTI_V2_PHASES.ERROR) label = "error / desconectado";
  return `${deviceState.deviceName}: ${label}`;
}

function renderDeviceStatus(label) {
if (ui.bookDeviceStatusLabel) {
    ui.bookDeviceStatusLabel.textContent = label;
  }
}

function renderQ5Progress() {
  if (!isQ5Complete(routineState.q5Slots)) {
    const pending = BTI_V2_Q5_ANTENNA_IDS.filter(antennaId => routineState.q5Slots[antennaId] == null).join(", ");
    updatePayloadStatus(`Q5 esperando antenas: ${pending}.`, false);
    return;
  }
  const { page, line } = getQ5PageLine(routineState.q5Slots);
  ui.resolvedPage.textContent = String(page);
  ui.resolvedLine.textContent = String(line);
  updatePayloadStatus(routineState.currentBook ? `Q5 completo: pág ${page}, renglón ${line}.` : `Q5 completo: pág ${page}, renglón ${line}. Esperando libro.`, false);
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
}

function renderSelection(selection) {
  ui.resolvedPage.textContent = String(selection.pageNumber);
  ui.resolvedLine.textContent = String(selection.lineNumber);
  ui.resolvedContextList.innerHTML = "";

  const items = buildReadingStatusItems(selection.readingPlan, routineState.readingProgress);

  items.forEach(item => {
    const li = document.createElement("li");
    li.textContent = formatReadingStatusItem(item);
    if (item.selected) {
      li.style.fontWeight = "700";
    }
    ui.resolvedContextList.appendChild(li);
  });
}

function formatReadingStatusItem(item) {
  return `${item.label} (P${item.pageNumber} / L${item.lineNumber}): ${item.completed ? "Línea leída" : "Lista para leer"}`;
}

function buildReadingStatusItems(readingPlan, progress = [false, false]) {
  return readingPlan.targets.map((target, index) => ({
    label: index === 0 ? "Elegida" : "Siguiente",
    lineNumber: target.lineNumber,
    pageNumber: target.pageNumber,
    selected: index === 0,
    completed: progress[index] === true,
  }));
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
window.resetBtiV2FlowForNewDetection = resetBtiV2FlowForNewDetection;
window.setBookTestImposibleV2DeviceState = setBookTestImposibleV2DeviceState;

window.bookTestImposibleV2Dev = {
  buildReadingStatusItems,
  formatReadingStatusItem,
  resolveBookByDeviceCode,
  parseSelectionPayload,
  buildImageTakePath,
  resolveImageNavigation: (...args) => window.BookTestImposibleV2ImageEncore.resolveImageNavigation(...args),
  buildImageAudioPath: (...args) => window.BookTestImposibleV2ImageEncore.buildImageAudioPath(...args),
  prepareImageEncore,
  clearPreparedImageEncore,
  buildImageTakeCandidates,
  resolveLocalImageTakes,
  sumMultiAntennaSlots,
  injectMultiAntennaSelectionFromUi,
  normalizeQ5Value,
  tryLockAndStartShow,
  simulateAntenna8GateFromDev,
  resetBtiV2FlowForNewDetection,
  shouldAcceptAntenna8Gate,
  startImageEncore,
  sendImageEncoreShowSketch,
  sendBtiV2DetectorCommand,
  getRoutineState: () => routineState,
};
