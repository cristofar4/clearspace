"use client";

/**
 * Procedural lightning, drawn on a canvas in real time.
 *
 * A bolt is never a fixed shape: every frame its path is regenerated with a
 * fresh jagged offset, so it crackles. Bolts follow the exact outline of the
 * element they sit in (any width, height and corner radius, even while the
 * element is animating), throw short forks outward and shed sparks.
 *
 * Everything is decorative (aria-hidden), runs only for about a second per
 * strike, and never runs with reduced motion.
 */
import { useReducedMotion } from "motion/react";
import { useEffect, useRef } from "react";

type Pt = { x: number; y: number };
type Sample = Pt & { nx: number; ny: number };

const TAU = Math.PI * 2;

/* ---------- geometry: a rounded rectangle walked by arc length ---------- */

function outline(x: number, y: number, w: number, h: number, radius: number) {
  const r = Math.max(0, Math.min(radius, w / 2, h / 2));
  const straightW = w - 2 * r;
  const straightH = h - 2 * r;
  const arc = (Math.PI / 2) * r;
  const segs = [straightW, arc, straightH, arc, straightW, arc, straightH, arc];
  const total = segs.reduce((a, b) => a + b, 0);

  /** Point and outward normal at distance s along the outline, starting top left after the corner. */
  const at = (sIn: number): Sample => {
    let s = ((sIn % total) + total) % total;
    // top edge, left to right
    if (s < segs[0]) return { x: x + r + s, y, nx: 0, ny: -1 };
    s -= segs[0];
    if (s < segs[1]) return corner(x + w - r, y + r, -Math.PI / 2 + s / Math.max(r, 0.001));
    s -= segs[1];
    if (s < segs[2]) return { x: x + w, y: y + r + s, nx: 1, ny: 0 };
    s -= segs[2];
    if (s < segs[3]) return corner(x + w - r, y + h - r, s / Math.max(r, 0.001));
    s -= segs[3];
    if (s < segs[4]) return { x: x + w - r - s, y: y + h, nx: 0, ny: 1 };
    s -= segs[4];
    if (s < segs[5]) return corner(x + r, y + h - r, Math.PI / 2 + s / Math.max(r, 0.001));
    s -= segs[5];
    if (s < segs[6]) return { x, y: y + h - r - s, nx: -1, ny: 0 };
    s -= segs[6];
    return corner(x + r, y + r, Math.PI + s / Math.max(r, 0.001));
  };
  const corner = (cx: number, cy: number, a: number): Sample => ({
    x: cx + Math.cos(a) * r,
    y: cy + Math.sin(a) * r,
    nx: Math.cos(a),
    ny: Math.sin(a),
  });
  return { at, total };
}

/* ---------- drawing ---------- */

interface Palette {
  glow: string;
  mid: string;
  core: string;
  halo: string;
}

const PALETTE: Palette = {
  glow: "rgba(232, 176, 82, 0.4)",
  mid: "#3fbf9b",
  core: "#ffffff",
  halo: "rgba(244, 196, 100, 0.95)",
};

function strokeBolt(ctx: CanvasRenderingContext2D, pts: Pt[], scale: number, alpha: number, p = PALETTE) {
  if (pts.length < 2 || alpha <= 0) return;
  const trace = () => {
    ctx.beginPath();
    ctx.moveTo(pts[0].x, pts[0].y);
    for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y);
  };
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  // wide warm glow
  ctx.shadowColor = p.halo;
  ctx.shadowBlur = 12 * scale;
  ctx.strokeStyle = p.glow;
  ctx.lineWidth = 4.5 * scale;
  trace();
  ctx.stroke();
  // electric body
  ctx.shadowColor = "rgba(127, 224, 192, 0.95)";
  ctx.shadowBlur = 9 * scale;
  ctx.strokeStyle = p.mid;
  ctx.lineWidth = 2.4 * scale;
  trace();
  ctx.stroke();
  // white hot core
  ctx.shadowBlur = 0;
  ctx.strokeStyle = p.core;
  ctx.lineWidth = 1.1 * scale;
  trace();
  ctx.stroke();
  ctx.restore();
}

/** A jagged path between two points (midpoint displacement). */
function jagged(a: Pt, b: Pt, spread: number, depth: number, out: Pt[] = [a]): Pt[] {
  if (depth === 0) {
    out.push(b);
    return out;
  }
  const mx = (a.x + b.x) / 2;
  const my = (a.y + b.y) / 2;
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const len = Math.hypot(dx, dy) || 1;
  const off = (Math.random() - 0.5) * spread;
  const m = { x: mx + (-dy / len) * off, y: my + (dx / len) * off };
  jagged(a, m, spread / 2, depth - 1, out);
  return jagged(m, b, spread / 2, depth - 1, out);
}

interface Fork {
  pts: Pt[];
  born: number;
  life: number;
}
interface Spark {
  x: number;
  y: number;
  vx: number;
  vy: number;
  born: number;
  life: number;
  size: number;
}

/** Smaller, quicker lightning for buttons on hover. */
export const BUTTON_BOLT: StrikeOptions = { scale: 0.5, duration: 0.6, trail: 0.24, strike: false };

export interface StrikeOptions {
  /** Seconds for the bolts to travel the outline. */
  duration?: number;
  /** Size of everything; 1 for the nav, smaller for buttons. */
  scale?: number;
  /** Length of each bolt's crackling trail, as a share of the outline. */
  trail?: number;
  /** Strike from above at the start. */
  strike?: boolean;
}

/**
 * Lightning around the outline of the parent element.
 * Re-runs every time `trigger` changes (and once on mount if `onMount`).
 */
export function LightningOutline({
  trigger,
  onMount = true,
  hover = false,
  options,
}: {
  trigger?: string | number;
  onMount?: boolean;
  /** Also strike when the pointer enters or keyboard focus arrives. */
  hover?: boolean;
  options?: StrikeOptions;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reduce = useReducedMotion();
  const runRef = useRef<(() => void) | null>(null);
  const first = useRef(true);
  const opts = useRef(options);

  // The engine: set up once, run on demand
  useEffect(() => {
    const canvas = canvasRef.current;
    const host = canvas?.parentElement;
    if (!canvas || !host || reduce) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const o = { duration: 1.05, scale: 1, trail: 0.16, strike: true, ...opts.current };
    const M = 34 * o.scale; // canvas margin so glow and forks can spill outside
    let raf = 0;
    let running = false;

    const run = () => {
      cancelAnimationFrame(raf);
      running = true;
      const t0 = performance.now();
      const forks: Fork[] = [];
      const sparks: Spark[] = [];
      const strikeAt = Math.random();
      let burst = false;

      const frame = (now: number) => {
        const t = (now - t0) / 1000;
        const rect = host.getBoundingClientRect();
        const W = rect.width + M * 2;
        const H = rect.height + M * 2;
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        const pw = Math.round(W * dpr);
        const ph = Math.round(H * dpr);
        if (canvas.width !== pw || canvas.height !== ph) {
          canvas.width = pw;
          canvas.height = ph;
          canvas.style.width = `${W}px`;
          canvas.style.height = `${H}px`;
        }
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.clearRect(0, 0, W, H);

        const radius = parseFloat(getComputedStyle(host).borderTopLeftRadius) || 0;
        const shape = outline(M, M, rect.width, rect.height, radius);
        const L = shape.total;
        // strike lands on the top edge
        const s0 = (rect.width - 2 * Math.min(radius, rect.height / 2)) * (0.15 + strikeAt * 0.7);

        const travel = Math.min(1, t / o.duration);
        const ease = travel < 0.5 ? 4 * travel ** 3 : 1 - (-2 * travel + 2) ** 3 / 2;
        const fade = t > o.duration ? Math.max(0, 1 - (t - o.duration) / 0.28) : 1;
        const flicker = 0.75 + Math.random() * 0.25;

        // 1. the strike from above, and the whole outline briefly charged
        if (o.strike && t < 0.18) {
          const hit = shape.at(s0);
          const from = { x: hit.x + (Math.random() - 0.5) * 30 * o.scale, y: 0 };
          strokeBolt(ctx, jagged(from, hit, 22 * o.scale, 4), o.scale, (1 - t / 0.18) * flicker);
          const g = ctx.createRadialGradient(hit.x, hit.y, 0, hit.x, hit.y, 40 * o.scale);
          g.addColorStop(0, `rgba(255, 246, 221, ${0.6 * (1 - t / 0.18)})`);
          g.addColorStop(1, "rgba(255, 246, 221, 0)");
          ctx.fillStyle = g;
          ctx.fillRect(hit.x - 40 * o.scale, hit.y - 40 * o.scale, 80 * o.scale, 80 * o.scale);
        }
        if (t < 0.26) {
          const pts: Pt[] = [];
          const step = 14 * o.scale;
          for (let s = 0; s <= L; s += step) {
            const p = shape.at(s0 + s);
            const off = (Math.random() - 0.5) * 3 * o.scale;
            pts.push({ x: p.x + p.nx * off, y: p.y + p.ny * off });
          }
          strokeBolt(ctx, pts, o.scale * 0.5, 0.2 * (1 - t / 0.26) * flicker);
        }

        // 2. two bolts race the outline in opposite directions
        const trailLen = L * o.trail;
        for (const dir of [1, -1]) {
          const head = s0 + dir * ease * (L / 2);
          const pts: Pt[] = [];
          const step = 7 * o.scale;
          let off = 0;
          const amp = 4.5 * o.scale;
          for (let d = 0; d <= trailLen; d += step) {
            const s = head - dir * d;
            const p = shape.at(s);
            off = Math.max(-amp, Math.min(amp, off + (Math.random() - 0.5) * amp * 1.4));
            const taper = 1 - d / trailLen;
            pts.push({ x: p.x + p.nx * off * (0.4 + taper), y: p.y + p.ny * off * (0.4 + taper) });
          }
          strokeBolt(ctx, pts, o.scale, fade * flicker);

          // forks branch outward from the trail
          if (fade > 0.3 && Math.random() < 0.2) {
            const idx = 1 + Math.floor(Math.random() * Math.min(pts.length - 1, 8));
            const base = shape.at(head - dir * idx * step);
            const len = (14 + Math.random() * 22) * o.scale;
            const ang = Math.atan2(base.ny, base.nx) + (Math.random() - 0.5) * 1.3;
            const end = { x: base.x + Math.cos(ang) * len, y: base.y + Math.sin(ang) * len };
            forks.push({
              pts: jagged({ x: base.x, y: base.y }, end, 10 * o.scale, 3),
              born: t,
              life: 0.09 + Math.random() * 0.08,
            });
          }
          // sparks shed from the head
          if (fade > 0.2) {
            const hp = shape.at(head);
            for (let k = 0; k < (Math.random() < 0.5 ? 1 : 0); k++) {
              const a = Math.atan2(hp.ny, hp.nx) + (Math.random() - 0.5) * 2.2;
              const v = (60 + Math.random() * 120) * o.scale;
              sparks.push({
                x: hp.x,
                y: hp.y,
                vx: Math.cos(a) * v,
                vy: Math.sin(a) * v,
                born: t,
                life: 0.25 + Math.random() * 0.3,
                size: (0.8 + Math.random() * 1.4) * o.scale,
              });
            }
          }
        }

        // 3. where the bolts meet: a burst
        if (!burst && travel >= 1) {
          burst = true;
          const meet = shape.at(s0 + L / 2);
          for (let k = 0; k < 12; k++) {
            const a = Math.random() * TAU;
            const v = (80 + Math.random() * 220) * o.scale;
            sparks.push({
              x: meet.x,
              y: meet.y,
              vx: Math.cos(a) * v,
              vy: Math.sin(a) * v,
              born: t,
              life: 0.3 + Math.random() * 0.4,
              size: (0.9 + Math.random() * 1.6) * o.scale,
            });
          }
          for (let k = 0; k < 2; k++) {
            const a = Math.random() * TAU;
            const len = (18 + Math.random() * 26) * o.scale;
            forks.push({
              pts: jagged(
                { x: meet.x, y: meet.y },
                { x: meet.x + Math.cos(a) * len, y: meet.y + Math.sin(a) * len },
                12 * o.scale,
                3,
              ),
              born: t,
              life: 0.16,
            });
          }
        }

        for (let i = forks.length - 1; i >= 0; i--) {
          const f = forks[i];
          const age = (t - f.born) / f.life;
          if (age >= 1) {
            forks.splice(i, 1);
            continue;
          }
          strokeBolt(ctx, f.pts, o.scale * 0.6, (1 - age) * flicker);
        }

        ctx.save();
        ctx.globalCompositeOperation = "lighter";
        for (let i = sparks.length - 1; i >= 0; i--) {
          const sp = sparks[i];
          const age = (t - sp.born) / sp.life;
          if (age >= 1) {
            sparks.splice(i, 1);
            continue;
          }
          const dt = 1 / 60;
          sp.x += sp.vx * dt;
          sp.y += sp.vy * dt;
          sp.vx *= 0.92;
          sp.vy = sp.vy * 0.92 + 240 * o.scale * dt;
          ctx.globalAlpha = 1 - age;
          ctx.fillStyle = age < 0.4 ? "#fffbe9" : "#f2c46c";
          ctx.shadowColor = "rgba(240, 190, 95, 0.95)";
          ctx.shadowBlur = 8 * o.scale;
          ctx.beginPath();
          ctx.arc(sp.x, sp.y, sp.size, 0, TAU);
          ctx.fill();
        }
        ctx.restore();

        if (fade > 0 || sparks.length || forks.length) {
          raf = requestAnimationFrame(frame);
        } else {
          // collapse when idle so the canvas never adds to the page size
          canvas.width = 0;
          canvas.height = 0;
          canvas.style.width = "0px";
          canvas.style.height = "0px";
          running = false;
        }
      };
      raf = requestAnimationFrame(frame);
    };

    runRef.current = run;

    const onEnter = (e: Event) => {
      if (e.type === "focusin" && !(host as HTMLElement).matches(":focus-visible")) return;
      if (!running) run();
    };
    const hoverOn = hover && window.matchMedia("(hover: hover)").matches;
    if (hoverOn) {
      host.addEventListener("pointerenter", onEnter);
      host.addEventListener("focusin", onEnter);
    }
    return () => {
      cancelAnimationFrame(raf);
      runRef.current = null;
      if (hoverOn) {
        host.removeEventListener("pointerenter", onEnter);
        host.removeEventListener("focusin", onEnter);
      }
    };
  }, [reduce, hover]);

  // Strike whenever the trigger changes
  useEffect(() => {
    if (first.current) {
      first.current = false;
      if (!onMount) return;
      const t = window.setTimeout(() => runRef.current?.(), 650);
      return () => window.clearTimeout(t);
    }
    runRef.current?.();
  }, [trigger, onMount]);

  return (
    <canvas
      ref={canvasRef}
      width={0}
      height={0}
      aria-hidden="true"
      className="pointer-events-none absolute z-20"
      style={{ left: `-${34 * (options?.scale ?? 1)}px`, top: `-${34 * (options?.scale ?? 1)}px`, width: 0, height: 0 }}
    />
  );
}

/**
 * A crackling horizontal arc: electricity riding along a line, regenerated
 * every frame. Used on the hero scan beam while it sweeps.
 */
export function ElectricLine({ active }: { active: boolean }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const reduce = useReducedMotion();
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas || !active || reduce) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let raf = 0;
    const frame = () => {
      const W = canvas.clientWidth;
      const H = canvas.clientHeight;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      if (canvas.width !== Math.round(W * dpr)) {
        canvas.width = Math.round(W * dpr);
        canvas.height = Math.round(H * dpr);
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, H);
      const mid = H / 2;
      // two interleaved arcs along the beam
      for (let k = 0; k < 2; k++) {
        const pts: Pt[] = [];
        let off = 0;
        for (let x = 0; x <= W; x += 9) {
          off = Math.max(-5, Math.min(5, off + (Math.random() - 0.5) * 6));
          pts.push({ x, y: mid + off });
        }
        strokeBolt(ctx, pts, 0.5, k === 0 ? 0.55 : 0.25);
      }
      // occasional forks up and down
      for (let i = 0; i < 2; i++) {
        if (Math.random() < 0.75) continue;
        const x = Math.random() * W;
        const up = Math.random() < 0.5 ? -1 : 1;
        strokeBolt(
          ctx,
          jagged({ x, y: mid }, { x: x + (Math.random() - 0.5) * 30, y: mid + up * (12 + Math.random() * 14) }, 10, 3),
          0.5,
          0.8,
        );
      }
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => {
      cancelAnimationFrame(raf);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    };
  }, [active, reduce]);
  return (
    <canvas
      ref={ref}
      aria-hidden="true"
      className="pointer-events-none absolute inset-x-0 top-1/2 h-14 w-full -translate-y-1/2"
    />
  );
}
