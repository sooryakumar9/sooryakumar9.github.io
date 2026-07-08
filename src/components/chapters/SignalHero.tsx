"use client";

import { motion } from "motion/react";
import { profile } from "@/content/profile";
import {
  PLOT_EASE,
  SET_EASE,
  SetLines,
  useReducedMotionSafe,
} from "@/components/motion/primitives";

/**
 * SHEET 00 — SIGNAL
 * Paper. Silence. One orange line traces across the sheet, passes through
 * INPUT → SYSTEM → OUTPUT, then carves out the name and continues down the
 * page. The trace is the loading sequence; there is no separate preloader.
 */

// node centers align with the 3-column HTML label grid below the svg
const NODES = [
  { label: "INPUT", sub: "a real-world problem", at: 0.3 },
  { label: "SYSTEM", sub: "software, end to end", at: 0.65 },
  { label: "OUTPUT", sub: "something people use", at: 1.0 },
] as const;

// desktop and mobile are different drawings of the same schematic
const GEOMETRY = {
  desktop: {
    viewBox: "0 0 1000 190",
    trace: "M 0 70 H 933 V 128 H 28 V 190",
    y: 70,
    xs: [167, 500, 833] as const,
    r: 7,
    rect: { w: 60, h: 38 },
  },
  mobile: {
    viewBox: "0 0 400 250",
    trace: "M 0 90 H 372 V 170 H 13 V 250",
    y: 90,
    xs: [67, 200, 333] as const,
    r: 9,
    rect: { w: 76, h: 46 },
  },
};

export default function SignalHero() {
  const reduced = useReducedMotionSafe();

  return (
    <section
      id="sec-00"
      aria-label="Signal — introduction"
      className="relative flex min-h-svh flex-col justify-between overflow-hidden pb-10 pt-24 sm:pt-28"
    >
      {/* ——— the plotter trace ——— */}
      <div className="px-0">
        <Trace geo={GEOMETRY.desktop} reduced={reduced} className="hidden sm:block" />
        <Trace geo={GEOMETRY.mobile} reduced={reduced} className="block sm:hidden" />

        {/* component annotations — HTML so they stay legible at every width */}
        <div className="grid grid-cols-3 px-[calc(max(14px,2.6vw)+14px)]">
          {NODES.map((n) =>
            reduced ? (
              <p key={n.label} className="annotation text-center">
                {n.label}
                <span className="block normal-case tracking-normal text-pencil">
                  — {n.sub}
                </span>
              </p>
            ) : (
              <motion.p
                key={n.label}
                className="annotation text-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: n.at + 0.25, duration: 0.4 }}
              >
                {n.label}
                <span className="block normal-case tracking-normal text-pencil">
                  — {n.sub}
                </span>
              </motion.p>
            ),
          )}
        </div>
      </div>

      {/* ——— the name sets ——— */}
      <div className="px-[calc(max(14px,2.6vw)+14px)]">
        <div className="pl-[max(0px,3vw)]">
          <h1
            className="font-display uppercase leading-[0.88] tracking-[-0.02em]"
            style={{
              fontSize: "clamp(3.4rem, 13.5vw, 12rem)",
              fontWeight: 800,
              fontStretch: "125%",
            }}
          >
            <SetLines
              as="span"
              lines={["Soorya", "Kumar"]}
              delay={reduced ? 0 : 1.35}
              stagger={0.12}
            />
          </h1>

          <Intro reduced={reduced} />
        </div>

        {/* the signal continues off this sheet */}
        <p
          className="annotation mt-10 overflow-hidden text-pencil"
          style={{ marginLeft: "max(0px, calc(2.6vw + 14px))" }}
        >
          {reduced ? (
            <span className="block">signal continues ↓</span>
          ) : (
            <motion.span
              className="block"
              initial={{ y: "115%" }}
              animate={{ y: "0%" }}
              transition={{ delay: 2.2, duration: 0.6, ease: SET_EASE }}
            >
              signal continues ↓
            </motion.span>
          )}
        </p>
      </div>
    </section>
  );
}

function Intro({ reduced }: { reduced: boolean }) {
  const body = (
    <>
      <p className="annotation shrink-0">
        <span className="text-signal">●</span>&nbsp;&nbsp;Full-stack software developer
        <span className="block text-pencil">
          Bengaluru&nbsp;·&nbsp;{profile.coordinates}
        </span>
      </p>
      <p className="max-w-md text-[0.95rem] leading-relaxed text-ink/80">
        {profile.thesis}
      </p>
    </>
  );
  const cls =
    "mt-6 flex max-w-3xl flex-col gap-5 sm:mt-8 sm:flex-row sm:items-start sm:gap-10";
  if (reduced) return <div className={cls}>{body}</div>;
  // masked rise, not a fade — mid-animation text keeps its final color,
  // so the reveal never races a contrast audit or a screenshot
  return (
    <div className="overflow-hidden">
      <motion.div
        className={cls}
        initial={{ y: "108%" }}
        animate={{ y: "0%" }}
        transition={{ delay: 1.8, duration: 0.7, ease: SET_EASE }}
      >
        {body}
      </motion.div>
    </div>
  );
}

function Trace({
  geo,
  reduced,
  className,
}: {
  geo: (typeof GEOMETRY)[keyof typeof GEOMETRY];
  reduced: boolean;
  className?: string;
}) {
  return (
    <svg
      viewBox={geo.viewBox}
      className={`w-full ${className ?? ""}`}
      role="img"
      aria-label="Schematic: input, six manual steps — system, something I built — output, one click"
    >
      {reduced ? (
        <path d={geo.trace} className="stroke-live" />
      ) : (
        <>
          <motion.path
            d={geo.trace}
            className="stroke-live"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1.5, ease: PLOT_EASE, delay: 0.15 }}
          />
          {/* signal flowing once the trace is complete */}
          <motion.path
            d={geo.trace}
            className="flow"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.75, duration: 0.5 }}
          />
        </>
      )}
      {/* components drawing themselves as the line arrives */}
      {NODES.map((n, i) => {
        const shape =
          i === 1
            ? {
                as: "rect" as const,
                props: {
                  x: geo.xs[i] - geo.rect.w / 2,
                  y: geo.y - geo.rect.h / 2,
                  width: geo.rect.w,
                  height: geo.rect.h,
                },
              }
            : {
                as: "circle" as const,
                props: { cx: geo.xs[i], cy: geo.y, r: geo.r },
              };
        const common = {
          className: "stroke-inked",
          style: { fill: "var(--c-paper)" },
        };
        if (reduced) {
          return shape.as === "rect" ? (
            <rect key={n.label} {...shape.props} {...common} />
          ) : (
            <circle key={n.label} {...shape.props} {...common} />
          );
        }
        const anim = {
          initial: { pathLength: 0 },
          animate: { pathLength: 1 },
          transition: { duration: 0.5, ease: PLOT_EASE, delay: n.at },
        };
        return shape.as === "rect" ? (
          <motion.rect key={n.label} {...shape.props} {...common} {...anim} />
        ) : (
          <motion.circle key={n.label} {...shape.props} {...common} {...anim} />
        );
      })}
    </svg>
  );
}
