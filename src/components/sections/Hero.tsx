"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { gsap, prefersReducedMotion } from "@/lib/gsapSetup";
import HeroField from "@/components/signature/HeroField";
import { heroRoles, profile } from "@/content/profile";
import { markReady } from "@/lib/pageReady";

/**
 * The opening. Characters ignite from dead grey to full contrast, the word
 * scales up past its resting size and settles, and then the headline starts
 * typing itself through the roles.
 *
 * The headline is one line at every width. Three things enforce that together
 * and all three are load bearing: `whitespace-nowrap` so it cannot wrap at all,
 * a `clamp()` ceiling so the type stops growing before it outruns the column,
 * and a per-word wrapper around the character spans so that if a future string
 * ever did wrap it would break at a space rather than mid-word. That last one
 * is what produced "Soorya K / umar" — every letter was its own inline-block,
 * so every gap between letters was a break opportunity.
 */
export default function Hero() {
  const root = useRef<HTMLElement | null>(null);
  const nameRef = useRef<HTMLHeadingElement | null>(null);
  const wordRef = useRef<HTMLSpanElement | null>(null);
  const [ignited, setIgnited] = useState(false);

  /**
   * Size the headline to the widest string it will ever hold.
   *
   * A fixed clamp has to be tuned for the longest role — twenty characters —
   * which then makes the twelve character name needlessly small on a phone.
   * Measuring instead gives the largest type that always fits at any width,
   * and it stays correct if the role list is ever edited.
   */
  useLayoutEffect(() => {
    const h1 = nameRef.current;
    const holder = h1?.parentElement;
    if (!h1 || !holder) return;

    /*
     * Width per unit of font size, for the longest role. This depends only on
     * the resolved face, weight and tracking — not on how wide the window is —
     * so it is measured once and again when the real font lands, rather than
     * on every resize.
     *
     * All six probes go in together and are read afterwards. Setting
     * `textContent` and reading a rect in the same loop meant six synchronous
     * layouts of the whole document, one per role.
     */
    let ratio = 0;
    const measure = () => {
      const cs = getComputedStyle(h1);
      const frag = document.createDocumentFragment();
      const probes = heroRoles.map((role) => {
        const probe = document.createElement("span");
        probe.style.cssText =
          "position:absolute;left:-9999px;top:0;visibility:hidden;white-space:nowrap;font-size:100px;";
        probe.style.fontFamily = cs.fontFamily;
        probe.style.fontWeight = cs.fontWeight;
        probe.style.letterSpacing = cs.letterSpacing;
        probe.textContent = role;
        frag.appendChild(probe);
        return probe;
      });

      document.body.appendChild(frag);
      for (const probe of probes) {
        ratio = Math.max(ratio, probe.getBoundingClientRect().width / 100);
      }
      for (const probe of probes) probe.remove();
    };

    let lastPx = 0;
    const fit = () => {
      if (ratio <= 0) return;
      // leave room for the caret and a little breathing space
      const avail = holder.clientWidth - 28;
      const px = Math.round(Math.min(128, Math.max(20, avail / ratio)));
      if (px === lastPx) return;
      lastPx = px;
      h1.style.fontSize = `${px}px`;
    };

    /*
     * Measured once, against the real face.
     *
     * This used to size the headline immediately with fallback metrics and then
     * again on `document.fonts.ready`, so the name visibly changed size after
     * the opening panel had already lifted. The panel now waits for fonts, so
     * the single measurement happens behind it and the first thing the visitor
     * sees is already correct.
     */
    let cancelled = false;
    const settle = () => {
      if (cancelled) return;
      measure();
      fit();
    };

    if (!document.fonts || document.fonts.status === "loaded") {
      settle();
    } else {
      document.fonts.ready.then(settle).catch(settle);
    }

    /*
     * Watch the column, not the document.
     *
     * This used to observe `documentElement`, whose box changes with page
     * *height* — so inserting the featured rail's pin spacer, or any reveal
     * that changes a section's height, re-ran a measurement that only ever
     * cared about width. All of that happens during the first scroll, which is
     * exactly when there was no budget for it.
     */
    const ro = new ResizeObserver(fit);
    ro.observe(holder);
    return () => {
      cancelled = true;
      ro.disconnect();
    };
  }, []);

  // ignition: split to chars, light them, overshoot the scale, then the rest
  useLayoutEffect(() => {
    const el = root.current;
    const word = wordRef.current;
    const name = nameRef.current;
    if (!el || !word || !name) return;

    // with motion reduced the name simply stays as it is: no ignition, and no
    // typewriter either, so `ignited` never needs to flip
    if (prefersReducedMotion()) return;

    /*
     * Element references rather than selector strings, because the timeline is
     * built later, on `intro:done`. A selector string inside a `gsap.context`
     * is resolved against the context's scope, and that scoping only exists
     * while the context function is running — so a string evaluated after it
     * returns silently matched nothing and the whole ignition never played.
     */
    const fades = Array.from(el.querySelectorAll<HTMLElement>(".hero-fade"));

    let play: (() => void) | undefined;

    /*
     * Priming happens now; only the playing waits for the panel.
     *
     * These used to be the same step, which meant the hero was revealed in its
     * finished state \u2014 name at full size, tagline visible \u2014 and then snapped
     * back to the starting pose the instant `intro:done` fired. The opening
     * read as big, small, big. The panel lifts *before* that event, so
     * anything the timeline starts from has to be set before the panel goes.
     */
    const ctx = gsap.context(() => {
      const text = word.textContent ?? "";
      word.textContent = "";
      const chars: HTMLSpanElement[] = [];
      for (const ch of text) {
        const span = document.createElement("span");
        span.className = "js-hero-char inline-block";
        // an inline-block holding an ordinary space has it trimmed away and
        // the words weld together, so spaces must be non breaking
        span.textContent = ch === " " ? "\u00a0" : ch;
        word.appendChild(span);
        chars.push(span);
      }

      gsap.set(name, { scale: 0.42, opacity: 1, transformOrigin: "50% 50%" });
      gsap.set(fades, { opacity: 0, y: 18 });

      play = () => {
        gsap
          .timeline({
            onComplete: () => {
              // hand the element back to plain text before the typewriter
              // starts rewriting textContent
              word.textContent = text;
              // the promotion was for the ignition transform, which is over.
              // Left on, these two stay composited for the session and the
              // typewriter re-rasters a promoted layer twenty times a second
              gsap.set([name, word], { willChange: "auto" });
              setIgnited(true);
            },
          })
          .to(chars, {
            color: "#f2f5f7",
            duration: 0.28,
            ease: "power1.out",
            stagger: 0.07,
          })
          .to(name, { scale: 1, duration: 0.9, ease: "back.out(1.3)" }, ">-0.05")
          .to(
            fades,
            { opacity: 1, y: 0, duration: 0.7, ease: "power3.out", stagger: 0.12 },
            "<0.25",
          );
      };
    }, el);

    if (document.documentElement.dataset.introDone === "true") {
      play?.();
      return () => ctx.revert();
    }

    // otherwise the ignition would run behind the opening panel and be over
    // before anyone saw it
    const onDone = () => play?.();
    window.addEventListener("intro:done", onDone, { once: true });
    return () => {
      window.removeEventListener("intro:done", onDone);
      ctx.revert();
    };
  }, []);

  /*
   * Typewriter: delete the current role, pause, type the next, hold.
   *
   * It only runs while the hero is on screen. This used to chain timers for
   * the life of the page, rewriting `textContent` every 35 to 70ms and forcing
   * a layout each time, long after the visitor had scrolled a full viewport
   * past it — so the featured rail was competing with a headline nobody could
   * see. The canvas rule about never settling into a static state does not
   * apply: this is text, and it is not being looked at.
   */
  useLayoutEffect(() => {
    const word = wordRef.current;
    const el = root.current;
    if (!ignited || !word || !el || prefersReducedMotion()) return;

    let index = 0;
    let count = heroRoles[0].length;
    let deleting = true;
    let timer = 0;

    const step = () => {
      if (deleting) {
        count -= 1;
        word.textContent = heroRoles[index].slice(0, count);
        if (count === 0) {
          index = (index + 1) % heroRoles.length;
          deleting = false;
          timer = window.setTimeout(step, 250);
        } else {
          timer = window.setTimeout(step, 35);
        }
        return;
      }

      count += 1;
      const target = heroRoles[index];
      word.textContent = target.slice(0, count);
      if (count === target.length) {
        deleting = true;
        timer = window.setTimeout(step, 1500);
      } else {
        timer = window.setTimeout(step, 70);
      }
    };

    // resumes mid word rather than restarting, so coming back to the top of
    // the page does not replay the same role from scratch
    let running = false;
    const start = () => {
      if (running) return;
      running = true;
      timer = window.setTimeout(step, 1500);
    };
    const stop = () => {
      running = false;
      window.clearTimeout(timer);
    };

    const io = new IntersectionObserver(
      ([record]) => (record.isIntersecting ? start() : stop()),
      { rootMargin: "80px" },
    );
    io.observe(el);

    return () => {
      io.disconnect();
      stop();
    };
  }, [ignited]);

  return (
    <section
      ref={root}
      className="relative flex min-h-[100svh] flex-col items-center justify-center overflow-hidden px-5 text-center"
    >
      <div aria-hidden className="absolute inset-0 z-0">
        {/* the opening panel waits on this: the field reports in once it
            has genuinely painted, so the hero is never revealed mid build */}
        {/* Capped at 30. The field takes seconds to visibly change, and the
            pointer easing still advances every frame — it follows the same
            curve, just painted half as often. That halves the GPU cost of a
            full viewport noise shader for no perceptible loss. */}
        <HeroField fps={30} onReady={() => markReady("hero")} />
      </div>
      <div aria-hidden className="smoke smoke-a z-0" />

      {/* the headline measures itself against this box, so it is the page
          shell rather than a narrow reading column — the tagline below keeps
          its own measure */}
      <div className="page-shell relative z-10 flex flex-col items-center pt-20">
        {/* the accessible name stays the real name no matter what the
            typewriter has left in the DOM at any given moment */}
        <h1
          ref={nameRef}
          aria-label={profile.name}
          className="hero-name display font-medium whitespace-nowrap will-change-transform"
          style={{
            // the clamp is only the pre-hydration fallback; the effect above
            // replaces it with a measured size that fits the longest role
            fontSize: "clamp(22px, 7.4vw, 128px)",
            lineHeight: 0.9,
            letterSpacing: "0.01em",
          }}
        >
          <span ref={wordRef} aria-hidden className="inline-block will-change-transform">
            {profile.name}
          </span>
          <span aria-hidden className="caret text-accent ml-1 inline-block font-light">
            |
          </span>
        </h1>

        <p className="hero-fade text-muted mt-10 max-w-xl text-balance md:mt-14 md:text-lg">
          {profile.tagline}
        </p>
      </div>

      <div className="hero-fade absolute bottom-8 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-3">
        <span className="eyebrow">Scroll</span>
        <span aria-hidden className="scroll-cue-line" />
      </div>
    </section>
  );
}
