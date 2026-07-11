"use client";

import { useMemo, useState } from "react";
import { buildGraph } from "@/lib/graph";
import { profile } from "@/content/profile";
import { SheetMarker } from "@/components/ui/schematic";
import { Settle, SetLines } from "@/components/motion/primitives";

/**
 * SHEET 04 · THE GRAPH
 * Projects as primary nodes, technologies as satellites, edges = actual
 * usage (solid) or honest plans (dashed). Fundamentals sit beneath as the
 * substrate · which is exactly what fundamentals are.
 */
export default function Graph() {
  const { nodes, edges } = useMemo(() => buildGraph(), []);
  const [active, setActive] = useState<string | null>(null);

  const highlighted = useMemo(() => {
    if (!active) return null;
    const set = new Set<string>([active]);
    for (const e of edges) {
      if (e.from === active) set.add(e.to);
      if (e.to === active) set.add(e.from);
    }
    return set;
  }, [active, edges]);

  // second ring: when a technology is active, the other technologies of the
  // projects that use it get mid-emphasis · the neighbourhood stays readable
  const related = useMemo(() => {
    if (!active || !highlighted) return null;
    const activeNode = nodes.find((n) => n.id === active);
    if (activeNode?.kind !== "tech") return null;
    const set = new Set<string>();
    for (const e of edges) {
      if (highlighted.has(e.from) && !highlighted.has(e.to)) set.add(e.to);
    }
    return set;
  }, [active, highlighted, nodes, edges]);

  const dim = (id: string) => {
    if (!highlighted) return 1;
    if (highlighted.has(id)) return 1;
    if (related?.has(id)) return 0.55;
    return 0.15;
  };

  // the readout under the sheet · cramped hover tooltips don't survive touch
  const readout = useMemo(() => {
    if (!active) return "HOVER OR TAP A NODE · EVERY EDGE IS REAL USAGE";
    const node = nodes.find((n) => n.id === active);
    if (!node) return "";
    if (node.kind === "project") {
      const techs = edges.filter((e) => e.from === active).map((e) => e.to.slice(2));
      return node.draft
        ? `${node.label} · ON THE BENCH · PLANNED: ${techs.join(" · ") || "STACK TO BE PUBLISHED"}`
        : `${node.label} · BUILT WITH ${techs.join(" · ")}`;
    }
    const touching = edges.filter((e) => e.to === active);
    const proven = touching.filter((e) => !e.planned).length;
    const planned = touching.filter((e) => e.planned).length;
    const parts: string[] = [];
    if (proven > 0) parts.push(`PROVEN IN ${proven} BUILT SYSTEM${proven > 1 ? "S" : ""}`);
    if (planned > 0) parts.push("EXPLORING ON THE BENCH");
    return `${node.label.toUpperCase()} · ${parts.join(" · ")}`;
  }, [active, nodes, edges]);

  return (
    <section
      id="sec-05"
      aria-label="The graph · capability map"
      className="px-[calc(max(14px,2.6vw)+14px)] py-28 sm:py-36"
    >
      <div className="mx-auto max-w-6xl">
        <SheetMarker num="05" title="THE GRAPH" right="EVERY EDGE IS A PROJECT THAT USED IT" />

        <div className="mt-10 flex flex-wrap items-end justify-between gap-6">
          <SetLines
            as="h2"
            lines={["Capability,", "as built"]}
            className="font-display uppercase leading-[0.9] tracking-[-0.02em]"
            lineClassName="[font-stretch:120%]"
            style={{ fontSize: "clamp(2.6rem, 7vw, 6rem)", fontWeight: 800 }}
          />
          <p className="annotation max-w-xs text-pencil">
            no logo walls, no progress bars. touch a node and the edges are
            the résumé
          </p>
        </div>

        <div className="mt-12 overflow-x-auto" onMouseLeave={() => setActive(null)}>
          <svg
            viewBox="0 0 1000 620"
            className="block min-w-[720px]"
            role="group"
            aria-label="Interactive graph of projects and the technologies they use"
          >
            {/* the substrate · fundamentals */}
            {profile.fundamentals.map((f, i) => (
              <text
                key={f}
                x={70 + (i % 3) * 320}
                y={330 + Math.floor(i / 3) * 255}
                className="svg-label-faint"
                opacity={0.5}
                aria-hidden
              >
                · {f.toUpperCase()}
              </text>
            ))}

            {/* edges */}
            {edges.map((e) => {
              const a = nodes.find((n) => n.id === e.from)!;
              const b = nodes.find((n) => n.id === e.to)!;
              const lit =
                highlighted !== null &&
                highlighted.has(e.from) &&
                highlighted.has(e.to) &&
                (active === e.from || active === e.to);
              return (
                <line
                  key={`${e.from}-${e.to}`}
                  x1={a.x}
                  y1={a.y}
                  x2={b.x}
                  y2={b.y}
                  stroke={
                    lit
                      ? "var(--c-signal)"
                      : "color-mix(in srgb, var(--c-ink) 45%, transparent)"
                  }
                  strokeWidth={lit ? 1.7 : 1.2}
                  strokeDasharray={e.planned ? "5 5" : undefined}
                  opacity={highlighted && !lit ? 0.2 : 1}
                  style={{ transition: "stroke 0.2s, opacity 0.2s" }}
                />
              );
            })}

            {/* nodes */}
            {nodes.map((n) => (
              <g
                key={n.id}
                role="button"
                tabIndex={0}
                aria-label={`${n.label} · ${n.kind === "project" ? "project" : "technology"}${n.draft ? ", in development" : ""}`}
                data-cursor="TRACE"
                onMouseEnter={() => setActive(n.id)}
                onFocus={() => setActive(n.id)}
                onBlur={() => setActive(null)}
                onClick={() => setActive((cur) => (cur === n.id ? null : n.id))}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setActive((cur) => (cur === n.id ? null : n.id));
                  }
                }}
                opacity={dim(n.id)}
                style={{ transition: "opacity 0.2s", cursor: "pointer", outline: "none" }}
              >
                {n.kind === "project" ? (
                  <>
                    <rect
                      x={n.x - 78}
                      y={n.y - 22}
                      width={156}
                      height={44}
                      className={n.draft ? "stroke-dashed" : "stroke-inked"}
                      style={{
                        fill: "var(--c-paper)",
                        ...(active === n.id ? { stroke: "var(--c-signal)" } : null),
                      }}
                    />
                    <text
                      x={n.x}
                      y={n.y + 4}
                      textAnchor="middle"
                      className={active === n.id ? "svg-label-live" : "svg-label"}
                    >
                      {n.label}
                    </text>
                  </>
                ) : (
                  <>
                    <circle
                      cx={n.x}
                      cy={n.y}
                      r={5}
                      className={
                        active === n.id
                          ? "fill-signal"
                          : n.draft
                            ? "fill-none stroke-pencil"
                            : "fill-ink"
                      }
                    />
                    <text
                      x={n.x}
                      y={n.y - 12}
                      textAnchor="middle"
                      className={
                        active === n.id
                          ? "svg-label-live"
                          : n.draft
                            ? "svg-label-faint"
                            : "svg-label"
                      }
                      style={{ fontSize: 12 }}
                    >
                      {n.label}
                      {n.draft ? " *" : ""}
                    </text>
                  </>
                )}
              </g>
            ))}
          </svg>
        </div>
        <p className="annotation mt-2 text-pencil lg:hidden">← drag the sheet to pan →</p>

        {/* live readout · works for hover and for touch */}
        <p
          className="annotation mt-5 min-h-[1.5em] border-t border-hairline-strong pt-3 text-signal"
          aria-live="polite"
        >
          {readout}
        </p>

        <Settle>
          <div className="mt-5 grid gap-4 border-t border-hairline pt-5 md:grid-cols-2">
            <p className="annotation text-pencil">
              SOLID EDGE · used in a shipped system&nbsp;&nbsp;·&nbsp;&nbsp;DASHED
              EDGE / * · planned on the bench
            </p>
            <p className="annotation text-pencil md:text-right">
              ALSO IN THE DRAWER · {profile.additionalTooling.join(" · ")}
            </p>
          </div>
        </Settle>
      </div>
    </section>
  );
}
