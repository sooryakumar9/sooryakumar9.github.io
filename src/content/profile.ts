/**
 * Single source of truth for identity, links and contact.
 * All links verified against the résumé (2026-07). Phone number is never
 * rendered on the site — it lives only inside the downloadable résumé.
 */
export const profile = {
  name: "Soorya Kumar",
  role: "Full-stack software developer",
  location: "Bengaluru, India",
  coordinates: "12.97°N 77.59°E",
  thesis:
    "I build software across the whole stack — the interfaces people touch, and the systems, intelligence and infrastructure working underneath them.",
  education: {
    degree: "B.E. Computer Science & Engineering",
    school: "JSS Academy of Technical Education",
    place: "Bengaluru",
    period: "2022–2026",
  },
  email: "skkumarsoorya@gmail.com",
  github: "https://github.com/sooryakumar9",
  linkedin: "https://www.linkedin.com/in/soorya-84434b137/",
  leetcode: "https://leetcode.com/u/sooryakumar9/",
  resume: "/SooryaKumar-Resume.pdf",
  /** the operator statement — SHEET 01 */
  statement: [
    "I like knowing what happens after the click. How an interface talks to its API, how the data is shaped and stored, where a rule engine or a retrieval pipeline quietly earns its keep — I build products across all of those layers.",
    "The range shows in the work: a web control layer for a defence simulation lab, a document-intelligence pipeline, a post-quantum messaging experiment, two products on the bench. Different systems, same habit — understand it end to end, then build it properly.",
  ],
  marginNotes: [
    "I build things mostly to find out how they work.",
    "Somewhere between commits there is usually a V60 brewing.",
    "Bengaluru: good weather for long builds, better cafés for code reviews.",
  ],
  /** fundamentals — the substrate layer of the capability graph */
  fundamentals: [
    "Data Structures & Algorithms",
    "Operating Systems",
    "DBMS",
    "Computer Networks",
    "OOP",
  ],
  /** honest additional tooling — typeset index, never a logo wall */
  additionalTooling: [
    "Java",
    "C/C++",
    "SQL",
    "React.js",
    "Node.js",
    "Express.js",
    "Flask",
    "Streamlit",
    "MySQL",
    "MongoDB",
    "AWS",
    "GCP",
    "Git / GitHub",
    "Pandas",
    "NumPy",
    "Matplotlib",
  ],
  rev: "REV B · 2026-07",
} as const;
