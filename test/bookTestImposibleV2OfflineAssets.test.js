const test = require('node:test');
const assert = require('node:assert/strict');
const { createOfflineAssetMaterializer } = require('../js/rutinas/bookTestImposibleV2OfflineAssets.js');

const bookId = 'libro-de-prueba';
const cacheName = `camer-codex-bti-offline-v1-${bookId}`;
const urls = [
  `/books/${bookId}/runtime-manifest.json`,
  `/books/${bookId}/audios/page-001/line-001_p1.mp3`,
];
const validPlan = { schemaVersion: 1, profile: 'bti-offline-plan-v1', bookId, urls };

function createHarness(overrides = {}) {
  const calls = { fetch: [], put: [], match: [], delete: [], open: [], events: [] };
  const stored = new Map();
  const matchCounts = new Map();
  const cache = {
    async put(url, response) {
      calls.put.push([url, response]);
      calls.events.push(['put', url]);
      if (overrides.putError) throw overrides.putError;
      stored.set(url, response);
    },
    async match(url) {
      calls.match.push(url);
      calls.events.push(['match', url]);
      const count = (matchCounts.get(url) || 0) + 1;
      matchCounts.set(url, count);
      if (overrides.matchErrorUrl === url && count === 1) {
        throw overrides.matchError || new Error('match falló');
      }
      if (overrides.missingImmediateUrl === url && count === 1) return undefined;
      if (overrides.missingFinalUrl === url && count > 1) return undefined;
      return stored.get(url);
    },
  };
  const cacheStorage = {
    async delete(name) { calls.delete.push(name); return true; },
    async open(name) { calls.open.push(name); return cache; },
  };
  const fetchImpl = async url => {
    calls.fetch.push(url);
    calls.events.push(['fetch', url]);
    if (overrides.fetchError) throw overrides.fetchError;
    return { ok: !overrides.httpError, url };
  };
  return {
    calls,
    materialize: createOfflineAssetMaterializer({ fetchImpl, cacheStorage }).materialize,
  };
}

test('reporta el avance real de descarga sólo después del match inmediato y conserva la verificación final', async () => {
  const { calls, materialize } = createHarness();
  const progress = [];

  await materialize(validPlan, update => progress.push(update));

  assert.deepEqual(progress, [
    { phase: 'downloading', completedCount: 0, totalCount: urls.length },
    { phase: 'downloading', completedCount: 1, totalCount: urls.length },
    { phase: 'downloading', completedCount: 2, totalCount: urls.length },
    { phase: 'verifying', completedCount: 0, totalCount: urls.length },
    { phase: 'verifying', completedCount: 1, totalCount: urls.length },
    { phase: 'verifying', completedCount: 2, totalCount: urls.length },
  ]);
  assert.deepEqual(calls.events, [
    ['fetch', urls[0]], ['put', urls[0]], ['match', urls[0]],
    ['fetch', urls[1]], ['put', urls[1]], ['match', urls[1]],
    ['match', urls[0]], ['match', urls[1]],
  ]);
});

test('descarga, confirma persistencia inmediata y verifica secuencialmente todo el plan antes de quedar ready', async () => {
  const { calls, materialize } = createHarness();
  const result = await materialize(validPlan);

  assert.deepEqual(calls.fetch, urls);
  assert.deepEqual(calls.put.map(([url]) => url), urls);
  assert.deepEqual(calls.match, [...urls, ...urls]);
  assert.deepEqual(calls.open, [cacheName]);
  assert.deepEqual(calls.delete, [cacheName]);
  assert.deepEqual(result, {
    schemaVersion: 1,
    profile: 'bti-offline-materialization-v1',
    bookId,
    cacheName,
    plannedCount: 2,
    downloadedCount: 2,
    verifiedCount: 2,
    ready: true,
  });
});

test('asset ausente en match inmediato rechaza, limpia y no inicia el fetch siguiente', async () => {
  const { calls, materialize } = createHarness({ missingImmediateUrl: urls[0] });

  await assert.rejects(materialize(validPlan), /ausente inmediatamente.*runtime-manifest\.json/);

  assert.deepEqual(calls.fetch, [urls[0]]);
  assert.deepEqual(calls.put.map(([url]) => url), [urls[0]]);
  assert.deepEqual(calls.match, [urls[0]]);
  assert.equal(calls.delete.at(-1), cacheName);
  assert.equal(calls.delete.length, 2);
});

test('el progreso downloading no avanza cuando falla el match inmediato', async () => {
  const { materialize } = createHarness({ missingImmediateUrl: urls[0] });
  const progress = [];

  await assert.rejects(materialize(validPlan, update => progress.push(update)));

  assert.deepEqual(progress, [
    { phase: 'downloading', completedCount: 0, totalCount: urls.length },
  ]);
});

test('excepción en match inmediato rechaza, limpia y no inicia el fetch siguiente', async () => {
  const { calls, materialize } = createHarness({
    matchErrorUrl: urls[0],
    matchError: new Error('lectura imposible'),
  });

  await assert.rejects(materialize(validPlan), /cache\.match inmediato falló.*lectura imposible/);

  assert.deepEqual(calls.fetch, [urls[0]]);
  assert.deepEqual(calls.match, [urls[0]]);
  assert.equal(calls.delete.at(-1), cacheName);
  assert.equal(calls.delete.length, 2);
});

test('la verificación final detecta un asset que desaparece después del match inmediato', async () => {
  const { calls, materialize } = createHarness({ missingFinalUrl: urls[0] });

  await assert.rejects(materialize(validPlan), /ausente durante verificación.*runtime-manifest\.json/);

  assert.deepEqual(calls.fetch, urls);
  assert.deepEqual(calls.match, [...urls, urls[0]]);
  assert.equal(calls.delete.at(-1), cacheName);
  assert.equal(calls.delete.length, 2);
});

for (const scenario of [
  { name: 'respuesta HTTP no OK', overrides: { httpError: true }, error: /HTTP no OK.*runtime-manifest\.json/ },
  { name: 'fallo de fetch', overrides: { fetchError: new Error('sin red') }, error: /fetch falló.*runtime-manifest\.json/ },
  { name: 'fallo de cache.put', overrides: { putError: new Error('sin espacio') }, error: /cache\.put falló.*runtime-manifest\.json/ },
]) {
  test(`${scenario.name} rechaza y elimina el cache incompleto`, async () => {
    const { calls, materialize } = createHarness(scenario.overrides);
    await assert.rejects(materialize(validPlan), scenario.error);
    assert.equal(calls.delete.at(-1), cacheName);
    assert.equal(calls.delete.length, 2);
  });
}

for (const scenario of [
  { name: 'schemaVersion incorrecto', plan: { ...validPlan, schemaVersion: 2 }, error: /schemaVersion inválido/ },
  { name: 'profile incorrecto', plan: { ...validPlan, profile: 'otro' }, error: /profile inválido/ },
  { name: 'bookId inválido', plan: { ...validPlan, bookId: '../otro' }, error: /bookId inválido/ },
  { name: 'URL externa', plan: { ...validPlan, urls: ['https://example.com/asset.mp3'] }, error: /URL fuera del root/ },
  { name: 'URL fuera del root', plan: { ...validPlan, urls: ['/books/otro/asset.mp3'] }, error: /URL fuera del root/ },
  { name: 'traversal', plan: { ...validPlan, urls: [`/books/${bookId}/../otro.mp3`] }, error: /URL fuera del root/ },
  { name: 'querystring', plan: { ...validPlan, urls: [`/books/${bookId}/asset.mp3?v=1`] }, error: /URL fuera del root/ },
  { name: 'fragment', plan: { ...validPlan, urls: [`/books/${bookId}/asset.mp3#x`] }, error: /URL fuera del root/ },
  { name: 'backslash', plan: { ...validPlan, urls: [`/books/${bookId}/audio\\asset.mp3`] }, error: /URL fuera del root/ },
  { name: 'URLs duplicadas', plan: { ...validPlan, urls: [urls[0], urls[0]] }, error: /URL duplicada/ },
]) {
  test(`${scenario.name} se rechaza antes de efectuar I/O`, async () => {
    const { calls, materialize } = createHarness();
    await assert.rejects(materialize(scenario.plan), scenario.error);
    assert.deepEqual(calls, { fetch: [], put: [], match: [], delete: [], open: [], events: [] });
  });
}
