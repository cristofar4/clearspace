"use client";

import { AnimatePresence, motion, useIsPresent } from "motion/react";
import Image from "next/image";
import { useRef, type CSSProperties, type KeyboardEvent } from "react";

import { useSite } from "@/components/providers/SiteProvider";
import { Icon, type IconName } from "@/components/ui/Icon";
import { Reveal, RevealHeading } from "@/components/ui/Reveal";
import { serviceById, services, type Service, type ServiceId } from "@/content/services";
import { frequencyLabel } from "@/content/visits";
import { Gleam, PointerGlow } from "@/components/ui/Motion";
import { BUTTON_BOLT, LightningOutline } from "@/components/ui/Lightning";

const EASE = [0.22, 1, 0.36, 1] as const;

const iconFor: Record<Service["icon"], IconName> = {
  home: "home",
  office: "office",
  box: "box",
  ladder: "ladder",
};

/** The incoming photo wipes across the outgoing one, in the same direction as the Reset. */
function ServicePhoto({ service, priority }: { service: Service; priority: boolean }) {
  const isPresent = useIsPresent();
  return (
    <motion.div
      className="absolute inset-0"
      style={{ zIndex: isPresent ? 2 : 1 }}
      initial={{ clipPath: "inset(0% 100% 0% 0%)" }}
      animate={{ clipPath: "inset(0% 0% 0% 0%)" }}
      exit={{ opacity: 0.999, transition: { duration: 0.95 } }}
      transition={{ duration: 0.95, ease: [0.65, 0, 0.35, 1] }}
    >
      {isPresent && (
        <motion.span
          aria-hidden="true"
          className="scan-line-v pointer-events-none absolute inset-y-0 z-10 w-[2px]"
          initial={{ left: "0%", opacity: 0 }}
          animate={{ left: "100%", opacity: [0, 1, 1, 0] }}
          transition={{
            left: { duration: 0.95, ease: [0.65, 0, 0.35, 1] },
            opacity: { duration: 0.95, times: [0, 0.08, 0.85, 1] },
          }}
        />
      )}
      <motion.div
        className="relative h-full w-full"
        initial={{ scale: 1.08 }}
        animate={{ scale: 1 }}
        transition={{ duration: 1.4, ease: EASE }}
      >
        <Image
          src={service.photo.src}
          alt={service.photo.alt}
          fill
          sizes="(min-width: 1440px) 820px, (min-width: 1024px) 56vw, 100vw"
          placeholder="blur"
          className="object-cover"
          style={{ objectPosition: service.photo.focus }}
          loading={priority ? "eager" : "lazy"}
        />
      </motion.div>
    </motion.div>
  );
}

export function ServicesSection() {
  const { activeService, showService, planClean } = useSite();
  const service = serviceById[activeService];
  const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  const onKey = (e: KeyboardEvent<HTMLButtonElement>, index: number) => {
    const map: Record<string, number> = {
      ArrowDown: index + 1,
      ArrowRight: index + 1,
      ArrowUp: index - 1,
      ArrowLeft: index - 1,
      Home: 0,
      End: services.length - 1,
    };
    if (!(e.key in map)) return;
    e.preventDefault();
    const next = services[(map[e.key] + services.length) % services.length];
    showService(next.id);
    tabRefs.current[next.id]?.focus();
  };

  return (
    <section id="services" aria-labelledby="services-heading" className="scroll-mt-24 py-14 lg:py-20">
      <div className="container-cs">
        <div className="on-dark relative overflow-hidden rounded-[var(--radius-panel)] bg-petrol-800 text-porcelain-50">
          <PointerGlow />
          {/* a single quiet diagonal, echoing the wipe */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -left-24 top-0 hidden h-full w-[46%] -skew-x-[14deg] bg-petrol-900/35 lg:block"
          />
          <div className="relative grid lg:grid-cols-12">
            {/* ---------- index ---------- */}
            <div className="p-6 pb-2 sm:p-10 lg:col-span-5 lg:p-12 lg:pr-6 xl:p-14">
              <div className="lg:sticky lg:top-28">
                <Reveal>
                  <p className="eyebrow flex items-center gap-3 text-brass-300">
                    <span className="h-px w-8 bg-brass-300/70" aria-hidden="true" />
                    Services
                  </p>
                </Reveal>
                <RevealHeading
                  id="services-heading"
                  className="display-lg mt-5 text-porcelain-50"
                  lines={["Different spaces.", <Gleam key="i">One thoughtful standard.</Gleam>]}
                />

                <div
                  role="tablist"
                  aria-label="Services"
                  aria-orientation="vertical"
                  className="mt-8 grid grid-cols-2 gap-2 lg:mt-12 lg:grid-cols-1 lg:gap-0"
                >
                  {services.map((s, i) => {
                    const selected = s.id === activeService;
                    return (
                      <button
                        key={s.id}
                        ref={(el) => {
                          tabRefs.current[s.id] = el;
                        }}
                        role="tab"
                        type="button"
                        id={`service-tab-${s.id}`}
                        data-service-tab={s.id}
                        aria-selected={selected}
                        aria-controls="service-panel"
                        tabIndex={selected ? 0 : -1}
                        onClick={() => showService(s.id)}
                        onKeyDown={(e) => onKey(e, i)}
                        className={`group relative flex flex-col rounded-[14px] border p-3 text-left transition-colors duration-300 lg:rounded-none lg:border-0 lg:border-t lg:px-0 lg:py-4 ${
                          selected
                            ? "border-porcelain-50/40 bg-porcelain-50/8 lg:border-porcelain-50/15 lg:bg-transparent"
                            : "border-porcelain-50/12 hover:border-porcelain-50/30 lg:border-porcelain-50/15"
                        }`}
                      >
                        <span className="flex items-baseline gap-3">
                          <span
                            className={`text-xs tabular-nums transition-colors ${
                              selected ? "text-brass-300" : "text-porcelain-50/70"
                            }`}
                          >
                            {s.number}
                          </span>
                          <span
                            className={`font-display text-[1.15rem] leading-tight transition-colors sm:text-[1.35rem] lg:text-[1.75rem] ${
                              selected ? "text-porcelain-50" : "text-porcelain-50/60 group-hover:text-porcelain-50/90"
                            }`}
                          >
                            {s.name}
                          </span>
                          {s.badge && (
                            <span className="ml-auto hidden rounded-full border border-porcelain-50/20 px-2 py-0.5 text-[0.68rem] text-seaglass-200 xl:inline">
                              {s.badge}
                            </span>
                          )}
                        </span>
                        <AnimatePresence initial={false}>
                          {selected && (
                            <motion.span
                              className="hidden overflow-hidden lg:block"
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.45, ease: EASE }}
                            >
                              <span className="block pl-8 pt-2 text-[0.95rem] leading-relaxed text-porcelain-50/70">
                                {s.short}
                              </span>
                            </motion.span>
                          )}
                        </AnimatePresence>
                        {selected && (
                          <motion.span
                            layoutId="service-indicator"
                            aria-hidden="true"
                            className="absolute -top-px left-0 hidden h-[2px] w-16 bg-brass-300 lg:block"
                            transition={{ duration: 0.55, ease: EASE }}
                          />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* ---------- detail ---------- */}
            <div
              role="tabpanel"
              id="service-panel"
              aria-labelledby={`service-tab-${service.id}`}
              className="p-3 pt-4 sm:p-4 lg:col-span-7 lg:p-4 lg:pl-0"
            >
              <div className="relative aspect-[4/3] overflow-hidden rounded-[var(--radius-card)] bg-petrol-900 sm:aspect-[16/10]">
                <AnimatePresence initial={false}>
                  <ServicePhoto key={service.id} service={service} priority={false} />
                </AnimatePresence>
                <div className="notch z-10" style={{ "--notch-bg": "var(--color-petrol-800)" } as CSSProperties}>
                  <span className="flex items-center gap-3 pl-1">
                    <span className="grid h-10 w-10 place-items-center rounded-full border border-porcelain-50/25 text-porcelain-50">
                      <Icon name={iconFor[service.icon]} size={19} />
                    </span>
                    <AnimatePresence mode="wait" initial={false}>
                      <motion.span
                        key={service.id}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                        transition={{ duration: 0.3, ease: EASE }}
                        className="font-display text-[1.6rem] leading-none tabular-nums text-porcelain-50"
                      >
                        {service.number}
                      </motion.span>
                    </AnimatePresence>
                  </span>
                </div>
              </div>

              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={service.id}
                  initial="hidden"
                  animate="show"
                  exit="exit"
                  variants={{
                    hidden: {},
                    show: { transition: { staggerChildren: 0.06, delayChildren: 0.12 } },
                    exit: { opacity: 0, transition: { duration: 0.18 } },
                  }}
                  className="grid gap-8 px-3 pb-6 pt-7 sm:px-6 md:grid-cols-2 lg:px-6 xl:gap-10"
                >
                  <motion.div variants={fadeUp}>
                    <h3 className="display-md text-porcelain-50">{service.name}</h3>
                    <p className="mt-3 text-[1rem] leading-relaxed text-porcelain-50/75">{service.summary}</p>
                    <p className="mt-5 text-sm text-porcelain-50/60">
                      <span className="text-brass-300">Good for </span>
                      {service.goodFor}
                    </p>
                    <ul className="mt-5 flex flex-wrap gap-2" aria-label="Visit styles">
                      {service.styles.map((style) => (
                        <li
                          key={style}
                          className="rounded-full border border-porcelain-50/20 px-3 py-1.5 text-[0.82rem] text-porcelain-50/85"
                        >
                          {style}
                        </li>
                      ))}
                    </ul>
                  </motion.div>
                  <motion.div variants={fadeUp}>
                    <p className="eyebrow text-brass-300">What is included</p>
                    <ul className="mt-4 divide-y divide-porcelain-50/10 border-y border-porcelain-50/10">
                      {service.included.map((item) => (
                        <li key={item} className="flex gap-3 py-2.5 text-[0.95rem] text-porcelain-50/90">
                          <Icon
                            name="check"
                            size={17}
                            strokeWidth={1.8}
                            className="mt-0.5 shrink-0 text-seaglass-300"
                          />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </motion.div>
                  <motion.div
                    variants={fadeUp}
                    className="flex flex-col gap-4 border-t border-porcelain-50/12 pt-5 sm:flex-row sm:items-center sm:justify-between md:col-span-2"
                  >
                    <p className="text-sm text-porcelain-50/65">
                      <span className="text-porcelain-50">{service.priceFrom ?? "Tailored quote"}</span>
                      <span className="mx-2 text-porcelain-50/30">·</span>
                      {service.frequencies.map((f) => frequencyLabel[f]).join(", ")}
                    </p>
                    <button
                      type="button"
                      className="btn btn-light"
                      onClick={() => planClean({ service: service.id as ServiceId, note: `${service.name} selected.` })}
                    >
                      <LightningOutline hover onMount={false} options={BUTTON_BOLT} />
                      Plan this clean
                      <Icon name="arrow" size={18} className="btn-arrow" />
                    </button>
                  </motion.div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

const fadeUp = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE } },
};
