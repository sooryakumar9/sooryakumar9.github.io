"use client";

import { useId, useMemo, useState } from "react";
import { fuzzySearch } from "@/lib/fuzzy";
import { DISH_SAMPLE_NOTE, SAMPLE_DISHES } from "@/content/demoData";

/**
 * The dish search, actually running.
 *
 * The matcher is the real one — subsequence matching with word-start and run
 * bonuses, no dependencies. What is *not* real is the corpus: this ships a
 * sample rather than the product's 870 rows, and the note under the field says
 * so rather than letting the demo imply otherwise.
 */
export default function FuzzySearch() {
  const [query, setQuery] = useState("");
  const inputId = useId();
  const statusId = useId();

  const results = useMemo(() => fuzzySearch(query, SAMPLE_DISHES, 6), [query]);

  return (
    <section id="s-try-the-search" aria-labelledby={`${inputId}-label`} className="mb-12">
      <h2 id={`${inputId}-label`} className="display mb-2 text-2xl md:text-3xl">
        Try the search
      </h2>
      <p className="text-muted mb-6 text-sm">{DISH_SAMPLE_NOTE}</p>

      <div className="rounded-frame border-line bg-surface overflow-hidden border">
        <div className="border-line border-b p-4 md:p-5">
          <label htmlFor={inputId} className="eyebrow mb-2 block">
            Search dishes
          </label>
          <input
            id={inputId}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="try msdosa, or panr, or biryani"
            autoComplete="off"
            spellCheck={false}
            aria-describedby={statusId}
            className="border-line focus:border-accent w-full rounded-panel border bg-transparent px-4 py-3 font-mono text-sm outline-none transition-colors md:text-base"
          />
        </div>

        <p id={statusId} role="status" className="sr-only">
          {query
            ? `${results.length} of ${SAMPLE_DISHES.length} dishes match`
            : `${SAMPLE_DISHES.length} dishes`}
        </p>

        <ul className="divide-line divide-y">
          {results.map((m) => (
            <li key={m.value} className="flex items-center justify-between gap-4 px-5 py-3">
              <span className="text-sm md:text-base">
                {/* the matched characters are lifted, so you can see why it hit */}
                {[...m.value].map((ch, i) => (
                  <span
                    key={i}
                    className={m.hits.includes(i) ? "text-accent font-medium" : "text-muted"}
                  >
                    {ch}
                  </span>
                ))}
              </span>
              <span className="text-muted shrink-0 font-mono text-xs">
                {Math.round(m.score)}
              </span>
            </li>
          ))}

          {query && results.length === 0 && (
            <li className="text-muted px-5 py-6 text-sm">
              Nothing matches “{query}”. Every character has to appear, in order.
            </li>
          )}
        </ul>
      </div>
    </section>
  );
}
