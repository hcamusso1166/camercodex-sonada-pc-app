const test = require('node:test');
const assert = require('node:assert/strict');
const manifest = require('../books/narnia-el-sobrino-del-mago/runtime-manifest.json');
const book2Manifest = require('../books/narnia-el-leon-la-bruja-y-el-armario/runtime-manifest.json');
const book3Manifest = require('../books/el-caballo-y-el-muchacho/runtime-manifest.json');
const {
  resolveManifestBookImage,
  resolveImageEncoreSelection,
  buildCyclicBookSearchOrder,
  buildImageAudioPath,
  buildImageAudioQueue,
} = require('../js/rutinas/bookTestImposibleV2ImageEncore.js');
const bookId = manifest.bookId;

test('Image Encore conserva navegación same/facing/one/multiple/not-found', () => {
  assert.equal(resolveManifestBookImage({ bookId, sourcePage: 11, images: manifest.images }).navigationType, 'SAME_PAGE');
  assert.equal(resolveManifestBookImage({ bookId, sourcePage: 60, images: manifest.images }).navigationType, 'FACING_PAGE');
  assert.equal(resolveManifestBookImage({ bookId, sourcePage: 77, images: manifest.images }).navigationType, 'TURN_ONE_PAGE');
  assert.equal(resolveManifestBookImage({ bookId, sourcePage: 57, images: manifest.images }).navigationType, 'TURN_MULTIPLE_PAGES');
  assert.equal(resolveManifestBookImage({ bookId, sourcePage: 999, images: manifest.images }).navigationType, 'NO_IMAGE_FOUND');
});

test('Image Encore usa la página par anterior si está a la vista desde una página impar', () => {
  const result = resolveManifestBookImage({
    bookId: book2Manifest.bookId,
    sourcePage: 17,
    images: book2Manifest.images,
  });
  assert.deepEqual(
    { targetPage: result.targetPage, imageId: result.imageId, navigationType: result.navigationType, turnCount: result.turnCount },
    { targetPage: 16, imageId: 'image-001', navigationType: 'FACING_PAGE', turnCount: 0 }
  );

  const samePage = resolveManifestBookImage({
    bookId: book2Manifest.bookId,
    sourcePage: 23,
    images: book2Manifest.images,
  });
  assert.equal(samePage.targetPage, 23);
  assert.equal(samePage.navigationType, 'SAME_PAGE');
});

test('prioridad local queda congelada: misma página → enfrentada visible → cross-book → siguiente posterior', () => {
  const originalBook = {
    bookId: 'book-2',
    tag: '02',
    title: 'Libro 2',
    images: [
      { page: 16, imageId: 'facing' },
      { page: 17, imageId: 'same' },
      { page: 22, imageId: 'future' },
    ],
  };
  const books = [
    { bookId: 'book-1', tag: '01', title: 'Libro 1', imageEncoreCrossBookEnabled: true, images: [{ page: 11, imageId: 'cross-1' }] },
    { bookId: 'book-2', tag: '02', title: 'Libro 2', imageEncoreCrossBookEnabled: true, images: originalBook.images },
    { bookId: 'book-3', tag: '03', title: 'Libro 3', imageEncoreCrossBookEnabled: true, images: [{ page: 11, imageId: 'cross-3' }] },
  ];

  const same = resolveImageEncoreSelection({ originalBook, originalPage: 11, sourcePage: 17, books });
  assert.deepEqual({ bookId: same.bookId, targetPage: same.targetPage, navigationType: same.navigationType }, {
    bookId: 'book-2', targetPage: 17, navigationType: 'SAME_PAGE',
  });

  const withoutSame = { ...originalBook, images: originalBook.images.filter(image => image.page !== 17) };
  const facing = resolveImageEncoreSelection({ originalBook: withoutSame, originalPage: 11, sourcePage: 17, books });
  assert.deepEqual({ bookId: facing.bookId, targetPage: facing.targetPage, navigationType: facing.navigationType }, {
    bookId: 'book-2', targetPage: 16, navigationType: 'FACING_PAGE',
  });

  const evenFacingBook = { ...originalBook, images: [{ page: 17, imageId: 'facing-next' }, { page: 22, imageId: 'future' }] };
  const evenFacing = resolveImageEncoreSelection({ originalBook: evenFacingBook, originalPage: 11, sourcePage: 16, books });
  assert.deepEqual({ bookId: evenFacing.bookId, targetPage: evenFacing.targetPage, navigationType: evenFacing.navigationType }, {
    bookId: 'book-2', targetPage: 17, navigationType: 'FACING_PAGE',
  });

  const withoutVisible = { ...originalBook, images: [{ page: 22, imageId: 'future' }] };
  const cross = resolveImageEncoreSelection({ originalBook: withoutVisible, originalPage: 11, sourcePage: 17, books });
  assert.deepEqual({ bookId: cross.bookId, targetPage: cross.targetPage, navigationType: cross.navigationType }, {
    bookId: 'book-3', targetPage: 11, navigationType: 'CROSS_BOOK_EXACT_ORIGINAL_PAGE',
  });

  const noCrossBooks = books.map(book => ({ ...book, images: [] }));
  const fallback = resolveImageEncoreSelection({ originalBook: withoutVisible, originalPage: 11, sourcePage: 17, books: noCrossBooks });
  assert.deepEqual({ bookId: fallback.bookId, targetPage: fallback.targetPage, navigationType: fallback.navigationType }, {
    bookId: 'book-2', targetPage: 22, navigationType: 'TURN_MULTIPLE_PAGES',
  });
});

test('búsqueda cross-book es circular por tag y saltea libros no habilitados', () => {
  const originalBook = { bookId: 'book-2', tag: '02' };
  const books = [
    { bookId: 'book-4', tag: '04', imageEncoreCrossBookEnabled: true },
    { bookId: 'book-1', tag: '01', imageEncoreCrossBookEnabled: true },
    { bookId: 'book-3', tag: '03', imageEncoreCrossBookEnabled: true },
    { bookId: 'book-2', tag: '02', imageEncoreCrossBookEnabled: true },
  ];
  assert.deepEqual(buildCyclicBookSearchOrder(originalBook, books).map(book => book.bookId), ['book-3', 'book-4', 'book-1']);

  books[0].imageEncoreCrossBookEnabled = false;
  assert.deepEqual(buildCyclicBookSearchOrder(originalBook, books).map(book => book.bookId), ['book-3', 'book-1']);
});

test('manifests reales prueban el salto exacto de Libro 2 a Libro 3 y luego a Libro 1', () => {
  const catalog = [
    { bookId: manifest.bookId, tag: '01', title: 'El sobrino del mago', imageEncoreCrossBookEnabled: true, images: manifest.images },
    { bookId: book2Manifest.bookId, tag: '02', title: 'El león, la bruja y el armario', imageEncoreCrossBookEnabled: true, images: book2Manifest.images },
    { bookId: book3Manifest.bookId, tag: '03', title: 'El caballo y el muchacho', imageEncoreCrossBookEnabled: true, images: book3Manifest.images },
  ];
  const book2 = catalog[1];

  const toBook3 = resolveImageEncoreSelection({ originalBook: book2, originalPage: 14, sourcePage: 14, books: catalog });
  assert.deepEqual({ bookId: toBook3.bookId, targetPage: toBook3.targetPage, imageId: toBook3.imageId }, {
    bookId: book3Manifest.bookId, targetPage: 14, imageId: 'image-001',
  });

  const toBook1 = resolveImageEncoreSelection({ originalBook: book2, originalPage: 11, sourcePage: 11, books: catalog });
  assert.deepEqual({ bookId: toBook1.bookId, targetPage: toBook1.targetPage, imageId: toBook1.imageId }, {
    bookId: manifest.bookId, targetPage: 11, imageId: 'image-001',
  });
});

test('Image Encore desde page 107 conserva resultado operacional', () => {
  const result = resolveManifestBookImage({ bookId, sourcePage: 107, images: manifest.images });
  assert.deepEqual({ targetPage: result.targetPage, imageId: result.imageId, navigationType: result.navigationType, turnCount: result.turnCount }, { targetPage: 109, imageId: 'image-001', navigationType: 'TURN_ONE_PAGE', turnCount: 1 });
  assert.equal('description' in result, false);
});

test('varias imágenes de la misma página conservan la primera', () => {
  const result = resolveManifestBookImage({ bookId, sourcePage: 155, images: manifest.images });
  assert.equal(result.imageId, 'image-001');
  assert.equal(manifest.images.filter(image => image.page === 155).length, 2);
});

test('Image Encore elige la menor página elegible aunque images esté desordenado', () => {
  const images = [
    { page: 109, imageId: 'image-001' },
    { page: 61, imageId: 'image-001' },
    { page: 11, imageId: 'image-001' },
    { page: 61, imageId: 'image-002' },
  ];
  const original = structuredClone(images);
  const result = resolveManifestBookImage({ bookId, sourcePage: 60, images });
  assert.deepEqual({ targetPage: result.targetPage, imageId: result.imageId }, { targetPage: 61, imageId: 'image-001' });
  assert.deepEqual(images, original);
});

test('audio de imagen se deriva por convención con tres takes', () => {
  assert.equal(buildImageAudioPath({ bookId, page: 109, imageId: 'image-001', take: 'p1' }), `${bookId}/audios/page-109/images/image-001_p1.mp3`);
  assert.equal(buildImageAudioQueue({ bookId, page: 109, imageId: 'image-001' }).filter(item => item.type === 'audio').length, 3);
});
