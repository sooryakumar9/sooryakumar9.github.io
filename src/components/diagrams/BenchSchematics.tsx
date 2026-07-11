"use client";

import { DrawPath } from "@/components/motion/primitives";

/**
 * Bench schematics · deliberately unfinished drawings.
 * Stroke semantics carry the honesty: inked = exists,
 * dashed = being built, pencil = being explored.
 */

/**
 * Product previews · small drawn fragments that hint at what each bench
 * project feels like as a product, in the same ink language.
 */
export function ZenproBriefPreview() {
  const items = [
    { y: 74, tick: 16, live: true },
    { y: 116, tick: 12, live: false },
    { y: 158, tick: 9, live: false },
    { y: 200, tick: 6, live: false },
  ];
  return (
    <svg
      viewBox="0 0 220 260"
      className="block w-full max-w-[220px]"
      role="img"
      aria-label="Sketch of the ZenPro morning brief interface: a masthead and four ranked entries with relevance ticks"
    >
      <DrawPath d="M 8 8 H 212 V 252 H 8 Z" className="stroke-inked" />
      <text x="20" y="32" className="svg-label">MORNING BRIEF</text>
      <text x="20" y="48" className="svg-label-faint">ranked for one reader</text>
      <line x1="20" y1="58" x2="200" y2="58" stroke="var(--c-hairline-strong)" />
      {items.map((it, i) => (
        <g key={i}>
          <rect
            x="20"
            y={it.y}
            width="5"
            height={it.tick}
            className={it.live ? "fill-signal" : "fill-none stroke-pencil"}
          />
          <line x1="36" y1={it.y + 4} x2="196" y2={it.y + 4} stroke="var(--c-hairline-strong)" />
          <line x1="36" y1={it.y + 16} x2={140 - i * 12} y2={it.y + 16} stroke="var(--c-hairline)" />
        </g>
      ))}
      <text x="20" y="240" className="svg-label-faint">read by 07:30 ☕</text>
    </svg>
  );
}

export function DiavoPlatePreview() {
  return (
    <svg
      viewBox="0 0 220 260"
      className="block w-full max-w-[220px]"
      role="img"
      aria-label="Pencil sketch of a dinner plate with a measurement line · food, measured gently"
    >
      <DrawPath d="M 110 40 a 78 78 0 1 0 0.1 0 Z" className="stroke-pencil" duration={1} />
      <DrawPath d="M 110 70 a 48 48 0 1 0 0.1 0 Z" className="stroke-pencil" delay={0.3} />
      {/* dimension line across the plate */}
      <line x1="32" y1="208" x2="188" y2="208" stroke="var(--c-signal)" strokeWidth="1.2" />
      <line x1="32" y1="202" x2="32" y2="214" stroke="var(--c-signal)" strokeWidth="1.2" />
      <line x1="188" y1="202" x2="188" y2="214" stroke="var(--c-signal)" strokeWidth="1.2" />
      <text x="110" y="232" textAnchor="middle" className="svg-label-faint">
        what&apos;s actually on the plate?
      </text>
      <text x="110" y="248" textAnchor="middle" className="svg-label-faint">
        answered like a product, not a database
      </text>
    </svg>
  );
}

export function DiavoSchematic() {
  return (
    <svg
      viewBox="0 0 900 250"
      className="block w-full"
      role="img"
      aria-label="Draft schematic: food data flows into a product core being built, toward everyday dietary decisions. Most strokes are still pencil."
    >
      {/* exists · problem framing */}
      <DrawPath d="M 60 40 H 840" className="stroke-inked" duration={1} />
      <text x="60" y="28" className="svg-label">PROBLEM FRAMING · SETTLED</text>

      {/* explored ends */}
      <DrawPath d="M 60 100 H 220 V 180 H 60 Z" className="stroke-pencil" delay={0.2} />
      <text x="140" y="132" textAnchor="middle" className="svg-label-faint">FOOD +</text>
      <text x="140" y="148" textAnchor="middle" className="svg-label-faint">NUTRITION DATA</text>
      <text x="140" y="164" textAnchor="middle" className="svg-label-faint">structure · exploring</text>

      <DrawPath d="M 680 100 H 840 V 180 H 680 Z" className="stroke-pencil" delay={0.4} />
      <text x="760" y="132" textAnchor="middle" className="svg-label-faint">EVERYDAY</text>
      <text x="760" y="148" textAnchor="middle" className="svg-label-faint">DECISIONS</text>
      <text x="760" y="164" textAnchor="middle" className="svg-label-faint">interface · exploring</text>

      {/* being built · the core */}
      <DrawPath d="M 360 90 H 540 V 190 H 360 Z" className="stroke-dashed" delay={0.3} />
      <text x="450" y="128" textAnchor="middle" className="svg-label">PRODUCT CORE</text>
      <text x="450" y="146" textAnchor="middle" className="svg-label-faint">understanding food</text>
      <text x="450" y="162" textAnchor="middle" className="svg-label-faint">in progress</text>

      <DrawPath d="M 220 140 H 360" className="stroke-pencil" delay={0.5} />
      <DrawPath d="M 540 140 H 680" className="stroke-pencil" delay={0.6} />

      <text x="60" y="232" className="svg-label-faint">STACK · TO BE PUBLISHED · details land here as the product firms up</text>
    </svg>
  );
}

export function ZenproSchematic() {
  const sources = ["tech", "ai", "markets", "dev", "jobs"];
  return (
    <svg
      viewBox="0 0 900 300"
      className="block w-full"
      role="img"
      aria-label="Draft schematic: many sources feed an aggregation pipeline · ingest, embed, rank · ending in a morning brief. Ingest and brief are dashed, being built; embedding and ranking are pencil, being explored."
    >
      {/* exists · the architecture line */}
      <DrawPath d="M 60 40 H 840" className="stroke-inked" duration={1} />
      <text x="60" y="28" className="svg-label">ARCHITECTURE SKETCHED END TO END · FIRST BUILD LIVE</text>

      {/* sources */}
      {sources.map((s, i) => (
        <g key={s}>
          <DrawPath
            d={`M 60 ${84 + i * 38} H 150 V ${110 + i * 38} H 60 Z`}
            className="stroke-pencil"
            delay={0.1 + i * 0.06}
          />
          <text x="105" y={101 + i * 38} textAnchor="middle" className="svg-label-faint">
            {s}
          </text>
          <DrawPath d={`M 150 ${97 + i * 38} L 250 160`} className="stroke-pencil" delay={0.4} />
        </g>
      ))}

      {/* ingest · being built */}
      <DrawPath d="M 250 120 H 370 V 200 H 250 Z" className="stroke-dashed" delay={0.5} />
      <text x="310" y="152" textAnchor="middle" className="svg-label">INGEST</text>
      <text x="310" y="168" textAnchor="middle" className="svg-label-faint">aggregation</text>
      <text x="310" y="184" textAnchor="middle" className="svg-label-faint">pipeline</text>
      <text x="310" y="222" textAnchor="middle" className="svg-label-faint">supabase · postgres · planned</text>

      {/* embed · exploring */}
      <DrawPath d="M 370 160 H 420" className="stroke-dashed" delay={0.6} />
      <DrawPath d="M 420 120 H 540 V 200 H 420 Z" className="stroke-pencil" delay={0.65} />
      <text x="480" y="152" textAnchor="middle" className="svg-label-faint">EMBED</text>
      <text x="480" y="168" textAnchor="middle" className="svg-label-faint">semantic</text>
      <text x="480" y="184" textAnchor="middle" className="svg-label-faint">exploring</text>

      {/* rank · exploring */}
      <DrawPath d="M 540 160 H 590" className="stroke-pencil" delay={0.7} />
      <DrawPath d="M 590 120 H 700 V 200 H 590 Z" className="stroke-pencil" delay={0.75} />
      <text x="645" y="152" textAnchor="middle" className="svg-label-faint">RANK</text>
      <text x="645" y="168" textAnchor="middle" className="svg-label-faint">relevance</text>
      <text x="645" y="184" textAnchor="middle" className="svg-label-faint">exploring</text>
      <text x="645" y="222" textAnchor="middle" className="svg-label-faint">cache · redis, planned</text>

      {/* brief · being built */}
      <DrawPath d="M 700 160 H 740" className="stroke-pencil" delay={0.8} />
      <DrawPath d="M 740 110 H 880 V 210 H 740 Z" className="stroke-dashed" delay={0.85} />
      <text x="810" y="146" textAnchor="middle" className="svg-label">MORNING</text>
      <text x="810" y="162" textAnchor="middle" className="svg-label">BRIEF</text>
      <text x="810" y="182" textAnchor="middle" className="svg-label-faint">read by 07:30</text>
      <text x="810" y="234" textAnchor="middle" className="svg-label-faint">next.js · typescript</text>

      <text x="60" y="286" className="svg-label-faint">
        AI SUMMARIZATION + RECOMMENDATIONS · exploring across embed / rank / brief
      </text>
    </svg>
  );
}
