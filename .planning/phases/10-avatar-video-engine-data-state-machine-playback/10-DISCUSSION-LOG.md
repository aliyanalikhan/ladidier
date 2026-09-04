# Phase 10: Avatar Video Engine — Data, State Machine & Playback - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-09-05
**Phase:** 10-avatar-video-engine-data-state-machine-playback
**Areas discussed:** FAQ content & video mapping, Interim UI & production exposure, Video asset handling, Manual verification approach

---

## FAQ Content & Video Mapping

**User provided (free text):** The 15 real question texts grouped into the 4 categories, with video source location `D:\ttt\LaDidier Avatar`.

| Option | Description | Selected |
|--------|-------------|----------|
| Yes, sequential Q1–Q15 in that order | Q1.mp4=Q1 text, Q2.mp4=Q2 text, etc. straight through | ✓ |
| No, let me give you the actual mapping | Video files don't correspond 1:1 in listed order | |

**User's choice:** Sequential mapping confirmed.
**Notes:** Category breakdown confirmed as 5/5/3/2, matching the 17-file source (15 answers + Idle + INTRO).

---

## Interim UI & Production Exposure

| Question | Option | Description | Selected |
|----------|--------|-------------|----------|
| Ship live or gate? | OK to ship live temporarily | Push straight to main like other phases; unstyled UI live until Phase 11 | ✓ |
| | Keep it off production | Feature branch or query-param gate | |
| Placement | Bottom-right, widget-shaped | Built in final position/shape from the start | ✓ |
| | Separate dev-only test page | Verify on disconnected route, wire in later | |
| Styling | Functional only, no polish | Plain buttons + video tag, minimal CSS | ✓ |
| | Some baseline styling now | Basic on-brand styling even in Phase 10 | |

**User's choice:** Ship live, bottom-right placement, no polish.
**Notes:** None — all three questions answered with the recommended option.

---

## Video Asset Handling

| Question | Option | Description | Selected |
|----------|--------|-------------|----------|
| Vercel tier check timing | Yes, verify before Phase 10 merges | Escalated from Phase 12 since this phase now ships the video weight live | ✓ |
| | Defer to Phase 12 | Original research-suggested timing | |
| Filenames | Keep exact names as-is | Idle.mp4, INTRO.mp4, Q1-Q15.mp4 unchanged | ✓ |
| | Normalize to lowercase | idle.mp4, intro.mp4, etc. | |
| Git storage | Yes, plain git commit | Matches existing public/assets/ convention | ✓ |
| | Reconsider — use Git LFS | Smaller clone size | |

**User's choice:** Verify Vercel tier now, keep filenames as-is, plain git commit.
**Notes:** The Vercel-tier-check timing question surfaced directly from the "ship live" decision in the prior area — flagged explicitly as an escalation from research's original Phase 12 placement.

---

## Manual Verification Approach

| Question | Option | Description | Selected |
|----------|--------|-------------|----------|
| Hands-on level | I'll click through it myself | Matches Phase 4's CTA-07 gate precedent | ✓ |
| | Trust an automated/scripted pass | Claude-only verification | |
| iOS real-device access | I can test on a real iPhone | Manual Low Power Mode + autoplay verification | ✓ |
| | No iPhone access — flag as known gap | Tracked gap for later | |

**User's choice:** Manual click-through by user; real iPhone testing available.
**Notes:** None.

---

## Claude's Discretion

- Reducer/state-machine implementation shape (generation-counter guard, `.catch()` handling) — fully specified by research, no user input needed.
- Mount placement inside `HomePage`, `sessionStorage` "intro played once" mechanics — architecture, not product decisions.
- Exact interim-UI markup/CSS shape, as long as functional/unstyled/bottom-right per D-04.
- `preload="none"` / on-demand loading strategy for the 15 answer videos.

## Deferred Ideas

None — discussion stayed within Phase 10's scope. Widget chrome (Phase 11) and accessibility/responsive polish (Phase 12) remain correctly out of scope for this phase.
