const test = require('node:test');
const assert = require('node:assert/strict');

const manifest = require('../books/narnia-el-leon-la-bruja-y-el-armario/runtime-manifest.json');
const books = require('../books/index.json');
const offlinePlan = require('../js/rutinas/bookTestImposibleV2OfflinePlan.js');
const offlinePreparation = require('../js/rutinas/bookTestImposibleV2OfflinePreparation.js');

const book = books.books.find(entry => entry.bookId === manifest.bookId);

test('el plan offline del libro 02 contiene exactamente todo su contrato runtime', async () => {
  const plan = offlinePlan.buildBookOfflinePlan(book, manifest);
  assert.equal(plan.urls.length, 14899);
  assert.equal(plan.urls[0], '/books/narnia-el-leon-la-bruja-y-el-armario/runtime-manifest.json');
  assert.ok(plan.urls.includes('/books/narnia-el-leon-la-bruja-y-el-armario/audios/_meta/title.mp3'));
  assert.ok(plan.urls.includes('/books/narnia-el-leon-la-bruja-y-el-armario/audios/_meta/author.mp3'));
  assert.equal(plan.urls.filter(url => url.includes('/images/')).length, 135);

  const expectedCount = plan.urls.length;
  const service = offlinePreparation.createOfflinePreparationService({
    buildBookOfflinePlan: () => plan,
    materializer: {
      async materialize() {
        return {
          schemaVersion: 1,
          profile: 'bti-offline-materialization-v1',
          bookId: book.bookId,
          cacheName: `camer-codex-bti-offline-v1-${book.bookId}`,
          plannedCount: expectedCount,
          downloadedCount: expectedCount,
          verifiedCount: expectedCount,
          ready: true,
        };
      },
    },
  });

  const result = await service.prepare(book, manifest);
  assert.equal(result.plannedCount, expectedCount);
  assert.equal(result.downloadedCount, expectedCount);
  assert.equal(result.verifiedCount, expectedCount);
  assert.equal(result.ready, true);
});
