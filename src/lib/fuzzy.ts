/**
 * Subsequence fuzzy matching with no dependencies.
 *
 * A query matches if its characters appear in order in the candidate, not
 * necessarily adjacently — so "msdosa" finds "Masala dosa". The score rewards
 * matches that start a word, run consecutively, and land early, which is what
 * makes the ranking feel sensible rather than arbitrary.
 *
 * This is the same approach the live product uses over its full corpus.
 */
export type Match = {
  value: string;
  score: number;
  /** indices in `value` that the query matched, for highlighting */
  hits: number[];
};

const START_BONUS = 12;
const RUN_BONUS = 6;
const EARLY_BONUS = 4;

export function fuzzyMatch(query: string, value: string): Match | null {
  const q = query.trim().toLowerCase();
  if (!q) return { value, score: 0, hits: [] };

  const v = value.toLowerCase();
  const hits: number[] = [];
  let score = 0;
  let qi = 0;
  let run = 0;

  for (let vi = 0; vi < v.length && qi < q.length; vi++) {
    if (v[vi] !== q[qi]) {
      run = 0;
      continue;
    }

    hits.push(vi);
    score += 1;

    // a character that begins a word is a much stronger signal than one
    // buried in the middle of it
    if (vi === 0 || v[vi - 1] === " " || v[vi - 1] === "-") score += START_BONUS;
    if (run > 0) score += RUN_BONUS * Math.min(run, 4);
    score += Math.max(0, EARLY_BONUS - vi * 0.2);

    run += 1;
    qi += 1;
  }

  // every character of the query has to appear, in order
  if (qi < q.length) return null;

  // shorter candidates that satisfy the query are the better answer
  score -= v.length * 0.12;
  return { value, score, hits };
}

export function fuzzySearch(query: string, corpus: readonly string[], limit = 8): Match[] {
  const out: Match[] = [];
  for (const value of corpus) {
    const m = fuzzyMatch(query, value);
    if (m) out.push(m);
  }
  out.sort((a, b) => b.score - a.score || a.value.localeCompare(b.value));
  return out.slice(0, limit);
}
