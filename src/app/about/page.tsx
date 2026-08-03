import type { Metadata } from "next";
import TransitionLink from "@/components/motion/TransitionLink";
import Reveal from "@/components/motion/Reveal";
import Journey from "@/components/sections/Journey";
import RotatingSubtitle from "@/components/sections/RotatingSubtitle";
import Collaborate from "@/components/chrome/Collaborate";
import HeroField from "@/components/signature/HeroField";
import { process } from "@/content/journey";
import { profile } from "@/content/profile";

export const metadata: Metadata = {
  title: "About",
  description:
    "How I got from a first curiosity about how things work to building software across the full stack: fundamentals at JSSATE, simulation automation at DRDO, Android at MindMatrix, and two products of my own.",
};

export default function AboutPage() {
  return (
    <>
      <section className="relative overflow-hidden pt-32 pb-16 md:pt-44">
        <div aria-hidden className="absolute inset-0 z-0 opacity-40">
          <HeroField interactive={false} />
        </div>
        <div aria-hidden className="smoke smoke-b z-0" />

        <div className="page-shell relative z-10">
          <Reveal>
            <TransitionLink
              href="/"
              className="text-muted hover:text-fg mb-10 inline-flex items-center gap-2 text-sm transition-colors"
            >
              <span aria-hidden>←</span> Home
            </TransitionLink>
          </Reveal>

          <Reveal delay={0.05}>
            <p className="eyebrow mb-4">About</p>
          </Reveal>

          <Reveal delay={0.08}>
            <h1 className="display mb-6 max-w-4xl text-5xl md:text-8xl">
              Hey — thanks for scrolling this far
            </h1>
          </Reveal>

          <Reveal delay={0.12}>
            <RotatingSubtitle />
          </Reveal>

          <Reveal delay={0.16}>
            <div className="border-line mt-12 grid max-w-3xl gap-6 border-t pt-8 sm:grid-cols-2">
              <div>
                <h2 className="eyebrow mb-2">Education</h2>
                <p className="text-sm">{profile.education.degree}</p>
                <p className="text-muted text-sm">
                  {profile.education.school}, {profile.education.place}
                </p>
                <p className="text-muted mt-1 font-mono text-xs">
                  {profile.education.period} · CGPA {profile.education.cgpa}
                </p>
              </div>
              <div>
                <h2 className="eyebrow mb-2">Currently</h2>
                <p className="text-muted flex items-center gap-2 text-sm">
                  <span aria-hidden className="status-dot" />
                  Available for work — {profile.location}
                </p>
                <a
                  href={profile.resume}
                  className="text-accent hover:text-accent-deep mt-2 inline-block text-sm transition-colors"
                >
                  Download résumé <span aria-hidden>↓</span>
                </a>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <section aria-labelledby="journey-heading" className="pt-8">
        <div className="page-shell">
          <Reveal>
            <h2 id="journey-heading" className="display mb-4 text-3xl md:text-5xl">
              How I got here
            </h2>
          </Reveal>
        </div>
        <Journey />
      </section>

      <section aria-labelledby="process-heading" className="page-shell py-20 md:py-32">
        <Reveal>
          <p className="eyebrow mb-3">How I work</p>
          <h2 id="process-heading" className="display mb-12 max-w-3xl text-3xl md:text-5xl">
            Three habits that survive every stack
          </h2>
        </Reveal>

        <div className="grid gap-5 md:grid-cols-3">
          {process.map((step, i) => (
            <Reveal key={step.step} delay={i * 0.06}>
              <div className="rounded-frame border-line bg-surface h-full border p-6 md:p-8">
                <p className="text-accent mb-5 font-mono text-sm">{step.step}</p>
                <h3 className="display mb-3 text-2xl">{step.title}</h3>
                <p className="text-muted leading-relaxed">{step.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <Collaborate />
    </>
  );
}
