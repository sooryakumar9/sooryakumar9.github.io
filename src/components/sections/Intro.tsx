"use client";

import { useLayoutEffect, useRef, useState } from "react";
import Reveal from "@/components/motion/Reveal";
import ScrambleText from "@/components/motion/ScrambleText";
import { audiences } from "@/content/profile";
import { gsap, prefersReducedMotion } from "@/lib/gsapSetup";

/**
 * The same introduction told for different readers. A recruiter and an engineer
 * want opposite halves of the same paragraph, so rather than averaging them
 * into something bland, this just lets you pick.
 *
 * Implemented as a real tablist: arrow keys move between tabs, `aria-selected`
 * tracks the choice, and only the selected panel is in the accessibility tree.
 * The word by word reveal is decoration on top of that — the full paragraph is
 * always present in the DOM, so nothing is hidden from a screen reader or from
 * a visitor with scripting off.
 */
export default function Intro() {
  const [active, setActive] = useState(0);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  // reveal the paragraph a word at a time, on mount and on every tab change
  useLayoutEffect(() => {
    const el = panelRef.current;
    if (!el || prefersReducedMotion()) return;

    const ctx = gsap.context(() => {
      const words = el.querySelectorAll(".intro-word");
      gsap.fromTo(
        words,
        { opacity: 0.12, y: 6 },
        {
          opacity: 1,
          y: 0,
          duration: 0.5,
          ease: "power2.out",
          stagger: 0.018,
          scrollTrigger: { trigger: el, start: "top 85%", once: true },
        },
      );
    }, el);

    return () => ctx.revert();
  }, [active]);

  const select = (index: number) => setActive(index);

  const onKeyDown = (e: React.KeyboardEvent) => {
    const last = audiences.length - 1;
    let next: number | null = null;
    if (e.key === "ArrowDown" || e.key === "ArrowRight") next = active === last ? 0 : active + 1;
    if (e.key === "ArrowUp" || e.key === "ArrowLeft") next = active === 0 ? last : active - 1;
    if (e.key === "Home") next = 0;
    if (e.key === "End") next = last;
    if (next === null) return;
    e.preventDefault();
    select(next);
    tabRefs.current[next]?.focus();
  };

  const current = audiences[active];

  return (
    <section aria-labelledby="intro-heading" className="page-shell py-20 md:py-32">
      <div className="grid gap-10 md:grid-cols-12 md:gap-14">
        <div className="md:col-span-4">
          <Reveal>
            <ScrambleText id="intro-heading" as="h2" className="display mb-8 block text-4xl md:text-5xl" text="Intro" />
          </Reveal>

          <Reveal delay={0.05}>
            <div
              role="tablist"
              aria-orientation="vertical"
              aria-label="Choose who you are"
              onKeyDown={onKeyDown}
              className="flex flex-col items-start gap-1"
            >
              {audiences.map((a, i) => {
                const on = i === active;
                return (
                  <button
                    key={a.id}
                    ref={(el) => {
                      tabRefs.current[i] = el;
                    }}
                    role="tab"
                    type="button"
                    id={`intro-tab-${a.id}`}
                    aria-selected={on}
                    aria-controls={`intro-panel-${a.id}`}
                    tabIndex={on ? 0 : -1}
                    onClick={() => select(i)}
                    className={`group flex items-center gap-3 py-1.5 text-left text-sm transition-colors md:text-base ${
                      on ? "text-fg" : "text-muted hover:text-fg"
                    }`}
                  >
                    {/* the dash grows and brightens rather than a filled chip */}
                    <span
                      aria-hidden
                      className={`block h-px shrink-0 transition-all duration-400 ${
                        on ? "bg-accent w-9" : "bg-line-strong w-4 group-hover:w-6"
                      }`}
                    />
                    {a.label}
                  </button>
                );
              })}
            </div>
          </Reveal>
        </div>

        <div className="md:col-span-8">
          <Reveal delay={0.08}>
            <div
              ref={panelRef}
              role="tabpanel"
              id={`intro-panel-${current.id}`}
              aria-labelledby={`intro-tab-${current.id}`}
              tabIndex={0}
              className="intro-panel border-line bg-surface relative overflow-hidden border p-6 md:p-10"
            >
              {/* dotted grid texture, and a folded corner cut out of the panel */}
              <span aria-hidden className="intro-dots absolute inset-0" />
              <span aria-hidden className="intro-fold absolute top-0 right-0" />

              <p className="display relative text-xl leading-[1.5] font-light md:text-[1.9rem] md:leading-[1.45]">
                {current.body.split(" ").map((word, i) => (
                  <span key={`${current.id}-${i}`} className="intro-word inline-block">
                    {word}
                    {" "}
                  </span>
                ))}
              </p>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
