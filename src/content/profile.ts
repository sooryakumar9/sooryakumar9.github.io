/**
 * Single source of truth for identity, links and contact.
 * All links verified against the resume. The phone number is never rendered
 * on the site; it lives only inside the downloadable resume PDF.
 *
 * House style: no dash or hyphen characters in prose. Proper nouns such as
 * Q-Secure, Madhu-Marga and RT-LAB keep their real spelling.
 */
export const profile = {
  name: "Soorya Kumar",
  role: "Full Stack Software Developer",
  location: "Bengaluru, India",
  coordinates: "12.97°N 77.59°E",
  thesis:
    "I build software across the full stack, from the interfaces people touch to the systems, intelligence and infrastructure working underneath them.",
  education: {
    degree: "B.E. Computer Science and Engineering",
    school: "JSS Academy of Technical Education",
    place: "Bengaluru",
    period: "October 2022 to June 2026",
    cgpa: "8.69",
  },
  email: "skkumarsoorya@gmail.com",
  github: "https://github.com/sooryakumar9",
  linkedin: "https://www.linkedin.com/in/soorya-84434b137/",
  leetcode: "https://leetcode.com/u/sooryakumar9/",
  resume: "/SooryaKumar-Resume.pdf",
  /** the operator statement, SHEET 01 */
  statement: [
    "I like knowing what happens after the click. How an interface talks to its API, how the data is shaped and stored, and where a rule engine or a retrieval pipeline quietly earns its keep. I build products across all of those layers.",
    "The range shows in the work. A web control layer for a defence simulation lab. A document intelligence pipeline. A full stack banking app where a face is the second key. Two products on the bench. Different systems, one habit: understand the whole thing, then build it properly.",
  ],
  marginNotes: [
    "I build things mostly to find out how they work.",
    "Somewhere between commits there is usually a V60 brewing.",
    "Bengaluru keeps good weather for long builds and better cafés for code reviews.",
  ],
  /** fundamentals, the substrate layer of the capability graph */
  fundamentals: [
    "Data Structures and Algorithms",
    "Operating Systems",
    "DBMS",
    "Computer Networks",
    "OOP",
  ],
  /** honest additional tooling, a typeset index and never a logo wall */
  additionalTooling: [
    "Java",
    "C/C++",
    "SQL",
    "Go",
    "MySQL",
    "Prompt Engineering",
    "Android Studio",
    "Linux",
    "Postman",
    "Git / GitHub",
  ],
  rev: "REV D · JULY 2026",
} as const;
