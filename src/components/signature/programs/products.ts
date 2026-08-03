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
import { define, label, labelPx, panel, phase, roomForLabels, scaled } from "./shared";

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
 * The transfer screen, running the flow the project exists to demonstrate.
 *
 * A balance, a transfer being composed, a confirm. The password alone leaves
 * the transfer **pending**; a face verification panel slides in and resolves;
 * the transfer clears, drops into the ledger, and the balance ticks down.
 *
 * The argument is the same one the earlier version made — a password on its
 * own does not move money — but drawn as software rather than as three bars,
 * which is the language that worked for the HILS panel and the analyser.
 */
const banking = define<{ face: Pt[]; rows: number[] }>({
  init: (w, h) => {
    // a head silhouette in unit space for the verification thumbnail
    const face: Pt[] = [];
    const N = 30;
    for (let i = 0; i < N; i++) {
      const ang = (i / N) * Math.PI * 2 - Math.PI / 2;
      const c = Math.cos(ang);
      const sn = Math.sin(ang);
      const taper = sn > 0 ? 1 - 0.3 * sn * sn : 1;
      face.push({ x: c * 0.62 * taper, y: sn * (sn > 0 ? 0.94 : 0.84) });
    }
    const rand = mulberry32(41);
    void w;
    void h;
    return { face, rows: Array.from({ length: 3 }, () => 0.4 + rand() * 0.4) };
  },
  draw: ({ ctx, w, h, t, intro }, { face, rows }) => {
    const a = ease(intro);
    const unit = Math.min(w, h);
    const big = roomForLabels(w, h);
    const pad = w * 0.04;

    // compose -> confirm -> pending -> verifying -> cleared -> hold
    const [stage, local] = phase(t, [1.4, 0.8, 1.0, 1.6, 1.2, 1.6]);
    const confirmed = stage >= 1;
    const pending = stage === 2;
    const verifying = stage === 3;
    const cleared = stage >= 4;

    const innerW = w - pad * 2;
    const innerH = h - pad * 2;

    /* ---- the window ---- */
    panel(ctx, pad, pad, innerW, innerH, unit * 0.05);
    ctx.strokeStyle = rgba(INK, 0.14 * a);
    ctx.lineWidth = 1;
    ctx.stroke();

    /* ---- balance, top left ---- */
    const balY = pad + innerH * 0.11;
    label(ctx, "BALANCE", pad + innerW * 0.05, balY - unit * 0.055, w, h, rgba(INK, 0.35 * a));
    {
      // the figure ticks down once the transfer clears; the bar stands in for
      // it below the label threshold
      const drop = cleared ? 0.12 : 0;
      const barW = innerW * 0.28 * (1 - drop);
      ctx.fillStyle = rgba(INK, 0.5 * a);
      ctx.fillRect(pad + innerW * 0.05, balY - unit * 0.018, barW, Math.max(4, unit * 0.036));
    }

    /* ---- the compose form ---- */
    const formX = pad + innerW * 0.05;
    const formW = innerW * 0.5;
    const formY = pad + innerH * 0.3;
    const rowH = Math.max(9, unit * 0.1);
    const gapY = rowH * 1.35;

    const field = (i: number, labelText: string, fill: number) => {
      const y = formY + gapY * i;
      panel(ctx, formX, y, formW, rowH, rowH * 0.28);
      ctx.fillStyle = rgba(INK, 0.05 * a);
      ctx.fill();
      ctx.strokeStyle = rgba(INK, 0.16 * a);
      ctx.lineWidth = 1;
      ctx.stroke();
      if (big) {
        label(ctx, labelText, formX + formW * 0.05, y + rowH / 2, w, h, rgba(INK, 0.34 * a));
      }
      // the entered value
      ctx.fillStyle = rgba(INK, 0.55 * a);
      const vx = formX + formW * (big ? 0.34 : 0.1);
      ctx.fillRect(vx, y + rowH * 0.34, (formW - (vx - formX)) * 0.8 * fill, rowH * 0.32);
    };

    // the fields fill in over the compose beat
    field(0, "TO", stage === 0 ? clamp01(local * 2.4) : 1);
    field(1, "AMOUNT", stage === 0 ? clamp01(local * 2.4 - 1) : 1);

    /* ---- confirm ---- */
    const btnY = formY + gapY * 2;
    panel(ctx, formX, btnY, formW * 0.52, rowH, rowH * 0.5);
    ctx.fillStyle = rgba(ACCENT, (confirmed ? 0.28 : 0.1) * a);
    ctx.fill();
    ctx.strokeStyle = rgba(ACCENT, (confirmed ? 0.9 : 0.4) * a);
    ctx.lineWidth = confirmed ? 1.6 : 1;
    ctx.stroke();
    if (big) {
      label(
        ctx,
        "CONFIRM",
        formX + formW * 0.26,
        btnY + rowH / 2,
        w,
        h,
        rgba(ACCENT, (confirmed ? 1 : 0.55) * a),
        "center",
      );
    }

    /* ---- the verification panel, right hand side ---- */
    const vW = innerW * 0.3;
    const vX = pad + innerW - vW - innerW * 0.05;
    const vY = pad + innerH * 0.24;
    const vH = innerH * 0.46;
    // The panel is always drawn, dim, and only lights up for the check. An
    // earlier version mounted it on the verify beat, which left the right half
    // of a wide banner empty for three of every seven seconds.
    const show = verifying ? ease(clamp01(local * 2.2)) : cleared ? 1 : 0;

    panel(ctx, vX, vY, vW, vH, unit * 0.045);
    ctx.fillStyle = rgba(ACCENT, (0.015 + 0.035 * show) * a);
    ctx.fill();
    ctx.strokeStyle = rgba(show > 0.05 ? ACCENT : INK, (0.14 + 0.42 * show) * a);
    ctx.lineWidth = 1 + 0.4 * show;
    ctx.stroke();

    const fcx = vX + vW / 2;
    const fcy = vY + vH * 0.44;
    const fr = Math.min(vW, vH) * 0.3;

    const traceTo = (upto: number) => {
      ctx.beginPath();
      for (let i = 0; i < upto; i++) {
        const x = fcx + face[i].x * fr;
        const y = fcy + face[i].y * fr;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      if (upto === face.length) ctx.closePath();
    };

    // the idle silhouette, so the panel is never an empty box
    traceTo(face.length);
    ctx.strokeStyle = rgba(INK, 0.16 * a);
    ctx.lineWidth = Math.max(1, unit * 0.005);
    ctx.stroke();

    if (show > 0.01) {
      const traced = cleared ? 1 : clamp01(local * 2.6);
      traceTo(Math.max(2, Math.floor(traced * face.length)));
      ctx.strokeStyle = rgba(ACCENT, 0.9 * a * show);
      ctx.lineWidth = Math.max(1.2, unit * 0.008);
      ctx.stroke();

      // eyes and mouth, so the silhouette reads as a face rather than an oval
      const feat = clamp01((traced - 0.5) / 0.5) * show;
      if (feat > 0.01) {
        ctx.fillStyle = rgba(ACCENT, 0.85 * a * feat);
        for (const sx of [-1, 1]) {
          ctx.beginPath();
          ctx.ellipse(fcx + sx * fr * 0.26, fcy - fr * 0.18, fr * 0.09, fr * 0.06, 0, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.strokeStyle = rgba(ACCENT, 0.7 * a * feat);
        ctx.lineWidth = Math.max(1, unit * 0.006);
        ctx.beginPath();
        ctx.moveTo(fcx - fr * 0.18, fcy + fr * 0.34);
        ctx.quadraticCurveTo(fcx, fcy + fr * 0.44, fcx + fr * 0.18, fcy + fr * 0.34);
        ctx.stroke();
      }

      if (!cleared) {
        const sy = vY + vH * (0.16 + 0.56 * ((t * 0.9) % 1));
        gradientLine(ctx, vX, sy, vX + vW, sy, ACCENT, 0, 0.6 * a * show, 1);
      }
    }

    if (big) {
      label(
        ctx,
        cleared ? "VERIFIED" : verifying ? "VERIFYING" : "SECOND FACTOR",
        fcx,
        vY + vH * 0.86,
        w,
        h,
        rgba(show > 0.05 ? ACCENT : INK, (0.3 + 0.6 * show) * a),
        "center",
      );
    }

    /* ---- the ledger ---- */
    const ledY = pad + innerH * 0.88;
    gradientLine(ctx, pad + innerW * 0.05, ledY, pad + innerW * 0.95, ledY, INK, 0.02 * a, 0.12 * a, 1);

    const lrH = Math.max(5, unit * 0.055);
    rows.forEach((len, i) => {
      const y = ledY + lrH * 0.5;
      const x = pad + innerW * 0.05 + i * (innerW * 0.9) / 3;
      const wCell = (innerW * 0.9) / 3 - innerW * 0.02;
      // the newest row is the transfer that just cleared
      const fresh = i === 0 && cleared;
      ctx.fillStyle = rgba(fresh ? ACCENT : INK, (fresh ? 0.75 : 0.2) * a);
      ctx.fillRect(x, y, wCell * len, lrH * 0.42);
      // a tick, breathing so the held state is never perfectly still
      const pulse = fresh ? 0.7 + 0.3 * Math.sin(t * 2.4) : 1;
      ctx.fillStyle = rgba(fresh ? ACCENT : INK, (fresh ? 0.9 * pulse : 0.22) * a);
      ctx.fillRect(x + wCell * 0.88, y, Math.max(3, unit * 0.02), lrH * 0.42);
    });

    /* ---- pending indicator: the transfer is stuck without the second key ---- */
    if (pending) {
      const dots = 3;
      for (let i = 0; i < dots; i++) {
        const ph = (t * 2.2 + i * 0.3) % 1;
        const r = Math.max(1.6, unit * 0.012) * (0.6 + 0.4 * Math.sin(ph * Math.PI));
        coreDot(
          ctx,
          formX + formW * 0.62 + i * unit * 0.045,
          btnY + rowH / 2,
          r,
          AMBER,
          0.85 * a,
        );
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

const MACROS = ["carbs", "protein", "fat"] as const;
const MICROS = ["fibre", "iron", "calcium"] as const;
// real dish names, taken from the same sample the live search demo uses
const DISHES = ["Masala dosa", "Rajma chawal", "Palak paneer", "Idli sambar"] as const;

/**
 * The nutrition view the product is building.
 *
 * A plate on the left with the macro split drawn as a ring around its rim, the
 * labelled bars beside it counting up, and micro nutrient chips beneath.
 * Dishes slide through rather than the bars refilling in place.
 *
 * Deliberately not the search: the same case study page carries a live fuzzy
 * search demo further down, so the canvas covers the half of the product that
 * demo does not.
 *
 * The readout is a **percentage of the macro split**, which is what the ring
 * and the bars already encode. It is not a calorie or gram figure: inventing
 * one next to a real dish name would be stating a nutrition fact that nothing
 * backs, on a page about a nutrition product.
 */
const diavo = define<{ splits: number[][]; marks: { x: number; y: number; r: number }[] }>({
  init: (w, h) => {
    const rand = mulberry32(870);
    void w;
    void h;
    const splits = DISHES.map(() => {
      const raw = MACROS.map(() => 0.2 + rand() * 0.8);
      const total = raw.reduce((x, y) => x + y, 0);
      return raw.map((x) => x / total);
    });
    // a few abstract marks inside the plate, so it reads as a plate of
    // something rather than as an empty gauge
    const marks = Array.from({ length: 7 }, () => {
      const ang = rand() * Math.PI * 2;
      const rad = 0.18 + rand() * 0.45;
      return { x: Math.cos(ang) * rad, y: Math.sin(ang) * rad, r: 0.06 + rand() * 0.1 };
    });
    return { splits, marks };
  },
  draw: ({ ctx, w, h, t, intro }, { splits, marks }) => {
    const a = ease(intro);
    const unit = Math.min(w, h);
    const big = roomForLabels(w, h);
    const pad = w * 0.04;
    const innerW = w - pad * 2;
    const innerH = h - pad * 2;

    const CYCLE = 5.6;
    const n = DISHES.length;
    const which = ((Math.floor(t / CYCLE) % n) + n) % n;
    const [stage, local] = phase(t % CYCLE, [0.6, 4.2, 0.8]);
    // 0 enter  1 hold  2 exit
    const fill = stage === 0 ? ease(local) : 1;
    const enter = stage === 0 ? ease(local) : 1;
    const exit = stage === 2 ? ease(local) : 0;

    const split = splits[which] ?? [0.5, 0.3, 0.2];
    // rounding each share independently can total 101; the last takes the
    // remainder so the readout always adds up
    const pct = split.map((v) => Math.round(v * 100));
    pct[pct.length - 1] = 100 - pct.slice(0, -1).reduce((x, y) => x + y, 0);

    /* ---- the screen ---- */
    panel(ctx, pad, pad, innerW, innerH, unit * 0.05);
    ctx.strokeStyle = rgba(INK, 0.14 * a);
    ctx.lineWidth = 1;
    ctx.stroke();

    // the content slides in from the right and leaves to the left, clipped to
    // the panel — without the clip it travels past the canvas edge and is cut
    // off by it instead, which at a card size loses half the plate
    ctx.save();
    panel(ctx, pad, pad, innerW, innerH, unit * 0.05);
    ctx.clip();

    const slide = (1 - enter) * innerW * 0.12 - exit * innerW * 0.12;
    // never fades to nothing: at a card size a fully transparent beat reads as
    // an empty panel, and the transitions are a meaningful slice of the cycle
    const alpha = a * Math.max(0.22, Math.min(enter, 1 - exit));
    ctx.translate(slide, 0);
    ctx.globalAlpha = Math.max(0, alpha);

    const colX = pad + innerW * 0.06;
    const colW = innerW * 0.88;

    /* ---- dish header ---- */
    const headY = pad + innerH * 0.14;
    if (big) {
      label(ctx, DISHES[which].toUpperCase(), colX, headY, w, h, rgba(INK, 0.85 * a));
    } else {
      ctx.fillStyle = rgba(INK, 0.6 * a);
      ctx.fillRect(colX, headY - unit * 0.02, colW * 0.4, Math.max(4, unit * 0.04));
    }

    /* ---- the plate, with the macro ring around its rim ---- */
    const plateR = Math.min(innerW * 0.14, innerH * 0.26);
    const pcx = colX + plateR * 1.05;
    const pcy = pad + innerH * 0.52;
    const ringW = plateR * 0.26;
    const ringR = plateR * 0.92;

    // the plate itself
    const disc = ctx.createRadialGradient(pcx, pcy, 0, pcx, pcy, plateR * 0.72);
    disc.addColorStop(0, rgba(INK, 0.1 * a));
    disc.addColorStop(1, rgba(INK, 0.02 * a));
    ctx.fillStyle = disc;
    ctx.beginPath();
    ctx.arc(pcx, pcy, plateR * 0.72, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = rgba(INK, 0.12 * a);
    ctx.lineWidth = 1;
    ctx.stroke();

    for (const m of marks) {
      ctx.fillStyle = rgba(INK, 0.09 * a);
      ctx.beginPath();
      ctx.arc(pcx + m.x * plateR * 0.6, pcy + m.y * plateR * 0.6, m.r * plateR * 0.5, 0, Math.PI * 2);
      ctx.fill();
    }

    // the ring segments, sweeping out with the fill
    ctx.lineCap = "butt";
    ctx.lineWidth = ringW;
    let ang = -Math.PI / 2;
    const gap = 0.06;
    for (let i = 0; i < split.length; i++) {
      const sweep = split[i] * Math.PI * 2 * fill;
      const tone = i === 0 ? ACCENT : i === 1 ? ACCENT_DEEP : INK;
      ctx.strokeStyle = rgba(tone, (0.35 + (split.length - i) * 0.16) * a);
      ctx.beginPath();
      ctx.arc(pcx, pcy, ringR, ang + gap / 2, ang + Math.max(gap, sweep) - gap / 2);
      ctx.stroke();
      ang += sweep;
    }

    // a highlight travelling the rim, so the long hold beat is never still
    {
      const head = (t * 0.42) % 1;
      const hs = -Math.PI / 2 + head * Math.PI * 2;
      const grad = ctx.createLinearGradient(
        pcx + Math.cos(hs) * ringR,
        pcy + Math.sin(hs) * ringR,
        pcx + Math.cos(hs + 0.6) * ringR,
        pcy + Math.sin(hs + 0.6) * ringR,
      );
      grad.addColorStop(0, rgba(ACCENT, 0));
      grad.addColorStop(1, rgba(ACCENT, 0.85 * a));
      ctx.strokeStyle = grad;
      ctx.lineWidth = ringW * 0.55;
      ctx.beginPath();
      ctx.arc(pcx, pcy, ringR, hs, hs + 0.6);
      ctx.stroke();
    }

    /* ---- macro bars, to the right of the plate ---- */
    const barsX = pcx + plateR * 1.25;
    const barsW = colX + colW - barsX;
    const barTop = pad + innerH * 0.38;
    const barGap = innerH * 0.15;
    const barH = Math.max(6, unit * 0.07);
    const trackX = barsX + (big ? barsW * 0.24 : barsW * 0.04);
    const trackW = barsX + barsW - trackX - (big ? barsW * 0.14 : 0);

    for (let i = 0; i < MACROS.length; i++) {
      const y = barTop + barGap * i;
      if (big) label(ctx, MACROS[i], barsX, y + barH / 2, w, h, rgba(INK, 0.4 * a));

      ctx.fillStyle = rgba(INK, 0.06 * a);
      ctx.fillRect(trackX, y, trackW, barH);

      const value = split[i] * fill;
      const tone = i === 0 ? ACCENT : i === 1 ? ACCENT_DEEP : INK;
      const g = ctx.createLinearGradient(trackX, 0, trackX + trackW * value, 0);
      g.addColorStop(0, rgba(tone, 0.45 * a));
      g.addColorStop(1, rgba(tone, 0.9 * a));
      ctx.fillStyle = g;
      ctx.fillRect(trackX, y, trackW * value, barH);

      if (big) {
        label(
          ctx,
          `${Math.round(pct[i] * fill)}%`,
          barsX + barsW,
          y + barH / 2,
          w,
          h,
          rgba(tone, 0.85 * a),
          "right",
        );
      }
    }

    /* ---- micro nutrient chips ---- */
    const chipY = pad + innerH * 0.87;
    const cellW = colW / MICROS.length;
    for (let i = 0; i < MICROS.length; i++) {
      const x = colX + cellW * i;
      const arrive = clamp01((fill - 0.5) / 0.5);
      const breathe = 0.75 + 0.25 * Math.sin(t * 1.6 + i * 1.3);
      coreDot(ctx, x + unit * 0.02, chipY, unit * 0.014 * arrive, ACCENT, 0.8 * a * arrive * breathe);
      if (big) {
        label(ctx, MICROS[i], x + unit * 0.05, chipY, w, h, rgba(INK, 0.36 * a * arrive));
      } else {
        ctx.fillStyle = rgba(INK, 0.22 * a * arrive);
        ctx.fillRect(x + unit * 0.045, chipY - unit * 0.012, cellW * 0.42, Math.max(3, unit * 0.024));
      }
    }

    ctx.restore();
  },
});

export { qsecure, banking, blocker, madhumarga, zenpro, diavo };
