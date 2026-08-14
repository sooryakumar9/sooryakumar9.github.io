"use client";

import type Lenis from "lenis";

/**
 * Scroll ownership across a route change.
 *
 * Two things here, and they belong together because they are the same problem:
 * where the page is scrolled when a new route arrives.
 *
 * Lenis keeps its own idea of the scroll position and writes it back every
 * frame, so a plain `window.scrollTo(0, 0)` during a navigation is undone on
 * the next tick. And `scroll-behavior: smooth` on `html` — which exists for
 * visitors Lenis does not cover — makes the router's own reset an animation,
 * which then runs underneath the view transition. Between them, leaving a
 * project card from halfway down the page dropped the visitor partway into a
 * case study with the morph playing against a moving page.
 *
 * The state is module level rather than component level on purpose. The link
 * that was clicked is usually gone from the DOM by the time the new route
 * renders, so anything hung off that component's effects never runs.
 */
let lenis: Lenis | null = null;

type Pending = { url: string; resolve: () => void; timer: number };
let pending: Pending | null = null;

export function registerLenis(instance: Lenis | null) {
  lenis = instance;
}

const samePath = (a: string, b: string) => a.replace(/\/$/, "") === b.replace(/\/$/, "");

/** Long enough to cover a slow render, short enough not to feel stuck. */
const NAV_TIMEOUT = 1200;

/** True while a navigation is in flight, so a second click can be ignored. */
export function isNavigating() {
  return pending !== null;
}

/**
 * Hands back a promise that settles once `url` has actually rendered. This is
 * what a view transition's update callback must wait on: `router.push` only
 * schedules the navigation, so resolving on the call photographs the old page
 * as both the before and the after.
 */
export function beginNavigation(url: string, push: () => void) {
  return new Promise<void>((resolve) => {
    pending = { url, resolve, timer: window.setTimeout(() => finish(), NAV_TIMEOUT) };
    document.documentElement.dataset.navigating = "true";
    push();
  });
}

/** Called from the one always mounted watcher when the path changes. */
export function completeNavigation(pathname: string) {
  if (!pending || !samePath(pending.url, pathname)) return;
  jumpToTop();
  finish();
}

function finish() {
  if (!pending) return;
  window.clearTimeout(pending.timer);
  pending.resolve();
  pending = null;
}

/** Put the page back to the top with no animation, Lenis included. */
export function jumpToTop() {
  if (typeof document === "undefined") return;
  lenis?.scrollTo(0, { immediate: true, force: true });
  window.scrollTo(0, 0);
}

/**
 * Restores normal scrolling once the transition is over. A navigation that
 * never arrives must not leave the page stuck with smooth scrolling suspended,
 * so the timeout path reaches this too.
 */
export function endNavigation() {
  if (typeof document === "undefined") return;
  finish();
  delete document.documentElement.dataset.navigating;
}
