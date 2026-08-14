"use client";

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { isMotionOff } from "./motion";

/**
 * Plugin registration happens once, on the client only. Every module that
 * animates imports `gsap` from here rather than from the package, so nothing
 * can accidentally run before the plugins exist.
 *
 * Only what every route actually needs is registered here. `Observer` and
 * `SplitText` were registered and referenced nowhere. `Flip` is used by exactly
 * one component, the filter grid on `/work`, and registering it here put 24KB
 * of it in the home page's bundle to be parsed before the hero could paint —
 * so it now registers itself where it is used.
 */
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
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

export { gsap, ScrollTrigger };
