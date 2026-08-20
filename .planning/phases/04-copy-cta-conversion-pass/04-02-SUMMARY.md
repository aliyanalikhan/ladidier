---
phase: 04-copy-cta-conversion-pass
plan: 02
subsystem: ui
tags: [react, jsx, copy, cta, home-stores-preview]

# Dependency graph
requires:
  - phase: 04-copy-cta-conversion-pass
    provides: "Plan 01's Home hero CTA promotion pattern (primary/secondary button convention)"
provides:
  - "Home directory eyebrow count computed from STORES.length (no longer hardcoded/stale)"
  - "Home StoresPreview section CTA reworded to 'Discover the Directory ->' in D-01 voice"
  - "Heritage year (Est.) microcopy added to all 14 Home store preview cards, alongside category"
affects: [04-03, 04-04, 04-05]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Computed-count interpolation ({STORES.length}) reused a second time (first precedent: HeroIndex pages.jsx:158) to prevent stale counts from drifting again"
    - "Est./category two-item row pattern (flex between, mono/mute 11px Est. span) now used in both StoresPreview (Home) and StoresPage grid view — same convention, two call sites"

key-files:
  created: []
  modified:
    - pages.jsx

key-decisions:
  - "Used computed {STORES.length} form (not hardcoded 14) per CONTEXT.md's discretion note preferring the drift-proof option"

patterns-established: []

requirements-completed: [CTA-02, CTA-05]

# Metrics
duration: ~5min
completed: 2026-08-20
---

# Phase 4 Plan 2: Home Directory Preview Fixes Summary

**Fixed Home's stale "11 Houses" count to compute from STORES.length, added Est. year microcopy to all 14 store preview cards, and reworded the directory section CTA to "Discover the Directory →".**

## Performance

- **Duration:** ~5 min
- **Started:** 2026-08-20T17:29:00Z (approx, post 04-01 completion)
- **Completed:** 2026-08-20T17:31:00Z (approx)
- **Tasks:** 2 completed
- **Files modified:** 1 (`pages.jsx`)

## Accomplishments
- `StoresPreview` eyebrow now reads `The Directory · {STORES.length} Houses`, computed live from the `STORES` array (14 today), replacing the hardcoded stale "11 Houses" bug (D-08).
- `StoresPreview` section CTA reworded from "Open the directory →" to "Discover the Directory →" — pre-approved D-01 phrase — while keeping `.btn.ghost` styling and its `setRoute("stores")` handler unchanged (this button intentionally stays secondary; the hero CTA from Plan 01 is the primary shopping CTA).
- Every Home store preview card now shows category and `Est. {s.est}` side by side, reusing the exact `.mono`/`var(--mute)`/`fontSize: 11` convention already established at `StoresPage` grid view (pages.jsx:745) — no new class, size, or color introduced.

## Task Commits

Each task was committed atomically:

1. **Task 1: Fix the stale house count and reword the directory section CTA** - `5123f8b` (fix)
2. **Task 2: Add heritage microcopy to Home store preview cards** - `4fd5e33` (feat)

**Plan metadata:** (this commit)

## Files Created/Modified
- `pages.jsx` - `StoresPreview` function: eyebrow count, section CTA label, and card category/Est. row

## Decisions Made
- Chose the computed `{STORES.length}` form over hardcoding "14 Houses", per CONTEXT.md's explicit discretion note that computed is preferred to prevent future drift when a store is added or removed.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

The `<div className="eyebrow" style={{ marginTop: 4 }}>{s.cat}</div>` string pattern used in the plan's `read_first` context appeared at two locations in `pages.jsx` (line 260 inside `StoresPreview`, and line 742 inside `StoresPage`'s separate grid view). The initial edit attempt correctly failed on ambiguity (non-unique match) rather than silently touching the wrong location; the edit was re-scoped using surrounding lines unique to `StoresPreview` (the `{s.id}` mono span immediately above) to target only the intended card. Verified via `awk` range-scoped grep against the `StoresPreview` function body only, confirming the `StoresPage` grid view at line 742 was untouched.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- `pages.jsx`'s `StoresPreview` function is now fully aligned with D-01/D-06/D-08 — Home's directory section no longer carries stale copy or an under-surfaced heritage field.
- Remaining Phase 4 work (Stores page CTA/lede rework, Magazine lede/paywall/PDF-button fixes, SubscribeBanner dead-CTA fix) is untouched by this plan and ready for Plans 03-05.
- Manual verification recommended: reload Home in a browser, confirm the eyebrow reads "The Directory · 14 Houses", confirm all 14 preview cards show category plus "Est. <roman numeral>" with no overlap at <=480px width, and click one card to confirm it still opens the correct external store URL in a new tab.

---
*Phase: 04-copy-cta-conversion-pass*
*Completed: 2026-08-20*

## Self-Check: PASSED

- FOUND: pages.jsx
- FOUND: 04-02-SUMMARY.md
- FOUND: 5123f8b
- FOUND: 4fd5e33
