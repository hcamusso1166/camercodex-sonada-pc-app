const test = require('node:test');
const assert = require('node:assert/strict');
const manifest = require('../books/narnia-el-sobrino-del-mago/runtime-manifest.json');
const { resolveManifestBookImage, buildImageAudioPath, buildImageAudioQueue } = require('../js/rutinas/bookTestImposibleV2ImageEncore.js');
const bookId = manifest.bookId;

test('Image Encore conserva navegación same/facing/one/multiple/not-found', () => {
  assert.equal(resolveManifestBookImage({ bookId, sourcePage: 11, images: manifest.images }).navigationType, 'SAME_PAGE');
  assert.equal(resolveManifestBookImage({ bookId, sourcePage: 60, images: manifest.images }).navigationType, 'FACING_PAGE');
  assert.equal(resolveManifestBookImage({ bookId, sourcePage: 77, images: manifest.images }).navigationType, 'TURN_ONE_PAGE');
  assert.equal(resolveManifestBookImage({ bookId, sourcePage: 57, images: manifest.images }).navigationType, 'TURN_MULTIPLE_PAGES');
  assert.equal(resolveManifestBookImage({ bookId, sourcePage: 999, images: manifest.images }).navigationType, 'NO_IMAGE_FOUND');
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

test('audio de imagen se deriva por convención con tres takes', () => {
  assert.equal(buildImageAudioPath({ bookId, page: 109, imageId: 'image-001', take: 'p1' }), `${bookId}/audios/page-109/images/image-001_p1.mp3`);
  assert.equal(buildImageAudioQueue({ bookId, page: 109, imageId: 'image-001' }).filter(item => item.type === 'audio').length, 3);
});
