import { ACCENT, ACCENT_DEEP, INK, clamp01, ease, mulberry32, rgba } from "../types";
import { define } from "./shared";

/* ------------------------------------------------------------------ hero --- */

/**
 * The 2D fallback for the hero, used only when WebGL is unavailable.
 *
 * Soft overlapping radial masses rather than strokes, so it degrades into
 * something in the same family as the shader instead of dropping back to line
 * art. Cheap by construction: a handful of gradients per frame.
 */
const hero = define<{ blobs: { x: number; y: number; r: number; sx: number; sy: number }[] }>({
  init: (w, h) => {
    const rand = mulberry32(4181);
    const blobs = [];
    for (let i = 0; i < 6; i++) {
      blobs.push({
        x: rand(),
        y: rand(),
        r: 0.35 + rand() * 0.4,
        sx: (rand() - 0.5) * 0.9,
        sy: (rand() - 0.5) * 0.9,
      });
    }
    void w;
    void h;
    return { blobs };
  },
  draw: ({ ctx, w, h, t, intro }, { blobs }) => {
    const a = ease(intro);
    const unit = Math.max(w, h);
    for (let i = 0; i < blobs.length; i++) {
      const b = blobs[i];
      const x = (b.x + Math.sin(t * 0.06 * b.sx + i) * 0.12) * w;
      const y = (b.y + Math.cos(t * 0.06 * b.sy + i * 1.7) * 0.12) * h;
      const r = b.r * unit * 0.6;
      const g = ctx.createRadialGradient(x, y, 0, x, y, r);
      const tint = i % 3 === 0 ? ACCENT : INK;
      g.addColorStop(0, rgba(tint, 0.05 * a));
      g.addColorStop(1, rgba(tint, 0));
      ctx.fillStyle = g;
      ctx.fillRect(x - r, y - r, r * 2, r * 2);
    }
  },
});

/* ------------------------------------------------------------------ hils --- */

const STEPS = 5;

/**
 * What the DRDO work actually replaced, shown as a race.
 *
 * The upper track is the lab run as it was done by hand: step, wait, step,
 * wait — long uneven pauses while an engineer walks the model through load,
 * build, execute, stop and reset. The lower track is the same five steps
 * driven by the web layer, firing in one continuous sweep.
 *
 * Both start together, so the gap between the two bars when the automated run
 * has finished *is* the roughly 70 percent that disappeared. Nothing is
 * labelled; the difference in length says it.
 */
const hils = define<{ waits: number[] }>({
  trail: 0.5,
  init: () => {
    const rand = mulberry32(70);
    // uneven human pauses, which is what makes the top track read as manual
    return { waits: Array.from({ length: STEPS }, () => 0.6 + rand() * 0.9) };
  },
  draw: ({ ctx, w, h, t, intro }, { waits }) => {
    const a = ease(intro);
    const unit = Math.min(w, h);

    const CYCLE = 9;
    const local = (t % CYCLE) / CYCLE;

    const padX = w * 0.08;
    const trackW = w - padX * 2;
    const barH = Math.max(6, unit * 0.075);
    const yTop = h * 0.34;
    const yBot = h * 0.64;

    // the automated run occupies the first 28% of the cycle, the manual run
    // nearly all of it — that ratio is the saving
    const autoP = clamp01(local / 0.28);
    const totalWait = waits.reduce((s, x) => s + x, 0);
    const manualP = clamp01(local / 0.92);

    const drawTrack = (y: number, progress: number, hot: boolean, working = -1) => {
      ctx.fillStyle = rgba(INK, 0.06 * a);
      ctx.fillRect(padX, y - barH / 2, trackW, barH);

      const filled = trackW * progress;
      if (filled > 0.5) {
        const g = ctx.createLinearGradient(padX, 0, padX + filled, 0);
        g.addColorStop(0, rgba(hot ? ACCENT : INK, (hot ? 0.5 : 0.22) * a));
        g.addColorStop(1, rgba(hot ? ACCENT : INK, (hot ? 0.95 : 0.4) * a));
        ctx.fillStyle = g;
        ctx.fillRect(padX, y - barH / 2, filled, barH);
      }

      // the segment currently being worked, so a waiting manual run reads as
      // occupied rather than broken
      if (working >= 0) {
        const segW = trackW / STEPS;
        const pulse = 0.5 + 0.5 * Math.sin(t * 4);
        ctx.fillStyle = rgba(INK, (0.05 + pulse * 0.1) * a);
        ctx.fillRect(padX + segW * working, y - barH / 2, segW, barH);
      }

      for (let i = 0; i <= STEPS; i++) {
        const x = padX + (trackW * i) / STEPS;
        const passed = progress >= i / STEPS - 0.001;
        ctx.fillStyle = rgba(passed ? (hot ? ACCENT : INK) : INK, (passed ? 0.9 : 0.16) * a);
        const mw = Math.max(1.5, unit * 0.012);
        ctx.fillRect(x - mw / 2, y - barH * 0.95, mw, barH * 1.9);
      }

      if (progress > 0 && progress < 1) {
        const x = padX + filled;
        const g = ctx.createRadialGradient(x, y, 0, x, y, barH * 2.2);
        g.addColorStop(0, rgba(hot ? ACCENT : INK, 0.55 * a));
        g.addColorStop(1, rgba(hot ? ACCENT : INK, 0));
        ctx.fillStyle = g;
        ctx.fillRect(x - barH * 2.2, y - barH * 2.2, barH * 4.4, barH * 4.4);
      }
    };

    // manual: advance only while a step is being performed, hold otherwise
    let manualProgress = 0;
    let manualWorking = -1;
    {
      const walked = manualP * totalWait;
      let acc = 0;
      for (let i = 0; i < STEPS; i++) {
        const seg = waits[i];
        if (walked >= acc + seg) {
          manualProgress = (i + 1) / STEPS;
          acc += seg;
          continue;
        }
        // most of each segment is spent waiting, then the step happens
        const within = (walked - acc) / seg;
        manualProgress = (i + clamp01((within - 0.62) / 0.38)) / STEPS;
        manualWorking = i;
        break;
      }
    }

    drawTrack(yTop, manualProgress, false, manualWorking);
    drawTrack(yBot, ease(autoP), true);

    // once the automated run is done, the distance still left on the manual
    // track is the time that was saved
    if (autoP >= 1 && manualProgress < 1) {
      const x1 = padX + trackW * 1;
      const x2 = padX + trackW * manualProgress;
      const midY = (yTop + yBot) / 2;
      ctx.strokeStyle = rgba(ACCENT_DEEP, 0.5 * a);
      ctx.lineWidth = 1;
      ctx.setLineDash([3, 4]);
      ctx.beginPath();
      ctx.moveTo(x2, midY);
      ctx.lineTo(x1, midY);
      ctx.stroke();
      ctx.setLineDash([]);
    }
  },
});

/* ------------------------------------------------------------------- rag --- */

/**
 * The ranking rearranging itself.
 *
 * A dense grid where every row is one opening and every cell along it is one
 * dimension of similarity against the résumé. Scores drift, so the rows
 * continuously re-sort into rank order — the strongest match rises to the top
 * and holds until something displaces it.
 *
 * A wall of data rather than a few floating points, which is both closer to
 * what a retrieval pipeline produces and legible at any size.
 */
type Row = { seed: number; speed: number; y: number };

const rag = define<{ rows: Row[]; cols: number }>({
  // no trail: the rows slide between rank slots, and a wake turns that into
  // smeared ghosts rather than movement
  trail: 0,
  init: (w, h) => {
    const rand = mulberry32(917);
    const rowCount = Math.max(5, Math.min(11, Math.round(h / Math.max(16, h * 0.105))));
    const rows: Row[] = [];
    for (let i = 0; i < rowCount; i++) {
      rows.push({ seed: rand() * 10, speed: 0.1 + rand() * 0.18, y: i });
    }
    const cols = Math.max(8, Math.min(26, Math.round(w / Math.max(18, w * 0.045))));
    return { rows, cols };
  },
  draw: ({ ctx, w, h, t, intro }, { rows, cols }) => {
    const a = ease(intro);
    const padX = w * 0.07;
    const padY = h * 0.1;
    const gridW = w - padX * 2;
    const gridH = h - padY * 2;
    const rowH = gridH / rows.length;
    const cellW = gridW / cols;
    const gap = Math.max(1, cellW * 0.14);

    const scored = rows.map((r, i) => ({
      i,
      r,
      score: 0.5 + 0.5 * Math.sin(t * r.speed + r.seed),
    }));
    const order = [...scored].sort((p, q) => q.score - p.score);

    // ease each row toward its rank slot, so re-sorting is a slide not a jump
    order.forEach((entry, rank) => {
      entry.r.y += (rank - entry.r.y) * 0.05;
    });

    const leader = order[0].i;

    for (const entry of scored) {
      const y = padY + entry.r.y * rowH;
      const isTop = leader === entry.i;

      for (let c = 0; c < cols; c++) {
        // stable per cell offset, so a strong row is bright across its width
        const hash = Math.sin(entry.i * 41.3 + c * 12.9) * 43758.5453;
        const frac = hash - Math.floor(hash);
        const v = clamp01(entry.score * (0.55 + frac * 0.75) - 0.08);

        ctx.fillStyle = rgba(
          isTop ? ACCENT : v > 0.66 ? ACCENT_DEEP : INK,
          (0.05 + v * (isTop ? 0.85 : 0.5)) * a,
        );
        ctx.fillRect(padX + c * cellW, y, cellW - gap, rowH - gap);
      }

      if (isTop) {
        ctx.fillStyle = rgba(ACCENT, 0.95 * a);
        ctx.fillRect(padX - Math.max(4, w * 0.014), y, Math.max(2, w * 0.006), rowH - gap);
      }
    }
  },
});

export { hero, hils, rag };
