import type { PropertyGroup } from "./services";

/**
 * Booking form options and behaviour.
 *
 * mode "demo": nothing leaves the browser. The form says so clearly and the
 *   final step shows a demo notice, never a confirmation.
 * mode "live": requests are posted to /api/booking, which forwards them to
 *   BOOKING_FORWARD_URL (see README). Set NEXT_PUBLIC_BOOKING_MODE=live.
 */
export const bookingMode: "demo" | "live" =
  process.env.NEXT_PUBLIC_BOOKING_MODE === "live" ? "live" : "demo";

export const propertyTypes: Record<PropertyGroup, string[]> = {
  residential: ["Apartment", "House", "Townhouse", "Studio flat"],
  commercial: ["Office suite", "Studio or workshop", "Retail space", "Clinic or treatment room"],
};

export const propertySizes: Record<PropertyGroup, string[]> = {
  residential: ["Studio", "1 bedroom", "2 bedrooms", "3 bedrooms", "4 or more bedrooms"],
  commercial: ["Up to 100 m²", "100 to 250 m²", "250 to 500 m²", "Over 500 m²"],
};

export const timeWindows = [
  { id: "morning", label: "Morning", detail: "8am to 12pm" },
  { id: "afternoon", label: "Afternoon", detail: "12pm to 5pm" },
  { id: "flexible", label: "Flexible", detail: "Any time that day" },
] as const;

export const focusRooms = [
  { id: "kitchen", label: "Kitchen" },
  { id: "living", label: "Living" },
  { id: "bath", label: "Bath" },
  { id: "whole", label: "Whole home" },
] as const;

export const bookingSteps = [
  { id: "space", number: "01", label: "Your space" },
  { id: "rhythm", number: "02", label: "Your rhythm" },
  { id: "details", number: "03", label: "Your details" },
  { id: "review", number: "04", label: "Review" },
] as const;

/** How far ahead a preferred date may be chosen. */
export const maxDaysAhead = 120;
