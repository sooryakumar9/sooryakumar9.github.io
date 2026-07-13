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
  hils: { x: 210, y: 150, label: "HILS AUTOMATION" },
  rag: { x: 500, y: 120, label: "RESUME ANALYZER" },
  qsecure: { x: 800, y: 150, label: "Q-SECURE CHAT" },
  mindmatrix: { x: 205, y: 300, label: "MADHU-MARGA" },
  blocker: { x: 210, y: 450, label: "WEBSITE BLOCKER" },
  banking: { x: 210, y: 610, label: "BANKING APP" },
  diavo: { x: 480, y: 470, label: "DIAVO" },
  zenpro: { x: 760, y: 430, label: "ZENPRO" },
};

const TECH_POS: Record<string, { x: number; y: number }> = {
  // HILS and RAG cluster, top
  Python: { x: 405, y: 300 },
  "RT-LAB": { x: 95, y: 70 },
  MATLAB: { x: 70, y: 225 },
  LangChain: { x: 360, y: 50 },
  FAISS: { x: 565, y: 240 },
  "OpenAI API": { x: 645, y: 50 },
  Selenium: { x: 495, y: 220 },
  // Q-Secure cluster, top right
  JavaScript: { x: 905, y: 70 },
  Flask: { x: 915, y: 240 },
  // Madhu-Marga cluster, left
  Kotlin: { x: 60, y: 305 },
  "Jetpack Compose": { x: 90, y: 385 },
  Room: { x: 330, y: 375 },
  // Website Blocker
  Tkinter: { x: 90, y: 480 },
  // Banking, bottom left
  MongoDB: { x: 55, y: 560 },
  "Express.js": { x: 70, y: 665 },
  "Node.js": { x: 380, y: 560 },
  "React.js": { x: 375, y: 675 },
  // ZenPro and Diavo shared cluster, bottom right
  "Next.js": { x: 910, y: 350 },
  TypeScript: { x: 935, y: 480 },
  Supabase: { x: 720, y: 615 },
  PostgreSQL: { x: 560, y: 655 },
  Redis: { x: 880, y: 590 },
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
