---
phase: 5
slug: hidden-perks-discovery-feature
status: approved
nyquist_compliant: true
wave_0_complete: true
created: 2026-08-21
---

# Phase 5 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | None — no `package.json`, no test runner, no `*.test.*`/`*.spec.*` files exist anywhere in the repo. Matches established project convention (Phase 4's CTA-07 friction audit was closed via manual click-through, not automated tests). |
| **Config file** | none |
| **Quick run command** | Manual browser click-through of the specific PERK-XX behavior just implemented (dev server or direct file open — no build step) |
| **Full suite command** | Manual pass through all 6 PERK requirements at desktop and ≤480px widths |
| **Estimated runtime** | ~5-10 minutes for a full manual pass |

---

## Sampling Rate

- **After every task commit:** Manual click-through of the specific PERK-XX behavior just implemented, in the browser
- **After every plan wave:** Full manual pass through all 6 PERK requirements, at both desktop and ≤480px widths
- **Before `/gsd-verify-work`:** All 6 PERK-XX manual checks pass, plus the cold-read discoverability test (PERK-03 / PITFALLS.md Pitfall 4)
- **Max feedback latency:** ~5 minutes (manual browser check)

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 05-01-01 | 01 | 1 | PERK-01 | — | N/A | manual | Load site, visually confirm no nav entry/tooltip/label calls attention to the mark; confirm it uses `--gold`/`--fg` palette only | ❌ W0 (no test infra) | ⬜ pending |
| 05-01-02 | 01 | 1 | PERK-02 | — | N/A | manual | Tab through Footer with keyboard only — confirm trigger receives visible `:focus-visible` outline and activates on Enter/Space; separately test with touch-emulated devtools/real device | ❌ W0 | ⬜ pending |
| 05-01-03 | 01 | 1 | PERK-03 | — | N/A | manual | Cold-read test — someone unfamiliar with the change browses 60-90s, report whether they noticed the mark | ❌ W0 | ⬜ pending |
| 05-01-04 | 01 | 1 | PERK-04 | — | N/A | manual | Click/tap trigger, confirm `HOUSE10` renders as plain text, no "redeem"/validation UI | ❌ W0 | ⬜ pending |
| 05-01-05 | 01 | 1 | PERK-05 | — | N/A | manual | Test as (a) fresh visitor (`localStorage.clear()`) — code + subscribe CTA both show; (b) subscribed visitor (`localStorage.setItem("ladidier_subscribed","true")`) — CTA absent | ❌ W0 | ⬜ pending |
| 05-01-06 | 01 | 1 | PERK-06 | — | N/A | manual | With panel open, confirm page behind remains scrollable, no `body` scroll-lock applied, Tab key can move focus past the panel into subsequent page content (no focus-trap) | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

*Task IDs above are placeholders — the planner assigns final plan/task IDs; this table's Requirement→Test mapping is the binding contract, not the exact ID numbering.*

---

## Wave 0 Requirements

Existing infrastructure covers all phase requirements — no automated test framework exists in this repo and none should be introduced by this phase (matches established zero-build project convention; Phase 4's friction audit was 100% manual). No Wave 0 test-infra tasks needed.

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Trigger has no visual signposting | PERK-01, PERK-03 | Subjective visual judgment; no test framework exists | Load each page the Footer renders on, confirm nothing draws attention to the mark beyond normal browsing |
| Keyboard + touch reachability | PERK-02 | Requires real interaction devices/emulation, not scriptable without a test framework | Tab-only navigation to trigger + Enter/Space activation; separately test touch-emulated devtools or a real touch device |
| Cold-read discoverability | PERK-03 | Requires a genuinely naive human tester, not automatable | Someone unfamiliar with the change browses 60-90s unprompted; report whether they noticed the mark (per PITFALLS.md Pitfall 4) |
| Display-only code, no validation UI | PERK-04 | Visual/behavioral confirmation of absence (no "redeem" flow) | Click/tap trigger, confirm `HOUSE10` renders as plain text with no validation/redeem affordance |
| Subscribe-flag branching | PERK-05 | Requires manipulating `localStorage` state directly | Toggle `ladidier_subscribed` via devtools console between checks, confirm reveal content branches correctly both ways |
| No focus-trap / no scroll-lock | PERK-06 | Requires interactive keyboard/scroll testing | With panel open, confirm background scroll works and Tab moves focus past the panel into subsequent content |

---

## Validation Sign-Off

- [x] All tasks have `<automated>` verify or Wave 0 dependencies — N/A here; all tasks are manual-only per project's established zero-build/no-test-framework convention (documented above, not a gap)
- [x] Sampling continuity: no 3 consecutive tasks without automated verify — N/A; project has no automated test infra by design (see Wave 0 Requirements)
- [x] Wave 0 covers all MISSING references — no MISSING references; Wave 0 explicitly not needed (see above)
- [x] No watch-mode flags — N/A, no test runner
- [x] Feedback latency < 300s — manual click-through is ~5 min max
- [x] `nyquist_compliant: true` set in frontmatter — see note below

**Approval:** approved 2026-08-21 — this phase's validation strategy is 100% manual by design, consistent with the project's established zero-build, no-test-framework convention (Phase 4 precedent). This is not a Nyquist gap; it is the correct validation shape for this codebase.
