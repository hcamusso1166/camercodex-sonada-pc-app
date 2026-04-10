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
      this.lastStatusState = null;
      this.lastError = null;
      this.classicPacing = {
        PAUSE_SHORT_MS: 350,
        PAUSE_MEDIUM_MS: 700,
        PAUSE_LONG_MS: 1300,
        BETWEEN_TAKE_1_2_MS: 1200,
        BETWEEN_TAKE_2_3_MS: 1600,
      };
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
      this.log("INFO", `Queue cargada: ${this.queue.length} item(s)`);
      if (context.label) {
        this.log("INFO", `Contexto cola: ${context.label}`);
      }
      const hasPlayableAudio = this.queue.some(item => item.type === "audio" && item.src);
      if (hasPlayableAudio) {
        this.lastPlayableQueue = this.queue.map(item => ({ ...item }));
        this.emitStatus("ready", "Cola lista para reproducir.");
        return;
      }
      if (this.queue.length === 0 && ["BOOK_RESET", "CLEARED_RESET"].includes(context.label)) {
        this.emitStatus("idle", "Sin audio pendiente.");
        return;
      }
      this.emitStatus("error", "No hay assets reproducibles para esta selección.");
    }

    async playQueue(queueOverride = null) {
      if (Array.isArray(queueOverride)) {
        this.queue = queueOverride.map(item => this.normalizeQueueItem(item)).filter(Boolean);
      }
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
        this.log("INFO", `Reproduciendo item ${index + 1}/${this.queue.length}: ${item.label || item.src}`);
        if (typeof item.label === "string" && item.label.startsWith("Take ")) {
          this.log("INFO", `[AUDIO] ${item.label}`);
        }
        if (typeof item.label === "string" && item.label.startsWith("[AUDIO] Post-show ->")) {
          this.log("INFO", item.label);
        }
        if (Number.isInteger(item.takeIndex) && Number.isInteger(item.partIndex) && item.src) {
          this.log("INFO", `[AUDIO] Take ${item.takeIndex} / part ${item.partIndex} => ${item.src}`);
        }
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
        this.log("INFO", "Reproducción completada");
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
      this.log("INFO", "Replay solicitado por operador.");
      this.stop("Audio detenido para replay.", { emitStoppedState: true });
      await this.ensureStoppedState();
      await this.playQueue(this.lastPlayableQueue.map(item => ({ ...item })));
    }

    getClassicTakeUrls(bookId, page, line) {
      const pageSlug = this.pad3(page);
      const lineSlug = this.pad3(line);
      const base = `../books/${bookId}/audios/page-${pageSlug}`;

      if (page === 9 && line === 16) {
        this.log("INFO", "[AUDIO] Page 009 line 016 -> clásico extendido (p1+p2+p3+p4)");
        return {
          p1: `${base}/line-016_p1.mp3`,
          p2: `${base}/line-016_p2.mp3`,
          p3: `${base}/line-016_p3.mp3`,
          p4: `${base}/line-017_p1.mp3`,
        };
      }

      return {
        p1: `${base}/line-${lineSlug}_p1.mp3`,
        p2: `${base}/line-${lineSlug}_p2.mp3`,
        p3: `${base}/line-${lineSlug}_p3.mp3`,
      };
    }

    async playClassicLineAudio(bookId, page, line) {
      if (!Number.isInteger(page) || !Number.isInteger(line) || !bookId) {
        this.log("ERROR", `[AUDIO][ERROR] Parámetros inválidos para clásico (bookId=${bookId}, page=${page}, line=${line}).`);
        return;
      }

      if (page !== 9) {
        this.log("WARN", `[AUDIO] Clásico no implementado para page=${this.pad3(page)} todavía.`);
        return;
      }

      const effectiveLine = this.normalizeClassicLine(page, line);
      const takes = this.getClassicTakeUrls(bookId, page, effectiveLine);
      const queue = [
        ...this.buildClassicQueueFromTakes(takes),
        ...this.buildPostShowQueue(bookId, page, effectiveLine),
      ];
      this.resetClassicPlaybackState();
      this.setQueue(queue, { label: `classic:${bookId}:page-${this.pad3(page)}:line-${this.pad3(effectiveLine)}` });
      

      this.log("INFO", `[AUDIO] Preparando clásico page=${this.pad3(page)} line=${this.pad3(effectiveLine)}`);
      if (line !== effectiveLine) {
        this.log("INFO", `[AUDIO] Post-show anunciará line=${this.pad3(effectiveLine)} (requested=${this.pad3(line)} remapeado)`);
      }
      try {
        await this.playQueue();
        if (this.status === "completed") {
          this.log("INFO", "[AUDIO] Clásico finalizado");
        }
      } catch (error) {
        this.log("ERROR", `[AUDIO][ERROR] ${error.message}`);
        this.stop("Audio clásico abortado por error.");
      }
    }

    resetClassicPlaybackState() {
      this.playToken += 1;
      this.isPlaying = false;
      this.queue = [];
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
          // no-op: reset debe ser silencioso/idempotente
        }
        this.currentAudio = null;
      }
    }

    normalizeClassicLine(page, line) {
      if (page === 9 && line === 17) {
        this.log("INFO", "[AUDIO] Page 009 line 017 remapeada a 016");
        return 16;
      }
      return line;
    }

    buildClassicQueueFromTakes(takes) {
      const pacing = this.classicPacing;
      const hasP4 = Boolean(takes.p4);
      return [
        { type: "audio", src: takes.p1, label: "Take 1 / p1" },
        { type: "pause", ms: pacing.PAUSE_SHORT_MS, label: "pause:t1:p1-p2" },
        { type: "audio", src: takes.p2, label: "Take 1 / p2" },
        { type: "pause", ms: pacing.PAUSE_SHORT_MS, label: "pause:t1:p2-p3" },
        { type: "audio", src: takes.p3, label: "Take 1 / p3" },
        ...(hasP4
          ? [
            { type: "pause", ms: pacing.PAUSE_SHORT_MS, label: "pause:t1:p3-p4" },
            { type: "audio", src: takes.p4, label: "Take 1 / p4" },
          ]
          : []),
        { type: "pause", ms: pacing.BETWEEN_TAKE_1_2_MS, label: "pause:t1-t2" },
        { type: "audio", src: takes.p1, label: "Take 2 / p1" },
        { type: "pause", ms: pacing.PAUSE_MEDIUM_MS, label: "pause:t2:p1-p2" },
        { type: "audio", src: takes.p2, label: "Take 2 / p2" },
        { type: "pause", ms: pacing.PAUSE_MEDIUM_MS, label: "pause:t2:p2-p3" },
        { type: "audio", src: takes.p3, label: "Take 2 / p3" },
        ...(hasP4
          ? [
            { type: "pause", ms: pacing.PAUSE_MEDIUM_MS, label: "pause:t2:p3-p4" },
            { type: "audio", src: takes.p4, label: "Take 2 / p4" },
          ]
          : []),
        { type: "pause", ms: pacing.BETWEEN_TAKE_2_3_MS, label: "pause:t2-t3" },
        { type: "audio", src: takes.p1, label: "Take 3 / p1" },
        { type: "pause", ms: pacing.PAUSE_MEDIUM_MS, label: "pause:t3:p1-p2" },
        { type: "audio", src: takes.p2, label: "Take 3 / p2" },
        { type: "pause", ms: pacing.PAUSE_LONG_MS, label: "pause:t3:p2-p3" },
        { type: "audio", src: takes.p3, label: "Take 3 / p3" },
        ...(hasP4
          ? [
            { type: "audio", src: takes.p4, label: "Take 3 / p4" },
          ]
          : []),
      ];
    }

    buildPostShowQueue(bookId, page, line) {
      const pageSlug = this.pad3(page);
      const lineSlug = this.pad3(line);
      const titleSrc = `../books/${bookId}/audios/_meta/title.mp3`;
      const authorSrc = `../books/${bookId}/audios/_meta/author.mp3`;

      return [
        { type: "pause", ms: 750, label: "pause:classic-postshow" },
        { type: "audio", src: titleSrc, label: "[AUDIO] Post-show -> title" },
        { type: "pause", ms: 350, label: "pause:postshow-title-author" },
        { type: "audio", src: authorSrc, label: "[AUDIO] Post-show -> author" },
        { type: "pause", ms: 350, label: "pause:postshow-author-page" },
        { type: "audio", src: this.buildNumberAudioSrc(page), label: `[AUDIO] Post-show -> page ${pageSlug}` },
        { type: "pause", ms: 350, label: "pause:postshow-page-line" },
        { type: "audio", src: this.buildNumberAudioSrc(line), label: `[AUDIO] Post-show -> line ${lineSlug}` },
        { type: "pause", ms: 350, label: "pause:postshow-line-repeat-page" },
        { type: "audio", src: this.buildNumberAudioSrc(page), label: `[AUDIO] Post-show -> repeat page ${pageSlug}` },
        { type: "pause", ms: 350, label: "pause:postshow-repeat-page-line" },
        { type: "audio", src: this.buildNumberAudioSrc(line), label: `[AUDIO] Post-show -> repeat line ${lineSlug}` },
      ];
    }

    buildNumberAudioSrc(value) {
      return `../audios/suma/${Number(value)}.mp3`;
    }
    
    stop(reason = "Audio detenido manualmente.", options = {}) {
      const shouldForceStoppedState = options.emitStoppedState === true;
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
        this.log("INFO", reason);
      }
      this.emitStatus("stopped", reason || "Audio detenido.", {}, {
        forceTransitionLog: shouldForceStoppedState,
      });
    }

    async ensureStoppedState() {
      if (this.status === "stopped") {
        return;
      }
      await new Promise(resolve => setTimeout(resolve, 0));
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
          takeIndex: Number.isInteger(item.takeIndex) ? item.takeIndex : undefined,
          partIndex: Number.isInteger(item.partIndex) ? item.partIndex : undefined,
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
          takeIndex: Number.isInteger(item.takeIndex) ? item.takeIndex : undefined,
          partIndex: Number.isInteger(item.partIndex) ? item.partIndex : undefined,
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
          if (token === this.playToken) {
            this.currentAudio = null;
          }
          reject(new Error(`No se pudo cargar audio en ${item.src}`));
        };

        audio.addEventListener("ended", onEnded);
        audio.addEventListener("error", onError);

        audio.play().catch(error => {
          cleanup();
          if (token === this.playToken) {
            this.currentAudio = null;
          }
          reject(error);
        });
      });
    }

    pad3(value) {
      return String(value).padStart(3, "0");
    }

    emitStatus(state, message, extra = {}, options = {}) {
      this.status = state;
      if (this.lastStatusState !== state || options.forceTransitionLog === true) {
        this.log("INFO", `Estado => ${state}`);
        this.lastStatusState = state;
      }
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