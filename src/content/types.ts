/** Canvas program that renders a project's signature visual. */
export type SignatureVariant =
  | "hero"
  | "hils"
  | "rag"
  | "qsecure"
  | "blocker"
  | "banking"
  | "madhumarga"
  | "zenpro"
  | "diavo";

/** Buckets on /work. Deliberately non overlapping so the chip counts add up. */
export type Category = "systems" | "applications" | "progress";

export type Status = "shipped" | "building";

/**
 * One entry in the body of work. Everything on the site that can be opened as
 * a case study uses this shape, whether it came out of an internship, a course
 * or a weekend.
 */
export type Project = {
  slug: string;
  title: string;
  /** one line, sentence case, no trailing period */
  blurb: string;
  category: Category;
  status: Status;
  signature: SignatureVariant;
  period: string;
  /** shown only when the work was done for someone */
  org?: string;
  role?: string;
  tech: readonly string[];
  /** a real, public URL or nothing at all; never a placeholder */
  live?: string;
  /** honest note when the code cannot be public */
  sourceNote?: string;
  /** case study body, in reading order */
  sections: readonly { heading: string; body: string }[];
  /** short bullets, the engineering constraints that shaped it */
  constraints?: readonly string[];
  outcome: string;
  /** progress work only */
  progress?: {
    exists: readonly string[];
    building: readonly string[];
    exploring: readonly string[];
    devLog: readonly { date: string; note: string }[];
  };
};

export type ExperienceRecord = {
  id: string;
  role: string;
  org: string;
  place: string;
  period: string;
  headline: string;
  body: string;
  tech: readonly string[];
  /** slug of the project this engagement produced */
  projectSlug: string;
};

export type JourneyChapter = {
  index: string;
  title: string;
  body: string;
};
