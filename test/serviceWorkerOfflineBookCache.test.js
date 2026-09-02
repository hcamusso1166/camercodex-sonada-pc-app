const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');

const SERVICE_WORKER_PATH = path.join(__dirname, '..', 'service-worker.js');
const SERVICE_WORKER_SOURCE = fs.readFileSync(SERVICE_WORKER_PATH, 'utf8');
const APP_ORIGIN = 'https://app.example';
const CACHE_NAME = 'camer-codex-cache-v15';
const BOOK_ID = 'narnia-el-sobrino-del-mago';
const OFFLINE_CACHE_NAME = `camer-codex-bti-offline-v1-${BOOK_ID}`;
const BOOK_PATH = `/books/${BOOK_ID}/audios/page-011/line-001.mp3`;

function createCache(initialEntries = {}) {
  const entries = new Map(Object.entries(initialEntries));
  return {
    matchCalls: [],
    putCalls: [],
    async match(key) {
      this.matchCalls.push(key);
      return entries.get(typeof key === 'string' ? key : key.url);
    },
    async put(key, value) {
      this.putCalls.push(key);
      entries.set(typeof key === 'string' ? key : key.url, value);
    },
    async add() {}
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

test('normal book request uses its existing offline cache before the current cache and network', async () => {
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
  assert.equal(calls.fetch.length, 0);
});

test('missing offline book cache is not created and goes directly to network', async () => {
  const current = createCache({ [BOOK_PATH]: new Response('current asset') });
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

test('offline cache miss goes directly to network without reading or writing current cache', async () => {
  const offline = createCache();
  const current = createCache();
  const { listeners, calls } = loadServiceWorker({
    cacheEntries: { [CACHE_NAME]: current, [OFFLINE_CACHE_NAME]: offline },
    fetchImpl: async () => new Response('network asset')
  });

  const response = await dispatchFetch(listeners, new Request(`${APP_ORIGIN}${BOOK_PATH}`));

  assert.equal(await response.text(), 'network asset');
  assert.deepEqual(offline.matchCalls, [BOOK_PATH]);
  assert.deepEqual(current.matchCalls, []);
  assert.equal(calls.fetch.length, 1);
  assert.deepEqual(current.putCalls, []);
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

test('book Range request builds a 206 response from the complete offline asset without network', async () => {
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
  assert.equal(calls.fetch.length, 0);
});

test('book Range request without an offline asset uses network without current-cache read or write', async () => {
  const offline = createCache();
  const current = createCache();
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

test('non-book Range requests preserve the historical current-cache behavior', async () => {
  const assetPath = '/audios/general.mp3';
  const current = createCache({
    [assetPath]: new Response(Uint8Array.from([20, 21, 22, 23]), {
      headers: { 'Content-Type': 'audio/mpeg' }
    })
  });
  const { listeners, calls } = loadServiceWorker({ cacheEntries: { [CACHE_NAME]: current } });
  const request = new Request(`${APP_ORIGIN}${assetPath}`, { headers: { Range: 'bytes=1-2' } });

  const response = await dispatchFetch(listeners, request);

  assert.equal(response.status, 206);
  assert.deepEqual([...new Uint8Array(await response.arrayBuffer())], [21, 22]);
  assert.deepEqual(current.matchCalls, [assetPath]);
  assert.deepEqual(current.putCalls, []);
  assert.deepEqual(calls.has, []);
  assert.equal(calls.fetch.length, 0);
});
