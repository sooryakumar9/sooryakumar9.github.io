"use client";

import { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring } from "motion/react";
import { useMediaQuery, useReducedMotionSafe } from "@/components/motion/primitives";

/**
 * Crosshair annotation that follows the cursor near interactive schematic
 * elements. Reads the label from the nearest [data-cursor] ancestor.
 * Fine pointers only; never rendered on touch or under reduced motion.
 */
export default function CursorLabel() {
  const reduced = useReducedMotionSafe();
  const enabled = useMediaQuery("(pointer: fine)");
  const [label, setLabel] = useState<string | null>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 400, damping: 40 });
  const sy = useSpring(y, { stiffness: 400, damping: 40 });

  useEffect(() => {
    if (!enabled) return;

    const onMove = (e: PointerEvent) => {
      x.set(e.clientX + 18);
      y.set(e.clientY + 14);
      const target = (e.target as Element | null)?.closest?.("[data-cursor]");
      setLabel(target ? target.getAttribute("data-cursor") : null);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [enabled, x, y]);

  if (reduced || !enabled) return null;

  return (
    <motion.div
      aria-hidden
      className="pointer-events-none fixed left-0 top-0 z-[60]"
      style={{ x: sx, y: sy, opacity: label ? 1 : 0 }}
      transition={{ opacity: { duration: 0.15 } }}
    >
      <span className="annotation flex items-center gap-1.5 bg-ink px-2 py-1 !text-[10px] text-paper">
        <span className="text-signal">+</span>
        {label}
      </span>
    </motion.div>
  );
}
