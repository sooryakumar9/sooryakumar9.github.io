"use client";

import { useEffect, useState } from "react";

export type NavSection = { id: string; label: string };

/**
 * A sticky rail on case-study pages: where you are, and a way to jump.
 *
 * These are real anchor links, not buttons, so they work with scripting off
 * and can be opened in a new tab. JavaScript only adds the active state and
 * the progress bar — take it away and this is still a working table of
 * contents.
 *
 * Hidden below `lg`, where there is no column to put it in.
 */
export default function CaseStudyNav({ sections }: { sections: NavSection[] }) {
  const [active, setActive] = useState(sections[0]?.id ?? "");
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const targets = sections
      .map((s) => document.getElementById(s.id))
      .filter((el): el is HTMLElement => Boolean(el));
    if (!targets.length) return;

    // the topmost section that has crossed the upper third of the viewport
    const io = new IntersectionObserver(
      () => {
        const line = window.innerHeight * 0.33;
        let current = targets[0].id;
        for (const el of targets) {
          if (el.getBoundingClientRect().top <= line) current = el.id;
        }
        setActive(current);
      },
      { rootMargin: "-33% 0px -60% 0px", threshold: [0, 1] },
    );
    for (const el of targets) io.observe(el);

    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(max > 0 ? Math.min(1, window.scrollY / max) : 0);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      io.disconnect();
      window.removeEventListener("scroll", onScroll);
    };
  }, [sections]);

  return (
    <nav aria-label="Sections" className="hidden lg:block">
      <div className="sticky top-32">
        <p className="eyebrow mb-4">On this page</p>

        <div aria-hidden className="bg-line mb-5 h-px w-full overflow-hidden">
          <div
            className="bg-accent h-full origin-left transition-transform duration-150"
            style={{ transform: `scaleX(${progress})` }}
          />
        </div>

        <ul className="space-y-2.5">
          {sections.map((s) => {
            const on = s.id === active;
            return (
              <li key={s.id}>
                <a
                  href={`#${s.id}`}
                  aria-current={on ? "location" : undefined}
                  className={`flex items-center gap-3 text-sm transition-colors ${
                    on ? "text-accent" : "text-muted hover:text-fg"
                  }`}
                >
                  <span
                    aria-hidden
                    className={`block h-px shrink-0 transition-all duration-400 ${
                      on ? "bg-accent w-6" : "bg-line-strong w-3"
                    }`}
                  />
                  {s.label}
                </a>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}
