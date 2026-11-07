"use client";

import { motion, type HTMLMotionProps } from "motion/react";
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
 * Images open with a short vertical wipe and settle from a slight zoom,
 * echoing the reset motion without competing with it.
 */
export function RevealMedia({
  children,
  delay = 0,
  className,
  from = "bottom",
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
  from?: "bottom" | "left" | "right";
}) {
  const start =
    from === "left" ? "inset(0% 100% 0% 0%)" : from === "right" ? "inset(0% 0% 0% 100%)" : "inset(18% 0% 0% 0%)";
  return (
    <motion.div
      className={className}
      initial={{ clipPath: start, opacity: from === "bottom" ? 0 : 1 }}
      whileInView={{ clipPath: "inset(0% 0% 0% 0%)", opacity: 1 }}
      viewport={VIEWPORT}
      transition={{ duration: 1.05, delay, ease: EASE }}
    >
      <motion.div
        className="relative h-full w-full"
        initial={{ scale: 1.06 }}
        whileInView={{ scale: 1 }}
        viewport={VIEWPORT}
        transition={{ duration: 1.4, delay, ease: EASE }}
      >
        {children}
      </motion.div>
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
