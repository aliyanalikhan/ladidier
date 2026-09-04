# Phase 10: Avatar Video Engine — Data, State Machine & Playback - Context

**Gathered:** 2026-09-05
**Status:** Ready for planning

<domain>
## Phase Boundary

This phase delivers the FAQ-to-video data module (`avatarFaqData.js`) and the video engine (`useVideoAvatar` reducer + a real `<video>` element wired to it), producing the full behavioral sequence — intro autoplay → looping idle → instant answer playback → return to idle → immediate mid-answer interrupt — on the actual homepage. It does NOT deliver the polished widget chrome (launcher button, category accordion, luxury visual styling) — that is Phase 11. It does NOT deliver the accessibility/reduced-motion/responsive pass — that is Phase 12.

Because Phase 10's own success criteria require "clicking any FAQ question" to work end-to-end on the real homepage, this phase ships a **functional-only, unstyled interim UI** (plain buttons + the video element, positioned bottom-right in the final widget's approximate size/shape) so the engine can be verified against real assets before Phase 11 replaces it with real chrome.

Requirements: AVATAR-01, AVATAR-02, AVATAR-03, AVATAR-04, AVATAR-05, AVATAR-06, FAQ-04.

</domain>

<decisions>
## Implementation Decisions

### FAQ Content & Video Mapping
- **D-01:** The 15 real FAQ questions, in category order, are locked (see full text below). Video mapping is sequential: `Q1.mp4` through `Q15.mp4` map 1:1 to questions 1–15 in the order listed.

  **About LaDidiér (Q1–Q5):**
  1. What is LaDidiér?
  2. What types of products do you sell?
  3. How do I know what size to order?
  4. What should I do if an item I want is sold out?
  5. Will you restock an item that is currently unavailable?

  **Shipping & Delivery (Q6–Q10):**
  6. Where does LaDidiér ship?
  7. How much does shipping cost?
  8. How long will it take for my order to arrive?
  9. How can I track my order?
  10. What should I do if my package says delivered, but I haven't received it?

  **Orders, Returns & Exchanges (Q11–Q13):**
  11. Can I change or cancel my order after I place it?
  12. What is your return and exchange policy?
  13. What should I do if I receive the wrong item or my item arrives damaged?

  **Payments & Customer Support (Q14–Q15):**
  14. What payment methods do you accept?
  15. How can I contact LaDidiér if I need additional help?

  This exact text/order/category grouping is the source of truth for `avatarFaqData.js`'s `FAQ_CATEGORIES` structure (per Pattern 4 in `research/ARCHITECTURE.md`).

### Interim UI & Production Exposure
- **D-02:** The Phase 10 interim UI (plain, unstyled question buttons + the video element) ships live to production when this phase merges — same incremental, no-feature-flag pattern this project has used since Phase 4. It is not gated behind a branch or query param. — **Reversibility:** reversible — Phase 11 directly replaces this markup with real chrome; no data or API shape depends on it.
- **D-03:** The interim UI is positioned bottom-right, sized/shaped roughly like the final widget will be, rather than on a separate throwaway test page. Phase 11 only needs to swap in launcher/accordion/visual styling on top of this same DOM position — it does not relocate or restructure the mount point.
- **D-04:** No visual polish in Phase 10 — plain HTML buttons and a `<video>` tag, with only the minimal CSS needed for correct positioning and basic usability. All luxury/on-brand styling is explicitly Phase 11 scope (per WIDGET-03).

### Video Asset Handling
- **D-05:** Copying the 17 source files (`Idle.mp4`, `INTRO.mp4`, `Q1.mp4`–`Q15.mp4`, ~250MB total) from `D:\ttt\LaDidier Avatar` into `public/assets/avatar/` is in scope for this phase — the engine cannot be verified against real assets otherwise.
- **D-06:** Filenames are kept exactly as sourced (`Idle.mp4`, `INTRO.mp4`, `Q1.mp4`...`Q15.mp4`, mixed case preserved) — no renaming/normalization pass.
- **D-07:** Video files are committed as plain files via normal `git add`/`git commit`, matching the existing `public/assets/` convention for images. No Git LFS, no external storage/CDN.
- **D-08:** Because D-02 means this phase's deploy is what actually pushes ~250MB of video to production (not deferred to Phase 12 as `research/PITFALLS.md` Pitfall 3 originally assumed), verifying the Vercel project's plan tier supports it (Hobby caps at 100MB total static-file uploads; Pro allows 1GB) is **in scope for this phase, before merging** — not deferred. — **Reversibility:** one-way — a failed production deploy from an unverified tier would be discovered only after merge, when real visitors are already being served the feature.

### Manual Verification Approach
- **D-09:** The user will personally click through the full sequence (intro → idle → answer → idle, switching between multiple questions including mid-answer interrupts) on the deployed/dev site before this phase is considered done — following this project's existing precedent (e.g. Phase 4's CTA-07 friction-audit gate).
- **D-10:** The user has access to a real iPhone and will personally verify muted+playsInline+autoplay behavior on it, including with Low Power Mode enabled, per `research/PITFALLS.md` Pitfall 2's explicit warning that emulation cannot reproduce this failure mode. This is not being deferred as a known gap.

### Claude's Discretion
- Exact reducer/state-machine implementation shape (phase/questionId reducer, generation-counter guard against stale `ANSWER_ENDED` events, `.catch()` handling on `play()`) — fully specified in `research/ARCHITECTURE.md` and `research/PITFALLS.md`; no further user input needed.
- Mount placement inside `HomePage` (not `App`) to inherit route-keyed remount/unmount — architecture decision, not a product choice.
- `sessionStorage`-backed "intro played once" flag mechanics — implementation detail per Pitfall 13.
- Exact interim-UI markup/minimal CSS shape (D-04), as long as it's functional, positioned bottom-right, and unstyled.
- `preload="none"` / on-demand mounting strategy for the 15 answer videos vs. eager intro+idle load — per `research/PITFALLS.md` Pitfall 4.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Research (HIGH confidence, produced 2026-09-04 for this exact milestone)
- `.planning/research/SUMMARY.md` — executive summary, recommended stack, phase-ordering rationale
- `.planning/research/ARCHITECTURE.md` — component responsibilities, reducer pattern with working code example, file structure, anti-patterns to avoid
- `.planning/research/PITFALLS.md` — 13 critical pitfalls with prevention/verification steps, most directly relevant to this phase (autoplay rejection, iOS Safari, rapid-switch desync, route-mount lifecycle, intro-replay-on-remount)
- `.planning/research/STACK.md` — confirms no new dependencies needed
- `.planning/research/FEATURES.md` — table-stakes vs. differentiator feature list

### Project & Requirements
- `.planning/PROJECT.md` — Key Decisions table (widget scoping, no video generation, asset storage approach)
- `.planning/REQUIREMENTS.md` §v1.3 Requirements — AVATAR-01..06, FAQ-04 acceptance criteria
- `.planning/ROADMAP.md` — Phase 10 goal, success criteria, dependency notes, research flags

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `theme.js` — plain-data-module pattern to mirror for `avatarFaqData.js` (no React import, just exported constants/arrays)
- `src/app.jsx` line ~227, `<main key={route}>{page}</main>` — the remount-on-route-change mechanism that `HomePage`-mounted components (including this new widget) inherit for free

### Established Patterns
- `src/perks.jsx` / `src/treasure.jsx` — single self-contained `.jsx` feature file per feature, mounted as a plain JSX sibling inside a page component; this project's convention is one file per feature, not one file per component
- `src/styles.css` — current z-index vocabulary: `.mobile-overlay: 100`, `.perk-reveal`/`.treasure-reveal: 500`, `.reader-backdrop: 200` — the new widget's z-index must be chosen deliberately relative to these (placing below `.mobile-overlay`'s 100 is research's recommendation, paired with pausing video when the mobile nav opens)

### Integration Points
- Mount point: `src/pages.jsx` → `HomePage` component (new `import` + one JSX line), not `src/app.jsx`
- No new `api/*` routes, no new environment variables — this feature is fully static/client-side

</code_context>

<specifics>
## Specific Ideas

- The exact 15 FAQ questions, their category groupings, and their sequential Q1–Q15 video mapping are captured verbatim in Decision D-01 above — this is real, final content, not placeholder text.
- Video source location: `D:\ttt\LaDidier Avatar` (local path on the user's machine, not yet in the repo).

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope. (Widget launcher/accordion visual chrome remains correctly scoped to Phase 11; accessibility/reduced-motion/responsive polish remains correctly scoped to Phase 12, per the existing roadmap split.)

</deferred>

---

*Phase: 10-Avatar Video Engine — Data, State Machine & Playback*
*Context gathered: 2026-09-05*
