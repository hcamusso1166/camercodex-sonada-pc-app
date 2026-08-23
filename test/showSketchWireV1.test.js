const test = require('node:test');
const assert = require('node:assert/strict');
const { buildShowSketchPacket } = require('../js/showSketchWireV1.js');

const goldenInput = {
  sequence: 3002,
  book: 'narnia-el-sobrino-del-mago',
  page: 11,
  image: 'image-001',
};

const goldenPacket = Uint8Array.from(Buffer.from(
  '43530101ba0b00000b001a096e61726e' +
  '69612d656c2d736f6272696e6f2d6465' +
  '6c2d6d61676f00000000000000000000' +
  '00000000000000000000000000000000' +
  '000000000000000000000000696d6167' +
  '652d3030310000000000000000000000' +
  '0000000000000000000000000000f98d',
  'hex'
));

test('builds the complete validated 112-byte golden packet', () => {
  const packet = buildShowSketchPacket(goldenInput);

  assert.ok(packet instanceof Uint8Array);
  assert.equal(packet.length, 112);
  assert.deepEqual(packet, goldenPacket);
  assert.deepEqual(packet.slice(110), Uint8Array.of(0xf9, 0x8d));
});

test('writes magic, protocol version, and command type', () => {
  assert.deepEqual(buildShowSketchPacket(goldenInput).slice(0, 4), Uint8Array.of(0x43, 0x53, 1, 1));
});

test('writes sequence and page explicitly in little-endian order', () => {
  const packet = buildShowSketchPacket({ ...goldenInput, sequence: 0x12345678, page: 0x9abc });

  assert.deepEqual(packet.slice(4, 8), Uint8Array.of(0x78, 0x56, 0x34, 0x12));
  assert.deepEqual(packet.slice(8, 10), Uint8Array.of(0xbc, 0x9a));
});

test('uses UTF-8 byte lengths for multibyte identifiers', () => {
  const packet = buildShowSketchPacket({ ...goldenInput, book: 'niño', image: 'áé' });

  assert.equal(packet[10], 5);
  assert.equal(packet[11], 4);
});

test('leaves book, image, and reserved padding zeroed', () => {
  const packet = buildShowSketchPacket({ ...goldenInput, book: 'b', image: 'i' });

  assert.ok(packet.slice(13, 76).every(byte => byte === 0));
  assert.ok(packet.slice(77, 108).every(byte => byte === 0));
  assert.deepEqual(packet.slice(108, 110), Uint8Array.of(0, 0));
});

test('rejects invalid sequence values', () => {
  for (const sequence of [-1, 0x100000000, 1.5, NaN]) {
    assert.throws(() => buildShowSketchPacket({ ...goldenInput, sequence }), RangeError);
  }
});

test('rejects invalid page values', () => {
  for (const page of [-1, 65536, 1.5, NaN]) {
    assert.throws(() => buildShowSketchPacket({ ...goldenInput, page }), RangeError);
  }
});

test('rejects empty or oversized UTF-8 book identifiers', () => {
  assert.throws(() => buildShowSketchPacket({ ...goldenInput, book: '' }), RangeError);
  assert.throws(() => buildShowSketchPacket({ ...goldenInput, book: 'á'.repeat(32) }), RangeError);
});

test('rejects empty or oversized UTF-8 image identifiers', () => {
  assert.throws(() => buildShowSketchPacket({ ...goldenInput, image: '' }), RangeError);
  assert.throws(() => buildShowSketchPacket({ ...goldenInput, image: 'á'.repeat(16) }), RangeError);
});
