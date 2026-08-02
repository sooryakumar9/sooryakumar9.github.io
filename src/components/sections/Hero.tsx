"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { gsap, prefersReducedMotion } from "@/lib/gsapSetup";
import Signature from "@/components/signature/Signature";
import { heroRoles, profile } from "@/content/profile";

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
    if (!h1) return;

    const fit = () => {
      const holder = h1.parentElement;
      if (!holder) return;
      const cs = getComputedStyle(h1);

      const probe = document.createElement("span");
      probe.style.cssText =
        "position:absolute;left:-9999px;top:0;visibility:hidden;white-space:nowrap;font-size:100px;";
      probe.style.fontFamily = cs.fontFamily;
      probe.style.fontWeight = cs.fontWeight;
      probe.style.letterSpacing = cs.letterSpacing;
      document.body.appendChild(probe);

      let ratio = 0;
      for (const role of heroRoles) {
        probe.textContent = role;
        ratio = Math.max(ratio, probe.getBoundingClientRect().width / 100);
      }
      probe.remove();
      if (ratio <= 0) return;

      // leave room for the caret and a little breathing space
      const avail = holder.clientWidth - 28;
      h1.style.fontSize = `${Math.min(128, Math.max(20, avail / ratio))}px`;
    };

    fit();
    // the real face changes the metrics, so measure again once it lands
    document.fonts?.ready.then(fit);

    const ro = new ResizeObserver(fit);
    ro.observe(document.documentElement);
    return () => ro.disconnect();
  }, []);

  // ignition: split to chars, light them, overshoot the scale, then the rest
  useLayoutEffect(() => {
    const el = root.current;
    const word = wordRef.current;
    if (!el || !word) return;

    // with motion reduced the name simply stays as it is: no ignition, and no
    // typewriter either, so `ignited` never needs to flip
    if (prefersReducedMotion()) return;

    let ctx: gsap.Context | undefined;

    const run = () => {
      ctx = gsap.context(() => {
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

        gsap.set(".hero-name", { scale: 0.42, opacity: 1, transformOrigin: "50% 50%" });
        gsap.set(".hero-fade", { opacity: 0, y: 18 });

        gsap
          .timeline({
            onComplete: () => {
              // hand the element back to plain text before the typewriter
              // starts rewriting textContent
              word.textContent = text;
              setIgnited(true);
            },
          })
          .to(chars, {
            color: "#f2f5f7",
            duration: 0.28,
            ease: "power1.out",
            stagger: 0.07,
          })
          .to(".hero-name", { scale: 1, duration: 0.9, ease: "back.out(1.3)" }, ">-0.05")
          .to(
            ".hero-fade",
            { opacity: 1, y: 0, duration: 0.7, ease: "power3.out", stagger: 0.12 },
            "<0.25",
          );
      }, el);
    };

    if (document.documentElement.dataset.introDone === "true") {
      run();
      return () => ctx?.revert();
    }

    // otherwise the ignition would play behind the opening panel
    window.addEventListener("intro:done", run, { once: true });
    return () => {
      window.removeEventListener("intro:done", run);
      ctx?.revert();
    };
  }, []);

  // typewriter: delete the current role, pause, type the next, hold
  useLayoutEffect(() => {
    const word = wordRef.current;
    if (!ignited || !word || prefersReducedMotion()) return;

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

    timer = window.setTimeout(step, 1500);
    return () => window.clearTimeout(timer);
  }, [ignited]);

  return (
    <section
      ref={root}
      className="relative flex min-h-[100svh] flex-col items-center justify-center overflow-hidden px-5 text-center"
    >
      <div aria-hidden className="absolute inset-0 z-0">
        <Signature variant="hero" interactive />
      </div>
      <div aria-hidden className="smoke smoke-a z-0" />

      {/* the headline measures itself against this box, so it is the page
          shell rather than a narrow reading column — the tagline below keeps
          its own measure */}
      <div className="page-shell relative z-10 flex flex-col items-center pt-20">
        <p className="hero-fade eyebrow mb-8 flex items-center gap-2">
          <span aria-hidden className="status-dot" />
          Available for work — {profile.location}
        </p>

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
