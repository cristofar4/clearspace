"use client";

import { animate, AnimatePresence, motion, useReducedMotion, type AnimationPlaybackControls } from "motion/react";
import { useCallback, useEffect, useId, useRef, useState, type KeyboardEvent } from "react";

import { BEDROOM, Landscape, Structure } from "@/components/illustration/HouseArt";
import { C } from "@/components/illustration/palette";
import { BedroomArt, roomArt } from "@/components/illustration/rooms";
import { useSite } from "@/components/providers/SiteProvider";
import { Icon } from "@/components/ui/Icon";
import { roomById, rooms, SCENE_VIEWS, type RoomId } from "@/content/rooms";
import { useMediaQuery } from "@/lib/hooks";

const EASE = [0.22, 1, 0.36, 1] as const;
const WIPE_EASE = [0.65, 0, 0.35, 1] as const;
const ZOOM = { wide: 1.1, narrow: 1.42 };

type CleanMap = Record<RoomId, boolean>;
type LayerRefs = { clean: SVGRectElement | null; clutter: SVGRectElement | null; blade: SVGGElement | null };

/**
 * The Clearspace Reset.
 * Selecting a room brings it into focus (a short pan and crop), lowers the
 * light elsewhere, and runs a single squeegee pass that wipes the lived in
 * layer away to reveal the same room, cared for. The panel below follows.
 */
export function HouseExplorer() {
  const { planClean } = useSite();
  const reduce = useReducedMotion() ?? false;
  const narrow = useMediaQuery("(max-width: 767px)");
  const view = narrow ? SCENE_VIEWS.narrow : SCENE_VIEWS.wide;
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, "");

  const [focus, setFocus] = useState<RoomId | null>(null);
  const [panelRoom, setPanelRoom] = useState<RoomId>("kitchen");
  const [clean, setClean] = useState<CleanMap>({ kitchen: false, living: false, bath: false });
  const [wiping, setWiping] = useState<RoomId | null>(null);
  const [announcement, setAnnouncement] = useState("");

  const layers = useRef<Partial<Record<RoomId, LayerRefs>>>({});
  const running = useRef<{ room: RoomId; controls: AnimationPlaybackControls } | null>(null);
  const interacted = useRef(false);
  const sceneRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<Record<RoomId, HTMLButtonElement | null>>({ kitchen: null, living: null, bath: null });

  const setProgress = useCallback((id: RoomId, p: number) => {
    const refs = layers.current[id];
    if (!refs) return;
    const { w } = roomById[id].box;
    const x = Math.max(0, Math.min(1, p)) * w;
    refs.clean?.setAttribute("width", String(x));
    refs.clutter?.setAttribute("x", String(x));
    refs.clutter?.setAttribute("width", String(w - x));
    refs.blade?.setAttribute("transform", `translate(${x} 0)`);
  }, []);

  const finish = useCallback(
    (id: RoomId) => {
      setProgress(id, 1);
      setClean((prev) => (prev[id] ? prev : { ...prev, [id]: true }));
      setWiping((w) => (w === id ? null : w));
      setAnnouncement(`${roomById[id].name} reset.`);
    },
    [setProgress],
  );

  const runReset = useCallback(
    (id: RoomId) => {
      // Never leave a half wiped room behind
      if (running.current) {
        const { room, controls } = running.current;
        controls.stop();
        running.current = null;
        finish(room);
      }
      if (reduce) {
        finish(id);
        return;
      }
      setProgress(id, 0);
      setWiping(id);
      const controls = animate(0, 1, {
        duration: 1.05,
        delay: 0.28,
        ease: WIPE_EASE,
        onUpdate: (p) => setProgress(id, p),
        onComplete: () => {
          running.current = null;
          finish(id);
        },
      });
      running.current = { room: id, controls };
    },
    [finish, reduce, setProgress],
  );

  const select = useCallback(
    (id: RoomId, opts: { user?: boolean; replay?: boolean } = {}) => {
      if (opts.user) interacted.current = true;
      setFocus(id);
      setPanelRoom(id);
      if (!clean[id] || opts.replay) runReset(id);
    },
    [clean, runReset],
  );

  // A single, gentle demonstration on first view. Skipped if the visitor acts first.
  useEffect(() => {
    const timer = window.setTimeout(() => {
      if (interacted.current) return;
      const rect = sceneRef.current?.getBoundingClientRect();
      if (rect && rect.top < window.innerHeight && rect.bottom > 0) select("kitchen");
    }, 1500);
    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => () => running.current?.controls.stop(), []);

  /* ----- camera: one transform for the scene, matching positions for the hotspots ----- */
  const scale = focus && !reduce ? ZOOM[narrow ? "narrow" : "wide"] : 1;
  const pct = (sx: number, sy: number) => ({
    x: ((sx - view.x) / view.w) * 100,
    y: ((sy - view.y) / view.h) * 100,
  });
  let tx = 0;
  let ty = 0;
  if (focus && scale > 1) {
    const b = roomById[focus].box;
    const c = pct(b.x + b.w / 2, b.y + b.h / 2);
    tx = Math.min(0, Math.max(100 - 100 * scale, 50 - scale * c.x));
    ty = Math.min(0, Math.max(100 - 100 * scale, 50 - scale * c.y));
  }
  const cameraTransition = reduce
    ? "none"
    : "transform 1s var(--ease-out-quint), left 1s var(--ease-out-quint), top 1s var(--ease-out-quint)";

  const room = roomById[panelRoom];
  const sceneLabel = `Section drawing of a two storey home. ${rooms
    .map((r) => `${r.name}: ${clean[r.id] ? "reset" : "lived in"}`)
    .join(", ")}.`;

  const onTabKey = (e: KeyboardEvent<HTMLButtonElement>, index: number) => {
    const keys = ["ArrowDown", "ArrowRight", "ArrowUp", "ArrowLeft", "Home", "End"];
    if (!keys.includes(e.key)) return;
    e.preventDefault();
    let next = index;
    if (e.key === "ArrowDown" || e.key === "ArrowRight") next = (index + 1) % rooms.length;
    if (e.key === "ArrowUp" || e.key === "ArrowLeft") next = (index - 1 + rooms.length) % rooms.length;
    if (e.key === "Home") next = 0;
    if (e.key === "End") next = rooms.length - 1;
    const id = rooms[next].id;
    tabRefs.current[id]?.focus();
    select(id, { user: true });
  };

  return (
    <div className="relative">
      {/* ---------- scene ---------- */}
      <div
        ref={sceneRef}
        className="relative overflow-hidden rounded-t-[var(--radius-panel)] bg-porcelain-100 ring-1 ring-petrol-800/8"
        style={{ aspectRatio: `${view.w} / ${view.h}` }}
      >
        <div
          className="absolute inset-0 origin-top-left will-change-transform"
          style={{ transform: `translate(${tx}%, ${ty}%) scale(${scale})`, transition: cameraTransition }}
        >
          <svg
            viewBox={`${view.x} ${view.y} ${view.w} ${view.h}`}
            className="cs-art block h-full w-full"
            role="img"
            aria-label={sceneLabel}
          >
            <defs>
              {rooms.map((r) => (
                <g key={r.id}>
                  <clipPath id={`${uid}-clean-${r.id}`}>
                    <rect
                      ref={(el) => {
                        layers.current[r.id] = { ...(layers.current[r.id] as LayerRefs), clean: el };
                      }}
                      x={0}
                      y={0}
                      width={clean[r.id] ? r.box.w : 0}
                      height={r.box.h}
                    />
                  </clipPath>
                  <clipPath id={`${uid}-clutter-${r.id}`}>
                    <rect
                      ref={(el) => {
                        layers.current[r.id] = { ...(layers.current[r.id] as LayerRefs), clutter: el };
                      }}
                      x={clean[r.id] ? r.box.w : 0}
                      y={0}
                      width={clean[r.id] ? 0 : r.box.w}
                      height={r.box.h}
                    />
                  </clipPath>
                </g>
              ))}
            </defs>

            <Landscape />

            <g transform={`translate(${BEDROOM.x} ${BEDROOM.y})`}>
              <BedroomArt />
              <rect
                className="room-shade"
                width={430}
                height={190}
                fill={C.cut}
                style={{ opacity: focus ? 0.14 : 0 }}
              />
            </g>

            {rooms.map((r) => {
              const Art = roomArt[r.id];
              const isFocus = focus === r.id;
              return (
                <svg key={r.id} x={r.box.x} y={r.box.y} width={r.box.w} height={r.box.h} overflow="hidden">
                  <Art.Base />
                  <g clipPath={`url(#${uid}-clean-${r.id})`}>
                    <Art.Clean />
                  </g>
                  <g clipPath={`url(#${uid}-clutter-${r.id})`}>
                    <Art.Clutter />
                  </g>
                  {/* light: warm on the chosen room, lowered elsewhere */}
                  <rect
                    className="room-shade"
                    width={r.box.w}
                    height={r.box.h}
                    fill="url(#cs-warm)"
                    style={{ opacity: isFocus ? 1 : 0 }}
                  />
                  <rect
                    className="room-shade"
                    width={r.box.w}
                    height={r.box.h}
                    fill={C.cut}
                    style={{ opacity: focus && !isFocus ? 0.14 : 0 }}
                  />
                  {/* the squeegee pass */}
                  <g
                    ref={(el) => {
                      layers.current[r.id] = { ...(layers.current[r.id] as LayerRefs), blade: el };
                    }}
                    transform={`translate(${clean[r.id] ? r.box.w : 0} 0)`}
                    style={{ opacity: wiping === r.id ? 1 : 0, transition: "opacity 0.25s ease" }}
                  >
                    <rect x={-46} y={0} width={46} height={r.box.h} fill="url(#cs-sheen)" />
                    <line x1={0} y1={0} x2={0} y2={r.box.h} stroke="#FFFFFF" strokeWidth={2.4} />
                    <line x1={2.2} y1={0} x2={2.2} y2={r.box.h} stroke={C.seaMid} strokeWidth={1} />
                  </g>
                </svg>
              );
            })}

            <Structure />
          </svg>
        </div>

        {/* ---------- hotspots: positioned with the camera, never scaled ---------- */}
        {rooms.map((r) => {
          const base = pct(r.dot.x, r.dot.y);
          const left = tx + scale * base.x;
          const top = ty + scale * base.y;
          const active = focus === r.id;
          return (
            <button
              key={r.id}
              type="button"
              onClick={() => select(r.id, { user: true, replay: clean[r.id] && focus === r.id })}
              aria-label={`${clean[r.id] ? "Show" : "Reset"} the ${r.name.toLowerCase()}`}
              aria-pressed={active}
              className={`group absolute z-10 flex -translate-y-1/2 items-center gap-2 ${
                r.labelSide === "left" ? "-translate-x-[calc(100%-14px)] flex-row-reverse" : "-translate-x-[14px]"
              }`}
              style={{ left: `${left}%`, top: `${top}%`, transition: cameraTransition }}
            >
              <span
                className={`relative grid h-7 w-7 place-items-center rounded-full border transition-colors duration-300 ${
                  active
                    ? "border-petrol-800 bg-petrol-800 text-porcelain-50"
                    : "border-petrol-800/25 bg-porcelain-50/95 text-petrol-800 group-hover:border-petrol-800"
                }`}
              >
                {clean[r.id] ? (
                  <Icon name="check" size={14} strokeWidth={2} />
                ) : (
                  <span className="text-[10px] font-semibold tabular-nums">{r.number}</span>
                )}
                {!clean[r.id] && !active && (
                  <span className="absolute inset-0 rounded-full ring-2 ring-brass-300/60 motion-safe:animate-[pulse_2.8s_ease-in-out_3]" />
                )}
              </span>
              <span
                className={`hidden whitespace-nowrap rounded-full border px-3 py-1 text-[0.8rem] font-medium shadow-[0_6px_18px_-12px_rgba(13,47,53,0.6)] transition-colors duration-300 xl:inline-block ${
                  active
                    ? "border-petrol-800 bg-petrol-800 text-porcelain-50"
                    : "border-petrol-800/15 bg-porcelain-50/95 text-petrol-800 group-hover:border-petrol-800/50"
                }`}
              >
                {r.name}
              </span>
            </button>
          );
        })}

        <p className="sr-only" aria-live="polite">
          {announcement}
        </p>
      </div>

      {/* ---------- connected panel ---------- */}
      <div className="rounded-b-[var(--radius-panel)] border-x border-b border-petrol-800/8 bg-seaglass-100 p-4 sm:p-6">
        <div className="flex items-center justify-between gap-3 border-b border-petrol-800/10 pb-4">
          <div role="tablist" aria-label="Rooms in the house" className="flex flex-1 gap-1 sm:flex-none">
            {rooms.map((r, i) => {
              const selected = panelRoom === r.id;
              return (
                <button
                  key={r.id}
                  ref={(el) => {
                    tabRefs.current[r.id] = el;
                  }}
                  role="tab"
                  type="button"
                  id={`${uid}-tab-${r.id}`}
                  aria-selected={selected}
                  aria-controls={`${uid}-panel`}
                  tabIndex={selected ? 0 : -1}
                  onClick={() => select(r.id, { user: true })}
                  onKeyDown={(e) => onTabKey(e, i)}
                  className={`relative flex flex-1 items-center justify-center gap-2 rounded-full px-2.5 py-2 text-sm transition-colors duration-300 sm:flex-none sm:px-4 ${
                    selected ? "text-porcelain-50" : "text-petrol-800/80 hover:bg-porcelain-50/60 hover:text-petrol-900"
                  }`}
                >
                  {selected && (
                    <motion.span
                      layoutId={`${uid}-room-pill`}
                      aria-hidden="true"
                      className="absolute inset-0 rounded-full bg-petrol-800"
                      transition={{ duration: 0.45, ease: EASE }}
                    />
                  )}
                  <span
                    className={`relative hidden text-xs tabular-nums min-[400px]:inline ${selected ? "text-brass-300" : "text-petrol-700"}`}
                  >
                    {r.number}
                  </span>
                  <span className="relative font-medium">{r.name}</span>
                  {clean[r.id] && (
                    <Icon
                      name="check"
                      size={14}
                      strokeWidth={2.2}
                      className={`relative hidden sm:block ${selected ? "text-seaglass-300" : "text-seaglass-600"}`}
                    />
                  )}
                </button>
              );
            })}
          </div>
          <button
            type="button"
            className="btn btn-sm shrink-0 px-3 text-petrol-800 hover:bg-porcelain-50/70"
            onClick={() => select(panelRoom, { user: true, replay: true })}
            disabled={wiping === panelRoom}
            aria-label={
              clean[panelRoom] ? `Replay the ${room.name.toLowerCase()} reset` : `Reset the ${room.name.toLowerCase()}`
            }
          >
            <Icon name="replay" size={16} />
            <span className="hidden sm:inline">{clean[panelRoom] ? "Replay" : "Reset"}</span>
          </button>
        </div>

        <div role="tabpanel" id={`${uid}-panel`} aria-labelledby={`${uid}-tab-${panelRoom}`} className="pt-5">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={panelRoom}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.35, ease: EASE }}
              className="grid gap-x-8 gap-y-4 sm:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] sm:grid-rows-[auto_1fr]"
            >
              <div>
                <h2 className="display-sm text-petrol-900">{room.name}</h2>
                <p className="mt-1 text-[0.95rem] leading-snug text-ink-muted">{room.line}</p>
              </div>
              <ul className="grid gap-y-2 text-[0.9rem] text-petrol-900 sm:row-span-2">
                {room.included.map((item) => (
                  <li key={item} className="flex gap-2">
                    <Icon name="check" size={16} strokeWidth={1.8} className="mt-0.5 shrink-0 text-seaglass-600" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <div className="sm:self-end">
                <button
                  type="button"
                  className="btn btn-primary w-full sm:w-auto"
                  onClick={() =>
                    planClean({
                      service: "home",
                      focusRoom: panelRoom,
                      note: `${room.name} added as your focus room.`,
                    })
                  }
                >
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
