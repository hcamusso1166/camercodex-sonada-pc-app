(function setupShowSketchWireV1(global) {
  "use strict";

  const PACKET_SIZE = 112;
  const CRC_INPUT_SIZE = 110;
  const BOOK_FIELD_SIZE = 64;
  const IMAGE_FIELD_SIZE = 32;

  const MAGIC_0 = 0x43;
  const MAGIC_1 = 0x53;
  const PROTOCOL_VERSION = 1;
  const SHOW_SKETCH_TYPE = 1;

  function validateInteger(name, value, maximum) {
    if (!Number.isInteger(value) || value < 0 || value > maximum) {
      throw new RangeError(`${name} must be an integer between 0 and ${maximum}`);
    }
  }

  function encodeIdentifier(name, value, fieldSize) {
    if (typeof value !== "string") {
      throw new TypeError(`${name} must be a string`);
    }

    const bytes = new TextEncoder().encode(value);
    if (bytes.length === 0 || bytes.length >= fieldSize) {
      throw new RangeError(`${name} must encode to between 1 and ${fieldSize - 1} UTF-8 bytes`);
    }
    return bytes;
  }

  function crc16CcittFalse(bytes) {
    let crc = 0xffff;

    for (const byte of bytes) {
      crc ^= byte << 8;
      for (let bit = 0; bit < 8; bit += 1) {
        crc = crc & 0x8000 ? (crc << 1) ^ 0x1021 : crc << 1;
        crc &= 0xffff;
      }
    }

    return crc;
  }

  function buildShowSketchPacket({ sequence, book, page, image }) {
    validateInteger("sequence", sequence, 0xffffffff);
    validateInteger("page", page, 0xffff);

    const bookBytes = encodeIdentifier("book", book, BOOK_FIELD_SIZE);
    const imageBytes = encodeIdentifier("image", image, IMAGE_FIELD_SIZE);
    const packet = new Uint8Array(PACKET_SIZE);
    const view = new DataView(packet.buffer, packet.byteOffset, packet.byteLength);

    packet[0] = MAGIC_0;
    packet[1] = MAGIC_1;
    packet[2] = PROTOCOL_VERSION;
    packet[3] = SHOW_SKETCH_TYPE;
    view.setUint32(4, sequence, true);
    view.setUint16(8, page, true);
    packet[10] = bookBytes.length;
    packet[11] = imageBytes.length;
    packet.set(bookBytes, 12);
    packet.set(imageBytes, 76);

    const crc = crc16CcittFalse(packet.subarray(0, CRC_INPUT_SIZE));
    view.setUint16(CRC_INPUT_SIZE, crc, true);
    return packet;
  }

  const api = {
    PACKET_SIZE,
    buildShowSketchPacket,
  };

  global.CamerShowSketchWireV1 = api;

  if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
  }
})(typeof window !== "undefined" ? window : globalThis);
