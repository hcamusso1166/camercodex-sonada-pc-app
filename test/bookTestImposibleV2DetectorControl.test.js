const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const routineSource = fs.readFileSync(
  path.join(__dirname, '../js/rutinas/bookTestImposibleV2.js'),
  'utf8'
);

async function loadRoutine() {
  const writes = [];
  let initialize;
  const elements = new Map();
  const element = id => {
    if (!elements.has(id)) {
      elements.set(id, {
        id,
        textContent: '',
        innerHTML: '',
        value: '',
        style: {},
        classList: { toggle() {} },
        addEventListener() {},
        toggleAttribute() {},
        removeAttribute() {},
        appendChild() {},
      });
    }
    return elements.get(id);
  };
  const document = {
    readyState: 'loading',
    addEventListener(name, callback) { if (name === 'DOMContentLoaded') initialize = callback; },
    getElementById(id) { return element(id); },
    createElement() { return { style: {} }; },
  };
  class ShowAudio {
    constructor() { this.status = 'idle'; this.lastPlayableQueue = []; }
    buildDetectionBookTitleQueue() { return []; }
    buildDetectionSlotQueue() { return []; }
    buildDetectionPageLineQueue() { return []; }
    enqueueAuxiliaryQueue() {}
    resolveReadingContext() { return {}; }
    buildResolutionBookPageLineOnceQueue() { return []; }
    setQueue(queue) { this.lastPlayableQueue = queue; }
    async playQueue() { this.status = 'completed'; }
    stop() {}
  }
  const window = {
    writeBtiV2DetectorControl: async (role, payload) => writes.push([role, [...payload]]),
    BookTestImposibleV2ImageEncore: {
      resolveManifestBookImage: ({ bookId, sourcePage }) => ({ found: false, bookId, sourcePage }),
      buildImageAudioPath() { return 'unused.mp3'; },
      buildImageAudioQueue() { return []; },
    },
    BookTestImposibleV2RuntimeManifest: {
      async loadRuntimeManifest() { return { images: [] }; },
      resolveSelection(manifest, book, page, line) {
        return {
          runtimeManifest: manifest,
          book,
          pageNumber: page,
          lineNumber: line,
          readingPlan: { targets: [{ pageNumber: page, lineNumber: line }, { pageNumber: page, lineNumber: line + 1 }] },
        };
      },
    },
    BookTestImposibleV2ShowAudio: ShowAudio,
  };
  vm.runInNewContext(routineSource, {
    window,
    document,
    console,
    performance: { now: () => 1 },
    Date,
    Error,
    String,
    Number,
    Object,
    Array,
    Set,
    Map,
    JSON,
    Math,
    RegExp,
    Promise,
    Uint8Array,
    fetch: async () => ({ ok: true, json: async () => [] }),
  }, { filename: 'bookTestImposibleV2.js' });
  await initialize();
  return { dev: window.bookTestImposibleV2Dev, writes };
}

function completeSelection(state) {
  state.currentBook = { bookId: 'book-1', title: 'Book 1' };
  state.q5Slots = { 2: 1, 3: 2, 4: 3, 5: 4, 6: 5 };
  state.phase = 'DETECCION';
}

async function flushWrites() {
  await new Promise(resolve => setImmediate(resolve));
}

test('complete payloads do not PAUSE until the first Siguiente Audio freeze', async () => {
  const { dev, writes } = await loadRoutine();
  const state = dev.getRoutineState();
  completeSelection(state);

  await flushWrites();
  assert.deepEqual(writes, []);

  await dev.tryLockAndStartShow();
  await flushWrites();
  assert.equal(state.selectionLocked, true);
  assert.deepEqual(writes, [
    ['bookDevice', [0x43, 0x41, 0x01, 0x00]],
    ['q5Device', [0x43, 0x41, 0x01, 0x00]],
  ]);

  await dev.tryLockAndStartShow();
  await flushWrites();
  assert.equal(writes.length, 2);
});

test('incomplete Siguiente Audio does not freeze or PAUSE', async () => {
  const { dev, writes } = await loadRoutine();
  const state = dev.getRoutineState();
  state.phase = 'DETECCION';

  await dev.tryLockAndStartShow();
  await flushWrites();

  assert.equal(state.selectionLocked, false);
  assert.deepEqual(writes, []);
});

test('injected multiantenna values converge on the same freeze and dual PAUSE', async () => {
  const { dev, writes } = await loadRoutine();
  const state = dev.getRoutineState();
  state.currentBook = { bookId: 'book-1', title: 'Book 1' };
  state.phase = 'DETECCION';
  await dev.injectMultiAntennaSelectionFromUi();

  await dev.tryLockAndStartShow();
  await flushWrites();

  assert.equal(state.lockedSelection.page, 44);
  assert.equal(state.lockedSelection.line, 6);
  assert.deepEqual(writes.map(([role, payload]) => [role, payload]), [
    ['bookDevice', [0x43, 0x41, 0x01, 0x00]],
    ['q5Device', [0x43, 0x41, 0x01, 0x00]],
  ]);
});

test('Nueva Detección and Reiniciar detección rearm before one dual RESUME', async () => {
  for (const control of ['Nueva Detección', 'Reiniciar detección']) {
    const { dev, writes } = await loadRoutine();
    const state = dev.getRoutineState();
    completeSelection(state);
    await dev.tryLockAndStartShow();
    await flushWrites();
    writes.length = 0;

    dev.resetBtiV2FlowForNewDetection();
    await flushWrites();

    assert.equal(state.selectionLocked, false, control);
    assert.equal(state.currentBook, null, control);
    assert.deepEqual(JSON.parse(JSON.stringify(state.q5Slots)), { 2: null, 3: null, 4: null, 5: null, 6: null }, control);
    assert.deepEqual(writes, [
      ['bookDevice', [0x43, 0x41, 0x01, 0x01]],
      ['q5Device', [0x43, 0x41, 0x01, 0x01]],
    ], control);

    dev.resetBtiV2FlowForNewDetection();
    await flushWrites();
    assert.equal(writes.length, 2, `${control} must not repeat RESUME while DETECTING`);
  }
});

test('detector commands attempt both destinations independently', async () => {
  const { dev, writes } = await loadRoutine();
  dev.sendBtiV2DetectorCommand('PAUSE');
  await flushWrites();
  assert.deepEqual(writes.map(([role]) => role), ['bookDevice', 'q5Device']);
});
