---
phase: quick-260831-o4v
plan: 01
subsystem: ui
tags: [react, css, magazine-page, consistency-fix]

requires: []
provides:
  - MagazinePage's own cover now has the same resting-tilt / hover-straighten-and-lift / gold-frame interaction as Home's hero cover
affects: [magazine-page]

actuals:
  tokens: 700
  tasks: 1
  commits: 1

tech-stack:
  added: []
  patterns:
    - "Same outer-wrapper-float-slow + inner-cover-framed-tilt split established in 260831-o04, reused verbatim for the Magazine page's cover"

key-files:
  modified:
    - src/pages.jsx

key-decisions:
  - "User asked to 'check how magazine cover is interactive with mouse hover' after 260831-o04 had already fixed Home's hero cover. Auditing found a second, older instance with the same gap — MagazinePage's own cover, which never had the tilt treatment at all (built plain in 260831-mis). Fixed both consistently rather than assuming the user meant only the one already fixed."
  - "Executed inline by the orchestrator (no gsd-executor subagent spawn) — same reasoning as 260831-o04: a known-good, already-verified structural change with no open questions."

patterns-established: []
requirements-completed: []

coverage:
  - id: D1
    description: "MagazinePage's cover has the resting tilt, gold frame, and hover straighten-and-lift, matching Home's hero cover"
    verification:
      - kind: other
        ref: "Live dev-server screenshots at rest and mid-hover on both Home and Magazine pages; automated regex check confirming the wrapper+inner structure in src/pages.jsx"
        status: pass
    human_judgment: false

duration: ~10min
completed: 2026-08-31
status: complete
---

# Quick Task 260831-o4v: Audit & Fix Magazine Cover Hover Interaction Summary

**Audit finding:** the user's question came right after 260831-o04 fixed Home hero's cover tilt.
Re-checking every real-cover-photo instance on the site found a second gap the prior fix didn't
cover: `MagazinePage`'s own "This Issue's Cover" section was built from scratch in quick task
260831-mis using a plain `.ph.photo float-slow` div — it never had the tilt/frame treatment at
all, so it looked static compared to Home's (now-fixed) hero cover.

**Fix:** restructured that one div into the same wrapper pattern Home's hero already uses — an
outer `<div className="float-slow">` (unchanged bobbing animation) wrapping an inner
`<div className="ph photo cover framed tilt">` (resting 3D tilt + gold frame + hover
straighten-and-lift). This split is required because `float-slow` and `.tilt` both drive the
`transform` CSS property — putting them on the same element would have one animation clobber the
other; putting them on nested elements lets both compose, exactly as `HeroSplit` already does.

## Task Commit

1. **Task 1: Confirm the MagazinePage cover structural fix** — `3bb660b`

## Files Modified
- `src/pages.jsx` — `MagazinePage`'s cover div (~line 465-471) split into a `float-slow` wrapper
  + inner `ph photo cover framed tilt` div

## Verification
- `npm run build` succeeded.
- Visually verified live in a dev server on both Home (`/`) and Magazine (`/#magazine`): both
  covers now tilt at rest, show the gold frame, and straighten-and-lift on hover, identically.

## Issues Encountered
None.

---
*Phase: quick-260831-o4v*
*Completed: 2026-08-31*
