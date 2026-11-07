"use client";

import { AnimatePresence, motion } from "motion/react";
import Image, { type StaticImageData } from "next/image";
import { useRef, useState, type KeyboardEvent } from "react";

import { Icon } from "@/components/ui/Icon";
import { Reveal, RevealHeading, RevealMedia } from "@/components/ui/Reveal";
import { media } from "@/content/media";
import { showcaseEntries, type Pin, type ShowcaseEntry } from "@/content/showcase";
import { CompareSlider } from "./CompareSlider";
import { Gleam } from "@/components/ui/Motion";

const EASE = [0.22, 1, 0.36, 1] as const;
const FRAME = 3 / 2;

/**
 * Pins are stored as percentages of the photograph. The frame shows the photo
 * with object-fit: cover, so map them through the same centred crop.
 */
function mapPin(pin: Pin, img: StaticImageData) {
  const ratio = img.width / img.height;
  if (ratio > FRAME) {
    const scale = ratio / FRAME;
    return { x: (pin.x / 100) * scale * 100 - ((scale - 1) / 2) * 100, y: pin.y };
  }
  const scale = FRAME / ratio;
  return { x: pin.x, y: (pin.y / 100) * scale * 100 - ((scale - 1) / 2) * 100 };
}

function PinMark({
  pin,
  img,
  tone,
  labelled,
}: {
  pin: Pin;
  img: StaticImageData;
  tone: "regular" | "deep";
  labelled: boolean;
}) {
  const p = mapPin(pin, img);
  const labelLeft = p.x > 62;
  return (
    <span className="pointer-events-none absolute" style={{ left: `${p.x}%`, top: `${p.y}%` }}>
      <span
        className={`absolute left-0 top-0 -translate-x-1/2 -translate-y-1/2 rounded-full ${
          tone === "deep"
            ? "h-3 w-3 bg-[#ecd3a4] shadow-[0_0_0_3px_rgba(236,211,164,0.35),0_0_14px_2px_rgba(236,211,164,0.8)]"
            : "h-2.5 w-2.5 bg-porcelain-50 shadow-[0_0_0_3px_rgba(21,63,70,0.55)]"
        }`}
      />
      {labelled && (
        <span
          className={`absolute top-0 hidden -translate-y-1/2 whitespace-nowrap rounded-full px-2.5 py-1 text-[0.72rem] font-medium shadow-[0_8px_18px_-10px_rgba(0,0,0,0.55)] sm:block ${
            labelLeft ? "right-3" : "left-3"
          } ${tone === "deep" ? "bg-petrol-800 text-porcelain-50" : "bg-porcelain-50/95 text-petrol-900"}`}
        >
          {pin.label}
        </span>
      )}
    </span>
  );
}

function CoverageLayer({
  entry,
  side,
}: {
  entry: Extract<ShowcaseEntry, { kind: "coverage" }>;
  side: "regular" | "deep";
}) {
  const img = entry.photo.src;
  return (
    <div className="absolute inset-0">
      <Image
        src={img}
        alt={
          side === "regular"
            ? `${entry.photo.alt}. Marked with what a regular clean covers.`
            : `${entry.photo.alt}. Marked with what a deep clean adds.`
        }
        fill
        sizes="(min-width: 1024px) 60vw, 100vw"
        placeholder="blur"
        className="object-cover"
        draggable={false}
      />
      {side === "deep" && <div aria-hidden="true" className="inspection-grid absolute inset-0" />}
      {entry.regular.map((pin) => (
        <PinMark key={`r-${pin.label}`} pin={pin} img={img} tone="regular" labelled={side === "regular"} />
      ))}
      {side === "deep" &&
        entry.deep.map((pin) => <PinMark key={`d-${pin.label}`} pin={pin} img={img} tone="deep" labelled />)}
    </div>
  );
}

function PhotoLayer({ entry, side }: { entry: Extract<ShowcaseEntry, { kind: "photo" }>; side: "before" | "after" }) {
  return (
    <Image
      src={side === "before" ? entry.before : entry.after}
      alt={side === "before" ? entry.beforeAlt : entry.afterAlt}
      fill
      sizes="(min-width: 1024px) 60vw, 100vw"
      className="object-cover"
      draggable={false}
    />
  );
}

export function ShowcaseSection() {
  const [activeId, setActiveId] = useState(showcaseEntries[0].id);
  const entry = showcaseEntries.find((p) => p.id === activeId) ?? showcaseEntries[0];
  const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  const onKey = (e: KeyboardEvent, index: number) => {
    const delta =
      e.key === "ArrowRight" || e.key === "ArrowDown" ? 1 : e.key === "ArrowLeft" || e.key === "ArrowUp" ? -1 : 0;
    if (!delta) return;
    e.preventDefault();
    const next = showcaseEntries[(index + delta + showcaseEntries.length) % showcaseEntries.length];
    setActiveId(next.id);
    tabRefs.current[next.id]?.focus();
  };

  const isCoverage = entry.kind === "coverage";

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
              lines={["Regular or deep?", <Gleam key="i">See what changes.</Gleam>]}
            />
          </div>
          <Reveal className="lg:col-span-5 lg:pb-2" delay={0.1}>
            <p className="max-w-md text-[1.05rem] leading-relaxed text-ink-muted">
              Real rooms, real surfaces. Drag the divider, or focus it and use your arrow keys, to see what a deep clean
              reaches beyond a regular visit.
            </p>
          </Reveal>
        </div>

        <div className="mt-10 grid gap-6 lg:mt-12 lg:grid-cols-12 lg:gap-8">
          <Reveal className="lg:col-span-8">
            <div className="overflow-hidden rounded-[var(--radius-panel)] bg-petrol-800 p-2 sm:p-3">
              <div className="relative aspect-[3/2] overflow-hidden rounded-[var(--radius-card)] bg-petrol-900">
                <AnimatePresence mode="wait" initial={false}>
                  <motion.div
                    key={entry.id}
                    className="absolute inset-0"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.35, ease: EASE }}
                  >
                    {entry.kind === "coverage" ? (
                      <CompareSlider
                        label={`Compare a regular and a deep clean in the ${entry.label.toLowerCase()}`}
                        beforeLabel="Regular"
                        afterLabel="Deep"
                        before={<CoverageLayer entry={entry} side="regular" />}
                        after={<CoverageLayer entry={entry} side="deep" />}
                      />
                    ) : (
                      <CompareSlider
                        label={`Compare the ${entry.label.toLowerCase()} before and after`}
                        before={<PhotoLayer entry={entry} side="before" />}
                        after={<PhotoLayer entry={entry} side="after" />}
                      />
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>
              <div className="flex flex-wrap items-center justify-between gap-3 px-2 pb-1 pt-3 sm:px-3">
                <div role="tablist" aria-label="Rooms to compare" className="flex gap-1">
                  {showcaseEntries.map((p, i) => {
                    const selected = p.id === entry.id;
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
                <p className="text-xs text-porcelain-50/70">{entry.caption}</p>
              </div>
            </div>
          </Reveal>

          <div
            id="compare-panel"
            role="tabpanel"
            aria-labelledby={`compare-tab-${entry.id}`}
            className="flex flex-col gap-6 lg:col-span-4"
          >
            <Reveal
              delay={0.1}
              className="rounded-[var(--radius-card)] border border-petrol-800/10 bg-porcelain-50 p-6"
            >
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={entry.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.3, ease: EASE }}
                >
                  {isCoverage ? (
                    <>
                      <div className="flex items-baseline justify-between gap-3">
                        <p className="eyebrow text-brass-700">A deep clean adds</p>
                        <p className="text-xs text-ink-muted">
                          {entry.regular.length + entry.deep.length} areas in all
                        </p>
                      </div>
                      <ul className="mt-4 space-y-2.5">
                        {entry.deep.map((pin) => (
                          <li key={pin.label} className="flex items-center gap-3 text-[0.95rem] text-petrol-900">
                            <span
                              aria-hidden="true"
                              className="h-2.5 w-2.5 shrink-0 rounded-full bg-[#ecd3a4] shadow-[0_0_0_3px_rgba(185,138,78,0.25)]"
                            />
                            {pin.label}
                          </li>
                        ))}
                      </ul>
                      <p className="mt-5 border-t border-petrol-800/10 pt-4 text-[0.85rem] leading-relaxed text-ink-muted">
                        Every regular visit covers{" "}
                        {entry.regular
                          .map((p) => p.label.toLowerCase())
                          .join(", ")
                          .replace(/, ([^,]*)$/, " and $1")}
                        .
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="eyebrow text-brass-700">What changed</p>
                      <ul className="mt-4 space-y-2.5">
                        {entry.notes.map((c) => (
                          <li key={c} className="flex gap-3 text-[0.95rem] text-petrol-900">
                            <Icon
                              name="check"
                              size={17}
                              strokeWidth={1.8}
                              className="mt-0.5 shrink-0 text-seaglass-600"
                            />
                            {c}
                          </li>
                        ))}
                      </ul>
                    </>
                  )}
                </motion.div>
              </AnimatePresence>
            </Reveal>
            <RevealMedia
              className="relative flex-1 overflow-hidden rounded-[var(--radius-card)]"
              from="left"
              delay={0.15}
            >
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
