"use client";

import { AnimatePresence, motion } from "motion/react";
import Image from "next/image";
import { useRef, useState, type KeyboardEvent } from "react";

import { HouseArt } from "@/components/illustration/HouseArt";
import { Icon } from "@/components/ui/Icon";
import { Reveal, RevealHeading, RevealMedia } from "@/components/ui/Reveal";
import { media } from "@/content/media";
import { roomById, type RoomId } from "@/content/rooms";
import { showcasePairs, type ShowcasePair } from "@/content/showcase";
import { CompareSlider } from "./CompareSlider";

const EASE = [0.22, 1, 0.36, 1] as const;
const FRAME_RATIO = 16 / 9;

/** Crop the house drawing to one room, widened to the frame's proportions. */
function viewFor(room: RoomId) {
  const v = roomById[room].focusView;
  const cx = v.x + v.w / 2;
  const cy = v.y + v.h / 2;
  let w = v.w;
  let h = v.h;
  if (w / h > FRAME_RATIO) h = w / FRAME_RATIO;
  else w = h * FRAME_RATIO;
  return `${cx - w / 2} ${cy - h / 2} ${w} ${h}`;
}

function PairLayer({ pair, side }: { pair: ShowcasePair; side: "before" | "after" }) {
  if (pair.kind === "photo") {
    return (
      <Image
        src={side === "before" ? pair.before : pair.after}
        alt={side === "before" ? pair.beforeAlt : pair.afterAlt}
        fill
        sizes="(min-width: 1024px) 60vw, 100vw"
        className="object-cover"
        draggable={false}
      />
    );
  }
  const busy = side === "before";
  const room = roomById[pair.room];
  return (
    <HouseArt
      viewBox={viewFor(pair.room)}
      states={{ kitchen: "busy", living: "busy", bath: "busy", [pair.room]: busy ? "busy" : "clean" }}
      title={`${room.name}, ${busy ? "before: lived in" : "after: reset"}. Illustration.`}
    />
  );
}

export function ShowcaseSection() {
  const [activeId, setActiveId] = useState(showcasePairs[0].id);
  const pair = showcasePairs.find((p) => p.id === activeId) ?? showcasePairs[0];
  const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  const onKey = (e: KeyboardEvent, index: number) => {
    const delta = e.key === "ArrowRight" || e.key === "ArrowDown" ? 1 : e.key === "ArrowLeft" || e.key === "ArrowUp" ? -1 : 0;
    if (!delta) return;
    e.preventDefault();
    const next = showcasePairs[(index + delta + showcasePairs.length) % showcasePairs.length];
    setActiveId(next.id);
    tabRefs.current[next.id]?.focus();
  };

  return (
    <section id="difference" aria-labelledby="difference-heading" className="scroll-mt-24 py-14 lg:py-20">
      <div className="container-cs">
        <div className="grid gap-8 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-7">
            <Reveal>
              <p className="eyebrow flex items-center gap-3 text-petrol-700">
                <span className="h-px w-8 bg-brass-500" aria-hidden="true" />
                The difference
              </p>
            </Reveal>
            <RevealHeading
              id="difference-heading"
              className="display-lg mt-5 text-petrol-900"
              lines={[
                <>
                  A reset you can <em className="serif-italic text-petrol-700">see.</em>
                </>,
              ]}
            />
          </div>
          <Reveal className="lg:col-span-5 lg:pb-2" delay={0.1}>
            <p className="max-w-md text-[1.05rem] leading-relaxed text-ink-muted">
              The same room, before and after. Drag the divider, or focus it and use your arrow keys, to compare.
            </p>
          </Reveal>
        </div>

        <div className="mt-10 grid gap-6 lg:mt-12 lg:grid-cols-12 lg:gap-8">
          <Reveal className="lg:col-span-8">
            <div className="overflow-hidden rounded-[var(--radius-panel)] bg-petrol-800 p-2 sm:p-3">
              <div className="relative aspect-[16/9] overflow-hidden rounded-[var(--radius-card)] bg-porcelain-100">
                <AnimatePresence mode="wait" initial={false}>
                  <motion.div
                    key={pair.id}
                    className="absolute inset-0"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.35, ease: EASE }}
                  >
                    <CompareSlider
                      label={`Compare the ${pair.label.toLowerCase()} before and after`}
                      before={<PairLayer pair={pair} side="before" />}
                      after={<PairLayer pair={pair} side="after" />}
                    />
                  </motion.div>
                </AnimatePresence>
              </div>
              <div className="flex flex-wrap items-center justify-between gap-3 px-2 pb-1 pt-3 sm:px-3">
                <div role="tablist" aria-label="Rooms to compare" className="flex gap-1">
                  {showcasePairs.map((p, i) => {
                    const selected = p.id === pair.id;
                    return (
                      <button
                        key={p.id}
                        ref={(el) => {
                          tabRefs.current[p.id] = el;
                        }}
                        type="button"
                        role="tab"
                        id={`compare-tab-${p.id}`}
                        aria-selected={selected}
                        aria-controls="compare-panel"
                        tabIndex={selected ? 0 : -1}
                        onClick={() => setActiveId(p.id)}
                        onKeyDown={(e) => onKey(e, i)}
                        className={`on-dark relative rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                          selected ? "text-petrol-900" : "text-porcelain-50/75 hover:text-porcelain-50"
                        }`}
                      >
                        {selected && (
                          <motion.span
                            layoutId="compare-pill"
                            className="absolute inset-0 rounded-full bg-porcelain-50"
                            transition={{ duration: 0.45, ease: EASE }}
                          />
                        )}
                        <span className="relative">{p.label}</span>
                      </button>
                    );
                  })}
                </div>
                <p className="text-xs text-porcelain-50/60">{pair.caption}</p>
              </div>
            </div>
          </Reveal>

          <div
            id="compare-panel"
            role="tabpanel"
            aria-labelledby={`compare-tab-${pair.id}`}
            className="flex flex-col gap-6 lg:col-span-4"
          >
            <Reveal delay={0.1} className="rounded-[var(--radius-card)] border border-petrol-800/10 bg-porcelain-50 p-6">
              <p className="eyebrow text-brass-700">What changed</p>
              <AnimatePresence mode="wait" initial={false}>
                <motion.ul
                  key={pair.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.3, ease: EASE }}
                  className="mt-4 space-y-2.5"
                >
                  {pair.changes.map((c) => (
                    <li key={c} className="flex gap-3 text-[0.95rem] text-petrol-900">
                      <Icon name="check" size={17} strokeWidth={1.8} className="mt-0.5 shrink-0 text-seaglass-600" />
                      {c}
                    </li>
                  ))}
                </motion.ul>
              </AnimatePresence>
            </Reveal>
            <RevealMedia className="relative flex-1 overflow-hidden rounded-[var(--radius-card)]" from="left" delay={0.15}>
              <div className="relative h-full min-h-[220px]">
                <Image
                  src={media.showcaseDetail.src}
                  alt={media.showcaseDetail.alt}
                  fill
                  sizes="(min-width: 1024px) 30vw, 100vw"
                  placeholder="blur"
                  className="object-cover"
                  style={{ objectPosition: media.showcaseDetail.focus }}
                />
                <p className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-petrol-950/70 to-transparent p-5 pt-12 font-display text-[1.3rem] leading-snug text-porcelain-50">
                  Details first. <em className="serif-italic">Always.</em>
                </p>
              </div>
            </RevealMedia>
          </div>
        </div>
      </div>
    </section>
  );
}
