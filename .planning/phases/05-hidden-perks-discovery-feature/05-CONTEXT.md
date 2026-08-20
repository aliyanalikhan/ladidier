# Phase 5: Hidden Perks Discovery Feature - Context

**Gathered:** 2026-08-21
**Status:** Ready for planning

<domain>
## Phase Boundary

This phase adds exactly one hidden-perk discovery element to the site: a small, easy-to-miss interactive mark that, when activated, reveals a static discount code (and, for unsubscribed visitors, an additional subscribe-flow prompt). It is a new, self-contained feature (`perks.jsx`) with one integration point into the existing `Footer` component. No copy/CTA changes outside the new feature itself — Phase 4 already closed the Home/Stores/Magazine conversion pass. Requirements: PERK-01 through PERK-06.

</domain>

<decisions>
## Implementation Decisions

### Trigger look & placement
- **D-01:** The trigger lives in the `Footer` wordmark row, next to the existing `<Crest size={26} />` + "LaDidiér" wordmark — the same row shown in the architecture research's example (`components.jsx`, inside `Footer()`, the `display:flex` div containing `Crest` + the "LaDidiér" display text). Do **not** repurpose `Crest` itself (it renders in 6 unrelated places) — the perk gets its own dedicated element mounted alongside it, per the research's Anti-Pattern 3 warning.
- **D-02:** The mark itself is a tiny decorative flourish glyph (e.g. a small diamond/asterisk-style character, not a plain dot) in the site's gold/muted palette — ornamental enough to look like a stray typographic detail, small enough to overlook at a glance.

### Reveal panel style
- **D-03:** Activating the trigger opens a small floating panel, fixed-position, anchored near the Footer wordmark — not a full modal, not an inline-expand that shifts Footer layout. Style it like the existing `.paywall-gate` (gold border, cream background) per the architecture research, at a z-index between `.mobile-overlay` (100) and `.twk-panel` (2147483646) — e.g. ~500.
- **D-04:** The panel does **not** auto-dismiss. It stays open until the user explicitly closes it (a "Close" button, consistent with `PerkReveal`'s example in the architecture research) or clicks outside it. No countdown/auto-fade — matches the research's guidance against urgency/countdown tactics.

### Discount code & framing
- **D-05:** The code is framed as tied to the current issue ("this issue," referencing the existing `Vol. I N°03` framing already used in `Footer`'s `.foot-base` line) rather than a generic sitewide/standing code — reuses the site's existing quarterly-issue cadence as the soft scarcity device, per FEATURES.md's "Scarcity/exclusivity microcopy" guidance and PITFALLS.md Pitfall 5.
- **D-06:** The code value is the static string `HOUSE10` — matches the established house vocabulary ("House of Houses") from Phase 4's CTA voice work. Hardcoded constant, no validation logic (per architecture research Pattern 3 / Anti-Pattern 1 — this is explicitly a display-only string, never a "redeem"/"check" flow).
- **D-07:** Reveal copy explicitly uses honest "present/mention this" phrasing (e.g. "Present this at any Ladidiér house") rather than implying automated cart/checkout validation — per PITFALLS.md Pitfall 5 (the code is visible via View Source regardless of UI hiding, since there's no backend; copy must not claim enforcement the static architecture can't back up — no "one per visitor," no "limited to first N finders").

### Subscribe-path copy
- **D-08:** For unsubscribed visitors, the reveal panel includes one additional CTA reading **"Also unlock the Sunday letter →"**, which closes the panel and routes to `#subscribe` (matches the architecture research's `PerkReveal` example exactly). This is elevated/editorial voice, consistent with Phase 4's D-01 CTA-voice decision — not "Subscribe Now" or generic ecommerce phrasing.
- **D-09:** The reveal branches on the existing `ladidier_subscribed` localStorage flag, read-only: subscribed visitors see the code only (no subscribe CTA); unsubscribed visitors see the code plus the D-08 CTA. Per PITFALLS.md Pitfall 6 — never show a subscribe prompt to an already-subscribed visitor, and never introduce a second/parallel "engagement" flag that could drift from `ladidier_subscribed`.

### Claude's Discretion
- Exact pixel sizing/positioning of the floating panel and the trigger glyph, exact gold/muted color values used (reuse existing CSS custom properties `--gold`, `--fg`, `--bg`, `--noir` from `styles.css` — do not introduce new palette values).
- Whether the trigger glyph is inline SVG or a styled text character — either is acceptable as long as it visually reads as a quiet flourish, not an obvious button.
- The exact "found" persistence behavior on repeat visits (per PITFALLS.md Pitfall 7: persist a `ladidier_perk_found` flag on first activation, suppress any reveal-triggering animation on subsequent visits, but keep the trigger element itself present and clickable — do not hide the feature after first find). Manual QA reset path: clearing the `ladidier_perk_found` localStorage key.
- Mobile/touch and keyboard-focus implementation details for the trigger (must satisfy PERK-02: reachable via click/tap AND keyboard focus, not hover-only — hover is an optional bonus desktop affordance layered on top, per PITFALLS.md Pitfall 3). Concrete accessibility mechanics (tabindex, focus-visible styling, aria attributes) are left to planning/implementation.
- Exact copy wording beyond the two locked strings (D-06's code, D-08's CTA) — headline/eyebrow text, exact "present this" sentence — should be drafted in the elevated-editorial voice established in Phase 4 and does not need a further user round-trip unless ambiguous.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Requirements & project context
- `.planning/REQUIREMENTS.md` — PERK-01..06 (this phase's locked requirements)
- `.planning/PROJECT.md` — Current Milestone section, Constraints ("Hidden perks must stay hidden"), Key Decisions
- `.planning/ROADMAP.md` — Phase 5 goal and success criteria (`Depends on: Phase 4`)

### Research (v1.1 milestone) — read in full, not just excerpts
- `.planning/research/ARCHITECTURE.md` — full recommended structure for `perks.jsx`: file placement, load order (`ornaments.jsx` → `perks.jsx` → `components.jsx`), `usePerkFound()` hook design, `<HiddenPerk />` single mount point in `Footer`, both HTML files needing the new `<script>` tag (`Ladidier Portal.html` AND `Ladidier Portal-print.html` — missing either causes a `ReferenceError` in `PrintApp`), and all 3 documented anti-patterns
- `.planning/research/FEATURES.md` — "Hidden Perks Mechanics — Researched Patterns" table and MVP Definition section
- `.planning/research/PITFALLS.md` — Pitfalls 3 through 7 apply directly to this phase (hover-only accessibility failure, discoverability paradox, code exposure via View Source, subscribe-flow collision, re-trigger-every-visit distraction) plus Pitfall 8 (mobile `!important` cascade regressions)

### Prior phase context
- `.planning/phases/04-copy-cta-conversion-pass/04-CONTEXT.md` — D-01 (elevated CTA voice rules that the perk reveal's subscribe CTA must match)
- `.planning/STATE.md` — Blockers/Concerns section flags both the discoverability-paradox validation need and the required print-HTML script tag as known risks for this phase

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `.paywall-gate` CSS class (`styles.css:930`) — gold-border/cream-background card styling; reuse for the reveal panel rather than inventing new visual language
- `.mobile-overlay` (`z-index: 100`, `styles.css:575`) and `.twk-panel` (`z-index: 2147483646`) — establish the existing z-index vocabulary; the perk reveal panel should sit between these (research suggests ~500)
- `ladidier_subscribed` localStorage flag — already written by `app.jsx` (line 50) and `pages.jsx` (lines 481, 766); the perk feature only ever reads it, never writes it
- `Footer` component (`components.jsx:303`) — renders on every route via `app.jsx` (outside the route switch), making it the natural single sitewide mount point with zero new prop plumbing

### Established Patterns
- Every top-level file (`ornaments.jsx`, `components.jsx`, `tweaks-panel.jsx`) is a global-scope `<script type="text/babel">`, exported via `Object.assign(window, {...})` — no modules, no bundler. `perks.jsx` should follow this exact convention as a new sibling file.
- `Footer`'s wordmark row (`components.jsx:307-310`) is a `display:flex` container with `Crest` + wordmark text — the natural insertion point for the new trigger element per the architecture research's own example.

### Integration Points
- `components.jsx` (`Footer`): one new line, `<HiddenPerk />`, inside the existing wordmark-row flex container
- `Ladidier Portal.html` and `Ladidier Portal-print.html`: both need a new `<script type="text/babel" src="perks.jsx"></script>` tag inserted between the existing `ornaments.jsx` and `components.jsx` tags — confirmed required in both files since `print-app.jsx`'s `PrintApp` also renders `Footer`
- No changes expected to `app.jsx`, `pages.jsx`, or `ornaments.jsx`

</code_context>

<specifics>
## Specific Ideas

- Discount code string: `HOUSE10`
- Subscribe CTA string: "Also unlock the Sunday letter →"
- Trigger placement: next to `Crest` + "LaDidiér" wordmark in `Footer`, styled as a tiny flourish glyph
- Reveal panel: small floating card near the trigger, `.paywall-gate`-styled, explicit close only (no auto-dismiss)

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope. (Return-visit/dwell-time-gated perk variant and copy-to-clipboard button are already tracked at the milestone level as v2 requirements `PERK-07`/`PERK-08` in `.planning/REQUIREMENTS.md` — not re-raised here since they're out of scope for this phase by design.)

</deferred>

---

*Phase: 5-Hidden Perks Discovery Feature*
*Context gathered: 2026-08-21*
