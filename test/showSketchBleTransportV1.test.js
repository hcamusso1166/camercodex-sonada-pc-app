const test = require('node:test');
const assert = require('node:assert/strict');
const { createShowSketchBleTransport } = require('../js/showSketchBleTransportV1.js');

function createPacket() {
  return Uint8Array.from({ length: 112 }, (_, index) => index);
}

test('writes one valid Uint8Array packet with response', async () => {
  const writes = [];
  const characteristic = {
    writeValueWithResponse(packet) {
      writes.push(packet);
      return Promise.resolve('written');
    },
  };
  const transport = createShowSketchBleTransport({
    getWriteCharacteristic: async () => characteristic,
  });
  const packet = createPacket();

  assert.equal(await transport.send(packet), 'written');
  assert.equal(writes.length, 1);
  assert.strictEqual(writes[0], packet);
  assert.deepEqual(writes[0], packet);
});

test('rejects packets shorter or longer than 112 bytes', async () => {
  const transport = createShowSketchBleTransport({ getWriteCharacteristic() {} });

  await assert.rejects(transport.send(new Uint8Array(111)), RangeError);
  await assert.rejects(transport.send(new Uint8Array(113)), RangeError);
});

test('rejects packet types other than Uint8Array', async () => {
  const transport = createShowSketchBleTransport({ getWriteCharacteristic() {} });

  await assert.rejects(transport.send(Array(112).fill(0)), TypeError);
  await assert.rejects(transport.send(new ArrayBuffer(112)), TypeError);
});

test('propagates a getWriteCharacteristic failure', async () => {
  const expectedError = new Error('Q5 is not connected');
  const transport = createShowSketchBleTransport({
    getWriteCharacteristic: async () => { throw expectedError; },
  });

  await assert.rejects(transport.send(createPacket()), error => error === expectedError);
});

test('propagates a writeValueWithResponse failure without retrying', async () => {
  const expectedError = new Error('BLE write failed');
  let writes = 0;
  const transport = createShowSketchBleTransport({
    getWriteCharacteristic: async () => ({
      writeValueWithResponse() {
        writes += 1;
        return Promise.reject(expectedError);
      },
      writeValue() {
        writes += 1;
      },
    }),
  });

  await assert.rejects(transport.send(createPacket()), error => error === expectedError);
  assert.equal(writes, 1);
});

test('falls back to one writeValue call when writeValueWithResponse is unavailable', async () => {
  const writes = [];
  const packet = createPacket();
  const transport = createShowSketchBleTransport({
    getWriteCharacteristic: async () => ({
      writeValue(value) {
        writes.push(value);
        return Promise.resolve('fallback written');
      },
    }),
  });

  assert.equal(await transport.send(packet), 'fallback written');
  assert.equal(writes.length, 1);
  assert.strictEqual(writes[0], packet);
});
