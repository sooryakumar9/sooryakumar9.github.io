"use client";

import TransitionLink from "@/components/motion/TransitionLink";
import { useLayoutEffect, useRef, useState } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsapSetup";
import Signature from "@/components/signature/Signature";
import TechRing from "@/components/chrome/TechRing";
import Reveal from "@/components/motion/Reveal";
import { featuredSlugs, projectsBySlugs } from "@/content/work";
import ScrambleText from "@/components/motion/ScrambleText";
import { scrollToY } from "@/lib/smoothScroll";

const featured = projectsBySlugs(featuredSlugs);

/**
 * Featured work as a horizontal rail driven by vertical scroll. The stage
 * pins, the rail translates across it, and each card's canvas counter-drifts
 * against the rail so the depth reads as real rather than as one flat sheet
 * sliding past.
 *
 * Only the stage pins, not the whole section — the heading scrolls away above
 * it the way it would anywhere else, and the counter and arrows ride along
 * inside the pinned area so they stay reachable for the whole travel.
 *
 * That treatment is desktop only. Narrow screens and reduced motion get a
 * plain snapping scroller instead: pinned sections are miserable on touch and
 * inappropriate when a visitor has asked for less movement.
 */
export default function FeaturedWork() {
  const stage = useRef<HTMLDivElement | null>(null);
  const rail = useRef<HTMLDivElement | null>(null);
  const [index, setIndex] = useState(0);
  const seek = useRef<((i: number) => void) | null>(null);

  useLayoutEffect(() => {
    const el = stage.current;
    const track = rail.current;
    if (!el || !track) return;

    const mm = gsap.matchMedia();

    mm.add("(min-width: 768px) and (prefers-reduced-motion: no-preference)", () => {
      const distance = () => Math.max(0, track.scrollWidth - track.clientWidth);

      const tween = gsap.to(track, {
        x: () => -distance(),
        ease: "none",
        scrollTrigger: {
          trigger: el,
          start: "top top",
          pin: true,
          anticipatePin: 1,
          scrub: 1,
          end: () => "+=" + distance(),
          invalidateOnRefresh: true,
          onUpdate: (self) => setIndex(Math.round(self.progress * (featured.length - 1))),
        },
      });

      const st = tween.scrollTrigger!;
      seek.current = (i: number) => {
        const p = featured.length > 1 ? i / (featured.length - 1) : 0;
        const span = st.end - st.start;
        // Drive the page scroll, which drives the rail — but never land exactly
        // on `start` or `end`. Those are the boundaries where the pin is
        // released, and `scrub: 1` means the rail still has a second of travel
        // left when the click arrives: the stage would unpin and the cards
        // would slide across a section that had stopped holding the viewport.
        // A pixel inside is 0.08% of the travel, which no one can see.
        const edge = span > 2 ? 1 : 0;
        const target = gsap.utils.clamp(st.start + edge, st.end - edge, st.start + p * span);
        scrollToY(target);
      };

      // each canvas drifts against the rail, timed off the rail tween rather
      // than the page scroll
      gsap.utils.toArray<HTMLElement>(".fw-art", track).forEach((art) => {
        gsap.fromTo(
          art,
          { xPercent: -8 },
          {
            xPercent: 8,
            ease: "none",
            scrollTrigger: {
              trigger: art,
              containerAnimation: tween,
              start: "left right",
              end: "right left",
              scrub: true,
            },
          },
        );
      });

      return () => {
        seek.current = null;
      };
    });

    // the fallback scroller still has to report which card is in view
    mm.add("(max-width: 767px), (prefers-reduced-motion: reduce)", () => {
      const onScroll = () => {
        const cards = Array.from(track.children) as HTMLElement[];
        const mid = track.scrollLeft + track.clientWidth / 2;
        let best = 0;
        let bestD = Infinity;
        cards.forEach((c, i) => {
          const d = Math.abs(c.offsetLeft + c.offsetWidth / 2 - mid);
          if (d < bestD) {
            bestD = d;
            best = i;
          }
        });
        setIndex(best);
      };
      track.addEventListener("scroll", onScroll, { passive: true });

      seek.current = (i: number) => {
        const card = track.children[i] as HTMLElement | undefined;
        card?.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
      };

      return () => {
        track.removeEventListener("scroll", onScroll);
        seek.current = null;
      };
    });

    return () => {
      mm.revert();
      ScrollTrigger.refresh();
    };
  }, []);

  const go = (delta: number) => {
    const nextIndex = Math.min(featured.length - 1, Math.max(0, index + delta));
    if (nextIndex === index) return;
    setIndex(nextIndex);
    seek.current?.(nextIndex);
  };

  const arrowClass =
    "border-line hover:border-accent hover:text-accent rounded-chip border px-3.5 py-2 text-sm transition-colors disabled:pointer-events-none disabled:opacity-30";

  return (
    <section aria-labelledby="work-heading" className="relative py-16 md:py-0">
      <div className="page-shell md:pt-24 md:pb-12">
        <Reveal>
          <div>
            <ScrambleText as="p" className="eyebrow mb-3 block" text="Selected work" />
            <h2 id="work-heading" className="display max-w-2xl text-4xl md:text-6xl">
              Things I&rsquo;ve built, and what they had to survive
            </h2>
          </div>
        </Reveal>
      </div>

      <div
        ref={stage}
        className="relative flex flex-col justify-center overflow-hidden md:h-[100svh]"
      >
        <div
          ref={rail}
          className="flex snap-x snap-mandatory gap-5 overflow-x-auto px-5 pb-6 md:snap-none md:overflow-x-visible md:px-[6vw] md:pb-0"
        >
          {featured.map((p, i) => (
            <article
              key={p.slug}
              data-active={i === index}
              data-cursor-label="Read"
              className="fw-card tech-edge rounded-frame border-line bg-surface relative w-[82vw] shrink-0 snap-center overflow-hidden border md:w-[46vw] lg:w-[36vw]"
            >
              <TechRing />
              {/* Two things are deliberate about this box.

                  Its height sits just above what the letterboxed art needs, so
                  the space above and below reads as padding rather than as a
                  strip stranded in an empty panel.

                  And `data-vt-art` names this element rather than `.fw-art`
                  inside it. A view transition snapshot ignores ancestor
                  clipping, so naming the scaled, parallax drifting child
                  captured the whole 125% canvas bleeding outside the card, from
                  an offset that moved with scroll. This is the visible frame. */}
              <div
                data-vt-art
                className="border-line relative h-48 overflow-hidden border-b md:h-[300px] lg:h-[336px]"
              >
                <div className="fw-art absolute inset-0 scale-125">
                  {/* 0.8 is the inverse of the scale-125 above, so the canvas
                      is drawn at the size it is actually shown at instead of
                      1.5625x it with the surplus clipped off. maxAspect keeps
                      the composition landscape however tall the card gets. */}
                  <Signature variant={p.signature} resolution={0.8} maxAspect={2} />
                </div>

                {/* the counter rides the active card rather than sitting on a
                    control row; the buttons below stay the keyboard affordance */}
                <span
                  aria-hidden
                  // no backdrop-blur: this sits directly over a canvas that
                  // repaints every frame, and a backdrop filter re-reads and
                  // re-blurs what is behind it every one of those frames. An
                  // opaque plate over near black art looks the same
                  className={`border-line bg-bg/90 rounded-chip absolute top-4 left-4 border px-3 py-1 font-mono text-xs transition-opacity duration-500 ${
                    i === index ? "opacity-100" : "opacity-0"
                  }`}
                >
                  <span className="text-accent">{String(i + 1).padStart(2, "0")}</span>
                  <span className="text-muted"> / {String(featured.length).padStart(2, "0")}</span>
                </span>
              </div>

              <div className="p-6 md:p-7">
                <p className="eyebrow mb-3">{p.org ? p.org.split(" · ").pop() : p.period}</p>
                <h3 data-vt-title className="display mb-3 text-2xl md:text-3xl">
                  <TransitionLink
                    href={`/work/${p.slug}`}
                    morphFrom=".fw-card"
                    className="hover:text-accent transition-colors"
                  >
                    <span className="absolute inset-0" aria-hidden />
                    {p.title}
                  </TransitionLink>
                </h3>
                <p className="text-muted mb-5 text-sm md:text-base">{p.blurb}</p>
                <ul className="flex flex-wrap gap-2">
                  {p.tech.slice(0, 4).map((t) => (
                    <li
                      key={t}
                      className="border-line text-muted rounded-chip border px-2.5 py-1 font-mono text-xs"
                    >
                      {t}
                    </li>
                  ))}
                </ul>
              </div>
            </article>
          ))}
        </div>

        <div className="page-shell mt-8 flex items-center justify-end gap-4 md:mt-12">
          {/* the visible counter now rides the active card, and that chip is
              aria-hidden, so the position is announced here instead */}
          <p className="sr-only" aria-live="polite">
            Project {index + 1} of {featured.length}: {featured[index].title}
          </p>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => go(-1)}
              disabled={index === 0}
              aria-label="Previous project"
              className={arrowClass}
            >
              <span aria-hidden>←</span>
            </button>
            <button
              type="button"
              onClick={() => go(1)}
              disabled={index === featured.length - 1}
              aria-label="Next project"
              className={arrowClass}
            >
              <span aria-hidden>→</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
