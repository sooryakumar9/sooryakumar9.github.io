import {
  ACCENT,
  ACCENT_DEEP,
  AMBER,
  DEAD,
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
import { clockOf, define, phase } from "./shared";

/* --------------------------------------------------------------- banking --- */

type Pt = { x: number; y: number };

/**
 * A dense face landmark mesh resolving under a biometric scan.
 *
 * The topology is generated rather than hand listed: a jaw contour, brow and
 * eye rings, a nose ridge and a mouth ring, then Delaunay-ish local
 * triangulation by nearest neighbours. That gives roughly seventy points and a
 * few hundred edges, which is what makes it read as a real capture mesh
 * instead of a stick figure.
 *
 * Sequence: rings sweep down, points and edges light in the wake of each pass,
 * the mesh completes and locks, the transaction line clears, then it resets.
 */
const banking = define<{ pts: Pt[]; edges: [number, number][]; order: number[] }>({
  trail: 0.42,
  init: (w, h) => {
    const cx = w / 2;
    const cy = h * 0.46;
    const R = Math.min(w * 0.3, h * 0.33);
    const pts: Pt[] = [];

    const push = (x: number, y: number) => pts.push({ x: cx + x * R, y: cy + y * R });

    // jaw and skull contour, one closed ellipse squashed at the crown
    const CONTOUR = 26;
    for (let i = 0; i < CONTOUR; i++) {
      const a = (i / CONTOUR) * Math.PI * 2 - Math.PI / 2;
      const rx = 0.78;
      // narrower toward the chin, wider at the temples
      const ry = Math.sin(a) > 0 ? 1.06 : 0.92;
      push(Math.cos(a) * rx, Math.sin(a) * ry);
    }

    // brows
    for (const s of [-1, 1]) {
      for (let i = 0; i < 5; i++) {
        const k = i / 4;
        push(s * (0.2 + k * 0.34), -0.42 - Math.sin(k * Math.PI) * 0.07);
      }
    }

    // eye rings
    for (const s of [-1, 1]) {
      for (let i = 0; i < 8; i++) {
        const a = (i / 8) * Math.PI * 2;
        push(s * 0.36 + Math.cos(a) * 0.15, -0.22 + Math.sin(a) * 0.08);
      }
    }

    // nose ridge and base
    for (let i = 0; i < 5; i++) push(0, -0.34 + (i / 4) * 0.44);
    for (let i = -2; i <= 2; i++) push(i * 0.07, 0.14);

    // mouth ring
    for (let i = 0; i < 10; i++) {
      const a = (i / 10) * Math.PI * 2;
      push(Math.cos(a) * 0.24, 0.38 + Math.sin(a) * 0.1);
    }

    // cheek anchors so the mesh has interior structure
    for (const s of [-1, 1]) {
      push(s * 0.52, 0.02);
      push(s * 0.46, 0.26);
      push(s * 0.3, 0.12);
    }

    // connect each point to its nearest neighbours, deduplicated
    const edges: [number, number][] = [];
    const seen = new Set<string>();
    for (let i = 0; i < pts.length; i++) {
      const d = pts
        .map((p, j) => ({ j, d: Math.hypot(p.x - pts[i].x, p.y - pts[i].y) }))
        .filter((o) => o.j !== i)
        .sort((a, b) => a.d - b.d)
        .slice(0, 4);
      for (const o of d) {
        const key = i < o.j ? `${i}-${o.j}` : `${o.j}-${i}`;
        if (seen.has(key)) continue;
        seen.add(key);
        edges.push([i, o.j]);
      }
    }

    // points resolve top to bottom, following the scan
    const order = pts.map((_, i) => i).sort((a, b) => pts[a].y - pts[b].y);
    return { pts, edges, order };
  },
  draw: ({ ctx, w, h, t, progress, intro }, { pts, edges, order }) => {
    const a = ease(intro);
    const clock = clockOf(t, progress, 7, 1);
    const [stage, local] = phase(clock, [3, 1.4, 1.6, 1]);
    // 0 scan, 1 lock, 2 authorise, 3 rest
    const scanning = stage === 0;
    const locked = stage >= 1;

    const top = h * 0.1;
    const bottom = h * 0.82;
    const scanY = lerp(top, bottom, scanning ? local : 1);

    // how far down the mesh has resolved
    const resolved = scanning ? local : 1;
    const shown = Math.floor(resolved * order.length);
    const live = new Set(order.slice(0, shown));

    // edges, only where both ends have resolved
    for (const [p, q] of edges) {
      if (!live.has(p) || !live.has(q)) continue;
      const midY = (pts[p].y + pts[q].y) / 2;
      // freshly crossed edges flare, then settle
      const heat = scanning ? clamp01(1 - Math.abs(scanY - midY) / 70) : 0;
      const base = locked ? 0.55 : 0.34;
      gradientLine(
        ctx,
        pts[p].x,
        pts[p].y,
        pts[q].x,
        pts[q].y,
        heat > 0.02 ? ACCENT : locked ? ACCENT : INK,
        (base + heat * 0.6) * a,
        (base * 0.6 + heat * 0.4) * a,
        heat > 0.4 ? 1.3 : 0.8,
      );
    }

    // landmark points
    for (const i of live) {
      const p = pts[i];
      const heat = scanning ? clamp01(1 - Math.abs(scanY - p.y) / 55) : 0;
      coreDot(
        ctx,
        p.x,
        p.y,
        1.5 + heat * 1.8,
        heat > 0.02 || locked ? ACCENT : INK,
        (0.6 + heat * 0.4) * a,
      );
    }

    // the scan rings
    if (scanning) {
      for (let k = 0; k < 3; k++) {
        const y = scanY - k * 16;
        if (y < top) continue;
        gradientLine(ctx, w * 0.08, y, w * 0.92, y, ACCENT, 0, (0.55 - k * 0.16) * a, 1);
        gradientLine(ctx, w * 0.92, y, w * 0.08, y, ACCENT, 0, (0.55 - k * 0.16) * a, 1);
      }
    }

    // status and the transaction line
    ctx.font = "500 8px ui-monospace, monospace";
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    const label = scanning ? "SCANNING" : stage === 1 ? "FACE MATCHED" : "AUTHORISED";
    ctx.fillStyle = rgba(scanning ? INK : ACCENT, 0.7 * a);
    ctx.fillText(label, w * 0.08, h * 0.07);

    const barY = h * 0.93;
    ctx.strokeStyle = rgba(INK, 0.12 * a);
    ctx.lineWidth = 2;
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
        2,
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
    const rows = Math.max(5, Math.floor(h / 26));
    const wallX = w * 0.44;
    const wallW = Math.min(w * 0.34, 150);
    const bw = wallW / cols;
    const bh = h / rows;
    const gateRow = Math.floor(rows / 2);

    const bricks: Brick[] = [];
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        // the gate is a hole in the middle of the wall
        if (r === gateRow && c >= 2 && c <= 3) continue;
        bricks.push({
          x: wallX + c * bw,
          y: r * bh,
          w: bw - 2,
          h: bh - 2,
          order: rand(),
        });
      }
    }
    bricks.sort((a, b) => a.order - b.order);

    const packets: Packet[] = [];
    for (let i = 0; i < 16; i++) {
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
  draw: ({ ctx, w, h, t, progress, intro }, { bricks, packets }) => {
    const a = ease(intro);
    const clock = clockOf(t, progress, 8, 1);
    const [stage, local] = phase(clock, [2.4, 3.6, 1, 1]);
    // 0 building, 1 holding, 2 dropping, 3 open
    const built = stage === 0 ? local : stage === 1 ? 1 : stage === 2 ? 1 - local : 0;
    const shown = Math.floor(built * bricks.length);
    const wallX = bricks.length ? Math.min(...bricks.map((b) => b.x)) : w * 0.44;
    const wallR = bricks.length ? Math.max(...bricks.map((b) => b.x + b.w)) : w * 0.6;

    // the wall
    for (let i = 0; i < shown; i++) {
      const b = bricks[i];
      // the most recently placed bricks are still hot
      const fresh = clamp01(1 - (shown - i) / 6);
      ctx.fillStyle = rgba(fresh > 0.05 ? ACCENT : INK, (0.06 + fresh * 0.3) * a);
      ctx.fillRect(b.x, b.y, b.w, b.h);
      ctx.strokeStyle = rgba(fresh > 0.05 ? ACCENT : INK, (0.16 + fresh * 0.6) * a);
      ctx.lineWidth = 1;
      ctx.strokeRect(b.x, b.y, b.w, b.h);
    }

    // requests arriving
    for (const p of packets) {
      const k = (t * p.speed + p.seed) % 1;
      const x = k * w;
      const blocked = built > 0.25 && !p.pass;

      if (blocked && x >= wallX - 4) {
        // burst on impact and stop
        const burst = clamp01((x - (wallX - 4)) / 26);
        if (burst < 1) {
          const rays = 7;
          for (let i = 0; i < rays; i++) {
            const ang = (i / rays) * Math.PI * 2;
            const rr = burst * 16;
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

      // whitelisted requests keep going straight through the gate
      const through = p.pass && x > wallR;
      coreDot(ctx, x, p.y, 1.8, through ? ACCENT : p.pass ? ACCENT_DEEP : INK, 0.7 * a);
      gradientLine(ctx, x - 22, p.y, x, p.y, p.pass ? ACCENT_DEEP : INK, 0, 0.35 * a, 1);
    }

    // status
    ctx.font = "500 8px ui-monospace, monospace";
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    ctx.fillStyle = rgba(built > 0.9 ? ACCENT : INK, 0.6 * a);
    ctx.fillText(built > 0.9 ? "WINDOW ARMED" : built > 0 ? "ARMING" : "OPEN", 10, h - 12);
    void w;
  },
});

/* ------------------------------------------------------------ madhumarga --- */

type Cell = { x: number; y: number; q: number; r: number };

/**
 * The Hive Doctor's reasoning made visible. Cells fill with inspection data,
 * a rule cascade propagates outward cell by cell, one cell trips, and then the
 * path lights backwards to the rule that fired.
 *
 * That last beat is the point: the engine is explicit rules, not a model, so
 * every conclusion can be traced. The animation shows the trace.
 */
const madhumarga = define<{ cells: Cell[]; r: number; origin: number; flagged: number }>({
  trail: 0.45,
  init: (w, h) => {
    const r = Math.max(12, Math.min(w, h) / 8);
    const dx = r * 1.74;
    const dy = r * 1.5;
    const rand = mulberry32(1608);
    const cells: Cell[] = [];
    for (let row = 0; row * dy < h + r; row++) {
      for (let col = 0; col * dx < w + r; col++) {
        cells.push({
          x: col * dx + (row % 2 ? dx / 2 : 0),
          y: row * dy + r * 0.5,
          q: col,
          r: row,
        });
      }
    }
    const origin = Math.floor(rand() * cells.length);
    // the flagged cell sits a few rings out from where the cascade starts
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
  draw: ({ ctx, w, h, t, progress, intro }, { cells, r, origin, flagged }) => {
    const a = ease(intro);
    const clock = clockOf(t, progress, 9, 1);
    const [stage, local] = phase(clock, [2, 2.4, 1.6, 2]);
    // 0 fill, 1 cascade, 2 flag, 3 trace back

    const src = cells[origin];
    const tgt = cells[flagged];
    const maxD = Math.hypot(w, h);
    const wave = local * maxD * 1.1;

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
      // inspection data settling in during the first beat
      const filled = stage === 0 ? clamp01(local * 2 - d / maxD) : 1;
      // the cascade front, only during beat 1
      const front = stage === 1 ? clamp01(1 - Math.abs(wave - d) / 46) : 0;

      const honey = 0.03 + filled * 0.05;
      hex(
        c,
        rgba(front > 0.05 ? ACCENT : AMBER, (honey + front * 0.28) * a),
        rgba(front > 0.05 ? ACCENT : INK, (0.1 + filled * 0.1 + front * 0.8) * a),
        front > 0.3 ? 1.5 : 1,
      );
    }

    // the flagged cell
    if (stage >= 2) {
      const pulse = 0.6 + 0.4 * Math.sin(t * 5);
      hex(tgt, rgba(AMBER, 0.4 * a * pulse), rgba(AMBER, 0.95 * a), 1.8);
      glowDot(ctx, tgt.x, tgt.y, r * 0.5, AMBER, 0.5 * a * pulse);
    }

    // trace the conclusion back to the rule that produced it
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
      coreDot(ctx, lerp(tgt.x, src.x, p), lerp(tgt.y, src.y, p), 3, ACCENT, a);

      if (p > 0.6) {
        ctx.font = "500 8px ui-monospace, monospace";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillStyle = rgba(ACCENT, ((p - 0.6) / 0.4) * 0.9 * a);
        ctx.fillText("RULE FIRED · BROOD GAP", w / 2, h - 12);
      }
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
    const n = Math.max(6, Math.min(12, Math.floor(h / 16)));
    const lanes: Lane[] = [];
    for (let i = 0; i < n; i++) {
      lanes.push({
        y: h * (0.08 + (i / (n - 1)) * 0.84),
        speed: 0.12 + (i % 5) * 0.03,
        seed: rand(),
        keep: i % 4 === 1,
      });
    }
    void w;
    return { lanes };
  },
  draw: ({ ctx, w, h, t, progress, intro }, { lanes }) => {
    const a = ease(intro);
    // dawn is the one thing that should follow the scroll most directly
    const dawn = progress !== null ? progress : (Math.sin(t * 0.22) + 1) / 2;

    // sky: a band that rises from the bottom as dawn advances
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

    // the ranking gate
    gradientLine(ctx, gateX, h * 0.1, gateX, h * 0.9, INK, 0.04 * a, 0.16 * a, 1);

    for (const lane of lanes) {
      // the lane itself
      gradientLine(ctx, 0, lane.y, gateX, lane.y, INK, 0.03 * a, 0.1 * a, 1);

      for (let k = 0; k < 2; k++) {
        const p = (t * lane.speed + lane.seed + k * 0.5) % 1;

        if (p < 0.52) {
          // approaching the gate
          const x = (p / 0.52) * gateX;
          coreDot(ctx, x, lane.y, 1.6, INK, 0.4 * a);
          gradientLine(ctx, x - 18, lane.y, x, lane.y, INK, 0, 0.25 * a, 1);
        } else if (!lane.keep) {
          // rejected: sinks and fades just past the gate
          const k2 = (p - 0.52) / 0.48;
          const x = gateX + k2 * 40;
          const y = lane.y + k2 * 26;
          coreDot(ctx, x, y, 1.4, INK, 0.22 * (1 - k2) * a);
        } else {
          // kept: curves into the brief line
          const k2 = (p - 0.52) / 0.48;
          const x = lerp(gateX, briefX, k2);
          const y = lerp(lane.y, outY, ease(k2));
          coreDot(ctx, x, y, 2, ACCENT, 0.9 * a);
          gradientLine(ctx, gateX, lane.y, x, y, ACCENT, 0, 0.3 * a, 1);
        }
      }
    }

    // the brief
    gradientLine(ctx, briefX, outY, w * 0.96, outY, ACCENT, 0.95 * a, 0.35 * a, 2.2);
    glowDot(ctx, briefX, outY, 4, ACCENT, 0.8 * a);

    ctx.font = "500 8px ui-monospace, monospace";
    ctx.textAlign = "right";
    ctx.textBaseline = "middle";
    ctx.fillStyle = rgba(ACCENT, 0.75 * a);
    ctx.fillText("THE BRIEF", w * 0.96, outY - 12);
  },
});

/* ----------------------------------------------------------------- diavo --- */

const NUTRIENTS = ["protein", "carbs", "fat", "fibre", "iron", "calcium", "vit C"];

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
    const count = Math.min(120, Math.round((w * h) / 1400));
    for (let i = 0; i < count; i++) {
      corpus.push({ x: rand() * w, y: rand() * h, r: 0.6 + rand() * 0.9 });
    }
    // four dishes, each a set of nutrient proportions
    const dishes: number[][] = [];
    for (let d = 0; d < 4; d++) {
      const vals = NUTRIENTS.map(() => 0.25 + rand() * 0.75);
      dishes.push(vals);
    }
    return { corpus, dishes };
  },
  draw: ({ ctx, w, h, t, progress, intro }, { corpus, dishes }) => {
    const a = ease(intro);
    const clock = clockOf(t, progress, 4 * 4.5, 1);
    const cycle = 4.5;
    const which = Math.floor(clock / cycle) % dishes.length;
    const [stage, local] = phase(clock % cycle, [1, 2.2, 1.3]);
    // 0 expand, 1 hold, 2 collapse
    const open = stage === 0 ? ease(local) : stage === 1 ? 1 : 1 - ease(local);

    // the corpus behind
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

    // the nutrient ring
    ctx.font = "8px ui-monospace, monospace";
    ctx.textBaseline = "middle";

    for (let i = 0; i < NUTRIENTS.length; i++) {
      const ang = (i / NUTRIENTS.length) * Math.PI * 2 - Math.PI / 2 + t * 0.16;
      const dist = R * open * (0.62 + vals[i] * 0.38);
      const x = cx + Math.cos(ang) * dist;
      const y = cy + Math.sin(ang) * dist * 0.86;
      const size = 1.6 + vals[i] * 3.4;

      gradientLine(ctx, cx, cy, x, y, ACCENT, 0.05 * a * open, 0.4 * a * open, 1);
      coreDot(ctx, x, y, size * open, i % 3 === 0 ? ACCENT_DEEP : ACCENT, 0.85 * a * open);

      if (open > 0.75) {
        const la = (open - 0.75) / 0.25;
        ctx.textAlign = Math.cos(ang) >= 0 ? "left" : "right";
        ctx.fillStyle = rgba(INK, 0.5 * la * a);
        ctx.fillText(
          NUTRIENTS[i],
          x + (Math.cos(ang) >= 0 ? size + 6 : -size - 6),
          y,
        );
      }
    }

    // the dish itself
    coreDot(ctx, cx, cy, 5 + (1 - open) * 3, ACCENT, 0.95 * a);
    glowDot(ctx, cx, cy, 12, ACCENT, 0.3 * a);

    ctx.font = "500 8px ui-monospace, monospace";
    ctx.textAlign = "center";
    ctx.fillStyle = rgba(INK, 0.4 * a);
    ctx.fillText(`DISH ${String(which * 217 + 41).padStart(3, "0")} / 870`, cx, h - 12);
    void DEAD;
  },
});

export { banking, blocker, madhumarga, zenpro, diavo };
