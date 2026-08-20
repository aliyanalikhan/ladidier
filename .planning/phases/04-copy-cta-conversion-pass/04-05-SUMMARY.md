---
phase: 04-copy-cta-conversion-pass
plan: 05
subsystem: testing
tags: [friction-audit, cta, verification, no-build-static-site]

# Dependency graph
requires:
  - phase: 04-copy-cta-conversion-pass (plans 01-04)
    provides: "Home hero CTA promotion, StoresPreview heritage microcopy, Stores page shopping-voice CTAs, Magazine reframe + dead-CTA repairs"
provides:
  - "CTA-07 sign-off: static gate sweep (7 gates) + human click-through, both passed"
  - "Confirmed no inert CTA remains on Home, Stores, or Magazine"
  - "Confirmed no pre-rework stale copy string survives, including behind the Tweaks panel hero toggle"
affects: [phase-5-hidden-perks]

# Tech tracking
tech-stack:
  added: []
  patterns: []

key-files:
  created:
    - .planning/phases/04-copy-cta-conversion-pass/04-05-SUMMARY.md
  modified: []

key-decisions:
  - "Gate D's expected 'Est. {s.est}' count of 2 was a miscount in the plan's own acceptance criteria (undercounted 3 pre-existing occurrences unrelated to this phase's edits); traced via git diff against the phase baseline and confirmed only 1 new occurrence was added by this phase (04-02's StoresPreview card) — not a functional defect, reported not fixed"
  - "Gate E's expected localStorage.setItem count of 1 was already explained in 04-04-SUMMARY.md as a pre-existing unrelated SubscribePage line outside the Magazine paywall mechanic — reported not fixed"

patterns-established: []

requirements-completed: [CTA-07]

# Metrics
duration: 12min
completed: 2026-08-21
---

# Phase 4 Plan 5: Friction Audit Summary

**CTA-07 closed: 7/7 static gates pass on pages.jsx and the developer approved a live click-through of every CTA on Home, Stores, and Magazine at desktop and phone width — zero source file touched.**

## Performance

- **Duration:** 12 min
- **Started:** 2026-08-20 (Task 1 static sweep + checkpoint)
- **Completed:** 2026-08-21 (Task 2 approval received, summary finalized)
- **Tasks:** 2 (1 automated static sweep, 1 blocking human-verify checkpoint)
- **Files modified:** 0 source files (verification-only plan)

## Accomplishments
- Static friction/stale-copy sweep across all 7 gates (A-G) on `pages.jsx` — all PASS
- Human click-through of Home (all 3 hero variants), Stores (Index + Gallery views), and Magazine (paywall + repaired CTAs) at desktop and ≤480px — developer signed off with **"approved"**
- Every row of 04-RESEARCH.md's Friction Audit Findings table accounted for (verified working, or confirmed as the already-fixed D-09/new-finding dead CTAs from prior plans)
- Two known out-of-scope issues (Footer dead links, SubscribePage stale "11 stores" line) reconfirmed present and correctly left unfixed per plan scope

## Task Commits

This plan modified no source file, so there is no `feat`/`fix` task commit for either task. Both tasks are verification-only per the plan's `files_modified: []` frontmatter.

1. **Task 1: Static friction and stale-copy sweep** — verification-only, no commit (draft results captured, folded into this summary)
2. **Task 2: Human friction audit click-through, desktop and phone** — verification-only, no commit (developer approval captured below)

**Plan metadata:** committed alongside this summary — `docs(04-05): complete CTA-07 friction audit` (see final commit in this plan's execution)

## Gate A–G Table (Task 1 — Static friction and stale-copy sweep)

| Gate | Description | Command | Output | Result |
|------|-------------|---------|--------|--------|
| A | No inert buttons | `grep -n '<button' pages.jsx \| grep -v 'onClick' \| grep -v 'type="submit"' \| grep -v '<button *$' \| wc -l` | `0` | **PASS** |
| B | No stale strings (7 retired strings) | `grep -c "<string>" pages.jsx` (comment-filtered) for each of: `Enter the stores`, `The full directory`, `11 Houses`, `Open the directory`, `Each store stands on its own`, `Enter →`, `Download issue` | All `0` | **PASS** |
| C | No fabricated assets | `grep -c 'download=' pages.jsx` and `grep -c '\.pdf' pages.jsx` (comment-filtered) | `download=` = `0`; `.pdf` = `0` | **PASS** |
| D | New strings at expected multiplicity | `grep -c "<string>" pages.jsx` for each target string | `Shop the Houses` = 3 ✓; `Visit the Boutique` = 2 ✓; `Discover the Directory` = 1 ✓; `View full issue` = 1 ✓; `aria-label` = 1 ✓; `Est. {s.est}` = **4** (expected 2, see deviation note) | **PASS with one documented deviation** |
| E | Paywall mechanics intact | `Subscribe to See All Pages` = 1 ✓; `Unlock Issue` = 1 ✓; `}, 15000);` = 1 ✓; `localStorage.setItem("ladidier_subscribed", "true")` = **2** (expected 1, see deviation note) | Three of four match exactly; one diverges | **PASS with one documented deviation** |
| F | Voice compliance on added lines | `git diff <phase-baseline> -- pages.jsx \| grep '^+' \| grep '!'` / `grep -E '\bSALE\b\|\bNOW\b'` / `grep -E '%\|\$[0-9]'` — added lines only | All three checks: `none` | **PASS** |
| G | No design-system drift | `git diff --stat <phase-baseline> -- styles.css \| wc -l` = `0`; `git diff <phase-baseline> -- pages.jsx \| grep '^+' \| grep -E 'background:\|color: "var\(--gold\)"'` = `none` | styles.css diff-stat = `0`; no inline color/background override on any added `.btn` line | **PASS** |

Phase baseline commit used for Gates F/G: `26e459b` (docs(04): create phase 4 copy & CTA conversion plans — last commit before 04-01-PLAN.md first existed).

### Deviation notes on Gate D and Gate E (documented, not fixed — Rule 3/out-of-scope classification)

**Gate D — `Est. {s.est}` count is 4, not 2:**
The plan's acceptance criteria expected exactly 2 occurrences (StoresPreview home card, StoresPage Gallery card — the two D-06/CTA-05 target sites this phase added/verified). Direct inspection (`grep -n 'Est\. {s\.est}' pages.jsx`) shows 4 total occurrences in the file:
- Line 156 — `HeroIndex`'s list-style store rows (pre-existing before this phase, untouched by any Phase 4 commit)
- Line 262 — `StoresPreview` (Home) — **added by Plan 04-02**, the intended D-06 target
- Line 723 — `StoresPage` Index/list view pill (pre-existing, explicitly out of scope per 04-RESEARCH.md: "StoresPage's own Est./category display does not need restyling")
- Line 747 — `StoresPage` Gallery view (pre-existing; only the adjacent CTA label changed from "Enter →" to "Visit the Boutique →" in Plan 04-03, the "Est." span itself was untouched)

Cross-checked against the phase-baseline diff (`git diff 26e459b -- pages.jsx`): only ONE new `Est. {s.est}` span was added by this phase (Plan 04-02's StoresPreview card). The other three occurrences predate the phase and were never in this phase's edit scope. This is a miscount in the plan's own Gate D acceptance criteria (it undercounted pre-existing occurrences of an already-common literal string), not a functional defect. The two D-06-relevant sites (StoresPreview, StoresPage Gallery) both correctly render "Est. {s.est}", satisfying CTA-05/D-06 as written. **Reported as a phase-gap-in-the-checklist, not fixed.**

**Gate E — `localStorage.setItem("ladidier_subscribed", "true")` count is 2, not 1:**
This exact discrepancy was already surfaced and explained in 04-04-SUMMARY.md's "Issues Encountered" section: the second occurrence is a pre-existing, unrelated line in `SubscribePage` (pages.jsx, out-of-phase-scope page), not introduced by any Phase 4 plan and not part of the Magazine paywall mechanic (which lives at pages.jsx:375-408, 476-490 and was confirmed byte-identical via scoped `git diff --stat` in Plan 04-04). The paywall mechanic itself is intact and singular where it matters (the `}, 15000);` timer count and the gate heading/button labels are each exactly 1, as expected). **Known, already-documented, out-of-scope pre-existing duplicate — reported, not fixed.**

### Source-file modification check (Task 1)
`git status --porcelain pages.jsx styles.css components.jsx` → empty. Task 1 modified no source file, as required.

## Task 2 — Human friction audit click-through, desktop and phone

**Outcome: `approved`**

The developer performed a live click-through of Home (all three Tweaks-panel hero variants: Manifest, Split, Index), Stores (Index and Gallery views), and Magazine (paywall gate, repaired PDF/View-full-issue CTA, SubscribeBanner) at both desktop width and phone width (≤480px, DevTools device toolbar), following the plan's 9-step `how-to-verify` checklist verbatim. The developer returned the literal resume-signal `"approved"` with no issues reported, satisfying the plan's `<done>` requirement for Task 2 and the `<resume-signal>` contract.

No CTA reported as inert, no stale copy reported visible in any hero variant, no overflow/collision reported at phone width, no console errors reported.

## Friction Audit Findings — 04-RESEARCH.md row-by-row accounting

Every row of 04-RESEARCH.md's "Friction Audit Findings" table is accounted for:

| Location | Element | Findings-table status | This audit's outcome |
|----------|---------|------------------------|------------------------|
| `HeroManifest` | "Read the issue" / "Enter the stores" → now "Shop the Houses" (primary) + demoted reading CTA | Working (pre-phase) | Verified working; primary CTA now `Shop the Houses`, filled, routes to Stores (Task 2 step 1) |
| `HeroSplit` | "Open the issue" / "How to subscribe →" → now "Shop the Houses" (primary) + demoted reading CTA | Working (pre-phase) | Verified working; same primary-CTA promotion confirmed (Task 2 step 1) |
| `HeroIndex` | "The full directory →" / per-store rows / "See all →" → now "Shop the Houses →" (primary) | Working (pre-phase) | Verified working; old label absent, per-store rows and directory link function (Task 2 steps 1-2) |
| `FeaturedStories` | "All stories →" / article cards | Working, out of phase's requirement list, included for completeness | Verified working (Task 2 step 3) |
| `StoresPreview` | "Open the directory →" → now "Discover the Directory →" / per-store card `<a href={s.url}>` | Working (pre-phase) | Verified working; `Est.` microcopy on all 14 cards, click opens real external store (Task 2 step 2) |
| `SubscribeBanner` | "Choose your subscription" / "Continue reading freely →" | **D-09 confirmed bug — required fix** | Fixed in Plan 04-04; verified now smooth-scrolls to top on click (Task 2 step 3) |
| `StoresPage` list view | Row click | Working, needed `aria-label` per D-04 | Verified working; `aria-label` added in Plan 04-03, rows open correct external store, unchanged size (Task 2 step 4) |
| `StoresPage` grid view | Card `<a href={s.url}>` | Working, needed label swap per D-05 | Verified working; all 14 cards read `VISIT THE BOUTIQUE →`, correct external stores (Task 2 step 5) |
| `StoresPage` view toggle | "Index" / "Gallery" buttons | Working, in-page state, not a nav CTA | Not a friction concern; unaffected by this phase, unchanged |
| `MagazinePage` paywall form | "Unlock Issue" | Working — do not touch | Verified untouched and functioning; paywall still appears at ~15s, subscribe persists across reload (Task 2 step 6) |
| `MagazinePage` preview indicator | "Subscribe to See All →" | Working | Verified working (Task 2 step 6) |
| `MagazinePage` cover-story panel | "Read the letter" / "Download issue (PDF)" | **New finding — second dead CTA, no onClick/href** | Fixed in Plan 04-04 (now "View full issue →", smooth-scrolls to flipbook); verified working (Task 2 step 7) |

All 13 rows verified. No new dead-end found during either the static sweep or the human click-through.

## Out-of-scope known issues confirmed still present (reported, not fixed)
- `Footer`'s `preventDefault()`-only links (`components.jsx:326-343`) — sitewide chrome, deferred by user (04-RESEARCH.md Open Question 3, CONTEXT.md Deferred Ideas)
- `SubscribePage`'s stale "Access to all 11 stores" (`pages.jsx`, outside Home/Stores/Magazine boundary) — deferred by user (04-RESEARCH.md Open Question 2)

## Files Created/Modified
- `.planning/phases/04-copy-cta-conversion-pass/04-05-SUMMARY.md` - this file (final audit record)
- `.planning/phases/04-copy-cta-conversion-pass/04-05-SUMMARY.draft.md` - deleted, content folded into this summary

No `pages.jsx`, `styles.css`, or `components.jsx` changes — confirmed via `git status --porcelain pages.jsx styles.css components.jsx` returning empty both after Task 1 and again at final plan completion.

## Decisions Made
- Gate D and Gate E numeric deviations were investigated and traced to pre-existing, out-of-phase-scope occurrences rather than defects introduced by this phase — documented rather than "fixed" (there is nothing broken to fix; the plan's own acceptance-criteria counts were undercounts of an already-common literal string / an already-known pre-existing SubscribePage line).

## Deviations from Plan

### Auto-fixed Issues

None — this plan modifies no source file by design (`files_modified: []`), so Rules 1-3 (auto-fix) had no applicable target. The two count deviations above (Gate D, Gate E) are checklist-accuracy findings, not code defects, and were resolved by documentation/tracing rather than code change.

---

**Total deviations:** 0 auto-fixed
**Impact on plan:** None — the two documented gate-count deviations are miscounts in the plan's own acceptance criteria (undercounting pre-existing, out-of-scope literal-string occurrences), not functional defects. No scope creep, no source changes.

## Issues Encountered
None beyond the two documented, already-traced gate-count deviations (see above). No blocking issues, no auth gates.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- CTA-07 is the last of the seven CTA requirements (CTA-01 through CTA-07) — Phase 4 is now fully complete, all 5 plans executed and verified
- Phase 5 (Hidden Perks Discovery Feature) can proceed; it depends on Phase 4 per ROADMAP.md and no blockers were surfaced
- Both out-of-scope known issues (Footer dead links, SubscribePage stale "11 stores") remain unresolved and are not blocking Phase 5 — they stay tracked as deferred per CONTEXT.md

## Self-Check: PASSED
- FOUND: `.planning/phases/04-copy-cta-conversion-pass/04-05-SUMMARY.md`
- REMOVED: `.planning/phases/04-copy-cta-conversion-pass/04-05-SUMMARY.draft.md` (draft content folded into this file, then deleted)
- CONFIRMED: `git status --porcelain pages.jsx styles.css components.jsx` returns empty — no source file modified by this plan

---
*Phase: 04-copy-cta-conversion-pass*
*Completed: 2026-08-21*
