import { caseStudies } from "@/content/projects";
import { benchProjects } from "@/content/bench";
import { experienceRecords } from "@/content/experience";

/**
 * The capability graph is derived from the content layer — every edge is a
 * technology actually used (solid) or honestly planned (dashed). Adding a
 * project to the content files grows the graph automatically.
 */

export interface GraphNode {
  id: string;
  label: string;
  kind: "project" | "tech";
  x: number;
  y: number;
  draft?: boolean;
}

export interface GraphEdge {
  from: string; // project id
  to: string; // tech id
  planned: boolean;
}

const PROJECT_POS: Record<string, { x: number; y: number; label: string }> = {
  hils: { x: 220, y: 150, label: "HILS AUTOMATION" },
  rag: { x: 500, y: 110, label: "RESUME ANALYZER" },
  qsecure: { x: 780, y: 150, label: "Q-SECURE CHAT" },
  mindmatrix: { x: 220, y: 285, label: "MADHU-MARGA" },
  blocker: { x: 220, y: 420, label: "WEBSITE BLOCKER" },
  diavo: { x: 500, y: 460, label: "DIAVO" },
  zenpro: { x: 780, y: 420, label: "ZENPRO" },
};

const TECH_POS: Record<string, { x: number; y: number }> = {
  Python: { x: 400, y: 285 },
  "RT-LAB": { x: 105, y: 75 },
  MATLAB: { x: 80, y: 235 },
  LangChain: { x: 350, y: 55 },
  FAISS: { x: 555, y: 235 },
  "OpenAI API": { x: 645, y: 55 },
  Selenium: { x: 500, y: 210 },
  JavaScript: { x: 905, y: 80 },
  "HTML/CSS": { x: 920, y: 235 },
  Tkinter: { x: 90, y: 510 },
  Kotlin: { x: 65, y: 300 },
  "Jetpack Compose": { x: 110, y: 375 },
  Room: { x: 330, y: 355 },
  "Next.js": { x: 915, y: 320 },
  TypeScript: { x: 930, y: 505 },
  Supabase: { x: 700, y: 545 },
  PostgreSQL: { x: 585, y: 560 },
  Redis: { x: 830, y: 555 },
};

export function buildGraph(): { nodes: GraphNode[]; edges: GraphEdge[] } {
  const nodes: GraphNode[] = [];
  const edges: GraphEdge[] = [];
  const techSeen = new Set<string>();

  const addTech = (name: string, draft: boolean) => {
    if (techSeen.has(name)) return;
    techSeen.add(name);
    // fallback row for technologies added later without a tuned position
    const fallbackIndex = Object.keys(TECH_POS).indexOf(name);
    const pos =
      TECH_POS[name] ??
      { x: 120 + (nodes.length * 90) % 760, y: 590 + (fallbackIndex >= 0 ? 0 : 0) };
    nodes.push({ id: `t-${name}`, label: name, kind: "tech", draft, ...pos });
  };

  for (const cs of caseStudies) {
    const pos = PROJECT_POS[cs.id] ?? { x: 500, y: 285, label: cs.title };
    nodes.push({ id: cs.id, label: pos.label, kind: "project", x: pos.x, y: pos.y });
    for (const t of cs.tech) {
      addTech(t, false);
      edges.push({ from: cs.id, to: `t-${t}`, planned: false });
    }
  }

  // professional experience not already drawn as a case study
  // (crossRef means the work is represented by a case-study node above)
  for (const rec of experienceRecords) {
    if (rec.crossRef || rec.tech.length === 0) continue;
    const pos = PROJECT_POS[rec.id] ?? { x: 500, y: 285, label: rec.org.toUpperCase() };
    nodes.push({ id: rec.id, label: pos.label, kind: "project", x: pos.x, y: pos.y });
    for (const t of rec.tech) {
      addTech(t, false);
      edges.push({ from: rec.id, to: `t-${t}`, planned: false });
    }
  }

  for (const bp of benchProjects) {
    const pos = PROJECT_POS[bp.id] ?? { x: 500, y: 460, label: bp.title.toUpperCase() };
    nodes.push({
      id: bp.id,
      label: pos.label,
      kind: "project",
      x: pos.x,
      y: pos.y,
      draft: true,
    });
    for (const t of bp.plannedTech) {
      addTech(t, true);
      edges.push({ from: bp.id, to: `t-${t}`, planned: true });
    }
  }

  return { nodes, edges };
}
