"use client";

import { useEffect, useRef, useState } from "react";
import { useInView } from "motion/react";
import { DrawPath, useReducedMotionSafe } from "@/components/motion/primitives";
import { DimensionLine } from "@/components/ui/schematic";

/**
 * The RT-LAB control loop, live. The five real operations are the controls;
 * each state re-routes the flow through the schematic. Auto-cycles while in
 * view until the visitor takes over.
 */

const STAGES = [
  { op: "LOAD", note: "model + scripts pushed to RT-LAB" },
  { op: "BUILD", note: "compiled against MATLAB R2012B" },
  { op: "EXECUTE", note: "real-time run · telemetry live" },
  { op: "STOP", note: "run halted cleanly" },
  { op: "RESET", note: "lab returned to known state" },
] as const;

// structure
const P_OPERATOR = "M 78 140 H 150";
const P_FORWARD = "M 290 140 H 370 M 510 140 H 590";
const P_MATLAB = "M 440 180 V 240";
const P_TELEMETRY = "M 660 180 V 330 H 220 V 180";

export default function HilsLoop() {
  const reduced = useReducedMotionSafe();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { amount: 0.4 });
  const [stage, setStage] = useState(2);
  const [manual, setManual] = useState(false);

  useEffect(() => {
    if (!inView || manual || reduced) return;
    const t = setInterval(() => setStage((s) => (s + 1) % STAGES.length), 2400);
    return () => clearInterval(t);
  }, [inView, manual, reduced]);

  const op = STAGES[stage].op;
  const matlabLive = op === "LOAD" || op === "BUILD";
  const telemetryLive = op === "EXECUTE";

  return (
    <div ref={ref}>
      {/* instrument controls — the real operation sequence */}
      <div
        className="flex flex-wrap items-center gap-x-1 gap-y-2 border-y border-hairline py-3"
        role="group"
        aria-label="RT-LAB operation sequence"
      >
        <span className="annotation mr-3 text-pencil">SEQUENCE</span>
        {STAGES.map((s, i) => (
          <button
            key={s.op}
            data-cursor="RUN"
            onClick={() => {
              setManual(true);
              setStage(i);
            }}
            aria-pressed={i === stage}
            className={`annotation px-2.5 py-1.5 transition-colors duration-150 sm:px-3.5 ${
              i === stage
                ? "bg-signal text-[#f4f1ea]"
                : "text-ink/70 hover:bg-signal-soft hover:text-ink"
            }`}
          >
            {s.op}
          </button>
        ))}
        <span className="annotation ml-auto hidden text-signal md:block" aria-live="polite">
          STATE: {op} — {STAGES[stage].note}
        </span>
      </div>

      <svg
        viewBox="0 0 900 372"
        className="mt-2 block w-full"
        role="img"
        aria-label="Control loop: operator to web console to automation layer to RT-LAB, with MATLAB script management below and real-time telemetry returning to the console"
      >
        {/* structure draws in */}
        <g>
          <DrawPath d={P_OPERATOR} className="stroke-inked" />
          <DrawPath d={P_FORWARD} className="stroke-inked" delay={0.15} />
          <DrawPath d={P_MATLAB} className="stroke-dashed" delay={0.3} />
          <DrawPath d={P_TELEMETRY} className="stroke-dashed" delay={0.4} duration={1.1} />
          <DrawPath
            d="M 62 124 a 16 16 0 1 0 32 0 a 16 16 0 1 0 -32 0 M 78 140 V 156"
            className="stroke-inked"
          />
          <DrawPath d="M 150 100 H 290 V 180 H 150 Z" className="stroke-inked" delay={0.1} />
          <DrawPath d="M 370 100 H 510 V 180 H 370 Z" className="stroke-inked" delay={0.25} />
          <DrawPath d="M 590 100 H 730 V 180 H 590 Z" className="stroke-inked" delay={0.4} />
          <DrawPath d="M 370 240 H 510 V 300 H 370 Z" className="stroke-dashed" delay={0.5} />
        </g>

        {/* live flow, re-routed by state */}
        <path d={P_OPERATOR} className="flow" />
        <path d={P_FORWARD} className="flow" />
        {matlabLive && <path d={P_MATLAB} className="flow" />}
        {telemetryLive && <path d={P_TELEMETRY} className="flow" />}

        {/* labels */}
        <text x="78" y="185" textAnchor="middle" className="svg-label">OPERATOR</text>
        <text x="78" y="199" textAnchor="middle" className="svg-label-faint">one click</text>

        <text x="220" y="132" textAnchor="middle" className="svg-label">WEB CONSOLE</text>
        <text x="220" y="148" textAnchor="middle" className="svg-label-faint">auth · uploads</text>
        <text x="220" y="162" textAnchor="middle" className="svg-label-faint">validation</text>

        <text x="440" y="132" textAnchor="middle" className="svg-label">AUTOMATION</text>
        <text x="440" y="148" textAnchor="middle" className="svg-label-faint">python 2.6.4</text>
        <text x="440" y="162" textAnchor="middle" className="svg-label-faint">sequencing</text>

        <text x="660" y="132" textAnchor="middle" className="svg-label">RT-LAB</text>
        <text x="660" y="148" textAnchor="middle" className="svg-label-faint">simulation</text>
        <text x="660" y="162" textAnchor="middle" className="svg-label-faint">hardware-in-loop</text>

        <text x="440" y="266" textAnchor="middle" className="svg-label">MATLAB R2012B</text>
        <text x="440" y="282" textAnchor="middle" className="svg-label-faint">script management</text>
        <text x="440" y="294" textAnchor="middle" className="svg-label-faint">syntax gate</text>

        <text x="440" y="352" textAnchor="middle" className={telemetryLive ? "svg-label-live" : "svg-label-faint"}>
          REAL-TIME TELEMETRY {telemetryLive ? "— LIVE" : ""}
        </text>
      </svg>

      <div className="mt-6 grid gap-4 sm:grid-cols-[1fr_auto] sm:items-end">
        <div className="annotation space-y-1.5">
          <p className="text-pencil">
            BEFORE — the operator walked load, build, execute, stop, reset by hand,
            every session
          </p>
          <p>
            AFTER — <span className="text-signal">the sequence is issued by the system</span>
          </p>
        </div>
        <div className="w-full sm:w-72">
          <DimensionLine label="≈70% manual effort removed" />
        </div>
      </div>
    </div>
  );
}
