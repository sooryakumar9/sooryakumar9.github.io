"use client";

import { useLayoutEffect, useRef } from "react";
import { gsap, ScrollTrigger, prefersReducedMotion } from "@/lib/gsapSetup";

/**
 * Replaces the native scrollbar with a thin rail on the right edge. The native
 * bar is hidden in CSS, so this is the only remaining scroll position readout —
 * which means it must never be decorative-only or hidden from view.
 *
 * It is deliberately not interactive: hiding a real scrollbar and replacing it
 * with a fake draggable one tends to be worse than either. Wheel, trackpad,
 * keyboard and touch scrolling are all completely untouched.
 */
export default function ScrollRail() {
  const fill = useRef<HTMLDivElement | null>(null);

  useLayoutEffect(() => {
    const el = fill.current;
    if (!el) return;

    if (prefersReducedMotion()) {
      // no scrub, but still report position on a plain scroll listener
      const onScroll = () => {
        const max = document.documentElement.scrollHeight - window.innerHeight;
        gsap.set(el, { scaleY: max > 0 ? window.scrollY / max : 0 });
      };
      onScroll();
      window.addEventListener("scroll", onScroll, { passive: true });
      return () => window.removeEventListener("scroll", onScroll);
    }

    const ctx = gsap.context(() => {
      gsap.set(el, { scaleY: 0, transformOrigin: "top center" });
      gsap.to(el, {
        scaleY: 1,
        ease: "none",
        scrollTrigger: {
          trigger: document.documentElement,
          start: "top top",
          end: "bottom bottom",
          scrub: 0.4,
          invalidateOnRefresh: true,
        },
      });
    });

    ScrollTrigger.refresh();
    return () => ctx.revert();
  }, []);

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed top-24 right-2 bottom-8 z-60 hidden w-px md:block"
      style={{ background: "var(--c-line)" }}
    >
      <div
        ref={fill}
        className="h-full w-full origin-top"
        style={{
          background:
            "linear-gradient(to bottom, var(--c-accent), var(--c-accent-deep))",
        }}
      />
    </div>
  );
}
