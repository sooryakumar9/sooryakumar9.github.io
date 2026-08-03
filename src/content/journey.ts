import type { JourneyChapter } from "./types";

/** The long form about page. First person, in order. */
export const journey: JourneyChapter[] = [
  {
    index: "01",
    title: "Starting in Bengaluru",
    body: "I grew up in Bengaluru, so software was never an abstract career to me. It was simply what the people around me did for a living. That is not really what pulled me in, though. What pulled me in was a much smaller thing: wanting to know how the thing on the screen actually worked underneath. Not how to use it. How it worked. I have been following that same question ever since.",
  },
  {
    index: "02",
    title: "Fundamentals, and the first small tools",
    body: "I studied Computer Science at JSS Academy of Technical Education, and most of what stayed with me was the unglamorous half: data structures, operating systems, databases, networks. The first thing I built that other people actually used was a website blocker for examination halls, a small Tkinter utility with editable block lists and a schedule. It was a tiny piece of software, but it had to work every single time, in a room full of people, or it was worthless. I learned more about reliability from that than from any lecture.",
  },
  {
    index: "03",
    title: "Asking what breaks in ten years",
    body: "Then I got interested in a problem that had not happened yet. Most encrypted traffic still rests on RSA, which is safe against every computer that exists today and breakable by a large enough quantum one. Anything intercepted now is really a bet on when that machine arrives. I built Q-Secure Chat to find out whether quantum resistant messaging was actually buildable with ordinary tools, and I kept the classical channel running alongside it as a control. It was the first time I designed against a threat model with a clock attached to it.",
  },
  {
    index: "04",
    title: "Constraints you cannot argue with",
    body: "At DRDO's Aeronautical Development Establishment I automated a hardware in the loop simulation lab. The lab ran Python 2.6.4 and MATLAB R2012B, and RT-LAB itself could not be modified. I could drive it, not change it. There is no version of that job where you get to pick a nicer stack. You work with what is already in the room, you validate everything before it reaches a real machine, and you earn the operator's trust one run at a time. Manual effort dropped by roughly 70%. That internship changed how I think about engineering more than any project I chose for myself.",
  },
  {
    index: "05",
    title: "Building for people who aren't engineers",
    body: "At MindMatrix I built Madhu-Marga, a beekeeping app, in Kotlin and Jetpack Compose. Beekeepers work in fields with no signal, so the whole thing had to be offline first. I also built the decision support piece, the Hive Doctor, on explicit rules rather than a trained model. When you are telling someone that something might be wrong with their colony, being able to point at the exact rule that fired matters far more than being clever. Designing for someone whose expertise is nothing like your own turns out to be a skill of its own.",
  },
  {
    index: "06",
    title: "Where I am now",
    body: "I'm building two products of my own. ZenPro pulls everything that moved overnight into one personalized morning brief. Diavo sits between food data and the decisions people actually make about what they eat. Both are live and both are mine end to end, from the schema and auth through search, interface and deploy. I have spent four years getting comfortable across the whole stack, and what I want next is a team to point that at.",
  },
];

/** How I work. Three beats, in order. */
export const process = [
  {
    step: "01",
    title: "Understand",
    body: "Read the whole system before touching it: the constraints, the data model, and what the person on the other end is actually trying to do. Most of the bad decisions get made right here, before anyone has written a line.",
  },
  {
    step: "02",
    title: "Build",
    body: "Build it properly across every layer it touches, not just the one I find interesting. Validate at the boundaries so that failures happen early and in the safe place rather than late and in production.",
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
