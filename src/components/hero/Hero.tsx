"use client";

import { motion } from "motion/react";

import { Icon } from "@/components/ui/Icon";
import { HouseExplorer } from "./HouseExplorer";

const EASE = [0.22, 1, 0.36, 1] as const;

export function Hero() {
  return (
    <section id="top" aria-labelledby="hero-heading" className="relative pt-[104px] pb-6 sm:pt-[118px] lg:pb-8">
      <div className="container-cs grid gap-y-10 lg:grid-cols-12 lg:gap-x-10 xl:gap-x-14">
        <div className="flex min-w-0 flex-col lg:col-span-5 lg:pt-6 xl:pt-10">
          <motion.p
            className="eyebrow flex items-center gap-3 text-petrol-700"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: EASE }}
          >
            <span className="h-px w-8 bg-brass-500" aria-hidden="true" />
            Homes and workplaces
          </motion.p>

          <h1 id="hero-heading" className="display-xl mt-6 text-petrol-900">
            {[
              <>Life happens.</>,
              <em key="i" className="serif-italic text-petrol-700">
                We reset
              </em>,
              <>the space.</>,
            ].map((line, i) => (
              <span key={i} className="block overflow-hidden pb-[0.1em] -mb-[0.1em]">
                <motion.span
                  className="block"
                  initial={{ y: "108%" }}
                  animate={{ y: "0%" }}
                  transition={{ duration: 1, delay: 0.12 + i * 0.09, ease: EASE }}
                >
                  {line}
                </motion.span>
              </span>
            ))}
          </h1>

          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.45, ease: EASE }}
          >
            <p className="mt-7 max-w-[30rem] text-[1.075rem] leading-relaxed text-ink-muted">
              Thoughtful, thorough cleaning that brings calm back to the places you live and work. Choose a room in the
              house to see a Clearspace reset.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <a href="#book" className="btn btn-primary">
                Book a clean
                <Icon name="arrow" size={18} className="btn-arrow" />
              </a>
              <a href="#services" className="btn btn-outline">
                Explore services
              </a>
            </div>

            <dl className="mt-10 grid max-w-[30rem] grid-cols-3 border-t border-petrol-800/12 pt-5 text-sm">
              {[
                ["Visits", "One time or recurring"],
                ["Spaces", "Homes and offices"],
                ["Also", "Move outs and renovations"],
              ].map(([term, detail]) => (
                <div key={term} className="pr-3">
                  <dt className="eyebrow text-[0.66rem] text-brass-700">{term}</dt>
                  <dd className="mt-2 leading-snug text-petrol-900">{detail}</dd>
                </div>
              ))}
            </dl>
          </motion.div>
        </div>

        <motion.div
          className="min-w-0 lg:col-span-7"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.1, delay: 0.2, ease: EASE }}
        >
          <HouseExplorer />
        </motion.div>
      </div>
    </section>
  );
}
