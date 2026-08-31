# Phase 5: Hidden Perks Discovery Feature - Pattern Map

**Mapped:** 2026-08-21
**Files analyzed:** 5 (1 new, 4 modified)
**Analogs found:** 5 / 5

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|-------------------|------|-----------|-----------------|---------------|
| `perks.jsx` (NEW) | component (global-scope script, stateful disclosure widget) | event-driven | `components.jsx` — `MobileNav` + `Nav` (trigger/overlay pair) | role-match (closest available; no prior small-panel-with-trigger component exists as its own file, but the pattern is fully present inside `components.jsx`) |
| `components.jsx` (Footer, 1-line edit) | component (integration point) | request-response (prop threading) | `components.jsx` — `Footer`'s own existing wordmark row (self-referential edit) | exact |
| `styles.css` (append `.perk-mark` / `.perk-reveal` rules) | config/style | n/a | `styles.css` — `.nav-hamburger`, `.mobile-overlay-close`, `.paywall-gate` | exact |
| `Ladidier Portal.html` (1-line script tag) | config | n/a | Same file's own existing `<script type="text/babel">` tag list | exact |
| `Ladidier Portal-print.html` (1-line script tag) | config | n/a | Same file's own existing `<script type="text/babel">` tag list | exact |

## Pattern Assignments

### `perks.jsx` (NEW FILE) — component, event-driven

**Analogs:** `components.jsx` (`MobileNav`/`Nav` trigger-overlay pair, lines 99-300), `styles.css` (`.paywall-gate`, `.mobile-overlay-close:focus-visible`), `pages.jsx` (`.paywall-gate` inline-override precedent, lines 455-499), `app.jsx` (`ladidier_subscribed` read pattern, line 50)

**File-header / global-scope-script convention** (mirror exactly — no modules, no bundler):
```jsx
// components.jsx lines 1-4
/* ─────────────────────────────────────────────────────────────
   LADIDIÉR — Shared components
   ───────────────────────────────────────────────────────────── */
const { useState, useEffect, useRef, useMemo } = React;
```
`perks.jsx` needs only `useState`, `useEffect`, `useRef` — omit `useMemo` if unused. Do not `import` anything; React/hooks are already global via the UMD `<script>` tags loaded before `perks.jsx` in both HTML files.

**Export convention** (end of file — mirror exactly):
```jsx
// components.jsx line 423
Object.assign(window, { STORES, ISSUE, STORIES, IMG, Photo, Crest, Logo, Nav, MobileNav, Footer, StoreMarquee, Reveal, MagazineCover });
```
`perks.jsx` should end with `Object.assign(window, { HiddenPerk });` — only the single component needs to be exposed; `usePerkFound`/`PERK_CODE` are internal to the file and don't need to be global.

**Trigger + focusable-button pattern** (mirror `Nav`'s hamburger button, `components.jsx:136-149`):
```jsx
<button
  className="nav-hamburger"
  ref={hamburgerRef}
  aria-label="Open navigation"
  aria-expanded={menuOpen}
  aria-controls="mobile-nav-overlay"
  onClick={openMenu}
>
  <svg viewBox="0 0 20 14" width={20} height={14} fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect y="0" width="20" height="2" rx="1" fill="currentColor" />
    ...
  </svg>
</button>
```
Use a native `<button>` (not a styled `<div>`/`<span>`) — this is the established convention site-wide and gets Enter/Space activation for free (PERK-02). Reuse the `aria-expanded`/`aria-controls` pair for consistency with this exact precedent.

**Escape-key close pattern — REUSE THIS SHAPE, `components.jsx:176-181`:**
```jsx
// Escape key close
useEffect(() => {
  const handler = (e) => { if (e.key === "Escape") onClose(); };
  document.addEventListener("keydown", handler);
  return () => { document.removeEventListener("keydown", handler); };
}, [onClose]);
```

**Focus-trap pattern — `components.jsx:184-207` — DO NOT REUSE.** `MobileNav`'s focus-trap (cycling Tab/Shift+Tab within the overlay, lines 186-201) is correct for a `role="dialog" aria-modal="true"` full-screen nav overlay but is explicitly wrong for the perk panel: PERK-06 and D-03 require the panel to never block/trap focus. Skip this block entirely — only borrow the Escape-close `useEffect` shape above, plus a `mousedown`-outside-click listener (see Don't-Hand-Roll idiom below), not the trap.

**Outside-click idiom** (mirror the ref pattern already established for `overlayRef`/`closeButtonRef`, `components.jsx:167-168`, generalized per RESEARCH.md's verified `usePerkFound()` example):
```jsx
const panelRef = useRef(null);
useEffect(() => {
  if (!open) return;
  const onDown = (e) => { if (panelRef.current && !panelRef.current.contains(e.target)) setOpen(false); };
  document.addEventListener("mousedown", onDown);
  return () => document.removeEventListener("mousedown", onDown);
}, [open]);
```

**`localStorage` read/write pattern — mirror `app.jsx:50` exactly, including the `=== "true"` comparison (never `!== "false"`):**
```jsx
// app.jsx line 50
const [isSubscribed, setIsSubscribed] = useState(() => localStorage.getItem("ladidier_subscribed") === "true");
```
```jsx
// pages.jsx lines 486-488 (write site — perks.jsx must NEVER write this key, read-only)
setIsSubscribed(true);
localStorage.setItem("ladidier_subscribed", "true");
```
For the new `ladidier_perk_found` key (owned entirely by `perks.jsx`), mirror the same `useState(() => localStorage.getItem(KEY) === "true")` initializer shape, with a `markFound()` setter that both writes `localStorage` and updates React state — see RESEARCH.md's `usePerkFound()` code example (lines 279-286), which is grounded in this exact codebase convention.

**Panel shell — reuse `.paywall-gate` class + inline override, mirror `pages.jsx:473` exactly:**
```jsx
// pages.jsx line 473 — existing precedent for a smaller, non-full-width .paywall-gate override
<div className="paywall-gate" style={{ margin: 0, border: "1px solid var(--gold)", background: "var(--cream)", color: "var(--noir)", padding: "48px 32px" }}>
  <div className="lock-icon">✦</div>
  ...
</div>
```
For the perk reveal panel, extend this override pattern with `position: "fixed"`, `maxWidth: 340`, `zIndex: 500` (per D-03/Pattern 5), anchored near the Footer wordmark. The `.lock-icon`'s `✦` character (`styles.css:948-953`, used at `pages.jsx:474`) is the directly reusable D-02 glyph precedent — reuse it verbatim or adapt `ornaments.jsx`'s `Flourish` diamond path (lines 41-54, `<path d="M105 10 q5 -6 10 0 q5 6 10 0 q-5 -6 -10 0 q-5 6 -10 0 z" fill={color}.../>`) if inline SVG is preferred.

**Subscribe-branch + navigation pattern — mirror Footer's own sibling links, `components.jsx:323-325`, NOT `location.hash`:**
```jsx
// components.jsx lines 323-325 — Footer's existing internal-link convention
<li><a href="#" onClick={(e) => { e.preventDefault(); setRoute("about"); }}>Universe</a></li>
<li><a href="#" onClick={(e) => { e.preventDefault(); setRoute("stores"); }}>Stores</a></li>
<li><a href="#" onClick={(e) => { e.preventDefault(); setRoute("magazine"); }}>Magazine</a></li>
```
`HiddenPerk` must receive `setRoute` as a prop (threaded from `Footer({ setRoute })`, itself threaded from `app.jsx:88`'s `<Footer setRoute={go} />`) and call `setRoute("subscribe")` on the D-08 CTA click — this uses `go()`'s `history.replaceState` + `scrollTo({top:0, behavior:"instant"})` (`app.jsx:65-69`), unlike a raw `location.hash =` assignment.

**Full verified code example (from RESEARCH.md, composed against this exact codebase state — use as the primary implementation reference):**
```jsx
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

function HiddenPerk({ setRoute }) {
  const { found, markFound } = usePerkFound();
  const [open, setOpen] = useState(false);
  const panelRef = useRef(null);

  const activate = () => { markFound(); setOpen(true); };

  useEffect(() => {
    if (!open) return;
    const onDown = (e) => { if (panelRef.current && !panelRef.current.contains(e.target)) setOpen(false); };
    const onEsc = (e) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onEsc);
    };
  }, [open]);

  return (
    <>
      <button type="button" className="perk-mark" aria-label="A house secret" onClick={activate}>
        ✦
      </button>
      {open && (
        <div ref={panelRef} className="paywall-gate" style={{
          position: "fixed", margin: 0, maxWidth: 340, padding: "32px 28px", zIndex: 500,
        }}>
          <div className="eyebrow">A House Secret</div>
          <h3>Your code, for this issue: <span className="gold-text mono">{PERK_CODE}</span></h3>
          <p>Present this at any Ladidiér house — online or in person.</p>
          {localStorage.getItem("ladidier_subscribed") !== "true" && (
            <button className="btn solid" onClick={() => { setOpen(false); setRoute("subscribe"); }}>
              Also unlock the Sunday letter →
            </button>
          )}
          <button className="btn ghost" onClick={() => setOpen(false)}>Close</button>
        </div>
      )}
    </>
  );
}

Object.assign(window, { HiddenPerk });
```
Note: the `localStorage.getItem("ladidier_subscribed") !== "true"` check above should be normalized to match `app.jsx:50`'s `=== "true"` polarity (i.e. `localStorage.getItem("ladidier_subscribed") !== "true"` is the correct *negated* form for "show CTA when NOT subscribed" — this is fine since it's testing the inverse case, not redefining the flag's semantics; do not invert to `!== "false"`).

**No error-handling pattern applies** — this is a pure client-side display feature with no async calls, no network I/O, no try/catch anywhere in any analog. `localStorage` calls are synchronous and never wrapped in try/catch elsewhere in this codebase (see `app.jsx:50`, `pages.jsx:487`) — do not add defensive try/catch that has no precedent.

**No validation pattern applies** — no user text input exists in this feature (per RESEARCH.md Security Domain, V5 Input Validation: "No — this phase introduces no new user text input").

---

### `components.jsx` (Footer, 1-line edit) — component, integration point

**Analog:** Footer's own current wordmark row

**Current code** (`components.jsx:307-310`):
```jsx
<div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 18 }}>
  <Crest size={26} />
  <div className="display" style={{ fontSize: 28, fontWeight: 300 }}>LaDidiér</div>
</div>
```

**Target edit** — add one line inside this flex container, do not touch `Crest` (confirmed still a 6-call-site no-op returning `null`, `components.jsx:85-87`):
```jsx
<div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 18 }}>
  <Crest size={26} />
  <div className="display" style={{ fontSize: 28, fontWeight: 300 }}>LaDidiér</div>
  <HiddenPerk setRoute={setRoute} />
</div>
```
`Footer` already receives `setRoute` as a prop (`function Footer({ setRoute })`, `components.jsx:303`) — no new prop plumbing needed at the `Footer` call site itself (`app.jsx:88`, `<Footer setRoute={go} />`, already passes it).

**Also note:** `Footer`'s `.foot-base` line (`components.jsx:349`) already contains the `"Vol. I N°03"` issue framing referenced by D-05 — no edit needed there, just useful context for `perks.jsx`'s "this issue" copy: `<span>© MMXXVI · LaDidiér · Vol. I N°03</span>`.

---

### `styles.css` (append `.perk-mark` rules) — config/style

**Analogs:** `.nav-hamburger` (lines 469-483), `.mobile-overlay-close` (lines 607-626), `.mobile-overlay` z-index (line 575), `.paywall-gate` (lines 930-953)

**Button-reset + opacity-transition pattern** (`.nav-hamburger`, lines 469-479):
```css
/* styles.css lines 469-479 */
  border: 0;
  cursor: pointer;
  align-items: center;
  justify-content: center;
  position: relative;
  color: var(--fg);
  opacity: .82;
  transition: opacity .3s ease;
}
.nav-hamburger:hover { opacity: 1; }
```

**`:focus-visible` convention — reuse verbatim, two independent confirmations of the exact same rule:**
```css
/* styles.css lines 480-483 */
.nav-hamburger:focus-visible {
  outline: 1px solid var(--gold);
  outline-offset: 2px;
}
```
```css
/* styles.css lines 623-626 */
.mobile-overlay-close:focus-visible {
  outline: 1px solid var(--gold);
  outline-offset: 2px;
}
```

**Recommended new rules** (append to `styles.css`, mirroring the two conventions above — this exact block was verified in RESEARCH.md against current file state):
```css
.perk-mark { background: none; border: 0; cursor: pointer; color: var(--gold); opacity: .55; transition: opacity .3s ease; }
.perk-mark:hover { opacity: .85; }
.perk-mark:focus-visible { outline: 1px solid var(--gold); outline-offset: 2px; opacity: .85; }
```

**z-index vocabulary — two files, not one:**
```css
/* styles.css line 575 */
.mobile-overlay { position: fixed; inset: 0; z-index: 100; ... }
```
```jsx
// tweaks-panel.jsx line 50 — NOT in styles.css, injected via JS template-literal <style> tag
.twk-panel{position:fixed;right:16px;bottom:16px;z-index:2147483646;width:280px;
```
The perk panel's `z-index: 500` must be checked against both of these — grepping `styles.css` alone will miss `.twk-panel`'s value.

**`.paywall-gate` base + mobile override precedent** (reuse for the panel shell, do not invent a new class):
```css
/* styles.css lines 930-941 */
.paywall-gate {
  border: 1px solid var(--gold);
  border-radius: 8px;
  background: var(--cream);
  padding: 80px 48px;
  text-align: center;
  max-width: 680px;
  margin: 60px auto;
  box-shadow: 0 40px 80px -20px color-mix(in srgb, var(--noir) 15%, transparent);
  position: relative;
  overflow: hidden;
}
```
```css
/* styles.css lines 995-997 — existing mobile override precedent, confirms overriding via inline style is the established pattern, not a new CSS class */
  .paywall-gate {
    padding: 24px 16px !important;
  }
```
Per Pitfall 8 (mobile `!important` cascade), verify the perk panel's inline-style overrides still render correctly at ≤480px given this existing `!important` mobile rule on the base `.paywall-gate` class.

---

### `Ladidier Portal.html` / `Ladidier Portal-print.html` (1-line script tag each) — config

**Analog:** Each file's own existing script-tag list (self-referential — both files must be edited identically)

**Current state, `Ladidier Portal.html` lines 20-24:**
```html
<script type="text/babel" src="tweaks-panel.jsx"></script>
<script type="text/babel" src="ornaments.jsx"></script>
<script type="text/babel" src="components.jsx"></script>
<script type="text/babel" src="pages.jsx"></script>
<script type="text/babel" src="app.jsx"></script>
```

**Current state, `Ladidier Portal-print.html` lines 86-90:**
```html
<script type="text/babel" src="tweaks-panel.jsx"></script>
<script type="text/babel" src="ornaments.jsx"></script>
<script type="text/babel" src="components.jsx"></script>
<script type="text/babel" src="pages.jsx"></script>
<script type="text/babel" src="print-app.jsx"></script>
```

**Required edit (both files, identical insertion point) — insert between `ornaments.jsx` and `components.jsx`:**
```html
<script type="text/babel" src="tweaks-panel.jsx"></script>
<script type="text/babel" src="ornaments.jsx"></script>
<script type="text/babel" src="perks.jsx"></script>
<script type="text/babel" src="components.jsx"></script>
<script type="text/babel" src="pages.jsx"></script>
<script type="text/babel" src="app.jsx"></script>
```
Load order matters: `perks.jsx` must load after `ornaments.jsx` (in case it later reuses `Flourish`) and before `components.jsx` (since `Footer` inside `components.jsx` references `HiddenPerk` at render time — global-scope script execution order is the only "module resolution" this zero-build project has). Missing this tag in `Ladidier Portal-print.html` causes `ReferenceError: HiddenPerk is not defined` inside `PrintApp`, since `print-app.jsx` also renders `Footer`. Both files must be edited in the same task/commit.

---

## Shared Patterns

### Global-scope script + `Object.assign(window, {...})` export convention
**Source:** `components.jsx:1-4` (imports/globals) and `components.jsx:423` (export)
**Apply to:** `perks.jsx` (the only new file this phase)
```jsx
const { useState, useEffect, useRef } = React;
// ...component definitions...
Object.assign(window, { HiddenPerk });
```
No `import`/`export` keywords anywhere in this codebase — React/ReactDOM/Babel are loaded via `<script>` UMD tags before any `.jsx` file; each `.jsx` file is a `<script type="text/babel">` executed in global scope in HTML `<script>` tag order.

### `:focus-visible` keyboard-accessibility convention
**Source:** `styles.css:480-483` (`.nav-hamburger`), `styles.css:623-626` (`.mobile-overlay-close`)
**Apply to:** `.perk-mark` (new trigger button)
```css
.perk-mark:focus-visible { outline: 1px solid var(--gold); outline-offset: 2px; }
```

### `localStorage` flag read/write — `=== "true"` comparison only, never `!== "false"`
**Source:** `app.jsx:50` (read), `pages.jsx:487` and `pages.jsx:772` (write)
**Apply to:** `perks.jsx`'s new `ladidier_perk_found` key (read+write) and its read-only check of the existing `ladidier_subscribed` key
```jsx
const isSubscribed = localStorage.getItem("ladidier_subscribed") === "true";
```
`perks.jsx` must never call `localStorage.setItem("ladidier_subscribed", ...)` — that key is owned exclusively by `app.jsx`/`pages.jsx`'s existing subscribe flow.

### `setRoute` prop-threaded navigation — not `location.hash`
**Source:** `components.jsx:323-325` (Footer's own sibling links), `app.jsx:65-69` (`go()` function), `app.jsx:88` (`<Footer setRoute={go} />`)
**Apply to:** `perks.jsx`'s D-08 subscribe CTA
```jsx
onClick={(e) => { e.preventDefault(); setRoute("subscribe"); }}
```

### Escape-key-close `useEffect` shape (without focus-trap)
**Source:** `components.jsx:176-181` (`MobileNav`)
**Apply to:** `perks.jsx`'s `PerkReveal`/panel-close behavior — reuse only this block, explicitly skip `components.jsx:184-207`'s focus-trap block (violates PERK-06/D-03 for a non-modal panel)
```jsx
useEffect(() => {
  const handler = (e) => { if (e.key === "Escape") onClose(); };
  document.addEventListener("keydown", handler);
  return () => { document.removeEventListener("keydown", handler); };
}, [onClose]);
```

### `.paywall-gate` class + inline-style override for a non-full-width instance
**Source:** `styles.css:930-953` (base class), `pages.jsx:473-474` (existing smaller-override precedent, including the `✦` `.lock-icon` glyph)
**Apply to:** `perks.jsx`'s reveal panel shell — do not create a second CSS class; override `padding`/`margin`/`maxWidth` via inline `style`, add `position: "fixed"` and `zIndex: 500`

## No Analog Found

None. Every file in this phase's scope has a directly reusable precedent already present in the codebase — the milestone research's own "Key insight" (RESEARCH.md line 242) confirms this: "the implementation task is assembly, not invention."

## Metadata

**Analog search scope:** `components.jsx`, `app.jsx`, `pages.jsx` (lines 455-499, 480-490, 766-772), `styles.css` (lines 469-500, 565-635, 925-1000), `ornaments.jsx` (lines 1-60), `tweaks-panel.jsx` (line 50), `Ladidier Portal.html`, `Ladidier Portal-print.html` — full-file reads for all files ≤ 574 lines; targeted reads for `pages.jsx` (959 lines) and `styles.css` (1012 lines)
**Files scanned:** 8 (components.jsx, app.jsx, pages.jsx, styles.css, ornaments.jsx, tweaks-panel.jsx, Ladidier Portal.html, Ladidier Portal-print.html)
**Pattern extraction date:** 2026-08-21
