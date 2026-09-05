---
gsd_state_version: 1.0
milestone: v1.3
milestone_name: AI Video Avatar FAQ Concierge
current_phase: 10
current_phase_name: avatar-video-engine-data-state-machine-playback
status: executing
stopped_at: Phase 10 complete — all 4 plans done (structural sweep 27/27, D-09 + D-10 gates approved); next is /gsd-plan-phase 11
last_updated: "2026-09-05T15:45:00.000Z"
last_activity: 2026-09-05
last_activity_desc: Completed quick task 260905-stj: replace avatar idle-loop video asset
progress:
  total_phases: 3
  completed_phases: 1
  total_plans: 4
  completed_plans: 4
  percent: 100
---

# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-09-04)

**Core value:** Every page must feel like opening a luxury magazine — and it must do so on any device, at any screen size.
**Current focus:** Phase 10 — avatar-video-engine-data-state-machine-playback

## Current Position

Phase: 10 (avatar-video-engine-data-state-machine-playback) — COMPLETE
Plan: 4 of 4 (10-01, 10-02, 10-03, 10-04 complete)
Status: Phase 10 closed — D-09 + D-10 gates approved; ready for /gsd-plan-phase 11
Last activity: 2026-09-05 — Phase 10 close-out (10-04)

Progress: [██████████] 100% (v1.3 — 1/3 phases, 4/4 plans)

## Out-of-band work

**✓ PRODUCTION IS BACK ON LIVE STRIPE KEYS (as of 2026-09-01, quick task 260901-liv).** The test-mode swap described below (originally logged here) has been reverted. `STRIPE_SECRET_KEY`, all four `STRIPE_PRICE_*` vars, and `STRIPE_WEBHOOK_SECRET` on Vercel Production were set to live values the user provided directly in chat, and a fresh production deployment was triggered so the change took effect (env var changes alone don't affect an already-built deployment). Verified live via `GET https://ladidier.com/api/prices` returning real live-mode amounts ($14.99/$79.99 Online, $24.99/$99.99 Hard Copy). The `STRIPE_WEBHOOK_SECRET` came from a newly-created live webhook endpoint (`we_1UAt0BPJb1GC1KXLWwtLc8oL`) — the prior live endpoint (`we_1Tddc9PJb1GC1KXLhWvobblq`) was deleted since Stripe never re-exposes an existing endpoint's signing secret via the API. **Real customers can now complete real purchases and be charged real money.** No further action needed for Phase 8's "Production gate" — this closes it. Original context preserved below for history.

<details><summary>Historical: how production ended up on test mode</summary>

At the user's request, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, and all four `STRIPE_PRICE_*` env vars on Vercel Production were swapped from live to Stripe test-mode values so the ÉCLAT Vol. 2 gating feature (260901-1lc) could be tested end-to-end on ladidier.com with a real Stripe Checkout flow. A full test subscription (Online, test card 4242...) was created and verified to correctly unlock the in-site reader and PDF download.

</details>

Paid Stripe membership was built and shipped to production on 2026-08-31 **outside the phase structure** — it belongs to no numbered phase and the progress counters above (scoped to v1.3) deliberately exclude it. It reversed the "no backend/API" scope decision; see PROJECT.md Key Decisions and Known Gaps.

## Performance Metrics

**Velocity:**

- Total plans completed (v1.1): 0
- Average duration: —
- Total execution time: —

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| 01-mobile-navigation | 2 | ~35min | ~17min |
| 02-responsive-layouts | — | — | — (shipped, log left stale) |
| 03-vercel-deploy | — | — | — (shipped, log left stale) |
| 04 | 5 | - | - |

*Updated after each plan completion*
| Phase 04 P01 | 5min | 2 tasks | 1 files |
| Phase 04 P02 | 5min | 2 tasks | 1 files |
| Phase 04 P03 | 10min | 2 tasks | 1 files |
| Phase 04 P04 | 8min | 3 tasks | 1 files |
| Phase 04 P05 | 12min | 2 tasks | 0 files |
| Phase 05 P01 | 15min | 2 tasks | 2 files |
| Phase 05 P02 | 8min | 2 tasks | 3 files |
| Phase 06 P03 | 3min | 3 tasks | 5 files |
| Phase 10 P02 | ~40min | 2 tasks | 6 files |
| Phase 10 P03 | ~25min | 2 tasks | 4 files |
| Phase 10 P04 | ~15min | 3 tasks | 0 files |

## Accumulated Context

### Decisions

- v1.0 init: Full-screen overlay nav chosen (matches luxury editorial brand feel)
- v1.0 init: No mobile build pipeline — site is zero-build (React CDN + Babel standalone)
- v1.0 shipped 2026-08-20: Confirmed live on Vercel by user; Phase 2/3 tracking backfilled as complete
- v1.1 scope: Copy/CTA/conversion work limited to Home, Stores, Magazine (About/Article deferred)
- v1.1 scope: Hidden perks ships as one real discovery mechanic, not gamified (per user brief)
- v1.1 roadmap: Phase 4 (copy/CTA, pure content edits) sequenced before Phase 5 (hidden perks, new `perks.jsx` file) so the perk reveal copy matches the finalized conversion tone
- [Phase 04-01]: Reused existing on-voice string 'Shop the Houses' consistently across all three Home hero variants (HeroManifest, HeroSplit, HeroIndex) rather than three different phrasings — Per D-01's house-vocabulary rule and D-02's Tweaks-panel toggle guarantee — one consistent primary CTA string across all heroes prevents stale/inconsistent copy behind any variant
- [Phase 04-02]: Used computed {STORES.length} form over hardcoded '14 Houses' per CONTEXT.md's discretion note preferring drift-proof option
- [Phase 04-03]: No flexWrap/gap CSS fallback added to Gallery CTA row — worst-case text-width math confirmed clearance at both grid min-width and <=480px single-column widths
- [Phase 04-04]: Paywall/subscribe mechanic lines left byte-identical during the Magazine lede reframe, confirmed via git diff --stat scoped to the two paragraph bodies only
- [Phase 04-04]: SubscribeBanner's dead-CTA fix applied once to the shared function body (no per-page branching), accepted five-page blast radius per plan's pre-approved scope exception
- [Phase 04-05]: CTA-07 friction audit closed — 7/7 static gates PASS (two count deviations traced to pre-existing out-of-scope occurrences, not defects) and developer approved live click-through of all CTAs on Home/Stores/Magazine at desktop and phone width. Phase 4 fully complete.
- [Phase 05-01]: Reveal panel applied via combined className (paywall-gate perk-reveal[--first]) with zero inline style, per plan instruction to route all layout through Task 1's CSS classes
- [Phase 05-01]: Outside-click handler checks containment against both panelRef and markRef to prevent close-then-reopen flicker on the trigger button
- [Phase 05]: HiddenPerk mounted as sibling of Crest inside Footer's wordmark row (not repurposed Crest) per D-01, requiring zero prop plumbing beyond the setRoute Footer already received
- [Phase 06-03]: Kept every TreasureIcon insertion to a single bare line (no surrounding blank lines) so the content diff for each mount site is exactly one added line, matching the plan's insertions-only acceptance gates
- [Quick 260831-mis]: Rebranded tagline/manifesto to "LaDidiér, the World Curated," fixed stale 11->14 store count, and rebuilt MagazinePage with the real ÉCLAT Vol. 2 cover + six real highlight cards, retiring the Heyzine flipbook/paywall in favor of a plain-text "interactive platform launching soon" note. Executor left a stale "A house of houses" Footer tagline in src/components.jsx untouched (file was off-limits per plan); orchestrator reviewed the gap post-execution and updated it directly to match the new brand language.
- [Quick 260831-ndu]: Extended the 260831-mis ÉCLAT Vol. 2 rebuild from MagazinePage onto Home — HeroSplit now shows the real cover photo and FeaturedStories now sources ISSUE_HIGHLIGHTS, retiring the last two fictional-magazine surfaces on Home.
- [Quick 260831-o04]: 260831-ndu's cover swap dropped the cover/framed/tilt CSS classes the retired MagazineCover mockup had, silently losing the resting 3D tilt, hover straighten-and-lift, and gold luxe frame on Home's hero cover. Restored by adding those existing classes back onto the real photo div — no new CSS needed.
- [Quick 260831-o4v]: Audited every real-cover-photo instance for the tilt/frame interaction after 260831-o04's Home fix. Found MagazinePage's own cover (built in 260831-mis) never had it at all — restructured it into the same float-slow-wrapper + cover/framed/tilt-inner pattern Home's hero uses, so both instances now behave identically on hover.
- [Quick 260901-1lc]: Fixed a gap surfaced in conversation — subscribing to ÉcLAT Online charged a real Stripe subscription but delivered no visible benefit since MagazinePage dropped its isMember prop when the old paywall was retired. Added member-gated api/issue/pdf.js + api/issue/page.js (serving compressed content/eclat-vol2-issue.pdf and content/eclat-vol2-pages/*.jpg, kept outside public/ so the gate is a real server check) backed by a new checkActiveMembership() helper in lib/membership.js reusing api/entitlement.js's existing Stripe logic. MagazinePage now shows members a "Read the full issue" reader modal + "Download PDF"; free visitors see the unchanged teaser. Found and fixed a real bug during build: the reader modal's position:fixed backdrop was broken by .page-fade's transform animation creating a containing block — fixed via createPortal to document.body. Known gaps (not in scope): no one-time non-subscription purchase path; Subscribe page still doesn't recognize an existing member (risk of accidental double-subscribe); Hard Copy and Online get identical digital access by design (matches Hard Copy's own "Everything in Online" copy).
- [v1.2 roadmap]: Phase numbering continues from Phase 6 (Phases 7-9) rather than resetting, per this milestone's phase_id_convention (sequential, no milestone prefix in config.json).
- [v1.2 roadmap]: Stripe-customer linking (LINK-01..04) isolated into its own phase (8) rather than folded into Phase 7 or 9, because it concentrates the highest-severity new risks (duplicate customers, race conditions, account-takeover-by-email) — per research/SUMMARY.md's explicit phase-ordering rationale.
- [v1.3 roadmap]: Phase numbering continues from Phase 9 (Phases 10-12) rather than resetting, per this milestone's phase_id_convention (sequential, no milestone prefix in config.json).
- [v1.3 roadmap]: Compressed research/SUMMARY.md's proposed 4-phase split into 3 roadmap phases by folding "Data + State Machine Foundation" into "Video Playback + Lifecycle" (now Phase 10) — a standalone reducer/data-module phase has no rendered UI and therefore no human-observable success criteria. The research-recommended build order (data module + reducer built and manually exercised before wiring to a real `<video>` element) is preserved as internal Phase 10 plan sequencing, not lost.
- [Phase 10-02]: Task 1's initial commit (e37a62f) was corrupted by a large multi-block apply_diff (styles.css ballooned to 2353 lines — ~1048 lines of reformat churn plus partial duplication). Repaired by restoring the three touched files from HEAD~1, re-applying the intended edits via a one-shot Node script with found-exactly-once/count assertions, and amending (safe: branch unpushed) — final 3a22596 is surgical and fully re-verified. Standing lesson: check `git diff --stat` immediately after every apply_diff.
- [Phase 10-03]: The apply_diff corruption recurred on Task 1 (styles.css reformatted whole-file, 1374/331 lines; avatarFaq.jsx landed clean). Repaired via git restore + repair-1003.mjs (uniqueness-asserted, CRLF-aware) — final 38 ins/0 del. Task 2 applied via apply-1003-task2.mjs from the start. Lesson upgraded: multi-block edits to existing files now go through Node scripts with found-exactly-once assertions; apply_diff only for single-block edits, always followed by git diff --stat.
- [Phase 10-03]: The plan's literal CSS text ("give .avatar-faq-questions an 8px gap") was corrected in implementation — the 8px gap sits on .avatar-faq-category (where the buttons are direct children); a gap on the questions container would give 0px within groups and 8px between groups, inverting the UI-SPEC's sm/lg scale steps. Documented in CSS comments and 10-03-SUMMARY.md.
- [Phase 10-04]: Structural sweep executed as sweep-1004.mjs (Node) rather than the plan's bash one-liner (cmd.exe lacks the syntax); the zero-deps diff base was resolved programmatically to eea09ed's parent c2795d0 — the plan's literal `HEAD~6` was a stale estimate that would have skipped 10-01's commits, where the asset and package.json baselines live. 27/27 checks green.
- [Phase 10-04]: D-09 (12-step desktop click-through) and D-10 (physical iPhone) both approved with zero defects. Low Power Mode branch: autoplay still worked — the "Tap to play" fallback was NOT exercised on-device and remains an unexercised safety net; re-check opportunistically during Phase 11/12 device passes.
- [Quick 260905-avc]: Found and fixed a real Phase 10 layout bug (not caught by D-09's click-through) — `.avatar-faq-video` had no height cap, so the real portrait (~9:16) footage rendered at ~616px tall at widget width, exceeding the widget's entire 600px `max-height` and collapsing `.avatar-faq-questions` (flex:1) to 0px. All 15 questions were invisible/unreachable, so users could never trigger `answering` phase and never heard audio — the single root cause behind both "audio not coming" and "popup UI not good." Fixed via `height: 240px; object-fit: cover` on the video. Verified live: reducer/state-machine/autoplay-unmute logic from 10-02/10-03 all work correctly once a question button is actually clickable.

### Roadmap Evolution

- Phase 6 added: Mall Treasure Hunt — multi-page hidden-icon hunt (3-4 icons across Home/Stores/Magazine) with a "You found the treasure!" reveal, discount code, and subscribe/WhatsApp capture prompt. Runs alongside Phase 5's single hidden perk (user chose "keep both, side by side" over replacing it). Depends on Phase 5.
- v1.2 roadmap added 2026-09-01: Phase 7 (OAuth + Database Foundation: AUTH-01..04, ACCT-01..02), Phase 8 (Stripe-Customer Linking: LINK-01..04), Phase 9 (Account & Billing Page: PROF-01..05) — derived from research/SUMMARY.md's validated three-phase dependency chain (identity must exist before anything links to it; linking is isolated as the highest-risk phase; the account/billing UI is a pure consumer of the prior two). Phase 7 has an existing, unexecuted draft plan (`260831-8ug`) covering most of its technical approach — flagged for reuse rather than re-derivation. All 15 v1.2 requirements mapped, no orphans.
- v1.3 roadmap added 2026-09-05: Phase 10 (Avatar Video Engine — Data, State Machine & Playback: AVATAR-01..06 + FAQ-04), Phase 11 (Widget UI — Launcher, Categories & Bespoke Chrome: FAQ-01..03 + WIDGET-01..04), Phase 12 (Accessibility, Robustness & Responsiveness: A11Y-01..05) — derived from research/SUMMARY.md's proposed 4-phase structure, compressed to 3 phases (see Decisions). All 19 v1.3 requirements mapped, no orphans.

### Pending Todos

None yet.

### Blockers/Concerns

- Phase 5: Discoverability paradox — hidden perk must stay genuinely hard to find while still being found in practice; validate with a cold-read test during/after Phase 5 execution.
- Phase 5: `perks.jsx` script tag must be added to both `Ladidier Portal.html` and `Ladidier Portal-print.html` — `PrintApp` also renders `Footer`, so missing either causes a `ReferenceError`.
- Phase 8: cannot be marked done in Production until the Stripe test-mode-to-live-key revert (see Out-of-band work above) is completed and verified with one successful live webhook delivery.
- Phase 8: the webhook log-only-vs-actor decision (whether `api/webhook.js`-adjacent logic ever becomes a linking writer) needs an explicit recorded choice during `/gsd-plan-phase 8` — flagged by research/SUMMARY.md as needing deeper design review before task planning.
- Phase 10 (resolved 2026-09-05, plan 10-04): iOS Safari autoplay/Low-Power-Mode behavior verified on a physical iPhone (D-10) — muted+playsInline+autoPlay autoplays inline, including under Low Power Mode; the stale-event generation guard was exercised by D-09's approved rapid-interrupt click-throughs. Both blocking gates approved with zero defects.
- Phase 10 (resolved 2026-09-05, plan 10-01): D-08 Vercel plan-tier gate answered — developer confirmed **Pro tier or higher** in the Vercel dashboard (team TNneMwMrfJWJTS1CLnpGwglM); the ~249 MiB avatar payload fits under Pro's 1GB static-upload cap. The Phase 12 blocker/concern entry below about plan-tier verification is now satisfied for this project.
- Phase 11: Idle-loop footage quality (does `Idle.mp4` read as a natural "alive" loop vs. an obviously-repeating cheap loop) is a content decision that depends on footage already in hand — surface to the content owner during Phase 11, not assumed fine.
- Phase 12: Vercel plan-tier and bandwidth verification for ~250MB of new video static assets (Hobby plan caps at 100MB total static-file uploads) must be confirmed in the actual Vercel dashboard before the first production deploy that includes the avatar video assets — flagged as a pre-merge checklist item by research/SUMMARY.md.

### Quick Tasks Completed

| # | Description | Date | Commit | Status | Directory |
|---|-------------|------|--------|--------|-----------|
| 260519-rat | use Mag cover.png from assets folder on magazine cover | 2026-05-19 | f54c505 | | [260519-rat-use-mag-cover-png-from-assets-folder-on-](.planning/quick/260519-rat-use-mag-cover-png-from-assets-folder-on-/) |
| 260831-mis | update homepage marketing copy to new LaDidiér brand language, rebuild Magazine page with real cover + highlights | 2026-08-31 | ba6f20f | | [260831-mis-update-homepage-marketing-copy-to-new-la](.planning/quick/260831-mis-update-homepage-marketing-copy-to-new-la/) |
| 260831-ndu | swap Home page's fictional magazine cover + featured stories for real ÉCLAT Vol. 2 content | 2026-08-31 | 5a714c1 | | [260831-ndu-swap-the-home-page-s-fictional-magazine-](.planning/quick/260831-ndu-swap-the-home-page-s-fictional-magazine-/) |
| 260831-o04 | restore hover-tilt animation + gold frame on Home hero's real cover photo | 2026-08-31 | fbbb986 | | [260831-o04-restore-the-interactive-hover-tilt-anima](.planning/quick/260831-o04-restore-the-interactive-hover-tilt-anima/) |
| 260831-o4v | extend hover-tilt/gold-frame cover interaction to the Magazine page's own cover | 2026-08-31 | 3bb660b | | [260831-o4v-audit-and-fix-the-magazine-cover-s-mouse](.planning/quick/260831-o4v-audit-and-fix-the-magazine-cover-s-mouse/) |
| 260901-1lc | gate the full ÉCLAT Vol. 2 issue (in-site reader + PDF download) behind an active subscription | 2026-09-01 | 123c72b | | [260901-1lc-gate-the-full-clat-vol-2-issue-in-site-p](.planning/quick/260901-1lc-gate-the-full-clat-vol-2-issue-in-site-p/) |
| 260901-b1a | fix 10 bugs found in code review of commit a850d59 (Phase 7-9 OAuth/Stripe-linking/account-page work) | 2026-09-01 | ceca8e9 | Needs Review | [260901-b1a-fix-10-bugs-found-in-code-review-of-comm](.planning/quick/260901-b1a-fix-10-bugs-found-in-code-review-of-comm/) |
| 260901-fnc | fix Vercel deploy failure — consolidated api/auth, api/account, api/issue route groups to stay under the Hobby plan's 12 Serverless Functions cap | 2026-09-01 | 5a22755 | Complete | [260901-fnc-fix-vercel-hobby-serverless-function-limi](.planning/quick/260901-fnc-fix-vercel-hobby-serverless-function-limi/) |
| 260901-mbr | Subscribe page shows a signed-in member's active plan; Upgrade/Manage now route to the Stripe billing portal instead of re-prompting to become a member | 2026-09-01 | 1c9bec3 | Needs Review | [260901-mbr-subscribe-page-shows-active-plan-upgrade-mana](.planning/quick/260901-mbr-subscribe-page-shows-active-plan-upgrade-mana/) |
| 260901-nbh | fix "No billing history" error reachable from Manage billing on Subscribe/Account pages for legacy-cookie-only members with no linked Stripe customer | 2026-09-01 | c58d256 | Needs Review | [260901-nbh-fix-no-billing-history-error-for-legacy-only-m](.planning/quick/260901-nbh-fix-no-billing-history-error-for-legacy-only-m/) |
| 260901-liv | swap Vercel Production off Stripe test mode back to live keys (secret key, 4 prices, new webhook secret), redeployed | 2026-09-01 | (infra, no code commit) | Complete | [260901-liv-swap-production-back-to-live-stripe-keys](.planning/quick/260901-liv-swap-production-back-to-live-stripe-keys/) |
| 260902-mag | magazine reader spread view, Magazine page bottom image, new highlight photo, sitewide free-reading copy removal, Subscribe page redesigned into 4 explicit plans | 2026-09-02 | ed1ee40 | Needs Review | [260902-mag-magazine-spread-view-paywall-copy-4-plan-res](.planning/quick/260902-mag-magazine-spread-view-paywall-copy-4-plan-res/) |
| 260902-hl2 | added the 2nd pending highlight photo (astronaut manifesto) to the Magazine page | 2026-09-02 | 632b44c | Complete | [260902-hl2-add-second-highlight-photo-astronaut-manifest](.planning/quick/260902-hl2-add-second-highlight-photo-astronaut-manifest/) |
| 260902-rma | removed the Magazine page's closing manifesto image + CTA section (image stays in use as a highlight card) | 2026-09-02 | dedb5c7 | Complete | [260902-rma-remove-magazine-page-closing-manifesto-image](.planning/quick/260902-rma-remove-magazine-page-closing-manifesto-image/) |
| 260905-avc | fixed avatar FAQ widget: oversized portrait video (unconstrained aspect ratio) was collapsing the question list to 0px, making all 15 questions invisible/unreachable — explains both "audio not coming" and "UI not good" reports | 2026-09-05 | (pending) | Complete | [260905-avc-fix-oversized-avatar-video-hiding-faq-quest](.planning/quick/260905-avc-fix-oversized-avatar-video-hiding-faq-quest/) |
| 260905-rw7 | redesigned avatar FAQ widget chrome — question pills now float on a dark scrim over the video (lettered badges) instead of a list below it; replaced "all 15 questions always" with progressive disclosure (4 starters -> More topics -> 4 keyword chips -> per-category pills -> Back), advancing FAQ-03/WIDGET-03 early | 2026-09-05 | ec77f1f | Awaiting checkpoint approval (Task 3: human visual check against reference screenshot) | [260905-rw7-redesign-avatar-faq-popup-to-overlay-the](.planning/quick/260905-rw7-redesign-avatar-faq-popup-to-overlay-the/) |
| 260905-stj | replaced the avatar widget's idle-loop video asset (public/ + dist/) with a user-supplied re-recorded clip, same filename — no code change | 2026-09-05 | ce38293 | Complete | [260905-stj-replace-the-avatar-idle-loop-video-asset](.planning/quick/260905-stj-replace-the-avatar-idle-loop-video-asset/) |

## Session Continuity

Last session: 2026-09-05T01:45:00.000Z
Stopped at: Phase 10 complete (plans 10-01..10-04; structural sweep 27/27, D-09 + D-10 approved); next is /gsd-plan-phase 11 (Widget UI — Launcher, Categories & Bespoke Chrome)
Resume file: .planning/ROADMAP.md
