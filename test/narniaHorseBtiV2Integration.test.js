const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const runtime = require('../js/rutinas/bookTestImposibleV2RuntimeManifest.js');
const offlinePlan = require('../js/rutinas/bookTestImposibleV2OfflinePlan.js');
const offlineAssets = require('../js/rutinas/bookTestImposibleV2OfflineAssets.js');
const preparation = require('../js/rutinas/bookTestImposibleV2OfflinePreparation.js');
const root = path.join(__dirname, '..');
const id = 'el-caballo-y-el-muchacho';
const base = path.join(root, 'books', id);
const readJson = file => JSON.parse(fs.readFileSync(file, 'utf8'));
const index = readJson(path.join(root, 'books/index.json'));
const book = index.books.find(entry => entry.bookId === id);
const manifest = readJson(path.join(base, 'runtime-manifest.json'));
const plan = offlinePlan.buildBookOfflinePlan(book, manifest);
const absent = [30, 68, 120, 154, 208, 226];
const pageNumbers = Array.from({ length: 231 }, (_, i) => i + 11).filter(n => !absent.includes(n));
const imagePages = [14, 43, 50, 58, 59, 70, 84, 93, 97, 100, 108, 122, 130, 140, 150, 153, 167, 168, 178, 179, 192, 194, 211, 220, 221, 231, 241];
function walk(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
    const file = path.join(directory, entry.name);
    return entry.isDirectory() ? walk(file) : [file];
  }).sort();
}

test('libro 03 conserva metadata, exactamente 225 páginas y la fuente literal validada', () => {
  assert.equal(index.books.length, 3);
  assert.equal(index.books[2], book);
  assert.deepEqual(book, { bookId: id, tag: '03', title: 'El caballo y el muchacho', author: 'C. S. Lewis', root: `books/${id}`, collection: 'Las crónicas de Narnia', language: 'es', runtimeManifest: 'runtime-manifest.json' });
  assert.deepEqual(readJson(path.join(base, 'book.json')), { bookId: id, title: book.title, author: book.author, language: 'es', pages: { start: 11, end: 241 } });
  assert.deepEqual(fs.readdirSync(path.join(base, 'pages')).sort(), pageNumbers.map(n => `page-${runtime.pad3(n)}.json`));
  assert.deepEqual(Object.keys(manifest.pages).map(Number).sort((a, b) => a - b), pageNumbers);
  const source = [];
  for (const page of pageNumbers) {
    const data = readJson(path.join(base, `pages/page-${runtime.pad3(page)}.json`));
    assert.equal(data.page, page);
    assert.equal(data.bookId, id);
    assert.equal(data.lineCount, data.sayLines.length);
    assert.ok(data.sayLines.every(line => typeof line === 'string' && line.trim()));
    assert.equal(data.lineCount, manifest.pages[runtime.pad3(page)].lineCount);
    source.push([page, data.sayLines, data.images]);
  }
  // Frozen after local AST reconciliation of active literals, including whitespace,
  // segmentation and image descriptions. No test requires the excluded generators.
  assert.equal(crypto.createHash('sha256').update(JSON.stringify(source)).digest('hex'), 'ee46e2ec53fa8a8a6fdb09e5a1891e5b2b39597b3c8ad1e8b737b78aa6f43f22');
});

test('árbol físico completo coincide exactamente con pages, partes y manifest del libro 03', () => {
  runtime.validateRuntimeManifest(manifest, id);
  const expected = new Set([manifest.audio.meta.title, manifest.audio.meta.author]);
  const distribution = { 1: 0, 2: 0, 3: 0 };
  let lines = 0;
  for (const page of pageNumbers) {
    const key = runtime.pad3(page);
    const data = readJson(path.join(base, `pages/page-${key}.json`));
    const cfg = manifest.pages[key];
    const overrides = {};
    data.sayLines.forEach((line, offset) => {
      const count = Math.min(3, line.trim().split(/\s+/).length);
      const lineKey = runtime.pad3(offset + 1);
      assert.equal(runtime.resolveReadingPartCount(manifest, page, offset + 1), count, `${key}/${lineKey}`);
      if (count < 3) overrides[lineKey] = count;
      distribution[count] += 1;
      lines += 1;
      for (let part = 1; part <= count; part += 1) expected.add(`audios/page-${key}/line-${lineKey}_p${part}.mp3`);
    });
    assert.deepEqual(cfg.partCountOverrides || {}, overrides);
    assert.deepEqual(data.images.map(image => ({ page, imageId: image.imageId })), manifest.images.filter(image => image.page === page));
    assert.ok(data.images.every(image => Object.keys(image).sort().join(',') === 'description,imageId' && image.description.trim()));
  }
  assert.equal(lines, 5554);
  assert.deepEqual(distribution, { 1: 122, 2: 98, 3: 5334 });
  assert.deepEqual(manifest.images.map(image => image.page), imagePages);
  for (const image of manifest.images) {
    assert.equal(image.imageId, 'image-001');
    for (let part = 1; part <= 3; part += 1) expected.add(`audios/page-${runtime.pad3(image.page)}/images/${image.imageId}_p${part}.mp3`);
  }
  const physical = walk(path.join(base, 'audios')).map(file => path.relative(base, file).split(path.sep).join('/'));
  assert.deepEqual(physical.sort(), [...expected].sort());
  assert.equal(physical.length, 16403);
  assert.equal(physical.filter(file => /\/line-/.test(file)).length, 16320);
  assert.equal(physical.filter(file => /\/images\//.test(file)).length, 81);
  assert.equal(physical.filter(file => /\/_meta\//.test(file)).length, 2);
  for (const file of physical) assert.ok(fs.statSync(path.join(base, file)).size > 0, file);
});

test('plan offline del libro 03 cubre exactamente el contrato runtime y excluye el caché general', () => {
  const physical = walk(path.join(base, 'audios')).map(file => `/${path.relative(root, file).split(path.sep).join('/')}`);
  const expected = [`/books/${id}/runtime-manifest.json`, ...physical];
  assert.equal(plan.urls.length, 16404);
  assert.equal(new Set(plan.urls).size, 16404);
  assert.deepEqual([...plan.urls].sort(), expected.sort());
  for (const url of plan.urls) assert.ok(fs.existsSync(path.join(root, url.slice(1))), url);
  const general = readJson(path.join(root, 'cache-files.json'));
  assert.ok(general.includes('/books/index.json'));
  assert.ok(general.every(url => !url.includes(`/books/${id}/`)));
  assert.ok(plan.urls.every(url => url.startsWith(`/books/${id}/`)));
  assert.equal(JSON.stringify(manifest).includes('sayLines'), false);
  assert.equal(JSON.stringify(manifest).includes('description'), false);
});

test('preparación offline materializa y verifica los 16404 assets sólo en el caché dedicado 03', async () => {
  const stored = new Map();
  const calls = { deleted: [], opened: [], fetched: [] };
  const cache = { async put(url, response) { stored.set(url, response); }, async match(url) { return stored.get(url); } };
  const materializer = offlineAssets.createOfflineAssetMaterializer({
    cacheStorage: { async delete(name) { calls.deleted.push(name); return true; }, async open(name) { calls.opened.push(name); return cache; } },
    async fetchImpl(url) { calls.fetched.push(url); return { ok: true, url }; },
  });
  const service = preparation.createOfflinePreparationService({ buildBookOfflinePlan: offlinePlan.buildBookOfflinePlan, materializer });
  const result = await service.prepare(book, manifest);
  const cacheName = `camer-codex-bti-offline-v1-${id}`;
  assert.deepEqual(calls.deleted, [cacheName]);
  assert.deepEqual(calls.opened, [cacheName]);
  assert.deepEqual(calls.fetched, plan.urls);
  assert.equal(stored.size, 16404);
  assert.equal(result.cacheName, cacheName);
  assert.equal(result.plannedCount, 16404);
  assert.equal(result.downloadedCount, 16404);
  assert.equal(result.verifiedCount, 16404);
  assert.equal(result.ready, true);
});

test('lectura cíclica 03 salta páginas ausentes y vuelve al primer renglón', () => {
  for (const page of absent) {
    const previous = manifest.pages[runtime.pad3(page - 1)];
    const plan = runtime.resolveCyclicReadingPlan(manifest, page - 1, previous.lineCount);
    assert.deepEqual(plan.targets[1], { pageNumber: page + 1, lineNumber: 1 });
    assert.deepEqual(runtime.resolveCyclicReadingPlan(manifest, page, 1).targets[0], { pageNumber: page + 1, lineNumber: 1 });
  }
  const final = manifest.pages['241'];
  assert.deepEqual(runtime.resolveCyclicReadingPlan(manifest, 241, final.lineCount).targets[1], { pageNumber: 11, lineNumber: 1 });
});

test('libros 01/02 mantienen sus contratos publicados', () => {
  assert.deepEqual(index.books.slice(0, 2).map(book => [book.bookId, book.tag, book.isbn]), [
    ['narnia-el-sobrino-del-mago', '01', '978-950-732-097-2'],
    ['narnia-el-leon-la-bruja-y-el-armario', '02', '978-950-732-098-9'],
  ]);
  const hash = crypto.createHash('sha256');
  const files = ['narnia-el-sobrino-del-mago', 'narnia-el-leon-la-bruja-y-el-armario'].flatMap(id => walk(path.join(root, 'books', id)))
    .filter(file => file.endsWith('.json') && !file.split(path.sep).includes('audios')).sort();
  for (const file of files) {
    hash.update(path.relative(root, file).split(path.sep).join('/')); hash.update('\0');
    hash.update(JSON.stringify(readJson(file))); hash.update('\0');
  }
  assert.equal(hash.digest('hex'), '5360b1830163d8a28a327cdecd6c9345d8c99487ea7ab58cf8e93eb8f5ac6f6b');
});
