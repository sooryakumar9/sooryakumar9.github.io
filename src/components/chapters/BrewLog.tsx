"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { DrawPath, useReducedMotionSafe } from "@/components/motion/primitives";

/**
 * Easter egg. Every schematic in this document is a system Soorya runs;
 * this is the one that runs Soorya.
 */
export default function BrewLog() {
  const [open, setOpen] = useState(false);
  const reduced = useReducedMotionSafe();

  return (
    <div className="flex flex-col items-end">
      <button
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        data-cursor={open ? "SEAL" : "BREW"}
        className="margin-note cursor-pointer text-right transition-colors hover:text-signal"
      >
        fig. ☕ · the system that runs the operator
      </button>

      <AnimatePresence>
        {open && (
          <motion.figure
            initial={reduced ? false : { opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={reduced ? undefined : { opacity: 0, height: 0 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <svg
              viewBox="0 0 260 190"
              className="mt-4 block w-64"
              role="img"
              aria-label="Schematic of a V60 pour over: kettle at 93 degrees, a 1 to 15 ratio, total brew time 2 minutes 45 seconds, output one engineer, operational"
            >
              {/* kettle */}
              <DrawPath d="M 30 30 h 50 v 26 h -50 Z M 80 38 l 16 -8" className="stroke-inked" />
              <text x="30" y="22" className="svg-label-faint">93°C</text>
              {/* pour */}
              <DrawPath d="M 100 34 C 118 40 126 52 128 66" className="stroke-live" delay={0.3} />
              {/* v60 cone */}
              <DrawPath d="M 96 70 H 164 L 138 112 H 122 Z" className="stroke-inked" delay={0.5} />
              <text x="172" y="80" className="svg-label-faint">ratio 1:15</text>
              {/* drip */}
              <DrawPath d="M 130 112 V 132" className="stroke-dashed" delay={0.8} />
              {/* cup */}
              <DrawPath d="M 108 136 h 44 v 24 h -44 Z" className="stroke-inked" delay={0.9} />
              <text x="172" y="126" className="svg-label-faint">t = 2:45</text>
              <text x="30" y="180" className="svg-label">OUTPUT · ONE ENGINEER, OPERATIONAL</text>
            </svg>
          </motion.figure>
        )}
      </AnimatePresence>
    </div>
  );
}
