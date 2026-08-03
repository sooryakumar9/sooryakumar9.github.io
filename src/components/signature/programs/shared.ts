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

/* ------------------------------------------------------ level of detail --- */

/*
 * A work card is 380x160, a case study banner is 1240x420. Text that is
 * comfortable on the banner lands around 8px on the card, which is a smudge —
 * so anything that wants labels renders them only above this threshold and
 * draws solid pills and bars below it instead. The composition is identical
 * either way; only the detail changes.
 */
const LABEL_MIN_W = 300;
const LABEL_MIN_H = 210;

/** True when the canvas is big enough that a label reads as intentional. */
export function roomForLabels(w: number, h: number): boolean {
  return w >= LABEL_MIN_W && h >= LABEL_MIN_H;
}

/**
 * Label size proportional to the box. The 10px floor is deliberate: below it
 * the label should not be drawn at all, which is what `roomForLabels` decides.
 */
export function labelPx(w: number, h: number): number {
  return Math.max(10, Math.min(14, Math.min(w, h) * 0.036));
}

/** Count that grows with canvas area, clamped at both ends. */
export function scaled(w: number, h: number, min: number, max: number, per = 26000): number {
  return Math.round(Math.max(min, Math.min(max, (w * h) / per)));
}

/** Mono label, centred vertically on `y`, drawn only when there is room. */
export function label(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  w: number,
  h: number,
  color: string,
  align: CanvasTextAlign = "left",
) {
  if (!roomForLabels(w, h)) return;
  ctx.font = `500 ${labelPx(w, h).toFixed(1)}px ui-monospace, monospace`;
  ctx.textAlign = align;
  ctx.textBaseline = "middle";
  ctx.fillStyle = color;
  ctx.fillText(text, x, y);
}
