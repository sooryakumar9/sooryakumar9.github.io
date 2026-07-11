import type { ExperienceRecord } from "./types";

/**
 * FIELD RECORDS: professional engagements. Terse by design. The DRDO record
 * cross references its full case study, and Madhu-Marga carries its own
 * compact record because no separate case study exists. All facts are
 * verified. The Hive Doctor is a decision support engine built on explicit
 * rules and must never be described as ML or generative AI.
 *
 * House style: no dash or hyphen characters in prose. Proper nouns such as
 * Q-Secure, Madhu-Marga and RT-LAB keep their real spelling.
 */
export const experienceRecords: ExperienceRecord[] = [
  {
    id: "drdo",
    role: "SDE Intern",
    org: "Aeronautical Development Establishment · DRDO",
    place: "Bengaluru",
    period: "September to October 2025",
    headline:
      "Built the web control layer that automated a hardware in the loop simulation lab.",
    demonstrates: [
      "full stack web development",
      "backend and system integration",
      "legacy infrastructure constraints",
      "secure authentication and validation",
    ],
    notes: [
      {
        label: "WORK",
        text: "A Python web application driving RT-LAB simulation workflows: load, build, execute, stop and reset, with MATLAB script management, secure authentication, uploads and syntax validation. Manual effort fell by roughly 70 percent.",
      },
    ],
    crossRef: { label: "FULL SCHEMATIC → CS·01", href: "#case-hils" },
    tech: ["Python", "RT-LAB", "MATLAB"],
  },
  {
    id: "mindmatrix",
    role: "Android Development Intern",
    org: "MindMatrix",
    headline:
      "Built Madhu-Marga, a smart beekeeping management app that digitizes hive work and structures decision support.",
    demonstrates: [
      "product engineering",
      "modern UI with Jetpack Compose and Material 3",
      "layered MVVM architecture",
      "offline first persistence with Room",
      "decision support built on explicit rules",
    ],
    notes: [
      {
        label: "PROBLEM",
        text: "Traditional beekeeping runs on paper inspection records and judgement built from experience. Colony problems surface late, hive history stays thin, and bloom cycles go untracked.",
      },
      {
        label: "PRODUCT",
        text: "An Android app for the whole workflow: a hive registry, structured inspection logs, harvest tracking, a seasonal flora guide, smart alerts and a dashboard that puts apiary state on one screen.",
      },
      {
        label: "INTELLIGENCE",
        text: "The Hive Doctor is a decision support engine built on explicit rules rather than a trained model. It evaluates structured observations and returns a colony health score, a risk classification, a diagnosis and recommended actions.",
      },
      {
        label: "ENGINEERING",
        text: "Kotlin with Jetpack Compose and Material 3, MVVM layering, Room and SQLite for offline first local persistence, and Coroutines with Flow for async state.",
      },
    ],
    tech: ["Kotlin", "Jetpack Compose", "Room"],
  },
];
