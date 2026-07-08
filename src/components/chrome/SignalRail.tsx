"use client";

import { motion, useScroll, useSpring, useTransform } from "motion/react";
import { useReducedMotionSafe } from "@/components/motion/primitives";

/**
 * The signal — a continuous orange line in the left margin that travels
 * the length of the document as the visitor scrolls. It is the site's
 * only progress indication.
 */
export default function SignalRail() {
  const reduced = useReducedMotionSafe();
  const { scrollYProgress } = useScroll();
  const smooth = useSpring(scrollYProgress, { stiffness: 120, damping: 28, mass: 0.4 });
  const tipY = useTransform(smooth, (v) => `calc(${v} * (100vh - 10px))`);
  const tipOpacity = useTransform(smooth, [0, 0.01], [0, 1]);

  if (reduced) {
    return (
      <div
        aria-hidden
        className="pointer-events-none fixed inset-y-0 left-[max(14px,2.6vw)] z-40 w-px opacity-30"
        style={{ background: "var(--c-signal)" }}
      />
    );
  }

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-y-0 left-[max(14px,2.6vw)] z-40"
    >
      <motion.div
        className="h-full w-px origin-top"
        style={{ scaleY: smooth, background: "var(--c-signal)" }}
      />
      <motion.div
        className="absolute -left-[3.5px] top-0 size-[8px] rounded-full"
        style={{ y: tipY, opacity: tipOpacity, background: "var(--c-signal)" }}
      />
    </div>
  );
}
