"use client";

import { useEffect, useRef } from "react";
import { attach } from "./engine";
import { programs } from "./programs";
import type { SignatureVariant } from "@/content/types";
import { prefersReducedMotion, hasFinePointer } from "@/lib/gsapSetup";
import { useMotionOff } from "@/lib/motion";
import { useNearViewport } from "@/lib/nearViewport";

/**
 * Decorative generative visual for a project or the hero. Purely
 * presentational: every fact a canvas gestures at also exists as text nearby,
 * so screen readers lose nothing by skipping it.
 *
 * Every program runs on its own clock. An earlier version drove some of them
 * from scroll position, which meant that landing on a project page and not
 * moving left the banner frozen — a canvas whose motion depends on the visitor
 * scrolling is a canvas that is stopped most of the time. The engine still
 * pauses anything outside the viewport, which is what keeps ten of them cheap.
 */
export default function Signature({
  variant,
  className = "",
  /** track the cursor and let the program react to it */
  interactive = true,
  /**
   * Multiplier on the backing store. Pass the inverse of any CSS scale on an
   * ancestor: the canvas is measured after transforms, so a wrapper that scales
   * it up bills for pixels that are then clipped away.
   */
  resolution = 1,
  /**
   * Widest the drawing box may get before the program is letterboxed inside it.
   * Programs are composed for a landscape box and size their elements off the
   * shorter side, so a tall panel would otherwise scale the whole composition up.
   */
  maxAspect,
  /**
   * Build immediately instead of waiting for the canvas to approach the
   * viewport. For art that is above the fold, or that a view transition has to
   * capture the instant the page renders.
   */
  eager = false,
}: {
  variant: SignatureVariant;
  className?: string;
  interactive?: boolean;
  resolution?: number;
  maxAspect?: number;
  eager?: boolean;
}) {
  const ref = useRef<HTMLCanvasElement | null>(null);
  // re-attaches when the footer toggle moves, so the canvas swaps between the
  // live loop and the settled still frame without a reload
  const motionOff = useMotionOff();

  /*
   * Building the program is deferred until the canvas is nearly on screen.
   *
   * The engine already declines to *draw* anything offscreen, but attaching
   * still measures the element, allocates a backing store and runs `init`,
   * which for some programs assembles a whole grid. Ten canvases were paying
   * that during hydration, on the same main thread as everything else the page
   * had to do to become interactive.
   *
   * The margin is wider than the engine's own 120px draw gate on purpose, so a
   * program has finished assembling before it is asked for its first frame.
   */
  const near = useNearViewport(ref, "400px");

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas || (!near && !eager)) return;

    const program = programs[variant];
    if (!program) return;

    const reduced = prefersReducedMotion();
    const handle = attach(canvas, program, reduced, resolution, maxAspect);
    if (!handle) return;

    if (!interactive || !hasFinePointer() || reduced) {
      return () => handle.destroy();
    }

    // the engine smooths the value, so this only has to report where the
    // pointer is relative to this canvas
    const onMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      const near =
        e.clientX >= rect.left - 160 &&
        e.clientX <= rect.right + 160 &&
        e.clientY >= rect.top - 160 &&
        e.clientY <= rect.bottom + 160;
      handle.setPointer(
        near ? e.clientX - rect.left : null,
        near ? e.clientY - rect.top : null,
      );
    };
    const onLeave = () => handle.setPointer(null, null);

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerleave", onLeave);

    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerleave", onLeave);
      handle.destroy();
    };
  }, [variant, interactive, motionOff, resolution, maxAspect, eager, near]);

  return (
    <canvas
      ref={ref}
      aria-hidden
      className={`block h-full w-full ${className}`.trim()}
    />
  );
}
