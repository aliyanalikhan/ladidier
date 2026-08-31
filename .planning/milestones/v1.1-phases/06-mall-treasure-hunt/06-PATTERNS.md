# Phase 6: Mall Treasure Hunt - Pattern Map

**Mapped:** 2026-08-22
**Files analyzed:** 8 (1 new, 7 modified)
**Analogs found:** 8 / 8

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|--------------------|------|-----------|-----------------|----------------|
| `treasure.jsx` (NEW) | component + hook (self-contained widget module) | event-driven | `perks.jsx` | exact |
| `pages.jsx` (HomePage/StoresPage/MagazinePage/ArticlePage edits) | component (mount-point insertion) | event-driven | `components.jsx:303-311` (`Footer` mounting `<HiddenPerk/>`) | exact |
| `components.jsx` (`Nav` progress-dot insertion) | component | event-driven | `components.jsx:100-151` (`Nav` itself, self) | exact |
| `app.jsx` (`TreasureHuntComplete` mount) | component (root-level mount) | event-driven | `app.jsx:84-89` (`<Footer setRoute={go}/>` mount pattern) | exact |
| `styles.css` (new rule blocks) | config/style | transform | `styles.css:1014-1098` (`.perk-mark`/`.perk-reveal` block) | exact |
| `Ladidier Portal.html` (script tag) | config | — | `Ladidier Portal.html:21-23` (script load order) | exact |
| `Ladidier Portal-print.html` (script tag + suppression rule) | config | — | `Ladidier Portal-print.html:36,56,87-89` (suppression rule + script load order) | exact |
| `ornaments.jsx`-style icon components (inside `treasure.jsx`, not a separate file) | component (presentational SVG) | transform | `ornaments.jsx:56-71` (`DecoCorner`) | exact |

## Pattern Assignments

### `treasure.jsx` (NEW FILE) — component + hook, event-driven

**Analog:** `perks.jsx` (full file, 99 lines) — this is the direct structural template per RESEARCH.md and CONTEXT.md's own canonical-refs instruction ("the `HiddenPerk` component, `usePerkFound()` hook pattern, and `Object.assign(window, {...})` export convention this phase's new file should follow").

**File-level structure** (`perks.jsx:1-16`):
```jsx
/* ─────────────────────────────────────────────────────────────
   LADIDIÉR — Hidden perk discovery
   ───────────────────────────────────────────────────────────── */
const { useState, useEffect, useRef } = React;

const PERK_FOUND_KEY = "ladidier_perk_found";
const PERK_CODE = "HOUSE10"; // D-06, static, display-only

function usePerkFound() {
  const [found, setFound] = useState(() => localStorage.getItem(PERK_FOUND_KEY) === "true");
  const markFound = () => {
    localStorage.setItem(PERK_FOUND_KEY, "true");
    setFound(true);
  };
  return { found, markFound };
}
```
Copy this shape exactly for `treasure.jsx`'s header comment, `const { useState, useEffect, useRef } = React;` destructure (add `useRef` only if the completion popup needs outside-click dismissal, see below), key constants (`TREASURE_PROGRESS_KEY`, `TREASURE_COMPLETED_KEY`, `TREASURE_CODE = "HOUSE20"`, `TREASURE_EVENT = "ladidier:treasure-found"`), and a lazy-`useState`-initializer hook (`useTreasureProgress()` per RESEARCH.md Pattern 1, reads `sessionStorage` not `localStorage` — this is the one deliberate deviation from `usePerkFound()`'s `localStorage` source per D-09).

**Trigger button pattern** (`perks.jsx:58-70`):
```jsx
<button
  type="button"
  className="perk-mark"
  ref={markRef}
  aria-label="A house secret"
  aria-expanded={open}
  aria-controls="perk-reveal"
  onClick={activate}
>
  ✦
</button>
```
`TreasureIcon`'s trigger `<button className="treasure-icon" aria-label={...} onClick={...}>` should follow this exact native-`<button>`-for-free-a11y convention (no `role`/`tabIndex`/`onKeyDown` needed) but swap the glyph child for an inline `<svg>` icon component (see Ornaments pattern below) and drop `aria-expanded`/`aria-controls` (no toggle/panel on the icon itself — clicking it collects and disappears, per RESEARCH.md's Code Examples `TreasureIcon` shape and the `06-UI-SPEC.md` "opacity: 1, no hover-camouflage" visual-hierarchy note).

**Reveal panel + subscribe-branch pattern** (`perks.jsx:71-96`, the single most important excerpt to copy for `TreasureHuntComplete`):
```jsx
{open && (
  <div
    ref={panelRef}
    id="perk-reveal"
    className={`paywall-gate perk-reveal${firstFind ? " perk-reveal--first" : ""}`}
  >
    <div className="eyebrow">A House Secret</div>
    <h3>Your code, for this issue:</h3>
    <span className="perk-code gold-text mono">{PERK_CODE}</span>
    <p>Present this at any Ladidiér house — online or in person.</p>
    <div className="perk-actions">
      {!isSubscribed && (
        <button
          type="button"
          className="btn solid"
          onClick={() => { close(); setRoute("subscribe"); }}
        >
          Also unlock the Sunday letter →
        </button>
      )}
      <button type="button" className="btn ghost" onClick={close}>Close</button>
    </div>
  </div>
)}
```
`TreasureHuntComplete`'s popup should copy this near-verbatim: `className="paywall-gate treasure-reveal"` (Pattern 3 from RESEARCH.md), same `.eyebrow`/`h3`/code-span/`p`/`.perk-actions`-equivalent (`.treasure-actions`)/`btn solid`+`btn ghost` structure, same `isSubscribed` read-only branch. Per `06-UI-SPEC.md` Copywriting Contract: eyebrow → "The House Treasure", h3 → "You found the treasure!", code lead-in → "Your reward, for finding it all:", code → `HOUSE20` (`className="treasure-code gold-text mono"`), body → "Present this at any Ladidiér house — online or in person.", subscribe CTA copy is byte-identical to Phase 5's ("Also unlock the Sunday letter →"), Close button copy identical ("Close").

**Outside-click + Escape-to-close pattern** (`perks.jsx:37-54`):
```jsx
useEffect(() => {
  if (!open) return;
  const onDown = (e) => {
    if (
      panelRef.current && !panelRef.current.contains(e.target) &&
      markRef.current && !markRef.current.contains(e.target)
    ) {
      setOpen(false);
    }
  };
  const onEsc = (e) => { if (e.key === "Escape") close(); };
  document.addEventListener("mousedown", onDown);
  document.addEventListener("keydown", onEsc);
  return () => {
    document.removeEventListener("mousedown", onDown);
    document.removeEventListener("keydown", onEsc);
  };
}, [open]);
```
Copy this verbatim into `TreasureHuntComplete` (it has no `markRef`-equivalent trigger element since it auto-opens on the 4th find rather than being clicked open — the `markRef`-guard condition can be dropped, only guard against `panelRef`).

**`isSubscribed` read-only check** (`perks.jsx:56`):
```jsx
const isSubscribed = localStorage.getItem("ladidier_subscribed") === "true";
```
Copy verbatim — RESEARCH.md's inherited Pitfall explicitly warns to mirror the exact `=== "true"` comparison, never `!== "false"`.

**Export convention** (`perks.jsx:99`):
```jsx
Object.assign(window, { HiddenPerk });
```
`treasure.jsx` must end with `Object.assign(window, { TreasureIcon, TreasureHuntComplete });` (only the two components consumed elsewhere need exporting; internal helpers/hooks/icon components stay file-scoped, exactly as `usePerkFound` is not exported from `perks.jsx`).

---

### `treasure.jsx` — inline SVG icon components (BagIcon, GiftBoxIcon, TagIcon, BowIcon)

**Analog:** `ornaments.jsx:56-71` (`DecoCorner`) and `ornaments.jsx:8-38` (`Laurel`) — the established hand-authored inline-SVG convention for this codebase.

**Pattern** (`ornaments.jsx:56-71`):
```jsx
function DecoCorner({ size = 64, color = "var(--gold)", rotate = 0 }) {
  return (
    <svg viewBox="0 0 64 64" width={size} height={size} fill="none" aria-hidden="true"
         style={{ display: "block", transform: `rotate(${rotate}deg)` }}>
      <g stroke={color} strokeWidth=".9" fill="none" strokeLinecap="round">
        <path d="M4 4 L28 4" />
        ...
      </g>
    </svg>
  );
}
```
Each of the 4 icon components (`BagIcon`, `GiftBoxIcon`, `TagIcon`, `BowIcon`) should follow this exact shape: a function component taking `{ size = 24 }` (per `06-UI-SPEC.md` Spacing Scale — 24px glyph inside a 44px hit-area button), `<svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true">`, with fills driven by CSS custom properties per RESEARCH.md Pattern 4 and `06-UI-SPEC.md` Color table — **not** `var(--gold)` uniformly like `DecoCorner`, but one dedicated hue token per icon (`fill="var(--blush)"` for `BagIcon`, `var(--sage)` for `GiftBoxIcon`, `var(--sky)` for `TagIcon`, `var(--lilac)` for `BowIcon`), with `var(--gold)` reserved for strap/string/outline detail strokes only (per `06-UI-SPEC.md` Color: "Accent (`--gold`)... all 4 icons' strap/string/outline detail strokes").

---

### `pages.jsx` — mount points in `HomePage`, `StoresPage`, `MagazinePage`, `ArticlePage`

**Analog:** `components.jsx:303-311` (`Footer` mounting `<HiddenPerk setRoute={setRoute}/>`) — the precedent for "mount a self-contained discovery widget as a plain sibling element, no extra props beyond what it already needs."

**Pattern** (`components.jsx:303-311`):
```jsx
function Footer({ setRoute }) {
  return (
    <footer className="foot">
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 18 }}>
          <Crest size={26} />
          <div className="display" style={{ fontSize: 28, fontWeight: 300 }}>LaDidiér</div>
          <HiddenPerk setRoute={setRoute} />
        </div>
```
`TreasureIcon` mounts follow the same "just add the component, pass only what it needs" pattern: `<TreasureIcon page="home" />`, `<TreasureIcon page="stores" />`, `<TreasureIcon page="magazine" />`, `<TreasureIcon page="article" />` — no `setRoute` needed (the icon itself only writes to storage + dispatches the event; only `TreasureHuntComplete` needs `setRoute` for the subscribe CTA).

**Exact insertion points per page** (verified current structure):
- `HomePage` (`pages.jsx:329-343`) — top-level of `<div className="page-fade">`, e.g. immediately after the hero variant block, before `<StoreMarquee />`. No `page-head`/`header` exists on this page (it's a stack of section components) — mount at the `page-fade` div's top level, not nested inside any one hero variant (so it survives all 3 `heroVariant` branches).
- `StoresPage` (`pages.jsx:671-703`) — mount inside `<div className="page-fade">` at the top level, **outside** both the `view === "list"` (705) and `view === "grid"` (731) conditionals per RESEARCH.md's explicit Pitfall (view-toggle would otherwise unmount the icon). Safe zones must avoid `.store-row` (`pages.jsx:714`) and grid-view store `<a>` cards (`pages.jsx:736`).
- `MagazinePage` (`pages.jsx:378-436`) — mount inside `<header className="page-head">` region (`pages.jsx:419-436`) or immediately adjacent to it, **outside** `.magazine-frame` (`pages.jsx:442` onward) per RESEARCH.md's explicit Pitfall (the `z-index: 10` paywall backdrop would make an icon inside the frame unreachable for unsubscribed visitors).
- `ArticlePage` (`pages.jsx:593-608`) — mount inside the `<header className="container">` byline/eyebrow region (`pages.jsx:596-608`), which has generous whitespace and no interactive elements to collide with.

---

### `components.jsx` — `Nav` progress-dot indicator

**Analog:** `components.jsx:100-151` (`Nav` itself) — the mount point is a self-edit to the existing component, not a copy from elsewhere.

**Exact insertion point** (`components.jsx:132-150`):
```jsx
<div className="nav-right">
  <a href="#search" onClick={(e) => e.preventDefault()}>Search</a>
  {item("subscribe", "Subscribe")}
  <a href="#account" onClick={(e) => e.preventDefault()} className="mono" style={{ fontSize: 11, letterSpacing: ".1em" }}>EN · USD</a>
  <button
    className="nav-hamburger"
    ref={hamburgerRef}
    aria-label="Open navigation"
    aria-expanded={menuOpen}
    aria-controls="mobile-nav-overlay"
    onClick={openMenu}
  >
```
Insert `<TreasureProgress />` immediately before the `.nav-hamburger` `<button>` (per RESEARCH.md's Code Examples "Nav progress-dot indicator" section and `06-UI-SPEC.md`'s spacing note that the 4-dot cluster is deliberately sized to "visually rhyme with the adjacent 44px `.nav-hamburger`"). `TreasureProgress` itself is a **new small component defined inside `treasure.jsx`** (not `components.jsx`) and exported via the same `Object.assign(window, {...})` convention, since `Nav` lives in `components.jsx` which loads *before* `treasure.jsx` in script order today — the planner must confirm/adjust script load order (see HTML entry point section below): `treasure.jsx` needs to load **before** `components.jsx` now (reversed from RESEARCH.md's stated "between perks.jsx and components.jsx" — since `Nav` in `components.jsx` will reference `TreasureProgress` at render time, and Babel-standalone scripts execute in `<script>` tag order with function declarations hoisted only within their own file, `treasure.jsx` must be loaded before `components.jsx` for `TreasureProgress` to be defined when `components.jsx`'s `Nav` function is *called* — though since these are function *declarations* referenced only inside JSX render (not at module-eval time), actual load order is more forgiving than variable assignment; verify empirically during implementation but the safe/recommended order is `ornaments.jsx → perks.jsx → treasure.jsx → components.jsx → app.jsx` in both HTML files).

`Nav`'s existing self-managed toggle-state pattern (`components.jsx:109-119`, `useState`/`useEffect` for `menuOpen`/`isClosing`) is the local-hook-usage precedent `TreasureProgress` should mirror internally (call `useTreasureProgress()` from `treasure.jsx`, render dots, `aria-label` per `06-UI-SPEC.md` Copywriting Contract: `"Treasure hunt progress: {n} of 4 found"`, dots themselves `aria-hidden`).

---

### `app.jsx` — `TreasureHuntComplete` root-level mount

**Analog:** `app.jsx:84-89` (`<Footer setRoute={go}/>` mount, sibling pattern).

**Pattern** (`app.jsx:84-89`):
```jsx
return (
  <>
    <Nav route={route} setRoute={go} />
    <main key={route + t.hero}>{page}</main>
    <Footer setRoute={go} />

    <TweaksPanel title="Tweaks">
```
Add `<TreasureHuntComplete setRoute={go} />` as a new sibling, e.g. immediately after `<Footer setRoute={go} />` and before `<TweaksPanel>`. This is a root-level, always-mounted component exactly like `Footer` — no route-switch changes, no new props threaded into `HomePage`/`StoresPage`/`MagazinePage`/`ArticlePage`/`Nav` (confirms RESEARCH.md's Anti-Pattern guidance: do NOT add `isSubscribed`-style lifted state here).

**`isSubscribed` state precedent** (`app.jsx:50`, read-only reference only — do not modify):
```jsx
const [isSubscribed, setIsSubscribed] = useState(() => localStorage.getItem("ladidier_subscribed") === "true");
```
`treasure.jsx` reads this same `localStorage` key directly (not via a prop from `app.jsx`), exactly as `perks.jsx:56` does — confirms no wiring change needed in `App()`'s state beyond the one new mount line.

---

### `styles.css` — new rule blocks

**Analog:** `styles.css:1014-1098`, the entire "Hidden perk — discovery mark + reveal panel" block — structurally the closest precedent for both the icon-button rules and the reveal-panel rules.

**Icon trigger button rules** — model on `.perk-mark` (`styles.css:1017-1039`):
```css
.perk-mark {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  padding: 0;
  margin: 0;
  background: none;
  border: 0;
  cursor: pointer;
  color: var(--gold);
  font-size: 15px;
  line-height: 1;
  opacity: .55;
  transition: opacity .3s ease;
}
.perk-mark:hover { opacity: .85; }
.perk-mark:focus-visible {
  outline: 1px solid var(--gold);
  outline-offset: 2px;
  opacity: .85;
}
```
`.treasure-icon` should copy the 44×44px hit-area, `background: none; border: 0; cursor: pointer;` reset, and `:focus-visible` outline treatment verbatim, but **must deviate on `opacity`** per `06-UI-SPEC.md` Visual Hierarchy: `opacity: 1` (not `.55`) at rest, with `transform: scale(1.08)` added on `:hover`/`:focus-visible` (a new declaration, no existing precedent for `transform` on `.perk-mark`) plus `position: absolute` + per-safe-zone `top`/`left`/`right`/`bottom` values (via inline `style={zone.style}` per RESEARCH.md's Code Examples, since `.perk-mark` sits inline in the Footer flex row and does NOT need absolute positioning — this is a genuine new requirement, not copied).

**Completion reveal panel rules** — model on `.perk-reveal`/`.perk-reveal h3`/`.perk-code`/`.perk-reveal p`/`.perk-actions`/`.perk-reveal--first` (`styles.css:1041-1098`) — copy this entire block's structure renamed to `.treasure-reveal`/`.treasure-reveal h3`/`.treasure-code`/`.treasure-reveal p`/`.treasure-actions`/`.treasure-reveal--first`, including the `@media (max-width: 480px)` full-bleed override (`styles.css:1086-1094`) and the `@media (prefers-reduced-motion: reduce)` animation-disable rule (`styles.css:1096-1098`). Per `06-UI-SPEC.md`: `z-index: 500` is unchanged (same tier as `.perk-reveal`, safe since the two never render simultaneously), `padding: 32px 24px` is identical, but note the popup likely needs **centered** positioning (not `left: 24px; bottom: 24px` fixed-corner like `.perk-reveal`) since it's a celebratory completion moment rather than an ambient corner reveal — confirm exact positioning at planning/UI-checker time; `.paywall-gate` (`styles.css:930-953`) remains the base class either way (`className="paywall-gate treasure-reveal"`).

**Nav progress-dot rules** — new, no direct copy-source exists (first dot-indicator in this codebase), but must respect the existing `.nav-right` flex-row layout precedent:
```css
.nav-left, .nav-right {
  display: flex; align-items: center; gap: 28px;
  font-size: 12px; letter-spacing: var(--tracking-mid);
}
.nav-right { justify-content: flex-end; }
```
(`styles.css:148-152`) — `.treasure-progress` (the dot cluster wrapper) should be a `display: flex; gap: 4px;` element that participates in this existing flex row without a new positioning context (per RESEARCH.md's explicit Pitfall guidance), sized per `06-UI-SPEC.md`: 4× 8px-diameter `border-radius: 50%` dots, gold-filled (`background: var(--gold)`) when found, otherwise a hollow/outline treatment (`border: 1px solid var(--gold); background: transparent;` or similar), invisible entirely (`display: none` or conditional render — prefer conditional JSX render, not CSS hide, so screen readers never see it pre-discovery) until `found.length >= 1`.

**Mobile hamburger/nav-right context to check before adding new rules** (`styles.css:462-492`, verified relevant, do not copy — read as constraint):
```css
.nav-hamburger {
  display: none;
  width: 44px; height: 44px;
  ...
}
@media (max-width: 768px) {
  .nav { grid-template-columns: auto 1fr auto; }
  .nav-left { display: none; }
  .nav-right > a { display: none; }
  .nav-right { display: flex; align-items: center; justify-content: flex-end; }
  .nav-hamburger { display: flex; }
}
```
`.nav-right > a { display: none; }` only hides `<a>` children — a `<div className="treasure-progress">` (not an `<a>`) survives this rule automatically and will sit next to the visible hamburger at ≤768px without extra media-query work, confirming RESEARCH.md's Pitfall analysis. No change needed to this existing block; only add new `.treasure-progress`/`.treasure-dot` rules elsewhere in the stylesheet.

---

### `Ladidier Portal.html` / `Ladidier Portal-print.html` — script tag insertion

**Analog:** the existing `perks.jsx` script tag itself, both files.

**`Ladidier Portal.html:20-25`** (current state):
```html
  <script type="text/babel" src="ornaments.jsx"></script>
  <script type="text/babel" src="perks.jsx"></script>
  <script type="text/babel" src="components.jsx"></script>

  <script type="text/babel" src="app.jsx"></script>
```
Insert `<script type="text/babel" src="treasure.jsx"></script>` between `perks.jsx` and `components.jsx` (see load-order caveat above re: `Nav`'s reference to `TreasureProgress` — recommend this exact position, `perks.jsx → treasure.jsx → components.jsx`, since `components.jsx` is the file that needs `TreasureIcon`-adjacent names defined first).

**`Ladidier Portal-print.html:86-91`** (current state):
```html
  <script type="text/babel" src="ornaments.jsx"></script>
  <script type="text/babel" src="perks.jsx"></script>
  <script type="text/babel" src="components.jsx"></script>

  <script type="text/babel" src="print-app.jsx"></script>
```
Same insertion, same position. This file **also** needs a new print-only suppression CSS rule, modeled directly on the existing pattern:

**Suppression rule precedent** (`Ladidier Portal-print.html:36,56`):
```css
.twk-panel, .twk-btn { display: none !important; }
...
.marquee, .ticker, .vmarquee { display: none !important; }
```
Add `.treasure-icon, .treasure-reveal, .treasure-progress { display: none !important; }` to this same `<style>` block (per RESEARCH.md's Pitfall: `PrintApp` renders all 4 target pages via `pages.jsx:41-56`, so `TreasureIcon` instances would otherwise render into the print/PDF output).

## Shared Patterns

### `Object.assign(window, {...})` global-scope export
**Source:** `perks.jsx:99` — `Object.assign(window, { HiddenPerk });`
**Apply to:** `treasure.jsx` — export only the components consumed by other files (`TreasureIcon`, `TreasureHuntComplete`, `TreasureProgress`); keep `useTreasureProgress`, `markIconFound`, `readProgress`, and the 4 icon SVG components file-scoped/unexported, mirroring how `usePerkFound` is not exported from `perks.jsx`.

### `localStorage`/`sessionStorage` read-only flag convention, `=== "true"` comparison
**Source:** `app.jsx:50`, `perks.jsx:56` — `localStorage.getItem("ladidier_subscribed") === "true"`
**Apply to:** every subscribe-branch check inside `TreasureHuntComplete`; also apply the same exact-string-comparison discipline to `TREASURE_COMPLETED_KEY` reads (`localStorage.getItem(TREASURE_COMPLETED_KEY) === "true"`).

### `.paywall-gate` base card shell reuse
**Source:** `styles.css:930-953` (`.paywall-gate`), reused by Phase 5 as `className="paywall-gate perk-reveal"` (`perks.jsx:75`)
**Apply to:** `TreasureHuntComplete`'s popup — `className="paywall-gate treasure-reveal"`, same reuse-don't-reinvent precedent Phase 5 established.

### Native `<button>` for click+keyboard accessibility, no custom `role`/`tabIndex`
**Source:** `perks.jsx:60-70` (`.perk-mark`), `components.jsx:136-149` (`.nav-hamburger`)
**Apply to:** `TreasureIcon`'s trigger button and any dismiss/CTA buttons inside `TreasureHuntComplete` — all native `<button type="button">`, never a `<div onClick>` or hover-only trigger (RESEARCH.md's inherited Pitfall 3).

### `window.dispatchEvent(new CustomEvent(...))` cross-component sync
**Source:** no direct in-repo precedent for `CustomEvent` specifically, but `app.jsx:61` (`window.addEventListener("hashchange", fromHash)`) is the closest prior-art for a global `window` event listener pattern in this codebase.
**Apply to:** `treasure.jsx`'s `markIconFound()` (dispatch) and `useTreasureProgress()` (listen) — this is the one genuinely new idiom in this phase; see RESEARCH.md Architecture Pattern 1 for the full verified code shape (`06-RESEARCH.md:172-204`).

### CSS custom-property-driven color (never hardcoded hex) for theme reactivity
**Source:** `app.jsx:34-45` (`applyTheme()`), `ornaments.jsx`'s `color = "var(--gold)"` default-prop convention throughout
**Apply to:** all 4 new icon SVG components — fills/strokes must reference `var(--blush)`, `var(--sage)`, `var(--sky)`, `var(--lilac)`, `var(--gold)` per `06-UI-SPEC.md`'s Color table, never inline hex.

## No Analog Found

None — every file in this phase's scope has at least one exact or near-exact analog in the existing codebase (Phase 5's `perks.jsx` in particular covers the vast majority of the new file's shape). The only genuinely novel idiom (CustomEvent broadcast) has a documented, low-novelty precedent (`hashchange` listener) and a fully-specified example in `06-RESEARCH.md` Architecture Pattern 1.

## Metadata

**Analog search scope:** Full repo root (`.jsx` files: `app.jsx`, `components.jsx`, `pages.jsx`, `perks.jsx`, `ornaments.jsx`, `print-app.jsx`, `tweaks-panel.jsx` not read — no relevant analog); `styles.css`; both HTML entry points (`Ladidier Portal.html`, `Ladidier Portal-print.html`)
**Files scanned:** 9 (all directly read or grepped this session; `tweaks-panel.jsx` excluded as RESEARCH.md confirms zero expected changes)
**Pattern extraction date:** 2026-08-22
