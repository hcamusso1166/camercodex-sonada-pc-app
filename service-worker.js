const CACHE_NAME = 'camer-codex-cache-v15';
const BTI_OFFLINE_CACHE_PREFIX = 'camer-codex-bti-offline-v1-';
const MANIFEST_URL = '/cache-files.json';
const BOOKS_INDEX_PATH = '/books/index.json';
const PRECACHE_REVISION = 'bti-resolution-audios-v1';
//const CARTAS_URL = '/audios/cartas.json';

// Los archivos listados en cache-files.json se precargan durante la
// instalación. Cualquier otro recurso solicitado se añadirá al caché de
// forma dinámica a través del manejador `fetch`.

async function precache() {
  const cache = await caches.open(CACHE_NAME);
  try {
    const response = await fetch(MANIFEST_URL);
        if (!response.ok) {
      console.warn('[ServiceWorker] No se pudo obtener el manifiesto de caché:', response.status);
      return;
    }
    let files;
    try {
      files = await response.json();
    } catch (err) {
      console.warn('[ServiceWorker] Manifiesto de caché inválido:', err);
      return;
    }

    await Promise.all(files.map(async (path) => {
      if (typeof path === 'string' && path.startsWith('/books/') && path !== BOOKS_INDEX_PATH) {
        return;
      }
      try {
        await cache.add(path);
      } catch (err) {
        console.warn('[ServiceWorker] Failed to cache', path, err);
      }
    }));

    await cache.add(MANIFEST_URL);
/*
    try {
      const cartasResp = await fetch(CARTAS_URL);
      const cartas = await cartasResp.json();
      await cache.add(CARTAS_URL);
      const audios = Object.values(cartas).map(name => `/audios/${name}`);
      await Promise.all(audios.map(async (path) => {
        try {
          await cache.add(path);
        } catch (err) {
          console.warn('[ServiceWorker] Failed to cache', path, err);
        }
      }));
    } catch (err) {
      console.error('[ServiceWorker] Error caching audios:', err);
    }
*/
    console.log('[ServiceWorker] Precache complete');
  } catch (err) {
    console.warn('[ServiceWorker] Error caching files:', err);
  }
}

// Instalación del Service Worker y cacheo inicial de todos los recursos
self.addEventListener('install', (event) => {
  console.log('[ServiceWorker] Installing...', PRECACHE_REVISION);
  event.waitUntil(precache());
  self.skipWaiting();
});

// Activación y limpieza de cachés viejas
self.addEventListener('activate', (event) => {
  console.log('[ServiceWorker] Activating...');
    event.waitUntil((async () => {
    const keyList = await caches.keys();
    await Promise.all(keyList.map((key) => {
      if (key !== CACHE_NAME && !key.startsWith(BTI_OFFLINE_CACHE_PREFIX)) {
        console.log('[ServiceWorker] Removing old cache:', key);
        return caches.delete(key);
      }
    }));
    await self.clients.claim();
  })());
});

function getOfflineBookId(url) {
  if (url.origin !== self.location.origin) {
    return undefined;
  }
  const match = /^\/books\/([a-z0-9]+(?:-[a-z0-9]+)*)\//.exec(url.pathname);
  return match ? match[1] : undefined;
}

async function matchOfflineBookAsset(url, bookId = getOfflineBookId(url)) {
  if (!bookId) {
    return undefined;
  }

  const offlineCacheName = `${BTI_OFFLINE_CACHE_PREFIX}${bookId}`;
  if (!(await caches.has(offlineCacheName))) {
    return undefined;
  }

  const offlineCache = await caches.open(offlineCacheName);
  return offlineCache.match(url.pathname);
}

async function buildRangeResponse(response, rangeHeader) {
  const buffer = await response.arrayBuffer();
  const bytes = /bytes=(\d+)-(?:(\d+))?/.exec(rangeHeader);
  const start = Number(bytes[1]);
  const end = bytes[2] ? Number(bytes[2]) : buffer.byteLength - 1;
  const chunk = buffer.slice(start, end + 1);
  const headers = [
    ['Content-Range', `bytes ${start}-${end}/${buffer.byteLength}`],
    ['Accept-Ranges', 'bytes'],
    ['Content-Length', chunk.byteLength],
    ['Content-Type', response.headers.get('Content-Type') || 'audio/mpeg']
  ];

  return new Response(chunk, {
    status: 206,
    statusText: 'Partial Content',
    headers
  });
}

self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-cache') {
    event.waitUntil(precache());
  }
});

// Interceptar fetch y responder con caché si está disponible
self.addEventListener('fetch', (event) => {
const { request } = event;
  const rangeHeader = request.headers.get('range');

  const url = new URL(request.url);
  const isSameOrigin = url.origin === self.location.origin;
  const isInfoRoute = isSameOrigin && url.pathname.startsWith('/info/');
  const isBookRoute = isSameOrigin && url.pathname.startsWith('/books/');
  const isBooksIndex = isSameOrigin && url.pathname === BOOKS_INDEX_PATH;
  const isHtmlRequest =
    request.mode === 'navigate' ||
    (request.headers.get('accept') || '').includes('text/html');
  const offlineBookId = getOfflineBookId(url);

    if (isInfoRoute) {
    event.respondWith(fetch(request, { cache: 'no-store' }));
    return;
  }

  // Los recursos de libros se aíslan completamente del caché general.
  if (offlineBookId) {
    event.respondWith(
      (async () => {
        let response = await matchOfflineBookAsset(url, offlineBookId);
        if (!response) {
          response = rangeHeader ? await fetch(url.pathname) : await fetch(request);
        }
        if (rangeHeader) {
          return buildRangeResponse(response, rangeHeader);
        }
        return response;
      })()
    );
    return;
  }

  // books/index.json es metadata global del app-shell y debe estar disponible
  // para poder resolver el libro durante un cold start sin red.
  if (isBooksIndex) {
    event.respondWith(
      (async () => {
        const cache = await caches.open(CACHE_NAME);
        const cachedResponse = await cache.match(BOOKS_INDEX_PATH);
        if (cachedResponse) {
          return cachedResponse;
        }
        const networkResponse = await fetch(request);
        if (networkResponse.ok) {
          await cache.put(BOOKS_INDEX_PATH, networkResponse.clone());
        }
        return networkResponse;
      })()
    );
    return;
  }

  // Las demás rutas /books/ sin bookId válido quedan fuera del caché general.
  if (isBookRoute) {
    event.respondWith(fetch(request));
    return;
  }

  // Para HTML priorizamos red para evitar servir vistas obsoletas desde caché.
  if (isSameOrigin && isHtmlRequest) {
    event.respondWith(
      (async () => {
        const cache = await caches.open(CACHE_NAME);
        try {
          const networkResponse = await fetch(request);
          if (!url.pathname.startsWith('/info/')) {
            cache.put(url.pathname, networkResponse.clone());
          }
          return networkResponse;
        } catch (err) {
          return (await cache.match(url.pathname)) || cache.match('/index.html');
        }
      })()
    );
    return;
  }

  // Manejo de peticiones con Rangos (audio/video)
  if (rangeHeader) {
    const url = new URL(request.url);

    // Ignorar peticiones de otros orígenes
    if (url.origin !== self.location.origin) {
      event.respondWith(fetch(request));
      return;
    }

    event.respondWith(
      (async () => {
        const cache = await caches.open(CACHE_NAME);
        let response = await cache.match(url.pathname);

        if (!response) {
          const networkResponse = await fetch(url.pathname);
          await cache.put(url.pathname, networkResponse.clone());
          response = networkResponse;
        }

        return buildRangeResponse(response, rangeHeader);
      })()
    );
    return;
  }

    event.respondWith(
      (async () => {
      const cacheKey = isSameOrigin ? url.pathname : request.url;
      const cache = await caches.open(CACHE_NAME);
      const cachedResponse = await cache.match(cacheKey);
      if (cachedResponse) {
        return cachedResponse;
      }
      try {
        const networkResponse = await fetch(request);
        if (url.origin === self.location.origin && !url.pathname.startsWith('/info/')) {
          cache.put(cacheKey, networkResponse.clone());
        }
        return networkResponse;
      } catch (err) {
        return cache.match('/index.html');
      }
    })()
  );
});
