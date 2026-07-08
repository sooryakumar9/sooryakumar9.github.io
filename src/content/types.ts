export interface CaseLink {
  label: string;
  href: string;
}

export interface CaseStudy {
  id: string;
  /** case file number rendered as CS-0N */
  index: number;
  title: string;
  subtitle: string;
  org?: string;
  role?: string;
  /** build period, from the résumé */
  period?: string;
  /** which living diagram this case renders */
  diagram: "hils" | "rag" | "channel" | "gate";
  /** the inverted (ink) chapter */
  inverted?: boolean;
  /** compact single-column presentation for small utilities */
  compact?: boolean;
  context: string;
  idea: string;
  system: string;
  engineering: string[];
  outcome: string;
  /** technologies actually used — feeds the capability graph */
  tech: string[];
  /** clickable actions — only real, project-specific URLs */
  links?: CaseLink[];
  /** non-clickable source status when code isn't public, e.g. internal systems */
  sourceNote?: string;
}

export interface DevLogEntry {
  date: string;
  note: string;
}

export type Deployment =
  | { status: "live"; href: string }
  | { status: "pending" };

export interface BenchProject {
  id: string;
  title: string;
  status: string;
  oneLiner: string;
  problem: string;
  vision: string;
  deployment: Deployment;
  /** three honest layers — rendered as inked / dashed / pencil strokes */
  exists: string[];
  building: string[];
  exploring: string[];
  /** planned stack — drawn with dashed edges in the graph */
  plannedTech: string[];
  devLog: DevLogEntry[];
  /** slots for future screenshots / demos / updates */
  media?: { kind: "image" | "video"; src: string; alt: string }[];
  links?: CaseLink[];
}

export interface ExperienceRecord {
  id: string;
  role: string;
  org: string;
  place?: string;
  period?: string;
  headline: string;
  /** terse mono capability lines — what this engagement proves */
  demonstrates: string[];
  /** short prose blocks keyed by marker label (kept scannable) */
  notes: { label: string; text: string }[];
  /** cross-reference to a full case study elsewhere in the document */
  crossRef?: { label: string; href: string };
  /** technologies used — feeds the capability graph (solid edges) */
  tech: string[];
}
