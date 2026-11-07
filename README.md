# CLEARSPACE

A premium cleaning company website built with Next.js 16 (App Router), TypeScript, Tailwind CSS 4 and Motion.
One page, six sections, a signature interaction called **The Clearspace Reset**, and a four step booking flow
that is honest about being a demo until a backend is connected.

```bash
npm install
npm run dev        # http://localhost:3000
npm run build && npm start
npm run lint
```

---

## 1. How the three references were compared

| | Design 1 "Space to live" | Design 2 "Beautifully clean" | Design 3 "Life happens" |
|---|---|---|---|
| Navigation | Clear, with a Services dropdown. Heavy angled logo tab. | Same structure plus a redundant circular arrow button. | Calmest: wordmark, thin dividers, one booking action. |
| Hero | Strong conversion (booking widget in the hero) but generic stock composition. | Editorial notched photo with a docked widget. Distinctive corner geometry. | Architectural house with room hotspots and a connected panel. Most memorable and the best base for a "reset" concept. |
| Cards | Bento of four services with many diagonal cuts; busy. | Number tabs notched into photos; pill rows for minor services. | Few cards; a dark panel with a vertical service list. |
| Type and colour | Petrol, porcelain, sea glass, copper. Solid serif. | Evergreen and sage. Sans and italic serif mixed; less consistent. | Light serif with italic emphasis; the most mature. |
| Booking journey | Tabs, property type, frequency, date. Most complete. | Service and date strip at the end. | Three step process band and a final strip. |
| Motion potential | Moderate. | Moderate. | High: hotspots, focus changes, panel updates. |
| Mobile and build cost | Bento collapses well. | Notches need care. | A photoreal cutaway render does not exist as a licensed asset and would need commissioning. |

**Kept:** Design 3's hero concept, headline and light serif voice; Design 3's vertical service index on a petrol
panel; Design 1's palette discipline, service coverage (four services), booking fields and frequency options;
Design 2's notched corner, used once as a signature (the service number docking into the photo).

**Improved:** the house became an original architectural section drawing in code, so every room has a true busy
and clean state; the three step process became the real booking steps with an animated indicator; the service
list became accessible tabs whose photo wipes in the same direction as the Reset.

**Discarded:** Design 1's angled logo tab and repeated diagonals, Design 2's duplicate arrow button and font mixing,
the "Your space" apartment and workspace tabs under Design 3's hero (they duplicated the services), and the compact
navbar previews (annotations, not page sections).

## 2. Final design decisions

- **Palette:** deep petrol `#153F46`, warm porcelain `#F6F2EB`, muted sea glass `#C9DBD2`, with brass `#B98A4E` held
  back for hairlines, numerals, the slider handle and the active tab. Tokens live in `src/app/globals.css`.
- **Type:** Newsreader (display, light weights with italic emphasis, optical sizing) and Instrument Sans (UI and body),
  self hosted through `next/font`.
- **Geometry:** one radius system: panels 28px, cards 20px, fields 14px, buttons and chips as pills. One inverted
  notch (services photo) and one diagonal per dark band, never more.
- **Rhythm:** light hero, contained petrol services panel, light showcase, a petrol and photo people band, a full bleed
  sea glass visits band, the booking area, then a petrol footer. Each section has a different proportion.
- **Copy:** short, natural, and free of hyphens in visible text. No reviews, certifications, statistics, prices or
  contact details were invented. Prices show "Tailored quote" until set.

## 3. The Clearspace Reset

The hero is a cross section of a two storey home drawn in SVG (`src/components/illustration`). Each room is
three layers: **Base** (architecture and furniture), **Clean** (the details of a cared for room) and **Clutter**
(laundry, dishes, smudges and a dull film).

Selecting Kitchen, Living or Bath, from the hotspot in the drawing or the tabs below it:

1. highlights the room and its tab;
2. pans and crops the scene toward it (one CSS transform; hotspots move with it but never scale);
3. lowers the light in every other room and warms the chosen one;
4. runs a single squeegee pass that clips the Clutter layer away and reveals the Clean layer of the same room;
5. updates the connected panel with what that room's clean includes;
6. **Plan this clean** carries Home cleaning and the chosen room into the booking form, scrolls there and moves focus.

The first reset plays once on load, only if the visitor has not already interacted. With reduced motion there is no
pan or wipe: rooms switch instantly and every action still works.

The before and after showcase reuses the same drawing, cropped to one room, so the comparison is always the same
room. It is labelled "Illustrated example".

## 4. Navigation

Fixed, centred, and never part of document flow, so nothing shifts. At the top it spans 94% of the viewport (max
1640px). Past 112px of scroll it contracts to about 78% (never narrower than 900px, max 1220px) and only expands
again above 72px, so it cannot flicker at the threshold. Width, top offset, padding, radius, background, border and
shadow share one 0.6s curve; text never scales. Services is an accessible disclosure (button plus real links, arrow
keys, Escape returns focus). Below 1024px a dedicated full screen menu opens in a native modal `<dialog>`.

## 5. Replacing assets

| What | Where | How |
|---|---|---|
| Photographs | `src/assets/media/*.jpg`, registered in `src/content/media.ts` | Replace the file (or change the import), update `alt` and `focus` (CSS object position). Sizes and blur placeholders are read automatically. |
| Before and after pairs | `src/content/showcase.ts` | Switch an entry to `kind: "photo"` with matching `before` and `after` imports. Use the same room and camera position. Never pair two different rooms. |
| Hero rooms | `src/content/rooms.ts` (copy and geometry) and `src/components/illustration/rooms.tsx` (drawing) | Copy can change freely. If you redraw a room keep its box size, or update `box`, `dot` and `focusView`. |
| Services, visits, standards | `src/content/services.ts`, `visits.ts`, `standards.ts` | Plain data. `priceFrom: null` shows "Tailored quote". |
| Business details | `src/content/site.ts` | Contact fields left `null` are not rendered. |
| Booking options | `src/content/booking.ts` | Property types, sizes, time windows, how far ahead dates may be chosen. |

Current photographs are from Unsplash under the Unsplash License, credited in the footer. Replace them with the
client's own photography before launch, ideally of their team in uniform for the standards band.

## 6. Connecting a real booking backend

By default the form runs in **demo mode**: nothing leaves the browser, the review step and summary say so, and the
final dialog states that nothing was sent and no visit was booked. It never shows a confirmation.

To go live:

```bash
# .env.local  (see .env.example)
NEXT_PUBLIC_BOOKING_MODE=live
BOOKING_FORWARD_URL=https://your-crm-or-automation.example/webhook
BOOKING_FORWARD_TOKEN=optional-secret   # sent as Authorization: Bearer
```

The form then posts to `src/app/api/booking/route.ts`, which re-validates every field on the server with the same
rules as the form (`src/lib/booking.ts`), then forwards this JSON:

```json
{
  "service": "home",
  "property": { "type": "House", "size": "2 bedrooms", "focusRoom": "kitchen" },
  "location": { "postcode": "AB1 2CD", "town": "Bath" },
  "schedule": { "frequency": "weekly", "preferredDate": "2026-11-12", "timeWindow": "morning" },
  "contact": { "name": "…", "email": "…", "phone": "…" },
  "notes": "",
  "createdAt": "2026-11-07T19:00:00.000Z"
}
```

Responses: `202` forwarded, `422` with field errors, `502` if the destination fails, `503` if no destination is set.
The visitor sees "Request received", explicitly not a confirmed booking. Good destinations are a CRM or scheduling
tool webhook, an automation service, or a small function that emails the team. If you later add real
availability, fetch it into the date step and keep the server as the source of truth.

## 7. Motion system

One library (Motion) plus CSS transitions. Shared easing `cubic-bezier(0.22, 1, 0.36, 1)`. Headings rise line by line
from a mask; images open with a short clip wipe and settle from a slight zoom; service photos wipe left to right
like the Reset; tab indicators glide between items; booking steps slide in the direction of travel while the progress
line fills. Buttons press 1px with a small arrow nudge. No scroll hijacking, preloader, cursor replacement or
constant motion. `prefers-reduced-motion` removes transforms, pans, wipes and smooth scrolling; all content stays.

## 8. What was verified

Automated Playwright checks (71) and an axe-core audit (no violations at 1440px or 390px):

- nav width at top (94vw) and after scroll (78vw), animated monotonically, hysteresis with no toggling near the
  threshold, smooth reversal, zero layout shift;
- every in-page link has a target; dropdown keyboard support and focus return;
- service tabs (click, arrows, dropdown deep links) update the right details;
- hero hotspots and tabs select, zoom and reset rooms; Plan this clean carries service and room into booking;
- slider with arrow keys, Home, End and mouse drag; room switching;
- booking: required fields, past and same day dates rejected, invalid email rejected, service dependent options,
  review summary and live summary carry every selection, demo dialog wording, focus trapped and returned;
- no horizontal overflow at 360, 390, 768 and 1024px; phone menu opens, traps focus, closes and returns focus;
- reduced motion: no zoom, instant resets, nav transitions disabled, smooth scroll off;
- production build prerenders the page statically; the API route accepts, rejects and forwards correctly.

## 9. Project structure

```
src/
  app/                 layout, page, global tokens, /api/booking
  content/             all editable copy, options and media registry
  lib/                 booking rules and payload, hooks, scroll helpers
  components/
    nav/               SiteNav, ServicesMenu, MobileMenu
    hero/              Hero, HouseExplorer (the Reset)
    illustration/      house section drawing, palette, shared SVG defs
    services/ showcase/ standard/ visits/ booking/ footer/ ui/
```
