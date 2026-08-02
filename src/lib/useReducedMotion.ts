"use client";

import { REDUCED_MOTION, useMediaQuery } from "./clientEnv";

/** Reactive reduced motion preference. False on the server. */
export function useReducedMotion(): boolean {
  return useMediaQuery(REDUCED_MOTION);
}
