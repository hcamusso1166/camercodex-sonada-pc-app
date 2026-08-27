# BTI_RUNTIME_BOOK_CONTRACT_V1

Book Test Imposible V2 resuelve cada libro mediante `books/<bookId>/runtime-manifest.json`:

`BOOK -> runtime-manifest.json -> pages / lineCount, audio, images / imageId`

**El contenido literario de los renglones NO forma parte del contrato runtime de Book Test Imposible.**

- `pages` declara cada página por clave de tres dígitos y su `lineCount`.
- `lineCount >= 0`. Un valor `0` significa que la página existe pero no posee renglones seleccionables; puede igualmente contener imágenes operacionales.
- En `schemaVersion: 1`, las convenciones de `audio` son fijas, no configurables libremente:
  - `profile`: `"bti-audio-v1"`
  - `meta.title`: `"audios/_meta/title.mp3"`
  - `meta.author`: `"audios/_meta/author.mp3"`
  - `reading.defaultPartCount`: `3`
  - `reading.takes`: `["p1", "p2", "p3"]`
  - `reading.pathPattern`: `"audios/page-{page3}/line-{line3}_{take}.mp3"`
  - `images.takes`: `["p1", "p2", "p3"]`
  - `images.pathPattern`: `"audios/page-{page3}/images/{imageId}_{take}.mp3"`
- `pages.<page3>.partCountOverrides` es opcional y sólo admite valores `1` o `2`; la ausencia de override significa `3` partes.
- `p1`, `p2` y `p3` son partes secuenciales de un mismo renglón, no takes alternativos.
- Cada target completo se reproduce dos veces. La cantidad de repeticiones es independiente de la cantidad de partes del renglón.
- `images` contiene exclusivamente `page` e `imageId`, incluso para páginas con `lineCount: 0`, sin `description` ni contenido literario:

```json
{
  "page": 11,
  "imageId": "image-001"
}
```

## Regla de producción y auditoría de partes

El tooling de producción y auditoría deriva la cantidad de partes desde los `sayLines` legacy:

```js
const wordCount = line.trim().split(/\s+/).filter(Boolean).length;
const partCount = Math.min(3, wordCount);
```

Esta regla es exclusivamente de build/auditoría. El runtime del show no lee `sayLines`: resuelve la cantidad desde `partCountOverrides` y `audio.reading.defaultPartCount` en el manifest.

## BTI_CYCLIC_READING_PLAN_V1

El libro es una secuencia cíclica de todos sus renglones seleccionables, ordenada por página y renglón. Cada selección positiva produce exactamente dos targets. Las páginas con `lineCount: 0` se saltan; el final de una página continúa en la siguiente página utilizable y el final del libro vuelve al primer renglón utilizable. La selección original se conserva separada del reading plan, incluso cuando el primer target debe normalizarse.

## Agregar un libro

1. Agregar sus metadatos y `runtimeManifest` en `books/index.json`.
2. Crear `runtime-manifest.json` con `schemaVersion: 1` y el `bookId` correspondiente.
3. Declarar todas las páginas y su `lineCount`.
4. Declarar las imágenes mediante `page` e `imageId`.
5. Incorporar los audios siguiendo las convenciones de paths y takes del manifest.
