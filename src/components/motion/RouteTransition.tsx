"use client";

import { usePathname } from "next/navigation";
import { useLayoutEffect, useRef } from "react";
import { gsap, prefersReducedMotion } from "@/lib/gsapSetup";

const PANELS = 5;

/**
 * Wipes on navigation. A row of panels sweeps up across the viewport and then
 * clears, so a route change reads as a deliberate cut rather than a flash of
 * new content.
 *
 * This runs *after* the new route has already rendered, because App Router
 * gives no pre-navigation hook without intercepting every link. So the wipe
 * covers, then uncovers, and the reveal is the moment you see the new page.
 * It skips the very first paint (the opening panel owns that) and does nothing
 * at all under reduced motion.
 */
export default function RouteTransition() {
  const pathname = usePathname();
  const root = useRef<HTMLDivElement | null>(null);
  const first = useRef(true);

  useLayoutEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }

    const el = root.current;
    if (!el || prefersReducedMotion()) return;

    const ctx = gsap.context(() => {
      const panels = gsap.utils.toArray<HTMLElement>(".rt-panel", el);
      gsap.set(el, { pointerEvents: "none", visibility: "visible" });

      gsap
        .timeline({ onComplete: () => gsap.set(el, { visibility: "hidden" }) })
        // cover from the bottom
        .fromTo(
          panels,
          { yPercent: 100 },
          { yPercent: 0, duration: 0.42, ease: "power3.inOut", stagger: 0.045 },
        )
        // then keep going in the same direction rather than retreating,
        // which reads as one continuous sweep instead of a bounce
        .to(panels, {
          yPercent: -100,
          duration: 0.46,
          ease: "power3.inOut",
          stagger: 0.045,
        });
    }, el);

    return () => ctx.revert();
  }, [pathname]);

  return (
    <div
      ref={root}
      aria-hidden
      className="pointer-events-none fixed inset-0 z-95 flex invisible"
    >
      {Array.from({ length: PANELS }, (_, i) => (
        <div key={i} className="rt-panel bg-bg h-full flex-1" />
      ))}
    </div>
  );
}
