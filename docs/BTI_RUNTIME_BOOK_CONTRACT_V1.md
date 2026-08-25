# BTI_RUNTIME_BOOK_CONTRACT_V1

Book Test Imposible V2 resuelve cada libro mediante `books/<bookId>/runtime-manifest.json`:

`BOOK -> runtime-manifest.json -> pages / lineCount, audio, images / imageId, readingRules`

**El contenido literario de los renglones NO forma parte del contrato runtime de Book Test Imposible.**

- `pages` declara cada página por clave de tres dígitos y su `lineCount`.
- `lineCount >= 0`. Un valor `0` significa que la página existe pero no posee renglones seleccionables; puede igualmente contener imágenes operacionales.
- En `schemaVersion: 1`, las convenciones de `audio` son fijas, no configurables libremente:
  - `profile`: `"bti-audio-v1"`
  - `meta.title`: `"audios/_meta/title.mp3"`
  - `meta.author`: `"audios/_meta/author.mp3"`
  - `reading.takes`: `["p1", "p2", "p3"]`
  - `reading.pathPattern`: `"audios/page-{page3}/line-{line3}_{take}.mp3"`
  - `images.takes`: `["p1", "p2", "p3"]`
  - `images.pathPattern`: `"audios/page-{page3}/images/{imageId}_{take}.mp3"`
- `images` contiene exclusivamente `page` e `imageId`, incluso para páginas con `lineCount: 0`.
- `readingRules` expresa excepciones operacionales mediante `playLine`, `extendWithNextLine` y `announceLines`.

## Agregar un libro

1. Agregar sus metadatos y `runtimeManifest` en `books/index.json`.
2. Crear `runtime-manifest.json` con `schemaVersion: 1` y el `bookId` correspondiente.
3. Declarar todas las páginas y su `lineCount`.
4. Declarar las imágenes mediante `page` e `imageId`.
5. Incorporar los audios siguiendo las convenciones de paths y takes del manifest.
6. Agregar `readingRules` únicamente cuando existan excepciones operacionales.
