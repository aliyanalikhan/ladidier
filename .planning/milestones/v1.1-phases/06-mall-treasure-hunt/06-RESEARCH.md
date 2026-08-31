# Phase 6: Mall Treasure Hunt - Research

**Researched:** 2026-08-22
**Domain:** Client-side gamified discovery feature on a zero-build React/Babel-CDN static site
**Confidence:** HIGH (all claims verified by direct file reads against the current repo state, 2026-08-22)

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

### Icon aesthetic
- **D-01:** The 4 icons are distinct, literal shapes (shopping bag, gift box, plus 2 more — Claude's discretion for the remaining two, on-brand e-commerce/gift shapes like a price tag or ribbon/bow) — a deliberate departure from Phase 5's abstract flourish-glyph language, chosen explicitly over reskinning to match Phase 5.
- **D-02:** Icons render as small full-color illustrated icons, not flat gold/monochrome silhouettes — another deliberate departure from the site's existing icon restraint (the `.paywall-gate` lock glyph, Phase 5's perk mark).

### Page placement
- **D-03:** One icon each on Home, Stores, Magazine, and Article (`app.jsx` routes: `home`, `stores`, `magazine`, `article`) — extends beyond the milestone's original Home/Stores/Magazine focus into Article, since there's no per-product page on this site to use instead.
- **D-04:** Each page defines 2-3 pre-defined, layout-safe "hiding zones" (margins, corners, near existing ornaments — NOT arbitrary x/y coordinates, which risk covering buttons/text or breaking at ≤480px). The icon's zone is randomly re-chosen on every fresh page load (not fixed per session) — a visitor who reloads mid-search may see the icon move.

### Bonus / reward mechanic
- **D-05:** The completion reward is cosmetic-only, mirroring Phase 5's existing subscribe-form pattern exactly (`pages.jsx:484-491`) — there is no backend anywhere on this site (per `PROJECT.md` Constraints), so no email/WhatsApp form actually sends or stores anything server-side. This directly contradicts the original pitch's "feeds his subscriber list" framing — surfaced and explicitly accepted by the user in favor of simplicity over building a manual `mailto:`/`wa.me`-link alternative.
- **D-06:** The reward code is a distinct static string, different from Phase 5's `HOUSE10` — exact string is Claude's discretion, in the same "House of Houses" vocabulary established in Phase 4/5. Like `HOUSE10`, this is explicitly a display-only constant, never a "redeem"/"validate" flow (same reasoning as Phase 5 D-06/D-07 — no backend exists to validate against).
- **D-07:** The completion popup uses the exact same `ladidier_subscribed`-branching Phase 5 uses (read-only): subscribed visitors see the code only; unsubscribed visitors also see a subscribe CTA that routes to the real `/subscribe` page. This is the one place a genuine subscribe conversion can actually happen — not the cosmetic capture form.

### Progress & session mechanics
- **D-08:** A subtle progress indicator lives in the **nav bar/header** (not the Footer, where Phase 5's perk mark lives) — visible on every page. It renders as filled-vs-hollow dots/glyphs (e.g. `●●○○` for 2 of 4 found), NOT a literal "2/4" numeric count, to stay in the site's ornamental visual language rather than reading as a game HUD. It is completely invisible/absent until at least 1 icon has been found this session.
- **D-09:** Per-hunt found-progress uses **`sessionStorage`**, not `localStorage` — this is a deliberate, explicit departure from every other stateful flag on this site (`ladidier_subscribed`, `ladidier_perk_found`, both `localStorage`). Progress resets when the browser tab/window closes; a visitor must find all 4 icons across pages within one sitting.
- **D-10:** Completion itself is tracked separately from per-session progress, via a **persistent `localStorage`** one-time flag (naming: `ladidier_treasure_completed`, mirroring `ladidier_perk_found`'s naming convention). Once set, the 4 icons never spawn again for that visitor on any future visit or session — "only one time for a person," per the user's explicit requirement. This is the one piece of hunt state that persists past a session close, specifically to enforce one-time-only.

### Claude's Discretion
- The exact shapes of the 3rd and 4th icons (beyond shopping bag and gift box).
- The exact reward code string (distinct from `HOUSE10`, same house vocabulary).
- The exact 2-3 safe-zone coordinates/positions per page (must clear real content and remain safe at ≤480px, per Phase 5's Pitfall 8 `!important`-cascade lesson).
- Exact popup copy for the completion reveal (elevated-editorial voice, consistent with Phase 4 D-01 and Phase 5 D-07's honest "present this" framing — no false urgency/countdown language, per the same pitfalls that applied to Phase 5).
- Exact nav-bar dot-indicator styling and how it avoids colliding with the mobile hamburger toggle (`.nav-hamburger`, `components.jsx:137`) at narrow widths.
- Icon click/tap and keyboard-focus mechanics — same accessibility bar as Phase 5 (PERK-02 precedent): reachable via click/tap AND keyboard focus, not hover-only.

### Deferred Ideas (OUT OF SCOPE)
None — discussion stayed within phase scope. The original pitch's "feeds his subscriber list" framing was addressed head-on (see D-05) rather than deferred: given no backend exists, real lead capture isn't buildable in this phase or milestone without a genuinely new capability (a backend/email service), which is out of scope.
</user_constraints>

## Summary

Phase 6 adds a second, gamified discovery mechanic — 4 hidden icons across Home, Stores, Magazine, and Article — that runs alongside Phase 5's single hidden perk (`perks.jsx`, confirmed built and stable on disk). The two mechanics share almost nothing at the code level except CSS class precedent (`.paywall-gate`) and the read-only `ladidier_subscribed` flag; they should stay in a separate new file, not extend `perks.jsx`.

The one thing Phase 5's own research got right for its own scope but does **not** transfer to Phase 6: Phase 5's Architecture research explicitly recommends "self-contained state, not lifted to `App`" and calls prop-drilling an anti-pattern — because Phase 5's perk has exactly one consumer (the Footer mark). Phase 6 has **four page mount points plus a Nav progress indicator that must all reactively agree on the same found-count within a session** — this is precisely the "genuine second consumer" scenario Phase 5's research flagged as the trigger to revisit that decision. Lifting state to `app.jsx` (mirroring `isSubscribed`) is the obvious move but has a real cost: `print-app.jsx` renders **all four** target pages (`HomePage`, `MagazinePage`, `ArticlePage`, `StoresPage` — confirmed by direct read, contradicting the CONTEXT.md guess that it "likely" doesn't) without passing `isSubscribed`-equivalent props, so any new required props would need a second, easy-to-forget sync point. The recommended approach instead mirrors `perks.jsx`'s own pattern (self-contained hook, direct `sessionStorage`/`localStorage` reads, zero required props) plus one small addition never used elsewhere in this codebase: a `window.dispatchEvent(CustomEvent)` broadcast so Nav's dot indicator and the completion popup can react in real time without prop plumbing or React Context (which this codebase has never used — verified, zero `createContext`/`useContext` hits repo-wide).

**Primary recommendation:** New file `treasure.jsx`, loaded in both HTML files between `perks.jsx` and `components.jsx`. It exports two mount-anywhere components — `TreasureIcon` (mounted once per target page, self-positioning into one of that page's 2-3 predefined safe zones) and `TreasureHuntComplete` (mounted once at the `App` level, sibling to `Footer`, always present, listens for a custom `"ladidier:treasure-found"` window event and shows the completion popup when the 4th unique icon is found). All state reads/writes go through `sessionStorage` (session progress) and `localStorage` (`ladidier_treasure_completed`, one-time flag) directly inside the file — no new props on `app.jsx`'s route switch, `Nav`, or any page component signature, and zero changes required to `print-app.jsx`.

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Icon rendering + safe-zone placement | Browser / Client | — | Pure presentational React component, no server involved anywhere in this app |
| Per-session found-count tracking | Browser / Client (`sessionStorage`) | — | D-09 locks this to `sessionStorage`; no backend exists to track sessions server-side |
| One-time completion flag | Browser / Client (`localStorage`) | — | D-10 locks this to `localStorage`, mirroring `ladidier_perk_found` |
| Cross-component progress sync (icon → Nav dot, icon → completion popup) | Browser / Client (custom `window` event) | — | No React Context or state-management library exists in this codebase; a `CustomEvent` broadcast is the lowest-novelty mechanism that avoids prop-drilling through `app.jsx`'s route switch |
| Completion reveal + subscribe branching | Browser / Client | — | Reads existing `ladidier_subscribed` localStorage flag directly (read-only), same as `perks.jsx` |
| Discount code display | Browser / Client | — | Static string constant, no validation tier exists or is wanted (explicitly out of scope, mirrors Phase 5 D-06/D-07) |

No Frontend-Server, API/Backend, CDN, or Database tier exists in this project (static site, no build step, no backend — confirmed via `PROJECT.md` Constraints and repo structure). Every capability in this phase is Browser/Client tier.

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| TREAS-01 | 4 distinct hidden icons across Home/Stores/Magazine/Article | Per-page safe-zone system (Architecture Pattern 1), inline-SVG icon convention (no icon library — confirmed no npm/build step exists) |
| TREAS-02 | Each icon in 1-of-2-3 predefined positions, randomized on every fresh page load | `<main key={route + t.hero}>` in `app.jsx:87` already forces a full remount of the current page on every route navigation — verified this means "fresh load" happens on every SPA route revisit too, not only on a hard browser refresh; a lazy `useState` zone-picker inside `TreasureIcon` gets this for free |
| TREAS-03 | Completion reveal with a code distinct from `HOUSE10` | `TreasureHuntComplete` component pattern (mirrors `perks.jsx`'s `PERK_CODE` constant pattern exactly) |
| TREAS-04 | Reveal branches on `ladidier_subscribed`, unsubscribed also see subscribe CTA | Verified exact `=== "true"` comparison convention (`app.jsx:50`) and the `perks.jsx` read-only reveal-branch precedent (`perks.jsx:56, 82-90`) |
| TREAS-05 | Once completed, icons never reappear for that visitor, any future visit/session | `ladidier_treasure_completed` `localStorage` flag, checked at the top of `TreasureIcon`'s render (mirrors `usePerkFound()`'s lazy-init pattern) |
| TREAS-06 | Subtle nav-bar dot/glyph progress indicator, invisible until ≥1 found | Nav mount-point analysis (Common Pitfalls: mobile `.nav-right > a` selector specificity) + custom-event sync pattern |
</phase_requirements>

## Standard Stack

### Core
No new libraries. This is a zero-build site — `npm install` is not a workflow that exists here.

| Dependency | Version | Purpose | Why Standard (for this repo) |
|------------|---------|---------|-------------------------------|
| React | 18.3.1 `[VERIFIED: Ladidier Portal.html:16]` | Component model | Already loaded via `unpkg` UMD `<script>`, unchanged by this phase |
| Babel standalone | 7.29.0 `[VERIFIED: Ladidier Portal.html:18]` | In-browser JSX transform | Already loaded, unchanged |
| Web Storage API (`sessionStorage`, `localStorage`) | Native browser API | Session-scoped hunt progress + persistent one-time completion flag | Zero-dependency, already the site's exclusive state-persistence mechanism (`ladidier_subscribed`, `ladidier_perk_found`) |
| `CustomEvent` / `window.dispatchEvent` | Native browser API | Cross-component real-time sync without React Context or a state library | Lowest-novelty option; no precedent for Context/Redux/Zustand/etc. exists anywhere in this repo `[VERIFIED: repo-wide grep for createContext/useContext returned zero hits]` |

### Supporting
None. No routing library (hand-rolled hash router in `app.jsx`), no icon library (all decorative graphics in `ornaments.jsx` are hand-authored inline `<svg>`), no animation library (CSS `@keyframes` only).

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Custom `window` `CustomEvent` broadcast for cross-component sync | Lift found-state to `app.jsx` (mirror `isSubscribed`), thread as props through the route switch + `<Nav>` | Mirrors an existing precedent (`isSubscribed`) more closely, but requires new required props on 4 route-switch cases and `<Nav>`, **and** a matching update to `print-app.jsx`'s 4 page-component calls and its `<Nav>` call — a wider, easier-to-desync diff surface than the event-bus approach. Recommended only if a future phase needs this state server-rendered or SSR'd (not applicable here — static SPA). |
| Custom `window` `CustomEvent` broadcast | React Context (`createContext`/`useContext`) | Would work, but introduces a pattern with zero precedent in this codebase; a plain `CustomEvent` achieves the same reactive fan-out with fewer new concepts for future maintainers of this specific project |
| Inline hand-authored SVG icons | An icon library (Lucide, Heroicons, etc. via CDN `<script>`) | Would add a new external `<script>` dependency for 4 icons; this repo has zero icon-library precedent and only 4 shapes are needed — hand-authored SVG (mirroring `ornaments.jsx`'s `DecoCorner`/`Laurel`/`Flourish` convention) is more consistent and has no new load-order/CDN-availability risk |

**Installation:** None required — no `npm install` step exists in this project.

**Version verification:** React/Babel versions unchanged by this phase; verified current pins directly from `Ladidier Portal.html` rather than the npm registry (this project doesn't consume npm packages at runtime).

## Architecture Patterns

### System Architecture Diagram

```
Page mount (Home | Stores | Magazine | Article)
    │  React remounts this page's component whenever route changes,
    │  because app.jsx:87 does <main key={route + t.hero}>{page}</main>
    ▼
<TreasureIcon page="home" iconId="bag"/>  (one per target page, distinct iconId)
    │
    ├─ localStorage.getItem("ladidier_treasure_completed") === "true"?
    │     ├─ YES → render null (TREAS-05: never spawns again)
    │     └─ NO  → continue
    │
    ├─ sessionStorage read: has THIS iconId already been found this session?
    │     ├─ YES → render null (already collected this session)
    │     └─ NO  → pick 1-of-2-3 safe zone via lazy useState (re-picked on every remount = "fresh load")
    │
    ▼ user clicks/taps/keyboard-activates the icon
sessionStorage: add iconId to found-set ("ladidier_treasure_progress")
    │
    ▼
window.dispatchEvent(new CustomEvent("ladidier:treasure-found", { detail: { count } }))
    │
    ├──────────────────────────────┬─────────────────────────────────┐
    ▼                               ▼                                 │
<Nav> progress-dot listener   <TreasureHuntComplete> listener         │
(re-reads sessionStorage,      (mounted once at App level,            │
 renders ●●○○-style dots,      sibling to <Footer>, always present)   │
 invisible until count ≥ 1)         │                                 │
                                     ▼                                 │
                          count === 4 (all unique icons found)?        │
                                     ├─ NO  → stay hidden               │
                                     └─ YES → localStorage.setItem(     │
                                           "ladidier_treasure_completed","true")
                                           show "You found the treasure!" popup
                                                │
                                                ▼
                              reads localStorage.getItem("ladidier_subscribed")
                              (read-only — same key app.jsx/pages.jsx already own)
                                                │
                              isSubscribed=true  → show code only
                              isSubscribed=false → show code + subscribe CTA → setRoute("subscribe")
```

### Recommended Project Structure
```
treasure.jsx              # NEW — mirrors perks.jsx exactly: global-scope script, Object.assign(window,{...}) export
  ├─ TREASURE_ICONS[]      # 4 entries: { id, page, label, SafeZones[], IconSvg }
  ├─ TREASURE_CODE         # static string constant, distinct from HOUSE10
  ├─ useTreasureFound()    # internal hook: sessionStorage progress read/write + CustomEvent dispatch
  ├─ TreasureIcon({page})  # trigger, mounted once inside each of the 4 target pages
  └─ TreasureHuntComplete()# reveal popup, mounted once at App level (app.jsx, sibling to <Footer>)

pages.jsx                 # MODIFIED — 4 one-line insertions (HomePage, StoresPage, MagazinePage, ArticlePage)
components.jsx            # MODIFIED — Nav gets one new child (progress-dot indicator), reads treasure.jsx's hook
app.jsx                   # MODIFIED — one new mount: <TreasureHuntComplete setRoute={go} />, sibling to <Footer setRoute={go}/>
styles.css                # MODIFIED — append .treasure-icon, .treasure-reveal (+ dot indicator) rules
Ladidier Portal.html       # MODIFIED — 1 new <script> tag, inserted between perks.jsx and components.jsx
Ladidier Portal-print.html # MODIFIED — same 1-line insertion, PLUS a print-only `.treasure-icon{display:none!important}` rule (see Pitfall: PrintApp renders all 4 pages)
```

### Pattern 1 (verified): Self-contained per-icon state, broadcast via `CustomEvent` — not lifted to `App`

**What:** Each `TreasureIcon` instance owns its own "have I been found" check via `sessionStorage`/`localStorage` reads (mirrors `usePerkFound()`'s lazy `useState` initializer exactly, `perks.jsx:9-16`). On click, it writes to a shared `sessionStorage` key and fires a `CustomEvent` so any other mounted listener (Nav's dot indicator, the completion popup) can react without a shared React ancestor holding the state.

**When to use:** Exactly this case — multiple independent mount points (4 pages, 1 nav, 1 completion popup) that must all agree on shared client-only state, in a codebase with no state-management library or Context precedent, and where widening `app.jsx`'s route-switch prop signatures is a real, unwanted diff-surface cost (confirmed: `print-app.jsx` calls the same 4 page components with fewer props already — e.g. `<MagazinePage setRoute={setRoute} />` with no `isSubscribed`/`setIsSubscribed` at all, `print-app.jsx:47` — any new required prop on these components must be independently added there too or silently omitted).

**Example:**
```jsx
// treasure.jsx
const TREASURE_PROGRESS_KEY = "ladidier_treasure_progress";   // sessionStorage, JSON array of found iconIds
const TREASURE_COMPLETED_KEY = "ladidier_treasure_completed"; // localStorage, "true" once, forever
const TREASURE_EVENT = "ladidier:treasure-found";

function readProgress() {
  try { return JSON.parse(sessionStorage.getItem(TREASURE_PROGRESS_KEY)) || []; }
  catch (e) { return []; }
}

function markIconFound(iconId) {
  const found = readProgress();
  if (!found.includes(iconId)) {
    found.push(iconId);
    sessionStorage.setItem(TREASURE_PROGRESS_KEY, JSON.stringify(found));
  }
  window.dispatchEvent(new CustomEvent(TREASURE_EVENT, { detail: { found } }));
  return found;
}

function useTreasureProgress() {
  const [found, setFound] = useState(readProgress);
  useEffect(() => {
    const onUpdate = (e) => setFound(e.detail.found);
    window.addEventListener(TREASURE_EVENT, onUpdate);
    return () => window.removeEventListener(TREASURE_EVENT, onUpdate);
  }, []);
  return found;
}
```
`[ASSUMED — synthesized pattern, not from official docs; grounded in verified codebase facts: no Context/Redux precedent, print-app.jsx prop-signature mismatch]`

### Pattern 2 (verified): `<main key={route + t.hero}>` already gives "randomize on fresh load" for free

**What:** `app.jsx:87`'s `<main key={route + t.hero}>{page}</main>` forces React to fully unmount/remount the current page's component tree on every route change (the `key` changes). This means a lazy `useState(() => pickRandomZone(page))` inside `TreasureIcon` re-runs its initializer every time the visitor navigates to that page — satisfying TREAS-02's "randomly chosen on every fresh page load" without any extra reload-detection logic, and matching D-04's explicit "a visitor who reloads mid-search may see the icon move" behavior even for in-SPA navigation, not just hard browser refreshes.
**When to use:** Any per-page-mount randomization in this codebase — this is the existing, load-bearing mechanism, not something to reimplement.
**Verified:** `[VERIFIED: app.jsx:87, direct read]`

### Pattern 3 (verified): Reuse `.paywall-gate` for the completion popup shell, exactly as Phase 5 did for `.perk-reveal`

**What:** `perks.jsx`'s reveal panel is `className="paywall-gate perk-reveal"` (`perks.jsx:75`), not a new visual language. `TreasureHuntComplete`'s popup should follow the identical precedent: `className="paywall-gate treasure-reveal"`, reusing the gold-border/cream-background card shell and only adding position/sizing overrides via a new small CSS block (mirroring `.perk-reveal`, `styles.css:1041-1050`).
**Verified:** `[VERIFIED: perks.jsx:75, styles.css:930-953, 1041-1050]`

### Pattern 4 (verified): Theme-reactive color via CSS custom properties, not hardcoded hex — for "full-color" icons

**What:** D-02 requires the 4 hunt icons to be "small full-color illustrated icons," a deliberate departure from the site's gold-monochrome restraint. The site supports 5 palettes + dark mode, all driven by `applyTheme()` (`app.jsx:34-45`) writing CSS custom properties (`--gold`, `--accent`, `--cream`, `--ivory`, `--noir`) onto `:root`. Icon SVGs must reference these vars (`fill="var(--gold)"`, `fill="var(--accent)"`, etc.) — never inline hex — or they will look wrong/clash under the bordeaux/marine/emerald/cognac palettes and in dark mode.
**Example:**
```jsx
// treasure.jsx — icon fill using theme vars, not hardcoded hex
function BagIcon({ size = 22 }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true">
      <path d="M6 8h12l-1 12H7L6 8z" fill="var(--accent)" />
      <path d="M8 8V6a4 4 0 0 1 8 0v2" fill="none" stroke="var(--gold)" strokeWidth="1.5" />
    </svg>
  );
}
```
`[VERIFIED palette mechanism: app.jsx:14-45; ASSUMED SVG path data, illustrative only — not a design deliverable]`

### Anti-Patterns to Avoid

- **Prop-drilling `foundCount`/`treasureCompleted` through `app.jsx`'s route switch (lines 74-82) and into every page component signature:** Widens 4 route-switch cases and `<Nav>`'s call site, and requires a matching (easy-to-forget) update to `print-app.jsx`'s 6 page-component calls, which currently don't receive even the existing `isSubscribed` prop consistently. This is the Phase 5 `ARCHITECTURE.md` Anti-Pattern 2 scenario, but inverted: Phase 5 correctly said "don't lift state, no second consumer exists yet." Phase 6 **is** that second (in fact fourth+fifth) consumer — but lifting to `app.jsx` is still not the lowest-risk way to serve it, given the `print-app.jsx` prop-signature mismatch already on record.
- **Arbitrary x/y pixel positioning for icon placement:** D-04 explicitly locks this to 2-3 pre-defined "safe zones" per page, not free coordinates — this is a direct mitigation for Phase 5's own documented Pitfall 8 (mobile `!important` cascade breaking absolutely-positioned new elements at ≤480px).
- **Treating `sessionStorage` writes as automatically reactive across components in the same tab:** The browser's native `storage` event **only fires in other tabs/windows**, never in the tab that performed the write. A naive implementation that assumes `window.addEventListener("storage", ...)` will catch same-tab icon clicks will silently never update the Nav dot indicator or trigger the completion popup. Use the explicit `CustomEvent` broadcast (Pattern 1) instead.
- **Mounting `TreasureIcon` inside Magazine's `.magazine-frame`:** That container has an internal `z-index: 10` paywall backdrop (`pages.jsx:456-505`) that covers the frame for unsubscribed users after 15s/interaction — an icon placed inside it would become unreachable once the paywall appears. Mount Magazine's icon in the page header/`ISSUE` detail-row area instead, outside `.magazine-frame` entirely.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|--------------|-----|
| Cross-tab/same-tab reactive state sync | A polling `setInterval` on `sessionStorage`, or a hand-rolled pub/sub class | Native `window.dispatchEvent(new CustomEvent(...))` + `window.addEventListener` | Zero new dependencies, no polling overhead, standard browser API already implicitly relied on elsewhere in the app (`window.addEventListener("hashchange", ...)`, `app.jsx:61`) |
| Random-but-safe positioning / collision avoidance | Runtime bounding-box collision detection against sibling DOM elements | Static, pre-authored 2-3 "safe zone" positions per page (D-04, explicitly locked) | The user already locked this decision specifically to avoid exactly this complexity/fragility class — collision math would still need per-breakpoint tuning and risks the same `!important`-cascade fragility as Pitfall 8 |
| Icon graphics | A CDN icon-font/icon-library `<script>` dependency | Hand-authored inline `<svg>`, mirroring `ornaments.jsx`'s existing `DecoCorner`/`Laurel`/`Flourish`/`Monogram` convention | Only 4 shapes needed; this repo has zero icon-library precedent and adding one is an unnecessary new external load-order dependency for a static site that otherwise pins exactly 3 CDN scripts (React, ReactDOM, Babel) |

**Key insight:** Every piece of this phase has a directly reusable precedent already in this exact codebase (`perks.jsx`'s hook shape, `.paywall-gate`'s card shell, `ornaments.jsx`'s inline-SVG convention, `app.jsx`'s `hashchange` listener as prior art for a global `window` event listener). The only genuinely new idiom is the `CustomEvent` broadcast, and even that is a standard, dependency-free browser API — not a custom framework.

## Common Pitfalls

### Pitfall: `print-app.jsx` renders all 4 target pages — CONTEXT.md's "likely not" assumption is WRONG

**What goes wrong:** CONTEXT.md speculates PrintApp "likely" doesn't render Home/Stores/Magazine/Article since it's print-specific, and defers confirming this to planning time. Direct read confirms the opposite: `print-app.jsx:41-56` renders `HomePage`, `MagazinePage`, `ArticlePage`, and `StoresPage` back-to-back as stacked `<section className="print-page">` blocks, each auto-printed via `window.print()` after load (`print-app.jsx:74-85`). Any `TreasureIcon` mounted inside these pages will render in the print output too — a full-color floating icon graphic on a printed page is visually wrong and serves no purpose there.
**Why it happens:** The two HTML entry points share the exact same `pages.jsx` file; `PrintApp` is just a different top-level composition, not a different set of page components.
**How to avoid:** Add a print-only suppression rule inside `Ladidier Portal-print.html`'s existing `<style>` block (`Ladidier Portal-print.html:35-56`, which already hides `.twk-panel, .twk-btn` and `.marquee, .ticker, .vmarquee` the same way): `.treasure-icon, .treasure-reveal { display: none !important; }`. This is a single, low-risk CSS addition — do not attempt to conditionally not-render the component in JS (that would require `PrintApp` to pass a new prop to all 4 pages, the exact prop-drilling risk this phase should avoid).
**Warning signs:** A print/PDF export shows a shopping-bag or gift-box icon floating over article text or a hero section.
**Verified:** `[VERIFIED: print-app.jsx:36-69, Ladidier Portal-print.html:12-77]`

### Pitfall: `sessionStorage`/`localStorage` writes are NOT reactive in the same tab

**What goes wrong:** A component reads `sessionStorage` once on mount via `useState(() => ...)` (correct, mirrors `usePerkFound()`) but never updates again — so when a *different* mounted component (e.g. Nav's dot indicator) writes a new found-icon, the first component's stale React state never re-renders, even though `sessionStorage` itself is updated correctly.
**Why it happens:** The `window` `"storage"` event exists but the spec explicitly fires it only in *other* browsing contexts (other tabs/windows on the same origin), never in the tab that performed the write. This is a common web-platform trap, not specific to this codebase.
**How to avoid:** Use the `CustomEvent` broadcast pattern (Architecture Pattern 1) for any state that must be visible to more than one simultaneously-mounted component. Components that only need their own found/not-found status (each `TreasureIcon` checking only its own `iconId`) can safely use the simpler one-time lazy-read pattern, since they don't need to react to a sibling icon being found on a different page.
**Warning signs:** Finding icon 4 doesn't trigger the completion popup unless the visitor happens to be on the same page/component that incremented the count; the Nav dot indicator is one tick behind reality.

### Pitfall: `.nav-right > a { display: none; }` only hides anchor children at ≤768px — a non-`<a>` dot indicator will unexpectedly survive, which is correct but must be sized deliberately

**What goes wrong:** At ≤768px, `styles.css:489` hides all `<a>` children of `.nav-right` (Search/Subscribe/EN·USD links) but leaves `.nav-hamburger` (a `<button>`) visible. A progress-dot indicator implemented as a `<span>`/`<div>` (not an `<a>`) will **not** be caught by this selector and will remain visible alongside the hamburger — which is actually what D-08 wants ("visible on every page"), but it means the indicator must be explicitly sized/positioned to coexist with the 44px hamburger tap target in the same now-crowded `.nav-right` flex row, rather than relying on the existing mobile rule to hide or reflow it.
**How to avoid:** Size the dot cluster small (4 dots × ~6-8px with 3-4px gaps ≈ 30-40px total width) and place it immediately before `.nav-hamburger` inside `.nav-right`'s existing `display:flex; gap:` layout (`styles.css:148-152`) so it participates in the same flex row without a new positioning context. Test at both 768px and 480px explicitly — the ≤480px breakpoint has its own additional rules (`styles.css:965-1012` region) that were not written with this indicator in mind.
**Verified:** `[VERIFIED: styles.css:148-152, 463-491]`

### Pitfall: `StoresPage`'s list/grid view toggle can unmount an icon placed inside the wrong branch

**What goes wrong:** `StoresPage` (`pages.jsx:671-761`) has a `view` state (`"list" | "grid"`) that conditionally renders two entirely different `<section>` trees (`pages.jsx:705-729` vs `731-756`). An icon mount point placed inside either conditional branch will disappear when the visitor toggles the view — an unintended way for the icon to "vanish" that has nothing to do with the hunt mechanic.
**How to avoid:** Mount `<TreasureIcon page="stores" .../>` at the top level of `StoresPage`'s returned `<div className="page-fade">` (e.g., adjacent to `<header className="page-head">`, `pages.jsx:675`), outside both the `view === "list"` and `view === "grid"` conditionals, so it persists across view-toggle clicks. Safe zones for this page should also avoid overlapping the clickable `.store-row` elements (`pages.jsx:714`, `onClick` opens an external store URL in a new tab) and the clickable store-card `<a>` elements in grid view (`pages.jsx:736`).
**Verified:** `[VERIFIED: pages.jsx:671-761]`

### Pitfall (inherited, still applies verbatim): Hover-only trigger is invisible on touch devices

Phase 5's Pitfall 3 (`.planning/research/PITFALLS.md:47-64`) applies identically: the 4 treasure icons and the Nav dot indicator must be reachable via click/tap and keyboard focus, never hover-only. Use native `<button>` elements (gets Enter/Space activation for free, same as `perks.jsx`'s `.perk-mark`), with explicit `:focus-visible` styling mirroring `styles.css:1035-1039`.

### Pitfall (inherited, still applies verbatim): Mobile `!important` cascade can silently override new elements at ≤480px

Phase 5's Pitfall 8 (`.planning/research/PITFALLS.md:142-158`) — grep `styles.css`'s existing `@media (max-width: 480px)` blocks for any selector that already targets the container a safe zone sits inside, before adding new positioning rules, so the icon doesn't get silently overridden or need its own `!important` to compete.

### Pitfall (inherited, still applies): `ladidier_subscribed` is checked via `=== "true"`, never `!== "false"`

Mirror `app.jsx:50`'s exact comparison in `TreasureHuntComplete`'s subscribe-branch check — the key is either absent or `"true"`, never explicitly `"false"` (Phase 5 Pitfall, `05-RESEARCH.md:265-268`, still true — no unsubscribe path was added).

### Pitfall: Both HTML files' script tags must gain the new `<script>` tag in the same commit

Direct proof this bites in practice: Phase 5's own `STATE.md` Blockers/Concerns section records this exact failure mode as a live risk for `perks.jsx`. The same insertion point applies for `treasure.jsx` — between `ornaments.jsx`/`perks.jsx` and `components.jsx`, in **both** `Ladidier Portal.html` and `Ladidier Portal-print.html`. Missing it in the print file causes `ReferenceError: TreasureIcon is not defined` (or `TreasureHuntComplete`) inside `PrintApp`, since it also renders the pages/`Footer`-sibling components that will reference these names.
**Verified:** `[VERIFIED: current identical load order in both files, Ladidier Portal.html:20-25, Ladidier Portal-print.html:86-91]`

## Code Examples

### Complete `TreasureIcon` component shape (assembled from verified codebase precedents)

```jsx
// treasure.jsx — mirrors perks.jsx's HiddenPerk shape (perks.jsx:18-96), verified against current app state
function TreasureIcon({ page, iconId, IconGlyph, zones, label }) {
  const completed = localStorage.getItem(TREASURE_COMPLETED_KEY) === "true"; // TREAS-05
  const found = useTreasureProgress(); // Pattern 1 hook
  const alreadyFoundThisSession = found.includes(iconId);

  // Lazy init re-runs on every remount — app.jsx:87's <main key={route+t.hero}>
  // already remounts this page on every route visit (Pattern 2).
  const [zone] = useState(() => zones[Math.floor(Math.random() * zones.length)]);

  if (completed || alreadyFoundThisSession) return null;

  return (
    <button
      type="button"
      className="treasure-icon"
      style={zone.style}
      aria-label={`A house treasure — ${label}`}
      onClick={() => markIconFound(iconId)}
    >
      <IconGlyph size={22} />
    </button>
  );
}
```
`[ASSUMED — synthesized from perks.jsx's verified shape, not itself a copy of existing code]`

### `Nav` progress-dot indicator (mount point precedent)

```jsx
// components.jsx — inside Nav(), before the .nav-hamburger button (components.jsx:132-142)
<div className="nav-right">
  <a href="#search" onClick={(e) => e.preventDefault()}>Search</a>
  {item("subscribe", "Subscribe")}
  <a href="#account" ...>EN · USD</a>
  <TreasureProgress />   {/* NEW — non-<a> element, survives the ".nav-right > a {display:none}" mobile rule */}
  <button className="nav-hamburger" ...>...</button>
</div>
```
`[VERIFIED mount point: components.jsx:132-142]`

## State of the Art

Not applicable in the traditional "library version drift" sense — this is a static site with pinned CDN versions and no package ecosystem to track. The only relevant "state of the art" question is React 18 API currency, which is unchanged and already resolved by Phase 5.

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|----------------|
| A1 | A `CustomEvent`/`window.dispatchEvent` broadcast is the best cross-component sync mechanism, over lifting state to `app.jsx` | Architecture Pattern 1, Standard Stack | If the planner instead prefers mirroring `isSubscribed`'s lifted-state precedent for consistency, the alternative (documented above) is fully viable — just requires touching `app.jsx`'s route switch, `<Nav>`'s call site, and `print-app.jsx`'s matching calls. Low risk either way; this is a defensible architecture choice, not a verified external fact. |
| A2 | An already-found icon should disappear (render `null`) for the rest of that session, rather than staying visible-but-inert | Code Examples, Common Pitfalls | Neither CONTEXT.md nor REQUIREMENTS.md locks this behavior explicitly (see Open Questions). If the intended behavior is "stays visible, re-clickable, no-ops," the `alreadyFoundThisSession` early-return in the example above needs removing. |
| A3 | Icon SVGs should be hand-authored inline (mirroring `ornaments.jsx`), not sourced from an icon library | Don't Hand-Roll, Standard Stack | If the developer would prefer a quick icon-library CDN include for visual polish reasons, this is a reasonable deviation — but it would be the first external icon dependency in the project and should be a deliberate choice, not a default. |
| A4 | Discount code candidate `HOUSE15` (or similar `HOUSE`-prefixed variant) satisfies D-06's "same house vocabulary, distinct from HOUSE10" | Don't Hand-Roll / general | Purely a copy/naming suggestion, zero technical risk — Claude's Discretion per CONTEXT.md, included only as a starting point for the planner. |

## Open Questions (RESOLVED)

1. **Does an already-found icon stay visible-but-inert, or disappear, for the remainder of a session on repeat page visits?**
   - What we know: D-04 locks re-randomization "on every fresh page load," and D-09 locks session-scoped progress tracking.
   - What's unclear: Neither TREAS-01..06 nor CONTEXT.md's Decisions explicitly states whether a found icon should keep appearing (just inert) or stop rendering entirely on subsequent visits to the same page within the same session.
   - Recommendation: Render `null` once found this session (Code Examples above) — simpler to implement, avoids a confusing "I clicked it, nothing happened" state, and is the more common pattern for scavenger-hunt UI. Flag for explicit confirmation during planning/discuss-phase if the developer has a preference.
   - **RESOLVED:** Render `null` once found this session, per the recommendation above — implemented in Plan 01 Task 2.

2. **Should the 3rd and 4th icon shapes be a price tag + ribbon/bow, per CONTEXT.md's own suggested examples, or something else?**
   - What we know: D-01 explicitly leaves this to Claude's discretion, with "price tag or ribbon/bow" given as illustrative examples in CONTEXT.md itself.
   - What's unclear: No stronger signal exists either way.
   - Recommendation: Use exactly those two suggested shapes (price tag, ribbon/bow) — they're already the user-adjacent brief's own suggestion and keep the icon set thematically coherent (bag, box, tag, bow — all literal e-commerce/gift objects, satisfying D-01/D-02's "departure from abstract flourish language").
   - **RESOLVED:** `TagIcon` (price tag) and `BowIcon` (ribbon/bow), per the recommendation above — implemented in Plan 01 Task 1.

## Environment Availability

Skipped — this phase has no external tool/service/runtime dependencies. It is a pure code/CSS addition to an already-running zero-build static site (React/ReactDOM/Babel loaded via existing `<script src="https://unpkg.com/...">` tags, unchanged by this phase), identical in kind to Phase 5's own "skipped" determination.

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | None — no `package.json`, no test runner, no `*.test.*`/`*.spec.*` files exist anywhere in the repo `[VERIFIED: repo file search, unchanged since Phase 5's identical finding]` |
| Config file | none |
| Quick run command | Manual browser click-through (established project convention — Phase 4's CTA-07 and Phase 5's PERK-01..06 were both closed via manual verification, not automated tests) |
| Full suite command | N/A |

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Manual Verification Steps | File Exists? |
|--------|----------|-----------|----------------------------|-------------|
| TREAS-01 | 4 distinct icons across Home/Stores/Magazine/Article | manual-only | Visit each of the 4 pages fresh (`sessionStorage.clear()`, `localStorage.removeItem("ladidier_treasure_completed")`); confirm exactly one full-color icon renders per page, in a plausible position, and each is visually distinct (bag/box/tag/bow) | ❌ Wave 0 |
| TREAS-02 | Position randomized per fresh load, layout-safe at ≤480px | manual-only | Reload/re-navigate to the same page 5-6 times, confirm the icon appears in a different one of its 2-3 zones and never overlaps text/buttons, at both desktop and ≤480px widths | ❌ Wave 0 |
| TREAS-03 | Completion reveal after finding all 4 in one session | manual-only | Click all 4 icons across the 4 pages in one session; confirm the "You found the treasure!" popup appears with a code distinct from `HOUSE10` | ❌ Wave 0 |
| TREAS-04 | Reveal branches on `ladidier_subscribed` | manual-only | Test as (a) fresh visitor — confirm code + subscribe CTA both show; (b) `localStorage.setItem("ladidier_subscribed","true")` — confirm CTA is absent, code-only | ❌ Wave 0 |
| TREAS-05 | Icons never reappear after one completion, any future visit/session | manual-only | Complete the hunt once, then close/reopen the tab (fresh `sessionStorage`) and re-visit all 4 pages — confirm zero icons render anywhere; also confirm across a hard page reload | ❌ Wave 0 |
| TREAS-06 | Nav dot indicator invisible until ≥1 found, updates live | manual-only | Fresh session: confirm nav shows no dot indicator at all; find 1 icon; confirm indicator appears showing 1-of-4 filled, on every page (including pages with no icon of their own, e.g. after navigating to About/Subscribe) | ❌ Wave 0 |

### Sampling Rate
- **Per task commit:** Manual click-through of the specific TREAS-XX behavior just implemented
- **Per wave merge:** Full manual pass through all 6 TREAS requirements above, at both desktop and ≤480px widths, including a full hunt-completion run-through
- **Phase gate:** All 6 TREAS-XX manual checks pass, plus explicit verification that Phase 5's PERK-01..06 still pass unmodified (the two mechanics must coexist without interference) before `/gsd-verify-work`

### Wave 0 Gaps
- No automated test framework exists and none should be introduced by this phase — matches established project convention (Phase 4, Phase 5 were both 100% manual).
- Manual reset path for QA, to be documented in the plan's verification steps (not built as UI): `sessionStorage.removeItem("ladidier_treasure_progress")` and `localStorage.removeItem("ladidier_treasure_completed")` in devtools console.
- Regression check to add: confirm Phase 5's `HiddenPerk` (Footer mark) still functions identically after this phase lands — the two features must never interfere (different storage keys, different files, no shared component).

## Security Domain

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|----------------|---------|-------------------|
| V2 Authentication | No | No auth system exists or is introduced |
| V3 Session Management | No | `sessionStorage`/`localStorage` flags are UI-state only, not session/auth tokens |
| V4 Access Control | No | The discount code is intentionally public/display-only, same accepted-limitation reasoning as Phase 5's `HOUSE10` |
| V5 Input Validation | No | No new user text input — icons are click/tap-only triggers, popup is display-only |
| V6 Cryptography | No | No secrets, no encryption need |

### Known Threat Patterns for this stack

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|------------------------|
| Discount code scraped/shared beyond intended "genuine finders" via View Source | Information Disclosure (accepted risk, not a vulnerability) | Same accepted limitation as Phase 5's `HOUSE10` — do not build fake obfuscation for a value that was never meant to be secret |
| `localStorage`/`sessionStorage` flags trivially editable via devtools (e.g., a visitor sets `ladidier_treasure_completed` to bypass, or clears it to re-run the hunt) | Tampering (accepted risk) | Only ever use these flags to control UI presentation, never anything requiring tamper-resistance — identical reasoning to Phase 5's `ladidier_perk_found` |

No further security domain work applies — static-content feature, no backend, no auth, no sensitive data.

## Sources

### Primary (HIGH confidence — direct codebase inspection, this session)
- `/Users/aech/Documents/Ladidier/perks.jsx` — full file, confirmed built/stable (Phase 5 Plan 01/02 landed; Plan 03 is manual-verification-only, no further code changes pending)
- `/Users/aech/Documents/Ladidier/app.jsx` — full file; `isSubscribed` state (50), route switch (74-82), `<main key={route+t.hero}>` (87), `<Footer setRoute={go}/>` mount (88)
- `/Users/aech/Documents/Ladidier/components.jsx` — `Nav` (100-149), `.nav-hamburger` button (137), `Footer` (303-354), `HiddenPerk` mount (310)
- `/Users/aech/Documents/Ladidier/pages.jsx` — `HomePage` (329), `MagazinePage` (378, incl. `.magazine-frame`/paywall overlay 438-524), `ArticlePage` (593), `StoresPage` (671, incl. `view` toggle 672)
- `/Users/aech/Documents/Ladidier/print-app.jsx` — full file; confirms `PrintApp` renders `HomePage`/`MagazinePage`/`ArticlePage`/`StoresPage` (41-56), contradicting CONTEXT.md's unverified guess
- `/Users/aech/Documents/Ladidier/Ladidier Portal.html` and `Ladidier Portal-print.html` — both full files; identical script load order confirmed (`perks.jsx` present in both); print file's existing suppression-rule precedent (`.twk-panel, .twk-btn { display: none !important; }`, `.marquee, .ticker, .vmarquee { display: none !important; }`)
- `/Users/aech/Documents/Ladidier/styles.css` — `.nav`/`.nav-left`/`.nav-right` (139-159), `.nav-hamburger` + 768px/480px media queries (463-491), `.paywall-gate` (930-953), `.perk-mark`/`.perk-reveal` (1017-1098)
- `/Users/aech/Documents/Ladidier/ornaments.jsx` — `DecoCorner` (57-71) as the inline-SVG positioning precedent
- `.planning/phases/06-mall-treasure-hunt/06-CONTEXT.md`, `.planning/REQUIREMENTS.md`, `.planning/STATE.md`, `.planning/PROJECT.md`, `.planning/ROADMAP.md` — phase scope, locked decisions, milestone/roadmap context
- Repo-wide grep for `createContext`/`useContext` across all `.jsx` files — zero hits, confirming no React Context precedent exists

### Secondary (inherited from Phase 5 research, re-verified where line-number-specific)
- `.planning/phases/05-hidden-perks-discovery-feature/05-RESEARCH.md` — Pitfalls (`.perk-reveal` z-index vocabulary two-file split, `ladidier_subscribed` comparison convention), Sources hierarchy
- `.planning/phases/05-hidden-perks-discovery-feature/05-PATTERNS.md` — verified `usePerkFound()`/`HiddenPerk` full shape, `Object.assign(window,{...})` export convention, script-tag insertion point
- `.planning/research/ARCHITECTURE.md` — Pattern 2 ("self-contained state, not lifted to App") and Anti-Pattern 2 (prop-drilling), both explicitly re-evaluated and superseded for this phase's multi-consumer scenario (see Summary)
- `.planning/research/PITFALLS.md` — Pitfalls 3, 4, 5, 6, 7, 8 (hover-only accessibility, discoverability paradox, code exposure, subscribe-flow collision, re-trigger distraction, mobile `!important` cascade) — all still apply, cross-referenced above where directly relevant to new code

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — zero-build convention is unambiguous and unchanged; no new dependencies introduced
- Architecture: HIGH for verified facts (file structure, mount points, PrintApp page list, z-index/storage-event mechanics); MEDIUM for the specific cross-component sync recommendation (Assumption A1) — a defensible, low-novelty choice but not the only valid one, flagged for planner confirmation
- Pitfalls: HIGH — all pitfalls either directly verified against current file state this session, or inherited from Phase 5's own verified research and cross-checked as still accurate

**Research date:** 2026-08-22
**Valid until:** Stable until the next phase touches `app.jsx`, `pages.jsx`, `components.jsx`, `styles.css`, or either HTML entry point — re-verify line numbers before planning if Phase 5 Plan 03 or any other work lands in between (mirrors the exact staleness pattern Phase 5's own research flagged for its inherited milestone-level line numbers).
