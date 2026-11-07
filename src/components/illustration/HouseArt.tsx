/**
 * The CLEARSPACE house: an original architectural section drawing.
 * Coordinates match src/content/rooms.ts (viewBox 0 0 1200 760).
 */
import type { ReactNode } from "react";

import { rooms, type RoomId } from "@/content/rooms";
import { C } from "./palette";
import { BedroomArt, roomArt } from "./rooms";

const BEDROOM = { x: 570, y: 224 };

function Tree({ x, ground, r, trunk }: { x: number; ground: number; r: number; trunk: number }) {
  const cy = ground - trunk - r * 0.6;
  return (
    <g>
      <line x1={x} y1={ground} x2={x} y2={cy + r * 0.4} stroke={C.line} strokeWidth={1.3} />
      <line x1={x} y1={cy + r * 0.7} x2={x - r * 0.35} y2={cy + r * 0.2} stroke={C.line} strokeWidth={0.9} />
      <line x1={x} y1={cy + r * 0.55} x2={x + r * 0.32} y2={cy} stroke={C.line} strokeWidth={0.9} />
      <circle cx={x} cy={cy} r={r} fill={C.sea} fillOpacity={0.6} stroke={C.leafDark} strokeOpacity={0.6} strokeWidth={0.9} />
      <circle cx={x - r * 0.3} cy={cy - r * 0.25} r={r * 0.55} fill={C.seaMid} fillOpacity={0.35} />
      <circle cx={x + r * 0.35} cy={cy + r * 0.2} r={r * 0.45} fill={C.seaMid} fillOpacity={0.25} />
    </g>
  );
}

function Shrubs({ x, y, n = 3, s = 1 }: { x: number; y: number; n?: number; s?: number }) {
  return (
    <g>
      {Array.from({ length: n }, (_, i) => (
        <circle
          key={i}
          cx={x + i * 15 * s}
          cy={y - (i % 2 ? 9 : 5) * s}
          r={(i % 2 ? 12 : 9) * s}
          fill={i % 2 ? C.seaMid : C.leaf}
          fillOpacity={0.75}
          stroke={C.leafDark}
          strokeOpacity={0.5}
          strokeWidth={0.8}
        />
      ))}
    </g>
  );
}

/** Sky, sun, trees and earth behind and beneath the house. */
export function Landscape() {
  return (
    <g>
      <rect width={1200} height={760} fill="url(#cs-sky)" />
      <circle cx={1000} cy={150} r={260} fill="url(#cs-sun)" />
      <Tree x={74} ground={656} r={62} trunk={74} />
      <Tree x={1136} ground={656} r={46} trunk={64} />
      <rect y={656} width={1200} height={104} fill="url(#cs-earth)" />
      <rect x={110} y={656} width={980} height={52} fill="url(#cs-hatch)" />
      <rect x={0} y={690} width={1200} height={70} fill="url(#cs-earth)" opacity={0.0} />
    </g>
  );
}

/** Slabs, walls and roof drawn as solid section cuts, plus the upper terrace. */
export function Structure() {
  const cut = C.cut;
  return (
    <g>
      {/* roof with planting */}
      <Shrubs x={262} y={196} n={3} s={0.9} />
      <Shrubs x={958} y={196} n={3} s={0.9} />
      <rect x={224} y={190} width={6} height={18} fill={cut} />
      <rect x={1022} y={190} width={6} height={18} fill={cut} />
      <rect x={224} y={206} width={804} height={18} fill={cut} />
      {/* upper floor walls */}
      <rect x={238} y={224} width={12} height={190} fill={cut} />
      <rect x={560} y={224} width={10} height={190} fill={cut} />
      <rect x={1000} y={224} width={12} height={190} fill={cut} />
      {/* terrace balustrade and planter */}
      <rect x={156} y={378} width={80} height={36} fill="#DCE8E2" fillOpacity={0.55} stroke={C.line} strokeWidth={0.8} />
      <line x1={154} y1={377} x2={238} y2={377} stroke={C.line} strokeWidth={1.6} />
      <Shrubs x={172} y={376} n={3} s={0.8} />
      {/* first floor slab, cantilevered over the entrance */}
      <rect x={146} y={414} width={938} height={16} fill={cut} />
      {/* ground floor walls */}
      <rect x={150} y={430} width={14} height={210} fill={cut} />
      <rect x={610} y={430} width={10} height={210} fill={cut} />
      <rect x={1048} y={430} width={12} height={210} fill={cut} />
      {/* ground slab and footings */}
      <rect x={140} y={640} width={930} height={16} fill={cut} />
      <rect x={150} y={656} width={16} height={26} fill={cut} />
      <rect x={604} y={656} width={16} height={22} fill={cut} />
      <rect x={1046} y={656} width={16} height={26} fill={cut} />
      {/* ground line and entrance */}
      <line x1={0} y1={656} x2={1200} y2={656} stroke={cut} strokeWidth={1.6} />
      <rect x={1070} y={646} width={70} height={10} fill={C.porcelain} stroke={C.line} strokeWidth={0.8} />
      <Shrubs x={96} y={656} n={3} />
      <Shrubs x={1150} y={656} n={2} s={0.9} />
    </g>
  );
}

export type RoomStates = Record<RoomId, "busy" | "clean">;

/**
 * A static render of the whole house. Used by the before and after
 * comparison, where `viewBox` crops the scene to a single room.
 */
export function HouseArt({
  states,
  viewBox = "0 0 1200 760",
  className = "",
  title,
}: {
  states: RoomStates;
  viewBox?: string;
  className?: string;
  title?: string;
}) {
  return (
    <svg
      viewBox={viewBox}
      className={`cs-art block h-full w-full ${className}`}
      preserveAspectRatio="xMidYMid slice"
      role={title ? "img" : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
      focusable="false"
    >
      <Landscape />
      <g transform={`translate(${BEDROOM.x} ${BEDROOM.y})`}>
        <BedroomArt />
      </g>
      {rooms.map((room) => {
        const Art = roomArt[room.id];
        return (
          <g key={room.id} transform={`translate(${room.box.x} ${room.box.y})`}>
            <Art.Base />
            {states[room.id] === "clean" ? <Art.Clean /> : <Art.Clutter />}
          </g>
        );
      })}
      <Structure />
    </svg>
  );
}

/** Helper to place children in a room's local coordinates. */
export function InRoom({ id, children }: { id: RoomId; children: ReactNode }) {
  const room = rooms.find((r) => r.id === id)!;
  return <g transform={`translate(${room.box.x} ${room.box.y})`}>{children}</g>;
}

export { BEDROOM };
