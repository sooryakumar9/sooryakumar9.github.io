"use client";

import { useEffect, useRef, useState, type RefObject } from "react";

/**
 * Fires `run` the first time `el` comes into view, then stops watching.
 *
 * `threshold` and `rootMargin` are both offered because the two callers want
 * opposite things: a text effect should start when the element is genuinely
 * being looked at, while work that has to be ready *before* the element is
 * seen wants to begin early, off the bottom of the screen.
 *
 * Returns a disposer.
 */
export function onFirstEnter(
  el: Element,
  run: () => void,
  options: IntersectionObserverInit = { threshold: 0.35 },
) {
  if (typeof IntersectionObserver === "undefined") {
    run();
    return () => {};
  }

  const io = new IntersectionObserver((records) => {
    for (const r of records) {
      if (r.isIntersecting) {
        run();
        io.disconnect();
      }
    }
  }, options);
  io.observe(el);
  return () => io.disconnect();
}

/**
 * True once the element has come within `rootMargin` of the viewport, and true
 * from then on. For deferring setup that is expensive but must be finished
 * before the thing is actually on screen — so the margin is generous.
 *
 * Without IntersectionObserver it reports true immediately, which keeps the
 * un-deferred behaviour rather than leaving the element permanently blank.
 */
export function useNearViewport(
  ref: RefObject<Element | null>,
  rootMargin = "400px",
): boolean {
  const [near, setNear] = useState(() => typeof IntersectionObserver === "undefined");
  // the observer must not be torn down and rebuilt just because a parent
  // re-rendered with a new margin string
  const margin = useRef(rootMargin);

  useEffect(() => {
    const el = ref.current;
    if (!el || near) return;
    return onFirstEnter(el, () => setNear(true), { rootMargin: margin.current });
  }, [ref, near]);

  return near;
}
