"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import { gsap, ScrollTrigger, prefersReducedMotion, hasFinePointer } from "@/lib/gsapSetup";
import { useMotionOff } from "@/lib/motion";

/**
 * Lenis smooth scrolling, desktop fine pointer only, disabled entirely under
 * prefers-reduced-motion. Touch devices keep native scrolling.
 *
 * Lenis is driven from GSAP's ticker rather than its own rAF so that scroll
 * position and every ScrollTrigger read happen in the same frame. Without
 * this, pinned sections judder by a frame under smooth scroll.
 */
export default function SmoothScroll() {
  // Lenis is torn down and rebuilt when motion is toggled; its easing is
  // itself motion, so leaving it running would only half honour the switch
  const motionOff = useMotionOff();

  useEffect(() => {
    if (prefersReducedMotion() || !hasFinePointer()) return;

    const lenis = new Lenis({
      duration: 1.05,
      easing: (t: number) => 1 - Math.pow(1 - t, 3),
    });

    document.documentElement.classList.add("lenis-active");

    lenis.on("scroll", ScrollTrigger.update);

    const tick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(tick);
      lenis.destroy();
      document.documentElement.classList.remove("lenis-active");
    };
  }, [motionOff]);

  return null;
}
