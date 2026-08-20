# Phase 4: Copy & CTA Conversion Pass - Context

**Gathered:** 2026-08-20
**Status:** Ready for planning

<domain>
## Phase Boundary

This phase makes Home, Stores, and Magazine read and convert like a premium shopping mall rather than a house-listing/editorial-only site, and puts a clear, working, on-brand CTA on each of those three pages. Pure content/JSX/copy editing — no new files, no new components, no new state. Requirements: CTA-01 through CTA-07.

</domain>

<decisions>
## Implementation Decisions

### CTA voice
- **D-01:** All new/reworked CTAs use elevated editorial phrasing ("Shop the Houses", "Discover the Directory", "Visit the Boutique"), not literal ecommerce phrasing ("Shop Now", "Browse Categories"). This applies to Home hero CTAs, per-store CTAs, and any subscribe-banner copy touched in this phase.

### Home hero scope
- **D-02:** The copy/CTA rework applies to all 3 hero variants (`HeroManifest`, `HeroSplit`, `HeroIndex` in `pages.jsx`), not just the current default (Split) — toggling the Tweaks-panel hero style must never reveal stale, pre-rework copy.
- **D-03:** In each hero variant, the new shopping-forward CTA is promoted to the first/primary button position, ahead of the existing "Read the issue" / "Open the issue" / directory CTA (which moves to secondary position, not removed).

### Per-store CTA style
- **D-04:** Stores page **list view** (dense single-line rows) stays icon-only (the existing bare "→"), but gets an `aria-label="Visit the Boutique"` (or similar) added for accessibility — do not add visible inline text that would widen the row.
- **D-05:** Stores page **grid view** replaces its current "Enter →" label with "Visit the Boutique →".
- **D-06:** Heritage microcopy (Est. year + category) is added to Home's `StoresPreview` cards (`pages.jsx`), which currently show only name + category — this is what "surfaced more prominently" means for this phase. The Stores page's own Est./category display does not need restyling.

### Magazine shopping reframe
- **D-07:** Light touch only — reword the Magazine page's header lede and paywall copy (in `MagazinePage`, `pages.jsx`) toward a shopping-adjacent framing (e.g. tying stories back to the houses that inspired them). Do **not** add a new store cross-sell section or component — that's a bigger capability, out of scope for this phase (see Deferred).

### Friction audit — concrete bugs found during discussion
- **D-08:** Fix stale copy: `StoresPreview` on Home reads "The Directory · 11 Houses" but `STORES` has 14 entries. Update the copy to match the real count (or make it computed from `STORES.length` so it can't drift again).
- **D-09:** Fix dead CTA: `SubscribeBanner`'s "Continue reading freely →" button (`pages.jsx`, rendered on both Home and Stores via the shared banner) has no `onClick` — it currently does nothing. Wire it to close/dismiss the banner context appropriately (e.g., no-op scroll-past is fine, but it must not be a inert-looking clickable button with zero behavior — at minimum it should behave as a clear "dismiss/continue" affordance consistent with its label).

### Claude's Discretion
- Exact final copy strings (headlines, ledes, button labels beyond the ones explicitly named above) — user approved the voice/direction, not literal final text. Planner/executor should draft copy in the elevated-editorial voice and it does not need a further user round-trip unless something is ambiguous.
- Whether "11 Houses" fix becomes a hardcoded "14 Houses" or a computed `{STORES.length} Houses` — prefer computed to prevent future drift, but either satisfies the requirement.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Requirements & project context
- `.planning/REQUIREMENTS.md` — CTA-01..07 (this phase's locked requirements) and PERK-01..06 (next phase, not in scope here)
- `.planning/PROJECT.md` — Current Milestone section, Constraints, Key Decisions
- `.planning/ROADMAP.md` — Phase 4 goal and success criteria

### Research (v1.1 milestone)
- `.planning/research/SUMMARY.md` — executive summary, roadmap implications, pitfalls
- `.planning/research/FEATURES.md` — luxury CTA/copy conventions, table-stakes vs. differentiators
- `.planning/research/PITFALLS.md` — Pitfall 1 (mass-market voice drift) and Pitfall 2 (CTA styling clash) apply directly to this phase

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `.btn`, `.btn.solid`, `.btn.ghost` CSS classes (`styles.css`) — reuse exclusively for any new/changed CTA buttons; do not introduce new button styling (Pitfall 2: CTA visual clash)
- `STORES[]` array (`components.jsx:38`) — already has `url`, `est`, `cat`, `tagline` per store; per-store CTA and heritage-microcopy work reads from here, no data model changes needed
- `SubscribeBanner` (`pages.jsx:339`) — shared component rendered at the bottom of both `HomePage` and `StoresPage`; one edit here updates both pages' friction-audit fix and CTA voice simultaneously

### Established Patterns
- Each hero variant (`HeroManifest`, `HeroSplit`, `HeroIndex`) independently defines its own CTA buttons inline — no shared "Hero CTA" component, so the copy/order change must be applied in all 3 function bodies separately
- Store rows/cards render via `.map()` over `STORES` in three places (`StoresPreview` on Home, and list/grid views on `StoresPage`) — each has its own JSX/markup, not a shared `<StoreCard>` component

### Integration Points
- `pages.jsx`: `HomePage`, `HeroManifest`, `HeroSplit`, `HeroIndex`, `StoresPreview`, `SubscribeBanner`, `MagazinePage`, `StoresPage` — all copy/CTA edits happen inside this one file
- No changes expected to `app.jsx`, `components.jsx` (`Footer`/`Nav`), `ornaments.jsx`, or `styles.css` beyond possibly an `aria-label` attribute (no new CSS classes needed if `.btn` variants are reused)

</code_context>

<specifics>
## Specific Ideas

- CTA phrasing examples explicitly approved as the target voice: "Shop the Houses", "Discover the Directory", "Visit the Boutique →"
- Grid-view store CTA specifically should read "Visit the Boutique →" (replacing "Enter →")

</specifics>

<deferred>
## Deferred Ideas

- **Explicit store cross-sell section inside Magazine** (linking specific articles/stories to the houses that inspired them) — user chose light-touch tone-only reframe for this phase. This is closer to a new capability than a copy pass; revisit in a future milestone if the light-touch version doesn't move conversion.

</deferred>

---

*Phase: 4-Copy & CTA Conversion Pass*
*Context gathered: 2026-08-20*
