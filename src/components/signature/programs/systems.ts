import {
  ACCENT,
  ACCENT_DEEP,
  INK,
  clamp01,
  coreDot,
  ease,
  glowDot,
  lerp,
  mulberry32,
  noise2D,
  rgba,
} from "../types";
import { define } from "./shared";

/* ------------------------------------------------------------------ hero --- */

/**
 * Topographic contours over an evolving terrain.
 *
 * The height field is noise that drifts on a third axis, so the landscape is
 * always slowly rearranging itself rather than looping. Contour lines are
 * extracted with marching squares at a set of evenly spaced elevations, which
 * is why the bands stay clean and parallel instead of turning into hatching.
 *
 * The cursor adds a smooth gaussian peak to the field, so pointing at the page
 * pushes a hill up under it and the rings visibly bunch and ripple outward.
 * Bands near that peak warm toward cyan; everything else stays near neutral.
 */
type HeroState = {
  cols: number;
  rows: number;
  cell: number;
  /** reused every frame so the field never allocates */
  field: Float32Array;
  levels: number[];
};

const hero = define<HeroState>({
  // no trail: contours are hard geometry and a wake just muddies them
  init: (w, h) => {
    // cell size scales with the canvas so the contour density looks the same
    // on a phone and on a 27 inch monitor
    const cell = Math.max(14, Math.min(w, h) / 26);
    const cols = Math.ceil(w / cell) + 2;
    const rows = Math.ceil(h / cell) + 2;
    return {
      cols,
      rows,
      cell,
      field: new Float32Array(cols * rows),
      levels: [-0.5, -0.3, -0.12, 0.04, 0.2, 0.36, 0.52, 0.68],
    };
  },
  draw: ({ ctx, w, h, t, px, py, intro }, s) => {
    const a = ease(intro);
    const { cols, rows, cell, field, levels } = s;

    // the peak the pointer raises, eased so it grows and relaxes smoothly
    const peakR = Math.min(w, h) * 0.42;

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const x = c * cell;
        const y = r * cell;
        // two octaves is enough for readable contours; more just adds noise
        let v =
          noise2D(x * 0.0026 + t * 0.045, y * 0.0026 - t * 0.03) * 0.7 +
          noise2D(x * 0.0061 - t * 0.02, y * 0.0061 + t * 0.026) * 0.3;

        if (px !== null && py !== null) {
          const dx = x - px;
          const dy = y - py;
          const d2 = (dx * dx + dy * dy) / (peakR * peakR);
          if (d2 < 4) v += Math.exp(-d2 * 1.6) * 0.85;
        }
        field[r * cols + c] = v;
      }
    }

    ctx.lineCap = "round";

    for (let li = 0; li < levels.length; li++) {
      const level = levels[li];
      // higher bands read brighter, which gives the terrain a light direction
      const band = li / (levels.length - 1);
      ctx.lineWidth = 0.7 + band * 0.9;
      ctx.beginPath();

      for (let r = 0; r < rows - 1; r++) {
        for (let c = 0; c < cols - 1; c++) {
          const i = r * cols + c;
          const tl = field[i];
          const tr = field[i + 1];
          const bl = field[i + cols];
          const br = field[i + cols + 1];

          // marching squares: one bit per corner above the level
          const idx =
            (tl > level ? 8 : 0) | (tr > level ? 4 : 0) | (br > level ? 2 : 0) | (bl > level ? 1 : 0);
          if (idx === 0 || idx === 15) continue;

          const x0 = c * cell;
          const y0 = r * cell;
          const x1 = x0 + cell;
          const y1 = y0 + cell;

          // linear interpolation along each crossed edge, which is what keeps
          // the lines smooth instead of stair stepped
          const top = () => [x0 + ((level - tl) / (tr - tl)) * cell, y0] as const;
          const right = () => [x1, y0 + ((level - tr) / (br - tr)) * cell] as const;
          const bottom = () => [x0 + ((level - bl) / (br - bl)) * cell, y1] as const;
          const left = () => [x0, y0 + ((level - tl) / (bl - tl)) * cell] as const;

          const seg = (p: readonly [number, number], q: readonly [number, number]) => {
            ctx.moveTo(p[0], p[1]);
            ctx.lineTo(q[0], q[1]);
          };

          switch (idx) {
            case 1:
            case 14:
              seg(left(), bottom());
              break;
            case 2:
            case 13:
              seg(bottom(), right());
              break;
            case 3:
            case 12:
              seg(left(), right());
              break;
            case 4:
            case 11:
              seg(top(), right());
              break;
            case 6:
            case 9:
              seg(top(), bottom());
              break;
            case 7:
            case 8:
              seg(left(), top());
              break;
            // saddles: draw both crossings rather than guessing a connection
            case 5:
              seg(left(), top());
              seg(bottom(), right());
              break;
            case 10:
              seg(top(), right());
              seg(left(), bottom());
              break;
          }
        }
      }

      ctx.strokeStyle = rgba(INK, (0.06 + band * 0.16) * a);
      ctx.stroke();
    }

    // the pointer's own peak gets a warm halo so the interaction is legible
    if (px !== null && py !== null) {
      const g = ctx.createRadialGradient(px, py, 0, px, py, peakR * 0.9);
      g.addColorStop(0, rgba(ACCENT, 0.1 * a));
      g.addColorStop(0.5, rgba(ACCENT, 0.03 * a));
      g.addColorStop(1, rgba(ACCENT, 0));
      ctx.fillStyle = g;
      ctx.fillRect(px - peakR, py - peakR, peakR * 2, peakR * 2);
    }
  },
});

/* ------------------------------------------------------------------ hils --- */

/**
 * A Lorenz attractor, integrated live.
 *
 * The trajectory is advanced a few steps per frame with RK-ish Euler and kept
 * in a ring buffer, then drawn as a ribbon that is bright at the head and
 * decays along the tail. The whole thing rotates slowly on the vertical axis
 * so the two lobes trade depth, with far segments fogged toward the
 * background.
 *
 * It never repeats and never resets: a deterministic system that is impossible
 * to predict, which is the honest picture of what a simulation lab does.
 */
type LorenzState = {
  buf: Float32Array;
  head: number;
  len: number;
  cap: number;
  x: number;
  y: number;
  z: number;
};

const hils = define<LorenzState>({
  trail: 0.62,
  init: (w, h) => {
    // longer ribbon on a bigger canvas, but never so long it costs a frame
    const cap = Math.round(clamp01((w * h) / 500000) * 900) + 500;
    return { buf: new Float32Array(cap * 3), head: 0, len: 0, cap, x: 0.1, y: 0, z: 0 };
  },
  draw: ({ ctx, w, h, t, px, py, intro }, s) => {
    const a = ease(intro);
    const SIGMA = 10;
    const RHO = 28;
    const BETA = 8 / 3;
    const dt = 0.0055;

    // integrate several steps per frame so the head moves at a watchable pace
    for (let i = 0; i < 7; i++) {
      const dx = SIGMA * (s.y - s.x);
      const dy = s.x * (RHO - s.z) - s.y;
      const dz = s.x * s.y - BETA * s.z;
      s.x += dx * dt;
      s.y += dy * dt;
      s.z += dz * dt;

      s.buf[s.head * 3] = s.x;
      s.buf[s.head * 3 + 1] = s.y;
      s.buf[s.head * 3 + 2] = s.z;
      s.head = (s.head + 1) % s.cap;
      if (s.len < s.cap) s.len++;
    }

    // Fit to the box. The attractor spans roughly 44 world units across and 50
    // tall, and the perspective term shrinks it a further ~15%, so fitting
    // naively against those raw extents leaves it marooned in the middle of a
    // wide banner. These divisors target ~90% of the short side.
    const scale = Math.min(w / 40, h / 47);
    const cx = w / 2;
    const cy = h / 2;

    // slow yaw, nudged by the pointer so it feels responsive without spinning
    let yaw = t * 0.16;
    if (px !== null) yaw += ((px - w / 2) / w) * 0.9;
    const cosY = Math.cos(yaw);
    const sinY = Math.sin(yaw);
    const tilt = px !== null && py !== null ? ((py - h / 2) / h) * 0.35 : 0;

    ctx.lineCap = "round";

    let prevX = 0;
    let prevY = 0;
    let prevOk = false;

    for (let k = 0; k < s.len; k++) {
      // walk from oldest to newest so the ribbon draws head-last
      const i = (s.head - s.len + k + s.cap * 2) % s.cap;
      const X = s.buf[i * 3];
      const Y = s.buf[i * 3 + 1];
      const Z = s.buf[i * 3 + 2] - 25;

      // rotate about the vertical axis, then a small tilt
      const rx = X * cosY - Y * sinY;
      const rz = X * sinY + Y * cosY;
      const ry = Z + rz * tilt;

      // weak perspective: nearer segments are larger and brighter
      const depth = 1 / (1 + (rz + 30) * 0.006);
      const sx = cx + rx * scale * depth;
      const sy = cy - ry * scale * depth;

      const age = k / s.len; // 0 tail, 1 head
      if (prevOk) {
        const fog = clamp01(depth * 1.1);
        // the head is cyan and hot, the tail cools to near neutral
        const warmth = age * age;
        ctx.strokeStyle = rgba(
          warmth > 0.45 ? ACCENT : INK,
          (0.04 + age * 0.62) * fog * a,
        );
        ctx.lineWidth = (0.5 + age * 1.9) * fog;
        ctx.beginPath();
        ctx.moveTo(prevX, prevY);
        ctx.lineTo(sx, sy);
        ctx.stroke();
      }
      prevX = sx;
      prevY = sy;
      prevOk = true;
    }

    // the leading particle
    if (prevOk) {
      coreDot(ctx, prevX, prevY, Math.max(1.8, Math.min(w, h) * 0.008), ACCENT, a);
      glowDot(ctx, prevX, prevY, Math.max(5, Math.min(w, h) * 0.026), ACCENT_DEEP, 0.4 * a);
    }
  },
});

/* ------------------------------------------------------------------- rag --- */

/**
 * Relevance as distance.
 *
 * One document node sits at the centre and job nodes orbit it at a radius set
 * by their match score — closer means a better match. Scores drift on their
 * own slow cycles, so nodes continuously spiral in and out and the ranking
 * genuinely reorders itself. Whichever is currently nearest locks: it brightens,
 * gains a tether to the centre and holds until something overtakes it.
 */
type Job = { seed: number; speed: number; base: number; swing: number; phase: number };

const rag = define<{ jobs: Job[] }>({
  trail: 0.5,
  init: (w, h) => {
    const rand = mulberry32(2026);
    // more orbiters on a larger canvas, but never a crowd
    const count = Math.round(lerp(6, 11, clamp01((w * h) / 420000)));
    const jobs: Job[] = [];
    for (let i = 0; i < count; i++) {
      jobs.push({
        seed: rand(),
        speed: 0.06 + rand() * 0.13,
        base: 0.34 + rand() * 0.46,
        swing: 0.1 + rand() * 0.2,
        // evenly spaced starting angles with a little jitter, so the orbiters
        // never all happen to bunch into one quadrant
        phase: (i / count) * Math.PI * 2 + rand() * 0.5,
      });
    }
    return { jobs };
  },
  draw: ({ ctx, w, h, t, px, py, intro }, { jobs }) => {
    const a = ease(intro);
    const cx = w / 2;
    const cy = h / 2;
    const unit = Math.min(w, h);
    // The orbits are elliptical and follow the canvas aspect, so a 1240x420
    // banner gets a wide ellipse rather than a small circle stranded in the
    // middle. The stretch is capped so it never degenerates into a line.
    const ry = h * 0.4;
    const rx = Math.min(w * 0.4, ry * 2.6);

    // guide rings, so the radii read as a scale rather than as scatter
    for (let i = 1; i <= 3; i++) {
      ctx.strokeStyle = rgba(INK, 0.035 * a);
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.ellipse(cx, cy, rx * (i / 3), ry * (i / 3), 0, 0, Math.PI * 2);
      ctx.stroke();
    }

    // resolve every orbiter first so the closest can be found before drawing
    let best = -1;
    let bestR = Infinity;
    const pos: { x: number; y: number; r: number; score: number }[] = [];

    for (let i = 0; i < jobs.length; i++) {
      const j = jobs[i];
      // the score breathes, which is what makes the ranking move
      const score = 0.5 + 0.5 * Math.sin(t * 0.32 + j.phase);
      const rNorm = j.base - j.swing * score;
      const ang = j.phase + t * j.speed;
      const x = cx + Math.cos(ang) * rx * rNorm;
      const y = cy + Math.sin(ang) * ry * rNorm;
      // rank on the normalised radius, not the pixel one, so the leader is the
      // best match rather than whichever node the ellipse happens to squash
      pos.push({ x, y, r: rNorm, score });
      if (rNorm < bestR) {
        bestR = rNorm;
        best = i;
      }
    }

    for (let i = 0; i < pos.length; i++) {
      const p = pos[i];
      const near = clamp01(1 - p.r);
      const isBest = i === best;

      // tether: only the leader keeps a solid line to the centre
      ctx.strokeStyle = rgba(isBest ? ACCENT : INK, (isBest ? 0.5 : 0.06 + near * 0.1) * a);
      ctx.lineWidth = isBest ? 1.4 : 0.8;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(p.x, p.y);
      ctx.stroke();

      const size = unit * (isBest ? 0.014 : 0.007 + near * 0.006);
      coreDot(ctx, p.x, p.y, size, isBest ? ACCENT : INK, (isBest ? 1 : 0.32 + near * 0.4) * a);
      if (isBest) {
        glowDot(ctx, p.x, p.y, size * 3.4, ACCENT, 0.4 * a);
        // a lock bracket, sized to the canvas
        const b = size * 2.6;
        ctx.strokeStyle = rgba(ACCENT, 0.75 * a);
        ctx.lineWidth = 1.2;
        for (const [sx, sy] of [
          [-1, -1],
          [1, -1],
          [-1, 1],
          [1, 1],
        ] as const) {
          ctx.beginPath();
          ctx.moveTo(p.x + sx * b, p.y + sy * b - sy * b * 0.45);
          ctx.lineTo(p.x + sx * b, p.y + sy * b);
          ctx.lineTo(p.x + sx * b - sx * b * 0.45, p.y + sy * b);
          ctx.stroke();
        }
      }
    }

    // the document itself, with a slow pulse
    const pulse = 0.85 + 0.15 * Math.sin(t * 1.6);
    coreDot(ctx, cx, cy, unit * 0.018 * pulse, ACCENT_DEEP, a);
    glowDot(ctx, cx, cy, unit * 0.07, ACCENT_DEEP, 0.35 * a);

    void px;
    void py;
  },
});

export { hero, hils, rag };
