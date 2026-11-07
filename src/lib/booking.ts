import { maxDaysAhead, propertySizes, propertyTypes, timeWindows } from "@/content/booking";
import { isServiceId, serviceById, type Frequency, type ServiceId } from "@/content/services";
import { frequencyLabel } from "@/content/visits";

export type RoomId = "kitchen" | "living" | "bath";
export type FocusRoom = RoomId | "whole";

export interface BookingDraft {
  service: ServiceId | "";
  propertyType: string;
  size: string;
  focusRoom: FocusRoom | "";
  postcode: string;
  town: string;
  frequency: Frequency;
  date: string; // yyyy-mm-dd
  timeWindow: string;
  name: string;
  email: string;
  phone: string;
  notes: string;
}

export const emptyDraft: BookingDraft = {
  service: "",
  propertyType: "",
  size: "",
  focusRoom: "",
  postcode: "",
  town: "",
  frequency: "one-time",
  date: "",
  timeWindow: "",
  name: "",
  email: "",
  phone: "",
  notes: "",
};

export type FieldErrors = Partial<Record<keyof BookingDraft, string>>;

/* ---------- dates (local time, no timezone drift) ---------- */

export function toISODate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function parseISODate(value: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return null;
  const d = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
  // Reject rollovers such as 2026-02-31
  if (d.getMonth() !== Number(match[2]) - 1) return null;
  return d;
}

export function dateBounds(now = new Date()) {
  const min = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
  const max = new Date(now.getFullYear(), now.getMonth(), now.getDate() + maxDaysAhead);
  return { min: toISODate(min), max: toISODate(max) };
}

export function formatDate(value: string): string {
  const d = parseISODate(value);
  if (!d) return "";
  return d.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" });
}

/* ---------- options that depend on the chosen service ---------- */

export function propertyGroupFor(service: BookingDraft["service"]) {
  return service ? serviceById[service].propertyGroup : "residential";
}

export function optionsFor(service: BookingDraft["service"]) {
  const group = propertyGroupFor(service);
  return { types: propertyTypes[group], sizes: propertySizes[group], group };
}

export function allowedFrequencies(service: BookingDraft["service"]): Frequency[] {
  return service ? serviceById[service].frequencies : ["one-time", "weekly", "fortnightly", "monthly"];
}

/** Keep a draft internally consistent after any change. */
export function normaliseDraft(draft: BookingDraft): BookingDraft {
  const next = { ...draft };
  const { types, sizes, group } = optionsFor(next.service);
  if (next.propertyType && !types.includes(next.propertyType)) next.propertyType = "";
  if (next.size && !sizes.includes(next.size)) next.size = "";
  if (group === "commercial" && next.focusRoom) next.focusRoom = "";
  if (!allowedFrequencies(next.service).includes(next.frequency)) next.frequency = "one-time";
  return next;
}

/* ---------- validation per step ---------- */

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const POSTCODE = /^[A-Za-z0-9][A-Za-z0-9 ]{1,8}[A-Za-z0-9]$/;
const PHONE = /^[+()0-9\s]{7,20}$/;

export function validateStep(step: number, draft: BookingDraft, now = new Date()): FieldErrors {
  const errors: FieldErrors = {};
  if (step === 0) {
    if (!draft.service || !isServiceId(draft.service)) errors.service = "Choose the service you need.";
    if (!draft.propertyType) errors.propertyType = "Choose a property type.";
    if (!draft.size) errors.size = "Choose the size of the space.";
    if (!draft.postcode.trim()) errors.postcode = "Enter the postcode for the visit.";
    else if (!POSTCODE.test(draft.postcode.trim())) errors.postcode = "Check the postcode format.";
    if (!draft.town.trim()) errors.town = "Enter the town or city.";
  }
  if (step === 1) {
    if (!allowedFrequencies(draft.service).includes(draft.frequency))
      errors.frequency = "This service is booked as a single visit.";
    const { min, max } = dateBounds(now);
    const date = parseISODate(draft.date);
    if (!draft.date) errors.date = "Choose a preferred date.";
    else if (!date) errors.date = "Enter a valid date.";
    else if (draft.date < min) errors.date = "Choose a date from tomorrow onwards.";
    else if (draft.date > max) errors.date = "Choose a date within the next four months.";
    if (!timeWindows.some((t) => t.id === draft.timeWindow)) errors.timeWindow = "Choose a time of day.";
  }
  if (step === 2) {
    if (draft.name.trim().length < 2) errors.name = "Enter your full name.";
    if (!draft.email.trim()) errors.email = "Enter your email address.";
    else if (!EMAIL.test(draft.email.trim())) errors.email = "Enter an email address like name@example.com.";
    if (!draft.phone.trim()) errors.phone = "Enter a phone number for the visit.";
    else if (!PHONE.test(draft.phone.trim())) errors.phone = "Use digits, spaces and an optional plus sign.";
    if (draft.notes.length > 600) errors.notes = "Keep notes under 600 characters.";
  }
  return errors;
}

export function validateAll(draft: BookingDraft, now = new Date()): { step: number; errors: FieldErrors } | null {
  for (let step = 0; step < 3; step++) {
    const errors = validateStep(step, draft, now);
    if (Object.keys(errors).length) return { step, errors };
  }
  return null;
}

/* ---------- summary and payload ---------- */

export function summaryRows(draft: BookingDraft) {
  const service = draft.service ? serviceById[draft.service] : null;
  const time = timeWindows.find((t) => t.id === draft.timeWindow);
  const focus =
    draft.focusRoom === "whole"
      ? "Whole home"
      : draft.focusRoom
        ? `Extra care: ${draft.focusRoom.charAt(0).toUpperCase()}${draft.focusRoom.slice(1)}`
        : "";
  return {
    service: service?.name ?? "",
    space: [draft.propertyType, draft.size].filter(Boolean).join(", "),
    focus,
    location: [draft.postcode.trim().toUpperCase(), draft.town.trim()].filter(Boolean).join(", "),
    visits: frequencyLabel[draft.frequency],
    date: formatDate(draft.date),
    time: time ? `${time.label}, ${time.detail}` : "",
    contact: [draft.name.trim(), draft.email.trim(), draft.phone.trim()].filter(Boolean).join(" · "),
    notes: draft.notes.trim(),
    price: service ? (service.priceFrom ?? "Tailored quote") : "",
  };
}

export interface BookingRequestPayload {
  service: ServiceId;
  property: { type: string; size: string; focusRoom: FocusRoom | null };
  location: { postcode: string; town: string };
  schedule: { frequency: Frequency; preferredDate: string; timeWindow: string };
  contact: { name: string; email: string; phone: string };
  notes: string;
  createdAt: string;
}

export function toPayload(draft: BookingDraft): BookingRequestPayload {
  return {
    service: draft.service as ServiceId,
    property: { type: draft.propertyType, size: draft.size, focusRoom: draft.focusRoom || null },
    location: { postcode: draft.postcode.trim().toUpperCase(), town: draft.town.trim() },
    schedule: { frequency: draft.frequency, preferredDate: draft.date, timeWindow: draft.timeWindow },
    contact: { name: draft.name.trim(), email: draft.email.trim(), phone: draft.phone.trim() },
    notes: draft.notes.trim(),
    createdAt: new Date().toISOString(),
  };
}
