/**
 * Measures frame timing while slow scrolling the home page from the hero into
 * the featured rail, which is where the site was reported to stutter.
 *
 * `shots.mjs` catches correctness problems; this catches cost. The two things
 * it reports that matter most:
 *
 *   - `LayoutCount` / `RecalcStyleCount`, read from CDP either side of the
 *     scroll. Far steadier run to run than parsing a trace, and a direct proxy
 *     for forced reflow: batching a read/write loop shows up here as a clean
 *     step down.
 *   - long tasks and frame deltas, from a PerformanceObserver and a rAF
 *     sampler installed before any app code runs, so hydration is included.
 *
 * Two deliberate choices. It drives real Chrome rather than the bundled build,
 * because half of what is being measured (backdrop-filter, conic gradients,
 * blur) is compositor work that headless renders on the CPU and misreports. And
 * it runs at deviceScaleFactor 2, because at 1 the canvas backing stores are
 * half size and the oversampling this was written to find disappears.
 *
 * Usage: node scripts/perf.mjs [--url URL] [--throttle N] [--warm] [--on-card]
 */
import { chromium } from "playwright";
import { mkdir, writeFile } from "node:fs/promises";

const arg = (flag, fallback) => {
  const i = process.argv.indexOf(flag);
  return i > -1 ? process.argv[i + 1] : fallback;
};

const URL = arg("--url", "http://localhost:6301");
const THROTTLE = Number(arg("--throttle", 1));
const WARM = process.argv.includes("--warm");
const ON_CARD = process.argv.includes("--on-card");
const OUT = arg("--out", "perf");

const TAG = `${WARM ? "warm" : "cold"}-${THROTTLE}x-${ON_CARD ? "oncard" : "offcard"}`;

/**
 * Installed before app code. The rAF sampler runs for the whole session rather
 * than just the scroll, so the numbers include hydration; `mark()` slices out
 * the window we actually care about.
 */
const probe = () => {
  const frames = [];
  const longtasks = [];
  let markedFrame = 0;
  let markedAt = 0;

  new PerformanceObserver((list) => {
    for (const e of list.getEntries()) {
      longtasks.push({ start: Math.round(e.startTime), dur: Math.round(e.duration) });
    }
  }).observe({ entryTypes: ["longtask"] });

  let last = performance.now();
  const tick = (now) => {
    frames.push(now - last);
    last = now;
    requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);

  Object.defineProperty(window, "__perf", {
    value: {
      mark: () => {
        markedFrame = frames.length;
        markedAt = performance.now();
      },
      // load and scroll are reported apart. Long tasks during hydration are a
      // real cost but a different one, and lumping them in made a clean scroll
      // look like a janky one
      read: () => ({
        frames: frames.slice(markedFrame),
        scrollTasks: longtasks.filter((t) => t.start >= markedAt),
        loadTasks: longtasks.filter((t) => t.start < markedAt),
      }),
    },
  });
};

const pct = (sorted, p) => sorted[Math.min(sorted.length - 1, Math.floor(sorted.length * p))] ?? 0;

const browser = await chromium.launch({ channel: "chrome" });
const context = await browser.newContext({
  viewport: { width: 1440, height: 900 },
  deviceScaleFactor: 2,
});

await context.addInitScript(probe);
if (WARM) {
  // the head script in layout.tsx skips the opening panel inside a 5 minute
  // window, so stamping this reproduces a repeat visit rather than a first one
  await context.addInitScript(() => {
    try {
      localStorage.setItem("sk-intro-at", String(Date.now()));
    } catch {}
  });
}

const page = await context.newPage();
const problems = [];
page.on("console", (m) => {
  if (m.type() === "error") problems.push(`[console] ${m.text()}`);
});
page.on("pageerror", (e) => problems.push(`[pageerror] ${e.message}`));

const cdp = await context.newCDPSession(page);
await cdp.send("Performance.enable");
if (THROTTLE > 1) await cdp.send("Emulation.setCPUThrottlingRate", { rate: THROTTLE });

await page.goto(URL, { waitUntil: "networkidle" });
// the opening panel plus the hero ignition run ~5s before anything settles
await page.waitForTimeout(WARM ? 2500 : 7000);

const metricsOf = (rows) => Object.fromEntries(rows.map((m) => [m.name, m.value]));
const before = metricsOf((await cdp.send("Performance.getMetrics")).metrics);

// park the pointer first: over a card this activates .tech-edge:hover and the
// canvas pointer path, and the delta against off-card is what those cost
await page.mouse.move(ON_CARD ? 400 : 1430, ON_CARD ? 620 : 20);
const startY = await page.evaluate(() => {
  window.__perf.mark();
  return window.scrollY;
});

// wheel events, not scrollTo — the page is driven by Lenis and only a real
// wheel goes through it
for (let i = 0; i < 120; i++) {
  await page.mouse.wheel(0, 60);
  await page.waitForTimeout(16);
}

const endY = await page.evaluate(() => window.scrollY);
const docH = await page.evaluate(() => document.documentElement.scrollHeight);
const after = metricsOf((await cdp.send("Performance.getMetrics")).metrics);
const { frames, scrollTasks, loadTasks } = await page.evaluate(() => window.__perf.read());

const sorted = [...frames].sort((a, b) => a - b);
const d = (k) => +(after[k] - before[k]).toFixed(1);
const report = {
  tag: TAG,
  url: URL,
  frames: frames.length,
  median: +pct(sorted, 0.5).toFixed(1),
  p95: +pct(sorted, 0.95).toFixed(1),
  worst: +Math.max(...frames).toFixed(1),
  over16: frames.filter((f) => f > 16.7).length,
  over50: frames.filter((f) => f > 50).length,
  scrollTasks: scrollTasks.length,
  scrollTaskMs: scrollTasks.reduce((a, t) => a + t.dur, 0),
  loadTasks: loadTasks.length,
  loadTaskMs: loadTasks.reduce((a, t) => a + t.dur, 0),
  scrolled: `${Math.round(startY)}->${Math.round(endY)} of ${docH}`,
  layoutCount: d("LayoutCount"),
  recalcCount: d("RecalcStyleCount"),
  layoutMs: +(d("LayoutDuration") * 1000).toFixed(1),
  recalcMs: +(d("RecalcStyleDuration") * 1000).toFixed(1),
  scriptMs: +(d("ScriptDuration") * 1000).toFixed(1),
  taskMs: +(d("TaskDuration") * 1000).toFixed(1),
};

await mkdir(OUT, { recursive: true });
await writeFile(`${OUT}/${TAG}.json`, JSON.stringify(report, null, 2));

console.log(`\n=== ${TAG} — ${URL} ===`);
console.log(`  frames        ${report.frames}  median ${report.median}ms  p95 ${report.p95}ms  worst ${report.worst}ms`);
console.log(`  dropped       ${report.over16} over 16.7ms, ${report.over50} over 50ms`);
console.log(`  long tasks    ${report.scrollTasks} scrolling (${report.scrollTaskMs}ms), ${report.loadTasks} loading (${report.loadTaskMs}ms)`);
console.log(`  layout        ${report.layoutCount} runs, ${report.layoutMs}ms`);
console.log(`  style recalc  ${report.recalcCount} runs, ${report.recalcMs}ms`);
console.log(`  script        ${report.scriptMs}ms   task total ${report.taskMs}ms`);
console.log(`  scrolled      ${report.scrolled}`);
if (problems.length) for (const p of problems) console.log(`  ${p}`);

await browser.close();
