import type { ExperienceRecord } from "./types";

/**
 * FIELD RECORDS — professional engagements. Terse by design: the DRDO record
 * cross-references its full case study; Madhu-Marga carries its own compact
 * record because no separate case study exists. All facts user-verified;
 * the Hive Doctor is a rule-based decision-support engine — never describe
 * it as ML or generative AI.
 */
export const experienceRecords: ExperienceRecord[] = [
  {
    id: "drdo",
    role: "SDE Intern",
    org: "Aeronautical Development Establishment · DRDO",
    place: "Bengaluru",
    period: "Sept–Oct 2025",
    headline:
      "Built the web control layer that automated a hardware-in-the-loop simulation lab.",
    demonstrates: [
      "full-stack web development",
      "backend + system integration",
      "legacy infrastructure constraints",
      "secure auth · validation",
    ],
    notes: [
      {
        label: "WORK",
        text: "Python web application driving RT-LAB simulation workflows — load, build, execute, stop, reset — with MATLAB script management, secure authentication, uploads and syntax validation. Manual effort down ~70%.",
      },
    ],
    crossRef: { label: "FULL SCHEMATIC → CS-01", href: "#case-hils" },
    tech: ["Python", "RT-LAB", "MATLAB"],
  },
  {
    id: "mindmatrix",
    role: "Android Development Intern",
    org: "MindMatrix",
    headline:
      "Built Madhu-Marga — a smart beekeeping management app that digitizes hive workflows and structures decision support.",
    demonstrates: [
      "product engineering",
      "modern UI — Jetpack Compose · Material 3",
      "layered architecture — MVVM",
      "offline-first persistence — Room",
      "rule-based decision support",
    ],
    notes: [
      {
        label: "PROBLEM",
        text: "Traditional beekeeping runs on paper inspection records and experience-based judgement — colony problems surface late, hive history is thin, and bloom cycles go untracked.",
      },
      {
        label: "PRODUCT",
        text: "An Android app for the whole workflow: hive registry, structured inspection logs, harvest tracking, a seasonal flora guide, smart alerts and a dashboard that puts apiary state on one screen.",
      },
      {
        label: "INTELLIGENCE",
        text: "The Hive Doctor — a rule-based decision-support engine, not a trained model — evaluates structured observations and returns a colony health score, risk classification, diagnosis and recommended actions.",
      },
      {
        label: "ENGINEERING",
        text: "Kotlin with Jetpack Compose and Material 3, MVVM layering, Room/SQLite for offline-first local persistence, Coroutines and Flow for async state.",
      },
    ],
    tech: ["Kotlin", "Jetpack Compose", "Room"],
  },
];
