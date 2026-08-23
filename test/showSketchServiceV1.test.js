const test = require('node:test');
const assert = require('node:assert/strict');
const { createShowSketchService } = require('../js/showSketchServiceV1.js');
const { buildShowSketchPacket } = require('../js/showSketchWireV1.js');

const goldenRequest = {
  sequence: 3002,
  book: 'narnia-el-sobrino-del-mago',
  page: 11,
  image: 'image-001',
};

test('creates a service with a valid transport', () => {
  const service = createShowSketchService({ transport: { send() {} } });

  assert.equal(typeof service.sendShowSketch, 'function');
});

test('requires a transport with a send function', () => {
  for (const options of [{}, { transport: null }, { transport: {} }, { transport: { send: true } }]) {
    assert.throws(
      () => createShowSketchService(options),
      { name: 'TypeError', message: 'transport.send must be a function' }
    );
  }
});

test('sends the exact golden request packet once and returns the transport result', () => {
  const packets = [];
  const transportResult = { accepted: true };
  const service = createShowSketchService({
    transport: {
      send(packet) {
        packets.push(packet);
        return transportResult;
      },
    },
  });

  const result = service.sendShowSketch(goldenRequest);

  assert.equal(packets.length, 1);
  assert.ok(packets[0] instanceof Uint8Array);
  assert.equal(packets[0].length, 112);
  assert.deepEqual(packets[0], buildShowSketchPacket(goldenRequest));
  assert.strictEqual(result, transportResult);
});

test('does not call the transport when the Wire V1 builder rejects the request', () => {
  let sendCalls = 0;
  const service = createShowSketchService({
    transport: {
      send() {
        sendCalls += 1;
      },
    },
  });

  assert.throws(() => service.sendShowSketch({ ...goldenRequest, sequence: -1 }), RangeError);
  assert.equal(sendCalls, 0);
});

test('propagates the exact error thrown by the transport', () => {
  const transportError = new Error('transport unavailable');
  const service = createShowSketchService({
    transport: {
      send() {
        throw transportError;
      },
    },
  });

  assert.throws(() => service.sendShowSketch(goldenRequest), error => error === transportError);
});

test('sends each request once without generating or modifying sequence state', () => {
  const requests = [
    { ...goldenRequest, sequence: 7 },
    { ...goldenRequest, sequence: 0x12345678 },
  ];
  const packets = [];
  const service = createShowSketchService({
    transport: {
      send(packet) {
        packets.push(packet);
      },
    },
  });

  requests.forEach(request => service.sendShowSketch(request));

  assert.equal(packets.length, 2);
  assert.deepEqual(packets[0], buildShowSketchPacket(requests[0]));
  assert.deepEqual(packets[1], buildShowSketchPacket(requests[1]));
  assert.deepEqual(Array.from(packets, packet => new DataView(
    packet.buffer,
    packet.byteOffset,
    packet.byteLength
  ).getUint32(4, true)), [7, 0x12345678]);
});
