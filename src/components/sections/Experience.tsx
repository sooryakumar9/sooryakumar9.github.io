import Link from "next/link";
import Reveal from "@/components/motion/Reveal";
import Signature from "@/components/signature/Signature";
import { experience } from "@/content/experience";
import { getProject } from "@/content/work";
import ScrambleText from "@/components/motion/ScrambleText";

/**
 * The two internships, given room. These are the strongest credentials on the
 * site, so they get full width rows rather than a slot in the carousel, and
 * each one links through to the case study it produced.
 */
export default function Experience() {
  return (
    <section aria-labelledby="experience-heading" className="page-shell py-20 md:py-32">
      <Reveal>
        <div className="mb-12 flex items-end justify-between gap-6">
          <div>
            <ScrambleText as="p" className="eyebrow mb-3 block" text="Experience" />
            <h2 id="experience-heading" className="display text-4xl md:text-6xl">
              Where I&rsquo;ve worked
            </h2>
          </div>
          <p className="text-muted font-mono text-sm">
            ({String(experience.length).padStart(2, "0")})
          </p>
        </div>
      </Reveal>

      <div>
        {experience.map((role, i) => {
          const project = getProject(role.projectSlug);
          return (
            <Reveal key={role.id} delay={i * 0.05}>
              <article className="hairline group grid gap-8 py-12 md:grid-cols-12 md:gap-10 md:py-16">
                <div className="md:col-span-5">
                  <p className="eyebrow mb-3">{role.period}</p>
                  <h3 className="display mb-2 text-2xl md:text-4xl">{role.org}</h3>
                  <p className="text-accent text-sm">
                    {role.role} · {role.place}
                  </p>

                  {project && (
                    <div className="border-line mt-8 hidden aspect-[16/10] overflow-hidden rounded-panel border md:block">
                      <Signature variant={project.signature} />
                    </div>
                  )}
                </div>

                <div className="md:col-span-7">
                  <p className="display mb-5 text-xl leading-snug font-light md:text-2xl">
                    {role.headline}
                  </p>
                  <p className="text-muted mb-6 leading-relaxed">{role.body}</p>

                  <ul className="mb-7 flex flex-wrap gap-2">
                    {role.tech.map((t) => (
                      <li
                        key={t}
                        className="border-line text-muted rounded-chip border px-2.5 py-1 font-mono text-xs"
                      >
                        {t}
                      </li>
                    ))}
                  </ul>

                  {project && (
                    <Link
                      href={`/work/${project.slug}`}
                      className="text-fg hover:text-accent inline-flex items-center gap-2 text-sm transition-colors"
                    >
                      Read the case study
                      <span aria-hidden className="transition-transform group-hover:translate-x-1">
                        →
                      </span>
                    </Link>
                  )}
                </div>
              </article>
            </Reveal>
          );
        })}
      </div>
    </section>
  );
}
