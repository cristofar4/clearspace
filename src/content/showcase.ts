/**
 * Before and after pairs.
 *
 * The site ships with illustrated pairs. Each one is the same drawing of the
 * same room with the everyday clutter layer removed, so the comparison is
 * honest. When you have matching photographs (same room, same camera
 * position, before and after a real visit), switch an entry to kind "photo":
 *
 *   import before from "@/assets/media/kitchen-before.jpg";
 *   import after from "@/assets/media/kitchen-after.jpg";
 *   { id: "kitchen", label: "Kitchen", kind: "photo", before, after,
 *     beforeAlt: "...", afterAlt: "...", caption: "Kitchen, regular clean" }
 *
 * Never pair photographs of two different rooms.
 */
import type { StaticImageData } from "next/image";
import type { RoomId } from "./rooms";

interface PairBase {
  id: string;
  label: string;
  changes: string[];
  caption: string;
}

export type ShowcasePair =
  | (PairBase & { kind: "illustration"; room: RoomId })
  | (PairBase & {
      kind: "photo";
      before: StaticImageData;
      after: StaticImageData;
      beforeAlt: string;
      afterAlt: string;
    });

export const showcasePairs: ShowcasePair[] = [
  {
    id: "kitchen",
    label: "Kitchen",
    kind: "illustration",
    room: "kitchen",
    caption: "Illustrated example",
    changes: [
      "Dishes washed, dried and put away",
      "Splashback and hob degreased",
      "Worktops cleared and polished",
      "Floor swept and mopped",
    ],
  },
  {
    id: "living",
    label: "Living",
    kind: "illustration",
    room: "living",
    caption: "Illustrated example",
    changes: [
      "Cushions plumped and throw folded",
      "Laundry and parcels gathered",
      "Glass cleaned until streak free",
      "Rug and floor vacuumed",
    ],
  },
  {
    id: "bath",
    label: "Bath",
    kind: "illustration",
    room: "bath",
    caption: "Illustrated example",
    changes: [
      "Towels laundered and folded",
      "Mirror polished",
      "Bottles lined up, surfaces wiped",
      "Floor dried and cleaned",
    ],
  },
];
