import type { Metadata } from "next";
import Link from "next/link";
import Reveal from "@/components/motion/Reveal";
import WorkIndex from "@/components/sections/WorkIndex";
import Collaborate from "@/components/chrome/Collaborate";

export const metadata: Metadata = {
  title: "Work",
  description:
    "Everything I have built: simulation automation at DRDO, a retrieval pipeline, quantum resistant messaging, a face gated banking app, an Android product for beekeepers, and two products in progress.",
};

export default function WorkPage() {
  return (
    <>
      <section className="page-shell pt-32 pb-16 md:pt-44">
        <Reveal>
          <Link
            href="/"
            className="text-muted hover:text-fg mb-10 inline-flex items-center gap-2 text-sm transition-colors"
          >
            <span aria-hidden>←</span> Home
          </Link>
        </Reveal>

        <Reveal delay={0.05}>
          <h1 className="display mb-5 text-5xl md:text-8xl">Work</h1>
        </Reveal>

        <Reveal delay={0.1}>
          <p className="text-muted max-w-2xl text-lg">
            Internships, coursework that got out of hand, and two products I am
            building now. Everything here is real and everything here shipped to
            someone, even if that someone was a room full of students sitting an
            exam.
          </p>
        </Reveal>
      </section>

      <section className="page-shell pb-24">
        <WorkIndex />
      </section>

      <Collaborate />
    </>
  );
}
