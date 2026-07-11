/**
 * House style check: no dash or hyphen characters in any prose the visitor
 * reads. Scans string literals in the content layer and in component JSX,
 * allowing proper nouns that really contain hyphens, plus URLs, paths,
 * ids and code identifiers.
 *
 * Usage: node scripts/no-dash-check.mjs
 */
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

// string literals are prose only in the content layer; in components the
// prose lives in JSX text nodes (literals there are classNames and tokens)
const LITERAL_ROOTS = ["src/content"];
const JSX_ROOTS = ["src/components", "src/app"];
const DASHES = /[‐‑‒–—―-]/;

// proper nouns and technical strings that legitimately contain a hyphen
const WHITELIST = [/Q-Secure/, /Madhu-Marga/, /RT-LAB/];

// strings that are not prose: urls, paths, anchors, css/id tokens, files
const NOT_PROSE = [
  /^https?:/,
  /^mailto:/,
  /^[#/]/,
  /^[\w-]+$/, // single tokens such as ids, css classes, keys
  /^--/, // css custom properties
  /\.(svg|png|pdf|css|ts|tsx|mjs)$/,
];

function* walk(dir) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) yield* walk(p);
    else if (/\.(ts|tsx)$/.test(p)) yield p;
  }
}

function stripWhitelisted(text) {
  let out = text;
  for (const re of WHITELIST) out = out.replaceAll(new RegExp(re, "g"), "");
  return out;
}

const failures = [];

for (const root of LITERAL_ROOTS) {
  for (const file of walk(root)) {
    const src = readFileSync(file, "utf8");
    const literals = src.match(/"(?:[^"\\\n]|\\.)*"|'(?:[^'\\\n]|\\.)*'/g) ?? [];
    for (const raw of literals) {
      const value = raw.slice(1, -1);
      if (NOT_PROSE.some((re) => re.test(value))) continue;
      const cleaned = stripWhitelisted(value);
      if (DASHES.test(cleaned)) failures.push({ file, text: value });
    }
  }
}

for (const root of JSX_ROOTS) {
  for (const file of walk(root)) {
    const src = readFileSync(file, "utf8");
    // JSX text between tags: prose written directly in markup. Single line
    // only; multiline prose is covered by the rendered text audit in QA.
    const jsxText = src.match(/>([^<>{}\n]+)</g) ?? [];
    for (const raw of jsxText) {
      const value = raw.slice(1, -1).trim();
      if (!value || value.length < 3) continue;
      const cleaned = stripWhitelisted(value);
      if (DASHES.test(cleaned)) failures.push({ file, text: value });
    }
  }
}

if (failures.length) {
  console.error(`no-dash-check: ${failures.length} violation(s)\n`);
  for (const f of failures.slice(0, 40)) {
    console.error(`  ${f.file}\n    "${f.text}"\n`);
  }
  process.exit(1);
}
console.log("no-dash-check: clean. No dashes in prose.");
