---
phase: quick-260905-rw7
plan: "01"
subsystem: avatar-faq
tags: [avatar-video, react, css, ui-redesign, phase-10, phase-11]
status: complete

# Dependency graph
requires:
  - phase: 10-04
    provides: avatarReducer.js state machine, useVideoAvatar hook, single persistent <video>, document.body portal, AVATAR_MOBILENAV_EVENT pause listener — all left untouched by this task
provides:
  - FAQ_STARTER_IDS export (src/avatarFaqData.js) — the single source of the 4-question opening set
  - keyword field on each FAQ_CATEGORIES entry — one-word chip label per category
  - FAQPill + FAQOverlay components (src/avatarFaq.jsx) replacing FAQCategories, with starters/topics/category progressive-disclosure view state
  - Overlay-on-video CSS chrome (.avatar-faq-overlay, .avatar-faq-pill*, .avatar-faq-chip*, .avatar-faq-more-btn, repositioned .avatar-faq-tap-to-play)
affects: [phase-11-widget-ui-launcher-categories-bespoke-chrome]

actuals:
  tokens: 4808
  tasks: 2
  commits: 2

tech-stack:
  added: []
  patterns:
    - "Component-local view state (useState) for presentation-only navigation, kept explicitly separate from reducer/playback state"
    - "Progressive disclosure: starter subset -> category chips -> per-category items, with a stale-state fallback to the safe default view"

key-files:
  created: []
  modified:
    - src/avatarFaqData.js
    - src/avatarFaqData.test.js
    - src/avatarFaq.jsx
    - src/styles.css

key-decisions:
  - "FAQ_STARTER_IDS hardcoded to q1/q6/q12/q14 (lead question of each category in D-01 order) per the plan's explicit instruction, not derived/randomized"
  - "View state (starters/topics/category id) implemented as FAQOverlay's own useState, never touching avatarReducer.js — presentation and playback stay fully decoupled"
  - "Unknown/stale category id in view state falls back to rendering the starters branch rather than an empty panel (STRIDE T-rw7-03 mitigation)"
  - "Selecting a question does not reset view — visitor stays at the same drill-down depth so they can pick a second question from the same place"

requirements-completed: [FAQ-03, WIDGET-03]

coverage:
  - id: D1
    description: "Opening the widget shows exactly 4 lettered pills (starter set) overlaid on the video, never all 15 questions and never the 4 category headings"
    requirement: "FAQ-03"
    verification:
      - kind: unit
        ref: "src/avatarFaqData.test.js#FAQ_STARTER_IDS holds 3 to 4 ids"
        status: pass
      - kind: unit
        ref: "src/avatarFaqData.test.js#every FAQ_STARTER_IDS id resolves in FAQ_QUESTIONS_BY_ID"
        status: pass
      - kind: unit
        ref: "src/avatarFaqData.test.js#the FAQ_STARTER_IDS ids map onto four distinct categories"
        status: pass
    human_judgment: true
    rationale: "Visual rendering (pill layout on the scrim, no below-video list) requires a human to compare the running app against the reference screenshot — this is exactly Task 3's checkpoint, not yet approved."
  - id: D2
    description: "Clicking any visible question pill plays that question's answer clip via the unchanged askQuestion(questionId) -> dispatch({type:'ASK'}) contract"
    requirement: "FAQ-03"
    verification:
      - kind: unit
        ref: "git diff --name-only -- src/avatarReducer.js src/avatarReducer.test.js (empty output, verified)"
        status: pass
      - kind: unit
        ref: "src/avatarReducer.test.js (17/17 passing, unchanged)"
        status: pass
    human_judgment: true
    rationale: "Actual clip playback with sound on click is a runtime/human verification, part of Task 3's checkpoint."
  - id: D3
    description: "'More topics' reveals 4 one-word keyword chips; selecting a chip reveals that category's questions as lettered pills; 'Back' reverses each step; all 15 questions reachable within two clicks"
    requirement: "WIDGET-03"
    verification:
      - kind: unit
        ref: "src/avatarFaqData.test.js#every category has a non-empty keyword"
        status: pass
      - kind: unit
        ref: "src/avatarFaqData.test.js#the four keywords are distinct single words with no spaces"
        status: pass
    human_judgment: true
    rationale: "Click-path navigation (chips -> category pills -> Back) is a visual/interactive flow verified by the human at Task 3's checkpoint, not by static tests."
  - id: D4
    description: "Overlay chrome: circular lettered badge + text pill rows on a dark translucent scrim positioned over the video's lower portion, video full-bleed, no below-video list block, tap-to-play repositioned to stay visible"
    verification:
      - kind: unit
        ref: "grep -cE '^\\.avatar-faq-(questions|category|category-label|question-btn)' src/styles.css == 0"
        status: pass
      - kind: unit
        ref: "grep -cE 'className=\"avatar-faq-(questions|category|category-label|question-btn)\"' src/avatarFaq.jsx == 0"
        status: pass
      - kind: unit
        ref: "npm run build (vite build succeeds)"
        status: pass
    human_judgment: true
    rationale: "Visual scrim legibility, badge contrast against footage, and tap-to-play visibility are appearance judgments reserved for Task 3's human-verify checkpoint against the reference screenshot."

duration: ~20min
completed: 2026-09-05
---

# Quick Task 260905-rw7: Redesign Avatar FAQ Popup to Overlay-on-Video Summary

**Avatar FAQ widget rebuilt as an overlay: full-bleed video with lettered pill buttons on a dark scrim, plus a starters -> keyword-chip topics -> per-category progressive-disclosure flow, replacing the old always-show-all-15 below-video list.**

## Performance

- **Duration:** ~20 min
- **Tasks:** 2 of 3 completed and verified (Task 3 is a human-verify checkpoint, not executable by the agent)
- **Files modified:** 4 (src/avatarFaqData.js, src/avatarFaqData.test.js, src/avatarFaq.jsx, src/styles.css)

## Accomplishments

- **Task 1 (tracer):** Wired one end-to-end path — `FAQ_STARTER_IDS` (data) -> `FAQOverlay`/`FAQPill` (component) -> overlay/pill/badge/tap-to-play CSS (stylesheet) — so 4 lettered pills render on a dark scrim over a full-bleed video and each still calls `askQuestion(id)` unchanged.
- **Task 2 (auto):** Expanded the proven slice into full progressive disclosure — `keyword` field on each category, `FAQOverlay` local `view` state (starters/topics/category id), `.avatar-faq-chips`/`.avatar-faq-chip`/`.avatar-faq-more-btn` CSS — so all 15 questions stay reachable in at most two clicks without ever showing more than one subset at a time.
- 5 new tests added to `src/avatarFaqData.test.js` (3 for `FAQ_STARTER_IDS`, 2 for `keyword`); all 17 tests in that file pass, and all 17 tests in `src/avatarReducer.test.js` still pass unchanged.

## Task Commits

Each task was committed atomically:

1. **Task 1: End-to-end starter-set overlay — one path, 4 questions on the scrim** - `c30cf5f` (feat)
2. **Task 2: Progressive disclosure — More topics, keyword chips, per-category pills** - `ec77f1f` (feat)

**Task 3 (checkpoint:human-verify) not executed** — per plan design, this is a human-only visual acceptance step against the reference screenshot. See "Checkpoint Pending" below.

## Files Created/Modified

- `src/avatarFaqData.js` - Added `FAQ_STARTER_IDS` (frozen array `["q1","q6","q12","q14"]`) and a `keyword` field (`About`/`Shipping`/`Returns`/`Payments`) on each of the 4 `FAQ_CATEGORIES` entries. No existing exports, ids, labels, or ordering changed.
- `src/avatarFaqData.test.js` - Added 5 tests: 3 for `FAQ_STARTER_IDS` (count, resolvability, category spread) and 2 for `keyword` (non-empty, distinct single words).
- `src/avatarFaq.jsx` - Deleted `FAQCategories`; added `FAQPill` (lettered badge + label button, `aria-hidden` on the decorative badge) and `FAQOverlay` (three view branches: starters / topics chips / one category's pills, via local `useState`, never touching the reducer). `AIAvatarFAQ` now renders `FAQOverlay` instead of `FAQCategories`; stale doc comment above it updated to reflect the redesign.
- `src/styles.css` - Rewrote the avatar FAQ block: `.avatar-faq-widget` fixed height + `overflow: hidden` + `--noir` background; `.avatar-faq-video` absolutely positioned full-bleed (240px cap from 260905-avc removed, its intent preserved differently); new `.avatar-faq-overlay` scrim, `.avatar-faq-pill`/`-badge`/`-label`, `.avatar-faq-chips`/`-chip`, `.avatar-faq-more-btn`; `.avatar-faq-tap-to-play` repositioned absolute so it stays visible above the now-absolutely-positioned video; mobile media query height added.

## Decisions Made

- `FAQ_STARTER_IDS` hardcoded to the plan's specified `q1, q6, q12, q14` (one per category, D-01 order) rather than derived — matches the plan's explicit instruction verbatim.
- View state lives in `FAQOverlay`'s own `useState`, explicitly documented in code as presentation state, not playback state — `avatarReducer.js` and `avatarReducer.test.js` have zero diff (verified via `git diff --name-only`).
- Unknown/stale category id in `view` renders the `starters` branch as a fallback rather than an empty panel (STRIDE threat T-rw7-03 mitigation, built exactly as specified).
- Selecting a question never resets `view` — matches plan's explicit "visitor stays where they were" requirement.
- Reused `FAQPill` for both the starter set and per-category question lists (no second pill component forked), per plan constraint.

## Deviations from Plan

None - plan executed exactly as written for Tasks 1 and 2. All CSS values, class names, comments, and component contracts match the plan's action blocks. The `.avatar-faq-more-btn` comment was slightly condensed but preserves the same rationale (gold token = affordance color, visually subordinate to pills/chips).

## Issues Encountered

None. Both tasks' automated `<verify>` blocks passed on first attempt:
- `node --test src/avatarFaqData.test.js` — 17/17 pass (12 pre-existing + 5 new)
- `node --test src/avatarReducer.test.js` — 17/17 pass, unchanged
- `npm run build` — succeeds both times
- All grep-based structural gates (no stale `avatar-faq-questions/category/category-label/question-btn` selectors or classNames; `avatar-faq-overlay` present in both files; `avatar-faq-tap-to-play` rule present; `avatar-faq-chip`/`avatar-faq-more-btn` present in both files; `keyword` count >= 4; no FAQ-04 string leaks of question text/category label/media path into `avatarFaq.jsx` or `styles.css`) — all passed exactly as the plan specified.
- `git diff --name-only -- src/avatarReducer.js src/avatarReducer.test.js` — empty, confirming the reducer/state-machine files are untouched.

## Checkpoint Pending

**Task 3: Visual acceptance against the reference screenshot** (`type="checkpoint:human-verify"`, `gate="blocking"`) was intentionally NOT executed by the agent — it requires a human to run `npm run dev` and visually compare the running widget against the reference screenshot. This SUMMARY is marked `status: complete` because Tasks 1-2 (the entire automatable portion of the plan) are done and verified; the plan's own workflow has no separate "incomplete" state for a pending human checkpoint.

**How to verify** (copied from the plan's Task 3 `<how-to-verify>`):

1. Run `npm run dev` and open the homepage. Let the intro clip finish (or reload once so the session flag is already set and it drops straight to the idle loop).
2. Compare against the reference screenshot: the buttons must sit ON the video, not in a block below it. Check the scrim reads as a soft dark fade rather than a hard band, and that the circular letter badges are legible against the footage at the bottom of the frame.
3. Confirm exactly 4 question pills are visible on open — no category headings, no long list.
4. Click one pill: its answer clip must play with sound, exactly as before this change.
5. Click "More topics": confirm 4 short keyword chips appear. Click "Shipping": confirm that category's 5 questions appear as lettered pills A-E. Click one and confirm it plays.
6. Click "Back" twice and confirm you land back on the 4 starter pills.
7. Resize the browser to a phone width (or use device emulation at 390px): confirm the widget still fits the viewport and the pills are still readable and tappable.
8. Open the mobile nav while a clip is playing and confirm playback still pauses (unchanged Phase 10 behaviour — this is a regression check, not new work).

**Resume signal:** Type "approved", or describe what does not match the reference screenshot.

**Deferred by design (not a gap to fix):** No close (X) button — see the plan's `<deferred>` section: that control is `WIDGET-02` and is only coherent alongside `WIDGET-01`'s launcher (Phase 11 scope). Shipping close-without-launcher would make the widget unrecoverable until a page reload.

## Next Phase Readiness

- The overlay chrome and progressive-disclosure navigation this task built are ready for Phase 11 to extend (launcher button, close button, bespoke additional chrome) without needing to relocate or restructure the current DOM/CSS.
- Blocked on: Task 3's human visual approval before this quick task can be considered fully closed out.
- `avatarReducer.js`, `useVideoAvatar`, `AvatarVideo`, the `document.body` portal, and `AVATAR_MOBILENAV_EVENT` wiring are all confirmed untouched — Phase 11 can build on top of this exactly as Phase 10 left it.

---
*Phase: quick-260905-rw7*
*Completed: 2026-09-05*
