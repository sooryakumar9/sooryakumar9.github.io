import { ACCENT, ACCENT_DEEP, INK, clamp01, ease, mulberry32, rgba } from "../types";
import { define, label, labelPx, panel, roomForLabels } from "./shared";

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

const CONTROLS = ["LOAD", "BUILD", "EXEC", "STOP", "RESET"];
const LOG = [
  "model loaded",
  "syntax ok",
  "build complete",
  "executing",
  "run finished",
];

/**
 * The control panel Soorya built, running a job.
 *
 * A script list down the left, the five RT-LAB controls across the top firing
 * in order, and a status log filling in underneath as each step completes —
 * ending green, holding, then clearing and running again.
 *
 * Earlier versions of this canvas were abstractions of the project (a
 * flowchart, an attractor, two racing bars) and every one of them needed a
 * caption to mean anything. This just draws the software.
 */
const hils = define<{ scripts: number[] }>({
  init: (w, h) => {
    const rand = mulberry32(1104);
    void w;
    void h;
    // varying script name lengths, so the list reads as real content
    return { scripts: Array.from({ length: 7 }, () => 0.45 + rand() * 0.5) };
  },
  draw: ({ ctx, w, h, t, intro }, { scripts }) => {
    const a = ease(intro);
    const unit = Math.min(w, h);
    const big = roomForLabels(w, h);
    const pad = w * 0.045;

    // one control per beat, then a hold on the finished state
    const CYCLE = 9;
    const local = (t % CYCLE) / CYCLE;
    // the run occupies the first 78% of the cycle; the rest is the held
    // finished state, so the panel is never caught mid-nothing
    const runP = clamp01(local / 0.78) * CONTROLS.length;
    const active = Math.min(CONTROLS.length, Math.floor(runP));
    const stepP = clamp01(runP - active);
    const done = active >= CONTROLS.length;

    /* ---- the window itself ---- */
    ctx.lineWidth = 1;
    panel(ctx, pad, pad, w - pad * 2, h - pad * 2, unit * 0.05);
    ctx.strokeStyle = rgba(INK, 0.14 * a);
    ctx.stroke();

    const railW = (w - pad * 2) * 0.26;
    const railX = pad;
    const bodyX = pad + railW;
    const bodyW = w - pad * 2 - railW;

    /* ---- script list down the left ---- */
    ctx.save();
    panel(ctx, railX, pad, railW, h - pad * 2, unit * 0.05);
    ctx.clip();
    ctx.fillStyle = rgba(INK, 0.03 * a);
    ctx.fillRect(railX, pad, railW, h - pad * 2);

    const rowH = (h - pad * 2) / (scripts.length + 1.4);
    scripts.forEach((len, i) => {
      const y = pad + rowH * (i + 0.9);
      // the script currently being driven is the one that lights
      const on = i === active % scripts.length && !done;
      ctx.fillStyle = rgba(on ? ACCENT : INK, (on ? 0.85 : 0.22) * a);
      ctx.fillRect(
        railX + railW * 0.14,
        y - rowH * 0.17,
        railW * 0.72 * len,
        Math.max(2, rowH * 0.34),
      );
    });
    ctx.restore();

    // divider between rail and body
    ctx.strokeStyle = rgba(INK, 0.1 * a);
    ctx.beginPath();
    ctx.moveTo(bodyX, pad);
    ctx.lineTo(bodyX, h - pad);
    ctx.stroke();

    /* ---- the five controls across the top ---- */
    const ctlY = pad + (h - pad * 2) * 0.16;
    const ctlH = Math.max(9, unit * 0.13);
    const gap = bodyW * 0.03;
    const ctlW = (bodyW - gap * (CONTROLS.length + 1)) / CONTROLS.length;

    for (let i = 0; i < CONTROLS.length; i++) {
      const x = bodyX + gap * (i + 1) + ctlW * i;
      const isDone = i < active;
      const isNow = i === active && !done;

      panel(ctx, x, ctlY - ctlH / 2, ctlW, ctlH, ctlH / 2);
      ctx.fillStyle = rgba(isNow ? ACCENT : isDone ? ACCENT : INK, (isNow ? 0.3 : isDone ? 0.14 : 0.05) * a);
      ctx.fill();
      ctx.strokeStyle = rgba(isNow || isDone ? ACCENT : INK, (isNow ? 0.95 : isDone ? 0.5 : 0.18) * a);
      ctx.lineWidth = isNow ? 1.6 : 1;
      ctx.stroke();

      if (big) {
        label(
          ctx,
          CONTROLS[i],
          x + ctlW / 2,
          ctlY,
          w,
          h,
          rgba(isNow || isDone ? ACCENT : INK, (isNow ? 1 : isDone ? 0.7 : 0.35) * a),
          "center",
        );
      } else {
        // small: a filled pill instead of a label it could not render legibly
        const dotR = Math.max(1.5, ctlH * 0.16);
        ctx.beginPath();
        ctx.arc(x + ctlW / 2, ctlY, dotR, 0, Math.PI * 2);
        ctx.fillStyle = rgba(isNow || isDone ? ACCENT : INK, (isNow ? 1 : isDone ? 0.6 : 0.25) * a);
        ctx.fill();
      }
    }

    /* ---- the status log ---- */
    const logTop = ctlY + ctlH * 1.5;
    const logH = h - pad - logTop;
    const lineH = logH / (LOG.length + 0.6);
    const fs = big ? labelPx(w, h) : 0;

    for (let i = 0; i < LOG.length; i++) {
      if (i > active) break;
      const y = logTop + lineH * (i + 0.6);
      const settled = i < active;
      const tone = done && i === LOG.length - 1 ? ACCENT : settled ? INK : ACCENT;
      const alpha = (settled ? 0.55 : 0.95) * a;

      // the caret marker on every line. The last one blinks — including once
      // the run has finished, so the held state at the end of each cycle still
      // has something alive in it.
      const cw = Math.max(2, unit * 0.014);
      const isLast = i === Math.min(active, LOG.length - 1);
      const blink = isLast ? 0.45 + 0.55 * Math.abs(Math.sin(t * 2.6)) : 1;
      ctx.fillStyle = rgba(tone, alpha * blink);
      ctx.fillRect(bodyX + bodyW * 0.05, y - cw / 2, cw, cw);

      if (big) {
        ctx.font = `${fs.toFixed(1)}px ui-monospace, monospace`;
        ctx.textAlign = "left";
        ctx.textBaseline = "middle";
        ctx.fillStyle = rgba(tone, alpha);
        const text = LOG[i];
        // the newest line types itself out
        // the newest line types out across its own step, not on a free timer
        const shown = settled ? text : text.slice(0, Math.ceil(text.length * clamp01(stepP * 1.6)));
        ctx.fillText(shown, bodyX + bodyW * 0.05 + cw * 2.4, y);
      } else {
        // small: a bar standing in for the line of text
        const barW = bodyW * (0.32 + ((i * 37) % 11) / 24);
        ctx.fillStyle = rgba(tone, alpha * 0.8);
        ctx.fillRect(
          bodyX + bodyW * 0.05 + cw * 2.4,
          y - Math.max(1.5, lineH * 0.14),
          settled ? barW : barW * clamp01(stepP * 1.6),
          Math.max(3, lineH * 0.28),
        );
      }
    }

    /* ---- the run indicator ----
       bottom right of the window: the control row already spans the full body
       width, so anything at the top right lands on top of RESET */
    const dotR = Math.max(2.5, unit * 0.018);
    const dotX = w - pad * 1.8 - dotR;
    const dotY = h - pad * 1.8 - dotR;
    // it keeps breathing when finished too: a constant dot meant the whole
    // canvas held perfectly still for the last fifth of every cycle
    const pulse = done ? 0.72 + 0.28 * Math.sin(t * 1.6) : 0.5 + 0.5 * Math.sin(t * 5);
    ctx.beginPath();
    ctx.arc(dotX, dotY, dotR, 0, Math.PI * 2);
    ctx.fillStyle = rgba(done ? ACCENT : ACCENT_DEEP, (0.4 + pulse * 0.6) * a);
    ctx.fill();
  },
});

/* ------------------------------------------------------------------- rag --- */

type Job = { seed: number; target: number; score: number; y: number };

/**
 * The analyser's own interface.
 *
 * The résumé sits on the left and its lines light up as they are read; on the
 * right, job cards stack up with match percentages that count toward their
 * score, and the stack re-sorts as the numbers resolve. What goes in and what
 * comes out are both visible, so the picture explains itself.
 */
const rag = define<{ jobs: Job[]; lines: number[] }>({
  init: (w, h) => {
    const rand = mulberry32(2211);
    const count = h > 260 ? 5 : 4;
    const jobs: Job[] = [];
    for (let i = 0; i < count; i++) {
      jobs.push({ seed: rand(), target: 0, score: 0, y: i });
    }
    const lines = Array.from({ length: 9 }, () => 0.4 + rand() * 0.6);
    void w;
    return { jobs, lines };
  },
  draw: ({ ctx, w, h, t, intro }, { jobs, lines }) => {
    const a = ease(intro);
    const unit = Math.min(w, h);
    const big = roomForLabels(w, h);
    const pad = w * 0.045;

    /*
     * Both of these run continuously rather than on a cycle with a hold.
     * An earlier version settled the scores and then stopped for the back
     * half of every loop, which left the canvas genuinely frozen for seconds
     * at a time — indistinguishable from a broken animation.
     */
    // the read head sweeps the document over and over
    const read = (t / 4.6) % 1;

    // targets drift on their own slow cycles, so the bars always move a
    // little and the ranking reshuffles from time to time
    for (let i = 0; i < jobs.length; i++) {
      const j = jobs[i];
      j.target = 0.45 + 0.5 * (0.5 + 0.5 * Math.sin(t * 0.26 + j.seed * 11 + i));
    }

    const docW = (w - pad * 2) * 0.33;
    const docX = pad;
    const listX = pad + docW + (w - pad * 2) * 0.08;
    const listW = w - pad - listX;

    /* ---- the résumé ---- */
    panel(ctx, docX, pad, docW, h - pad * 2, unit * 0.04);
    ctx.fillStyle = rgba(INK, 0.035 * a);
    ctx.fill();
    ctx.strokeStyle = rgba(INK, 0.14 * a);
    ctx.lineWidth = 1;
    ctx.stroke();

    const lineGap = (h - pad * 2) / (lines.length + 2);
    lines.forEach((len, i) => {
      const y = pad + lineGap * (i + 1.4);
      // the read head passes down the page, lighting each line as it goes
      const lit = read > i / lines.length;
      const hot = Math.abs(read * lines.length - i) < 0.8 && read < 1;
      ctx.fillStyle = rgba(hot ? ACCENT : INK, (hot ? 0.95 : lit ? 0.4 : 0.16) * a);
      ctx.fillRect(
        docX + docW * 0.12,
        y - Math.max(1.5, lineGap * 0.14),
        docW * 0.76 * len,
        Math.max(3, lineGap * 0.28),
      );
    });

    /* ---- the ranked job cards ---- */
    const ranked = [...jobs].sort((p, q) => q.target - p.target);
    ranked.forEach((j, rank) => {
      j.y += (rank - j.y) * 0.08;
      // always easing toward the current target rather than being gated on a
      // phase: gating meant the cards read 0% for a third of every cycle,
      // which looks broken rather than pending. Targets only change once per
      // cycle, so this still counts up and settles.
      j.score += (j.target - j.score) * 0.045;
    });

    const cardH = (h - pad * 2) / (jobs.length + 0.5);
    for (const j of jobs) {
      const y = pad + j.y * cardH + cardH * 0.12;
      const ch = cardH * 0.76;
      const isTop = ranked[0] === j;

      panel(ctx, listX, y, listW, ch, unit * 0.035);
      ctx.fillStyle = rgba(isTop ? ACCENT : INK, (isTop ? 0.12 : 0.04) * a);
      ctx.fill();
      ctx.strokeStyle = rgba(isTop ? ACCENT : INK, (isTop ? 0.8 : 0.16) * a);
      ctx.lineWidth = isTop ? 1.5 : 1;
      ctx.stroke();

      // the score bar along the bottom of each card
      const barY = y + ch * 0.74;
      const barW = listW * 0.62;
      ctx.fillStyle = rgba(INK, 0.1 * a);
      ctx.fillRect(listX + listW * 0.07, barY, barW, Math.max(2.5, ch * 0.1));
      ctx.fillStyle = rgba(isTop ? ACCENT : ACCENT_DEEP, (isTop ? 0.95 : 0.5) * a);
      ctx.fillRect(listX + listW * 0.07, barY, barW * j.score, Math.max(2.5, ch * 0.1));

      // the title line
      ctx.fillStyle = rgba(INK, (isTop ? 0.7 : 0.32) * a);
      ctx.fillRect(
        listX + listW * 0.07,
        y + ch * 0.28,
        listW * (0.3 + j.seed * 0.3),
        Math.max(2.5, ch * 0.11),
      );

      if (big) {
        label(
          ctx,
          `${Math.round(j.score * 100)}%`,
          listX + listW * 0.93,
          y + ch * 0.4,
          w,
          h,
          rgba(isTop ? ACCENT : INK, (isTop ? 1 : 0.55) * a),
          "right",
        );
      } else {
        // small: a filled block whose width is the score
        const pw = listW * 0.16;
        ctx.fillStyle = rgba(isTop ? ACCENT : INK, (isTop ? 0.9 : 0.4) * a);
        ctx.fillRect(
          listX + listW * 0.93 - pw,
          y + ch * 0.3,
          pw * j.score,
          Math.max(3, ch * 0.2),
        );
      }
    }
  },
});

export { hero, hils, rag };
