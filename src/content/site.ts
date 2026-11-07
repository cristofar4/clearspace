/**
 * Business details and navigation. Everything a client is likely to change
 * lives here. Contact fields left as null are simply not rendered, so the site
 * never shows placeholder phone numbers or addresses.
 */
export const site = {
  name: "Clearspace",
  wordmark: "CLEARSPACE",
  description:
    "Considered cleaning for homes and workplaces. Regular and one time visits, move out cleans and cleaning after the builders.",
  tagline: "Considered cleaning for homes and workplaces.",

  contact: {
    email: null as string | null,
    phone: null as string | null,
    serviceArea: null as string | null,
    hours: null as string | null,
  },

  /** Shown until the client sets their own year in the footer. */
  copyrightFallbackYear: 2026,
} as const;

export interface NavLink {
  label: string;
  href: `#${string}`;
  /** Section id that marks this link as current while it is on screen. */
  section: string;
}

export const primaryNav: NavLink[] = [
  { label: "The difference", href: "#difference", section: "difference" },
  { label: "Our standard", href: "#standard", section: "standard" },
  { label: "Visits", href: "#visits", section: "visits" },
];

export const bookHref = "#book" as const;
