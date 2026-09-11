const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const routineSource = fs.readFileSync(
  path.join(__dirname, '../js/rutinas/bookTestImposibleV2.js'),
  'utf8'
);

function loadDev() {
  const window = {};
  const document = {
    readyState: 'loading',
    addEventListener() {},
  };

  vm.runInNewContext(
    routineSource,
    {
      window,
      document,
      console,
    },
    {
      filename: 'bookTestImposibleV2.js',
    }
  );

  return window.bookTestImposibleV2Dev;
}

test('BTI V2 accepts Q5 zero-value card payloads', () => {
  const { normalizeQ5Value } = loadDev();

  assert.equal(normalizeQ5Value({ card: '00VV' }), 0);
  assert.equal(normalizeQ5Value({ valor: '00VV' }), 0);
  assert.equal(normalizeQ5Value({ mvalor: '00' }), 0);
});

test('BTI V2 preserves positive Q5 values and rejects nonnumeric payloads', () => {
  const { normalizeQ5Value } = loadDev();

  assert.equal(normalizeQ5Value({ card: '05VV' }), 5);
  assert.equal(normalizeQ5Value({ card: '20VV' }), 20);
  assert.equal(normalizeQ5Value({ card: 'VV' }), null);
});
