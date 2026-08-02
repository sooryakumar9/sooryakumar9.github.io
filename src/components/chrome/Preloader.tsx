"use client";

import { useLayoutEffect, useRef } from "react";
import { gsap } from "@/lib/gsapSetup";
import { markIntroDone } from "@/lib/clientEnv";

const PANELS = 5;
const WORDS = ["Design", "Build", "Ship", "Automate", "Secure"];

/**
 * The opening. A counter runs to 100 while a word cycles beneath it, then the
 * panel splits into vertical slats that lift away one after another.
 *
 * The decision to play is made by a blocking script in the document head, not
 * here, so a returning visitor never sees a frame of it. This component always
 * renders the same markup — CSS hides it when the head script has flagged the
 * intro as skipped — which keeps the server and client output identical and
 * puts the panel on screen from the very first paint rather than after React
 * wakes up.
 */
export default function Preloader() {
  const root = useRef<HTMLDivElement | null>(null);
  const countRef = useRef<HTMLSpanElement | null>(null);
  const wordRef = useRef<HTMLSpanElement | null>(null);

  useLayoutEffect(() => {
    const el = root.current;
    if (!el) return;

    // the head script already hid the panel and released the hero
    if (document.documentElement.dataset.intro === "skip") return;

    document.body.style.overflow = "hidden";

    const ctx = gsap.context(() => {
      const counter = { v: 0 };
      gsap.set(".pre-bar", { scaleX: 0, transformOrigin: "left center" });

      const tl = gsap.timeline({
        onComplete: () => {
          document.body.style.overflow = "";
          markIntroDone();
        },
      });

      tl.to(counter, {
        v: 100,
        duration: 1.5,
        ease: "power2.inOut",
        onUpdate: () => {
          const v = Math.round(counter.v);
          if (countRef.current) countRef.current.textContent = String(v).padStart(3, "0");
          // the word steps with the count rather than on its own timer, so the
          // two never drift out of sync
          if (wordRef.current) {
            wordRef.current.textContent =
              WORDS[Math.min(WORDS.length - 1, Math.floor((v / 100) * WORDS.length))];
          }
        },
      })
        .to(".pre-bar", { scaleX: 1, duration: 1.5, ease: "power2.inOut" }, 0)
        .to(".pre-line", { yPercent: -140, duration: 0.55, ease: "power3.in", stagger: 0.05 })
        // the slats lift in sequence, which reads as a curtain rather than a fade
        .to(
          ".pre-panel",
          { yPercent: -100, duration: 0.85, ease: "power3.inOut", stagger: 0.07 },
          "-=0.15",
        )
        .set(el, { display: "none" });
    }, el);

    return () => {
      ctx.revert();
      document.body.style.overflow = "";
    };
  }, []);

  return (
    <div ref={root} aria-hidden className="preloader fixed inset-0 z-90">
      {/* the slats sit behind the content and are what actually lifts away */}
      <div className="absolute inset-0 flex">
        {Array.from({ length: PANELS }, (_, i) => (
          <div key={i} className="pre-panel bg-bg h-full flex-1" />
        ))}
      </div>

      <div className="relative flex h-full flex-col justify-between p-6 md:p-10">
        <div className="overflow-hidden">
          <p className="pre-line eyebrow">Soorya Kumar</p>
        </div>

        <div className="flex items-end justify-between gap-6">
          <div className="overflow-hidden">
            <p
              className="pre-line display text-fg leading-none"
              style={{ fontSize: "clamp(56px, 13vw, 190px)" }}
            >
              <span ref={countRef}>000</span>
              <span className="text-accent align-super text-[0.4em]">%</span>
            </p>
          </div>
          <div className="overflow-hidden pb-3">
            <p className="pre-line eyebrow text-right">
              <span ref={wordRef} className="text-accent">
                Design
              </span>
              <br />
              in progress
            </p>
          </div>
        </div>

        <div className="bg-line mt-6 h-px w-full overflow-hidden">
          <div className="pre-bar bg-accent h-full w-full origin-left" />
        </div>
      </div>
    </div>
  );
}
