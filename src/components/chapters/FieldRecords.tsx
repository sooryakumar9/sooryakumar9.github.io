import { experienceRecords } from "@/content/experience";
import type { ExperienceRecord } from "@/content/types";
import { SheetMarker, GrammarMarker } from "@/components/ui/schematic";
import { Settle, SetLines } from "@/components/motion/primitives";
import HiveDiagnostic from "@/components/diagrams/HiveDiagnostic";

/**
 * SHEET 02 · FIELD RECORDS
 * Professional engagements, kept terse: the DRDO record cross-references
 * its full case study below; Madhu-Marga carries its own compact record.
 * Together they read as range · web systems and product engineering.
 */
export default function FieldRecords() {
  return (
    <section
      id="sec-02"
      aria-label="Field records · professional experience"
      className="px-[calc(max(14px,2.6vw)+14px)] pt-28 sm:pt-36"
    >
      <div className="mx-auto max-w-6xl">
        <SheetMarker num="02" title="FIELD RECORDS" right="PROFESSIONAL ENGAGEMENTS · VERIFIED" />

        <SetLines
          as="h2"
          lines={["Where the work", "was fielded"]}
          className="mt-10 font-display uppercase leading-[0.9] tracking-[-0.02em]"
          lineClassName="[font-stretch:120%]"
          style={{ fontSize: "clamp(2.4rem, 6vw, 5rem)", fontWeight: 800 }}
        />

        <div className="mt-14 space-y-16">
          {experienceRecords.map((rec, i) => (
            <Record key={rec.id} rec={rec} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

function Record({ rec, index }: { rec: ExperienceRecord; index: number }) {
  const twoCol = rec.notes.length > 1;
  return (
    <Settle amount={0.1}>
      <article aria-label={`${rec.role}, ${rec.org}`}>
        <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2 border-t border-hairline-strong pt-4">
          <p className="annotation">
            <span className="text-signal">REC·0{index + 1}</span>
            <span className="mx-3 text-pencil">/</span>
            {rec.role} · {rec.org}
          </p>
          <p className="annotation text-pencil">
            {[rec.place, rec.period].filter(Boolean).join(" · ") || "RECORD ON FILE"}
          </p>
        </div>

        <p className="mt-6 max-w-3xl text-[clamp(1.25rem,2.4vw,1.9rem)] font-medium leading-snug tracking-[-0.01em] [font-stretch:110%]">
          {rec.headline}
        </p>

        <div className={`mt-8 grid gap-8 ${twoCol ? "md:grid-cols-2" : ""}`}>
          {rec.notes.map((note) => (
            <div key={note.label}>
              <GrammarMarker index="·" label={note.label} />
              <p className="mt-3 max-w-xl text-[0.95rem] leading-relaxed text-ink/80">
                {note.text}
              </p>
            </div>
          ))}
        </div>

        {rec.id === "mindmatrix" && (
          <div className="mt-10">
            <GrammarMarker index="·" label="SYSTEM · HIVE DOCTOR, AS ARCHITECTED" />
            <div className="mt-5">
              <HiveDiagnostic />
            </div>
          </div>
        )}

        <div className="mt-8 flex flex-wrap items-baseline justify-between gap-x-8 gap-y-3 border-t border-hairline pt-4">
          <p className="annotation text-pencil">
            DEMONSTRATES:{" "}
            <span className="text-ink/75">{rec.demonstrates.join("  ·  ")}</span>
          </p>
          {rec.crossRef && (
            <a
              href={rec.crossRef.href}
              data-cursor="OPEN"
              className="annotation link-draw text-signal"
            >
              {rec.crossRef.label}
            </a>
          )}
        </div>
      </article>
    </Settle>
  );
}
