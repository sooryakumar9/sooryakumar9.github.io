"use client";

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Observer } from "gsap/Observer";
import { Flip } from "gsap/Flip";
import { SplitText } from "gsap/SplitText";

/**
 * Plugin registration happens once, on the client only. Every module that
 * animates imports `gsap` from here rather than from the package, so nothing
 * can accidentally run before the plugins exist.
 */
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, Observer, Flip, SplitText);
}

/** True when the visitor has asked the OS for less motion. */
export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/** Coarse pointers get no cursor follower and no hover only affordances. */
export function hasFinePointer(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(pointer: fine)").matches;
}

export { gsap, ScrollTrigger, Observer, Flip, SplitText };
