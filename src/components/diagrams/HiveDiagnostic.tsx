"use client";

import { useEffect, useRef, useState } from "react";
import { useInView } from "motion/react";
import { DrawPath, useReducedMotionSafe } from "@/components/motion/primitives";

/**
 * Madhu-Marga's Hive Doctor, drawn as architecture — not simulated.
 * Five structured observations feed a rule-based engine; four registers
 * come out. Selecting a signal traces the information flow. No diagnostic
 * rules are invented here: the drawing shows how the system is shaped,
 * not what the production engine would decide.
 */

const SIGNALS = [
  { label: "QUEEN PRESENCE", y: 60 },
  { label: "PEST SIGHTINGS", y: 122 },
  { label: "HIVE ACTIVITY", y: 184 },
  { label: "TEMPERATURE", y: 246 },
  { label: "HONEY FLOW", y: 308 },
] as const;

const OUTPUTS = [
  { label: "HEALTH SCORE", sub: "0–100%", y: 76 },
  { label: "RISK LEVEL", sub: "classified", y: 148 },
  { label: "DIAGNOSIS", sub: "explained", y: 220 },
  { label: "RECOMMENDED ACTION", sub: "actionable", y: 292 },
] as const;

// flat-left hexagon centred at (450,184)
const HEX = "M 522 184 L 486 246 L 414 246 L 378 184 L 414 122 L 486 122 Z";
const HEX_IN = { x: 388, y: 184 }; // where input paths land
const HEX_OUT = { x: 514, y: 184 }; // where output paths leave

export default function HiveDiagnostic() {
  const reduced = useReducedMotionSafe();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { amount: 0.4 });
  const [signal, setSignal] = useState(0);
  const [manual, setManual] = useState(false);

  useEffect(() => {
    if (!inView || manual || reduced) return;
    const t = setInterval(() => setSignal((s) => (s + 1) % SIGNALS.length), 2200);
    return () => clearInterval(t);
  }, [inView, manual, reduced]);

  const inPath = (y: number) => `M 210 ${y} H 300 L ${HEX_IN.x} ${HEX_IN.y}`;
  const outPath = (y: number) => `M ${HEX_OUT.x} ${HEX_OUT.y} L 600 ${y} H 640`;

  return (
    <div ref={ref}>
      <div
        className="flex flex-wrap items-center gap-x-1 gap-y-2 border-y border-hairline py-3"
        role="group"
        aria-label="Structured hive observations"
      >
        <span className="annotation mr-3 text-pencil">OBSERVATIONS</span>
        {SIGNALS.map((s, i) => (
          <button
            key={s.label}
            data-cursor="TRACE"
            onClick={() => {
              setManual(true);
              setSignal(i);
            }}
            aria-pressed={i === signal}
            className={`annotation px-2 py-1.5 !text-[10px] transition-colors duration-150 sm:px-3 sm:!text-[11px] ${
              i === signal
                ? "bg-signal text-[#f4f1ea]"
                : "text-ink/70 hover:bg-signal-soft hover:text-ink"
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      <svg
        viewBox="0 0 900 370"
        className="mt-2 block w-full"
        role="img"
        aria-label="Architecture of the Hive Doctor: five structured observations — queen presence, pest sightings, hive activity, temperature, honey flow — feed a rule-based hive intelligence engine, which produces a health score, a risk classification, a diagnosis and a recommended action"
      >
        {/* observation nodes */}
        {SIGNALS.map((s, i) => (
          <g key={s.label}>
            <text
              x="196"
              y={s.y + 4}
              textAnchor="end"
              className={i === signal ? "svg-label-live" : "svg-label"}
            >
              {s.label}
            </text>
            <DrawPath d={inPath(s.y)} className="stroke-inked" delay={i * 0.07} duration={0.5} />
            <circle
              cx="210"
              cy={s.y}
              r="4.5"
              className={i === signal ? "fill-signal" : "fill-none stroke-inked"}
            />
            {i === signal && <path d={inPath(s.y)} className="flow" />}
          </g>
        ))}

        {/* the engine — one hexagon, the only hive geometry on the sheet */}
        <DrawPath d={HEX} className="stroke-inked" delay={0.4} duration={0.8} />
        <text x="450" y="170" textAnchor="middle" className="svg-label">HIVE</text>
        <text x="450" y="186" textAnchor="middle" className="svg-label">INTELLIGENCE</text>
        <text x="450" y="202" textAnchor="middle" className="svg-label">ENGINE</text>
        <text x="450" y="272" textAnchor="middle" className="svg-label-faint">
          rule-based · heuristic
        </text>
        <text x="450" y="288" textAnchor="middle" className="svg-label-faint">
          expert logic, encoded — no ML
        </text>

        {/* output registers */}
        {OUTPUTS.map((o, i) => (
          <g key={o.label}>
            <DrawPath d={outPath(o.y)} className="stroke-inked" delay={0.6 + i * 0.07} duration={0.5} />
            <path d={outPath(o.y)} className="flow" />
            <line
              x1="640"
              x2="880"
              y1={o.y + 12}
              y2={o.y + 12}
              stroke="var(--c-hairline-strong)"
              strokeWidth="1"
            />
            <text x="640" y={o.y + 4} className="svg-label">▸ {o.label}</text>
            <text x="880" y={o.y + 4} textAnchor="end" className="svg-label-faint">
              {o.sub}
            </text>
          </g>
        ))}
      </svg>

      <p className="annotation mt-3 border-t border-hairline pt-3 text-signal" aria-live="polite">
        TRACING — {SIGNALS[signal].label} → ENGINE → OUTPUT REGISTERS
      </p>
    </div>
  );
}
