import type { Program } from "../types";

/** Erases the generic so programs with different state shapes share a map. */
export function define<S>(p: Program<S>): Program<never> {
  return p as unknown as Program<never>;
}

/**
 * Phase helper. Turns a looping clock into a named stage plus a local 0..1,
 * which is what lets every program be a multi-beat sequence — arrive, act,
 * resolve, reset — rather than one gesture on repeat.
 */
export function phase(t: number, durations: readonly number[]): [number, number] {
  const total = durations.reduce((a, b) => a + b, 0);
  let x = ((t % total) + total) % total;
  for (let i = 0; i < durations.length; i++) {
    if (x < durations[i]) return [i, x / durations[i]];
    x -= durations[i];
  }
  return [durations.length - 1, 1];
}

/**
 * A program's clock. Scroll drives it when the canvas is scroll-linked, the
 * wall clock when it is not, so every program can be written one way.
 */
export function clockOf(t: number, progress: number | null, span: number, rate: number): number {
  return progress !== null ? progress * span : t * rate;
}
