import { media, type Photo } from "./media";

export type ServiceId = "home" | "office" | "move-out" | "after-builders";
export type Frequency = "one-time" | "weekly" | "fortnightly" | "monthly";
export type PropertyGroup = "residential" | "commercial";

export interface Service {
  id: ServiceId;
  number: string;
  name: string;
  /** Short name for tight spaces such as chips and the summary. */
  shortName: string;
  icon: "home" | "office" | "box" | "ladder";
  short: string;
  summary: string;
  included: string[];
  goodFor: string;
  /** Visit styles shown as chips on the service panel. */
  styles: string[];
  frequencies: Frequency[];
  propertyGroup: PropertyGroup;
  photo: Photo;
  /**
   * Optional starting price, shown as written. Leave null to show
   * "Tailored quote" instead. Do not publish prices you have not confirmed.
   */
  priceFrom: string | null;
  badge?: string;
}

export const services: Service[] = [
  {
    id: "home",
    number: "01",
    name: "Home cleaning",
    shortName: "Home",
    icon: "home",
    short: "A consistent standard that keeps your home calm and cared for.",
    summary:
      "Regular or deep cleans for apartments and houses, planned around the way you live. Every visit follows the same room by room checklist.",
    included: [
      "Kitchen worktops, sink and appliance fronts",
      "Bathrooms cleaned, descaled and polished",
      "Dusting from skirting boards to light switches",
      "Floors vacuumed and mopped throughout",
      "Beds made and soft furnishings straightened",
    ],
    goodFor: "Busy households, regular upkeep and a reset before guests",
    styles: ["Regular clean", "Deep clean"],
    frequencies: ["one-time", "weekly", "fortnightly", "monthly"],
    propertyGroup: "residential",
    photo: media.serviceHome,
    priceFrom: null,
  },
  {
    id: "office",
    number: "02",
    name: "Office care",
    shortName: "Office",
    icon: "office",
    short: "A cleaner, healthier workspace for a more focused team.",
    summary:
      "Scheduled cleaning for offices, studios and small commercial spaces, arranged around your working hours so every day starts fresh.",
    included: [
      "Desks, meeting tables and shared surfaces",
      "Kitchens and break areas",
      "Washrooms cleaned and restocked",
      "Touch points such as handles and switches",
      "Bins emptied and floors finished",
    ],
    goodFor: "Offices, studios, clinics and retail spaces",
    styles: ["Before hours", "After hours"],
    frequencies: ["one-time", "weekly", "fortnightly", "monthly"],
    propertyGroup: "commercial",
    photo: media.serviceOffice,
    priceFrom: null,
    badge: "For business",
  },
  {
    id: "move-out",
    number: "03",
    name: "Move out",
    shortName: "Move out",
    icon: "box",
    short: "A thorough clean for a smooth handover and a fresh start.",
    summary:
      "A detailed clean from top to bottom for empty or nearly empty homes, so the next chapter starts properly, whether you are leaving or arriving.",
    included: [
      "Inside cupboards, drawers and wardrobes",
      "Inside the oven, fridge and freezer",
      "Limescale lifted from taps, tiles and glass",
      "Skirting boards, doors and frames wiped",
      "Floors cleaned from edge to edge",
    ],
    goodFor: "Tenants, landlords, sellers and new owners",
    styles: ["Moving out", "Moving in"],
    frequencies: ["one-time"],
    propertyGroup: "residential",
    photo: media.serviceMoveOut,
    priceFrom: null,
  },
  {
    id: "after-builders",
    number: "04",
    name: "After the builders",
    shortName: "After builders",
    icon: "ladder",
    short: "Fine dust cleared, so finished work feels ready to live in.",
    summary:
      "Renovation dust settles everywhere. We clear it from every ledge, frame and fitting so new work looks the way it was meant to.",
    included: [
      "Fine dust cleared from every surface and ledge",
      "Paint and adhesive marks lifted from glass",
      "New fixtures and fittings polished",
      "Vents, frames and sockets detailed",
      "Floors vacuumed and washed",
    ],
    goodFor: "Renovations, extensions and new builds",
    styles: ["Single room", "Whole property"],
    frequencies: ["one-time"],
    propertyGroup: "residential",
    photo: media.serviceAfterBuilders,
    priceFrom: null,
  },
];

export const serviceById = Object.fromEntries(services.map((s) => [s.id, s])) as Record<
  ServiceId,
  Service
>;

export function isServiceId(value: string): value is ServiceId {
  return value in serviceById;
}
