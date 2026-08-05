"use client";

import { useLayoutEffect, useRef } from "react";
import { gsap, prefersReducedMotion } from "@/lib/gsapSetup";
import Reveal from "@/components/motion/Reveal";
import { foundations } from "@/content/profile";
import { projectLabel } from "@/content/work";
import TransitionLink from "@/components/motion/TransitionLink";
import ScrambleText from "@/components/motion/ScrambleText";

/**
 * What I can do on a team, rather than what I was taught.
 *
 * This used to list coursework, which every reader already assumes and which
 * makes a graduate look like a graduate. Each card is now a capability that
 * shows up in more than one project, and it links to the work that proves it:
 * the claims on this page are only worth what a reader can go and check.
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

        // the tilt belongs to the flight, not the resting state. Landing askew
        // was fine on a 238px card and reads as crooked on a 403px one holding
        // a paragraph, so the cards spin a little on the way in and settle square
        gsap.set(card, {
          x: dx,
          y: 40,
          rotate: gsap.utils.wrap([-5, 3, -2, 4, -3.5, 2.5])(i),
          scale: 0.92,
          opacity: 0,
          zIndex: cards.length - i,
        });
        gsap.to(card, {
          x: 0,
          y: 0,
          scale: 1,
          opacity: 1,
          rotate: 0,
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
          <ScrambleText as="p" className="eyebrow mb-3 block" text="Capabilities" />
          <h2 id="foundations-heading" className="display max-w-3xl text-4xl md:text-6xl">
            What I bring to an engineering team
          </h2>
          <p className="text-muted mt-5 max-w-2xl">
            Each of these comes from something I shipped rather than something I
            studied. The projects are the evidence; these are the patterns
            across them.
          </p>
        </div>
      </Reveal>

      {/* three across from lg: at five the card was 238px, which cannot hold a
          sentence worth reading */}
      <ul ref={deck} className="mb-14 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {foundations.capabilities.map((c) => (
          <li
            key={c.title}
            className="fd-card rounded-card border-line bg-surface hover:border-line-strong flex min-h-56 flex-col border p-6 transition-colors"
          >
            <h3 className="display text-xl leading-tight">{c.title}</h3>
            <p className="text-muted mt-3 text-sm leading-relaxed">{c.body}</p>

            {/* the evidence, so nothing here has to be taken on trust */}
            <div className="border-line mt-auto flex flex-wrap gap-x-4 gap-y-1 border-t pt-4">
              {c.evidence.map((slug) => (
                <TransitionLink
                  key={slug}
                  href={`/work/${slug}`}
                  className="text-accent hover:text-accent-deep text-xs transition-colors"
                >
                  {projectLabel(slug)} <span aria-hidden>→</span>
                </TransitionLink>
              ))}
            </div>
          </li>
        ))}
      </ul>

      <div className="grid gap-10 md:grid-cols-2">
        <Reveal>
          <div>
            <h3 className="eyebrow mb-4">Engineering stack</h3>
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
            <h3 className="eyebrow mb-4">What I optimize for</h3>
            <ul className="space-y-3">
              {foundations.principles.map((n) => (
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
