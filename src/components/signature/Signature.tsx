"use client";

import { useEffect, useRef } from "react";
import { attach } from "./engine";
import { programs } from "./programs";
import type { SignatureVariant } from "@/content/types";
import { gsap, ScrollTrigger, prefersReducedMotion, hasFinePointer } from "@/lib/gsapSetup";

/**
 * Decorative generative visual for a project or the hero. Purely
 * presentational: every fact a canvas gestures at also exists as text nearby,
 * so screen readers lose nothing by skipping it.
 */
export default function Signature({
  variant,
  className = "",
  /** track the cursor and let the program react to it */
  interactive = true,
  /**
   * Drive the program from scroll position rather than the clock. The canvas's
   * own travel through the viewport becomes the timeline, so scrolling past a
   * card steps its animation through its phases.
   */
  scrollDriven = false,
}: {
  variant: SignatureVariant;
  className?: string;
  interactive?: boolean;
  scrollDriven?: boolean;
}) {
  const ref = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;

    const program = programs[variant];
    if (!program) return;

    const reduced = prefersReducedMotion();
    const handle = attach(canvas, program, reduced);
    if (!handle) return;

    const cleanups: (() => void)[] = [() => handle.destroy()];

    if (scrollDriven && !reduced) {
      const st = ScrollTrigger.create({
        trigger: canvas,
        start: "top bottom",
        end: "bottom top",
        onUpdate: (self) => handle.setProgress(self.progress),
      });
      cleanups.push(() => st.kill());
    }

    if (interactive && hasFinePointer() && !reduced) {
      // quickTo would be overkill here: the engine already smooths the value,
      // this just reports where the pointer is relative to this canvas
      const onMove = (e: PointerEvent) => {
        const rect = canvas.getBoundingClientRect();
        const inside =
          e.clientX >= rect.left - 160 &&
          e.clientX <= rect.right + 160 &&
          e.clientY >= rect.top - 160 &&
          e.clientY <= rect.bottom + 160;
        handle.setPointer(
          inside ? e.clientX - rect.left : null,
          inside ? e.clientY - rect.top : null,
        );
      };
      const onLeave = () => handle.setPointer(null, null);

      window.addEventListener("pointermove", onMove, { passive: true });
      window.addEventListener("pointerleave", onLeave);
      cleanups.push(() => {
        window.removeEventListener("pointermove", onMove);
        window.removeEventListener("pointerleave", onLeave);
      });
    }

    // late layout shifts (fonts, pinned sections) move the trigger bounds
    if (scrollDriven && !reduced) gsap.delayedCall(0.4, () => ScrollTrigger.refresh());

    return () => cleanups.forEach((fn) => fn());
  }, [variant, interactive, scrollDriven]);

  return (
    <canvas
      ref={ref}
      aria-hidden
      className={`block h-full w-full ${className}`.trim()}
    />
  );
}
