"use client";

import { useLayoutEffect, useRef } from "react";
import { gsap, prefersReducedMotion } from "@/lib/gsapSetup";
import { journey } from "@/content/journey";

/**
 * The long form story, one chapter per beat. The chapter numeral parks itself
 * beside the text on desktop and drifts gently while it is there; the prose
 * slides in from the side on scrub, so reading down the page feels like being
 * pulled through it rather than watching blocks appear.
 */
export default function Journey() {
  const root = useRef<HTMLDivElement | null>(null);

  useLayoutEffect(() => {
    const el = root.current;
    if (!el || prefersReducedMotion()) return;

    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>(".jr-chapter").forEach((chapter) => {
        const trigger = {
          trigger: chapter,
          start: "top 85%",
          end: "top 45%",
          scrub: 1,
        };

        gsap.from(chapter.querySelector(".jr-num"), {
          autoAlpha: 0,
          xPercent: -40,
          ease: "none",
          scrollTrigger: trigger,
        });

        gsap.from(chapter.querySelector(".jr-body"), {
          autoAlpha: 0,
          xPercent: 12,
          ease: "none",
          scrollTrigger: trigger,
        });
      });
    }, el);

    return () => ctx.revert();
  }, []);

  return (
    // chapters enter from beyond the right edge, so the row has to clip
    <div ref={root} className="page-shell overflow-x-clip pb-8">
      {journey.map((chapter) => (
        <section
          key={chapter.index}
          className="jr-chapter hairline grid gap-6 py-14 md:grid-cols-12 md:gap-10 md:py-20"
        >
          <div className="md:col-span-3">
            <p className="jr-num display text-accent float-slow text-5xl md:text-7xl">
              {chapter.index}
            </p>
          </div>
          <div className="jr-body md:col-span-9">
            <h2 className="display mb-4 text-2xl md:text-4xl">{chapter.title}</h2>
            <p className="text-muted max-w-3xl leading-relaxed md:text-lg">{chapter.body}</p>
          </div>
        </section>
      ))}
    </div>
  );
}
