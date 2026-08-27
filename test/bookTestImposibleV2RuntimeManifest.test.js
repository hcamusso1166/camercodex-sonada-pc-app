const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const manifest = require('../books/narnia-el-sobrino-del-mago/runtime-manifest.json');
const runtime = require('../js/rutinas/bookTestImposibleV2RuntimeManifest.js');

const book = { bookId: manifest.bookId, root: `books/${manifest.bookId}`, runtimeManifest: 'runtime-manifest.json' };

test('valida y carga una sola vez el runtime manifest', async () => {
  runtime.clearCache(); let calls = 0;
  const fetchJson = async () => { calls += 1; return manifest; };
  assert.equal(await runtime.loadRuntimeManifest(book, fetchJson), manifest);
  assert.equal(await runtime.loadRuntimeManifest(book, fetchJson), manifest);
  assert.equal(calls, 1);
});

test('validator admite lineCount cero y rechaza manifest inválido', () => {
  assert.equal(runtime.validateRuntimeManifest(manifest, manifest.bookId), manifest);
  const invalid = structuredClone(manifest); invalid.pages['001'].lineCount = -1;
  assert.throws(() => runtime.validateRuntimeManifest(invalid, manifest.bookId), /lineCount inválido/);
});

test('validator congela exactamente el contrato de audio V1', () => {
  const mutations = [
    ['profile', draft => { draft.audio.profile = 'bti-audio-v2'; }],
    ['meta.title', draft => { draft.audio.meta.title = 'audios/_meta/otro.mp3'; }],
    ['meta.author', draft => { draft.audio.meta.author = 'audios/_meta/otro.mp3'; }],
    ['reading.takes incompletos', draft => { draft.audio.reading.takes = ['p1', 'p2']; }],
    ['reading.takes adicionales', draft => { draft.audio.reading.takes = ['p1', 'p2', 'p3', 'p4']; }],
    ['reading.takes desordenados', draft => { draft.audio.reading.takes = ['p2', 'p1', 'p3']; }],
    ['reading.defaultPartCount', draft => { draft.audio.reading.defaultPartCount = 2; }],
    ['reading.pathPattern', draft => { draft.audio.reading.pathPattern = 'audios/{take}.mp3'; }],
    ['images.takes', draft => { draft.audio.images.takes = ['p1', 'p2']; }],
    ['images.takes desordenados', draft => { draft.audio.images.takes = ['p2', 'p1', 'p3']; }],
    ['images.pathPattern', draft => { draft.audio.images.pathPattern = 'images/{take}.mp3'; }],
  ];

  assert.equal(runtime.validateRuntimeManifest(manifest, manifest.bookId), manifest);
  for (const [label, mutate] of mutations) {
    const invalid = structuredClone(manifest);
    mutate(invalid);
    assert.throws(
      () => runtime.validateRuntimeManifest(invalid, manifest.bookId),
      /inválido para bti-audio-v1/,
      label
    );
  }
});

test('validator acepta overrides 1/2 y rechaza páginas vacías, renglones inexistentes y valores no permitidos', () => {
  const valid = structuredClone(manifest);
  valid.pages['009'].partCountOverrides = { '001': 1, '002': 2 };
  assert.equal(runtime.validateRuntimeManifest(valid, valid.bookId), valid);
  const mutations = [
    draft => { draft.pages['001'].partCountOverrides = { '001': 1 }; },
    draft => { draft.pages['009'].partCountOverrides = { '000': 1 }; },
    draft => { draft.pages['009'].partCountOverrides = { '018': 1 }; },
    draft => { draft.pages['009'].partCountOverrides = { '001': 3 }; },
    draft => { draft.pages['009'].partCountOverrides = { '001': 'PLUMMER.' }; },
    draft => { draft.pages['009'].sayLines = ['texto literario']; },
  ];
  for (const mutate of mutations) {
    const invalid = structuredClone(manifest); mutate(invalid);
    assert.throws(() => runtime.validateRuntimeManifest(invalid, invalid.bookId), /partCountOverrides|renglón inválido|partCount inválido|campo no permitido/);
  }
});

test('validator rechaza campos desconocidos y texto literario en images', () => {
  const invalid = structuredClone(manifest);
  invalid.images[0].description = 'texto literario';
  assert.throws(() => runtime.validateRuntimeManifest(invalid, invalid.bookId), /campo no permitido en imagen.*description/);
});

test('partCount usa overrides 1/2 y default 3 en casos físicos congelados', () => {
  assert.equal(runtime.resolveReadingPartCount(manifest, 9, 17), 1);
  assert.equal(runtime.resolveReadingPartCount(manifest, 41, 17), 1);
  assert.equal(runtime.resolveReadingPartCount(manifest, 11, 6), 2);
  assert.equal(runtime.resolveReadingPartCount(manifest, 9, 16), 3);
  assert.throws(() => runtime.resolveReadingPartCount(manifest, 9, 18), /inexistente/);
});

test('manifest contiene 228 overrides y distribución efectiva 131/97/5224', () => {
  const distribution = { 1: 0, 2: 0, 3: 0 }; let overrides = 0;
  for (const [pageKey, page] of Object.entries(manifest.pages)) {
    for (let line = 1; line <= page.lineCount; line += 1) {
      const partCount = runtime.resolveReadingPartCount(manifest, Number(pageKey), line);
      distribution[partCount] += 1; if (partCount < 3) overrides += 1;
    }
  }
  assert.deepEqual(distribution, { 1: 131, 2: 97, 3: 5224 });
  assert.equal(overrides, 228);
  assert.equal(Object.values(distribution).reduce((total, count) => total + count, 0), 5452);
});

test('overrides del manifest coinciden con la regla build-time basada en sayLines', () => {
  const derived = { 1: 0, 2: 0, 3: 0 };
  for (const [pageKey, page] of Object.entries(manifest.pages)) {
    if (page.lineCount === 0) continue;
    const legacy = JSON.parse(fs.readFileSync(`books/${manifest.bookId}/pages/page-${pageKey}.json`, 'utf8'));
    legacy.sayLines.forEach((line, index) => {
      const partCount = Math.min(3, line.trim().split(/\s+/).filter(Boolean).length);
      assert.ok(partCount > 0, `${pageKey}/${String(index + 1).padStart(3, '0')}`);
      assert.equal(runtime.resolveReadingPartCount(manifest, Number(pageKey), index + 1), partCount);
      derived[partCount] += 1;
    });
  }
  assert.deepEqual(derived, { 1: 131, 2: 97, 3: 5224 });
});

test('page 107 resuelve lineCount 27, siguiente y último renglón', () => {
  const normal = runtime.resolveSelection(manifest, book, 107, 3);
  assert.equal(manifest.pages['107'].lineCount, 27);
  assert.deepEqual(normal.readingPlan.targets, [{ pageNumber: 107, lineNumber: 3 }, { pageNumber: 107, lineNumber: 4 }]);
  const last = runtime.resolveSelection(manifest, book, 107, 27);
  assert.deepEqual(last.readingPlan.targets[0], { pageNumber: 107, lineNumber: 27 });
});

test('resolveCyclicReadingPlan cubre normal, páginas vacías, bordes y wrap', () => {
  const cases = [
    [107, 3, [[107, 3], [107, 4]], false, false, false],
    [41, 17, [[41, 17], [43, 1]], false, true, false],
    [9, 16, [[9, 16], [9, 17]], false, false, false],
    [9, 17, [[9, 17], [10, 1]], false, true, false],
    [42, 1, [[43, 1], [43, 2]], true, true, false],
    [41, 99, [[43, 1], [43, 2]], true, true, false],
    [252, 17, [[252, 17], [9, 1]], false, true, true],
    [252, 99, [[9, 1], [9, 2]], true, true, true],
  ];
  for (const [page, line, expected, normalizedStart, crossedPage, wrappedBook] of cases) {
    const plan = runtime.resolveCyclicReadingPlan(manifest, page, line);
    assert.deepEqual(plan.targets.map(target => [target.pageNumber, target.lineNumber]), expected);
    assert.deepEqual({ normalizedStart: plan.normalizedStart, crossedPage: plan.crossedPage, wrappedBook: plan.wrappedBook }, { normalizedStart, crossedPage, wrappedBook });
    assert.deepEqual(plan.requested, { pageNumber: page, lineNumber: line });
  }
});

test('resolver preserva selección original y siempre entrega dos targets', () => {
  const selection = runtime.resolveSelection(manifest, book, 42, 1);
  assert.equal(selection.pageNumber, 42);
  assert.equal(selection.lineNumber, 1);
  assert.equal(selection.readingPlan.targets.length, 2);
});

test('libro con menos de dos renglones falla explícitamente', () => {
  const tiny = structuredClone(manifest);
  tiny.pages = { '001': { lineCount: 1 } };
  tiny.images = [];
  assert.throws(() => runtime.validateRuntimeManifest(tiny, tiny.bookId), /al menos dos renglones/);
  assert.throws(() => runtime.resolveCyclicReadingPlan(tiny, 1, 1), /al menos dos renglones/);
});

test('manifest tiene 252 páginas, 43 imágenes y ningún contenido literario', () => {
  assert.equal(Object.keys(manifest.pages).length, 252);
  assert.equal(manifest.images.length, 43);
  assert.equal(manifest.pages['010'].lineCount, 27);
  assert.equal(manifest.pages['013'].lineCount, 27);
  assert.equal(JSON.stringify(manifest).includes('description'), false);
  assert.equal(JSON.stringify(manifest).includes('sayLines'), false);
  assert.equal(JSON.stringify(manifest).includes('readingRules'), false);
});
