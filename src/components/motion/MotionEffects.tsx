"use client";

import { useEffect } from "react";
import { gsap } from "@/lib/gsapSetup";
import { onMotionChange } from "@/lib/motion";

/**
 * Stops everything GSAP is already running when motion is switched off.
 *
 * Components that check `prefersReducedMotion()` at mount cover the case where
 * motion is off before the page loads, but they cannot help with a toggle
 * thrown mid-visit: their tweens already exist. Pausing the global timeline
 * catches all of them at once — the marquee, the scroll rail, the cursor
 * easing, every quickTo — instead of threading a dependency through a dozen
 * components.
 *
 * Reveal tweens are paused too, which would strand a section at zero opacity
 * were it not for `[data-motion="off"] .js-reveal { opacity: 1 !important }`.
 * That rule beats GSAP's inline style and is what makes this safe.
 *
 * Renders nothing.
 */
export default function MotionEffects() {
  useEffect(
    () =>
      onMotionChange((off) => {
        if (off) gsap.globalTimeline.pause();
        else gsap.globalTimeline.resume();
      }),
    [],
  );

  return null;
}
