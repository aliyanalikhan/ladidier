---
phase: 6
slug: mall-treasure-hunt
status: approved
nyquist_compliant: true
wave_0_complete: true
created: 2026-08-22
---

# Phase 6 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | None — no `package.json`, no test runner, no `*.test.*`/`*.spec.*` files exist anywhere in the repo. Matches established project convention (Phase 4's CTA-07 friction audit and all of Phase 5 were closed via manual click-through, not automated tests). |
| **Config file** | none |
| **Quick run command** | Manual browser click-through of the specific TREAS-XX behavior just implemented (dev server or direct file open — no build step) |
| **Full suite command** | Manual pass through all 6 TREAS requirements across all 4 pages (Home, Stores, Magazine, Article), at both desktop and ≤480px widths |
| **Estimated runtime** | ~10-15 minutes for a full manual pass (4 pages × icon discovery + completion flow + progress indicator) |

---

## Sampling Rate

- **After every task commit:** Manual click-through of the specific TREAS-XX behavior just implemented, in the browser
- **After every plan wave:** Full manual pass through all 6 TREAS requirements, across all 4 target pages, at both desktop and ≤480px widths
- **Before `/gsd-verify-work`:** All 6 TREAS-XX manual checks pass, plus the one-time-completion persistence check (TREAS-05) and the cross-component sync check (progress indicator agrees with found-count from all 4 mount points)
- **Max feedback latency:** ~5 minutes (manual browser check)

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 06-01-01 | 01 | 1 | TREAS-01 | — | N/A | manual | Load Home, Stores, Magazine, Article — confirm one distinct full-color icon (shopping bag/gift box/etc.) is present and clickable/tappable on each | ❌ W0 (no test infra) | ⬜ pending |
| 06-01-02 | 01 | 1 | TREAS-02 | — | N/A | manual | Reload each page 5+ times — confirm icon position varies across 2-3 pre-defined safe zones and never overlaps text/buttons/nav at desktop and ≤480px | ❌ W0 | ⬜ pending |
| 06-02-01 | 02 | 2 | TREAS-03 | — | N/A | manual | `sessionStorage.clear()`, find all 4 icons across the 4 pages in one session — confirm "You found the treasure!" popup appears with a code distinct from `HOUSE10` | ❌ W0 | ⬜ pending |
| 06-02-02 | 02 | 2 | TREAS-04 | — | N/A | manual | Test as (a) fresh visitor (`localStorage.removeItem("ladidier_subscribed")`) — code + subscribe CTA both show; (b) subscribed visitor (`localStorage.setItem("ladidier_subscribed","true")`) — CTA absent, code only | ❌ W0 | ⬜ pending |
| 06-02-03 | 02 | 2 | TREAS-05 | — | N/A | manual | Complete the hunt once, then reload/reopen the browser (new session) — confirm no icons spawn on any page again; check `localStorage.getItem("ladidier_treasure_completed")` is set | ❌ W0 | ⬜ pending |
| 06-01-03 | 01 | 1 | TREAS-06 | — | N/A | manual | Before finding any icon, confirm nav bar shows no dot/glyph indicator; after finding 1, confirm `●○○○`-style indicator appears and updates live as more are found, on every page (not just the page where found) | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

*Task IDs above are placeholders — the planner assigns final plan/task IDs; this table's Requirement→Test mapping is the binding contract, not the exact ID numbering.*

---

## Wave 0 Requirements

Existing infrastructure covers all phase requirements — no automated test framework exists in this repo and none should be introduced by this phase (matches established zero-build project convention; Phase 4 and Phase 5 were both 100% manual). No Wave 0 test-infra tasks needed.

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|--------------------|
| Icon presence + accessibility per page | TREAS-01 | Visual/interaction judgment across 4 pages; no test framework exists | Load each of Home, Stores, Magazine, Article — confirm icon renders, is reachable via click/tap AND keyboard focus (not hover-only), and doesn't collide with `StoresPage`'s list/grid toggle or Magazine's `.magazine-frame` paywall overlay |
| Randomized layout-safe positioning | TREAS-02 | Requires repeated manual reloads and visual layout inspection at multiple widths | Reload each page 5+ times at desktop and ≤480px — confirm icon appears in different pre-defined safe zones and never overlaps real content |
| Cross-page completion trigger | TREAS-03 | Requires manipulating `sessionStorage` and navigating across 4 pages in sequence | Clear `sessionStorage`, find all 4 icons across the 4 pages within one session, confirm completion popup fires with a code distinct from `HOUSE10` |
| Subscribe-flag branching | TREAS-04 | Requires manipulating `localStorage` state directly | Toggle `ladidier_subscribed` via devtools console between checks, confirm reveal content branches correctly both ways, same as Phase 5 PERK-05 |
| One-time persistent completion | TREAS-05 | Requires closing/reopening the session and checking `localStorage` | Complete the hunt once, start a fresh session (new tab or `sessionStorage.clear()`), confirm icons never spawn again; verify `ladidier_treasure_completed` flag persists |
| Live cross-component progress sync | TREAS-06 | Requires interacting across multiple mount points (4 pages + Nav) and confirming they agree without a full page reload | Find icons one at a time across different pages, confirm the nav-bar dot indicator updates immediately after each find (not just on next navigation), and remains invisible until the first find |

---

## Validation Sign-Off

- [x] All tasks have `<automated>` verify or Wave 0 dependencies — N/A here; all tasks are manual-only per project's established zero-build/no-test-framework convention (documented above, not a gap)
- [x] Sampling continuity: no 3 consecutive tasks without automated verify — N/A; project has no automated test infra by design (see Wave 0 Requirements)
- [x] Wave 0 covers all MISSING references — no MISSING references; Wave 0 explicitly not needed (see above)
- [x] No watch-mode flags — N/A, no test runner
- [x] Feedback latency < 300s — manual click-through is ~5 min max
- [x] `nyquist_compliant: true` set in frontmatter — see note below

**Approval:** approved 2026-08-22 — this phase's validation strategy is 100% manual by design, consistent with the project's established zero-build, no-test-framework convention (Phase 4/5 precedent). This is not a Nyquist gap; it is the correct validation shape for this codebase.
