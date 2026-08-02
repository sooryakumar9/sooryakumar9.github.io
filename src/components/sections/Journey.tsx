"use client";

import { useLayoutEffect, useRef } from "react";
import { gsap, ScrollTrigger, prefersReducedMotion } from "@/lib/gsapSetup";
import { journey } from "@/content/journey";

/**
 * The long form story, one chapter per beat, hung off a single vertical spine.
 *
 * The spine draws itself as you scroll and a marker rides down it, lighting
 * each chapter's node as it passes. That gives a spatial sense of how far
 * through the story you are, which a stack of paragraphs does not.
 *
 * The spine lives in an inner wrapper that carries no padding of its own, so
 * it shares a left edge with the chapter sections. Positioning it against the
 * padded `page-shell` instead would offset it from the nodes by the gutter —
 * which is exactly the bug this structure exists to avoid.
 *
 * All of it is decoration: chapters are real sections with real headings.
 */
const SPINE_X = "left-[6px] md:left-[16.6667%]";

export default function Journey() {
  const root = useRef<HTMLDivElement | null>(null);

  useLayoutEffect(() => {
    const el = root.current;
    if (!el || prefersReducedMotion()) return;

    const ctx = gsap.context(() => {
      const track = {
        trigger: el,
        start: "top 70%",
        end: "bottom 75%",
        scrub: 0.5,
      } as const;

      gsap.fromTo(
        ".jr-spine-fill",
        { scaleY: 0 },
        { scaleY: 1, ease: "none", transformOrigin: "top center", scrollTrigger: track },
      );
      gsap.fromTo(
        ".jr-marker",
        { top: "0%" },
        { top: "100%", ease: "none", scrollTrigger: track },
      );

      gsap.utils.toArray<HTMLElement>(".jr-chapter").forEach((chapter) => {
        const node = chapter.querySelector(".jr-node");
        const body = chapter.querySelector(".jr-body");

        ScrollTrigger.create({
          trigger: chapter,
          start: "top 62%",
          end: "bottom 40%",
          onToggle: (self) => {
            gsap.to(node, {
              backgroundColor: self.isActive ? "var(--c-accent)" : "var(--c-bg)",
              borderColor: self.isActive ? "var(--c-accent)" : "var(--c-line-strong)",
              scale: self.isActive ? 1.3 : 1,
              duration: 0.4,
              ease: "power2.out",
            });
          },
        });

        gsap.from(body, {
          autoAlpha: 0,
          y: 40,
          duration: 0.8,
          ease: "power3.out",
          scrollTrigger: { trigger: chapter, start: "top 82%", once: true },
        });
      });
    }, el);

    return () => ctx.revert();
  }, []);

  return (
    <div className="page-shell pb-8">
      <div ref={root} className="relative">
        <div aria-hidden className={`pointer-events-none absolute top-0 bottom-0 w-px ${SPINE_X}`}>
          <div className="bg-line absolute inset-0" />
          <div className="jr-spine-fill bg-accent/40 absolute inset-0 origin-top" />
          <div className="jr-marker bg-accent absolute -left-[3.5px] h-2 w-2 -translate-y-1/2 rounded-full shadow-[0_0_14px_var(--c-accent)]" />
        </div>

        {journey.map((chapter) => (
          <section
            key={chapter.index}
            className="jr-chapter relative grid gap-3 py-12 pl-8 md:grid-cols-12 md:gap-10 md:py-20 md:pl-0"
          >
            <span
              aria-hidden
              className={`jr-node border-line-strong bg-bg absolute top-[3.3rem] h-[13px] w-[13px] -translate-x-1/2 rounded-full border md:top-[5.2rem] ${SPINE_X}`}
            />

            <p className="text-muted font-mono text-xs tracking-[0.2em] md:col-span-2 md:col-start-3 md:pl-7">
              {chapter.index}
            </p>

            <div className="jr-body md:col-span-8 md:col-start-5">
              <h2 className="display mb-4 text-2xl md:text-4xl">{chapter.title}</h2>
              <p className="text-muted max-w-2xl leading-relaxed md:text-lg">{chapter.body}</p>
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
