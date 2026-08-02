"use client";

import { useRef, useState } from "react";
import Reveal from "@/components/motion/Reveal";
import { audiences } from "@/content/profile";
import { gsap, prefersReducedMotion } from "@/lib/gsapSetup";
import ScrambleText from "@/components/motion/ScrambleText";

/**
 * The same introduction told for different readers. A recruiter and an engineer
 * want opposite halves of the same paragraph, so rather than averaging them
 * into something bland, this just lets you pick.
 *
 * Implemented as a real tablist: arrow keys move between tabs and only the
 * selected panel is in the accessibility tree.
 */
export default function Intro() {
  const [active, setActive] = useState(0);
  const bodyRef = useRef<HTMLParagraphElement | null>(null);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const select = (index: number) => {
    if (index === active) return;
    setActive(index);

    const el = bodyRef.current;
    if (!el || prefersReducedMotion()) return;
    // re resolve the paragraph out of a blur so the swap reads as a change
    gsap.fromTo(
      el,
      { opacity: 0, y: 10, filter: "blur(8px)" },
      { opacity: 1, y: 0, filter: "blur(0px)", duration: 0.55, ease: "power3.out" },
    );
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    const last = audiences.length - 1;
    let next: number | null = null;
    if (e.key === "ArrowRight") next = active === last ? 0 : active + 1;
    if (e.key === "ArrowLeft") next = active === 0 ? last : active - 1;
    if (e.key === "Home") next = 0;
    if (e.key === "End") next = last;
    if (next === null) return;
    e.preventDefault();
    select(next);
    tabRefs.current[next]?.focus();
  };

  return (
    <section aria-labelledby="intro-heading" className="page-shell py-20 md:py-32">
      <Reveal>
        <ScrambleText id="intro-heading" as="h2" className="eyebrow mb-8 block" text="Intro" />
      </Reveal>

      <Reveal delay={0.05}>
        <div
          role="tablist"
          aria-label="Choose who you are"
          onKeyDown={onKeyDown}
          className="mb-8 flex flex-wrap gap-2"
        >
          {audiences.map((a, i) => (
            <button
              key={a.id}
              ref={(el) => {
                tabRefs.current[i] = el;
              }}
              role="tab"
              type="button"
              id={`intro-tab-${a.id}`}
              aria-selected={i === active}
              aria-controls={`intro-panel-${a.id}`}
              tabIndex={i === active ? 0 : -1}
              onClick={() => select(i)}
              className={`rounded-chip border px-4 py-2 text-sm transition-colors ${
                i === active
                  ? "border-accent text-accent bg-accent-soft"
                  : "border-line text-muted hover:border-line-strong hover:text-fg"
              }`}
            >
              {a.label}
            </button>
          ))}
        </div>
      </Reveal>

      <Reveal delay={0.1}>
        <div
          role="tabpanel"
          id={`intro-panel-${audiences[active].id}`}
          aria-labelledby={`intro-tab-${audiences[active].id}`}
          tabIndex={0}
        >
          <p
            ref={bodyRef}
            className="display max-w-4xl text-2xl leading-[1.25] font-light md:text-[2.6rem]"
          >
            {audiences[active].body}
          </p>
        </div>
      </Reveal>
    </section>
  );
}
