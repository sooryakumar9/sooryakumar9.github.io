"use client";

import { useLayoutEffect, useRef, type ElementType, type ReactNode } from "react";
import { gsap, prefersReducedMotion } from "@/lib/gsapSetup";

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

    const targets: Element[] =
      stagger !== undefined ? Array.from(el.children) : [el];
    if (!targets.length) return;

    const ctx = gsap.context(() => {
      gsap.set(targets, { opacity: 0, y: 90, scale: 0.94, filter: "blur(12px)" });
      gsap.to(targets, {
        opacity: 1,
        y: 0,
        scale: 1,
        filter: "blur(0px)",
        duration: 1.1,
        delay,
        ease: "power3.out",
        stagger: stagger ?? 0,
        scrollTrigger: {
          trigger: el,
          start: "top 88%",
          once: true,
        },
      });
      // the wrapper itself must not stay hidden when its children animate
      if (stagger !== undefined) gsap.set(el, { opacity: 1 });
    }, el);

    return () => ctx.revert();
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
