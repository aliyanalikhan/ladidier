# Phase 4: Copy & CTA Conversion Pass - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-08-20
**Phase:** 4-Copy & CTA Conversion Pass
**Areas discussed:** CTA voice, Home hero scope, Per-store CTA style, Magazine shopping reframe

---

## CTA voice

| Option | Description | Selected |
|--------|-------------|----------|
| Elevated editorial | "Shop the Houses", "Discover the Directory", "Visit the Boutique" — matches existing luxury tone, avoids mass-market drift | ✓ |
| Direct & literal | "Shop Now", "Browse Categories" — closer to original brief wording, more conventional ecommerce feel | |
| Mix | Editorial by default, literal for the single strongest CTA | |

**User's choice:** Elevated editorial (Recommended)
**Notes:** Applies across Home hero CTAs, per-store CTAs, and subscribe-banner copy touched in this phase.

---

## Home hero scope

| Option | Description | Selected |
|--------|-------------|----------|
| All 3 variants | Manifest/Split/Index all get the rework — consistent no matter which hero is toggled in Tweaks | ✓ |
| Split only | Just the current default; other 2 stay as-is | |

**User's choice:** All 3 variants (Recommended)

| Option | Description | Selected |
|--------|-------------|----------|
| Promote shopping CTA to first position | e.g. "Shop the Houses" first, "Read the issue" second | ✓ |
| Add as a 3rd CTA | Keep existing 2 buttons, add a new one | |

**User's choice:** Promote to first position (Recommended)

---

## Per-store CTA style

| Option | Description | Selected |
|--------|-------------|----------|
| Icon-only, aria-label added | Preserves dense list-row feel; accessible via aria-label | ✓ |
| Full visible text in list view | "Visit the Boutique →" spelled out on every row | |

**User's choice:** Icon-only, aria-label added (Recommended)

| Option | Description | Selected |
|--------|-------------|----------|
| Replace grid "Enter →" with "Visit the Boutique →" | Consistent explicit wording | ✓ |
| Keep "Enter →" | Leave as-is | |

**User's choice:** Replace with "Visit the Boutique →" (Recommended)

| Option | Description | Selected |
|--------|-------------|----------|
| Add Est./category to Home preview cards | Extends heritage cues to first place people see stores | ✓ |
| Just increase visual weight where it exists | No changes to Home cards | |

**User's choice:** Add Est./category to Home preview cards too (Recommended)

---

## Magazine shopping reframe

| Option | Description | Selected |
|--------|-------------|----------|
| Light touch: tone/lede copy only | Reword header lede + paywall copy, no new sections | ✓ |
| Add explicit store cross-sell section | New section linking articles to stores — closer to a new capability | |

**User's choice:** Light touch: tone/lede copy only (Recommended)
**Notes:** Store cross-sell section deferred — see Deferred Ideas.

---

## Bugs found during codebase scouting (not a discussion area, but surfaced and confirmed in scope)

- Home's `StoresPreview` says "11 Houses" but `STORES` array has 14 entries — stale copy, will fix as part of friction audit (CTA-07).
- `SubscribeBanner`'s "Continue reading freely →" button has no `onClick` handler — dead button on both Home and Stores pages, will fix as part of friction audit (CTA-07).

## Claude's Discretion

- Exact final copy strings (headlines, ledes, CTA labels beyond the ones explicitly approved) — voice/direction is locked, literal text is not.
- Whether the "11 Houses" fix is hardcoded to "14" or computed from `STORES.length`.

## Deferred Ideas

- Explicit store cross-sell section inside Magazine (linking articles/stories to the houses that inspired them) — belongs in a future milestone if the light-touch reframe doesn't move conversion enough.
