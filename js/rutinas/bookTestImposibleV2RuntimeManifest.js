(function setupBookTestImposibleV2RuntimeManifest(global) {
  const manifestCache = new Map();
  const AUDIO_CONTRACT_V1 = Object.freeze({
    profile: "bti-audio-v1",
    metaTitle: "audios/_meta/title.mp3",
    metaAuthor: "audios/_meta/author.mp3",
    readingTakes: Object.freeze(["p1", "p2", "p3"]),
    readingPattern: "audios/page-{page3}/line-{line3}_{take}.mp3",
    imageTakes: Object.freeze(["p1", "p2", "p3"]),
    imagePattern: "audios/page-{page3}/images/{imageId}_{take}.mp3",
  });

  function pad3(value) {
    return String(value).padStart(3, "0");
  }

  function hasExactValues(actual, expected) {
    return Array.isArray(actual)
      && actual.length === expected.length
      && actual.every((value, index) => value === expected[index]);
  }

  function validateRuntimeManifest(manifest, expectedBookId) {
    if (!manifest || manifest.schemaVersion !== 1) throw new Error("Runtime manifest: schemaVersion debe ser 1.");
    if (typeof manifest.bookId !== "string" || !manifest.bookId || manifest.bookId !== expectedBookId) throw new Error("Runtime manifest: bookId inválido.");
    if (!manifest.pages || typeof manifest.pages !== "object" || Array.isArray(manifest.pages) || !Object.keys(manifest.pages).length) throw new Error("Runtime manifest: pages inválido.");
    for (const [pageKey, config] of Object.entries(manifest.pages)) {
      const page = Number(pageKey);
      if (!Number.isInteger(page) || page <= 0 || pad3(page) !== pageKey) throw new Error(`Runtime manifest: página inválida ${pageKey}.`);
      if (!Number.isInteger(config?.lineCount) || config.lineCount < 0) throw new Error(`Runtime manifest: lineCount inválido en ${pageKey}.`);
    }
    const audio = manifest.audio;
    if (audio?.profile !== AUDIO_CONTRACT_V1.profile) throw new Error("Runtime manifest: audio.profile inválido para bti-audio-v1.");
    if (audio?.meta?.title !== AUDIO_CONTRACT_V1.metaTitle) throw new Error("Runtime manifest: audio.meta.title inválido para bti-audio-v1.");
    if (audio?.meta?.author !== AUDIO_CONTRACT_V1.metaAuthor) throw new Error("Runtime manifest: audio.meta.author inválido para bti-audio-v1.");
    if (!hasExactValues(audio?.reading?.takes, AUDIO_CONTRACT_V1.readingTakes)) throw new Error("Runtime manifest: audio.reading.takes inválido para bti-audio-v1.");
    if (audio?.reading?.pathPattern !== AUDIO_CONTRACT_V1.readingPattern) throw new Error("Runtime manifest: audio.reading.pathPattern inválido para bti-audio-v1.");
    if (!hasExactValues(audio?.images?.takes, AUDIO_CONTRACT_V1.imageTakes)) throw new Error("Runtime manifest: audio.images.takes inválido para bti-audio-v1.");
    if (audio?.images?.pathPattern !== AUDIO_CONTRACT_V1.imagePattern) throw new Error("Runtime manifest: audio.images.pathPattern inválido para bti-audio-v1.");
    if (!Array.isArray(manifest.images)) throw new Error("Runtime manifest: images inválido.");
    manifest.images.forEach((image, index) => {
      if (!Number.isInteger(image?.page) || image.page <= 0 || typeof image.imageId !== "string" || !image.imageId) throw new Error(`Runtime manifest: imagen inválida en ${index}.`);
      if (!manifest.pages[pad3(image.page)]) throw new Error(`Runtime manifest: imagen refiere página inexistente ${image.page}.`);
    });
    if (!manifest.readingRules || typeof manifest.readingRules !== "object" || Array.isArray(manifest.readingRules)) throw new Error("Runtime manifest: readingRules inválido.");
    for (const [pageKey, rules] of Object.entries(manifest.readingRules)) {
      const lineCount = manifest.pages[pageKey]?.lineCount;
      if (!Number.isInteger(lineCount) || lineCount === 0) throw new Error(`Runtime manifest: readingRules refiere página no seleccionable ${pageKey}.`);
      for (const [lineKey, rule] of Object.entries(rules)) {
        const line = Number(lineKey);
        if (!Number.isInteger(line) || line <= 0 || line > lineCount) throw new Error(`Runtime manifest: regla fuera de rango ${pageKey}/${lineKey}.`);
        const playLine = rule?.playLine ?? line;
        if (!Number.isInteger(playLine) || playLine <= 0 || playLine > lineCount) throw new Error(`Runtime manifest: playLine inválido ${pageKey}/${lineKey}.`);
        if (typeof rule.extendWithNextLine !== "undefined" && typeof rule.extendWithNextLine !== "boolean") throw new Error(`Runtime manifest: extendWithNextLine inválido ${pageKey}/${lineKey}.`);
        if (rule.extendWithNextLine && playLine >= lineCount) throw new Error(`Runtime manifest: continuidad fuera de rango ${pageKey}/${lineKey}.`);
        if (rule.announceLines && (!Array.isArray(rule.announceLines) || rule.announceLines.some(value => !Number.isInteger(value) || value <= 0 || value > lineCount))) throw new Error(`Runtime manifest: announceLines inválido ${pageKey}/${lineKey}.`);
      }
    }
    return manifest;
  }

  async function loadRuntimeManifest(book, fetchJson) {
    const bookId = book?.bookId;
    if (!bookId || typeof book.runtimeManifest !== "string" || !book.runtimeManifest) throw new Error(`Libro ${bookId || "desconocido"} sin runtimeManifest.`);
    if (manifestCache.has(bookId)) return manifestCache.get(bookId);
    const root = String(book.root || `books/${bookId}`).replace(/^books\//, "../books/");
    const manifest = validateRuntimeManifest(await fetchJson(`${root}/${book.runtimeManifest}`), bookId);
    manifestCache.set(bookId, manifest);
    return manifest;
  }

  function resolveSelection(manifest, book, pageNumber, lineNumber) {
    const page = manifest.pages[pad3(pageNumber)];
    if (!page) throw new Error(`La página ${pageNumber} no existe en el runtime manifest.`);
    if (page.lineCount === 0) throw new Error(`La página ${pageNumber} no posee renglones seleccionables.`);
    if (!Number.isInteger(lineNumber) || lineNumber <= 0 || lineNumber > page.lineCount) throw new Error(`Renglón fuera de rango. La página ${pageNumber} tiene ${page.lineCount} líneas.`);
    return { book, pageNumber, lineNumber, lineCount: page.lineCount, runtimeManifest: manifest, readingRule: manifest.readingRules[pad3(pageNumber)]?.[String(lineNumber)] || null };
  }

  function clearCache() { manifestCache.clear(); }

  const api = { AUDIO_CONTRACT_V1, validateRuntimeManifest, loadRuntimeManifest, resolveSelection, clearCache, pad3 };
  global.BookTestImposibleV2RuntimeManifest = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})(typeof window !== "undefined" ? window : globalThis);
