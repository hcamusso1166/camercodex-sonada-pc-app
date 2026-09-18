# Auditoría física de audios — Libro 03

## Identidad y precheck

Repositorio: `hcamusso1166/camercodex-sonada-pc-app`. Raíz real: `C:/CamerDev/camercodex-sonada-pc-app`. Origin: `https://github.com/hcamusso1166/camercodex-sonada-pc-app.git`. Rama: `codex/add-book-03-el-caballo-y-el-muchacho-v1`.
HEAD y commit de audios: `d41966fdbc2f849f8014ad33a3c2d364632391c4` (`Add El caballo y el muchacho audio assets`). Baseline local `origin/develop`: `3fba79701a632122806ba3b5874198e48dfb99ff`. Referencia local de la rama remota: `d41966fdbc2f849f8014ad33a3c2d364632391c4`. Relación develop...HEAD: 0 commits exclusivos de develop, 1 exclusivo de HEAD. Working tree inicial limpio. Se leyó completamente el único AGENTS.md encontrado, en la raíz, y se comprobaron sus ancestros.
No se actualizó desde develop ni se cambió de rama. La verificación remota inicial no fue posible: fetch denegó escritura en `.git/FETCH_HEAD`; ls-remote falló por certificado TLS y, usando schannel, por `SEC_E_NO_CREDENTIALS`. Las referencias anteriores son locales, no una afirmación del estado actual de GitHub.

## Fecha y metodología

Fecha: 2026-09-18 (America/Buenos_Aires). Enumeración recursiva con Python 3.12/pathlib de todos los archivos y directorios; expresiones regulares con coincidencia completa, tamaño en bytes y SHA-256 de cada archivo, sin modificar MP3. Lectura de book.json, todos los pages/*.json y runtime-manifest.json de los libros 01/02. Sin escuchar ni transcribir audios. Renglón inferido significa un identificador físico distinto, no texto reconstruido. partCount físico es el número de sufijos presentes, y sólo puede tratarse como secuencia cuando no hay huecos.
Comandos de precheck: `git -c safe.directory=C:/CamerDev/camercodex-sonada-pc-app rev-parse --show-toplevel`, `remote -v`, `status --porcelain`, `branch --show-current`, `rev-parse HEAD origin/develop origin/codex/add-book-03-el-caballo-y-el-muchacho-v1`, `rev-list --left-right --count origin/develop...HEAD`, `show -s --format="%H %s" d41966fdbc2f849f8014ad33a3c2d364632391c4`, `fetch origin --prune`, `ls-remote origin refs/heads/develop refs/heads/codex/add-book-03-el-caballo-y-el-muchacho-v1`.

## Resumen cuantitativo

- MP3: **16403**; archivos totales: 16403; tamaño: 204687360 bytes (204.69 MB decimales; 195.21 MiB).
- Rango físico: **11–241**; páginas presentes: **225**. Páginas ausentes dentro del rango: 30, 68, 120, 154, 208, 226.
- Renglones inferidos: 5554; distribución por partCount: {1: 122, 2: 98, 3: 5334}; máximo: 3. Sufijos de lectura: {1: 5554, 2: 5432, 3: 5334}.
- Páginas con imágenes: 27 (14, 43, 50, 58–59, 70, 84, 93, 97, 100, 108, 122, 130, 140, 150, 153, 167–168, 178–179, 192, 194, 211, 220–221, 231, 241); audios de imagen: 81; identificadores página/imagen: 27.
- Especiales reconocidos: 2. Vacíos: 0; extensiones distintas: 0; nombres inesperados: 0; directorios inesperados: 0; rutas con mayúsculas: 0.

## Páginas presentes y tabla completa

Presentes: 11–29, 31–67, 69–119, 121–153, 155–207, 209–225, 227–241. No se infieren páginas fuera del rango físico; el rango editorial requiere una fuente adicional. MP3 totales incluye lectura e imágenes. Los especiales _meta no pertenecen a ninguna página.

| Página | MP3 totales | Renglones inferidos | Rango de renglones | Partes detectadas (renglones por partCount) | Especiales | Audios imagen | Anomalías |
|---:|---:|---:|---|---|---:|---:|---|
| 011 | 51 | 17 | 001–017 | 3 partes: 17 | 0 | 0 | ninguna |
| 012 | 79 | 27 | 001–027 | 1 partes: 1; 3 partes: 26 | 0 | 0 | ninguna |
| 013 | 81 | 27 | 001–027 | 3 partes: 27 | 0 | 0 | ninguna |
| 014 | 15 | 4 | 001–004 | 3 partes: 4 | 0 | 3 | ninguna |
| 015 | 80 | 27 | 001–027 | 2 partes: 1; 3 partes: 26 | 0 | 0 | ninguna |
| 016 | 79 | 27 | 001–027 | 1 partes: 1; 3 partes: 26 | 0 | 0 | ninguna |
| 017 | 81 | 27 | 001–027 | 3 partes: 27 | 0 | 0 | ninguna |
| 018 | 79 | 27 | 001–027 | 1 partes: 1; 3 partes: 26 | 0 | 0 | ninguna |
| 019 | 80 | 27 | 001–027 | 2 partes: 1; 3 partes: 26 | 0 | 0 | ninguna |
| 020 | 79 | 27 | 001–027 | 1 partes: 1; 3 partes: 26 | 0 | 0 | ninguna |
| 021 | 80 | 27 | 001–027 | 2 partes: 1; 3 partes: 26 | 0 | 0 | ninguna |
| 022 | 81 | 27 | 001–027 | 3 partes: 27 | 0 | 0 | ninguna |
| 023 | 80 | 27 | 001–027 | 2 partes: 1; 3 partes: 26 | 0 | 0 | ninguna |
| 024 | 80 | 27 | 001–027 | 2 partes: 1; 3 partes: 26 | 0 | 0 | ninguna |
| 025 | 76 | 27 | 001–027 | 1 partes: 2; 2 partes: 1; 3 partes: 24 | 0 | 0 | ninguna |
| 026 | 77 | 27 | 001–027 | 1 partes: 2; 3 partes: 25 | 0 | 0 | ninguna |
| 027 | 79 | 27 | 001–027 | 1 partes: 1; 3 partes: 26 | 0 | 0 | ninguna |
| 028 | 81 | 27 | 001–027 | 3 partes: 27 | 0 | 0 | ninguna |
| 029 | 59 | 21 | 001–021 | 1 partes: 2; 3 partes: 19 | 0 | 0 | ninguna |
| 031 | 51 | 17 | 001–017 | 3 partes: 17 | 0 | 0 | ninguna |
| 032 | 79 | 27 | 001–027 | 1 partes: 1; 3 partes: 26 | 0 | 0 | ninguna |
| 033 | 78 | 27 | 001–027 | 1 partes: 1; 2 partes: 1; 3 partes: 25 | 0 | 0 | ninguna |
| 034 | 78 | 27 | 001–027 | 1 partes: 1; 2 partes: 1; 3 partes: 25 | 0 | 0 | ninguna |
| 035 | 77 | 27 | 001–027 | 1 partes: 2; 3 partes: 25 | 0 | 0 | ninguna |
| 036 | 79 | 27 | 001–027 | 1 partes: 1; 3 partes: 26 | 0 | 0 | ninguna |
| 037 | 81 | 27 | 001–027 | 3 partes: 27 | 0 | 0 | ninguna |
| 038 | 79 | 27 | 001–027 | 1 partes: 1; 3 partes: 26 | 0 | 0 | ninguna |
| 039 | 78 | 27 | 001–027 | 1 partes: 1; 2 partes: 1; 3 partes: 25 | 0 | 0 | ninguna |
| 040 | 81 | 27 | 001–027 | 3 partes: 27 | 0 | 0 | ninguna |
| 041 | 76 | 27 | 001–027 | 1 partes: 2; 2 partes: 1; 3 partes: 24 | 0 | 0 | ninguna |
| 042 | 81 | 27 | 001–027 | 3 partes: 27 | 0 | 0 | ninguna |
| 043 | 49 | 16 | 001–016 | 1 partes: 1; 3 partes: 15 | 0 | 3 | ninguna |
| 044 | 80 | 27 | 001–027 | 2 partes: 1; 3 partes: 26 | 0 | 0 | ninguna |
| 045 | 76 | 27 | 001–027 | 1 partes: 2; 2 partes: 1; 3 partes: 24 | 0 | 0 | ninguna |
| 046 | 81 | 27 | 001–027 | 3 partes: 27 | 0 | 0 | ninguna |
| 047 | 76 | 27 | 001–027 | 1 partes: 2; 2 partes: 1; 3 partes: 24 | 0 | 0 | ninguna |
| 048 | 80 | 27 | 001–027 | 2 partes: 1; 3 partes: 26 | 0 | 0 | ninguna |
| 049 | 79 | 27 | 001–027 | 1 partes: 1; 3 partes: 26 | 0 | 0 | ninguna |
| 050 | 18 | 5 | 001–005 | 3 partes: 5 | 0 | 3 | ninguna |
| 051 | 51 | 17 | 001–017 | 3 partes: 17 | 0 | 0 | ninguna |
| 052 | 79 | 27 | 001–027 | 1 partes: 1; 3 partes: 26 | 0 | 0 | ninguna |
| 053 | 81 | 27 | 001–027 | 3 partes: 27 | 0 | 0 | ninguna |
| 054 | 81 | 27 | 001–027 | 3 partes: 27 | 0 | 0 | ninguna |
| 055 | 77 | 27 | 001–027 | 1 partes: 2; 3 partes: 25 | 0 | 0 | ninguna |
| 056 | 81 | 27 | 001–027 | 3 partes: 27 | 0 | 0 | ninguna |
| 057 | 81 | 27 | 001–027 | 3 partes: 27 | 0 | 0 | ninguna |
| 058 | 70 | 23 | 001–023 | 1 partes: 1; 3 partes: 22 | 0 | 3 | ninguna |
| 059 | 67 | 22 | 001–022 | 1 partes: 1; 3 partes: 21 | 0 | 3 | ninguna |
| 060 | 81 | 27 | 001–027 | 3 partes: 27 | 0 | 0 | ninguna |
| 061 | 81 | 27 | 001–027 | 3 partes: 27 | 0 | 0 | ninguna |
| 062 | 81 | 27 | 001–027 | 3 partes: 27 | 0 | 0 | ninguna |
| 063 | 77 | 27 | 001–027 | 1 partes: 2; 3 partes: 25 | 0 | 0 | ninguna |
| 064 | 79 | 27 | 001–027 | 1 partes: 1; 3 partes: 26 | 0 | 0 | ninguna |
| 065 | 79 | 27 | 001–027 | 1 partes: 1; 3 partes: 26 | 0 | 0 | ninguna |
| 066 | 81 | 27 | 001–027 | 3 partes: 27 | 0 | 0 | ninguna |
| 067 | 39 | 13 | 001–013 | 3 partes: 13 | 0 | 0 | ninguna |
| 069 | 51 | 17 | 001–017 | 3 partes: 17 | 0 | 0 | ninguna |
| 070 | 51 | 17 | 001–017 | 1 partes: 1; 2 partes: 1; 3 partes: 15 | 0 | 3 | ninguna |
| 071 | 81 | 27 | 001–027 | 3 partes: 27 | 0 | 0 | ninguna |
| 072 | 80 | 27 | 001–027 | 2 partes: 1; 3 partes: 26 | 0 | 0 | ninguna |
| 073 | 80 | 27 | 001–027 | 2 partes: 1; 3 partes: 26 | 0 | 0 | ninguna |
| 074 | 81 | 27 | 001–027 | 3 partes: 27 | 0 | 0 | ninguna |
| 075 | 81 | 27 | 001–027 | 3 partes: 27 | 0 | 0 | ninguna |
| 076 | 78 | 27 | 001–027 | 1 partes: 1; 2 partes: 1; 3 partes: 25 | 0 | 0 | ninguna |
| 077 | 81 | 27 | 001–027 | 3 partes: 27 | 0 | 0 | ninguna |
| 078 | 81 | 27 | 001–027 | 3 partes: 27 | 0 | 0 | ninguna |
| 079 | 81 | 27 | 001–027 | 3 partes: 27 | 0 | 0 | ninguna |
| 080 | 81 | 27 | 001–027 | 3 partes: 27 | 0 | 0 | ninguna |
| 081 | 81 | 27 | 001–027 | 3 partes: 27 | 0 | 0 | ninguna |
| 082 | 81 | 27 | 001–027 | 3 partes: 27 | 0 | 0 | ninguna |
| 083 | 81 | 27 | 001–027 | 3 partes: 27 | 0 | 0 | ninguna |
| 084 | 82 | 27 | 001–027 | 1 partes: 1; 3 partes: 26 | 0 | 3 | ninguna |
| 085 | 79 | 27 | 001–027 | 1 partes: 1; 3 partes: 26 | 0 | 0 | ninguna |
| 086 | 79 | 27 | 001–027 | 1 partes: 1; 3 partes: 26 | 0 | 0 | ninguna |
| 087 | 49 | 17 | 001–017 | 2 partes: 2; 3 partes: 15 | 0 | 0 | ninguna |
| 088 | 81 | 27 | 001–027 | 3 partes: 27 | 0 | 0 | ninguna |
| 089 | 79 | 27 | 001–027 | 2 partes: 2; 3 partes: 25 | 0 | 0 | ninguna |
| 090 | 80 | 27 | 001–027 | 2 partes: 1; 3 partes: 26 | 0 | 0 | ninguna |
| 091 | 80 | 27 | 001–027 | 2 partes: 1; 3 partes: 26 | 0 | 0 | ninguna |
| 092 | 79 | 27 | 001–027 | 1 partes: 1; 3 partes: 26 | 0 | 0 | ninguna |
| 093 | 50 | 16 | 001–016 | 2 partes: 1; 3 partes: 15 | 0 | 3 | ninguna |
| 094 | 75 | 27 | 001–027 | 1 partes: 2; 2 partes: 2; 3 partes: 23 | 0 | 0 | ninguna |
| 095 | 79 | 27 | 001–027 | 2 partes: 2; 3 partes: 25 | 0 | 0 | ninguna |
| 096 | 79 | 27 | 001–027 | 1 partes: 1; 3 partes: 26 | 0 | 0 | ninguna |
| 097 | 57 | 18 | 001–018 | 3 partes: 18 | 0 | 3 | ninguna |
| 098 | 81 | 27 | 001–027 | 3 partes: 27 | 0 | 0 | ninguna |
| 099 | 81 | 27 | 001–027 | 3 partes: 27 | 0 | 0 | ninguna |
| 100 | 81 | 27 | 001–027 | 1 partes: 1; 2 partes: 1; 3 partes: 25 | 0 | 3 | ninguna |
| 101 | 78 | 27 | 001–027 | 1 partes: 1; 2 partes: 1; 3 partes: 25 | 0 | 0 | ninguna |
| 102 | 81 | 27 | 001–027 | 3 partes: 27 | 0 | 0 | ninguna |
| 103 | 78 | 27 | 001–027 | 1 partes: 1; 2 partes: 1; 3 partes: 25 | 0 | 0 | ninguna |
| 104 | 24 | 8 | 001–008 | 3 partes: 8 | 0 | 0 | ninguna |
| 105 | 51 | 17 | 001–017 | 3 partes: 17 | 0 | 0 | ninguna |
| 106 | 81 | 27 | 001–027 | 3 partes: 27 | 0 | 0 | ninguna |
| 107 | 81 | 27 | 001–027 | 3 partes: 27 | 0 | 0 | ninguna |
| 108 | 48 | 15 | 001–015 | 3 partes: 15 | 0 | 3 | ninguna |
| 109 | 81 | 27 | 001–027 | 3 partes: 27 | 0 | 0 | ninguna |
| 110 | 81 | 27 | 001–027 | 3 partes: 27 | 0 | 0 | ninguna |
| 111 | 81 | 27 | 001–027 | 3 partes: 27 | 0 | 0 | ninguna |
| 112 | 81 | 27 | 001–027 | 3 partes: 27 | 0 | 0 | ninguna |
| 113 | 80 | 27 | 001–027 | 2 partes: 1; 3 partes: 26 | 0 | 0 | ninguna |
| 114 | 81 | 27 | 001–027 | 3 partes: 27 | 0 | 0 | ninguna |
| 115 | 80 | 27 | 001–027 | 2 partes: 1; 3 partes: 26 | 0 | 0 | ninguna |
| 116 | 81 | 27 | 001–027 | 3 partes: 27 | 0 | 0 | ninguna |
| 117 | 81 | 27 | 001–027 | 3 partes: 27 | 0 | 0 | ninguna |
| 118 | 81 | 27 | 001–027 | 3 partes: 27 | 0 | 0 | ninguna |
| 119 | 29 | 10 | 001–010 | 2 partes: 1; 3 partes: 9 | 0 | 0 | ninguna |
| 121 | 51 | 17 | 001–017 | 3 partes: 17 | 0 | 0 | ninguna |
| 122 | 43 | 14 | 001–014 | 1 partes: 1; 3 partes: 13 | 0 | 3 | ninguna |
| 123 | 80 | 27 | 001–027 | 2 partes: 1; 3 partes: 26 | 0 | 0 | ninguna |
| 124 | 80 | 27 | 001–027 | 2 partes: 1; 3 partes: 26 | 0 | 0 | ninguna |
| 125 | 78 | 27 | 001–027 | 1 partes: 1; 2 partes: 1; 3 partes: 25 | 0 | 0 | ninguna |
| 126 | 81 | 27 | 001–027 | 3 partes: 27 | 0 | 0 | ninguna |
| 127 | 80 | 27 | 001–027 | 2 partes: 1; 3 partes: 26 | 0 | 0 | ninguna |
| 128 | 81 | 27 | 001–027 | 3 partes: 27 | 0 | 0 | ninguna |
| 129 | 81 | 27 | 001–027 | 3 partes: 27 | 0 | 0 | ninguna |
| 130 | 43 | 14 | 001–014 | 1 partes: 1; 3 partes: 13 | 0 | 3 | ninguna |
| 131 | 81 | 27 | 001–027 | 3 partes: 27 | 0 | 0 | ninguna |
| 132 | 73 | 27 | 001–027 | 1 partes: 3; 2 partes: 2; 3 partes: 22 | 0 | 0 | ninguna |
| 133 | 80 | 27 | 001–027 | 2 partes: 1; 3 partes: 26 | 0 | 0 | ninguna |
| 134 | 78 | 27 | 001–027 | 1 partes: 1; 2 partes: 1; 3 partes: 25 | 0 | 0 | ninguna |
| 135 | 77 | 27 | 001–027 | 1 partes: 2; 3 partes: 25 | 0 | 0 | ninguna |
| 136 | 81 | 27 | 001–027 | 3 partes: 27 | 0 | 0 | ninguna |
| 137 | 81 | 27 | 001–027 | 3 partes: 27 | 0 | 0 | ninguna |
| 138 | 24 | 8 | 001–008 | 3 partes: 8 | 0 | 0 | ninguna |
| 139 | 51 | 17 | 001–017 | 3 partes: 17 | 0 | 0 | ninguna |
| 140 | 82 | 27 | 001–027 | 2 partes: 2; 3 partes: 25 | 0 | 3 | ninguna |
| 141 | 78 | 27 | 001–027 | 1 partes: 1; 2 partes: 1; 3 partes: 25 | 0 | 0 | ninguna |
| 142 | 79 | 27 | 001–027 | 2 partes: 2; 3 partes: 25 | 0 | 0 | ninguna |
| 143 | 81 | 27 | 001–027 | 3 partes: 27 | 0 | 0 | ninguna |
| 144 | 81 | 27 | 001–027 | 3 partes: 27 | 0 | 0 | ninguna |
| 145 | 81 | 27 | 001–027 | 3 partes: 27 | 0 | 0 | ninguna |
| 146 | 78 | 27 | 001–027 | 1 partes: 1; 2 partes: 1; 3 partes: 25 | 0 | 0 | ninguna |
| 147 | 77 | 27 | 001–027 | 1 partes: 2; 3 partes: 25 | 0 | 0 | ninguna |
| 148 | 79 | 27 | 001–027 | 1 partes: 1; 3 partes: 26 | 0 | 0 | ninguna |
| 149 | 81 | 27 | 001–027 | 3 partes: 27 | 0 | 0 | ninguna |
| 150 | 82 | 27 | 001–027 | 2 partes: 2; 3 partes: 25 | 0 | 3 | ninguna |
| 151 | 80 | 27 | 001–027 | 2 partes: 1; 3 partes: 26 | 0 | 0 | ninguna |
| 152 | 77 | 27 | 001–027 | 1 partes: 2; 3 partes: 25 | 0 | 0 | ninguna |
| 153 | 14 | 4 | 001–004 | 2 partes: 1; 3 partes: 3 | 0 | 3 | ninguna |
| 155 | 49 | 17 | 001–017 | 1 partes: 1; 3 partes: 16 | 0 | 0 | ninguna |
| 156 | 81 | 27 | 001–027 | 3 partes: 27 | 0 | 0 | ninguna |
| 157 | 78 | 27 | 001–027 | 1 partes: 1; 2 partes: 1; 3 partes: 25 | 0 | 0 | ninguna |
| 158 | 79 | 27 | 001–027 | 1 partes: 1; 3 partes: 26 | 0 | 0 | ninguna |
| 159 | 73 | 27 | 001–027 | 1 partes: 3; 2 partes: 2; 3 partes: 22 | 0 | 0 | ninguna |
| 160 | 81 | 27 | 001–027 | 3 partes: 27 | 0 | 0 | ninguna |
| 161 | 80 | 27 | 001–027 | 2 partes: 1; 3 partes: 26 | 0 | 0 | ninguna |
| 162 | 79 | 27 | 001–027 | 1 partes: 1; 3 partes: 26 | 0 | 0 | ninguna |
| 163 | 81 | 27 | 001–027 | 3 partes: 27 | 0 | 0 | ninguna |
| 164 | 81 | 27 | 001–027 | 3 partes: 27 | 0 | 0 | ninguna |
| 165 | 81 | 27 | 001–027 | 3 partes: 27 | 0 | 0 | ninguna |
| 166 | 80 | 27 | 001–027 | 2 partes: 1; 3 partes: 26 | 0 | 0 | ninguna |
| 167 | 36 | 11 | 001–011 | 3 partes: 11 | 0 | 3 | ninguna |
| 168 | 49 | 16 | 001–016 | 1 partes: 1; 3 partes: 15 | 0 | 3 | ninguna |
| 169 | 77 | 27 | 001–027 | 1 partes: 2; 3 partes: 25 | 0 | 0 | ninguna |
| 170 | 76 | 27 | 001–027 | 1 partes: 2; 2 partes: 1; 3 partes: 24 | 0 | 0 | ninguna |
| 171 | 80 | 27 | 001–027 | 2 partes: 1; 3 partes: 26 | 0 | 0 | ninguna |
| 172 | 57 | 19 | 001–019 | 3 partes: 19 | 0 | 0 | ninguna |
| 173 | 51 | 17 | 001–017 | 3 partes: 17 | 0 | 0 | ninguna |
| 174 | 77 | 27 | 001–027 | 1 partes: 1; 2 partes: 2; 3 partes: 24 | 0 | 0 | ninguna |
| 175 | 77 | 27 | 001–027 | 1 partes: 2; 3 partes: 25 | 0 | 0 | ninguna |
| 176 | 75 | 27 | 001–027 | 1 partes: 2; 2 partes: 2; 3 partes: 23 | 0 | 0 | ninguna |
| 177 | 79 | 27 | 001–027 | 1 partes: 1; 3 partes: 26 | 0 | 0 | ninguna |
| 178 | 56 | 18 | 001–018 | 2 partes: 1; 3 partes: 17 | 0 | 3 | ninguna |
| 179 | 56 | 18 | 001–018 | 2 partes: 1; 3 partes: 17 | 0 | 3 | ninguna |
| 180 | 79 | 27 | 001–027 | 1 partes: 1; 3 partes: 26 | 0 | 0 | ninguna |
| 181 | 76 | 27 | 001–027 | 1 partes: 2; 2 partes: 1; 3 partes: 24 | 0 | 0 | ninguna |
| 182 | 81 | 27 | 001–027 | 3 partes: 27 | 0 | 0 | ninguna |
| 183 | 80 | 27 | 001–027 | 2 partes: 1; 3 partes: 26 | 0 | 0 | ninguna |
| 184 | 78 | 27 | 001–027 | 1 partes: 1; 2 partes: 1; 3 partes: 25 | 0 | 0 | ninguna |
| 185 | 79 | 27 | 001–027 | 1 partes: 1; 3 partes: 26 | 0 | 0 | ninguna |
| 186 | 78 | 27 | 001–027 | 1 partes: 1; 2 partes: 1; 3 partes: 25 | 0 | 0 | ninguna |
| 187 | 79 | 27 | 001–027 | 1 partes: 1; 3 partes: 26 | 0 | 0 | ninguna |
| 188 | 73 | 27 | 001–027 | 1 partes: 3; 2 partes: 2; 3 partes: 22 | 0 | 0 | ninguna |
| 189 | 79 | 27 | 001–027 | 1 partes: 1; 3 partes: 26 | 0 | 0 | ninguna |
| 190 | 22 | 8 | 001–008 | 1 partes: 1; 3 partes: 7 | 0 | 0 | ninguna |
| 191 | 51 | 17 | 001–017 | 3 partes: 17 | 0 | 0 | ninguna |
| 192 | 51 | 16 | 001–016 | 3 partes: 16 | 0 | 3 | ninguna |
| 193 | 74 | 27 | 001–027 | 1 partes: 2; 2 partes: 3; 3 partes: 22 | 0 | 0 | ninguna |
| 194 | 42 | 13 | 001–013 | 3 partes: 13 | 0 | 3 | ninguna |
| 195 | 81 | 27 | 001–027 | 3 partes: 27 | 0 | 0 | ninguna |
| 196 | 81 | 27 | 001–027 | 3 partes: 27 | 0 | 0 | ninguna |
| 197 | 78 | 27 | 001–027 | 2 partes: 3; 3 partes: 24 | 0 | 0 | ninguna |
| 198 | 80 | 27 | 001–027 | 2 partes: 1; 3 partes: 26 | 0 | 0 | ninguna |
| 199 | 79 | 27 | 001–027 | 1 partes: 1; 3 partes: 26 | 0 | 0 | ninguna |
| 200 | 81 | 27 | 001–027 | 3 partes: 27 | 0 | 0 | ninguna |
| 201 | 81 | 27 | 001–027 | 3 partes: 27 | 0 | 0 | ninguna |
| 202 | 81 | 27 | 001–027 | 3 partes: 27 | 0 | 0 | ninguna |
| 203 | 81 | 27 | 001–027 | 3 partes: 27 | 0 | 0 | ninguna |
| 204 | 78 | 27 | 001–027 | 1 partes: 1; 2 partes: 1; 3 partes: 25 | 0 | 0 | ninguna |
| 205 | 79 | 27 | 001–027 | 2 partes: 2; 3 partes: 25 | 0 | 0 | ninguna |
| 206 | 79 | 27 | 001–027 | 2 partes: 2; 3 partes: 25 | 0 | 0 | ninguna |
| 207 | 64 | 22 | 001–022 | 1 partes: 1; 3 partes: 21 | 0 | 0 | ninguna |
| 209 | 51 | 17 | 001–017 | 3 partes: 17 | 0 | 0 | ninguna |
| 210 | 78 | 27 | 001–027 | 1 partes: 1; 2 partes: 1; 3 partes: 25 | 0 | 0 | ninguna |
| 211 | 45 | 14 | 001–014 | 3 partes: 14 | 0 | 3 | ninguna |
| 212 | 76 | 27 | 001–027 | 1 partes: 2; 2 partes: 1; 3 partes: 24 | 0 | 0 | ninguna |
| 213 | 80 | 27 | 001–027 | 2 partes: 1; 3 partes: 26 | 0 | 0 | ninguna |
| 214 | 78 | 27 | 001–027 | 1 partes: 1; 2 partes: 1; 3 partes: 25 | 0 | 0 | ninguna |
| 215 | 75 | 27 | 001–027 | 1 partes: 2; 2 partes: 2; 3 partes: 23 | 0 | 0 | ninguna |
| 216 | 79 | 27 | 001–027 | 1 partes: 1; 3 partes: 26 | 0 | 0 | ninguna |
| 217 | 81 | 27 | 001–027 | 3 partes: 27 | 0 | 0 | ninguna |
| 218 | 78 | 27 | 001–027 | 1 partes: 1; 2 partes: 1; 3 partes: 25 | 0 | 0 | ninguna |
| 219 | 79 | 27 | 001–027 | 1 partes: 1; 3 partes: 26 | 0 | 0 | ninguna |
| 220 | 57 | 19 | 001–019 | 1 partes: 1; 2 partes: 1; 3 partes: 17 | 0 | 3 | ninguna |
| 221 | 50 | 17 | 001–017 | 1 partes: 1; 2 partes: 2; 3 partes: 14 | 0 | 3 | ninguna |
| 222 | 79 | 27 | 001–027 | 1 partes: 1; 3 partes: 26 | 0 | 0 | ninguna |
| 223 | 78 | 27 | 001–027 | 1 partes: 1; 2 partes: 1; 3 partes: 25 | 0 | 0 | ninguna |
| 224 | 77 | 27 | 001–027 | 1 partes: 2; 3 partes: 25 | 0 | 0 | ninguna |
| 225 | 61 | 23 | 001–023 | 1 partes: 4; 3 partes: 19 | 0 | 0 | ninguna |
| 227 | 49 | 17 | 001–017 | 1 partes: 1; 3 partes: 16 | 0 | 0 | ninguna |
| 228 | 81 | 27 | 001–027 | 3 partes: 27 | 0 | 0 | ninguna |
| 229 | 80 | 27 | 001–027 | 2 partes: 1; 3 partes: 26 | 0 | 0 | ninguna |
| 230 | 77 | 27 | 001–027 | 1 partes: 2; 3 partes: 25 | 0 | 0 | ninguna |
| 231 | 63 | 20 | 001–020 | 3 partes: 20 | 0 | 3 | ninguna |
| 232 | 81 | 27 | 001–027 | 3 partes: 27 | 0 | 0 | ninguna |
| 233 | 81 | 27 | 001–027 | 3 partes: 27 | 0 | 0 | ninguna |
| 234 | 80 | 27 | 001–027 | 2 partes: 1; 3 partes: 26 | 0 | 0 | ninguna |
| 235 | 80 | 27 | 001–027 | 2 partes: 1; 3 partes: 26 | 0 | 0 | ninguna |
| 236 | 81 | 27 | 001–027 | 3 partes: 27 | 0 | 0 | ninguna |
| 237 | 79 | 27 | 001–027 | 1 partes: 1; 3 partes: 26 | 0 | 0 | ninguna |
| 238 | 81 | 27 | 001–027 | 3 partes: 27 | 0 | 0 | ninguna |
| 239 | 81 | 27 | 001–027 | 3 partes: 27 | 0 | 0 | ninguna |
| 240 | 81 | 27 | 001–027 | 3 partes: 27 | 0 | 0 | ninguna |
| 241 | 36 | 11 | 001–011 | 3 partes: 11 | 0 | 3 | ninguna |

## Inventario completo de variantes y renglones multiparte

Cada fila identifica todos los renglones de la página por sufijos efectivamente presentes; los intervalos son inclusivos. No se omiten los casos p1 únicamente.

| Página | Sufijos presentes | Renglones |
|---:|---|---|
| 011 | _p1, _p2, _p3 | 1–17 |
| 012 | _p1 | 27 |
| 012 | _p1, _p2, _p3 | 1–26 |
| 013 | _p1, _p2, _p3 | 1–27 |
| 014 | _p1, _p2, _p3 | 1–4 |
| 015 | _p1, _p2 | 7 |
| 015 | _p1, _p2, _p3 | 1–6, 8–27 |
| 016 | _p1 | 17 |
| 016 | _p1, _p2, _p3 | 1–16, 18–27 |
| 017 | _p1, _p2, _p3 | 1–27 |
| 018 | _p1 | 9 |
| 018 | _p1, _p2, _p3 | 1–8, 10–27 |
| 019 | _p1, _p2 | 27 |
| 019 | _p1, _p2, _p3 | 1–26 |
| 020 | _p1 | 2 |
| 020 | _p1, _p2, _p3 | 1, 3–27 |
| 021 | _p1, _p2 | 3 |
| 021 | _p1, _p2, _p3 | 1–2, 4–27 |
| 022 | _p1, _p2, _p3 | 1–27 |
| 023 | _p1, _p2 | 9 |
| 023 | _p1, _p2, _p3 | 1–8, 10–27 |
| 024 | _p1, _p2 | 5 |
| 024 | _p1, _p2, _p3 | 1–4, 6–27 |
| 025 | _p1 | 10, 14 |
| 025 | _p1, _p2 | 5 |
| 025 | _p1, _p2, _p3 | 1–4, 6–9, 11–13, 15–27 |
| 026 | _p1 | 9, 15 |
| 026 | _p1, _p2, _p3 | 1–8, 10–14, 16–27 |
| 027 | _p1 | 5 |
| 027 | _p1, _p2, _p3 | 1–4, 6–27 |
| 028 | _p1, _p2, _p3 | 1–27 |
| 029 | _p1 | 5, 21 |
| 029 | _p1, _p2, _p3 | 1–4, 6–20 |
| 031 | _p1, _p2, _p3 | 1–17 |
| 032 | _p1 | 3 |
| 032 | _p1, _p2, _p3 | 1–2, 4–27 |
| 033 | _p1 | 21 |
| 033 | _p1, _p2 | 23 |
| 033 | _p1, _p2, _p3 | 1–20, 22, 24–27 |
| 034 | _p1 | 6 |
| 034 | _p1, _p2 | 14 |
| 034 | _p1, _p2, _p3 | 1–5, 7–13, 15–27 |
| 035 | _p1 | 2, 24 |
| 035 | _p1, _p2, _p3 | 1, 3–23, 25–27 |
| 036 | _p1 | 27 |
| 036 | _p1, _p2, _p3 | 1–26 |
| 037 | _p1, _p2, _p3 | 1–27 |
| 038 | _p1 | 5 |
| 038 | _p1, _p2, _p3 | 1–4, 6–27 |
| 039 | _p1 | 12 |
| 039 | _p1, _p2 | 16 |
| 039 | _p1, _p2, _p3 | 1–11, 13–15, 17–27 |
| 040 | _p1, _p2, _p3 | 1–27 |
| 041 | _p1 | 17, 21 |
| 041 | _p1, _p2 | 24 |
| 041 | _p1, _p2, _p3 | 1–16, 18–20, 22–23, 25–27 |
| 042 | _p1, _p2, _p3 | 1–27 |
| 043 | _p1 | 2 |
| 043 | _p1, _p2, _p3 | 1, 3–16 |
| 044 | _p1, _p2 | 9 |
| 044 | _p1, _p2, _p3 | 1–8, 10–27 |
| 045 | _p1 | 5, 11 |
| 045 | _p1, _p2 | 21 |
| 045 | _p1, _p2, _p3 | 1–4, 6–10, 12–20, 22–27 |
| 046 | _p1, _p2, _p3 | 1–27 |
| 047 | _p1 | 4, 11 |
| 047 | _p1, _p2 | 23 |
| 047 | _p1, _p2, _p3 | 1–3, 5–10, 12–22, 24–27 |
| 048 | _p1, _p2 | 27 |
| 048 | _p1, _p2, _p3 | 1–26 |
| 049 | _p1 | 21 |
| 049 | _p1, _p2, _p3 | 1–20, 22–27 |
| 050 | _p1, _p2, _p3 | 1–5 |
| 051 | _p1, _p2, _p3 | 1–17 |
| 052 | _p1 | 15 |
| 052 | _p1, _p2, _p3 | 1–14, 16–27 |
| 053 | _p1, _p2, _p3 | 1–27 |
| 054 | _p1, _p2, _p3 | 1–27 |
| 055 | _p1 | 17, 22 |
| 055 | _p1, _p2, _p3 | 1–16, 18–21, 23–27 |
| 056 | _p1, _p2, _p3 | 1–27 |
| 057 | _p1, _p2, _p3 | 1–27 |
| 058 | _p1 | 21 |
| 058 | _p1, _p2, _p3 | 1–20, 22–23 |
| 059 | _p1 | 6 |
| 059 | _p1, _p2, _p3 | 1–5, 7–22 |
| 060 | _p1, _p2, _p3 | 1–27 |
| 061 | _p1, _p2, _p3 | 1–27 |
| 062 | _p1, _p2, _p3 | 1–27 |
| 063 | _p1 | 7, 19 |
| 063 | _p1, _p2, _p3 | 1–6, 8–18, 20–27 |
| 064 | _p1 | 12 |
| 064 | _p1, _p2, _p3 | 1–11, 13–27 |
| 065 | _p1 | 3 |
| 065 | _p1, _p2, _p3 | 1–2, 4–27 |
| 066 | _p1, _p2, _p3 | 1–27 |
| 067 | _p1, _p2, _p3 | 1–13 |
| 069 | _p1, _p2, _p3 | 1–17 |
| 070 | _p1 | 9 |
| 070 | _p1, _p2 | 7 |
| 070 | _p1, _p2, _p3 | 1–6, 8, 10–17 |
| 071 | _p1, _p2, _p3 | 1–27 |
| 072 | _p1, _p2 | 10 |
| 072 | _p1, _p2, _p3 | 1–9, 11–27 |
| 073 | _p1, _p2 | 18 |
| 073 | _p1, _p2, _p3 | 1–17, 19–27 |
| 074 | _p1, _p2, _p3 | 1–27 |
| 075 | _p1, _p2, _p3 | 1–27 |
| 076 | _p1 | 9 |
| 076 | _p1, _p2 | 20 |
| 076 | _p1, _p2, _p3 | 1–8, 10–19, 21–27 |
| 077 | _p1, _p2, _p3 | 1–27 |
| 078 | _p1, _p2, _p3 | 1–27 |
| 079 | _p1, _p2, _p3 | 1–27 |
| 080 | _p1, _p2, _p3 | 1–27 |
| 081 | _p1, _p2, _p3 | 1–27 |
| 082 | _p1, _p2, _p3 | 1–27 |
| 083 | _p1, _p2, _p3 | 1–27 |
| 084 | _p1 | 14 |
| 084 | _p1, _p2, _p3 | 1–13, 15–27 |
| 085 | _p1 | 2 |
| 085 | _p1, _p2, _p3 | 1, 3–27 |
| 086 | _p1 | 10 |
| 086 | _p1, _p2, _p3 | 1–9, 11–27 |
| 087 | _p1, _p2 | 4, 17 |
| 087 | _p1, _p2, _p3 | 1–3, 5–16 |
| 088 | _p1, _p2, _p3 | 1–27 |
| 089 | _p1, _p2 | 5, 24 |
| 089 | _p1, _p2, _p3 | 1–4, 6–23, 25–27 |
| 090 | _p1, _p2 | 2 |
| 090 | _p1, _p2, _p3 | 1, 3–27 |
| 091 | _p1, _p2 | 11 |
| 091 | _p1, _p2, _p3 | 1–10, 12–27 |
| 092 | _p1 | 5 |
| 092 | _p1, _p2, _p3 | 1–4, 6–27 |
| 093 | _p1, _p2 | 10 |
| 093 | _p1, _p2, _p3 | 1–9, 11–16 |
| 094 | _p1 | 6, 12 |
| 094 | _p1, _p2 | 16, 21 |
| 094 | _p1, _p2, _p3 | 1–5, 7–11, 13–15, 17–20, 22–27 |
| 095 | _p1, _p2 | 22, 25 |
| 095 | _p1, _p2, _p3 | 1–21, 23–24, 26–27 |
| 096 | _p1 | 20 |
| 096 | _p1, _p2, _p3 | 1–19, 21–27 |
| 097 | _p1, _p2, _p3 | 1–18 |
| 098 | _p1, _p2, _p3 | 1–27 |
| 099 | _p1, _p2, _p3 | 1–27 |
| 100 | _p1 | 17 |
| 100 | _p1, _p2 | 24 |
| 100 | _p1, _p2, _p3 | 1–16, 18–23, 25–27 |
| 101 | _p1 | 9 |
| 101 | _p1, _p2 | 20 |
| 101 | _p1, _p2, _p3 | 1–8, 10–19, 21–27 |
| 102 | _p1, _p2, _p3 | 1–27 |
| 103 | _p1 | 25 |
| 103 | _p1, _p2 | 3 |
| 103 | _p1, _p2, _p3 | 1–2, 4–24, 26–27 |
| 104 | _p1, _p2, _p3 | 1–8 |
| 105 | _p1, _p2, _p3 | 1–17 |
| 106 | _p1, _p2, _p3 | 1–27 |
| 107 | _p1, _p2, _p3 | 1–27 |
| 108 | _p1, _p2, _p3 | 1–15 |
| 109 | _p1, _p2, _p3 | 1–27 |
| 110 | _p1, _p2, _p3 | 1–27 |
| 111 | _p1, _p2, _p3 | 1–27 |
| 112 | _p1, _p2, _p3 | 1–27 |
| 113 | _p1, _p2 | 2 |
| 113 | _p1, _p2, _p3 | 1, 3–27 |
| 114 | _p1, _p2, _p3 | 1–27 |
| 115 | _p1, _p2 | 7 |
| 115 | _p1, _p2, _p3 | 1–6, 8–27 |
| 116 | _p1, _p2, _p3 | 1–27 |
| 117 | _p1, _p2, _p3 | 1–27 |
| 118 | _p1, _p2, _p3 | 1–27 |
| 119 | _p1, _p2 | 10 |
| 119 | _p1, _p2, _p3 | 1–9 |
| 121 | _p1, _p2, _p3 | 1–17 |
| 122 | _p1 | 7 |
| 122 | _p1, _p2, _p3 | 1–6, 8–14 |
| 123 | _p1, _p2 | 5 |
| 123 | _p1, _p2, _p3 | 1–4, 6–27 |
| 124 | _p1, _p2 | 18 |
| 124 | _p1, _p2, _p3 | 1–17, 19–27 |
| 125 | _p1 | 2 |
| 125 | _p1, _p2 | 22 |
| 125 | _p1, _p2, _p3 | 1, 3–21, 23–27 |
| 126 | _p1, _p2, _p3 | 1–27 |
| 127 | _p1, _p2 | 27 |
| 127 | _p1, _p2, _p3 | 1–26 |
| 128 | _p1, _p2, _p3 | 1–27 |
| 129 | _p1, _p2, _p3 | 1–27 |
| 130 | _p1 | 8 |
| 130 | _p1, _p2, _p3 | 1–7, 9–14 |
| 131 | _p1, _p2, _p3 | 1–27 |
| 132 | _p1 | 3, 16, 19 |
| 132 | _p1, _p2 | 8, 22 |
| 132 | _p1, _p2, _p3 | 1–2, 4–7, 9–15, 17–18, 20–21, 23–27 |
| 133 | _p1, _p2 | 2 |
| 133 | _p1, _p2, _p3 | 1, 3–27 |
| 134 | _p1 | 12 |
| 134 | _p1, _p2 | 21 |
| 134 | _p1, _p2, _p3 | 1–11, 13–20, 22–27 |
| 135 | _p1 | 19, 22 |
| 135 | _p1, _p2, _p3 | 1–18, 20–21, 23–27 |
| 136 | _p1, _p2, _p3 | 1–27 |
| 137 | _p1, _p2, _p3 | 1–27 |
| 138 | _p1, _p2, _p3 | 1–8 |
| 139 | _p1, _p2, _p3 | 1–17 |
| 140 | _p1, _p2 | 7, 21 |
| 140 | _p1, _p2, _p3 | 1–6, 8–20, 22–27 |
| 141 | _p1 | 6 |
| 141 | _p1, _p2 | 21 |
| 141 | _p1, _p2, _p3 | 1–5, 7–20, 22–27 |
| 142 | _p1, _p2 | 21, 24 |
| 142 | _p1, _p2, _p3 | 1–20, 22–23, 25–27 |
| 143 | _p1, _p2, _p3 | 1–27 |
| 144 | _p1, _p2, _p3 | 1–27 |
| 145 | _p1, _p2, _p3 | 1–27 |
| 146 | _p1 | 8 |
| 146 | _p1, _p2 | 20 |
| 146 | _p1, _p2, _p3 | 1–7, 9–19, 21–27 |
| 147 | _p1 | 2, 10 |
| 147 | _p1, _p2, _p3 | 1, 3–9, 11–27 |
| 148 | _p1 | 5 |
| 148 | _p1, _p2, _p3 | 1–4, 6–27 |
| 149 | _p1, _p2, _p3 | 1–27 |
| 150 | _p1, _p2 | 12, 18 |
| 150 | _p1, _p2, _p3 | 1–11, 13–17, 19–27 |
| 151 | _p1, _p2 | 13 |
| 151 | _p1, _p2, _p3 | 1–12, 14–27 |
| 152 | _p1 | 17, 19 |
| 152 | _p1, _p2, _p3 | 1–16, 18, 20–27 |
| 153 | _p1, _p2 | 4 |
| 153 | _p1, _p2, _p3 | 1–3 |
| 155 | _p1 | 17 |
| 155 | _p1, _p2, _p3 | 1–16 |
| 156 | _p1, _p2, _p3 | 1–27 |
| 157 | _p1 | 3 |
| 157 | _p1, _p2 | 13 |
| 157 | _p1, _p2, _p3 | 1–2, 4–12, 14–27 |
| 158 | _p1 | 27 |
| 158 | _p1, _p2, _p3 | 1–26 |
| 159 | _p1 | 2, 7, 13 |
| 159 | _p1, _p2 | 17, 24 |
| 159 | _p1, _p2, _p3 | 1, 3–6, 8–12, 14–16, 18–23, 25–27 |
| 160 | _p1, _p2, _p3 | 1–27 |
| 161 | _p1, _p2 | 14 |
| 161 | _p1, _p2, _p3 | 1–13, 15–27 |
| 162 | _p1 | 21 |
| 162 | _p1, _p2, _p3 | 1–20, 22–27 |
| 163 | _p1, _p2, _p3 | 1–27 |
| 164 | _p1, _p2, _p3 | 1–27 |
| 165 | _p1, _p2, _p3 | 1–27 |
| 166 | _p1, _p2 | 1 |
| 166 | _p1, _p2, _p3 | 2–27 |
| 167 | _p1, _p2, _p3 | 1–11 |
| 168 | _p1 | 2 |
| 168 | _p1, _p2, _p3 | 1, 3–16 |
| 169 | _p1 | 4, 19 |
| 169 | _p1, _p2, _p3 | 1–3, 5–18, 20–27 |
| 170 | _p1 | 18, 23 |
| 170 | _p1, _p2 | 16 |
| 170 | _p1, _p2, _p3 | 1–15, 17, 19–22, 24–27 |
| 171 | _p1, _p2 | 20 |
| 171 | _p1, _p2, _p3 | 1–19, 21–27 |
| 172 | _p1, _p2, _p3 | 1–19 |
| 173 | _p1, _p2, _p3 | 1–17 |
| 174 | _p1 | 2 |
| 174 | _p1, _p2 | 25, 27 |
| 174 | _p1, _p2, _p3 | 1, 3–24, 26 |
| 175 | _p1 | 24, 26 |
| 175 | _p1, _p2, _p3 | 1–23, 25, 27 |
| 176 | _p1 | 4, 11 |
| 176 | _p1, _p2 | 6, 14 |
| 176 | _p1, _p2, _p3 | 1–3, 5, 7–10, 12–13, 15–27 |
| 177 | _p1 | 4 |
| 177 | _p1, _p2, _p3 | 1–3, 5–27 |
| 178 | _p1, _p2 | 17 |
| 178 | _p1, _p2, _p3 | 1–16, 18 |
| 179 | _p1, _p2 | 18 |
| 179 | _p1, _p2, _p3 | 1–17 |
| 180 | _p1 | 10 |
| 180 | _p1, _p2, _p3 | 1–9, 11–27 |
| 181 | _p1 | 14, 21 |
| 181 | _p1, _p2 | 6 |
| 181 | _p1, _p2, _p3 | 1–5, 7–13, 15–20, 22–27 |
| 182 | _p1, _p2, _p3 | 1–27 |
| 183 | _p1, _p2 | 18 |
| 183 | _p1, _p2, _p3 | 1–17, 19–27 |
| 184 | _p1 | 3 |
| 184 | _p1, _p2 | 25 |
| 184 | _p1, _p2, _p3 | 1–2, 4–24, 26–27 |
| 185 | _p1 | 18 |
| 185 | _p1, _p2, _p3 | 1–17, 19–27 |
| 186 | _p1 | 22 |
| 186 | _p1, _p2 | 7 |
| 186 | _p1, _p2, _p3 | 1–6, 8–21, 23–27 |
| 187 | _p1 | 27 |
| 187 | _p1, _p2, _p3 | 1–26 |
| 188 | _p1 | 5, 8, 14 |
| 188 | _p1, _p2 | 21, 23 |
| 188 | _p1, _p2, _p3 | 1–4, 6–7, 9–13, 15–20, 22, 24–27 |
| 189 | _p1 | 15 |
| 189 | _p1, _p2, _p3 | 1–14, 16–27 |
| 190 | _p1 | 8 |
| 190 | _p1, _p2, _p3 | 1–7 |
| 191 | _p1, _p2, _p3 | 1–17 |
| 192 | _p1, _p2, _p3 | 1–16 |
| 193 | _p1 | 7, 11 |
| 193 | _p1, _p2 | 18, 23, 27 |
| 193 | _p1, _p2, _p3 | 1–6, 8–10, 12–17, 19–22, 24–26 |
| 194 | _p1, _p2, _p3 | 1–13 |
| 195 | _p1, _p2, _p3 | 1–27 |
| 196 | _p1, _p2, _p3 | 1–27 |
| 197 | _p1, _p2 | 16, 23, 26 |
| 197 | _p1, _p2, _p3 | 1–15, 17–22, 24–25, 27 |
| 198 | _p1, _p2 | 5 |
| 198 | _p1, _p2, _p3 | 1–4, 6–27 |
| 199 | _p1 | 5 |
| 199 | _p1, _p2, _p3 | 1–4, 6–27 |
| 200 | _p1, _p2, _p3 | 1–27 |
| 201 | _p1, _p2, _p3 | 1–27 |
| 202 | _p1, _p2, _p3 | 1–27 |
| 203 | _p1, _p2, _p3 | 1–27 |
| 204 | _p1 | 5 |
| 204 | _p1, _p2 | 21 |
| 204 | _p1, _p2, _p3 | 1–4, 6–20, 22–27 |
| 205 | _p1, _p2 | 17, 22 |
| 205 | _p1, _p2, _p3 | 1–16, 18–21, 23–27 |
| 206 | _p1, _p2 | 7, 20 |
| 206 | _p1, _p2, _p3 | 1–6, 8–19, 21–27 |
| 207 | _p1 | 22 |
| 207 | _p1, _p2, _p3 | 1–21 |
| 209 | _p1, _p2, _p3 | 1–17 |
| 210 | _p1 | 27 |
| 210 | _p1, _p2 | 25 |
| 210 | _p1, _p2, _p3 | 1–24, 26 |
| 211 | _p1, _p2, _p3 | 1–14 |
| 212 | _p1 | 10, 27 |
| 212 | _p1, _p2 | 13 |
| 212 | _p1, _p2, _p3 | 1–9, 11–12, 14–26 |
| 213 | _p1, _p2 | 4 |
| 213 | _p1, _p2, _p3 | 1–3, 5–27 |
| 214 | _p1 | 17 |
| 214 | _p1, _p2 | 23 |
| 214 | _p1, _p2, _p3 | 1–16, 18–22, 24–27 |
| 215 | _p1 | 3, 17 |
| 215 | _p1, _p2 | 9, 11 |
| 215 | _p1, _p2, _p3 | 1–2, 4–8, 10, 12–16, 18–27 |
| 216 | _p1 | 2 |
| 216 | _p1, _p2, _p3 | 1, 3–27 |
| 217 | _p1, _p2, _p3 | 1–27 |
| 218 | _p1 | 21 |
| 218 | _p1, _p2 | 2 |
| 218 | _p1, _p2, _p3 | 1, 3–20, 22–27 |
| 219 | _p1 | 5 |
| 219 | _p1, _p2, _p3 | 1–4, 6–27 |
| 220 | _p1 | 14 |
| 220 | _p1, _p2 | 16 |
| 220 | _p1, _p2, _p3 | 1–13, 15, 17–19 |
| 221 | _p1 | 14 |
| 221 | _p1, _p2 | 2, 17 |
| 221 | _p1, _p2, _p3 | 1, 3–13, 15–16 |
| 222 | _p1 | 5 |
| 222 | _p1, _p2, _p3 | 1–4, 6–27 |
| 223 | _p1 | 25 |
| 223 | _p1, _p2 | 16 |
| 223 | _p1, _p2, _p3 | 1–15, 17–24, 26–27 |
| 224 | _p1 | 8, 27 |
| 224 | _p1, _p2, _p3 | 1–7, 9–26 |
| 225 | _p1 | 7, 10, 17, 23 |
| 225 | _p1, _p2, _p3 | 1–6, 8–9, 11–16, 18–22 |
| 227 | _p1 | 9 |
| 227 | _p1, _p2, _p3 | 1–8, 10–17 |
| 228 | _p1, _p2, _p3 | 1–27 |
| 229 | _p1, _p2 | 2 |
| 229 | _p1, _p2, _p3 | 1, 3–27 |
| 230 | _p1 | 18, 21 |
| 230 | _p1, _p2, _p3 | 1–17, 19–20, 22–27 |
| 231 | _p1, _p2, _p3 | 1–20 |
| 232 | _p1, _p2, _p3 | 1–27 |
| 233 | _p1, _p2, _p3 | 1–27 |
| 234 | _p1, _p2 | 27 |
| 234 | _p1, _p2, _p3 | 1–26 |
| 235 | _p1, _p2 | 16 |
| 235 | _p1, _p2, _p3 | 1–15, 17–27 |
| 236 | _p1, _p2, _p3 | 1–27 |
| 237 | _p1 | 7 |
| 237 | _p1, _p2, _p3 | 1–6, 8–27 |
| 238 | _p1, _p2, _p3 | 1–27 |
| 239 | _p1, _p2, _p3 | 1–27 |
| 240 | _p1, _p2, _p3 | 1–27 |
| 241 | _p1, _p2, _p3 | 1–11 |

## Inventario de imágenes y asociaciones demostrables

La asociación demostrable es el padre físico page-XXX/images. Los nombres no acreditan el contenido visual ni la descripción textual.

| Página | Imagen | Sufijos | MP3 | Ruta física |
|---:|---|---|---:|---|
| 014 | image-001 | _p1, _p2, _p3 | 3 | `page-014/images/image-001_pN.mp3` |
| 043 | image-001 | _p1, _p2, _p3 | 3 | `page-043/images/image-001_pN.mp3` |
| 050 | image-001 | _p1, _p2, _p3 | 3 | `page-050/images/image-001_pN.mp3` |
| 058 | image-001 | _p1, _p2, _p3 | 3 | `page-058/images/image-001_pN.mp3` |
| 059 | image-001 | _p1, _p2, _p3 | 3 | `page-059/images/image-001_pN.mp3` |
| 070 | image-001 | _p1, _p2, _p3 | 3 | `page-070/images/image-001_pN.mp3` |
| 084 | image-001 | _p1, _p2, _p3 | 3 | `page-084/images/image-001_pN.mp3` |
| 093 | image-001 | _p1, _p2, _p3 | 3 | `page-093/images/image-001_pN.mp3` |
| 097 | image-001 | _p1, _p2, _p3 | 3 | `page-097/images/image-001_pN.mp3` |
| 100 | image-001 | _p1, _p2, _p3 | 3 | `page-100/images/image-001_pN.mp3` |
| 108 | image-001 | _p1, _p2, _p3 | 3 | `page-108/images/image-001_pN.mp3` |
| 122 | image-001 | _p1, _p2, _p3 | 3 | `page-122/images/image-001_pN.mp3` |
| 130 | image-001 | _p1, _p2, _p3 | 3 | `page-130/images/image-001_pN.mp3` |
| 140 | image-001 | _p1, _p2, _p3 | 3 | `page-140/images/image-001_pN.mp3` |
| 150 | image-001 | _p1, _p2, _p3 | 3 | `page-150/images/image-001_pN.mp3` |
| 153 | image-001 | _p1, _p2, _p3 | 3 | `page-153/images/image-001_pN.mp3` |
| 167 | image-001 | _p1, _p2, _p3 | 3 | `page-167/images/image-001_pN.mp3` |
| 168 | image-001 | _p1, _p2, _p3 | 3 | `page-168/images/image-001_pN.mp3` |
| 178 | image-001 | _p1, _p2, _p3 | 3 | `page-178/images/image-001_pN.mp3` |
| 179 | image-001 | _p1, _p2, _p3 | 3 | `page-179/images/image-001_pN.mp3` |
| 192 | image-001 | _p1, _p2, _p3 | 3 | `page-192/images/image-001_pN.mp3` |
| 194 | image-001 | _p1, _p2, _p3 | 3 | `page-194/images/image-001_pN.mp3` |
| 211 | image-001 | _p1, _p2, _p3 | 3 | `page-211/images/image-001_pN.mp3` |
| 220 | image-001 | _p1, _p2, _p3 | 3 | `page-220/images/image-001_pN.mp3` |
| 221 | image-001 | _p1, _p2, _p3 | 3 | `page-221/images/image-001_pN.mp3` |
| 231 | image-001 | _p1, _p2, _p3 | 3 | `page-231/images/image-001_pN.mp3` |
| 241 | image-001 | _p1, _p2, _p3 | 3 | `page-241/images/image-001_pN.mp3` |

## Audios especiales

- _meta/author.mp3
- _meta/title.mp3
Patrón reconocido: `_meta/(author|title).mp3`, sin sufijo de parte ni asociación con página. Otros audios fuera de lectura/imágenes:
Ninguno.

## Huecos, nombres, directorios y capitalización

### Nombres inesperados

Ninguno.

### Directorios inesperados

Ninguno.

### Extensiones distintas de .mp3

Ninguno.

### Archivos vacíos

Ninguno.

### Rutas con mayúsculas

Ninguno.

Ninguno.

Colisiones de ruta al ignorar mayúsculas:
Ninguno.

## Duplicados

Rutas relativas exactas duplicadas: ninguna (el árbol físico no admite dos archivos en la misma ruta). Repetición de basename en páginas diferentes es normal y no implica duplicación contractual.

Basenames repetidos: 84 grupos; 16401 archivos involucrados. Inventario compacto completo por basename y páginas (cada página identifica su ruta de lectura/images según el prefijo):

- `image-001_p1.mp3` × 27: páginas 14, 43, 50, 58–59, 70, 84, 93, 97, 100, 108, 122, 130, 140, 150, 153, 167–168, 178–179, 192, 194, 211, 220–221, 231, 241.
- `image-001_p2.mp3` × 27: páginas 14, 43, 50, 58–59, 70, 84, 93, 97, 100, 108, 122, 130, 140, 150, 153, 167–168, 178–179, 192, 194, 211, 220–221, 231, 241.
- `image-001_p3.mp3` × 27: páginas 14, 43, 50, 58–59, 70, 84, 93, 97, 100, 108, 122, 130, 140, 150, 153, 167–168, 178–179, 192, 194, 211, 220–221, 231, 241.
- `line-001_p1.mp3` × 225: páginas 11–29, 31–67, 69–119, 121–153, 155–207, 209–225, 227–241.
- `line-001_p2.mp3` × 225: páginas 11–29, 31–67, 69–119, 121–153, 155–207, 209–225, 227–241.
- `line-001_p3.mp3` × 224: páginas 11–29, 31–67, 69–119, 121–153, 155–165, 167–207, 209–225, 227–241.
- `line-002_p1.mp3` × 225: páginas 11–29, 31–67, 69–119, 121–153, 155–207, 209–225, 227–241.
- `line-002_p2.mp3` × 215: páginas 11–19, 21–29, 31–34, 36–42, 44–67, 69–84, 86–119, 121–124, 126–146, 148–153, 155–158, 160–167, 169–173, 175–207, 209–215, 217–225, 227–241.
- `line-002_p3.mp3` × 209: páginas 11–19, 21–29, 31–34, 36–42, 44–67, 69–84, 86–89, 91–112, 114–119, 121–124, 126–132, 134–146, 148–153, 155–158, 160–167, 169–173, 175–207, 209–215, 217, 219–220, 222–225, 227–228, 230–241.
- `line-003_p1.mp3` × 225: páginas 11–29, 31–67, 69–119, 121–153, 155–207, 209–225, 227–241.
- `line-003_p2.mp3` × 219: páginas 11–29, 31, 33–64, 66–67, 69–119, 121–131, 133–153, 155–156, 158–183, 185–207, 209–214, 216–225, 227–241.
- `line-003_p3.mp3` × 217: páginas 11–20, 22–29, 31, 33–64, 66–67, 69–102, 104–119, 121–131, 133–153, 155–156, 158–183, 185–207, 209–214, 216–225, 227–241.
- `line-004_p1.mp3` × 225: páginas 11–29, 31–67, 69–119, 121–153, 155–207, 209–225, 227–241.
- `line-004_p2.mp3` × 221: páginas 11–29, 31–46, 48–67, 69–119, 121–153, 155–168, 170–175, 178–207, 209–225, 227–241.
- `line-004_p3.mp3` × 218: páginas 11–29, 31–46, 48–67, 69–86, 88–119, 121–152, 155–168, 170–175, 178–207, 209–212, 214–225, 227–241.
- `line-005_p1.mp3` × 223: páginas 11–13, 15–29, 31–67, 69–119, 121–152, 155–207, 209–225, 227–241.
- `line-005_p2.mp3` × 212: páginas 11–13, 15–26, 28, 31–37, 39–44, 46–67, 69–91, 93–119, 121–147, 149–152, 155–187, 189–198, 200–203, 205–207, 209–218, 220–221, 223–225, 227–241.
- `line-005_p3.mp3` × 207: páginas 11–13, 15–23, 26, 28, 31–37, 39–44, 46–67, 69–88, 90–91, 93–119, 121–122, 124–147, 149–152, 155–187, 189–197, 200–203, 205–207, 209–218, 220–221, 223–225, 227–241.
- `line-006_p1.mp3` × 222: páginas 11–13, 15–29, 31–49, 51–67, 69–119, 121–152, 155–207, 209–225, 227–241.
- `line-006_p2.mp3` × 218: páginas 11–13, 15–29, 31–33, 35–49, 51–58, 60–67, 69–93, 95–119, 121–140, 142–152, 155–207, 209–225, 227–241.
- `line-006_p3.mp3` × 216: páginas 11–13, 15–29, 31–33, 35–49, 51–58, 60–67, 69–93, 95–119, 121–140, 142–152, 155–175, 177–180, 182–207, 209–225, 227–241.
- `line-007_p1.mp3` × 222: páginas 11–13, 15–29, 31–49, 51–67, 69–119, 121–152, 155–207, 209–225, 227–241.
- `line-007_p2.mp3` × 216: páginas 11–13, 15–29, 31–49, 51–62, 64–67, 69–119, 121, 123–152, 155–158, 160–192, 194–207, 209–224, 227–236, 238–241.
- `line-007_p3.mp3` × 210: páginas 11–13, 16–29, 31–49, 51–62, 64–67, 69, 71–114, 116–119, 121, 123–139, 141–152, 155–158, 160–185, 187–192, 194–205, 207, 209–224, 227–236, 238–241.
- `line-008_p1.mp3` × 222: páginas 11–13, 15–29, 31–49, 51–67, 69–119, 121–152, 155–207, 209–225, 227–241.
- `line-008_p2.mp3` × 217: páginas 11–13, 15–29, 31–49, 51–67, 69–119, 121–129, 131–145, 147–152, 155–187, 189, 191–207, 209–223, 225, 227–241.
- `line-008_p3.mp3` × 216: páginas 11–13, 15–29, 31–49, 51–67, 69–119, 121–129, 131, 133–145, 147–152, 155–187, 189, 191–207, 209–223, 225, 227–241.
- `line-009_p1.mp3` × 219: páginas 11–13, 15–29, 31–49, 51–67, 69–103, 105–119, 121–137, 139–152, 155–189, 191–207, 209–225, 227–241.
- `line-009_p2.mp3` × 213: páginas 11–13, 15–17, 19–25, 27–29, 31–49, 51–67, 69, 71–75, 77–100, 102–103, 105–119, 121–137, 139–152, 155–189, 191–207, 209–225, 228–241.
- `line-009_p3.mp3` × 210: páginas 11–13, 15–17, 19–22, 24–25, 27–29, 31–43, 45–49, 51–67, 69, 71–75, 77–100, 102–103, 105–119, 121–137, 139–152, 155–189, 191–207, 209–214, 216–225, 228–241.
- `line-010_p1.mp3` × 219: páginas 11–13, 15–29, 31–49, 51–67, 69–103, 105–119, 121–137, 139–152, 155–189, 191–207, 209–225, 227–241.
- `line-010_p2.mp3` × 213: páginas 11–13, 15–24, 26–29, 31–49, 51–67, 69–85, 87–103, 105–119, 121–137, 139–146, 148–152, 155–179, 181–189, 191–207, 209–211, 213–224, 227–241.
- `line-010_p3.mp3` × 210: páginas 11–13, 15–24, 26–29, 31–49, 51–67, 69–71, 73–85, 87–92, 94–103, 105–118, 121–137, 139–146, 148–152, 155–179, 181–189, 191–207, 209–211, 213–224, 227–241.
- `line-011_p1.mp3` × 218: páginas 11–13, 15–29, 31–49, 51–67, 69–103, 105–118, 121–137, 139–152, 155–189, 191–207, 209–225, 227–241.
- `line-011_p2.mp3` × 214: páginas 11–13, 15–29, 31–44, 46, 48–49, 51–67, 69–103, 105–118, 121–137, 139–152, 155–175, 177–189, 191–192, 194–207, 209–225, 227–241.
- `line-011_p3.mp3` × 212: páginas 11–13, 15–29, 31–44, 46, 48–49, 51–67, 69–90, 92–103, 105–118, 121–137, 139–152, 155–175, 177–189, 191–192, 194–207, 209–214, 216–225, 227–241.
- `line-012_p1.mp3` × 216: páginas 11–13, 15–29, 31–49, 51–67, 69–103, 105–118, 121–137, 139–152, 155–166, 168–189, 191–207, 209–225, 227–240.
- `line-012_p2.mp3` × 212: páginas 11–13, 15–29, 31–38, 40–49, 51–63, 65–67, 69–93, 95–103, 105–118, 121–133, 135–137, 139–152, 155–166, 168–189, 191–207, 209–225, 227–240.
- `line-012_p3.mp3` × 211: páginas 11–13, 15–29, 31–38, 40–49, 51–63, 65–67, 69–93, 95–103, 105–118, 121–133, 135–137, 139–149, 151–152, 155–166, 168–189, 191–207, 209–225, 227–240.
- `line-013_p1.mp3` × 216: páginas 11–13, 15–29, 31–49, 51–67, 69–103, 105–118, 121–137, 139–152, 155–166, 168–189, 191–207, 209–225, 227–240.
- `line-013_p2.mp3` × 215: páginas 11–13, 15–29, 31–49, 51–67, 69–103, 105–118, 121–137, 139–152, 155–158, 160–166, 168–189, 191–207, 209–225, 227–240.
- `line-013_p3.mp3` × 212: páginas 11–13, 15–29, 31–49, 51–67, 69–103, 105–118, 121–137, 139–150, 152, 155–156, 158, 160–166, 168–189, 191–207, 209–211, 213–225, 227–240.
- `line-014_p1.mp3` × 214: páginas 11–13, 15–29, 31–49, 51–66, 69–103, 105–118, 121–137, 139–152, 155–166, 168–189, 191–193, 195–207, 209–225, 227–240.
- `line-014_p2.mp3` × 208: páginas 11–13, 15–24, 26–29, 31–49, 51–66, 69–83, 85–103, 105–118, 121–137, 139–152, 155–166, 168–180, 182–187, 189, 191–193, 195–207, 209–219, 222–225, 227–240.
- `line-014_p3.mp3` × 205: páginas 11–13, 15–24, 26–29, 31–33, 35–49, 51–66, 69–83, 85–103, 105–118, 121–137, 139–152, 155–160, 162–166, 168–175, 177–180, 182–187, 189, 191–193, 195–207, 209–219, 222–225, 227–240.
- `line-015_p1.mp3` × 211: páginas 11–13, 15–29, 31–49, 51–66, 69–103, 105–118, 121, 123–129, 131–137, 139–152, 155–166, 168–189, 191–193, 195–207, 209–210, 212–225, 227–240.
- `line-015_p2.mp3` × 208: páginas 11–13, 15–25, 27–29, 31–49, 51, 53–66, 69–103, 105–118, 121, 123–129, 131–137, 139–152, 155–166, 168–188, 191–193, 195–207, 209–210, 212–225, 227–240.
- `line-015_p3.mp3` × 208: páginas 11–13, 15–25, 27–29, 31–49, 51, 53–66, 69–103, 105–118, 121, 123–129, 131–137, 139–152, 155–166, 168–188, 191–193, 195–207, 209–210, 212–225, 227–240.
- `line-016_p1.mp3` × 210: páginas 11–13, 15–29, 31–49, 51–66, 69–103, 105–107, 109–118, 121, 123–129, 131–137, 139–152, 155–166, 168–189, 191–193, 195–207, 209–210, 212–225, 227–240.
- `line-016_p2.mp3` × 209: páginas 11–13, 15–29, 31–49, 51–66, 69–103, 105–107, 109–118, 121, 123–129, 131, 133–137, 139–152, 155–166, 168–189, 191–193, 195–207, 209–210, 212–225, 227–240.
- `line-016_p3.mp3` × 202: páginas 11–13, 15–29, 31–38, 40–49, 51–66, 69–93, 95–103, 105–107, 109–118, 121, 123–129, 131, 133–137, 139–152, 155–166, 168–169, 171–189, 191–193, 195–196, 198–207, 209–210, 212–219, 221–222, 224–225, 227–234, 236–240.
- `line-017_p1.mp3` × 206: páginas 11–13, 15–29, 31–42, 44–49, 51–66, 69–92, 94–103, 105–107, 109–118, 121, 123–129, 131–137, 139–152, 155–166, 169–189, 191, 193, 195–207, 209–210, 212–225, 227–240.
- `line-017_p2.mp3` × 197: páginas 11–13, 15, 17–29, 31–40, 42, 44–49, 51–54, 56–66, 69–92, 94–99, 101–103, 105–107, 109–118, 121, 123–129, 131–137, 139–151, 156–166, 169–189, 191, 193, 195–207, 209–210, 212–213, 216–224, 227–240.
- `line-017_p3.mp3` × 192: páginas 11–13, 15, 17–29, 31–40, 42, 44–49, 51–54, 56–66, 69–86, 88–92, 94–99, 101–103, 105–107, 109–118, 121, 123–129, 131–137, 139–151, 156–158, 160–166, 169–177, 179–189, 191, 193, 195–204, 206–207, 209–210, 212–213, 216–220, 222–224, 227–240.
- `line-018_p1.mp3` × 191: páginas 12–13, 15–29, 32–42, 44–49, 52–66, 71–86, 88–92, 94–103, 106–107, 109–118, 123–129, 131–137, 140–152, 156–166, 169–172, 174–189, 193, 195–207, 210, 212–220, 222–225, 228–240.
- `line-018_p2.mp3` × 188: páginas 12–13, 15–29, 32–42, 44–49, 52–66, 71–86, 88–92, 94–103, 106–107, 109–118, 123–129, 131–137, 140–152, 156–166, 169, 171–172, 174–184, 186–189, 193, 195–207, 210, 212–220, 222–225, 228–229, 231–240.
- `line-018_p3.mp3` × 182: páginas 12–13, 15–29, 32–42, 44–49, 52–66, 71–72, 74–86, 88–92, 94–103, 106–107, 109–118, 123, 125–129, 131–137, 140–149, 151–152, 156–166, 169, 171–172, 174–178, 180–182, 184, 186–189, 195–207, 210, 212–220, 222–225, 228–229, 231–240.
- `line-019_p1.mp3` × 188: páginas 12–13, 15–29, 32–42, 44–49, 52–66, 71–86, 88–92, 94–96, 98–103, 106–107, 109–118, 123–129, 131–137, 140–152, 156–166, 169–172, 174–177, 180–189, 193, 195–207, 210, 212–220, 222–225, 228–240.
- `line-019_p2.mp3` × 183: páginas 12–13, 15–29, 32–42, 44–49, 52–62, 64–66, 71–86, 88–92, 94–96, 98–103, 106–107, 109–118, 123–129, 131, 133–134, 136–137, 140–151, 156–166, 170–172, 174–177, 180–189, 193, 195–207, 210, 212–220, 222–225, 228–240.
- `line-019_p3.mp3` × 183: páginas 12–13, 15–29, 32–42, 44–49, 52–62, 64–66, 71–86, 88–92, 94–96, 98–103, 106–107, 109–118, 123–129, 131, 133–134, 136–137, 140–151, 156–166, 170–172, 174–177, 180–189, 193, 195–207, 210, 212–220, 222–225, 228–240.
- `line-020_p1.mp3` × 186: páginas 12–13, 15–29, 32–42, 44–49, 52–66, 71–86, 88–92, 94–96, 98–103, 106–107, 109–118, 123–129, 131–137, 140–152, 156–166, 169–171, 174–177, 180–189, 193, 195–207, 210, 212–219, 222–225, 228–240.
- `line-020_p2.mp3` × 185: páginas 12–13, 15–29, 32–42, 44–49, 52–66, 71–86, 88–92, 94–95, 98–103, 106–107, 109–118, 123–129, 131–137, 140–152, 156–166, 169–171, 174–177, 180–189, 193, 195–207, 210, 212–219, 222–225, 228–240.
- `line-020_p3.mp3` × 180: páginas 12–13, 15–29, 32–42, 44–49, 52–66, 71–75, 77–86, 88–92, 94–95, 98–100, 102–103, 106–107, 109–118, 123–129, 131–137, 140–145, 147–152, 156–166, 169–170, 174–177, 180–189, 193, 195–205, 207, 210, 212–219, 222–225, 228–240.
- `line-021_p1.mp3` × 185: páginas 12–13, 15–29, 32–42, 44–49, 52–66, 71–86, 88–92, 94–96, 98–103, 106–107, 109–118, 123–129, 131–137, 140–152, 156–166, 169–171, 174–177, 180–189, 193, 195–207, 210, 212–219, 222–225, 228–230, 232–240.
- `line-021_p2.mp3` × 176: páginas 12–13, 15–28, 32, 34–40, 42, 44–48, 52–57, 59–66, 71–86, 88–92, 94–96, 98–103, 106–107, 109–118, 123–129, 131–137, 140–152, 156–161, 163–166, 169–171, 174–177, 180, 182–189, 193, 195–207, 210, 212–217, 219, 222–225, 228–229, 232–240.
- `line-021_p3.mp3` × 168: páginas 12–13, 15–28, 32, 34–40, 42, 44, 46–48, 52–57, 59–66, 71–86, 88–92, 95–96, 98–103, 106–107, 109–118, 123–129, 131–133, 135–137, 143–152, 156–161, 163–166, 169–171, 174–177, 180, 182–187, 189, 193, 195–203, 205–207, 210, 212–217, 219, 222–225, 228–229, 232–240.
- `line-022_p1.mp3` × 184: páginas 12–13, 15–28, 32–42, 44–49, 52–66, 71–86, 88–92, 94–96, 98–103, 106–107, 109–118, 123–129, 131–137, 140–152, 156–166, 169–171, 174–177, 180–189, 193, 195–207, 210, 212–219, 222–225, 228–230, 232–240.
- `line-022_p2.mp3` × 180: páginas 12–13, 15–28, 32–42, 44–49, 52–54, 56–66, 71–86, 88–92, 94–96, 98–103, 106–107, 109–118, 123–129, 131–134, 136–137, 140–152, 156–166, 169–171, 174–177, 180–185, 187–189, 193, 195–206, 210, 212–219, 222–225, 228–230, 232–240.
- `line-022_p3.mp3` × 176: páginas 12–13, 15–28, 32–42, 44–49, 52–54, 56–66, 71–86, 88–92, 94, 96, 98–103, 106–107, 109–118, 123–124, 126–129, 131, 133–134, 136–137, 140–152, 156–166, 169–171, 174–177, 180–185, 187–189, 193, 195–204, 206, 210, 212–219, 222–225, 228–230, 232–240.
- `line-023_p1.mp3` × 182: páginas 12–13, 15–28, 32–42, 44–49, 52–58, 60–66, 71–86, 88–92, 94–96, 98–103, 106–107, 109–118, 123–129, 131–137, 140–152, 156–166, 169–171, 174–177, 180–189, 193, 195–206, 210, 212–219, 222–225, 228–230, 232–240.
- `line-023_p2.mp3` × 180: páginas 12–13, 15–28, 32–42, 44–49, 52–58, 60–66, 71–86, 88–92, 94–96, 98–103, 106–107, 109–118, 123–129, 131–137, 140–152, 156–166, 169, 171, 174–177, 180–189, 193, 195–206, 210, 212–219, 222–224, 228–230, 232–240.
- `line-023_p3.mp3` × 174: páginas 12–13, 15–28, 32, 34–42, 44–46, 48–49, 52–58, 60–66, 71–86, 88–92, 94–96, 98–103, 106–107, 109–118, 123–129, 131–137, 140–152, 156–166, 169, 171, 174–177, 180–187, 189, 195–196, 198–206, 210, 212–213, 215–219, 222–224, 228–230, 232–240.
- `line-024_p1.mp3` × 180: páginas 12–13, 15–28, 32–42, 44–49, 52–57, 60–66, 71–86, 88–92, 94–96, 98–103, 106–107, 109–118, 123–129, 131–137, 140–152, 156–166, 169–171, 174–177, 180–189, 193, 195–206, 210, 212–219, 222–224, 228–230, 232–240.
- `line-024_p2.mp3` × 178: páginas 12–13, 15–28, 32–34, 36–42, 44–49, 52–57, 60–66, 71–86, 88–92, 94–96, 98–103, 106–107, 109–118, 123–129, 131–137, 140–152, 156–166, 169–171, 174, 176–177, 180–189, 193, 195–206, 210, 212–219, 222–224, 228–230, 232–240.
- `line-024_p3.mp3` × 173: páginas 12–13, 15–28, 32–34, 36–40, 42, 44–49, 52–57, 60–66, 71–86, 88, 90–92, 94–96, 98–99, 101–103, 106–107, 109–118, 123–129, 131–137, 140–141, 143–152, 156–158, 160–166, 169–171, 174, 176–177, 180–189, 193, 195–206, 210, 212–219, 222–224, 228–230, 232–240.
- `line-025_p1.mp3` × 180: páginas 12–13, 15–28, 32–42, 44–49, 52–57, 60–66, 71–86, 88–92, 94–96, 98–103, 106–107, 109–118, 123–129, 131–137, 140–152, 156–166, 169–171, 174–177, 180–189, 193, 195–206, 210, 212–219, 222–224, 228–230, 232–240.
- `line-025_p2.mp3` × 178: páginas 12–13, 15–28, 32–42, 44–49, 52–57, 60–66, 71–86, 88–92, 94–96, 98–102, 106–107, 109–118, 123–129, 131–137, 140–152, 156–166, 169–171, 174–177, 180–189, 193, 195–206, 210, 212–219, 222, 224, 228–230, 232–240.
- `line-025_p3.mp3` × 174: páginas 12–13, 15–28, 32–42, 44–49, 52–57, 60–66, 71–86, 88–92, 94, 96, 98–102, 106–107, 109–118, 123–129, 131–137, 140–152, 156–166, 169–171, 175–177, 180–183, 185–189, 193, 195–206, 212–219, 222, 224, 228–230, 232–240.
- `line-026_p1.mp3` × 180: páginas 12–13, 15–28, 32–42, 44–49, 52–57, 60–66, 71–86, 88–92, 94–96, 98–103, 106–107, 109–118, 123–129, 131–137, 140–152, 156–166, 169–171, 174–177, 180–189, 193, 195–206, 210, 212–219, 222–224, 228–230, 232–240.
- `line-026_p2.mp3` × 179: páginas 12–13, 15–28, 32–42, 44–49, 52–57, 60–66, 71–86, 88–92, 94–96, 98–103, 106–107, 109–118, 123–129, 131–137, 140–152, 156–166, 169–171, 174, 176–177, 180–189, 193, 195–206, 210, 212–219, 222–224, 228–230, 232–240.
- `line-026_p3.mp3` × 178: páginas 12–13, 15–28, 32–42, 44–49, 52–57, 60–66, 71–86, 88–92, 94–96, 98–103, 106–107, 109–118, 123–129, 131–137, 140–152, 156–166, 169–171, 174, 176–177, 180–189, 193, 195–196, 198–206, 210, 212–219, 222–224, 228–230, 232–240.
- `line-027_p1.mp3` × 180: páginas 12–13, 15–28, 32–42, 44–49, 52–57, 60–66, 71–86, 88–92, 94–96, 98–103, 106–107, 109–118, 123–129, 131–137, 140–152, 156–166, 169–171, 174–177, 180–189, 193, 195–206, 210, 212–219, 222–224, 228–230, 232–240.
- `line-027_p2.mp3` × 173: páginas 13, 15–28, 32–35, 37–42, 44–49, 52–57, 60–66, 71–86, 88–92, 94–96, 98–103, 106–107, 109–118, 123–129, 131–137, 140–152, 156–157, 159–166, 169–171, 174–177, 180–186, 188–189, 193, 195–206, 213–219, 222–223, 228–230, 232–240.
- `line-027_p3.mp3` × 167: páginas 13, 15–18, 20–28, 32–35, 37–42, 44–47, 49, 52–57, 60–66, 71–86, 88–92, 94–96, 98–103, 106–107, 109–118, 123–126, 128–129, 131–137, 140–152, 156–157, 159–166, 169–171, 175–177, 180–186, 188–189, 195–206, 213–219, 222–223, 228–230, 232–233, 235–240.

Duplicados de contenido SHA-256: 387 grupos y 1014 archivos involucrados. Igualdad binaria, no equivalencia perceptual. Se listan todos los grupos concretos:

- `001af61f84d44844c6ab8a4e566d454ca65c738c79cee6b6ba88934dd67444aa`: `page-115/line-014_p3.mp3`, `page-121/line-001_p3.mp3`, `page-127/line-010_p3.mp3`, `page-132/line-001_p3.mp3`
- `002ecf60017a3b5d9d61c9885d4f6cd385931c60e85a3abba64b265c6184de97`: `page-035/line-008_p3.mp3`, `page-052/line-025_p3.mp3`, `page-056/line-013_p2.mp3`, `page-142/line-017_p3.mp3`, `page-196/line-017_p2.mp3`
- `01adfe7d4ccf5681b10c592f9c822cb42be61d5c01d7fb8a26241f978fbee92c`: `page-106/line-006_p1.mp3`, `page-200/line-025_p3.mp3`
- `02b5a38751c9630fa104e71bd61620e344258d9bd9511fa87e4c58dd1a86b9f1`: `page-094/line-005_p3.mp3`, `page-109/line-009_p3.mp3`
- `034244f5ddf3fe3341211fb495630febd84dcbe347a244f240822158b70ef7dd`: `page-201/line-014_p3.mp3`, `page-203/line-005_p3.mp3`
- `0357ae233061ee07c92601200de6fbacaffd3496087d46028130feec07daa612`: `page-083/line-008_p3.mp3`, `page-088/line-010_p3.mp3`
- `03f858f40084bdc5963e93311110ff76ec454e14fed4359b6fb1a31fc38a4795`: `page-119/line-003_p3.mp3`, `page-165/line-013_p2.mp3`
- `0574b5c41445749bd62549362b1ea18d3a870109f1fa1617fba0d100e21310a2`: `page-081/line-018_p3.mp3`, `page-114/line-019_p2.mp3`, `page-161/line-005_p3.mp3`
- `05c32349b8bbd3bfabddca4d6083a33eb125d1fb5e14decba4927920e4628588`: `page-133/line-009_p2.mp3`, `page-159/line-009_p2.mp3`
- `0639d6d059b8e5e86dd5fa87e3d3855c71b436d89ac37e2d826f1b7ab29cb6a7`: `page-145/line-013_p3.mp3`, `page-145/line-014_p1.mp3`
- `063a42552bbd8638d84bc6e86245d8c3885373183713641ed9b7d2f4afaa56ff`: `page-112/line-014_p2.mp3`, `page-117/line-019_p1.mp3`
- `063c9d587720f02e9e9d7be56d8f0b135107b6ac5428faec40e45fbfa857d340`: `page-121/line-016_p2.mp3`, `page-122/line-004_p2.mp3`, `page-128/line-014_p3.mp3`
- `0663285aa40e4b3c89663bf5e66cae2614a61d2b36528f13777b548bda1a6d54`: `page-114/line-013_p1.mp3`, `page-143/line-018_p2.mp3`
- `083db2e7f38daf4aadaa3d907459b7c6a61835dbc5ff8811891c3af6d250eb8f`: `page-013/line-014_p3.mp3`, `page-062/line-024_p1.mp3`
- `0870989c2f11d7240adca07444dd247a861079d2c3caf3f5cc051b3d25217c26`: `page-082/line-008_p3.mp3`, `page-176/line-002_p2.mp3`, `page-221/line-017_p1.mp3`
- `08a7c7e3ba354a8b752d09c073078c9ccdbc9ce97524588b8504a52a95a5e6b2`: `page-126/line-003_p1.mp3`, `page-132/line-010_p3.mp3`, `page-168/line-015_p3.mp3`
- `08db7ec2a3c43564133fef8924597859ecd9e6bb012d755319090f0ef30beec0`: `page-039/line-022_p2.mp3`, `page-196/line-016_p1.mp3`
- `08fbd39777c027ae13d1d32255591d90bc5d66a7644a875d32bd59947a8b5198`: `page-156/line-009_p3.mp3`, `page-159/line-019_p2.mp3`
- `09c7e1947983419e3cfc25bb7fd697fc7b9084066adfa22c051770e9681b8360`: `page-084/line-027_p3.mp3`, `page-157/line-014_p3.mp3`, `page-164/line-023_p3.mp3`, `page-221/line-009_p2.mp3`, `page-222/line-002_p3.mp3`, `page-240/line-002_p3.mp3`
- `0af0bb154375add4bba2542008a00fdb8946b0658d35d9be58dd00e2dfb93cdf`: `page-052/line-002_p2.mp3`, `page-072/line-018_p2.mp3`
- `0ce486a26af4decbc0159222873e33a4b07e1d3c14ad749957783bcb490047ca`: `page-151/line-025_p3.mp3`, `page-206/line-020_p2.mp3`
- `0cf0ce8eff212bb152435bf1be27efd2a3ec82ed0d49a1d168afef8277579ff1`: `page-019/line-011_p2.mp3`, `page-042/line-007_p2.mp3`
- `0de2ec5045045e4d96c0d6363ae78b13e0bd0f6111df501c833527fdcac41f94`: `page-176/line-014_p2.mp3`, `page-206/line-002_p3.mp3`
- `0e7e714b06060726ee0f389111cfad0136e7c28af643a1310d81709aa5433b5c`: `page-217/line-027_p3.mp3`, `page-218/line-020_p2.mp3`
- `0fd0dec54d7d0ee2d449b20c837bc5264cf099c8d8e335b909dd99c1821c669e`: `page-091/line-011_p2.mp3`, `page-131/line-021_p3.mp3`
- `104be4885df622953d22dd1106b4123f20b1029c53c5edb0bfd8702f049dbc4b`: `page-022/line-017_p1.mp3`, `page-023/line-006_p1.mp3`, `page-035/line-003_p1.mp3`
- `106fdfb90a0e2f90c5dff20178a94c0bcf083d711547e0e89eaea54bb6710c04`: `page-073/line-025_p3.mp3`, `page-228/line-010_p3.mp3`
- `1157c7f6c7634fd2f26404689e6b549ca17e24a804654f8a9b6b7d07c7cb75ee`: `page-045/line-027_p1.mp3`, `page-046/line-012_p1.mp3`
- `11ec4c31f39c737b3a1c5d3839cb5b2b0e0d0641847e7e976dc232e8c66c379d`: `page-038/line-020_p1.mp3`, `page-071/line-025_p1.mp3`
- `121cb1b0e849d0811b0514227769347b361ec439484c3b5c5d94970035d0d953`: `page-156/line-016_p2.mp3`, `page-209/line-006_p2.mp3`
- `1360b2ebb1f452ef2930ae62da2e7f2a1fa26e898fbab6c16fb544f284d0256e`: `page-131/line-027_p1.mp3`, `page-221/line-014_p1.mp3`
- `142843ac530df4a38a1b1302ce9a72e9c66d67fcd9070339f0818b38c283748e`: `page-065/line-023_p1.mp3`, `page-150/line-013_p1.mp3`
- `162f6f769973fc0007ba207e6a99350674c7b1f42d94e5530f99575201ec13bd`: `page-021/line-016_p2.mp3`, `page-025/line-006_p2.mp3`
- `1739f146d9429ae8cd0ac2ce36399dcc415131ab9630acb644df9136c973484e`: `page-102/line-018_p2.mp3`, `page-205/line-013_p3.mp3`
- `179df16db3c49e6e668703e0b8f9d8ab276aee3718b8a7f195ec2e38b183c8bd`: `page-078/line-003_p3.mp3`, `page-118/line-013_p3.mp3`
- `197e5b645e7682e03193f0131955edacb502795b46269a9351fef5f5ac7aecb5`: `page-128/line-009_p2.mp3`, `page-155/line-014_p2.mp3`
- `1a89b4fa1965f6f65f009c2476d6f7774d084f2c05939a390fc616097b877391`: `page-130/line-003_p2.mp3`, `page-134/line-017_p2.mp3`, `page-142/line-014_p2.mp3`, `page-183/line-017_p3.mp3`
- `1b2bfb91d2fc1648ea9ad2e0d16e890d5e7057d9f7fe40588a17ef432b74daae`: `page-026/line-007_p2.mp3`, `page-039/line-004_p3.mp3`, `page-087/line-017_p1.mp3`, `page-140/line-020_p3.mp3`, `page-209/line-012_p2.mp3`
- `1b4a52faf1a0ac44cd56229577ce987e2bd7d2d52eee6d4c981d31ab88330344`: `page-140/line-013_p2.mp3`, `page-219/line-025_p1.mp3`
- `1cb50d1c41b8e1ab64356ed30c23a93e730b3a0025817733bcda76a5f55e206f`: `page-047/line-013_p3.mp3`, `page-098/line-013_p3.mp3`, `page-213/line-014_p3.mp3`
- `1ea6130c4029fd67298262027f57c5c203806dfbf3c16d214553944f4b9a4337`: `page-114/line-013_p2.mp3`, `page-189/line-007_p3.mp3`
- `1fdd3fd8f9ec52d1a29aff6187b67e9a0170788301c9e5328824808bca7416ff`: `page-106/line-022_p2.mp3`, `page-167/line-003_p2.mp3`
- `2188e47350b5dcc5f00a1bf044acde610754b4a15e669c0ff79cd3cdfbbd0f55`: `page-174/line-027_p2.mp3`, `page-180/line-013_p1.mp3`
- `2189f2f3164d8fcfe512496c868f68740401f54ab53ebb2b633cb9a6df78ba40`: `page-197/line-016_p1.mp3`, `page-235/line-001_p2.mp3`
- `21e6146e8f51c6fe25466827085fe9c08eab5cbeda78891dee1b1aa54f9f0029`: `page-175/line-016_p3.mp3`, `page-229/line-002_p1.mp3`
- `22ff1342a94737296136731d754980e0f39c0f38ff134dcd7669556fa99ec746`: `page-089/line-021_p2.mp3`, `page-160/line-024_p3.mp3`
- `23a8051fcd7ddb92f422828d4c96e5cbfcea576712b32c9222251991c143b0c1`: `page-100/line-021_p3.mp3`, `page-100/line-022_p1.mp3`
- `24110768cab1d5f182d638a33d5a0f1b3d47c34fd6195aa24f2339854ca98c74`: `page-205/line-007_p2.mp3`, `page-205/line-008_p2.mp3`
- `24a071f809cb4456ff4f116ddfbb495668cc24b77462fe90f9069aba0cb9d1b4`: `page-099/line-009_p3.mp3`, `page-171/line-010_p2.mp3`, `page-189/line-010_p3.mp3`, `page-212/line-007_p2.mp3`
- `27084c41ad64f48a55a75f7f80cf42d2f42f658d073861bf4de0c22f640599de`: `page-019/line-016_p1.mp3`, `page-056/line-019_p2.mp3`
- `27342c9259549facb64d544f2972880f8cf7d6100bdaae05cbc3c84e6405d276`: `page-078/line-015_p2.mp3`, `page-114/line-011_p2.mp3`, `page-186/line-001_p1.mp3`
- `2766fd0f06c1b9073965ae9faf3410a91a927e58ecbc08b8f0871b6766b9e466`: `page-116/line-023_p2.mp3`, `page-196/line-005_p2.mp3`
- `28d4fbd54c5e823bcf83611ac1caab2150bc9b0c3b1a0fdbe8be0392d1ba9258`: `page-059/line-014_p3.mp3`, `page-090/line-001_p3.mp3`
- `28d61f3c01726d4dda053f5f2bc5eacb93a74941a29fb83e15d86f970ceeeece`: `page-102/line-026_p3.mp3`, `page-138/line-004_p3.mp3`, `page-223/line-020_p3.mp3`, `page-228/line-026_p2.mp3`
- `2923c353d8dabf3a61de6eed4c444dbf26842657f04c742b28ce60bbb793a306`: `page-148/line-001_p3.mp3`, `page-187/line-024_p3.mp3`
- `293b104c73fd143cac275e20dd14fcad0c68488191d2f1b3ab62438ec87f766f`: `page-163/line-021_p2.mp3`, `page-175/line-015_p2.mp3`, `page-237/line-026_p3.mp3`
- `29b57da503103c0665469a6586ce66d77056d816f132919e43245e13a5cdc387`: `page-015/line-024_p1.mp3`, `page-023/line-027_p2.mp3`, `page-046/line-009_p1.mp3`, `page-102/line-025_p1.mp3`, `page-190/line-005_p2.mp3`
- `2a84155fc4d13db1e404012c93a573a0de04764b5225022408626c2c4f9c6bbd`: `page-088/line-014_p3.mp3`, `page-096/line-024_p3.mp3`
- `2ae1edda473d1d4105fce1937e14ea979f626e89ec0fd32e235e275786928cc7`: `page-115/line-024_p1.mp3`, `page-131/line-021_p1.mp3`
- `2af37f7960cc0383aeffc0220f28ae4a3e0c02a0ed7a6ec041a044d487241c94`: `page-140/line-009_p3.mp3`, `page-158/line-021_p3.mp3`
- `2b2babd22b28c8454bc5ca9fbc6112662502763488bd261cde4731ed4d9deda3`: `page-175/line-005_p2.mp3`, `page-227/line-006_p3.mp3`
- `2c75277e9618a349511761c7cba2c04d220b77329e13827a513a7264193d2a35`: `page-024/line-021_p3.mp3`, `page-062/line-001_p2.mp3`
- `2ca3afa437fa598c12e61c6622797ecfddd639e04a4af1710bc8e52b5d0ce0b0`: `page-128/line-020_p1.mp3`, `page-158/line-025_p1.mp3`
- `2d1096e0249aa9ca7d8c5f43c637be52ecb545a5054883025707ab0bd426ef44`: `page-053/line-013_p3.mp3`, `page-066/line-026_p2.mp3`
- `2dbf2309c7638c73bb67a00294702a43ca1a03f8fbb3264866d85c0b559c386e`: `page-132/line-014_p1.mp3`, `page-176/line-004_p1.mp3`, `page-234/line-027_p2.mp3`
- `2eb6765ae8a0abd8ee2d477e23f792766952d4d572b0cfec14f34390c27bb499`: `page-184/line-015_p2.mp3`, `page-229/line-012_p3.mp3`
- `2f21f864802e15b566bba9dbca859f6d49d4a8c69abce93fde76aef089493166`: `page-148/line-009_p1.mp3`, `page-152/line-018_p1.mp3`
- `2f7352c39854c7c7b9c47e062c97124bd19fe69dacd01a9b75fdec915c138b89`: `page-039/line-021_p2.mp3`, `page-062/line-019_p1.mp3`
- `2fa23ee3b362b0522641cfb84cde4248c7030d6bb0ddeaf5d45454bac2832f7c`: `page-210/line-006_p3.mp3`, `page-224/line-003_p3.mp3`
- `30f8d9da567c73bd9ed55de684219ec53b3144ca94f65c0834ef44c2cad78a90`: `page-074/line-008_p3.mp3`, `page-105/line-001_p3.mp3`, `page-131/line-003_p1.mp3`, `page-141/line-002_p1.mp3`, `page-155/line-014_p1.mp3`, `page-217/line-015_p2.mp3`
- `315bc444794632f9867698c59a52166903d0fe27948d902c4e5556a4b461be3b`: `page-085/line-022_p2.mp3`, `page-195/line-019_p1.mp3`
- `317e1ef60dbfdea0ed397409cc9d857b30a68e57acd207c90519c4f3ffcf2035`: `page-042/line-027_p3.mp3`, `page-043/line-003_p3.mp3`, `page-052/line-010_p3.mp3`, `page-061/line-003_p3.mp3`, `page-092/line-014_p3.mp3`, `page-094/line-023_p3.mp3`, `page-096/line-027_p3.mp3`, `page-098/line-026_p3.mp3`, `page-113/line-009_p3.mp3`, `page-126/line-002_p3.mp3`, `page-141/line-012_p3.mp3`, `page-150/line-009_p3.mp3`, `page-176/line-022_p3.mp3`, `page-179/line-003_p3.mp3`, `page-195/line-005_p3.mp3`, `page-196/line-003_p3.mp3`, `page-214/line-015_p3.mp3`, `page-217/line-001_p3.mp3`, `page-217/line-023_p3.mp3`, `page-225/line-006_p3.mp3`, `page-240/line-022_p3.mp3`
- `31f61f17c86db27e44c6c5fcfe5ef176b8ad77e1a481d82d1347751a743b1b7a`: `page-092/line-018_p3.mp3`, `page-143/line-009_p3.mp3`
- `33170c57ddfcd1311ea39072618059d164eade52567f62c882e7bb29403ddbf9`: `page-056/line-024_p3.mp3`, `page-174/line-017_p3.mp3`, `page-198/line-012_p2.mp3`, `page-240/line-003_p3.mp3`
- `34bdaefddc3ff16467668be28511cbf769fcc39b13b4c27dd1620f3337acd224`: `page-159/line-019_p3.mp3`, `page-170/line-016_p2.mp3`
- `358eeaab55675aab9b19e64071cb9363f2cdc62bf31dac3a57fa6874f00b1cf7`: `page-097/line-004_p1.mp3`, `page-132/line-022_p1.mp3`
- `362916970a095e0a90babf849a16e484d6d68d3646abda2c9c08dec1cfcbf4e5`: `page-188/line-011_p3.mp3`, `page-197/line-022_p1.mp3`
- `370bf42efcd3760b3887eabc2a398dea1ff740958f9c37a74df93744737d7730`: `page-093/line-012_p3.mp3`, `page-131/line-013_p2.mp3`
- `3716ca0729d6486d486da2551b83cc634248edc37926bc31e2a169c9619e5c70`: `page-103/line-022_p1.mp3`, `page-121/line-008_p3.mp3`, `page-136/line-021_p1.mp3`, `page-158/line-013_p2.mp3`
- `388bb65afe7d9451694ddd0329e7ad95c5e33ab3bc4be2901640a9fb49c555fd`: `page-101/line-013_p2.mp3`, `page-220/line-013_p2.mp3`
- `39379699635b762e00be5379ef462c68ac6542145be1eb5c54d6e75399c0b053`: `page-150/line-016_p2.mp3`, `page-150/line-019_p3.mp3`, `page-180/line-011_p3.mp3`, `page-186/line-018_p2.mp3`
- `3ad60af68fc54336f0b660deed9271089708647a20312cf5f0d3fa71c650fbf9`: `page-045/line-012_p1.mp3`, `page-203/line-025_p3.mp3`
- `3b1cc9cf8220a3393a905f96d4148f301dc57370a7729df2714f7fc965033c42`: `page-038/line-019_p3.mp3`, `page-063/line-019_p1.mp3`
- `3ccb812c6680f343cbaed9125749d5b81b22c45c7386e34e8c88ad7ba718bd57`: `page-018/line-021_p3.mp3`, `page-024/line-008_p1.mp3`, `page-036/line-024_p1.mp3`
- `3d13c7d95a4a08d46a69090527b6e22723c63f6d7cd06b9bc9cb5bcb3d3c7540`: `page-181/line-018_p2.mp3`, `page-192/line-003_p2.mp3`
- `3f0b6e74e99a46da60d5483b54042099a4ea6121a6e831cdfc6bcfe6d8c59834`: `page-172/line-016_p3.mp3`, `page-221/line-006_p3.mp3`
- `3f888564008ea0215eec607f829c17515300474ad3434481ce1898b026a33891`: `page-074/line-001_p1.mp3`, `page-099/line-017_p1.mp3`, `page-184/line-001_p2.mp3`
- `403abe50a7cbf3f73ba983375d1a269195b1bca2e71482011e3aae3660a423d3`: `page-195/line-014_p1.mp3`, `page-207/line-008_p1.mp3`
- `4158a1389add62db6768660899145ff010cd8b12c1efd42935d422ee7e226e09`: `page-081/line-024_p2.mp3`, `page-131/line-013_p1.mp3`
- `42b8d2b31b52ca53baaf23872b9fb4303ec8f0e14244f57c91d907611ced697e`: `page-028/line-010_p2.mp3`, `page-041/line-006_p2.mp3`
- `42d8c6c823aeeaa5d120e20a086e3a4781cec74f444052948ac5dc123e1cd6d1`: `page-054/line-026_p3.mp3`, `page-055/line-007_p2.mp3`
- `43a39a38976aa50791cde0beb1f6d9180233435f00bfc508fe2d4d6b83ca24c8`: `page-134/line-018_p3.mp3`, `page-164/line-014_p3.mp3`, `page-192/line-006_p3.mp3`
- `43ae85dbb2cbb2f2f12a2117d85f377e863bdbf3d5111206eb460153b3762ca0`: `page-124/line-004_p2.mp3`, `page-129/line-010_p3.mp3`
- `4433983de2a218291a48b26608b849fa8cbdafa9e1e16961e8fcaa86d4308c7d`: `page-033/line-023_p1.mp3`, `page-038/line-019_p2.mp3`, `page-058/line-015_p2.mp3`
- `4712093b4c7edde6e5fe7c73861d7becbc19500117b8382b696d2a78bf79b9b9`: `page-034/line-009_p3.mp3`, `page-205/line-017_p2.mp3`
- `48dd9f3e4e7ae2fe5c364597a5ec20d9c727f0a86ca9c6bb9586ad4bfa18685d`: `page-037/line-021_p1.mp3`, `page-062/line-020_p1.mp3`, `page-082/line-014_p2.mp3`
- `490a959cb970270e4da016e734bcb34d333a3a4ab2dde777682b2524bc9d7a84`: `page-184/line-011_p3.mp3`, `page-220/line-003_p3.mp3`
- `4a24e30925107ed15b5d9c18c033010353bd57f244c8fe131ed29bb1c6e1829f`: `page-019/line-005_p3.mp3`, `page-047/line-008_p2.mp3`
- `4a4b1203760d477c2e12be4d0385375902ca931cb5f2c0d04cb6b3258c326707`: `page-172/line-007_p1.mp3`, `page-203/line-009_p2.mp3`
- `4aa2eb140a60d39b3139167137ae4e422db53a935ce4c4a19784dbb8984c4d12`: `page-103/line-004_p3.mp3`, `page-170/line-019_p3.mp3`, `page-188/line-007_p3.mp3`
- `4c55594bdbc22d1675cbec36fba8d4ed675fadfdbfe052d12bee8fdd47f27ae2`: `page-080/line-017_p3.mp3`, `page-123/line-008_p3.mp3`, `page-136/line-015_p3.mp3`, `page-187/line-011_p3.mp3`
- `4cf5cbd25548b095a1405d0423c405db41b2128322b0d5bddf228d5cfb779580`: `page-012/line-020_p1.mp3`, `page-034/line-001_p1.mp3`
- `4d0eecb778d0a186fda67980e56f84ac78507a6f4741cfdf577d57e704808028`: `page-112/line-014_p3.mp3`, `page-141/line-002_p2.mp3`, `page-182/line-006_p3.mp3`, `page-231/line-008_p3.mp3`
- `4e92b1533c24b906145097851af0ef64822939b7962f69e1202ca95679b15e8c`: `page-107/line-005_p3.mp3`, `page-109/line-020_p3.mp3`, `page-111/line-018_p2.mp3`, `page-114/line-007_p3.mp3`, `page-128/line-001_p3.mp3`, `page-137/line-006_p3.mp3`, `page-137/line-026_p3.mp3`, `page-139/line-013_p3.mp3`, `page-142/line-004_p3.mp3`, `page-161/line-026_p3.mp3`, `page-186/line-020_p2.mp3`, `page-189/line-009_p3.mp3`, `page-193/line-017_p3.mp3`, `page-211/line-013_p3.mp3`, `page-229/line-016_p3.mp3`
- `4fe0a8cee2cfd63217748bad228221bfd710837675187396270286846928c609`: `page-035/line-025_p1.mp3`, `page-045/line-025_p3.mp3`
- `501c98ba459a3fb20713cf0fd39f528d16aca279a6e63ebacdc8534fd7d1c129`: `page-123/line-012_p1.mp3`, `page-165/line-020_p2.mp3`
- `5115efa81b71de46bba0da6267839c9ecba1c3ca06e0b57d44dcf9b86f8424f2`: `page-015/line-024_p3.mp3`, `page-041/line-004_p3.mp3`
- `5167961322fcdb72aa773aa658900d63a91378140aa86b3927505f8ef79d27ac`: `page-101/line-016_p3.mp3`, `page-146/line-006_p3.mp3`
- `51aa09be4bf9db09a5d461f0c065377b9460acb50083f7e5a6a65e6b1beb5931`: `page-089/line-025_p3.mp3`, `page-091/line-018_p2.mp3`
- `5221c5efb9d99e4f4df01e9923027e72f4d3a867cf7814650eee183b0a7ce06d`: `page-200/line-014_p2.mp3`, `page-206/line-011_p1.mp3`
- `5259596a45a0f3b09aab5cfa3df87c6758dc070d9c50a28b3207840e0a979937`: `page-133/line-002_p1.mp3`, `page-230/line-016_p2.mp3`
- `52865c9a343a08da3223b797cd810f5cf538bcf0dcec5cbe5e33c9b15348cb1a`: `page-086/line-003_p2.mp3`, `page-095/line-009_p2.mp3`
- `52fff170d324bd483dd718c5f2ed0bb0413470ac3da05ca0c23c8d9888ba75e2`: `page-133/line-006_p3.mp3`, `page-200/line-011_p3.mp3`
- `5322648ae18861915ba24a823d10df49b40793d47076c22bf6b7845474bd18fd`: `page-045/line-026_p2.mp3`, `page-062/line-017_p2.mp3`, `page-229/line-020_p3.mp3`
- `549a2bf1dbdb7058494085cade73ea6f7e318905bc9069daec9c05b116fe638a`: `page-115/line-004_p3.mp3`, `page-150/line-022_p1.mp3`
- `55d455d0a22c166912fcf0a6fd2ffa770edb3196521a72904a43cbedd10bcc9f`: `page-082/line-023_p2.mp3`, `page-128/line-005_p2.mp3`, `page-187/line-019_p2.mp3`, `page-213/line-017_p3.mp3`
- `5684dd9b91d4d005d0bcb1f5749801081797183c5290f8a40135a335caef8297`: `page-100/line-005_p2.mp3`, `page-159/line-021_p2.mp3`
- `57ac6249af4e0c964d16e05fc9045c33a814219aec7310c09babcd3986768291`: `page-034/line-011_p3.mp3`, `page-076/line-024_p1.mp3`
- `5807d0444bbf8fcfe9762bba3d26b7790615bbe363d1ad1b5abefb6974653a79`: `page-072/line-010_p1.mp3`, `page-146/line-026_p2.mp3`, `page-238/line-014_p3.mp3`
- `580f68d1007656fe78ba0a8cc5f262a0b1220dd8d5aba8d22f10c9f658f384cb`: `page-065/line-021_p2.mp3`, `page-078/line-001_p3.mp3`, `page-232/line-004_p3.mp3`
- `58cce26028932345c084a45b8a64f29c84a36037e7778399b124ec0a49f1d784`: `page-132/line-026_p3.mp3`, `page-215/line-006_p3.mp3`
- `58d48167c313c429b7b376628dbe2e3bc6c2aedd90fb95bd34e8645c48f88d1c`: `page-086/line-014_p1.mp3`, `page-240/line-023_p1.mp3`
- `58dbc73f01e48b7bf49e423a191f790d9808b0211ed9341c9421feb38b180db3`: `page-107/line-006_p3.mp3`, `page-140/line-016_p2.mp3`, `page-169/line-024_p3.mp3`
- `5a4f49e4100f6dbef3ab4410899f763d60935674e6748516572440087b3eb420`: `page-100/line-016_p3.mp3`, `page-100/line-017_p1.mp3`
- `5afddfa473b21c5714dca19739f784ebb18b355c229cfac2f792729cb8be1fa5`: `page-076/line-018_p3.mp3`, `page-113/line-020_p2.mp3`
- `5b0753216119d4c776fe6e9b9b2c4c73fa780e29ff3ee11ba648c12ea7f47dc7`: `page-045/line-021_p1.mp3`, `page-050/line-002_p3.mp3`
- `5bdf34be7cb4057418ba0098a548067a00c4b7905eaccaa78f0d4b6cee90282d`: `page-049/line-001_p1.mp3`, `page-063/line-025_p1.mp3`
- `5c50b9a610c5cb34770b2cb56213f60918b3d7d95a7dd62426ce2b4faa0d4333`: `page-160/line-011_p2.mp3`, `page-188/line-023_p1.mp3`
- `5e16c176be78be419ad590071744c0ddde437580d0b5668229766c0851bfb081`: `page-119/line-010_p1.mp3`, `page-217/line-012_p1.mp3`
- `5f1c9fe801941d490f841063f5278e79e5846293ef05598a4b64301ec07a8558`: `page-070/line-007_p1.mp3`, `page-100/line-026_p3.mp3`
- `60d53d3e68b10ef4ad2957bd03a9ebc32b886482df450d27e48c1cea442a3d96`: `page-150/line-015_p2.mp3`, `page-206/line-007_p1.mp3`
- `611467b0c1ce3aa23f76b37318decf66942d6daed15b4dd6d353a1586e43a9b6`: `page-111/line-017_p3.mp3`, `page-169/line-008_p2.mp3`
- `6116d48f32414a46f1d648ff7e973e2893ea8e944fb905d1c687282b81c1cd66`: `page-117/line-009_p1.mp3`, `page-139/line-003_p3.mp3`
- `62bde615e4f0511a2637bc078935f35f8086d7a3728b9a82d531276ed3bb4251`: `page-069/line-009_p3.mp3`, `page-099/line-012_p3.mp3`
- `62eef8d52b9c057cdbbdb8bf59655a00050384c1b8fe3d66632032ee12f2c12a`: `page-191/line-016_p3.mp3`, `page-198/line-009_p3.mp3`
- `633ce6a979d9de9c5f531f66178e0f9daeb617f5d6fc9e45528a989b8140d6f9`: `page-118/line-021_p3.mp3`, `page-234/line-012_p3.mp3`
- `63c5f586841beaf9fca3becbe22e6389756c31b4c552c977bdf9eb3f5804039b`: `page-021/line-004_p3.mp3`, `page-055/line-018_p3.mp3`
- `64fa3581771e755a58037342dfc7072999b3cf2dcd573dbe2bdbbf8a53b3d5bb`: `page-145/line-027_p1.mp3`, `page-149/line-014_p1.mp3`
- `6563cf8b9ad403b7df8773cdc99a883f2e48afdbdbfb4f6ac20f5bae20828c8e`: `page-166/line-025_p3.mp3`, `page-232/line-009_p2.mp3`
- `662ad4611fd856cf856ef059852bd8503c0490b73a5fe96a6e26d2958d509a18`: `page-123/line-024_p1.mp3`, `page-166/line-005_p2.mp3`, `page-166/line-022_p3.mp3`
- `6662632c0eea9469d9feac07e7bca03b30a6a40d903b0c047734829ab34ace93`: `page-148/line-004_p2.mp3`, `page-150/line-022_p2.mp3`
- `668309ddd8ec8ce32fdd5ad97e504634907a9e9348ca8ba00fc99d0551084251`: `page-086/line-007_p2.mp3`, `page-185/line-003_p1.mp3`
- `6683637b98fc67243ae19a478fa251779297024894caba9d602eceea2aa15a4c`: `page-171/line-022_p3.mp3`, `page-198/line-006_p3.mp3`
- `66b9e512999ae427075d45c0112f0261dc5b4b295a33d1ee308fde0a81a9799d`: `page-146/line-006_p2.mp3`, `page-150/line-014_p3.mp3`, `page-159/line-024_p1.mp3`, `page-169/line-002_p3.mp3`, `page-170/line-014_p2.mp3`, `page-176/line-014_p1.mp3`, `page-199/line-002_p1.mp3`
- `6764dd55ff43283b4d3e8778a142011fde7cd5442670486907494079e082f6e2`: `page-048/line-022_p3.mp3`, `page-109/line-011_p2.mp3`
- `685d7420a87b7283397864506ffe5ba97639ae858e16ad8dfc0f94fd92da8f96`: `page-145/line-006_p3.mp3`, `page-177/line-005_p1.mp3`
- `68ffd40c8931d4f3eea32c1ee8594221f1250cf2b3051ed068310e049b5f8ea7`: `page-082/line-027_p3.mp3`, `page-099/line-016_p2.mp3`
- `6902e2c5398045911ec8346744bc4b86e4d383cf1ee505e3aa7e42a1ba187773`: `page-078/line-008_p3.mp3`, `page-161/line-004_p3.mp3`
- `6926101f7bbb3f0c26297216dfae32ec312d0ce8b252da697f8e01680b44c2b9`: `page-034/line-015_p3.mp3`, `page-097/line-002_p1.mp3`, `page-125/line-011_p2.mp3`, `page-131/line-012_p2.mp3`, `page-134/line-021_p1.mp3`, `page-157/line-010_p2.mp3`, `page-174/line-019_p3.mp3`, `page-182/line-018_p3.mp3`, `page-200/line-019_p1.mp3`, `page-201/line-004_p1.mp3`
- `69291452e13658a944200d9efc38a34b4fd43d45c5fe7e0365e852e8f6c736fc`: `page-186/line-001_p2.mp3`, `page-188/line-013_p2.mp3`
- `6a85c9ea89c6c6374ae5322045187867cc907febd178869f6ea25ff012911729`: `page-110/line-017_p3.mp3`, `page-176/line-017_p2.mp3`
- `6b0df217dc83614ded024d7787dc7a56539db1c8090dced183f75d769517544c`: `page-114/line-014_p3.mp3`, `page-184/line-019_p3.mp3`, `page-186/line-007_p1.mp3`, `page-205/line-001_p2.mp3`
- `6b2cdcadf9d3c57163beed147b01d0635a760dedcc8ba6dfe71d6c8bfba9ea10`: `page-080/line-018_p2.mp3`, `page-189/line-004_p3.mp3`
- `6bd3c056053c7113729b9b9f4e58b62a7201a6dd63490e07292d2d2eece8eaa8`: `page-144/line-017_p3.mp3`, `page-210/line-004_p3.mp3`
- `6c9331b773b6dd356c75a5bc8014ee5368954d90c27d149af26afdd0821e0af7`: `page-024/line-006_p2.mp3`, `page-142/line-007_p2.mp3`
- `6d6c381d27cc2d6587fd89579f70065e2a85d528b2af0ef35e6be80c46744651`: `page-101/line-021_p1.mp3`, `page-102/line-024_p1.mp3`, `page-125/line-005_p1.mp3`
- `6d7811b1f4f1a9dbcb264daad65bc0c541b864971337dd9364123cf1226b547f`: `page-158/line-024_p3.mp3`, `page-160/line-002_p3.mp3`, `page-168/line-013_p3.mp3`
- `6e52f4436699409da20a0dad78020ca67799b69380d472665425aa1b8372bc2a`: `page-044/line-003_p3.mp3`, `page-093/line-010_p1.mp3`
- `6e5e960922f18e1103a756c170c83c5fc8013d06fe0267d21bc6c6c1f9891fcb`: `page-143/line-013_p2.mp3`, `page-144/line-021_p2.mp3`
- `6fa4545eb558f69dabc9ccdadc7500bc7d6d07e928a0ef82ac7577117aa1e84d`: `page-161/line-025_p3.mp3`, `page-195/line-023_p3.mp3`, `page-222/line-017_p3.mp3`
- `6fc87bcfde120f1cac60b082447e83bd2d3570f68cd3a90649294699b9bc3bb8`: `page-215/line-022_p2.mp3`, `page-232/line-010_p3.mp3`
- `7156e3df5045b5ea48ea9c94b2d9cd529e57fb5d6c2e6ea8e15c2b0f8cc5ad6d`: `page-172/line-008_p3.mp3`, `page-175/line-027_p1.mp3`
- `7284ef27e417c456bfc2639aaf83702022c7916958fb29825b707f93d6f91766`: `page-152/line-001_p3.mp3`, `page-189/line-022_p3.mp3`, `page-241/line-011_p3.mp3`
- `72a7e084459058a19642420aa8a65c1d5adea87fb7ed0ad59ceeda8c65a9daae`: `page-045/line-021_p2.mp3`, `page-053/line-012_p3.mp3`
- `72ea6fd67c2114456a8f051288b99550fa8141114aec336cd75e7e4a95adcd9b`: `page-085/line-020_p3.mp3`, `page-220/line-013_p3.mp3`
- `746e5bb8a94c620f8824fe0ee7afad20ca84b5b55ad78981d4f11427723a40e9`: `page-071/line-003_p1.mp3`, `page-239/line-004_p3.mp3`
- `74e632d6499f791be5a14104f728cde3a57afea14a95bc69f26e733875be1519`: `page-076/line-010_p1.mp3`, `page-076/line-010_p2.mp3`
- `752b62febd840f976c1c0d1eb8e0d40d4183f099e489c34ff7b89383be9f6432`: `page-155/line-005_p3.mp3`, `page-218/line-014_p2.mp3`
- `753056e6d8e869ae3beb37b44d73e3c3921bdfedc1a71f86c7af3638d9ead6d2`: `page-175/line-017_p3.mp3`, `page-235/line-001_p3.mp3`, `page-235/line-020_p3.mp3`
- `754f1c550b75c31a9e820471eb7306c3b68b47a65dd762eb29b79fdf3e44e3b2`: `page-105/line-016_p2.mp3`, `page-177/line-026_p2.mp3`, `page-202/line-022_p2.mp3`, `page-240/line-012_p2.mp3`
- `75ff706c2b7498397227afbae87d23bb80ba23fe0f8fc9f1e5cd6bcb8178f79b`: `page-137/line-012_p2.mp3`, `page-195/line-024_p2.mp3`
- `76787bad3db2321377d9703ff831e776664c010ce73248b87de273fd1c0ab410`: `page-072/line-011_p3.mp3`, `page-092/line-019_p1.mp3`, `page-093/line-002_p3.mp3`, `page-118/line-008_p3.mp3`, `page-133/line-026_p3.mp3`
- `786307ba479d9fe3e97bcc8495001d43adab518830ab7db3fa1a366a0365333c`: `page-095/line-022_p1.mp3`, `page-115/line-015_p3.mp3`, `page-156/line-002_p1.mp3`, `page-197/line-023_p1.mp3`
- `78c8d134ee3ae509e57a9a02cf21a241fa608dba7683e50e852f218b15337c1d`: `page-099/line-011_p1.mp3`, `page-222/line-015_p2.mp3`
- `79c1c343f8165f77cb339473bfd6aac51fc782eb9b9fad930681518a56da6981`: `page-067/line-006_p2.mp3`, `page-076/line-011_p3.mp3`, `page-079/line-024_p3.mp3`, `page-101/line-020_p1.mp3`, `page-103/line-022_p2.mp3`, `page-107/line-001_p3.mp3`, `page-115/line-027_p1.mp3`, `page-144/line-005_p3.mp3`, `page-193/line-027_p1.mp3`, `page-206/line-020_p1.mp3`, `page-232/line-021_p3.mp3`, `page-233/line-024_p3.mp3`
- `7a052821ea884085df89c395d0b051017f43617779b876697743aedd30fffc70`: `page-100/line-023_p3.mp3`, `page-112/line-009_p3.mp3`, `page-163/line-019_p2.mp3`, `page-197/line-012_p3.mp3`
- `7a420f8049d1c9ff07e0002fd3b075eb4f3a2f30149086febd0593b126618471`: `page-106/line-019_p2.mp3`, `page-163/line-006_p3.mp3`
- `7a7d3a32b066666b1b24efe83492e1cc3234cedf3046812fc6ab233f9459991f`: `page-155/line-003_p1.mp3`, `page-168/line-008_p2.mp3`
- `7c3cb3b75cbc403540152425b5769e09acc8637e75ac11659b11e2a2ac9d2b8c`: `page-054/line-022_p3.mp3`, `page-055/line-008_p3.mp3`
- `7ca3c9faf5fa90040b8c7f86b9136524dc8aaf13cae9b8b4942ded667ec48fb7`: `page-104/line-002_p2.mp3`, `page-141/line-020_p3.mp3`
- `7e1b2059cf6e92594b51b842e40ab246f4034ca3cc5d8ce4910da4503ab1a25a`: `page-121/line-015_p3.mp3`, `page-219/line-017_p3.mp3`
- `7f19dd0bc1b770e306cd7fc999959cabfdc72a1a35cc51765904fc67dbbd8bf7`: `page-091/line-024_p2.mp3`, `page-135/line-027_p2.mp3`
- `7f4607f86355d2e6e2c8fe8a5fad3231bb6daccfeb235c2f78f4c48d69a76cad`: `page-018/line-007_p2.mp3`, `page-078/line-003_p2.mp3`
- `80735baedf558bcab8bfbc481d0d18077ae828ef2b9780433bad1ce4214b2eca`: `page-093/line-007_p3.mp3`, `page-155/line-007_p3.mp3`, `page-174/line-020_p1.mp3`
- `82ccc3ae16242085e36703e11d7aad5111d55d54177398628fec29302fc83e81`: `page-235/line-019_p1.mp3`, `page-237/line-014_p3.mp3`
- `8345da78691162b3c201eee38c4375222b02febd468a26cba6e3dc99fdefacb6`: `page-067/line-011_p3.mp3`, `page-160/line-019_p3.mp3`
- `835b3675fd590398122dfdcf9a7a283be3be43f161dbec78d3fec1243ab14ff5`: `page-020/line-017_p2.mp3`, `page-059/line-012_p3.mp3`
- `83fc83c7780324d50fcad3f71827d31babc0a3740c6542143455dd6a27075e91`: `page-129/line-025_p1.mp3`, `page-131/line-020_p2.mp3`
- `84803ca83c26e63029ff2dd3c6081ddd7c016da893e3e14006499c1db484efdd`: `page-197/line-026_p1.mp3`, `page-200/line-015_p3.mp3`, `page-236/line-005_p3.mp3`
- `853c13977bcae6bc36e963b5e570032a91ace81368853ee24f84151ef1211817`: `page-170/line-012_p1.mp3`, `page-176/line-018_p1.mp3`
- `8560c48fe21f021564f25326b22bcf41a4cb31bdc9f5ddb64d950b7ba45eb963`: `page-176/line-015_p3.mp3`, `page-210/line-003_p2.mp3`
- `868d4d960cb511b0c6538490052a1becf94d3129c239851c0ce3c8d50d42bf5d`: `page-084/line-026_p3.mp3`, `page-090/line-012_p3.mp3`, `page-229/line-017_p3.mp3`
- `86a78d9a1c1bbd362d95afb8923ea15cbaa408538393d830c64c43f6ec4c8913`: `page-219/line-027_p3.mp3`, `page-220/line-001_p2.mp3`
- `871e03dbb251dbff1f07b9854dfe9b7ba0c1df3cb077c914a6873c3850867383`: `page-128/line-011_p3.mp3`, `page-176/line-016_p3.mp3`
- `87331f25ac4b12811cf526f927b581c85c80480db56235e3290c7b631c5a4b14`: `page-160/line-021_p3.mp3`, `page-166/line-001_p2.mp3`
- `8ab3e92688fddcbd3e516c0b0c2c1d4f41b4bbb3100d1ffda46d75dc2338a661`: `page-160/line-017_p2.mp3`, `page-241/line-006_p2.mp3`
- `8b0a12ac3d0d3d9df46dc334612fa57b7952f99d73fcec3a7d3da1a2c034259a`: `page-073/line-003_p3.mp3`, `page-140/line-022_p1.mp3`
- `8b175cb6553d91642e6a49724d06a267135001966c893b9acc9a2f196ace98d7`: `page-143/line-003_p2.mp3`, `page-162/line-005_p3.mp3`
- `8bb1288ec314337d87007cd9edbf827ac119e7115ff892fa36435636defeaedb`: `page-148/line-021_p2.mp3`, `page-217/line-016_p1.mp3`
- `8bfe8c246dfe8baa14a810ab0828839a858136903d7a530947a9cb2a6a379087`: `page-061/line-015_p2.mp3`, `page-097/line-011_p3.mp3`
- `8c21c1523db4ed5f6b4caa1ba8d99f24980f1dde473cc575d618c1e02d5fd767`: `page-113/line-006_p3.mp3`, `page-113/line-012_p1.mp3`
- `8c7e71587f16a1129232eac5cd279e27a29169e82842b05a30cf45b54703c42d`: `page-183/line-012_p2.mp3`, `page-214/line-016_p3.mp3`
- `8c86c9fca3c3bbb9f3b305ba224fd7a9446eabc83fd7b5e2d6ad79bc558e30df`: `page-231/line-014_p3.mp3`, `page-231/line-015_p1.mp3`
- `8c8fbca41c90d6826cd206c073b7c22264364fa57993f8353b1d79aee48eb0bb`: `page-059/line-011_p3.mp3`, `page-062/line-001_p1.mp3`
- `8cf527a2e3a0456204fd8f552f528dd2be4039fed72e137a671cdff4b66cdd85`: `page-037/line-001_p1.mp3`, `page-210/line-026_p1.mp3`
- `8d58f6b5141e63113458f26daa3bf725f83369bc8c7f26a091f1b5abc39a5d0b`: `page-117/line-005_p2.mp3`, `page-117/line-018_p2.mp3`, `page-182/line-016_p3.mp3`, `page-194/line-013_p2.mp3`, `page-205/line-014_p3.mp3`
- `8d6f7d22226259701fe8f67bce2dda7a711daf8164dae08f3900d0dc7f9ec094`: `page-084/line-025_p2.mp3`, `page-089/line-027_p2.mp3`, `page-105/line-016_p3.mp3`
- `8d8f43503a9dc417044647ea81cd0be63367897f31b1f9122c45cf65a35aab28`: `page-047/line-023_p1.mp3`, `page-071/line-003_p2.mp3`
- `8e4eb91587a9c0740eb10f4c6f7324718d2a5ef55b01dc1c575f2a48e9f1e1b2`: `page-103/line-002_p2.mp3`, `page-225/line-021_p2.mp3`
- `8e8907e843319411b916750c488826d1d4b6ac0b138095483e7e4f2e0b8d4cbf`: `page-164/line-024_p3.mp3`, `page-192/line-002_p2.mp3`
- `8ed6cccdc8c7ecedea8e2ccda9b794d9e329fa1d8f63e6a173819a62f1b8f994`: `page-011/line-014_p3.mp3`, `page-052/line-011_p3.mp3`
- `90768d48b509861d18d9e83b9b7b2175b0e888ba7771e5268c77d5a84ed4e400`: `page-150/line-009_p1.mp3`, `page-159/line-008_p1.mp3`
- `90cd2555f273d27e82563c76bae718b0edb7a734d02d26e19db34545cb389f3c`: `page-073/line-024_p1.mp3`, `page-182/line-026_p3.mp3`
- `9139077327ff6f8a29a8546150852bf4264c3ef32207b9c7af7a48c61837e85c`: `page-110/line-005_p3.mp3`, `page-147/line-018_p3.mp3`
- `91d7d43ee7e0b89ff328d50dc032de5467ad5ca64b6fd09e2dd3a07a7c94d34f`: `page-070/line-009_p1.mp3`, `page-174/line-002_p1.mp3`, `page-238/line-003_p2.mp3`
- `93fcd5320b5efe2b9c6497fbabf239931e32b4454789f57b1a60983c38ccfe62`: `page-145/line-011_p3.mp3`, `page-146/line-004_p2.mp3`, `page-147/line-005_p2.mp3`
- `947b226a957418c8dc1d5c2d6789b769204ac0ec494bfd6d644f546d9d1f50ba`: `page-100/line-025_p2.mp3`, `page-200/line-012_p2.mp3`
- `95262ce091718eccae220befcfa06231a0c52554ccfc6aa88a431c5b4190f1fd`: `page-166/line-022_p2.mp3`, `page-209/line-008_p3.mp3`
- `969dc02155a1ce552e53a7c31e9d174bd745780e45f9dc210e9d183d56aa4975`: `page-048/line-004_p2.mp3`, `page-064/line-008_p1.mp3`
- `972d22afe8c3287059822e91b543baa122fd297a0a703f4c96cad6e9888d96c2`: `page-059/line-009_p1.mp3`, `page-059/line-019_p3.mp3`
- `9765469ed4aff23b59af8fea17e88cb6c76b9d9c0ee10548d29958b14bac6a9b`: `page-053/line-012_p2.mp3`, `page-062/line-020_p3.mp3`, `page-085/line-003_p3.mp3`
- `9793f60bc45796bc8685b216ef6df460b8c420c324bb184b9aa9e7a00270b239`: `page-041/line-012_p2.mp3`, `page-060/line-019_p1.mp3`, `page-207/line-019_p3.mp3`
- `97d659cff08afc9b9612b5728654ebf42e9cd8bc8f88cc9835ac5517c7359e78`: `page-155/line-011_p3.mp3`, `page-185/line-011_p1.mp3`
- `987017c92da3a7468c1fa29a3e150fac2d3f95e3a9f49b0daa499b869b7c90ff`: `page-085/line-008_p1.mp3`, `page-109/line-018_p1.mp3`
- `98a09487fca9a83e935738d33bc6340a53a21c81aa06fabcc81d7ab1ba8764a8`: `page-095/line-014_p3.mp3`, `page-116/line-018_p3.mp3`, `page-196/line-012_p2.mp3`
- `98fc8407e045bfeffc56478861724333d211e61c4ace68985c0b4cb24420a374`: `page-103/line-027_p1.mp3`, `page-174/line-026_p1.mp3`
- `9923691064d76d0696f766f0ce08bcc22f8fdf1616469dc02f50baeccb49e17a`: `page-026/line-014_p2.mp3`, `page-047/line-003_p2.mp3`
- `9939d99bca99749db75c937c8918b5104ffe932e61b5958f8bdc6a019006b4ff`: `page-162/line-023_p3.mp3`, `page-193/line-025_p2.mp3`
- `997b9983fe991b6d739fa99a0054b20dc80cfd7d297eb54be9fe0a5d0d9d5faa`: `page-090/line-025_p3.mp3`, `page-094/line-001_p3.mp3`, `page-114/line-020_p3.mp3`, `page-169/line-017_p3.mp3`, `page-200/line-023_p3.mp3`
- `9986fa18418c6095a776f86c96f9825c8a7d6da7ce8248cc64f1ca5a6edb115c`: `page-175/line-015_p3.mp3`, `page-198/line-012_p3.mp3`
- `9be5def1213bd960461140e980c3ed1e888c3b7f6ea026166a2d74e8e1c915d3`: `page-084/line-026_p1.mp3`, `page-095/line-006_p1.mp3`, `page-098/line-004_p3.mp3`, `page-141/line-022_p3.mp3`, `page-144/line-020_p1.mp3`, `page-150/line-020_p3.mp3`, `page-186/line-024_p1.mp3`, `page-201/line-016_p3.mp3`
- `9c1098e990e9e4bcfc9447e927b3b8b6a393bbcbbe6c451cbecc2c8694d436ac`: `page-021/line-026_p1.mp3`, `page-048/line-012_p1.mp3`
- `9c7efbfed963438b44a5bb15c22a3746116a071922f9d1c50961086984c62351`: `page-172/line-006_p3.mp3`, `page-176/line-017_p3.mp3`
- `9dc9c2911c24443f02791c7e88374ca5788cdf1204987f1c91589ba8f8ae80a3`: `page-131/line-003_p2.mp3`, `page-210/line-025_p1.mp3`
- `9e573f30f2d8cc41ec3a2df06e579c986dae6b45dcc41d32b7e93fc841537725`: `page-029/line-011_p3.mp3`, `page-033/line-023_p2.mp3`, `page-058/line-015_p3.mp3`
- `9f085dcd20e0b81db1f0863c621c3b1e949afd7c23f296fc02d91dcf7bf039af`: `page-175/line-007_p1.mp3`, `page-193/line-008_p2.mp3`
- `a09809c9c6fb57332937ab9e342f97e58930c451f03a56f8c0456989649d230b`: `page-027/line-016_p1.mp3`, `page-047/line-005_p2.mp3`
- `a0cd0b29058fe85f187f012cadbd399afb1918894d1a776a0399d87ecd1c538f`: `page-225/line-015_p1.mp3`, `page-231/line-008_p1.mp3`
- `a18c08a683aa3e8b90bb72a96c31bed17c49a82e3efe44748d29d09344a6ea99`: `page-047/line-015_p1.mp3`, `page-077/line-012_p1.mp3`
- `a2803acfd1b1f23b035ba09e5f7e49a1be44085ad4b8575d5e23323238afeaef`: `page-041/line-010_p3.mp3`, `page-047/line-027_p3.mp3`
- `a3c7c62c2215d4fa9c17a1fa9828c1fdab4a50a2d7960192c28d9fd19aebdf24`: `page-129/line-027_p3.mp3`, `page-152/line-016_p3.mp3`
- `a43afa66114e72259f69f1e217327fc396c0ed39314193c0cda2770fa2dd800a`: `page-090/line-005_p1.mp3`, `page-212/line-023_p1.mp3`
- `a47278705dd33ad3f771a839a8e3e6b07594f41fd8ccdf0f5125170e19b53a47`: `page-231/line-009_p2.mp3`, `page-235/line-024_p3.mp3`
- `a476b68ddc782486418c15bb0321eee96bb02fab1064b30a905adbdee9f394dd`: `page-088/line-018_p3.mp3`, `page-142/line-021_p1.mp3`, `page-206/line-002_p2.mp3`
- `a5bc2f498da066d72ba8a7539f4dc0108cecdad183f5d38fb9fdb1608863c97c`: `page-178/line-016_p1.mp3`, `page-196/line-011_p1.mp3`
- `a613140e8b7ecb63c4e4ab52d60609df9e665730f807ae8a99b14180293f9c1d`: `page-124/line-020_p3.mp3`, `page-160/line-011_p3.mp3`, `page-176/line-006_p2.mp3`
- `a63c5fed959a4ae689ce7a6759f8eda97d858aa9250951967f655abfe8ea5ff3`: `page-045/line-013_p1.mp3`, `page-095/line-020_p3.mp3`
- `a6c773fc5e6c53030c82f8792112f783a2aab1fc55106f3c488a74fda31da65d`: `page-124/line-016_p3.mp3`, `page-157/line-017_p2.mp3`
- `a6eaa0c855c27f471e3a04a58db899fc17ecc5e40082e482e06c9b065da06a3f`: `page-095/line-025_p1.mp3`, `page-135/line-013_p2.mp3`, `page-150/line-018_p1.mp3`
- `a763bce36c589aa7a0fc20d951e1d29cad77a3ff843e87d8af3ddabe1258ecf3`: `page-035/line-020_p3.mp3`, `page-071/line-008_p2.mp3`
- `a7b738445dc964954d8368f1f81a816091226cbfbd6a56a99d581428ab145fb1`: `page-130/line-012_p1.mp3`, `page-198/line-013_p1.mp3`
- `a7b7ef355fffe70f17fca57b968ab175217f92ea086482848e5f56b37b178f07`: `page-072/line-019_p2.mp3`, `page-176/line-026_p3.mp3`
- `a8a4354f7ebce679273ed10fed8aa791f21fc43d046c3ba18eff40461bf34592`: `page-086/line-001_p3.mp3`, `page-142/line-009_p3.mp3`
- `a92d9ef160148ffc3d7bc1ab57401c06dfad26e7cbdb90474fe9cb0318346634`: `page-017/line-012_p3.mp3`, `page-082/line-018_p2.mp3`, `page-161/line-027_p3.mp3`, `page-176/line-019_p2.mp3`, `page-219/line-002_p2.mp3`
- `a936b349f2ebfad3368c1007b2b1265ca248849a3a3dfef9208f0f39a5cbfb3d`: `page-134/line-025_p2.mp3`, `page-206/line-018_p2.mp3`
- `a95113c40651c89ae3bf318c8ad77a94f017447103e405fa72577f9d024a4c11`: `page-091/line-015_p2.mp3`, `page-240/line-013_p3.mp3`
- `aa24baacd9b703545c59523aceb0d09f6882ac4ed396ee3c1b17b6e9ef0d294f`: `page-131/line-022_p3.mp3`, `page-195/line-011_p2.mp3`
- `aae6ee51edbc05b83ff40a7bd591f016cf07ea7310787c5494abc12a67654887`: `page-071/line-027_p3.mp3`, `page-117/line-018_p1.mp3`, `page-194/line-013_p1.mp3`, `page-205/line-018_p2.mp3`
- `ab004bde95e2272ee0a874d528429b313c0fd93da9584e7c598f22cdf402ca05`: `page-054/line-012_p3.mp3`, `page-055/line-002_p3.mp3`
- `abcaa8d17ca93f90fc4f2fb80e3f2b6cbbdfbfca320f629e3e0c96829b6320cd`: `page-012/line-014_p3.mp3`, `page-032/line-019_p3.mp3`, `page-033/line-017_p3.mp3`, `page-038/line-026_p3.mp3`, `page-039/line-027_p3.mp3`, `page-057/line-001_p3.mp3`, `page-057/line-013_p3.mp3`, `page-057/line-020_p3.mp3`, `page-058/line-010_p3.mp3`, `page-061/line-024_p3.mp3`, `page-084/line-024_p3.mp3`, `page-099/line-010_p3.mp3`, `page-100/line-020_p2.mp3`
- `abefe537bba5280c7d921ff6846b30bf44253a364282c6ee4929033a65a5e82a`: `page-025/line-012_p3.mp3`, `page-045/line-005_p1.mp3`, `page-073/line-018_p2.mp3`, `page-081/line-024_p1.mp3`, `page-171/line-007_p3.mp3`, `page-219/line-005_p1.mp3`, `page-230/line-012_p1.mp3`
- `ad0850a1ffc14381c5c30d648d2cbdb29b7f4ecf9e0859948576815715019eb9`: `page-028/line-002_p3.mp3`, `page-039/line-019_p2.mp3`, `page-078/line-017_p3.mp3`, `page-095/line-013_p2.mp3`, `page-146/line-026_p1.mp3`, `page-170/line-002_p3.mp3`, `page-174/line-007_p3.mp3`, `page-177/line-009_p2.mp3`, `page-188/line-011_p2.mp3`, `page-201/line-009_p3.mp3`, `page-229/line-019_p3.mp3`
- `adb14f2e1a56d8d4c111b75c0756a8a8d52d3828136d764ec3828b8fe2056b3d`: `page-142/line-010_p3.mp3`, `page-177/line-009_p1.mp3`
- `ae428f94a4df60f3c0579bdccd43ac323fcaabd870a793eca06c12d506f8bd81`: `page-098/line-003_p2.mp3`, `page-151/line-025_p2.mp3`, `page-182/line-012_p3.mp3`, `page-223/line-016_p1.mp3`
- `ae42f3e26f830df1bb22dc139f94632574ebd6e7d3049ad1f57cba8fd552232c`: `page-223/line-022_p1.mp3`, `page-224/line-010_p2.mp3`
- `ae4719f02f6daaaad62415853a5756f155391bf4efcd818e306bcd6df28df475`: `page-185/line-010_p3.mp3`, `page-205/line-018_p1.mp3`
- `ae6f3b65331bcc92a83b508e2f2fe606cca5e4ef1d4c6beccf1e0f4bb27846a9`: `page-100/line-019_p3.mp3`, `page-149/line-005_p3.mp3`, `page-150/line-017_p3.mp3`, `page-161/line-014_p1.mp3`, `page-195/line-007_p3.mp3`, `page-240/line-025_p3.mp3`
- `b0add13826f7bff37d972edff9ca967522c256f0a92cf9c59646d3b2f049f8c0`: `page-081/line-019_p1.mp3`, `page-100/line-019_p1.mp3`
- `b0fe82ad07b66a35cb2f76732d8fb4914a108ed61dee8f159fcfda48b03886a8`: `page-124/line-013_p1.mp3`, `page-127/line-025_p3.mp3`
- `b1b4eba18a495b98496a41fc88abcd342bb66448f67977ec3a8ba4a2ddf0f9c1`: `page-043/line-009_p3.mp3`, `page-065/line-019_p2.mp3`
- `b1fc07f3d3fc56dd04d9a3490a0fdcdafe9e69de1599e143279d3e800d8f17c9`: `page-169/line-018_p1.mp3`, `page-171/line-010_p1.mp3`
- `b2b64361f255ae1ee70d43423f9f79ddfeedd22ea953590ec33c3d524678f8bd`: `page-163/line-025_p3.mp3`, `page-185/line-002_p2.mp3`
- `b484cd5413c6c0e5c6003171afe0c7dc2c045bedfe698c1e01049844f56a5520`: `page-114/line-006_p1.mp3`, `page-127/line-010_p2.mp3`, `page-207/line-007_p3.mp3`, `page-213/line-027_p2.mp3`
- `b4d07a02cf8772dadbe0c4eb57c3a0284469c8e54ed4def84e731e0d68cb63db`: `page-188/line-013_p1.mp3`, `page-205/line-018_p3.mp3`
- `b6b90287281dca9890d94c84146c90f1da16cb6750991a154c43669ae439ee21`: `page-092/line-013_p1.mp3`, `page-092/line-013_p2.mp3`
- `b6cdcf4cfaa06d35859d6ddbf58cee6bf0cda26a80072c45c86459642e9affba`: `page-111/line-018_p3.mp3`, `page-118/line-019_p1.mp3`, `page-188/line-023_p2.mp3`
- `b6fd9909e8d8d3c609d062ddfea2e63178034975d0f0edf31418a621d134f58a`: `page-065/line-023_p2.mp3`, `page-150/line-013_p2.mp3`
- `b70d255e58e838e8d16493c034c1c8a0af95be254df9f66ded66722d7c00b0b2`: `page-082/line-019_p2.mp3`, `page-223/line-017_p1.mp3`
- `b83bd7239c4d47236748398268a63f838974895665665f93fff305130178e4e1`: `page-162/line-016_p1.mp3`, `page-203/line-011_p1.mp3`
- `b863b360e95ade4302eb19f6eaafef9162a311cedd7a0273077bc7a1feaa356f`: `page-131/line-027_p2.mp3`, `page-149/line-007_p1.mp3`
- `b88d50092b4ac554f62128274227b61ef8b368376b15b9ad332879f31f7a9bbb`: `page-164/line-022_p2.mp3`, `page-165/line-016_p3.mp3`
- `b89ab180f14b449ccb3f9f811ead27be673df5d1a18448a90b9f7349130596c5`: `page-188/line-012_p3.mp3`, `page-210/line-027_p1.mp3`
- `ba567e9d39b4baa7422cd160cfbe79d18afd0b2b5a226e16faa10d3579f09a45`: `page-147/line-001_p3.mp3`, `page-151/line-013_p1.mp3`, `page-179/line-018_p1.mp3`
- `ba98b186310bda095d097345a359f16f3a2ec5cd3ac08cb2153010cb2cb87fdf`: `page-020/line-020_p1.mp3`, `page-039/line-023_p2.mp3`
- `bb3bb026527e8951ede836743d6c8c1bf23a74c42d7924fd246f3861d2ee6fb3`: `page-094/line-017_p2.mp3`, `page-098/line-025_p1.mp3`
- `bb4008d72f3121d7af8a15aa2d5b536fc80f365ff1653ccd2d64eefb11ee2e62`: `page-023/line-002_p2.mp3`, `page-032/line-024_p3.mp3`, `page-052/line-009_p2.mp3`, `page-053/line-005_p2.mp3`
- `bbe1c7c395f3e09463636edbd395f210ba6abb24dac3ebfa75fc42d759128308`: `page-126/line-023_p3.mp3`, `page-150/line-014_p2.mp3`
- `bbfdd4fecd4e269ad0fab77f39fd4413df66b6a0830cd3cf1e76b62e0312ba4f`: `page-213/line-021_p3.mp3`, `page-224/line-011_p3.mp3`
- `bd947e3fbddb9fda10ae547d985c219121bacbb97f19b12006ffd8e0e1b41196`: `page-031/line-012_p3.mp3`, `page-070/line-014_p3.mp3`, `page-195/line-013_p3.mp3`
- `bed1a4dfedd4a5298e9f024ed3680e301e034f38e4b0613c3bc9c01679aa91f7`: `page-027/line-020_p1.mp3`, `page-080/line-007_p1.mp3`
- `bf00734e941f642cb80fc71c6366ed73d1636aba99dceedc3f354f70e49ace31`: `page-095/line-010_p1.mp3`, `page-218/line-003_p1.mp3`
- `bf30a3b129817c19a3b5bc6d5a392fd538701ae7cbeb928b00e694dc5eeeead4`: `page-130/line-003_p1.mp3`, `page-155/line-010_p1.mp3`
- `bf367f085935dc0aa16526dae4dde53f808ccc5d19b58ed3de36747e8be4d14d`: `page-118/line-009_p3.mp3`, `page-162/line-022_p3.mp3`
- `bf3b411d2ebc7c4fa8a1996db9eba365fedd8c09baaf1cde7cb2ae4e672a3ed6`: `page-037/line-003_p3.mp3`, `page-040/line-021_p2.mp3`, `page-111/line-006_p3.mp3`, `page-112/line-019_p2.mp3`
- `bf916249230ece9d8ecf537f44aeca28c7758f9f5400fef06bc9499d1dbb7c34`: `page-163/line-009_p3.mp3`, `page-177/line-011_p2.mp3`
- `c176bcb70e924f74f2630449b14edc8ce022a71a8bd7b3265f662c78659b9755`: `page-141/line-007_p1.mp3`, `page-145/line-023_p2.mp3`
- `c272e6c09520af79f04260e467280b17ee3e2869aaa1917a2db66bc99951f241`: `page-199/line-010_p2.mp3`, `page-203/line-013_p1.mp3`
- `c321727b53d476edc7fcd1bc4fce325031d6f2b759650b8ebf3d0ad0f4ac05a9`: `page-165/line-009_p3.mp3`, `page-165/line-010_p1.mp3`
- `c3dd15f1d941bf6377e48d234915ce27ce5279dd200ea49c875e90a8bb38a0c0`: `page-112/line-016_p1.mp3`, `page-145/line-003_p1.mp3`, `page-204/line-015_p1.mp3`
- `c4b4377e7f6c96b53ce5c41ef6a9512411edcb77a75c76c348013f3a3bf34ece`: `page-044/line-009_p1.mp3`, `page-149/line-004_p3.mp3`, `page-186/line-009_p2.mp3`, `page-216/line-003_p3.mp3`
- `c4b8aa9f57ce04d123b4a1b54aeba2868f66b2092a606ec72ac0a17a188455bf`: `page-143/line-007_p2.mp3`, `page-198/line-001_p2.mp3`
- `c54fba7959481747b1934344a1c1033461a71d154187d1aa66a54258cf48c021`: `page-019/line-004_p3.mp3`, `page-019/line-025_p3.mp3`, `page-024/line-019_p2.mp3`, `page-031/line-004_p3.mp3`
- `c75ea6d4cf549cd78b08b20f62a6db080124372143ab12961a65cd7f6938c712`: `page-015/line-026_p3.mp3`, `page-052/line-003_p3.mp3`, `page-053/line-015_p3.mp3`, `page-076/line-016_p3.mp3`, `page-076/line-020_p1.mp3`, `page-079/line-015_p3.mp3`, `page-095/line-009_p3.mp3`, `page-156/line-007_p3.mp3`, `page-158/line-020_p3.mp3`, `page-159/line-008_p3.mp3`, `page-182/line-021_p3.mp3`, `page-230/line-014_p1.mp3`
- `c7a4175fa993758df58520f699a3e6bba617185580e617ebe5021906fa99ad2d`: `page-159/line-004_p1.mp3`, `page-163/line-026_p1.mp3`, `page-201/line-002_p1.mp3`
- `c7dbdc1b2629de3e9e06be0044eefa40740fca2416617a1ca5948ff9f15a5922`: `page-095/line-017_p3.mp3`, `page-125/line-012_p3.mp3`
- `c81a615fef8871c1149ab303aa88722d8dddd8a134f33951701fbfcbab236056`: `page-162/line-025_p3.mp3`, `page-238/line-011_p3.mp3`
- `c8305f7d0553c0acf8c43cfd2faf9032f032141499c049a13a79f4496d96a11b`: `page-096/line-025_p2.mp3`, `page-204/line-002_p2.mp3`
- `c8c1d7ade7cf1e1c1a5def9d3f0e5c37ad57b2fa1cea1a49d0cf83f980da7b50`: `page-063/line-017_p1.mp3`, `page-121/line-011_p1.mp3`
- `c90ac67b29ac0fe9246facced067b2160727544b42dfc4712ac861efe29aa2f5`: `page-095/line-012_p2.mp3`, `page-156/line-018_p3.mp3`
- `c9612e6cb7cf599a38986a28b242e7c4703d3ec6a8536baa411d7be95efc0f0b`: `page-048/line-002_p1.mp3`, `page-054/line-015_p1.mp3`
- `c977dec1746a3ed6fde07a0d4c25b1404b69a838b22f9b10d7e56cf039e0edb2`: `page-169/line-016_p3.mp3`, `page-239/line-020_p2.mp3`
- `c99751b639cf476bdf6bb650a960a25356ac67ff255de63806f752cdb1c5f7df`: `page-177/line-022_p3.mp3`, `page-178/line-017_p1.mp3`, `page-189/line-016_p3.mp3`, `page-194/line-011_p3.mp3`
- `cb3ab34fc82e8527bebff7f37bb912d50e78ad5ce0fb2fe70ef9322ce5bcbd58`: `page-029/line-006_p3.mp3`, `page-044/line-009_p2.mp3`
- `cc0843ee7dbc2e1adc4991ef4cf4625528fe4a331e976d551351b1545d243a0f`: `page-084/line-002_p2.mp3`, `page-084/line-019_p3.mp3`, `page-198/line-020_p2.mp3`
- `cc58fc199837c4328a574b7313a2a28dff24ad391ca4cd1fa924ee3bdaf13f44`: `page-172/line-001_p3.mp3`, `page-182/line-017_p3.mp3`
- `cd246c03bd8cb1ac404e90a49ab416bd7429e9fb30cebf09a70a8897cce75320`: `page-162/line-004_p2.mp3`, `page-196/line-018_p1.mp3`
- `cda5d846f7f124a71e1e8aeeb04ca81d7d2750b2e406282f402d2014cef8a468`: `page-021/line-005_p3.mp3`, `page-051/line-001_p3.mp3`, `page-064/line-004_p2.mp3`
- `cdc5f870e47a719c01b3de8e03be5cc0f6d2835c8b92e5210537011e129b1e4d`: `page-155/line-016_p3.mp3`, `page-155/line-017_p1.mp3`
- `ce9e0a0b04cd525fca28e1c8176497e8bf1acbb42846219cc4e788f07aee446e`: `page-072/line-022_p3.mp3`, `page-157/line-006_p3.mp3`, `page-231/line-012_p3.mp3`
- `cedda6418dd340a92bd5ef893201ea47cbcf9115b5ab00f6d1d301ca24dccdd5`: `page-150/line-007_p3.mp3`, `page-200/line-009_p2.mp3`
- `cf13007a55315707c2f03ac00650a896cda70e136318eab3f619a0da75563d0d`: `page-147/line-025_p3.mp3`, `page-150/line-012_p1.mp3`, `page-153/line-001_p3.mp3`
- `d0cd2451fa16216902873b9d33ef7245f59e62152c06739922989dab196eb9ed`: `page-172/line-008_p2.mp3`, `page-187/line-006_p2.mp3`
- `d159458867a24d02092df666c7e04659be958c73c8a81c6ef4ffb9b61d026a5f`: `page-015/line-013_p1.mp3`, `page-088/line-024_p2.mp3`
- `d209992b17a19c7fcc03153db099304aa4f8d162e6d3d7e25fe0590a0e76b65a`: `page-123/line-006_p1.mp3`, `page-206/line-011_p3.mp3`
- `d26fd44ca8900eb76d115bbd660b9118cc478bc8d3ec798234eca0e3acb36335`: `page-105/line-014_p3.mp3`, `page-177/line-020_p2.mp3`, `page-214/line-027_p2.mp3`
- `d2e0d42e4cf56945bad9738abdbc8894270dc26faa94f334eb85b6776db3e061`: `page-150/line-017_p1.mp3`, `page-184/line-023_p3.mp3`, `page-191/line-007_p3.mp3`
- `d31d9719d9703eb07d69c77e0a42eb77ffdba168f902a3b3cfdccc565a5bf56f`: `page-038/line-006_p1.mp3`, `page-041/line-011_p1.mp3`, `page-054/line-018_p1.mp3`
- `d380d1b122d92958986ca1bc409039a6da80a390c887aa7945f2a28255b314c1`: `page-136/line-024_p3.mp3`, `page-151/line-001_p3.mp3`
- `d3f137e2942a1328d4bcdb8391a49baeb56b90f9126042d6f4c4a2068b31d173`: `page-133/line-024_p2.mp3`, `page-192/line-008_p1.mp3`
- `d40697d9e7ddf4de7f6b4afc73a3538328c386926a7a4a77e6f8800a57efda37`: `page-012/line-001_p3.mp3`, `page-040/line-005_p3.mp3`, `page-099/line-025_p2.mp3`, `page-230/line-007_p3.mp3`
- `d48b88812c263bbb680c10f793649ad93f746fd94b3d2f85775c362b0a1a1cb2`: `page-022/line-016_p1.mp3`, `page-040/line-027_p1.mp3`
- `d5e60944f28b62ace517ac7f84c08847575d5156d0e71bd77b65b2d26241e186`: `page-195/line-021_p2.mp3`, `page-201/line-001_p1.mp3`
- `d62de8cd59e445f418e408fe74e68f4eabc3544a3e6be719e78ddaaa4a6f5faf`: `page-128/line-026_p1.mp3`, `page-129/line-019_p3.mp3`
- `d633593a221cee496c257e82ff4a8011de8c1c2dc45cfb1cc32486c6800e94cf`: `page-124/line-020_p2.mp3`, `page-178/line-006_p3.mp3`
- `d681026eb68b4772c0d9b2879609b393e6a7e8621f68d152e3cd5680dbd2f2e9`: `page-015/line-022_p3.mp3`, `page-057/line-004_p3.mp3`
- `d6881dfbb5324fb0e71f7f5067f17bf44d928cb259226d4c17718b20edb1624c`: `page-085/line-019_p2.mp3`, `page-142/line-024_p1.mp3`
- `d68f20f1123a7526508e31b02b5a8950e77bbf7058d895fa831084efe72722a3`: `page-099/line-023_p3.mp3`, `page-103/line-008_p3.mp3`
- `d760bcd0409af7e59071eb18f1f44faf8680b57dee76fc7fb022eea600637805`: `page-166/line-014_p3.mp3`, `page-175/line-001_p1.mp3`
- `d96bff1193844896404551c6cbdb4c4328bc0bfb7376321b4049869aa1123428`: `page-136/line-022_p3.mp3`, `page-146/line-021_p3.mp3`, `page-210/line-012_p3.mp3`
- `da2fe506378533350763f10a8f7908f3478fe5d312b2687607573d3abd0e51d9`: `page-147/line-017_p3.mp3`, `page-229/line-010_p3.mp3`
- `da4d41dd6633bcf7cca0e462f010351253a34082c192cc80977f0cf81be9afd1`: `page-069/line-010_p1.mp3`, `page-080/line-027_p3.mp3`
- `db8b4807a51943f88e6db5a7969e00822d4fec34f5e468b3e8895359ce72ee6e`: `page-048/line-020_p1.mp3`, `page-061/line-001_p1.mp3`
- `dd22c032510e5e66a03a3de5db5a2b2abd3589d80ecf823875f04d22b5740634`: `page-135/line-024_p3.mp3`, `page-140/line-018_p2.mp3`, `page-158/line-006_p3.mp3`, `page-162/line-019_p2.mp3`, `page-174/line-010_p3.mp3`, `page-206/line-004_p3.mp3`
- `dd6c8e6c7e052ef87aabdafa76475350e1740dd6ad620799d68474fb5eb482f7`: `page-067/line-001_p3.mp3`, `page-174/line-016_p3.mp3`
- `dddd261f624e954c4b73bce8c97e71efa416c22d4a70d19639acb79403ab0a6b`: `page-148/line-006_p1.mp3`, `page-170/line-024_p1.mp3`
- `ddec4ff875f946a0f39c28743b3904255fe74eb17c8509bbeed4e030577b297e`: `page-160/line-016_p3.mp3`, `page-160/line-017_p1.mp3`
- `ddf49a32b3ea9613bb28a5856642e46910e0a97e5a0c61510ec25b58ba561ec9`: `page-071/line-008_p3.mp3`, `page-132/line-017_p3.mp3`
- `de330f4e446fd4aee68a355429d552bb570242f8610ff61199ac8cd9827bdaad`: `page-123/line-005_p1.mp3`, `page-238/line-002_p3.mp3`
- `df0a211de64d4d2f94b129dc7e0446f862228012f0fd064d3e8741f2ebbd35ba`: `page-043/line-012_p3.mp3`, `page-046/line-018_p2.mp3`, `page-058/line-016_p1.mp3`
- `df49885aa1defb34211f6cb14cdfaefe44b6fe3c394e32999ba724f3db958d23`: `page-035/line-004_p1.mp3`, `page-198/line-026_p1.mp3`
- `dff9aa69e5e67b064735008ac317a0302df7ff11e88ebf6a8da45b20078be9b6`: `page-204/line-026_p1.mp3`, `page-224/line-022_p2.mp3`
- `e11604d34c550de0dfeed3ab45148074964cf40f13cbba405df033b98f3a8561`: `page-128/line-010_p2.mp3`, `page-144/line-008_p3.mp3`, `page-152/line-024_p3.mp3`, `page-190/line-003_p2.mp3`, `page-196/line-022_p2.mp3`, `page-197/line-027_p2.mp3`
- `e1500fe4159f0bdb072c5a0ea68fae83675fba1328ef9cda92f4b58ab97c2cd3`: `page-230/line-005_p1.mp3`, `page-231/line-019_p1.mp3`
- `e1af070b64a99632cdc4c7b09ec0674d82180a498672ad2738fcb3daa61a3b71`: `page-017/line-020_p1.mp3`, `page-029/line-011_p2.mp3`
- `e1f2dcfc33468a49c4a12d6c61f0c9dd47e35104c581dd48abef8231df335107`: `page-198/line-016_p1.mp3`, `page-202/line-002_p3.mp3`
- `e247bbaa8b07bef80ffea42ca7d7c442e020469eea2bee2c6f3af5d51934cd75`: `page-059/line-013_p1.mp3`, `page-081/line-023_p3.mp3`
- `e249babb97ee5843e92c7497690225ad12ee69108446343b8e8dc74488e5dd30`: `page-077/line-008_p2.mp3`, `page-080/line-005_p1.mp3`
- `e28789b45b05b7f277389619fdc84339bff050c310b908e65fd03877eb3b8757`: `page-075/line-017_p2.mp3`, `page-121/line-013_p2.mp3`
- `e2ca451e15697b5348a2f5ed9841dd8160313ab6a6e418fd794c9cbb04777a24`: `page-028/line-004_p2.mp3`, `page-044/line-019_p3.mp3`
- `e424b5d7ac01f12d26854f46a1eee0ecb1923c622b5d9347243a8c586825527b`: `page-061/line-009_p2.mp3`, `page-086/line-023_p1.mp3`
- `e607e365f66956db5e0d9ceaa9491500488d688a1b66826ef07de5cfa07a780f`: `page-017/line-010_p3.mp3`, `page-100/line-004_p3.mp3`
- `e67ca31d23a39ae8f1e3c825a4b439c78ade37e2d3f4abfd81a5883216b2cac6`: `page-141/line-002_p3.mp3`, `page-152/line-019_p1.mp3`
- `e692d87ad676f48914003d471d94164115b55fdd733f636b21fd813c55baefd1`: `page-119/line-010_p2.mp3`, `page-170/line-011_p1.mp3`
- `e82bd116c3635bef670f30adbfd75c528f5e43841812162661e865611d5c4bf4`: `page-103/line-012_p1.mp3`, `page-182/line-013_p2.mp3`
- `e90a40ea920a030416b0878e802f1a0f04bd5b2c1ce3ea15e3a002c53795ab2e`: `page-028/line-004_p1.mp3`, `page-100/line-020_p3.mp3`, `page-129/line-023_p1.mp3`
- `e96f889730ba22aa20b32237518f8e1b88b89085ad22a4c48afb34de629e4c45`: `page-149/line-003_p3.mp3`, `page-207/line-011_p1.mp3`
- `ea341f49def469c924e1406e3060fb8e9a993037436a166d773e74e015010472`: `page-128/line-019_p3.mp3`, `page-197/line-011_p3.mp3`
- `ea5db483d490c0632a04d769ab3a18bb4765548ca76a9e085cfe58f08ad1bd58`: `page-098/line-020_p3.mp3`, `page-229/line-003_p1.mp3`
- `ea6fc21574cd575c0c980bff93457eff2b987a5310fbb1adec1571ab01fdee99`: `page-214/line-010_p2.mp3`, `page-214/line-011_p2.mp3`
- `eb2d317a643078c2e31cecd33d4c8a77f7bcf4ddd7beba984417bf244ca120f6`: `page-038/line-025_p1.mp3`, `page-111/line-020_p2.mp3`
- `ec60324790f44142378be00c55a4e1ed4bfd6235447e9178a01940e969f67e2c`: `page-146/line-005_p3.mp3`, `page-199/line-023_p2.mp3`
- `ec6cf080ba6cfb6af8804bf02f3d47c0839fdf0f51515837980aae3bf2654b3e`: `page-057/line-010_p3.mp3`, `page-067/line-009_p2.mp3`
- `ec7c491374e501910a37025bacd7b32117046dbfcfada610457f056d774a4eb1`: `page-110/line-010_p3.mp3`, `page-182/line-020_p1.mp3`
- `ed6f377a25a725a7baff5421bbb60243c4d819a12e6a600ffbfe5be4302d27d0`: `page-037/line-010_p3.mp3`, `page-078/line-018_p1.mp3`
- `ed9cfe109cb3a36972e2eca680f19bb3082b6bb7495fd1ba70c8e7fdc3dc5538`: `page-046/line-011_p3.mp3`, `page-047/line-011_p1.mp3`
- `edad625eabc06a5975986fcfb91c6c6676c9ca3dcf95f625d9f6e8011246b844`: `page-132/line-008_p1.mp3`, `page-237/line-008_p3.mp3`
- `ede34a70327dca70af181cb86c0abba16c6825f60f02103a88519184b967561d`: `page-140/line-003_p3.mp3`, `page-207/line-007_p2.mp3`
- `edf65f87be65495ede3ee30eb7838d61d82146b0fa31a40bfbdce49f53501c3e`: `page-126/line-005_p1.mp3`, `page-196/line-006_p2.mp3`
- `f138ee37afd3242c1a0202d48e13ad6e38ff4f6b56c8f17df9d6bddf92b451a6`: `page-126/line-022_p3.mp3`, `page-213/line-012_p2.mp3`
- `f1e6a695f99ccf635e15307a1848071a223422be5e15ac4d64c6a014d728a640`: `page-137/line-014_p1.mp3`, `page-160/line-011_p1.mp3`
- `f2ce58844007f232ca1e7c6db5ef9b4c94d069c8cd870463fd11fc9f8d0d4a17`: `page-148/line-011_p1.mp3`, `page-149/line-017_p3.mp3`
- `f43e38d90f84a3bb16abd38cf56de777948f0183564050515ce8676e10d3d038`: `page-039/line-003_p3.mp3`, `page-060/line-022_p3.mp3`
- `f862e9fbaba67c9a2af22a5c7e40cf85c5576175d984f84c2b7c05bbad3eca86`: `page-081/line-017_p1.mp3`, `page-127/line-027_p2.mp3`
- `fa07565ea130a8a0d8fc69471aa02954e5e5a4aae490c9100144c3738ef2e15b`: `page-129/line-026_p1.mp3`, `page-134/line-013_p3.mp3`, `page-156/line-010_p1.mp3`
- `fa1c38622f85155debdd714669ac783be045c02e02b935dcdb08b4a1819e17c3`: `page-140/line-010_p3.mp3`, `page-170/line-004_p3.mp3`, `page-187/line-018_p3.mp3`, `page-207/line-003_p3.mp3`
- `ff0c8dc0493b653d1c40c190fd7ef866827cef229206e93be9becf938a2ad812`: `page-182/line-008_p2.mp3`, `page-206/line-021_p3.mp3`
- `ffa822a367fa21d301c93bc5f874b3b42b7f350c84f4b99cf9426c23c5ee5704`: `page-094/line-018_p2.mp3`, `page-127/line-027_p1.mp3`, `page-193/line-026_p3.mp3`

## Comparación exhaustiva con libros 01 y 02

| Libro | MP3 | Páginas físicas | Lectura por partCount | Imágenes MP3 | Especiales | Inesperados/vacíos |
|---|---:|---|---|---:|---|---|
| el-caballo-y-el-muchacho | 16403 | 11–241 (225) | {1: 122, 2: 98, 3: 5334} | 81 | _meta/author.mp3, _meta/title.mp3 | 0/0 |
| narnia-el-sobrino-del-mago | 16131 | 9–252 (235) | {1: 131, 2: 97, 3: 5224} | 129 | _meta/author.mp3, _meta/title.mp3 | 5/0 |
| narnia-el-leon-la-bruja-y-el-armario | 14898 | 9–234 (216) | {1: 116, 2: 97, 3: 4817} | 135 | _meta/author.mp3, _meta/title.mp3 | 0/0 |

Contratos verificados de cada referencia:

- **narnia-el-sobrino-del-mago**: book.json declara páginas {'start': 1, 'end': 252}; 252 JSON de páginas. Claves reales: [('bookId', 'images', 'lineCount', 'page', 'sayLines'), ('bookId', 'lineCount', 'page', 'sayLines')]. Audio del manifest: `{"profile": "bti-audio-v1", "meta": {"title": "audios/_meta/title.mp3", "author": "audios/_meta/author.mp3"}, "reading": {"defaultPartCount": 3, "takes": ["p1", "p2", "p3"], "pathPattern": "audios/page-{page3}/line-{line3}_{take}.mp3"}, "images": {"takes": ["p1", "p2", "p3"], "pathPattern": "audios/page-{page3}/images/{imageId}_{take}.mp3"}}`.
  Diferencias lineCount/partCount entre JSON y árbol físico: ninguna.
  Rutas fuera de patrones de referencia: `page-009/line-001.contract.json`, `page-009/line-001_e01.mp3`, `page-009/line-001_e02.mp3`, `page-009/line-001_e03.mp3`, `README-audio-minimo-md`.
- **narnia-el-leon-la-bruja-y-el-armario**: book.json declara páginas {'start': 9, 'end': 234}; 216 JSON de páginas. Claves reales: [('bookId', 'images', 'lineCount', 'page', 'sayLines')]. Audio del manifest: `{"profile": "bti-audio-v1", "meta": {"title": "audios/_meta/title.mp3", "author": "audios/_meta/author.mp3"}, "reading": {"defaultPartCount": 3, "takes": ["p1", "p2", "p3"], "pathPattern": "audios/page-{page3}/line-{line3}_{take}.mp3"}, "images": {"takes": ["p1", "p2", "p3"], "pathPattern": "audios/page-{page3}/images/{imageId}_{take}.mp3"}}`.
  Diferencias lineCount/partCount entre JSON y árbol físico: ninguna.

El libro 03 respeta los patrones físicos de lectura, imágenes y metadatos de las referencias cuando el inventario de anomalías anterior está vacío. Las cantidades, páginas y variantes se obtuvieron de su propio árbol; no se copiaron rangos ni asociaciones de los libros anteriores. El runtime de referencia (`js/rutinas/bookTestImposibleV2RuntimeManifest.js`) admite overrides de lectura 1/2 con default 3: un sufijo superior a p3 o secuencia incompleta necesita resolución contractual antes de integrar. Los JSON legacy observados contienen bookId, page, lineCount y sayLines; images está presente en el libro 02 y en parte de los JSON del libro 01. Las entradas de imagen legacy incluyen imageId y description. El manifest runtime contiene sólo page e imageId para imágenes y no necesita texto literario.

## Precisiones contractuales y validación local

Se leyó también `docs/BTI_RUNTIME_BOOK_CONTRACT_V1.md`: p1/p2/p3 son partes secuenciales, no alternativas; cada target se reproduce dos veces. La regla legacy de build es `Math.min(3, line.trim().split(/\s+/).filter(Boolean).length)`. Sin sayLines no puede verificarse la correspondencia semántica ni esa regla de palabras, aunque sí inventariarse las partes físicas. El runtime resuelve conteos desde el manifest sin leer sayLines. Las imágenes requieren las tres partes en el perfil actual; las 27 asociaciones del libro 03 tienen exactamente p1, p2 y p3, sin huecos.

El libro 03 no contiene los artefactos de prueba `_e01/_e02/_e03`, el contrato lateral `line-001.contract.json` ni `README-audio-minimo-md` que existen en el libro 01. Esos archivos de referencia no amplían el patrón runtime estándar.

Publicación bloqueada: tanto git add como git commit no pueden crear `.git/index.lock` (Permission denied). No existe un commit de auditoría y no se afirma entrega remota.

## Fuentes faltantes y conclusión

- Automatizable: inventario, rutas, rango físico, números de renglón, conteos y overrides de partes contiguas, identificadores y asociaciones físicas página/imagen. Esto no autoriza crear todavía archivos de implementación.
- Requiere fuente adicional: texto exacto y segmentado de cada renglón para sayLines, descripciones verificadas de imágenes, límites editoriales y páginas sin audio fuera del rango físico, metadatos bibliográficos aprobados si se necesitan. No se infiere ISBN. No se reconstruye texto escuchando los MP3.
- Los duplicados binarios, si existen en el inventario, requieren confirmar si son reutilizaciones intencionales o errores antes de materializar el contrato. No se borró ni renombró ningún audio. Los huecos, variantes incompletas, archivos vacíos y patrones inesperados quedan detallados arriba; si sus listas están vacías no se detectó esa anomalía física.
- La verificación de identidad/publicación remota quedó pendiente por los errores de infraestructura descritos en el precheck. Fase 1 se detiene con la auditoría; no modifica índices, manifests, páginas, runtime, tests, BLE, offline ni libros 01/02, y no crea PR.
