"use client";

import { motion, useInView, type SVGMotionProps } from "motion/react";
import {
  useCallback,
  useRef,
  useSyncExternalStore,
  type CSSProperties,
  type ElementType,
  type ReactNode,
} from "react";

export const PLOT_EASE = [0.65, 0, 0.35, 1] as const;
export const SET_EASE = [0.22, 1, 0.36, 1] as const;

/**
 * Hydration-safe media query: false on the server (and during hydration),
 * the real value immediately after.
 */
export function useMediaQuery(query: string): boolean {
  const subscribe = useCallback(
    (onChange: () => void) => {
      const mq = window.matchMedia(query);
      mq.addEventListener("change", onChange);
      return () => mq.removeEventListener("change", onChange);
    },
    [query],
  );
  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(query).matches,
    () => false,
  );
}

/** true when the visitor asked for reduced motion — every primitive respects it */
export function useReducedMotionSafe(): boolean {
  return useMediaQuery("(prefers-reduced-motion: reduce)");
}

/**
 * Draw — an SVG path that draws itself in like a plotter stroke.
 * Reduced motion: rendered fully drawn.
 */
export function DrawPath({
  delay = 0,
  duration = 0.9,
  once = true,
  amount = 0.5,
  ...path
}: SVGMotionProps<SVGPathElement> & {
  delay?: number;
  duration?: number;
  once?: boolean;
  amount?: number;
}) {
  const reduced = useReducedMotionSafe();
  if (reduced) return <motion.path {...path} />;
  return (
    <motion.path
      initial={{ pathLength: 0 }}
      whileInView={{ pathLength: 1 }}
      viewport={{ once, amount }}
      transition={{ delay, duration, ease: PLOT_EASE }}
      {...path}
    />
  );
}

/**
 * Set — type sets like print: masked, line by line, tight and fast.
 * Reduced motion: rendered set.
 */
export function SetLines({
  lines,
  as: Tag = "p",
  className,
  lineClassName,
  delay = 0,
  stagger = 0.09,
  style,
}: {
  lines: string[];
  as?: ElementType;
  className?: string;
  lineClassName?: string;
  delay?: number;
  stagger?: number;
  style?: CSSProperties;
}) {
  const reduced = useReducedMotionSafe();
  // observe the un-translated wrapper — the masked spans start clipped out of
  // view, so an observer on the spans themselves would never fire
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.3 });
  return (
    <Tag className={className} style={style} ref={ref as React.Ref<never>}>
      {lines.map((line, i) => (
        <span key={i} className="block overflow-hidden">
          {reduced ? (
            // plain element — transforms are disabled under reduced motion,
            // so a motion.span would stay stuck at its initial offset
            <span className={`block ${lineClassName ?? ""}`}>{line}</span>
          ) : (
            <motion.span
              className={`block ${lineClassName ?? ""}`}
              initial={{ y: "110%" }}
              animate={inView ? { y: "0%" } : undefined}
              transition={{
                delay: delay + i * stagger,
                duration: 0.7,
                ease: SET_EASE,
              }}
            >
              {line}
            </motion.span>
          )}
        </span>
      ))}
    </Tag>
  );
}

/**
 * DrawnRule — a horizontal hairline that plots itself in, left to right.
 * Used for sheet-marker rules so each chapter opens like a fresh sheet.
 */
export function DrawnRule() {
  const reduced = useReducedMotionSafe();
  const style = { background: "var(--c-hairline-strong)" };
  if (reduced) return <div aria-hidden className="h-px w-full" style={style} />;
  return (
    <motion.div
      aria-hidden
      className="h-px w-full origin-left"
      style={style}
      initial={{ scaleX: 0 }}
      whileInView={{ scaleX: 1 }}
      viewport={{ once: true, amount: 1 }}
      transition={{ duration: 0.9, ease: PLOT_EASE }}
    />
  );
}

/**
 * Settle — content settles into place with a small, fast shift.
 * Used sparingly; nothing on this site floats.
 */
export function Settle({
  children,
  delay = 0,
  className,
  amount = 0.4,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
  amount?: number;
}) {
  const reduced = useReducedMotionSafe();
  if (reduced) return <div className={className}>{children}</div>;
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount }}
      transition={{ delay, duration: 0.6, ease: SET_EASE }}
    >
      {children}
    </motion.div>
  );
}
