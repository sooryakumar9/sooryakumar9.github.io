"use client";

import { useEffect, useRef, useState } from "react";
import { SHEETS } from "@/lib/sheets";

/**
 * Document chrome: a minimal instrument header (name · current sheet readout)
 * and, on wide screens, a vertical sheet index on the right edge that
 * behaves like drawing sheet tabs. The header swaps ink for paper while the
 * inverted (Q-Secure) chapter is under it.
 */
export default function SiteChrome() {
  const [active, setActive] = useState(0);
  const [overInk, setOverInk] = useState(false);

  useEffect(() => {
    const sections = SHEETS.map((s) => document.getElementById(s.id)).filter(
      (el): el is HTMLElement => el !== null,
    );
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const idx = SHEETS.findIndex((s) => s.id === entry.target.id);
            if (idx >= 0) setActive(idx);
          }
        }
      },
      { rootMargin: "-40% 0px -55% 0px" },
    );
    sections.forEach((el) => observer.observe(el));

    // header color: track whether an inverted chapter is under the header band
    const inverted = Array.from(document.querySelectorAll<HTMLElement>(".inverted"));
    let raf = 0;
    const check = () => {
      raf = 0;
      const hit = inverted.some((el) => {
        const r = el.getBoundingClientRect();
        return r.top < 48 && r.bottom > 0;
      });
      setOverInk(hit);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(check);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    check();

    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  const headerColor = overInk ? "text-[#efece2]" : "text-ink";

  return (
    <>
      <header
        className={`pointer-events-none fixed inset-x-0 top-0 z-50 flex items-center justify-between py-4 pl-[calc(max(14px,2.6vw)+14px)] pr-[max(14px,2.6vw)] transition-colors duration-300 ${headerColor}`}
      >
        <a href="#sec-00" className="annotation pointer-events-auto">
          SOORYA&nbsp;KUMAR
        </a>
        <p className="annotation" aria-hidden>
          <span className="opacity-70">SYSTEM&nbsp;DOCUMENT&nbsp;·&nbsp;</span>
          SHEET&nbsp;{SHEETS[active].num}/{SHEETS[SHEETS.length - 1].num}
        </p>
      </header>

      <nav
        aria-label="Sheet index"
        className="fixed right-[max(14px,2vw)] top-1/2 z-50 hidden -translate-y-1/2 flex-col items-end gap-2.5 lg:flex"
      >
        {SHEETS.map((sheet, i) => (
          <IndexTab key={sheet.id} sheet={sheet} active={i === active} />
        ))}
      </nav>
    </>
  );
}

function IndexTab({
  sheet,
  active,
}: {
  sheet: (typeof SHEETS)[number];
  active: boolean;
}) {
  const ref = useRef<HTMLAnchorElement>(null);

  // magnetic: the tab leans a few px toward the cursor
  const onMove = (e: React.MouseEvent) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const dx = (e.clientX - (r.left + r.width / 2)) * 0.25;
    const dy = (e.clientY - (r.top + r.height / 2)) * 0.25;
    el.style.transform = `translate(${dx}px, ${dy}px)`;
  };
  const onLeave = () => {
    if (ref.current) ref.current.style.transform = "";
  };

  return (
    <a
      ref={ref}
      href={`#${sheet.id}`}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      aria-current={active ? "true" : undefined}
      className={`annotation group flex items-center gap-2 transition-[transform,color] duration-200 ${
        active ? "text-signal" : "text-ink/70 hover:text-ink"
      }`}
    >
      <span className="hidden opacity-0 transition-opacity duration-200 group-hover:opacity-100 xl:inline">
        {sheet.title}
      </span>
      <span>{sheet.num}</span>
      <span
        aria-hidden
        className={`block h-px transition-all duration-300 ${
          active ? "w-6 bg-signal" : "w-3 bg-hairline-strong"
        }`}
      />
    </a>
  );
}
