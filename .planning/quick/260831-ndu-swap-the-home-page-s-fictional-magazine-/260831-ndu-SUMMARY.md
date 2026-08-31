---
phase: quick-260831-ndu
plan: 01
subsystem: ui
tags: [react, jsx, home-page, magazine]

requires:
  - phase: quick-260831-mis
    provides: ISSUE_HIGHLIGHTS array and eclat-vol2-cover.jpg / eclat/*.jpg assets used on MagazinePage
provides:
  - Home page hero (HeroSplit) and FeaturedStories grid now render the real ÉCLAT Vol. 2 cover and six real highlight stories instead of the fictional MagazineCover mockup and STORIES placeholder content
affects: [magazine, home]

actuals:
  tokens: 1400
  tasks: 1
  commits: 1

tech-stack:
  added: []
  patterns:
    - "Non-interactive .art-card/.ph.photo real-content pattern (established on MagazinePage) reused verbatim on Home's FeaturedStories grid"

key-files:
  created: []
  modified:
    - src/pages.jsx

key-decisions:
  - "Followed plan exactly: no new content or assets, reused ISSUE_HIGHLIGHTS and eclat-vol2-cover.jpg already committed from quick task 260831-mis"

patterns-established: []

requirements-completed: []

coverage:
  - id: D1
    description: "HeroSplit's cover slot renders the real ÉCLAT Vol. 2 cover photo (/assets/eclat-vol2-cover.jpg) instead of the generated MagazineCover mockup"
    verification:
      - kind: other
        ref: "npm run build (succeeds); grep confirms no MagazineCover reference remains and eclat-vol2-cover.jpg appears in HeroSplit"
        status: pass
    human_judgment: false
  - id: D2
    description: "FeaturedStories grid sources from ISSUE_HIGHLIGHTS (6 real stories) instead of fictional STORIES, with no click-through to the fictional ArticlePage"
    verification:
      - kind: other
        ref: "npm run build (succeeds); grep confirms ISSUE_HIGHLIGHTS.slice(0,3)/.slice(3,6) usage and no setRoute(\"article\") remains in FeaturedStories"
        status: pass
    human_judgment: true
    rationale: "Visual confirmation that the hero cover photo and six highlight cards render correctly in the browser (not just present in source) requires a human/manual check per the plan's <manual> verify step"

duration: 8min
completed: 2026-08-31
status: complete
---

# Phase quick-260831-ndu Plan 01: Swap Home's fictional magazine content for real ÉCLAT Vol. 2 content Summary

**Home's HeroSplit cover and FeaturedStories grid now render the real ÉCLAT Vol. 2 cover photo and the same six real highlight stories already used on MagazinePage, replacing the generated `MagazineCover` mockup and fictional `STORIES` placeholders.**

## Performance

- **Duration:** 8 min
- **Started:** 2026-08-31T00:00:00Z
- **Completed:** 2026-08-31T00:08:00Z
- **Tasks:** 1
- **Files modified:** 1

## Accomplishments
- `HeroSplit`'s cover slot now shows the real `/assets/eclat-vol2-cover.jpg` cover photo (same `.ph.photo` pattern as `MagazinePage`), replacing the generated `MagazineCover` mockup
- `FeaturedStories` now sources its lead story, two mid stories, and "Also in the issue" column from `ISSUE_HIGHLIGHTS` (the same 6 real highlights shown on `MagazinePage`) instead of the fictional `STORIES` array
- Removed the dead click-through to the fictional `ArticlePage` from all three featured-stories card types (lead article, mid articles, "also in the issue" row), matching `MagazinePage`'s non-clickable highlight-card precedent
- Removed the now-unused `MagazineCover` import; `STORIES`, `ISSUE`, and all other imports left untouched (still used by `ArticlePage` and eyebrow labels)

## Task Commits

Each task was committed atomically:

1. **Task 1: Swap Home's hero cover and featured-stories content for the real ÉCLAT Vol. 2 content** - `5a714c1` (feat)

**Plan metadata:** committed separately by orchestrator (docs artifacts excluded per constraints)

## Files Created/Modified
- `src/pages.jsx` - Removed `MagazineCover` import; `HeroSplit` now renders the real cover photo; `FeaturedStories` now sources from `ISSUE_HIGHLIGHTS` with non-interactive cards

## Decisions Made
None - followed plan as specified. No new content or assets were created; everything reused was already committed in quick task 260831-mis.

## Deviations from Plan

None - plan executed exactly as written. The plan's own inline verification script (`<automated>`) uses a `\n}\n`-anchored regex to slice out the `HeroSplit`/`FeaturedStories` function bodies, which returned an empty match on this Windows checkout because `src/pages.jsx` uses CRLF (`\r\n`) line endings (pre-existing, not introduced by this change). Re-ran the same semantic checks with a CRLF-tolerant regex (`\r?\n`) and all five conditions passed. `npm run build` succeeded without modification. This is an environment quirk in the plan's literal verify command, not a defect in the implementation, so no code changes were made to address it.

## Issues Encountered
- Running `npm run build` for verification regenerated `dist/` (content-hashed JS filenames, minor whitespace in `dist/index.html`/`dist/print.html`) since `dist/` is committed to the repo. These build-output changes were reverted (`git checkout -- dist/` plus manual removal of the newly-generated hashed files) before committing, since the plan and constraints scope this task to `src/pages.jsx` only.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
Home and Magazine pages now show fully consistent real ÉCLAT Vol. 2 branding across both surfaces (hero cover + highlights grid). No blockers. `src/components.jsx`'s unused `MagazineCover`/`STORIES` definitions remain in place (out of scope per plan) and are still referenced by `ArticlePage`, which remains unreachable from any live route (pre-existing condition, unchanged by this plan).

## Self-Check: PASSED
- FOUND: src/pages.jsx modified as expected (MagazineCover import removed, HeroSplit/FeaturedStories updated)
- FOUND: commit 5a714c1 exists in git log
- FOUND: `npm run build` succeeds
- FOUND: git diff scoped to src/pages.jsx only

---
*Phase: quick-260831-ndu*
*Completed: 2026-08-31*
