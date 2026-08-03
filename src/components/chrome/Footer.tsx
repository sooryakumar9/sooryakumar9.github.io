import TransitionLink from "@/components/motion/TransitionLink";
import { profile } from "@/content/profile";

const menu = [
  { href: "/", label: "Home" },
  { href: "/work", label: "Work" },
  { href: "/about", label: "About" },
];

const connect = [
  { href: profile.github, label: "GitHub" },
  { href: profile.linkedin, label: "LinkedIn" },
  { href: profile.leetcode, label: "LeetCode" },
  { href: profile.resume, label: "Résumé", download: true },
];

export default function Footer() {
  return (
    <footer className="border-line border-t">
      <div className="page-shell grid gap-10 py-14 md:grid-cols-3 md:py-20">
        <nav aria-label="Footer">
          <h2 className="eyebrow mb-4">Menu</h2>
          <ul className="space-y-2">
            {menu.map((item) => (
              <li key={item.href}>
                <TransitionLink href={item.href} className="link-sweep text-muted hover:text-fg transition-colors">
                  {item.label}
                </TransitionLink>
              </li>
            ))}
          </ul>
        </nav>

        <div>
          <h2 className="eyebrow mb-4">Connect</h2>
          <ul className="space-y-2">
            {connect.map((item) => (
              <li key={item.label}>
                <a
                  href={item.href}
                  target={item.download ? undefined : "_blank"}
                  rel={item.download ? undefined : "noreferrer"}
                  className="link-sweep text-muted hover:text-fg transition-colors"
                >
                  {item.label} <span aria-hidden>↗</span>
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="eyebrow mb-4">Say hello</h2>
          <a
            href={`mailto:${profile.email}`}
            className="hover:text-accent block text-lg transition-colors"
          >
            {profile.email}
          </a>
          <p className="text-muted mt-3 flex items-center gap-2 text-sm">
            <span aria-hidden className="status-dot" />
            Available for work in {profile.location}
          </p>
        </div>
      </div>

      <div className="page-shell border-line flex flex-col gap-3 border-t py-6 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-muted text-xs">
          © {new Date().getFullYear()} {profile.name}. Built with Next.js, GSAP and a lot of coffee.
        </p>
        <a href="#main" className="text-muted hover:text-fg text-xs transition-colors">
          Back to top <span aria-hidden>↑</span>
        </a>
      </div>
    </footer>
  );
}
