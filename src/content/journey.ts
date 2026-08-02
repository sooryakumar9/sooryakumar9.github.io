import type { JourneyChapter } from "./types";

/** The long form about page. First person, in order. */
export const journey: JourneyChapter[] = [
  {
    index: "01",
    title: "Starting in Bengaluru",
    body: "I grew up in a city that runs on software, which means the industry was never abstract to me — it was the thing everyone around me did. What got me in wasn't the industry though, it was a much smaller feeling: wanting to know how the thing on the screen actually worked. Not how to use it. How it worked. That question has basically been the whole plot ever since.",
  },
  {
    index: "02",
    title: "Fundamentals, and the first small tools",
    body: "I studied Computer Science at JSS Academy of Technical Education and spent a lot of it on the unglamorous parts: data structures, operating systems, databases, networks. The first thing I built that anyone else used was a website blocker for examination halls — a small Tkinter utility with editable block lists and a schedule. Tiny piece of software. But it had to work every single time, in a room full of people, or it was worthless. That taught me more about reliability than any lecture did.",
  },
  {
    index: "03",
    title: "Asking what breaks in ten years",
    body: "Then I got interested in a problem that hadn't happened yet. Most encrypted traffic rests on RSA, which is safe against every computer that currently exists and breakable by a sufficiently large quantum one — so anything intercepted today is a bet on when that machine shows up. I built Q-Secure Chat to see if quantum resistant messaging was actually buildable with ordinary tools, and kept the classical channel in alongside it as a control. It was the first time I designed against a threat model with a time dimension.",
  },
  {
    index: "04",
    title: "Constraints you cannot argue with",
    body: "At DRDO's Aeronautical Development Establishment I automated a hardware in the loop simulation lab. The lab ran Python 2.6.4 and MATLAB R2012B, and RT-LAB itself couldn't be modified — I could drive it, not change it. There is no version of that job where you get to pick a nicer stack. You work with what's there, you validate everything before it reaches a real machine, and you earn the operator's trust one run at a time. Manual effort dropped by roughly 70%. That internship changed how I think about engineering more than any project I chose myself.",
  },
  {
    index: "05",
    title: "Building for people who aren't engineers",
    body: "At MindMatrix I built Madhu-Marga, a beekeeping app, in Kotlin and Jetpack Compose. Beekeepers work in fields with no signal, so it had to be offline first. And the decision support piece — the Hive Doctor — I deliberately built on explicit rules rather than a model, because when you're telling someone something might be wrong with their colony, being able to point at the exact rule that fired matters far more than being clever. Designing for someone whose expertise is completely unlike yours is its own skill.",
  },
  {
    index: "06",
    title: "Where I am now",
    body: "I'm building two products of my own. ZenPro pulls everything that moved overnight into one personalized morning brief. Diavo sits between food data and the decisions people actually make about it. Both are live, both are mine end to end — schema, auth, search, interface, deploy. I've spent four years getting comfortable across the whole stack, and what I want next is a team to point that at.",
  },
];

/** How I work. Three beats, in order. */
export const process = [
  {
    step: "01",
    title: "Understand",
    body: "Read the whole system before touching it — the constraints, the data model, what the person on the other end is actually trying to do. Most of the bad decisions get made here, before anyone writes anything.",
  },
  {
    step: "02",
    title: "Build",
    body: "Build it properly across every layer it touches, not just the one I find interesting. Validate at the boundaries so failures happen early and in the safe place rather than late and in production.",
  },
  {
    step: "03",
    title: "Ship",
    body: "Get it in front of real use, watch what breaks, and fix the thing that actually broke rather than the thing I assumed would. Then keep a log, because the next version of me will want to know why.",
  },
] as const;

/** Rotating subtitles under the about heading. */
export const aboutSubtitles = [
  "Understanding the whole thing, then building it properly",
  "Interfaces, systems, intelligence, infrastructure",
  "Still mostly building things to find out how they work",
] as const;
