import type { BenchProject } from "./types";

/**
 * ON THE BENCH — active work in progress. Honest by construction:
 * `exists` renders inked, `building` renders dashed, `exploring` renders
 * pencil. ZenPro leads — it has a live public build. Diavo's deployment
 * is pending; the slot exists, the URL doesn't yet.
 */
export const benchProjects: BenchProject[] = [
  {
    id: "zenpro",
    title: "ZenPro",
    status: "ACTIVELY IN DEVELOPMENT",
    oneLiner: "A personalized morning intelligence brief for everything that moved overnight.",
    problem:
      "Staying current means twelve feeds every morning — tech, AI, markets, developer communities, job boards — each demanding attention, none aware of the others or of you.",
    vision:
      "One personalized daily environment: aggregation pipelines pull the sources, embeddings and ranking decide what matters to you, AI summarization compresses it into a brief you can finish with your coffee.",
    deployment: { status: "live", href: "https://zenpro-news.vercel.app/" },
    exists: [
      "First public build — live on Vercel",
      "System concept and architecture, sketched end to end",
    ],
    building: [
      "Content aggregation pipeline",
      "Dashboard — Next.js + TypeScript",
    ],
    exploring: [
      "Semantic embeddings for cross-source relevance",
      "Recommendation and ranking algorithms",
      "AI summarization into a morning brief",
      "Caching and scheduled data processing",
    ],
    plannedTech: ["Next.js", "TypeScript", "Supabase", "PostgreSQL", "Redis"],
    devLog: [
      { date: "2026-05", note: "Architecture sketched: sources → ingest → embed → rank → brief." },
      { date: "2026-06", note: "Evaluating aggregation strategies per source type." },
      { date: "2026-07", note: "First public build deployed." },
    ],
  },
  {
    id: "diavo",
    title: "Diavo",
    status: "ACTIVELY IN DEVELOPMENT",
    oneLiner: "A modern product for understanding food and everyday dietary decisions.",
    problem:
      "Nutrition information is abundant and unusable — labels, databases and advice that never quite answer the question a person actually has at a meal.",
    vision:
      "Thoughtful software between food data and daily decisions: precise underneath, human on the surface. A complete product, not a calorie widget.",
    deployment: { status: "pending" },
    exists: ["Product concept and problem framing", "Early design direction"],
    building: ["Core product design", "Application foundation"],
    exploring: [
      "How nutrition data should be structured for real questions",
      "What a genuinely intuitive food interface looks like",
    ],
    plannedTech: [],
    devLog: [
      { date: "2026-06", note: "Problem space mapped; product direction settled." },
      { date: "2026-07", note: "Design exploration in progress." },
    ],
  },
];
