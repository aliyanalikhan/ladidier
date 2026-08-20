---
phase: 04-copy-cta-conversion-pass
plan: 04
subsystem: ui
tags: [react, jsx, copy, cta, magazine-page, subscribe-banner, dead-cta-fix]

# Dependency graph
requires:
  - phase: 04-copy-cta-conversion-pass
    provides: "Plan 01/02/03's D-01 CTA voice conventions and the confirmed-no-PDF-asset finding from 04-PATTERNS.md"
provides:
  - "MagazinePage header lede and paywall gate lede reframed toward the houses/shopping tie-in (CTA-06, D-07)"
  - "MagazinePage 'Download issue (PDF)' dead CTA repurposed into a working 'View full issue ->' scroll-to-iframe CTA (CTA-07, D-10)"
  - "SubscribeBanner's 'Continue reading freely ->' dead CTA wired to a smooth-scroll-to-top action across all five render sites (CTA-07, D-09)"
affects: [04-05]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Reused the codebase's one smooth-scroll precedent (window.scrollTo({ top: 0, behavior: 'smooth' }), first seen at components.jsx:104) for SubscribeBanner's fix"
    - "Extended the same scroll-behavior idiom to a targeted-element form (iframeRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' })) for the PDF-button repurpose, guarded on a truthy ref check"

key-files:
  created: []
  modified:
    - pages.jsx

key-decisions:
  - "Paywall/subscribe mechanic lines (gate heading, Unlock Issue label, form onSubmit, localStorage.setItem call, the 15000ms timer, and the Heyzine message listener) were left byte-identical, confirmed via git diff --stat showing changes confined to the two paragraph bodies edited in Task 1"

patterns-established: []

requirements-completed: [CTA-06, CTA-07]

# Metrics
duration: ~8min
completed: 2026-08-20
---

# Phase 4 Plan 4: Magazine Copy Reframe and Dead-CTA Repairs Summary

**Reframed the Magazine page's two ledes toward a houses/shopping tie-in without touching a single paywall/subscribe mechanic line, then repaired the phase's two confirmed dead CTAs — MagazinePage's inert "Download issue (PDF)" button and SubscribeBanner's inert "Continue reading freely →" button, both now performing observable scroll actions.**

## Performance

- **Duration:** ~8 min
- **Started:** 2026-08-20 (post 04-03 completion)
- **Completed:** 2026-08-20
- **Tasks:** 3 completed
- **Files modified:** 1 (`pages.jsx`)

## Accomplishments

- `MagazinePage`'s header lede (pages.jsx:425-427) now reads "...the small obsessions that make a life — and the fourteen houses that made them. Open to all readers, always." — the opening sentence and the "Open to all readers, always" reassurance clause survive verbatim; only an em-dash clause was inserted in the site's existing cadence (CTA-06, D-07).
- The paywall gate lede (pages.jsx:479) now closes with "...and shop the houses first," while the gate heading "Subscribe to See All Pages", the "Unlock Issue" submit button, the `<form onSubmit>` handler, the `localStorage.setItem("ladidier_subscribed", "true")` call, and the 15000ms fallback timer are all byte-identical to their pre-edit state, confirmed by a scoped `git diff --stat` showing changes confined to the two paragraph bodies (CTA-06, D-07).
- `MagazinePage`'s dead "Download issue (PDF)" button (pages.jsx:571, no PDF asset exists anywhere in the project) is now labelled "View full issue →" and smooth-scrolls the already-declared `iframeRef` into view via `scrollIntoView({ behavior: "smooth", block: "center" })`, guarded on a truthy ref check. No `download`, `href`, or `.pdf` reference was added; no new ref, state, or component was created (CTA-07, D-10).
- `SubscribeBanner`'s dead "Continue reading freely →" button (pages.jsx:366) now calls `window.scrollTo({ top: 0, behavior: "smooth" })`, reusing the codebase's one existing scroll precedent (`components.jsx:104`). The fix lives in the shared component body, so it applies identically across all five render sites (Home, Stores, Magazine, Article, About) with zero per-page branching, confirmed by `<SubscribeBanner setRoute={setRoute} />` still appearing identically 5 times (CTA-07, D-09).
- After this plan, zero `<button>` elements in `pages.jsx` lack a click handler (verified via the file-wide inert-button grep filter).

## Task Commits

Each task was committed atomically:

1. **Task 1: Reframe Magazine landing copy toward the houses** - `bffc8ec` (fix)
2. **Task 2: Repurpose the dead "Download issue (PDF)" button into a working issue CTA** - `713600c` (fix)
3. **Task 3: Wire the SubscribeBanner's dead secondary CTA** - `23607ef` (fix)

**Plan metadata:** (this commit)

## Files Created/Modified

- `pages.jsx` - `MagazinePage` function: header lede copy, paywall gate lede copy, PDF-button repurpose; `SubscribeBanner` function: secondary CTA `onClick` wiring

## Decisions Made

- No structural change, new section, or store cross-sell component was added to Magazine — both copy edits are light-touch paragraph-body swaps only, per D-07 and CONTEXT.md's explicit deferral of a full cross-sell section.
- The PDF button's fix reuses the already-declared `iframeRef` (declared pages.jsx:380, attached to the flipbook iframe at pages.jsx:447) rather than creating any new ref, state, or DOM lookup — kept the fix to the minimal existing-scope change the plan specified.
- SubscribeBanner's fix was applied once to the shared function body rather than special-cased per calling page, per the plan's explicit scope note and 04-RESEARCH.md Pitfall 3 — the fix's five-page blast radius (including Article and About, nominally out of this milestone's page scope) is accepted as unavoidable since the component takes no page-identity prop.

## Deviations from Plan

None - plan executed exactly as written. Line numbers in the executed file differ slightly from the plan's stated numbers (e.g. header lede at pages.jsx:425-427 vs. the plan's 418-421, PDF button at pages.jsx:571 vs. the plan's 564) due to line drift accumulated from Plans 01-03's prior edits to the same file — content and structure at each site matched the plan's `read_first`/`action` descriptions exactly, so no re-scoping was needed.

## Issues Encountered

The plan's Task 1 acceptance criterion `grep -c 'localStorage.setItem("ladidier_subscribed", "true")' pages.jsx` outputs `1` did not hold — the actual count is `2`. Investigation confirmed the second occurrence is a pre-existing, unrelated line in `SubscribePage` (pages.jsx:772), not introduced by this plan's edits and not part of the paywall mechanic under the do-not-touch boundary (pages.jsx:375-408, 476-490). A scoped `git diff --stat` and `git diff` on the commit confirmed the only lines changed were the two lede paragraph bodies — the actual mechanic-preservation intent of the acceptance criterion (that Task 1 not modify the paywall's subscribe mechanic) is satisfied; the criterion's literal count expectation was stale relative to the file's current contents.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Phase 4's CTA-06 and CTA-07 requirements are now fully satisfied: Magazine copy carries the shopping tie-in without disturbing paywall/subscribe mechanics, and both of the phase's confirmed dead CTAs (D-09, D-10) now perform observable actions.
- Manual verification recommended: clear `localStorage`, load Magazine, confirm the paywall overlay still appears after ~15s and that submitting an email still unlocks and persists the subscribed flag. Click "View full issue →" and confirm the flipbook iframe smooth-scrolls into view with no console error. Click "Continue reading freely →" at the bottom of Home, Stores, and Magazine and confirm each smooth-scrolls to page top. Repeat at <=480px viewport width.
- Remaining Phase 4 work (if any) is limited to plan 04-05's closeout/validation pass per the roadmap; this plan's scope (`pages.jsx` MagazinePage + SubscribeBanner) is fully closed.

---
*Phase: 04-copy-cta-conversion-pass*
*Completed: 2026-08-20*

## Self-Check: PASSED

- FOUND: pages.jsx
- FOUND: 04-04-SUMMARY.md
- FOUND: bffc8ec
- FOUND: 713600c
- FOUND: 23607ef
