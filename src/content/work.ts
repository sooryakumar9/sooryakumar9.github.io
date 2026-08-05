import type { Project } from "./types";

/**
 * The complete body of work. Every claim traces to something real and nothing
 * is invented. Links policy: `live` is only ever a real public URL, code that
 * cannot be published gets an honest `sourceNote` instead of a dead link.
 *
 * The Hive Doctor is a decision support engine built on explicit rules. It is
 * never described as machine learning or generative AI.
 */
export const projects: Project[] = [
  {
    slug: "hils-automation",
    title: "Automation of the HILS Framework",
    short: "HILS Automation",
    blurb: "A web control layer that drives a hardware in the loop simulation lab",
    category: "systems",
    status: "shipped",
    signature: "hils",
    period: "September to October 2025",
    org: "Aeronautical Development Establishment · DRDO",
    role: "SDE Intern",
    tech: ["Python", "RT-LAB", "MATLAB"],
    sourceNote: "Internal system at ADE, DRDO. Source is not public.",
    sections: [
      {
        heading: "The situation",
        body: "Hardware in the loop simulation at ADE ran on RT-LAB. Powerful software, operated entirely by hand. Every single test meant walking a model through load, build, execute, stop and reset, session after session, and the MATLAB scripts feeding it were managed the same way: carefully, manually, and slowly.",
      },
      {
        heading: "What I built",
        body: "One authenticated web surface that drives RT-LAB directly and manages the scripts that feed it. A Python web application sits between the operator and the simulation stack: it issues the full RT-LAB sequence, validates and stores MATLAB scripts before they ever reach a lab machine, and streams run state back to the browser while the simulation is running. A six step procedure became a click.",
      },
      {
        heading: "The interesting part",
        body: "None of the infrastructure could change. The lab ran Python 2.6.4 and MATLAB R2012B, and RT-LAB itself was untouchable. I could drive it, but not modify it. So the whole thing had to be built with none of the modern conveniences, against a fixed runtime, and be reliable enough that an engineer would trust it with a real test. Script validation became the safety gate: a bad script fails in the browser, not in the lab.",
      },
    ],
    constraints: [
      "Python 2.6.4, the lab's fixed runtime",
      "MATLAB R2012B compatibility for every managed script",
      "Legacy RT-LAB infrastructure that could be driven but never modified",
      "Secure authentication, password hashing and strict input validation",
      "Syntax validation as a gate, so a bad script never reaches a lab machine",
    ],
    outcome:
      "Roughly 70% of the manual effort disappeared. The sequence an engineer used to perform became a sequence the system performs.",
  },
  {
    slug: "resume-analyzer",
    title: "AI Résumé Analyzer & LinkedIn Job Scraper",
    short: "Résumé Analyzer",
    blurb: "A retrieval pipeline from one document to the roles it deserves",
    category: "applications",
    status: "shipped",
    signature: "rag",
    period: "2025 to 2026",
    tech: ["Python", "LangChain", "FAISS", "OpenAI API", "Selenium"],
    sections: [
      {
        heading: "The situation",
        body: "Finding a job is a retrieval problem that people solve by hand. You read your own résumé, guess which roles fit, then search listings one keyword at a time. Every step in that loop loses information, and the worst part is that keyword search doesn't know what your experience actually means.",
      },
      {
        heading: "What I built",
        body: "The pipeline treats the résumé as a query. It gets chunked, embedded and indexed in FAISS, right next to openings scraped from LinkedIn with Selenium. A LangChain pipeline runs GPT models over the retrieved context and returns three things: structured feedback on the document, the roles it genuinely suits, and openings ranked by meaning rather than string overlap.",
      },
      {
        heading: "The interesting part",
        body: "Analysis and discovery share one embedding space. That sounds like an implementation detail, but it's the whole point. It means that the feedback you get and the matches you get agree with each other, because they're both reasoning over the same representation of you. Keeping Selenium alive against dynamic, obfuscated markup was the other half of the work.",
      },
    ],
    constraints: [
      "Retrieval augmented generation, so output stays grounded in the candidate's own document",
      "One shared embedding space across analysis and discovery",
      "Selenium automation that survives dynamic and obfuscated markup",
    ],
    outcome:
      "One pipeline that reads a résumé, explains it back, and returns the openings it actually fits. The whole discovery loop, closed.",
  },
  {
    slug: "banking-face-recognition",
    title: "Banking Application with Face Recognition",
    short: "Banking Face Gate",
    blurb: "A full stack account where your face is the second key",
    category: "applications",
    status: "shipped",
    signature: "banking",
    period: "2024 to 2025",
    tech: ["MongoDB", "Express.js", "React.js", "Node.js"],
    sections: [
      {
        heading: "The situation",
        body: "A password is a single point of failure. If it leaks, the account is wide open, and banking is exactly the place where that's unacceptable. What's needed is a second factor that a thief cannot copy off a sticky note or lift out of a breach dump.",
      },
      {
        heading: "What I built",
        body: "A full stack MERN application with face recognition layered on top of the password. React on the front, Express and Node behind secure REST APIs, MongoDB holding accounts and transactions. The face gate sits in front of login and in front of every transfer, with session handling carried consistently across the whole flow.",
      },
      {
        heading: "The interesting part",
        body: "Putting the second factor in front of transactions, not just login, is what makes it mean something. A session that's already authenticated still has to prove who's holding it before money moves.",
      },
    ],
    constraints: [
      "Face recognition as a second factor layered on top of the password",
      "Secure REST APIs and session handling across login and transactions",
      "Core banking workflows for accounts and transfers backed by MongoDB",
    ],
    outcome:
      "A working banking app where a stolen password is not enough. The face gate stands between an imposter and the money.",
  },
  {
    slug: "q-secure-chat",
    title: "Q-Secure Chat",
    blurb: "Messaging built for an adversary that does not exist yet",
    category: "systems",
    status: "shipped",
    signature: "qsecure",
    period: "2023 to 2024",
    tech: ["Python", "JavaScript", "Flask"],
    sections: [
      {
        heading: "The situation",
        body: "Most encrypted traffic rests on RSA. It's safe against every computer that exists and breakable by a sufficiently large quantum one. That gap has a name: harvest now, decrypt later. It makes every message intercepted today a bet on when that machine arrives.",
      },
      {
        heading: "What I built",
        body: "A working messenger, a Python service with a browser client, where keys are established with quantum resistant methods instead of RSA, so recorded traffic stays noise even to a future quantum adversary. I deliberately kept the classical path in as a control group, so you can see side by side exactly what an interceptor gets on each kind of channel.",
      },
      {
        heading: "The interesting part",
        body: "Threat models usually have no time dimension. This one does: capture today against compute tomorrow. Building both channels next to each other turns that from an argument into something you can just look at.",
      },
    ],
    constraints: [
      "Quantum resistant key exchange dropped in where the RSA handshake used to live",
      "A threat model with a time dimension: capture today against compute tomorrow",
      "The full flow of keys, encryption and transport kept small enough to read and verify",
    ],
    outcome:
      "Proof that quantum safe communication is buildable now with ordinary tools, and a concrete look at exactly what breaks if you wait.",
  },
  {
    slug: "website-blocker",
    title: "Website Blocker",
    blurb: "A policy gate for examination halls",
    category: "systems",
    status: "shipped",
    signature: "blocker",
    period: "2022 to 2023",
    tech: ["Python", "Tkinter"],
    sections: [
      {
        heading: "The situation",
        body: "Exams that run on computers need machines that stop being the whole internet for three hours. Reliably, on schedule, and without someone babysitting every seat.",
      },
      {
        heading: "What I built",
        body: "A small Tkinter desktop utility that applies editable block lists in real time and arms itself around the exam window. Invigilators can change what's blocked without touching any code.",
      },
      {
        heading: "The interesting part",
        body: "This is the smallest thing here and I still like it. Enforcement had to be immediate, because a block that lags is not a block, and the scheduling had to fail safe around the exam window rather than fail open. Not everything needs a pipeline.",
      },
    ],
    constraints: [
      "Enforcement in real time, because a block that lags is not a block",
      "Scheduling that fails safe around the exam window",
      "Block lists that invigilators can edit without touching code",
    ],
    outcome:
      "A deliberately small tool that does one institutional job completely.",
  },
  {
    slug: "madhu-marga",
    title: "Madhu-Marga",
    blurb: "Smart beekeeping management, with decision support that shows its reasoning",
    category: "applications",
    status: "shipped",
    signature: "madhumarga",
    period: "February to June 2026",
    org: "MindMatrix",
    role: "Android Development Intern",
    tech: [
      "Kotlin",
      "Jetpack Compose",
      "Material 3",
      "MVVM",
      "Room",
      "SQLite",
      "Coroutines",
      "Flow",
    ],
    sourceNote: "Built at MindMatrix. Source is not public.",
    sections: [
      {
        heading: "The situation",
        body: "Traditional beekeeping runs on paper inspection records and judgement built from years of experience. Colony problems surface late, hive history stays thin, and bloom cycles go untracked. All the signal is there, it's just never in one place at one time.",
      },
      {
        heading: "What I built",
        body: "An Android app for the whole workflow: a hive registry, structured inspection logs, harvest tracking, a seasonal flora guide, smart alerts, and a dashboard that puts the state of an apiary on one screen. Kotlin with Jetpack Compose and Material 3, MVVM layering, Room and SQLite for offline first persistence, Coroutines and Flow for async state. Beekeepers work in fields, so it had to work without a network.",
      },
      {
        heading: "The interesting part",
        body: "The Hive Doctor. It's a decision support engine built on explicit rules, not a trained model. It evaluates structured observations and returns a colony health score, a risk classification, a diagnosis and recommended actions. That was a deliberate choice. When you're telling someone something might be wrong with their colony, being able to point at the exact rule that fired matters more than being clever.",
      },
    ],
    constraints: [
      "Offline first persistence with Room, because the work happens in fields",
      "Layered MVVM so the rule engine stays independent of the UI",
      "Decision support built on explicit, inspectable rules rather than a model",
    ],
    outcome:
      "Hive work that used to live on paper is now structured, searchable and able to raise a flag before a problem gets expensive.",
  },
  {
    slug: "zenpro",
    title: "ZenPro",
    blurb: "A personalized morning brief for everything that moved overnight",
    category: "progress",
    status: "building",
    signature: "zenpro",
    period: "2026, ongoing",
    tech: ["Next.js", "TypeScript", "Supabase", "PostgreSQL", "Redis"],
    live: "https://zenpro-news.vercel.app/",
    sections: [
      {
        heading: "The situation",
        body: "Staying current means twelve feeds every morning across technology, AI, markets, developer communities and job boards. Each one wants attention, none of them knows about the others, and none of them knows anything about you.",
      },
      {
        heading: "Where it's going",
        body: "One personalized daily environment. Aggregation pipelines pull the sources, embeddings and ranking decide what actually matters to you, and summarization compresses the result into a brief you can finish with your coffee.",
      },
    ],
    outcome:
      "First public build is live. The architecture is sketched end to end and the aggregation layer is what I'm building now.",
    progress: {
      exists: [
        "First public build, live on Vercel",
        "System concept and architecture, sketched from end to end",
      ],
      building: [
        "Content aggregation pipeline",
        "Dashboard built on Next.js and TypeScript",
      ],
      exploring: [
        "Semantic embeddings for relevance across sources",
        "Recommendation and ranking algorithms",
        "Summarization into a morning brief",
        "Caching and scheduled data processing",
      ],
      devLog: [
        {
          date: "May 2026",
          note: "Architecture sketched: sources, ingest, embed, rank, brief.",
        },
        {
          date: "June 2026",
          note: "Evaluating aggregation strategies for each source type.",
        },
        { date: "July 2026", note: "First public build deployed." },
      ],
    },
  },
  {
    slug: "diavo",
    title: "Diavo",
    blurb: "Software that sits between food data and the decision you're actually making",
    category: "progress",
    status: "building",
    signature: "diavo",
    period: "2026, ongoing",
    tech: [
      "Next.js 16",
      "React 19",
      "TypeScript",
      "Tailwind CSS v4",
      "Supabase",
      "PostgreSQL",
      "Drizzle ORM",
    ],
    live: "https://diavo.vercel.app",
    sections: [
      {
        heading: "The situation",
        body: "Nutrition information is abundant and unusable. Labels, databases and advice that never quite answer the question a person actually has in front of a meal.",
      },
      {
        heading: "Where it's going",
        body: "Precise underneath, human on the surface. A complete product rather than a calorie widget. Right now that means a searchable corpus of 870 dishes with a zero dependency fuzzy search, Supabase auth, and row level security scoped to each owner.",
      },
    ],
    outcome:
      "Live on Vercel with auth and food search working. Personalized tracking and the nutrition views are next.",
    progress: {
      exists: [
        "Live build on Vercel",
        "Email and password authentication on Supabase",
        "A searchable corpus of 870 dishes with a zero dependency fuzzy search",
        "Row level security scoped to each owner",
      ],
      building: [
        "Personalized dietary tracking",
        "Food detail and nutrition views on Drizzle and Postgres",
      ],
      exploring: [
        "How nutrition data should be structured for the questions people really ask",
        "Photo verification for dishes from open image sources",
      ],
      devLog: [
        {
          date: "June 2026",
          note: "Problem space mapped and product direction settled.",
        },
        {
          date: "July 2026",
          note: "First build live on Vercel with auth and food search.",
        },
      ],
    },
  },
];

/** Home carousel: the shipped case studies, strongest first. */
export const featuredSlugs = [
  "hils-automation",
  "resume-analyzer",
  "banking-face-recognition",
  "q-secure-chat",
  "website-blocker",
] as const;

/** Home "On the Bench" strip. */
export const benchSlugs = ["zenpro", "diavo"] as const;

export const categoryLabels: Record<string, string> = {
  all: "All",
  systems: "Systems & Security",
  applications: "Applications",
  progress: "In Progress",
};

/** The shortest correct name for a project, for tight spaces. */
export function projectLabel(slug: string): string {
  const p = getProject(slug);
  return p?.short ?? p?.title ?? slug;
}

export function getProject(slug: string): Project | undefined {
  return projects.find((p) => p.slug === slug);
}

export function projectsBySlugs(slugs: readonly string[]): Project[] {
  return slugs
    .map((s) => projects.find((p) => p.slug === s))
    .filter((p): p is Project => Boolean(p));
}
