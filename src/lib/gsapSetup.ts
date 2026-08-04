"use client";

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Observer } from "gsap/Observer";
import { Flip } from "gsap/Flip";
import { SplitText } from "gsap/SplitText";
import { isMotionOff } from "./motion";

/**
 * Plugin registration happens once, on the client only. Every module that
 * animates imports `gsap` from here rather than from the package, so nothing
 * can accidentally run before the plugins exist.
 */
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, Observer, Flip, SplitText);
}

/**
 * True when motion should be suppressed, whether that came from the OS or from
 * the toggle in the footer.
 *
 * Delegating here rather than reading the media query directly is what lets the
 * toggle reach every animated component without editing any of them: they all
 * already call this at mount.
 */
export function prefersReducedMotion(): boolean {
  return isMotionOff();
}

/** Coarse pointers get no cursor follower and no hover only affordances. */
export function hasFinePointer(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(pointer: fine)").matches;
}

export { gsap, ScrollTrigger, Observer, Flip, SplitText };
