"use client";

import TransitionLink from "@/components/motion/TransitionLink";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import Magnetic from "@/components/motion/Magnetic";
import { prefersReducedMotion } from "@/lib/gsapSetup";
import { profile } from "@/content/profile";

const nav = [
  { href: "/work", label: "Work" },
  { href: "/about", label: "About" },
];

const socials = [
  { href: profile.github, label: "GitHub", glyph: "GH" },
  { href: profile.linkedin, label: "LinkedIn", glyph: "in" },
];

/** Widest the bar is ever allowed to be, matching the page measure. */
const MAX_W = 1360;

/** Scroll movement below this is trackpad noise, not a direction. */
const DEADZONE = 4;

/** Breathing room between the name and the dots button when collapsed. */
const DOTS_GAP = 18;

/**
 * A floating capsule rather than a full width bar, so the hero canvas runs
 * behind and past it on every side.
 *
 * It sits inset from the right by more than the scroll rail's own offset, so
 * the two never overlap. The pill gains its border and blur once you have
 * scrolled off the hero; at the top it is almost invisible.
 *
 * Scrolling down collapses it to the brand alone. Scrolling up, returning to
 * the top, hovering it or moving focus into it brings the nav back. The width
 * is animated between two *measured* pixel values rather than from a class,
 * because a declared `max-w-[1360px]` is wider than the real bar on most
 * screens, and transitioning from it would sit still until it dropped below
 * the actual width.
 */
export default function Header() {
  const [lifted, setLifted] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [widths, setWidths] = useState<{ open: number; shut: number } | null>(null);
  const pathname = usePathname();

  const headerRef = useRef<HTMLElement | null>(null);
  const pillRef = useRef<HTMLDivElement | null>(null);
  const brandRef = useRef<HTMLAnchorElement | null>(null);
  const dotsRef = useRef<HTMLButtonElement | null>(null);

  // pointer and focus are tracked apart so that leaving with the mouse while a
  // link still holds focus does not release the bar
  const hovering = useRef(false);
  const focused = useRef(false);

  useEffect(() => {
    const header = headerRef.current;
    const pill = pillRef.current;
    const brand = brandRef.current;
    const dots = dotsRef.current;
    if (!header || !pill || !brand) return;

    const measure = () => {
      const cs = getComputedStyle(pill);
      // read the frame rather than duplicating it: the padding steps up at md
      // and the border only exists once the bar has lifted
      const frame =
        parseFloat(cs.paddingLeft) +
        parseFloat(cs.paddingRight) +
        parseFloat(cs.borderLeftWidth) +
        parseFloat(cs.borderRightWidth);

      // the dots button is absolutely positioned, so it never disturbs the
      // expanded layout, but the collapsed bar has to leave room for it
      const dotsW = dots ? dots.offsetWidth + DOTS_GAP : 0;

      setWidths({
        open: Math.min(MAX_W, header.clientWidth),
        shut: Math.ceil(brand.offsetWidth + dotsW + frame),
      });
    };

    measure();
    // the brand is watched too, because the display font arrives after first
    // paint and the name is measurably wider once it does
    const ro = new ResizeObserver(measure);
    ro.observe(header);
    ro.observe(brand);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    // a bar that resizes under you is the wrong thing to do to someone who
    // asked for less motion, so there it simply never collapses
    const reduced = prefersReducedMotion();
    let last = window.scrollY;

    const onScroll = () => {
      const y = window.scrollY;
      setLifted(y > 40);

      if (!reduced && !(hovering.current || focused.current)) {
        if (y < 80) setCollapsed(false);
        else if (y > last + DEADZONE) setCollapsed(true);
        else if (y < last - DEADZONE) setCollapsed(false);
      }

      // the reference only advances once the deadzone has actually been
      // cleared, so a slow drift still accumulates into a direction instead of
      // being swallowed one pixel at a time
      if (Math.abs(y - last) > DEADZONE) last = y;
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      ref={headerRef}
      className="pointer-events-none fixed inset-x-0 top-3 z-70 px-3 md:top-5 md:px-6"
      // Mouse only. `pointerenter` also fires on a tap, and a touch device may
      // never send the matching `pointerleave`, which would pin the bar open
      // for the rest of the session after a single stray tap.
      onPointerEnter={(e) => {
        if (e.pointerType !== "mouse") return;
        hovering.current = true;
        setCollapsed(false);
      }}
      onPointerLeave={(e) => {
        if (e.pointerType !== "mouse") return;
        hovering.current = false;
      }}
      /*
       * focusin/focusout in React's synthetic form, so tabbing into the hidden
       * nav is what reveals it. This is why the links are never `inert` or
       * `visibility: hidden` when collapsed: they have to stay focusable for
       * this to fire at all.
       *
       * Gated on `:focus-visible`, which is the difference between a keyboard
       * user who needs the bar held open and a click or tap that happens to
       * leave focus on a link. Without the gate, tapping any nav item pinned
       * the bar open for the rest of the page visit.
       */
      onFocus={(e) => {
        if (!(e.target instanceof Element) || !e.target.matches(":focus-visible")) return;
        focused.current = true;
        setCollapsed(false);
      }}
      onBlur={(e) => {
        if (e.currentTarget.contains(e.relatedTarget)) return;
        focused.current = false;
      }}
    >
      <div
        ref={pillRef}
        // deliberately not `page-shell`: its 60px desktop gutter is a page
        // measure, and inside a pill it just pushes the contents to the middle
        className={`rounded-chip pointer-events-auto relative mx-auto flex w-full max-w-[1360px] items-center justify-between gap-4 py-2.5 pr-2.5 pl-4 transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] md:py-3 md:pr-3 md:pl-5 ${
          lifted ? "border-line bg-bg/85 border backdrop-blur-xl" : "border border-transparent"
        }`}
        style={widths ? { maxWidth: collapsed ? widths.shut : widths.open } : undefined}
      >
        <TransitionLink
          ref={brandRef}
          href="/"
          // never compresses: its width is what the collapsed bar is measured
          // against, so letting it squeeze would chase its own target
          className="group flex shrink-0 items-center gap-3"
          aria-label={`${profile.name}, home`}
        >
          {/*
            The photo carries no alt text on purpose: the link around it is
            already labelled "Soorya Kumar, home", so describing the image
            again would announce the same person twice.
          */}
          <span className="relative block shrink-0">
            <Image
              src="/soorya-avatar.webp"
              alt=""
              width={128}
              height={128}
              priority
              className="ring-line-strong h-9 w-9 rounded-full object-cover ring-1 transition-shadow group-hover:ring-[var(--c-accent)] md:h-10 md:w-10"
            />
            {/*
              The dot is positioned by this wrapper rather than by itself:
              `.status-dot` declares `position: relative` for its own ripple
              pseudo element, and an `absolute` utility on the same element is
              a coin toss on stylesheet order.
            */}
            <span aria-hidden className="absolute right-0 bottom-0 block">
              <span className="status-dot status-dot--lg block" />
            </span>
          </span>
          {/* the name is dropped below sm: at 390px the pill cannot hold the
              monogram, the name, the nav and the CTA without wrapping, and the
              monogram already carries the identity */}
          <span className="display group-hover:text-accent hidden text-base whitespace-nowrap transition-colors sm:inline md:text-lg">
            {profile.name}
            <span className="text-accent">.</span>
          </span>
        </TransitionLink>

        {/*
          `min-w-0` is what lets this shrink past its content at all — a flex
          item defaults to `min-width: auto` and would otherwise hold the bar
          open. The clipping is only switched on while collapsed so that focus
          rings, which draw outside the box, are not shaved at rest.
        */}
        <div
          className={`min-w-0 transition-opacity duration-300 ${
            collapsed ? "overflow-hidden opacity-0" : "opacity-100"
          }`}
        >
          <nav
            aria-label="Primary"
            className={`flex items-center gap-4 md:gap-6 ${
              collapsed ? "pointer-events-none" : ""
            }`}
          >
            {nav.map((item) => {
              const active = pathname.startsWith(item.href);
              return (
                <TransitionLink
                  key={item.href}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={`link-sweep text-sm transition-colors ${
                    active ? "text-accent" : "text-muted hover:text-fg"
                  }`}
                >
                  {item.label}
                </TransitionLink>
              );
            })}

            <a
              href={profile.resume}
              className="link-sweep text-muted hover:text-fg hidden text-sm transition-colors sm:inline"
            >
              Résumé <span aria-hidden>↗</span>
            </a>

            <span aria-hidden className="bg-line hidden h-5 w-px sm:block" />

            <span className="hidden items-center gap-1.5 sm:flex">
              {socials.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={s.label}
                  className="border-line text-muted hover:border-accent hover:text-accent grid h-8 w-8 place-items-center rounded-full border font-mono text-[10px] transition-colors"
                >
                  <span aria-hidden>{s.glyph}</span>
                </a>
              ))}
            </span>

            <Magnetic>
              <a
                href={`mailto:${profile.email}`}
                className="border-line-strong hover:border-accent hover:text-accent rounded-chip inline-block border px-3 py-1.5 text-sm whitespace-nowrap transition-colors md:px-4"
              >
                Say hello
              </a>
            </Magnetic>
          </nav>
        </div>

        {/*
          The collapsed bar's only control. Absolutely positioned so it takes
          no part in the flex layout: the expanded bar is then untouched by it,
          and it can still be measured while invisible, which is what the
          collapsed width calculation needs.
        */}
        <button
          ref={dotsRef}
          type="button"
          aria-label="Show navigation"
          aria-expanded={!collapsed}
          onClick={() => setCollapsed(false)}
          className={`absolute top-1/2 right-2.5 flex -translate-y-1/2 items-center gap-1.5 rounded-full p-2 transition-opacity duration-300 md:right-3 ${
            collapsed ? "opacity-100" : "pointer-events-none opacity-0"
          }`}
        >
          {[0, 1, 2].map((i) => (
            <span key={i} aria-hidden className="bg-accent block h-1.5 w-1.5 rounded-full" />
          ))}
        </button>
      </div>
    </header>
  );
}
