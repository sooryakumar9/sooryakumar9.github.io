"use client";

/**
 * How far along the first load actually is.
 *
 * The opening panel used to run a fixed 1.5s tween and lift on schedule whether
 * or not the page was ready. Worse, `gsap.ticker.lagSmoothing(0)` means a tween
 * does not stretch when the main thread blocks — it skips. So the counter
 * stuttered through hydration and the panel lifted anyway: the loading was not
 * hidden by the opening, it was displayed by it.
 *
 * This reports genuine progress instead. Milestones land as the work finishes
 * and the panel waits for them, bounded at both ends.
 */

/** The things worth waiting for, and how much of the bar each is worth. */
const WEIGHTS = { hydrated: 0.3, fonts: 0.3, hero: 0.4 } as const;
export type Milestone = keyof typeof WEIGHTS;

/** A fast machine should still see a deliberate opening, not a flash. */
const FLOOR_MS = 1200;
/**
 * And nobody should ever be trapped behind an opaque panel. A shader that fails
 * to compile or a font that never arrives must not cost the visitor the page —
 * the same safety valve as `NAV_TIMEOUT` in `smoothScroll.ts`.
 */
const CEILING_MS = 4000;

const done = new Set<Milestone>();
const listeners = new Set<(progress: number) => void>();
let started = 0;
let ceiling = 0;

function progress(): number {
  let p = 0;
  for (const key of done) p += WEIGHTS[key];
  return Math.min(1, p);
}

function emit() {
  const p = progress();
  for (const fn of listeners) fn(p);
}

/** Records a milestone. Safe to call more than once, and before anyone listens. */
export function markReady(name: Milestone) {
  if (done.has(name)) return;
  done.add(name);
  emit();
}

/**
 * Subscribes to progress and starts the clock. The returned disposer also
 * clears the ceiling, so a panel that is unmounted early cannot leave a timer
 * firing into nothing.
 */
export function onProgress(fn: (progress: number) => void) {
  listeners.add(fn);
  if (!started) started = performance.now();

  if (!ceiling) {
    ceiling = window.setTimeout(() => {
      // whatever has not arrived by now is not going to change the picture
      for (const key of Object.keys(WEIGHTS) as Milestone[]) done.add(key);
      emit();
    }, CEILING_MS);
  }

  fn(progress());
  return () => {
    listeners.delete(fn);
    if (!listeners.size && ceiling) {
      clearTimeout(ceiling);
      ceiling = 0;
    }
  };
}

/** Milliseconds still owed to the floor, so the opening never flashes past. */
export function remainingFloor(): number {
  if (!started) return FLOOR_MS;
  return Math.max(0, FLOOR_MS - (performance.now() - started));
}

/**
 * Fonts are a shared dependency: the hero measures its headline against them
 * and the header measures its brand. Awaiting them here means the page settles
 * behind the panel rather than reflowing once it has lifted.
 */
export function watchFonts() {
  if (typeof document === "undefined" || !document.fonts) {
    markReady("fonts");
    return;
  }
  document.fonts.ready.then(() => markReady("fonts")).catch(() => markReady("fonts"));
}
