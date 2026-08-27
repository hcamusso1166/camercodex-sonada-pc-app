(function setupBookTestImposibleV2OfflinePlan(global) {
  const runtime = global.BookTestImposibleV2RuntimeManifest
    || (typeof require === "function" ? require("./bookTestImposibleV2RuntimeManifest.js") : null);

  function canonicalBookRoot(book) {
    const bookId = book?.bookId;
    if (typeof bookId !== "string" || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(bookId)) {
      throw new Error("Offline plan: bookId inválido.");
    }
    const root = String(book.root || `books/${bookId}`).replace(/\\/g, "/");
    const normalized = `/${root.replace(/^\/+|\/+$/g, "")}`;
    if (normalized !== `/books/${bookId}` || normalized.includes("..")) {
      throw new Error("Offline plan: book.root inválido o inconsistente con bookId.");
    }
    return normalized;
  }

  function resolvePattern(pattern, values) {
    return pattern.replace(/\{(page3|line3|take|imageId)\}/g, (_, key) => values[key]);
  }

  function buildBookOfflinePlan(book, runtimeManifest) {
    if (!runtime) throw new Error("Offline plan: runtime manifest API no disponible.");
    const root = canonicalBookRoot(book);
    if (typeof book.runtimeManifest !== "string" || !book.runtimeManifest
      || book.runtimeManifest.startsWith("/") || book.runtimeManifest.includes("\\")
      || book.runtimeManifest.split("/").includes("..")) {
      throw new Error("Offline plan: runtimeManifest inválido.");
    }

    const manifest = runtime.validateRuntimeManifest(runtimeManifest, book.bookId);
    const urls = [];
    const seen = new Set();
    const add = relativePath => {
      if (typeof relativePath !== "string" || !relativePath || relativePath.startsWith("/")
        || relativePath.includes("\\") || relativePath.includes("?") || relativePath.includes("#")) {
        throw new Error("Offline plan: ruta de asset inválida.");
      }
      const url = `${root}/${relativePath}`;
      let decodedPath;
      try {
        decodedPath = decodeURIComponent(relativePath);
      } catch (_) {
        throw new Error("Offline plan: ruta de asset inválida.");
      }
      const parsed = new URL(url, "https://offline.invalid");
      if (decodedPath.replace(/\\/g, "/").split("/").includes("..")
        || /%(?:2e|2f|3f|23|5c)/i.test(relativePath)
        || parsed.origin !== "https://offline.invalid" || parsed.pathname !== url
        || parsed.search || parsed.hash || !parsed.pathname.startsWith(`${root}/`)) {
        throw new Error("Offline plan: ruta de asset inválida.");
      }
      if (!seen.has(url)) {
        seen.add(url);
        urls.push(url);
      }
    };

    add(book.runtimeManifest);
    add(manifest.audio.meta.title);
    add(manifest.audio.meta.author);

    const pages = Object.entries(manifest.pages)
      .sort(([pageKeyA], [pageKeyB]) => Number(pageKeyA) - Number(pageKeyB));
    for (const [pageKey, page] of pages) {
      for (let lineNumber = 1; lineNumber <= page.lineCount; lineNumber += 1) {
        const partCount = runtime.resolveReadingPartCount(manifest, Number(pageKey), lineNumber);
        for (const take of manifest.audio.reading.takes.slice(0, partCount)) {
          add(resolvePattern(manifest.audio.reading.pathPattern, {
            page3: pageKey,
            line3: runtime.pad3(lineNumber),
            take,
          }));
        }
      }
    }

    for (const image of manifest.images) {
      for (const take of manifest.audio.images.takes) {
        add(resolvePattern(manifest.audio.images.pathPattern, {
          page3: runtime.pad3(image.page),
          imageId: image.imageId,
          take,
        }));
      }
    }

    return { schemaVersion: 1, profile: "bti-offline-plan-v1", bookId: book.bookId, urls };
  }

  const api = { buildBookOfflinePlan };
  global.BookTestImposibleV2OfflinePlan = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})(typeof window !== "undefined" ? window : globalThis);
