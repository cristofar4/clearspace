"use client";

import { AnimatePresence, motion } from "motion/react";
import Image from "next/image";

import { useSite } from "@/components/providers/SiteProvider";
import { Icon, type IconName } from "@/components/ui/Icon";
import { Reveal, RevealHeading } from "@/components/ui/Reveal";
import { bookingMode } from "@/content/booking";
import { media } from "@/content/media";
import { summaryRows } from "@/lib/booking";
import { BookingForm } from "./BookingForm";

const EASE = [0.22, 1, 0.36, 1] as const;

function Summary() {
  const { draft } = useSite();
  const rows = summaryRows(draft);
  const items: { icon: IconName; label: string; value: string }[] = [
    { icon: "home", label: "Service", value: [rows.service, rows.focus].filter(Boolean).join(". ") },
    { icon: "box", label: "Space", value: rows.space },
    { icon: "pin", label: "Location", value: rows.location },
    { icon: "calendar", label: "Visits", value: rows.visits },
    { icon: "clock", label: "Preferred date", value: [rows.date, rows.time].filter(Boolean).join(", ") },
    { icon: "user", label: "Contact", value: rows.contact },
  ];
  const filled = items.filter((i) => i.value).length;

  return (
    <section
      aria-label="Your booking summary"
      className="on-dark overflow-hidden rounded-[var(--radius-panel)] bg-petrol-800 text-porcelain-50 lg:sticky lg:top-24"
    >
      <div className="relative aspect-[16/9] lg:aspect-[16/8]">
        <Image
          src={media.bookingCalmRoom.src}
          alt=""
          fill
          sizes="(min-width: 1024px) 34vw, 100vw"
          placeholder="blur"
          className="object-cover"
          style={{ objectPosition: media.bookingCalmRoom.focus }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-petrol-800 via-petrol-800/10 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 flex items-end justify-between p-6">
          <p className="font-display text-[1.6rem] leading-none">Your clean</p>
          <p className="text-xs text-porcelain-50/75" aria-live="polite">
            {filled} of {items.length} chosen
          </p>
        </div>
      </div>
      <ul className="divide-y divide-porcelain-50/10 px-6 pb-2">
        {items.map((item) => (
          <li key={item.label} className="flex gap-4 py-3.5">
            <Icon name={item.icon} size={18} className="mt-0.5 shrink-0 text-seaglass-300" />
            <div className="min-w-0 flex-1">
              <p className="text-[0.72rem] font-semibold uppercase tracking-[0.14em] text-porcelain-50/70">
                {item.label}
                <span className="sr-only">:</span>
              </p>
              <AnimatePresence mode="wait" initial={false}>
                <motion.p
                  key={item.value || "empty"}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.25, ease: EASE }}
                  className={`mt-1 break-words text-[0.95rem] ${item.value ? "text-porcelain-50" : "text-porcelain-50/70"}`}
                >
                  {item.value || "Not chosen yet"}
                </motion.p>
              </AnimatePresence>
            </div>
          </li>
        ))}
      </ul>
      <div className="mx-6 mb-6 mt-2 flex items-center justify-between rounded-[14px] bg-petrol-900/50 px-4 py-3 text-sm">
        <span className="text-porcelain-50/65">Price</span>
        <span>{rows.price || "Tailored quote"}</span>
      </div>
      {bookingMode === "demo" && (
        <p className="flex items-start gap-2.5 border-t border-porcelain-50/10 px-6 py-4 text-[0.8rem] leading-snug text-porcelain-50/65">
          <Icon name="info" size={16} className="mt-0.5 shrink-0 text-brass-300" />
          Demo booking form. Requests are not sent while the site is in demo mode.
        </p>
      )}
    </section>
  );
}

export function BookingSection() {
  return (
    <section id="book" aria-labelledby="book-heading" className="scroll-mt-24 py-14 lg:py-20">
      <div className="container-cs">
        <div className="grid gap-6 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-7">
            <Reveal>
              <p className="eyebrow flex items-center gap-3 text-petrol-700">
                <span className="h-px w-8 bg-brass-500" aria-hidden="true" />
                Book a clean
              </p>
            </Reveal>
            <RevealHeading
              id="book-heading"
              tabIndex={-1}
              className="display-lg mt-5 text-petrol-900 outline-none"
              lines={[
                <>
                  Make room for <em className="serif-italic text-petrol-700">yourself.</em>
                </>,
              ]}
            />
          </div>
          <Reveal delay={0.1} className="lg:col-span-5 lg:pb-2">
            <p className="max-w-md text-[1.05rem] leading-relaxed text-ink-muted">
              Tell us about your space and when suits you. We confirm availability before anything is booked.
            </p>
          </Reveal>
        </div>

        <div className="mt-10 grid items-start gap-6 lg:mt-12 lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-7 xl:col-span-8">
            <BookingForm />
          </div>
          <div className="lg:col-span-5 xl:col-span-4">
            <Summary />
          </div>
        </div>
      </div>
    </section>
  );
}
