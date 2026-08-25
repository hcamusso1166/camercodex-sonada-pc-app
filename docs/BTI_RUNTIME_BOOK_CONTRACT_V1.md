# BTI_RUNTIME_BOOK_CONTRACT_V1

Book Test Imposible V2 resuelve cada libro mediante `books/<bookId>/runtime-manifest.json`:

`BOOK -> runtime-manifest.json -> pages / lineCount, audio, images / imageId, readingRules`

**El contenido literario de los renglones NO forma parte del contrato runtime de Book Test Imposible.**

- `pages` declara cada página por clave de tres dígitos y su `lineCount`.
- `lineCount >= 0`. Un valor `0` significa que la página existe pero no posee renglones seleccionables; puede igualmente contener imágenes operacionales.
- `audio` define el perfil, los takes y las convenciones determinísticas para audios meta, de lectura y de imágenes.
- `images` contiene exclusivamente `page` e `imageId`, incluso para páginas con `lineCount: 0`.
- `readingRules` expresa excepciones operacionales mediante `playLine`, `extendWithNextLine` y `announceLines`.

## Agregar un libro

1. Agregar sus metadatos y `runtimeManifest` en `books/index.json`.
2. Crear `runtime-manifest.json` con `schemaVersion: 1` y el `bookId` correspondiente.
3. Declarar todas las páginas y su `lineCount`.
4. Declarar las imágenes mediante `page` e `imageId`.
5. Incorporar los audios siguiendo las convenciones de paths y takes del manifest.
6. Agregar `readingRules` únicamente cuando existan excepciones operacionales.
