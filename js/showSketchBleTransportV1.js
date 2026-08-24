(function setupShowSketchBleTransportV1(global) {
  "use strict";

  const PACKET_SIZE = 112;

  function createShowSketchBleTransport({ getWriteCharacteristic } = {}) {
    if (typeof getWriteCharacteristic !== "function") {
      throw new TypeError("getWriteCharacteristic must be a function");
    }

    return {
      async send(packet) {
        if (!(packet instanceof Uint8Array)) {
          throw new TypeError("packet must be a Uint8Array");
        }
        if (packet.length !== PACKET_SIZE) {
          throw new RangeError(`packet must contain exactly ${PACKET_SIZE} bytes`);
        }

        const characteristic = await getWriteCharacteristic();
        if (typeof characteristic?.writeValueWithResponse === "function") {
          return characteristic.writeValueWithResponse(packet);
        }
        if (typeof characteristic?.writeValue === "function") {
          return characteristic.writeValue(packet);
        }

        throw new TypeError("write characteristic does not support a compatible write method");
      },
    };
  }

  const api = {
    PACKET_SIZE,
    createShowSketchBleTransport,
  };

  global.CamerShowSketchBleTransportV1 = api;

  if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
  }
})(typeof window !== "undefined" ? window : globalThis);
