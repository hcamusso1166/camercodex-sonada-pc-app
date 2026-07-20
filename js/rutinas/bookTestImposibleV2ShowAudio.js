(function setupBookTestImposibleV2ShowAudio(global) {
  const BTI_V2_T1_AFTER_SELECTED_LINE_MS = 10000;
  const BTI_V2_T2_BETWEEN_FOLLOWUP_LINES_MS = 5000;
  const SHOW_DEV_FOLLOWUP_COUNT = 3;

    /*TODO(audio-canonical): los futuros takes (title/author/line-XXX_p1..p3) deben generarse
      desde el SAY canónico de página y validarse por lineHash para alinear texto + audio.*/
  class BookTestImposibleV2ShowAudio {
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
      this.auxiliaryQueueChain = Promise.resolve();
      this.classicPacing = {
        PAUSE_SHORT_MS: 350,
        PAUSE_MEDIUM_MS: 700,
        PAUSE_LONG_MS: 1300,
        BETWEEN_TAKE_1_2_MS: 1200,
        BETWEEN_TAKE_2_3_MS: 1600,
      };
    }

    resolveReadingContext(bookId, pageNumber, selectedLineNumber) {
      const ctx = {
        bookId,
        pageNumber,
        selectedLineNumber,
        playbackLineNumber: selectedLineNumber,
        tpStartLineNumber: selectedLineNumber,
        classicMode: "normal",
        lineAnnouncementMode: "single",
        lineAnnouncementNumbers: [selectedLineNumber],
      };

      const isSpecialBook = bookId === "narnia-el-sobrino-del-mago";
      const isSpecialPage9 = isSpecialBook && pageNumber === 9;

      if (isSpecialPage9 && selectedLineNumber === 16) {
        this.log("INFO", "[AUDIO] Caso especial contenido: Page 009 line 016 extendida con continuidad en 017.");
        ctx.playbackLineNumber = 16;
        ctx.tpStartLineNumber = 16;
        ctx.classicMode = "extend-next-line";
        ctx.lineAnnouncementMode = "single";
        ctx.lineAnnouncementNumbers = [16];
        return ctx;
      }

      if (isSpecialPage9 && selectedLineNumber === 17) {
        this.log("INFO", "[AUDIO] Caso especial contenido: Page 009 line 017 remapeada a bloque 016+continuidad.");
        ctx.playbackLineNumber = 16;
        ctx.tpStartLineNumber = 16;
        ctx.classicMode = "extend-next-line";
        ctx.lineAnnouncementMode = "pair";
        ctx.lineAnnouncementNumbers = [17, 16];
        return ctx;
      }

      return ctx;
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
        if (typeof item.label === "string" && item.label.startsWith("[AUDIO]")) {
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

    enqueueAuxiliaryQueue(queue, context = {}) {
      const normalizedQueue = Array.isArray(queue)
        ? queue.map(item => this.normalizeQueueItem(item)).filter(Boolean)
        : [];
      if (!normalizedQueue.length) {
        this.log("WARN", context.emptyMessage || "[BTI_V2] Detection audio queue is empty.");
        return this.auxiliaryQueueChain;
      }
      if (!this.audioEnabled) {
        this.log("WARN", "Audio no habilitado aún. Se requiere interacción de usuario para feedback de detección.");
        return this.auxiliaryQueueChain;
      }

      this.auxiliaryQueueChain = this.auxiliaryQueueChain
        .catch(() => {})
        .then(() => this.playAuxiliaryQueue(normalizedQueue, context));
      return this.auxiliaryQueueChain;
    }

    async playAuxiliaryQueue(queue, context = {}) {
      while (this.isPlaying || this.currentAudio || this.currentTimeoutId) {
        await new Promise(resolve => setTimeout(resolve, 50));
      }

      const token = ++this.playToken;
      this.isPlaying = true;
      this.emitStatus("playing", context.statusMessage || "Reproduciendo feedback de detección.");

      for (let index = 0; index < queue.length; index += 1) {
        if (token !== this.playToken) return;
        const item = queue[index];
        this.log("INFO", item.label || `Detection feedback ${index + 1}/${queue.length}`);
        try {
          if (item.type === "pause") {
            await this.waitItem(item.ms, token);
          } else if (item.type === "audio") {
            await this.playItem(item, token);
          }
        } catch (error) {
          this.lastError = error;
          this.log("WARN", `${context.errorPrefix || "[BTI_V2] Detection audio missing"}: ${item.label || item.src}`);
        }
      }

      if (token === this.playToken) {
        this.isPlaying = false;
        this.currentAudio = null;
        this.emitStatus("idle", context.completedMessage || "Feedback de detección finalizado.");
      }
    }

    getClassicTakeUrls(context) {
      const pageSlug = this.pad3(context.pageNumber);
      const lineSlug = this.pad3(context.playbackLineNumber);
      const base = `../books/${context.bookId}/audios/page-${pageSlug}`;

      if (context.classicMode === "extend-next-line") {
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

      const context = this.resolveReadingContext(bookId, page, line);
      const queue = this.buildInitialShowQueue(context);
      this.resetClassicPlaybackState();
      this.setQueue(queue, { label: `classic:${bookId}:page-${this.pad3(page)}:line-${this.pad3(context.playbackLineNumber)}` });
      

       this.log(
        "INFO",
        `[AUDIO] Preparando show-time general page=${this.pad3(page)} selectedLine=${this.pad3(line)} playbackLine=${this.pad3(context.playbackLineNumber)} mode=${context.classicMode}`
      );
      if (context.lineAnnouncementMode === "pair") {
        this.log("INFO", "[AUDIO] Post-show anunciará línea especial compuesta: 17 y 16.");
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

    async playShowDevSequence(params = {}) {
      const bookId = params.bookId;
      const page = Number(params.page);
      const line = Number(params.line);
      const pageLineCount = Number(params.pageLineCount);

      if (!bookId || !Number.isInteger(page) || !Number.isInteger(line) || line <= 0) {
        this.log("ERROR", `[AUDIO][ERROR] Parámetros inválidos para flujo show DEV (bookId=${bookId}, page=${params.page}, line=${params.line}).`);
        return;
      }

      if (!Number.isInteger(pageLineCount) || pageLineCount <= 0) {
        this.log("ERROR", `[AUDIO][ERROR] pageLineCount inválido para flujo show DEV (pageLineCount=${params.pageLineCount}).`);
        return;
      }

      if (line > pageLineCount) {
        this.log("ERROR", `[AUDIO][ERROR] Línea base fuera de rango para flujo show DEV: line=${line}, pageLineCount=${pageLineCount}.`);
        return;
      }

      this.log("INFO", "[AUDIO] Iniciando flujo show DEV encadenado");
      this.log("INFO", `[AUDIO] Línea base -> page=${this.pad3(page)} line=${this.pad3(line)}`);

      const initialContext = this.resolveReadingContext(bookId, page, line);
      const queue = [
        ...this.buildInitialShowQueue(initialContext),
      ];
      this.log("INFO", "[AUDIO] Post-show inicial completo");

      for (let offset = 1; offset <= SHOW_DEV_FOLLOWUP_COUNT; offset += 1) {
        const followUpQueue = this.buildFollowUpClassicQueue({
          bookId,
          page,
          baseLine: line,
          offset,
          pageLineCount,
        });

        if (!followUpQueue) {
          break;
        }

        const waitMs = offset === 1 ? BTI_V2_T1_AFTER_SELECTED_LINE_MS : BTI_V2_T2_BETWEEN_FOLLOWUP_LINES_MS;
        const waitLabel = offset === 1
          ? `[AUDIO] Espera T1 = ${BTI_V2_T1_AFTER_SELECTED_LINE_MS} ms`
          : `[AUDIO] Espera T2 = ${BTI_V2_T2_BETWEEN_FOLLOWUP_LINES_MS} ms`;
        this.log("INFO", waitLabel);
        queue.push({ type: "pause", ms: waitMs, label: waitLabel });
        queue.push(...followUpQueue);
      }

      this.resetClassicPlaybackState();
      this.setQueue(queue, { label: `show-dev:${bookId}:page-${this.pad3(page)}:line-${this.pad3(line)}` });

      try {
        await this.playQueue();
        if (this.status === "completed") {
          this.log("INFO", "[AUDIO] Fin flujo show DEV encadenado");
        }
      } catch (error) {
        this.log("ERROR", `[AUDIO][ERROR] ${error.message}`);
        this.stop("Flujo show DEV abortado por error.");
      }
    }

    buildInitialShowQueue(context) {
      const takes = this.getClassicTakeUrls(context);
      return [
        ...this.playClassicReadingThreeTakes(context, takes),
        ...this.buildPostShowQueue(context),
      ];
    }

    buildFollowUpClassicQueue({ bookId, page, baseLine, offset, pageLineCount }) {
      const targetLine = Number(baseLine) + Number(offset);
      if (!Number.isInteger(targetLine) || !Number.isInteger(pageLineCount) || targetLine > pageLineCount) {
        this.log("INFO", `[AUDIO] Follow-up +${offset} omitido por fuera de rango`);
        this.log("INFO", `[AUDIO] Follow-up +${offset} omitido: la página ${this.pad3(page)} no tiene línea ${targetLine}.`);
        return null;
      }

      this.log("INFO", `[AUDIO] Follow-up +${offset} -> line=${this.pad3(targetLine)}`);
      const context = this.resolveReadingContext(bookId, page, targetLine);
      const takes = this.getClassicTakeUrls(context);
      return this.playClassicReadingThreeTakes(context, takes);
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

    playClassicReadingThreeTakes(context, takes) {
      void context;
      return this.buildClassicQueueFromTakes(takes);
    }

    playClassicReadingTwoTakes(context, takes) {
      void context;
      const pacing = this.classicPacing;
      const hasP4 = Boolean(takes.p4);
      const buildTake = (takeNumber, pauseMs) => [
        { type: "audio", src: takes.p1, label: `Take ${takeNumber} / p1` },
        { type: "pause", ms: pauseMs, label: `pause:t${takeNumber}:p1-p2` },
        { type: "audio", src: takes.p2, label: `Take ${takeNumber} / p2` },
        { type: "pause", ms: pauseMs, label: `pause:t${takeNumber}:p2-p3` },
        { type: "audio", src: takes.p3, label: `Take ${takeNumber} / p3` },
        ...(hasP4
          ? [
            { type: "pause", ms: pauseMs, label: `pause:t${takeNumber}:p3-p4` },
            { type: "audio", src: takes.p4, label: `Take ${takeNumber} / p4` },
          ]
          : []),
      ];

      return [
        ...buildTake(1, pacing.PAUSE_SHORT_MS),
        { type: "pause", ms: pacing.BETWEEN_TAKE_1_2_MS, label: "pause:t1-t2" },
        ...buildTake(2, pacing.PAUSE_MEDIUM_MS),
      ];
    }

    buildResolutionBookPageLineOnceQueue(context) {
      const pageSlug = this.pad3(context.pageNumber);
      const lineSlug = this.pad3(context.playbackLineNumber);
      const lineAnnouncement = this.buildLineAnnouncement(context);
      return [
        { type: "audio", src: `../books/${context.bookId}/audios/_meta/title.mp3`, label: "[BTI_V2] Resolution -> title" },
        { type: "pause", ms: 350, label: "pause:resolution-title-page" },
        { type: "audio", src: "../audios/audios_especiales/pagina.mp3", label: "[BTI_V2] Resolution -> Página" },
        ...this.buildAudioItemsFromSources(this.buildNumberAudioSequence(context.pageNumber), `resolution:page:${pageSlug}`),
        { type: "pause", ms: 350, label: "pause:resolution-page-line" },
        { type: "audio", src: "../audios/audios_especiales/renglon.mp3", label: "[BTI_V2] Resolution -> Renglón" },
        ...this.buildAudioItemsFromSources(lineAnnouncement.sources, `resolution:line:${lineSlug}`),
      ];
    }

    buildPostShowQueue(context) {
      const pageSlug = this.pad3(context.pageNumber);
      const lineSlug = this.pad3(context.playbackLineNumber);
      const titleSrc = `../books/${context.bookId}/audios/_meta/title.mp3`;
      const authorSrc = `../books/${context.bookId}/audios/_meta/author.mp3`;
      const pageSequenceSources = this.buildNumberAudioSequence(context.pageNumber);
      const lineAnnouncement = this.buildLineAnnouncement(context);
      const lineSequenceSources = lineAnnouncement.sources;
      const pageSequenceLog = this.describeAnnouncementNumberSequence([context.pageNumber]);
      const lineSequenceLog = lineAnnouncement.log;

      return [
        { type: "pause", ms: 750, label: "pause:classic-postshow" },
        { type: "audio", src: titleSrc, label: "[AUDIO] Post-show -> title" },
        { type: "pause", ms: 350, label: "pause:postshow-title-author" },
        { type: "audio", src: authorSrc, label: "[AUDIO] Post-show -> author" },
        { type: "pause", ms: 350, label: "pause:postshow-author-page" },
        { type: "audio", src: "../audios/audios_especiales/pagina.mp3", label: "[AUDIO] Post-show -> Página" },
        { type: "pause", ms: 0, label: `[AUDIO] Post-show -> page sequence: ${pageSequenceLog}` },
        ...this.buildAudioItemsFromSources(pageSequenceSources, `postshow:page:${pageSlug}`),
        { type: "pause", ms: 350, label: "pause:postshow-page-line" },
        { type: "audio", src: "../audios/audios_especiales/renglon.mp3", label: "[AUDIO] Post-show -> Renglón" },
        { type: "pause", ms: 0, label: `[AUDIO] Post-show -> line sequence: ${lineSequenceLog}` },
        ...this.buildAudioItemsFromSources(lineSequenceSources, `postshow:line:${lineSlug}`),
        { type: "pause", ms: 350, label: "pause:postshow-line-repeat-page" },
        { type: "audio", src: "../audios/audios_especiales/pagina.mp3", label: "[AUDIO] Post-show -> repeat Página" },
        ...this.buildAudioItemsFromSources(pageSequenceSources, `postshow:repeat-page:${pageSlug}`),
        { type: "pause", ms: 350, label: "pause:postshow-repeat-page-line" },
        { type: "audio", src: "../audios/audios_especiales/renglon.mp3", label: "[AUDIO] Post-show -> repeat Renglón" },
        ...this.buildAudioItemsFromSources(lineSequenceSources, `postshow:repeat-line:${lineSlug}`),
      ];
    }

    buildDetectionBookTitleQueue(book) {
      const bookId = book?.bookId || book?.id;
      if (!bookId) return [];
      return [
        { type: "audio", src: `../books/${bookId}/audios/_meta/title.mp3`, label: "[BTI_V2] Detection audio: book title" },
      ];
    }

    buildDetectionSlotQueue(slotNumber) {
      const slot = Number(slotNumber);
      if (!Number.isInteger(slot)) return [];
      return [
        { type: "audio", src: "../audios/audios_especiales/slot.mp3", label: `[BTI_V2] Detection audio: Slot ${slot}` },
        { type: "pause", ms: 120, label: "pause:detection-slot-number" },
        ...this.buildAudioItemsFromSources(this.buildNumberAudioSequence(slot), `detection:slot:${slot}`),
      ];
    }

    buildDetectionPageLineQueue({ page, line } = {}) {
      if (!Number.isInteger(Number(page)) || !Number.isInteger(Number(line))) return [];
      return [
        { type: "audio", src: "../audios/audios_especiales/pagina.mp3", label: "[BTI_V2] Detection audio: Página" },
        ...this.buildAudioItemsFromSources(this.buildNumberAudioSequence(Number(page)), `detection:page:${page}`),
        { type: "pause", ms: 250, label: "pause:detection-page-line" },
        { type: "audio", src: "../audios/audios_especiales/renglon.mp3", label: "[BTI_V2] Detection audio: Renglón" },
        ...this.buildAudioItemsFromSources(this.buildNumberAudioSequence(Number(line)), `detection:line:${line}`),
      ];
    }

    buildAudioItemsFromSources(sources, labelPrefix) {
      return sources.map((src, index) => ({
        type: "audio",
        src,
        label: `${labelPrefix}:${index + 1}`,
      }));
    }

    buildLineAnnouncement(context) {
      if (context.lineAnnouncementMode === "single") {
        const [lineNumber] = context.lineAnnouncementNumbers;
        return {
          sources: this.buildAnnouncementNumberSources([lineNumber]),
          log: this.describeAnnouncementNumberSequence([lineNumber]),
        };
      }

      if (context.lineAnnouncementMode === "pair") {
        const [firstLine, secondLine] = context.lineAnnouncementNumbers;
        this.log("INFO", "[AUDIO] Anuncio final especial: Renglón 17 y 16");
      return {
        sources: [
          ...this.buildAnnouncementNumberSources([firstLine]),
          "../audios/poker/y.mp3",
          ...this.buildAnnouncementNumberSources([secondLine]),
        ],
        log: `${firstLine} + y + ${secondLine}`,
      };
    }

    const fallbackLine = Number(context.playbackLineNumber) || 0;
      return {
        sources: this.buildAnnouncementNumberSources([fallbackLine]),
        log: this.describeAnnouncementNumberSequence([fallbackLine]),
      };
    }
    
    describeAnnouncementNumberSequence(values) {
      const tokens = values.flatMap(value => this.buildNumberAudioTokens(value));
      return tokens.join(" + ");
    }

    buildAnnouncementNumberSources(values) {
      return values.flatMap(value => this.buildNumberAudioSequence(value));
    }

    buildNumberAudioSequence(value) {
      const tokens = this.buildNumberAudioTokens(value);
      return tokens.map(token => `../audios/suma/${token}.mp3`);
    }

    buildNumberAudioTokens(value) {
      const number = Number(value);
      if (!Number.isInteger(number) || number < 0) {
        return ["0"];
      }

      if (number <= 15) {
        return [String(number)];
      }

      if (number < 20) {
        return ["10", `y${number - 10}`];
      }

      if (number < 100) {
        const tens = Math.floor(number / 10) * 10;
        const units = number % 10;
        return units === 0
          ? [String(tens)]
          : [String(tens), `y${units}`];
      }

      if (number === 100) {
        return ["100"];
      }

      if (number < 200) {
        const remainder = number % 100;
        return remainder === 0
          ? ["100"]
          : ["ciento", ...this.buildNumberAudioTokens(remainder)];
      }
      if (number < 300) {
        const remainder = number % 100;
        return remainder === 0
          ? ["200"]
          : ["200", ...this.buildNumberAudioTokens(remainder)];
      }
      if (number < 400 && number % 100 === 0) {
        return [String(number)];
      }

      return [String(number)];
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

  global.BookTestImposibleV2ShowAudio = BookTestImposibleV2ShowAudio;
})(window);