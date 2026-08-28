const test = require('node:test');
const assert = require('node:assert/strict');
const offlineAppApi = require('../js/rutinas/bookTestImposibleV2OfflineApp.js');

const preparableBook = {
  bookId: 'narnia-el-sobrino-del-mago',
  title: 'El sobrino del mago',
  root: 'books/narnia-el-sobrino-del-mago',
  runtimeManifest: 'runtime-manifest.json',
};
const unavailableBook = {
  bookId: 'narnia-el-leon-la-bruja-y-el-armario',
  title: 'El león, la bruja y el armario',
};

function createHarness(overrides = {}) {
  const calls = { fetchJson: [], loadManifest: [], prepare: [] };
  const manifest = { bookId: preparableBook.bookId };
  const result = {
    profile: 'bti-offline-preparation-v1',
    bookId: preparableBook.bookId,
    ready: true,
  };
  const manifestError = overrides.manifestError;
  const preparationError = overrides.preparationError;
  const fetchJson = async url => {
    calls.fetchJson.push(url);
    return { books: [preparableBook, unavailableBook] };
  };
  const runtimeApi = {
    async loadRuntimeManifest(book, receivedFetchJson) {
      calls.loadManifest.push([book, receivedFetchJson]);
      if (manifestError) throw manifestError;
      return manifest;
    },
  };
  const preparationService = {
    async prepare(book, receivedManifest) {
      calls.prepare.push([book, receivedManifest]);
      if (preparationError) throw preparationError;
      return result;
    },
  };
  const app = offlineAppApi.createOfflineApp({ fetchJson, runtimeApi, preparationService });
  return { app, calls, fetchJson, manifest, result };
}

test('lista solamente libros con runtimeManifest válido y no prepara durante el listado', async () => {
  const { app, calls } = createHarness();
  const books = await app.listPreparableBooks();

  assert.deepEqual(books, [preparableBook]);
  assert.deepEqual(calls.fetchJson, ['../books/index.json']);
  assert.deepEqual(calls.loadManifest, []);
  assert.deepEqual(calls.prepare, []);
  assert.equal(offlineAppApi.isPreparableBook(unavailableBook), false);
});

test('carga el runtime manifest del libro elegido y delega exactamente una preparación', async () => {
  const { app, calls, fetchJson, manifest, result } = createHarness();
  const received = await app.prepareBook(preparableBook);

  assert.deepEqual(calls.loadManifest, [[preparableBook, fetchJson]]);
  assert.deepEqual(calls.prepare, [[preparableBook, manifest]]);
  assert.equal(calls.prepare.length, 1);
  assert.equal(received, result);
  assert.equal(received.ready, true);
});

test('propaga errores del manifest loader sin invocar al coordinator', async () => {
  const error = new Error('manifest falló');
  const { app, calls } = createHarness({ manifestError: error });

  await assert.rejects(app.prepareBook(preparableBook), error);
  assert.deepEqual(calls.prepare, []);
});

test('propaga errores del preparation coordinator', async () => {
  const error = new Error('preparación falló');
  const { app } = createHarness({ preparationError: error });

  await assert.rejects(app.prepareBook(preparableBook), error);
});

test('rechaza preparar un libro sin runtimeManifest', async () => {
  const { app, calls } = createHarness();

  await assert.rejects(app.prepareBook(unavailableBook), /no tiene runtime manifest/);
  assert.deepEqual(calls.loadManifest, []);
  assert.deepEqual(calls.prepare, []);
});
