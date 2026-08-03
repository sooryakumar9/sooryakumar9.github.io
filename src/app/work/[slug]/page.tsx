import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Reveal from "@/components/motion/Reveal";
import Signature from "@/components/signature/Signature";
import Collaborate from "@/components/chrome/Collaborate";
import { ProjectSchema } from "@/components/chrome/StructuredData";
import Architecture from "@/components/sections/Architecture";
import { architectures } from "@/content/architecture";
import { categoryLabels, getProject, projects } from "@/content/work";

type Params = { slug: string };

export function generateStaticParams(): Params[] {
  return projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) return {};
  return { title: project.title, description: project.blurb };
}

export default async function ProjectPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) notFound();

  const index = projects.findIndex((p) => p.slug === slug);
  const next = projects[(index + 1) % projects.length];

  return (
    <>
      <ProjectSchema project={project} />
      <article>
        <header className="page-shell pt-32 pb-12 md:pt-44">
          <Reveal>
            <Link
              href="/work"
              className="text-muted hover:text-fg mb-10 inline-flex items-center gap-2 text-sm transition-colors"
            >
              <span aria-hidden>←</span> All work
            </Link>
          </Reveal>

          <Reveal delay={0.05}>
            <p className="eyebrow mb-4">
              {categoryLabels[project.category]} · {project.period}
            </p>
          </Reveal>

          <Reveal delay={0.08}>
            <h1
              data-vt-title
              style={{ viewTransitionName: "project-title" }}
              className="display mb-6 max-w-4xl text-4xl md:text-7xl"
            >
              {project.title}
            </h1>
          </Reveal>

          <Reveal delay={0.12}>
            <p className="text-muted max-w-2xl text-lg md:text-xl">{project.blurb}</p>
          </Reveal>
        </header>

        <Reveal>
          <div className="page-shell">
            <div
              data-vt-art
              style={{ viewTransitionName: "project-art" }}
              className="rounded-frame border-line relative h-64 overflow-hidden border md:h-[420px]"
            >
              <Signature variant={project.signature} />
            </div>
          </div>
        </Reveal>

        <div className="page-shell grid gap-12 py-16 md:grid-cols-12 md:gap-10 md:py-24">
          <aside className="md:col-span-4">
            <Reveal>
              <dl className="space-y-7 text-sm md:sticky md:top-32">
                {project.org && (
                  <div>
                    <dt className="eyebrow mb-2">Where</dt>
                    <dd>{project.org}</dd>
                  </div>
                )}
                {project.role && (
                  <div>
                    <dt className="eyebrow mb-2">Role</dt>
                    <dd>{project.role}</dd>
                  </div>
                )}
                <div>
                  <dt className="eyebrow mb-2">When</dt>
                  <dd>{project.period}</dd>
                </div>
                <div>
                  <dt className="eyebrow mb-2">Built with</dt>
                  <dd>
                    <ul className="flex flex-wrap gap-1.5">
                      {project.tech.map((t) => (
                        <li
                          key={t}
                          className="border-line text-muted rounded-chip border px-2 py-0.5 font-mono text-xs"
                        >
                          {t}
                        </li>
                      ))}
                    </ul>
                  </dd>
                </div>
                {project.live && (
                  <div>
                    <dt className="eyebrow mb-2">Live</dt>
                    <dd>
                      <a
                        href={project.live}
                        target="_blank"
                        rel="noreferrer"
                        className="text-accent hover:text-accent-deep transition-colors"
                      >
                        {project.live.replace(/^https?:\/\//, "").replace(/\/$/, "")}{" "}
                        <span aria-hidden>↗</span>
                      </a>
                    </dd>
                  </div>
                )}
                {project.sourceNote && (
                  <div>
                    <dt className="eyebrow mb-2">Source</dt>
                    <dd className="text-muted">{project.sourceNote}</dd>
                  </div>
                )}
              </dl>
            </Reveal>
          </aside>

          <div className="md:col-span-8">
            {project.sections.map((s, i) => (
              <Reveal key={s.heading} delay={i * 0.04}>
                <section className="mb-12">
                  <h2 className="display mb-4 text-2xl md:text-3xl">{s.heading}</h2>
                  <p className="text-muted text-base leading-relaxed md:text-lg">{s.body}</p>
                </section>
              </Reveal>
            ))}

            {architectures[project.slug] && (
              <Reveal>
                <Architecture arch={architectures[project.slug]} title={project.title} />
              </Reveal>
            )}

            {project.constraints && (
              <Reveal>
                <section className="mb-12">
                  <h2 className="display mb-5 text-2xl md:text-3xl">What shaped it</h2>
                  <ul className="space-y-3">
                    {project.constraints.map((c) => (
                      <li key={c} className="text-muted flex gap-3 leading-relaxed">
                        <span aria-hidden className="text-accent mt-1 shrink-0">
                          ✳
                        </span>
                        {c}
                      </li>
                    ))}
                  </ul>
                </section>
              </Reveal>
            )}

            {project.progress && (
              <Reveal>
                <section className="mb-12">
                  <h2 className="display mb-5 text-2xl md:text-3xl">Where it stands</h2>
                  <div className="grid gap-6 sm:grid-cols-3">
                    {(
                      [
                        ["Exists", project.progress.exists],
                        ["Building", project.progress.building],
                        ["Still figuring out", project.progress.exploring],
                      ] as const
                    ).map(([label, items]) => (
                      <div key={label}>
                        <h3 className="eyebrow text-accent mb-3">{label}</h3>
                        <ul className="text-muted space-y-2 text-sm">
                          {items.map((it) => (
                            <li key={it}>{it}</li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>

                  <h3 className="eyebrow mt-10 mb-4">Dev log</h3>
                  <ol className="space-y-3">
                    {project.progress.devLog.map((entry) => (
                      <li key={entry.date} className="hairline flex gap-5 pt-3 text-sm">
                        <span className="text-accent w-28 shrink-0 font-mono text-xs">
                          {entry.date}
                        </span>
                        <span className="text-muted">{entry.note}</span>
                      </li>
                    ))}
                  </ol>
                </section>
              </Reveal>
            )}

            <Reveal>
              <section className="rounded-panel border-line bg-surface border p-6 md:p-8">
                <h2 className="eyebrow mb-3">Outcome</h2>
                <p className="display text-xl leading-snug font-light md:text-2xl">
                  {project.outcome}
                </p>
              </section>
            </Reveal>
          </div>
        </div>
      </article>

      <nav aria-label="Next project" className="page-shell pb-8">
        <Link
          href={`/work/${next.slug}`}
          className="hairline group flex flex-wrap items-center justify-between gap-4 pt-8"
        >
          <div>
            <p className="eyebrow mb-2">Next</p>
            <p className="display text-2xl md:text-4xl">{next.title}</p>
          </div>
          <span
            aria-hidden
            className="text-accent text-3xl transition-transform group-hover:translate-x-2"
          >
            →
          </span>
        </Link>
      </nav>

      <Collaborate />
    </>
  );
}
