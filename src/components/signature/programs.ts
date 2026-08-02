import type { Program } from "./types";
import type { SignatureVariant } from "@/content/types";
import { hero, hils, rag } from "./programs/systems";
import { qsecure, banking, blocker, madhumarga, zenpro, diavo } from "./programs/products";

/**
 * Every signature program, keyed by variant. Each one is a multi beat loop —
 * arrive, act, resolve, reset — rather than a single gesture on repeat, and
 * each accepts a scroll driven clock so the canvas can advance with the page
 * instead of on a timer.
 */
export const programs: Record<SignatureVariant, Program<never>> = {
  hero,
  hils,
  rag,
  qsecure,
  banking,
  blocker,
  madhumarga,
  zenpro,
  diavo,
};
