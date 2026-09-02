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
      calls.events.push(`put:${url}`);
      if (overrides.putError) throw overrides.putError;
      stored.set(url, response);
    },
    async match(url) {
      calls.match.push(url);
      calls.events.push(`match:${url}`);
      const count = (matchCounts.get(url) || 0) + 1;
      matchCounts.set(url, count);
      if (overrides.matchErrorUrl === url && (!overrides.matchErrorCall || overrides.matchErrorCall === count)) {
        throw overrides.matchError || new Error('match roto');
      }
      if (overrides.missingUrl === url && (!overrides.missingCall || overrides.missingCall === count)) return undefined;
      return stored.get(url);
    },
  };
  const cacheStorage = {
    async delete(name) { calls.delete.push(name); return true; },
    async open(name) { calls.open.push(name); return cache; },
  };
  const fetchImpl = async url => {
    calls.fetch.push(url);
    calls.events.push(`fetch:${url}`);
    if (overrides.fetchError) throw overrides.fetchError;
    return { ok: !overrides.httpError, url };
  };
  return {
    calls,
    materialize: createOfflineAssetMaterializer({ fetchImpl, cacheStorage }).materialize,
  };
}

test('reporta el avance real de descarga y verificación del plan', async () => {
  const { calls, materialize } = createHarness();
  const progress = [];

  await materialize(validPlan, update => {
    calls.events.push(`progress:${update.phase}:${update.completedCount}`);
    progress.push(update);
  });

  assert.deepEqual(progress, [
    { phase: 'downloading', completedCount: 0, totalCount: urls.length },
    { phase: 'downloading', completedCount: 1, totalCount: urls.length },
    { phase: 'downloading', completedCount: 2, totalCount: urls.length },
    { phase: 'verifying', completedCount: 0, totalCount: urls.length },
    { phase: 'verifying', completedCount: 1, totalCount: urls.length },
    { phase: 'verifying', completedCount: 2, totalCount: urls.length },
  ]);
  for (const [index, url] of urls.entries()) {
    const matchPosition = calls.events.indexOf(`match:${url}`);
    const progressPosition = calls.events.indexOf(`progress:downloading:${index + 1}`);
    assert.ok(matchPosition < progressPosition, `download progress for ${url} follows its immediate match`);
  }
});

test('descarga, almacena y verifica secuencialmente todo el plan antes de quedar ready', async () => {
  const { calls, materialize } = createHarness();
  const result = await materialize(validPlan);

  assert.deepEqual(calls.fetch, urls);
  assert.deepEqual(calls.put.map(([url]) => url), urls);
  assert.deepEqual(calls.match, [...urls, ...urls]);
  assert.deepEqual(calls.events.filter(event => !event.startsWith('fetch:')), [
    `put:${urls[0]}`, `match:${urls[0]}`,
    `put:${urls[1]}`, `match:${urls[1]}`,
    `match:${urls[0]}`, `match:${urls[1]}`,
  ]);
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

for (const scenario of [
  { name: 'respuesta HTTP no OK', overrides: { httpError: true }, error: /HTTP no OK.*runtime-manifest\.json/ },
  { name: 'fallo de fetch', overrides: { fetchError: new Error('sin red') }, error: /fetch falló.*runtime-manifest\.json/ },
  { name: 'fallo de cache.put', overrides: { putError: new Error('sin espacio') }, error: /cache\.put falló.*runtime-manifest\.json/ },
  { name: 'asset ausente después de put', overrides: { missingUrl: urls[1], missingCall: 1 }, error: /ausente después de cache\.put.*line-001_p1\.mp3/ },
  { name: 'excepción en match inmediato', overrides: { matchErrorUrl: urls[0], matchErrorCall: 1 }, error: /cache\.match inmediato falló.*runtime-manifest\.json/ },
  { name: 'asset desaparecido en verificación final', overrides: { missingUrl: urls[0], missingCall: 2 }, error: /ausente durante verificación.*runtime-manifest\.json/ },
]) {
  test(`${scenario.name} rechaza y elimina el cache incompleto`, async () => {
    const { calls, materialize } = createHarness(scenario.overrides);
    await assert.rejects(materialize(validPlan), scenario.error);
    assert.equal(calls.delete.at(-1), cacheName);
    assert.equal(calls.delete.length, 2);
    if (scenario.name === 'asset ausente después de put') {
      assert.deepEqual(calls.fetch, [urls[0], urls[1]]);
    }
  });
}

test('un match inmediato ausente detiene el plan antes del siguiente fetch', async () => {
  const { calls, materialize } = createHarness({ missingUrl: urls[0], missingCall: 1 });

  await assert.rejects(materialize(validPlan), /ausente después de cache\.put.*runtime-manifest\.json/);

  assert.deepEqual(calls.fetch, [urls[0]]);
  assert.deepEqual(calls.delete, [cacheName, cacheName]);
});

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
