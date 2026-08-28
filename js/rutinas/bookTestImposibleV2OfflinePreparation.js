(function setupBookTestImposibleV2OfflinePreparation(global) {
  const defaultPlanApi = global.BookTestImposibleV2OfflinePlan
    || (typeof require === "function" ? require("./bookTestImposibleV2OfflinePlan.js") : null);
  const defaultAssetsApi = global.BookTestImposibleV2OfflineAssets
    || (typeof require === "function" ? require("./bookTestImposibleV2OfflineAssets.js") : null);

  function createOfflinePreparationService(options = {}) {
    const planApi = options.planApi || defaultPlanApi;
    const assetsApi = options.assetsApi || defaultAssetsApi;
    const buildBookOfflinePlan = options.buildBookOfflinePlan || planApi?.buildBookOfflinePlan;
    const materializer = options.materializer || assetsApi?.createOfflineAssetMaterializer({
      fetchImpl: options.fetchImpl,
      cacheStorage: options.cacheStorage,
    });

    if (typeof buildBookOfflinePlan !== "function") {
      throw new Error("Offline preparation: plan builder no disponible.");
    }
    if (!materializer || typeof materializer.materialize !== "function") {
      throw new Error("Offline preparation: materializer no disponible.");
    }

    async function prepare(book, runtimeManifest) {
      const plan = buildBookOfflinePlan(book, runtimeManifest);
      const result = await materializer.materialize(plan);
      const expectedCacheName = `camer-codex-bti-offline-v1-${plan.bookId}`;
      const expectedCount = plan.urls.length;

      if (!result || result.schemaVersion !== 1
        || result.profile !== "bti-offline-materialization-v1"
        || result.bookId !== plan.bookId
        || result.cacheName !== expectedCacheName
        || result.plannedCount !== expectedCount
        || result.downloadedCount !== expectedCount
        || result.verifiedCount !== expectedCount
        || result.ready !== true) {
        throw new Error("Offline preparation: resultado de materialización incoherente.");
      }

      return {
        schemaVersion: 1,
        profile: "bti-offline-preparation-v1",
        bookId: result.bookId,
        cacheName: result.cacheName,
        plannedCount: result.plannedCount,
        downloadedCount: result.downloadedCount,
        verifiedCount: result.verifiedCount,
        ready: true,
      };
    }

    return { prepare };
  }

  const api = { createOfflinePreparationService };
  global.BookTestImposibleV2OfflinePreparation = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})(typeof window !== "undefined" ? window : globalThis);
