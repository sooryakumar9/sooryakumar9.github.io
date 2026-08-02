"use client";

import { useLayoutEffect, useRef, type ReactNode } from "react";
import { gsap, prefersReducedMotion, hasFinePointer } from "@/lib/gsapSetup";

/**
 * Pulls its child toward the cursor once the pointer is inside a radius around
 * it, and springs back on leave. Mouse only, and never under reduced motion.
 *
 * The wrapper stays `display: contents` so it adds no box of its own and cannot
 * disturb the layout of whatever it wraps — the transform is applied to the
 * child element directly.
 */
export default function Magnetic({
  children,
  strength = 0.35,
  radius = 90,
}: {
  children: ReactNode;
  /** fraction of the cursor offset the element travels */
  strength?: number;
  /** how far outside the element the pull begins, in px */
  radius?: number;
}) {
  const holder = useRef<HTMLSpanElement | null>(null);

  useLayoutEffect(() => {
    const el = holder.current?.firstElementChild as HTMLElement | null;
    if (!el) return;
    if (prefersReducedMotion() || !hasFinePointer()) return;

    const xTo = gsap.quickTo(el, "x", { duration: 0.5, ease: "power3.out" });
    const yTo = gsap.quickTo(el, "y", { duration: 0.5, ease: "power3.out" });

    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      const cx = r.left + r.width / 2;
      const cy = r.top + r.height / 2;
      const dx = e.clientX - cx;
      const dy = e.clientY - cy;

      // inside the element's own box plus the radius
      const within =
        Math.abs(dx) < r.width / 2 + radius && Math.abs(dy) < r.height / 2 + radius;

      if (within) {
        xTo(dx * strength);
        yTo(dy * strength);
      } else {
        xTo(0);
        yTo(0);
      }
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onMove);
      gsap.killTweensOf(el);
      gsap.set(el, { x: 0, y: 0 });
    };
  }, [strength, radius]);

  return (
    <span ref={holder} style={{ display: "contents" }}>
      {children}
    </span>
  );
}
