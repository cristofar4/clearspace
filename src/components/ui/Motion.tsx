"use client";

import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { useEffect, useRef, useState, type ReactNode } from "react";

/**
 * Gleam: a light passes once through an italic heading word when it comes
 * into view. Change `trigger` to run it again (the hero does this the moment
 * the room is clean).
 */
export function Gleam({
  children,
  className = "",
  trigger = 0,
}: {
  children: ReactNode;
  className?: string;
  trigger?: number;
}) {
  return (
    <GleamInner key={trigger} className={className}>
      {children}
    </GleamInner>
  );
}

function GleamInner({ children, className }: { children: ReactNode; className: string }) {
  const [run, setRun] = useState(false);
  return (
    <motion.em
      className={`serif-italic gleam ${className}`}
      data-run={run}
      onViewportEnter={() => setRun(true)}
      viewport={{ once: true, margin: "0px 0px -15% 0px" }}
    >
      {children}
    </motion.em>
  );
}

/**
 * A soft light that follows the pointer across a dark panel. Hover devices
 * only; nothing renders for touch or reduced motion.
 */
export function PointerGlow() {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  useEffect(() => {
    const glow = ref.current;
    const host = glow?.parentElement;
    if (!glow || !host || reduce || !window.matchMedia("(hover: hover)").matches) return;
    let raf = 0;
    const move = (e: PointerEvent) => {
      const r = host.getBoundingClientRect();
      const x = e.clientX - r.left;
      const y = e.clientY - r.top;
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        glow.style.setProperty("--px", `${x}px`);
        glow.style.setProperty("--py", `${y}px`);
        glow.style.opacity = "1";
      });
    };
    const leave = () => {
      glow.style.opacity = "0";
    };
    host.addEventListener("pointermove", move);
    host.addEventListener("pointerleave", leave);
    return () => {
      cancelAnimationFrame(raf);
      host.removeEventListener("pointermove", move);
      host.removeEventListener("pointerleave", leave);
    };
  }, [reduce]);
  return <div ref={ref} aria-hidden="true" className="pointer-glow" />;
}

/**
 * Gentle depth: the image drifts a few percent against the scroll. Fill the
 * parent; the parent must be positioned and clip its overflow.
 */
export function Parallax({ children, amount = 6 }: { children: ReactNode; amount?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [`-${amount}%`, `${amount}%`]);
  return (
    <div ref={ref} className="absolute inset-0 overflow-hidden">
      <motion.div className="absolute inset-x-0 -inset-y-[9%]" style={{ y: reduce ? 0 : y }}>
        {children}
      </motion.div>
    </div>
  );
}

/**
 * The footer wordmark, scanned clean as it comes into view: a dusty, blurred
 * layer below and a crisp layer revealed behind a moving beam.
 */
export function ScannedWordmark({ text }: { text: string }) {
  const reduce = useReducedMotion();
  // Drawn as SVG text: decorative, fitted to the width, and never read as body copy
  const word = (
    <svg viewBox="0 0 1000 118" className="block h-auto w-full" aria-hidden="true" focusable="false">
      <text
        x="500"
        y="100"
        textAnchor="middle"
        textLength="990"
        lengthAdjust="spacing"
        fontSize="116"
        fontWeight="500"
        fill="currentColor"
      >
        {text}
      </text>
    </svg>
  );
  if (reduce) {
    return (
      <div aria-hidden="true" className="relative select-none text-porcelain-50/12">
        {word}
      </div>
    );
  }
  return (
    <motion.div
      aria-hidden="true"
      className="relative select-none"
      initial="dusty"
      whileInView="clean"
      viewport={{ once: true, margin: "0px 0px -10% 0px" }}
    >
      <div className="text-porcelain-50/[0.07] blur-[3px]">{word}</div>
      <motion.div
        className="absolute inset-0 text-porcelain-50/[0.16]"
        variants={{ dusty: { clipPath: "inset(0% 100% 0% 0%)" }, clean: { clipPath: "inset(0% 0% 0% 0%)" } }}
        transition={{ duration: 1.8, ease: [0.6, 0, 0.3, 1], delay: 0.2 }}
      >
        {word}
      </motion.div>
      <motion.span
        className="scan-line-v absolute inset-y-[-10%] w-[2px]"
        variants={{
          dusty: { left: "0%", opacity: 0 },
          clean: {
            left: "100%",
            opacity: [0, 1, 1, 0],
            transition: {
              left: { duration: 1.8, ease: [0.6, 0, 0.3, 1], delay: 0.2 },
              opacity: { duration: 1.8, delay: 0.2, times: [0, 0.08, 0.92, 1] },
            },
          },
        }}
      />
    </motion.div>
  );
}
