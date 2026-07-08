import { profile } from "@/content/profile";
import { SheetMarker } from "@/components/ui/schematic";
import { SetLines, Settle } from "@/components/motion/primitives";
import BrewLog from "@/components/chapters/BrewLog";
import ChannelSelector from "@/components/chapters/ChannelSelector";

/**
 * SHEET 05 — TITLE BLOCK
 * Every engineering drawing ends in a title block. So does this one.
 */
export default function TitleBlock() {
  return (
    <footer
      id="sec-06"
      aria-label="Title block — contact"
      className="px-[calc(max(14px,2.6vw)+14px)] pb-10 pt-28 sm:pt-36"
    >
      <div className="mx-auto max-w-6xl">
        <SheetMarker num="06" title="TITLE BLOCK" right="END OF DOCUMENT — SIGNAL TERMINATES HERE" />

        <div className="mt-12 grid gap-12 lg:grid-cols-[1fr_1.1fr] lg:gap-16">
          <div>
            <SetLines
              as="h2"
              lines={["Open a", "channel"]}
              className="font-display uppercase leading-[0.9] tracking-[-0.02em]"
              lineClassName="[font-stretch:122%]"
              style={{ fontSize: "clamp(3rem, 8vw, 7.5rem)", fontWeight: 800 }}
            />
            <Settle delay={0.2}>
              <p className="mt-6 max-w-md leading-relaxed text-ink/75">
                Roles, ambitious products, or an argument about retrieval
                pipelines — every route below is live. The channels are
                classical, but they work.
              </p>
              <svg
                viewBox="0 0 420 84"
                className="mt-8 hidden w-full max-w-[420px] lg:block"
                aria-hidden
              >
                <circle cx="14" cy="42" r="6" className="fill-none stroke-inked" />
                <text x="30" y="30" className="svg-label-faint">VISITOR — YOU</text>
                <path d="M 20 42 H 150" className="flow" />
                <path d="M 150 22 H 260 V 62 H 150 Z" className="stroke-inked" fill="none" />
                <text x="205" y="39" textAnchor="middle" className="svg-label">CHANNEL</text>
                <text x="205" y="53" textAnchor="middle" className="svg-label">SELECTOR</text>
                {[8, 25, 42, 59, 76].map((y, i) => (
                  <g key={i}>
                    <path
                      d={`M 260 42 H 296 L 336 ${y} H 404`}
                      className="stroke-dashed"
                      fill="none"
                    />
                    <circle cx="410" cy={y} r="2.5" className="fill-pencil" />
                  </g>
                ))}
              </svg>
            </Settle>
          </div>

          <Settle delay={0.15} amount={0.15}>
            <ChannelSelector />
          </Settle>
        </div>

        {/* the title block itself */}
        <Settle delay={0.1}>
          <div className="annotation mt-16 grid border border-hairline-strong sm:grid-cols-4">
            <Cell label="DRAWN BY">
              {profile.name}
              <span className="block text-pencil">{profile.role}</span>
              <a href={`mailto:${profile.email}`} className="link-draw block">
                {profile.email}
              </a>
            </Cell>
            <Cell label="DRAWN IN">
              Bengaluru, India
              <span className="block text-pencil">{profile.coordinates}</span>
            </Cell>
            <Cell label="TRAINED AT">
              {profile.education.school}
              <span className="block text-pencil">
                {profile.education.degree} · {profile.education.period}
              </span>
            </Cell>
            <Cell label="REVISION">
              {profile.rev}
              <span className="block text-pencil">SCALE — NTS</span>
            </Cell>
          </div>
        </Settle>

        <div className="mt-6 flex flex-wrap items-start justify-between gap-6">
          <p className="annotation max-w-md text-pencil">
            Set in Archivo, IBM Plex Mono &amp; Instrument Serif. Drawn with
            Next.js, Tailwind and Motion. No template was harmed — none was
            used.
          </p>
          <BrewLog />
        </div>
      </div>
    </footer>
  );
}

function Cell({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="border-hairline-strong p-4 not-last:border-b sm:not-last:border-b-0 sm:not-last:border-r">
      <p className="text-pencil">{label}</p>
      <p className="mt-1.5 normal-case tracking-normal">{children}</p>
    </div>
  );
}
