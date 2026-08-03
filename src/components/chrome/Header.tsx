"use client";

import TransitionLink from "@/components/motion/TransitionLink";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import Magnetic from "@/components/motion/Magnetic";
import { profile } from "@/content/profile";

const nav = [
  { href: "/work", label: "Work" },
  { href: "/about", label: "About" },
];

const socials = [
  { href: profile.github, label: "GitHub", glyph: "GH" },
  { href: profile.linkedin, label: "LinkedIn", glyph: "in" },
];

/**
 * A floating capsule rather than a full width bar, so the hero canvas runs
 * behind and past it on every side.
 *
 * It sits inset from the right by more than the scroll rail's own offset, so
 * the two never overlap. The pill gains its border and blur once you have
 * scrolled off the hero; at the top it is almost invisible.
 */
export default function Header() {
  const [lifted, setLifted] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setLifted(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className="pointer-events-none fixed inset-x-0 top-3 z-70 px-3 md:top-5 md:px-6">
      <div
        // deliberately not `page-shell`: its 60px desktop gutter is a page
        // measure, and inside a pill it just pushes the contents to the middle
        className={`rounded-chip pointer-events-auto mx-auto flex max-w-[1360px] items-center justify-between gap-4 py-2.5 pr-2.5 pl-4 transition-all duration-500 md:py-3 md:pr-3 md:pl-5 ${
          lifted
            ? "border-line bg-bg/85 border backdrop-blur-xl"
            : "border border-transparent"
        }`}
      >
        <TransitionLink
          href="/"
          className="group flex items-center gap-3"
          aria-label={`${profile.name} — home`}
        >
          {/* monogram stands in for the avatar the design would otherwise use */}
          <span
            aria-hidden
            className="border-line-strong text-accent grid h-8 w-8 shrink-0 place-items-center rounded-full border font-mono text-[11px] tracking-tight transition-colors group-hover:border-[var(--c-accent)]"
          >
            SK
          </span>
          {/* the name is dropped below sm: at 390px the pill cannot hold the
              monogram, the name, the nav and the CTA without wrapping, and the
              monogram already carries the identity */}
          <span className="display group-hover:text-accent hidden text-base whitespace-nowrap transition-colors sm:inline md:text-lg">
            {profile.name}
            <span className="text-accent">.</span>
          </span>
        </TransitionLink>

        <nav aria-label="Primary" className="flex items-center gap-4 md:gap-6">
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
    </header>
  );
}
