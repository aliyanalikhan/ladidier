# Architecture Research

**Domain:** Zero-build client-side React app (CDN React + Babel-standalone) — conversion copy pass + client-only "hidden perk" discovery mechanic
**Researched:** 2026-08-20
**Confidence:** HIGH (grounded directly in the existing codebase; no external ecosystem uncertainty — this is an integration question, not a technology-selection question)

## Standard Architecture

### System Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│  index.html — loads, in order (global, non-module <script> tags):   │
│  React 18 UMD → ReactDOM UMD → Babel standalone →                   │
│  tweaks-panel.jsx → ornaments.jsx → [NEW] perks.jsx →                │
│  components.jsx → pages.jsx → app.jsx                                │
├─────────────────────────────────────────────────────────────────────┤
│                         app.jsx (App shell)                          │
│  ┌───────────┐  hash router   ┌────────────────────────────────┐    │
│  │  Tweaks   │◄──state (t)───►│  route switch → Page component  │    │
│  │  Panel    │                │  isSubscribed (App-level state, │    │
│  └───────────┘                │  localStorage: ladidier_subscribed)│  │
│                                └────────────────────────────────┘    │
│  <Nav/> (every route) · <main>{page}</main> · <Footer/> (every route)│
├─────────────────────────────────────────────────────────────────────┤
│  pages.jsx           components.jsx        [NEW] perks.jsx           │
│  HomePage            Nav / MobileNav        HiddenPerk (mark+modal)  │
│  MagazinePage         Footer  ← integration usePerkFound() hook      │
│  StoresPage           StoreMarquee          PERK_CODE (static const) │
│  SubscribePage        MagazineCover                                  │
│  ArticlePage, AboutPage                                              │
├─────────────────────────────────────────────────────────────────────┤
│  ornaments.jsx (pure decorative, stateless-except-animation)         │
│  Laurel · Flourish · DecoCorner · Monogram · VerticalRule · Stagger  │
├─────────────────────────────────────────────────────────────────────┤
│  localStorage (only persistence layer — no backend, no cart/API)     │
│  ladidier_subscribed  ·  [NEW] ladidier_perk_found                   │
└─────────────────────────────────────────────────────────────────────┘
```

### Component Responsibilities

| Component / File | Responsibility | Notes |
|-----------|----------------|------------------------|
| `app.jsx` | Route switch, theme (Tweaks), lifts `isSubscribed` state, renders `Nav`/`Footer` on every route | No changes needed for perks if perk state is self-contained (see Pattern 2) |
| `pages.jsx` | Page-level content/copy, page-specific layout (HomePage, StoresPage, MagazinePage, SubscribePage) | Copy/CTA rework happens entirely here — no structural change needed |
| `components.jsx` | Shared, stateful, cross-page UI: `Nav`, `MobileNav`, `Footer`, `StoreMarquee`, `MagazineCover`, catalog data (`STORES`, `ISSUE`, `STORIES`) | `Footer` is the one component guaranteed to render on **every** route (rendered by `app.jsx` outside the route switch) — the natural sitewide hook point |
| `ornaments.jsx` | Pure decorative SVG/animation primitives, no state, no localStorage, no business logic | Do not add perk state/logic here — keep it strictly visual vocabulary |
| **`perks.jsx` (new)** | Owns the entire hidden-perk feature: storage key, static code constant, `usePerkFound()` hook, the trigger mark, and the reveal panel | Mirrors how `ornaments.jsx`/`components.jsx`/`tweaks-panel.jsx` are each a self-contained global-scope file exporting via `Object.assign(window, {...})` |
| `styles.css` | Single stylesheet; `.paywall-gate` (gold-border/cream-bg card), `.ornament-divider`, `.mobile-overlay` (`z-index:100`), `.twk-panel` (`z-index:2147483646`) already establish the visual/z-index vocabulary to reuse | New perk-reveal panel should reuse `.paywall-gate` styling conventions, not invent a new visual language |

## Recommended Project Structure

No folder restructuring — the project is intentionally flat (no `src/`, no bundler, no modules). Add one file at the repo root, alongside the existing four, and one new `<script>` tag in the HTML shell(s):

```
Ladidier/
├── tweaks-panel.jsx     # unchanged
├── ornaments.jsx        # unchanged — do not touch for this milestone
├── perks.jsx            # NEW — hidden-perk feature (state, trigger, reveal UI)
├── components.jsx       # ONE new line: <HiddenPerk /> inside <Footer>
├── pages.jsx            # copy/CTA edits only (Home/Stores/Magazine functions)
├── app.jsx              # unchanged (no prop threading needed — see Pattern 2)
├── styles.css           # append perk-mark + perk-reveal rules; reuse .paywall-gate pattern
├── Ladidier Portal.html # add <script type="text/babel" src="perks.jsx"></script>
└── Ladidier Portal-print.html # ALSO needs the script tag — confirmed below
```

### Structure Rationale

- **New file, not a new folder:** the project has zero build tooling — every `.jsx` file is a `<script type="text/babel">` tag evaluated in global scope. Adding a folder would break nothing technically, but it would be inconsistent with the existing flat, five-file convention and would need path updates in two HTML entry files for no benefit.
- **`perks.jsx` sits between `ornaments.jsx` and `components.jsx` in load order** because: it may reuse ornament primitives (e.g., borrowing the `Laurel` berry-dot visual language for the trigger mark) — so it must load *after* `ornaments.jsx` — and it is consumed by `components.jsx` (`Footer`) — so it must load *before* `components.jsx`. Load order only matters here for readability/consistency; because these are plain global scripts (not ES modules) and all component functions are invoked later at render time (after all five files have finished evaluating and `ReactDOM.createRoot(...).render(<App/>)` runs at the very end of `app.jsx`), a perk component technically works regardless of exact position as long as it loads before `app.jsx`. Still, follow the dependency-order convention already established (`ornaments` → `components` → `pages` → `app`) rather than relying on that leniency.
- **Not inside `ornaments.jsx`:** ornaments.jsx has zero business logic and zero localStorage today — every export is a pure, stateless (or purely-animation-state) SVG component. Hidden perks need localStorage persistence, a reveal modal, conditional copy branching on subscription status, and click handling — a fundamentally different responsibility (feature logic + UI) than "decorative visual vocabulary." Folding it in would blur that boundary and make `ornaments.jsx` (loaded first, used everywhere including Hero variants, About page, MagazineCover) the wrong place to reason about a discovery mechanic's state machine.
- **Not inside `components.jsx` or `pages.jsx`:** both files are already sizeable (423 and 953 lines respectively) and have clear existing identities (shared chrome; page content). A milestone-scoped feature like this benefits from being isolated in its own file — smaller diff footprint, easy to find/remove/toggle off later, and it keeps the "one discovery mechanic, not a system" constraint physically visible as one file.

## Architectural Patterns

### Pattern 1: Self-contained feature file with a single sitewide mount point

**What:** `perks.jsx` exports one composite component, `<HiddenPerk />`, that internally bundles the trigger mark + the reveal panel + its own hook. The rest of the app only needs **one line** added: `<HiddenPerk />` inside `Footer` in `components.jsx`.
**When to use:** Exactly this case — a feature that must have minimal blast radius, needs no coordination with routing, and must not visibly disturb any existing page.
**Trade-offs:** Extremely low integration risk (one call site). Slight trade-off: if a second placement is wanted later (e.g., also inside the Home hero), that's a one-line addition per page, not a refactor — the component takes no required props.

**Why `Footer` specifically:** `app.jsx` renders `<Footer setRoute={go} />` *outside* the route switch (line 88), so it mounts on **every** route already — Home, Stores, Magazine, Subscribe, Article, About — with zero new plumbing. This satisfies "elements placed around the site" without needing per-page wiring, and keeps the trigger present even if a future milestone wants it discoverable from a page outside this milestone's Home/Stores/Magazine copy scope.

**Example:**
```jsx
// components.jsx — inside Footer(), near the existing (currently no-op) <Crest/> + wordmark:
<div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 18 }}>
  <Crest size={26} />
  <div className="display" style={{ fontSize: 28, fontWeight: 300 }}>LaDidiér</div>
  <HiddenPerk />
</div>
```

Note: `Crest()` currently `return`s `null` in six call sites across `components.jsx`/`pages.jsx` (Footer, all three Home hero variants, About page). It is tempting to repurpose it as the perk's visual host since it's already "reserved" real estate — **do not**. `Crest` is called from six different contexts with six different sizes/colors and no clear owner intent; overloading a shared, multiply-instantiated placeholder with click/localStorage/modal logic would make the trigger appear (invisibly, since it renders nothing) in unrelated places like the About page and every hero variant, which is unpredictable and hard to reason about. Keep `Crest` untouched and give the perk its own dedicated, single-instance component instead.

### Pattern 2: Self-contained state, not lifted to App

**What:** Unlike `isSubscribed` (lifted to `app.jsx` state because three different pages — Home, Magazine, Subscribe — must all read *and* the Magazine paywall must react to it), perk-found state has exactly one owner: the `HiddenPerk` component itself. Use a local hook (`usePerkFound`) defined and consumed entirely inside `perks.jsx`.
**When to use:** When a piece of state has a single consumer and no other component needs to branch on it. This avoids widening `App`'s or any page component's prop signature — a real constraint here since the milestone's "no breaking changes" requirement explicitly protects existing routing/prop contracts.
**Trade-offs:** If a later milestone wants e.g. a Nav badge for "perk found," the flag would need to be lifted then — acceptable, since that's explicitly out of scope now ("one working discovery mechanic," not a gamified system with persistent UI indicators).

**Example:**
```jsx
// perks.jsx
const PERK_FOUND_KEY = "ladidier_perk_found"; // same naming convention as ladidier_subscribed
const PERK_CODE = "HOUSE10"; // static, display-only — see Pattern 3

function usePerkFound() {
  const [found, setFound] = useState(() => localStorage.getItem(PERK_FOUND_KEY) === "true");
  const markFound = () => {
    localStorage.setItem(PERK_FOUND_KEY, "true");
    setFound(true);
  };
  return { found, markFound };
}
```

The one place `perks.jsx` legitimately *reads* (never writes) app-level state is the existing `ladidier_subscribed` key, to decide reveal-panel content (see Data Flow below). This is a read-only cross-feature dependency via the same localStorage key `app.jsx`/`pages.jsx` already write to — no prop threading required, and no risk of the perk feature ever touching subscription state.

### Pattern 3: Display-only discount code — no validation logic, ever

**What:** The discount code is a hardcoded string constant shown to the user on discovery, persisted so repeat visits show the *same* code (not regenerated), with zero validation, expiry-checking, or "redemption" logic against anything.
**When to use:** Any time a static/client-only site wants to represent a discount code with no backend or cart to enforce it against.
**Trade-offs:** None of the usual code-validation trade-offs apply, because there is nothing to validate against. See Anti-Pattern 1 below for why building fake validation is actively harmful.

**Example:**
```jsx
// perks.jsx — reveal content branches on the *existing* subscribe flag, read-only
function PerkReveal({ onClose }) {
  const isSubscribed = localStorage.getItem("ladidier_subscribed") === "true";
  return (
    <div className="paywall-gate" style={{ /* reuse existing gold-border/cream-bg treatment */ }}>
      <div className="eyebrow">A House Secret</div>
      <h3>Your code: <span className="gold-text mono">{PERK_CODE}</span></h3>
      <p>Present this at any Ladidiér house — online or in person.</p>
      {!isSubscribed && (
        <button className="btn solid" onClick={() => { onClose(); location.hash = "subscribe"; }}>
          Also unlock the Sunday letter →
        </button>
      )}
      <button className="btn ghost" onClick={onClose}>Close</button>
    </div>
  );
}
```

## Data Flow

### Perk Discovery Flow

```
User clicks HiddenPerk mark (Footer, any route)
    ↓
usePerkFound().markFound()
    ↓                                      ↓
localStorage.setItem                  setFound(true) → re-render
("ladidier_perk_found","true")             ↓
                                       PerkReveal panel opens (position: fixed,
                                       styled like .paywall-gate, z-index between
                                       .mobile-overlay [100] and .twk-panel [2147483646] —
                                       e.g. 500)
                                            ↓
                              reads localStorage.getItem("ladidier_subscribed")
                              (read-only; existing key owned by app.jsx/pages.jsx)
                                            ↓
                         isSubscribed=true → show code only
                         isSubscribed=false → show code + "Subscribe" CTA → #subscribe route
```

### Key Data Flows

1. **Perk found state:** One-directional, one-owner. `HiddenPerk` writes `ladidier_perk_found`; nothing else in the app reads or writes that key. On return visits, `usePerkFound()`'s lazy `useState` initializer reads it once at mount, so a user who already found the perk can see it reflected immediately (e.g., a small "already found" visual state on the mark, optional) without any cross-file coordination.
2. **Subscription cross-read:** `perks.jsx` reads (never writes) the pre-existing `ladidier_subscribed` key that `app.jsx` (line 50) and `pages.jsx` (lines 481, 766) already own, purely to decide reveal-panel copy. This is the *only* coupling point between the new feature and existing state, and it's read-only — zero risk of the perk feature corrupting the subscribe flow.
3. **Copy/CTA changes:** Pure JSX/text edits inside `pages.jsx` functions (`HomePage`, `StoresPage`, `MagazinePage`, and shared `SubscribeBanner`). No new state, no new files. Independent of the perk data flow entirely — these two workstreams don't share files except that `SubscribeBanner`'s copy tone should stay consistent with whatever `PerkReveal` says (soft coordination, not code coupling).

## Scaling Considerations

Not applicable in the traditional sense — this is a static site with no backend, no user accounts, and no traffic-driven bottlenecks to plan around. The only "scale" axis that matters is feature scope creep:

| Scale | Architecture Adjustments |
|-------|--------------------------|
| Single perk, single code (this milestone) | `perks.jsx` as designed: one constant, one hook, one mount point |
| Multiple perks / seasonal rotation (explicitly out of scope) | Would need an array of `{id, code, foundKey}` and a small registry — still no backend required, still localStorage, but `usePerkFound` would need to become `usePerksState(id)`. Do not build this now — YAGNI, and PROJECT.md explicitly excludes it |
| Real redemption / inventory-aware codes | Would require an actual backend and checkout integration on each of the 14 independently-hosted stores (`STORES[].url` — all external domains, not part of this codebase) — a different project entirely, not a "phase" of this one |

### Scaling Priorities

1. **Not a concern this milestone.** The single biggest risk is scope creep toward a "real" coupon system — resist it; PROJECT.md's Out of Scope section already forbids backend/API work and gamified multi-perk systems.

## Anti-Patterns

### Anti-Pattern 1: Building fake "validation" for the discount code

**What people do:** Add client-side logic that pretends to check the code — expiry countdowns tied to fake state, a "redeem" button that shows a fake success/error, regex validation on a code re-entry field, or a simulated "already used" check.
**Why it's wrong:** There is no cart, checkout, or order system anywhere in this codebase — `STORES[].url` sends users to 14 separate, independently-run external stores (their own domains, their own platforms). This portal has no authority to validate or redeem anything. Fake validation UI would actively mislead users into thinking the code is being checked against something real, when it categorically cannot be (no backend, explicitly out of scope per PROJECT.md). It also adds meaningless complexity and testing surface for zero benefit.
**Do this instead:** A single static, display-only code (Pattern 3). Optionally, phrase the reveal copy honestly as a house-wide code to "present" or "mention" at any store, rather than implying an automated checkout discount.

### Anti-Pattern 2: Prop-drilling perk state through `App` → route switch → every page

**What people do:** Lift perk state to `app.jsx` (mirroring `isSubscribed`) and pass `perkFound`/`setPerkFound` into every page component "for consistency," even though only one component (the trigger/reveal) ever needs it.
**Why it's wrong:** Widens `app.jsx`'s route-switch prop signatures (lines 76-81) for no functional benefit, increases the diff surface against the "no breaking changes to existing routing" constraint, and couples an isolated feature to the app shell unnecessarily.
**Do this instead:** Self-contained hook inside `perks.jsx` (Pattern 2). Only lift state later if a genuine second consumer emerges.

### Anti-Pattern 3: Repurposing the existing no-op `Crest` component as the trigger

**What people do:** Notice `Crest()` already returns `null` and is called in six places, and "activate" it as the hidden perk to save writing a new component.
**Why it's wrong:** `Crest` is invoked with six different sizes/colors across unrelated contexts (Footer, three Home hero variants, About page) with no documented single intent. Giving it click/localStorage/modal behavior would make the perk trigger silently appear in all six places at once, including the About/hero-variant pages this milestone doesn't touch for copy — unpredictable and hard to review or roll back as one clean feature.
**Do this instead:** A dedicated, single-instance `<HiddenPerk />` component mounted once in `Footer` (Pattern 1). Leave `Crest` exactly as-is.

## Integration Points

### External Services

| Service | Integration Pattern | Notes |
|---------|---------------------|-------|
| None (by design) | — | PROJECT.md explicitly puts "Backend/API integration" out of scope; the 14 store URLs (`STORES[].url` in `components.jsx`) are plain outbound links (`window.open(url, "_blank")` in `StoresPage`), not API integrations |

### Internal Boundaries

| Boundary | Communication | Notes |
|----------|---------------|-------|
| `perks.jsx` ↔ `components.jsx` (`Footer`) | Direct JSX mount: `<HiddenPerk />` | One-line integration point; no props required in either direction |
| `perks.jsx` ↔ `app.jsx` / `pages.jsx` (subscribe flow) | Read-only `localStorage.getItem("ladidier_subscribed")` | No prop threading; perk feature never writes this key |
| `perks.jsx` ↔ `ornaments.jsx` | Perk mark may visually reuse ornament primitives (e.g., a small gold dot in the `Laurel`/`DecoCorner` visual language) | Load-order dependency only (`perks.jsx` after `ornaments.jsx`); no behavioral coupling |
| Copy/CTA edits ↔ `pages.jsx` | Direct in-place JSX/text edits to `HomePage`, `StoresPage`, `MagazinePage`, `SubscribeBanner` | No new components required; `Nav`'s existing "Shop"-style CTAs in `components.jsx` are untouched unless the milestone explicitly calls for a Nav copy change |
| HTML entry points | Both `Ladidier Portal.html` (loads `app.jsx`) and `Ladidier Portal-print.html` (loads `print-app.jsx`) need the new `<script type="text/babel" src="perks.jsx"></script>` tag inserted between the existing `ornaments.jsx` and `components.jsx` tags | Confirmed: `print-app.jsx` (`PrintApp`) renders `<Footer setRoute={noop} />` (line 66) to produce a stacked, print-all-pages snapshot of every route for PDF/print export. If `<HiddenPerk />` is added inside `Footer` but `perks.jsx` is only added to `Ladidier Portal.html`, `Ladidier Portal-print.html` will throw a `ReferenceError: HiddenPerk is not defined` at render time and the entire print snapshot will fail to render. Both HTML files must get the script tag. (The perk trigger being clickable inside a print snapshot is harmless/irrelevant — this is an internal print-export utility, not a real user path — but the missing reference is a hard crash, not a cosmetic issue.) |

## Suggested Build Order

1. **Copy/CTA rework first** (Home, Stores, Magazine in `pages.jsx`, plus `SubscribeBanner`). Zero new files, zero new state — pure content editing on the existing component tree. Establishes final "shopping mall" tone and finalized CTA wording.
2. **Hidden perk feature second** (`perks.jsx` + one-line `Footer` integration + HTML script tag + CSS additions reusing `.paywall-gate`). Sequenced after copy so the reveal panel's tone/CTA phrasing (e.g., "Shop Now"-style verbs, subscribe CTA wording) matches whatever the copy pass lands on, rather than needing a second editing pass. Fully independent technically — could be built in parallel — but sequencing this way avoids rework and keeps each phase's diff reviewable in isolation (copy-only PR, then feature-only PR).

Rationale for this order over the reverse: the perk reveal panel's subscribe-upsell copy is explicitly meant to echo the site's conversion voice ("surfaces a discount code or a magazine-subscribe prompt") — building it before the tone is finalized risks a second copy pass on the modal.

## Sources

- Direct codebase inspection (HIGH confidence, primary source): `/Users/aech/Documents/Ladidier/app.jsx`, `components.jsx`, `ornaments.jsx`, `pages.jsx`, `tweaks-panel.jsx`, `styles.css`, `Ladidier Portal.html`, `.planning/PROJECT.md`
- No external ecosystem research was needed — this is a pure integration-architecture question answered entirely from the existing, already-shipped codebase conventions (script load order, `Object.assign(window, {...})` export pattern, `ladidier_subscribed` localStorage precedent, `.paywall-gate`/`.mobile-overlay` z-index and styling conventions)

---
*Architecture research for: Zero-build client-side React conversion pass + hidden-perk discovery mechanic (LaDidiér Portal v1.1)*
*Researched: 2026-08-20*
