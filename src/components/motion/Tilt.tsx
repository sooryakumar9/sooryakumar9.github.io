"use client";

import {
  useLayoutEffect,
  useRef,
  type ComponentPropsWithoutRef,
  type ReactNode,
} from "react";
import { gsap, prefersReducedMotion, hasFinePointer } from "@/lib/gsapSetup";

/**
 * Cursor-driven depth on a card.
 *
 * The card tilts toward the pointer and its layers separate: whatever carries
 * `data-depth` is pushed on the Z axis by that amount, so the artwork sits
 * behind and the text floats forward. A soft light tracks the surface.
 *
 * Transform and opacity only — this runs on a page already carrying ten live
 * canvases, and touching layout properties here would cost frames.
 *
 * Mouse only, inert under reduced motion, and `pointer-events: none` on the
 * light so the card's full-area link stays clickable everywhere.
 */
export default function Tilt({
  children,
  className = "",
  max = 6,
  ...rest
}: {
  children: ReactNode;
  className?: string;
  /** peak rotation in degrees */
  max?: number;
} & Omit<ComponentPropsWithoutRef<"div">, "className" | "children">) {
  const root = useRef<HTMLDivElement | null>(null);

  useLayoutEffect(() => {
    const el = root.current;
    if (!el) return;
    if (prefersReducedMotion() || !hasFinePointer()) return;

    const layers = Array.from(el.querySelectorAll<HTMLElement>("[data-depth]"));
    const light = el.querySelector<HTMLElement>("[data-tilt-light]");

    const rx = gsap.quickTo(el, "rotationX", { duration: 0.5, ease: "power3.out" });
    const ry = gsap.quickTo(el, "rotationY", { duration: 0.5, ease: "power3.out" });
    const layerTweens = layers.map((l) => ({
      el: l,
      z: gsap.quickTo(l, "z", { duration: 0.5, ease: "power3.out" }),
      depth: Number(l.dataset.depth) || 0,
    }));

    gsap.set(el, { transformPerspective: 900, transformStyle: "preserve-3d" });

    const onEnter = () => gsap.to(el, { scale: 1.012, duration: 0.4, ease: "power3.out" });

    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;

      ry(px * max * 2);
      rx(-py * max * 2);
      for (const l of layerTweens) l.z(l.depth);

      if (light) {
        light.style.background = `radial-gradient(circle at ${(px + 0.5) * 100}% ${
          (py + 0.5) * 100
        }%, rgba(94,234,212,0.10), transparent 55%)`;
      }
    };

    const onLeave = () => {
      rx(0);
      ry(0);
      for (const l of layerTweens) l.z(0);
      gsap.to(el, { scale: 1, duration: 0.5, ease: "power3.out" });
      if (light) light.style.background = "transparent";
    };

    el.addEventListener("pointerenter", onEnter);
    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerleave", onLeave);

    return () => {
      el.removeEventListener("pointerenter", onEnter);
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", onLeave);
      gsap.killTweensOf([el, ...layers]);
      gsap.set(el, { clearProps: "all" });
    };
  }, [max]);

  return (
    <div ref={root} className={className} {...rest}>
      {children}
      <span
        aria-hidden
        data-tilt-light
        className="pointer-events-none absolute inset-0 rounded-[inherit] transition-opacity"
      />
    </div>
  );
}
