"use client";

import { useCallback, useSyncExternalStore } from "react";

const noopSubscribe = () => () => {};

/**
 * False during server render and the hydrating pass, true afterwards. Lets a
 * component render nothing until the client is genuinely in charge, without
 * flipping state inside an effect.
 */
export function useIsClient(): boolean {
  return useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  );
}

/**
 * Subscribes to a media query. Reports false on the server so the first client
 * render always matches the markup that was shipped.
 */
export function useMediaQuery(query: string): boolean {
  const subscribe = useCallback(
    (onChange: () => void) => {
      const mq = window.matchMedia(query);
      mq.addEventListener("change", onChange);
      return () => mq.removeEventListener("change", onChange);
    },
    [query],
  );

  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(query).matches,
    () => false,
  );
}

export const REDUCED_MOTION = "(prefers-reduced-motion: reduce)";
export const FINE_POINTER = "(pointer: fine)";

/**
 * Announces that the opening sequence is over, whether it played or was
 * skipped. The hero waits on this before igniting so its timeline never runs
 * behind the preloader panel.
 */
export function markIntroDone() {
  document.documentElement.dataset.introDone = "true";
  window.dispatchEvent(new Event("intro:done"));
}
