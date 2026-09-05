---
phase: quick-260905-twl
plan: 01
subsystem: ui
tags: [css, mask-image, magazine-frame, avatar-faq]

requires:
  - phase: quick-260905-t26
    provides: "moved .avatar-faq-widget in-flow into Home's Manifesto left column (fixed the sizing question this task resolves)"
  - phase: quick-260905-rw7
    provides: ".avatar-faq-overlay pill/badge/chip chrome floating over the video, whose 16px padding is the legibility budget this task's fade bands had to stay under"
provides:
  - "380px .avatar-faq-widget cap (up from 320px) with 8px border-radius matching .magazine-frame"
  - "Four-edge feathered mask (linear-gradient x2, mask-composite: intersect / -webkit source-in) replacing the hard 1px --mute outline"
affects: [phase-11-widget-ui, avatar-faq-visual-polish]

actuals:
  tokens: 700
  tasks: 1
  commits: 1

tech-stack:
  added: []
  patterns:
    - "Two-layer linear-gradient CSS mask with mask-composite: intersect for edge-feather vignettes on rectangular boxes (radial-gradient masks cannot satisfy corner-opacity + edge-fade simultaneously — documented in the plan's <technical_findings>)"

key-files:
  created: []
  modified:
    - "src/styles.css - .avatar-faq-widget: 320px->380px, +border-radius: 8px, removed --mute outline, added prefixed/unprefixed mask-image + mask-composite"

key-decisions:
  - "380px width chosen (not 360 or 400) as the documented mid-range 'a bit bigger' step from the plan's technical_findings"
  - "Two composited linear-gradient edge bands used instead of the task context's suggested radial-gradient vignette, which the plan's technical_findings proved produces zero visible fade at any radius that also keeps the bottom pill corners opaque"
  - "No box-shadow added — a CSS mask clips to border-box and would erase an outer shadow outright; matching .magazine-frame's lift shadow needs a wrapper element in src/avatarFaq.jsx, deferred as a checkpoint question rather than silently dropped"

requirements-completed: [QUICK-260905-twl]

coverage:
  - id: D1
    description: "Widget resized to 380px, rounded to 8px, hard outline removed, four edges feather to transparent via composited linear-gradient mask, all .avatar-faq-overlay controls stay fully opaque"
    requirement: "QUICK-260905-twl"
    verification:
      - kind: unit
        ref: "inline node -e assertion script in Task 1 (selector count, required declarations present, --mute outline absent, box-shadow absent, file line count 1435-1500) — exit 0"
        status: pass
    human_judgment: true
    rationale: "Visual size, fade strength, and pill legibility are subjective/rendering judgments a human must confirm in a real browser (Task 2's blocking checkpoint) — a passing static assertion proves the CSS declarations exist correctly but not that the rendered result looks 'a bit bigger' and 'professional' as the user asked."

duration: ~10min
completed: 2026-09-05
status: complete
---

# Quick Task 260905-twl: Polish Avatar Widget's Visual Frame — Summary

**`.avatar-faq-widget` widened 320px→380px with 8px rounded corners matching `.magazine-frame`, hard `--mute` outline replaced by a four-edge composited linear-gradient mask that feathers the box into the page background.**

## Performance

- **Duration:** ~10 min
- **Completed:** 2026-09-05
- **Tasks:** 1 of 2 (Task 2 is a blocking human-verify checkpoint, not yet resolved)
- **Files modified:** 1 (`src/styles.css`)

## Accomplishments

- Widened `.avatar-faq-widget` from a 320px to a 380px cap (~676px tall at the unchanged 9:16 aspect ratio) — resolves the open sizing question left by quick task 260905-t26 in the "bigger" direction, per the user's explicit follow-up request.
- Added `border-radius: 8px`, reusing `.magazine-frame`/`.paywall-gate`'s existing framed-media radius rather than inventing a new value.
- Removed the 1px `--mute` outline — a crisp rectangle drawn around a box whose edges are meant to dissolve was self-contradictory and would read as a rendering bug.
- Added a two-layer `linear-gradient` mask (`mask-composite: intersect`, `-webkit-mask-composite: source-in`) that feathers all four edges: ~11.4px side bands at 380px width, ~13.5px top/bottom bands at ~676px height — both under `.avatar-faq-overlay`'s 16px padding, so pills/badges/chips/"More topics"/"Back" stay fully opaque.
- Deliberately did **not** add an outer `box-shadow` (would be erased outright by the mask, per CSS Masking L1 clipping to border-box) — recorded in the banner comment and surfaced as an explicit question at the Task 2 checkpoint rather than silently dropped.

## Task Commits

Each task was committed atomically:

1. **Task 1: Resize, round, and feather `.avatar-faq-widget` in one scoped edit** - `fc73344` (feat)

Task 2 (checkpoint:human-verify, gate="blocking") has not been executed by this run — see "Next Phase Readiness" below.

**Plan metadata:** pending — orchestrator commits `.planning/` docs separately per this run's constraints.

## Files Created/Modified

- `src/styles.css` - `.avatar-faq-widget` rule (banner comment + declaration block): width 320px→380px, `+border-radius: 8px`, removed `border: 1px solid var(--mute)`, added prefixed/unprefixed two-layer linear-gradient `mask-image` + `mask-composite`/`-webkit-mask-composite`.

## Decisions Made

- 380px chosen as the documented mid-range "a bit bigger" step (+18.75% over 320px), sitting inside the 360-400px band the request allows and comfortably inside the ~433px left column at a 1200px container.
- Two composited linear-gradient edge bands used in place of the task context's literal suggested `radial-gradient` — the plan's `<technical_findings>` proved by direct geometry that a centered radial vignette at any radius that keeps the bottom pill corners opaque leaves the side edges fully opaque too (mutually exclusive constraints), so it would have been dead CSS.
- Fade percentages tuned to 3%/97% horizontal and 2%/98% vertical, both resolving to bands narrower than `.avatar-faq-overlay`'s 16px control-legibility budget at the new 380px×676px dimensions.
- No `box-shadow` added; the omission is explained in the banner comment and explicitly surfaced as a follow-up question at Task 2's checkpoint rather than silently dropped, per the plan's `<technical_findings>` and `<success_criteria>`.

## Deviations from Plan

None — plan executed exactly as written. Both `<technical_findings>` corrections (radial→linear-gradient mask; no box-shadow) were already anticipated and specified in the plan itself, not discovered during execution, so they are not deviations — they were the plan's literal instructions.

## Editing Protocol Compliance

- Single `Edit` call replaced the contiguous banner-comment + rule region (was lines 1307-1325), per `<editing_protocol>`.
- `git diff --numstat -- src/styles.css` immediately after: **26 insertions, 2 deletions** (28 total, well under the 80-line tripwire).
- `wc -l src/styles.css`: **1462** lines (within the required 1435-1500 range).
- No reformat corruption occurred; no restore/retry was needed.
- Automated Node assertion script (selector count, required declarations, absence of `--mute` outline and `box-shadow` in the rule body, file line count) **exited 0**.
- `git status --porcelain` confirmed no modification to `src/avatarFaq.jsx`, `src/pages.jsx`, `src/print-app.jsx`, `src/avatarReducer.js`, `src/avatarReducer.test.js`, or `src/avatarFaqData.js`, and no `dist/` paths were staged.
- Only `src/styles.css` was staged (`git add src/styles.css`) and committed — none of the pre-existing unrelated uncommitted changes in the working tree (`.gsd/dispatch-isolation-sentinel.json`, `.planning/config.json`, `dist/` churn, untracked scratch scripts) were touched or staged.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

**Task 2 (checkpoint:human-verify, gate="blocking") is pending** and was intentionally not attempted by this executor run per its instructions. The developer needs to run `npm run dev`, open the Home page, scroll to the Manifesto section, and judge:

1. **Size** — does 380px (≈676px tall) read as "a bit bigger" and well-proportioned against the paragraph column, or is it now too tall?
2. **Fade** — do all four edges visibly dissolve into the page with no hard line anywhere? (If edges look crisp, the browser is silently ignoring `mask-composite` — flag it and a fallback will be added.)
3. **Legibility** — are the lettered question pills, "More topics", keyword chips, and "Back" all still fully crisp, readable, and clickable?
4. **Shadow decision** — does the feathered edge alone read as finished, or is the deferred `.magazine-frame`-style drop shadow (which would require a wrapper element in `src/avatarFaq.jsx`) wanted as a follow-up?

Resume signal for Task 2: "approved", or a description of what to change (size, fade strength, or the shadow follow-up).

Optional, non-blocking: with rounded corners now in play, the "Tap to play" fallback button (only appears if autoplay is blocked; not exercised on the physical-iPhone D-10 pass) is still pinned at a square `top:12px; left:12px` — worth a nudge inward if the developer wants it, but out of this task's scope.

## Self-Check

- FOUND: `src/styles.css` contains exactly one `.avatar-faq-widget` rule (verified via `grep -c` before edit and the assertion script's selector-count check after).
- FOUND: commit `fc73344` — verified present in `git log --oneline -1`.

## Self-Check: PASSED

---
*Phase: quick-260905-twl*
*Completed: 2026-09-05*
