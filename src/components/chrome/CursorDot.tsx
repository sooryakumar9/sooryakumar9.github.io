"use client";

import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsapSetup";
import { FINE_POINTER, useMediaQuery } from "@/lib/clientEnv";
import { useMotionOff } from "@/lib/motion";

/**
 * A follower that lags the real cursor, swells over anything interactive, and
 * opens into a labelled disc over a project card.
 *
 * Mouse only: it never mounts on touch, and never under reduced motion. It is
 * `pointer-events: none` throughout, so it cannot intercept a click even while
 * sitting directly over a control.
 */
export default function CursorDot() {
  const dot = useRef<HTMLDivElement | null>(null);
  const label = useRef<HTMLSpanElement | null>(null);
  // both queries are read unconditionally; combining them with && inline
  // would short circuit the second hook call
  const finePointer = useMediaQuery(FINE_POINTER);
  const reduced = useMotionOff();
  const enabled = finePointer && !reduced;

  useEffect(() => {
    if (!enabled) return;
    const el = dot.current;
    const text = label.current;
    if (!el || !text) return;

    gsap.set(el, { xPercent: -50, yPercent: -50, opacity: 0 });
    const xTo = gsap.quickTo(el, "x", { duration: 0.35, ease: "power3.out" });
    const yTo = gsap.quickTo(el, "y", { duration: 0.35, ease: "power3.out" });

    const interactive = "a, button, [role='button'], input, summary, [data-cursor]";
    let mode = "";

    const onMove = (e: PointerEvent) => {
      xTo(e.clientX);
      yTo(e.clientY);
      gsap.to(el, { opacity: 1, duration: 0.2, overwrite: "auto" });

      const target = e.target as Element | null;
      // a labelled card wins over a plain interactive element
      const card = target?.closest?.("[data-cursor-label]") as HTMLElement | null;
      const over = target?.closest?.(interactive);
      const next = card ? "card" : over ? "hot" : "idle";
      if (next === mode) return;
      mode = next;

      if (card) text.textContent = card.dataset.cursorLabel || "View";

      gsap.to(el, {
        width: card ? 84 : 20,
        height: card ? 84 : 20,
        borderColor: next === "idle" ? "rgba(242,245,247,0.45)" : "rgba(94,234,212,0.95)",
        backgroundColor: card ? "rgba(94,234,212,0.14)" : "rgba(94,234,212,0)",
        scale: next === "hot" ? 2 : 1,
        duration: 0.34,
        ease: "power3.out",
        overwrite: "auto",
      });
      gsap.to(text, { opacity: card ? 1 : 0, duration: 0.24, overwrite: "auto" });
    };

    const onLeave = () => gsap.to(el, { opacity: 0, duration: 0.2, overwrite: "auto" });

    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerleave", onLeave);

    return () => {
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerleave", onLeave);
      gsap.killTweensOf([el, text]);
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <div
      ref={dot}
      aria-hidden
      className="pointer-events-none fixed top-0 left-0 z-100 flex h-5 w-5 items-center justify-center rounded-full border backdrop-blur-[1px]"
      style={{ borderColor: "rgba(242,245,247,0.45)" }}
    >
      <span
        ref={label}
        className="text-accent font-mono text-[9px] tracking-[0.18em] uppercase opacity-0"
      >
        View
      </span>
    </div>
  );
}
