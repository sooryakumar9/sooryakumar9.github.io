"use client";

import { useLayoutEffect, useRef } from "react";
import { gsap, prefersReducedMotion } from "@/lib/gsapSetup";

/**
 * Endless horizontal band. The group is rendered twice and both copies are
 * translated by exactly one group width, so the seam never shows. The second
 * copy is hidden from assistive tech since it repeats the same words.
 *
 * With motion reduced the belt holds still and reads as a static list.
 */
export default function Marquee({
  items,
  duration = 22,
  separator = "✳",
}: {
  items: readonly string[];
  duration?: number;
  separator?: string;
}) {
  const ref = useRef<HTMLDivElement | null>(null);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion()) return;

    const ctx = gsap.context(() => {
      gsap.to(".marquee-group", {
        xPercent: -100,
        repeat: -1,
        duration,
        ease: "none",
      });
    }, el);

    return () => ctx.revert();
  }, [duration]);

  const group = (hidden: boolean) => (
    <div
      aria-hidden={hidden || undefined}
      className="marquee-group flex shrink-0 items-center gap-6 pr-6 md:gap-10 md:pr-10"
    >
      {items.map((item) => (
        <span key={item} className="flex shrink-0 items-center gap-6 md:gap-10">
          <span
            className="display whitespace-nowrap"
            style={{ fontSize: "clamp(26px, 5vw, 64px)", lineHeight: 1 }}
          >
            {item}
          </span>
          <span aria-hidden className="star-spin text-lg md:text-2xl" style={{ color: "#0b6f60" }}>
            {separator}
          </span>
        </span>
      ))}
    </div>
  );

  return (
    // the one light band on an otherwise uniformly dark page. It breaks the
    // scroll into two halves and stops the whole site reading as one long
    // block of near black.
    <div
      ref={ref}
      className="bg-fg text-bg relative flex overflow-hidden py-5 md:py-7"
    >
      {group(false)}
      {group(true)}
    </div>
  );
}
