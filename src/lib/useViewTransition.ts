"use client";

import { useRouter } from "next/navigation";
import { useCallback } from "react";
import { REDUCED_MOTION, useMediaQuery } from "./clientEnv";

type WithVT = Document & {
  startViewTransition?: (cb: () => void | Promise<void>) => { finished: Promise<void> };
};

/** Set while a view transition is running, so the panel wipe stands down. */
export const VT_FLAG = "vt";

/**
 * Navigate with a View Transition where the browser supports one.
 *
 * The names have to be assigned to the element being left *before* the
 * transition starts and removed afterwards, because `view-transition-name`
 * must be unique in the document — naming all eight cards at once makes the
 * pairing ambiguous and the browser silently falls back to a cross fade.
 *
 * Everything degrades: no API, or reduced motion, and this is a plain push.
 */
export function useViewTransition() {
  const router = useRouter();
  const reduced = useMediaQuery(REDUCED_MOTION);

  return useCallback(
    (href: string, el?: HTMLElement | null) => {
      const doc = document as WithVT;

      if (reduced || typeof doc.startViewTransition !== "function") {
        router.push(href);
        return;
      }

      // tell RouteTransition to sit this one out
      document.documentElement.dataset[VT_FLAG] = "1";

      const named: HTMLElement[] = [];
      if (el) {
        const art = el.querySelector<HTMLElement>("[data-vt-art]");
        const title = el.querySelector<HTMLElement>("[data-vt-title]");
        if (art) {
          art.style.viewTransitionName = "project-art";
          named.push(art);
        }
        if (title) {
          title.style.viewTransitionName = "project-title";
          named.push(title);
        }
      }

      const transition = doc.startViewTransition(() => {
        router.push(href);
      });

      transition.finished
        .catch(() => {})
        .finally(() => {
          for (const n of named) n.style.viewTransitionName = "";
          delete document.documentElement.dataset[VT_FLAG];
        });
    },
    [router, reduced],
  );
}
