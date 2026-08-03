"use client";

import { useEffect, useId, useMemo, useState } from "react";
import { CIPHER_PLACEHOLDER } from "@/content/demoData";
import { REDUCED_MOTION, useMediaQuery } from "@/lib/clientEnv";

const GLYPHS = "0123456789ABCDEF#$%&@?§¤";

/** A stable, seeded scramble of a string — the same input always looks alike. */
function scramble(text: string, salt: number): string {
  let out = "";
  for (let i = 0; i < text.length; i++) {
    if (text[i] === " ") {
      out += " ";
      continue;
    }
    const h = Math.sin((i + 1) * 12.9898 + salt * 78.233) * 43758.5453;
    out += GLYPHS[Math.floor((h - Math.floor(h)) * GLYPHS.length)];
  }
  return out;
}

/**
 * Harvest now, decrypt later — the argument the project makes, made playable.
 *
 * Type a message and watch what an interceptor holds on each channel. The
 * classical capture resolves, character by character, once the adversary has
 * the compute to break it. The quantum-safe capture never does.
 *
 * This is an **illustration of the threat model, not the project's
 * cryptography**. No key exchange is happening in this component — real post
 * quantum primitives are not running in your browser, and the caption says so
 * rather than letting the demo imply a capability it does not have.
 */
export default function CipherChannels() {
  const [text, setText] = useState("");
  // one monotonic counter; how much is broken is derived from it, so changing
  // the message never has to reset state from inside an effect
  const [tick, setTick] = useState(0);
  const [salt, setSalt] = useState(0);
  const reduced = useMediaQuery(REDUCED_MOTION);
  const inputId = useId();

  const message = text || CIPHER_PLACEHOLDER;

  // the classical channel gives itself up progressively once "cracking" starts
  useEffect(() => {
    if (reduced) return;
    const id = setInterval(() => setTick((n) => n + 1), 220);
    return () => clearInterval(id);
  }, [reduced]);

  // a few extra steps at the end so the fully broken state holds before it loops
  const broken = reduced
    ? message.length
    : Math.min(message.length, tick % (message.length + 8));

  // the quantum-safe side keeps churning so it never looks merely frozen
  useEffect(() => {
    if (reduced) return;
    const id = setInterval(() => setSalt((s) => s + 1), 320);
    return () => clearInterval(id);
  }, [reduced]);

  const safe = useMemo(() => scramble(message, salt), [message, salt]);
  const classical = useMemo(
    () => message.slice(0, broken) + scramble(message.slice(broken), 7),
    [message, broken],
  );

  return (
    <section id="s-interceptor" aria-labelledby={`${inputId}-label`} className="mb-12">
      <h2 id={`${inputId}-label`} className="display mb-2 text-2xl md:text-3xl">
        What an interceptor holds
      </h2>
      <p className="text-muted mb-6 text-sm">
        An illustration of harvest now, decrypt later — not the project&rsquo;s actual key
        exchange. No cryptography is running here; this shows the shape of the argument.
      </p>

      <div className="rounded-frame border-line bg-surface overflow-hidden border">
        <div className="border-line border-b p-4 md:p-5">
          <label htmlFor={inputId} className="eyebrow mb-2 block">
            Your message
          </label>
          <input
            id={inputId}
            type="text"
            value={text}
            maxLength={48}
            onChange={(e) => setText(e.target.value)}
            placeholder={CIPHER_PLACEHOLDER}
            autoComplete="off"
            spellCheck={false}
            className="border-line focus:border-accent w-full rounded-panel border bg-transparent px-4 py-3 font-mono text-sm outline-none transition-colors md:text-base"
          />
        </div>

        <div className="divide-line grid divide-y md:grid-cols-2 md:divide-x md:divide-y-0">
          <div className="p-5">
            <p className="eyebrow text-accent-deep mb-3">Classical channel · RSA</p>
            <p className="font-mono text-sm break-all md:text-base">
              <span className="text-accent-deep">{classical.slice(0, broken)}</span>
              <span className="text-muted">{classical.slice(broken)}</span>
            </p>
            <p className="text-muted mt-3 text-xs">
              Captured today, readable once a large enough quantum computer exists.
            </p>
          </div>

          <div className="p-5">
            <p className="eyebrow text-accent mb-3">Quantum safe channel</p>
            <p className="text-muted font-mono text-sm break-all md:text-base">{safe}</p>
            <p className="text-muted mt-3 text-xs">
              The same capture, on a channel that stays noise.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
