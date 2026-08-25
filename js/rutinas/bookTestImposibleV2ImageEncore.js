(function setupBookTestImposibleV2ImageEncore(global) {
  const IMAGE_ENCORE_TAKES = Object.freeze(["p1", "p2", "p3"]);
  const NAVIGATION_TYPES = Object.freeze({
    SAME_PAGE: "SAME_PAGE", FACING_PAGE: "FACING_PAGE", TURN_ONE_PAGE: "TURN_ONE_PAGE",
    TURN_MULTIPLE_PAGES: "TURN_MULTIPLE_PAGES", NO_IMAGE_FOUND: "NO_IMAGE_FOUND",
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

  function buildImageNavigationText({ navigationType, targetPage, turnCount }) {
    if (navigationType === NAVIGATION_TYPES.SAME_PAGE) return `MISMA PÁGINA. LA IMAGEN ESTÁ EN LA PÁGINA ${targetPage}.`;
    if (navigationType === NAVIGATION_TYPES.FACING_PAGE) return `MIRÁ LA PÁGINA CONTIGUA, LA PÁGINA ${targetPage}.`;
    if (navigationType === NAVIGATION_TYPES.TURN_ONE_PAGE) return `DÉ VUELTA UNA PÁGINA. LA IMAGEN ESTÁ EN LA PÁGINA ${targetPage}.`;
    if (navigationType === NAVIGATION_TYPES.TURN_MULTIPLE_PAGES) return `AVANZÁ ${turnCount} VUELTAS DE PÁGINA. LA IMAGEN ESTÁ EN LA PÁGINA ${targetPage}.`;
    return "NO SE ENCONTRÓ UNA IMAGEN POSTERIOR PARA ESTA SELECCIÓN.";
  }

  function resolveManifestBookImage({ bookId, sourcePage, images }) {
    const normalizedSourcePage = Number(sourcePage);
    const image = (Array.isArray(images) ? images : []).find(item => item.page >= normalizedSourcePage);
    if (!image) return { found: false, bookId, sourcePage: normalizedSourcePage, navigationType: NAVIGATION_TYPES.NO_IMAGE_FOUND, navigationText: buildImageNavigationText({ navigationType: NAVIGATION_TYPES.NO_IMAGE_FOUND }) };
    return { found: true, bookId, sourcePage: normalizedSourcePage, targetPage: image.page, imageId: image.imageId, ...resolveImageNavigation({ sourcePage: normalizedSourcePage, targetPage: image.page }) };
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

  const api = { IMAGE_ENCORE_TAKES, NAVIGATION_TYPES, resolveImageNavigation, buildImageNavigationText, resolveManifestBookImage, buildImageAudioPath, buildImageAudioQueue };
  global.BookTestImposibleV2ImageEncore = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})(typeof window !== "undefined" ? window : globalThis);
