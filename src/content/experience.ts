import type { ExperienceRecord } from "./types";

/** Professional engagements. Each one cross references the work it produced. */
export const experience: ExperienceRecord[] = [
  {
    id: "drdo",
    role: "SDE Intern",
    org: "Aeronautical Development Establishment · DRDO",
    place: "Bengaluru",
    period: "September to October 2025",
    headline:
      "Built the web control layer that automated a hardware in the loop simulation lab.",
    body: "A Python web application driving the full RT-LAB sequence of load, build, execute, stop and reset, with MATLAB script management, secure authentication, uploads and syntax validation on top. The lab ran Python 2.6.4 and MATLAB R2012B and none of it could change, so the work was as much about respecting fixed infrastructure as it was about the automation. Manual effort fell by roughly 70%.",
    tech: ["Python", "RT-LAB", "MATLAB"],
    projectSlug: "hils-automation",
  },
  {
    id: "mindmatrix",
    role: "Android Development Intern",
    org: "MindMatrix",
    place: "Bengaluru",
    period: "February to June 2026",
    headline:
      "Shipped Madhu-Marga, a smart beekeeping app that digitizes hive work and structures decision support.",
    body: "The whole workflow in one Android app: hive registry, structured inspection logs, harvest tracking, a seasonal flora guide, smart alerts and a dashboard. Kotlin with Jetpack Compose and Material 3, MVVM layering, Room and SQLite for offline first persistence. The Hive Doctor sits on top of it, a decision support engine built on explicit rules that scores colony health, classifies risk and recommends actions, so every conclusion can be traced back to the rule that produced it.",
    tech: ["Kotlin", "Jetpack Compose", "Material 3", "MVVM", "Room"],
    projectSlug: "madhu-marga",
  },
];
