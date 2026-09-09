#!/usr/bin/env node
const fs = require("node:fs");
const path = require("node:path");

const bookId = process.argv[2] || "narnia-el-sobrino-del-mago";
if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(bookId)) {
  console.error("Uso: node scripts/audit-bti-runtime-manifest-v1.js [bookId]");
  process.exit(1);
}

const bookRoot = path.join(__dirname, "..", "books", bookId);
const pageDir = path.join(bookRoot, "pages");
const audioDir = path.join(bookRoot, "audios");
const readJson = file => JSON.parse(fs.readFileSync(file, "utf8"));
const book = readJson(path.join(bookRoot, "book.json"));
const manifest = readJson(path.join(bookRoot, "runtime-manifest.json"));
const runtime = require("../js/rutinas/bookTestImposibleV2RuntimeManifest.js");
const pageFiles = fs.readdirSync(pageDir).filter(name => /^page-\d{3}\.json$/.test(name)).sort();
const errors = [];
const pageKeys = new Set();
const pageImages = [];
const expectedMp3 = new Set([manifest.audio?.meta?.title, manifest.audio?.meta?.author].filter(Boolean));
const pad3 = value => String(value).padStart(3, "0");

if (book.bookId !== bookId) errors.push(`book.json: bookId=${book.bookId}, esperado=${bookId}`);
if (manifest.bookId !== bookId) errors.push(`runtime-manifest.json: bookId=${manifest.bookId}, esperado=${bookId}`);
if (manifest.schemaVersion !== 1) errors.push("runtime-manifest.json: schemaVersion debe ser 1");
try {
  runtime.validateRuntimeManifest(manifest, bookId);
} catch (error) {
  errors.push(error.message);
}

for (const file of pageFiles) {
  const pageData = readJson(path.join(pageDir, file));
  const expectedPage = Number(file.slice(5, 8));
  const pageKey = pad3(pageData.page);
  if (pageData.page !== expectedPage) errors.push(`${file}: page=${pageData.page}, esperado=${expectedPage}`);
  if (pageData.bookId !== bookId) errors.push(`${file}: bookId=${pageData.bookId}, esperado=${bookId}`);
  if (pageKeys.has(pageKey)) errors.push(`Página duplicada: ${pageData.page}`);
  pageKeys.add(pageKey);
  if (!Number.isInteger(pageData.lineCount) || pageData.lineCount < 0) errors.push(`${file}: lineCount inválido`);
  if (!Array.isArray(pageData.sayLines) || pageData.sayLines.length !== pageData.lineCount) errors.push(`${file}: lineCount != sayLines.length`);

  const pageManifest = manifest.pages?.[pageKey];
  if (!pageManifest) errors.push(`${file}: página ausente del manifest`);
  else if (pageManifest.lineCount !== pageData.lineCount) errors.push(`${file}: lineCount no coincide con manifest`);

  for (let line = 1; line <= pageData.lineCount; line += 1) {
    const lineKey = pad3(line);
    const partCount = pageManifest?.partCountOverrides?.[lineKey] ?? manifest.audio?.reading?.defaultPartCount;
    if (![1, 2, 3].includes(partCount)) errors.push(`${file}: partCount inválido para ${lineKey}`);
    for (let part = 1; part <= partCount; part += 1) {
      expectedMp3.add(`audios/page-${pageKey}/line-${lineKey}_p${part}.mp3`);
    }
  }
  for (const [lineKey, partCount] of Object.entries(pageManifest?.partCountOverrides || {})) {
    const line = Number(lineKey);
    if (!/^\d{3}$/.test(lineKey) || !Number.isInteger(line) || line < 1 || line > pageData.lineCount) errors.push(`${file}: override de renglón inválido ${lineKey}`);
    if (partCount !== 1 && partCount !== 2) errors.push(`${file}: override inválido ${lineKey}=${partCount}`);
  }

  const seenImageIds = new Set();
  if (pageData.images !== undefined && !Array.isArray(pageData.images)) errors.push(`${file}: images debe ser un array`);
  for (const image of pageData.images || []) {
    if (typeof image?.imageId !== "string" || !image.imageId) errors.push(`${file}: imageId inválido`);
    if (seenImageIds.has(image.imageId)) errors.push(`${file}: imageId duplicado ${image.imageId}`);
    seenImageIds.add(image.imageId);
    pageImages.push(`${pageData.page}:${image.imageId}`);
  }
}

for (const pageKey of Object.keys(manifest.pages || {})) {
  if (!pageKeys.has(pageKey)) errors.push(`Página extra en manifest: ${pageKey}`);
}
if (Object.keys(manifest.pages || {}).length !== pageFiles.length) errors.push("Cantidad de páginas del manifest incorrecta");

const manifestImages = (manifest.images || []).map(image => `${image.page}:${image.imageId}`);
if (new Set(manifestImages).size !== manifestImages.length) errors.push("Imágenes duplicadas en manifest");
for (const key of pageImages) if (!manifestImages.includes(key)) errors.push(`Imagen faltante: ${key}`);
for (const key of manifestImages) if (!pageImages.includes(key)) errors.push(`Imagen extra: ${key}`);
for (const image of manifest.images || []) {
  for (const take of manifest.audio?.images?.takes || []) {
    expectedMp3.add(`audios/page-${pad3(image.page)}/images/${image.imageId}_${take}.mp3`);
  }
}

const physicalMp3 = new Set();
const walk = directory => {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const absolute = path.join(directory, entry.name);
    if (entry.isDirectory()) walk(absolute);
    else if (entry.name.endsWith(".mp3")) physicalMp3.add(path.relative(bookRoot, absolute).replaceAll(path.sep, "/"));
  }
};
walk(audioDir);
for (const relative of physicalMp3) {
  const reading = relative.match(/^audios\/page-(\d{3})\/line-(\d{3})_p(\d+)\.mp3$/);
  const image = relative.match(/^audios\/page-(\d{3})\/images\/(image-\d{3})_p(\d+)\.mp3$/);
  const legacyEncore = /^audios\/page-\d{3}\/line-\d{3}_e0[1-3]\.mp3$/.test(relative);
  if ((reading || image) && ![1, 2, 3].includes(Number((reading || image)[3]))) errors.push(`Take inválido: ${relative}`);
  if (!expectedMp3.has(relative) && !legacyEncore) errors.push(`MP3 inesperado: ${relative}`);
}
for (const relative of expectedMp3) if (!physicalMp3.has(relative)) errors.push(`MP3 faltante: ${relative}`);

const result = {
  bookId,
  totalPageJson: pageFiles.length,
  totalManifestPages: Object.keys(manifest.pages || {}).length,
  totalLines: pageFiles.reduce((total, file) => total + readJson(path.join(pageDir, file)).lineCount, 0),
  totalPageImages: pageImages.length,
  totalManifestImages: manifestImages.length,
  expectedMp3: expectedMp3.size,
  physicalMp3: physicalMp3.size,
  errors,
};
console.log(JSON.stringify(result, null, 2));
if (errors.length) process.exitCode = 1;
