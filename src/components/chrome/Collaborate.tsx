"use client";

import { useLayoutEffect, useRef } from "react";
import { gsap, prefersReducedMotion } from "@/lib/gsapSetup";
import Magnetic from "@/components/motion/Magnetic";
import { profile } from "@/content/profile";

/**
 * The closing call to action, repeated at the foot of every route. The two
 * words drift apart as the block scrolls through, which gives the end of the
 * page some weight without adding another thing to read.
 */
export default function Collaborate() {
  const root = useRef<HTMLElement | null>(null);

  useLayoutEffect(() => {
    const el = root.current;
    if (!el || prefersReducedMotion()) return;

    const ctx = gsap.context(() => {
      gsap
        .timeline({
          scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: 1 },
        })
        .fromTo(".cta-word-a", { xPercent: -12 }, { xPercent: 8, ease: "none" }, 0)
        .fromTo(".cta-word-b", { xPercent: 12 }, { xPercent: -8, ease: "none" }, 0);
    }, el);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={root}
      aria-labelledby="cta-heading"
      className="relative overflow-hidden py-24 md:py-40"
    >
      <div aria-hidden className="smoke smoke-a" />
      <div aria-hidden className="smoke smoke-b" />

      <div className="page-shell relative">
        {/* capped so the type stops growing before it outruns the column on a
            wide monitor, which is what broke the hero headline */}
        <h2
          id="cta-heading"
          className="display text-center leading-[0.85]"
          style={{ fontSize: "clamp(44px, 11vw, 168px)" }}
        >
          <span className="cta-word-a block">Let&rsquo;s build</span>
          <span className="cta-word-b block">
            something
            <span aria-hidden className="star-spin text-accent ml-3 inline-block text-[0.35em] align-middle">
              ✳
            </span>
          </span>
        </h2>

        <div className="mt-10 flex flex-col items-center gap-4 md:mt-14">
          <Magnetic strength={0.45} radius={120}>
            <a
              href={`mailto:${profile.email}`}
              className="border-line-strong hover:border-accent hover:text-accent rounded-chip inline-block border px-6 py-3 text-base transition-colors md:text-lg"
            >
              {profile.email}
            </a>
          </Magnetic>
          <p className="text-muted flex items-center gap-2 text-sm">
            <span aria-hidden className="status-dot" />
            Available for work — {profile.location}
          </p>
        </div>
      </div>
    </section>
  );
}
