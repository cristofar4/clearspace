"use client";

import { MotionConfig } from "motion/react";
import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";

import type { Frequency, ServiceId } from "@/content/services";
import { emptyDraft, normaliseDraft, type BookingDraft, type FocusRoom } from "@/lib/booking";
import { goToSection } from "@/lib/scroll";

interface PlanOptions {
  service?: ServiceId;
  focusRoom?: FocusRoom;
  frequency?: Frequency;
  /** A short, human note shown in the booking form, e.g. "Kitchen focus added". */
  note?: string;
}

interface SiteState {
  draft: BookingDraft;
  updateDraft: (patch: Partial<BookingDraft>) => void;
  resetDraft: () => void;
  step: number;
  setStep: (step: number) => void;
  prefillNote: string | null;
  clearPrefillNote: () => void;
  activeService: ServiceId;
  showService: (id: ServiceId, opts?: { scroll?: boolean }) => void;
  planClean: (opts: PlanOptions) => void;
}

const SiteContext = createContext<SiteState | null>(null);

export function SiteProvider({ children }: { children: ReactNode }) {
  const [draft, setDraft] = useState<BookingDraft>(emptyDraft);
  const [step, setStep] = useState(0);
  const [prefillNote, setPrefillNote] = useState<string | null>(null);
  const [activeService, setActiveService] = useState<ServiceId>("home");

  const updateDraft = useCallback((patch: Partial<BookingDraft>) => {
    setDraft((prev) => normaliseDraft({ ...prev, ...patch }));
  }, []);

  const resetDraft = useCallback(() => {
    setDraft(emptyDraft);
    setStep(0);
    setPrefillNote(null);
  }, []);

  const showService = useCallback((id: ServiceId, opts?: { scroll?: boolean }) => {
    setActiveService(id);
    if (opts?.scroll) goToSection("services", `[data-service-tab="${id}"]`);
  }, []);

  const planClean = useCallback((opts: PlanOptions) => {
    setDraft((prev) => {
      const patch: Partial<BookingDraft> = {};
      if (opts.service) patch.service = opts.service;
      if (opts.focusRoom) patch.focusRoom = opts.focusRoom;
      if (opts.frequency) patch.frequency = opts.frequency;
      // A recurring rhythm only makes sense for services that offer it
      if (opts.frequency && opts.frequency !== "one-time" && !opts.service) {
        const current = prev.service;
        if (current === "move-out" || current === "after-builders") patch.service = "home";
      }
      return normaliseDraft({ ...prev, ...patch });
    });
    setStep(0);
    setPrefillNote(opts.note ?? null);
    goToSection("book", "#book-heading");
  }, []);

  const value = useMemo<SiteState>(
    () => ({
      draft,
      updateDraft,
      resetDraft,
      step,
      setStep,
      prefillNote,
      clearPrefillNote: () => setPrefillNote(null),
      activeService,
      showService,
      planClean,
    }),
    [draft, updateDraft, resetDraft, step, prefillNote, activeService, showService, planClean],
  );

  return (
    <SiteContext.Provider value={value}>
      <MotionConfig reducedMotion="user" transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}>
        {children}
      </MotionConfig>
    </SiteContext.Provider>
  );
}

export function useSite() {
  const ctx = useContext(SiteContext);
  if (!ctx) throw new Error("useSite must be used inside SiteProvider");
  return ctx;
}
