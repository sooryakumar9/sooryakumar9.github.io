import type { ReactNode } from "react";
import { DrawnRule } from "@/components/motion/primitives";

/** SEC 0N / TITLE · the sheet header row every chapter opens with */
export function SheetMarker({
  num,
  title,
  right,
}: {
  num: string;
  title: string;
  right?: string;
}) {
  return (
    <div>
      <DrawnRule />
      <div className="flex items-baseline justify-between gap-4 pt-3">
      <p className="annotation">
        <span className="text-signal">SEC {num}</span>
        <span className="mx-2 text-pencil">/</span>
        {title}
      </p>
        {right ? <p className="annotation hidden text-pencil sm:block">{right}</p> : null}
      </div>
    </div>
  );
}

/** the recurring case-study grammar marker: CONTEXT, IDEA, SYSTEM … */
export function GrammarMarker({ label, index }: { label: string; index: string }) {
  return (
    <p className="annotation flex items-center gap-3 text-pencil">
      <span className="inline-block h-px w-6 bg-signal align-middle" aria-hidden />
      <span>
        {index} <span className="text-ink">{label}</span>
      </span>
    </p>
  );
}

/** |← label →| · a measured quantity drawn as a dimension line, never a stat card */
export function DimensionLine({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3 text-signal" role="figure" aria-label={label}>
      <span aria-hidden className="h-3 w-px bg-signal" />
      <span aria-hidden className="h-px flex-1 bg-signal" />
      <span className="annotation whitespace-nowrap text-signal">{label}</span>
      <span aria-hidden className="h-px flex-1 bg-signal" />
      <span aria-hidden className="h-3 w-px bg-signal" />
    </div>
  );
}

/** ● ——— note   a leader-line annotation pointing at something */
export function LeaderNote({
  children,
  live = false,
}: {
  children: ReactNode;
  live?: boolean;
}) {
  return (
    <p className="annotation flex items-start gap-2.5">
      <span
        aria-hidden
        className={`mt-[0.45em] flex items-center ${live ? "text-signal" : "text-pencil"}`}
      >
        <span className="block size-[5px] rounded-full bg-current" />
        <span className="block h-px w-5 bg-current" />
      </span>
      <span className={live ? "text-signal" : undefined}>{children}</span>
    </p>
  );
}

export function RevStamp({ children, draft = false }: { children: ReactNode; draft?: boolean }) {
  return <span className={`rev-stamp ${draft ? "rev-stamp--draft" : ""}`}>{children}</span>;
}
