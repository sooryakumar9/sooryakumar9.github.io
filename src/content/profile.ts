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

/** Fundamentals, and the wider toolchain. A typeset index, never a logo wall. */
export const foundations = {
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
  notes: [
    "I build things mostly to find out how they work.",
    "Somewhere between commits there is usually a V60 brewing.",
    "Bengaluru keeps good weather for long builds and better cafés for code reviews.",
  ],
} as const;
