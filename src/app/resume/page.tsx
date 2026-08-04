import type { Metadata } from "next";
import TransitionLink from "@/components/motion/TransitionLink";
import Reveal from "@/components/motion/Reveal";
import { profile, foundations } from "@/content/profile";
import { experience } from "@/content/experience";
import { featuredSlugs, projectsBySlugs } from "@/content/work";

export const metadata: Metadata = {
  title: "Résumé",
  description:
    "Soorya Kumar, full stack software developer in Bengaluru. Internships at DRDO and MindMatrix, selected engineering work, and the fundamentals underneath it.",
};

const selected = projectsBySlugs(featuredSlugs);

const links = [
  { label: "Email", href: `mailto:${profile.email}`, text: profile.email },
  { label: "GitHub", href: profile.github, text: "github.com/sooryakumar9" },
  { label: "LinkedIn", href: profile.linkedin, text: "linkedin.com/in/soorya" },
  { label: "LeetCode", href: profile.leetcode, text: "leetcode.com/u/sooryakumar9" },
];

/**
 * The résumé as a page rather than only a PDF.
 *
 * Every fact here is read from the same content the case studies are built
 * from, so this cannot drift from the rest of the site: there is no second copy
 * of a date or a number to forget to update.
 *
 * It is designed to be printed. The rules live under `@media print` in
 * globals.css: black on white, no chrome, no canvases, and link targets spelled
 * out, because a printed page that hides its URLs is a dead end.
 */
export default function ResumePage() {
  return (
    <div className="page-shell resume-sheet pt-32 pb-24 md:pt-44">
      <Reveal>
        <TransitionLink
          href="/"
          className="text-muted hover:text-fg no-print mb-10 inline-flex items-center gap-2 text-sm transition-colors"
        >
          <span aria-hidden>←</span> Home
        </TransitionLink>
      </Reveal>

      {/* ------------------------------------------------------------ head */}
      <Reveal delay={0.04}>
        <header className="border-line mb-10 border-b pb-8">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <h1 className="display mb-2 text-4xl md:text-6xl">{profile.name}</h1>
              <p className="text-muted text-lg">{profile.role}</p>
              <p className="text-muted mt-1 flex items-center gap-2 text-sm">
                <span aria-hidden className="status-dot" />
                Available for work in {profile.location}
              </p>
            </div>

            <a
              href={profile.resume}
              download
              className="border-line-strong hover:border-accent hover:text-accent rounded-chip no-print inline-block border px-4 py-2 text-sm transition-colors"
            >
              Download PDF <span aria-hidden>↓</span>
            </a>
          </div>

          <ul className="resume-contact text-muted mt-6 flex flex-wrap gap-x-6 gap-y-2 font-mono text-xs">
            {links.map((l) => (
              <li key={l.label}>
                <a
                  href={l.href}
                  className="hover:text-accent transition-colors"
                  {...(l.href.startsWith("http")
                    ? { target: "_blank", rel: "noreferrer" }
                    : {})}
                >
                  {l.text}
                </a>
              </li>
            ))}
          </ul>
        </header>
      </Reveal>

      {/* ------------------------------------------------------ experience */}
      <Reveal delay={0.06}>
        <section aria-labelledby="r-experience" className="mb-10">
          <h2 id="r-experience" className="eyebrow mb-5">
            Experience
          </h2>

          <div className="space-y-7">
            {experience.map((role) => (
              <article key={role.id} className="resume-entry">
                <div className="mb-1 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                  <h3 className="display text-xl md:text-2xl">
                    {role.role}, {role.org}
                  </h3>
                  <p className="text-muted font-mono text-xs">{role.period}</p>
                </div>
                <p className="text-muted mb-2 text-sm">{role.place}</p>
                <p className="mb-2">{role.headline}</p>
                <p className="text-muted text-sm leading-relaxed">{role.body}</p>
                <p className="text-muted mt-2 font-mono text-xs">{role.tech.join(" · ")}</p>
              </article>
            ))}
          </div>
        </section>
      </Reveal>

      {/* --------------------------------------------------- selected work */}
      <Reveal delay={0.08}>
        <section aria-labelledby="r-work" className="mb-10">
          <h2 id="r-work" className="eyebrow mb-5">
            Selected work
          </h2>

          <div className="space-y-6">
            {selected.map((p) => (
              <article key={p.slug} className="resume-entry">
                <div className="mb-1 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                  <h3 className="display text-xl">
                    {/* the advantage a page has over a PDF: each one goes somewhere */}
                    <TransitionLink
                      href={`/work/${p.slug}`}
                      className="hover:text-accent transition-colors"
                    >
                      {p.title}
                    </TransitionLink>
                  </h3>
                  <p className="text-muted font-mono text-xs">{p.period}</p>
                </div>
                {p.org && <p className="text-muted mb-1 text-sm">{p.org}</p>}
                <p className="text-muted text-sm leading-relaxed">{p.outcome}</p>
                <p className="text-muted mt-2 font-mono text-xs">{p.tech.join(" · ")}</p>
              </article>
            ))}
          </div>

          <p className="text-muted no-print mt-6 text-sm">
            <TransitionLink href="/work" className="text-accent hover:text-accent-deep">
              All work <span aria-hidden>→</span>
            </TransitionLink>
          </p>
        </section>
      </Reveal>

      {/* ------------------------------------------ education and grounding */}
      <Reveal delay={0.1}>
        <div className="grid gap-10 sm:grid-cols-2">
          <section aria-labelledby="r-education">
            <h2 id="r-education" className="eyebrow mb-5">
              Education
            </h2>
            <div className="resume-entry">
              <h3 className="mb-1">{profile.education.degree}</h3>
              <p className="text-muted text-sm">
                {profile.education.school}, {profile.education.place}
              </p>
              <p className="text-muted mt-1 font-mono text-xs">
                {profile.education.period} · CGPA {profile.education.cgpa}
              </p>
            </div>
          </section>

          <section aria-labelledby="r-skills">
            <h2 id="r-skills" className="eyebrow mb-5">
              Fundamentals and tools
            </h2>
            <div className="resume-entry">
              <p className="text-sm leading-relaxed">
                {foundations.fundamentals.map((f) => f.title).join(" · ")}
              </p>
              <p className="text-muted mt-3 font-mono text-xs leading-relaxed">
                {foundations.toolchain.join(" · ")}
              </p>
            </div>
          </section>
        </div>
      </Reveal>
    </div>
  );
}
