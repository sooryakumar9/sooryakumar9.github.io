/**
 * Screenshots every route at three widths and reports console errors, page
 * errors, failed requests and horizontal overflow.
 *
 * Usage: node scripts/shots.mjs [--reduced] [--out DIR]
 */
import { chromium, devices } from "playwright";
import { mkdir } from "node:fs/promises";

const BASE = process.env.BASE ?? "http://localhost:6301";
const reduced = process.argv.includes("--reduced");
const outIndex = process.argv.indexOf("--out");
const OUT = outIndex > -1 ? process.argv[outIndex + 1] : "shots";

const routes = [
  ["home", "/"],
  ["work", "/work/"],
  ["about", "/about/"],
  ["case-hils", "/work/hils-automation/"],
  ["case-zenpro", "/work/zenpro/"],
];

const viewports = [
  ["desktop", { width: 1440, height: 900 }],
  ["tablet", { width: 768, height: 1024 }],
  ["mobile", { width: 390, height: 844 }],
];

const problems = [];

const browser = await chromium.launch();

for (const [vpName, viewport] of viewports) {
  const context = await browser.newContext({
    viewport,
    deviceScaleFactor: 1,
    reducedMotion: reduced ? "reduce" : "no-preference",
    ...(vpName === "mobile" ? { ...devices["iPhone 13"], viewport } : {}),
  });

  for (const [name, path] of routes) {
    const page = await context.newPage();
    const tag = `${name}@${vpName}${reduced ? "+reduced" : ""}`;

    page.on("console", (m) => {
      if (m.type() === "error" || m.type() === "warning") {
        problems.push(`[console ${m.type()}] ${tag}: ${m.text()}`);
      }
    });
    page.on("pageerror", (e) => problems.push(`[pageerror] ${tag}: ${e.message}`));
    page.on("requestfailed", (r) =>
      problems.push(`[requestfailed] ${tag}: ${r.url()} ${r.failure()?.errorText}`),
    );

    await page.goto(BASE + path, { waitUntil: "networkidle" });
    // let the opening sequence finish and reveals settle
    // the opening panel plus the hero ignition run ~5s before anything settles
    await page.waitForTimeout(reduced ? 800 : 6500);

    const overflow = await page.evaluate(() => ({
      scrollW: document.documentElement.scrollWidth,
      clientW: document.documentElement.clientWidth,
    }));
    if (overflow.scrollW > overflow.clientW + 1) {
      problems.push(
        `[overflow] ${tag}: scrollWidth ${overflow.scrollW} > clientWidth ${overflow.clientW}`,
      );
    }

    await mkdir(OUT, { recursive: true });
    await page.screenshot({ path: `${OUT}/${tag}.png`, fullPage: false });

    // a second frame further down the page
    await page.evaluate(() => window.scrollTo(0, window.innerHeight * 2.2));
    await page.waitForTimeout(reduced ? 400 : 1600);
    await page.screenshot({ path: `${OUT}/${tag}--scrolled.png`, fullPage: false });

    await page.close();
  }

  await context.close();
}

await browser.close();

if (problems.length) {
  console.log(`\n${problems.length} problem(s):`);
  for (const p of problems) console.log("  " + p);
  process.exitCode = 1;
} else {
  console.log("\nNo console errors, failed requests or horizontal overflow.");
}
