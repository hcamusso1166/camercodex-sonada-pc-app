# Auditoría de audio — El príncipe Caspian

## Identidad

- **bookId:** `el-principe-caspian`
- **tag:** `04`
- **título:** El príncipe Caspian
- **autor:** C. S. Lewis
- **idioma:** `es`
- **colección:** Las crónicas de Narnia
- **raíz:** `books/el-principe-caspian`
- **rango editorial:** 11–235

## Inventario físico

- MP3 totales: **15.328**.
- Bytes MP3: **178.134.912**.
- MP3 de lectura: **15.218**.
- MP3 de imágenes: **108**.
- MP3 de metadatos: **2** (`title.mp3` y `author.mp3`).
- Carpetas de página con audio: **218**.
- Archivos vacíos: **0**.
- Archivos no MP3: **0**.
- Nombres inesperados: **0**.

## Páginas

- Páginas presentes: 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 57, 58, 59, 60, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70, 71, 72, 73, 75, 76, 77, 78, 79, 80, 81, 82, 83, 84, 85, 86, 87, 88, 89, 90, 91, 92, 93, 95, 96, 97, 98, 99, 100, 101, 102, 103, 104, 105, 106, 107, 108, 109, 110, 111, 112, 113, 114, 115, 116, 117, 118, 119, 120, 121, 122, 123, 124, 125, 126, 127, 129, 130, 131, 132, 133, 134, 135, 136, 137, 138, 139, 140, 141, 142, 143, 144, 145, 146, 147, 148, 149, 150, 151, 152, 153, 154, 155, 156, 157, 158, 159, 160, 161, 162, 163, 164, 165, 166, 167, 168, 169, 170, 171, 172, 173, 174, 175, 176, 177, 178, 179, 180, 181, 182, 183, 184, 185, 187, 188, 189, 190, 191, 192, 193, 194, 195, 196, 197, 198, 199, 200, 201, 202, 203, 205, 206, 207, 208, 209, 210, 211, 212, 213, 214, 215, 216, 217, 218, 219, 220, 221, 223, 224, 225, 226, 227, 228, 229, 230, 231, 232, 233, 234, 235.
- Páginas ausentes: **56, 74, 94, 128, 186, 204 y 222**.
- Page JSON de lectura materializados: **215**.
- Páginas exclusivamente de imagen, con `lineCount: 0` y sin page JSON: **23, 41 y 179**.

## Renglones y partes

- Renglones: **5.243**.
- Una parte: **185**.
- Dos partes: **141**.
- Tres partes: **4.917**.
- `defaultPartCount`: **3**.
- Reconciliación: `185×1 + 141×2 + 4.917×3 = 15.218` MP3 de lectura.
- Los `partCountOverrides` contienen exclusivamente los renglones físicos con una o dos partes.

## Imágenes

- Identidades de imagen: **36**, todas `image-001`.
- Páginas con imagen: 18, 23, 29, 35, 41, 46, 48, 52, 59, 62, 67, 85, 87, 96, 97, 104, 108, 112, 120, 121, 137, 138, 151, 152, 162, 165, 166, 171, 179, 196, 200, 201, 206, 218, 227, 235.
- Cada identidad dispone de `p1`, `p2` y `p3`.
- Reconciliación: `36×3 = 108` MP3 de imagen.

## Reconciliación total y plan offline

- Reconciliación física: `15.218 + 108 + 2 = 15.328` MP3.
- Plan offline: **15.329** URLs (`15.328` MP3 + `runtime-manifest.json`).
- URLs duplicadas: **0**.
- URLs faltantes: **0**.
- Assets fuera de `books/el-principe-caspian`: **0**.
- Caché dedicada: `camer-codex-bti-offline-v1-el-principe-caspian`.
- Los MP3 no se incorporan al caché general.

## Validación

La auditoría automatizada focalizada se encuentra en `test/princeCaspianBtiV2Integration.test.js` y verifica el contrato editorial, el árbol físico, el manifiesto runtime, el índice de imágenes, el plan offline y su materialización. También se ejecutan las suites focalizadas de RuntimeManifest, OfflinePlan, OfflineAssets, OfflinePreparation, OfflineApp, Service Worker, resolución BTI V2 y SHOW_SKETCH, además de la suite completa del repositorio.
