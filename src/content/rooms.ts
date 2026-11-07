/**
 * Rooms in the hero house explorer. Geometry (x, y, w, h) is in the
 * illustration's coordinate space (viewBox 0 0 1200 760) and must match the
 * drawing in components/illustration. Copy can be edited freely.
 */
export type RoomId = "kitchen" | "living" | "bath";

export interface Room {
  id: RoomId;
  number: string;
  name: string;
  line: string;
  included: string[];
  /** Interior bounds in scene units. */
  box: { x: number; y: number; w: number; h: number };
  /** Hotspot anchor (a quiet patch of wall) and which side its label sits. */
  dot: { x: number; y: number };
  labelSide: "left" | "right";
  /** Viewport used when the room is shown on its own (before and after). */
  focusView: { x: number; y: number; w: number; h: number };
}

export const rooms: Room[] = [
  {
    id: "kitchen",
    number: "01",
    name: "Kitchen",
    line: "Worktops, appliances and the finishing touches.",
    included: [
      "Worktops cleared, cleaned and polished",
      "Hob, oven front and extractor degreased",
      "Sink and taps descaled until they shine",
      "Cupboard fronts, handles and floor",
    ],
    box: { x: 620, y: 430, w: 428, h: 210 },
    dot: { x: 868, y: 458 },
    labelSide: "left",
    focusView: { x: 600, y: 396, w: 468, h: 272 },
  },
  {
    id: "living",
    number: "02",
    name: "Living",
    line: "Soft furnishings, surfaces and the floor beneath.",
    included: [
      "Cushions plumped and throws folded",
      "Dust lifted from shelves, frames and lamps",
      "Glass and mirrors left streak free",
      "Floors vacuumed and mopped edge to edge",
    ],
    box: { x: 164, y: 430, w: 446, h: 210 },
    dot: { x: 206, y: 470 },
    labelSide: "right",
    focusView: { x: 146, y: 396, w: 482, h: 272 },
  },
  {
    id: "bath",
    number: "03",
    name: "Bath",
    line: "Tiles, glass and fittings, brought back to bright.",
    included: [
      "Bath, basin and taps descaled",
      "Tiles and grout scrubbed",
      "Mirror and glass polished",
      "Towels folded and bottles lined up",
    ],
    box: { x: 250, y: 224, w: 310, h: 190 },
    dot: { x: 542, y: 250 },
    labelSide: "left",
    focusView: { x: 196, y: 190, w: 418, h: 244 },
  },
];

export const roomById = Object.fromEntries(rooms.map((r) => [r.id, r])) as Record<RoomId, Room>;

/** Visible crop of the scene in the hero, wide on desktop and tighter on phones. */
export const SCENE_VIEWS = {
  wide: { x: 10, y: 116, w: 1180, h: 624 },
  narrow: { x: 118, y: 166, w: 964, h: 532 },
} as const;
