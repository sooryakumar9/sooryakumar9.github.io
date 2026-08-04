# Notes for anyone editing this

Moved out of the README so that file can stay short. These are the things that were expensive to
learn and are easy to undo by accident.

## Routes

| Route | What it is |
| --- | --- |
| `/` | Hero, marquee, intro, pinned featured-work rail, experience, bench, foundations |
| `/work` | The full body of work, filterable with a GSAP Flip re-layout |
| `/work/[slug]` | Eight statically generated case studies |
| `/about` | Long-form journey chapters and how I work |
| `/resume` | The résumé as a page, assembled from the same content the case studies use |

## Checking the export the way it will be served

```bash
npm run build
cd out && python3 -m http.server 6301
node scripts/shots.mjs --out shots            # screenshots + console/overflow report
node scripts/shots.mjs --reduced --out shots-reduced
```

`scripts/shots.mjs` walks every route at 1440 / 768 / 390 and reports console errors, failed
requests and horizontal overflow.

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

### Six things worth knowing before editing

**Fonts live on `<html>`, not `<body>`.** Tailwind declares `--font-display` on `:root`,
and a custom property is substituted where it is *declared*. If `--font-bricolage` were
only on `<body>`, `:root` would see it as undefined and the whole stack would silently
collapse to the browser default.

**Decorative layers never use a negative `z-index`.** Negative z-index paints beneath the
body's background box, which would hide them completely. `<body>` deliberately has no
background — `html` paints the page — and layers stack with explicit `z-0` / `z-10`.

**The hero is WebGL, the project canvases are 2D.** A fragment shader evaluates a field at
every pixel, so it renders volume — soft masses with interiors. Stamping strokes onto a 2D
canvas can only ever produce line art, however carefully it is tuned; that is the whole
reason `HeroField` exists separately from `Signature`. It renders at ~0.55 resolution scale
and is upscaled by CSS, and it falls back to the 2D `hero` program if WebGL is unavailable.

**`t` is clamped to zero in the engine, and that is load bearing.** The rAF timestamp is the
moment the frame *started*, so the first callback after a canvas attaches can arrive slightly
earlier than the `performance.now()` captured at attach. A negative `t` is harmless for
anything trigonometric — which is why it went unnoticed — but fatal for a program that
indexes an array, because `-1 % 4` is `-1` in JavaScript. That crashed `diavo` in dev.

**Canvas programs render at two levels of detail.** A work card is 380x160 and a case study
banner is 1240x420. Text comfortable on the banner lands around 8px on the card, so
`roomForLabels()` in `programs/shared.ts` gates every label and the small variant draws pills
and bars instead. No glyph is ever drawn below 10px.

**Generated image routes need a post-build step.** Under `output: "export"`,
`opengraph-image.tsx` and `apple-icon.tsx` emit *extensionless* files. A static host serves
by extension, so those go out as `application/octet-stream` and every social scraper refuses
them. `scripts/fix-image-routes.mjs` writes `.png` twins and repoints the exported HTML.

## Motion and accessibility

Everything scripted respects `prefers-reduced-motion`: the opening panel is skipped, the
canvases render a single settled frame instead of animating, the marquee holds still,
reveals resolve instantly, the featured rail stops pinning and becomes a plain snapping
scroller, and neither Lenis nor the cursor follower mounts at all.

Canvases are decorative and `aria-hidden`; every fact one of them gestures at also exists
as text. The featured rail and the filter grid are both operable from the keyboard.

There is exactly one page-transition system: `TransitionLink` wraps every internal
navigation in a View Transition. There used to be a slat wipe as well, on all routes except
project links, and running two side by side is what made navigation feel inconsistent.

The demos in `src/components/demos/` state their own limits in the UI: the fuzzy matcher is
real but its corpus is a labelled sample, and the cipher panel is an illustration of the
threat model rather than the project's cryptography. Do not quietly drop those captions.

No canvas may settle into a static state. Two of them previously converged and then held
still for seconds at a time, which is indistinguishable from a broken animation; anything
that resolves needs a continuing motion underneath it. `scripts/` has no permanent test for
this — sample a canvas repeatedly over ~8s if you change one.

Every canvas runs on its own clock. An earlier version drove some from scroll position,
which left project-page banners frozen until the visitor moved; the engine still pauses
anything outside the viewport, which is what keeps ten of them affordable.

Measured on the home page while scrolling: median 16.7ms (60fps) unthrottled, and median
25ms / p95 41ms at 6x CPU throttle, which approximates a mid-range phone.

Headless Chromium logs `GPU stall due to ReadPixels` warnings on pages carrying the WebGL
hero. That is a headless compositing artifact — a real browser logs none, and frame timing
is unaffected.
