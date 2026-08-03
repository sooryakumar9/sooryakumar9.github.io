import TransitionLink from "@/components/motion/TransitionLink";
import Reveal from "@/components/motion/Reveal";
import Signature from "@/components/signature/Signature";
import { benchSlugs, projectsBySlugs } from "@/content/work";
import ScrambleText from "@/components/motion/ScrambleText";

const bench = projectsBySlugs(benchSlugs);

/**
 * Work in progress, described honestly. Each card separates what actually
 * exists from what is being built and what is still an open question, because
 * a portfolio that presents everything as finished is not worth reading.
 */
export default function Bench() {
  return (
    <section aria-labelledby="bench-heading" className="page-shell py-20 md:py-32">
      <Reveal>
        <div className="mb-12">
          <ScrambleText as="p" className="eyebrow mb-3 block" text="On the bench · Since 2026" />
          <h2 id="bench-heading" className="display max-w-3xl text-4xl md:text-6xl">
            Two products I&rsquo;m building right now
          </h2>
          <p className="text-muted mt-5 max-w-2xl">
            Both are live and both are mine end to end, from schema and auth
            through search, interface and deploy. Here is exactly how far each one has got.
          </p>
        </div>
      </Reveal>

      <div className="grid gap-6 md:grid-cols-2">
        {bench.map((p, i) => (
          <Reveal key={p.slug} delay={i * 0.08}>
            <article
              data-cursor-label="Read"
              className="tech-edge rounded-frame border-line bg-surface flex h-full flex-col overflow-hidden border"
            >
              <div className="border-line relative h-44 border-b md:h-52">
                <Signature variant={p.signature} />
                {p.live && (
                  <span className="border-line bg-bg/70 text-muted rounded-chip absolute top-4 right-4 flex items-center gap-2 border px-3 py-1 font-mono text-xs backdrop-blur">
                    <span aria-hidden className="status-dot" />
                    Live
                  </span>
                )}
              </div>

              <div className="flex flex-1 flex-col p-6 md:p-8">
                <h3 className="display mb-2 text-2xl md:text-3xl">{p.title}</h3>
                <p className="text-muted mb-6 text-sm md:text-base">{p.blurb}</p>

                {p.progress && (
                  <dl className="mb-6 space-y-4 text-sm">
                    <div>
                      <dt className="eyebrow text-accent mb-1.5">Exists</dt>
                      <dd className="text-muted">{p.progress.exists.join(" · ")}</dd>
                    </div>
                    <div>
                      <dt className="eyebrow mb-1.5">Building</dt>
                      <dd className="text-muted">{p.progress.building.join(" · ")}</dd>
                    </div>
                    <div>
                      <dt className="eyebrow mb-1.5">Still figuring out</dt>
                      <dd className="text-muted">{p.progress.exploring.join(" · ")}</dd>
                    </div>
                  </dl>
                )}

                <div className="mt-auto flex flex-wrap items-center gap-x-5 gap-y-2 pt-2">
                  <TransitionLink
                    href={`/work/${p.slug}`}
                    className="hover:text-accent text-sm transition-colors"
                  >
                    Read more <span aria-hidden>→</span>
                  </TransitionLink>
                  {p.live && (
                    <a
                      href={p.live}
                      target="_blank"
                      rel="noreferrer"
                      className="text-accent hover:text-accent-deep text-sm transition-colors"
                    >
                      Visit the live build <span aria-hidden>↗</span>
                    </a>
                  )}
                </div>
              </div>
            </article>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
