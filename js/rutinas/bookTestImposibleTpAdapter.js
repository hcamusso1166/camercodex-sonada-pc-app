(function setupBookTestImposibleTpAdapter(global) {
  const TP_DEVICE_NAME = "RutinaSonadaTP";
  const TP_SERVICE_UUID = "8f2f1000-3d7e-4b1c-9a5f-52a1f9c0a001";
  const TP_EVENT_CHARACTERISTIC_UUID = "8f2f1001-3d7e-4b1c-9a5f-52a1f9c0a001";

  const MSG_TYPES = {
    1: "SNAPSHOT",
    2: "BOOK",
    3: "SELECTION",
    4: "CLEARED",
  };

  const SOURCES = {
    0: "NONE",
    1: "ESPNOW",
    2: "SIM",
    3: "SERIAL",
  };

  class BookTestImposibleTpAdapter {
    constructor(handlers = {}) {
      this.handlers = {
        onLog: handlers.onLog || (() => {}),
        onEvent: handlers.onEvent || (() => {}),
        onDisconnected: handlers.onDisconnected || (() => {}),
      };
      this.device = null;
      this.server = null;
      this.characteristic = null;
      this.onCharacteristicValueChanged = this.onCharacteristicValueChanged.bind(this);
      this.onGattDisconnected = this.onGattDisconnected.bind(this);
    }



async connect() {
  if (!navigator.bluetooth) {
    throw new Error("Web Bluetooth no está disponible en este navegador.");
  }

  this.log("INFO", "Initializing Bluetooth...");

  try {
    this.device = await navigator.bluetooth.requestDevice({
      filters: [{ name: TP_DEVICE_NAME }],
      optionalServices: [TP_SERVICE_UUID],
    });
  } catch (error) {
    if (error?.name === "NotFoundError") {
      throw new Error("User cancelled the requestDevice() chooser.");
    }
    throw error;
  }

  this.log("INFO", `Device Selected: ${this.device?.name || "(sin nombre)"}`);

  this.device.addEventListener("gattserverdisconnected", this.onGattDisconnected);

  this.server = await this.device.gatt.connect();
  this.log("INFO", "Connected to GATT Server");

  const service = await this.server.getPrimaryService(TP_SERVICE_UUID);
  this.log("INFO", `Service discovered: ${service.uuid}`);

  this.characteristic = await service.getCharacteristic(TP_EVENT_CHARACTERISTIC_UUID);
  this.log("INFO", `Característica TP descubierta: ${this.characteristic.uuid}`);

  const snapshot = await this.characteristic.readValue();
  const parsedSnapshot = parseTpBleEventV1(snapshot);
  this.log(
    "INFO",
    `Snapshot inicial leído (tpSeq=${parsedSnapshot.tpSeq}, msgType=${parsedSnapshot.msgTypeName}).`
  );
  this.handlers.onEvent(parsedSnapshot);

  this.characteristic.addEventListener(
    "characteristicvaluechanged",
    this.onCharacteristicValueChanged
  );

  await this.characteristic.startNotifications();
  this.log("INFO", "Notificaciones TP iniciadas.");
}

    async disconnect() {
      if (this.characteristic) {
        this.characteristic.removeEventListener("characteristicvaluechanged", this.onCharacteristicValueChanged);
      }

      if (this.device) {
        this.device.removeEventListener("gattserverdisconnected", this.onGattDisconnected);
      }

      if (this.device?.gatt?.connected) {
        this.device.gatt.disconnect();
      }

      this.characteristic = null;
      this.server = null;
      this.device = null;
    }

    onCharacteristicValueChanged(event) {
      try {
        const parsed = parseTpBleEventV1(event.target.value);
        this.log("INFO", `Payload TP recibido: ${JSON.stringify({ tpSeq: parsed.tpSeq, msgType: parsed.msgTypeName, bookCode: parsed.bookCode, page: parsed.page, line: parsed.line, source: parsed.sourceName })}`);
        this.handlers.onEvent(parsed);
      } catch (error) {
        this.log("ERROR", `Error parseando payload BLE: ${error.message}`);
      }
    }

    onGattDisconnected() {
      this.log("WARN", "Dispositivo TP desconectado.");
      this.handlers.onDisconnected();
    }

    log(level, message) {
      this.handlers.onLog(level, "BLE", message);
    }
  }

  function parseTpBleEventV1(value) {
    const view = value instanceof DataView ? value : new DataView(value.buffer, value.byteOffset, value.byteLength);

    if (view.byteLength !== 20) {
      throw new Error(`Payload TP inválido: se esperaban 20 bytes y llegaron ${view.byteLength}.`);
    }

    const decoder = new TextDecoder("utf-8");
    const bookCodeBytes = new Uint8Array(view.buffer, view.byteOffset + 4, 4);

    const event = {
      version: view.getUint8(0),
      msgType: view.getUint8(1),
      tpSeq: view.getUint16(2, true),
      bookCode: decoder.decode(bookCodeBytes).replace(/\u0000/g, "").trim(),
      page: view.getUint16(8, true),
      line: view.getUint8(10),
      source: view.getUint8(11),
      bookEventType: view.getUint8(12),
      bookAntennaId: view.getUint8(13),
      bookFlags: view.getUint8(14),
      bookSeq: view.getUint16(15, true),
      selectionSeq: view.getUint16(17, true),
      stateBitsRaw: view.getUint8(19),
    };

    event.msgTypeName = MSG_TYPES[event.msgType] || `UNKNOWN_${event.msgType}`;
    event.sourceName = SOURCES[event.source] || `UNKNOWN_${event.source}`;
    event.stateBits = {
      bookValid: (event.stateBitsRaw & 0b00001) !== 0,
      selectionValid: (event.stateBitsRaw & 0b00010) !== 0,
      simSelectionEnabled: (event.stateBitsRaw & 0b00100) !== 0,
      simAutoAdvance: (event.stateBitsRaw & 0b01000) !== 0,
      bleClientConnected: (event.stateBitsRaw & 0b10000) !== 0,
    };

    return event;
  }

  global.BookTestImposibleTpAdapter = BookTestImposibleTpAdapter;
  global.parseTpBleEventV1 = parseTpBleEventV1;
})(window);