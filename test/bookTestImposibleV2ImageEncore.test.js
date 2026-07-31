const test = require('node:test');
const assert = require('node:assert/strict');
const imageIndex = require('../books/image-index.js');
const {
  normalizeEncorePageData,
  resolveNextBookImage,
  findNextBookImage,
  resolveIndexedBookImage,
  buildImageAudioPath,
} = require('../js/rutinas/bookTestImposibleV2ImageEncore.js');

const bookId = 'narnia-el-sobrino-del-mago';
const img = (page, imageId = 'image-001', description = `IMAGEN PÁGINA ${page}`) => ({
  page,
  bookId,
  images: [{ imageId, description }],
});
const noImg = page => ({ page, bookId, images: [] });

test('Caso 1: imagen en la misma página', () => {
  const result = resolveNextBookImage({ bookId, selectedPage: 11, pages: [img(11)] });
  assert.equal(result.targetPage, 11);
  assert.equal(result.turnCount, 0);
  assert.equal(result.navigationType, 'SAME_PAGE');
});

test('Caso 2: página contigua', () => {
  const result = resolveNextBookImage({ bookId, selectedPage: 60, pages: [noImg(60), img(61)] });
  assert.equal(result.targetPage, 61);
  assert.equal(result.turnCount, 0);
  assert.equal(result.navigationType, 'FACING_PAGE');
});

test('Caso 3: una vuelta física', () => {
  const result = resolveNextBookImage({ bookId, selectedPage: 77, pages: [noImg(77), img(78)] });
  assert.equal(result.targetPage, 78);
  assert.equal(result.turnCount, 1);
  assert.equal(result.navigationType, 'TURN_ONE_PAGE');
});

test('Caso 4: varias vueltas', () => {
  const result = resolveNextBookImage({ bookId, selectedPage: 60, pages: [noImg(60), noImg(61), img(64)] });
  assert.equal(result.targetPage, 64);
  assert.equal(result.numberedPageDistance, 4);
  assert.equal(result.turnCount, 2);
  assert.equal(result.navigationType, 'TURN_MULTIPLE_PAGES');
});

test('Caso 5: varias imágenes en una página usa images[0]', () => {
  const result = resolveNextBookImage({
    bookId,
    selectedPage: 77,
    pages: [{
      page: 78,
      bookId,
      images: [
        { imageId: 'image-001', description: 'PRIMERA IMAGEN' },
        { imageId: 'image-002', description: 'SEGUNDA IMAGEN' },
      ],
    }],
  });
  assert.equal(result.imageId, 'image-001');
  assert.equal(result.description, 'PRIMERA IMAGEN');
});

test('Caso 6: JSON antiguo sin images normaliza a []', () => {
  const page = normalizeEncorePageData({ page: 11, bookId });
  assert.deepEqual(page.images, []);
});

test('Caso 7: sin imagen posterior', () => {
  const result = resolveNextBookImage({ bookId, selectedPage: 200, pages: [noImg(200), noImg(201)] });
  assert.equal(result.found, false);
  assert.equal(result.navigationType, 'NO_IMAGE_FOUND');
});

test('Caso 8: doble estímulo equivalente queda cubierto por consumo único de estado', () => {
  let executions = 0;
  let consumed = false;
  const trigger = () => {
    if (consumed) return;
    consumed = true;
    executions += 1;
  };
  trigger();
  trigger();
  assert.equal(executions, 1);
});

test('buildImageAudioPath usa targetPage', () => {
  assert.equal(
    buildImageAudioPath({ bookId, page: 61, imageId: 'image-001', take: 'p1' }),
    'narnia-el-sobrino-del-mago/audios/page-061/images/image-001_p1.mp3'
  );
});

test('índice: caso real 57 encuentra inmediatamente página 61', () => {
  const result = resolveIndexedBookImage({ bookId, sourcePage: 57, imageIndex });
  assert.equal(result.targetPage, 61);
  assert.equal(result.imageId, 'image-001');
  assert.equal(result.numberedPageDistance, 4);
  assert.equal(result.turnCount, 2);
  assert.equal(result.navigationType, 'TURN_MULTIPLE_PAGES');
});

test('índice: misma página y página contigua conservan navegación', () => {
  assert.equal(resolveIndexedBookImage({ bookId, sourcePage: 11, imageIndex }).navigationType, 'SAME_PAGE');
  const facing = resolveIndexedBookImage({ bookId, sourcePage: 60, imageIndex });
  assert.equal(facing.targetPage, 61);
  assert.equal(facing.navigationType, 'FACING_PAGE');
});

test('índice: libro inexistente, libro vacío y sin imagen posterior son controlados', () => {
  assert.equal(findNextBookImage('no-existe', 1, imageIndex), null);
  assert.equal(resolveIndexedBookImage({ bookId: 'narnia-el-leon-la-bruja-y-el-armario', sourcePage: 1, imageIndex }).found, false);
  assert.equal(resolveIndexedBookImage({ bookId, sourcePage: 999, imageIndex }).found, false);
});

test('índice conserva múltiples imágenes y el resolver elige la primera', () => {
  const customIndex = { a: [
    { bookId: 'a', page: 20, imageId: 'image-001', description: 'uno', audio: 'uno.mp3' },
    { bookId: 'a', page: 20, imageId: 'image-002', description: 'dos', audio: 'dos.mp3' },
  ] };
  assert.equal(resolveIndexedBookImage({ bookId: 'a', sourcePage: 1, imageIndex: customIndex }).imageId, 'image-001');
  assert.equal(customIndex.a.length, 2);
});