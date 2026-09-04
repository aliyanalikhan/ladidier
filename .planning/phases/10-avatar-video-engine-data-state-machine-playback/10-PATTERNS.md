# Phase 10: Avatar Video Engine — Data, State Machine & Playback - Pattern Map

**Mapped:** 2026-09-05
**Files analyzed:** 5 (2 new, 3 modified)
**Analogs found:** 5 / 5

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|---|---|---|---|---|
| `src/avatarFaqData.js` | model / config (plain data module) | transform (static lookup) | `src/theme.js` | exact |
| `src/avatarFaq.jsx` | component + hook (state machine + `<video>` DOM sync) | event-driven / streaming (video playback) | `src/treasure.jsx` (event + storage patterns) + `src/pages.jsx`'s `Reader` (createPortal pattern) | role-match (composite — no existing file does video/reducer, but session/localStorage flag, CustomEvent, portal-for-fixed-position, and outside-click/Escape panel are all directly reusable) |
| `src/pages.jsx` (`HomePage`) | route/page composition | request-response (render composition) | existing `HomePage` body itself (self-modification) — mounting convention matches `TreasureIcon` | exact |
| `src/components.jsx` (`Nav`'s `openMenu`/`closeMenu`) | event emitter (cross-component signal) | event-driven | `src/treasure.jsx`'s `markIconFound` → `window.dispatchEvent(new CustomEvent(...))` | exact |
| `src/styles.css` (new `.avatar-faq-*` rules) | config (styling) | n/a | `.mobile-overlay` / `.treasure-reveal` / `.reader-backdrop` z-index + fixed-position rules | role-match |

## Pattern Assignments

### `src/avatarFaqData.js` (model, transform)

**Analog:** `src/theme.js` (full file, 46 lines — already read in full above)

**Structural pattern to copy:**
- No React import at all — pure ESM module exporting constants/objects (`theme.js:1-46` has zero `import` statements).
- Header comment block explaining the module's role (`theme.js:1-4` style — short, above the exports).
- `Object.freeze(...)` used for a single canonical constant object (`theme.js:27-33`, `export const THEME = Object.freeze({...})`) — not required for `FAQ_CATEGORIES` (an array of objects, not a single flat config) but the *pattern* of exporting frozen/immutable-by-convention constants is the project's norm; RESEARCH.md's own Pattern 4 code example (verbatim, use as-is) already matches this file's conventions exactly:

```js
// avatarFaqData.js — no React import, no JSX
export const AVATAR_ASSET_BASE = "/assets/avatar";
export const AVATAR_INTRO_SRC = `${AVATAR_ASSET_BASE}/INTRO.mp4`;
export const AVATAR_IDLE_SRC = `${AVATAR_ASSET_BASE}/Idle.mp4`;

export const FAQ_CATEGORIES = [ /* ... D-01 content, verbatim, per RESEARCH.md Pattern 4 ... */ ];

export const FAQ_QUESTIONS_BY_ID = Object.fromEntries(
  FAQ_CATEGORIES.flatMap((c) => c.questions).map((q) => [q.id, q])
);
```

**Derived-lookup pattern** (mirrors `theme.js:35-46`'s `applyTheme(t)` — a pure function that derives DOM/runtime values from the data constants): `FAQ_QUESTIONS_BY_ID` is exactly this shape — a derived lookup built once at module load, not recomputed per-render.

---

### `src/avatarFaq.jsx` (component + `useVideoAvatar` hook)

**Primary analog for storage/event patterns:** `src/treasure.jsx`
**Primary analog for portal-mount pattern:** `src/pages.jsx`'s `Reader` component (lines ~536-543)
**Primary analog for panel open/close + outside-click/Escape:** `src/perks.jsx`'s `HiddenPerk` (full file) and `src/treasure.jsx`'s `TreasureHuntComplete` (lines 154-207)

**Imports pattern** (from `treasure.jsx:1-4`):
```jsx
/* ─────────────────────────────────────────────────────────────
   LADIDIÉR — <feature name>
   ───────────────────────────────────────────────────────────── */
import { useState, useEffect, useRef } from 'react';
```
Add `useReducer` and (for the portal) `createPortal` from `react-dom` (per `pages.jsx:5`):
```jsx
import { useReducer, useRef, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { FAQ_CATEGORIES, FAQ_QUESTIONS_BY_ID, AVATAR_INTRO_SRC, AVATAR_IDLE_SRC } from './avatarFaqData.js';
```

**sessionStorage-backed "played once" flag pattern** (mirrors `treasure.jsx:6,11-18` — read-with-try/catch, key constant at module top):
```jsx
const AVATAR_INTRO_PLAYED_KEY = "ladidier_avatar_intro_played"; // sessionStorage, not localStorage — matches Pitfall E's session-vs-completion distinction (treasure.jsx:6 sessionStorage vs :7 localStorage)

function hasIntroPlayedThisSession() {
  return sessionStorage.getItem(AVATAR_INTRO_PLAYED_KEY) === "true";
}
```
Reference for the try/catch-guarded read style: `treasure.jsx:11-18` (`readProgress()`), and the plain boolean-flag style: `perks.jsx:6,9-16` (`usePerkFound`, `localStorage.getItem(PERK_FOUND_KEY) === "true"`).

**Cross-component CustomEvent pattern** (copy verbatim from `treasure.jsx:9,32,36-44`):
```jsx
// treasure.jsx:9
const TREASURE_EVENT = "ladidier:treasure-found";
// treasure.jsx:32 — dispatch site
window.dispatchEvent(new CustomEvent(TREASURE_EVENT, { detail: { found, complete } }));
// treasure.jsx:36-44 — listener hook
function useTreasureProgress() {
  const [found, setFound] = useState(readProgress);
  useEffect(() => {
    const handler = (e) => setFound(e.detail.found);
    window.addEventListener(TREASURE_EVENT, handler);
    return () => window.removeEventListener(TREASURE_EVENT, handler);
  }, []);
  return found;
}
```
Apply this exact shape for the mobile-nav-open → video-pause signal (Pitfall F): define `const AVATAR_MOBILENAV_EVENT = "ladidier:mobilenav";` in `components.jsx`, dispatch from `openMenu`/`closeMenu`, and add a matching `window.addEventListener` inside `avatarFaq.jsx` that calls `videoRef.current.pause()` on `{ open: true }`.

**Portal-mount pattern to avoid Pitfall G** (copy verbatim from `pages.jsx:536-543`, comment included as rationale template):
```jsx
// Portaled straight to document.body: HomePage's root carries the
// site-wide .page-fade entry animation, which animates `transform` and so
// establishes a containing block for any `position: fixed` descendant —
// without the portal this widget renders pinned to that ancestor's box
// instead of the viewport corner for the animation's ~0.5s duration. Mounting
// outside that subtree sidesteps it, the same reason `.mobile-overlay` is
// mounted at the app root and the reader modal (`Reader` in pages.jsx) does
// the same.
return createPortal(
  <div className="avatar-faq-widget">{/* video + question buttons */}</div>,
  document.body
);
```

**Outside-click / Escape-to-close panel pattern** (mirrors `perks.jsx:37-54` and `treasure.jsx:166-180` — identical shape in both, safe to copy either):
```jsx
useEffect(() => {
  if (!open) return;
  const onDown = (e) => {
    if (panelRef.current && !panelRef.current.contains(e.target)) {
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
(Applies if the interim UI treats the question list as an open/closeable panel; if it's always-visible per D-04's "plain buttons" simplicity, this pattern is optional for Phase 10 and becomes directly relevant in Phase 11's launcher/accordion.)

**Reducer / DOM-sync core pattern** — no in-repo analog exists (first video/reducer feature in this codebase); use RESEARCH.md's Pattern 2 code verbatim (already fully specified, cross-checked against this repo's own single-source-of-truth precedent in `app.jsx`'s prior `isMember` bug-fix). Reproduced here for planner convenience:
```jsx
function avatarReducer(state, action) {
  switch (action.type) {
    case "INTRO_ENDED":
      return { phase: "idle", questionId: null, generation: state.generation };
    case "ASK":
      return { phase: "answering", questionId: action.questionId, generation: state.generation + 1 };
    case "ANSWER_ENDED":
      if (action.generation !== state.generation) return state;
      return { phase: "idle", questionId: null, generation: state.generation };
    default:
      return state;
  }
}
```

**Error/rejection handling pattern** — no in-repo analog (no other feature calls `.play()`); use RESEARCH.md's Pitfall A / "Autoplay-rejection fallback" code verbatim (`p.then(...).catch(...)`, distinguishing `AbortError` from `NotAllowedError`, `blocked` state driving a "Tap to play" button).

---

### `src/pages.jsx` (`HomePage` modification)

**Analog:** `HomePage`'s own existing `TreasureIcon` mount (verbatim, `pages.jsx:24,237` per RESEARCH.md's own verification)

**Import + mount pattern:**
```jsx
import { TreasureIcon } from './treasure.jsx';
import { AIAvatarFAQ } from './avatarFaq.jsx';

function HomePage({ setRoute, heroVariant }) {
  return (
    <div className="page-fade">
      {/* ...hero, marquee, manifesto, etc... */}
      <TreasureIcon page="home" />
      <AIAvatarFAQ />
    </div>
  );
}
```
Note: `AIAvatarFAQ` itself internally portals its actual DOM to `document.body` (see above) — its placement here in JSX only matters for React's component tree / mount-unmount lifecycle (Pitfall D), not for where it visually renders.

---

### `src/components.jsx` (`Nav`'s `openMenu`/`closeMenu` modification)

**Analog:** existing `openMenu`/`closeMenu` definitions, `components.jsx:120-124`

**Current code (to be extended, not replaced):**
```jsx
const openMenu = () => { setMenuOpen(true); setIsClosing(false); };
const closeMenu = () => {
  setIsClosing(true);
  setTimeout(() => { setMenuOpen(false); setIsClosing(false); }, 300);
};
```

**Pattern to add** (mirrors `treasure.jsx:32`'s dispatch-on-state-change call site):
```jsx
const openMenu = () => {
  setMenuOpen(true);
  setIsClosing(false);
  window.dispatchEvent(new CustomEvent("ladidier:mobilenav", { detail: { open: true } }));
};
const closeMenu = () => {
  setIsClosing(true);
  window.dispatchEvent(new CustomEvent("ladidier:mobilenav", { detail: { open: false } }));
  setTimeout(() => { setMenuOpen(false); setIsClosing(false); }, 300);
};
```

---

### `src/styles.css` (new `.avatar-faq-*` rules)

**Analog for fixed-position + z-index vocabulary:** `.mobile-overlay` (`styles.css:580-609`), `.treasure-reveal` (`styles.css:1245-1257`, `z-index: 500`), `.reader-backdrop` (`styles.css:976-987`, `z-index: 200`)

**Existing z-index vocabulary (from direct read):**
| Selector | z-index |
|---|---|
| `.mobile-overlay` (nav header, sticky) | 50 |
| `.reader-backdrop` | 200 |
| `.treasure-reveal` (and `.perk-reveal`) | 500 |
| (implied `.mobile-overlay` full-screen panel itself) | 100 (per RESEARCH.md's own citation) |

**Recommendation carried from RESEARCH.md:** place the widget's z-index below `.mobile-overlay`'s 100 (e.g. `z-index: 80`), paired with the `pause()`-on-mobile-nav-open CustomEvent handler above — do not rely on z-index alone to prevent audio bleed-through.

**Minimal positioning-only CSS shape** (D-04 — no luxury styling this phase), following this project's existing convention of plain rules with brief inline comments where non-obvious (see `.reader-backdrop` block style):
```css
.avatar-faq-widget {
  position: fixed;
  right: 24px;
  bottom: 24px;
  z-index: 80; /* below .mobile-overlay (100), above page content */
}
```

## Shared Patterns

### sessionStorage vs localStorage tier distinction
**Source:** `src/treasure.jsx:6-7` (`TREASURE_PROGRESS_KEY` in `sessionStorage`, `TREASURE_COMPLETED_KEY` in `localStorage`) and `src/perks.jsx:6` (`PERK_FOUND_KEY` in `localStorage`)
**Apply to:** `avatarFaq.jsx`'s intro-played-once flag — use `sessionStorage` (session-scoped, resets per browser session — matches "once per homepage visit" semantics of AVATAR-06, not permanent like the perk/treasure completion flags).

### Cross-component signal via `window.dispatchEvent(new CustomEvent(...))`
**Source:** `src/treasure.jsx:9,32,36-44` (`TREASURE_EVENT` pattern)
**Apply to:** `avatarFaq.jsx` (listening) and `components.jsx`'s `Nav` (dispatching) for the mobile-nav-open → video-pause signal (Pitfall F). This is the only existing precedent in the codebase for this kind of unrelated-sibling-component signal — reuse verbatim, do not introduce Context or a new global store.

### Portal-to-`document.body` to escape `.page-fade`'s transform-animation containing block
**Source:** `src/pages.jsx:536-543` (`Reader` component's `createPortal` call + inline rationale comment)
**Apply to:** `avatarFaq.jsx`'s `AIAvatarFAQ` root render — same bug class (Pitfall G), same fix.

### Single self-contained `.jsx` feature file, mounted as a page sibling
**Source:** `src/treasure.jsx` and `src/perks.jsx` (whole-file convention: one file owns all local state/hooks/subcomponents for one feature, no props threaded through `App`)
**Apply to:** `avatarFaq.jsx` — house `useVideoAvatar`, `AIAvatarFAQ`, `AvatarVideo`, and the interim `FAQCategories`/question-button markup all in this one file, exported via a single named export consumed by `pages.jsx`.

## No Analog Found

| File/Concern | Role | Data Flow | Reason |
|---|---|---|---|
| `useVideoAvatar` reducer + `<video>` DOM-sync effect | hook | event-driven / streaming | This is the first video-playback and first `useReducer`-as-FSM feature in the codebase — no existing reducer or `<video>` element exists anywhere in `src/`. Use RESEARCH.md's Pattern 2 code (fully specified, cross-checked against this repo's own `app.jsx` single-source-of-truth precedent) verbatim as the base; no codebase analog to point to instead. |
| Autoplay `.play()` promise rejection handling | error handling | event-driven | No existing code in this repo calls `.play()`/handles a rejected promise from a media element. Use RESEARCH.md's Pitfall A code example verbatim. |

## Metadata

**Analog search scope:** `src/` (all `.jsx`/`.js` files), `src/styles.css`
**Files scanned:** `theme.js` (full), `treasure.jsx` (full), `perks.jsx` (full), `pages.jsx` (targeted: imports, `HomePage`, `Reader`/portal block), `components.jsx` (targeted: `Nav`'s menu state block), `styles.css` (targeted: `.page-fade`, `.mobile-overlay`, `.treasure-reveal`, `.reader-backdrop`, z-index grep)
**Pattern extraction date:** 2026-09-05
