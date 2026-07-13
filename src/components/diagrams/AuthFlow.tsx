"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { DrawPath } from "@/components/motion/primitives";

/**
 * The banking login, drawn as a gate. A stolen password walks straight to
 * the money on its own; add the face factor and the imposter is stopped at
 * the second gate while the real account holder passes. Toggle the factor
 * and watch what reaches the account.
 */

type Mode = "password" | "face";

const READOUT: Record<Mode, string> = {
  password: "PASSWORD ONLY: a leaked password opens the account",
  face: "PASSWORD AND FACE: the imposter stops at the face gate",
};

export default function AuthFlow() {
  const [mode, setMode] = useState<Mode>("password");
  const faceOn = mode === "face";

  return (
    <div>
      <div
        className="flex flex-wrap items-center gap-x-1 gap-y-2 border-y border-hairline py-3"
        role="group"
        aria-label="Authentication factors"
      >
        <span className="annotation mr-3 text-pencil">FACTORS</span>
        {(
          [
            ["password", "PASSWORD ONLY"],
            ["face", "PASSWORD + FACE"],
          ] as const
        ).map(([m, label]) => (
          <button
            key={m}
            data-cursor="TOGGLE"
            onClick={() => setMode(m)}
            aria-pressed={mode === m}
            className={`annotation px-3.5 py-1.5 transition-colors duration-150 ${
              mode === m
                ? "bg-signal text-[#f4f1ea]"
                : "text-ink/70 hover:bg-signal-soft hover:text-ink"
            }`}
          >
            {label}
          </button>
        ))}
        <span
          className={`annotation ml-auto hidden md:block ${faceOn ? "text-signal" : "text-pencil"}`}
          aria-live="polite"
        >
          {faceOn ? "ACCOUNT PROTECTED" : "ONE STOLEN SECRET AWAY"}
        </span>
      </div>

      <svg
        viewBox="0 0 900 340"
        className="mt-2 block w-full"
        role="img"
        aria-label={`Banking login flow. An imposter holding a stolen password passes the password gate. ${
          faceOn
            ? "With the face factor on, the imposter is stopped at the face match gate and only the real account holder reaches the account."
            : "With password only, the imposter reaches the account and the transactions."
        }`}
      >
        {/* the two arrivals */}
        <text x="40" y="96" className="svg-label">ACCOUNT HOLDER</text>
        <text x="40" y="112" className="svg-label-faint">right password, right face</text>
        <circle cx="150" cy="150" r="7" className="fill-none stroke-inked" />

        <text x="40" y="236" className={faceOn ? "svg-label" : "svg-label-live"}>IMPOSTER</text>
        <text x="40" y="252" className="svg-label-faint">stolen password only</text>
        <circle cx="150" cy="210" r="7" className={faceOn ? "fill-none stroke-inked" : "fill-signal"} />

        {/* password gate */}
        <DrawPath d="M 157 150 H 250 M 157 210 H 250" className="stroke-inked" />
        <DrawPath d="M 250 110 V 250" className="stroke-inked" delay={0.2} />
        <text x="250" y="98" textAnchor="middle" className="svg-label">PASSWORD</text>
        <text x="250" y="270" textAnchor="middle" className="svg-label-faint">both know it now</text>
        {/* both pass the password gate */}
        <path d="M 157 150 H 250" className="flow" />
        <path d="M 157 210 H 250" className="flow" />

        {/* face gate */}
        <DrawPath d="M 250 150 H 440 M 250 210 H 440" className="stroke-inked" delay={0.3} />
        <DrawPath d="M 440 110 V 250" className={faceOn ? "stroke-live" : "stroke-dashed"} delay={0.4} />
        <text x="440" y="98" textAnchor="middle" className={faceOn ? "svg-label-live" : "svg-label-faint"}>
          FACE MATCH {faceOn ? "" : "(OFF)"}
        </text>

        {/* holder always continues */}
        <path d="M 250 150 H 440" className="flow" />
        <DrawPath d="M 440 150 H 640" className="stroke-inked" delay={0.5} />
        <path d="M 440 150 H 640" className="flow" />

        {/* imposter: blocked at face gate when on, else continues */}
        <path d="M 250 210 H 440" className="flow" />
        <motion.g animate={{ opacity: faceOn ? 1 : 0 }} transition={{ duration: 0.25 }}>
          <path d="M 452 200 l 16 16 M 468 200 l -16 16" className="stroke-live" />
          <text x="470" y="238" className="svg-label-live">STOPPED</text>
        </motion.g>
        <motion.g animate={{ opacity: faceOn ? 0.12 : 1 }} transition={{ duration: 0.3 }}>
          <path d="M 440 210 H 640" className={faceOn ? "stroke-dashed" : "stroke-inked"} />
          {!faceOn && <path d="M 440 210 H 640" className="flow" />}
        </motion.g>

        {/* the account and its operations */}
        <DrawPath d="M 640 90 H 860 V 270 H 640 Z" className="stroke-inked" delay={0.5} />
        <text x="750" y="120" textAnchor="middle" className="svg-label">THE ACCOUNT</text>
        <text x="750" y="150" textAnchor="middle" className="svg-label-faint">session · REST APIs</text>
        {["BALANCE", "TRANSFER", "HISTORY"].map((op, i) => (
          <text key={op} x="662" y={186 + i * 26} className="svg-label-faint">
            ▸ {op}
          </text>
        ))}
        {!faceOn && (
          <text x="750" y="290" textAnchor="middle" className="svg-label-live">
            REACHED BY THE IMPOSTER
          </text>
        )}
      </svg>

      <p className="annotation mt-4 border-t border-hairline pt-3 text-signal" aria-live="polite">
        {READOUT[mode]}
      </p>
    </div>
  );
}
