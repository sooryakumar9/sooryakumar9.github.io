import type { CaseStudy } from "./types";

/**
 * CASE FILES: completed work. Every claim traces to real work and nothing is
 * fabricated. Links policy: only real project specific URLs are clickable,
 * non public code gets an honest `sourceNote`, otherwise no action is shown.
 *
 * House style: no dash or hyphen characters in prose. Proper nouns such as
 * Q-Secure, Madhu-Marga and RT-LAB keep their real spelling.
 */
export const caseStudies: CaseStudy[] = [
  {
    id: "hils",
    index: 1,
    title: "Automation of the HILS Framework",
    subtitle: "A web based control layer for RT-LAB simulation workflows",
    org: "Aeronautical Development Establishment · DRDO",
    role: "SDE Intern",
    period: "September to October 2025",
    diagram: "hils",
    context:
      "Hardware in the loop simulation at ADE ran on RT-LAB. Powerful, but operated by hand: every test meant walking a model through load, build, execute, stop and reset, session after session.",
    idea:
      "One authenticated web surface that drives RT-LAB directly, manages the MATLAB scripts that feed it, and turns a six step procedure into a click.",
    system:
      "A Python web application sits between the operator and the simulation stack. It issues the full RT-LAB sequence, validates and manages MATLAB scripts before they reach the lab machines, and streams run state back to the browser in real time.",
    engineering: [
      "Python 2.6.4, the fixed runtime of the lab, with none of the modern conveniences",
      "MATLAB R2012B compatibility for every managed script",
      "Legacy RT-LAB infrastructure that could not be modified, only driven",
      "Secure authentication, password hashing and strict input validation",
      "Syntax validation as a gate, so a bad script fails in the browser and never in the lab",
    ],
    outcome:
      "Roughly 70 percent of manual effort removed. The sequence an engineer used to perform became a sequence the system performs.",
    tech: ["Python", "RT-LAB", "MATLAB"],
    sourceNote: "SOURCE: INTERNAL SYSTEM · ADE, DRDO",
  },
  {
    id: "rag",
    index: 2,
    title: "AI Resume Analyzer and LinkedIn Job Scraper",
    subtitle: "A retrieval pipeline from one document to the roles it deserves",
    period: "2025 to 2026",
    diagram: "rag",
    context:
      "Job discovery is a manual retrieval problem: read your own resume honestly, guess which roles fit, then search listings one keyword at a time. Every step loses information.",
    idea:
      "Treat the resume as a query. Embed it, reason over it, and let semantic search connect real experience to live openings instead of leaving it to keyword luck.",
    system:
      "The resume is chunked, embedded and indexed in FAISS beside openings scraped from LinkedIn with Selenium. A LangChain pipeline runs GPT models over the retrieved context and produces structured feedback, suitable roles, and openings ranked by meaning rather than string overlap.",
    engineering: [
      "Retrieval augmented generation, with output grounded in the candidate's own document",
      "One embedding space shared by analysis and discovery, so feedback and matches agree with each other",
      "Selenium automation that survives dynamic and obfuscated markup",
    ],
    outcome:
      "One pipeline that reads a resume, explains it back, and returns the openings it actually fits. The whole job discovery loop, closed.",
    tech: ["Python", "LangChain", "FAISS", "OpenAI API", "Selenium"],
  },
  {
    id: "qsecure",
    index: 3,
    title: "Q-Secure Chat",
    subtitle: "Messaging built for an adversary that does not exist yet",
    period: "2023 to 2024",
    diagram: "channel",
    inverted: true,
    context:
      "Most encrypted traffic rests on RSA. Safe against every computer that exists, breakable by a sufficiently large quantum one. Harvest now and decrypt later makes every message intercepted today a bet on that machine arriving.",
    idea:
      "Build a working messenger on quantum resistant key exchange, and show side by side what an interceptor sees on each kind of channel.",
    system:
      "A Python messaging service with a browser client. Keys are established with quantum resistant methods instead of RSA, so recorded traffic stays noise even to a future quantum adversary. The classical path is kept in deliberately, as the control group.",
    engineering: [
      "Quantum resistant key exchange dropped in where the RSA handshake used to live",
      "A threat model with a time dimension: capture today against compute tomorrow",
      "The full flow of keys, encryption and transport, small enough to read and verify",
    ],
    outcome:
      "Proof that quantum safe communication is buildable now with ordinary tools, and a concrete look at exactly what breaks if you wait.",
    tech: ["Python", "JavaScript", "Flask"],
  },
  {
    id: "blocker",
    index: 4,
    title: "Website Blocker",
    subtitle: "A policy gate for examination halls",
    period: "2022 to 2023",
    diagram: "gate",
    compact: true,
    context:
      "Exams that run on computers need machines that stop being the whole internet for three hours. Reliably, on schedule, and without someone babysitting every seat.",
    idea:
      "A small desktop utility that enforces editable block lists in real time and arms itself around the exam window.",
    system:
      "A Tkinter application applies customizable block lists in real time, with scheduled windows built around the timetable.",
    engineering: [
      "Enforcement in real time, because a block that lags is not a block",
      "Scheduling that fails safe around the exam window",
      "Block lists that invigilators can edit without touching code",
    ],
    outcome:
      "A deliberately small tool that does one institutional job completely. Not everything needs a pipeline.",
    tech: ["Python", "Tkinter"],
  },
  {
    id: "banking",
    index: 5,
    title: "Banking Application with Face Recognition",
    subtitle: "A full stack account where your face is the second key",
    period: "2024 to 2025",
    diagram: "banking",
    context:
      "A password is a single point of failure. If it leaks, the account is wide open. Banking needs a second factor that a thief cannot simply copy from a note or a breach.",
    idea:
      "Put face recognition on top of the password, so both the login and every transaction ask for something the account holder is, not only something they know.",
    system:
      "A full stack MERN application. React on the front, Express and Node behind secure REST APIs, and MongoDB holding accounts and transactions. Face recognition sits in front of login and transfers as an additional authentication factor, with session handling carried across the whole flow.",
    engineering: [
      "Face recognition as a second factor layered on top of the password",
      "Secure REST APIs and session handling across login and transactions",
      "Core banking workflows for accounts and transfers backed by MongoDB",
    ],
    outcome:
      "A working banking app where a stolen password is not enough. The face gate stands between an imposter and the money.",
    tech: ["MongoDB", "Express.js", "React.js", "Node.js"],
  },
];
