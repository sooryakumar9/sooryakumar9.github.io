"use client";

import { useMotionOff, useMotionPref, setMotion } from "@/lib/motion";
import { useIsClient } from "@/lib/clientEnv";

/**
 * Lets a visitor ask this site to hold still.
 *
 * The site runs ten canvases, a WebGL hero and a lot of GSAP. It has always
 * honoured `prefers-reduced-motion`, but that is a setting most people never
 * find, and some want stillness here without changing it for everything.
 *
 * Three states, not two. `system` is the default and has to stay reachable, or
 * someone who presses this by accident is stuck away from their own OS setting
 * with no way back. The button cycles system → off → on → system, and says
 * which one it is currently in rather than making anyone guess.
 *
 * Renders a disabled placeholder until the client takes over, because the
 * server cannot know the answer and a wrong first paint would be worse than a
 * beat of waiting.
 */
const NEXT = { system: "off", off: "on", on: "system" } as const;

const LABEL = {
  system: "Motion: system",
  off: "Motion: off",
  on: "Motion: on",
} as const;

const HINT = {
  system: "following your device setting",
  off: "animations are stilled",
  on: "animations are on",
} as const;

export default function MotionToggle() {
  const ready = useIsClient();
  const pref = useMotionPref();
  const off = useMotionOff();

  return (
    <button
      type="button"
      onClick={() => setMotion(NEXT[pref])}
      disabled={!ready}
      // `aria-pressed` is the state that matters to someone who cannot see the
      // page: is motion currently suppressed, whoever decided that
      aria-pressed={off}
      title={ready ? HINT[pref] : undefined}
      className="text-muted hover:text-fg focus-visible:text-fg inline-flex items-center gap-2 text-xs transition-colors disabled:opacity-50"
    >
      <span
        aria-hidden
        className={`block h-1.5 w-1.5 rounded-full transition-colors ${
          off ? "bg-line-strong" : "bg-accent"
        }`}
      />
      {ready ? LABEL[pref] : "Motion"}
    </button>
  );
}
