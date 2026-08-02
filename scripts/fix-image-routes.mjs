/**
 * Give Next's generated image routes a real file extension.
 *
 * Under `output: "export"`, `opengraph-image.tsx` and `apple-icon.tsx` emit
 * extensionless files — `out/work/<slug>/opengraph-image`. A Node server would
 * set the content type from the route, but a static host cannot: GitHub Pages
 * serves by extension, so those files go out as `application/octet-stream` and
 * every social scraper refuses to render them. The images are valid PNGs; only
 * the delivery is wrong.
 *
 * This copies each one to `<name>.png` and rewrites the references in the
 * exported HTML, so the markup points at something that will be served as an
 * image. The original extensionless file is left in place, which keeps any
 * absolute URL that was already shared working.
 */
import { readdir, readFile, writeFile, copyFile, stat } from "node:fs/promises";
import { join, extname } from "node:path";

const OUT = "out";
const PNG_SIGNATURE = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

async function walk(dir) {
  const found = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) found.push(...(await walk(path)));
    else found.push(path);
  }
  return found;
}

async function isPng(path) {
  const handle = await readFile(path);
  return handle.subarray(0, 8).equals(PNG_SIGNATURE);
}

const files = await walk(OUT);

// 1. copy every extensionless PNG to a .png twin
const renamed = [];
for (const path of files) {
  if (extname(path) !== "") continue;
  const info = await stat(path);
  if (!info.isFile() || info.size < 8) continue;
  if (!(await isPng(path))) continue;
  await copyFile(path, `${path}.png`);
  renamed.push(path);
}

// 2. point the exported markup at the .png twins
const TEXTUAL = new Set([".html", ".txt", ".xml", ".json"]);
const target = /(\/[^"'\s?<>]*(?:opengraph-image|apple-icon|twitter-image))(\?[A-Za-z0-9._-]+)?/g;

let patched = 0;
for (const path of files) {
  if (!TEXTUAL.has(extname(path))) continue;
  const source = await readFile(path, "utf8");
  // already-suffixed paths must not gain a second .png
  const next = source.replace(target, (match, base, query) =>
    base.endsWith(".png") ? match : `${base}.png${query ? "" : ""}`,
  );
  if (next !== source) {
    await writeFile(path, next);
    patched += 1;
  }
}

console.log(
  `image routes: ${renamed.length} png twin(s) written, ${patched} exported file(s) patched`,
);
