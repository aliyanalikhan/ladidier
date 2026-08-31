---
phase: 4
slug: copy-cta-conversion-pass
status: draft
nyquist_compliant: true
wave_0_complete: true
created: 2026-08-20
---

# Phase 4 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | None — manual/visual QA only (zero-build static site, by design) |
| **Config file** | none — no test infra exists or is warranted for this phase |
| **Quick run command** | Open `Ladidier Portal.html` (or the Vercel preview URL) in a browser and navigate to the changed route |
| **Full suite command** | Manual pass across Home (all 3 hero variants via Tweaks panel), Stores (list + grid view), Magazine — at desktop and ≤480px widths |
| **Estimated runtime** | ~10 minutes per full manual pass |

---

## Sampling Rate

- **After every task commit:** Manually reload the changed page in-browser (no build step, instant reflect) and click the specific CTA(s) touched.
- **After every plan wave:** Full manual pass across Home (all 3 hero variants), Stores (both view toggles), Magazine — desktop width.
- **Before `/gsd-verify-work`:** Repeat the full manual pass at ≤480px width (matches the v1.0 mobile-regression convention — see `.planning/research/PITFALLS.md` Pitfall 8).
- **Max feedback latency:** ~5 seconds (browser reload, no build step).

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 04-01-* | 01 | 1 | CTA-01, CTA-02, CTA-03 | — | N/A | manual/visual | Load Home in each of 3 hero styles; confirm shopping CTA renders first/solid | N/A (no test infra) | ⬜ pending |
| 04-02-* | 02 | 1/2 | CTA-04, CTA-05 | — | N/A | manual/visual + click-through | Click each of 14 store cards; confirm correct external URL opens in new tab | N/A | ⬜ pending |
| 04-03-* | 03 | 2 | CTA-06 | — | N/A | manual/functional | Confirm paywall still triggers at 15s / on iframe interaction; "Unlock Issue" still sets `ladidier_subscribed` | N/A | ⬜ pending |
| 04-04-* | 04 | 2/3 | CTA-07, D-08, D-09, D-10 | — | N/A | manual/click-through | Click every CTA/link touched (incl. "Continue reading freely →" and "Download issue (PDF)"/repurposed CTA); confirm each navigates/opens/executes | N/A | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*
*Exact Task IDs are assigned by the planner — this table maps requirement groups to plans/waves, not literal task IDs yet.*

---

## Wave 0 Requirements

Existing infrastructure covers all phase requirements. No test framework exists in this repository (no `package.json`, no `node_modules`, no `jest.config.*`/`vitest.config.*`) and none is warranted — this is expected per the project's zero-build constraint (PROJECT.md). The "test suite" for this phase is the Friction Audit Findings checklist in `04-RESEARCH.md`, used as a manual click-through checklist.

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Shopping-mall voice reads correctly, no tone drift | CTA-02, CTA-04, CTA-06 | Tone/voice is not machine-checkable | Read new copy aloud next to the copy it replaced; confirm it doesn't read as mass-market ecommerce (exclamation points, ALL CAPS, urgency language) per PITFALLS.md Pitfall 1 |
| Hero variant consistency across Tweaks panel toggle | CTA-01 | No test infra; visual/interactive check | Toggle all 3 hero styles (Manifest/Split/Index) in Tweaks panel; confirm each shows the reworked CTA order/voice, not stale copy |
| Every CTA resolves to a working destination | CTA-07 | Requires live click-through, not static analysis | Click every CTA/link on Home, Stores, Magazine (including the shared SubscribeBanner's "Continue reading freely →" and Magazine's repurposed "View full issue" CTA); confirm each does something observable |
| Mobile regression check | CTA-01 through CTA-07 (cross-cutting) | Visual layout check, no test infra | Resize to ≤480px and repeat the full manual pass; confirm no new element collides with the v1.0 mobile `!important` cascade (PITFALLS.md Pitfall 8) |

---

## Validation Sign-Off

- [x] All tasks have manual verify (no automated test infra exists or is warranted for this project)
- [x] Sampling continuity: manual check after every task commit (browser reload, no build step)
- [x] Wave 0 covers all MISSING references (none — no gaps)
- [x] No watch-mode flags (N/A — no test runner)
- [x] Feedback latency < 10s (browser reload is near-instant)
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** approved 2026-08-20
