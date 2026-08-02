"use client";

import { useLayoutEffect, useRef } from "react";
import { gsap, prefersReducedMotion } from "@/lib/gsapSetup";
import Reveal from "@/components/motion/Reveal";
import { foundations } from "@/content/profile";
import ScrambleText from "@/components/motion/ScrambleText";

/**
 * The substrate under everything else: the coursework that does not show up in
 * a project list, plus the wider toolchain and a few notes that are just true.
 *
 * The cards arrive as a stacked deck in the middle of the row and deal
 * themselves out into place, which is the one moment on the page where the
 * motion is purely for pleasure. Reduced motion gets them already dealt.
 */
export default function Foundations() {
  const root = useRef<HTMLElement | null>(null);
  const deck = useRef<HTMLUListElement | null>(null);

  useLayoutEffect(() => {
    const el = root.current;
    const list = deck.current;
    if (!el || !list || prefersReducedMotion()) return;

    const ctx = gsap.context(() => {
      const cards = gsap.utils.toArray<HTMLElement>(".fd-card", list);
      if (!cards.length) return;

      const listRect = list.getBoundingClientRect();

      cards.forEach((card, i) => {
        const rect = card.getBoundingClientRect();
        // offset that would put this card at the centre of the row
        const dx = listRect.left + listRect.width / 2 - (rect.left + rect.width / 2);

        gsap.set(card, { x: dx, y: 40, rotate: 0, scale: 0.92, opacity: 0, zIndex: cards.length - i });
        gsap.to(card, {
          x: 0,
          y: 0,
          scale: 1,
          opacity: 1,
          rotate: gsap.utils.wrap([-2.5, 1.5, -1, 2, -1.8])(i),
          duration: 1,
          ease: "power3.out",
          delay: i * 0.08,
          scrollTrigger: { trigger: list, start: "top 80%", once: true },
        });
      });
    }, el);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={root}
      aria-labelledby="foundations-heading"
      className="page-shell py-20 md:py-32"
    >
      <Reveal>
        <div className="mb-12">
          <ScrambleText as="p" className="eyebrow mb-3 block" text="Foundations & craft" />
          <h2 id="foundations-heading" className="display max-w-3xl text-4xl md:text-6xl">
            The parts that don&rsquo;t make it into a project list
          </h2>
          <p className="text-muted mt-5 max-w-2xl">
            Frameworks change. These are the things underneath them that keep
            being the reason something works or doesn&rsquo;t.
          </p>
        </div>
      </Reveal>

      <ul
        ref={deck}
        className="mb-14 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5 lg:gap-3"
      >
        {foundations.fundamentals.map((f) => (
          <li
            key={f.title}
            className="fd-card rounded-card border-line bg-surface hover:border-line-strong flex min-h-44 flex-col justify-between border p-5 transition-colors"
          >
            <h3 className="display text-lg leading-tight">{f.title}</h3>
            <p className="text-muted mt-4 text-sm leading-relaxed">{f.note}</p>
          </li>
        ))}
      </ul>

      <div className="grid gap-10 md:grid-cols-2">
        <Reveal>
          <div>
            <h3 className="eyebrow mb-4">Also in the toolchain</h3>
            <ul className="flex flex-wrap gap-2">
              {foundations.toolchain.map((t) => (
                <li
                  key={t}
                  className="border-line text-muted rounded-chip border px-3 py-1.5 font-mono text-xs"
                >
                  {t}
                </li>
              ))}
            </ul>
          </div>
        </Reveal>

        <Reveal delay={0.06}>
          <div>
            <h3 className="eyebrow mb-4">In the margins</h3>
            <ul className="space-y-3">
              {foundations.notes.map((n) => (
                <li key={n} className="text-muted flex gap-3 text-sm">
                  <span aria-hidden className="text-accent">
                    ✳
                  </span>
                  {n}
                </li>
              ))}
            </ul>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
