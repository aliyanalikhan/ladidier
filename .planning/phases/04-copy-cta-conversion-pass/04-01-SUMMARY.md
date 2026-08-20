---
phase: 04-copy-cta-conversion-pass
plan: 01
subsystem: ui
tags: [react, jsx, copy, cta, home-hero]

# Dependency graph
requires: []
provides:
  - "Shopping-forward primary CTA ('Shop the Houses') promoted to first position in all three Home hero variants"
  - "Reading/magazine CTA preserved in second position, non-solid, in all three hero variants"
affects: [04-02, 04-03, 04-04, 04-05]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Hero CTA rows always order primary shopping CTA (.btn.solid, first) before secondary reading CTA (.btn/.btn.ghost, second) — any future hero variant should follow this ordering"

key-files:
  created: []
  modified:
    - pages.jsx

key-decisions:
  - "Reused existing on-voice string pattern ('Shop the Houses') consistently across all three heroes rather than three different phrasings, per D-01's house-vocabulary rule and the plan's exact-string requirement"

patterns-established:
  - "Primary/secondary CTA row shape: one .btn.solid first (shopping, routes to stores), one non-solid .btn or .btn.ghost second (reading, routes to magazine)"

requirements-completed: [CTA-01, CTA-02]

# Metrics
duration: 5min
completed: 2026-08-20
---

# Phase 4 Plan 1: Home Hero CTA Promotion Summary

**Promoted "Shop the Houses" to the first, solid-button position in all three Home hero variants (HeroManifest, HeroSplit, HeroIndex), demoting the pre-existing reading CTA to non-solid second position without removing it.**

## Performance

- **Duration:** ~5 min
- **Started:** 2026-08-20T22:18:34+05:00 (post plan-creation commit)
- **Completed:** 2026-08-20T22:23:25+05:00
- **Tasks:** 2 completed
- **Files modified:** 1 (`pages.jsx`)

## Accomplishments
- HeroManifest: CTA row reordered/reclassed so `Shop the Houses` (`.btn.solid`, routes to `stores`) leads, `Read the issue` (`.btn`, routes to `magazine`) follows — the marquee "Now reading ·" block and `<Reveal>` wrapper untouched.
- HeroSplit: new first `Shop the Houses` (`.btn.solid`, routes to `stores`) button inserted; `Open the issue` demoted from `.btn.solid` to plain `.btn`; `How to subscribe →` `.btn.ghost` tertiary preserved as-is.
- HeroIndex: relabeled its existing solid CTA from `The full directory →` to `Shop the Houses →` (same routing), wrapped it in a new flex row alongside a new `Read the issue` `.btn.ghost` secondary CTA routing to `magazine`; original `animation`/`alignSelf` values relocated verbatim to the wrapper, not rewritten.
- All three hero variants now converge on one consistent primary CTA string, satisfying D-02's Tweaks-panel toggle guarantee (no stale pre-rework copy behind any hero variant).

## Task Commits

Each task was committed atomically:

1. **Task 1: Promote shopping CTA to primary in HeroManifest and HeroSplit** - `20f0445` (feat)
2. **Task 2: Align HeroIndex CTA voice and add its secondary reading CTA** - `9baf971` (feat)

**Plan metadata:** _pending_ (docs: complete plan)

## Files Created/Modified
- `pages.jsx` - HeroManifest, HeroSplit, HeroIndex CTA rows reordered/reclassed/relabeled per D-01/D-02/D-03

## Decisions Made
None beyond what was already locked in 04-CONTEXT.md (D-01/D-02/D-03) and 04-PATTERNS.md — plan executed as specified using the exact strings and class-swap approach documented there.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None. All acceptance criteria verified via `awk`/`grep` checks matched expected output on first pass, and a full Babel (`@babel/preset-react`) transform of `pages.jsx` confirmed no JSX syntax errors were introduced (browser console verification was not directly observable in this non-interactive environment, so the Babel transform check was used as the automated proxy for "renders without a Babel error").

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- `pages.jsx` Home hero CTA rows are now consistent across all three variants and ready for the remaining Phase 4 plans (Stores, StoresPreview, Magazine, SubscribeBanner copy/CTA work) to build on without touching hero code again.
- No blockers. Manual verification recommended: open `Ladidier Portal.html` in a browser, cycle the Tweaks panel through all three hero styles, and confirm each shows the shopping CTA first/solid and the reading CTA second/non-solid, with both buttons routing correctly.

---
*Phase: 04-copy-cta-conversion-pass*
*Completed: 2026-08-20*

## Self-Check: PASSED

- FOUND: pages.jsx
- FOUND: 20f0445
- FOUND: 9baf971
