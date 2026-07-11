"use client";

import { useRef } from "react";
import { motion, useInView } from "motion/react";
import { profile } from "@/content/profile";
import { SET_EASE, useReducedMotionSafe } from "@/components/motion/primitives";

/**
 * The transmission routes. The signal has travelled the whole document to
 * get here; each row is a live channel out. Rows activate in sequence as
 * the section enters view, then the system reports ready.
 */

const CHANNELS = [
  {
    id: "email",
    name: "EMAIL",
    status: "AVAILABLE",
    action: "COMPOSE",
    href: `mailto:${profile.email}`,
    detail: profile.email,
    external: false,
  },
  {
    id: "github",
    name: "GITHUB",
    status: "PUBLIC",
    action: "INSPECT BUILDS",
    href: profile.github,
    detail: "github.com/sooryakumar9",
    external: true,
  },
  {
    id: "linkedin",
    name: "LINKEDIN",
    status: "ACTIVE",
    action: "OPEN PROFILE",
    href: profile.linkedin,
    detail: "in/soorya-84434b137",
    external: true,
  },
  {
    id: "leetcode",
    name: "LEETCODE",
    status: "IN TRAINING",
    action: "REVIEW SOLUTIONS",
    href: profile.leetcode,
    detail: "leetcode.com/u/sooryakumar9",
    external: true,
  },
  {
    id: "resume",
    name: "RÉSUMÉ",
    status: "CURRENT",
    action: "ACCESS PDF",
    href: profile.resume,
    detail: "one page, current",
    external: true,
  },
] as const;

export default function ChannelSelector() {
  const reduced = useReducedMotionSafe();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.3 });
  const on = reduced || inView;

  return (
    <div ref={ref}>
      <p className="annotation text-pencil">SELECT TRANSMISSION ROUTE</p>

      <ul className="mt-4 border-t border-hairline-strong" role="list">
        {CHANNELS.map((ch, i) => (
          <motion.li
            key={ch.id}
            initial={reduced ? false : { opacity: 0, x: -14 }}
            animate={on ? { opacity: 1, x: 0 } : undefined}
            transition={{
              delay: reduced ? 0 : 0.15 + i * 0.12,
              duration: reduced ? 0 : 0.45,
              ease: SET_EASE,
            }}
          >
            <a
              href={ch.href}
              {...(ch.external
                ? { target: "_blank", rel: "noopener noreferrer" }
                : {})}
              data-cursor="TRANSMIT"
              className="group flex items-baseline gap-x-4 border-b border-hairline py-4 transition-colors duration-150 hover:bg-signal-soft sm:px-3"
            >
              <span className="annotation flex w-24 shrink-0 items-center gap-2.5 sm:w-28">
                <span
                  aria-hidden
                  className="block size-[6px] shrink-0 rounded-full bg-pencil transition-colors duration-150 group-hover:bg-signal"
                />
                {ch.name}
              </span>
              <span className="annotation hidden flex-1 whitespace-nowrap text-pencil sm:block">
                STATUS: {ch.status}
              </span>
              <span className="annotation ml-auto whitespace-nowrap text-signal">
                <span className="link-draw">{ch.action}</span>&nbsp;↗
              </span>
            </a>
          </motion.li>
        ))}
      </ul>

      <motion.p
        className="annotation mt-5 text-signal"
        aria-live="polite"
        initial={reduced ? false : { opacity: 0 }}
        animate={on ? { opacity: 1 } : undefined}
        transition={{ delay: reduced ? 0 : 0.15 + CHANNELS.length * 0.12 + 0.3, duration: 0.5 }}
      >
        ● CHANNELS OPEN · SYSTEM READY FOR NEW INPUT
      </motion.p>
    </div>
  );
}
