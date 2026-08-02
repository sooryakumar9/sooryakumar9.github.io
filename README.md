# Portfolio

Personal site for Soorya Kumar — a dark, motion-heavy, four-route portfolio built as a
Next.js static export for GitHub Pages.

## Stack

- **Next.js 16** with `output: "export"` and `trailingSlash: true`, so every route emits
  its own `index.html` and GitHub Pages resolves `/work` without extension guessing.
- **React 19**, **TypeScript**, **Tailwind CSS v4**.
- **GSAP 3** with ScrollTrigger, Observer, Flip and SplitText — all included in the free
  standard licence.
- **Lenis** for smooth scrolling, driven from GSAP's ticker so scroll position and every
  ScrollTrigger read land in the same frame.

## Routes

| Route | What it is |
| --- | --- |
| `/` | Hero, marquee, intro, pinned featured-work rail, experience, bench, foundations |
| `/work` | The full body of work, filterable with a GSAP Flip re-layout |
| `/work/[slug]` | Eight statically generated case studies |
| `/about` | Long-form journey chapters and how I work |

## Commands

```bash
npm install
npm run dev     # http://localhost:6300
npm run build   # static export into out/
npm run lint
```

To check the export the way it will actually be served:

```bash
npm run build
cd out && python3 -m http.server 6301
node scripts/shots.mjs --out shots            # screenshots + console/overflow report
node scripts/shots.mjs --reduced --out shots-reduced
```

`scripts/shots.mjs` walks every route at 1440 / 768 / 390 and fails if it finds a console
error, a failed request or horizontal overflow.

## Structure

```
src/content/      all copy and facts, no strings in components
src/components/
  chrome/         preloader, header, cursor, CTA, footer
  motion/         Lenis, the shared reveal, marquee
  signature/      the generative canvas engine and its nine programs
  sections/       page sections
src/lib/          GSAP setup, media-query hooks
```

### Two things worth knowing before editing

**Fonts live on `<html>`, not `<body>`.** Tailwind declares `--font-display` on `:root`,
and a custom property is substituted where it is *declared*. If `--font-bricolage` were
only on `<body>`, `:root` would see it as undefined and the whole stack would silently
collapse to the browser default.

**Decorative layers never use a negative `z-index`.** Negative z-index paints beneath the
body's background box, which would hide them completely. `<body>` deliberately has no
background — `html` paints the page — and layers stack with explicit `z-0` / `z-10`.

## Motion and accessibility

Everything scripted respects `prefers-reduced-motion`: the opening panel is skipped, the
canvases render a single settled frame instead of animating, the marquee holds still,
reveals resolve instantly, the featured rail stops pinning and becomes a plain snapping
scroller, and neither Lenis nor the cursor follower mounts at all.

Canvases are decorative and `aria-hidden`; every fact one of them gestures at also exists
as text. The featured rail and the filter grid are both operable from the keyboard.
