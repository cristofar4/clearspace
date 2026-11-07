# CLEARSPACE

A premium cleaning company website built with Next.js 16 (App Router), TypeScript, Tailwind CSS 4 and Motion.
One page, six sections and a signature hero: a real kitchen that arrives dirty, is **scanned clean** top to
bottom, then walked through stop by stop as **the Clearspace route**. The navigation throws lightning around its
outline whenever it moves, a light runs through the whole site, and a four step booking flow stays honest about
being a demo until a backend is connected.

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

**Kept:** Design 3's idea of an explorable hero with hotspots and a connected panel, its headline and light serif voice; Design 3's vertical service index on a petrol
panel; Design 1's palette discipline, service coverage (four services), booking fields and frequency options;
Design 2's notched corner, used once as a signature (the service number docking into the photo).

**Improved:** the cutaway house became a real kitchen photograph you can walk through stop by stop; the before and
after became an honest regular versus deep comparison on real photos; the three step process became the real
booking steps with an animated indicator; the service list became accessible tabs whose photo wipes across.

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

## 3. Scan and clean, then the Clearspace route

**Scan and clean.** On arrival the kitchen photo sits under a grime film: a dull, dim, hazy treatment with
stains, specks, smeared glass and dust hanging in the air (`src/components/hero/ScanLayers.tsx`). A scanning beam
sweeps from top to bottom, the same order we clean in, and names each surface as it reaches it. Behind the beam
the room comes up clean: full colour and clarity, the dust lifts and dissolves, a soft bloom of light follows and
reflective surfaces glint. A readout counts the scan and ends on "Room reset". Then the route begins. A scan button
in the panel replays it, and choosing any stop mid scan finishes the clean at once. The grime is a visual effect
over one real photograph, not a photo of a real job, and reduced motion shows the room clean from the start.


The hero is a real kitchen photograph (`src/content/route.ts`). A Clearspace kitchen clean is shown in the order
professionals work: top to bottom, dry before wet, finishing at the door.

1. **Lights and high shelves** 2. **Windows and glass** 3. **Hood, hob and splashback**
4. **Worktops and island** 5. **Sink and taps** 6. **Floors**

At each stop:

- a small light travels the route from the garden door and draws it in brass behind it;
- the camera moves in on the surface (one transform; the numbered markers move with it but never scale);
- the room dims around the surface and an inspection frame settles on it;
- a single polish pass crosses the surface;
- the panel says what is done there and why it comes at that point in the order.

It plays once on load if the visitor has not acted, pauses when scrolled away or when the tab is hidden, and has
Play, Pause, Previous and Next controls plus numbered tabs with progress bars. Any marker or tab jumps straight
to that stop. **Plan this clean** carries Home cleaning with a kitchen focus into the booking form. With reduced
motion there is no autoplay, camera move or polish pass; every stop still works.

**Why there is no "messy to clean" photo in the hero.** No licensed photographs exist of the same real kitchen
before and after a clean (Unsplash, Wikimedia Commons; Pexels and Pixabay are unreachable from this build
environment). Pairing someone else's messy kitchen with a different clean one would misrepresent the work, so the
real photo shows the method instead. When the client has their own matched pairs, they drop into the comparison
section (below) without code changes.

### The difference: regular or deep

Real photographs of a kitchen, a bathroom and a living room. The accessible slider (mouse, touch, arrow keys,
Page Up, Page Down, Home, End) compares what a regular clean covers on the left with what a deep clean adds on the
right, marked on the same photo. It compares scope, so one honest photo per room is enough. `src/content/showcase.ts`
also accepts true before and after pairs (`kind: "photo"`).

### Lightning in the navigation

Whenever the bar moves (contracting or expanding with scroll, or as you pass into a new section), a strike of
light flashes around its outline and two sparks, gold and sea glass, race around the edge from opposite sides with
a brief electric flicker. It follows the bar's exact shape at any width and radius, and it is decorative only
(reduced motion turns it off).

### The Clearspace light

The Book button in the navigation carries a small indicator light. It blinks in short bursts (on load, when the bar
contracts or expands, when you move into a new section, when you make a booking choice, and on hover) and glows
steadily in between. It is brass while you browse and turns sea glass once a booking is under way. Bursts stay
under five seconds so the page meets WCAG 2.2.2, and reduced motion keeps it steady. The same light leads the
route in the hero.

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
| Hero kitchen and route | `src/content/route.ts` (stops) and `media.routeKitchen` | Use a landscape 3:2 photo. For each stop set `at` (marker) and `frame` (the surface) in percent of the photo, and `zoom` (1.3 to 1.7 works well). Copy can change freely. |
| Comparison rooms | `src/content/showcase.ts` | `kind: "coverage"` takes one photo with `regular` and `deep` pins in percent of the photo. For a true before and after, use `kind: "photo"` with matching `before` and `after` imports from the same room and camera position. Never pair two different rooms. |
| Services, visits, standards | `src/content/services.ts`, `visits.ts`, `standards.ts` | Plain data. `priceFrom: null` shows "Tailored quote". |
| Business details | `src/content/site.ts` | Contact fields left `null` are not rendered. |
| Booking options | `src/content/booking.ts` | Property types, sizes, time windows, how far ahead dates may be chosen. |

Current photographs are from Unsplash under the Unsplash License (each licence checked individually), credited
in the footer. Replace them with the client's own photography before launch: ideally a real client kitchen for the
route, matched before and after pairs for the comparison, and their team in uniform for the standards band.

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

One idea runs through every effect: light that scans, reveals and cleans.

- **Hero:** grime, scan beam, dissolving dust, bloom and glints, then the route with its travelling light.
- **Navigation:** lightning around the outline on every move; the Book light blinks in short bursts.
- **Images:** every photograph is scanned into view by a beam rather than faded in, and settles from a slight zoom.
- **Headings:** a gleam of light passes through the italic word once it arrives; the hero's "We reset" gleams
  the moment the room comes clean.
- **Services:** each new photo wipes across with a scan line on its leading edge.
- **Dark panels:** a soft light follows the pointer (hover devices only).
- **Depth:** photographs drift a few percent against the scroll.
- **Comparison:** the divider is a live scan line.
- **Footer:** the large wordmark is scanned from dusty to crisp as it comes into view.


Implementation: one library (Motion) plus CSS transitions and one small canvas for dust. Shared easing `cubic-bezier(0.22, 1, 0.36, 1)`. Headings rise line by line
from a mask; images open with a short clip wipe and settle from a slight zoom; service photos wipe left to right;
the route light travels and draws its path; tab indicators glide between items; booking steps slide in the direction
of travel while the progress line fills. Buttons press 1px with a small arrow nudge. No scroll hijacking, preloader
or cursor replacement. Anything that moves for more than five seconds (the route) can be paused, and the nav light
only blinks in short bursts. `prefers-reduced-motion` removes transforms, camera moves, polish passes, blinking and
smooth scrolling; all content stays.

## 8. What was verified

Automated Playwright checks (91) and an axe-core audit (no violations at 1440px or 390px):

- the hero starts dirty, the scan sweeps and finishes clean, stop markers appear afterwards, and the route then
  autoplays; reduced motion shows the room clean with no grime, readout or autoplay;
- the navigation lightning runs when the bar moves;

- nav width at top (94vw) and after scroll (78vw), animated monotonically, hysteresis with no toggling near the
  threshold, smooth reversal, zero layout shift; nav light blinks in bursts under five seconds and turns sea glass
  once a booking starts;
- every in-page link has a target; dropdown keyboard support and focus return;
- service tabs (click, arrows, dropdown deep links) update the right details;
- the route autoplays once, advances on its own, pauses when scrolled away, and responds to markers, tabs, arrow
  keys, Previous, Next, Play and Pause; the camera moves in on each surface; Plan this clean carries the kitchen
  into booking and moves focus there;
- comparison slider with arrow keys, Home, End and mouse drag; room switching updates the list;
- booking: required fields, past and same day dates rejected, invalid email rejected, service dependent options,
  review summary and live summary carry every selection, demo dialog wording, focus trapped and returned;
- no horizontal overflow at 360, 390, 768 and 1024px; phone menu opens, traps focus, closes and returns focus;
- reduced motion: no autoplay, no camera zoom, stops still selectable, no blinking, nav transitions and smooth
  scroll off;
- no hyphens or dashes in visible copy, labels or alt text;
- production build prerenders the page statically; the API route accepts, rejects and forwards correctly.

## 9. Project structure

```
src/
  app/                 layout, page, global tokens, /api/booking
  content/             all editable copy, options and media registry
  lib/                 booking rules and payload, hooks, scroll helpers
  components/
    nav/               SiteNav, ServicesMenu, MobileMenu
    hero/              Hero, KitchenRoute (the Clearspace route)
    services/ showcase/ standard/ visits/ booking/ footer/ ui/
```
