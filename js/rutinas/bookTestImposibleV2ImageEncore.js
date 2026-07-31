(function setupBookTestImposibleV2ImageEncore(global) {
  const IMAGE_ENCORE_TAKES = Object.freeze(["p1", "p2", "p3"]);
  const NAVIGATION_TYPES = Object.freeze({
    SAME_PAGE: "SAME_PAGE",
    FACING_PAGE: "FACING_PAGE",
    TURN_ONE_PAGE: "TURN_ONE_PAGE",
    TURN_MULTIPLE_PAGES: "TURN_MULTIPLE_PAGES",
    NO_IMAGE_FOUND: "NO_IMAGE_FOUND",
  });

  function pad3(value) {
    return String(value).padStart(3, "0");
  }

  function normalizePageImages(pageData, onWarning = () => {}) {
    if (!Array.isArray(pageData?.images)) {
      if (pageData && Object.prototype.hasOwnProperty.call(pageData, "images")) {
        onWarning(`[IMAGE-ENCORE] images inválido en page=${pageData.page}; se normaliza a []`);
      }
      return [];
    }

    return pageData.images
      .map((item, index) => {
        if (!item || typeof item !== "object") {
          onWarning(`[IMAGE-ENCORE] imagen inválida ignorada page=${pageData.page} index=${index}`);
          return null;
        }
        const imageId = typeof item.imageId === "string" ? item.imageId.trim() : "";
        const description = typeof item.description === "string" ? item.description.trim() : "";
        if (!imageId || !description) {
          onWarning(`[IMAGE-ENCORE] imagen sin imageId/description ignorada page=${pageData.page} index=${index}`);
          return null;
        }
        return { imageId, description };
      })
      .filter(Boolean);
  }

  function normalizeEncorePageData(pageData, onWarning = () => {}) {
    return {
      ...pageData,
      page: Number(pageData?.page),
      bookId: pageData?.bookId || "",
      images: normalizePageImages(pageData, onWarning),
    };
  }

  function resolveImageNavigation({ sourcePage, targetPage }) {
    const numberedPageDistance = targetPage - sourcePage;
    const sourceSpread = Math.floor(sourcePage / 2);
    const targetSpread = Math.floor(targetPage / 2);
    const turnCount = targetSpread - sourceSpread;

    let navigationType;
    if (targetPage === sourcePage) {
      navigationType = NAVIGATION_TYPES.SAME_PAGE;
    } else if (turnCount === 0) {
      navigationType = NAVIGATION_TYPES.FACING_PAGE;
    } else if (turnCount === 1) {
      navigationType = NAVIGATION_TYPES.TURN_ONE_PAGE;
    } else {
      navigationType = NAVIGATION_TYPES.TURN_MULTIPLE_PAGES;
    }

    return {
      numberedPageDistance,
      turnCount,
      navigationType,
      navigationText: buildImageNavigationText({ navigationType, targetPage, turnCount }),
    };
  }

  function buildImageNavigationText({ navigationType, targetPage, turnCount }) {
    if (navigationType === NAVIGATION_TYPES.SAME_PAGE) {
      return `MISMA PÁGINA. LA IMAGEN ESTÁ EN LA PÁGINA ${targetPage}.`;
    }
    if (navigationType === NAVIGATION_TYPES.FACING_PAGE) {
      return `MIRÁ LA PÁGINA CONTIGUA, LA PÁGINA ${targetPage}.`;
    }
    if (navigationType === NAVIGATION_TYPES.TURN_ONE_PAGE) {
      return `DÉ VUELTA UNA PÁGINA. LA IMAGEN ESTÁ EN LA PÁGINA ${targetPage}.`;
    }
    if (navigationType === NAVIGATION_TYPES.TURN_MULTIPLE_PAGES) {
      return `AVANZÁ ${turnCount} VUELTAS DE PÁGINA. LA IMAGEN ESTÁ EN LA PÁGINA ${targetPage}.`;
    }
    return "NO SE ENCONTRÓ UNA IMAGEN POSTERIOR PARA ESTA SELECCIÓN.";
  }

  function resolveNextBookImage({ bookId, selectedPage, pages, onWarning = () => {} }) {
    const normalizedSelectedPage = Number(selectedPage);
    const orderedPages = (Array.isArray(pages) ? pages : [])
      .map(pageData => normalizeEncorePageData(pageData, onWarning))
      .filter(page => page.bookId === bookId && Number.isInteger(page.page))
      .sort((a, b) => a.page - b.page);

    if (!orderedPages.length) {
      onWarning(`[IMAGE-ENCORE] libro sin páginas en catálogo book=${bookId}`);
    } else if (!orderedPages.some(pageData => pageData.page === normalizedSelectedPage)) {
      onWarning(`[IMAGE-ENCORE] página seleccionada no encontrada book=${bookId} page=${normalizedSelectedPage}`);
    }

    const targetPageData = orderedPages.find(pageData => (
      pageData.page >= normalizedSelectedPage &&
      pageData.images.length > 0
    ));

    if (!targetPageData) {
      return {
        found: false,
        bookId,
        sourcePage: normalizedSelectedPage,
        navigationType: NAVIGATION_TYPES.NO_IMAGE_FOUND,
        navigationText: buildImageNavigationText({ navigationType: NAVIGATION_TYPES.NO_IMAGE_FOUND }),
      };
    }

    const image = targetPageData.images[0];
    const targetPage = targetPageData.page;
    const navigation = resolveImageNavigation({ sourcePage: normalizedSelectedPage, targetPage });

    return {
      found: true,
      bookId,
      sourcePage: normalizedSelectedPage,
      targetPage,
      imageId: image.imageId,
      description: image.description,
      ...navigation,
    };
  }

  function findNextBookImage(bookId, sourcePage, imageIndex = global.BOOK_IMAGE_INDEX || {}) {
    const normalizedSourcePage = Number(sourcePage);
    const images = Array.isArray(imageIndex?.[bookId]) ? imageIndex[bookId] : [];
    return images.find(image => Number(image.page) >= normalizedSourcePage) || null;
  }

  function resolveIndexedBookImage({ bookId, sourcePage, imageIndex = global.BOOK_IMAGE_INDEX || {} }) {
    const normalizedSourcePage = Number(sourcePage);
    const image = findNextBookImage(bookId, normalizedSourcePage, imageIndex);
    if (!image) {
      return {
        found: false, bookId, sourcePage: normalizedSourcePage,
        navigationType: NAVIGATION_TYPES.NO_IMAGE_FOUND,
        navigationText: buildImageNavigationText({ navigationType: NAVIGATION_TYPES.NO_IMAGE_FOUND }),
      };
    }
    return {
      found: true, ...image, sourcePage: normalizedSourcePage,
      ...resolveImageNavigation({ sourcePage: normalizedSourcePage, targetPage: image.page }),
      targetPage: image.page,
    };
  }

  function buildImageAudioPath({ bookId, page, imageId, take }) {
    return `${bookId}/audios/page-${pad3(page)}/images/${imageId}_${take}.mp3`;
  }

  function buildImageAudioQueue({ bookId, page, imageId }) {
    return IMAGE_ENCORE_TAKES.flatMap((take, index) => {
      const item = {
        type: "audio",
        src: `../books/${buildImageAudioPath({ bookId, page, imageId, take })}`,
        label: `[IMAGE-ENCORE] image:${pad3(page)}:${imageId}:${take}`,
      };
      return index < IMAGE_ENCORE_TAKES.length - 1
        ? [item, { type: "pause", ms: 700, label: `[IMAGE-ENCORE] pause:${take}` }]
        : [item];
    });
  }

  const api = {
    IMAGE_ENCORE_TAKES,
    NAVIGATION_TYPES,
    normalizePageImages,
    normalizeEncorePageData,
    resolveImageNavigation,
    buildImageNavigationText,
    resolveNextBookImage,
    findNextBookImage,
    resolveIndexedBookImage,
    buildImageAudioPath,
    buildImageAudioQueue,
  };

  global.BookTestImposibleV2ImageEncore = api;
  if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
  }
})(typeof window !== "undefined" ? window : globalThis);