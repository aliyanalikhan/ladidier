# Phase 5: Hidden Perks Discovery Feature - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-08-21
**Phase:** 5-Hidden Perks Discovery Feature
**Areas discussed:** Trigger look & placement, Reveal panel style, Discount code & framing, Subscribe-path copy

---

## Trigger look & placement

| Option | Description | Selected |
|--------|-------------|----------|
| Faint mark near copyright line | Small gold dot/glyph next to the `.foot-base` copyright line — blends into fine print | |
| Detail on the wordmark row | Subtle mark beside the Crest + "LaDidiér" wordmark at the top of Footer | ✓ |

**User's choice:** Detail on the wordmark row.

**Follow-up — mark shape:**

| Option | Description | Selected |
|--------|-------------|----------|
| Small gold dot | Tiny solid dot, sized like the marquee `.dot` separators | |
| Tiny flourish glyph | Small decorative character (diamond/asterisk-style) in gold/muted palette | ✓ |

**User's choice:** Tiny flourish glyph.
**Notes:** Matches the architecture research's example of mounting `<HiddenPerk />` directly in the Footer wordmark row's flex container, alongside (not replacing) `Crest`.

---

## Reveal panel style

| Option | Description | Selected |
|--------|-------------|----------|
| Small floating panel near the trigger | Compact fixed-position card, `.paywall-gate`-styled, anchored near the Footer wordmark | ✓ |
| Inline expand-in-place | Footer row expands downward inline, pushing footer content below | |

**User's choice:** Small floating panel near the trigger.

**Follow-up — dismissal behavior:**

| Option | Description | Selected |
|--------|-------------|----------|
| Explicit close only | Stays open until user clicks Close or clicks outside | ✓ |
| Auto-dismiss after a few seconds | Fades out automatically after ~5-8s | |

**User's choice:** Explicit close only.
**Notes:** Avoids countdown/urgency tactics per PITFALLS.md guidance.

---

## Discount code & framing

| Option | Description | Selected |
|--------|-------------|----------|
| Tied to "this issue" | Frames the code against the current quarterly issue (Vol. I N°03) | ✓ |
| Generic house-wide code | Standing perk, no issue/time tie-in | |

**User's choice:** Tied to "this issue."

**Follow-up — code value:**

| Option | Description | Selected |
|--------|-------------|----------|
| HOUSE10 | Matches established "House of Houses" vocabulary | ✓ |
| Something else | User-specified string | |

**User's choice:** HOUSE10.

---

## Subscribe-path copy

| Option | Description | Selected |
|--------|-------------|----------|
| "Also unlock the Sunday letter →" | Matches architecture research's `PerkReveal` example; elevated/editorial | ✓ |
| "Join the house list →" | Shorter, house-vocabulary alternative | |

**User's choice:** "Also unlock the Sunday letter →"

**Follow-up — code honesty:**

| Option | Description | Selected |
|--------|-------------|----------|
| Say "present/mention this" | Honest phrasing avoiding implied automated validation | ✓ |
| Just show the code, no framing instruction | Minimal copy, no usage instruction | |

**User's choice:** Say "present/mention this."
**Notes:** Per PITFALLS.md Pitfall 5 — the code is exposed via View Source regardless of UI hiding since there's no backend; copy must not claim enforcement the static architecture can't back up.

---

## Claude's Discretion

- Exact pixel sizing/positioning of the floating panel and trigger glyph; exact reuse of existing `--gold`/`--fg`/`--bg`/`--noir` CSS custom properties
- Inline SVG vs. styled text character for the trigger glyph
- "Found" persistence mechanics (localStorage flag name, suppressing repeat-visit animation while keeping the trigger present) per PITFALLS.md Pitfall 7
- Mobile/touch and keyboard-focus accessibility mechanics (tabindex, focus-visible styling, aria attributes) satisfying PERK-02
- Exact copy wording beyond the two locked strings (HOUSE10, "Also unlock the Sunday letter →")

## Deferred Ideas

None — discussion stayed within phase scope. Return-visit/dwell-time-gated variant and copy-to-clipboard button remain tracked as v2 requirements (PERK-07/PERK-08) in `.planning/REQUIREMENTS.md`, not re-raised here.
