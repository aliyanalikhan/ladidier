---
phase: 05-hidden-perks-discovery-feature
plan: 01
subsystem: ui
tags: [react, css, localStorage, accessibility, discovery-feature]

# Dependency graph
requires:
  - phase: 04-copy-cta-conversion-pass
    provides: finalized elevated-editorial CTA voice, "Vol. I N°03" issue framing already present in Footer
provides:
  - "perks.jsx: HiddenPerk component, usePerkFound hook, PERK_CODE constant, reveal panel markup — self-contained and not yet mounted anywhere"
  - ".perk-mark / .perk-reveal CSS rules appended to styles.css (trigger button, floating reveal panel, entrance animation, responsive + reduced-motion variants)"
affects: [05-02-plan (Footer integration + HTML script tags), 05-03-plan]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Global-scope Babel script module (no import/export), exported via Object.assign(window, {...}) — matches components.jsx convention"
    - "localStorage-backed usePerkFound() hook mirrors app.jsx:50's lazy-initializer + === \"true\" comparison shape"
    - "Non-modal floating panel: no scroll lock, no focus trap, no role=dialog/aria-modal — explicit Close + Escape + outside-click only"

key-files:
  created: [perks.jsx]
  modified: [styles.css]

key-decisions:
  - "Reveal panel is applied via combined className (paywall-gate perk-reveal[--first]) with zero inline style object, per plan instruction to route all layout through Task 1's CSS classes"
  - "Outside-click handler checks containment against both panelRef and markRef so a click on the trigger while open doesn't trigger a close-then-reopen flicker"
  - "firstFind computed from the pre-markFound() found value so the entrance animation plays only on a visitor's true first-ever activation"

patterns-established:
  - "Non-modal disclosure panel pattern (trigger + floating panel, no scroll lock/focus trap) available for reuse by any future site element that needs a lightweight popover without full MobileNav-style modal semantics"

requirements-completed: [PERK-01, PERK-02, PERK-04, PERK-05, PERK-06]

duration: 15min
completed: 2026-08-21
---

# Phase 05 Plan 01: Hidden Perk Component + Styles Summary

**Self-contained `perks.jsx` component (HiddenPerk trigger + non-modal reveal panel exposing static HOUSE10 code) and its `.perk-mark`/`.perk-reveal` CSS, built and gated but not yet wired into any HTML entry point or the Footer.**

## Performance

- **Duration:** 15 min
- **Started:** 2026-08-21T07:10:00Z (approx, from session state)
- **Completed:** 2026-08-21
- **Tasks:** 2 completed
- **Files modified:** 2 (1 new, 1 appended)

## Accomplishments
- Appended a purely additive "Hidden perk" CSS section to `styles.css`: `.perk-mark` trigger button (44px tap target, gold, .55 resting opacity, focus-visible outline), `.perk-reveal` floating panel (fixed bottom-left, z-index 500, layered on `.paywall-gate`), `.perk-code`/`.perk-actions` layout helpers, `.perk-reveal--first` entrance animation, and 480px/reduced-motion media blocks
- Created `perks.jsx`: `usePerkFound()` hook (localStorage `ladidier_perk_found`, `=== "true"` comparison), `HiddenPerk({ setRoute })` component with a native `<button className="perk-mark">` trigger and a non-modal reveal panel showing the static `HOUSE10` code
- Panel dismissal is explicit-only: Close button, Escape key, or outside click — no scroll lock, no focus trap, no auto-dismiss timer, satisfying PERK-06/D-03/D-04
- Subscribe CTA ("Also unlock the Sunday letter →") renders only when the read-only `ladidier_subscribed` flag is not `"true"`, routes via the `setRoute` prop (never `location.hash`)
- Both task-level automated gates (`CSS_GATE_PASS`, `PERKS_GATE_PASS`) passed on first run; feature remains fully inert — no HTML file references `perks.jsx` yet

## Task Commits

Each task was committed atomically:

1. **Task 1: Append .perk-mark and .perk-reveal rules to styles.css** - `39daa3d` (feat)
2. **Task 2: Create perks.jsx — HiddenPerk component, usePerkFound hook, reveal panel** - `9fe13f4` (feat)

**Plan metadata:** (this commit)

## Files Created/Modified
- `styles.css` - Appended `.perk-mark`, `.perk-reveal` and related rules (86 lines, purely additive, zero deletions)
- `perks.jsx` - New file (99 lines): `PERK_FOUND_KEY`/`PERK_CODE` constants, `usePerkFound()` hook, `HiddenPerk` component, `Object.assign(window, { HiddenPerk })` export

## Decisions Made
- Followed the plan's locked copy, class names, and z-index value exactly (D-03 through D-09) — no deviation from the interface contract
- No inline `style` object attached to the panel; all layout comes from the `.perk-reveal`/`.paywall-gate` CSS classes per explicit plan instruction

## Deviations from Plan

None - plan executed exactly as written. Both automated verification gates (Task 1's `CSS_GATE_PASS`, Task 2's `PERKS_GATE_PASS`) passed without requiring any fix-up, and all plan-level verification checks (no HTML references `perks.jsx`, `components.jsx` untouched, `HOUSE10` appears exactly once repo-wide) passed on inspection.

## Issues Encountered
None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

`perks.jsx` and its CSS are fully built and verified but intentionally inert. Plan 02 can now:
- Insert `<script type="text/babel" src="perks.jsx"></script>` into both `Ladidier Portal.html` and `Ladidier Portal-print.html` (between `ornaments.jsx` and `components.jsx`)
- Add the single `<HiddenPerk setRoute={setRoute} />` line inside `Footer`'s wordmark-row flex container in `components.jsx`

No blockers. The discoverability-paradox validation noted in STATE.md's Blockers/Concerns section still needs a cold-read test once the feature is mounted (Plan 02/03 scope, not this plan's).

---
*Phase: 05-hidden-perks-discovery-feature*
*Completed: 2026-08-21*

## Self-Check: PASSED

All created files found on disk (perks.jsx, styles.css) and all task commits (39daa3d, 9fe13f4) plus this summary's own commit verified present in git log.
