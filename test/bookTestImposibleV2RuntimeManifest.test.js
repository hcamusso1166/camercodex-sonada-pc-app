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

test('page 107 resuelve lineCount 27, siguiente y último renglón', () => {
  const normal = runtime.resolveSelection(manifest, book, 107, 3);
  assert.equal(normal.lineCount, 27);
  assert.equal(normal.lineNumber < normal.lineCount, true);
  const last = runtime.resolveSelection(manifest, book, 107, 27);
  assert.equal(last.lineNumber < last.lineCount, false);
});

test('página sin líneas rechaza selecciones', () => {
  assert.throws(() => runtime.resolveSelection(manifest, book, 237, 1), /no posee renglones seleccionables/);
});

test('readingRules preservan page 009 lines 16 y 17', () => {
  const line16 = runtime.resolveSelection(manifest, book, 9, 16).readingRule;
  assert.deepEqual(line16, { playLine: 16, extendWithNextLine: true });
  const line17 = runtime.resolveSelection(manifest, book, 9, 17).readingRule;
  assert.deepEqual(line17, { playLine: 16, extendWithNextLine: true, announceLines: [17, 16] });
});

test('manifest tiene 252 páginas, 43 imágenes y ningún contenido literario', () => {
  assert.equal(Object.keys(manifest.pages).length, 252);
  assert.equal(manifest.images.length, 43);
  assert.equal(manifest.pages['010'].lineCount, 27);
  assert.equal(manifest.pages['013'].lineCount, 27);
  assert.equal(JSON.stringify(manifest).includes('description'), false);
  assert.equal(JSON.stringify(manifest).includes('sayLines'), false);
});
