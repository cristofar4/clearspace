"use client";

import { motion, useReducedMotion, type HTMLMotionProps } from "motion/react";
import type { ReactNode } from "react";

const EASE = [0.22, 1, 0.36, 1] as const;
const VIEWPORT = { once: true, margin: "0px 0px -12% 0px" } as const;

/** Content rises gently into place the first time it enters the viewport. */
export function Reveal({
  children,
  delay = 0,
  y = 18,
  className,
  ...rest
}: { children: ReactNode; delay?: number; y?: number; className?: string } & HTMLMotionProps<"div">) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={VIEWPORT}
      transition={{ duration: 0.8, delay, ease: EASE }}
      {...rest}
    >
      {children}
    </motion.div>
  );
}

/**
 * Images are scanned into view: a beam travels across the frame and the
 * picture is revealed behind it, settling from a slight zoom. The same
 * motif as the hero, at a smaller scale. Reduced motion shows them at once.
 */
export function RevealMedia({
  children,
  delay = 0,
  className = "",
  from = "top",
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
  from?: "top" | "left";
}) {
  const reduce = useReducedMotion();
  if (reduce) return <div className={`relative ${className}`}>{children}</div>;
  const vertical = from === "top";
  const hidden = vertical ? "inset(0% 0% 100% 0%)" : "inset(0% 100% 0% 0%)";
  const wipe = { duration: 1.25, delay, ease: [0.6, 0, 0.3, 1] as const };
  return (
    <motion.div className={`relative ${className}`} initial="hidden" whileInView="shown" viewport={VIEWPORT}>
      <motion.div
        className="relative h-full w-full"
        variants={{ hidden: { clipPath: hidden }, shown: { clipPath: "inset(0% 0% 0% 0%)", transition: wipe } }}
      >
        <motion.div
          className="relative h-full w-full"
          variants={{ hidden: { scale: 1.07 }, shown: { scale: 1, transition: { duration: 1.6, delay, ease: EASE } } }}
        >
          {children}
        </motion.div>
      </motion.div>
      <motion.span
        aria-hidden="true"
        className={`pointer-events-none absolute z-10 ${vertical ? "scan-line inset-x-0 h-[2px]" : "scan-line-v inset-y-0 w-[2px]"}`}
        variants={{
          hidden: vertical ? { top: "0%", opacity: 0 } : { left: "0%", opacity: 0 },
          shown: {
            ...(vertical ? { top: "100%" } : { left: "100%" }),
            opacity: [0, 1, 1, 0],
            transition: {
              top: wipe,
              left: wipe,
              opacity: { duration: wipe.duration, delay, times: [0, 0.1, 0.85, 1] },
            },
          },
        }}
      />
    </motion.div>
  );
}

/**
 * Headings arrive line by line from behind a mask. Pass each visual line
 * separately so the break points are designed, not accidental.
 * The heading itself is observed (not the masked lines, which start fully
 * clipped and would never register as visible).
 */
export function RevealHeading({
  lines,
  as = "h2",
  className = "",
  id,
  tabIndex,
  delay = 0,
}: {
  lines: ReactNode[];
  as?: "h1" | "h2" | "h3";
  className?: string;
  id?: string;
  tabIndex?: number;
  delay?: number;
}) {
  const Tag = motionTags[as];
  return (
    <Tag
      className={className}
      id={id}
      tabIndex={tabIndex}
      initial="hidden"
      whileInView="show"
      viewport={VIEWPORT}
      variants={{ hidden: {}, show: { transition: { staggerChildren: 0.08, delayChildren: delay } } }}
    >
      {lines.map((line, i) => (
        <span key={i} className="block overflow-hidden pb-[0.08em] -mb-[0.08em]">
          <motion.span
            className="block"
            variants={{
              hidden: { y: "105%", opacity: 0 },
              show: { y: "0%", opacity: 1, transition: { duration: 0.9, ease: EASE } },
            }}
          >
            {line}
          </motion.span>
        </span>
      ))}
    </Tag>
  );
}

const motionTags = { h1: motion.h1, h2: motion.h2, h3: motion.h3 } as const;
