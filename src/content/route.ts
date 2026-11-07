/**
 * The Clearspace route: how a kitchen clean moves through a real room.
 *
 * Positions are percentages of the photograph (media.routeKitchen), so they
 * stay true at any size. If you replace the photo, move `at` to the matching
 * surface and `frame` around it. The order follows how professionals work:
 * top to bottom, dry before wet, finishing at the door.
 */
import { media } from "./media";

export interface RouteStop {
  id: string;
  name: string;
  /** Why this step sits where it does in the order. */
  why: string;
  done: string[];
  /** Marker position, in percent of the photo. */
  at: { x: number; y: number };
  /** The surface being cleaned: the inspection frame and camera target. */
  frame: { x: number; y: number; w: number; h: number };
  /** How far the camera moves in. 1 shows the whole room. */
  zoom: number;
}

export const routePhoto = media.routeKitchen;

/** Where the route begins: the garden door. */
export const routeStart = { x: 13, y: 66 };

export const routeStops: RouteStop[] = [
  {
    id: "high",
    name: "Lights and high shelves",
    why: "We start high, so dust falls onto surfaces we have not cleaned yet.",
    done: ["Pendant shades and fittings dusted", "Open shelf cleared, wiped and restyled", "Frames and switches wiped"],
    at: { x: 63, y: 34 },
    frame: { x: 48, y: 7, w: 26, h: 44 },
    zoom: 1.5,
  },
  {
    id: "glass",
    name: "Windows and glass",
    why: "Glass comes early, while the daylight shows every streak.",
    done: ["Interior glass polished until streak free", "Frames and sills wiped", "Door handles cleaned"],
    at: { x: 40, y: 37 },
    frame: { x: 31, y: 25, w: 18, h: 30 },
    zoom: 1.6,
  },
  {
    id: "hood",
    name: "Hood, hob and splashback",
    why: "Grease rises, so we degrease from the top down.",
    done: ["Extractor hood degreased", "Marble splashback cleaned with stone safe care", "Hob and controls wiped"],
    at: { x: 79, y: 33 },
    frame: { x: 70, y: 20, w: 26, h: 41 },
    zoom: 1.5,
  },
  {
    id: "worktops",
    name: "Worktops and island",
    why: "Surfaces are cleared first, cleaned, then everything goes back in order.",
    done: ["Worktops cleared, cleaned and polished", "Island stone treated gently", "Cupboard fronts and handles"],
    at: { x: 62, y: 62 },
    frame: { x: 38, y: 55, w: 48, h: 33 },
    zoom: 1.35,
  },
  {
    id: "sink",
    name: "Sink and taps",
    why: "Wet work comes last on the worktop, so the shine stays.",
    done: ["Sink scrubbed and dried", "Tap descaled and buffed", "Drainer and plughole"],
    at: { x: 42, y: 54 },
    frame: { x: 34, y: 47, w: 16, h: 14 },
    zoom: 1.7,
  },
  {
    id: "floor",
    name: "Floors",
    why: "Floors are always last, working back toward the door.",
    done: ["Vacuumed edge to edge", "Mopped with care for the timber", "Under stools and along kick boards"],
    at: { x: 32, y: 90 },
    frame: { x: 2, y: 80, w: 70, h: 19 },
    zoom: 1.3,
  },
];
