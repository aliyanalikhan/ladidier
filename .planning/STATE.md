---
gsd_state_version: 1.0
milestone: v1.2
milestone_name: Accounts & Cross-Device Membership
status: planning
last_updated: "2026-08-31T22:00:26.286Z"
last_activity: 2026-09-01
progress:
  total_phases: 0
  completed_phases: 0
  total_plans: 0
  completed_plans: 0
  percent: 0
---

# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-08-31)

**Core value:** Every page must feel like opening a luxury magazine — and it must do so on any device, at any screen size.
**Current focus:** Phase 06 — mall-treasure-hunt

## Current Position

Phase: Not started (defining requirements)
Plan: —
Status: Defining requirements
Last activity: 2026-09-01 — Milestone v1.2 started

## Out-of-band work

**⚠ PRODUCTION IS CURRENTLY RUNNING STRIPE TEST MODE (as of 2026-09-01).** At the user's request, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, and all four `STRIPE_PRICE_*` env vars on Vercel Production were swapped from live to Stripe test-mode values so the ÉCLAT Vol. 2 gating feature (260901-1lc) could be tested end-to-end on ladidier.com with a real Stripe Checkout flow. **No real customer can complete a real purchase until this is reverted.** A full test subscription (Online, test card 4242...) was created and verified to correctly unlock the in-site reader and PDF download. Reverting requires the LIVE `STRIPE_SECRET_KEY` and `STRIPE_WEBHOOK_SECRET` values again — Vercel stores these as write-only "Secret" type vars, so neither Claude nor the account owner can read the old values back via CLI/dashboard; the user must re-reveal them from the Stripe Dashboard (Developers → API keys) and hand them over (or swap back directly in Vercel's dashboard). The four price env vars can be safely reverted to their original live `price_`/`prod_` values once known. **Any future session picking up this project should check `vercel env ls` / ask the user before assuming Production is on live keys.**

Paid Stripe membership was built and shipped to production on 2026-08-31 **outside the phase structure** — it belongs to no numbered phase and the progress counters above deliberately exclude it. It reversed the "no backend/API" scope decision; see PROJECT.md Key Decisions and Known Gaps. Phase 06 Plan 04 remains the next tracked item.

Progress: [████████░░] 83%

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

### Roadmap Evolution

- Phase 6 added: Mall Treasure Hunt — multi-page hidden-icon hunt (3-4 icons across Home/Stores/Magazine) with a "You found the treasure!" reveal, discount code, and subscribe/WhatsApp capture prompt. Runs alongside Phase 5's single hidden perk (user chose "keep both, side by side" over replacing it). Depends on Phase 5.

### Pending Todos

None yet.

### Blockers/Concerns

- Phase 5: Discoverability paradox — hidden perk must stay genuinely hard to find while still being found in practice; validate with a cold-read test during/after Phase 5 execution.
- Phase 5: `perks.jsx` script tag must be added to both `Ladidier Portal.html` and `Ladidier Portal-print.html` — `PrintApp` also renders `Footer`, so missing either causes a `ReferenceError`.

### Quick Tasks Completed

| # | Description | Date | Commit | Directory |
|---|-------------|------|--------|-----------|
| 260519-rat | use Mag cover.png from assets folder on magazine cover | 2026-05-19 | f54c505 | [260519-rat-use-mag-cover-png-from-assets-folder-on-](.planning/quick/260519-rat-use-mag-cover-png-from-assets-folder-on-/) |
| 260831-mis | update homepage marketing copy to new LaDidiér brand language, rebuild Magazine page with real cover + highlights | 2026-08-31 | ba6f20f | [260831-mis-update-homepage-marketing-copy-to-new-la](.planning/quick/260831-mis-update-homepage-marketing-copy-to-new-la/) |
| 260831-ndu | swap Home page's fictional magazine cover + featured stories for real ÉCLAT Vol. 2 content | 2026-08-31 | 5a714c1 | [260831-ndu-swap-the-home-page-s-fictional-magazine-](.planning/quick/260831-ndu-swap-the-home-page-s-fictional-magazine-/) |
| 260831-o04 | restore hover-tilt animation + gold frame on Home hero's real cover photo | 2026-08-31 | fbbb986 | [260831-o04-restore-the-interactive-hover-tilt-anima](.planning/quick/260831-o04-restore-the-interactive-hover-tilt-anima/) |
| 260831-o4v | extend hover-tilt/gold-frame cover interaction to the Magazine page's own cover | 2026-08-31 | 3bb660b | [260831-o4v-audit-and-fix-the-magazine-cover-s-mouse](.planning/quick/260831-o4v-audit-and-fix-the-magazine-cover-s-mouse/) |
| 260901-1lc | gate the full ÉCLAT Vol. 2 issue (in-site reader + PDF download) behind an active subscription | 2026-09-01 | 123c72b | [260901-1lc-gate-the-full-clat-vol-2-issue-in-site-p](.planning/quick/260901-1lc-gate-the-full-clat-vol-2-issue-in-site-p/) |

## Session Continuity

Last session: 2026-08-31T11:56:36.358Z
Stopped at: Completed quick task 260831-ndu (Home page real ÉCLAT Vol. 2 content)
Resume file: None
