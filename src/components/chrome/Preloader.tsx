"use client";

import { useLayoutEffect, useRef } from "react";
import { gsap } from "@/lib/gsapSetup";
import { markIntroDone } from "@/lib/clientEnv";
import { markReady, onProgress, remainingFloor, watchFonts } from "@/lib/pageReady";

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

    // this effect runs inside the hydration commit, so reaching it *is* the
    // milestone; fonts are awaited centrally from here too
    markReady("hydrated");
    watchFonts();

    let raf = 0;
    let target = 0;
    let shown = 0;
    let exiting = false;

    /*
     * The bar is written only when a milestone lands — four times, not sixty a
     * second — and CSS transitions it the rest of the way.
     *
     * That distinction is the whole point. A value written from rAF is main
     * thread work and stalls dead inside the very parse and hydration blocks
     * this panel exists to cover; a transform transition is handed to the
     * compositor and keeps moving straight through them. The counter text
     * cannot escape the main thread, but a number skipping a few digits reads
     * as far less broken than a progress bar that freezes.
     */
    const stopProgress = onProgress((p) => {
      target = p;
      el.style.setProperty("--pre-progress", String(p));
    });

    const ctx = gsap.context(() => {
      const exit = () => {
        if (exiting) return;
        exiting = true;
        gsap
          .timeline({
            onComplete: () => {
              document.body.style.overflow = "";
              markIntroDone();
            },
          })
          .to(".pre-line", {
            yPercent: -140,
            duration: 0.55,
            ease: "power3.in",
            stagger: 0.05,
          })
          // the slats lift in sequence, which reads as a curtain rather than a fade
          .to(
            ".pre-panel",
            {
              yPercent: -100,
              duration: 0.85,
              ease: "power3.inOut",
              stagger: 0.07,
            },
            "-=0.15",
          )
          .set(el, { display: "none" });
      };

      /*
       * The counter chases real progress instead of running a fixed tween.
       *
       * It also never quite catches up: easing toward the target means the
       * number keeps creeping between milestones rather than freezing on 30
       * and jumping to 60, which is what makes a loader feel stuck. The last
       * few percent only arrive when the page genuinely is ready.
       */
      const tick = () => {
        raf = requestAnimationFrame(tick);
        // gentle while there is still something to wait for, brisk once there
        // is not: a page that was ready in half a second should not be held
        // behind a counter still sauntering toward 100
        shown += (target - shown) * (target >= 1 ? 0.22 : 0.08);
        const v = Math.min(100, Math.round(shown * 100));

        // unpadded: the number widens from one digit to three as it climbs,
        // and since it is the left item of a `justify-between` row it grows
        // into the empty middle. The word block on the right stays pinned.
        if (countRef.current) countRef.current.textContent = String(v);
        // the word steps with the count rather than on its own timer, so the
        // two never drift out of sync
        if (wordRef.current) {
          wordRef.current.textContent =
            WORDS[Math.min(WORDS.length - 1, Math.floor((v / 100) * WORDS.length))];
        }

        if (target >= 1 && shown > 0.985 && remainingFloor() === 0) {
          cancelAnimationFrame(raf);
          raf = 0;
          if (countRef.current) countRef.current.textContent = "100";
          exit();
        }
      };
      raf = requestAnimationFrame(tick);
    }, el);

    return () => {
      if (raf) cancelAnimationFrame(raf);
      stopProgress();
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
              <span ref={countRef}>0</span>
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
          {/* scaled from a custom property the rAF loop writes, so the bar is
              a compositor transform rather than a main thread tween */}
          <div className="pre-bar bg-accent h-full w-full origin-left" />
        </div>
      </div>
    </div>
  );
}
