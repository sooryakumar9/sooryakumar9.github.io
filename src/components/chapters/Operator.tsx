import { profile } from "@/content/profile";
import { SheetMarker, LeaderNote } from "@/components/ui/schematic";
import { Settle } from "@/components/motion/primitives";

/**
 * SHEET 01 · OPERATOR
 * Who is drawing this document, and why. Short editorial statement,
 * facts as leader notes, human voice confined to the margin.
 */
export default function Operator() {
  return (
    <section
      id="sec-01"
      aria-label="Operator · about"
      className="px-[calc(max(14px,2.6vw)+14px)] py-28 sm:py-36"
    >
      <div className="mx-auto max-w-6xl">
        <SheetMarker num="01" title="OPERATOR" right="WHO IS DRAWING THIS DOCUMENT" />

        <div className="mt-14 grid gap-14 lg:grid-cols-[1fr_280px] lg:gap-20">
          <div className="space-y-8">
            {profile.statement.map((para, i) => (
              <Settle key={i} delay={i * 0.1}>
                <p className="max-w-[26ch] text-[clamp(1.5rem,3.2vw,2.6rem)] font-medium leading-[1.18] tracking-[-0.015em] [font-stretch:112%]">
                  {para}
                </p>
              </Settle>
            ))}
          </div>

          <aside className="flex flex-col gap-6 lg:pt-2" aria-label="Margin notes">
            <Settle delay={0.15}>
              <div className="space-y-4 border-l border-hairline pl-5">
                <LeaderNote>
                  {profile.education.degree}
                  <span className="block text-pencil">
                    {profile.education.school}, {profile.education.place} ·{" "}
                    {profile.education.period}
                  </span>
                </LeaderNote>
                <LeaderNote>
                  Previously: SDE Intern · ADE·DRDO,
                  <span className="block text-pencil">
                    Android Dev Intern · MindMatrix ↓ SEC 02
                  </span>
                </LeaderNote>
                <LeaderNote live>
                  Now building: ZenPro &amp; Diavo
                  <span className="block">↓ on the bench, SEC 04</span>
                </LeaderNote>
              </div>
            </Settle>

            <Settle delay={0.3}>
              <div className="space-y-3 pl-5">
                {profile.marginNotes.map((note) => (
                  <p key={note} className="margin-note">
                    {note}
                  </p>
                ))}
              </div>
            </Settle>
          </aside>
        </div>
      </div>
    </section>
  );
}
