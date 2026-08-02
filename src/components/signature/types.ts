/** Everything a program is handed on each frame. */
export type Frame = {
  ctx: CanvasRenderingContext2D;
  /** CSS pixels, not device pixels; the context is already scaled */
  w: number;
  h: number;
  /** seconds since the program started */
  t: number;
  /** pointer in CSS pixels relative to the canvas, smoothed; null when away */
  px: number | null;
  py: number | null;
  /** 0 while entering, settles at 1 — lets programs assemble on first view */
  intro: number;
  /**
   * 0..1 as the canvas travels through the viewport, or null when nothing is
   * driving it. Programs that accept it advance with the scroll instead of the
   * clock, which makes the page feel like one instrument rather than a wall of
   * independent loops.
   */
  progress: number | null;
};

/**
 * A signature program. `init` runs once per mount and may allocate whatever
 * state it needs; `draw` is called per frame and should not allocate.
 *
 * `trail` is how much of the previous frame survives: 0 clears completely,
 * higher values leave a longer wake. Programs that draw dense text or hard
 * geometry want 0; particle work wants 0.75 or more.
 */
export type Program<S = unknown> = {
  init: (w: number, h: number) => S;
  draw: (f: Frame, state: S) => void;
  trail?: number;
};

export const INK = "#f2f5f7";
export const MUTED = "#8b949e";
export const ACCENT = "#5eead4";
export const ACCENT_DEEP = "#22d3ee";
export const AMBER = "#f5b74f";
export const DEAD = "#3d3d3d";
export const BG = "#08090b";

/** Deterministic pseudo random, so a reload draws the same composition. */
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function rgba(hex: string, alpha: number): string {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${alpha})`;
}

/** Smooth 0..1 ramp. */
export function ease(x: number): number {
  return x <= 0 ? 0 : x >= 1 ? 1 : 1 - Math.pow(1 - x, 3);
}

export function clamp01(x: number): number {
  return x < 0 ? 0 : x > 1 ? 1 : x;
}

export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

/* ------------------------------------------------------------------ bloom --- */

/**
 * A glowing point. Drawn as a radial gradient under additive compositing,
 * which is what makes the cyan actually radiate instead of sitting flat on the
 * background.
 *
 * `shadowBlur` would give a similar look and is far slower — at the element
 * counts here it is the difference between 60fps and single digits.
 */
export function glowDot(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number,
  color: string,
  alpha: number,
) {
  if (alpha <= 0.002 || r <= 0) return;
  const g = ctx.createRadialGradient(x, y, 0, x, y, r * 3);
  g.addColorStop(0, rgba(color, alpha));
  g.addColorStop(0.35, rgba(color, alpha * 0.4));
  g.addColorStop(1, rgba(color, 0));
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(x, y, r * 3, 0, Math.PI * 2);
  ctx.fill();
}

/** Hard core plus halo, for points that need to read as solid. */
export function coreDot(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number,
  color: string,
  alpha: number,
) {
  glowDot(ctx, x, y, r, color, alpha * 0.7);
  ctx.fillStyle = rgba(color, Math.min(1, alpha));
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
}

/** A line that fades along its length, for edges that should feel directional. */
export function gradientLine(
  ctx: CanvasRenderingContext2D,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  color: string,
  a1: number,
  a2: number,
  width = 1,
) {
  const g = ctx.createLinearGradient(x1, y1, x2, y2);
  g.addColorStop(0, rgba(color, a1));
  g.addColorStop(1, rgba(color, a2));
  ctx.strokeStyle = g;
  ctx.lineWidth = width;
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
}

/* ------------------------------------------------------------------ depth --- */

export type Projected = { x: number; y: number; scale: number; fog: number };

/**
 * Weak perspective projection. `z` runs roughly -1 (far) to 1 (near); the
 * returned `scale` sizes the geometry and `fog` is how much it should be
 * washed out toward the background.
 */
export function project(
  x: number,
  y: number,
  z: number,
  w: number,
  h: number,
  depth = 1.9,
): Projected {
  const s = depth / (depth - z);
  return {
    x: w / 2 + (x - w / 2) * s,
    y: h / 2 + (y - h / 2) * s,
    scale: s,
    fog: clamp01((1 - z) / 2),
  };
}

/* ------------------------------------------------------------------- noise --- */

const PERM = (() => {
  const rand = mulberry32(9187);
  const p = new Uint8Array(512);
  const src = new Uint8Array(256);
  for (let i = 0; i < 256; i++) src[i] = i;
  for (let i = 255; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [src[i], src[j]] = [src[j], src[i]];
  }
  for (let i = 0; i < 512; i++) p[i] = src[i & 255];
  return p;
})();

function fade(t: number) {
  return t * t * t * (t * (t * 6 - 15) + 10);
}

function grad(hash: number, x: number, y: number) {
  switch (hash & 3) {
    case 0:
      return x + y;
    case 1:
      return -x + y;
    case 2:
      return x - y;
    default:
      return -x - y;
  }
}

/** Classic 2D value/gradient noise in -1..1. Cheap enough to call per particle. */
export function noise2D(x: number, y: number): number {
  const xi = Math.floor(x) & 255;
  const yi = Math.floor(y) & 255;
  const xf = x - Math.floor(x);
  const yf = y - Math.floor(y);
  const u = fade(xf);
  const v = fade(yf);
  const aa = PERM[PERM[xi] + yi];
  const ab = PERM[PERM[xi] + yi + 1];
  const ba = PERM[PERM[xi + 1] + yi];
  const bb = PERM[PERM[xi + 1] + yi + 1];
  const x1 = lerp(grad(aa, xf, yf), grad(ba, xf - 1, yf), u);
  const x2 = lerp(grad(ab, xf, yf - 1), grad(bb, xf - 1, yf - 1), u);
  return lerp(x1, x2, v);
}

/**
 * Curl of the noise field. Following the curl rather than the gradient gives
 * divergence free flow — particles swirl and never pile up in sinks, which is
 * what makes it look like fluid instead of like wind.
 */
export function curl(x: number, y: number, eps = 0.0008): [number, number] {
  const n1 = noise2D(x, y + eps);
  const n2 = noise2D(x, y - eps);
  const n3 = noise2D(x + eps, y);
  const n4 = noise2D(x - eps, y);
  return [(n1 - n2) / (2 * eps), -(n3 - n4) / (2 * eps)];
}
