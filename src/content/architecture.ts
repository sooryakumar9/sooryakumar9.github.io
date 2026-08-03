import type { Architecture } from "./types";

/**
 * System diagrams, one per case study.
 *
 * Every node and every step here restates something the case study prose in
 * `work.ts` already says. Nothing is invented to make a diagram look fuller,
 * and where a stage is designed but not yet built it is marked `planned` —
 * drawing ZenPro's ranking stage the same as its shipped dashboard would be
 * claiming something untrue.
 */
export const architectures: Record<string, Architecture> = {
  "hils-automation": {
    cols: 4,
    rows: 2,
    nodes: [
      { id: "browser", label: "Browser", col: 0, row: 0 },
      { id: "auth", label: "Auth", col: 1, row: 0 },
      { id: "app", label: "Python web app", col: 2, row: 0 },
      { id: "gate", label: "Syntax gate", col: 2, row: 1 },
      { id: "rtlab", label: "RT-LAB", col: 3, row: 0 },
    ],
    edges: [
      { from: "browser", to: "auth" },
      { from: "auth", to: "app" },
      { from: "app", to: "gate" },
      { from: "app", to: "rtlab" },
      { from: "rtlab", to: "browser", back: true },
    ],
    steps: [
      {
        title: "The operator opens one authenticated surface",
        body: "Everything the lab used to do by hand happens behind a single web login, with password hashing and strict input validation.",
        nodes: ["browser", "auth"],
      },
      {
        title: "Scripts are validated before they travel",
        body: "MATLAB scripts are checked for syntax on the way in, so a bad script fails in the browser and never reaches a lab machine.",
        nodes: ["app", "gate"],
      },
      {
        title: "The web app issues the full RT-LAB sequence",
        body: "Load, build, execute, stop and reset. The five step procedure an engineer used to walk through becomes one request.",
        nodes: ["app", "rtlab"],
      },
      {
        title: "The lab stack is driven, never modified",
        body: "RT-LAB, Python 2.6.4 and MATLAB R2012B were all fixed. The application had to work with them exactly as they were.",
        nodes: ["rtlab"],
      },
      {
        title: "Run state streams back live",
        body: "The browser watches the simulation as it happens rather than waiting for it to finish.",
        nodes: ["rtlab", "browser"],
      },
    ],
  },

  "resume-analyzer": {
    cols: 4,
    rows: 2,
    nodes: [
      { id: "resume", label: "Résumé", col: 0, row: 0 },
      { id: "embed", label: "Chunk + embed", col: 1, row: 0 },
      { id: "faiss", label: "FAISS index", col: 2, row: 0 },
      { id: "scrape", label: "Selenium scrape", col: 1, row: 1 },
      { id: "llm", label: "LangChain + GPT", col: 3, row: 0 },
    ],
    edges: [
      { from: "resume", to: "embed" },
      { from: "embed", to: "faiss" },
      { from: "scrape", to: "faiss" },
      { from: "faiss", to: "llm" },
    ],
    steps: [
      {
        title: "The résumé becomes the query",
        body: "Rather than guessing keywords, the document itself is chunked and embedded and used to search.",
        nodes: ["resume", "embed"],
      },
      {
        title: "Openings are scraped from LinkedIn",
        body: "Selenium automation that survives dynamic and obfuscated markup collects live postings.",
        nodes: ["scrape"],
      },
      {
        title: "Both live in one embedding space",
        body: "Résumé chunks and job postings are indexed together in FAISS, so feedback and matches reason over the same representation and agree with each other.",
        nodes: ["faiss", "embed", "scrape"],
      },
      {
        title: "Retrieval grounds the model",
        body: "A LangChain pipeline runs GPT over the retrieved context, so the output is anchored in the candidate's own document rather than invented.",
        nodes: ["faiss", "llm"],
      },
      {
        title: "Structured feedback and ranked roles come back",
        body: "Openings are ordered by meaning rather than string overlap, alongside an explanation of the résumé itself.",
        nodes: ["llm"],
      },
    ],
  },

  "banking-face-recognition": {
    cols: 4,
    rows: 2,
    nodes: [
      { id: "react", label: "React client", col: 0, row: 0 },
      { id: "api", label: "Express REST", col: 1, row: 0 },
      { id: "face", label: "Face factor", col: 2, row: 1 },
      { id: "session", label: "Session", col: 2, row: 0 },
      { id: "mongo", label: "MongoDB", col: 3, row: 0 },
    ],
    edges: [
      { from: "react", to: "api" },
      { from: "api", to: "session" },
      { from: "api", to: "face" },
      { from: "session", to: "mongo" },
    ],
    steps: [
      {
        title: "A password gets you to the door, not through it",
        body: "The React client authenticates against secure REST APIs, but the password on its own is never sufficient.",
        nodes: ["react", "api"],
      },
      {
        title: "The face is the second factor",
        body: "Face recognition sits in front of login and in front of every transfer, so an attacker needs something the account holder is, not only something they know.",
        nodes: ["face", "api"],
      },
      {
        title: "The gate applies to transactions too",
        body: "Putting the check on transfers rather than only on login means an already-authenticated session still has to prove who is holding it before money moves.",
        nodes: ["face", "session"],
      },
      {
        title: "Accounts and transactions persist",
        body: "MongoDB holds the core banking workflows behind the session layer.",
        nodes: ["session", "mongo"],
      },
    ],
  },

  "q-secure-chat": {
    cols: 4,
    rows: 2,
    nodes: [
      { id: "client", label: "Browser client", col: 0, row: 0 },
      { id: "pq", label: "PQ key exchange", col: 1, row: 0 },
      { id: "rsa", label: "RSA control path", col: 1, row: 1 },
      { id: "wire", label: "Encrypted transport", col: 2, row: 0 },
      { id: "server", label: "Flask service", col: 3, row: 0 },
    ],
    edges: [
      { from: "client", to: "pq" },
      { from: "client", to: "rsa" },
      { from: "pq", to: "wire" },
      { from: "rsa", to: "wire" },
      { from: "wire", to: "server" },
    ],
    steps: [
      {
        title: "Quantum resistant key exchange replaces the RSA handshake",
        body: "The same place in the flow, a different primitive, so recorded traffic stays noise even to a future quantum adversary.",
        nodes: ["client", "pq"],
      },
      {
        title: "The classical path is kept as a control",
        body: "The RSA channel stays in deliberately, so you can see side by side exactly what an interceptor gets on each kind of channel.",
        nodes: ["rsa"],
      },
      {
        title: "The threat model has a time dimension",
        body: "Harvest now, decrypt later: traffic captured today is a bet on when a sufficiently large quantum computer arrives.",
        nodes: ["wire"],
      },
      {
        title: "Small enough to read and verify",
        body: "Keys, encryption and transport all sit in one Python service with a browser client.",
        nodes: ["server", "wire"],
      },
    ],
  },

  "website-blocker": {
    cols: 3,
    rows: 2,
    nodes: [
      { id: "list", label: "Block list", col: 0, row: 0 },
      { id: "clock", label: "Exam window", col: 0, row: 1 },
      { id: "app", label: "Tkinter app", col: 1, row: 0 },
      { id: "machine", label: "Exam machine", col: 2, row: 0 },
    ],
    edges: [
      { from: "list", to: "app" },
      { from: "clock", to: "app" },
      { from: "app", to: "machine" },
    ],
    steps: [
      {
        title: "Invigilators edit the list, not the code",
        body: "Block lists are customisable by the people running the exam.",
        nodes: ["list", "app"],
      },
      {
        title: "The gate arms on the timetable",
        body: "Scheduled windows are built around the exam and fail safe rather than fail open.",
        nodes: ["clock", "app"],
      },
      {
        title: "Enforcement is immediate",
        body: "Rules apply in real time, because a block that lags is not a block.",
        nodes: ["app", "machine"],
      },
    ],
  },

  "madhu-marga": {
    cols: 4,
    rows: 2,
    nodes: [
      { id: "ui", label: "Jetpack Compose", col: 0, row: 0 },
      { id: "vm", label: "ViewModel", col: 1, row: 0 },
      { id: "room", label: "Room + SQLite", col: 2, row: 0 },
      { id: "rules", label: "Hive Doctor rules", col: 2, row: 1 },
      { id: "out", label: "Score + diagnosis", col: 3, row: 1 },
    ],
    edges: [
      { from: "ui", to: "vm" },
      { from: "vm", to: "room" },
      { from: "room", to: "rules" },
      { from: "rules", to: "out" },
      { from: "out", to: "ui", back: true },
    ],
    steps: [
      {
        title: "Compose and Material 3 on an MVVM spine",
        body: "Hive registry, inspection logs, harvest tracking and a seasonal flora guide, all on layered MVVM.",
        nodes: ["ui", "vm"],
      },
      {
        title: "Offline first, because the work happens in fields",
        body: "Room and SQLite hold everything locally, with Coroutines and Flow for async state.",
        nodes: ["vm", "room"],
      },
      {
        title: "The Hive Doctor is explicit rules, not a model",
        body: "It evaluates structured observations against inspectable rules rather than a trained model, which is what makes every conclusion traceable.",
        nodes: ["room", "rules"],
      },
      {
        title: "A score, a risk band, a diagnosis, an action",
        body: "The engine returns colony health, a risk classification and recommended actions, and you can point at the rule that produced each one.",
        nodes: ["rules", "out"],
      },
    ],
  },

  zenpro: {
    cols: 4,
    rows: 2,
    nodes: [
      { id: "sources", label: "Sources", col: 0, row: 0, status: "planned" },
      { id: "ingest", label: "Ingest", col: 1, row: 0, status: "planned" },
      { id: "dash", label: "Next.js dashboard", col: 1, row: 1, status: "planned" },
      { id: "rank", label: "Embed + rank", col: 2, row: 0, status: "planned" },
      { id: "brief", label: "Morning brief", col: 3, row: 0, status: "planned" },
    ],
    edges: [
      { from: "sources", to: "ingest" },
      { from: "ingest", to: "rank" },
      { from: "rank", to: "brief" },
      { from: "ingest", to: "dash" },
    ],
    steps: [
      {
        title: "Twelve feeds, none of which know about each other",
        body: "Technology, AI, markets, developer communities and job boards, each demanding attention separately.",
        nodes: ["sources"],
      },
      {
        title: "Aggregation pipelines pull the sources",
        body: "Currently being built, with a different strategy per source type.",
        nodes: ["ingest", "dash"],
      },
      {
        title: "Embeddings and ranking decide what matters",
        body: "Still an open question rather than a shipped stage: semantic relevance across sources, plus recommendation and ranking.",
        nodes: ["rank"],
      },
      {
        title: "Summarised into something you can finish with coffee",
        body: "The end state is one personalised brief. The first public build is live; this stage is not there yet.",
        nodes: ["brief"],
      },
    ],
  },

  diavo: {
    cols: 4,
    rows: 2,
    nodes: [
      { id: "app", label: "Next.js 16", col: 0, row: 0 },
      { id: "auth", label: "Supabase auth", col: 1, row: 0 },
      { id: "rls", label: "Row level security", col: 2, row: 0 },
      { id: "search", label: "Fuzzy search", col: 1, row: 1 },
      { id: "db", label: "Drizzle + Postgres", col: 3, row: 0, status: "planned" },
    ],
    edges: [
      { from: "app", to: "auth" },
      { from: "auth", to: "rls" },
      { from: "rls", to: "db" },
      { from: "app", to: "search" },
    ],
    steps: [
      {
        title: "React 19 and strict TypeScript on Next.js 16",
        body: "Live on Vercel, with Tailwind v4 and Motion on the surface.",
        nodes: ["app"],
      },
      {
        title: "Email and password auth on Supabase",
        body: "Shipped and working today.",
        nodes: ["auth"],
      },
      {
        title: "Row level security scoped to each owner",
        body: "Access is enforced in the database rather than in the application layer.",
        nodes: ["rls"],
      },
      {
        title: "870 dishes, searched with zero dependencies",
        body: "A static corpus with a fuzzy search written from scratch rather than pulled in.",
        nodes: ["search"],
      },
      {
        title: "Nutrition views on Drizzle and Postgres",
        body: "Being built now: food detail and personalised dietary tracking.",
        nodes: ["db"],
      },
    ],
  },
};
