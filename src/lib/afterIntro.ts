"use client";

/**
 * Runs `fn` once the opening is over, or immediately if it already is.
 *
 * Every scroll-driven section used to build its ScrollTrigger during the
 * hydration commit. Each one measures its trigger element, so seventeen of them
 * meant seventeen forced layouts of a page whose fonts had not settled — all
 * inside the window where the opening panel is trying to animate, and none of
 * it needed until the visitor scrolls.
 *
 * This is the same wait `Hero.tsx` already performs for its ignition: check the
 * attribute first, since the head script may have set it before React ran, and
 * only then listen for the event.
 *
 * Returns a disposer.
 */
export function afterIntro(fn: () => void): () => void {
  if (typeof document === "undefined") {
    fn();
    return () => {};
  }

  if (document.documentElement.dataset.introDone === "true") {
    fn();
    return () => {};
  }

  /*
   * The deadline is not optional.
   *
   * A dozen elements on the home page are held at `opacity: 0` by `.js-reveal`
   * and only ever revealed by the work this schedules. Waiting on an event
   * means that if the opening sequence fails for any reason — a thrown timeline,
   * a browser that never fires it — the visitor is left looking at a blank page
   * with no way to recover. The reduced motion rules in `globals.css` catch the
   * motion-off case and nothing catches this one.
   *
   * Comfortably past the ~3.3s opening plus its own 4s ceiling, so in normal
   * operation it never fires.
   */
  let done = false;
  const run = () => {
    if (done) return;
    done = true;
    window.clearTimeout(timer);
    window.removeEventListener("intro:done", run);
    fn();
  };

  const timer = window.setTimeout(run, 8000);
  window.addEventListener("intro:done", run, { once: true });

  return () => {
    done = true;
    window.clearTimeout(timer);
    window.removeEventListener("intro:done", run);
  };
}
