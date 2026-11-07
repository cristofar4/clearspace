import { C } from "./palette";

/**
 * Shared gradients and patterns for every illustration on the page.
 * Rendered once, offscreen, so each scene can reference them by id.
 */
export function ArtDefs() {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      width="0"
      height="0"
      style={{ position: "absolute", width: 0, height: 0, overflow: "hidden" }}
    >
      <defs>
        <linearGradient id="cs-glass" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#EAF2EE" />
          <stop offset="1" stopColor="#CADDD3" />
        </linearGradient>
        <linearGradient id="cs-frost" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#F2F6F3" />
          <stop offset="1" stopColor="#D9E6DF" />
        </linearGradient>
        <linearGradient id="cs-mirror" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#F1F5F2" />
          <stop offset="1" stopColor="#CFDDD6" />
        </linearGradient>
        <linearGradient id="cs-ceiling" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#13282C" stopOpacity="0.09" />
          <stop offset="1" stopColor="#13282C" stopOpacity="0" />
        </linearGradient>
        <radialGradient id="cs-warm" cx="0.5" cy="0.2" r="0.85">
          <stop offset="0" stopColor="#FFF3D8" stopOpacity="0.75" />
          <stop offset="0.6" stopColor="#FFF3D8" stopOpacity="0.18" />
          <stop offset="1" stopColor="#FFF3D8" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="cs-sun" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#FFF1D6" stopOpacity="0.9" />
          <stop offset="1" stopColor="#FFF1D6" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="cs-sheen" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#FFFFFF" stopOpacity="0" />
          <stop offset="0.8" stopColor="#FFFFFF" stopOpacity="0.5" />
          <stop offset="1" stopColor="#FFFFFF" stopOpacity="0.9" />
        </linearGradient>
        <linearGradient id="cs-earth" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#E9E1D3" />
          <stop offset="1" stopColor="#F6F2EB" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="cs-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#E8EFEA" />
          <stop offset="0.7" stopColor="#F4F0E8" />
          <stop offset="1" stopColor="#F6F2EB" />
        </linearGradient>
        <pattern id="cs-hatch" width="12" height="12" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <line x1="0" y1="0" x2="0" y2="12" stroke={C.cut} strokeOpacity="0.16" strokeWidth="1.2" />
        </pattern>
      </defs>
    </svg>
  );
}
