(function setupBookTestImposibleShowAudio(global) {
    /*TODO(audio-canonical): los futuros takes (title/author/line-XXX_p1..p3) deben generarse
      desde el SAY canónico de página y validarse por lineHash para alinear texto + audio.*/
  class BookTestImposibleShowAudio {
    constructor(options = {}) {
      this.onLog = options.onLog || (() => {});
      this.onStatus = options.onStatus || (() => {});
      this.audioEnabled = false;
      this.queue = [];
      this.lastPlayableQueue = [];
      this.currentAudio = null;
      this.currentTimeoutId = null;
      this.currentAudioCleanup = null;
      this.isPlaying = false;
      this.playToken = 0;
      this.status = "idle";
      this.lastError = null;
    }

    enableFromUserGesture() {
      this.audioEnabled = true;
      this.emitStatus("idle", "Audio habilitado por interacción de usuario.");
      this.log("INFO", "Audio habilitado por interacción de usuario.");
    }

    setQueue(queue, context = {}) {
      const normalizedQueue = Array.isArray(queue)
        ? queue.map(item => this.normalizeQueueItem(item)).filter(Boolean)
        : [];
      this.queue = normalizedQueue;
      const label = context.label ? ` (${context.label})` : "";
      this.log("INFO", `[AUDIO] Queue cargada${label}: ${this.queue.length} item(s)`);
      const hasPlayableAudio = this.queue.some(item => item.type === "audio" && item.src);
      if (hasPlayableAudio) {
        this.lastPlayableQueue = this.queue.map(item => ({ ...item }));
        this.emitStatus("ready", "Cola lista para reproducir.");
        return;
      }
      this.emitStatus("error", "No hay assets reproducibles para esta selección.");
    }

    async playQueue() {
      if (!this.audioEnabled) {
        this.log("WARN", "Audio no habilitado aún. Se requiere click en 'Iniciar show / conectar TP'.");
        return;
      }
      if (!this.queue.length) {
        this.log("WARN", "No hay cola de audio para reproducir.");
        this.emitStatus("error", "No hay assets reproducibles para esta selección.");
        return;
      }
      if (this.isPlaying || this.currentAudio || this.currentTimeoutId) {
        this.stop("Audio detenido para reiniciar reproducción.");
      }

      const token = ++this.playToken;
      this.isPlaying = true;
      this.emitStatus("playing", "Iniciando reproducción de cola.");

      for (let index = 0; index < this.queue.length; index += 1) {
        const item = this.queue[index];
        if (token !== this.playToken) {
          return;
        }

                this.emitStatus("playing", `Reproduciendo item ${index + 1}/${this.queue.length}: ${item.label || item.src}`, {
          currentIndex: index,
          currentLabel: item.label || item.src,
        });
        this.log("INFO", `[AUDIO] Reproduciendo item ${index + 1}/${this.queue.length}: ${item.label || item.src}`);

        try {
          if (item.type === "pause") {
            await this.waitItem(item.ms, token);
          } else if (item.type === "audio") {
            await this.playItem(item, token);
          }
        } catch (error) {
          this.lastError = error;
          this.isPlaying = false;
          this.emitStatus("error", error.message, {
            currentIndex: index,
            currentLabel: item.label || item.src,
          });
          this.log("ERROR", `Error reproduciendo '${item.label || item.src}': ${error.message}`);
          return;
        }
      }

      if (token === this.playToken) {
        this.isPlaying = false;
        this.currentAudio = null;
        this.log("INFO", "[AUDIO] Reproducción completada");
        this.emitStatus("completed", "Reproducción completada.", {
          currentIndex: this.queue.length - 1,
        });
      }
    }

    async replay() {
      if (!["ready", "completed", "stopped", "playing"].includes(this.status)) {
        this.log("WARN", "Replay ignorado: estado no permitido.");
        return;
      }
      if (!this.lastPlayableQueue.length) {
        this.emitStatus("error", "No hay reproducción previa disponible para Replay.");
        this.log("WARN", "Replay ignorado: todavía no hay cola reproducible previa.");
        return;
      }
      this.log("INFO", "[AUDIO] Replay solicitado por operador.");
      this.stop("Replay solicitado por operador.");
      this.queue = this.lastPlayableQueue.map(item => ({ ...item }));
      await this.playQueue();
    }

    stop(reason = "Audio detenido manualmente.") {
      this.playToken += 1;
            this.isPlaying = false;
      if (this.currentTimeoutId) {
        clearTimeout(this.currentTimeoutId);
        this.currentTimeoutId = null;
      }
      if (this.currentAudioCleanup) {
        this.currentAudioCleanup();
        this.currentAudioCleanup = null;
      }
      if (this.currentAudio) {
        try {
          this.currentAudio.pause();
          this.currentAudio.currentTime = 0;
        } catch (error) {
          // no-op: stop debe ser silencioso/idempotente
        }
        this.currentAudio = null;
      }
      if (reason) {
        this.log("INFO", `[AUDIO] ${reason}`);
      }
      this.emitStatus("stopped", reason || "Audio detenido.");
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
        this.currentTimeoutId = setTimeout(() => {
          this.currentTimeoutId = null;
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
          this.currentAudioCleanup = null;
        };
        this.currentAudioCleanup = cleanup;

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

    emitStatus(state, message, extra = {}) {
      this.status = state;
      this.log("INFO", `[AUDIO] Estado => ${state}`);
      this.onStatus({
        state,
        message,
        queueLength: this.queue.length,
        currentIndex: Number.isInteger(extra.currentIndex) ? extra.currentIndex : -1,
        currentLabel: extra.currentLabel,
      });
    }

    log(level, message) {
      this.onLog(level, "AUDIO", message);
    }
  }

  global.BookTestImposibleShowAudio = BookTestImposibleShowAudio;
})(window);