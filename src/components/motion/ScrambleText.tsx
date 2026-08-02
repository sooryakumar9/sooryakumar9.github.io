"use client";

import { useLayoutEffect, useRef, type ElementType } from "react";
import { prefersReducedMotion } from "@/lib/gsapSetup";

const GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#%&$@/\\<>*+=";

/**
 * Resolves a heading out of randomised characters as it scrolls into view.
 *
 * The real text is always in the DOM and the scrambled state is written to a
 * separate visual layer, so a screen reader, a search engine and a page with
 * JavaScript disabled all see the finished heading and never the noise.
 */
export default function ScrambleText({
  text,
  as: Tag = "span",
  className = "",
  speed = 1,
  id,
}: {
  text: string;
  as?: ElementType;
  className?: string;
  /** multiplier on the resolve rate; higher finishes sooner */
  speed?: number;
  /** so a section can still point aria-labelledby at this heading */
  id?: string;
}) {
  const visual = useRef<HTMLSpanElement | null>(null);

  useLayoutEffect(() => {
    const el = visual.current;
    if (!el || prefersReducedMotion()) return;

    const chars = [...text];
    let frame = 0;
    let raf = 0;
    let running = false;

    const render = () => {
      // each character locks in turn, three frames apart
      const locked = Math.floor(frame / (3 / speed));
      let out = "";
      for (let i = 0; i < chars.length; i++) {
        if (chars[i] === " ") {
          out += " ";
        } else if (i < locked) {
          out += chars[i];
        } else {
          out += GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
        }
      }
      el.textContent = out;
      frame += 1;

      if (locked <= chars.length) {
        raf = requestAnimationFrame(render);
      } else {
        el.textContent = text;
        running = false;
      }
    };

    const stop = onFirstEnter(el, () => {
      if (running) return;
      running = true;
      frame = 0;
      raf = requestAnimationFrame(render);
    });

    return () => {
      cancelAnimationFrame(raf);
      stop();
      el.textContent = text;
    };
  }, [text, speed]);

  return (
    <Tag id={id} className={className}>
      {/* the accessible copy; the scrambled layer is decorative */}
      <span className="sr-only">{text}</span>
      <span ref={visual} aria-hidden>
        {text}
      </span>
    </Tag>
  );
}

/** Fires `run` the first time `el` enters the viewport. Returns a disposer. */
function onFirstEnter(el: Element, run: () => void) {
  const io = new IntersectionObserver(
    (records) => {
      for (const r of records) {
        if (r.isIntersecting) {
          run();
          io.disconnect();
        }
      }
    },
    { threshold: 0.35 },
  );
  io.observe(el);
  return () => io.disconnect();
}
