const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const imageEncore = require('../js/rutinas/bookTestImposibleV2ImageEncore.js');

const routineSource = fs.readFileSync(path.join(__dirname, '../js/rutinas/bookTestImposibleV2.js'), 'utf8');

function loadRoutine() {
  const sends = [];
  const elements = new Map();
  const element = id => {
    if (!elements.has(id)) elements.set(id, {
      textContent: '', innerHTML: '', style: {}, appendChild() {},
      classList: { toggle() {} }, toggleAttribute() {}, removeAttribute() {}, addEventListener() {},
    });
    return elements.get(id);
  };
  const document = {
    readyState: 'loading', addEventListener() {}, getElementById(id) { return element(id); },
    createElement() { return { style: {}, appendChild() {} }; },
  };
  const window = {
    sendShowSketchToQ5: async request => sends.push(request),
    BookTestImposibleV2ImageEncore: imageEncore,
    BookTestImposibleV2RuntimeManifest: { resolveReadingPartCount: () => 1 },
  };
  vm.runInNewContext(routineSource, {
    window, document, console, performance: { now: () => 1 }, Date, Error, String, Number,
    Object, Array, Set, Map, JSON, Math, RegExp, Promise, Uint8Array,
    fetch: async () => ({ ok: true, json: async () => [] }),
  }, { filename: 'bookTestImposibleV2.js' });
  window.bookTestImposibleV2Dev.bindUiElements();
  return { dev: window.bookTestImposibleV2Dev, sends };
}

function createAudioHarness() {
  const played = [];
  const preloaded = [];
  let navigationRelease = null;
  const audio = {
    status: 'idle',
    resolveReadingContext(bookId, pageNumber, lineNumber) {
      return { bookId, pageNumber, playbackLineNumber: lineNumber, partCount: 1 };
    },
    buildResolutionPageLineRepeatQueue() {
      return [{ type: 'audio', src: '../audios/audios_especiales/pagina.mp3' }, { type: 'audio', src: '../audios/audios_especiales/renglon.mp3' }];
    },
    getClassicTakeUrls(context) { return { p1: `line-${context.playbackLineNumber}.mp3` }; },
    playClassicReadingTwoTakes(context, takes) {
      return [{ type: 'audio', src: takes.p1 }, { type: 'audio', src: takes.p1 }];
    },
    buildImageEncoreNavigationQueue() { return [{ type: 'audio', src: 'encore_avanza.mp3' }]; },
    setQueue(queue) { this.queue = queue; played.push(queue.map(item => item.src).filter(Boolean)); },
    async playQueue() {
      if (this.queue.some(item => item.src === 'encore_avanza.mp3')) {
        await new Promise(resolve => { navigationRelease = resolve; });
      }
      this.status = 'completed';
    },
    stop() {},
    preload(src) { preloaded.push(src); },
    clearPreloaded() {},
  };
  return { audio, played, preloaded, releaseNavigation: () => navigationRelease() };
}

function selectedRoutine() {
  const book = { bookId: 'book-1' };
  return {
    book, pageNumber: 225, lineNumber: 7,
    runtimeManifest: { images: [{ page: 230, imageId: 'image-001' }] },
    readingPlan: { targets: [{ pageNumber: 225, lineNumber: 7 }, { pageNumber: 225, lineNumber: 8 }] },
  };
}

test('Task 59 recorre repetición, lecturas, navegación y Encore Final con un solo SHOW_SKETCH', async () => {
  const { dev, sends } = loadRoutine();
  const harness = createAudioHarness();
  dev.setShowAudioForTests(harness.audio);
  const selection = selectedRoutine();
  const state = dev.getRoutineState();
  state.selectionLocked = true;
  state.lockedSelection = { resolved: selection };
  state.phase = 'WAITING_GATE_FOR_RESOLUTION_REPEAT';
  state.preparedImageEncore = imageEncore.resolveManifestBookImage({
    bookId: 'book-1', sourcePage: 225, images: selection.runtimeManifest.images,
  });

  await dev.handleAntenna8Gate();
  assert.equal(state.phase, 'WAITING_GATE_FOR_READING_TARGET_1');
  assert.deepEqual(harness.played[0], ['../audios/audios_especiales/pagina.mp3', '../audios/audios_especiales/renglon.mp3']);

  await dev.handleAntenna8Gate();
  assert.equal(state.phase, 'WAITING_GATE_FOR_READING_TARGET_2');
  assert.deepEqual(harness.played[1], ['line-7.mp3', 'line-7.mp3']);
  await dev.handleAntenna8Gate();
  assert.equal(state.phase, 'WAITING_IMAGE_ENCORE_TRIGGER');
  assert.deepEqual(harness.played[2], ['line-8.mp3', 'line-8.mp3']);

  const navigation = dev.handleAntenna8Gate();
  await Promise.resolve();
  await Promise.resolve();
  assert.equal(state.phase, 'IMAGE_ENCORE_NAVIGATION');
  assert.equal(sends.length, 1);
  await dev.handleAntenna8Gate();
  assert.equal(sends.length, 1);
  assert.equal(state.phase, 'IMAGE_ENCORE_NAVIGATION');
  harness.releaseNavigation();
  await navigation;
  assert.equal(state.phase, 'WAITING_GATE_FOR_ENCORE_FINAL');

  await dev.handleAntenna8Gate();
  assert.equal(state.phase, 'ROUTINE_FINISHED');
  assert.equal(sends.length, 1);
  assert.deepEqual(harness.played.at(-1), [
    '../books/book-1/audios/page-230/images/image-001_p1.mp3',
    '../books/book-1/audios/page-230/images/image-001_p2.mp3',
    '../books/book-1/audios/page-230/images/image-001_p3.mp3',
  ]);

  dev.resetBtiV2FlowForNewDetection();
  assert.equal(state.phase, 'DETECCION');
  assert.equal(state.selectionLocked, false);
  assert.equal(state.lockedSelection, null);
  assert.equal(state.imageEncore, null);
  assert.equal(state.preparedImageEncore, null);
  assert.equal(state.preparedImageAudioPath, null);
  assert.equal(state.imageEncoreTriggerConsumed, false);
});


test('Image Encore calcula desde la página realmente leída: 3 → 9 → croquis 13 = 2 vueltas', () => {
  const { dev } = loadRoutine();
  const harness = createAudioHarness();
  dev.setShowAudioForTests(harness.audio);
  const selection = {
    book: { bookId: 'book-1' },
    pageNumber: 3,
    lineNumber: 13,
    runtimeManifest: { images: [{ page: 13, imageId: 'image-001' }] },
    readingPlan: { targets: [{ pageNumber: 9, lineNumber: 1 }, { pageNumber: 9, lineNumber: 2 }] },
  };

  const result = dev.prepareImageEncore(selection);

  assert.equal(dev.resolveImageEncoreSourcePage(selection), 9);
  assert.equal(result.sourcePage, 9);
  assert.equal(result.targetPage, 13);
  assert.equal(result.turnCount, 2);
  assert.equal(result.navigationType, 'TURN_MULTIPLE_PAGES');
});

test('cross-book propaga libro destino a preload, SHOW_SKETCH y Encore Final', async () => {
  const { dev, sends } = loadRoutine();
  const harness = createAudioHarness();
  dev.setShowAudioForTests(harness.audio);
  const selection = {
    book: { bookId: 'book-2', tag: '02', title: 'Libro 2' },
    pageNumber: 14,
    lineNumber: 5,
    runtimeManifest: { images: [{ page: 22, imageId: 'future' }] },
    readingPlan: { targets: [{ pageNumber: 14, lineNumber: 5 }, { pageNumber: 14, lineNumber: 6 }] },
  };
  const state = dev.getRoutineState();
  state.imageEncoreCrossBookCatalog = [
    { bookId: 'book-1', tag: '01', title: 'Libro 1', imageEncoreCrossBookEnabled: true, images: [{ page: 14, imageId: 'image-001' }] },
    { bookId: 'book-2', tag: '02', title: 'Libro 2', imageEncoreCrossBookEnabled: true, images: selection.runtimeManifest.images },
    { bookId: 'book-3', tag: '03', title: 'Libro 3', imageEncoreCrossBookEnabled: true, images: [{ page: 14, imageId: 'image-001' }] },
  ];

  const result = dev.prepareImageEncore(selection);
  assert.equal(result.navigationType, 'CROSS_BOOK_EXACT_ORIGINAL_PAGE');
  assert.equal(result.sourceBookId, 'book-2');
  assert.equal(result.bookId, 'book-3');
  assert.equal(result.targetPage, 14);
  assert.deepEqual(harness.preloaded, ['../books/book-3/audios/page-014/images/image-001_p1.mp3']);

  await dev.sendImageEncoreShowSketch(result);
  assert.deepEqual(JSON.parse(JSON.stringify(sends)), [{
    sequence: 0,
    book: 'book-3',
    page: 14,
    image: 'image-001',
  }]);

  state.imageEncore = result;
  await dev.startEncoreFinal();
  assert.deepEqual(harness.played.at(-1), [
    '../books/book-3/audios/page-014/images/image-001_p1.mp3',
    '../books/book-3/audios/page-014/images/image-001_p2.mp3',
    '../books/book-3/audios/page-014/images/image-001_p3.mp3',
  ]);
});

test('NO_IMAGE_FOUND termina de forma controlada sin audio ni SHOW_SKETCH', async () => {
  const { dev, sends } = loadRoutine();
  const harness = createAudioHarness();
  dev.setShowAudioForTests(harness.audio);
  const selection = selectedRoutine();
  const state = dev.getRoutineState();
  state.preparedImageEncore = { found: false, bookId: 'book-1', sourcePage: 225, navigationType: 'NO_IMAGE_FOUND' };

  await dev.startImageEncore(selection);

  assert.equal(state.phase, 'ROUTINE_FINISHED');
  assert.equal(sends.length, 0);
  assert.equal(harness.played.length, 0);
});
