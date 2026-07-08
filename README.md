# Soorya Kumar — Portfolio

**Concept: The Living Schematic.** The site is a single continuous engineering
document describing one system — Soorya. An orange signal line enters at the
top of the page, travels through every chapter as you scroll, and every
diagram it passes through comes alive. Case studies are drawn, not
screenshotted: the HILS control loop actually runs its LOAD → BUILD → EXECUTE
sequence, the RAG pipeline actually retrieves, the Q-Secure channel actually
re-keys.

Art direction: warm engineering paper (`#f4f1ea`) + fine ink (`#16150f`) +
one accent — signal orange (`#e8501a` for strokes, `#c03d08` for text, AA
compliant). If it's orange, it's alive. The Q-Secure chapter inverts to ink.

## Stack

Next.js (App Router, static prerender) · TypeScript · Tailwind CSS v4 ·
Motion (Framer Motion) · Lenis. No Three.js — the concept is a living 2D
document. Fonts: Archivo (variable width), IBM Plex Mono, Instrument Serif,
self-hosted via `next/font`.

## Commands

```bash
npm run dev      # develop
npm run build    # production build (static)
npm run start    # serve production build
npm run lint     # eslint
```

## Structure

```
src/
  app/                 layout, page, globals.css (design tokens), OG image
  components/
    chapters/          one component per sheet: SignalHero, Operator,
                       FieldRecords (experience), CaseFiles, Bench, Graph,
                       TitleBlock + ChannelSelector (contact finale)
    diagrams/          the living diagrams: HilsLoop, RagPipeline,
                       SecureChannel, PolicyGate, BenchSchematics
    motion/            primitives: DrawPath, SetLines, Settle,
                       useReducedMotionSafe / useMediaQuery, SmoothScroll
    chrome/            SignalRail (scroll-linked line), SiteChrome
                       (header + sheet index), CursorLabel
    ui/                schematic vocabulary: SheetMarker, GrammarMarker,
                       DimensionLine, LeaderNote, RevStamp
  content/             ALL copy and data — typed. Edit here, not in components.
  lib/                 sheets index, capability-graph derivation
```

## Adding a project

1. Add an entry to `src/content/projects.ts` (completed work) or
   `src/content/bench.ts` (work in progress).
2. For a completed project, point `diagram` at an existing diagram component
   or add a new one in `components/diagrams/` and register it in
   `CaseFiles.tsx`.
3. The capability graph (`lib/graph.ts`) picks up new tech edges
   automatically; give new technologies a tuned position in `TECH_POS`.

Bench projects carry three honest layers — `exists` (inked), `building`
(dashed), `exploring` (pencil). Don't put anything in `exists` that isn't.

## Conventions

- Motion grammar: strokes **draw**, data **flows**, type **sets** (masked,
  never faded), controls **snap**. Nothing floats.
- `prefers-reduced-motion`: every primitive renders fully drawn and static.
- Content accuracy rules: no CGPA or phone number on the page (phone lives
  only inside `public/SooryaKumar-Resume.pdf`); project "source" actions are
  real repo URLs or an honest non-clickable note — never the GitHub profile;
  Madhu-Marga's Hive Doctor is a rule-based decision-support engine, never
  described as ML/AI.
- Remaining placeholders: production domain (`layout.tsx`, `sitemap.ts`,
  `robots.ts`), MindMatrix internship dates, Diavo deployment URL
  (`bench.ts` — `deployment` flips from `pending` to `live`).

## Quality gates (last verified)

Lighthouse desktop 100/100/100/100; mobile 90 perf (LCP bound by the
intentional opening reveal) with CLS 0, a11y/BP/SEO 100. Playwright is a
devDependency for visual QA scripts. Dev server runs on port 5000.
