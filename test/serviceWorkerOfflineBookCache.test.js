const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');

const SERVICE_WORKER_PATH = path.join(__dirname, '..', 'service-worker.js');
const SERVICE_WORKER_SOURCE = fs.readFileSync(SERVICE_WORKER_PATH, 'utf8');
const CACHE_FILES_PATH = path.join(__dirname, '..', 'cache-files.json');
const CACHE_FILES = JSON.parse(fs.readFileSync(CACHE_FILES_PATH, 'utf8'));
const APP_ORIGIN = 'https://app.example';
const CACHE_NAME = 'camer-codex-cache-v16';
const BOOKS_INDEX_PATH = '/books/index.json';
const BOOK_ID = 'narnia-el-sobrino-del-mago';
const OFFLINE_CACHE_NAME = `camer-codex-bti-offline-v1-${BOOK_ID}`;
const BOOK_PATH = `/books/${BOOK_ID}/audios/page-011/line-001.mp3`;
const BTI_COLD_START_MODULES = [
  '/js/rutinas/bookTestImposibleV2OfflinePlan.js',
  '/js/rutinas/bookTestImposibleV2OfflineAssets.js',
  '/js/rutinas/bookTestImposibleV2OfflinePreparation.js',
  '/js/rutinas/bookTestImposibleV2OfflineApp.js',
];
const BTI_RESOLUTION_AUDIO_PATHS = [
  '/audios/audios_especiales/pagina.mp3',
  '/audios/audios_especiales/renglon.mp3',
];
const BTI_MISSING_SLOT_AUDIO_PATH = '/audios/audios_especiales/slot.mp3';

function createCache(initialEntries = {}) {
  const entries = new Map(Object.entries(initialEntries));
  return {
    matchCalls: [],
    putCalls: [],
    addCalls: [],
    async match(key) {
      this.matchCalls.push(key);
      return entries.get(typeof key === 'string' ? key : key.url);
    },
    async put(key, value) {
      this.putCalls.push(key);
      entries.set(typeof key === 'string' ? key : key.url, value);
    },
    async add(key) {
      this.addCalls.push(key);
    }
  };
}

function loadServiceWorker({ cacheEntries = {}, fetchImpl } = {}) {
  const listeners = {};
  const cacheMap = new Map(Object.entries(cacheEntries));
  const calls = { deleted: [], has: [], opened: [], fetch: [] };
  const caches = {
    async keys() { return [...cacheMap.keys()]; },
    async has(name) {
      calls.has.push(name);
      return cacheMap.has(name);
    },
    async open(name) {
      calls.opened.push(name);
      if (!cacheMap.has(name)) cacheMap.set(name, createCache());
      return cacheMap.get(name);
    },
    async delete(name) {
      calls.deleted.push(name);
      return cacheMap.delete(name);
    }
  };
  const self = {
    location: { origin: APP_ORIGIN },
    clients: { async claim() {} },
    skipWaiting() {},
    addEventListener(type, listener) { listeners[type] = listener; }
  };
  const mockedFetch = async (...args) => {
    calls.fetch.push(args);
    if (fetchImpl) return fetchImpl(...args);
    return new Response('network');
  };

  vm.runInNewContext(SERVICE_WORKER_SOURCE, {
    self,
    caches,
    fetch: mockedFetch,
    Request,
    Response,
    URL,
    console
  }, { filename: SERVICE_WORKER_PATH });

  return { listeners, cacheMap, calls };
}

async function dispatchInstall(listeners) {
  let completion;
  listeners.install({ waitUntil(promise) { completion = promise; } });
  await completion;
}

async function dispatchActivate(listeners) {
  let completion;
  listeners.activate({ waitUntil(promise) { completion = promise; } });
  await completion;
}

async function dispatchFetch(listeners, request) {
  let responsePromise;
  listeners.fetch({ request, respondWith(promise) { responsePromise = promise; } });
  assert.ok(responsePromise, 'fetch handler should call respondWith');
  return responsePromise;
}

test('cache-files includes every BTI offline cold-start module', () => {
  for (const modulePath of BTI_COLD_START_MODULES) {
    assert.equal(CACHE_FILES.includes(modulePath), true, `${modulePath} must be in cache-files.json`);
  }
  assert.equal(CACHE_FILES.includes(BOOKS_INDEX_PATH), true);
});

test('cache-files includes BTI resolution audios and deliberately excludes missing slot audio', () => {
  for (const audioPath of BTI_RESOLUTION_AUDIO_PATHS) {
    assert.equal(CACHE_FILES.includes(audioPath), true, `${audioPath} must be in cache-files.json`);
  }
  assert.equal(CACHE_FILES.includes(BTI_MISSING_SLOT_AUDIO_PATH), false);
});

test('precache includes books/index metadata but excludes book-scoped assets', async () => {
  const current = createCache();
  const scopedManifest = `/books/${BOOK_ID}/runtime-manifest.json`;
  const manifest = [
    '/css/style.css',
    ...BTI_RESOLUTION_AUDIO_PATHS,
    BOOKS_INDEX_PATH,
    scopedManifest,
    '/js/main.js',
  ];
  const { listeners, calls } = loadServiceWorker({
    cacheEntries: { [CACHE_NAME]: current },
    fetchImpl: async (input) => {
      if (input === '/cache-files.json') {
        return new Response(JSON.stringify(manifest), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });
      }
      return new Response('network');
    }
  });

  await dispatchInstall(listeners);

  assert.deepEqual(current.addCalls, ['/css/style.css', ...BTI_RESOLUTION_AUDIO_PATHS, BOOKS_INDEX_PATH, '/js/main.js']);
  assert.deepEqual(
    current.addCalls.filter(entry => BTI_RESOLUTION_AUDIO_PATHS.includes(entry)),
    BTI_RESOLUTION_AUDIO_PATHS
  );
  assert.equal(current.addCalls.includes(BTI_MISSING_SLOT_AUDIO_PATH), false);
  assert.equal(current.addCalls.includes(scopedManifest), false);
  assert.deepEqual(
    current.addCalls.filter(entry => typeof entry === 'string' && entry.startsWith('/books/') && entry !== BOOKS_INDEX_PATH),
    []
  );
  assert.equal(calls.fetch.length, 1);
  assert.equal(calls.fetch[0][0], '/cache-files.json');
  assert.equal(calls.fetch[0][1].cache, 'no-store');
  assert.deepEqual(current.putCalls, ['/cache-files.json']);
  assert.equal(current.addCalls.includes('/cache-files.json'), false);
  assert.deepEqual(await (await current.match('/cache-files.json')).json(), manifest);
});

test('/books/index.json is served from current cache without network or dedicated-cache access', async () => {
  const current = createCache({ [BOOKS_INDEX_PATH]: new Response('cached index') });
  const { listeners, calls } = loadServiceWorker({
    cacheEntries: { [CACHE_NAME]: current },
    fetchImpl: async () => {
      throw new Error('network should not be used');
    }
  });

  const response = await dispatchFetch(listeners, new Request(`${APP_ORIGIN}${BOOKS_INDEX_PATH}`));

  assert.equal(await response.text(), 'cached index');
  assert.deepEqual(calls.has, []);
  assert.deepEqual(calls.opened, [CACHE_NAME]);
  assert.deepEqual(current.matchCalls, [BOOKS_INDEX_PATH]);
  assert.deepEqual(current.putCalls, []);
  assert.equal(calls.fetch.length, 0);
});

test('/books/index.json network fallback is stored in current cache', async () => {
  const current = createCache();
  const { listeners, calls } = loadServiceWorker({
    cacheEntries: { [CACHE_NAME]: current },
    fetchImpl: async () => new Response('fresh index')
  });

  const response = await dispatchFetch(listeners, new Request(`${APP_ORIGIN}${BOOKS_INDEX_PATH}`));

  assert.equal(await response.text(), 'fresh index');
  assert.deepEqual(calls.has, []);
  assert.deepEqual(calls.opened, [CACHE_NAME]);
  assert.deepEqual(current.matchCalls, [BOOKS_INDEX_PATH]);
  assert.deepEqual(current.putCalls, [BOOKS_INDEX_PATH]);
  assert.equal(calls.fetch.length, 1);
});

test('activate preserves current and BTI offline caches while deleting unrecognized caches', async () => {
  const current = createCache();
  const offline = createCache();
  const old = createCache();
  const { listeners, cacheMap, calls } = loadServiceWorker({
    cacheEntries: {
      [CACHE_NAME]: current,
      [OFFLINE_CACHE_NAME]: offline,
      'camer-codex-cache-v14': old,
      'otro-cache-viejo': createCache()
    }
  });

  await dispatchActivate(listeners);

  assert.equal(cacheMap.get(CACHE_NAME), current);
  assert.equal(cacheMap.get(OFFLINE_CACHE_NAME), offline);
  assert.deepEqual(calls.deleted.sort(), ['camer-codex-cache-v14', 'otro-cache-viejo']);
});

test('normal book request uses its existing offline cache before network and never touches current cache', async () => {
  const offlineResponse = new Response('offline asset');
  const offline = createCache({ [BOOK_PATH]: offlineResponse });
  const current = createCache({ [BOOK_PATH]: new Response('current asset') });
  const { listeners, calls } = loadServiceWorker({
    cacheEntries: { [CACHE_NAME]: current, [OFFLINE_CACHE_NAME]: offline }
  });

  const response = await dispatchFetch(listeners, new Request(`${APP_ORIGIN}${BOOK_PATH}`));

  assert.equal(await response.text(), 'offline asset');
  assert.deepEqual(calls.has, [OFFLINE_CACHE_NAME]);
  assert.deepEqual(offline.matchCalls, [BOOK_PATH]);
  assert.deepEqual(current.matchCalls, []);
  assert.deepEqual(current.putCalls, []);
  assert.equal(calls.fetch.length, 0);
});

test('normal book request with dedicated cache miss goes directly to network without current-cache read or write', async () => {
  const offline = createCache();
  const current = createCache({ [BOOK_PATH]: new Response('stale current asset') });
  const { listeners, calls } = loadServiceWorker({
    cacheEntries: { [CACHE_NAME]: current, [OFFLINE_CACHE_NAME]: offline },
    fetchImpl: async () => new Response('network asset')
  });

  const response = await dispatchFetch(listeners, new Request(`${APP_ORIGIN}${BOOK_PATH}`));

  assert.equal(await response.text(), 'network asset');
  assert.deepEqual(offline.matchCalls, [BOOK_PATH]);
  assert.deepEqual(current.matchCalls, []);
  assert.deepEqual(current.putCalls, []);
  assert.equal(calls.fetch.length, 1);
});

test('normal book request without dedicated cache does not create it and goes directly to network', async () => {
  const current = createCache({ [BOOK_PATH]: new Response('stale current asset') });
  const { listeners, cacheMap, calls } = loadServiceWorker({
    cacheEntries: { [CACHE_NAME]: current },
    fetchImpl: async () => new Response('network asset')
  });

  const response = await dispatchFetch(listeners, new Request(`${APP_ORIGIN}${BOOK_PATH}`));

  assert.equal(await response.text(), 'network asset');
  assert.deepEqual(calls.has, [OFFLINE_CACHE_NAME]);
  assert.equal(calls.opened.includes(OFFLINE_CACHE_NAME), false);
  assert.equal(cacheMap.has(OFFLINE_CACHE_NAME), false);
  assert.deepEqual(current.matchCalls, []);
  assert.deepEqual(current.putCalls, []);
  assert.equal(calls.fetch.length, 1);
});

test('non-book and invalid-book paths never inspect a BTI dedicated cache', async () => {
  const current = createCache({ '/images/logo.png': new Response('logo') });
  const { listeners, calls } = loadServiceWorker({ cacheEntries: { [CACHE_NAME]: current } });

  await dispatchFetch(listeners, new Request(`${APP_ORIGIN}/images/logo.png`));
  await dispatchFetch(listeners, new Request(`${APP_ORIGIN}/books/Invalid_Book/asset.mp3`));

  assert.deepEqual(calls.has, []);
});

test('cross-origin requests retain the historical cache/network behavior', async () => {
  const current = createCache();
  const { listeners, calls } = loadServiceWorker({
    cacheEntries: { [CACHE_NAME]: current },
    fetchImpl: async () => new Response('remote asset')
  });
  const remoteUrl = 'https://cdn.example/books/narnia/asset.mp3';

  const response = await dispatchFetch(listeners, new Request(remoteUrl));

  assert.equal(await response.text(), 'remote asset');
  assert.deepEqual(calls.has, []);
  assert.deepEqual(current.matchCalls, [remoteUrl]);
  assert.equal(calls.fetch.length, 1);
  assert.deepEqual(current.putCalls, []);
});

test('book Range request builds a 206 response from the complete offline asset without current cache or network', async () => {
  const completeAsset = new Response(Uint8Array.from([0, 1, 2, 3, 4, 5]), {
    headers: { 'Content-Type': 'audio/ogg' }
  });
  const offline = createCache({ [BOOK_PATH]: completeAsset });
  const current = createCache({ [BOOK_PATH]: new Response('wrong source') });
  const { listeners, calls } = loadServiceWorker({
    cacheEntries: { [CACHE_NAME]: current, [OFFLINE_CACHE_NAME]: offline }
  });
  const request = new Request(`${APP_ORIGIN}${BOOK_PATH}`, { headers: { Range: 'bytes=1-3' } });

  const response = await dispatchFetch(listeners, request);

  assert.equal(response.status, 206);
  assert.equal(response.headers.get('Content-Range'), 'bytes 1-3/6');
  assert.equal(response.headers.get('Accept-Ranges'), 'bytes');
  assert.equal(response.headers.get('Content-Length'), '3');
  assert.equal(response.headers.get('Content-Type'), 'audio/ogg');
  assert.deepEqual([...new Uint8Array(await response.arrayBuffer())], [1, 2, 3]);
  assert.deepEqual(current.matchCalls, []);
  assert.deepEqual(current.putCalls, []);
  assert.equal(calls.fetch.length, 0);
});

test('book Range request with dedicated miss uses network and never reads or writes current cache', async () => {
  const offline = createCache();
  const current = createCache({ [BOOK_PATH]: new Response('stale current asset') });
  const { listeners, calls } = loadServiceWorker({
    cacheEntries: { [CACHE_NAME]: current, [OFFLINE_CACHE_NAME]: offline },
    fetchImpl: async () => new Response(Uint8Array.from([10, 11, 12, 13]), {
      headers: { 'Content-Type': 'audio/mpeg' }
    })
  });
  const request = new Request(`${APP_ORIGIN}${BOOK_PATH}`, { headers: { Range: 'bytes=2-' } });

  const response = await dispatchFetch(listeners, request);

  assert.equal(response.status, 206);
  assert.equal(response.headers.get('Content-Range'), 'bytes 2-3/4');
  assert.equal(response.headers.get('Content-Length'), '2');
  assert.deepEqual(offline.matchCalls, [BOOK_PATH]);
  assert.deepEqual(current.matchCalls, []);
  assert.deepEqual(current.putCalls, []);
  assert.equal(calls.fetch.length, 1);
});

test('non-book Range request preserves current-cache then network fallback', async () => {
  const pathName = '/audios/general.mp3';
  const current = createCache();
  const { listeners, calls } = loadServiceWorker({
    cacheEntries: { [CACHE_NAME]: current },
    fetchImpl: async () => new Response(Uint8Array.from([20, 21, 22, 23]), {
      headers: { 'Content-Type': 'audio/mpeg' }
    })
  });
  const request = new Request(`${APP_ORIGIN}${pathName}`, { headers: { Range: 'bytes=1-2' } });

  const response = await dispatchFetch(listeners, request);

  assert.equal(response.status, 206);
  assert.equal(response.headers.get('Content-Range'), 'bytes 1-2/4');
  assert.deepEqual(current.matchCalls, [pathName]);
  assert.deepEqual(current.putCalls, [pathName]);
  assert.equal(calls.fetch.length, 1);
});
