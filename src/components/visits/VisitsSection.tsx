"use client";

import { AnimatePresence, motion } from "motion/react";
import { useRef, useState, type KeyboardEvent } from "react";

import { useSite } from "@/components/providers/SiteProvider";
import { Icon } from "@/components/ui/Icon";
import { Reveal, RevealHeading } from "@/components/ui/Reveal";
import { oneTime, oneTimeMoments, recurring, recurringNote, type VisitOption } from "@/content/visits";

const EASE = [0.22, 1, 0.36, 1] as const;
const DAYS = ["M", "T", "W", "T", "F", "S", "S"];

/** Four weeks at a glance, with visit days marked. Decorative: the text says the same. */
function RhythmStrip({ option, tone }: { option: VisitOption; tone: "light" | "dark" }) {
  return (
    <div aria-hidden="true" className="grid grid-cols-7 gap-1.5">
      {DAYS.map((d, i) => (
        <span
          key={`h${i}`}
          className={`text-center text-[0.65rem] font-medium ${tone === "dark" ? "text-porcelain-50/70" : "text-petrol-800/70"}`}
        >
          {d}
        </span>
      ))}
      {Array.from({ length: 28 }, (_, i) => {
        const on = option.pattern.includes(i);
        return (
          <span
            key={i}
            className={`relative aspect-square rounded-[6px] ${
              tone === "dark" ? "bg-porcelain-50/8" : "bg-petrol-800/6"
            }`}
          >
            <AnimatePresence>
              {on && (
                <motion.span
                  key={`${option.id}-${i}`}
                  className={`absolute inset-0 rounded-[6px] ${tone === "dark" ? "bg-brass-300" : "bg-petrol-800"}`}
                  initial={{ scale: 0.3, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.3, opacity: 0 }}
                  transition={{ duration: 0.4, delay: (option.pattern.indexOf(i) || 0) * 0.07, ease: EASE }}
                />
              )}
            </AnimatePresence>
          </span>
        );
      })}
    </div>
  );
}

export function VisitsSection() {
  const { planClean } = useSite();
  const [active, setActive] = useState(recurring[0]);
  const radioRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  const onKey = (e: KeyboardEvent, index: number) => {
    const delta = e.key === "ArrowRight" || e.key === "ArrowDown" ? 1 : e.key === "ArrowLeft" || e.key === "ArrowUp" ? -1 : 0;
    if (!delta) return;
    e.preventDefault();
    const next = recurring[(index + delta + recurring.length) % recurring.length];
    setActive(next);
    radioRefs.current[next.id]?.focus();
  };

  return (
    <section id="visits" aria-labelledby="visits-heading" className="scroll-mt-24 bg-seaglass-100 py-14 lg:py-20">
      <div className="container-cs grid gap-10 lg:grid-cols-12 lg:gap-8">
        <div className="lg:col-span-4">
          <Reveal>
            <p className="eyebrow flex items-center gap-3 text-petrol-700">
              <span className="h-px w-8 bg-brass-500" aria-hidden="true" />
              Visits
            </p>
          </Reveal>
          <RevealHeading
            id="visits-heading"
            className="display-lg mt-5 text-petrol-900"
            lines={[
              "A clean that fits",
              <em key="i" className="serif-italic text-petrol-700">
                your routine.
              </em>,
            ]}
          />
          <Reveal delay={0.12}>
            <p className="mt-6 max-w-sm text-[1.02rem] leading-relaxed text-ink-muted">
              Book a single visit when you need one, or choose a rhythm that keeps things effortless.
            </p>
          </Reveal>
        </div>

        <div className="grid gap-4 md:grid-cols-12 lg:col-span-8">
          {/* One time: an open, light card with the moments it suits */}
          <Reveal className="flex flex-col rounded-[var(--radius-card)] bg-porcelain-50 p-6 sm:p-8 md:col-span-5">
            <div className="flex items-start justify-between">
              <h3 className="display-md text-petrol-900">{oneTime.label}</h3>
              <span className="grid h-11 w-11 place-items-center rounded-full border border-petrol-800/15 text-petrol-800">
                <Icon name="calendar" size={20} />
              </span>
            </div>
            <p className="mt-3 text-[0.97rem] leading-relaxed text-ink-muted">{oneTime.description}</p>
            <ul className="mt-6 divide-y divide-petrol-800/10 border-y border-petrol-800/10 text-[0.92rem] text-petrol-900">
              {oneTimeMoments.map((m) => (
                <li key={m} className="flex items-center gap-3 py-2.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-brass-500" aria-hidden="true" />
                  {m}
                </li>
              ))}
            </ul>
            <button
              type="button"
              className="btn btn-outline mt-7 w-full sm:w-auto sm:self-start"
              onClick={() => planClean({ frequency: "one-time", note: "One time visit selected." })}
            >
              Book a one time visit
              <Icon name="arrow" size={18} className="btn-arrow" />
            </button>
          </Reveal>

          {/* Recurring: a darker card with a rhythm you can try on */}
          <Reveal
            delay={0.08}
            className="on-dark flex flex-col rounded-[var(--radius-card)] bg-petrol-800 p-6 text-porcelain-50 sm:p-8 md:col-span-7"
          >
            <div className="flex flex-wrap items-start justify-between gap-4">
              <h3 className="display-md">Recurring</h3>
              <div
                role="radiogroup"
                aria-label="How often"
                className="flex rounded-full border border-porcelain-50/15 bg-petrol-900/40 p-1"
              >
                {recurring.map((opt, i) => {
                  const checked = opt.id === active.id;
                  return (
                    <button
                      key={opt.id}
                      ref={(el) => {
                        radioRefs.current[opt.id] = el;
                      }}
                      type="button"
                      role="radio"
                      aria-checked={checked}
                      tabIndex={checked ? 0 : -1}
                      onClick={() => setActive(opt)}
                      onKeyDown={(e) => onKey(e, i)}
                      className={`relative rounded-full px-3.5 py-2 text-[0.85rem] font-medium transition-colors sm:px-4 ${
                        checked ? "text-petrol-900" : "text-porcelain-50/75 hover:text-porcelain-50"
                      }`}
                    >
                      {checked && (
                        <motion.span
                          layoutId="rhythm-pill"
                          className="absolute inset-0 rounded-full bg-porcelain-50"
                          transition={{ duration: 0.45, ease: EASE }}
                        />
                      )}
                      <span className="relative">{opt.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="mt-6 grid gap-6 sm:grid-cols-[1fr_minmax(0,220px)] sm:items-center">
              <div aria-live="polite">
                <AnimatePresence mode="wait" initial={false}>
                  <motion.p
                    key={active.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.3, ease: EASE }}
                    className="font-display text-[1.35rem] leading-snug text-porcelain-50"
                  >
                    {active.description}
                  </motion.p>
                </AnimatePresence>
                <p className="mt-4 text-[0.9rem] leading-relaxed text-porcelain-50/65">{recurringNote}</p>
              </div>
              <RhythmStrip option={active} tone="dark" />
            </div>

            <button
              type="button"
              className="btn btn-light mt-8 w-full sm:w-auto sm:self-start"
              onClick={() =>
                planClean({ frequency: active.id, note: `${active.label} visits selected.` })
              }
            >
              Start {active.label.toLowerCase()} visits
              <Icon name="arrow" size={18} className="btn-arrow" />
            </button>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
