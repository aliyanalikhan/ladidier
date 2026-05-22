# Phase 2: Responsive Layouts - Context

**Gathered:** 2026-05-22
**Status:** Ready for planning

<domain>
## Phase Boundary

Add `@media (max-width: 480px)` CSS rules so every page and component in the LaDidiér portal renders correctly and comfortably at phone width. This phase touches only `styles.css` and the inline style string in `tweaks-panel.jsx` — no React component logic changes, no new pages, no new features.

</domain>

<decisions>
## Implementation Decisions

### Breakpoint Strategy
- **D-01:** Phone breakpoint is `480px` only — one new standalone `@media (max-width: 480px)` block added at the bottom of the Responsive section in `styles.css`. Follows the Phase 1 pattern (standalone blocks, not merged into the 920px block). No 360px pass needed.

### Hero Decorations
- **D-02:** At `≤480px`, hide all decorative layers: `.ticker` (store name marquee), `.watermark` (SVG monogram behind hero), `.float` and `.float-slow` (floating ornaments), and `.spotlight` (cursor gold halo). Use `display: none` or `visibility: hidden`. The luxury brand voice comes from typography at phone scale — layering adds visual noise.
- **D-03:** `.cover.tilt` 3D perspective transform (`perspective(1400px) rotateY/rotateX`) is removed at `≤480px` — hover-based 3D effects don't work on touch screens. Magazine cover renders as a flat card.

### Hero-Split Image
- **D-04:** The `.hero-split .ph` image placeholder is hidden at `≤480px`. The split hero becomes text-only on phone — headline, intro text, and CTA buttons are what matter. No oversized portrait image blocking the scroll.

### Store Row
- **D-05:** At `≤480px`: `.store-row .name` font-size drops to `22px` (overrides the `clamp(28px, 3vw, 44px)`). Grid becomes `32px 1fr auto`, gap reduces to `16px`. `.store-row` padding tightened accordingly.

### Magazine & Article Pages
- **D-06:** Article cards (`.art-card`) stack to a single column at `≤480px`. Magazine page article grid goes full-width single column.
- **D-07:** Article page body gets reduced horizontal padding — `16px` instead of the default `var(--gutter)` — at `≤480px`. Slightly tighter line-height for comfortable phone reading.

### Footer
- **D-08:** Footer collapses to a single column at `≤480px` (from 2-column at 920px). `.foot` gets `grid-template-columns: 1fr`.
- **D-09:** `.foot-base` (copyright/locale bar) stacks vertically at `≤480px` — `flex-direction: column; gap: 8px; align-items: center; text-align: center`.

### Tweaks Panel
- **D-10:** At `≤480px`, the tweaks panel becomes full-width and bottom-centered: `width: calc(100vw - 32px); right: 16px; left: 16px; transform-origin: bottom center`. Dragging is disabled on mobile via pointer-events or a media query that removes the `cursor: move` and drag handlers visually. The content scroll already works (`overflow-y: auto` is set in the inline CSS). CSS change goes into the `__TWEAKS_STYLE` template literal in `tweaks-panel.jsx`.

### Tap Targets
- **D-11:** All interactive elements (buttons, nav links, store rows) must meet the 44×44px minimum tap target at `≤480px`. Existing mobile nav buttons (hamburger, close ×) already meet this from Phase 1. Any element falling short gets `min-height: 44px` or `padding` adjustment.

### Claude's Discretion
- `.hero-manifest` heading size, padding reductions, and `max-width` adjustments within phone widths — Claude picks sensible values consistent with the site's `clamp`-based fluid type scale.
- Subscribe plan cards: currently use `repeat(auto-fit, minmax(280px, 1fr))` inline on the section — these will auto-stack at phone width without CSS changes needed. If any overflow is detected, add a 480px override.
- `.page-head` grid was already fixed to single column at 920px — no additional phone pass needed unless overflow is found during research.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

No external specs or ADRs — requirements are fully captured in the decisions above and in REQUIREMENTS.md.

### Existing CSS structure
- `styles.css` §447 — `@media (max-width: 920px)` tablet block (reduce, don't overwrite)
- `styles.css` §486 — `@media (max-width: 768px)` mobile nav block (Phase 1, do not modify)
- `styles.css` §852 — `@media (prefers-reduced-motion: reduce)` block (may need mobile overlay silence if not already covered)

### Phase requirements
- `.planning/REQUIREMENTS.md` — RESP-01 through RESP-10 (all 10 requirements for this phase)

### Tweaks panel inline CSS
- `tweaks-panel.jsx` §49–75 — `__TWEAKS_STYLE` template literal (the only place tweaks panel CSS lives; D-10 change goes here)

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `@keyframes stgIn` — already in styles.css; stagger animation reused for overlay links in Phase 1
- `--gutter` CSS variable — used for section padding; phone pass can override with explicit `16px`
- `clamp()` type scale — site uses `clamp(min, vw, max)` throughout; phone overrides should use explicit `px` values not new clamp expressions

### Established Patterns
- **Standalone breakpoint blocks:** Phase 1 added `@media (max-width: 768px)` as its own block with a clear comment header. The 480px block should follow the same structure.
- **`display: none` for hiding:** Phase 1 used `display: none` to hide desktop nav links at 768px. Use the same for hiding decorative elements.
- **No JS required:** All responsiveness is pure CSS. No React component changes needed unless the tweaks panel drag needs to be disabled with a JS media query check.

### Integration Points
- New `@media (max-width: 480px)` block slots in **after** the 768px block in `styles.css`
- `tweaks-panel.jsx` `__TWEAKS_STYLE` string — append the 480px override at the end of the string before the closing backtick

</code_context>

<specifics>
## Specific Ideas

No specific references beyond the decisions above — user confirmed "full website, all pages" with the recommended approaches throughout.

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 2-responsive-layouts*
*Context gathered: 2026-05-22*
