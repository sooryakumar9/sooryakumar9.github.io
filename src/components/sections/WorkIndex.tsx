"use client";

import { useRef, useState } from "react";
import { gsap, prefersReducedMotion } from "@/lib/gsapSetup";
// Flip is imported here rather than from `gsapSetup` on purpose: this grid is
// the only thing on the site that uses it, and registering it centrally meant
// every route — including the home page — parsed it before first paint.
import { Flip } from "gsap/Flip";

if (typeof window !== "undefined") gsap.registerPlugin(Flip);
import TransitionLink from "@/components/motion/TransitionLink";
import Tilt from "@/components/motion/Tilt";
import Signature from "@/components/signature/Signature";
import TechRing from "@/components/chrome/TechRing";
import { projects, categoryLabels } from "@/content/work";
import type { Category } from "@/content/types";

type Filter = "all" | Category;

const order: Filter[] = ["all", "systems", "applications", "progress"];

const counts: Record<Filter, number> = {
  all: projects.length,
  systems: projects.filter((p) => p.category === "systems").length,
  applications: projects.filter((p) => p.category === "applications").length,
  progress: projects.filter((p) => p.category === "progress").length,
};

/**
 * Everything, filterable. The grid re-lays out with GSAP Flip: positions are
 * recorded before React re-renders, then every surviving card is tweened from
 * where it used to be to where it now is, so filtering reads as the same set
 * rearranging rather than one grid being swapped for another.
 */
export default function WorkIndex() {
  const [filter, setFilter] = useState<Filter>("all");
  const grid = useRef<HTMLUListElement | null>(null);

  const apply = (next: Filter) => {
    if (next === filter) return;

    const el = grid.current;
    if (!el || prefersReducedMotion()) {
      setFilter(next);
      return;
    }

    const state = Flip.getState(el.querySelectorAll<HTMLElement>(".wk-card"));
    setFilter(next);

    // let React commit the new list before measuring the destination
    requestAnimationFrame(() => {
      Flip.from(state, {
        duration: 0.6,
        ease: "power2.inOut",
        absolute: true,
        stagger: 0.03,
        onEnter: (els) =>
          gsap.fromTo(
            els,
            { opacity: 0, scale: 0.9 },
            { opacity: 1, scale: 1, duration: 0.45, ease: "power2.out" },
          ),
        onLeave: (els) =>
          gsap.to(els, { opacity: 0, scale: 0.9, duration: 0.3, ease: "power2.in" }),
      });
    });
  };

  const visible = projects.filter((p) => filter === "all" || p.category === filter);

  return (
    <>
      <div className="mb-10 flex flex-wrap gap-2" role="group" aria-label="Filter work">
        {order.map((key) => (
          <button
            key={key}
            type="button"
            onClick={() => apply(key)}
            aria-pressed={filter === key}
            className={`rounded-chip flex items-center gap-2 border px-4 py-2 text-sm transition-colors ${
              filter === key
                ? "border-accent text-accent bg-accent-soft"
                : "border-line text-muted hover:border-line-strong hover:text-fg"
            }`}
          >
            {categoryLabels[key]}
            <span className="font-mono text-xs opacity-60">{counts[key]}</span>
          </button>
        ))}
      </div>

      <ul ref={grid} className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {visible.map((p) => (
          <li key={p.slug} data-flip-id={p.slug} className="wk-card">
            <Tilt
              data-cursor-label="Read"
              className="tech-edge rounded-frame border-line bg-surface relative flex h-full flex-col overflow-hidden border"
            >
              <TechRing />
            <div data-vt-art data-depth="-18" className="border-line relative h-40 border-b">
              <Signature variant={p.signature} />
              {p.live && (
                // same as the bench chip: an opaque plate over a canvas that is
                // always repainting, rather than a per frame backdrop blur
                <span className="border-line bg-bg/90 text-muted rounded-chip absolute top-3 right-3 flex items-center gap-2 border px-2.5 py-1 font-mono text-xs">
                  <span aria-hidden className="status-dot" />
                  Live
                </span>
              )}
            </div>

            <div data-depth="26" className="flex flex-1 flex-col p-5">
              <p className="eyebrow mb-2">
                {categoryLabels[p.category]} · {p.period}
              </p>
              <h2 data-vt-title className="display mb-2 text-xl">
                <TransitionLink
                  href={`/work/${p.slug}`}
                  morphFrom=".wk-card"
                  className="hover:text-accent transition-colors"
                >
                  <span className="absolute inset-0" aria-hidden />
                  {p.title}
                </TransitionLink>
              </h2>
              <p className="text-muted mb-4 flex-1 text-sm">{p.blurb}</p>
              <ul className="flex flex-wrap gap-1.5">
                {p.tech.slice(0, 3).map((t) => (
                  <li
                    key={t}
                    className="border-line text-muted rounded-chip border px-2 py-0.5 font-mono text-[11px]"
                  >
                    {t}
                  </li>
                ))}
              </ul>
            </div>
            </Tilt>
          </li>
        ))}
      </ul>
    </>
  );
}
