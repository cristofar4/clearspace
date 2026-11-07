"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState, type FormEvent } from "react";

import { useSite } from "@/components/providers/SiteProvider";
import { Icon, type IconName } from "@/components/ui/Icon";
import { bookingMode, bookingSteps, focusRooms, timeWindows } from "@/content/booking";
import { services } from "@/content/services";
import { frequencyLabel } from "@/content/visits";
import {
  allowedFrequencies,
  dateBounds,
  optionsFor,
  summaryRows,
  toPayload,
  validateAll,
  validateStep,
  type BookingDraft,
  type FieldErrors,
} from "@/lib/booking";
import { useClientValue } from "@/lib/hooks";
import { prefersReducedMotion } from "@/lib/scroll";
import { ChoiceCard, describedBy, FieldError, FieldShell } from "./fields";
import { RequestDialog, type RequestOutcome } from "./RequestDialog";
import { StepIndicator } from "./StepIndicator";

const EASE = [0.22, 1, 0.36, 1] as const;
const serviceIcon: Record<string, IconName> = { home: "home", office: "office", box: "box", ladder: "ladder" };

/** The order fields appear in, used to focus the first problem. */
const FIELD_ORDER: (keyof BookingDraft)[] = [
  "service",
  "propertyType",
  "size",
  "postcode",
  "town",
  "frequency",
  "date",
  "timeWindow",
  "name",
  "email",
  "phone",
  "notes",
];

function fieldId(key: keyof BookingDraft) {
  if (key === "service") return "bk-service-first";
  if (key === "timeWindow") return "bk-time-first";
  if (key === "frequency") return "bk-frequency-first";
  return `bk-${key}`;
}

export function BookingForm() {
  const { draft, updateDraft, resetDraft, step, setStep, prefillNote, clearPrefillNote } = useSite();
  const [errors, setErrors] = useState<FieldErrors>({});
  const [direction, setDirection] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [outcome, setOutcome] = useState<RequestOutcome | null>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const submitRef = useRef<HTMLButtonElement>(null);
  const moved = useRef(false);

  // Dates depend on the visitor's own calendar, so compute them in the browser
  const boundsKey = useClientValue(() => {
    const b = dateBounds();
    return `${b.min}|${b.max}`;
  }, "");
  const bounds = boundsKey ? { min: boundsKey.split("|")[0], max: boundsKey.split("|")[1] } : null;

  // Move focus to the new step's heading after a step change initiated in the form
  useEffect(() => {
    if (!moved.current) return;
    moved.current = false;
    const t = window.setTimeout(
      () => headingRef.current?.focus({ preventScroll: true }),
      prefersReducedMotion() ? 0 : 320,
    );
    return () => window.clearTimeout(t);
  }, [step]);

  const { types, sizes, group } = optionsFor(draft.service);
  const frequencies = allowedFrequencies(draft.service);
  const rows = summaryRows(draft);

  const set = <K extends keyof BookingDraft>(key: K, value: BookingDraft[K]) => {
    updateDraft({ [key]: value } as Partial<BookingDraft>);
    if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }));
  };

  const goTo = (next: number) => {
    setDirection(next > step ? 1 : -1);
    moved.current = true;
    setErrors({});
    setStep(next);
    const form = document.getElementById("booking-card");
    if (form && form.getBoundingClientRect().top < 80) {
      form.scrollIntoView({ behavior: prefersReducedMotion() ? "auto" : "smooth", block: "start" });
    }
  };

  const focusFirstError = (errs: FieldErrors) => {
    const first = FIELD_ORDER.find((k) => errs[k]);
    if (!first) return;
    window.setTimeout(() => {
      const el = document.getElementById(fieldId(first));
      el?.focus();
    }, 30);
  };

  const next = () => {
    const errs = validateStep(step, draft);
    if (Object.keys(errs).length) {
      setErrors(errs);
      focusFirstError(errs);
      return;
    }
    goTo(step + 1);
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (step < 3) {
      next();
      return;
    }
    const problem = validateAll(draft);
    if (problem) {
      goTo(problem.step);
      window.setTimeout(() => {
        setErrors(problem.errors);
        focusFirstError(problem.errors);
      }, 350);
      return;
    }
    const payload = toPayload(draft);
    if (bookingMode === "demo") {
      setOutcome({ kind: "demo", payload });
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/booking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(draft),
      });
      if (res.ok) setOutcome({ kind: "sent", name: draft.name.trim().split(" ")[0] });
      else {
        const body = (await res.json().catch(() => ({}))) as { error?: string };
        setOutcome({ kind: "error", message: body.error ?? "The booking service did not respond." });
      }
    } catch {
      setOutcome({ kind: "error", message: "We could not reach the booking service." });
    } finally {
      setSubmitting(false);
    }
  };

  const stepMeta = bookingSteps[step];

  return (
    <>
      <form
        id="booking-card"
        noValidate
        onSubmit={submit}
        className="scroll-mt-28 rounded-[var(--radius-panel)] border border-petrol-800/10 bg-porcelain-50 p-5 shadow-[0_40px_80px_-60px_rgba(13,47,53,0.5)] sm:p-8 lg:p-10"
      >
        <StepIndicator step={step} onSelect={goTo} />

        <AnimatePresence>
          {prefillNote && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.35, ease: EASE }}
              className="overflow-hidden"
            >
              <div
                className="mt-6 flex items-center gap-3 rounded-[14px] bg-seaglass-100 px-4 py-3 text-[0.9rem] text-petrol-900"
                role="status"
              >
                <Icon name="check" size={18} strokeWidth={2} className="shrink-0 text-seaglass-600" />
                <span className="flex-1">{prefillNote}</span>
                <button
                  type="button"
                  onClick={clearPrefillNote}
                  className="grid h-8 w-8 place-items-center rounded-full text-petrol-800 hover:bg-porcelain-50"
                  aria-label="Dismiss note"
                >
                  <Icon name="close" size={16} />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="relative mt-8">
          <AnimatePresence mode="wait" initial={false} custom={direction}>
            <motion.fieldset
              key={step}
              custom={direction}
              variants={{
                enter: (d: number) => ({ opacity: 0, x: d * 24 }),
                center: { opacity: 1, x: 0 },
                exit: (d: number) => ({ opacity: 0, x: d * -16 }),
              }}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.32, ease: EASE }}
              className="min-w-0"
            >
              <legend className="sr-only">{stepMeta.label}</legend>
              <h3 ref={headingRef} tabIndex={-1} className="display-md text-petrol-900 outline-none">
                <span className="mr-3 font-sans text-sm font-semibold tabular-nums text-brass-700">
                  {stepMeta.number}
                </span>
                {stepMeta.label}
              </h3>

              {step === 0 && (
                <div className="mt-6 grid gap-6">
                  <div
                    role="radiogroup"
                    aria-labelledby="bk-service-label"
                    aria-describedby={errors.service ? "bk-service-error" : undefined}
                  >
                    <p id="bk-service-label" className="mb-2 text-[0.9rem] font-medium text-petrol-900">
                      Service
                    </p>
                    <div className="grid gap-2.5 sm:grid-cols-2">
                      {services.map((s, i) => (
                        <ChoiceCard
                          key={s.id}
                          inputId={i === 0 ? "bk-service-first" : undefined}
                          name="service"
                          value={s.id}
                          checked={draft.service === s.id}
                          onChange={(v) => set("service", v as BookingDraft["service"])}
                          title={s.name}
                          detail={s.short}
                          icon={<Icon name={serviceIcon[s.icon]} size={19} />}
                        />
                      ))}
                    </div>
                    <FieldError id="bk-service-error" message={errors.service} />
                  </div>

                  <div className="grid gap-5 sm:grid-cols-2">
                    <FieldShell id="bk-propertyType" label="Property type" error={errors.propertyType}>
                      <select
                        id="bk-propertyType"
                        className="field"
                        value={draft.propertyType}
                        onChange={(e) => set("propertyType", e.target.value)}
                        aria-invalid={Boolean(errors.propertyType)}
                        aria-describedby={describedBy("bk-propertyType", errors.propertyType)}
                        required
                      >
                        <option value="">Select property type</option>
                        {types.map((t) => (
                          <option key={t}>{t}</option>
                        ))}
                      </select>
                    </FieldShell>
                    <FieldShell id="bk-size" label={group === "commercial" ? "Floor area" : "Size"} error={errors.size}>
                      <select
                        id="bk-size"
                        className="field"
                        value={draft.size}
                        onChange={(e) => set("size", e.target.value)}
                        aria-invalid={Boolean(errors.size)}
                        aria-describedby={describedBy("bk-size", errors.size)}
                        required
                      >
                        <option value="">Select size</option>
                        {sizes.map((t) => (
                          <option key={t}>{t}</option>
                        ))}
                      </select>
                    </FieldShell>
                  </div>

                  {group === "residential" && (
                    <fieldset>
                      <legend className="mb-2 flex w-full items-baseline justify-between text-[0.9rem] font-medium text-petrol-900">
                        Extra care for
                        <span className="text-xs font-normal text-ink-muted">Optional</span>
                      </legend>
                      <div className="flex flex-wrap gap-2">
                        {focusRooms.map((r) => {
                          const on = draft.focusRoom === r.id;
                          return (
                            <button
                              key={r.id}
                              type="button"
                              aria-pressed={on}
                              onClick={() => set("focusRoom", on ? "" : r.id)}
                              className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
                                on
                                  ? "border-petrol-800 bg-petrol-800 text-porcelain-50"
                                  : "border-porcelain-300 bg-white text-petrol-900 hover:border-porcelain-400"
                              }`}
                            >
                              {r.label}
                            </button>
                          );
                        })}
                      </div>
                    </fieldset>
                  )}

                  <div className="grid gap-5 sm:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
                    <FieldShell id="bk-postcode" label="Postcode" error={errors.postcode}>
                      <input
                        id="bk-postcode"
                        className="field uppercase placeholder:normal-case"
                        value={draft.postcode}
                        onChange={(e) => set("postcode", e.target.value)}
                        autoComplete="postal-code"
                        placeholder="Postcode"
                        aria-invalid={Boolean(errors.postcode)}
                        aria-describedby={describedBy("bk-postcode", errors.postcode)}
                        required
                      />
                    </FieldShell>
                    <FieldShell id="bk-town" label="Town or city" error={errors.town}>
                      <input
                        id="bk-town"
                        className="field"
                        value={draft.town}
                        onChange={(e) => set("town", e.target.value)}
                        autoComplete="address-level2"
                        aria-invalid={Boolean(errors.town)}
                        aria-describedby={describedBy("bk-town", errors.town)}
                        required
                      />
                    </FieldShell>
                  </div>
                </div>
              )}

              {step === 1 && (
                <div className="mt-6 grid gap-6">
                  <div role="radiogroup" aria-labelledby="bk-frequency-label">
                    <p id="bk-frequency-label" className="mb-2 text-[0.9rem] font-medium text-petrol-900">
                      How often
                    </p>
                    <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
                      {(["one-time", "weekly", "fortnightly", "monthly"] as const).map((f, i) => (
                        <ChoiceCard
                          key={f}
                          compact
                          inputId={i === 0 ? "bk-frequency-first" : undefined}
                          name="frequency"
                          value={f}
                          checked={draft.frequency === f}
                          disabled={!frequencies.includes(f)}
                          onChange={(v) => set("frequency", v as BookingDraft["frequency"])}
                          title={frequencyLabel[f]}
                        />
                      ))}
                    </div>
                    {frequencies.length === 1 && (
                      <p className="mt-2 text-[0.84rem] text-ink-muted">{rows.service} is booked as a single visit.</p>
                    )}
                    <FieldError id="bk-frequency-error" message={errors.frequency} />
                  </div>

                  <FieldShell
                    id="bk-date"
                    label={draft.frequency === "one-time" ? "Preferred date" : "Preferred first visit"}
                    hint="A preference, not a reservation. We confirm availability before anything is booked."
                    error={errors.date}
                  >
                    <input
                      id="bk-date"
                      type="date"
                      className="field"
                      value={draft.date}
                      min={bounds?.min}
                      max={bounds?.max}
                      onChange={(e) => set("date", e.target.value)}
                      aria-invalid={Boolean(errors.date)}
                      aria-describedby={describedBy(
                        "bk-date",
                        errors.date,
                        "A preference, not a reservation. We confirm availability before anything is booked.",
                      )}
                      required
                    />
                  </FieldShell>

                  <div role="radiogroup" aria-labelledby="bk-time-label">
                    <p id="bk-time-label" className="mb-2 text-[0.9rem] font-medium text-petrol-900">
                      Time of day
                    </p>
                    <div className="grid gap-2.5 sm:grid-cols-3">
                      {timeWindows.map((t, i) => (
                        <ChoiceCard
                          key={t.id}
                          inputId={i === 0 ? "bk-time-first" : undefined}
                          name="timeWindow"
                          value={t.id}
                          checked={draft.timeWindow === t.id}
                          onChange={(v) => set("timeWindow", v)}
                          title={t.label}
                          detail={t.detail}
                          describedById={errors.timeWindow ? "bk-time-error" : undefined}
                          icon={<Icon name="clock" size={18} />}
                        />
                      ))}
                    </div>
                    <FieldError id="bk-time-error" message={errors.timeWindow} />
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="mt-6 grid gap-5 sm:grid-cols-2">
                  <FieldShell id="bk-name" label="Full name" error={errors.name} className="sm:col-span-2">
                    <input
                      id="bk-name"
                      className="field"
                      value={draft.name}
                      onChange={(e) => set("name", e.target.value)}
                      autoComplete="name"
                      aria-invalid={Boolean(errors.name)}
                      aria-describedby={describedBy("bk-name", errors.name)}
                      required
                    />
                  </FieldShell>
                  <FieldShell id="bk-email" label="Email" error={errors.email}>
                    <input
                      id="bk-email"
                      type="email"
                      inputMode="email"
                      className="field"
                      value={draft.email}
                      onChange={(e) => set("email", e.target.value)}
                      autoComplete="email"
                      aria-invalid={Boolean(errors.email)}
                      aria-describedby={describedBy("bk-email", errors.email)}
                      required
                    />
                  </FieldShell>
                  <FieldShell id="bk-phone" label="Phone" error={errors.phone}>
                    <input
                      id="bk-phone"
                      type="tel"
                      inputMode="tel"
                      className="field"
                      value={draft.phone}
                      onChange={(e) => set("phone", e.target.value)}
                      autoComplete="tel"
                      aria-invalid={Boolean(errors.phone)}
                      aria-describedby={describedBy("bk-phone", errors.phone)}
                      required
                    />
                  </FieldShell>
                  <FieldShell
                    id="bk-notes"
                    label="Anything we should know"
                    hint="Access, parking, pets or rooms to skip."
                    error={errors.notes}
                    optional
                    className="sm:col-span-2"
                  >
                    <textarea
                      id="bk-notes"
                      className="field"
                      value={draft.notes}
                      maxLength={600}
                      onChange={(e) => set("notes", e.target.value)}
                      aria-invalid={Boolean(errors.notes)}
                      aria-describedby={describedBy(
                        "bk-notes",
                        errors.notes,
                        "Access, parking, pets or rooms to skip.",
                      )}
                    />
                  </FieldShell>
                </div>
              )}

              {step === 3 && (
                <div className="mt-6">
                  <p className="text-[0.97rem] text-ink-muted">Check the details below. You can edit any section.</p>
                  <dl className="mt-5 divide-y divide-petrol-800/10 border-y border-petrol-800/10">
                    {[
                      { label: "Service", value: [rows.service, rows.focus].filter(Boolean).join(". "), step: 0 },
                      { label: "Space", value: rows.space, step: 0 },
                      { label: "Location", value: rows.location, step: 0 },
                      { label: "Visits", value: rows.visits, step: 1 },
                      { label: "Preferred date", value: [rows.date, rows.time].filter(Boolean).join(", "), step: 1 },
                      { label: "Contact", value: rows.contact, step: 2 },
                      { label: "Notes", value: rows.notes || "None", step: 2 },
                      { label: "Price", value: rows.price, step: -1 },
                    ].map((row) => (
                      <div
                        key={row.label}
                        className="grid grid-cols-[minmax(0,7.5rem)_1fr_auto] items-start gap-3 py-3.5 sm:grid-cols-[10rem_1fr_auto]"
                      >
                        <dt className="text-[0.85rem] text-ink-muted">{row.label}</dt>
                        <dd className="min-w-0 break-words text-[0.95rem] text-petrol-900">{row.value}</dd>
                        {row.step >= 0 ? (
                          <button
                            type="button"
                            onClick={() => goTo(row.step)}
                            className="inline-flex items-center gap-1 rounded-full px-2 py-1 text-[0.82rem] font-medium text-petrol-700 hover:bg-seaglass-50"
                            aria-label={`Edit ${row.label.toLowerCase()}`}
                          >
                            <Icon name="edit" size={14} />
                            Edit
                          </button>
                        ) : (
                          <span />
                        )}
                      </div>
                    ))}
                  </dl>
                  {bookingMode === "demo" && (
                    <p className="mt-5 flex items-start gap-3 rounded-[14px] border border-brass-300 bg-brass-200/30 px-4 py-3 text-[0.88rem] text-petrol-900">
                      <Icon name="info" size={18} className="mt-0.5 shrink-0 text-brass-700" />
                      <span>
                        <strong className="font-semibold">Demo mode.</strong> Submitting will not send your details or
                        book a visit.
                      </span>
                    </p>
                  )}
                </div>
              )}
            </motion.fieldset>
          </AnimatePresence>
        </div>

        <div className="mt-8 flex flex-col-reverse gap-3 border-t border-petrol-800/10 pt-6 sm:flex-row sm:items-center sm:justify-between">
          {step > 0 ? (
            <button type="button" className="btn btn-outline" onClick={() => goTo(step - 1)}>
              <Icon name="chevronLeft" size={18} />
              Back
            </button>
          ) : (
            <p className="text-[0.82rem] text-ink-muted">Takes about two minutes. No payment needed.</p>
          )}
          {step < 3 ? (
            // Distinct keys: reusing one element and flipping it to type="submit" mid click would submit the form
            <button key="next" type="button" className="btn btn-primary" onClick={next}>
              Continue to {bookingSteps[step + 1].label.toLowerCase()}
              <Icon name="arrow" size={18} className="btn-arrow" />
            </button>
          ) : (
            <button key="submit" ref={submitRef} type="submit" className="btn btn-primary" disabled={submitting}>
              {bookingMode === "demo" ? "Send demo request" : submitting ? "Sending" : "Send booking request"}
              <Icon name="arrow" size={18} className="btn-arrow" />
            </button>
          )}
        </div>
      </form>

      <RequestDialog
        outcome={outcome}
        onClose={() => {
          setOutcome(null);
          submitRef.current?.focus();
        }}
        onStartAgain={() => {
          setOutcome(null);
          resetDraft();
          moved.current = true;
        }}
      />
    </>
  );
}
