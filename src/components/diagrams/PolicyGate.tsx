"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { DrawPath } from "@/components/motion/primitives";

/**
 * A policy gate, two beats: requests hit the filter, the block list decides.
 * Arm the exam window and watch the gate close on distraction.
 */

const REQUESTS = [
  { label: "social feed", y: 70, blocked: true },
  { label: "video site", y: 110, blocked: true },
  { label: "explicit content", y: 150, blocked: true },
  { label: "exam portal", y: 190, blocked: false },
  { label: "reference docs", y: 230, blocked: false },
] as const;

export default function PolicyGate() {
  const [armed, setArmed] = useState(true);

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3 border-y border-hairline py-3">
        <span className="annotation text-pencil">EXAM WINDOW · 09:00 to 12:00</span>
        <button
          data-cursor="TOGGLE"
          onClick={() => setArmed((a) => !a)}
          aria-pressed={armed}
          className={`annotation px-3.5 py-1.5 transition-colors duration-150 ${
            armed
              ? "bg-signal text-[#f4f1ea]"
              : "text-ink/70 outline outline-1 outline-hairline-strong hover:bg-signal-soft"
          }`}
        >
          {armed ? "ARMED" : "DISARMED"}
        </button>
        <span className="annotation ml-auto hidden text-pencil sm:block" aria-live="polite">
          {armed ? "BLOCK LIST ENFORCED · REAL TIME" : "OUTSIDE WINDOW · ALL TRAFFIC PASSES"}
        </span>
      </div>

      <svg
        viewBox="0 0 900 290"
        className="mt-2 block w-full"
        role="img"
        aria-label={`Policy gate: five request lines approach a filter. ${
          armed
            ? "Exam window armed · distracting and explicit sites terminate at the gate, the exam portal and reference docs pass through to the lab machine."
            : "Disarmed · all traffic passes."
        }`}
      >
        {REQUESTS.map((r, i) => {
          const stopped = armed && r.blocked;
          return (
            <g key={r.label}>
              <text x="30" y={r.y + 4} className="svg-label-faint">{r.label}</text>
              <DrawPath
                d={`M 165 ${r.y} H 420`}
                className="stroke-inked"
                delay={i * 0.08}
                duration={0.5}
              />
              <motion.g initial={{ opacity: 0 }} animate={{ opacity: stopped ? 1 : 0 }} transition={{ duration: 0.25 }}>
                <path
                  d={`M 414 ${r.y - 6} l 12 12 M 426 ${r.y - 6} l -12 12`}
                  className="stroke-live"
                />
              </motion.g>
              <motion.path
                d={`M 440 ${r.y} H 640 L 700 150`}
                className="stroke-inked"
                initial={{ opacity: 1 }}
                animate={{ opacity: stopped ? 0.12 : 1 }}
                transition={{ duration: 0.3 }}
              />
              {!stopped && <path d={`M 165 ${r.y} H 420 M 440 ${r.y} H 640 L 700 150`} className="flow" />}
            </g>
          );
        })}

        {/* the gate */}
        <DrawPath d="M 420 40 V 260 M 440 40 V 260" className="stroke-inked" delay={0.3} />
        <text x="430" y="28" textAnchor="middle" className="svg-label">GATE</text>
        <text x="430" y="280" textAnchor="middle" className="svg-label-faint">
          customizable block list
        </text>

        {/* destination */}
        <DrawPath d="M 700 110 H 860 V 190 H 700 Z" className="stroke-inked" delay={0.5} />
        <text x="780" y="146" textAnchor="middle" className="svg-label">LAB MACHINE</text>
        <text x="780" y="162" textAnchor="middle" className="svg-label-faint">
          {armed ? "exam traffic only" : "open"}
        </text>

        {/* schedule dial */}
        <g>
          <circle cx="820" cy="52" r="26" className="fill-none stroke-pencil" strokeWidth="1.2" />
          <motion.path
            d="M 820 26 A 26 26 0 0 1 846 52"
            className="stroke-live"
            initial={{ opacity: 1 }}
            animate={{ opacity: armed ? 1 : 0.2 }}
          />
          <line x1="820" y1="52" x2="820" y2="33" stroke="var(--c-ink)" strokeWidth="1.2" />
          <line x1="820" y1="52" x2="833" y2="52" stroke="var(--c-ink)" strokeWidth="1.2" />
          <text x="820" y="94" textAnchor="middle" className="svg-label-faint">scheduled</text>
        </g>
      </svg>
    </div>
  );
}
