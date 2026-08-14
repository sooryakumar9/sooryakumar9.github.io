/**
 * The travelling light around a card's border.
 *
 * This exists as a real element rather than a pseudo-element for one reason:
 * the mask has to stay still while the gradient turns. It used to be a single
 * `::before` whose `conic-gradient` was animated through a registered
 * `--tech-angle` property, and animating a custom property is not compositable
 * — every frame was a style recalc plus a full repaint of the gradient through
 * a dual layer mask. On the home page one card is always active, so that repaint
 * ran the entire time a visitor was scrolling: measured at 140ms of paint per
 * 1.4s of scroll, most of the page's paint budget for a detail on one border.
 *
 * Now the gradient is static and a transform rotates it inside the masked box,
 * which the compositor handles without repainting anything. Same effect, and
 * paint drops to the same figure as removing it outright.
 *
 * Purely decorative, so it is hidden from assistive technology.
 */
export default function TechRing() {
  return <span aria-hidden className="tech-ring" />;
}
