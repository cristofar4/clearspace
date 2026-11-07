"use client";

import {
  animate,
  AnimatePresence,
  motion,
  useMotionTemplate,
  useMotionValue,
  useMotionValueEvent,
  useReducedMotion,
  useTransform,
  type AnimationPlaybackControls,
} from "motion/react";
import Image from "next/image";
import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
} from "react";

import { useSite } from "@/components/providers/SiteProvider";
import { Icon } from "@/components/ui/Icon";
import { routePhoto, routeStart, routeStops } from "@/content/route";
import { DustCanvas, Glints, GrimeLayer, ScanBeam, ScanReadout } from "./ScanLayers";
import { BUTTON_BOLT, LightningOutline } from "@/components/ui/Lightning";

const EASE = [0.22, 1, 0.36, 1] as const;
/** The photo is 3:2, so the overlay uses a 150 by 100 coordinate space. */
const VB = { w: 150, h: 100 };
const DWELL_MS = 4200;
/** The stage is a little wider than the photo; the photo layer overhangs top and bottom equally. */
const STAGE_RATIO = 16 / 10;
const PHOTO_RATIO = 3 / 2;
const K = STAGE_RATIO / PHOTO_RATIO;
const OVERHANG = ((K - 1) / 2) * 100;
const TRAVEL_S = 1.1;
const SCAN_S = 3;
/** Stops in the order the scan line meets them, top to bottom. */
const SCAN_ORDER = routeStops.map((s, i) => ({ i, y: (s.frame.y + s.frame.h / 2) / 100 })).sort((a, b) => a.y - b.y);
const IMAGE_SIZES = "(min-width: 1440px) 1240px, (min-width: 1024px) 86vw, 150vw";

type Pt = { x: number; y: number };
const toVB = (p: Pt): Pt => ({ x: (p.x / 100) * VB.w, y: (p.y / 100) * VB.h });

/** Smooth path through the route points (Catmull Rom converted to Bezier). */
function segmentD(p0: Pt, p1: Pt, p2: Pt, p3: Pt) {
  const t = 1 / 6;
  const c1 = { x: p1.x + (p2.x - p0.x) * t, y: p1.y + (p2.y - p0.y) * t };
  const c2 = { x: p2.x - (p3.x - p1.x) * t, y: p2.y - (p3.y - p1.y) * t };
  return `M${p1.x.toFixed(2)} ${p1.y.toFixed(2)} C${c1.x.toFixed(2)} ${c1.y.toFixed(2)} ${c2.x.toFixed(2)} ${c2.y.toFixed(2)} ${p2.x.toFixed(2)} ${p2.y.toFixed(2)}`;
}

/**
 * The Clearspace route.
 * A real kitchen, cleaned in the order professionals work: top to bottom, dry
 * before wet, finishing at the door. A small light travels the route; at each
 * stop the camera moves in, the room dims around the surface, an inspection
 * frame settles on it and a single polish pass crosses it. The panel explains
 * what is done there and why it comes at that point.
 */
export function KitchenRoute({ onClean }: { onClean?: () => void }) {
  const { planClean } = useSite();
  const reduce = useReducedMotion() ?? false;
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, "");

  const [active, setActive] = useState<number | null>(null);
  const [drawn, setDrawn] = useState(-1);
  const [visited, setVisited] = useState<boolean[]>(() => routeStops.map(() => false));
  const [playing, setPlaying] = useState(false);
  const [complete, setComplete] = useState(false);
  const [pass, setPass] = useState(0);

  /* ----- the scan: dirty, scanning, clean ----- */
  const [phase, setPhase] = useState<"dirty" | "scanning" | "clean">("dirty");
  const [scanRun, setScanRun] = useState(0);
  const [cycle, setCycle] = useState(0);
  const [found, setFound] = useState<number[]>([]);
  const scan = useMotionValue(0);
  const scanPct = useTransform(scan, (v) => v * 100);
  const dirtyClip = useMotionTemplate`inset(${scanPct}% 0% 0% 0%)`;
  const scanCtl = useRef<AnimationPlaybackControls | null>(null);
  const foundCount = useRef(0);
  const autoTimer = useRef<number | undefined>(undefined);
  const onCleanRef = useRef(onClean);
  useEffect(() => {
    onCleanRef.current = onClean;
  });

  const stageRef = useRef<HTMLDivElement>(null);
  const segRefs = useRef<(SVGPathElement | null)[]>([]);
  const lightRef = useRef<SVGGElement>(null);
  const travel = useRef<AnimationPlaybackControls | null>(null);
  const interacted = useRef(false);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const points = useMemo(() => [routeStart, ...routeStops.map((s) => s.at)].map(toVB), []);
  const segments = useMemo(
    () =>
      routeStops.map((_, i) => {
        const p0 = points[Math.max(0, i - 1)];
        const p3 = points[Math.min(points.length - 1, i + 2)];
        return segmentD(p0, points[i], points[i + 1], p3);
      }),
    [points],
  );

  const placeLight = useCallback((p: Pt) => {
    lightRef.current?.setAttribute("transform", `translate(${p.x} ${p.y})`);
  }, []);

  /** Go to a stop. Sequential steps travel the drawn route; jumps glide straight. */
  const goTo = useCallback(
    (index: number, from: number | null) => {
      travel.current?.stop();
      setActive(index);
      setComplete(false);
      setVisited((v) => v.map((was, i) => was || i === index));
      setDrawn((d) => Math.max(d, index));
      setPass((n) => n + 1);
      const target = points[index + 1];
      const path = segRefs.current[index];
      if (reduce) {
        placeLight(target);
        return;
      }
      if (from === index - 1 && path) {
        const len = path.getTotalLength();
        travel.current = animate(0, 1, {
          duration: TRAVEL_S,
          ease: [0.65, 0, 0.35, 1],
          onUpdate: (t) => {
            const p = path.getPointAtLength(t * len);
            placeLight({ x: p.x, y: p.y });
          },
        });
      } else {
        const start = from === null ? points[0] : points[from + 1];
        travel.current = animate(0, 1, {
          duration: 0.7,
          ease: EASE,
          onUpdate: (t) => placeLight({ x: start.x + (target.x - start.x) * t, y: start.y + (target.y - start.y) * t }),
        });
      }
    },
    [placeLight, points, reduce],
  );

  const isOnScreen = () => {
    const r = stageRef.current?.getBoundingClientRect();
    return Boolean(r && r.top < window.innerHeight && r.bottom > 0);
  };

  const cleanNow = useCallback(() => {
    scanCtl.current?.stop();
    scan.set(1);
    setPhase((p) => (p === "clean" ? p : "clean"));
  }, [scan]);

  const startScan = useCallback(
    (autoplayAfter: boolean) => {
      scanCtl.current?.stop();
      foundCount.current = 0;
      setFound([]);
      scan.set(0);
      setPhase("scanning");
      scanCtl.current = animate(scan, 1, {
        duration: SCAN_S,
        ease: [0.6, 0, 0.3, 1],
        onComplete: () => {
          setPhase("clean");
          setScanRun((n) => n + 1);
          onCleanRef.current?.();
          if (autoplayAfter) {
            autoTimer.current = window.setTimeout(() => {
              if (!interacted.current && isOnScreen()) setPlaying(true);
            }, 1500);
          }
        },
      });
    },
    [scan],
  );

  // The scan line meets each surface in turn and briefly marks it
  useMotionValueEvent(scan, "change", (v) => {
    const next = SCAN_ORDER[foundCount.current];
    if (phase === "scanning" && next && v >= next.y) {
      foundCount.current += 1;
      setFound((f) => [...f, next.i]);
    }
  });

  // Run once on arrival. With reduced motion the room is simply shown clean.
  useEffect(() => {
    const t = window.setTimeout(() => (reduce ? cleanNow() : startScan(true)), reduce ? 0 : 750);
    return () => {
      window.clearTimeout(t);
      window.clearTimeout(autoTimer.current);
      scanCtl.current?.stop();
    };
  }, [reduce, cleanNow, startScan]);

  const finishRoute = useCallback(() => {
    setPlaying(false);
    setComplete(true);
    setActive(null);
  }, []);

  // Autoplay advance
  useEffect(() => {
    if (!playing) return;
    const t = window.setTimeout(
      () => {
        if (active === null) goTo(0, null);
        else if (active >= routeStops.length - 1) finishRoute();
        else goTo(active + 1, active);
      },
      active === null ? 500 : DWELL_MS,
    );
    return () => window.clearTimeout(t);
  }, [playing, active, goTo, finishRoute]);

  // Pause when scrolled away or the tab is hidden
  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => !e.isIntersecting && setPlaying(false), { threshold: 0.15 });
    io.observe(el);
    const onVis = () => document.hidden && setPlaying(false);
    document.addEventListener("visibilitychange", onVis);
    return () => {
      io.disconnect();
      document.removeEventListener("visibilitychange", onVis);
    };
  }, []);

  useEffect(() => () => travel.current?.stop(), []);

  const userGo = (index: number) => {
    interacted.current = true;
    window.clearTimeout(autoTimer.current);
    if (phase !== "clean") cleanNow();
    setPlaying(false);
    goTo(index, active);
  };

  const rescan = () => {
    interacted.current = true;
    window.clearTimeout(autoTimer.current);
    travel.current?.stop();
    setPlaying(false);
    setActive(null);
    setComplete(false);
    setVisited(routeStops.map(() => false));
    setDrawn(-1);
    placeLight(points[0]);
    scan.set(0);
    setPhase("dirty");
    setCycle((c) => c + 1);
    window.setTimeout(() => startScan(false), 450);
  };

  const togglePlay = () => {
    interacted.current = true;
    window.clearTimeout(autoTimer.current);
    if (phase !== "clean") cleanNow();
    if (playing) {
      setPlaying(false);
      return;
    }
    if (complete || active === null) {
      setVisited(routeStops.map(() => false));
      setDrawn(-1);
      setComplete(false);
      placeLight(points[0]);
      setActive(null);
    }
    setPlaying(true);
  };

  const onTabKey = (e: KeyboardEvent, index: number) => {
    const map: Record<string, number> = {
      ArrowRight: index + 1,
      ArrowDown: index + 1,
      ArrowLeft: index - 1,
      ArrowUp: index - 1,
      Home: 0,
      End: routeStops.length - 1,
    };
    if (!(e.key in map)) return;
    e.preventDefault();
    const next = (map[e.key] + routeStops.length) % routeStops.length;
    tabRefs.current[next]?.focus();
    userGo(next);
  };

  /* ----- camera ----- */
  const stop = active === null ? null : routeStops[active];
  const scale = stop && !reduce ? stop.zoom : 1;
  let tx = 0;
  let ty = 0;
  if (stop && scale > 1) {
    const cx = stop.frame.x + stop.frame.w / 2;
    const cy = stop.frame.y + stop.frame.h / 2;
    tx = Math.min(0, Math.max(100 - 100 * scale, 50 - scale * cx));
    ty = Math.min(0, Math.max(100 - 100 * scale, 50 - scale * cy));
  }
  const camera = reduce
    ? "none"
    : "transform 1.2s var(--ease-out-quint), left 1.2s var(--ease-out-quint), top 1.2s var(--ease-out-quint)";

  const spot = stop
    ? {
        "--sx": stop.frame.x + stop.frame.w / 2,
        "--sy": stop.frame.y + stop.frame.h / 2,
        "--rx": stop.frame.w / 2 + 8,
        "--ry": stop.frame.h / 2 + 10,
      }
    : { "--sx": 50, "--sy": 50, "--rx": 80, "--ry": 80 };

  const panelKey =
    phase !== "clean" ? "scan" : complete ? "complete" : active === null ? "intro" : routeStops[active].id;
  const clean = phase === "clean";

  return (
    <div className="relative">
      {/* ---------- stage: the real kitchen ---------- */}
      <div
        ref={stageRef}
        className="relative aspect-[16/10] overflow-hidden rounded-t-[var(--radius-panel)] bg-petrol-900"
      >
        <div
          className="absolute inset-x-0 origin-top-left will-change-transform"
          style={{
            top: `${-OVERHANG}%`,
            height: `${K * 100}%`,
            transform: `translate(${tx}%, ${ty}%) scale(${scale})`,
            transition: camera,
          }}
        >
          <Image
            src={routePhoto.src}
            alt={routePhoto.alt}
            fill
            preload
            sizes={IMAGE_SIZES}
            placeholder="blur"
            className="scan-clean-photo object-cover"
          />

          {/* the same photo under a grime film; the scan wipes it away from the top down */}
          {!clean && (
            <motion.div aria-hidden="true" className="scan-dirty absolute inset-0" style={{ clipPath: dirtyClip }}>
              <Image src={routePhoto.src} alt="" fill sizes={IMAGE_SIZES} className="scan-dirty-photo object-cover" />
              <div className="scan-haze absolute inset-0" />
              <GrimeLayer />
            </motion.div>
          )}
          {!reduce && <DustCanvas key={`dust-${cycle}`} progress={scan} />}
          <ScanBeam progress={scan} visible={phase === "scanning"} />
          {scanRun > 0 && !reduce && (
            <motion.div
              key={`bloom-${scanRun}`}
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 z-[4] bg-[#fffaf0]"
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 0.32, 0] }}
              transition={{ duration: 1.1, ease: "easeOut" }}
            />
          )}
          <Glints show={clean && scanRun > 0 && !reduce} run={scanRun} />

          {/* surfaces found by the scan */}
          {phase === "scanning" &&
            found.map((i) => {
              const f = routeStops[i].frame;
              return (
                <motion.div
                  key={`found-${i}`}
                  aria-hidden="true"
                  className="pointer-events-none absolute z-[5]"
                  style={{ left: `${f.x}%`, top: `${f.y}%`, width: `${f.w}%`, height: `${f.h}%` }}
                  initial={{ opacity: 0, scale: 1.08 }}
                  animate={{ opacity: [0, 1, 0.85], scale: 1 }}
                  transition={{ duration: 0.5, ease: EASE }}
                >
                  <span className="route-corner left-0 top-0 rounded-tl-[10px] border-l-2 border-t-2 !border-seaglass-200" />
                  <span className="route-corner right-0 top-0 rounded-tr-[10px] border-r-2 border-t-2 !border-seaglass-200" />
                  <span className="route-corner bottom-0 left-0 rounded-bl-[10px] border-b-2 border-l-2 !border-seaglass-200" />
                  <span className="route-corner bottom-0 right-0 rounded-br-[10px] border-b-2 border-r-2 !border-seaglass-200" />
                  <span className="absolute -top-3 left-2 rounded-full bg-petrol-950/75 px-2 py-0.5 text-[0.62rem] font-semibold uppercase tracking-[0.14em] text-seaglass-100 backdrop-blur-sm">
                    {routeStops[i].name}
                  </span>
                </motion.div>
              );
            })}

          {/* light falls away from everything except the surface in hand */}
          <div
            aria-hidden="true"
            className="route-spot absolute inset-0"
            style={{ ...(spot as CSSProperties), opacity: stop ? 1 : 0 }}
          />

          {/* the planned route, the route so far, and the travelling light */}
          <svg
            viewBox={`0 0 ${VB.w} ${VB.h}`}
            className="pointer-events-none absolute inset-0 h-full w-full transition-opacity duration-700"
            style={{ opacity: clean ? 1 : 0 }}
            aria-hidden="true"
          >
            <defs>
              <radialGradient id={`${uid}-glow`}>
                <stop offset="0" stopColor="#FFF4DD" stopOpacity="0.95" />
                <stop offset="0.45" stopColor="#E6C88F" stopOpacity="0.55" />
                <stop offset="1" stopColor="#E6C88F" stopOpacity="0" />
              </radialGradient>
            </defs>
            {segments.map((d, i) => (
              <path
                key={`plan-${i}`}
                d={d}
                fill="none"
                stroke="#FBF9F5"
                strokeOpacity={0.55}
                strokeWidth={1.4}
                strokeDasharray="2 5"
                strokeLinecap="round"
                vectorEffect="non-scaling-stroke"
              />
            ))}
            {segments.map((d, i) => (
              <motion.path
                key={`done-${i}`}
                ref={(el) => {
                  segRefs.current[i] = el;
                }}
                d={d}
                fill="none"
                stroke="#D6B88E"
                strokeWidth={2.4}
                strokeLinecap="round"
                vectorEffect="non-scaling-stroke"
                initial={false}
                animate={{ pathLength: i <= drawn ? 1 : 0, opacity: i <= drawn ? 1 : 0 }}
                transition={{ duration: reduce ? 0 : TRAVEL_S, ease: [0.65, 0, 0.35, 1] }}
              />
            ))}
            <g ref={lightRef} transform={`translate(${points[0].x} ${points[0].y})`}>
              <circle r={4.2} fill={`url(#${uid}-glow)`} />
              <circle r={1.05} fill="#FFF8EC" />
            </g>
          </svg>

          {/* inspection frame and polish pass on the current surface */}
          {stop && (
            <div
              aria-hidden="true"
              className="absolute"
              style={{
                left: `${stop.frame.x}%`,
                top: `${stop.frame.y}%`,
                width: `${stop.frame.w}%`,
                height: `${stop.frame.h}%`,
                transition: reduce
                  ? "none"
                  : "left 1s var(--ease-out-quint), top 1s var(--ease-out-quint), width 1s var(--ease-out-quint), height 1s var(--ease-out-quint)",
              }}
            >
              <span className="route-corner left-0 top-0 border-l-2 border-t-2 rounded-tl-[10px]" />
              <span className="route-corner right-0 top-0 border-r-2 border-t-2 rounded-tr-[10px]" />
              <span className="route-corner bottom-0 left-0 border-b-2 border-l-2 rounded-bl-[10px]" />
              <span className="route-corner bottom-0 right-0 border-b-2 border-r-2 rounded-br-[10px]" />
              {!reduce && (
                <div className="absolute inset-0 overflow-hidden rounded-[12px]">
                  <motion.div
                    key={pass}
                    className="route-sheen absolute inset-y-[-20%] w-[45%]"
                    initial={{ left: "-50%", opacity: 0 }}
                    animate={{ left: ["-50%", "120%"], opacity: [0, 1, 1, 0] }}
                    transition={{ duration: 1.3, delay: 0.7, ease: [0.65, 0, 0.35, 1], times: [0, 0.15, 0.85, 1] }}
                  />
                </div>
              )}
            </div>
          )}
        </div>

        {/* ---------- markers: they follow the camera but never scale ---------- */}
        {routeStops.map((s, i) => {
          const left = tx + scale * s.at.x;
          const top = -OVERHANG + K * (ty + scale * s.at.y);
          const isActive = active === i;
          const labelLeft = s.at.x > 60;
          return (
            <button
              key={s.id}
              type="button"
              onClick={() => userGo(i)}
              aria-label={`Stop ${i + 1}: ${s.name}`}
              aria-pressed={isActive}
              className={`group absolute z-10 -translate-x-1/2 -translate-y-1/2 ${clean ? "" : "pointer-events-none"}`}
              style={{
                left: `${left}%`,
                top: `${top}%`,
                opacity: clean ? 1 : 0,
                transition: reduce
                  ? "none"
                  : `${camera}, opacity 0.6s var(--ease-out-quint) ${clean ? 0.35 + i * 0.08 : 0}s`,
              }}
            >
              <span
                className={`relative grid h-7 w-7 place-items-center rounded-full border text-[0.7rem] font-semibold tabular-nums shadow-[0_6px_16px_-8px_rgba(0,0,0,0.6)] transition-colors duration-300 sm:h-8 sm:w-8 ${
                  isActive
                    ? "border-brass-300 bg-petrol-800 text-porcelain-50"
                    : visited[i]
                      ? "border-porcelain-50/80 bg-porcelain-50 text-petrol-800"
                      : "border-porcelain-50/70 bg-petrol-900/55 text-porcelain-50 backdrop-blur-sm group-hover:bg-petrol-800"
                }`}
              >
                {visited[i] && !isActive ? <Icon name="check" size={14} strokeWidth={2.2} /> : i + 1}
                {isActive && <span className="absolute -inset-[5px] rounded-full border border-brass-300/80" />}
              </span>
              <span
                className={`pointer-events-none absolute top-1/2 hidden -translate-y-1/2 whitespace-nowrap rounded-full bg-porcelain-50 px-3 py-1 text-[0.78rem] font-medium text-petrol-900 shadow-[0_8px_20px_-12px_rgba(0,0,0,0.6)] transition-opacity duration-300 md:block ${
                  labelLeft ? "right-[calc(100%+8px)]" : "left-[calc(100%+8px)]"
                } ${isActive ? "opacity-100" : "opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100"}`}
              >
                {s.name}
              </span>
            </button>
          );
        })}

        {!reduce && <ScanReadout progress={scan} phase={phase} />}
        <span className="pointer-events-none absolute bottom-3 left-3 z-10 rounded-full bg-petrol-950/55 px-3 py-1 text-[0.7rem] font-medium tracking-wide text-porcelain-50/90 backdrop-blur-sm">
          A real kitchen
        </span>
        <p className="sr-only" aria-live="polite">
          {phase === "scanning" ? "Scanning the kitchen." : clean && scanRun > 0 ? "The kitchen is clean." : ""}
        </p>
      </div>

      {/* ---------- connected panel ---------- */}
      <div className="on-dark rounded-b-[var(--radius-panel)] bg-petrol-900 p-4 text-porcelain-50 sm:p-6">
        <div className="grid grid-cols-[1fr_auto] items-center gap-x-3 gap-y-4 lg:grid-cols-[auto_minmax(0,1fr)_auto] lg:gap-x-6">
          <p className="eyebrow flex items-center gap-2.5 whitespace-nowrap text-brass-300">
            <span className="cs-light" aria-hidden="true" />
            <span>
              The <span className="hidden sm:inline">Clearspace </span>route
            </span>
          </p>
          <div className="flex items-center justify-end gap-1 lg:col-start-3 lg:row-start-1">
            {!reduce && (
              <button
                type="button"
                onClick={rescan}
                disabled={phase === "scanning"}
                className="grid h-10 w-10 place-items-center rounded-full text-porcelain-50/85 transition-colors hover:bg-porcelain-50/10 disabled:opacity-40"
                aria-label="Scan the room again"
                title="Scan the room again"
              >
                <Icon name="scan" size={18} />
              </button>
            )}
            <button
              type="button"
              onClick={() => userGo(active === null || active === 0 ? routeStops.length - 1 : active - 1)}
              className="grid h-10 w-10 place-items-center rounded-full text-porcelain-50/85 transition-colors hover:bg-porcelain-50/10"
              aria-label="Previous stop"
            >
              <Icon name="chevronLeft" size={18} />
            </button>
            <button
              type="button"
              onClick={togglePlay}
              className="btn btn-sm btn-outline-light h-10 w-10 gap-2 px-0 sm:w-auto sm:min-w-[6.5rem] sm:px-3.5"
              aria-label={
                playing ? "Pause the route" : complete || active === null ? "Play the route" : "Resume the route"
              }
            >
              <Icon name={playing ? "pause" : "play"} size={15} />
              <span className="sr-only sm:not-sr-only">{playing ? "Pause" : complete ? "Replay" : "Play"}</span>
            </button>
            <button
              type="button"
              onClick={() => userGo(active === null ? 0 : (active + 1) % routeStops.length)}
              className="grid h-10 w-10 place-items-center rounded-full text-porcelain-50/85 transition-colors hover:bg-porcelain-50/10"
              aria-label="Next stop"
            >
              <Icon name="chevronRight" size={18} />
            </button>
          </div>
          <div
            role="tablist"
            aria-label="Route stops"
            className="col-span-2 grid grid-cols-6 gap-1.5 lg:col-span-1 lg:col-start-2 lg:row-start-1"
          >
            {routeStops.map((s, i) => {
              const selected = active === i;
              return (
                <button
                  key={s.id}
                  ref={(el) => {
                    tabRefs.current[i] = el;
                  }}
                  type="button"
                  role="tab"
                  id={`${uid}-tab-${i}`}
                  aria-selected={selected}
                  aria-controls={`${uid}-panel`}
                  aria-label={`${i + 1}. ${s.name}`}
                  tabIndex={selected || (active === null && i === 0) ? 0 : -1}
                  onClick={() => userGo(i)}
                  onKeyDown={(e) => onTabKey(e, i)}
                  className="group flex flex-col gap-2 rounded-md pt-1 text-left"
                >
                  <span className="relative block h-[3px] w-full overflow-hidden rounded-full bg-porcelain-50/15">
                    {(visited[i] && !selected) || (selected && !playing) ? (
                      <span className="absolute inset-0 rounded-full bg-brass-300" />
                    ) : null}
                    {selected && playing && !reduce && (
                      <span
                        key={`${pass}-fill`}
                        className="route-progress absolute inset-0 origin-left rounded-full bg-brass-300"
                        style={{ animationDuration: `${DWELL_MS}ms` }}
                      />
                    )}
                  </span>
                  <span
                    className={`text-[0.72rem] tabular-nums transition-colors ${
                      selected ? "text-porcelain-50" : "text-porcelain-50/70 group-hover:text-porcelain-50"
                    }`}
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div
          role="tabpanel"
          id={`${uid}-panel`}
          aria-labelledby={active !== null ? `${uid}-tab-${active}` : undefined}
          aria-label={active === null ? "Route overview" : undefined}
          aria-live={playing ? "off" : "polite"}
          className="mt-5 min-h-[10.5rem] sm:min-h-[8rem]"
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={panelKey}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.35, ease: EASE }}
              className="grid gap-x-8 gap-y-4 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]"
            >
              <div>
                <h2 className="display-sm text-porcelain-50">
                  {!clean
                    ? "Scanning the room"
                    : complete
                      ? "Route complete"
                      : stop
                        ? stop.name
                        : "Follow a kitchen clean"}
                </h2>
                <p className="mt-2 font-display text-[1.05rem] italic leading-snug text-seaglass-200">
                  {!clean
                    ? "Every surface is found and checked before a single cloth comes out."
                    : complete
                      ? "Six stops, one standard, every surface in the right order."
                      : stop
                        ? stop.why
                        : "Six stops through a real kitchen: top to bottom, dry before wet, finishing at the door."}
                </p>
              </div>
              <div className="flex flex-col justify-between gap-4">
                {stop ? (
                  <ul className="grid gap-1.5 text-[0.9rem] text-porcelain-50/90">
                    {stop.done.map((d) => (
                      <li key={d} className="flex gap-2">
                        <Icon name="check" size={16} strokeWidth={1.8} className="mt-0.5 shrink-0 text-seaglass-300" />
                        {d}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-[0.92rem] leading-relaxed text-porcelain-50/75">
                    {!clean
                      ? "Top to bottom, the same order we clean in. Choose any stop to skip ahead."
                      : complete
                        ? "This is the order every kitchen visit follows, adjusted to your space."
                        : "Press play, or choose any numbered stop in the photograph."}
                  </p>
                )}
                <button
                  type="button"
                  className="btn btn-light w-full sm:w-auto sm:self-start"
                  onClick={() =>
                    planClean({ service: "home", focusRoom: "kitchen", note: "Kitchen added as your focus room." })
                  }
                >
                  <LightningOutline hover onMount={false} options={BUTTON_BOLT} />
                  Plan this clean
                  <Icon name="arrow" size={18} className="btn-arrow" />
                </button>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
