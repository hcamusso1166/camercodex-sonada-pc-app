const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const routineSource = fs.readFileSync(
  path.join(__dirname, '../js/rutinas/bookTestImposibleV2.js'),
  'utf8'
);

function loadRoutine({ sendShowSketchToQ5 } = {}) {
  const document = {
    readyState: 'loading',
    addEventListener() {},
    getElementById() { return null; },
    createElement() { return { style: {} }; },
  };
  const window = {
    sendShowSketchToQ5: sendShowSketchToQ5 || (async () => {}),
    BookTestImposibleV2ImageEncore: {
      resolveManifestBookImage() { throw new Error('unexpected resolver call'); },
      buildImageAudioPath() { return 'unused.mp3'; },
      buildImageAudioQueue() { return []; },
    },
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
    fetch: async () => ({ ok: true, json: async () => [] }),
  }, { filename: 'bookTestImposibleV2.js' });
  return window.bookTestImposibleV2Dev;
}

function selection() {
  return { book: { bookId: 'narnia-el-sobrino-del-mago' }, pageNumber: 11, runtimeManifest: { images: [] } };
}

function imageResult(overrides = {}) {
  return {
    found: true,
    bookId: 'narnia-el-sobrino-del-mago',
    sourcePage: 11,
    targetPage: 11,
    imageId: 'image-001',
    numberedPageDistance: 0,
    turnCount: 0,
    navigationType: 'SAME_PAGE',
    ...overrides,
  };
}

function prepareAcceptedEncore(dev, result) {
  const state = dev.getRoutineState();
  state.preparedImageEncore = result;
  state.imageEncoreTriggerConsumed = false;
  return state;
}

test('accepted Image Encore sends exactly one correctly mapped SHOW_SKETCH request', async () => {
  const sends = [];
  const dev = loadRoutine({ sendShowSketchToQ5: async request => sends.push(request) });
  prepareAcceptedEncore(dev, imageResult());

  await dev.startImageEncore(selection());
  await dev.startImageEncore(selection());

  assert.deepEqual(JSON.parse(JSON.stringify(sends)), [{
    sequence: 0,
    book: 'narnia-el-sobrino-del-mago',
    page: 11,
    image: 'image-001',
  }]);
});

test('SHOW_SKETCH sequence is monotonic uint32 and a later detection can send again', async () => {
  const sends = [];
  const dev = loadRoutine({ sendShowSketchToQ5: async request => sends.push(request) });
  prepareAcceptedEncore(dev, imageResult());
  await dev.startImageEncore(selection());

  const state = dev.getRoutineState();
  state.imageEncoreTriggerConsumed = false;
  prepareAcceptedEncore(dev, imageResult({ targetPage: 61, imageId: 'image-002' }));
  await dev.startImageEncore(selection());

  assert.deepEqual(sends.map(request => request.sequence), [0, 1]);
  sends.forEach(({ sequence }) => {
    assert.equal(Number.isInteger(sequence), true);
    assert.equal(sequence >= 0 && sequence <= 0xFFFFFFFF, true);
  });
});

test('found:false sends no SHOW_SKETCH request', async () => {
  const sends = [];
  const dev = loadRoutine({ sendShowSketchToQ5: async request => sends.push(request) });
  prepareAcceptedEncore(dev, imageResult({ found: false, navigationType: 'NO_IMAGE_FOUND' }));

  await dev.startImageEncore(selection());

  assert.equal(sends.length, 0);
});

test('SHOW_SKETCH failure is logged without retry and Image Encore completes', async () => {
  let attempts = 0;
  const dev = loadRoutine({
    sendShowSketchToQ5: async () => {
      attempts += 1;
      throw new Error('Q5 disconnected');
    },
  });
  const state = prepareAcceptedEncore(dev, imageResult());

  await dev.startImageEncore(selection());

  assert.equal(attempts, 1);
  assert.equal(state.phase, 'ROUTINE_FINISHED');
  assert.equal(state.logs.some(line => line.includes('[SHOW_SKETCH]') && line.includes('Q5 disconnected')), true);
  assert.equal(state.logs.some(line => line.includes('[IMAGE-ENCORE] complete')), true);
});

test('reading target UX avanza ready/ready, read/ready, read/read', () => {
  const dev = loadRoutine();
  const plan = { targets: [{ pageNumber: 107, lineNumber: 3 }, { pageNumber: 107, lineNumber: 4 }] };
  const statuses = progress => dev.buildReadingStatusItems(plan, progress).map(item => item.completed ? 'read' : 'ready');
  assert.deepEqual(statuses([false, false]), ['ready', 'ready']);
  assert.deepEqual(statuses([true, false]), ['read', 'ready']);
  assert.deepEqual(statuses([true, true]), ['read', 'read']);
});
