const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const runtime = require('../js/rutinas/bookTestImposibleV2RuntimeManifest.js');
const offlinePlan = require('../js/rutinas/bookTestImposibleV2OfflinePlan.js');
const offlineAssets = require('../js/rutinas/bookTestImposibleV2OfflineAssets.js');
const preparation = require('../js/rutinas/bookTestImposibleV2OfflinePreparation.js');
const imageIndex = require('../books/image-index.js');

const root = path.join(__dirname, '..');
const id = 'el-principe-caspian';
const base = path.join(root, 'books', id);
const readJson = file => JSON.parse(fs.readFileSync(file, 'utf8'));
const index = readJson(path.join(root, 'books/index.json'));
const book = index.books.find(entry => entry.bookId === id);
const manifest = readJson(path.join(base, 'runtime-manifest.json'));
const plan = offlinePlan.buildBookOfflinePlan(book, manifest);
const absent = [56, 74, 94, 128, 186, 204, 222];
const imageOnly = [23, 41, 179];
const runtimePages = Array.from({ length: 225 }, (_, i) => i + 11).filter(page => !absent.includes(page));
const readingPages = runtimePages.filter(page => !imageOnly.includes(page));

function walk(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
    const file = path.join(directory, entry.name);
    return entry.isDirectory() ? walk(file) : [file];
  }).sort();
}

test('libro 04 publica metadata, 215 páginas literales y 218 páginas runtime', () => {
  assert.equal(index.books.length, 4);
  assert.equal(index.books[3], book);
  assert.deepEqual(book, { bookId: id, tag: '04', title: 'El príncipe Caspian', author: 'C. S. Lewis', root: `books/${id}`, collection: 'Las crónicas de Narnia', language: 'es', runtimeManifest: 'runtime-manifest.json' });
  assert.deepEqual(readJson(path.join(base, 'book.json')), { bookId: id, title: book.title, author: book.author, language: 'es', pages: { start: 11, end: 235 } });
  assert.deepEqual(fs.readdirSync(path.join(base, 'pages')).sort(), readingPages.map(page => `page-${runtime.pad3(page)}.json`));
  assert.deepEqual(Object.keys(manifest.pages).map(Number).sort((a, b) => a - b), runtimePages);
  for (const page of imageOnly) {
    assert.equal(manifest.pages[runtime.pad3(page)].lineCount, 0);
    assert.equal(fs.existsSync(path.join(base, `pages/page-${runtime.pad3(page)}.json`)), false);
  }
  const source = readingPages.map(page => {
    const data = readJson(path.join(base, `pages/page-${runtime.pad3(page)}.json`));
    assert.equal(data.page, page);
    assert.equal(data.bookId, id);
    assert.equal(data.lineCount, data.sayLines.length);
    assert.equal(data.lineCount, manifest.pages[runtime.pad3(page)].lineCount);
    assert.ok(data.sayLines.every(line => typeof line === 'string' && line.length));
    return [page, data.sayLines, data.images];
  });
  assert.equal(crypto.createHash('sha256').update(JSON.stringify(source)).digest('hex'), '79b2d17762911a1ee3c56798ebf3e923bb0fa1ff255ac802aa2f0035010216db');
});

test('contrato físico 04 reconcilia partes, imágenes, metadata y cero assets inesperados', () => {
  runtime.validateRuntimeManifest(manifest, id);
  const expected = new Set([manifest.audio.meta.title, manifest.audio.meta.author]);
  const distribution = { 1: 0, 2: 0, 3: 0 };
  let lines = 0;
  for (const page of runtimePages) {
    const key = runtime.pad3(page);
    const config = manifest.pages[key];
    for (let line = 1; line <= config.lineCount; line += 1) {
      const lineKey = runtime.pad3(line);
      const count = runtime.resolveReadingPartCount(manifest, page, line);
      distribution[count] += 1;
      lines += 1;
      for (let part = 1; part <= count; part += 1) expected.add(`audios/page-${key}/line-${lineKey}_p${part}.mp3`);
    }
  }
  assert.equal(lines, 5243);
  assert.deepEqual(distribution, { 1: 185, 2: 141, 3: 4917 });
  assert.equal(manifest.images.length, 36);
  for (const image of manifest.images) {
    assert.equal(image.imageId, 'image-001');
    for (let part = 1; part <= 3; part += 1) expected.add(`audios/page-${runtime.pad3(image.page)}/images/${image.imageId}_p${part}.mp3`);
  }
  const physical = walk(path.join(base, 'audios')).map(file => path.relative(base, file).split(path.sep).join('/'));
  assert.deepEqual(physical.sort(), [...expected].sort());
  assert.equal(physical.length, 15328);
  assert.equal(physical.filter(file => /\/line-/.test(file)).length, 15218);
  assert.equal(physical.filter(file => /\/images\//.test(file)).length, 108);
  assert.equal(physical.filter(file => /\/_meta\//.test(file)).length, 2);
  assert.equal(physical.reduce((bytes, file) => bytes + fs.statSync(path.join(base, file)).size, 0), 178134912);
  for (const file of physical) assert.ok(fs.statSync(path.join(base, file)).size > 0, file);
});

test('plan offline 04 contiene exactamente 15329 URLs existentes, únicas y confinadas', () => {
  const physical = walk(path.join(base, 'audios')).map(file => `/${path.relative(root, file).split(path.sep).join('/')}`);
  assert.equal(plan.urls.length, 15329);
  assert.equal(new Set(plan.urls).size, plan.urls.length);
  assert.deepEqual([...plan.urls].sort(), [`/books/${id}/runtime-manifest.json`, ...physical].sort());
  assert.ok(plan.urls.every(url => url.startsWith(`/books/${id}/`)));
  for (const url of plan.urls) assert.ok(fs.existsSync(path.join(root, url.slice(1))), url);
  const general = readJson(path.join(root, 'cache-files.json'));
  assert.ok(general.includes('/books/index.json'));
  assert.ok(general.every(url => !url.includes(`/books/${id}/`)));
});

test('índice de imágenes combina las 33 páginas JSON y las tres páginas sólo-imagen', () => {
  assert.equal(imageIndex[id].length, 36);
  assert.deepEqual(imageIndex[id].map(image => image.page), manifest.images.map(image => image.page));
  for (const page of imageOnly) {
    const image = imageIndex[id].find(entry => entry.page === page);
    assert.deepEqual(image, { bookId: id, page, imageId: 'image-001', description: '', audio: `${id}/audios/page-${runtime.pad3(page)}/images/image-001_p1.mp3` });
  }
});

test('preparación offline materializa los 15329 recursos en el caché persistente 04', async () => {
  const stored = new Map();
  const calls = { deleted: [], opened: [] };
  const cache = { async put(url, response) { stored.set(url, response); }, async match(url) { return stored.get(url); } };
  const materializer = offlineAssets.createOfflineAssetMaterializer({
    cacheStorage: { async delete(name) { calls.deleted.push(name); return true; }, async open(name) { calls.opened.push(name); return cache; } },
    async fetchImpl(url) { return { ok: true, url }; },
  });
  const result = await preparation.createOfflinePreparationService({ buildBookOfflinePlan: offlinePlan.buildBookOfflinePlan, materializer }).prepare(book, manifest);
  const cacheName = `camer-codex-bti-offline-v1-${id}`;
  assert.deepEqual(calls.deleted, [cacheName]);
  assert.deepEqual(calls.opened, [cacheName]);
  assert.equal(stored.size, 15329);
  assert.equal(result.plannedCount, 15329);
  assert.equal(result.downloadedCount, 15329);
  assert.equal(result.verifiedCount, 15329);
  assert.equal(result.ready, true);
});
