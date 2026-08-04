"use client";

import { useMotionOff } from "./motion";

/**
 * Reactive motion preference. False on the server.
 *
 * Folds in both the OS setting and the footer toggle, so a component using this
 * re-renders the moment either moves.
 */
export function useReducedMotion(): boolean {
  return useMotionOff();
}
