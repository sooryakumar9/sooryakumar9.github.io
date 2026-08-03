"use client";

import { useRef, useState } from "react";
import type { Architecture as Arch } from "@/content/types";

/**
 * A steppable system diagram.
 *
 * The structure here is deliberate: the **steps are the content** and the SVG
 * is decoration. Each step is a real button in an ordered list carrying its own
 * title and explanation, so the whole thing is readable and operable with the
 * diagram ignored entirely — which is what a screen reader, a search crawler
 * and a visitor with scripting disabled all get. The picture only ever
 * reinforces what the list already says.
 */
export default function Architecture({ arch, title }: { arch: Arch; title: string }) {
  const [active, setActive] = useState(0);
  const btnRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const step = arch.steps[active];
  const lit = new Set(step.nodes);

  const onKeyDown = (e: React.KeyboardEvent) => {
    const last = arch.steps.length - 1;
    let next: number | null = null;
    if (e.key === "ArrowDown" || e.key === "ArrowRight") next = active === last ? 0 : active + 1;
    if (e.key === "ArrowUp" || e.key === "ArrowLeft") next = active === 0 ? last : active - 1;
    if (e.key === "Home") next = 0;
    if (e.key === "End") next = last;
    if (next === null) return;
    e.preventDefault();
    setActive(next);
    btnRefs.current[next]?.focus();
  };

  // geometry in a fixed viewBox; the SVG scales to whatever width it gets
  const CW = 200;
  const CH = 110;
  const NW = 150;
  const NH = 54;
  const W = arch.cols * CW;
  // extra room under the last row for backward edges that bow beneath it
  const H = arch.rows * CH + 34;

  const at = (id: string) => {
    const n = arch.nodes.find((x) => x.id === id);
    if (!n) return { x: 0, y: 0 };
    return { x: n.col * CW + CW / 2, y: n.row * CH + CH / 2 };
  };

  type P = { x: number; y: number };

  /**
   * Route an edge between two node centres.
   *
   * A same-row edge running backwards — the "state streams back" arrows — has
   * to bow around the row, because a straight line would be drawn straight
   * through every node sitting between the two ends.
   */
  const edgePath = (a: P, b: P) => {
    if (a.y === b.y) {
      if (b.x > a.x) return `M ${a.x + NW / 2} ${a.y} L ${b.x - NW / 2} ${b.y}`;
      const dip = a.y + NH / 2 + 26;
      return `M ${a.x} ${a.y + NH / 2}
              C ${a.x} ${dip}, ${b.x} ${dip}, ${b.x} ${b.y + NH / 2}`;
    }
    const mid = (a.y + b.y) / 2;
    const from = a.y + (b.y > a.y ? NH / 2 : -NH / 2);
    const to = b.y + (b.y > a.y ? -NH / 2 : NH / 2);
    return `M ${a.x} ${from} C ${a.x} ${mid}, ${b.x} ${mid}, ${b.x} ${to}`;
  };

  return (
    <section aria-labelledby="arch-heading" className="mb-12">
      <h2 id="arch-heading" className="display mb-2 text-2xl md:text-3xl">
        How it fits together
      </h2>
      <p className="text-muted mb-6 text-sm">
        {arch.steps.length} steps through the {title} architecture.
      </p>

      <div className="rounded-frame border-line bg-surface overflow-hidden border">
        {/* decoration: everything it shows is stated in the list below */}
        <div aria-hidden className="border-line overflow-x-auto border-b p-4 md:p-6">
          <svg
            viewBox={`0 0 ${W} ${H}`}
            className="h-auto w-full min-w-[560px]"
            role="presentation"
          >
            {arch.edges.map((e) => {
              const a = at(e.from);
              const b = at(e.to);
              const on = lit.has(e.from) && lit.has(e.to);
              return (
                <path
                  key={`${e.from}-${e.to}`}
                  d={edgePath(a, b)}
                  fill="none"
                  stroke={on ? "var(--c-accent)" : "var(--c-line-strong)"}
                  strokeWidth={on ? 2 : 1.2}
                  strokeDasharray={e.back ? "5 5" : undefined}
                  className="transition-all duration-400"
                />
              );
            })}

            {arch.nodes.map((n) => {
              const p = at(n.id);
              const on = lit.has(n.id);
              const planned = n.status === "planned";
              return (
                <g key={n.id} className="transition-all duration-400">
                  <rect
                    x={p.x - NW / 2}
                    y={p.y - NH / 2}
                    width={NW}
                    height={NH}
                    rx={14}
                    fill={on ? "var(--c-accent-soft)" : "var(--c-surface-2)"}
                    stroke={on ? "var(--c-accent)" : "var(--c-line-strong)"}
                    strokeWidth={on ? 2 : 1.2}
                    strokeDasharray={planned ? "6 4" : undefined}
                    className="transition-all duration-400"
                  />
                  <text
                    x={p.x}
                    y={p.y + 1}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fontSize={15}
                    fill={on ? "var(--c-accent)" : "var(--c-muted)"}
                    className="transition-all duration-400"
                    style={{ fontFamily: "var(--f-mono, ui-monospace, monospace)" }}
                  >
                    {n.label}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        {/* the content: a real ordered list of steps, each a button */}
        <div className="grid md:grid-cols-2">
          <ol onKeyDown={onKeyDown} className="border-line md:border-r">
            {arch.steps.map((s, i) => (
              <li key={s.title}>
                <button
                  ref={(el) => {
                    btnRefs.current[i] = el;
                  }}
                  type="button"
                  aria-current={i === active ? "step" : undefined}
                  tabIndex={i === active ? 0 : -1}
                  onClick={() => setActive(i)}
                  className={`border-line flex w-full items-start gap-3 border-b px-5 py-3.5 text-left text-sm transition-colors ${
                    i === active ? "text-fg bg-accent-soft" : "text-muted hover:text-fg"
                  }`}
                >
                  <span
                    className={`mt-0.5 font-mono text-xs ${
                      i === active ? "text-accent" : "text-muted"
                    }`}
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span>{s.title}</span>
                </button>
              </li>
            ))}
          </ol>

          <div className="p-5 md:p-7">
            <p className="text-muted leading-relaxed md:text-lg">{step.body}</p>
          </div>
        </div>

        {/*
          Without scripting the buttons cannot switch panels, so the full set of
          explanations is emitted here instead. Every step stays readable.
        */}
        <noscript>
          <ol className="divide-line border-line divide-y border-t px-5 py-4 md:px-7">
            {arch.steps.map((s) => (
              <li key={s.title} className="py-3">
                <p className="text-fg text-sm">{s.title}</p>
                <p className="text-muted mt-1 text-sm leading-relaxed">{s.body}</p>
              </li>
            ))}
          </ol>
        </noscript>
      </div>
    </section>
  );
}
