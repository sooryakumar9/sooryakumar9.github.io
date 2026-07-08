import { benchProjects } from "@/content/bench";
import type { BenchProject } from "@/content/types";
import { SheetMarker, RevStamp } from "@/components/ui/schematic";
import { Settle, SetLines } from "@/components/motion/primitives";
import {
  DiavoSchematic,
  ZenproSchematic,
  ZenproBriefPreview,
  DiavoPlatePreview,
} from "@/components/diagrams/BenchSchematics";

/**
 * SHEET 03 — ON THE BENCH
 * The atmosphere shifts: the drafting grid surfaces, stamps read DRAFT,
 * strokes are honest about their state. This is the active workspace,
 * not the archive.
 */
export default function Bench() {
  return (
    <section
      id="sec-04"
      aria-label="On the bench — work in progress"
      className="grid-paper mt-28 border-y border-hairline py-28 sm:mt-36 sm:py-36"
    >
      <div className="px-[calc(max(14px,2.6vw)+14px)]">
        <div className="mx-auto max-w-6xl">
          <SheetMarker num="04" title="ON THE BENCH" right="ACTIVE WORKSPACE — ENTER QUIETLY" />

          <div className="mt-10 flex flex-wrap items-end justify-between gap-6">
            <SetLines
              as="h2"
              lines={["What I'm", "building next"]}
              className="font-display uppercase leading-[0.9] tracking-[-0.02em]"
              lineClassName="[font-stretch:120%]"
              style={{ fontSize: "clamp(2.6rem, 7vw, 6rem)", fontWeight: 800 }}
            />
            <RevStamp draft>DRAFT — REVISIONS DAILY</RevStamp>
          </div>

          <div className="mt-8 flex max-w-2xl flex-col gap-4">
            <p className="leading-relaxed text-ink/80">
              The case files are inked. These sheets are not. Two products in
              active development — read the strokes, they don&apos;t lie:
            </p>
            <StrokeKey />
          </div>

          <div className="mt-16 space-y-16">
            {benchProjects.map((p, i) => (
              <BenchSheet key={p.id} project={p} index={i} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function StrokeKey() {
  return (
    <div className="annotation flex flex-wrap gap-x-7 gap-y-2" aria-label="Stroke legend">
      <span className="flex items-center gap-2.5">
        <svg width="34" height="8" aria-hidden><line x1="0" y1="4" x2="34" y2="4" className="stroke-inked" /></svg>
        EXISTS
      </span>
      <span className="flex items-center gap-2.5">
        <svg width="34" height="8" aria-hidden><line x1="0" y1="4" x2="34" y2="4" className="stroke-dashed" /></svg>
        BEING BUILT
      </span>
      <span className="flex items-center gap-2.5">
        <svg width="34" height="8" aria-hidden><line x1="0" y1="4" x2="34" y2="4" className="stroke-pencil" /></svg>
        EXPLORING
      </span>
    </div>
  );
}

function BenchSheet({ project, index }: { project: BenchProject; index: number }) {
  return (
    <Settle amount={0.08}>
      <article
        id={`bench-${project.id}`}
        className="border border-hairline-strong bg-paper/60 p-6 sm:p-10"
      >
        <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
          <p className="annotation text-signal">BENCH-0{index + 1}</p>
          <p className="annotation flex items-center gap-2 text-pencil">
            <span
              aria-hidden
              className="inline-block size-[7px] animate-pulse rounded-full bg-signal"
            />
            STATUS: {project.status}
          </p>
        </div>

        <h3
          className="mt-5 font-display font-bold uppercase leading-none tracking-[-0.015em] [font-stretch:120%]"
          style={{ fontSize: "clamp(2.2rem, 5.5vw, 4.5rem)" }}
        >
          {project.title}
        </h3>
        <p className="mt-3 max-w-2xl text-[1.05rem] leading-relaxed text-ink/75">
          {project.oneLiner}
        </p>

        {/* deployment — real link or honest pending state, never a fake URL */}
        <p className="annotation mt-4">
          {project.deployment.status === "live" ? (
            <a
              href={project.deployment.href}
              target="_blank"
              rel="noopener noreferrer"
              data-cursor="LAUNCH"
              className="link-draw text-signal"
            >
              DEPLOYMENT: LIVE ↗
            </a>
          ) : (
            <span className="text-pencil">DEPLOYMENT — PENDING · URL RESERVED</span>
          )}
        </p>

        <div className="mt-10 grid gap-8 md:grid-cols-2 md:gap-12 lg:grid-cols-[1fr_1fr_220px]">
          <div>
            <p className="annotation text-pencil">THE PROBLEM BEING EXPLORED</p>
            <p className="mt-3 leading-relaxed text-ink/85">{project.problem}</p>
          </div>
          <div>
            <p className="annotation text-pencil">THE VISION</p>
            <p className="mt-3 leading-relaxed text-ink/85">{project.vision}</p>
          </div>
          <div className="hidden lg:block" aria-hidden={false}>
            {project.id === "zenpro" ? <ZenproBriefPreview /> : <DiavoPlatePreview />}
          </div>
        </div>

        <div className="mt-12">
          {project.id === "diavo" ? <DiavoSchematic /> : <ZenproSchematic />}
        </div>

        {/* honest state — three drawn layers */}
        <div className="mt-10 grid gap-8 border-t border-hairline pt-8 sm:grid-cols-3">
          <StateColumn kind="inked" title="EXISTS" items={project.exists} />
          <StateColumn kind="dashed" title="BEING BUILT" items={project.building} />
          <StateColumn kind="pencil" title="EXPLORING" items={project.exploring} />
        </div>

        {/* dev log + expandable notes */}
        <div className="mt-10 grid gap-8 border-t border-hairline pt-6 md:grid-cols-[1fr_auto]">
          <div>
            <p className="annotation text-pencil">DEV LOG</p>
            <ul className="annotation mt-3 space-y-1.5">
              {project.devLog.map((entry) => (
                <li key={entry.date + entry.note}>
                  <span className="text-signal">{entry.date}</span>
                  <span className="normal-case tracking-normal text-ink/75">
                    {" "}— {entry.note}
                  </span>
                </li>
              ))}
            </ul>
          </div>
          {project.plannedTech.length > 0 && (
            <details className="group max-w-xs">
              <summary
                data-cursor="OPEN"
                className="annotation cursor-pointer list-none text-ink/70 transition-colors hover:text-signal"
              >
                TECHNICAL NOTES
                <span className="ml-1 inline-block transition-transform group-open:rotate-45">
                  +
                </span>
              </summary>
              <p className="annotation mt-3 normal-case tracking-normal text-pencil">
                Planned ecosystem — {project.plannedTech.join(", ")}. Planned
                means planned: dashed edges in the graph below, nothing claimed
                as shipped.
              </p>
            </details>
          )}
        </div>
      </article>
    </Settle>
  );
}

function StateColumn({
  kind,
  title,
  items,
}: {
  kind: "inked" | "dashed" | "pencil";
  title: string;
  items: string[];
}) {
  return (
    <div>
      <p className="annotation flex items-center gap-2.5">
        <svg width="26" height="8" aria-hidden>
          <line x1="0" y1="4" x2="26" y2="4" className={`stroke-${kind}`} />
        </svg>
        {title}
      </p>
      <ul className="mt-3 space-y-2">
        {items.map((item) => (
          <li key={item} className="text-sm leading-snug text-ink/80">
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
