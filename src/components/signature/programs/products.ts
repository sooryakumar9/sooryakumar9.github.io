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
import { define, labelPx, phase, roomForLabels, scaled } from "./shared";

/**
 * These programs render anywhere from a 380x160 card to a 1240x420 banner, so
 * nothing here may use a raw pixel value: every dimension comes off `unit`
 * (the short side) or a fraction of the box, and every count scales with area
 * between a floor and a ceiling.
 *
 * Text is the other trap. An 8px label is a smudge on a card and clip art on a
 * banner, so labels only appear above `LABEL_MIN` and are sized proportionally.
 */
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
 * Why the second factor exists.
 *
 * A transfer is attempted with the password alone: the field fills, both keys
 * are checked, and because only one of them is satisfied the gate holds — the
 * transfer bar drives partway across and is thrown back. Then the face
 * resolves beside it, both keys go green, and the same transfer completes
 * without resistance.
 *
 * It is the argument the project makes, animated: a stolen password is not
 * enough. The refusal followed by the acceptance is also what makes it worth
 * watching rather than a status light changing colour.
 */
const banking = define<{ face: Pt[] }>({
  trail: 0.45,
  init: (w, h) => {
    // A head silhouette in unit space. Random radii around a circle produce a
    // spiky star rather than anything face shaped, so the outline is an
    // explicit oval that narrows toward the chin.
    const face: Pt[] = [];
    const N = 44;
    for (let i = 0; i < N; i++) {
      const ang = (i / N) * Math.PI * 2 - Math.PI / 2;
      const c = Math.cos(ang);
      const sn = Math.sin(ang);
      // taper the lower half so the jaw comes to a chin
      const taper = sn > 0 ? 1 - 0.3 * Math.pow(sn, 2) : 1;
      face.push({ x: c * 0.66 * taper, y: sn * (sn > 0 ? 0.95 : 0.86) });
    }
    void w;
    void h;
    return { face };
  },
  draw: ({ ctx, w, h, t, intro }, { face }) => {
    const a = ease(intro);
    const unit = Math.min(w, h);

    // refused attempt, then accepted attempt, then a beat before repeating
    const [stage, local] = phase(t, [1.1, 1.3, 0.9, 1.1, 1.5, 1.1]);
    // 0 fill password  1 gate holds, bar bounces  2 pause
    // 3 face resolves  4 both green, transfer clears  5 rest
    const refusing = stage <= 2;
    const faceOn = stage >= 3;
    const bothGreen = stage >= 4;

    const keyW = w * 0.34;
    const keyH = Math.max(10, unit * 0.13);
    const keyY = h * 0.14;
    const leftX = w * 0.08;
    const rightX = w - w * 0.08 - keyW;

    // ---- key one: the password, always satisfied ----
    const pwFill = stage === 0 ? ease(local) : 1;
    ctx.fillStyle = rgba(INK, 0.07 * a);
    ctx.fillRect(leftX, keyY, keyW, keyH);
    ctx.fillStyle = rgba(ACCENT, 0.55 * a);
    ctx.fillRect(leftX, keyY, keyW * pwFill, keyH);
    // password dots, so the field reads as a credential rather than a bar
    {
      const dots = 9;
      const r = keyH * 0.16;
      for (let i = 0; i < dots; i++) {
        const dx = leftX + keyW * ((i + 0.5) / dots);
        const shown = pwFill > (i + 0.4) / dots;
        ctx.fillStyle = rgba(shown ? INK : INK, (shown ? 0.85 : 0.12) * a);
        ctx.beginPath();
        ctx.arc(dx, keyY + keyH / 2, r, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // ---- key two: the face, only satisfied on the second attempt ----
    const faceFill = bothGreen ? 1 : faceOn ? ease(local) : 0;
    ctx.fillStyle = rgba(INK, 0.07 * a);
    ctx.fillRect(rightX, keyY, keyW, keyH);
    if (faceFill > 0) {
      ctx.fillStyle = rgba(ACCENT, 0.55 * a);
      ctx.fillRect(rightX, keyY, keyW * faceFill, keyH);
    }

    // the face lattice sits under key two. Its outline is always drawn so the
    // right half of the frame is never empty; only the fill resolves.
    const fcx = rightX + keyW / 2;
    const fcy = h * 0.55;
    const fr = unit * 0.26;
    {
      const trace = (upto: number) => {
        ctx.beginPath();
        for (let i = 0; i < upto; i++) {
          const pt = face[i];
          const x = fcx + pt.x * fr;
          const y = fcy + pt.y * fr;
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        if (upto === face.length) ctx.closePath();
      };

      // the unresolved outline
      trace(face.length);
      ctx.strokeStyle = rgba(INK, 0.14 * a);
      ctx.lineWidth = Math.max(1, unit * 0.005);
      ctx.stroke();

      if (faceFill > 0.01) {
        trace(Math.max(2, Math.floor(faceFill * face.length)));
        ctx.strokeStyle = rgba(ACCENT, 0.85 * a);
        ctx.lineWidth = Math.max(1.4, unit * 0.009);
        ctx.stroke();
        if (bothGreen) {
          trace(face.length);
          ctx.fillStyle = rgba(ACCENT, 0.1 * a);
          ctx.fill();
        }
      }

      // features, so the silhouette reads as a face rather than an oval. They
      // arrive with the second half of the scan.
      const feat = clamp01((faceFill - 0.45) / 0.55);
      if (feat > 0.01) {
        ctx.fillStyle = rgba(ACCENT, 0.8 * a * feat);
        const eyeR = fr * 0.07;
        for (const sx of [-1, 1]) {
          ctx.beginPath();
          ctx.ellipse(fcx + sx * fr * 0.28, fcy - fr * 0.2, eyeR * 1.5, eyeR, 0, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.strokeStyle = rgba(ACCENT, 0.65 * a * feat);
        ctx.lineWidth = Math.max(1.2, unit * 0.007);
        ctx.beginPath();
        ctx.moveTo(fcx - fr * 0.2, fcy + fr * 0.36);
        ctx.quadraticCurveTo(fcx, fcy + fr * 0.46, fcx + fr * 0.2, fcy + fr * 0.36);
        ctx.stroke();
      }
    }

    // ---- the transfer ----
    const gateX = w * 0.08;
    const gateW = w * 0.84;
    const barH = Math.max(10, unit * 0.13);
    const trackY = h * 0.87;
    ctx.fillStyle = rgba(INK, 0.07 * a);
    ctx.fillRect(gateX, trackY - barH / 2, gateW, barH);

    let travel = 0;
    let thrown = false;
    if (stage === 1) {
      // out and back: the transfer is refused
      const k = local;
      travel = k < 0.45 ? ease(k / 0.45) * 0.46 : 0.46 * (1 - ease((k - 0.45) / 0.55));
      thrown = k >= 0.45;
    } else if (stage === 4) {
      travel = ease(local);
    } else if (stage === 5) {
      travel = 1;
    }

    if (travel > 0.001) {
      const colour = thrown ? AMBER : ACCENT;
      const g = ctx.createLinearGradient(gateX, 0, gateX + gateW * travel, 0);
      g.addColorStop(0, rgba(colour, 0.35 * a));
      g.addColorStop(1, rgba(colour, 0.95 * a));
      ctx.fillStyle = g;
      ctx.fillRect(gateX, trackY - barH / 2, gateW * travel, barH);
    }

    // the barrier: solid while the second key is missing, gone once it is not.
    // It is kept inside the track height so it never clips at the canvas edge.
    if (!bothGreen) {
      const bars = 5;
      const bw = Math.max(2, unit * 0.013);
      const span = bw * 2.1 * bars;
      const barrierX = gateX + gateW * 0.5 - span / 2;
      for (let i = 0; i < bars; i++) {
        ctx.fillStyle = rgba(refusing && thrown ? AMBER : INK, (thrown ? 0.9 : 0.32) * a);
        ctx.fillRect(barrierX + i * bw * 2.1, trackY - barH * 0.8, bw, barH * 1.6);
      }
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

const MACROS = [0.42, 0.3, 0.18, 0.1];

/**
 * A dish opening into what it is made of.
 *
 * A solid cell expands into a filled ring split by macro proportion, with the
 * same split repeated as stacked bars beneath it so the numbers read two ways.
 * It holds long enough to take in, closes, and the next dish takes its place.
 *
 * Filled arcs and blocks rather than the thin orbit lines this replaced: at a
 * card size a hairline ring is barely visible, whereas a weighted ring still
 * reads.
 */
const diavo = define<{ dishes: number[][]; corpus: { x: number; y: number; r: number }[] }>({
  trail: 0.22,
  init: (w, h) => {
    const rand = mulberry32(870);
    const unit = Math.min(w, h);
    const corpus: { x: number; y: number; r: number }[] = [];
    for (let i = 0; i < scaled(w, h, 30, 110, 2200); i++) {
      corpus.push({ x: rand() * w, y: rand() * h, r: unit * (0.003 + rand() * 0.004) });
    }
    // four dishes, each a normalised macro split
    const dishes: number[][] = [];
    for (let d = 0; d < 4; d++) {
      const raw = MACROS.map((m) => m * (0.55 + rand() * 0.9));
      const total = raw.reduce((s, x) => s + x, 0);
      dishes.push(raw.map((x) => x / total));
    }
    return { dishes, corpus };
  },
  draw: ({ ctx, w, h, t, intro }, { dishes, corpus }) => {
    const a = ease(intro);
    const unit = Math.min(w, h);
    const CYCLE = 4.6;
    const which = Math.floor(t / CYCLE) % dishes.length;
    const [stage, local] = phase(t % CYCLE, [0.9, 2.4, 1.3]);
    const open = stage === 0 ? ease(local) : stage === 1 ? 1 : 1 - ease(local);
    const vals = dishes[which];

    // the wider corpus, faint behind
    for (const c of corpus) {
      ctx.fillStyle = rgba(INK, 0.07 * a);
      ctx.fillRect(c.x, c.y, c.r * 2, c.r * 2);
    }

    const cx = w / 2;
    const cy = h * 0.44;
    const rOuter = unit * 0.3 * (0.35 + open * 0.65);
    const rInner = rOuter * 0.52;

    // the ring, split by proportion — filled wedges, not strokes
    let angle = -Math.PI / 2;
    for (let i = 0; i < vals.length; i++) {
      const sweep = vals[i] * Math.PI * 2 * open;
      const shade = 1 - i / vals.length;
      ctx.beginPath();
      ctx.arc(cx, cy, rOuter, angle, angle + sweep);
      ctx.arc(cx, cy, rInner, angle + sweep, angle, true);
      ctx.closePath();
      ctx.fillStyle = rgba(i === 0 ? ACCENT : i === 1 ? ACCENT_DEEP : INK, (0.18 + shade * 0.55) * a);
      ctx.fill();
      angle += sweep;
    }

    // the same split again as stacked bars, which reads better on a wide box
    const barY = h * 0.86;
    const barH = Math.max(6, unit * 0.07);
    const barW = w * 0.72 * open;
    let x = cx - barW / 2;
    for (let i = 0; i < vals.length; i++) {
      const seg = barW * vals[i];
      const shade = 1 - i / vals.length;
      ctx.fillStyle = rgba(i === 0 ? ACCENT : i === 1 ? ACCENT_DEEP : INK, (0.18 + shade * 0.55) * a);
      ctx.fillRect(x, barY - barH / 2, Math.max(0, seg - unit * 0.006), barH);
      x += seg;
    }

    // the dish itself at the centre of the ring
    coreDot(ctx, cx, cy, unit * 0.035 * (1 - open * 0.35), ACCENT, 0.9 * a);
    glowDot(ctx, cx, cy, unit * 0.09, ACCENT, 0.25 * a);
  },
});

export { qsecure, banking, blocker, madhumarga, zenpro, diavo };
