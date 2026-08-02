import {
  ACCENT,
  ACCENT_DEEP,
  DEAD,
  INK,
  clamp01,
  coreDot,
  curl,
  ease,
  glowDot,
  gradientLine,
  lerp,
  mulberry32,
  rgba,
} from "../types";
import { define, phase } from "./shared";

/* ------------------------------------------------------------------ hero --- */

type Particle = { x: number; y: number; px: number; py: number; life: number; seed: number };

/**
 * Curl noise flow field. Particles follow the curl of a noise field, which is
 * divergence free — they swirl and braid instead of collecting in sinks, and
 * that is the difference between looking like fluid and looking like wind.
 *
 * Each particle draws the segment from its previous position to its current
 * one, and the engine's trail wash does the fading, so the strokes accumulate
 * into ribbons rather than being redrawn every frame.
 */
const hero = define<{ ps: Particle[]; scale: number }>({
  trail: 0.9,
  init: (w, h) => {
    const rand = mulberry32(20260802);
    const count = Math.min(900, Math.round((w * h) / 2600));
    const ps: Particle[] = [];
    for (let i = 0; i < count; i++) {
      ps.push({
        x: rand() * w,
        y: rand() * h,
        px: 0,
        py: 0,
        life: rand() * 220,
        seed: rand(),
      });
    }
    for (const p of ps) {
      p.px = p.x;
      p.py = p.y;
    }
    return { ps, scale: 0.0022 };
  },
  draw: ({ ctx, w, h, t, px, py, intro }, { ps, scale }) => {
    const a = ease(intro);

    for (const p of ps) {
      p.px = p.x;
      p.py = p.y;

      // the field drifts slowly, so the composition never repeats exactly
      const [cx, cy] = curl(p.x * scale + t * 0.02, p.y * scale - t * 0.015);
      let vx = cx * 2.1;
      let vy = cy * 2.1;

      // the cursor pushes flow away from itself, like a stone in a stream
      if (px !== null && py !== null) {
        const dx = p.x - px;
        const dy = p.y - py;
        const d2 = dx * dx + dy * dy;
        const r = 210;
        if (d2 < r * r) {
          const d = Math.sqrt(d2) || 1;
          const force = (1 - d / r) * 3.4;
          vx += (dx / d) * force;
          vy += (dy / d) * force;
        }
      }

      p.x += vx;
      p.y += vy;
      p.life -= 1;

      // respawn off the edges or at end of life, and reset the previous point
      // so the wrap does not draw a stroke across the whole canvas
      if (p.life <= 0 || p.x < -30 || p.x > w + 30 || p.y < -30 || p.y > h + 30) {
        p.x = Math.random() * w;
        p.y = Math.random() * h;
        p.px = p.x;
        p.py = p.y;
        p.life = 120 + Math.random() * 220;
      }

      const speed = Math.min(1, Math.hypot(vx, vy) / 4);
      // fast particles run cyan, slow ones stay near white: the field reads as
      // having temperature rather than being one flat colour
      const color = speed > 0.35 ? ACCENT : INK;
      const alpha = a * (0.12 + speed * 0.62) * (p.seed * 0.5 + 0.5);

      ctx.strokeStyle = rgba(color, alpha);
      ctx.lineWidth = 0.8 + speed * 1.4;
      ctx.beginPath();
      ctx.moveTo(p.px, p.py);
      ctx.lineTo(p.x, p.y);
      ctx.stroke();

      if (speed > 0.75) glowDot(ctx, p.x, p.y, 1.1, ACCENT, alpha * 0.5);
    }

    if (px !== null && py !== null) {
      glowDot(ctx, px, py, 3, ACCENT_DEEP, 0.22 * a);
    }
  },
});

/* ------------------------------------------------------------------ hils --- */

/**
 * The hardware in the loop, drawn as one. A model block and a hardware block
 * face each other across a closed ring; packets travel model to hardware along
 * the top and back along the bottom, and the five step sequence latches
 * underneath. When the sequence reaches execute the loop lights and the
 * traffic doubles.
 */
const hils = define<null>({
  trail: 0.55,
  init: () => null,
  draw: ({ ctx, w, h, t, progress, intro }) => {
    const a = ease(intro);
    // scroll drives the sequence when it can, the clock when it cannot
    const clock = progress !== null ? progress * 5 : t * 0.42;
    const [stage, local] = phase(clock % 5, [1, 1, 1.6, 0.7, 0.7]);
    const executing = stage === 2;

    const cx = w / 2;
    const cy = h * 0.42;
    const rx = Math.min(w * 0.32, 150);
    const ry = Math.min(h * 0.2, 62);
    const bw = Math.min(w * 0.26, 116);
    const bh = 34;

    // the loop
    ctx.strokeStyle = rgba(executing ? ACCENT : INK, (executing ? 0.5 : 0.16) * a);
    ctx.lineWidth = executing ? 1.6 : 1;
    ctx.beginPath();
    ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
    ctx.stroke();

    // the two blocks
    const drawBlock = (bx: number, label: string, lit: boolean) => {
      ctx.strokeStyle = rgba(lit ? ACCENT : INK, (lit ? 0.85 : 0.3) * a);
      ctx.lineWidth = 1.2;
      ctx.strokeRect(bx - bw / 2, cy - bh / 2, bw, bh);
      if (lit) {
        ctx.fillStyle = rgba(ACCENT, 0.07 * a);
        ctx.fillRect(bx - bw / 2, cy - bh / 2, bw, bh);
      }
      ctx.font = "500 9px ui-monospace, monospace";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillStyle = rgba(lit ? ACCENT : INK, (lit ? 0.95 : 0.42) * a);
      ctx.fillText(label, bx, cy);
    };
    drawBlock(cx - rx, "MODEL", stage >= 1);
    drawBlock(cx + rx, "HARDWARE", executing);

    // packets around the ring; more of them, faster, while executing
    const packets = executing ? 8 : 3;
    for (let i = 0; i < packets; i++) {
      const speed = executing ? 0.5 : 0.22;
      const k = ((t * speed + i / packets) % 1) * Math.PI * 2;
      const x = cx + Math.cos(k) * rx;
      const y = cy + Math.sin(k) * ry;
      coreDot(ctx, x, y, 2.2, executing ? ACCENT : ACCENT_DEEP, (executing ? 0.95 : 0.5) * a);
    }

    // direction arrows on the ring
    ctx.fillStyle = rgba(INK, 0.25 * a);
    ctx.font = "10px ui-monospace, monospace";
    ctx.fillText("▸", cx, cy - ry);
    ctx.fillText("◂", cx, cy + ry);

    // the sequence
    const steps = ["load", "build", "execute", "stop", "reset"];
    const sy = h * 0.84;
    const gap = Math.min(w / 6, 74);
    const startX = cx - (gap * (steps.length - 1)) / 2;

    for (let i = 0; i < steps.length; i++) {
      const x = startX + gap * i;
      const done = i < stage;
      const on = i === stage;

      if (i < steps.length - 1) {
        const fill = done ? 1 : on ? local : 0;
        ctx.strokeStyle = rgba(INK, 0.12 * a);
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(x + 6, sy);
        ctx.lineTo(x + gap - 6, sy);
        ctx.stroke();
        if (fill > 0) {
          gradientLine(
            ctx,
            x + 6,
            sy,
            x + 6 + (gap - 12) * fill,
            sy,
            ACCENT,
            0.9 * a,
            0.5 * a,
            1.4,
          );
        }
      }

      coreDot(ctx, x, sy, on ? 4.2 : 3, on ? ACCENT : done ? ACCENT_DEEP : DEAD, (on ? 1 : done ? 0.6 : 0.5) * a);

      if (on) {
        ctx.font = "500 9px ui-monospace, monospace";
        ctx.textAlign = "center";
        ctx.fillStyle = rgba(ACCENT, 0.9 * a);
        ctx.fillText(steps[i].toUpperCase(), x, sy + 18);
      }
    }
  },
});

/* ------------------------------------------------------------------- rag --- */

/**
 * The résumé dissolving into vectors and reassembling as ranked matches. Three
 * bands: document lines on the left break apart, a column of numbers streams
 * through the middle, and result bars build on the right in score order.
 */
const rag = define<{
  lines: { y: number; w: number }[];
  digits: { x: number; y: number; v: number; seed: number }[];
  bars: { y: number; score: number }[];
}>({
  trail: 0.4,
  init: (w, h) => {
    const rand = mulberry32(4242);
    const lines: { y: number; w: number }[] = [];
    for (let i = 0; i < 9; i++) {
      lines.push({ y: h * (0.16 + i * 0.075), w: 0.5 + rand() * 0.5 });
    }
    const digits: { x: number; y: number; v: number; seed: number }[] = [];
    for (let i = 0; i < 46; i++) {
      digits.push({ x: rand(), y: rand() * h, v: Math.floor(rand() * 10), seed: rand() });
    }
    const bars = [0.95, 0.82, 0.68, 0.55, 0.4, 0.3].map((score, i) => ({
      y: h * (0.2 + i * 0.11),
      score,
    }));
    void w;
    return { lines, digits, bars };
  },
  draw: ({ ctx, w, h, t, progress, intro }, { lines, digits, bars }) => {
    const a = ease(intro);
    const clock = progress !== null ? progress * 6 : t * 0.5;
    const [, local] = phase(clock % 6, [6]);
    // one continuous left-to-right migration
    const flow = local;

    const docX = w * 0.08;
    const docW = w * 0.2;
    const midA = w * 0.38;
    const midB = w * 0.6;
    const barX = w * 0.7;
    const barW = w * 0.24;

    // document lines, dissolving from the top down
    lines.forEach((ln, i) => {
      const gone = clamp01((flow * 1.6 - i * 0.06) * 3);
      const width = docW * ln.w * (1 - gone);
      if (width <= 0.5) return;
      gradientLine(ctx, docX, ln.y, docX + width, ln.y, INK, 0.8 * a * (1 - gone), 0.18 * a, 2.4);
    });

    // the vector stream
    digits.forEach((d, i) => {
      const local2 = (flow * 1.4 + d.seed) % 1;
      const x = lerp(midA, midB, local2);
      const y = d.y + Math.sin(t * 0.8 + d.seed * 9) * 6;
      const fade = Math.sin(local2 * Math.PI);
      ctx.font = "10px ui-monospace, monospace";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillStyle = rgba(i % 5 === 0 ? ACCENT : INK, fade * 0.55 * a);
      ctx.fillText(String((d.v + Math.floor(t * 3 + i)) % 10), x, y);
    });

    // ranked bars, filling in score order
    bars.forEach((b, i) => {
      const appear = clamp01((flow - 0.35 - i * 0.07) * 5);
      if (appear <= 0) return;
      const len = barW * b.score * appear;
      const best = i === 0;
      ctx.fillStyle = rgba(best ? ACCENT : INK, (best ? 0.5 : 0.16) * a);
      ctx.fillRect(barX, b.y - 4, len, 8);
      if (best) glowDot(ctx, barX + len, b.y, 3, ACCENT, 0.7 * a);
    });

    // band labels
    ctx.font = "8px ui-monospace, monospace";
    ctx.textAlign = "left";
    ctx.fillStyle = rgba(INK, 0.24 * a);
    ctx.fillText("RÉSUMÉ", docX, h * 0.9);
    ctx.fillText("VECTORS", midA, h * 0.9);
    ctx.fillText("RANKED", barX, h * 0.9);
    void w;
  },
});

/* --------------------------------------------------------------- qsecure --- */

const GLYPHS = "01ABCDEF#$%&@?§¤";
const PLAIN = "MEETATSIXTHEKEYISSAFE";

/**
 * Two intercepted channels side by side. The left one keeps resolving into
 * legible text — that is the classical channel a future quantum adversary
 * reads. The right one never resolves. A sweep passes over both so the
 * difference is impossible to miss.
 */
const qsecure = define<{ cols: number; rows: number }>({
  init: (w, h) => ({
    cols: Math.max(10, Math.floor(w / 18)),
    rows: Math.max(6, Math.floor(h / 17)),
  }),
  draw: ({ ctx, w, h, t, intro }, { cols, rows }) => {
    const a = ease(intro);
    const cw = w / cols;
    const ch = h / rows;
    const split = Math.floor(cols / 2);
    const sweep = (t * 0.32) % 1;

    ctx.font = `${Math.min(12, ch * 0.66)}px ui-monospace, monospace`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    for (let c = 0; c < cols; c++) {
      const broken = c < split;
      const colX = c * cw + cw / 2;
      // how recently the sweep passed this column
      const rel = clamp01(1 - Math.abs(sweep - c / cols) * 7);

      for (let r = 0; r < rows; r++) {
        // stable per cell hash so the field does not boil every frame
        const hash = Math.sin(c * 12.9898 + r * 78.233) * 43758.5453;
        const frac = hash - Math.floor(hash);
        const step = Math.floor(t * (broken ? 3 : 11) + frac * 40);

        // on the broken channel the sweep leaves plaintext behind it
        const resolved = broken && (rel > 0.05 || (step * 0.37 + frac * 7) % 6 > 3);
        const glyph = resolved
          ? PLAIN[(c * 3 + r * 5 + Math.floor(frac * 7)) % PLAIN.length]
          : GLYPHS[Math.floor((step + frac * 14) % GLYPHS.length)];

        const alpha = resolved
          ? (0.5 + rel * 0.5) * 0.95
          : (broken ? 0.16 : 0.13) + rel * 0.22;

        ctx.fillStyle = rgba(resolved ? ACCENT_DEEP : INK, alpha * a);
        ctx.fillText(glyph, colX, r * ch + ch / 2);
      }
    }

    // the divider, and labels for what each side is
    ctx.strokeStyle = rgba(ACCENT, 0.4 * a);
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 5]);
    ctx.beginPath();
    ctx.moveTo(split * cw, 0);
    ctx.lineTo(split * cw, h);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.font = "8px ui-monospace, monospace";
    ctx.textAlign = "center";
    ctx.fillStyle = rgba(ACCENT_DEEP, 0.6 * a);
    ctx.fillText("RSA · READABLE", (split * cw) / 2, h - 8);
    ctx.fillStyle = rgba(ACCENT, 0.6 * a);
    ctx.fillText("QUANTUM SAFE · NOISE", split * cw + (w - split * cw) / 2, h - 8);
  },
});

export { hero, hils, rag, qsecure };
