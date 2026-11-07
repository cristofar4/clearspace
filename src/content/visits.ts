import type { Frequency } from "./services";

export interface VisitOption {
  id: Frequency;
  label: string;
  description: string;
  /** Days within a four week strip that show a visit (0 to 27). */
  pattern: number[];
}

export const oneTime: VisitOption = {
  id: "one-time",
  label: "One time",
  description:
    "A single visit for a moment that needs it. Before guests, after an event, or simply to start fresh.",
  pattern: [9],
};

export const oneTimeMoments = [
  "Before guests arrive",
  "After a celebration",
  "A seasonal deep clean",
  "Moving out or after the builders",
];

export const recurring: VisitOption[] = [
  {
    id: "weekly",
    label: "Weekly",
    description: "The same day each week, so your space never drifts far from clean.",
    pattern: [2, 9, 16, 23],
  },
  {
    id: "fortnightly",
    label: "Fortnightly",
    description: "A steady rhythm for homes and workspaces that stay tidy between visits.",
    pattern: [2, 16],
  },
  {
    id: "monthly",
    label: "Monthly",
    description: "A deeper reset each month that catches what everyday life misses.",
    pattern: [9],
  },
];

export const recurringNote =
  "Recurring visits follow the same checklist every time, refined as you tell us what matters most.";

export const frequencyLabel: Record<Frequency, string> = {
  "one-time": "One time",
  weekly: "Weekly",
  fortnightly: "Fortnightly",
  monthly: "Monthly",
};
