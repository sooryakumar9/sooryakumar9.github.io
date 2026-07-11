"use client";

import { useEffect, useRef, useState } from "react";
import {
  motion,
  useInView,
  useMotionValueEvent,
  useScroll,
} from "motion/react";
import {
  DrawPath,
  useMediaQuery,
  useReducedMotionSafe,
} from "@/components/motion/primitives";

/**
 * The retrieval pipeline, live: a resume decomposes into chunks, the chunks
 * become points in an embedding field beside scraped openings, a query sweeps
 * the field, and grounded output emits. Scroll-scrubbed on fine pointers;
 * a stepped sequence everywhere else.
 */

const STAGES = [
  "01 PARSE · the resume is read and split into chunks",
  "02 CHUNK · sections become retrievable units",
  "03 EMBED + INDEX · chunks join scraped openings in FAISS",
  "04 RETRIEVE · semantic nearest neighbours, not keyword luck",
  "05 REASON · GPT grounds feedback, roles and openings in what it retrieved",
] as const;

const DOC = Array.from({ length: 12 }, (_, i) => ({ x: 115, y: 116 + i * 15 }));
const MID = Array.from({ length: 12 }, (_, i) => ({
  x: 242 + (i % 3) * 24,
  y: 108 + i * 16,
}));
const FIELD = [
  { x: 390, y: 120 }, { x: 430, y: 210 }, { x: 370, y: 260 }, { x: 470, y: 100 },
  { x: 520, y: 180 }, { x: 560, y: 250 }, { x: 410, y: 160 }, { x: 500, y: 270 },
  { x: 590, y: 140 }, { x: 450, y: 230 }, { x: 550, y: 110 }, { x: 600, y: 220 },
];
const JOBS = [
  { x: 360, y: 100 }, { x: 395, y: 180 }, { x: 360, y: 230 }, { x: 420, y: 250 },
  { x: 455, y: 140 }, { x: 480, y: 210 }, { x: 505, y: 95 }, { x: 530, y: 240 },
  { x: 560, y: 170 }, { x: 585, y: 100 }, { x: 610, y: 190 }, { x: 600, y: 270 },
  { x: 500, y: 160 }, { x: 440, y: 110 }, { x: 380, y: 150 }, { x: 620, y: 120 },
];
const QUERY = { x: 490, y: 185 };
const RETRIEVED = [1, 5, 8, 12];

export default function RagPipeline() {
  const reduced = useReducedMotionSafe();
  const fine = useMediaQuery("(pointer: fine)");
  const wide = useMediaQuery("(min-width: 1024px)");
  const scrub = fine && wide && !reduced;

  return scrub ? <ScrubMode /> : <StepMode reduced={reduced} />;
}

function ScrubMode() {
  const ref = useRef<HTMLDivElement>(null);
  const [stage, setStage] = useState(0);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 0.65", "end 0.95"],
  });
  useMotionValueEvent(scrollYProgress, "change", (p) => {
    setStage(Math.max(0, Math.min(4, Math.floor(p * 5))));
  });

  return (
    <div ref={ref} className="h-[280vh]">
      <div className="sticky top-[max(4rem,12vh)]">
        <Scene stage={stage} />
        <p className="annotation mt-3 text-pencil">scroll to advance the pipeline</p>
      </div>
    </div>
  );
}

function StepMode({ reduced }: { reduced: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { amount: 0.4 });
  const [stage, setStage] = useState(0);
  const [manual, setManual] = useState(false);

  useEffect(() => {
    if (!inView || manual || reduced) return;
    const t = setInterval(() => setStage((s) => (s + 1) % 5), 2600);
    return () => clearInterval(t);
  }, [inView, manual, reduced]);

  return (
    <div ref={ref}>
      <Scene stage={stage} />
      <div className="mt-3 flex items-center gap-1" role="group" aria-label="Pipeline stages">
        {STAGES.map((_, i) => (
          <button
            key={i}
            onClick={() => {
              setManual(true);
              setStage(i);
            }}
            aria-pressed={i === stage}
            aria-label={`Stage ${i + 1}`}
            className={`annotation px-3 py-1.5 transition-colors ${
              i === stage
                ? "bg-signal text-[#f4f1ea]"
                : "text-ink/60 hover:bg-signal-soft hover:text-ink"
            }`}
          >
            0{i + 1}
          </button>
        ))}
      </div>
    </div>
  );
}

function Scene({ stage }: { stage: number }) {
  const chunkPos = stage === 0 ? DOC : stage === 1 ? MID : FIELD;
  const spring = { type: "spring" as const, stiffness: 70, damping: 17 };
  const fieldOn = stage >= 2;
  const retrieveOn = stage >= 3;
  const reasonOn = stage >= 4;

  return (
    <div>
      <svg
        viewBox="0 0 900 430"
        className="block w-full"
        role="img"
        aria-label="Retrieval pipeline: a resume document is chunked, embedded into a FAISS index next to scraped job openings, semantically retrieved, and reasoned over by GPT models to produce feedback, roles and openings"
      >
        {/* the resume */}
        <DrawPath d="M 40 80 H 190 V 340 H 40 Z M 40 80" className="stroke-inked" />
        {Array.from({ length: 12 }, (_, i) => (
          <line
            key={i}
            x1={132}
            x2={i % 3 === 2 ? 156 : 176}
            y1={116 + i * 15}
            y2={116 + i * 15}
            stroke="var(--c-hairline-strong)"
            strokeWidth="1.5"
          />
        ))}
        <text x="40" y="66" className="svg-label">RESUME.PDF</text>
        <text x="40" y="362" className="svg-label-faint">one document in</text>

        {/* embedding field */}
        <motion.g initial={{ opacity: 0 }} animate={{ opacity: fieldOn ? 1 : 0 }} transition={{ duration: 0.4 }}>
          <path d="M 340 70 H 640 V 310 H 340 Z" className="stroke-dashed" />
          <text x="340" y="56" className="svg-label">FAISS INDEX · EMBEDDING SPACE</text>
          <text x="340" y="332" className="svg-label-faint">∘ scraped openings · linkedin · selenium</text>
          <text x="340" y="348" className="svg-label-faint">● resume chunks</text>
          {JOBS.map((p, i) => (
            <circle
              key={i}
              cx={p.x}
              cy={p.y}
              r={3.5}
              className={
                retrieveOn && RETRIEVED.includes(i)
                  ? "fill-signal"
                  : "fill-none stroke-pencil"
              }
            />
          ))}
        </motion.g>

        {/* resume chunks travelling through the system */}
        {chunkPos.map((p, i) => (
          <motion.circle
            key={i}
            r={4}
            className="fill-ink"
            initial={false}
            animate={{ cx: p.x, cy: p.y }}
            transition={{ ...spring, delay: i * 0.025 }}
          />
        ))}

        {/* query + retrieval */}
        <motion.g initial={{ opacity: 0 }} animate={{ opacity: retrieveOn ? 1 : 0 }} transition={{ duration: 0.35 }}>
          {RETRIEVED.map((idx) => (
            <line
              key={idx}
              x1={QUERY.x}
              y1={QUERY.y}
              x2={JOBS[idx].x}
              y2={JOBS[idx].y}
              stroke="var(--c-signal)"
              strokeWidth="1.25"
            />
          ))}
          <path
            d={`M ${QUERY.x - 9} ${QUERY.y} H ${QUERY.x + 9} M ${QUERY.x} ${QUERY.y - 9} V ${QUERY.y + 9}`}
            className="stroke-live"
          />
          <text x={QUERY.x + 14} y={QUERY.y - 10} className="svg-label-live">QUERY</text>
        </motion.g>

        {/* reasoning + output */}
        <motion.g initial={{ opacity: 0 }} animate={{ opacity: reasonOn ? 1 : 0 }} transition={{ duration: 0.4 }}>
          <path d="M 640 190 H 700" className={reasonOn ? "flow" : "stroke-dashed"} />
          <path d="M 700 100 H 870 V 180 H 700 Z" className="stroke-inked" />
          <text x="785" y="132" textAnchor="middle" className="svg-label">GPT MODELS</text>
          <text x="785" y="148" textAnchor="middle" className="svg-label-faint">langchain pipeline</text>
          <text x="785" y="162" textAnchor="middle" className="svg-label-faint">grounded in retrieval</text>
          <path d="M 785 180 V 210" className={reasonOn ? "flow" : "stroke-dashed"} />
          {["PERSONALIZED FEEDBACK", "SUITABLE ROLES", "RELEVANT OPENINGS"].map(
            (label, i) => (
              <g key={label}>
                <path
                  d={`M 700 ${222 + i * 34} H 870`}
                  stroke="var(--c-hairline-strong)"
                  strokeWidth="1"
                  fill="none"
                />
                <text x="700" y={216 + i * 34} className="svg-label">
                  ▸ {label}
                </text>
              </g>
            ),
          )}
        </motion.g>
      </svg>

      <p className="annotation mt-4 border-t border-hairline pt-3 text-signal" aria-live="polite">
        {STAGES[stage]}
      </p>
    </div>
  );
}
