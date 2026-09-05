# Plan 10-03 Summary: All 15 Questions, 4 Categories + Mobile-Nav Pause

## Delivered Artifacts

| Artifact | Where |
|---|---|
| `FAQCategories` component — all 15 questions under their 4 locked category headings, unconditional, D-01 order | `src/avatarFaq.jsx` |
| Scrollable question list — `.avatar-faq-questions` scroll area inside the widget's `max-height` cap (UI-SPEC overflow state) | `src/styles.css` |
| New CSS: `.avatar-faq-category`, `.avatar-faq-category-label`; widget became flex column, video pinned `flex: none` | `src/styles.css` |
| Exported `AVATAR_MOBILENAV_EVENT = "ladidier:mobilenav"` | `src/components.jsx` |
| `openMenu`/`closeMenu` dispatch the event; guarded one-way pause listener (empty deps, `removeEventListener` cleanup) inside `useVideoAvatar` | `src/components.jsx`, `src/avatarFaq.jsx` |

## AVATAR_MOBILENAV_EVENT — the contract Phase 11+ must consume

- **Name:** `"ladidier:mobilenav"` (the string lives ONLY in the exported `AVATAR_MOBILENAV_EVENT` constant in `src/components.jsx` — listeners import the constant, never copy the string; follows the `TREASURE_EVENT` precedent).
- **Payload shape:** `event.detail` is `{ open: boolean }`.
  - `{ open: true }` — dispatched by `openMenu` after `setMenuOpen(true)`/`setIsClosing(false)`.
  - `{ open: false }` — dispatched by `closeMenu` **immediately** alongside `setIsClosing(true)`, NOT inside the 300ms exit-animation timeout.
- **Listener shape (the only consumer today, in `useVideoAvatar`):** empty-deps `useEffect`, handler guarded as `e.detail?.open === true → videoRef.current?.pause()`, cleanup removes the listener. **One-directional by design:** opening the nav pauses the video; closing does NOT auto-resume — the reducer's phase stays the single source of truth for what should be playing. Phase 11 must preserve this asymmetry unless it explicitly decides otherwise.
- **Import direction is one-way:** `avatarFaq.jsx` → `components.jsx`. `components.jsx` must never import from `avatarFaq.jsx` (cycle guard is an acceptance gate).

## D-03 DOM position + sizing Phase 11 builds on (do not relocate)

- `AIAvatarFAQ` renders via `createPortal(..., document.body)` — NOT inside the route-keyed `<main>` tree, so `.page-fade`'s transform containing block (Pitfall G) never affects it and HomePage's route-keyed unmount (Pitfall D) tears it down.
- Widget: `position: fixed; right: 24px; bottom: 24px; width: min(360px, calc(100vw - 48px)); max-height: min(600px, calc(100vh - 48px)); z-index: 40` (below `.mobile-overlay`'s 100 so the mobile nav covers it — now also functionally paired via the event). At ≤480px: `right/left/bottom: 16px; width: auto`.
- Widget is a **flex column**: `.avatar-faq-video` is `flex: none` (never shrinks), `.avatar-faq-questions` is the scroll area (`flex: 1; min-height: 0; overflow-y: auto`) — the list scrolls *inside* the cap; the widget never grows past its approximate final size.
- Category group: `gap: 8px` between buttons (sm step — on `.avatar-faq-category`, where the buttons are children), `margin-bottom: 24px` between groups (lg step). Label: the phase's only 14px/600/1.2 declarations. Button: unchanged from 10-02 (`min-height: 44px`, 16px padding, wraps, no truncation).
- `activeQuestionId` is already threaded through `FAQCategories` but drives **no** visual difference — Phase 11's FAQ-02 selected/Playing state consumes it from there.

## Verification

- `node --test src/avatarFaqData.test.js` — 12/12 pass; `node --test src/avatarReducer.test.js` — 17/17 pass; `npm run build` exits 0 (both tasks).
- Task 1 gates: 4 required literals present; `grep -c '<video'` = 1; both new CSS classes present; `min-height: 44px` intact; text-overflow/line-clamp count unchanged at 1 (pre-existing elsewhere); `package.json` diff empty.
- Task 2 gates: `ladidier:mobilenav` + `AVATAR_MOBILENAV_EVENT` in components.jsx; `dispatchEvent` count = 2; avatarFaq.jsx has addEventListener/removeEventListener/guarded `.pause()`; `grep -c "from './avatarFaq.jsx'" src/components.jsx` = 0; `const openMenu`/`const closeMenu` preserved with additions only.
- Human-check (15 visible/scroll/wrap, interrupt chains, 375px tap targets) remains for the developer at `npm run dev` — not yet exercised.

## Incident record (second occurrence of the apply_diff corruption)

Task 1's multi-block apply_diff corrupted `src/styles.css` again (1374/331 lines — whole-file Prettier-style reformat; `avatarFaq.jsx` landed clean). Repaired by `git restore src/styles.css`, then re-applying the three intended edits via `repair-1003.mjs` (found-exactly-once assertions + CRLF-aware) — final diff 38 insertions, 0 deletions, confined to the avatar-faq block. Task 2 edits were applied via `apply-1003-task2.mjs` from the start (no apply_diff on code files). **Standing lesson upgraded: for multi-block edits to existing files in this environment, prefer the Node-script approach with uniqueness assertions; apply_diff remains acceptable for single-block edits, always followed by `git diff --stat`.**

## Commits

- `7066f1e` — feat(10-03): all 15 questions under 4 category headings — FAQCategories subcomponent + scrollable list (AVATAR-03, AVATAR-05, FAQ-04) — 2 files, 82 ins/15 del
- `5f9aced` — feat(10-03): mobile-nav-pause signal — AVATAR_MOBILENAV_EVENT CustomEvent, one-way pause listener (Pitfall F) — 2 files, 32 ins/1 del

## Notes for Plan 10-04

- Plan 10-04 is phase close-out; the human-check items above and the real-device iOS pass (flagged in STATE.md Blockers) are the remaining verification surface.
- `repair-1003.mjs` / `apply-1003-task2.mjs` are untracked one-shot scratch scripts (like `repair-1002.mjs`) — not part of the commit history by convention; delete or leave untracked per repo practice.
