import type { BenchProject } from "./types";

/**
 * ON THE BENCH: active work in progress. Honest by construction. `exists`
 * renders inked, `building` renders dashed, `exploring` renders pencil.
 * ZenPro leads because it has a live public build. Diavo's deployment is
 * pending, so the slot exists but the URL does not yet.
 *
 * House style: no dash or hyphen characters in prose. Proper nouns keep
 * their real spelling.
 */
export const benchProjects: BenchProject[] = [
  {
    id: "zenpro",
    title: "ZenPro",
    status: "ACTIVELY IN DEVELOPMENT",
    oneLiner: "A personalized morning intelligence brief for everything that moved overnight.",
    problem:
      "Staying current means twelve feeds every morning across technology, AI, markets, developer communities and job boards. Each one demands attention, and none of them knows about the others or about you.",
    vision:
      "One personalized daily environment. Aggregation pipelines pull the sources, embeddings and ranking decide what matters to you, and AI summarization compresses it all into a brief you can finish with your coffee.",
    deployment: { status: "live", href: "https://zenpro-news.vercel.app/" },
    exists: [
      "First public build, live on Vercel",
      "System concept and architecture, sketched from end to end",
    ],
    building: [
      "Content aggregation pipeline",
      "Dashboard built on Next.js and TypeScript",
    ],
    exploring: [
      "Semantic embeddings for relevance across sources",
      "Recommendation and ranking algorithms",
      "AI summarization into a morning brief",
      "Caching and scheduled data processing",
    ],
    plannedTech: ["Next.js", "TypeScript", "Supabase", "PostgreSQL", "Redis"],
    devLog: [
      { date: "May 2026", note: "Architecture sketched: sources, ingest, embed, rank, brief." },
      { date: "June 2026", note: "Evaluating aggregation strategies for each source type." },
      { date: "July 2026", note: "First public build deployed." },
    ],
  },
  {
    id: "diavo",
    title: "Diavo",
    status: "ACTIVELY IN DEVELOPMENT",
    oneLiner: "A modern product for understanding food and everyday dietary decisions.",
    problem:
      "Nutrition information is abundant and unusable. Labels, databases and advice that never quite answer the question a person actually has at a meal.",
    vision:
      "Thoughtful software between food data and daily decisions. Precise underneath, human on the surface. A complete product, not a calorie widget.",
    deployment: { status: "live", href: "https://diavo.vercel.app" },
    exists: [
      "Live build on Vercel",
      "Email and password authentication on Supabase",
      "A searchable corpus of 870 dishes with a zero dependency fuzzy search",
      "Row level security scoped to each owner",
    ],
    building: [
      "Personalized dietary tracking",
      "Food detail and nutrition views on Drizzle and Postgres",
    ],
    exploring: [
      "How nutrition data should be structured for real questions",
      "Photo verification for dishes from open image sources",
    ],
    plannedTech: ["Next.js", "TypeScript", "Supabase", "PostgreSQL"],
    techNotes:
      "Next.js 16 with React 19 and strict TypeScript, Tailwind CSS v4 and Motion, Supabase auth and Postgres, Drizzle ORM, Zod validation, TanStack Query, and row level security over a static corpus of 870 dishes.",
    devLog: [
      { date: "June 2026", note: "Problem space mapped and product direction settled." },
      { date: "July 2026", note: "First build live on Vercel with auth and food search." },
    ],
  },
];
