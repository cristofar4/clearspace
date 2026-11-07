"use client";

import { motion, useMotionValueEvent, useTransform, type MotionValue } from "motion/react";
import { useEffect, useRef, useState } from "react";

/** Small seeded random, so the grime looks the same on every visit. */
function seeded(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

/**
 * A grime film painted once onto a canvas: soft stains, fine specks, and a few
 * smears across the glass. It is a visual effect laid over the real photo and
 * wiped away by the scan; it never replaces the photograph.
 */
export function GrimeLayer() {
  const [texture, setTexture] = useState<string | null>(null);

  useEffect(() => {
    const W = 1200;
    const H = 800;
    const c = document.createElement("canvas");
    c.width = W;
    c.height = H;
    const ctx = c.getContext("2d");
    if (!ctx) return;
    const rand = seeded(20261107);

    // broad stains
    for (let i = 0; i < 46; i++) {
      const x = rand() * W;
      const y = rand() * H;
      const r = 40 + rand() * 170;
      const g = ctx.createRadialGradient(x, y, 0, x, y, r);
      const a = 0.1 + rand() * 0.22;
      g.addColorStop(0, `rgba(88, 70, 45, ${a})`);
      g.addColorStop(0.6, `rgba(88, 70, 45, ${a * 0.45})`);
      g.addColorStop(1, "rgba(88, 70, 45, 0)");
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.ellipse(x, y, r, r * (0.5 + rand() * 0.6), rand() * Math.PI, 0, Math.PI * 2);
      ctx.fill();
    }
    // greasy band around the hob and hood (right side, mid height)
    const grease = ctx.createRadialGradient(W * 0.79, H * 0.45, 0, W * 0.79, H * 0.45, 220);
    grease.addColorStop(0, "rgba(96, 72, 40, 0.32)");
    grease.addColorStop(1, "rgba(96, 72, 40, 0)");
    ctx.fillStyle = grease;
    ctx.fillRect(0, 0, W, H);
    // smears on the window and the garden door
    ctx.lineCap = "round";
    for (const [cx, cy, w, h] of [
      [0.4, 0.37, 0.14, 0.2],
      [0.11, 0.5, 0.1, 0.34],
    ] as const) {
      for (let i = 0; i < 9; i++) {
        ctx.strokeStyle = `rgba(235, 228, 210, ${0.12 + rand() * 0.16})`;
        ctx.lineWidth = 4 + rand() * 10;
        const x0 = (cx - w / 2 + rand() * w) * W;
        const y0 = (cy - h / 2 + rand() * h) * H;
        ctx.beginPath();
        ctx.moveTo(x0, y0);
        ctx.quadraticCurveTo(x0 + 30 + rand() * 40, y0 - 20 + rand() * 40, x0 + 60 + rand() * 60, y0 + rand() * 30);
        ctx.stroke();
      }
    }
    // fine specks
    for (let i = 0; i < 2600; i++) {
      const x = rand() * W;
      const y = rand() * H;
      ctx.fillStyle = `rgba(52, 42, 30, ${0.12 + rand() * 0.35})`;
      ctx.fillRect(x, y, 1 + rand() * 1.6, 1 + rand() * 1.6);
    }
    // crumbs along worktops and floor
    for (let i = 0; i < 260; i++) {
      const band = rand() < 0.5 ? 0.6 : 0.88;
      const x = rand() * W;
      const y = (band + (rand() - 0.5) * 0.1) * H;
      ctx.fillStyle = `rgba(70, 55, 36, ${0.3 + rand() * 0.4})`;
      ctx.beginPath();
      ctx.arc(x, y, 0.8 + rand() * 1.8, 0, Math.PI * 2);
      ctx.fill();
    }
    // the texture is generated once, in the browser, from a seeded pattern
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTexture(c.toDataURL("image/png"));
  }, []);

  return (
    <div
      aria-hidden="true"
      className="absolute inset-0 mix-blend-multiply"
      style={{ backgroundImage: texture ? `url(${texture})` : undefined, backgroundSize: "100% 100%" }}
    />
  );
}

interface Mote {
  x: number;
  y: number;
  r: number;
  vx: number;
  vy: number;
  a: number;
  phase: number;
  gone: number;
}

/**
 * Dust hanging in the air. Motes drift slowly; once the scan line passes
 * them they lift, flare and dissolve. The loop stops when the air is clear.
 */
export function DustCanvas({ progress }: { progress: MotionValue<number> }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const rand = seeded(7);
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let W = 0;
    let H = 0;
    const resize = () => {
      W = canvas.clientWidth;
      H = canvas.clientHeight;
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    const motes: Mote[] = Array.from({ length: 60 }, () => ({
      x: rand(),
      y: rand(),
      r: 0.6 + rand() * 2.2,
      vx: (rand() - 0.5) * 0.012,
      vy: (rand() - 0.6) * 0.01,
      a: 0.25 + rand() * 0.55,
      phase: rand() * Math.PI * 2,
      gone: 0,
    }));

    let raf = 0;
    let last = performance.now();
    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const p = progress.get();
      ctx.clearRect(0, 0, W, H);
      let alive = 0;
      for (const m of motes) {
        m.phase += dt;
        m.x += (m.vx + Math.sin(m.phase * 0.8) * 0.004) * dt;
        m.y += m.vy * dt;
        if (m.y < p) m.gone = Math.min(1, m.gone + dt * 2.4);
        if (m.gone >= 1) continue;
        alive++;
        const lift = m.gone * 18;
        const flare = m.gone > 0 ? Math.sin(m.gone * Math.PI) * 1.8 : 0;
        const alpha = m.a * (1 - m.gone) + flare * 0.25;
        const x = m.x * W;
        const y = m.y * H - lift;
        const r = m.r * (1 + flare);
        const g = ctx.createRadialGradient(x, y, 0, x, y, r * 2.6);
        g.addColorStop(0, `rgba(255, 244, 222, ${Math.min(1, alpha)})`);
        g.addColorStop(1, "rgba(255, 244, 222, 0)");
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(x, y, r * 2.6, 0, Math.PI * 2);
        ctx.fill();
      }
      if (alive > 0) raf = requestAnimationFrame(tick);
      else ctx.clearRect(0, 0, W, H);
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [progress]);

  return <canvas ref={ref} aria-hidden="true" className="pointer-events-none absolute inset-0 h-full w-full" />;
}

/** The scanning beam: a bright line with a glow and a fine band of scan lines behind it. */
export function ScanBeam({ progress, visible }: { progress: MotionValue<number>; visible: boolean }) {
  const top = useTransform(progress, (v) => `${v * 100}%`);
  return (
    <motion.div
      aria-hidden="true"
      className="pointer-events-none absolute inset-x-0 z-[3]"
      style={{ top }}
      animate={{ opacity: visible ? 1 : 0 }}
      transition={{ duration: 0.35 }}
    >
      <div className="scan-band absolute inset-x-0 bottom-0 h-[16vh] max-h-40" />
      <div className="scan-line absolute inset-x-0 -top-px h-[2px]" />
    </motion.div>
  );
}

/** Live readout of the scan. Text updates without re-rendering React. */
export function ScanReadout({
  progress,
  phase,
}: {
  progress: MotionValue<number>;
  phase: "dirty" | "scanning" | "clean";
}) {
  const pct = useRef<HTMLSpanElement>(null);
  useMotionValueEvent(progress, "change", (v) => {
    if (pct.current) pct.current.textContent = `${Math.round(v * 100)}%`;
  });
  return (
    <motion.div
      aria-hidden="true"
      className="pointer-events-none absolute left-3 top-3 z-10 flex items-center gap-2 rounded-full bg-petrol-950/60 px-3 py-1.5 text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-porcelain-50 backdrop-blur-sm"
      initial={false}
      animate={{ opacity: phase === "clean" ? 0 : 1, y: phase === "clean" ? -6 : 0 }}
      transition={{ duration: 0.5, delay: phase === "clean" ? 1.6 : 0 }}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${phase === "scanning" ? "scan-dot bg-seaglass-300" : "bg-brass-300"}`}
      />
      {phase === "dirty" && <span>Ready to scan</span>}
      {phase === "scanning" && (
        <span>
          Scanning{" "}
          <span ref={pct} className="tabular-nums">
            0%
          </span>
        </span>
      )}
      {phase === "clean" && <span>Room reset</span>}
    </motion.div>
  );
}

const GLINTS = [
  { x: 41.5, y: 50.5, s: 1, d: 0.1 },
  { x: 76, y: 31, s: 1.25, d: 0.35 },
  { x: 55, y: 36, s: 0.8, d: 0.55 },
  { x: 62, y: 61, s: 0.9, d: 0.75 },
];

/** Four point glints on reflective surfaces once the room is clean. */
export function Glints({ show, run }: { show: boolean; run: number }) {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-[4]">
      {show &&
        GLINTS.map((g, i) => (
          <motion.svg
            key={`${run}-${i}`}
            viewBox="-10 -10 20 20"
            className="absolute h-8 w-8 -translate-x-1/2 -translate-y-1/2"
            style={{ left: `${g.x}%`, top: `${g.y}%` }}
            initial={{ scale: 0, rotate: -30, opacity: 0 }}
            animate={{ scale: [0, g.s, 0], rotate: [-30, 20, 45], opacity: [0, 1, 0] }}
            transition={{ duration: 1.1, delay: g.d, ease: "easeInOut" }}
          >
            <path d="M0 -10 L1.6 -1.6 L10 0 L1.6 1.6 L0 10 L-1.6 1.6 L-10 0 L-1.6 -1.6Z" fill="#FFF8EA" />
            <circle r="2.2" fill="#FFFFFF" />
          </motion.svg>
        ))}
    </div>
  );
}
