/**
 * Room drawings for the CLEARSPACE house section.
 *
 * Each room is drawn in its own local coordinates and split into three layers:
 *   Base     the architecture and furniture that never change
 *   Clean    the small details of a cared for room
 *   Clutter  everyday life: laundry, dishes, smudges and a dull film
 * The Reset wipes Clutter away and reveals Clean, so before and after are
 * always the same room.
 */
import type { ReactNode } from "react";

import type { RoomId } from "@/content/rooms";
import { C } from "./palette";

const S = { stroke: C.line, strokeWidth: 1.1, strokeLinejoin: "round" as const, strokeLinecap: "round" as const };
const thin = { stroke: C.line, strokeWidth: 0.7, strokeLinecap: "round" as const };

/* ---------- shared pieces ---------- */

function Ceiling({ w }: { w: number }) {
  return <rect width={w} height={14} fill="url(#cs-ceiling)" />;
}

function TimberFloor({ y, w, h = 18 }: { y: number; w: number; h?: number }) {
  const boards = Math.ceil(w / 38);
  return (
    <g>
      <rect y={y} width={w} height={h} fill={C.floor} />
      {Array.from({ length: boards }, (_, i) => (
        <line key={i} x1={i * 38 + 14} y1={y + 2} x2={i * 38 + 14} y2={y + h} stroke={C.floorLine} strokeWidth={0.7} />
      ))}
      <line x1={0} y1={y} x2={w} y2={y} {...thin} strokeOpacity={0.6} />
    </g>
  );
}

function TileFloor({ y, w, h = 14 }: { y: number; w: number; h?: number }) {
  const tiles = Math.ceil(w / 30);
  return (
    <g>
      <rect y={y} width={w} height={h} fill={C.tileFloor} />
      {Array.from({ length: tiles }, (_, i) => (
        <line key={i} x1={i * 30 + 8} y1={y} x2={i * 30 + 8} y2={y + h} stroke="#D3C9B9" strokeWidth={0.7} />
      ))}
      <line x1={0} y1={y} x2={w} y2={y} {...thin} strokeOpacity={0.6} />
    </g>
  );
}

/** A soft landscape seen through glass, clipped by a nested viewport. */
function View({ x, y, w, h, variant = 0 }: { x: number; y: number; w: number; h: number; variant?: number }) {
  return (
    <svg x={x} y={y} width={w} height={h} viewBox="0 0 200 120" preserveAspectRatio="xMidYMax slice" overflow="hidden">
      <rect width="200" height="120" fill="url(#cs-glass)" />
      <path d="M0 92 Q50 78 100 88 T200 82 V120 H0Z" fill="#CFDFD6" />
      {variant === 0 ? (
        <g>
          <circle cx="34" cy="70" r="26" fill={C.seaMid} fillOpacity="0.85" />
          <circle cx="62" cy="84" r="18" fill={C.leaf} fillOpacity="0.8" />
          <circle cx="150" cy="66" r="30" fill={C.seaMid} fillOpacity="0.75" />
          <circle cx="182" cy="86" r="18" fill={C.leaf} fillOpacity="0.85" />
          <line x1="34" y1="96" x2="34" y2="112" stroke={C.leafDark} strokeWidth="1.4" />
          <line x1="150" y1="96" x2="150" y2="114" stroke={C.leafDark} strokeWidth="1.4" />
        </g>
      ) : (
        <g>
          <circle cx="60" cy="74" r="30" fill={C.seaMid} fillOpacity="0.8" />
          <circle cx="100" cy="88" r="16" fill={C.leaf} fillOpacity="0.85" />
          <circle cx="168" cy="78" r="24" fill={C.seaMid} fillOpacity="0.8" />
          <line x1="60" y1="102" x2="60" y2="116" stroke={C.leafDark} strokeWidth="1.4" />
        </g>
      )}
      <rect y="106" width="200" height="14" fill="#BCD2C6" />
      <path d="M120 0 L160 0 L60 120 L20 120Z" fill="#fff" fillOpacity="0.16" />
    </svg>
  );
}

function Glazing({
  x,
  y,
  w,
  h,
  mullions = [],
  variant,
}: {
  x: number;
  y: number;
  w: number;
  h: number;
  mullions?: number[];
  variant?: number;
}) {
  return (
    <g>
      <View x={x} y={y} w={w} h={h} variant={variant} />
      <rect x={x} y={y} width={w} height={h} fill="none" stroke={C.line} strokeWidth={1.6} />
      {mullions.map((mx) => (
        <line key={mx} x1={mx} y1={y} x2={mx} y2={y + h} stroke={C.line} strokeWidth={1.2} />
      ))}
    </g>
  );
}

function Plant({ x, y, scale = 1 }: { x: number; y: number; scale?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      <ellipse cx={-6} cy={-20} rx={5} ry={15} transform="rotate(-28 -6 -20)" fill={C.leaf} {...thin} />
      <ellipse cx={5} cy={-24} rx={5} ry={18} transform="rotate(14 5 -24)" fill={C.leafDark} {...thin} />
      <ellipse cx={10} cy={-12} rx={4} ry={11} transform="rotate(48 10 -12)" fill={C.leaf} {...thin} />
      <ellipse cx={-10} cy={-9} rx={4} ry={9} transform="rotate(-58 -10 -9)" fill={C.leafDark} {...thin} />
      <path d="M-11 -2 h22 l-3 22 h-16Z" fill="#E2D6C3" {...S} />
    </g>
  );
}

/** A dull film over a lived in room. Wiping it away brightens the space. */
function Film({ w, h }: { w: number; h: number }) {
  return <rect width={w} height={h} fill={C.film} fillOpacity={0.13} />;
}

function Dots({ points, r = 1.4, fill = C.grime, opacity = 0.55 }: { points: [number, number][]; r?: number; fill?: string; opacity?: number }) {
  return (
    <g fill={fill} fillOpacity={opacity}>
      {points.map(([cx, cy], i) => (
        <circle key={i} cx={cx} cy={cy} r={r} />
      ))}
    </g>
  );
}

/* =====================================================================
   LIVING  446 x 210
   ===================================================================== */

function LivingBase() {
  return (
    <g>
      <rect width={446} height={210} fill={C.wall} />
      <Ceiling w={446} />
      <rect y={184} width={446} height={8} fill={C.skirting} />
      <TimberFloor y={192} w={446} />
      <line x1={12} y1={14} x2={280} y2={14} stroke={C.line} strokeWidth={1.4} />
      <Glazing x={22} y={22} w={228} h={156} mullions={[98, 174]} />
      <rect x={18} y={178} width={236} height={5} fill={C.stone} {...S} />
      <path d="M254 15 h18 v168 q-4 4 -9 0 q-5 -4 -9 0Z" fill="#E9E2D6" {...S} />
      <line x1={259} y1={20} x2={259} y2={178} {...thin} strokeOpacity={0.4} />
      <line x1={266} y1={20} x2={266} y2={178} {...thin} strokeOpacity={0.4} />
      {/* artwork */}
      <rect x={318} y={64} width={72} height={60} fill="#EFE9DE" {...S} />
      <rect x={326} y={72} width={56} height={44} fill="#F9F6F0" {...thin} strokeOpacity={0.5} />
      <circle cx={354} cy={98} r={13} fill={C.seaMid} fillOpacity={0.85} />
      <line x1={330} y1={99} x2={378} y2={99} stroke={C.brass} strokeWidth={0.9} />
      {/* floor lamp */}
      <ellipse cx={306} cy={190} rx={10} ry={2.4} fill={C.line} />
      <line x1={306} y1={190} x2={306} y2={80} stroke={C.line} strokeWidth={1.4} />
      <path d="M290 62 h32 l7 18 h-46Z" fill={C.brassLight} {...S} />
      {/* rug */}
      <rect x={34} y={189} width={386} height={5} rx={2.5} fill={C.seaMid} />
      {/* sofa */}
      <rect x={70} y={122} width={206} height={38} rx={10} fill={C.sofa} {...S} />
      <rect x={62} y={152} width={222} height={28} rx={8} fill="#E4DED2" {...S} />
      <line x1={173} y1={154} x2={173} y2={178} {...thin} strokeOpacity={0.45} />
      <rect x={54} y={134} width={24} height={48} rx={10} fill={C.sofaShade} {...S} />
      <rect x={268} y={134} width={24} height={48} rx={10} fill={C.sofaShade} {...S} />
      <line x1={70} y1={182} x2={70} y2={190} stroke={C.line} strokeWidth={2} />
      <line x1={276} y1={182} x2={276} y2={190} stroke={C.line} strokeWidth={2} />
      {/* coffee table */}
      <rect x={326} y={162} width={74} height={7} rx={3.5} fill={C.stone} {...S} />
      <path d="M346 169 h34 l-4 21 h-26Z" fill="#E2D6C3" {...S} />
      <Plant x={423} y={170} />
    </g>
  );
}

function LivingClean() {
  return (
    <g>
      <rect x={86} y={126} width={42} height={30} rx={9} fill={C.sea} {...S} />
      <rect x={134} y={128} width={38} height={28} rx={9} fill="#F0EADF" {...S} />
      <rect x={218} y={126} width={42} height={30} rx={9} fill={C.sea} {...S} />
      {/* throw folded over the arm */}
      <path d="M262 138 h28 v32 h-28Z" fill={C.seaMid} {...S} />
      <line x1={263} y1={146} x2={289} y2={146} stroke="#fff" strokeOpacity={0.7} strokeWidth={1} />
      <line x1={263} y1={151} x2={289} y2={151} stroke="#fff" strokeOpacity={0.7} strokeWidth={1} />
      {/* vase with stems */}
      <line x1={359} y1={148} x2={352} y2={124} stroke={C.leafDark} strokeWidth={1} />
      <line x1={359} y1={148} x2={366} y2={118} stroke={C.leafDark} strokeWidth={1} />
      <line x1={359} y1={148} x2={360} y2={128} stroke={C.leafDark} strokeWidth={1} />
      <circle cx={352} cy={123} r={3.4} fill="#F7F2E8" {...thin} />
      <circle cx={366} cy={117} r={3.4} fill="#F7F2E8" {...thin} />
      <circle cx={360} cy={127} r={3} fill={C.brassLight} {...thin} />
      <path d="M354 162 q-5 -9 1 -15 h8 q6 6 1 15Z" fill="#F4F1EA" {...S} />
      <rect x={376} y={155} width={20} height={3.5} fill={C.seaDeep} />
      <rect x={378} y={158.5} width={18} height={3.5} fill={C.brass} />
      {/* woven basket with a folded blanket */}
      <path d="M12 170 h38 l-3 22 h-32Z" fill="#D8C4A2" {...S} />
      <line x1={14} y1={178} x2={48} y2={178} {...thin} strokeOpacity={0.4} />
      <line x1={15} y1={185} x2={47} y2={185} {...thin} strokeOpacity={0.4} />
      <rect x={15} y={163} width={32} height={8} rx={3} fill={C.sea} {...S} />
    </g>
  );
}

function LivingClutter() {
  return (
    <g>
      <Film w={446} h={210} />
      {/* smudged glass */}
      <ellipse cx={58} cy={120} rx={16} ry={6} transform="rotate(-24 58 120)" fill="#fff" fillOpacity={0.5} />
      <path d="M140 60 q10 20 2 44 M150 58 q8 18 0 40" stroke="#fff" strokeOpacity={0.6} strokeWidth={2} fill="none" />
      <Dots points={[[44, 70], [52, 64], [120, 140], [196, 90], [210, 96], [228, 150]]} r={1.6} opacity={0.45} />
      {/* heaped blanket */}
      <path d="M134 152 q8 -28 40 -24 q30 4 34 18 q24 2 28 20 q-44 10 -102 -14Z" fill={C.denim} {...S} />
      <path d="M160 140 q14 6 26 4 M190 150 q14 4 30 2" fill="none" {...thin} strokeOpacity={0.5} />
      {/* cushions everywhere */}
      <rect x={84} y={130} width={40} height={28} rx={9} transform="rotate(-20 104 144)" fill={C.sea} {...S} />
      <rect x={16} y={168} width={40} height={24} rx={8} transform="rotate(12 36 180)" fill={C.terracotta} {...S} />
      <rect x={288} y={170} width={34} height={22} rx={8} transform="rotate(-22 305 181)" fill="#F0EADF" {...S} />
      {/* laundry basket overflowing */}
      <path d="M92 192 q2 -14 16 -12 q6 -10 18 -4 q12 -2 12 10 l2 6Z" fill="#F4F0E8" {...S} />
      <path d="M100 186 q8 -6 18 -2" fill="none" {...thin} />
      <path d="M232 188 h16 l3 4 h-22Z" fill="#5E5047" />
      <path d="M252 189 h14 l3 3 h-19Z" fill="#5E5047" />
      {/* table: mugs and papers */}
      <rect x={330} y={150} width={9} height={12} rx={1.5} fill="#fff" {...S} />
      <path d="M339 153 q5 1 0 6" fill="none" {...thin} />
      <rect x={344} y={156} width={12} height={8} rx={1.5} transform="rotate(84 350 160)" fill={C.terracotta} {...S} />
      <rect x={360} y={157} width={32} height={4} transform="rotate(-8 376 159)" fill={C.mustard} {...thin} />
      <rect x={366} y={154} width={28} height={3} transform="rotate(7 380 156)" fill="#fff" {...thin} />
      {/* parcel on the floor */}
      <rect x={380} y={172} width={28} height={20} fill={C.cardboard} {...S} />
      <path d="M380 172 l-8 -8 M408 172 l8 -9" stroke={C.cardboardDark} strokeWidth={1.4} />
      <line x1={394} y1={172} x2={394} y2={192} stroke={C.cardboardDark} strokeWidth={1.2} />
      {/* papers and a ball */}
      <rect x={196} y={190} width={16} height={3.5} transform="rotate(-10 204 192)" fill="#fff" {...thin} />
      <rect x={176} y={191} width={14} height={3} transform="rotate(9 183 192)" fill="#fff" {...thin} />
      <circle cx={334} cy={187} r={5} fill={C.mustard} {...S} />
      <Dots points={[[150, 200], [160, 204], [300, 202], [320, 198], [60, 203], [420, 200]]} r={1.3} opacity={0.5} />
    </g>
  );
}

/* =====================================================================
   KITCHEN  428 x 210
   ===================================================================== */

function KitchenBase() {
  return (
    <g>
      <rect width={428} height={210} fill={C.wallAlt} />
      <Ceiling w={428} />
      <TileFloor y={192} w={428} h={18} />
      {/* tall pantry unit */}
      <rect x={14} y={18} width={62} height={174} rx={2} fill="#E8E1D4" {...S} />
      <line x1={14} y1={108} x2={76} y2={108} {...thin} />
      <line x1={69} y1={60} x2={69} y2={82} stroke={C.brass} strokeWidth={2} />
      <line x1={69} y1={118} x2={69} y2={140} stroke={C.brass} strokeWidth={2} />
      {/* upper cabinets */}
      <rect x={88} y={40} width={150} height={40} rx={2} fill="#E8E1D4" {...S} />
      <line x1={138} y1={40} x2={138} y2={80} {...thin} />
      <line x1={188} y1={40} x2={188} y2={80} {...thin} />
      {[113, 163, 213].map((hx) => (
        <line key={hx} x1={hx - 5} y1={74} x2={hx + 5} y2={74} stroke={C.brass} strokeWidth={1.6} />
      ))}
      {/* splashback */}
      <rect x={76} y={80} width={182} height={42} fill="#EAE3D6" />
      {Array.from({ length: 13 }, (_, i) => (
        <line key={`v${i}`} x1={76 + i * 14} y1={80} x2={76 + i * 14} y2={122} stroke="#DCD3C4" strokeWidth={0.6} />
      ))}
      {[94, 108].map((ly) => (
        <line key={ly} x1={76} y1={ly} x2={258} y2={ly} stroke="#DCD3C4" strokeWidth={0.6} />
      ))}
      <path d="M134 80 h54 l-5 8 h-44Z" fill="#D9D1C2" {...S} />
      {/* window over the sink */}
      <Glazing x={258} y={26} w={140} h={88} mullions={[328]} variant={1} />
      <rect x={254} y={114} width={148} height={8} fill="#EAE3D6" />
      {/* worktop and base run */}
      <rect x={76} y={122} width={342} height={8} fill={C.stone} {...S} />
      <path d="M100 126 q30 -3 60 0 M300 125 q40 -2 80 1" fill="none" stroke="#D9D4CA" strokeWidth={0.7} />
      <rect x={76} y={130} width={342} height={56} fill={C.seaMid} {...S} />
      {[128, 192, 250, 310, 370].map((dx) => (
        <line key={dx} x1={dx} y1={130} x2={dx} y2={186} {...thin} />
      ))}
      {[221, 280, 340, 394].map((hx) => (
        <line key={hx} x1={hx - 6} y1={137} x2={hx + 6} y2={137} stroke={C.brass} strokeWidth={1.6} />
      ))}
      <rect x={76} y={186} width={342} height={6} fill={C.seaDeep} />
      {/* oven and hob */}
      <rect x={132} y={134} width={56} height={48} rx={2} fill={C.ovenGlass} {...S} />
      <rect x={138} y={146} width={44} height={28} rx={2} fill="#3E6066" />
      <line x1={140} y1={140} x2={180} y2={140} stroke={C.brass} strokeWidth={1.6} />
      <rect x={134} y={119.5} width={52} height={2.5} fill={C.ovenGlass} />
      {/* sink and tap */}
      <rect x={292} y={122} width={48} height={3} fill="#C9D4CF" />
      <path d="M330 122 v-15 q0 -8 -8 -8 h-6" fill="none" stroke={C.brass} strokeWidth={2} strokeLinecap="round" />
    </g>
  );
}

function KitchenClean() {
  return (
    <g>
      {[86, 98, 110].map((jx, i) => (
        <g key={jx}>
          <rect x={jx} y={108} width={9} height={14} rx={1.5} fill="#F6F3EC" {...thin} />
          <rect x={jx + 1} y={114} width={7} height={7} fill={i === 1 ? C.sea : "#E5D6B8"} />
          <rect x={jx - 0.5} y={105.5} width={10} height={3} rx={1} fill={C.brass} />
        </g>
      ))}
      <path d="M206 114 h32 q-2 8 -16 8 q-14 0 -16 -8Z" fill="#F6F3EC" {...S} />
      <circle cx={213} cy={112} r={4.4} fill="#E4C66E" {...thin} />
      <circle cx={222} cy={110} r={4.4} fill="#E4C66E" {...thin} />
      <circle cx={231} cy={112} r={4.4} fill="#E4C66E" {...thin} />
      <rect x={244} y={90} width={12} height={32} rx={4} fill={C.oak} {...S} />
      <circle cx={250} cy={96} r={1.8} fill={C.wallAlt} />
      {/* folded towel on the oven rail */}
      <rect x={151} y={140} width={16} height={22} fill="#fff" {...S} />
      <line x1={152} y1={146} x2={166} y2={146} stroke={C.seaDeep} strokeWidth={1.2} />
      <line x1={152} y1={149} x2={166} y2={149} stroke={C.seaDeep} strokeWidth={1.2} />
      <Plant x={378} y={108} scale={0.55} />
    </g>
  );
}

function KitchenClutter() {
  return (
    <g>
      <Film w={428} h={210} />
      {/* cupboard door left open */}
      <path d="M88 40 l-16 6 v34 l16 0Z" fill="#DCD4C5" {...S} />
      {/* splashes around the hob */}
      <Dots points={[[140, 98], [146, 104], [152, 96], [170, 102], [176, 110], [160, 112], [186, 98], [128, 110]]} r={2.2} fill={C.terracotta} opacity={0.5} />
      <path d="M150 100 q2 8 0 14" stroke={C.grime} strokeOpacity={0.5} strokeWidth={1.6} fill="none" />
      {/* pan with a loose lid */}
      <rect x={138} y={111} width={32} height={9} rx={2} fill="#45585B" {...S} />
      <line x1={170} y1={114} x2={198} y2={106} stroke="#45585B" strokeWidth={3} strokeLinecap="round" />
      <ellipse cx={150} cy={108} rx={14} ry={3} transform="rotate(-14 150 108)" fill="#7C8C8E" {...thin} />
      {/* toppled jars and an open box */}
      <rect x={84} y={113} width={15} height={9} rx={1.5} fill="#F6F3EC" {...thin} />
      <Dots points={[[102, 120], [106, 121], [110, 119], [114, 121]]} r={1.4} fill="#C8B288" opacity={0.9} />
      <rect x={104} y={94} width={17} height={28} fill={C.mustard} {...S} />
      <rect x={107} y={102} width={11} height={8} fill="#fff" fillOpacity={0.7} />
      {/* dishes stacked by the sink */}
      {[120, 116, 112, 108].map((py, i) => (
        <ellipse key={py} cx={362 + (i % 2) * 3} cy={py} rx={18} ry={2.8} fill="#FAF8F4" {...thin} />
      ))}
      <ellipse cx={306} cy={116} rx={12} ry={2.6} transform="rotate(-55 306 116)" fill="#FAF8F4" {...thin} />
      <ellipse cx={314} cy={115} rx={11} ry={2.4} transform="rotate(-70 314 115)" fill="#FAF8F4" {...thin} />
      <rect x={376} y={98} width={8} height={10} rx={1.5} fill={C.terracotta} {...thin} />
      <rect x={270} y={110} width={9} height={12} rx={1.5} fill="#fff" {...thin} />
      <rect x={281} y={112} width={9} height={10} rx={1.5} fill={C.denim} {...thin} />
      {/* crumpled towel */}
      <path d="M232 122 q2 -10 10 -8 q4 -6 10 0 q8 -2 8 8Z" fill="#fff" {...S} />
      {/* notes on the pantry */}
      <rect x={26} y={34} width={12} height={12} transform="rotate(-8 32 40)" fill={C.mustard} fillOpacity={0.9} />
      <rect x={44} y={40} width={11} height={11} transform="rotate(6 49 45)" fill="#fff" {...thin} />
      <rect x={30} y={60} width={10} height={12} transform="rotate(4 35 66)" fill={C.sea} />
      {/* shopping bag on the floor */}
      <path d="M380 160 h30 l-2 32 h-26Z" fill={C.cardboard} {...S} />
      <line x1={391} y1={160} x2={386} y2={138} stroke={C.leafDark} strokeWidth={3} strokeLinecap="round" />
      <line x1={398} y1={160} x2={404} y2={142} stroke="#D9B98A" strokeWidth={4} strokeLinecap="round" />
      {/* bottles waiting for recycling */}
      <rect x={250} y={186} width={22} height={6} rx={3} fill={C.seaDeep} fillOpacity={0.9} {...thin} />
      <rect x={276} y={182} width={7} height={10} rx={2} fill={C.seaMid} {...thin} />
      <Dots points={[[200, 198], [206, 202], [214, 199], [226, 204], [320, 200], [330, 203], [110, 202]]} r={1.3} opacity={0.6} />
      <ellipse cx={170} cy={200} rx={14} ry={2.4} fill={C.grime} fillOpacity={0.22} />
    </g>
  );
}

/* =====================================================================
   BATH  310 x 190
   ===================================================================== */

function BathBase() {
  return (
    <g>
      <rect width={310} height={190} fill={C.wallBath} />
      <Ceiling w={310} />
      <rect y={96} width={310} height={80} fill="#EDE6DA" />
      {Array.from({ length: 18 }, (_, i) => (
        <line key={`tv${i}`} x1={i * 18 + 4} y1={96} x2={i * 18 + 4} y2={176} stroke="#DFD6C8" strokeWidth={0.6} />
      ))}
      {[114, 132, 150, 168].map((ty) => (
        <line key={ty} x1={0} y1={ty} x2={310} y2={ty} stroke="#DFD6C8" strokeWidth={0.6} />
      ))}
      <TileFloor y={176} w={310} h={14} />
      {/* clerestory window */}
      <rect x={40} y={18} width={100} height={36} fill="url(#cs-frost)" stroke={C.line} strokeWidth={1.6} />
      <line x1={90} y1={18} x2={90} y2={54} stroke={C.line} strokeWidth={1.2} />
      <path d="M70 18 h14 l-22 36 h-14Z" fill="#fff" fillOpacity={0.35} />
      {/* mirror */}
      <circle cx={250} cy={66} r={23} fill="url(#cs-mirror)" stroke={C.brass} strokeWidth={1.8} />
      {/* freestanding bath */}
      <path d="M24 126 h150 q0 46 -40 48 h-70 q-40 -2 -40 -48Z" fill="#FBF9F5" {...S} />
      <line x1={22} y1={126} x2={176} y2={126} stroke={C.line} strokeWidth={1.8} />
      <rect x={42} y={172} width={8} height={4} fill={C.brass} />
      <rect x={148} y={172} width={8} height={4} fill={C.brass} />
      <path d="M188 176 V110 q0 -8 -8 -8 h-7" fill="none" stroke={C.brass} strokeWidth={2.2} strokeLinecap="round" />
      {/* wall hung vanity */}
      <rect x={206} y={114} width={90} height={6} fill={C.oak} {...S} />
      <rect x={210} y={120} width={82} height={28} fill={C.oakLight} {...S} />
      <line x1={210} y1={134} x2={292} y2={134} {...thin} />
      <line x1={245} y1={127} x2={257} y2={127} stroke={C.brass} strokeWidth={1.6} />
      <line x1={245} y1={141} x2={257} y2={141} stroke={C.brass} strokeWidth={1.6} />
      <path d="M228 114 q0 -12 22 -12 q22 0 22 12Z" fill="#FBF9F5" {...S} />
      <path d="M250 92 v4 h-8" fill="none" stroke={C.brass} strokeWidth={1.8} strokeLinecap="round" />
      {/* leaning towel ladder */}
      <line x1={6} y1={176} x2={16} y2={98} stroke={C.oak} strokeWidth={2.2} />
      <line x1={24} y1={176} x2={34} y2={98} stroke={C.oak} strokeWidth={2.2} />
      {[110, 132, 154].map((ry, i) => (
        <line key={ry} x1={15 - i * 2.8} y1={ry} x2={33 - i * 2.8} y2={ry} stroke={C.oak} strokeWidth={1.6} />
      ))}
    </g>
  );
}

function BathClean() {
  return (
    <g>
      <rect x={10} y={110} width={20} height={34} rx={2} transform="rotate(7 20 127)" fill={C.sea} {...S} />
      <line x1={12} y1={136} x2={29} y2={138} stroke="#fff" strokeOpacity={0.7} strokeWidth={1} />
      {/* rolled towels in a basket */}
      <path d="M216 160 h42 l-3 16 h-36Z" fill="#D9C7A7" {...S} />
      {[226, 238, 250].map((tx) => (
        <g key={tx}>
          <circle cx={tx} cy={157} r={6} fill="#F7F3EB" {...S} />
          <circle cx={tx} cy={157} r={2.4} fill="none" {...thin} />
        </g>
      ))}
      <rect x={276} y={102} width={6} height={12} rx={1.5} fill={C.brass} {...thin} />
      <rect x={285} y={104} width={6} height={10} rx={1.5} fill={C.seaMid} {...thin} />
      <rect x={150} y={118} width={9} height={8} rx={1} fill="#F6F1E6" {...thin} />
      <line x1={154.5} y1={118} x2={154.5} y2={114} stroke={C.line} strokeWidth={0.8} />
      <rect x={58} y={175} width={74} height={3} rx={1.5} fill={C.seaMid} />
      <Plant x={300} y={176} scale={0.5} />
    </g>
  );
}

function BathClutter() {
  return (
    <g>
      <Film w={310} h={190} />
      {/* steamed, smudged mirror */}
      <ellipse cx={244} cy={60} rx={14} ry={8} transform="rotate(-30 244 60)" fill="#fff" fillOpacity={0.55} />
      <path d="M236 74 q8 -4 18 2 M258 54 q4 10 -2 18" stroke="#fff" strokeOpacity={0.75} strokeWidth={2} fill="none" />
      <Dots points={[[262, 76], [240, 82], [254, 50], [232, 64]]} r={1.4} fill={C.grime} opacity={0.5} />
      {/* grout and limescale */}
      <rect x={4} y={96} width={36} height={18} fill={C.grime} fillOpacity={0.12} />
      <rect x={130} y={150} width={36} height={18} fill={C.grime} fillOpacity={0.1} />
      <path d="M180 104 q-2 6 2 10" stroke="#fff" strokeOpacity={0.8} strokeWidth={1.4} fill="none" />
      {/* towels on the floor and over the bath */}
      <path d="M118 124 h26 v28 q-13 6 -26 0Z" fill={C.terracotta} {...S} />
      <path d="M18 186 q4 -16 22 -14 q10 -10 22 -2 q14 -2 16 16Z" fill={C.sea} {...S} />
      <path d="M44 186 q6 -10 18 -8 q10 2 10 8Z" fill="#fff" {...S} />
      {/* bottles knocked over */}
      <rect x={270} y={106} width={12} height={6} rx={1.5} transform="rotate(-8 276 109)" fill={C.brass} {...thin} />
      <rect x={284} y={104} width={6} height={10} rx={1.5} transform="rotate(22 287 109)" fill={C.seaMid} {...thin} />
      <rect x={176} y={182} width={14} height={6} rx={2} fill={C.denim} {...thin} />
      <rect x={56} y={118} width={6} height={9} rx={1.5} transform="rotate(-70 59 122)" fill={C.mustard} {...thin} />
      {/* laundry by the vanity */}
      <path d="M232 186 q2 -18 18 -16 q8 -10 20 -2 q14 0 14 18Z" fill={C.denim} {...S} />
      <path d="M250 186 q4 -8 14 -6 q8 2 8 6Z" fill="#F4F0E8" {...S} />
      {/* puddles */}
      <ellipse cx={150} cy={184} rx={16} ry={2.4} fill="#BFD3D6" fillOpacity={0.85} />
      <ellipse cx={104} cy={185} rx={9} ry={1.8} fill="#BFD3D6" fillOpacity={0.85} />
    </g>
  );
}

/* =====================================================================
   BEDROOM  430 x 190  (always calm; not part of the explorer)
   ===================================================================== */

export function BedroomArt() {
  return (
    <g>
      <rect width={430} height={190} fill={C.wall} />
      <Ceiling w={430} />
      <rect y={168} width={430} height={6} fill={C.skirting} />
      <TimberFloor y={174} w={430} h={16} />
      <line x1={278} y1={14} x2={420} y2={14} stroke={C.line} strokeWidth={1.4} />
      <Glazing x={300} y={22} w={110} h={134} mullions={[355]} />
      <path d="M282 15 h16 v154 q-4 4 -8 0 q-4 -4 -8 0Z" fill="#E9E2D6" {...S} />
      <rect x={96} y={44} width={108} height={38} fill="#EFE9DE" {...S} />
      <path d="M104 74 q20 -24 44 -6 q22 14 48 -10" fill="none" stroke={C.seaDeep} strokeWidth={1.2} />
      <rect x={50} y={92} width={200} height={56} rx={6} fill="#DCCFBC" {...S} />
      <rect x={66} y={116} width={52} height={20} rx={8} fill="#FBF9F5" {...S} />
      <rect x={124} y={116} width={52} height={20} rx={8} fill="#FBF9F5" {...S} />
      <rect x={40} y={132} width={220} height={36} rx={6} fill="#F8F5EF" {...S} />
      <rect x={184} y={132} width={42} height={36} fill={C.sea} {...S} />
      <line x1={52} y1={168} x2={52} y2={176} stroke={C.line} strokeWidth={2} />
      <line x1={248} y1={168} x2={248} y2={176} stroke={C.line} strokeWidth={2} />
      <rect x={266} y={138} width={28} height={36} fill={C.oak} {...S} />
      <line x1={280} y1={138} x2={280} y2={122} stroke={C.line} strokeWidth={1.2} />
      <path d="M270 108 h20 l4 14 h-28Z" fill={C.brassLight} {...S} />
      <rect x={20} y={172} width={260} height={4} rx={2} fill={C.linen} />
    </g>
  );
}

/* ---------- registry ---------- */

export const roomArt: Record<RoomId, { Base: () => ReactNode; Clean: () => ReactNode; Clutter: () => ReactNode }> = {
  living: { Base: LivingBase, Clean: LivingClean, Clutter: LivingClutter },
  kitchen: { Base: KitchenBase, Clean: KitchenClean, Clutter: KitchenClutter },
  bath: { Base: BathBase, Clean: BathClean, Clutter: BathClutter },
};
