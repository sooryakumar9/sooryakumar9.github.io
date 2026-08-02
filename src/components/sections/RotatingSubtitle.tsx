"use client";

import { useEffect, useState } from "react";
import { aboutSubtitles } from "@/content/journey";
import { useReducedMotion } from "@/lib/useReducedMotion";

/**
 * Cycles the three ways of saying the same thing under the About heading.
 * With motion reduced it stops rotating and shows the first line, and the
 * whole strip is aria-hidden either way because the heading beneath it already
 * carries the meaning.
 */
export default function RotatingSubtitle() {
  const [i, setI] = useState(0);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced) return;
    const id = setInterval(() => setI((v) => (v + 1) % aboutSubtitles.length), 3600);
    return () => clearInterval(id);
  }, [reduced]);

  return (
    <p aria-hidden className="text-muted relative h-6 overflow-hidden text-sm md:text-base">
      {aboutSubtitles.map((line, index) => (
        <span
          key={line}
          className="absolute inset-x-0 top-0 transition-all duration-700"
          style={{
            opacity: index === i ? 1 : 0,
            transform: `translateY(${(index - i) * 100}%)`,
          }}
        >
          {line}
        </span>
      ))}
    </p>
  );
}
