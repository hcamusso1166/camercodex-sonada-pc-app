const assert = require('node:assert/strict');
const fs = require('node:fs');
const test = require('node:test');
const vm = require('node:vm');

const MAIN_SOURCE = fs.readFileSync('js/main.js', 'utf8');

function extractFunction(source, name) {
  const start = source.indexOf(`async function ${name}(`);
  assert.notEqual(start, -1, `${name} must exist`);
  const bodyStart = source.indexOf('{', start);
  let depth = 0;
  for (let index = bodyStart; index < source.length; index += 1) {
    if (source[index] === '{') depth += 1;
    if (source[index] === '}') depth -= 1;
    if (depth === 0) return source.slice(start, index + 1);
  }
  throw new Error(`Could not extract ${name}`);
}

test('Actualizaciones preserves populated BTI offline caches and deletes obsolete caches', async () => {
  const entries = new Map([
    ['camer-codex-bti-offline-v1-narnia-el-sobrino-del-mago', new Map([['/books/narnia/audio.mp3', 'audio-data']])],
    ['camer-codex-cache-v14', new Map([['/old.js', 'old-data']])],
    ['otro-cache-viejo', new Map([['/legacy.js', 'legacy-data']])],
  ]);
  const deleted = [];
  const caches = {
    async keys() { return [...entries.keys()]; },
    async delete(name) {
      deleted.push(name);
      return entries.delete(name);
    },
  };
  const registrations = [{ unregister: async () => true }];
  const context = {
    caches,
    navigator: { serviceWorker: { getRegistrations: async () => registrations } },
    window: {
      caches,
      location: { pathname: '/actualizaciones', replace() {} },
    },
    localStorage: { setItem() {} },
    setCachedAppVersion() {},
    UPDATE_FEEDBACK_KEY: 'cc_update_feedback',
    Date,
  };
  const prefixDeclaration = MAIN_SOURCE.match(/const BTI_OFFLINE_CACHE_PREFIX = [^;]+;/)?.[0];
  assert.ok(prefixDeclaration, 'BTI offline cache prefix must be declared');
  vm.runInNewContext(`${prefixDeclaration}\n${extractFunction(MAIN_SOURCE, 'limpiarCacheYRecargar')}\nthis.runUpdate = limpiarCacheYRecargar;`, context);

  await context.runUpdate('test-version');

  const offlineCache = entries.get('camer-codex-bti-offline-v1-narnia-el-sobrino-del-mago');
  assert.ok(offlineCache);
  assert.equal(offlineCache.get('/books/narnia/audio.mp3'), 'audio-data');
  assert.deepEqual(deleted.sort(), ['camer-codex-cache-v14', 'otro-cache-viejo']);
  assert.deepEqual([...entries.keys()], ['camer-codex-bti-offline-v1-narnia-el-sobrino-del-mago']);
});
