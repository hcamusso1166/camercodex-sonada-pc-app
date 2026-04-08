(function setupBookTestImposibleShowAudio(global) {
    /*TODO(audio-canonical): los futuros takes (title/author/line-XXX_p1..p3) deben generarse
      desde el SAY canónico de página y validarse por lineHash para alinear texto + audio.*/
  class BookTestImposibleShowAudio {
    constructor(options = {}) {
      this.onLog = options.onLog || (() => {});
      this.onStatus = options.onStatus || (() => {});
      this.audioEnabled = false;
      this.queue = [];
      this.lastBuiltQueue = [];
      this.currentAudio = null;
      this.playToken = 0;
      this.status = "listo";
      this.lastError = null;
    }

    enableFromUserGesture() {
      this.audioEnabled = true;
      this.setStatus("listo");
      this.log("INFO", "Audio habilitado por interacción de usuario.");
    }

    setQueue(queue, context = {}) {
      this.stop("Nueva cola de audio recibida.");
      this.queue = Array.isArray(queue)
        ? queue.map(item => this.normalizeQueueItem(item)).filter(Boolean)
        : [];
      this.lastBuiltQueue = this.queue.slice();
      const label = context.label ? ` (${context.label})` : "";
      this.log("INFO", `Cola de audio construida${label}: ${this.queue.length} item(s).`);
      const hasPlayableAudio = this.queue.some(item => item.type === "audio" && item.src);
      if (!hasPlayableAudio) {
        this.setStatus("error / asset faltante", "No hay assets reproducibles para esta selección.");
      } else {
        this.setStatus("listo");
      }
    }

    async playQueue() {
      if (!this.audioEnabled) {
        this.log("WARN", "Audio no habilitado aún. Se requiere click en 'Iniciar show / conectar TP'.");
        return;
      }
      if (!this.queue.length) {
        this.log("WARN", "No hay cola de audio para reproducir.");
        return;
      }

      const token = ++this.playToken;
      this.setStatus("reproduciendo");

      for (const item of this.queue) {
        if (token !== this.playToken) {
          return;
        }
        try {
          if (item.type === "pause") {
            await this.waitItem(item.ms, token);
          } else if (item.type === "audio") {
            await this.playItem(item, token);
          }
        } catch (error) {
          this.lastError = error;
          this.setStatus("error / asset faltante", error.message);
          this.log("ERROR", `Error reproduciendo '${item.label || item.src}': ${error.message}`);
          return;
        }
      }

      if (token === this.playToken) {
        this.currentAudio = null;
        this.setStatus("listo");
      }
    }

    async replay() {
      if (!this.lastBuiltQueue.length) {
        this.log("WARN", "Replay ignorado: todavía no hay cola construida.");
        return;
      }
      this.queue = this.lastBuiltQueue.slice();
      await this.playQueue();
    }

    stop(reason = "Audio detenido manualmente.") {
      this.playToken += 1;
      if (this.currentAudio) {
        this.currentAudio.pause();
        this.currentAudio.currentTime = 0;
        this.currentAudio = null;
      }
      if (reason) {
        this.log("INFO", reason);
      }
      this.setStatus("detenido");
    }

    normalizeQueueItem(item) {
      if (!item || typeof item !== "object") {
        return null;
      }

      if (item.type === "audio") {
        if (!item.src || typeof item.src !== "string") {
          return null;
        }
        return {
          type: "audio",
          src: item.src,
          label: item.label || item.src,
        };
      }

      if (item.type === "pause") {
        const ms = Number(item.ms);
        if (!Number.isFinite(ms) || ms < 0) {
          return null;
        }
        return {
          type: "pause",
          ms,
          label: item.label || `pause:${ms}ms`,
        };
      }

      if (!item.type && item.src && typeof item.src === "string") {
        return {
          type: "audio",
          src: item.src,
          label: item.label || item.src,
        };
      }

      return null;
    }

    waitItem(ms, token) {
      return new Promise(resolve => {
        const delay = Number.isFinite(ms) ? Math.max(0, ms) : 0;
        setTimeout(() => {
          if (token !== this.playToken) {
            resolve();
            return;
          }
          resolve();
        }, delay);
      });
    }
    
    playItem(item, token) {
      return new Promise((resolve, reject) => {
        const audio = new Audio(item.src);
        this.currentAudio = audio;

        const cleanup = () => {
          audio.removeEventListener("ended", onEnded);
          audio.removeEventListener("error", onError);
        };

        const onEnded = () => {
          cleanup();
          if (token === this.playToken) {
            this.currentAudio = null;
          }
          resolve();
        };

        const onError = () => {
          cleanup();
          reject(new Error(`No se pudo cargar audio en ${item.src}`));
        };

        audio.addEventListener("ended", onEnded);
        audio.addEventListener("error", onError);

        audio.play().catch(error => {
          cleanup();
          reject(error);
        });
      });
    }

    setStatus(status, detail = "") {
      this.status = status;
      this.onStatus(status, detail);
    }

    log(level, message) {
      this.onLog(level, "AUDIO", message);
    }
  }

  global.BookTestImposibleShowAudio = BookTestImposibleShowAudio;
})(window);