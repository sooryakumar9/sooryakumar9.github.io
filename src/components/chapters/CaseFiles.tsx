import type { ComponentType } from "react";
import { caseStudies } from "@/content/projects";
import type { CaseStudy } from "@/content/types";
import { SheetMarker, GrammarMarker, LeaderNote } from "@/components/ui/schematic";
import { Settle, SetLines } from "@/components/motion/primitives";
import HilsLoop from "@/components/diagrams/HilsLoop";
import RagPipeline from "@/components/diagrams/RagPipeline";
import SecureChannel from "@/components/diagrams/SecureChannel";
import PolicyGate from "@/components/diagrams/PolicyGate";

const DIAGRAMS: Record<CaseStudy["diagram"], ComponentType> = {
  hils: HilsLoop,
  rag: RagPipeline,
  channel: SecureChannel,
  gate: PolicyGate,
};

/**
 * SHEET 02 — CASE FILES
 * Completed work. Shared grammar (context → idea → system → engineering →
 * outcome); a unique living diagram per case.
 */
export default function CaseFiles() {
  return (
    <section id="sec-03" aria-label="Case files — completed work">
      <div className="px-[calc(max(14px,2.6vw)+14px)] pt-28 sm:pt-36">
        <div className="mx-auto max-w-6xl">
          <SheetMarker num="03" title="CASE FILES" right="COMPLETED WORK — DRAWN AS BUILT" />
          <SetLines
            as="h2"
            lines={["What I've", "built"]}
            className="mt-10 font-display uppercase leading-[0.9] tracking-[-0.02em]"
            lineClassName="[font-stretch:120%]"
            style={{ fontSize: "clamp(2.6rem, 7vw, 6rem)", fontWeight: 800 }}
          />
          <p className="annotation mt-6 max-w-md text-pencil">
            Four systems, drawn as built. Each schematic below is live — run it.
          </p>
        </div>
      </div>

      {caseStudies.map((cs) => (
        <CaseFile key={cs.id} cs={cs} />
      ))}
    </section>
  );
}

function CaseActions({ cs }: { cs: CaseStudy }) {
  if (!cs.links?.length && !cs.sourceNote) return null;
  return (
    <span className="flex flex-wrap items-baseline gap-x-6 gap-y-1">
      {cs.links?.map((link) => (
        <a
          key={link.href}
          href={link.href}
          target="_blank"
          rel="noopener noreferrer"
          data-cursor="OPEN"
          className="annotation link-draw text-signal"
        >
          {link.label} ↗
        </a>
      ))}
      {cs.sourceNote && (
        <span className="annotation text-pencil">{cs.sourceNote}</span>
      )}
    </span>
  );
}

function CaseHeader({ cs }: { cs: CaseStudy }) {
  return (
    <Settle>
      <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2 border-t border-hairline pt-4">
        <p className="annotation text-signal">CS-0{cs.index}</p>
        <p className="annotation text-pencil">
          {cs.org ?? "INDEPENDENT PROJECT"}
          {cs.role ? ` · ${cs.role}` : ""}
          {cs.period ? ` · ${cs.period}` : ""}
        </p>
      </div>
      <h3
        className="mt-6 max-w-4xl font-display font-bold uppercase leading-[0.95] tracking-[-0.015em] [font-stretch:115%]"
        style={{
          fontSize: cs.compact
            ? "clamp(1.6rem, 3.4vw, 2.6rem)"
            : "clamp(1.9rem, 4.6vw, 3.8rem)",
        }}
      >
        {cs.title}
      </h3>
      <p className="mt-3 max-w-2xl text-[1.05rem] leading-relaxed text-ink/70">
        {cs.subtitle}
      </p>
    </Settle>
  );
}

function CaseFile({ cs }: { cs: CaseStudy }) {
  const Diagram = DIAGRAMS[cs.diagram];

  // compact utility record — smaller drawing, merged prose, honest scale
  if (cs.compact) {
    return (
      <article id={`case-${cs.id}`} className="pt-24 sm:pt-28">
        <div className="px-[calc(max(14px,2.6vw)+14px)]">
          <div className="mx-auto max-w-6xl">
            <CaseHeader cs={cs} />
            <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_320px] lg:gap-14">
              <div>
                <GrammarMarker index="01" label="SYSTEM — LIVE SCHEMATIC" />
                <div className="mt-5">
                  <Diagram />
                </div>
              </div>
              <Settle delay={0.1}>
                <GrammarMarker index="02" label="RECORD" />
                <p className="mt-4 text-[0.95rem] leading-relaxed text-ink/85">
                  {cs.context} {cs.idea}
                </p>
                <p className="mt-5 font-medium leading-snug">{cs.outcome}</p>
                <div className="annotation mt-7 space-y-2 border-t border-hairline pt-3">
                  <p className="text-pencil">DRAWN WITH — {cs.tech.join(" · ")}</p>
                  <CaseActions cs={cs} />
                </div>
              </Settle>
            </div>
          </div>
        </div>
      </article>
    );
  }

  return (
    <article
      id={`case-${cs.id}`}
      className={
        cs.inverted
          ? "inverted mt-28 bg-paper py-28 text-ink sm:mt-36 sm:py-32"
          : "pt-28 sm:pt-36"
      }
    >
      <div className="px-[calc(max(14px,2.6vw)+14px)]">
        <div className="mx-auto max-w-6xl">
          <CaseHeader cs={cs} />

          {/* context + idea */}
          <div className="mt-14 grid gap-10 md:grid-cols-2 md:gap-14">
            <Settle>
              <GrammarMarker index="01" label="CONTEXT" />
              <p className="mt-4 leading-relaxed text-ink/85">{cs.context}</p>
            </Settle>
            <Settle delay={0.1}>
              <GrammarMarker index="02" label="IDEA" />
              <p className="mt-4 leading-relaxed text-ink/85">{cs.idea}</p>
            </Settle>
          </div>

          {/* the living diagram */}
          <div className="mt-16">
            <GrammarMarker index="03" label="SYSTEM — LIVE SCHEMATIC" />
            <div className="mt-6">
              <Diagram />
            </div>
            <p className="mt-6 max-w-3xl leading-relaxed text-ink/85">{cs.system}</p>
          </div>

          {/* engineering + outcome */}
          <div className="mt-16 grid gap-10 md:grid-cols-2 md:gap-14">
            <Settle>
              <GrammarMarker index="04" label="ENGINEERING — CONSTRAINTS OF THE DRAWING" />
              <div className="mt-5 space-y-3.5">
                {cs.engineering.map((line) => (
                  <LeaderNote key={line}>{line}</LeaderNote>
                ))}
              </div>
            </Settle>
            <Settle delay={0.1}>
              <GrammarMarker index="05" label="OUTCOME" />
              <p className="mt-4 text-[clamp(1.15rem,2vw,1.5rem)] font-medium leading-snug [font-stretch:108%]">
                {cs.outcome}
              </p>
              <div className="annotation mt-8 space-y-2 border-t border-hairline pt-3">
                <p className="text-pencil">DRAWN WITH — {cs.tech.join(" · ")}</p>
                <CaseActions cs={cs} />
              </div>
            </Settle>
          </div>
        </div>
      </div>
    </article>
  );
}
