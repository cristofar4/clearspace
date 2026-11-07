"use client";

import { motion } from "motion/react";

import { Icon } from "@/components/ui/Icon";
import { bookingSteps } from "@/content/booking";

const EASE = [0.22, 1, 0.36, 1] as const;

/**
 * Four connected steps. The track fills as you progress; completed steps can
 * be revisited, later steps unlock as each one is validated.
 */
export function StepIndicator({ step, onSelect }: { step: number; onSelect: (step: number) => void }) {
  const progress = step / (bookingSteps.length - 1);
  return (
    <nav aria-label="Booking progress">
      <ol className="relative grid grid-cols-4">
        <span aria-hidden="true" className="absolute left-[12.5%] right-[12.5%] top-[17px] h-px bg-petrol-800/15" />
        <motion.span
          aria-hidden="true"
          className="absolute left-[12.5%] right-[12.5%] top-[16.5px] h-[2px] origin-left bg-petrol-800"
          initial={false}
          animate={{ scaleX: progress }}
          transition={{ duration: 0.7, ease: EASE }}
        />
        {bookingSteps.map((s, i) => {
          const done = i < step;
          const current = i === step;
          return (
            <li key={s.id} className="relative flex flex-col items-center text-center">
              <button
                type="button"
                onClick={() => onSelect(i)}
                disabled={!done}
                aria-current={current ? "step" : undefined}
                aria-label={`${s.label}${done ? ", completed" : current ? ", current step" : ""}`}
                className="group flex flex-col items-center gap-2 disabled:cursor-default"
              >
                <span
                  className={`relative grid h-[34px] w-[34px] place-items-center rounded-full border text-[0.75rem] font-semibold tabular-nums transition-colors duration-500 ${
                    done
                      ? "border-petrol-800 bg-petrol-800 text-porcelain-50 group-hover:bg-petrol-700"
                      : current
                        ? "border-petrol-800 bg-porcelain-50 text-petrol-900"
                        : "border-petrol-800/20 bg-porcelain-50 text-petrol-800/75"
                  }`}
                >
                  {done ? <Icon name="check" size={15} strokeWidth={2.2} /> : s.number}
                  {current && (
                    <motion.span
                      layoutId="step-ring"
                      aria-hidden="true"
                      className="absolute -inset-[5px] rounded-full border border-brass-500"
                      transition={{ duration: 0.55, ease: EASE }}
                    />
                  )}
                </span>
                <span
                  className={`text-[0.78rem] leading-tight sm:text-[0.84rem] ${
                    current ? "font-semibold text-petrol-900" : done ? "text-petrol-800" : "text-petrol-800/75"
                  }`}
                >
                  {s.label}
                </span>
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
