(function setupBookTestImposibleV2ImageEncore(global) {
  const IMAGE_ENCORE_TAKES = Object.freeze(["p1", "p2", "p3"]);
  const NAVIGATION_TYPES = Object.freeze({
    SAME_PAGE: "SAME_PAGE",
    FACING_PAGE: "FACING_PAGE",
    CROSS_BOOK_EXACT_ORIGINAL_PAGE: "CROSS_BOOK_EXACT_ORIGINAL_PAGE",
    TURN_ONE_PAGE: "TURN_ONE_PAGE",
    TURN_MULTIPLE_PAGES: "TURN_MULTIPLE_PAGES",
    NO_IMAGE_FOUND: "NO_IMAGE_FOUND",
  });

  const pad3 = value => String(value).padStart(3, "0");

  function resolveImageNavigation({ sourcePage, targetPage }) {
    const numberedPageDistance = targetPage - sourcePage;
    const turnCount = Math.floor(targetPage / 2) - Math.floor(sourcePage / 2);
    const navigationType = targetPage === sourcePage ? NAVIGATION_TYPES.SAME_PAGE
      : turnCount === 0 ? NAVIGATION_TYPES.FACING_PAGE
        : turnCount === 1 ? NAVIGATION_TYPES.TURN_ONE_PAGE : NAVIGATION_TYPES.TURN_MULTIPLE_PAGES;
    return { numberedPageDistance, turnCount, navigationType, navigationText: buildImageNavigationText({ navigationType, targetPage, turnCount }) };
  }

  function buildImageNavigationText({ navigationType, targetPage, turnCount, targetBookTitle }) {
    if (navigationType === NAVIGATION_TYPES.SAME_PAGE) return `MISMA PÁGINA. LA IMAGEN ESTÁ EN LA PÁGINA ${targetPage}.`;
    if (navigationType === NAVIGATION_TYPES.FACING_PAGE) return `MIRÁ LA PÁGINA CONTIGUA, LA PÁGINA ${targetPage}.`;
    if (navigationType === NAVIGATION_TYPES.CROSS_BOOK_EXACT_ORIGINAL_PAGE) {
      return `CAMBIÁ A ${targetBookTitle || "EL OTRO LIBRO"}. LA IMAGEN ESTÁ EN LA PÁGINA ${targetPage}.`;
    }
    if (navigationType === NAVIGATION_TYPES.TURN_ONE_PAGE) return `DÉ VUELTA UNA PÁGINA. LA IMAGEN ESTÁ EN LA PÁGINA ${targetPage}.`;
    if (navigationType === NAVIGATION_TYPES.TURN_MULTIPLE_PAGES) return `AVANZÁ ${turnCount} VUELTAS DE PÁGINA. LA IMAGEN ESTÁ EN LA PÁGINA ${targetPage}.`;
    return "NO SE ENCONTRÓ UNA IMAGEN PARA ESTA SELECCIÓN.";
  }

  function findImageAtPage(images, page) {
    return (Array.isArray(images) ? images : []).find(item => item.page === page) || null;
  }

  function findNextImage(images, sourcePage) {
    return (Array.isArray(images) ? images : []).reduce((nearest, item) => {
      if (item.page <= sourcePage || (nearest && nearest.page <= item.page)) return nearest;
      return item;
    }, null);
  }

  function buildLocalResult({ bookId, sourcePage, originalPage, image }) {
    return {
      found: true,
      bookId,
      sourceBookId: bookId,
      sourcePage,
      originalPage,
      targetPage: image.page,
      imageId: image.imageId,
      crossBook: false,
      ...resolveImageNavigation({ sourcePage, targetPage: image.page }),
    };
  }

  function buildNoImageResult({ bookId, sourcePage, originalPage }) {
    return {
      found: false,
      bookId,
      sourceBookId: bookId,
      sourcePage,
      originalPage,
      navigationType: NAVIGATION_TYPES.NO_IMAGE_FOUND,
      navigationText: buildImageNavigationText({ navigationType: NAVIGATION_TYPES.NO_IMAGE_FOUND }),
    };
  }

  function resolveManifestBookImage({ bookId, sourcePage, images }) {
    const normalizedSourcePage = Number(sourcePage);
    const samePageImage = findImageAtPage(images, normalizedSourcePage);
    if (samePageImage) return buildLocalResult({ bookId, sourcePage: normalizedSourcePage, originalPage: normalizedSourcePage, image: samePageImage });

    const facingPage = normalizedSourcePage % 2 === 0 ? normalizedSourcePage + 1 : normalizedSourcePage - 1;
    const facingImage = findImageAtPage(images, facingPage);
    if (facingImage) return buildLocalResult({ bookId, sourcePage: normalizedSourcePage, originalPage: normalizedSourcePage, image: facingImage });

    const nextImage = findNextImage(images, normalizedSourcePage);
    if (nextImage) return buildLocalResult({ bookId, sourcePage: normalizedSourcePage, originalPage: normalizedSourcePage, image: nextImage });

    return buildNoImageResult({ bookId, sourcePage: normalizedSourcePage, originalPage: normalizedSourcePage });
  }

  function numericBookOrder(book, fallbackIndex = 0) {
    const tagNumber = Number(String(book?.tag || "").match(/\d+/)?.[0]);
    return Number.isInteger(tagNumber) && tagNumber > 0 ? tagNumber : 100000 + fallbackIndex;
  }

  function buildCyclicBookSearchOrder(originalBook, books) {
    const originalBookId = originalBook?.bookId || originalBook?.id;
    const originalOrder = numericBookOrder(originalBook);
    return (Array.isArray(books) ? books : [])
      .map((book, index) => ({ book, index, order: numericBookOrder(book, index) }))
      .filter(({ book }) => (book?.bookId || book?.id) !== originalBookId && book?.imageEncoreCrossBookEnabled === true)
      .sort((a, b) => {
        const aWrapped = a.order > originalOrder ? 0 : 1;
        const bWrapped = b.order > originalOrder ? 0 : 1;
        return aWrapped - bWrapped || a.order - b.order || a.index - b.index;
      })
      .map(({ book }) => book);
  }

  function resolveImageEncoreSelection({ originalBook, originalPage, sourcePage, books }) {
    const originalBookId = originalBook?.bookId || originalBook?.id;
    const normalizedOriginalPage = Number(originalPage);
    const normalizedSourcePage = Number(sourcePage);
    const originalImages = Array.isArray(originalBook?.images) ? originalBook.images : [];

    const samePageImage = findImageAtPage(originalImages, normalizedSourcePage);
    if (samePageImage) {
      return buildLocalResult({
        bookId: originalBookId,
        sourcePage: normalizedSourcePage,
        originalPage: normalizedOriginalPage,
        image: samePageImage,
      });
    }

    const facingPage = normalizedSourcePage % 2 === 0 ? normalizedSourcePage + 1 : normalizedSourcePage - 1;
    const facingImage = findImageAtPage(originalImages, facingPage);
    if (facingImage) {
      return buildLocalResult({
        bookId: originalBookId,
        sourcePage: normalizedSourcePage,
        originalPage: normalizedOriginalPage,
        image: facingImage,
      });
    }

    for (const candidate of buildCyclicBookSearchOrder(originalBook, books)) {
      const candidateImage = findImageAtPage(candidate.images, normalizedOriginalPage);
      if (!candidateImage) continue;
      const targetBookId = candidate.bookId || candidate.id;
      const targetBookTitle = candidate.title || candidate.name || targetBookId;
      return {
        found: true,
        bookId: targetBookId,
        sourceBookId: originalBookId,
        sourcePage: normalizedSourcePage,
        originalPage: normalizedOriginalPage,
        targetPage: normalizedOriginalPage,
        imageId: candidateImage.imageId,
        targetBookTitle,
        crossBook: true,
        numberedPageDistance: null,
        turnCount: null,
        navigationType: NAVIGATION_TYPES.CROSS_BOOK_EXACT_ORIGINAL_PAGE,
        navigationText: buildImageNavigationText({
          navigationType: NAVIGATION_TYPES.CROSS_BOOK_EXACT_ORIGINAL_PAGE,
          targetPage: normalizedOriginalPage,
          targetBookTitle,
        }),
      };
    }

    const nextImage = findNextImage(originalImages, normalizedSourcePage);
    if (nextImage) {
      return buildLocalResult({
        bookId: originalBookId,
        sourcePage: normalizedSourcePage,
        originalPage: normalizedOriginalPage,
        image: nextImage,
      });
    }

    return buildNoImageResult({
      bookId: originalBookId,
      sourcePage: normalizedSourcePage,
      originalPage: normalizedOriginalPage,
    });
  }

  function buildImageAudioPath({ bookId, page, imageId, take }) {
    return `${bookId}/audios/page-${pad3(page)}/images/${imageId}_${take}.mp3`;
  }

  function buildImageAudioQueue({ bookId, page, imageId }) {
    return IMAGE_ENCORE_TAKES.flatMap((take, index) => {
      const item = { type: "audio", src: `../books/${buildImageAudioPath({ bookId, page, imageId, take })}`, label: `[IMAGE-ENCORE] image:${pad3(page)}:${imageId}:${take}` };
      return index < IMAGE_ENCORE_TAKES.length - 1 ? [item, { type: "pause", ms: 700, label: `[IMAGE-ENCORE] pause:${take}` }] : [item];
    });
  }

  const api = {
    IMAGE_ENCORE_TAKES,
    NAVIGATION_TYPES,
    resolveImageNavigation,
    buildImageNavigationText,
    resolveManifestBookImage,
    resolveImageEncoreSelection,
    buildCyclicBookSearchOrder,
    buildImageAudioPath,
    buildImageAudioQueue,
  };
  global.BookTestImposibleV2ImageEncore = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})(typeof window !== "undefined" ? window : globalThis);
