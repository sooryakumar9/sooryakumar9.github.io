/**
 * Identity, links and contact. Every link is verified. The phone number is
 * never rendered on the site; it lives only in the downloadable resume.
 */
export const profile = {
  name: "Soorya Kumar",
  role: "Full Stack Software Developer",
  location: "Bengaluru, India",
  available: true,
  tagline:
    "I build software across the full stack, from the interfaces people touch to the systems, intelligence and infrastructure working underneath them.",
  email: "skkumarsoorya@gmail.com",
  github: "https://github.com/sooryakumar9",
  linkedin: "https://www.linkedin.com/in/soorya-84434b137/",
  leetcode: "https://leetcode.com/u/sooryakumar9/",
  resume: "/SooryaKumar-Resume.pdf",
  education: {
    degree: "B.E. Computer Science and Engineering",
    school: "JSS Academy of Technical Education",
    place: "Bengaluru",
    period: "October 2022 to June 2026",
    cgpa: "8.69",
  },
} as const;

/**
 * What the hero headline types through. The name leads, then the roles, and
 * every one of them is defensible from real work: DRDO for automation, the
 * retrieval pipeline for AI, MindMatrix for Android, ZenPro and Diavo for
 * product. Kept short because the headline never wraps.
 */
export const heroRoles = [
  "Soorya Kumar",
  "Full Stack Developer",
  "Systems & Automation",
  "AI & Retrieval",
  "Android Developer",
  "Product Builder",
] as const;

/** The belt under the hero. Short enough to read at speed. */
export const marqueeItems = [
  "Full Stack",
  "Systems Engineering",
  "AI & Retrieval",
  "Android",
  "Automation",
  "Security",
] as const;

/**
 * The intro, told five ways. Same person, different thing to lead with
 * depending on who is reading.
 */
export const audiences = [
  {
    id: "anyone",
    label: "For anyone",
    body: "I'm Soorya, a full stack developer in Bengaluru. I like knowing what happens after the click. How an interface talks to its API, how the data gets shaped and stored, and where a rule engine or a retrieval pipeline quietly earns its keep. So I build across all of those layers rather than picking one.",
  },
  {
    id: "recruiters",
    label: "Recruiters",
    body: "Computer Science graduate, CGPA 8.69, with two internships behind me. At DRDO I automated a hardware in the loop simulation lab and cut roughly 70% of the manual effort. At MindMatrix I shipped an Android product for beekeepers. I have two more products live right now, and I'm looking for a team to build with.",
  },
  {
    id: "engineers",
    label: "Engineers",
    body: "Python, TypeScript and Kotlin, mostly. I've driven RT-LAB from a Python 2.6.4 web app because that's what the lab ran, built a retrieval pipeline on LangChain and FAISS, put quantum resistant key exchange where an RSA handshake used to be, and shipped a Jetpack Compose app on MVVM with Room underneath. I care about the layer you don't see.",
  },
  {
    id: "founders",
    label: "Founders",
    body: "I can take something from a blank repo to a deployed product on my own. ZenPro and Diavo are both live and both mine end to end, from schema and auth through search, UI and deploy. If you need one person who can hold the whole system in their head and still ship, that's the part I'm good at.",
  },
] as const;

/**
 * What I can do on a team, the stack I do it with, and what I hold to.
 *
 * `capabilities` is what the site shows. Each one is a pattern that appears in
 * more than one thing I built, and each names the work it came from, because a
 * claim nobody can check is worth nothing on a portfolio. `evidence` holds the
 * slugs so the cards cannot drift from the case studies they point at.
 *
 * `fundamentals` stays for the résumé alone. Coursework is assumed by anyone
 * reading a portfolio, but it is still what a screener matches on.
 */
export const foundations = {
  capabilities: [
    {
      title: "AI and retrieval",
      body: "Systems that read unstructured text and return something a person can act on. Analysis and matching share one representation, so what a user is told and what they see agree.",
      evidence: ["resume-analyzer", "diavo"],
    },
    {
      title: "Security and authentication",
      body: "Designing against the attacker who does not exist yet. A second factor that gates the transfer rather than the login, and key exchange chosen for what breaks in ten years.",
      evidence: ["q-secure-chat", "banking-face-recognition"],
    },
    {
      title: "Workflow automation",
      body: "Turning a procedure a person performs into one a system performs. Validation moves to the front, so a bad script fails in a browser rather than on real hardware.",
      evidence: ["hils-automation"],
    },
    {
      title: "Engineering inside constraints",
      body: "Most systems cannot be rewritten. Driving a runtime that will not move, earning the operator's trust one run at a time, and leaving the thing more capable than it was.",
      evidence: ["hils-automation", "madhu-marga"],
    },
    {
      title: "Full stack ownership",
      body: "Taking a product from an empty repository to something deployed and in use. Schema, authentication, search, interface and release, held by one person who sees all of it.",
      evidence: ["zenpro", "diavo"],
    },
    {
      title: "Decisions you can audit",
      body: "When software tells someone something is wrong it should say which rule decided that. Explicit logic where a model would have been quicker to build and impossible to explain.",
      evidence: ["madhu-marga"],
    },
  ],
  fundamentals: [
    {
      title: "Data Structures & Algorithms",
      note: "The part that decides whether a thing scales or just works today.",
    },
    {
      title: "Operating Systems",
      note: "Processes, memory, scheduling. Why your program is slow for reasons that aren't your program.",
    },
    {
      title: "DBMS",
      note: "Schemas, indexes, transactions. Most product bugs are really data model bugs.",
    },
    {
      title: "Computer Networks",
      note: "What actually happens between the request and the response.",
    },
    {
      title: "Object Oriented Programming",
      note: "Drawing the boundaries so the code survives the second feature.",
    },
  ],
  toolchain: [
    "Java",
    "C/C++",
    "SQL",
    "Go",
    "MySQL",
    "Android Studio",
    "Linux",
    "Postman",
    "Git / GitHub",
  ],
  /** Positions, not aphorisms. Each one is a call I have actually had to make. */
  principles: [
    "I would rather ship something predictable than something clever. The clever version is only satisfying until someone else has to change it.",
    "Validation belongs at the boundary. The same mistake costs nothing in a browser and a day on a lab machine.",
    "If a system tells you something is wrong, it should be able to show you which rule decided that.",
  ],
} as const;
