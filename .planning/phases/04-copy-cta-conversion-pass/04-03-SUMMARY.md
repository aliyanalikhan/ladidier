---
phase: 04-copy-cta-conversion-pass
plan: 03
subsystem: ui
tags: [react, jsx, copy, cta, stores-page, accessibility]

# Dependency graph
requires:
  - phase: 04-copy-cta-conversion-pass
    provides: "Plan 01/02's D-01 CTA voice and STORES.length computed-count patterns"
provides:
  - "StoresPage intro paragraph reframed toward shopping-mall voice (CTA-04)"
  - "StoresPage Gallery view locked 'Visit the Boutique ->' CTA on all 14 cards (CTA-03, D-05)"
  - "StoresPage Index view per-store accessible name via aria-label (D-04)"
affects: [04-04, 04-05]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Per-store aria-label template literal on a click-anywhere .store-row div, interpolating ${s.name} from the in-repo STORES array — first accessible-name precedent in this file for the .store-row idiom (HeroIndex's identical row intentionally left as-is, future-scope)"

key-files:
  created: []
  modified:
    - pages.jsx

key-decisions:
  - "No flexWrap/gap CSS change added to the Gallery CTA row — computed the worst-case Est./CTA combined text width (~232px, using the longest real est value 'MMXXIII') against both the grid's 280px column minimum and the actual single-column content width at <=480px (~384px after gutter+padding); both scenarios have clearance, so the plan's sanctioned fallback fix was not needed"

patterns-established: []

requirements-completed: [CTA-03, CTA-04, CTA-05]

# Metrics
duration: ~10min
completed: 2026-08-20
---

# Phase 4 Plan 3: Stores Page Intro Rework and Per-Store CTAs Summary

**Reworked the Stores page intro to shopping-mall voice, replaced the Gallery view's "Enter →" with the locked "Visit the Boutique →" CTA on all 14 cards, and added a per-store `aria-label` to Index view rows without adding visible text.**

## Performance

- **Duration:** ~10 min
- **Started:** 2026-08-20 (post 04-02 completion)
- **Completed:** 2026-08-20
- **Tasks:** 2 completed
- **Files modified:** 1 (`pages.jsx`)

## Accomplishments

- `StoresPage`'s intro paragraph (pages.jsx:685-688) no longer opens with "Each store stands on its own" (real-estate-coded); it now reads "Each house keeps its own hours and its own obsessions..." and closes with "Step through any door below and shop it at your leisure," while the untouched middle clause ("united by craft, by patience, and by a refusal to rush a good thing") preserves the site's existing editorial cadence. Element stayed a plain `<p style={{...}}>` — no `className="lede"` added, keeping the type role unchanged (CTA-04).
- `StoresPage` Gallery view's card CTA (pages.jsx:749) changed from "Enter →" to the locked exact string "Visit the Boutique →" — label-only edit; the card was already wrapped in `<a href={s.url} target="_blank" rel="noopener noreferrer">`, so all 14 cards now resolve to their real store URLs under an explicit, on-voice CTA (CTA-03, D-05). The sibling `Est. {s.est}` span and its styling were left untouched (D-06 scoping).
- `StoresPage` Index view's row (pages.jsx:715) gained `aria-label={\`Visit the Boutique — ${s.name}\`}` on the outer `.store-row` div — a per-store accessible name for screen readers, with zero visible text added (the bare `→` arrow and dense row width are unchanged, satisfying D-04). `HeroIndex`'s structurally identical row (pages.jsx:152) was deliberately left without an aria-label, matching the plan's explicit scope boundary.

## Task Commits

Each task was committed atomically:

1. **Task 1: Reframe the Stores page intro copy toward shopping** - `340fc8b` (fix)
2. **Task 2: Add the per-store CTA label to Gallery view and an accessible name to Index view** - `3cd5cd4` (feat)

**Plan metadata:** (this commit)

## Files Created/Modified

- `pages.jsx` - `StoresPage` function: header intro paragraph copy, Gallery-view CTA label, Index-view row `aria-label`

## Decisions Made

- No CSS change (`flexWrap`/`gap`) was added to the Gallery CTA row despite the task's overflow-check instruction, because a worst-case character-width calculation (longest real `est` value "MMXXIII" combined with "Visit the Boutique →") stays within both the grid's 280px minimum-column content width and the actual single-column card width rendered at <=480px viewports (gutter+padding leaves ~384px of content width there) — no overlap risk in practice, so the sanctioned fallback fix was not applied. This should still be spot-checked visually per the plan's own manual verification step.

## Deviations from Plan

None - plan executed exactly as written. Line numbers in the executed file (`pages.jsx:685`, `:715`, `:749`) differ slightly from the plan's stated line numbers (`678-681`, `708`, `742`) due to minor drift accumulated from Plans 01-02's prior edits to the same file — content and structure matched the plan's `read_first`/`action` descriptions exactly, so no re-scoping was needed.

## Issues Encountered

The Index-view `aria-label` edit initially failed on a non-unique match: `<div className="store-row" onClick={() => window.open(s.url, "_blank", "noopener,noreferrer")}>` appears twice in `pages.jsx` (once in `HeroIndex` at line 152, once in `StoresPage` at line 715). Re-scoped the edit using the subsequent `<div><div className="name">{s.name}</div>` structure, which is unique to `StoresPage`'s row (HeroIndex renders `<span className="name">` directly, not a wrapping `<div>`), confirming only the intended `StoresPage` row was touched. Verified afterward via `grep -n 'store-row'` showing exactly 2 lines, only one (`StoresPage`, line 715) carrying the new `aria-label`.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- `StoresPage` is now fully aligned with CTA-03, CTA-04, and CTA-05 (via D-06 scoping) — its intro copy, Gallery CTA, and Index accessible name all match the locked UI-SPEC contract.
- Remaining Phase 4 work (Magazine lede/paywall/PDF-button fixes, `SubscribeBanner` dead-CTA fix across 5 pages) is untouched by this plan and ready for Plans 04-05.
- Manual verification recommended: reload Stores in a browser, confirm the intro paragraph reads the new copy, toggle Index/Gallery and click through several of the 14 Gallery cards to confirm each shows "VISIT THE BOUTIQUE →" and opens the correct external store URL in a new tab, and inspect an Index row's accessibility tree to confirm the per-store `aria-label`. Repeat the Gallery check at <=480px to confirm no CTA/Est. label overlap (math suggests clearance, spot-check to be certain).

---
*Phase: 04-copy-cta-conversion-pass*
*Completed: 2026-08-20*

## Self-Check: PASSED

- FOUND: pages.jsx
- FOUND: 04-03-SUMMARY.md
- FOUND: 340fc8b
- FOUND: 3cd5cd4
