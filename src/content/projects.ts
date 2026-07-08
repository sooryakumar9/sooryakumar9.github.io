import type { CaseStudy } from "./types";

/**
 * CASE FILES — completed work. Every claim traces to real work; nothing is
 * fabricated. Links policy: only real project-specific URLs are clickable;
 * non-public code gets an honest `sourceNote`; otherwise no action is shown.
 */
export const caseStudies: CaseStudy[] = [
  {
    id: "hils",
    index: 1,
    title: "Automation of the HILS Framework",
    subtitle: "A web-based control layer for RT-LAB simulation workflows",
    org: "Aeronautical Development Establishment · DRDO",
    role: "SDE Intern",
    period: "Sept–Oct 2025",
    diagram: "hils",
    context:
      "Hardware-in-the-loop simulation at ADE ran on RT-LAB — powerful, but operated by hand: every test meant walking a model through load, build, execute, stop and reset, session after session.",
    idea:
      "One authenticated web surface that drives RT-LAB directly, manages the MATLAB scripts that feed it, and turns a six-step procedure into a click.",
    system:
      "A Python web application sits between the operator and the simulation stack: it issues the full RT-LAB sequence, validates and manages MATLAB scripts before they reach the lab machines, and streams run state back to the browser for real-time testing.",
    engineering: [
      "Python 2.6.4 — the lab's fixed runtime; no modern stdlib conveniences",
      "MATLAB R2012B compatibility for every managed script",
      "Legacy RT-LAB infrastructure that could not be modified, only driven",
      "Secure authentication, password hashing, strict input validation",
      "Syntax validation as a gate — a bad script fails in the browser, not in the lab",
    ],
    outcome:
      "Roughly 70% of manual effort removed. The sequence an engineer used to perform became a sequence the system performs.",
    tech: ["Python", "RT-LAB", "MATLAB"],
    sourceNote: "SOURCE — INTERNAL SYSTEM · ADE·DRDO",
  },
  {
    id: "rag",
    index: 2,
    title: "AI Resume Analyzer & LinkedIn Job Scraper",
    subtitle: "A retrieval pipeline from one document to the roles it deserves",
    period: "2025–2026",
    diagram: "rag",
    context:
      "Job discovery is a manual retrieval problem: read your own resume honestly, guess which roles fit, then search listings one keyword at a time. Every step is lossy.",
    idea:
      "Treat the resume as a query. Embed it, reason over it, and let semantic search — not keyword luck — connect real experience to live openings.",
    system:
      "The resume is chunked, embedded and indexed in FAISS beside openings scraped from LinkedIn with Selenium. A LangChain pipeline runs GPT models over the retrieved context — structured feedback, suitable roles, and openings ranked by meaning rather than string overlap.",
    engineering: [
      "Retrieval-augmented generation — output grounded in the candidate's own document",
      "One embedding space shared by analysis and discovery, so feedback and matches agree",
      "Selenium automation that survives LinkedIn's dynamic, obfuscated markup",
    ],
    outcome:
      "One pipeline that reads a resume, explains it back, and returns the openings it actually fits — the job-discovery loop, closed.",
    tech: ["Python", "LangChain", "FAISS", "OpenAI API", "Selenium"],
  },
  {
    id: "qsecure",
    index: 3,
    title: "Q-Secure Chat",
    subtitle: "Messaging built for an adversary that doesn't exist yet",
    period: "2023–2024",
    diagram: "channel",
    inverted: true,
    context:
      "Most encrypted traffic rests on RSA — safe against every computer that exists, breakable by a sufficiently large quantum one. 'Harvest now, decrypt later' makes today's intercepts a bet on that machine arriving.",
    idea:
      "Build a working messenger on quantum-resistant key exchange — and show, side by side, what an interceptor sees on each kind of channel.",
    system:
      "A Python messaging service with a browser client. Keys are established with post-quantum methods instead of RSA, so recorded traffic stays noise even to a future quantum adversary. The classical path is kept in deliberately — as the control group.",
    engineering: [
      "Post-quantum key exchange as a drop-in replacement for the RSA handshake",
      "A threat model with a time dimension: today's capture vs tomorrow's compute",
      "The full flow — keys, encryption, transport — small enough to read and verify",
    ],
    outcome:
      "Proof that quantum-safe communication is buildable now with ordinary tools — and a concrete look at exactly what breaks if you wait.",
    tech: ["Python", "JavaScript", "HTML/CSS"],
  },
  {
    id: "blocker",
    index: 4,
    title: "Website Blocker",
    subtitle: "A policy gate for examination halls",
    period: "2022–2023",
    diagram: "gate",
    compact: true,
    context:
      "Computer-based exams need machines that stop being the whole internet for three hours — reliably, on schedule, without per-machine babysitting.",
    idea:
      "A small desktop utility that enforces editable block lists in real time, arming and disarming itself around the exam window.",
    system:
      "A Tkinter application applies customizable block lists in real time, with scheduled windows around the timetable.",
    engineering: [
      "Real-time enforcement — a block that lags is not a block",
      "Scheduling that fails safe around the exam window",
      "Block lists editable by invigilators, not just by whoever wrote the code",
    ],
    outcome:
      "A deliberately small tool that does one institutional job completely. Not everything needs a pipeline.",
    tech: ["Python", "Tkinter"],
  },
];
