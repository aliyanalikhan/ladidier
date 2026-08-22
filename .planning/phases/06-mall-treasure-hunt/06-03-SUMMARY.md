---
phase: 06-mall-treasure-hunt
plan: 03
subsystem: ui
tags: [react, wiring, html-entry-points, css-suppression]

# Dependency graph
requires:
  - phase: 06-mall-treasure-hunt (plan 01)
    provides: "treasure.jsx state layer + TreasureIcon/TreasureProgress components"
  - phase: 06-mall-treasure-hunt (plan 02)
    provides: "TreasureHuntComplete popup + full .treasure-* CSS block"
provides:
  - "Four live TreasureIcon mounts in pages.jsx (home, magazine, article, stores)"
  - "TreasureProgress mounted in Nav's .nav-right, TreasureHuntComplete mounted at App root"
  - "treasure.jsx script tag in both HTML entry points, print-view suppression rule"
affects: [06-04]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Load order: tweaks-panel.jsx -> ornaments.jsx -> perks.jsx -> treasure.jsx -> components.jsx -> pages.jsx -> {app|print-app}.jsx"

key-files:
  created: []
  modified: [pages.jsx, components.jsx, app.jsx, "Ladidier Portal.html", "Ladidier Portal-print.html"]

key-decisions:
  - "Inserted each <TreasureIcon> as a single bare line with no surrounding blank lines, to keep the diff to exactly one added line per site and match the plan's insertions-only acceptance criteria"

patterns-established: []

requirements-completed: [TREAS-01, TREAS-02, TREAS-03, TREAS-04, TREAS-05, TREAS-06]

# Metrics
duration: 3min
completed: 2026-08-22
---

# Phase 06 Plan 03: Treasure Hunt Site Wiring Summary

**Wired the treasure hunt live: four TreasureIcon mounts (Home/Stores/Magazine/Article), one TreasureProgress in the nav bar, one TreasureHuntComplete popup at the app root, and treasure.jsx loaded (and print-suppressed) in both HTML entry points**

## Performance

- **Duration:** 3 min
- **Started:** 2026-08-22T10:22:59Z
- **Completed:** 2026-08-22T10:25:47Z
- **Tasks:** 3 completed
- **Files modified:** 5 (pages.jsx, components.jsx, app.jsx, "Ladidier Portal.html", "Ladidier Portal-print.html")

## Accomplishments
- `HomePage`: `<TreasureIcon page="home" />` inserted as a direct sibling of the three hero variants (between `<StoreMarquee />` and `<Manifesto />`), so it survives all three Tweaks-panel hero layouts
- `MagazinePage`: `<TreasureIcon page="magazine" />` inserted immediately after `<header className="page-head">` closes, outside `.magazine-frame` — safe from the `z-index: 10` paywall backdrop
- `ArticlePage`: `<TreasureIcon page="article" />` inserted after the byline header, in the whitespace band before the hero photo
- `StoresPage`: `<TreasureIcon page="stores" />` inserted after `<header className="page-head">` closes, outside both the `view === "list"` and `view === "grid"` branches — survives toggling between Index and Gallery
- `components.jsx` `Nav`: `<TreasureProgress />` inserted inside `.nav-right`, between the `EN · USD` link and `.nav-hamburger` — a plain flex item that stays visible at mobile widths since the `@media (max-width: 768px)` rule only hides `<a>` children of `.nav-right`
- `app.jsx` `App`: `<TreasureHuntComplete setRoute={go} />` mounted as a root-level sibling of `<Footer setRoute={go} />`, passing the same `go` wrapper every other top-level call site uses
- Both `Ladidier Portal.html` and `Ladidier Portal-print.html` now load `<script type="text/babel" src="treasure.jsx"></script>` directly after `perks.jsx` and before `components.jsx`
- `Ladidier Portal-print.html` gained a `.treasure-layer, .treasure-icon, .treasure-progress, .treasure-reveal { display: none !important; }` rule immediately after the existing `.marquee, .ticker, .vmarquee` suppression rule
- Zero component signature changes; `print-app.jsx` untouched; zero deletions across all five modified files

## Task Commits

Each task was committed atomically:

1. **Task 1: Four TreasureIcon mount points in pages.jsx** - `a63d468` (feat)
2. **Task 2: Nav progress mount in components.jsx and root popup mount in app.jsx** - `b8e473f` (feat)
3. **Task 3: Script tag in both HTML entry points + print suppression rule** - `f9f0692` (feat)

**Plan metadata:** (this commit, following SUMMARY.md creation)

## Files Created/Modified
- `pages.jsx` - Four `<TreasureIcon page="..." />` insertions (home, magazine, article, stores); zero signature changes, zero deletions
- `components.jsx` - One `<TreasureProgress />` insertion inside `Nav`'s `.nav-right`; zero signature changes
- `app.jsx` - One `<TreasureHuntComplete setRoute={go} />` insertion as a root-level sibling of `Footer`; also newly added to git tracking in this commit (see Deviations)
- `Ladidier Portal.html` - One `treasure.jsx` script tag inserted after `perks.jsx`
- `Ladidier Portal-print.html` - One `treasure.jsx` script tag inserted after `perks.jsx`, plus one print-suppression CSS rule for all four `.treasure-*` classes

## Decisions Made
- Kept every `<TreasureIcon>` insertion to a single bare line adjacent to its anchor, with no surrounding blank lines, so the real content diff for each site is exactly one added line and nothing else — matching the plan's "insertions only" and per-page line-count acceptance criteria as literally as possible.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Committed app.jsx to git tracking for the first time**
- **Found during:** Task 2 commit
- **Issue:** `app.jsx` was untracked in git (per the orchestrator's explicit note directing this plan to run on the main working tree rather than an isolated worktree, precisely because of this). Committing the `<TreasureHuntComplete setRoute={go} />` insertion via a normal `git add app.jsx` therefore added the entire pre-existing file to version control for the first time, not just the one new line.
- **Fix:** None needed — this is the expected and only correct outcome. `git diff -U0 app.jsx` (pre-commit) was empty against a nonexistent tracked baseline, so `git add`/`commit` was the only way to record the change; the file's prior content is unaffected (working-tree bytes were read via `Read` and edited via a single targeted `Edit` call, never rewritten wholesale).
- **Files modified:** app.jsx (now tracked)
- **Verification:** `git show b8e473f --stat` shows `app.jsx | 166 ++++++++++...` as a new file with all 166 pre-existing lines plus the 1 new line; content diff of the working tree immediately before/after the edit showed exactly one added line at the correct location.
- **Committed in:** `b8e473f`

---

**Total deviations:** 1 auto-fixed (blocking/git-tracking, not a code or scope change)
**Impact on plan:** None on functionality or scope. `app.jsx`'s content is unchanged except for the plan's specified one-line insertion; it is now simply tracked by git going forward, consistent with every other source file in the project.

## Issues Encountered
- The plan's own `<verify>`/`<acceptance_criteria>` bash snippets for "insertions only" (e.g. `git diff -U0 pages.jsx | grep -c '^-'` expected to return `0`) count the `diff --git`/`---`/`+++` header lines that `git diff -U0` always emits whenever a file has any change — those header lines themselves start with `-` and `+` respectively. Run literally, the counts came back as `1` (not `0`) for the `^-` pattern and `5` (not `4`) for the `^+` pattern on `pages.jsx`, purely due to this one-line header artifact, not because of any real deletion or extra addition. The actual per-file diffs (reproduced above and re-verified after each commit) show exactly the intended insertions and zero deletions in every case. This is a pre-existing quirk in the plan's own verify command construction, not a defect in the code change — documented here for visibility, no code change made. All other verify/acceptance checks (icon count, distinct page values, magazine-frame/view-branch containment gates, signature-unchanged greps, script-tag order, print-suppression rule presence, SRI-hash count) passed exactly as specified.
- Browser-based behavioral checks (visual icon rendering, click-to-find flow, nav dot fill-in, completion popup firing on the 4th find, Footer perk regression) could not be executed in this non-interactive environment — no browser/headless runner is available. All static/structural verification (grep-based presence/position/order checks, Python containment assertions, git diff insertions-only checks) passed. This mirrors the plan's own split between automated `<verify>` gates (all passed) and manual browser-behavior acceptance criteria (deferred to human/visual QA, consistent with this being a zero-build static site with no test harness).

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- The treasure hunt is fully wired and live: four icons across Home/Stores/Magazine/Article, nav progress dots, and the completion popup, all script-loaded in the production HTML entry point and correctly suppressed in the print entry point.
- Plan 04 (if it covers cold-read/QA validation or further polish) can proceed against a functionally complete feature; no known blockers.
- Recommend a manual browser pass before considering the feature done end-to-end: `sessionStorage.clear(); localStorage.removeItem("ladidier_treasure_completed")`, then click each of the four icons across the four pages and confirm the nav dots fill in and the completion popup fires on the fourth find, plus a regression check that the Footer's hidden perk (`HOUSE10`) still opens correctly.
- No blockers.

---
*Phase: 06-mall-treasure-hunt*
*Completed: 2026-08-22*
