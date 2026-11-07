/**
 * The comparison in "The difference" section.
 *
 * kind "coverage": one real photograph shown twice. The left side marks what a
 *   regular clean covers, the right side adds what a deep clean reaches. This
 *   compares scope, so it needs only one honest photo per room.
 *
 * kind "photo": a true before and after. Use it once you have matching
 *   photographs of the same room, from the same camera position, before and
 *   after a real visit:
 *
 *   import before from "@/assets/media/kitchen-before.jpg";
 *   import after from "@/assets/media/kitchen-after.jpg";
 *   { id: "kitchen", label: "Kitchen", kind: "photo", before, after,
 *     beforeAlt: "...", afterAlt: "...", caption: "Kitchen, deep clean", notes: [...] }
 *
 * Never pair photographs of two different rooms.
 */
import type { StaticImageData } from "next/image";

import { media, type Photo } from "./media";

export interface Pin {
  x: number;
  y: number;
  label: string;
}

interface Base {
  id: string;
  label: string;
  caption: string;
}

export type ShowcaseEntry =
  | (Base & { kind: "coverage"; photo: Photo; regular: Pin[]; deep: Pin[] })
  | (Base & {
      kind: "photo";
      before: StaticImageData;
      after: StaticImageData;
      beforeAlt: string;
      afterAlt: string;
      notes: string[];
    });

export const showcaseEntries: ShowcaseEntry[] = [
  {
    id: "kitchen",
    label: "Kitchen",
    kind: "coverage",
    photo: media.compareKitchen,
    caption: "Real kitchen photographed by Clay Banks",
    regular: [
      { x: 56, y: 62, label: "Worktops" },
      { x: 41, y: 64, label: "Hob and oven front" },
      { x: 77, y: 57, label: "Sink and tap" },
      { x: 52, y: 95, label: "Floor" },
    ],
    deep: [
      { x: 41, y: 78, label: "Inside the oven" },
      { x: 41, y: 37, label: "Extractor and filter" },
      { x: 55, y: 22, label: "Inside cupboards" },
      { x: 13, y: 46, label: "Fridge, inside and out" },
      { x: 60, y: 76, label: "Drawers and runners" },
    ],
  },
  {
    id: "bath",
    label: "Bath",
    kind: "coverage",
    photo: media.compareBath,
    caption: "Real bathroom photographed by Clay Banks",
    regular: [
      { x: 79, y: 71, label: "Basin and taps" },
      { x: 85, y: 42, label: "Mirror" },
      { x: 26, y: 78, label: "Toilet" },
      { x: 45, y: 93, label: "Floor" },
    ],
    deep: [
      { x: 45, y: 57, label: "Grout and shower glass" },
      { x: 51, y: 31, label: "Window frame" },
      { x: 64, y: 86, label: "Inside the vanity" },
      { x: 54, y: 12, label: "Extractor vent" },
      { x: 12, y: 88, label: "Skirting" },
    ],
  },
  {
    id: "living",
    label: "Living",
    kind: "coverage",
    photo: media.compareLiving,
    caption: "Real living room photographed by Pipcke",
    regular: [
      { x: 50, y: 66, label: "Cushions plumped" },
      { x: 38, y: 82, label: "Surfaces dusted" },
      { x: 60, y: 92, label: "Rug and floor" },
      { x: 72, y: 50, label: "Lamps" },
    ],
    deep: [
      { x: 48, y: 22, label: "Pendant shades" },
      { x: 20, y: 36, label: "Windows and frames" },
      { x: 50, y: 44, label: "Picture frames" },
      { x: 44, y: 75, label: "Under the sofa" },
      { x: 92, y: 58, label: "Door frames" },
    ],
  },
];
