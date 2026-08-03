"use client";

import { BG, rgba, type Frame, type Program } from "./types";

type Entry = {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  program: Program<unknown>;
  state: unknown;
  w: number;
  h: number;
  visible: boolean;
  start: number;
  /** smoothed pointer, in CSS px relative to the canvas */
  px: number | null;
  py: number | null;
  /** raw pointer target the smoothing chases */
  tx: number | null;
  ty: number | null;
};

/**
 * One requestAnimationFrame loop for every signature canvas on the page.
 * Canvases register on mount and are only drawn while they intersect the
 * viewport, so a page carrying ten of them still runs a single loop and only
 * paints what is on screen.
 */
const entries = new Set<Entry>();
let raf = 0;

const observer =
  typeof IntersectionObserver !== "undefined"
    ? new IntersectionObserver(
        (records) => {
          for (const record of records) {
            for (const entry of entries) {
              if (entry.canvas === record.target) entry.visible = record.isIntersecting;
            }
          }
          syncLoop();
        },
        { rootMargin: "120px" },
      )
    : null;

function anyVisible(): boolean {
  for (const entry of entries) if (entry.visible) return true;
  return false;
}

function syncLoop() {
  if (anyVisible() && !raf) {
    raf = requestAnimationFrame(tick);
  } else if (!anyVisible() && raf) {
    cancelAnimationFrame(raf);
    raf = 0;
  }
}

function tick(now: number) {
  raf = 0;
  for (const entry of entries) {
    if (!entry.visible) continue;
    // chase the raw pointer so the reaction has weight instead of snapping
    if (entry.tx !== null && entry.ty !== null) {
      entry.px = entry.px === null ? entry.tx : entry.px + (entry.tx - entry.px) * 0.12;
      entry.py = entry.py === null ? entry.ty : entry.py + (entry.ty - entry.py) * 0.12;
    } else {
      entry.px = null;
      entry.py = null;
    }
    drawEntry(entry, now);
  }
  syncLoop();
}

function drawEntry(entry: Entry, now: number) {
  /*
   * Clamped, and not defensively — `now` is the requestAnimationFrame
   * timestamp, which is the moment the frame *started*, while `entry.start` is
   * a `performance.now()` taken during the previous frame's script. The first
   * callback after attach can therefore arrive with a timestamp fractionally
   * earlier than the start, making `t` negative.
   *
   * A negative `t` is silently fine for anything trigonometric, which is why
   * this went unnoticed, but it is fatal for a program that indexes an array:
   * `-1 % 4` is `-1` in JavaScript, not `3`.
   */
  const t = Math.max(0, (now - entry.start) / 1000);
  const { ctx, w, h } = entry;

  // trail: instead of clearing, lay down a translucent wash so motion leaves a
  // decaying wake. `trail` is how much of the previous frame survives.
  const trail = entry.program.trail ?? 0;
  ctx.globalCompositeOperation = "source-over";
  if (trail > 0) {
    ctx.fillStyle = rgba(BG, 1 - trail);
    ctx.fillRect(0, 0, w, h);
  } else {
    ctx.clearRect(0, 0, w, h);
  }

  const frame: Frame = {
    ctx,
    w,
    h,
    t,
    px: entry.px,
    py: entry.py,
    intro: Math.min(1, t / 1.2),
  };

  // programs draw additively so overlapping light accumulates and glows
  ctx.globalCompositeOperation = "lighter";
  entry.program.draw(frame, entry.state);
  ctx.globalCompositeOperation = "source-over";
}

/** Sizes the backing store to the element box at the current DPR. */
function resize(entry: Entry) {
  const rect = entry.canvas.getBoundingClientRect();
  const w = Math.max(1, Math.round(rect.width));
  const h = Math.max(1, Math.round(rect.height));
  // capping at 2 keeps 3x phones from paying for pixels nobody can see
  const dpr = Math.min(2, window.devicePixelRatio || 1);

  entry.w = w;
  entry.h = h;
  entry.canvas.width = Math.round(w * dpr);
  entry.canvas.height = Math.round(h * dpr);
  entry.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  entry.state = entry.program.init(w, h);

  // a trailing program needs an opaque base or the wash never converges
  if ((entry.program.trail ?? 0) > 0) {
    entry.ctx.globalCompositeOperation = "source-over";
    entry.ctx.fillStyle = BG;
    entry.ctx.fillRect(0, 0, w, h);
  }
}

export type Handle = {
  destroy: () => void;
  setPointer: (x: number | null, y: number | null) => void;
};

/**
 * Attaches a program to a canvas. When `still` is true the program renders a
 * single settled frame and never animates, which is what reduced motion gets:
 * the composition survives, the movement does not.
 */
export function attach(
  canvas: HTMLCanvasElement,
  program: Program<never>,
  still: boolean,
): Handle | null {
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  const entry: Entry = {
    canvas,
    ctx,
    // the engine never inspects program state, it only hands it back
    program: program as unknown as Program<unknown>,
    state: undefined,
    w: 0,
    h: 0,
    visible: false,
    start: performance.now(),
    px: null,
    py: null,
    tx: null,
    ty: null,
  };

  resize(entry);

  if (still) {
    // one settled frame, far enough in that anything which assembles is done.
    // trailing programs get a few passes so the wake exists in the still.
    const paint = () => {
      const passes = (program.trail ?? 0) > 0 ? 90 : 1;
      for (let i = 0; i < passes; i++) {
        drawEntry(entry, entry.start + 3200 + i * 16);
      }
    };
    paint();
    const ro = new ResizeObserver(() => {
      resize(entry);
      paint();
    });
    ro.observe(canvas);
    return {
      destroy: () => ro.disconnect(),
      setPointer: () => {},
    };
  }

  entries.add(entry);
  observer?.observe(canvas);

  const ro = new ResizeObserver(() => resize(entry));
  ro.observe(canvas);

  syncLoop();

  return {
    destroy: () => {
      ro.disconnect();
      observer?.unobserve(canvas);
      entries.delete(entry);
      syncLoop();
    },
    setPointer: (x, y) => {
      entry.tx = x;
      entry.ty = y;
    },
  };
}
