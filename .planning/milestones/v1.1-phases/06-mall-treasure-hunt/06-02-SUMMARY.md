---
phase: 06-mall-treasure-hunt
plan: 02
subsystem: ui
tags: [react, localstorage, customevent, css]

# Dependency graph
requires:
  - phase: 06-mall-treasure-hunt (plan 01)
    provides: "treasure.jsx state layer (TREASURE_CODE, TREASURE_EVENT, TREASURE_ICONS, useTreasureProgress) and TreasureIcon/TreasureProgress components consumed here"
provides:
  - "TreasureHuntComplete completion popup component, exported on window"
  - "Full .treasure-* CSS rule set in styles.css (layer, icon, progress, dot, reveal, code, actions, lead) plus @keyframes treasureRise"
affects: [06-03, 06-04]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Reveal-panel structure mirrored near-verbatim from perks.jsx's HiddenPerk (outside-click + Escape dismissal, isSubscribed read-only branch, paywall-gate shell reuse)"
    - "Centered-then-bottom-sheet responsive reveal: desktop uses transform: translate(-50%,-50%) with a matching-translate @keyframes entrance; <=480px drops to the existing perkRise corner-sheet keyframes since no centering transform applies there"

key-files:
  created: []
  modified: [treasure.jsx, styles.css]

key-decisions:
  - "TreasureHuntComplete guards outside-click against panelRef only (no markRef/trigger element exists, since the popup auto-opens on the completion event rather than being clicked open)"
  - "styles.css block appended in the exact append-only position required by the plan, after the existing prefers-reduced-motion perk rule, with zero reordering of prior rules"

patterns-established:
  - "treasureRise keyframes carry the full centering transform (translate(-50%,-50%)) rather than delegating to the base rule's transform, preventing the corner-jump bug that would occur if only opacity animated"

requirements-completed: [TREAS-03, TREAS-04, TREAS-01, TREAS-06]

# Metrics
duration: 12min
completed: 2026-08-22
---

# Phase 06 Plan 02: Treasure Hunt Completion Reveal Summary

**TreasureHuntComplete popup (HOUSE20 code, subscribe-gated CTA, triple dismissal) plus the full append-only .treasure-* CSS block styling every Plan 01/02 class name**

## Performance

- **Duration:** 12 min
- **Started:** 2026-08-22T10:09:58Z
- **Completed:** 2026-08-22T10:19:49Z
- **Tasks:** 2 completed
- **Files modified:** 2 (treasure.jsx, styles.css)

## Accomplishments
- `TreasureHuntComplete({ setRoute })` added to `treasure.jsx`: opens exactly once, only when a `TREASURE_EVENT` carries `detail.complete === true`, never on mount
- Locked copy rendered verbatim: "The House Treasure", "You found the treasure!", "Your reward, for finding it all:", `HOUSE20`, "Present this at any Ladidiér house — online or in person.", "Also unlock the Sunday letter →", "Close"
- Subscribe CTA conditional on `!isSubscribed` using the exact `localStorage.getItem("ladidier_subscribed") === "true"` comparison, copied byte-for-byte from `perks.jsx`
- Three independent dismissal paths (Close button, Escape key, outside click) — no backdrop, no scroll lock, no focus trap, no auto-dismiss timer
- `treasure.jsx` now exports `TreasureIcon`, `TreasureProgress`, `TreasureHuntComplete` on `window`
- `styles.css` gained one append-only block: `.treasure-layer` (zero-height positioning band), `.treasure-icon` (full-opacity 44px button with `scale(1.08)` hover/focus and gold focus-visible outline — deliberately deviating from `.perk-mark`'s `opacity: .55`), `.treasure-progress`/`.treasure-dot` (44px-wide 4-dot gold cluster joining `.nav-right`'s flex row), and `.treasure-reveal` + friends (centered desktop card via `@keyframes treasureRise`, becoming a `perkRise` bottom sheet at `<=480px`, with a `prefers-reduced-motion` override)

## Task Commits

Each task was committed atomically:

1. **Task 1: TreasureHuntComplete completion popup** - `41a91ba` (feat)
2. **Task 2: Treasure hunt CSS block in styles.css** - `37568c6` (feat)

**Plan metadata:** (this commit, following SUMMARY.md creation)

## Files Created/Modified
- `treasure.jsx` - Added `TreasureHuntComplete` component (56 lines) and extended the `Object.assign(window, ...)` export footer
- `styles.css` - Appended a new "Mall treasure hunt" section (111 lines) after the existing hidden-perk block; zero deletions, zero reordering

## Decisions Made
- Followed the plan's exact interface: outside-click guard checks only `panelRef` (no `markRef` equivalent exists for an auto-opening popup)
- Formatted `.treasure-layer`'s declaration on a single line (`position: relative; width: 100%; height: 0;`) to satisfy the plan's literal automated verify grep, which checks for that exact string as written in the plan text — a minor formatting choice with zero functional difference, not a deviation from intent

## Deviations from Plan

None - plan executed exactly as written. All automated gates, acceptance criteria, and plan-level `<verification>` checks passed on first or second attempt (one CSS formatting adjustment for gate-string matching, not a logic or scope change).

## Issues Encountered
None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- `treasure.jsx` now exports all three components (`TreasureIcon`, `TreasureProgress`, `TreasureHuntComplete`) Plan 03 needs to wire into `pages.jsx`, `components.jsx`, `app.jsx`, and both HTML entry points
- `styles.css` fully styles every class name either component emits — Plan 03's wiring work needs no further CSS additions
- Phase 5's `.perk-*` rules and `perk-` occurrence count (11) are confirmed unchanged
- No blockers

---
*Phase: 06-mall-treasure-hunt*
*Completed: 2026-08-22*

## Self-Check: PASSED

- FOUND: treasure.jsx (TreasureHuntComplete present)
- FOUND: styles.css (.treasure-* block present)
- FOUND: 41a91ba (Task 1 commit)
- FOUND: 37568c6 (Task 2 commit)
