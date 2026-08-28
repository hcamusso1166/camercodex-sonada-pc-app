const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const preparationApi = require('../js/rutinas/bookTestImposibleV2OfflinePreparation.js');

const book = { bookId: 'libro-de-prueba' };
const runtimeManifest = { synthetic: true };
const plan = {
  schemaVersion: 1,
  profile: 'bti-offline-plan-v1',
  bookId: book.bookId,
  urls: ['/books/libro-de-prueba/runtime-manifest.json', '/books/libro-de-prueba/audio.mp3'],
};
const materialization = {
  schemaVersion: 1,
  profile: 'bti-offline-materialization-v1',
  bookId: book.bookId,
  cacheName: 'camer-codex-bti-offline-v1-libro-de-prueba',
  plannedCount: 2,
  downloadedCount: 2,
  verifiedCount: 2,
  ready: true,
};

function createHarness(overrides = {}) {
  const calls = { build: [], materialize: [] };
  const buildBookOfflinePlan = (receivedBook, receivedManifest) => {
    calls.build.push([receivedBook, receivedManifest]);
    if (overrides.planError) throw overrides.planError;
    return plan;
  };
  const materializer = {
    async materialize(receivedPlan, onProgress) {
      calls.materialize.push([receivedPlan, onProgress]);
      if (overrides.materializerError) throw overrides.materializerError;
      return overrides.result || materialization;
    },
  };
  const service = preparationApi.createOfflinePreparationService({ buildBookOfflinePlan, materializer });
  return { calls, service };
}

test('construye un plan, materializa exactamente ese plan y devuelve el resultado V1', async () => {
  const { calls, service } = createHarness();
  const result = await service.prepare(book, runtimeManifest);

  assert.deepEqual(calls.build, [[book, runtimeManifest]]);
  assert.equal(calls.materialize.length, 1);
  assert.equal(calls.materialize[0][0], plan);
  assert.equal(calls.materialize[0][1], undefined);
  assert.deepEqual(result, { ...materialization, profile: 'bti-offline-preparation-v1' });
});

test('reenvía el callback de progreso al materializer', async () => {
  const { calls, service } = createHarness();
  const onProgress = () => {};

  await service.prepare(book, runtimeManifest, onProgress);

  assert.equal(calls.materialize.length, 1);
  assert.equal(calls.materialize[0][1], onProgress);
});

test('no reimplementa ni muta el plan generado', async () => {
  const frozenPlan = Object.freeze({ ...plan, urls: Object.freeze([...plan.urls]) });
  let receivedPlan;
  const service = preparationApi.createOfflinePreparationService({
    buildBookOfflinePlan: () => frozenPlan,
    materializer: {
      async materialize(value) {
        receivedPlan = value;
        return materialization;
      },
    },
  });

  await service.prepare(book, runtimeManifest);
  assert.equal(receivedPlan, frozenPlan);
  assert.deepEqual(frozenPlan, plan);
});

test('propaga el fallo del plan builder sin llamar al materializer', async () => {
  const error = new Error('plan falló');
  const { calls, service } = createHarness({ planError: error });
  await assert.rejects(service.prepare(book, runtimeManifest), error);
  assert.deepEqual(calls.materialize, []);
});

test('propaga el fallo del materializer', async () => {
  const error = new Error('materialización falló');
  const { service } = createHarness({ materializerError: error });
  await assert.rejects(service.prepare(book, runtimeManifest), error);
});

for (const scenario of [
  { name: 'bookId incorrecto', result: { ...materialization, bookId: 'otro-libro' } },
  { name: 'cacheName incorrecto', result: { ...materialization, cacheName: 'otro-cache' } },
  { name: 'plannedCount incorrecto', result: { ...materialization, plannedCount: 1 } },
  { name: 'downloadedCount incorrecto', result: { ...materialization, downloadedCount: 1 } },
  { name: 'verifiedCount incorrecto', result: { ...materialization, verifiedCount: 1 } },
  { name: 'ready distinto de true', result: { ...materialization, ready: false } },
  { name: 'schemaVersion incorrecto', result: { ...materialization, schemaVersion: 2 } },
  { name: 'profile incorrecto', result: { ...materialization, profile: 'otro-profile' } },
]) {
  test(`rechaza un resultado incoherente: ${scenario.name}`, async () => {
    const { service } = createHarness({ result: scenario.result });
    await assert.rejects(
      service.prepare(book, runtimeManifest),
      /Offline preparation: resultado de materialización incoherente\./,
    );
  });
}

test('la API pública CommonJS y browser es determinista', () => {
  assert.deepEqual(Object.keys(preparationApi), ['createOfflinePreparationService']);
  assert.deepEqual(
    Object.keys(preparationApi.createOfflinePreparationService({
      buildBookOfflinePlan: () => plan,
      materializer: { materialize: async () => materialization },
    })),
    ['prepare'],
  );

  const source = fs.readFileSync(
    path.join(__dirname, '../js/rutinas/bookTestImposibleV2OfflinePreparation.js'),
    'utf8',
  );
  const window = {
    BookTestImposibleV2OfflinePlan: { buildBookOfflinePlan: () => plan },
    BookTestImposibleV2OfflineAssets: {
      createOfflineAssetMaterializer: () => ({ materialize: async () => materialization }),
    },
  };
  vm.runInNewContext(source, { window });

  assert.deepEqual(
    Object.keys(window.BookTestImposibleV2OfflinePreparation),
    ['createOfflinePreparationService'],
  );
  assert.deepEqual(
    Object.keys(window.BookTestImposibleV2OfflinePreparation.createOfflinePreparationService()),
    ['prepare'],
  );
});
