"use client";

import { useSyncExternalStore } from "react";

/**
 * Whether the site animates, and who decided.
 *
 * The runtime truth is a single attribute, `data-motion` on <html>, written
 * before first paint by the head script in `layout.tsx`. Everything else reads
 * that attribute rather than recomputing the decision, so there is exactly one
 * place the answer lives and no way for two parts of the page to disagree.
 *
 * `system` is the default and stays reachable: someone who turns motion off by
 * accident must be able to get back to following their own OS setting, so this
 * is three states rather than a boolean.
 */
export type MotionPref = "system" | "on" | "off";

export const MOTION_KEY = "sk-motion";
export const MOTION_EVENT = "motion:change";

const REDUCE = "(prefers-reduced-motion: reduce)";

/** The stored choice, or `system` when there is none or storage is blocked. */
export function getMotionPref(): MotionPref {
  if (typeof window === "undefined") return "system";
  try {
    const v = localStorage.getItem(MOTION_KEY);
    return v === "on" || v === "off" ? v : "system";
  } catch {
    return "system";
  }
}

/**
 * True when motion should be suppressed. Reads the attribute, not the media
 * query: the attribute already folds in the OS preference and the stored
 * override, and it is what the stylesheet is keyed on.
 */
export function isMotionOff(): boolean {
  if (typeof window === "undefined") return false;
  return document.documentElement.dataset.motion === "off";
}

/** Resolves a preference against the OS setting. */
function resolve(pref: MotionPref): boolean {
  if (pref === "off") return true;
  if (pref === "on") return false;
  return window.matchMedia(REDUCE).matches;
}

/**
 * Records a choice and applies it immediately.
 *
 * Applying it is just the attribute: the stylesheet stops every transition and
 * animation, the canvas engine and the smooth scroller are listening for the
 * event, and `.js-reveal { opacity: 1 !important }` forces anything GSAP was
 * still holding at zero opacity into view. That last rule is why this can be
 * instant rather than needing a reload.
 */
export function setMotion(pref: MotionPref) {
  try {
    if (pref === "system") localStorage.removeItem(MOTION_KEY);
    else localStorage.setItem(MOTION_KEY, pref);
  } catch {
    // private mode; the choice still applies for this page
  }
  document.documentElement.dataset.motion = resolve(pref) ? "off" : "on";
  window.dispatchEvent(new Event(MOTION_EVENT));
}

function subscribe(onChange: () => void) {
  const mq = window.matchMedia(REDUCE);
  // the OS can change under us while the preference is `system`
  const onOS = () => {
    if (getMotionPref() === "system") setMotion("system");
    onChange();
  };
  mq.addEventListener("change", onOS);
  window.addEventListener(MOTION_EVENT, onChange);
  return () => {
    mq.removeEventListener("change", onOS);
    window.removeEventListener(MOTION_EVENT, onChange);
  };
}

/** Live: re-renders whenever the toggle or the OS setting moves. */
export function useMotionOff(): boolean {
  return useSyncExternalStore(subscribe, isMotionOff, () => false);
}

/** Live: the stored choice, for rendering the control's own state. */
export function useMotionPref(): MotionPref {
  return useSyncExternalStore(subscribe, getMotionPref, () => "system");
}

/**
 * Runs `fn` now and on every change. Returns an unsubscribe.
 *
 * For the imperative consumers — the canvas engine, the smooth scroller — that
 * are not React components and need to react rather than re-render.
 */
export function onMotionChange(fn: (off: boolean) => void): () => void {
  const run = () => fn(isMotionOff());
  window.addEventListener(MOTION_EVENT, run);
  const mq = window.matchMedia(REDUCE);
  mq.addEventListener("change", run);
  run();
  return () => {
    window.removeEventListener(MOTION_EVENT, run);
    mq.removeEventListener("change", run);
  };
}
