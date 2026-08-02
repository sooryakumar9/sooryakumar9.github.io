import {
  ACCENT,
  ACCENT_DEEP,
  AMBER,
  INK,
  clamp01,
  coreDot,
  ease,
  glowDot,
  gradientLine,
  lerp,
  mulberry32,
  rgba,
} from "../types";
import { define, phase } from "./shared";

/**
 * These programs render anywhere from a 380x160 card to a 1240x420 banner, so
 * nothing here may use a raw pixel value: every dimension comes off `unit`
 * (the short side) or a fraction of the box, and every count scales with area
 * between a floor and a ceiling.
 *
 * Text is the other trap. An 8px label is a smudge on a card and clip art on a
 * banner, so labels only appear above `LABEL_MIN` and are sized proportionally.
 */
// A card is 380x160. At that height a label lands at 8px, which is the smudge
// this threshold exists to prevent, so labels start above it — panels and
// banners get them, cards do not.
const LABEL_MIN_W = 300;
const LABEL_MIN_H = 210;

/** Count that grows with canvas area, clamped at both ends. */
function scaled(w: number, h: number, min: number, max: number, per = 26000): number {
  return Math.round(Math.max(min, Math.min(max, (w * h) / per)));
}

/** True when the canvas is big enough that a label reads as intentional. */
function roomForLabels(w: number, h: number): boolean {
  return w >= LABEL_MIN_W && h >= LABEL_MIN_H;
}

/** Label size proportional to the box, so it never becomes a smudge. */
function labelPx(w: number, h: number): number {
  return Math.max(10, Math.min(14, Math.min(w, h) * 0.036));
}

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
  init: (w, h) => {
    // glyph cell scales with the box rather than being a fixed pixel grid
    const cell = Math.max(11, Math.min(w, h) * 0.055);
    return {
      cols: Math.max(10, Math.round(w / cell)),
      rows: Math.max(5, Math.round(h / (cell * 0.95))),
    };
  },
  draw: ({ ctx, w, h, t, intro }, { cols, rows }) => {
    const a = ease(intro);
    const cw = w / cols;
    const ch = h / rows;
    const split = Math.floor(cols / 2);
    const sweep = (t * 0.32) % 1;

    ctx.font = `${Math.max(8, ch * 0.66).toFixed(1)}px ui-monospace, monospace`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    for (let c = 0; c < cols; c++) {
      const broken = c < split;
      const colX = c * cw + cw / 2;
      const rel = clamp01(1 - Math.abs(sweep - c / cols) * 7);

      for (let r = 0; r < rows; r++) {
        // stable per cell hash so the field does not boil every frame
        const hash = Math.sin(c * 12.9898 + r * 78.233) * 43758.5453;
        const frac = hash - Math.floor(hash);
        const step = Math.floor(t * (broken ? 3 : 11) + frac * 40);

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

    ctx.strokeStyle = rgba(ACCENT, 0.4 * a);
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 5]);
    ctx.beginPath();
    ctx.moveTo(split * cw, 0);
    ctx.lineTo(split * cw, h);
    ctx.stroke();
    ctx.setLineDash([]);

    if (roomForLabels(w, h)) {
      ctx.font = `500 ${labelPx(w, h).toFixed(1)}px ui-monospace, monospace`;
      ctx.fillStyle = rgba(ACCENT_DEEP, 0.6 * a);
      ctx.fillText("RSA", (split * cw) / 2, h - labelPx(w, h));
      ctx.fillStyle = rgba(ACCENT, 0.6 * a);
      ctx.fillText("QUANTUM SAFE", split * cw + (w - split * cw) / 2, h - labelPx(w, h));
    }
  },
});

/* --------------------------------------------------------------- banking --- */

type Pt = { x: number; y: number };

/**
 * A dense face landmark mesh resolving under a biometric scan.
 *
 * The topology is generated rather than hand listed: a jaw contour, brow and
 * eye rings, a nose ridge and a mouth ring, then local triangulation by
 * nearest neighbours. That gives roughly seventy points and a few hundred
 * edges, which is what makes it read as a real capture mesh instead of a stick
 * figure.
 */
const banking = define<{ pts: Pt[]; edges: [number, number][]; order: number[] }>({
  trail: 0.42,
  init: (w, h) => {
    const cx = w / 2;
    const cy = h * 0.46;
    const R = Math.min(w * 0.3, h * 0.33);
    const pts: Pt[] = [];
    const push = (x: number, y: number) => pts.push({ x: cx + x * R, y: cy + y * R });

    const CONTOUR = 26;
    for (let i = 0; i < CONTOUR; i++) {
      const ang = (i / CONTOUR) * Math.PI * 2 - Math.PI / 2;
      const ry = Math.sin(ang) > 0 ? 1.06 : 0.92;
      push(Math.cos(ang) * 0.78, Math.sin(ang) * ry);
    }
    for (const s of [-1, 1]) {
      for (let i = 0; i < 5; i++) {
        const k = i / 4;
        push(s * (0.2 + k * 0.34), -0.42 - Math.sin(k * Math.PI) * 0.07);
      }
    }
    for (const s of [-1, 1]) {
      for (let i = 0; i < 8; i++) {
        const ang = (i / 8) * Math.PI * 2;
        push(s * 0.36 + Math.cos(ang) * 0.15, -0.22 + Math.sin(ang) * 0.08);
      }
    }
    for (let i = 0; i < 5; i++) push(0, -0.34 + (i / 4) * 0.44);
    for (let i = -2; i <= 2; i++) push(i * 0.07, 0.14);
    for (let i = 0; i < 10; i++) {
      const ang = (i / 10) * Math.PI * 2;
      push(Math.cos(ang) * 0.24, 0.38 + Math.sin(ang) * 0.1);
    }
    for (const s of [-1, 1]) {
      push(s * 0.52, 0.02);
      push(s * 0.46, 0.26);
      push(s * 0.3, 0.12);
    }

    const edges: [number, number][] = [];
    const seen = new Set<string>();
    for (let i = 0; i < pts.length; i++) {
      const near = pts
        .map((p, j) => ({ j, d: Math.hypot(p.x - pts[i].x, p.y - pts[i].y) }))
        .filter((o) => o.j !== i)
        .sort((p, q) => p.d - q.d)
        .slice(0, 4);
      for (const o of near) {
        const key = i < o.j ? `${i}-${o.j}` : `${o.j}-${i}`;
        if (seen.has(key)) continue;
        seen.add(key);
        edges.push([i, o.j]);
      }
    }

    const order = pts.map((_, i) => i).sort((p, q) => pts[p].y - pts[q].y);
    return { pts, edges, order };
  },
  draw: ({ ctx, w, h, t, intro }, { pts, edges, order }) => {
    const a = ease(intro);
    const unit = Math.min(w, h);
    const [stage, local] = phase(t, [3, 1.4, 1.6, 1]);
    const scanning = stage === 0;
    const locked = stage >= 1;

    const top = h * 0.1;
    const bottom = h * 0.82;
    const scanY = lerp(top, bottom, scanning ? local : 1);
    // the flare band scales with the box so it is not a 70px constant
    const flare = unit * 0.22;

    const resolved = scanning ? local : 1;
    const live = new Set(order.slice(0, Math.floor(resolved * order.length)));

    for (const [p, q] of edges) {
      if (!live.has(p) || !live.has(q)) continue;
      const midY = (pts[p].y + pts[q].y) / 2;
      const heat = scanning ? clamp01(1 - Math.abs(scanY - midY) / flare) : 0;
      const base = locked ? 0.55 : 0.34;
      gradientLine(
        ctx,
        pts[p].x,
        pts[p].y,
        pts[q].x,
        pts[q].y,
        heat > 0.02 || locked ? ACCENT : INK,
        (base + heat * 0.6) * a,
        (base * 0.6 + heat * 0.4) * a,
        unit * (heat > 0.4 ? 0.0042 : 0.0026),
      );
    }

    for (const i of live) {
      const p = pts[i];
      const heat = scanning ? clamp01(1 - Math.abs(scanY - p.y) / (flare * 0.8)) : 0;
      coreDot(
        ctx,
        p.x,
        p.y,
        unit * (0.005 + heat * 0.006),
        heat > 0.02 || locked ? ACCENT : INK,
        (0.6 + heat * 0.4) * a,
      );
    }

    if (scanning) {
      for (let k = 0; k < 3; k++) {
        const y = scanY - k * unit * 0.05;
        if (y < top) continue;
        gradientLine(ctx, w * 0.08, y, w * 0.92, y, ACCENT, 0, (0.55 - k * 0.16) * a, 1);
        gradientLine(ctx, w * 0.92, y, w * 0.08, y, ACCENT, 0, (0.55 - k * 0.16) * a, 1);
      }
    }

    const barY = h * 0.93;
    ctx.strokeStyle = rgba(INK, 0.12 * a);
    ctx.lineWidth = Math.max(1.5, unit * 0.006);
    ctx.beginPath();
    ctx.moveTo(w * 0.08, barY);
    ctx.lineTo(w * 0.92, barY);
    ctx.stroke();

    if (stage >= 2) {
      const fill = stage === 2 ? local : 1;
      gradientLine(
        ctx,
        w * 0.08,
        barY,
        w * 0.08 + w * 0.84 * fill,
        barY,
        ACCENT,
        0.9 * a,
        0.6 * a,
        Math.max(1.5, unit * 0.006),
      );
    }

    if (roomForLabels(w, h)) {
      const fs = labelPx(w, h);
      ctx.font = `500 ${fs.toFixed(1)}px ui-monospace, monospace`;
      ctx.textAlign = "left";
      ctx.textBaseline = "middle";
      ctx.fillStyle = rgba(scanning ? INK : ACCENT, 0.7 * a);
      ctx.fillText(
        scanning ? "SCANNING" : stage === 1 ? "FACE MATCHED" : "AUTHORISED",
        w * 0.08,
        h * 0.07,
      );
    }
  },
});

/* --------------------------------------------------------------- blocker --- */

type Brick = { x: number; y: number; w: number; h: number; order: number };
type Packet = { y: number; speed: number; seed: number; pass: boolean };

/**
 * The firewall assembling. Bricks build the wall in a scattered order, request
 * packets stream in from the left and burst against it, and a narrow gate lets
 * the whitelisted few through. Then the wall drops and it starts again.
 */
const blocker = define<{ bricks: Brick[]; packets: Packet[]; gateY: number }>({
  trail: 0.5,
  init: (w, h) => {
    const rand = mulberry32(2211);
    const cols = 6;
    // row height follows the box instead of a fixed 26px
    const rows = Math.max(5, Math.round(h / Math.max(18, Math.min(w, h) * 0.11)));
    const wallX = w * 0.44;
    const wallW = w * 0.26;
    const bw = wallW / cols;
    const bh = h / rows;
    const gateRow = Math.floor(rows / 2);

    const bricks: Brick[] = [];
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (r === gateRow && c >= 2 && c <= 3) continue;
        bricks.push({
          x: wallX + c * bw,
          y: r * bh,
          w: bw - bw * 0.1,
          h: bh - bh * 0.12,
          order: rand(),
        });
      }
    }
    bricks.sort((p, q) => p.order - q.order);

    const packets: Packet[] = [];
    const n = scaled(w, h, 10, 22, 9000);
    for (let i = 0; i < n; i++) {
      const pass = i % 6 === 0;
      packets.push({
        y: pass ? gateRow * bh + bh / 2 : rand() * h,
        speed: 0.18 + rand() * 0.22,
        seed: rand(),
        pass,
      });
    }
    return { bricks, packets, gateY: gateRow * bh + bh / 2 };
  },
  draw: ({ ctx, w, h, t, intro }, { bricks, packets }) => {
    const a = ease(intro);
    const unit = Math.min(w, h);
    const [stage, local] = phase(t, [2.4, 3.6, 1, 1]);
    const built = stage === 0 ? local : stage === 1 ? 1 : stage === 2 ? 1 - local : 0;
    const shown = Math.floor(built * bricks.length);
    const wallX = bricks.length ? Math.min(...bricks.map((b) => b.x)) : w * 0.44;
    const wallR = bricks.length ? Math.max(...bricks.map((b) => b.x + b.w)) : w * 0.7;

    for (let i = 0; i < shown; i++) {
      const b = bricks[i];
      const fresh = clamp01(1 - (shown - i) / 6);
      ctx.fillStyle = rgba(fresh > 0.05 ? ACCENT : INK, (0.06 + fresh * 0.3) * a);
      ctx.fillRect(b.x, b.y, b.w, b.h);
      ctx.strokeStyle = rgba(fresh > 0.05 ? ACCENT : INK, (0.16 + fresh * 0.6) * a);
      ctx.lineWidth = 1;
      ctx.strokeRect(b.x, b.y, b.w, b.h);
    }

    const burstR = unit * 0.1;
    const trailLen = unit * 0.14;

    for (const p of packets) {
      const k = (t * p.speed + p.seed) % 1;
      const x = k * w;
      const blocked = built > 0.25 && !p.pass;

      if (blocked && x >= wallX - 4) {
        const burst = clamp01((x - (wallX - 4)) / (unit * 0.16));
        if (burst < 1) {
          for (let i = 0; i < 7; i++) {
            const ang = (i / 7) * Math.PI * 2;
            const rr = burst * burstR;
            gradientLine(
              ctx,
              wallX - 4,
              p.y,
              wallX - 4 + Math.cos(ang) * rr,
              p.y + Math.sin(ang) * rr,
              AMBER,
              0.7 * (1 - burst) * a,
              0,
              1,
            );
          }
        }
        continue;
      }

      const through = p.pass && x > wallR;
      coreDot(ctx, x, p.y, unit * 0.011, through ? ACCENT : p.pass ? ACCENT_DEEP : INK, 0.7 * a);
      gradientLine(ctx, x - trailLen, p.y, x, p.y, p.pass ? ACCENT_DEEP : INK, 0, 0.35 * a, 1);
    }
  },
});

/* ------------------------------------------------------------ madhumarga --- */

type Cell = { x: number; y: number };

/**
 * The Hive Doctor's reasoning made visible. Cells fill with inspection data, a
 * rule cascade propagates outward cell by cell, one cell trips, and then the
 * path lights backwards to the rule that fired.
 *
 * That last beat is the point: the engine is explicit rules, not a model, so
 * every conclusion can be traced. The animation shows the trace.
 */
const madhumarga = define<{ cells: Cell[]; r: number; origin: number; flagged: number }>({
  trail: 0.45,
  init: (w, h) => {
    const r = Math.max(10, Math.min(w, h) / 7.5);
    const dx = r * 1.74;
    const dy = r * 1.5;
    const rand = mulberry32(1608);
    const cells: Cell[] = [];
    for (let row = 0; row * dy < h + r; row++) {
      for (let col = 0; col * dx < w + r; col++) {
        cells.push({ x: col * dx + (row % 2 ? dx / 2 : 0), y: row * dy + r * 0.5 });
      }
    }
    const origin = Math.floor(rand() * cells.length);
    let flagged = origin;
    let best = -1;
    cells.forEach((c, i) => {
      const d = Math.hypot(c.x - cells[origin].x, c.y - cells[origin].y);
      if (d > best && d < Math.min(w, h) * 0.7) {
        best = d;
        flagged = i;
      }
    });
    return { cells, r, origin, flagged };
  },
  draw: ({ ctx, w, h, t, intro }, { cells, r, origin, flagged }) => {
    const a = ease(intro);
    const [stage, local] = phase(t, [2, 2.4, 1.6, 2]);
    const src = cells[origin];
    const tgt = cells[flagged];
    const maxD = Math.hypot(w, h);
    const wave = local * maxD * 1.1;
    const front = r * 0.9;

    const hex = (c: Cell, fill: string, stroke: string, lw: number) => {
      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const ang = (Math.PI / 3) * i - Math.PI / 6;
        const x = c.x + Math.cos(ang) * r * 0.86;
        const y = c.y + Math.sin(ang) * r * 0.86;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.fillStyle = fill;
      ctx.fill();
      ctx.strokeStyle = stroke;
      ctx.lineWidth = lw;
      ctx.stroke();
    };

    for (const c of cells) {
      const d = Math.hypot(c.x - src.x, c.y - src.y);
      const filled = stage === 0 ? clamp01(local * 2 - d / maxD) : 1;
      const heat = stage === 1 ? clamp01(1 - Math.abs(wave - d) / front) : 0;
      hex(
        c,
        rgba(heat > 0.05 ? ACCENT : AMBER, (0.03 + filled * 0.05 + heat * 0.28) * a),
        rgba(heat > 0.05 ? ACCENT : INK, (0.1 + filled * 0.1 + heat * 0.8) * a),
        heat > 0.3 ? 1.5 : 1,
      );
    }

    if (stage >= 2) {
      const pulse = 0.6 + 0.4 * Math.sin(t * 5);
      hex(tgt, rgba(AMBER, 0.4 * a * pulse), rgba(AMBER, 0.95 * a), 1.8);
      glowDot(ctx, tgt.x, tgt.y, r * 0.5, AMBER, 0.5 * a * pulse);
    }

    if (stage === 3) {
      const p = ease(clamp01(local * 1.6));
      gradientLine(
        ctx,
        tgt.x,
        tgt.y,
        lerp(tgt.x, src.x, p),
        lerp(tgt.y, src.y, p),
        ACCENT,
        0.95 * a,
        0.3 * a,
        1.8,
      );
      coreDot(ctx, lerp(tgt.x, src.x, p), lerp(tgt.y, src.y, p), r * 0.16, ACCENT, a);
    }
  },
});

/* ---------------------------------------------------------------- zenpro --- */

type Lane = { y: number; speed: number; seed: number; keep: boolean };

/**
 * Twelve overnight feeds becoming one morning brief, while the sky behind goes
 * from night to dawn. Items stream in from the left, a ranking gate dims most
 * of them and brightens the few that matter, and the survivors fold into a
 * single luminous line.
 */
const zenpro = define<{ lanes: Lane[] }>({
  trail: 0.55,
  init: (w, h) => {
    const rand = mulberry32(505);
    const n = Math.max(6, Math.min(12, Math.round(h / Math.max(12, Math.min(w, h) * 0.075))));
    const lanes: Lane[] = [];
    for (let i = 0; i < n; i++) {
      lanes.push({
        y: h * (0.08 + (i / (n - 1)) * 0.84),
        speed: 0.12 + (i % 5) * 0.03,
        seed: rand(),
        keep: i % 4 === 1,
      });
    }
    return { lanes };
  },
  draw: ({ ctx, w, h, t, intro }, { lanes }) => {
    const a = ease(intro);
    const unit = Math.min(w, h);
    // dawn now runs on its own slow cycle rather than on scroll
    const dawn = 0.5 + 0.5 * Math.sin(t * 0.18);

    const horizon = h * (1 - dawn * 0.85);
    const sky = ctx.createLinearGradient(0, horizon, 0, h);
    sky.addColorStop(0, rgba(ACCENT_DEEP, 0));
    sky.addColorStop(0.55, rgba(ACCENT_DEEP, 0.1 * dawn * a));
    sky.addColorStop(1, rgba(AMBER, 0.16 * dawn * a));
    ctx.fillStyle = sky;
    ctx.fillRect(0, horizon, w, h - horizon);

    const gateX = w * 0.52;
    const outY = h * 0.5;
    const briefX = w * 0.74;

    gradientLine(ctx, gateX, h * 0.1, gateX, h * 0.9, INK, 0.04 * a, 0.16 * a, 1);

    for (const lane of lanes) {
      gradientLine(ctx, 0, lane.y, gateX, lane.y, INK, 0.03 * a, 0.1 * a, 1);

      for (let k = 0; k < 2; k++) {
        const p = (t * lane.speed + lane.seed + k * 0.5) % 1;

        if (p < 0.52) {
          const x = (p / 0.52) * gateX;
          coreDot(ctx, x, lane.y, unit * 0.009, INK, 0.4 * a);
          gradientLine(ctx, x - unit * 0.1, lane.y, x, lane.y, INK, 0, 0.25 * a, 1);
        } else if (!lane.keep) {
          const k2 = (p - 0.52) / 0.48;
          coreDot(
            ctx,
            gateX + k2 * unit * 0.22,
            lane.y + k2 * unit * 0.14,
            unit * 0.008,
            INK,
            0.22 * (1 - k2) * a,
          );
        } else {
          const k2 = (p - 0.52) / 0.48;
          const x = lerp(gateX, briefX, k2);
          const y = lerp(lane.y, outY, ease(k2));
          coreDot(ctx, x, y, unit * 0.011, ACCENT, 0.9 * a);
          gradientLine(ctx, gateX, lane.y, x, y, ACCENT, 0, 0.3 * a, 1);
        }
      }
    }

    gradientLine(
      ctx,
      briefX,
      outY,
      w * 0.96,
      outY,
      ACCENT,
      0.95 * a,
      0.35 * a,
      Math.max(1.6, unit * 0.008),
    );
    glowDot(ctx, briefX, outY, unit * 0.022, ACCENT, 0.8 * a);
  },
});

/* ----------------------------------------------------------------- diavo --- */

/**
 * One dish opening into what it is actually made of. A node expands into an
 * orbiting ring of nutrient nodes sized by proportion, holds long enough to
 * read, collapses, and the next dish takes its place — against a faint field
 * of the wider corpus.
 */
const diavo = define<{
  corpus: { x: number; y: number; r: number }[];
  dishes: number[][];
}>({
  trail: 0.5,
  init: (w, h) => {
    const rand = mulberry32(870);
    const corpus: { x: number; y: number; r: number }[] = [];
    const count = scaled(w, h, 40, 150, 1400);
    const unit = Math.min(w, h);
    for (let i = 0; i < count; i++) {
      corpus.push({ x: rand() * w, y: rand() * h, r: unit * (0.003 + rand() * 0.004) });
    }
    const dishes: number[][] = [];
    for (let d = 0; d < 4; d++) dishes.push(Array.from({ length: 7 }, () => 0.25 + rand() * 0.75));
    return { corpus, dishes };
  },
  draw: ({ ctx, w, h, t, intro }, { corpus, dishes }) => {
    const a = ease(intro);
    const unit = Math.min(w, h);
    const cycle = 4.5;
    const which = Math.floor(t / cycle) % dishes.length;
    const [stage, local] = phase(t % cycle, [1, 2.2, 1.3]);
    const open = stage === 0 ? ease(local) : stage === 1 ? 1 : 1 - ease(local);

    for (const c of corpus) {
      const tw = 0.5 + 0.5 * Math.sin(t * 0.6 + c.x * 0.02);
      ctx.fillStyle = rgba(INK, 0.09 * tw * a);
      ctx.beginPath();
      ctx.arc(c.x, c.y, c.r, 0, Math.PI * 2);
      ctx.fill();
    }

    const cx = w / 2;
    const cy = h * 0.48;
    const R = Math.min(w * 0.3, h * 0.32);
    const vals = dishes[which];

    for (let i = 0; i < vals.length; i++) {
      const ang = (i / vals.length) * Math.PI * 2 - Math.PI / 2 + t * 0.16;
      const dist = R * open * (0.62 + vals[i] * 0.38);
      const x = cx + Math.cos(ang) * dist;
      const y = cy + Math.sin(ang) * dist * 0.86;
      const size = unit * (0.008 + vals[i] * 0.016);

      gradientLine(ctx, cx, cy, x, y, ACCENT, 0.05 * a * open, 0.4 * a * open, 1);
      coreDot(ctx, x, y, size * open, i % 3 === 0 ? ACCENT_DEEP : ACCENT, 0.85 * a * open);
    }

    coreDot(ctx, cx, cy, unit * (0.024 + (1 - open) * 0.014), ACCENT, 0.95 * a);
    glowDot(ctx, cx, cy, unit * 0.058, ACCENT, 0.3 * a);
  },
});

export { qsecure, banking, blocker, madhumarga, zenpro, diavo };
