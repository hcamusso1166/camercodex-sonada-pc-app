const test = require('node:test');
const assert = require('node:assert/strict');
const manifest = require('../books/narnia-el-sobrino-del-mago/runtime-manifest.json');
const offlinePlan = require('../js/rutinas/bookTestImposibleV2OfflinePlan.js');

const book = {
  bookId: manifest.bookId,
  root: `books/${manifest.bookId}`,
  runtimeManifest: 'runtime-manifest.json',
};

function buildPlan() {
  return offlinePlan.buildBookOfflinePlan(book, manifest);
}

test('construye el contrato V1 completo, estable y sin duplicados', () => {
  const first = buildPlan();
  const second = buildPlan();
  assert.deepEqual(
    { schemaVersion: first.schemaVersion, profile: first.profile, bookId: first.bookId },
    { schemaVersion: 1, profile: 'bti-offline-plan-v1', bookId: manifest.bookId }
  );
  assert.deepEqual(first.urls, second.urls);
  assert.equal(first.urls.length, 16129);
  assert.equal(new Set(first.urls).size, first.urls.length);
  assert.ok(first.urls.every(url => url.startsWith(`/books/${book.bookId}/`)));
  assert.ok(first.urls.every(url => !url.includes('..') && !url.includes('\\')));
});

test('incluye manifest y audios metadata derivados bajo book.root', () => {
  const { urls } = buildPlan();
  const root = `/books/${book.bookId}`;
  assert.equal(urls[0], `${root}/runtime-manifest.json`);
  assert.ok(urls.includes(`${root}/audios/_meta/title.mp3`));
  assert.ok(urls.includes(`${root}/audios/_meta/author.mp3`));
});

test('respeta los partCount físicos de lectura sin inventar takes', () => {
  const { urls } = buildPlan();
  const root = `/books/${book.bookId}/audios`;
  const has = (page, line, take) => urls.includes(`${root}/page-${page}/line-${line}_${take}.mp3`);
  assert.deepEqual(['p1', 'p2', 'p3'].map(take => has('009', '017', take)), [true, false, false]);
  assert.deepEqual(['p1', 'p2', 'p3'].map(take => has('011', '006', take)), [true, true, false]);
  assert.deepEqual(['p1', 'p2', 'p3'].map(take => has('009', '016', take)), [true, true, true]);
  assert.equal(urls.filter(url => /\/line-\d{3}_p\d\.mp3$/.test(url)).length, 15997);
});

test('representa cada take del contrato actual de audio de imágenes', () => {
  const { urls } = buildPlan();
  const imageUrls = urls.filter(url => /\/images\/image-\d{3}_p\d\.mp3$/.test(url));
  assert.equal(imageUrls.length, 129);
  for (const take of manifest.audio.images.takes) {
    assert.ok(urls.includes(`/books/${book.bookId}/audios/page-011/images/image-001_${take}.mp3`));
  }
});

test('excluye JSON legado y assets globales de la aplicación', () => {
  const { urls } = buildPlan();
  assert.equal(urls.some(url => /\/pages\/page-\d{3}\.json$/.test(url)), false);
  assert.equal(urls.some(url => ['/index.html', '/service-worker.js', '/cache-files.json', '/books/index.json'].includes(url)), false);
  assert.equal(urls.some(url => !url.startsWith(`/books/${book.bookId}/`)), false);
});

test('falla explícitamente ante libro, raíz o manifest inconsistentes', () => {
  assert.throws(() => offlinePlan.buildBookOfflinePlan({}, manifest), /bookId inválido/);
  assert.throws(() => offlinePlan.buildBookOfflinePlan({ ...book, bookId: '../otro' }, manifest), /bookId inválido/);
  assert.throws(() => offlinePlan.buildBookOfflinePlan({ ...book, root: 'books/otro' }, manifest), /book.root inválido/);
  assert.throws(() => offlinePlan.buildBookOfflinePlan({ ...book, runtimeManifest: '../runtime-manifest.json' }, manifest), /runtimeManifest inválido/);
  const mismatched = structuredClone(manifest);
  mismatched.bookId = 'otro-libro';
  assert.throws(() => offlinePlan.buildBookOfflinePlan(book, mismatched), /bookId inválido/);
});

test('construir el plan es puro y no requiere red, cache ni storage', () => {
  let sideEffects = 0;
  const previous = { fetch: global.fetch, caches: global.caches, indexedDB: global.indexedDB };
  global.fetch = () => { sideEffects += 1; throw new Error('fetch inesperado'); };
  global.caches = { open() { sideEffects += 1; throw new Error('cache inesperado'); } };
  global.indexedDB = { open() { sideEffects += 1; throw new Error('storage inesperado'); } };
  try {
    assert.equal(buildPlan().urls.length, 16129);
    assert.equal(sideEffects, 0);
  } finally {
    global.fetch = previous.fetch;
    global.caches = previous.caches;
    global.indexedDB = previous.indexedDB;
  }
});
