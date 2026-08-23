(function setupShowSketchServiceV1(global) {
  "use strict";

  const wire = typeof module !== "undefined" && module.exports
    ? require("./showSketchWireV1.js")
    : global.CamerShowSketchWireV1;

  function createShowSketchService({ transport } = {}) {
    if (!transport || typeof transport.send !== "function") {
      throw new TypeError("transport.send must be a function");
    }

    return {
      sendShowSketch(request) {
        const packet = wire.buildShowSketchPacket(request);
        return transport.send(packet);
      },
    };
  }

  const api = {
    createShowSketchService,
  };

  global.CamerShowSketchServiceV1 = api;

  if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
  }
})(typeof window !== "undefined" ? window : globalThis);
