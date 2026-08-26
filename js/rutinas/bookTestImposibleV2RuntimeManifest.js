(function setupBookTestImposibleV2RuntimeManifest(global) {
  const manifestCache = new Map();
  const AUDIO_CONTRACT_V1 = Object.freeze({
    profile: "bti-audio-v1",
    metaTitle: "audios/_meta/title.mp3",
    metaAuthor: "audios/_meta/author.mp3",
    readingTakes: Object.freeze(["p1", "p2", "p3"]),
    defaultReadingPartCount: 3,
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
      const unknownPageFields = Object.keys(config).filter(key => !["lineCount", "partCountOverrides"].includes(key));
      if (unknownPageFields.length) throw new Error(`Runtime manifest: campo no permitido en ${pageKey}: ${unknownPageFields[0]}.`);
      if (config.partCountOverrides !== undefined) {
        if (config.lineCount === 0) throw new Error(`Runtime manifest: partCountOverrides no permitido en página vacía ${pageKey}.`);
        if (!config.partCountOverrides || typeof config.partCountOverrides !== "object" || Array.isArray(config.partCountOverrides)) {
          throw new Error(`Runtime manifest: partCountOverrides inválido en ${pageKey}.`);
        }
        for (const [lineKey, partCount] of Object.entries(config.partCountOverrides)) {
          const line = Number(lineKey);
          if (!Number.isInteger(line) || line <= 0 || pad3(line) !== lineKey || line > config.lineCount) {
            throw new Error(`Runtime manifest: renglón inválido ${pageKey}/${lineKey} en partCountOverrides.`);
          }
          if (partCount !== 1 && partCount !== 2) {
            throw new Error(`Runtime manifest: partCount inválido ${pageKey}/${lineKey}; sólo se permiten overrides 1 o 2.`);
          }
        }
      }
    }
    const audio = manifest.audio;
    if (audio?.profile !== AUDIO_CONTRACT_V1.profile) throw new Error("Runtime manifest: audio.profile inválido para bti-audio-v1.");
    if (audio?.meta?.title !== AUDIO_CONTRACT_V1.metaTitle) throw new Error("Runtime manifest: audio.meta.title inválido para bti-audio-v1.");
    if (audio?.meta?.author !== AUDIO_CONTRACT_V1.metaAuthor) throw new Error("Runtime manifest: audio.meta.author inválido para bti-audio-v1.");
    if (!hasExactValues(audio?.reading?.takes, AUDIO_CONTRACT_V1.readingTakes)) throw new Error("Runtime manifest: audio.reading.takes inválido para bti-audio-v1.");
    if (audio?.reading?.defaultPartCount !== AUDIO_CONTRACT_V1.defaultReadingPartCount) throw new Error("Runtime manifest: audio.reading.defaultPartCount inválido para bti-audio-v1.");
    if (audio?.reading?.pathPattern !== AUDIO_CONTRACT_V1.readingPattern) throw new Error("Runtime manifest: audio.reading.pathPattern inválido para bti-audio-v1.");
    if (!hasExactValues(audio?.images?.takes, AUDIO_CONTRACT_V1.imageTakes)) throw new Error("Runtime manifest: audio.images.takes inválido para bti-audio-v1.");
    if (audio?.images?.pathPattern !== AUDIO_CONTRACT_V1.imagePattern) throw new Error("Runtime manifest: audio.images.pathPattern inválido para bti-audio-v1.");
    if (!Array.isArray(manifest.images)) throw new Error("Runtime manifest: images inválido.");
    manifest.images.forEach((image, index) => {
      if (!Number.isInteger(image?.page) || image.page <= 0 || typeof image.imageId !== "string" || !image.imageId) throw new Error(`Runtime manifest: imagen inválida en ${index}.`);
      if (!manifest.pages[pad3(image.page)]) throw new Error(`Runtime manifest: imagen refiere página inexistente ${image.page}.`);
    });
    const selectableLineCount = Object.values(manifest.pages).reduce((total, page) => total + page.lineCount, 0);
    if (selectableLineCount < 2) throw new Error("Runtime manifest: el libro debe contener al menos dos renglones seleccionables.");
    return manifest;
  }

  function resolveReadingPartCount(manifest, pageNumber, lineNumber) {
    if (!Number.isInteger(pageNumber) || pageNumber <= 0) throw new Error(`Página inválida recibida: ${pageNumber}.`);
    if (!Number.isInteger(lineNumber) || lineNumber <= 0) throw new Error(`Renglón inválido recibido: ${lineNumber}.`);
    const page = manifest?.pages?.[pad3(pageNumber)];
    if (!page || lineNumber > page.lineCount) throw new Error(`Renglón inexistente recibido: ${pageNumber}/${lineNumber}.`);
    return page.partCountOverrides?.[pad3(lineNumber)] || manifest.audio.reading.defaultPartCount;
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

  function resolveCyclicReadingPlan(manifest, pageNumber, lineNumber) {
    if (!Number.isInteger(pageNumber) || pageNumber <= 0) throw new Error(`Página inválida recibida: ${pageNumber}.`);
    if (!Number.isInteger(lineNumber) || lineNumber <= 0) throw new Error(`Renglón inválido recibido: ${lineNumber}.`);
    const targets = Object.entries(manifest.pages)
      .map(([pageKey, page]) => ({ pageNumber: Number(pageKey), lineCount: page.lineCount }))
      .filter(page => page.lineCount > 0)
      .sort((a, b) => a.pageNumber - b.pageNumber)
      .flatMap(page => Array.from({ length: page.lineCount }, (_, index) => ({ pageNumber: page.pageNumber, lineNumber: index + 1 })));
    if (targets.length < 2) throw new Error("Runtime manifest: el libro debe contener al menos dos renglones seleccionables.");

    let startIndex = targets.findIndex(target => target.pageNumber === pageNumber && target.lineNumber === lineNumber);
    let wrappedBook = false;
    if (startIndex < 0) {
      startIndex = targets.findIndex(target => target.pageNumber > pageNumber && target.lineNumber === 1);
      if (startIndex < 0) {
        startIndex = 0;
        wrappedBook = true;
      }
    }
    const nextIndex = (startIndex + 1) % targets.length;
    if (nextIndex === 0) wrappedBook = true;
    const readingTargets = [targets[startIndex], targets[nextIndex]];
    return {
      requested: { pageNumber, lineNumber },
      targets: readingTargets,
      normalizedStart: readingTargets[0].pageNumber !== pageNumber || readingTargets[0].lineNumber !== lineNumber,
      crossedPage: readingTargets[0].pageNumber !== pageNumber || readingTargets[1].pageNumber !== readingTargets[0].pageNumber,
      wrappedBook,
    };
  }

  function resolveSelection(manifest, book, pageNumber, lineNumber) {
    return { book, pageNumber, lineNumber, runtimeManifest: manifest, readingPlan: resolveCyclicReadingPlan(manifest, pageNumber, lineNumber) };
  }

  function clearCache() { manifestCache.clear(); }

  const api = { AUDIO_CONTRACT_V1, validateRuntimeManifest, loadRuntimeManifest, resolveReadingPartCount, resolveCyclicReadingPlan, resolveSelection, clearCache, pad3 };
  global.BookTestImposibleV2RuntimeManifest = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})(typeof window !== "undefined" ? window : globalThis);
