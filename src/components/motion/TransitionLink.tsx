"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ComponentProps, MouseEvent } from "react";
import { useMotionOff } from "@/lib/motion";

type WithVT = Document & {
  startViewTransition?: (cb: () => void | Promise<void>) => { finished: Promise<void> };
};

type Props = ComponentProps<typeof Link> & {
  /**
   * A selector for the element to morph out of. When given, its artwork and
   * title are paired with the destination's, so a project card grows into the
   * case study header instead of cross fading.
   */
  morphFrom?: string;
};

/**
 * The single path every internal navigation takes.
 *
 * There used to be two systems — a full screen slat wipe on most routes and a
 * shared element morph on project links — which is exactly why page changes
 * felt inconsistent. This is now the only one: a fast cross fade, plus the
 * morph when the navigation started from a card.
 *
 * Everything degrades. No View Transitions API, reduced motion, a modified
 * click, or an external href, and this is an ordinary link.
 */
export default function TransitionLink({ morphFrom, onClick, href, ...rest }: Props) {
  const router = useRouter();
  const reduced = useMotionOff();

  const handle = (e: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(e);
    if (e.defaultPrevented) return;

    // let the browser handle anything that is not a plain left click
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;

    const url = typeof href === "string" ? href : href.toString();
    if (!url.startsWith("/")) return;

    const doc = document as WithVT;
    if (reduced || typeof doc.startViewTransition !== "function") return;

    e.preventDefault();

    const named: HTMLElement[] = [];
    if (morphFrom) {
      const card = e.currentTarget.closest<HTMLElement>(morphFrom);
      // the names must be unique in the document, so only the card being left
      // is ever named — naming all of them makes the pairing ambiguous and the
      // browser quietly falls back to a plain cross fade
      const art = card?.querySelector<HTMLElement>("[data-vt-art]");
      const title = card?.querySelector<HTMLElement>("[data-vt-title]");
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
      router.push(url);
    });

    transition.finished
      .catch(() => {})
      .finally(() => {
        for (const n of named) n.style.viewTransitionName = "";
      });
  };

  return <Link href={href} onClick={handle} {...rest} />;
}
