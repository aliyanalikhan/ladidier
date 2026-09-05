# Plan 10-02 Summary: Avatar Video Engine — Reducer, Widget Tracer & Session Flag

**Execution Date:** 2026-09-05  
**Status:** Completed  

## Delivered Artifacts
- `src/avatarReducer.js`: Pure `useReducer` reducer, zero imports (the `theme.js` role). Exports `AVATAR_PHASES` (frozen `{INTRO:'intro',IDLE:'idle',ANSWERING:'answering'}`), `initAvatarState(introAlreadyPlayed)` (truthy→idle, else intro), and `avatarReducer(state, action)`. State shape: `{ phase, questionId, generation }`. Actions: `INTRO_ENDED`, `ASK` (payload `questionId`), `ANSWER_ENDED` (payload `generation`). `ASK` is legal from idle AND answering (always `generation+1` — rapid re-asks retire earlier answers); `ANSWER_ENDED` uses a strict-equality generation guard and returns the referentially identical state object on mismatch/absent generation (Pitfall C / AVATAR-05).
- `src/avatarReducer.test.js`: 17 reducer tests via `node:test` + `node:assert/strict`, zero new dependencies — covers all legal/illegal transitions, the generation guard (stale, absent, null), ASK-from-answering supersede, unknown-action passthrough, `initAvatarState` both branches, and Task 2's degradation cases (undefined→intro coercion, stray `INTRO_ENDED` from idle harmless, full ASK/ANSWER_ENDED round-trip from `initAvatarState(true)`).
- `src/avatarFaq.jsx`: Single self-contained feature file exporting `{ AIAvatarFAQ }`. Contains `useVideoAvatar()` (the state machine wired to one persistent `<video>` element — no React key, no remount), `AvatarVideo` (sets `muted`+`playsInline`+`autoPlay` triad together, `preload="auto"`), and `AIAvatarFAQ` (mounted via `createPortal(..., document.body)` to escape `.page-fade`'s transform containing block — Pitfall G; interim D-04 UI is one q1 button). DOM-sync effect keyed `[videoSrc, muted]`: `v.muted` IDL property → `v.load()` → `v.play()` promise branching (AbortError swallowed; real rejection sets `blocked` → "Tap to play" fallback whose click calls `play()` synchronously for user-gesture attribution). Session flag (AVATAR-06): `AVATAR_INTRO_PLAYED_KEY = "ladidier_avatar_intro_played"` in sessionStorage (session-scoped, NOT localStorage — Pitfall E), read lazily via `useReducer(avatarReducer, hasIntroPlayedThisSession(), initAvatarState)`, written by `markIntroPlayed()` on intro COMPLETION (never on mount — an interrupted intro replays), both sides try/catch-guarded so storage failures never break playback.
- `src/pages.jsx`: `AIAvatarFAQ` mounted inside `HomePage` (not App level) after `SubscribeBanner`, gated `{!printMode && <AIAvatarFAQ />}` — the route-keyed `<main>` unmounts it on navigate, stopping playback for free (Pitfall D). `HomePage` signature gained `printMode = false`.
- `src/print-app.jsx`: renders `<HomePage setRoute={noop} heroVariant={THEME.hero} printMode={true} />` so the print build excludes the widget.
- `src/styles.css`: 42-line append (pure append, no reformat) — `.avatar-faq-widget` (fixed, right/bottom 24px, `min(360px, calc(100vw - 48px))` width, `z-index: 40` — below `.mobile-overlay`'s 100), `.avatar-faq-video`, `.avatar-faq-question-btn` (44px min-height tap target), and a `@media (max-width: 480px)` override (16px insets, full width).

## Verification
- `node --test src/avatarReducer.test.js src/avatarFaqData.test.js`: 29/29 pass (17 reducer + 12 data), 0 failures.
- `npm run build` exits 0.
- All 15 plan source gates pass, including: `AVATAR_INTRO_PLAYED_KEY` literal exactly once, all three flag-function names present, `try {` ×2 (read + write sides), write-before-dispatch ordering in `onIntroEnded`, reducer zero-import (the single "import" grep match is the comment "No imports — zero React dependency."), and `package.json`/`package-lock.json` untouched.
- **Repair record:** Task 1's initial commit (`e37a62f`) was corrupted by a large multi-block apply_diff (styles.css ballooned 1305→2353 lines — ~1048 lines of reformat churn plus partial duplication). Repaired by restoring the three touched files from HEAD~1, re-applying the intended edits via a one-shot Node script with found-exactly-once/count assertions, and amending (safe: branch unpushed). Final `3a22596` is surgical (styles.css a pure 43-line append) and fully re-verified — 26/26 tests, build, and all gates re-run green after the repair.

## Commits
- `3a22596` — feat(10-02): avatar video engine tracer — reducer, widget, portal mount (AVATAR-01..05) — 6 files, 387 insertions/2 deletions
- `1907ceb` — feat(10-02): intro-plays-once-per-session — markIntroPlayed write side + storage-failure degradation tests (AVATAR-06) — 2 files, 48 insertions/1 deletion

## Notes for Downstream Plans
- **`useVideoAvatar()` return shape (plan 10-03 consumes this verbatim):**
  ```
  { phase, activeQuestionId, videoRef, videoSrc, muted, loop, blocked,
    onIntroEnded, onAnswerEnded, askQuestion, retryPlay }
  ```
  - `phase`: current `AVATAR_PHASES` value (`'intro' | 'idle' | 'answering'`)
  - `activeQuestionId`: the asked question's id, or `null`
  - `videoRef` / `videoSrc` / `muted` / `loop`: bind to the ONE persistent `<video>` element — never add a React key or remount it
  - `blocked`: true when autoplay was rejected — render the "Tap to play" fallback, whose click must call `retryPlay()`
  - `onIntroEnded()`: fires on the intro's `onEnded` — writes the session flag, then dispatches `INTRO_ENDED`
  - `onAnswerEnded()`: fires on an answer's `onEnded` — dispatches `ANSWER_ENDED` with the current generation
  - `askQuestion(questionId)`: dispatches `ASK` — legal from idle AND answering
  - `retryPlay()`: re-issues `play()` synchronously inside the click handler
- **`avatarReducer` action names (plan 10-03 consumes this verbatim):** `INTRO_ENDED`, `ASK` (payload `questionId`), `ANSWER_ENDED` (payload `generation`). Plus `initAvatarState(introAlreadyPlayed)` and `AVATAR_PHASES`. The state object is `{ phase, questionId, generation }`.
- `FAQ_QUESTIONS_BY_ID` and `FAQ_CATEGORIES` are `Object.freeze`d — consumers must never mutate them.
- The interim UI is a single q1 button (D-04); plan 10-03 widens it to all 15 questions + 4 categories and adds the mobile-nav pairing (`AVATAR_MOBILENAV_EVENT`, `.avatar-faq-category` classes).
- Widget z-index is 40 — anything plan 11+ stacks above it must stay below `.mobile-overlay`'s 100 or explicitly re-derive the ordering.
