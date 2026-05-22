# Phase 2: Responsive Layouts - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-05-22
**Phase:** 02-responsive-layouts
**Areas discussed:** Breakpoint strategy, Hero decorations, Hero-split image, Tweaks panel, Store row, Magazine & article pages, Footer

---

## Breakpoint Strategy

| Option | Description | Selected |
|--------|-------------|----------|
| 480px only | One standalone block, matches Phase 1 pattern | ✓ |
| 480px + 360px | Extra pass for smallest Android phones | |
| Use 768px | Extend existing mobile-nav breakpoint | |

**User's choice:** 480px only
**Notes:** Follows the standalone-block pattern established in Phase 1.

---

## Hero Decorations

| Option | Description | Selected |
|--------|-------------|----------|
| Strip all at ≤480px | Hide ticker, watermark, floats, spotlight | ✓ |
| Keep decorations, disable only tilt/3D | Preserve texture layers | |
| Strip ticker only | Hide marquee bar, keep watermark and ornaments | |

**User's choice:** Strip all at ≤480px
**Notes:** Typography carries the luxury brand voice on phone — decorative layers add noise.

---

## Hero-Split Image

| Option | Description | Selected |
|--------|-------------|----------|
| Hide image on phone | Text-only hero | ✓ |
| Shorter aspect ratio (16/9) | Keep image at ~211px tall | |
| Keep 3/4, add max-height | Clamp portrait ratio to 260px | |

**User's choice:** Hide the image on phone
**Notes:** 3/4 ratio = ~500px tall on 375px phone, pushes all content offscreen.

---

## Tweaks Panel

| Option | Description | Selected |
|--------|-------------|----------|
| Full-width + disable drag | calc(100vw-32px), bottom-centered, drag off | ✓ |
| Full-width + keep drag | Resize but allow touch dragging | |
| Hide on mobile entirely | display:none at ≤480px | |

**User's choice:** Full-width + disable drag on mobile
**Notes:** CSS change goes into `__TWEAKS_STYLE` template literal in tweaks-panel.jsx.

---

## Store Row

| Option | Description | Selected |
|--------|-------------|----------|
| Reduce name font + tighten grid | 22px name, 32px 1fr auto grid, 16px gap | ✓ |
| Keep as-is from 920px pass | No additional phone CSS | |
| Card layout on phone | New card pattern | |

**User's choice:** Reduce name font + tighten grid
**Notes:** clamp(28px, 3vw, 44px) clamps to 28px minimum on phone — still too large for a tight phone layout.

---

## Magazine & Article Pages

| Option | Description | Selected |
|--------|-------------|----------|
| Single-column cards + tighter article padding | Stack cards, article padding 16px | ✓ |
| Single-column only | Stack cards, keep article padding | |
| Custom description | — | |

**User's choice:** Single-column cards + tighter article padding
**Notes:** Art cards to 1 column; article body padding → 16px at ≤480px.

---

## Footer

| Option | Description | Selected |
|--------|-------------|----------|
| Single column + stacked footer-base | 1fr grid + vertical copyright bar | ✓ |
| Single column, keep footer-base horizontal | 1fr grid, copyright stays flex row | |

**User's choice:** Single column + stacked footer-base
**Notes:** .foot-base: flex-direction: column, gap: 8px, align-items: center.

---

## Claude's Discretion

- Hero-manifest heading size and padding values at phone width
- Subscribe plan cards (auto-fit grid likely handles stacking already — verify and patch if needed)
- Page-head grid (already single-column at 920px — check for overflow only)

## Deferred Ideas

None — discussion stayed within phase scope.
