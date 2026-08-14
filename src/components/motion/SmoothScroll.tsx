"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { gsap, ScrollTrigger, prefersReducedMotion, hasFinePointer } from "@/lib/gsapSetup";
import { useMotionOff } from "@/lib/motion";
import { completeNavigation, registerLenis } from "@/lib/smoothScroll";
import { afterIntro } from "@/lib/afterIntro";

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
  const pathname = usePathname();

  /*
   * The navigation watcher lives here because this component is mounted once
   * in the layout and never unmounts. The link that was clicked almost always
   * has, by the time the new route renders — a project card does not exist on
   * the case study page — so a pathname effect on the link itself never fires,
   * and the scroll reset it was supposed to perform silently never happened.
   */
  useEffect(() => {
    completeNavigation(pathname);
  }, [pathname]);

  useEffect(() => {
    if (prefersReducedMotion() || !hasFinePointer()) return;

    /*
     * Lenis arrives on its own, after the opening.
     *
     * It is 31KB that has to be parsed and compiled before hydration can
     * finish, and none of it is needed until the visitor scrolls — which they
     * cannot do while the panel is up and `body` is `overflow: hidden`. Loading
     * it here takes that parse off the path to first paint entirely.
     */
    let lenis: import("lenis").default | undefined;
    let tick: ((time: number) => void) | undefined;
    let cancelled = false;

    const stop = afterIntro(() => {
      void import("lenis").then(({ default: Lenis }) => {
        if (cancelled) return;
        lenis = new Lenis({
          duration: 1.05,
          easing: (t: number) => 1 - Math.pow(1 - t, 3),
        });

        document.documentElement.classList.add("lenis-active");
        // navigation needs to be able to put the scroll back to the top without
        // Lenis writing the old position back on the next frame
        registerLenis(lenis);

        lenis.on("scroll", ScrollTrigger.update);

        tick = (time: number) => lenis!.raf(time * 1000);
        gsap.ticker.add(tick);
        gsap.ticker.lagSmoothing(0);
      });
    });

    return () => {
      cancelled = true;
      stop();
      if (tick) gsap.ticker.remove(tick);
      registerLenis(null);
      lenis?.destroy();
      document.documentElement.classList.remove("lenis-active");
    };
  }, [motionOff]);

  return null;
}
