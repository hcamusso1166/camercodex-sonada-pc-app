(function setupBookTestImposibleV2OfflineAssets(global) {
  const PLAN_PROFILE = "bti-offline-plan-v1";
  const RESULT_PROFILE = "bti-offline-materialization-v1";
  const BOOK_ID_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

  function validatePlan(plan) {
    if (!plan || plan.schemaVersion !== 1) {
      throw new Error("Offline assets: schemaVersion inválido.");
    }
    if (plan.profile !== PLAN_PROFILE) {
      throw new Error("Offline assets: profile inválido.");
    }
    if (typeof plan.bookId !== "string" || !BOOK_ID_PATTERN.test(plan.bookId)) {
      throw new Error("Offline assets: bookId inválido.");
    }
    if (!Array.isArray(plan.urls) || plan.urls.length === 0
      || plan.urls.some(url => typeof url !== "string" || !url)) {
      throw new Error("Offline assets: urls debe ser un Array no vacío de strings.");
    }

    const root = `/books/${plan.bookId}/`;
    const seen = new Set();
    for (const url of plan.urls) {
      let decoded;
      try {
        decoded = decodeURIComponent(url);
      } catch (_) {
        throw new Error(`Offline assets: URL inválida: ${url}`);
      }
      const parsed = new URL(url, "https://offline.invalid");
      if (!url.startsWith(root) || url.includes("\\") || parsed.origin !== "https://offline.invalid"
        || parsed.pathname !== url || parsed.search || parsed.hash
        || decoded.includes("\\") || decoded.split("/").some(segment => segment === "." || segment === "..")
        || /%(?:2e|2f|3f|23|5c)/i.test(url)) {
        throw new Error(`Offline assets: URL fuera del root del libro o inválida: ${url}`);
      }
      if (seen.has(url)) {
        throw new Error(`Offline assets: URL duplicada: ${url}`);
      }
      seen.add(url);
    }
  }

  function createOfflineAssetMaterializer(options = {}) {
    const fetchImpl = options.fetchImpl || (typeof global.fetch === "function" && global.fetch.bind(global));
    const cacheStorage = options.cacheStorage || global.caches;

    async function materialize(plan) {
      validatePlan(plan);
      if (typeof fetchImpl !== "function") {
        throw new Error("Offline assets: fetch no disponible.");
      }
      if (!cacheStorage || typeof cacheStorage.delete !== "function"
        || typeof cacheStorage.open !== "function") {
        throw new Error("Offline assets: Cache Storage no disponible.");
      }

      const cacheName = `camer-codex-bti-offline-v1-${plan.bookId}`;
      try {
        await cacheStorage.delete(cacheName);
        const cache = await cacheStorage.open(cacheName);

        for (const url of plan.urls) {
          let response;
          try {
            response = await fetchImpl(url);
          } catch (error) {
            throw new Error(`Offline assets: fetch falló para ${url}: ${error.message}`);
          }
          if (!response || response.ok !== true) {
            throw new Error(`Offline assets: respuesta HTTP no OK para ${url}.`);
          }
          try {
            await cache.put(url, response);
          } catch (error) {
            throw new Error(`Offline assets: cache.put falló para ${url}: ${error.message}`);
          }
        }

        for (const url of plan.urls) {
          let stored;
          try {
            stored = await cache.match(url);
          } catch (error) {
            throw new Error(`Offline assets: cache.match falló para ${url}: ${error.message}`);
          }
          if (!stored) {
            throw new Error(`Offline assets: asset ausente durante verificación: ${url}`);
          }
        }

        return {
          schemaVersion: 1,
          profile: RESULT_PROFILE,
          bookId: plan.bookId,
          cacheName,
          plannedCount: plan.urls.length,
          downloadedCount: plan.urls.length,
          verifiedCount: plan.urls.length,
          ready: true,
        };
      } catch (error) {
        try {
          await cacheStorage.delete(cacheName);
        } catch (_) {
          // Preserve the materialization error; the operation still never reports ready.
        }
        throw error;
      }
    }

    return { materialize };
  }

  const api = { createOfflineAssetMaterializer };
  global.BookTestImposibleV2OfflineAssets = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})(typeof window !== "undefined" ? window : globalThis);
