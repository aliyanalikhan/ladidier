# Phase 5: Hidden Perks Discovery Feature - Research

**Researched:** 2026-08-21
**Domain:** Zero-build client-side React (CDN React 18 + Babel-standalone) — single self-contained discovery-mechanic feature file, integrated at one mount point
**Confidence:** HIGH — this is a narrow, integration-only follow-up pass on top of existing milestone-level research (`ARCHITECTURE.md`, `FEATURES.md`, `PITFALLS.md`), grounded directly in current file contents read in this session (not training-data assumptions)

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

### Trigger look & placement
- **D-01:** The trigger lives in the `Footer` wordmark row, next to the existing `<Crest size={26} />` + "LaDidiér" wordmark — the same row shown in the architecture research's example (`components.jsx`, inside `Footer()`, the `display:flex` div containing `Crest` + the "LaDidiér" display text). Do **not** repurpose `Crest` itself (it renders in 6 unrelated places) — the perk gets its own dedicated element mounted alongside it, per the research's Anti-Pattern 3 warning.
- **D-02:** The mark itself is a tiny decorative flourish glyph (e.g. a small diamond/asterisk-style character, not a plain dot) in the site's gold/muted palette — ornamental enough to look like a stray typographic detail, small enough to overlook at a glance.

### Reveal panel style
- **D-03:** Activating the trigger opens a small floating panel, fixed-position, anchored near the Footer wordmark — not a full modal, not an inline-expand that shifts Footer layout. Style it like the existing `.paywall-gate` (gold border, cream background) per the architecture research, at a z-index between `.mobile-overlay` (100) and `.twk-panel` (2147483646) — e.g. ~500.
- **D-04:** The panel does **not** auto-dismiss. It stays open until the user explicitly closes it (a "Close" button, consistent with `PerkReveal`'s example in the architecture research) or clicks outside it. No countdown/auto-fade — matches the research's guidance against urgency/countdown tactics.

### Discount code & framing
- **D-05:** The code is framed as tied to the current issue ("this issue," referencing the existing `Vol. I N°03` framing already used in `Footer`'s `.foot-base` line) rather than a generic sitewide/standing code — reuses the site's existing quarterly-issue cadence as the soft scarcity device, per FEATURES.md's "Scarcity/exclusivity microcopy" guidance and PITFALLS.md Pitfall 5.
- **D-06:** The code value is the static string `HOUSE10` — matches the established house vocabulary ("House of Houses") from Phase 4's CTA voice work. Hardcoded constant, no validation logic (per architecture research Pattern 3 / Anti-Pattern 1 — this is explicitly a display-only string, never a "redeem"/"check" flow).
- **D-07:** Reveal copy explicitly uses honest "present/mention this" phrasing (e.g. "Present this at any Ladidiér house") rather than implying automated cart/checkout validation — per PITFALLS.md Pitfall 5 (the code is visible via View Source regardless of UI hiding, since there's no backend; copy must not claim enforcement the static architecture can't back up — no "one per visitor," no "limited to first N finders").

### Subscribe-path copy
- **D-08:** For unsubscribed visitors, the reveal panel includes one additional CTA reading **"Also unlock the Sunday letter →"**, which closes the panel and routes to `#subscribe` (matches the architecture research's `PerkReveal` example exactly). This is elevated/editorial voice, consistent with Phase 4's D-01 CTA-voice decision — not "Subscribe Now" or generic ecommerce phrasing.
- **D-09:** The reveal branches on the existing `ladidier_subscribed` localStorage flag, read-only: subscribed visitors see the code only (no subscribe CTA); unsubscribed visitors see the code plus the D-08 CTA. Per PITFALLS.md Pitfall 6 — never show a subscribe prompt to an already-subscribed visitor, and never introduce a second/parallel "engagement" flag that could drift from `ladidier_subscribed`.

### Claude's Discretion
- Exact pixel sizing/positioning of the floating panel and the trigger glyph, exact gold/muted color values used (reuse existing CSS custom properties `--gold`, `--fg`, `--bg`, `--noir` from `styles.css` — do not introduce new palette values).
- Whether the trigger glyph is inline SVG or a styled text character — either is acceptable as long as it visually reads as a quiet flourish, not an obvious button.
- The exact "found" persistence behavior on repeat visits (per PITFALLS.md Pitfall 7: persist a `ladidier_perk_found` flag on first activation, suppress any reveal-triggering animation on subsequent visits, but keep the trigger element itself present and clickable — do not hide the feature after first find). Manual QA reset path: clearing the `ladidier_perk_found` localStorage key.
- Mobile/touch and keyboard-focus implementation details for the trigger (must satisfy PERK-02: reachable via click/tap AND keyboard focus, not hover-only — hover is an optional bonus desktop affordance layered on top, per PITFALLS.md Pitfall 3). Concrete accessibility mechanics (tabindex, focus-visible styling, aria attributes) are left to planning/implementation.
- Exact copy wording beyond the two locked strings (D-06's code, D-08's CTA) — headline/eyebrow text, exact "present this" sentence — should be drafted in the elevated-editorial voice established in Phase 4 and does not need a further user round-trip unless ambiguous.

### Deferred Ideas (OUT OF SCOPE)
None — discussion stayed within phase scope. (Return-visit/dwell-time-gated perk variant and copy-to-clipboard button are already tracked at the milestone level as v2 requirements `PERK-07`/`PERK-08` in `.planning/REQUIREMENTS.md` — not re-raised here since they're out of scope for this phase by design.)
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-------------------|
| PERK-01 | A single hidden-perk discovery element exists on the site (e.g. in the Footer), styled to match existing ornament/typography language | Pattern 1 (verified `Footer` wordmark-row mount point, lines 307-310) + Pattern 2 (reusable `✦`/`Flourish`-diamond glyph precedent) |
| PERK-02 | The hidden perk is reachable via click/tap (not hover-only) and via keyboard focus, so it works on touch devices and for keyboard users | Pattern 4 (verified `:focus-visible` convention at styles.css:480-483, 623-626) + Don't Hand-Roll (native `<button>` recommendation) |
| PERK-03 | The hidden perk has no visual signposting, nav entry, or onboarding tooltip pointing to it — genuinely easy to miss | Inherited from PITFALLS.md Pitfall 4 (discoverability paradox); Validation Architecture cold-read test defined below |
| PERK-04 | Activating the hidden perk reveals a static, display-only discount code | Pattern 3 (`usePerkFound()`/reveal state) + Code Examples section (`PERK_CODE` constant) |
| PERK-05 | The perk reveal branches on the existing `ladidier_subscribed` flag — subscribed users see the code only, unsubscribed users also see a subscribe-flow prompt | Verified `ladidier_subscribed` read/write sites (app.jsx:50, pages.jsx:487,772) + Pattern 1 (`setRoute` routing for the CTA) |
| PERK-06 | The hidden perk does not block, overlay-trap, or interrupt normal browsing/shopping flow | Pattern 3 (explicit non-focus-trap guidance, contrasted with `MobileNav`'s modal pattern) + Pattern 5 (non-blocking floating panel sizing) |
</phase_requirements>

## Summary

Phase 5 adds exactly one new file, `perks.jsx`, plus a one-line integration into the existing `Footer` component and a one-line `<script>` addition in **both** HTML entry files. CONTEXT.md (D-01 through D-09) has already locked every major implementation choice — trigger placement, glyph style, panel style, close behavior, code value, and subscribe-CTA copy. This research does not re-litigate those; it verifies the exact current line numbers, CSS custom properties, z-index vocabulary, and accessibility patterns already established in the codebase so the planner can write tasks against concrete, current code rather than the milestone research's now-slightly-stale line numbers (Phase 4's copy pass shifted `pages.jsx` by ~6 lines since the milestone research was written).

Three things changed since the milestone-level research was written that the planner needs to know: (1) `ladidier_subscribed` write sites in `pages.jsx` are now at **lines 487 and 772** (not 481/766 as `ARCHITECTURE.md` states — Phase 4 edits shifted them); (2) the codebase already has a directly reusable glyph precedent for D-02's "flourish glyph" — the existing `.lock-icon` on `.paywall-gate` uses the literal character `✦`, and `ornaments.jsx`'s `Flourish` component is an SVG "diamond" shape — either is a closer-to-zero-new-design-language choice than inventing a new glyph; (3) `Footer` already receives a `setRoute` prop (aliased from `app.jsx`'s `go` function) and every other Footer link uses `setRoute("slug")` rather than `location.hash =`, which is a more consistent navigation mechanism for D-08's subscribe CTA than the milestone research's literal `location.hash = "subscribe"` example.

**Primary recommendation:** Build `perks.jsx` exactly as `ARCHITECTURE.md` Pattern 1–3 describe (self-contained file, `usePerkFound()` hook, single `<HiddenPerk />` mount in `Footer`'s wordmark row), but (a) use the corrected `pages.jsx` line numbers below when auditing `ladidier_subscribed` write sites, (b) reuse the `✦` glyph or a scaled-down `Flourish` diamond for the D-02 trigger mark rather than designing a new icon, (c) thread `Footer`'s existing `setRoute` prop into `<HiddenPerk setRoute={setRoute} />` for the D-08 CTA instead of raw `location.hash`, and (d) mirror `MobileNav`'s `Escape`-key-close `useEffect` pattern (components.jsx:176-181) for the panel's explicit-close behavior, but explicitly do **not** mirror its focus-trap (components.jsx:184-207) — PERK-06 requires the panel to never trap focus or block browsing.

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Trigger mark (glyph, click/tap/focus target) | Browser / Client (React component) | — | Pure client-side UI; no server exists in this architecture |
| Reveal panel (code + copy + subscribe CTA) | Browser / Client (React component) | — | Same — static JSX, no data fetching |
| "Found" persistence (`ladidier_perk_found`) | Browser / Client (`localStorage`) | — | Mirrors existing `ladidier_subscribed` pattern; this static site has no other persistence layer |
| Subscribe-flag read (`ladidier_subscribed`) | Browser / Client (`localStorage`, read-only) | — | Already owned/written by `app.jsx`/`pages.jsx`; perks.jsx must only read it |
| Discount code value | Browser / Client (hardcoded constant) | — | No backend exists (explicitly out of scope) — code is a static string shipped in the JS bundle, not a secret |
| Routing to `#subscribe` on CTA click | Browser / Client (hash router in `app.jsx`) | — | Existing `go()`/`setRoute` hash-routing mechanism; no new routing concept needed |

## Standard Stack

No new dependencies. This is a zero-build project (React 18 UMD + ReactDOM UMD + `@babel/standalone`, all loaded via `<script>` tags, no npm/bundler). `perks.jsx` must follow the exact same convention as `ornaments.jsx`, `components.jsx`, and `tweaks-panel.jsx`: a global-scope `<script type="text/babel">` file, ending in `Object.assign(window, {...})` to expose its exports.

**Installation:** None required — no `npm install` step exists or is needed for this phase.

**Version verification:** N/A (no package registry involved; versions are pinned in the HTML `<script src="https://unpkg.com/...">` tags and are unrelated to this phase's scope).

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| New `perks.jsx` file (locked by CONTEXT.md `<domain>`) | Adding `HiddenPerk` inside `components.jsx` | Rejected by ARCHITECTURE.md Anti-Pattern reasoning — `components.jsx` is already 423 lines with a clear "shared chrome" identity; folding in a stateful discovery feature blurs that boundary and increases the diff footprint for a milestone-scoped, easily-removable feature |

## Architecture Patterns

### System Architecture Diagram

```
Ladidier Portal.html / Ladidier Portal-print.html
  React UMD → ReactDOM UMD → Babel standalone
  → tweaks-panel.jsx → ornaments.jsx → [NEW] perks.jsx → components.jsx → pages.jsx → app.jsx (or print-app.jsx)
                                              │
                                              ▼
                                    exports <HiddenPerk />
                                    (Object.assign(window, {...}))
                                              │
                                              ▼
components.jsx: Footer({ setRoute })
  wordmark row (flex div, line 307-310)
  <Crest size={26}/> + "LaDidiér" text + [NEW] <HiddenPerk setRoute={setRoute} />
                                              │
                     user clicks/taps/keyboard-activates trigger
                                              ▼
                              usePerkFound().markFound()
                    localStorage.setItem("ladidier_perk_found","true")
                                              │
                                              ▼
                    <PerkReveal> opens — position:fixed, z-index ~500,
                    styled from .paywall-gate, anchored near Footer wordmark
                                              │
                    reads localStorage.getItem("ladidier_subscribed")  [READ-ONLY]
                          (owned by app.jsx:50 / pages.jsx:487,772)
                              │                              │
                    isSubscribed === "true"          isSubscribed !== "true"
                    → show code only                 → show code + "Also unlock
                                                         the Sunday letter →" CTA
                                                              │
                                                    onClick: close panel,
                                                    setRoute("subscribe")
                                                    (Footer's existing prop,
                                                     not location.hash)
```

### Recommended Project Structure

No folder changes — confirmed flat, five-file convention (now six with `perks.jsx`):

```
Ladidier/
├── tweaks-panel.jsx      # unchanged
├── ornaments.jsx         # unchanged — Flourish diamond usable as visual reference only
├── perks.jsx             # NEW — HiddenPerk, usePerkFound(), PERK_CODE constant, PerkReveal panel
├── components.jsx        # ONE new line inside Footer's wordmark row (line 307-310 today)
├── pages.jsx             # unchanged for this phase (no copy/CTA work — that was Phase 4)
├── app.jsx               # unchanged — Footer already receives setRoute (line 88)
├── styles.css            # append .perk-mark / .perk-reveal rules; reuse --gold/--fg/--bg/--noir + .paywall-gate conventions
├── Ladidier Portal.html  # add <script type="text/babel" src="perks.jsx"></script> between ornaments.jsx (line 21) and components.jsx (line 22)
└── Ladidier Portal-print.html # SAME script tag needed between ornaments.jsx (line 87) and components.jsx (line 88) — confirmed required, see Pitfall section
```

### Pattern 1 (verified): `Footer` currently receives `setRoute`, and sibling links use it — not `location.hash`

**What:** `app.jsx` line 88 renders `<Footer setRoute={go} />`. Inside `Footer` (components.jsx:303), every internal nav link uses the pattern `onClick={(e) => { e.preventDefault(); setRoute("slug"); }}` (see lines 323-325 for "Universe"/"Stores"/"Magazine"). There is no `location.hash =` usage anywhere in `components.jsx` or `pages.jsx` for internal navigation — `app.jsx`'s hash-listener (`fromHash`, lines 55-63) exists only to catch *external* hash changes (back/forward, manual URL edit), not as the primary navigation mechanism.

**When to use:** For D-08's subscribe CTA (`onClose(); route to #subscribe`), thread `Footer`'s existing `setRoute` prop into `<HiddenPerk setRoute={setRoute} />` and call `setRoute("subscribe")` on click, exactly mirroring the three sibling links already in `Footer`.

**Trade-off vs. milestone research's `location.hash = "subscribe"` example (ARCHITECTURE.md Pattern 3):** Both work — `app.jsx`'s `fromHash()` listener does pick up a direct `location.hash` assignment and will call `setRoute()`. But `location.hash =` bypasses `go()`'s `history.replaceState` + `scrollTo({top:0, behavior:"instant"})` (app.jsx lines 65-69), so the user would land on `#subscribe` without the scroll-to-top behavior every other in-app navigation gets. Threading `setRoute` costs one optional prop and keeps `HiddenPerk`'s navigation behavior indistinguishable from the rest of the site. `[VERIFIED: app.jsx, components.jsx direct inspection]`

**Example (grounded in current code):**
```jsx
// components.jsx — Footer(), wordmark row, current lines 307-310:
<div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 18 }}>
  <Crest size={26} />
  <div className="display" style={{ fontSize: 28, fontWeight: 300 }}>LaDidiér</div>
  <HiddenPerk setRoute={setRoute} />
</div>
```

### Pattern 2 (verified): Reusable glyph precedent already exists for D-02

**What:** `styles.css` line 948-953 defines `.paywall-gate .lock-icon` — used in `pages.jsx` line 474 as `<div className="lock-icon">✦</div>`. This is the exact same "small diamond/asterisk-style character in the gold/muted palette" D-02 asks for, already established as house visual vocabulary. Separately, `ornaments.jsx`'s `Flourish` component (lines 41-54) draws an SVG diamond (`<path d="M105 10 q5 -6 10 0 q5 6 10 0 q-5 -6 -10 0 q-5 6 -10 0 z" fill={color}.../>`) as its central motif.

**When to use:** For D-02's trigger glyph, either (a) reuse the literal `✦` character styled in `--gold`/`--mute` at small size (lowest-effort, already-established vocabulary), or (b) extract/scale a standalone `<svg>` diamond matching `Flourish`'s diamond path if an inline-SVG trigger is preferred (CONTEXT.md leaves inline-SVG-vs-text-character to discretion). Either choice requires **zero new palette values** — reuse `--gold` for the glyph color per CONTEXT.md's discretion note.

**Trade-off:** The `✦` text-character route needs no new SVG markup and matches an existing, already-shipped icon exactly. The `Flourish`-diamond SVG route is marginally more "ornamental" (matches `ornaments.jsx`'s heraldic-illustration vocabulary more precisely) but requires extracting/adapting the SVG path since `Flourish` itself renders a full 240px-wide divider, not a standalone small mark. `[VERIFIED: styles.css:948-953, pages.jsx:474, ornaments.jsx:41-54]`

### Pattern 3 (verified): Mirror `MobileNav`'s Escape-close pattern, explicitly skip its focus-trap

**What:** `MobileNav` (components.jsx:166-224) already implements: scroll-lock via `useEffect` (170-174), Escape-key close via `document.addEventListener("keydown", ...)` (176-181), and a full focus-trap (184-207) that cycles Tab/Shift+Tab within the overlay and returns focus to the trigger on unmount.

**When to use for the perk panel:** Reuse the **Escape-key-close** `useEffect` shape (D-04 says the panel closes via explicit "Close" button or outside click — Escape is a reasonable third option consistent with the site's own modal precedent, though not explicitly required by CONTEXT.md). Do **not** reuse the **focus-trap** — `MobileNav` is a legitimate full-screen modal (`role="dialog"`, `aria-modal="true"`, components.jsx:230-232) that intentionally blocks the rest of the page; the perk panel must satisfy PERK-06 ("does not block, overlay-trap, or interrupt normal browsing/shopping flow") and D-03 ("not a full modal"). A focus-trap would violate this directly — tabbing past the panel's Close button should be allowed to continue into the rest of the page, not wrap back into the panel.

**Trade-off:** Skipping the focus-trap means a keyboard user could technically tab "through" the open panel into page content behind it — this is the *correct* behavior per PERK-06's explicit non-blocking requirement, not an accessibility gap; a fully floating, non-trapped panel with a visible Close button and Escape-to-close is the WCAG-compliant pattern for non-modal disclosure widgets (as opposed to `role="dialog"` modals, which do require a trap). `[VERIFIED: components.jsx:166-224 direct inspection]`

**Example:**
```jsx
// perks.jsx — mirrors components.jsx:176-181's shape, not its focus-trap
useEffect(() => {
  if (!open) return;
  const handler = (e) => { if (e.key === "Escape") close(); };
  document.addEventListener("keydown", handler);
  return () => document.removeEventListener("keydown", handler);
}, [open]);
```

### Pattern 4 (verified): Existing `:focus-visible` convention to mirror for PERK-02

**What:** Two existing interactive elements already establish the site's keyboard-focus styling convention:
- `.nav-hamburger:focus-visible` (styles.css:480-483): `outline: 1px solid var(--gold); outline-offset: 2px;`
- `.mobile-overlay-close:focus-visible` (styles.css:623-626): identical `outline: 1px solid var(--gold); outline-offset: 2px;`

**When to use:** The trigger mark must be a real focusable element (native `<button>` is simplest — gets keyboard `Enter`/`Space` activation for free, no `tabIndex`/`role`/`aria-*` polyfilling needed) styled with this exact same `:focus-visible { outline: 1px solid var(--gold); outline-offset: 2px; }` rule, satisfying PERK-02 and directly avoiding PITFALLS.md Pitfall 3 (hover-only accessibility failure). `:hover` should be layered on top as a bonus desktop-only affordance, never the only trigger path.

**Example:**
```css
/* styles.css — new rules, mirroring existing convention exactly */
.perk-mark { background: none; border: 0; cursor: pointer; color: var(--gold); opacity: .55; transition: opacity .3s ease; }
.perk-mark:hover { opacity: .85; }
.perk-mark:focus-visible { outline: 1px solid var(--gold); outline-offset: 2px; opacity: .85; }
```
`[VERIFIED: styles.css:480-483, 623-626]`

### Pattern 5 (verified): `.paywall-gate` override precedent for a smaller, non-full-width panel

**What:** `.paywall-gate`'s default rules (styles.css:930-941) set `padding: 80px 48px; max-width: 680px; margin: 60px auto;` — sized for a full-page centered block. But the codebase already has a precedent for a **smaller inline override** of the same class: `pages.jsx` line 473 renders `<div className="paywall-gate" style={{ margin: 0, border: "1px solid var(--gold)", background: "var(--cream)", color: "var(--noir)", padding: "48px 32px" }}>` inside a `position: fixed` blur-backdrop overlay (lines ~460-472).

**When to use:** For D-03's "small floating panel ... not a full modal," override `.paywall-gate`'s `padding`/`max-width`/`margin` via inline `style` exactly as `pages.jsx:473` already does, rather than creating a second CSS class or fighting the base rule's `!important`-free but still-restrictive defaults. Add `position: fixed` and a `top`/`right` (or similar) anchor near the Footer wordmark row, plus `z-index: 500` (between `.mobile-overlay`'s `100` at styles.css:575 and `.twk-panel`'s `2147483646`, which is defined inline in `tweaks-panel.jsx` line 50 — not in `styles.css`, so grep `styles.css` alone will not surface it).

**Example:**
```jsx
// perks.jsx — PerkReveal, panel shell
<div className="paywall-gate" style={{
  position: "fixed",
  margin: 0,
  maxWidth: 340,
  padding: "32px 28px",
  zIndex: 500,
  /* anchor near Footer wordmark — exact offset left to implementation */
}}>
  {/* ...content... */}
</div>
```
`[VERIFIED: styles.css:930-941, 572-575; pages.jsx:460-473; tweaks-panel.jsx:50]`

### Anti-Patterns to Avoid

- **Repurposing `Crest`** (components.jsx:85-87, returns `null`, called 6× across `Footer`/hero variants/About): confirmed still a 6-call-site no-op today — `ARCHITECTURE.md` Anti-Pattern 3 still applies exactly as written. Do not touch it.
- **Full modal / focus-trap for the reveal panel:** violates PERK-06 and D-03 directly — see Pattern 3 above.
- **Fake code validation/redemption UI:** `ARCHITECTURE.md` Anti-Pattern 1 still applies — no cart/checkout system exists anywhere in this codebase to validate against (`STORES[].url` are 14 external, independently-hosted domains).
- **New `localStorage` key duplicating `ladidier_subscribed`:** only `ladidier_perk_found` should be new; the perk feature must never write `ladidier_subscribed`.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Keyboard-accessible trigger | Custom `div` + manual `tabIndex`/`role="button"`/`onKeyDown` Enter-Space handling | Native `<button>` element styled to look like a flourish mark | Native `<button>` gets Enter/Space activation, focus behavior, and AT semantics for free — zero custom keyboard-event code needed, directly avoids PITFALLS.md Pitfall 3 |
| Panel dismiss-on-outside-click | Global `mousedown`/`click` listener with manual "is target inside panel" DOM traversal written from scratch | A `useRef` on the panel + a single `document.addEventListener("mousedown", ...)` checking `!panelRef.current.contains(e.target)` — the same idiom already used for `overlayRef`/`closeButtonRef` in `MobileNav` (components.jsx:167-168) | Site already establishes the ref-based pattern; no need to invent a new one or reach for a library |
| Discount code "reveal" persistence | A new bespoke storage abstraction/class | Direct `localStorage.getItem`/`setItem` calls, same as `ladidier_subscribed` and per `ARCHITECTURE.md`'s `usePerkFound()` hook design | Matches existing one-key-per-concern convention; no state library exists or is needed in this project |

**Key insight:** Every piece of this feature has a directly reusable precedent already shipped in this exact codebase (button focus styles, ref-based overlays, localStorage flags, `.paywall-gate` overrides). The implementation task is assembly, not invention — the planner should write tasks that point at these specific existing patterns rather than leaving styling/accessibility mechanics open-ended.

## Common Pitfalls

(PITFALLS.md Pitfalls 3-8 apply directly; below is what's newly confirmed in this session, not a restatement of the full milestone research — read PITFALLS.md in full for complete detail.)

### Pitfall: `pages.jsx` line numbers in milestone research are now stale
**What goes wrong:** `ARCHITECTURE.md` cites `ladidier_subscribed` writes at `pages.jsx` lines 481 and 766. Phase 4's copy edits (committed since that research was written) shifted these to **lines 487 and 772**.
**Why it happens:** Milestone-level research was written before Phase 4 executed; `pages.jsx` grew/shifted during the Magazine copy reframe.
**How to avoid:** Use this document's verified line numbers, or re-grep `ladidier_subscribed` before writing tasks that cite exact lines, since any further edits will shift them again.
**Warning signs:** A task references "pages.jsx:481" and finds unrelated code there.

### Pitfall: `.twk-panel`'s z-index is not in `styles.css`
**What goes wrong:** A planner or implementer greps `styles.css` for `2147483646` (the z-index the perk panel must stay below) and finds nothing, wrongly concluding the constraint doesn't apply or is undocumented.
**Why it happens:** `.twk-panel`'s styles are injected via a JS template-literal string (`__TWEAKS_STYLE` in `tweaks-panel.jsx` line 49-57) into a runtime-created `<style>` tag, not authored directly in `styles.css`.
**How to avoid:** The z-index vocabulary spans two files — `styles.css` (`.mobile-overlay: 100`, line 575) and `tweaks-panel.jsx` (`.twk-panel: 2147483646`, line 50). Both must be checked when picking the perk panel's z-index (~500, per CONTEXT.md D-03).
**Warning signs:** Task verification only checks `styles.css` for z-index conflicts.

### Pitfall: Both HTML files' script tags must be edited in the same task, verified by exact current tag list
**What goes wrong:** `ARCHITECTURE.md` already flags this (missing `perks.jsx` in the print HTML causes `ReferenceError: HiddenPerk is not defined` inside `PrintApp`, which also renders `Footer`). Confirmed still true this session — both files currently load in identical order: `tweaks-panel.jsx → ornaments.jsx → components.jsx → pages.jsx → {app.jsx | print-app.jsx}`.
**How to avoid:** Insert `<script type="text/babel" src="perks.jsx"></script>` between the `ornaments.jsx` and `components.jsx` tags in **both** files — `Ladidier Portal.html` (between current lines 21-22) and `Ladidier Portal-print.html` (between current lines 87-88). One task, two files, verify both in the same commit.
**Warning signs:** `git diff` for this task touches only one HTML file.

### Pitfall: `ladidier_subscribed` is check via `=== "true"`, never `"false"` — no unsubscribe path exists
**What goes wrong:** A perk implementation checks `localStorage.getItem("ladidier_subscribed") === "true"` correctly, but if a future refactor changes the check to something like `!== "false"`, it would silently break, since both existing write sites (pages.jsx:487, 772) only ever write `"true"` — the key is either absent (unsubscribed) or `"true"` (subscribed), never explicitly `"false"`.
**How to avoid:** Mirror the exact `=== "true"` comparison already used in `app.jsx` line 50, not a `!== "false"` inversion.
**Warning signs:** A code review sees `!== "false"` anywhere in the new perk logic.

## Code Examples

### Complete `usePerkFound()` + mount point (verified pattern, current file state)

```jsx
// perks.jsx — follows ARCHITECTURE.md Pattern 2 exactly, verified against current app state
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

  // Outside click — mirrors MobileNav's ref-based approach (components.jsx:167-168),
  // but does NOT focus-trap (PERK-06)
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
      <button
        type="button"
        className="perk-mark"
        aria-label="A house secret"
        onClick={activate}
      >
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
`[VERIFIED: composed from direct codebase inspection of components.jsx, app.jsx, styles.css, tweaks-panel.jsx — cross-checked against ARCHITECTURE.md/PITFALLS.md guidance]`

## State of the Art

| Old (milestone research, 2026-08-20) | Current (verified 2026-08-21) | When Changed | Impact |
|--------------------------------------|-------------------------------|---------------|--------|
| `ladidier_subscribed` writes at `pages.jsx:481, 766` | `pages.jsx:487, 772` | Phase 4 copy edits (commits between 2026-08-20 and 2026-08-21) | Planner must use corrected line numbers when writing verification tasks |
| `PerkReveal` example uses `location.hash = "subscribe"` | `Footer` already threads `setRoute`; sibling links use `setRoute("slug")` | N/A — this was true in the milestone research too, just not called out | Recommend `setRoute` prop-threading over raw `location.hash` for full navigation-behavior consistency (scroll-to-top, `history.replaceState`) |

**Deprecated/outdated:** None — the milestone research's architectural conclusions (file placement, load order, hook design, anti-patterns) remain fully valid; only specific line numbers needed re-verification.

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | Native `<button>` (vs. a styled `<span role="button">`) is the right base element for the trigger mark, satisfying PERK-02 with the least custom code | Don't Hand-Roll | Low — if a design reason emerges to avoid a `<button>`'s default styling reset, the implementer would need to manually add `tabIndex={0}` + `onKeyDown` Enter/Space handling instead; functionally equivalent, more code |
| A2 | `setRoute("subscribe")` (prop-threaded) is preferable to `location.hash = "subscribe"` for D-08's CTA | Pattern 1 | Low — both work correctly per `app.jsx`'s hashchange listener; the only difference is whether the scroll-to-top/replaceState behavior fires. If the planner prefers zero-prop composability (matching `ARCHITECTURE.md`'s "no required props" framing), `location.hash` remains a valid fallback |
| A3 | `z-index: 500` (inherited unmodified from `ARCHITECTURE.md`'s suggestion) is an appropriate value between `.mobile-overlay` (100) and `.twk-panel` (2147483646) | Pattern 5 | Very low — any value in that range works; 500 was not independently re-derived this session, just re-confirmed as still valid given both bounding values are unchanged |

## Open Questions

1. **Exact panel anchor position (top/right offsets) relative to the Footer wordmark**
   - What we know: Panel must be `position: fixed`, small, anchored "near" the Footer wordmark (D-03), not shifting Footer layout.
   - What's unclear: The Footer sits at the bottom of every page; a `position: fixed` panel anchored "near" it needs specific coordinates that work across both desktop and the ≤480px single-column footer layout (styles.css:535) without covering the panel's own trigger or overlapping the Tweaks panel (bottom-right, `.twk-panel`).
   - Recommendation: Leave exact pixel offsets to implementation (already flagged as Claude's Discretion in CONTEXT.md); verify at both desktop and ≤480px widths as part of the phase's done-criteria per Pitfall 8's mobile-regression guidance.

2. **Whether to add `aria-expanded`/`aria-controls` to the trigger button for the panel's open state**
   - What we know: `MobileNav`'s hamburger trigger uses `aria-expanded={menuOpen}` and `aria-controls="mobile-nav-overlay"` (components.jsx:140-141) as the established a11y-attribute convention for disclosure-pattern triggers in this codebase.
   - What's unclear: CONTEXT.md's discretion note only explicitly mentions `tabindex`, `focus-visible`, and `aria attributes` generically, without confirming whether the full `aria-expanded`/`aria-controls` pair (a heavier a11y treatment than a typical tooltip) is proportionate for a "genuinely easy to miss" easter-egg element, vs. a plainer `aria-label` alone (as used in the Code Examples draft above).
   - Recommendation: Mirror the existing `aria-expanded`/`aria-controls` convention for consistency and because it costs nothing extra — but this is a minor implementation detail, not a blocking decision.

## Environment Availability

Skipped — this phase has no external tool/service/runtime dependencies. It is a pure code/CSS addition to an already-running zero-build static site (React/ReactDOM/Babel loaded via existing `<script src="https://unpkg.com/...">` tags, unchanged by this phase).

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | None — no `package.json`, no test runner, no `*.test.*`/`*.spec.*` files exist anywhere in the repo `[VERIFIED: repo file search]` |
| Config file | none |
| Quick run command | Manual browser click-through (established project convention — Phase 4's CTA-07 friction audit was closed via "developer approved live click-through of all CTAs... at desktop and phone width," per `.planning/STATE.md`, not automated tests) |
| Full suite command | N/A |

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Manual Verification Steps | File Exists? |
|--------|----------|-----------|---------------------------|-------------|
| PERK-01 | Single hidden-perk element in Footer, styled to match ornament/typography language, no signposting | manual-only | Load site, visually confirm no nav entry/tooltip/label calls attention to the mark; confirm it uses `--gold`/`--fg` palette only | ❌ Wave 0 (no test infra exists — manual only, consistent with project convention) |
| PERK-02 | Reachable via click/tap AND keyboard focus, not hover-only | manual-only | Tab through Footer with keyboard only (no mouse) — confirm trigger receives visible `:focus-visible` outline and activates on Enter/Space; separately test with touch-emulated devtools/real device | ❌ Wave 0 |
| PERK-03 | No visual signposting, nav entry, or onboarding tooltip | manual-only | Cold-read test per PITFALLS.md Pitfall 4 — someone unfamiliar with the change browses 60-90s, report whether they noticed the mark | ❌ Wave 0 |
| PERK-04 | Activation reveals static, display-only discount code | manual-only | Click/tap trigger, confirm `HOUSE10` renders as plain text, no "redeem"/validation UI | ❌ Wave 0 |
| PERK-05 | Reveal branches on `ladidier_subscribed` | manual-only | Test as (a) fresh visitor (`localStorage.clear()`), confirm code + subscribe CTA both show; (b) subscribed visitor (`localStorage.setItem("ladidier_subscribed","true")`), confirm CTA is absent | ❌ Wave 0 |
| PERK-06 | Does not block/overlay-trap/interrupt browsing | manual-only | With panel open, confirm page behind remains scrollable, no `body` scroll-lock applied, Tab key can move focus past the panel into subsequent page content (no focus-trap) | ❌ Wave 0 |

### Sampling Rate
- **Per task commit:** Manual click-through of the specific PERK-XX behavior just implemented, in the browser (dev server or direct file open, matching existing project practice — no build step to run)
- **Per wave merge:** Full manual pass through all 6 PERK requirements above, at both desktop and ≤480px widths
- **Phase gate:** All 6 PERK-XX manual checks pass, plus the cold-read discoverability test (PERK-03/PITFALLS.md Pitfall 4) before `/gsd-verify-work`

### Wave 0 Gaps
- No automated test framework exists in this repo and none is being introduced by this phase — this matches established project practice (Phase 4's CTA-07 friction audit was 100% manual). The planner should NOT introduce a test framework as a Wave 0 task; doing so would be scope creep beyond this phase's goal and beyond the project's established zero-build convention.
- Manual reset path for the "found" flag during QA: `localStorage.removeItem("ladidier_perk_found")` in devtools console (per CONTEXT.md's Claude's Discretion note) — should be documented in the plan's verification steps, not built as UI.

## Security Domain

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-------------------|
| V2 Authentication | No | No auth system exists or is introduced by this phase |
| V3 Session Management | No | `localStorage` flags are UI-state only, not session/auth tokens |
| V4 Access Control | No | No access-controlled resources — the "discount code" is intentionally public/display-only, not a protected asset (PITFALLS.md Pitfall 5 explicitly treats this as an accepted architectural limitation, not a defect) |
| V5 Input Validation | No | This phase introduces no new user text input — the reveal panel is display-only; the only clickable elements are the trigger and two static buttons |
| V6 Cryptography | No | No secrets, no encryption need — the code is deliberately non-secret by design |

### Known Threat Patterns for this stack

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|----------------------|
| Discount code scraped/shared beyond intended "genuine finders" | Information Disclosure (accepted risk, not a vulnerability) | None needed — PITFALLS.md Pitfall 5/Security Mistakes table already documents this as an accepted static-site limitation; do not build fake obfuscation or "protection" for a value that was never meant to be secret |
| `localStorage` flags (`ladidier_perk_found`, read of `ladidier_subscribed`) trivially editable via devtools | Tampering (accepted risk) | Only ever use these flags to control UI presentation (which panel content shows), never for anything requiring tamper-resistance — consistent with how `ladidier_subscribed` is already used |

No further security domain work applies — this is a static-content feature on a static-content site with no backend, no auth, and no sensitive data.

## Sources

### Primary (HIGH confidence — direct codebase inspection, this session)
- `/Users/aech/Documents/Ladidier/components.jsx` — `Footer` (lines 303-354), `Crest` (85-87), `Nav`/`MobileNav` (99-224, focus-trap/Escape/aria patterns), `Object.assign(window, ...)` export (423)
- `/Users/aech/Documents/Ladidier/app.jsx` — full file read; `isSubscribed` state (50), hash routing (55-72), route switch (74-82), `<Footer setRoute={go} />` (88)
- `/Users/aech/Documents/Ladidier/pages.jsx` — `ladidier_subscribed` write sites verified at lines 487, 772; `.paywall-gate` inline-override precedent (460-473)
- `/Users/aech/Documents/Ladidier/styles.css` — `:root` custom properties (5-40), `.mobile-overlay` z-index (572-575), `.paywall-gate` (930-953), `.nav-hamburger:focus-visible` (480-483), `.mobile-overlay-close:focus-visible` (623-626), `.foot` grid + mobile override (274-291, 535)
- `/Users/aech/Documents/Ladidier/tweaks-panel.jsx` — `.twk-panel` z-index `2147483646` confirmed at line 50, inside a JS template-literal `<style>` injection, not `styles.css`
- `/Users/aech/Documents/Ladidier/ornaments.jsx` — `Flourish` diamond SVG (41-54) as D-02 glyph precedent
- `/Users/aech/Documents/Ladidier/Ladidier Portal.html` and `Ladidier Portal-print.html` — full script-tag load order confirmed identical in both files
- `.planning/phases/05-hidden-perks-discovery-feature/05-CONTEXT.md`, `.planning/REQUIREMENTS.md`, `.planning/STATE.md` — phase scope and locked decisions

### Secondary (inherited from prior milestone research, re-verified where line-number-specific)
- `.planning/research/ARCHITECTURE.md` — architectural patterns and anti-patterns confirmed still valid; specific `pages.jsx` line numbers superseded by this document
- `.planning/research/FEATURES.md` — "Hidden Perks Mechanics" pattern table, unchanged/not re-verified this session (no code claims to re-check)
- `.planning/research/PITFALLS.md` — Pitfalls 3-8, unchanged/not re-verified this session except where cross-referenced above (WCAG hover/focus sourcing, mobile `!important` cascade)

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — zero-build convention is unambiguous and unchanged
- Architecture: HIGH — every claim in this document was verified against current file contents in this session, not carried over from training data or unverified milestone research
- Pitfalls: HIGH for the newly-verified items (line-number drift, z-index location, focus-trap distinction); MEDIUM for the inherited discoverability/UX pitfalls (PITFALLS.md's own confidence rating, not re-elevated here)

**Research date:** 2026-08-21
**Valid until:** Effectively until the next edit to `components.jsx`, `pages.jsx`, `app.jsx`, `styles.css`, or `tweaks-panel.jsx` — since this research's value is almost entirely in exact current line numbers/values, treat it as valid for planning purposes only until Phase 5 execution begins (re-verify line numbers if execution is delayed and other phases/quick-tasks land first)
