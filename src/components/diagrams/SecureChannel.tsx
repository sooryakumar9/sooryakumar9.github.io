"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { DrawPath } from "@/components/motion/primitives";

/**
 * Two endpoints, one channel, one interceptor. Switch the key exchange and
 * watch what the tap recovers: plaintext on the classical channel, noise on
 * the post-quantum one. The classical mode is kept as the control group.
 */

type Mode = "rsa" | "pq";

const READOUT: Record<Mode, { captured: string; note: string[] }> = {
  rsa: {
    captured: '"meet at 0900, key attached"',
    note: [
      "RSA handshake recorded.",
      "Factorable by a sufficiently large",
      "quantum computer. Harvest now,",
      "decrypt later.",
    ],
  },
  pq: {
    captured: "▚▒▞▓░▚▒█▞░▓▒▚▞▒░▓█▚▒▞░",
    note: [
      "Quantum resistant exchange recorded.",
      "The recording stays noise, even",
      "to a future quantum adversary.",
      "Nothing to harvest.",
    ],
  },
};

export default function SecureChannel() {
  const [mode, setMode] = useState<Mode>("rsa");
  const r = READOUT[mode];

  return (
    <div>
      <div
        className="flex flex-wrap items-center gap-x-1 gap-y-2 border-y border-hairline py-3"
        role="group"
        aria-label="Key exchange mode"
      >
        <span className="annotation mr-3 text-pencil">KEY EXCHANGE</span>
        {(
          [
            ["rsa", "RSA · CLASSICAL"],
            ["pq", "QUANTUM RESISTANT"],
          ] as const
        ).map(([m, label]) => (
          <button
            key={m}
            data-cursor="REKEY"
            onClick={() => setMode(m)}
            aria-pressed={mode === m}
            className={`annotation px-3.5 py-1.5 transition-colors duration-150 ${
              mode === m
                ? "bg-signal text-[#131311]"
                : "text-ink/70 hover:bg-signal-soft hover:text-ink"
            }`}
          >
            {label}
          </button>
        ))}
        <span
          className={`annotation ml-auto hidden md:block ${
            mode === "rsa" ? "text-signal" : "text-pencil"
          }`}
          aria-live="polite"
        >
          {mode === "rsa" ? "CHANNEL COMPROMISED · IN TIME" : "CHANNEL HOLDS"}
        </span>
      </div>

      <svg
        viewBox="0 0 900 330"
        className="mt-2 block w-full"
        role="img"
        aria-label={`Encrypted channel between sender and receiver with an interceptor tapping the line. Current mode ${
          mode === "rsa" ? "RSA, interceptor recovers plaintext in time" : "quantum resistant, interceptor records only noise"
        }`}
      >
        {/* endpoints + channel */}
        <DrawPath d="M 60 84 a 26 26 0 1 0 52 0 a 26 26 0 1 0 -52 0" className="stroke-inked" />
        <DrawPath d="M 788 84 a 26 26 0 1 0 52 0 a 26 26 0 1 0 -52 0" className="stroke-inked" delay={0.15} />
        <DrawPath d="M 112 84 H 788" className="stroke-inked" delay={0.25} duration={1} />
        <path d="M 112 84 H 788" className="flow" />

        <text x="86" y="134" textAnchor="middle" className="svg-label">A · SENDER</text>
        <text x="814" y="134" textAnchor="middle" className="svg-label">B · RECEIVER</text>
        <text x="450" y="60" textAnchor="middle" className="svg-label">
          CHANNEL · {mode === "rsa" ? "RSA HANDSHAKE" : "QUANTUM RESISTANT HANDSHAKE"}
        </text>

        {/* the tap */}
        <DrawPath d="M 450 84 V 190" className="stroke-dashed" delay={0.5} />
        <DrawPath
          d="M 432 190 h 36 v 36 h -36 Z"
          className={mode === "rsa" ? "stroke-live" : "stroke-inked"}
          delay={0.65}
        />
        <text x="404" y="212" textAnchor="end" className={mode === "rsa" ? "svg-label-live" : "svg-label"}>
          INTERCEPTOR
        </text>
        <text x="404" y="228" textAnchor="end" className="svg-label-faint">
          records everything
        </text>

        {/* what the interceptor sees */}
        <DrawPath d="M 468 208 H 520" className="stroke-dashed" delay={0.8} />
        <path d="M 520 168 H 880 V 316 H 520 Z" className="stroke-inked" fill="none" />
        <motion.g
          key={mode}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.35 }}
        >
          <text x="538" y="194" className="svg-label-faint">RECOVERED:</text>
          <text x="538" y="218" className={mode === "rsa" ? "svg-label-live" : "svg-label"}>
            {r.captured}
          </text>
          {r.note.map((line, i) => (
            <text key={i} x="538" y={246 + i * 16} className="svg-label-faint">
              {line}
            </text>
          ))}
        </motion.g>
      </svg>
    </div>
  );
}
