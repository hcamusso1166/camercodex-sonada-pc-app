(function setupBookTestImposibleV2RuntimeManifest(global) {
  const manifestCache = new Map();

  function pad3(value) {
    return String(value).padStart(3, "0");
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
    if (audio?.profile !== "bti-audio-v1") throw new Error("Runtime manifest: audio.profile inválido.");
    for (const type of ["reading", "images"]) {
      if (!Array.isArray(audio?.[type]?.takes) || !audio[type].takes.length || audio[type].takes.some(take => typeof take !== "string" || !take)) throw new Error(`Runtime manifest: audio.${type}.takes inválido.`);
      if (typeof audio[type].pathPattern !== "string" || !audio[type].pathPattern) throw new Error(`Runtime manifest: audio.${type}.pathPattern inválido.`);
    }
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

  const api = { validateRuntimeManifest, loadRuntimeManifest, resolveSelection, clearCache, pad3 };
  global.BookTestImposibleV2RuntimeManifest = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})(typeof window !== "undefined" ? window : globalThis);
