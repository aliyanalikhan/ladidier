---
phase: 05-hidden-perks-discovery-feature
plan: 02
subsystem: ui
tags: [react, html-entry-points, integration, discovery-feature]

# Dependency graph
requires:
  - phase: 05-hidden-perks-discovery-feature
    plan: 01
    provides: "perks.jsx (HiddenPerk component, usePerkFound hook, PERK_CODE) and .perk-mark/.perk-reveal CSS, built but not yet mounted"
provides:
  - "perks.jsx loaded on both HTML entry points, script-tag ordered after ornaments.jsx and before components.jsx"
  - "HiddenPerk mounted once inside Footer's wordmark row, rendering on every route via app.jsx and print-app.jsx"
affects: [05-03-plan (cold-read discoverability validation)]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Zero-build script-tag load order is the only module-resolution mechanism — perks.jsx inserted between ornaments.jsx and components.jsx in both HTML entry points"

key-files:
  created: []
  modified: ["Ladidier Portal.html", "Ladidier Portal-print.html", "components.jsx"]

key-decisions:
  - "HiddenPerk mounted as a sibling of Crest inside Footer's existing wordmark flex row (not a repurposed Crest), per D-01, so it renders on every route with zero prop plumbing beyond the setRoute Footer already received"

patterns-established: []

requirements-completed: [PERK-01, PERK-03, PERK-06]

duration: 8min
completed: 2026-08-22
---

# Phase 05 Plan 02: Wire Hidden Perk Into the Running Site Summary

**Three-line surgical integration — one `<script>` tag in each HTML entry point plus one `<HiddenPerk setRoute={setRoute} />` JSX line in `Footer` — makes the hidden-perk feature live on every route with zero signposting.**

## Performance

- **Duration:** 8 min
- **Started:** 2026-08-22 (session start)
- **Completed:** 2026-08-22
- **Tasks:** 2 completed
- **Files modified:** 3 (2 previously-untracked HTML files, 1 tracked JS file)

## Accomplishments
- Inserted `<script type="text/babel" src="perks.jsx"></script>` into `Ladidier Portal.html` (line 22, between `ornaments.jsx` at 21 and `components.jsx` at 23) and into `Ladidier Portal-print.html` (line 88, between `ornaments.jsx` at 87 and `components.jsx` at 89) — both files edited in the same task, closing the known T-05-05 blast-radius risk where `PrintApp`'s `Footer` render would throw `ReferenceError: HiddenPerk is not defined` if only one file were touched
- Added exactly one line, `<HiddenPerk setRoute={setRoute} />`, inside `Footer`'s wordmark flex container in `components.jsx`, immediately after the `LaDidiér` wordmark div and before the container's closing tag — `Footer` already destructured `setRoute`, so no signature change was needed anywhere
- Both task-level automated gates (`HTML_GATE_PASS`, `FOOTER_GATE_PASS`) passed on first run
- `Crest` occurrence count in `components.jsx` remained byte-identical to `HEAD` (5 unrelated call sites untouched), the `Object.assign(window, {...})` export list is unchanged (HiddenPerk stays exported from `perks.jsx`, not re-exported here), and a repo-wide grep for signposting tokens (`title=`, `data-tooltip`, `onboard`, `Hint`, `badge`) returned zero matches in `components.jsx`

## Task Commits

Each task was committed atomically:

1. **Task 1: Load perks.jsx in both HTML entry points** - `25f117d` (feat)
2. **Task 2: Mount HiddenPerk in the Footer wordmark row** - `68a51d5` (feat)

**Plan metadata:** (this commit)

## Files Created/Modified
- `Ladidier Portal.html` - Added `<script type="text/babel" src="perks.jsx"></script>` between the `ornaments.jsx` and `components.jsx` tags; no other change (first git-tracked commit of this previously-untracked file)
- `Ladidier Portal-print.html` - Same single-line insertion at the equivalent position; no other change (first git-tracked commit of this previously-untracked file)
- `components.jsx` - Added `<HiddenPerk setRoute={setRoute} />` inside `Footer`'s wordmark row; `git diff --numstat` confirmed exactly 1 insertion, 0 deletions

## Decisions Made
- Mounted `HiddenPerk` as a sibling of `Crest` in the existing wordmark flex row rather than modifying or wrapping `Crest`, per CONTEXT.md D-01 and the plan's explicit prohibition — `Crest` has 5 other call sites and returns `null`, so repurposing it was never viable
- Did not add `HiddenPerk` to `components.jsx`'s `Object.assign(window, {...})` export list — it is already exported from `perks.jsx`, and re-exporting would have shadowed it with no functional benefit

## Deviations from Plan

None - plan executed exactly as written. Both automated verification gates passed without requiring any fix-up, and all plan-level acceptance criteria (tag ordering, tag byte-for-byte form, single HiddenPerk mount, zero signposting, unchanged export list and Crest count) were confirmed by direct inspection after each task.

## Issues Encountered
None.

## User Setup Required

None - no external service configuration required. A live browser check (loading both HTML entry points and confirming a clean console plus a faint gold `✦` beside the footer wordmark) was not performed in this sandboxed session since no browser is available; the static gates (tag presence, exact ordering, exact tag form, single-mount, export-list integrity) provide strong confidence this renders cleanly given `perks.jsx`'s Plan 01 gates already passed. Recommend the user do a one-time visual spot-check of `Ladidier Portal.html` before considering the feature fully verified end-to-end.

## Next Phase Readiness

The hidden-perk trigger is now live on every route (Home, Stores, Magazine, About, Article, Subscribe, and the print view) with zero signposting. Plan 03 can proceed with the cold-read discoverability validation noted in STATE.md's Blockers/Concerns — confirming the mark is genuinely hard to find while still discoverable in practice.

No blockers.

---
*Phase: 05-hidden-perks-discovery-feature*
*Completed: 2026-08-22*

## Self-Check: PASSED

Verified `HiddenPerk` appears exactly once in `components.jsx` (line 310), `perks.jsx` script tag appears exactly once between `ornaments.jsx` and `components.jsx` in both HTML files (lines 21-23 and 87-89), and both task commits (`25f117d`, `68a51d5`) are present in `git log --oneline`.
