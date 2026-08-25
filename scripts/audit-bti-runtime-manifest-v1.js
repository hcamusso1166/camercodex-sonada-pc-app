const fs = require("node:fs");
const path = require("node:path");

const bookRoot = path.join(__dirname, "..", "books", "narnia-el-sobrino-del-mago");
const pageDir = path.join(bookRoot, "pages");
const manifest = JSON.parse(fs.readFileSync(path.join(bookRoot, "runtime-manifest.json"), "utf8"));
const files = fs.readdirSync(pageDir).filter(name => /^page-\d{3}\.json$/.test(name)).sort();
const errors = [];
const legacyImages = [];
const seenPages = new Set();
for (const file of files) {
  const legacy = JSON.parse(fs.readFileSync(path.join(pageDir, file), "utf8"));
  const expectedPage = Number(file.slice(5, 8));
  if (legacy.page !== expectedPage) errors.push(`${file}: page=${legacy.page}, esperado=${expectedPage}`);
  if (seenPages.has(legacy.page)) errors.push(`Página duplicada: ${legacy.page}`);
  seenPages.add(legacy.page);
  if (!Number.isInteger(legacy.lineCount) || legacy.lineCount < 0) errors.push(`${file}: lineCount inválido`);
  if (!Array.isArray(legacy.sayLines) || legacy.sayLines.length !== legacy.lineCount) errors.push(`${file}: lineCount != sayLines.length`);
  if (manifest.pages[String(legacy.page).padStart(3, "0")]?.lineCount !== legacy.lineCount) errors.push(`${file}: lineCount no coincide con manifest`);
  for (const image of legacy.images || []) legacyImages.push(`${legacy.page}:${image.imageId}`);
}
const manifestImages = manifest.images.map(image => `${image.page}:${image.imageId}`);
const missingImages = legacyImages.filter(key => !manifestImages.includes(key));
const extraImages = manifestImages.filter(key => !legacyImages.includes(key));
for (let page = 1; page <= 252; page += 1) if (!seenPages.has(page)) errors.push(`Página faltante: ${page}`);
if (Object.keys(manifest.pages).length !== files.length) errors.push("Cantidad de páginas del manifest incorrecta");
if (new Set(manifestImages).size !== manifestImages.length) errors.push("Imágenes duplicadas en manifest");
errors.push(...missingImages.map(key => `Imagen faltante: ${key}`), ...extraImages.map(key => `Imagen extra: ${key}`));
console.log(JSON.stringify({ totalLegacyPages: files.length, totalManifestPages: Object.keys(manifest.pages).length, totalLegacyImages: legacyImages.length, totalManifestImages: manifestImages.length, missingPages: errors.filter(x => x.startsWith("Página faltante")), lineCountInconsistencies: errors.filter(x => x.includes("lineCount")), missingImages, extraImages, errors }, null, 2));
if (errors.length) process.exitCode = 1;
