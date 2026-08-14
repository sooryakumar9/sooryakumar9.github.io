"use client";

import { useLayoutEffect, useRef, type ElementType, type ReactNode } from "react";
import { gsap, prefersReducedMotion } from "@/lib/gsapSetup";
import { afterIntro } from "@/lib/afterIntro";

type RevealProps = {
  children: ReactNode;
  /** seconds of delay, or the stagger step when `stagger` is set */
  delay?: number;
  /** animate direct children instead of the wrapper */
  stagger?: number;
  as?: ElementType;
  className?: string;
};

/**
 * The site's one reveal: rise, settle, and resolve out of a blur. Applied to
 * section heads, cards and list rows so that everything enters with the same
 * signature rather than each section inventing its own.
 */
export default function Reveal({
  children,
  delay = 0,
  stagger,
  as: Tag = "div",
  className = "",
}: RevealProps) {
  const ref = useRef<HTMLElement | null>(null);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;

    // with motion off the class already renders everything visible
    if (prefersReducedMotion()) return;

    const targets: Element[] = stagger !== undefined ? Array.from(el.children) : [el];
    if (!targets.length) return;

    /*
     * Built after the opening, not during it.
     *
     * Creating the ScrollTrigger measures the trigger element, and there are a
     * dozen of these on the home page all doing it inside the hydration commit
     * — forced layouts against fonts that have not landed, in the one window
     * where the opening panel is trying to animate. Every one is `once: true`
     * and below the fold on load, so nothing is lost by waiting. `.js-reveal`
     * keeps them hidden until then.
     */
    let ctx: gsap.Context | undefined;
    const stop = afterIntro(() => {
      ctx = gsap.context(() => {
        /*
         * Opacity, translation and scale only — no blur.
         *
         * The entrance used to resolve out of a 12px blur, and an animated
         * filter is the one property here the compositor cannot simply hand to
         * the GPU: every step re-rasterizes the element, and these wrappers are
         * section sized. The first of them fires the moment the intro scrolls
         * into view, which is exactly where the page was dropping frames.
         *
         * Opacity and transform reach the same place for free.
         */
        gsap.set(targets, {
          opacity: 0,
          y: 90,
          scale: 0.94,
        });
        gsap.to(targets, {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 1.1,
          delay,
          ease: "power3.out",
          stagger: stagger ?? 0,
          scrollTrigger: {
            trigger: el,
            start: "top 88%",
            once: true,
          },
          /*
           * Hand the element back to the browser once it has arrived.
           *
           * The tween finishes on `filter: blur(0px)`, and a zero radius blur is
           * not the same thing as no filter: the element keeps a render surface,
           * a stacking context and a containing block for the rest of the
           * session. Left inline that accumulates, one more permanent composited
           * layer per reveal, and there are a dozen of these on the home page
           * alone — all of them landing while the visitor is mid scroll.
           *
           * The class has to go first. `.js-reveal` carries `opacity: 0` and the
           * reduced motion rules beat GSAP's inline value on purpose, so
           * clearing the inline opacity while the class is still on would blink
           * the section out.
           */
          onComplete: () => {
            el.classList.remove("js-reveal");
            gsap.set(targets, {
              clearProps: "filter,transform,opacity,willChange",
            });
            if (stagger !== undefined) gsap.set(el, { clearProps: "opacity" });
          },
        });
        // the wrapper itself must not stay hidden when its children animate
        if (stagger !== undefined) gsap.set(el, { opacity: 1 });
      }, el);
    });

    return () => {
      stop();
      ctx?.revert();
    };
  }, [delay, stagger]);

  return (
    // js-reveal keeps the wrapper hidden until hydration, so the pre paint
    // HTML never flashes the finished state; the stagger case reveals the
    // wrapper immediately and hides its children instead
    <Tag ref={ref as never} className={`js-reveal ${className}`.trim()}>
      {children}
    </Tag>
  );
}
