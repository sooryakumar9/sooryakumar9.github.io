"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import Magnetic from "@/components/motion/Magnetic";
import { profile } from "@/content/profile";

const nav = [
  { href: "/work", label: "Work" },
  { href: "/about", label: "About" },
];

/**
 * Sticky header. It sheds its background at the top of the page and picks up a
 * blurred panel once you have scrolled past the hero, so the hero canvas is
 * never sitting behind a bar.
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
    <header
      className={`fixed inset-x-0 top-0 z-70 transition-colors duration-500 ${
        // 72% left large light headings legible through the bar on mobile
        lifted ? "border-line bg-bg/88 border-b backdrop-blur-xl" : "border-b border-transparent"
      }`}
    >
      <div className="page-shell flex items-center justify-between py-4 md:py-5">
        <Link
          href="/"
          className="display hover:text-accent text-lg tracking-tight transition-colors md:text-xl"
        >
          {profile.name}
          <span className="text-accent">.</span>
        </Link>

        <nav aria-label="Primary" className="flex items-center gap-5 md:gap-8">
          {nav.map((item) => {
            const active = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`link-sweep text-sm transition-colors ${
                  active ? "text-accent" : "text-muted hover:text-fg"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
          <a
            href={profile.resume}
            className="link-sweep text-muted hover:text-fg hidden text-sm transition-colors sm:inline"
          >
            Résumé <span aria-hidden>↗</span>
          </a>
          <Magnetic>
            <a
              href={`mailto:${profile.email}`}
              className="border-line-strong hover:border-accent hover:text-accent rounded-chip inline-block border px-3 py-1.5 text-sm transition-colors md:px-4"
            >
              Say hello
            </a>
          </Magnetic>
        </nav>
      </div>
    </header>
  );
}
