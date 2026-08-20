# Project Research Summary

**Project:** LaDidiér Portal — v1.1 "Shopping Mall Conversion Pass"
**Domain:** Zero-build client-side React (CDN React 18 + Babel standalone) luxury multi-brand editorial/ecommerce portal — conversion copy/CTA rework + a subtle "hidden perks" discovery mechanic
**Researched:** 2026-08-20
**Confidence:** HIGH

## Executive Summary

This milestone is not a technology problem — it's a tone-and-integration problem on top of an already-shipped, zero-build React codebase. All four research streams converge on the same conclusion: no new libraries, frameworks, or build tooling are needed or wanted. The copy/CTA rework is pure content editing inside existing `pages.jsx` functions using the existing `.btn solid` / `.btn ghost` hierarchy, and the "hidden perks" mechanic is fully achievable by extending patterns the codebase already has proven out — `localStorage` (mirroring `ladidier_subscribed`), `IntersectionObserver` and `mousemove`-driven CSS custom properties (mirroring the `Spotlight`/`CountUp`/`RomanReveal` ornaments), and hand-written CSS keyframes. Architecture research recommends a single new file, `perks.jsx`, mounted once inside the sitewide `Footer`, with fully self-contained state — explicitly avoiding prop-drilling into `app.jsx` or repurposing the existing no-op `Crest` component.

The recommended approach is two sequential phases within the milestone: (1) a copy/CTA rewrite pass across Home, Stores, and Magazine that reuses existing button classes and shifts tone toward "shopping-forward editorial" (house vocabulary like "Shop the Houses," not generic "BUY NOW" urgency), and (2) a hidden-perk feature built after the copy tone is finalized, so the perk's reveal-panel copy doesn't need a second editing pass. The perk should be a single, non-gamified, non-modal discovery element — either a hover-reveal on an existing ornament or a "whispered" low-opacity link — that reveals a static, display-only discount code and/or routes into the existing subscribe flow, gated on the existing `ladidier_subscribed` flag so already-subscribed users aren't re-prompted.

The dominant risk across all four research files is not technical but experiential: copy drifting into mass-market urgency language that breaks the luxury tone, and a hidden perk that is either genuinely unreachable (hover-only, invisible on touch/keyboard) or so subtle it's never found by real users — the "discoverability paradox." A secondary, concrete technical risk is the print-export path (`Ladidier Portal-print.html` / `print-app.jsx`) hard-crashing with a `ReferenceError` if the new `perks.jsx` script tag is added to only one of the two HTML entry points, since `PrintApp` also renders `Footer`. Both risks are well-understood and have clear, low-cost mitigations documented below — this is a low-technical-risk, tone-and-detail-sensitive milestone.

## Key Findings

### Recommended Stack

No new core technologies, libraries, or build tooling are required or recommended. Every capability needed for this milestone — persistence, scroll-triggered reveal, cursor-driven hover reveal, animation, and reduced-motion support — is already an established, in-use pattern in this exact codebase. Introducing any new dependency (even a small CDN-loaded one like `canvas-confetti`) was explicitly evaluated and rejected as scope creep against both the "no npm, no build tools" constraint and the "unobtrusive, not gamified" tone requirement.

**Core technologies (all native, all already-patterned in this codebase):**
- `localStorage` — persist "perk found" state — reuses the exact `ladidier_subscribed` pattern in `app.jsx`/`pages.jsx`
- `IntersectionObserver` — scroll-triggered reveal gating — reuses the pattern already in `ornaments.jsx` (`CountUp`, `RomanReveal`)
- CSS custom properties + `mousemove` — cursor-driven hover reveal — reuses the existing `Spotlight` component (`ornaments.jsx:135-153`)
- CSS `@keyframes` + `transition`, respecting `prefers-reduced-motion` — matches every existing animation in `styles.css`, including the existing reduced-motion media-query block that any new animation must be added to
- `navigator.clipboard.writeText()` — optional "copy code" affordance — secure-context requirement already satisfied by the live Vercel HTTPS deployment

### Expected Features

**Must have (table stakes, P1):**
- One clear, primary shopping-forward CTA on Home, promoted above the existing "Read the issue" secondary CTA
- Explicit per-store CTA on Stores page cards ("Visit the Boutique →") pointing at the already-present `STORES[].url` field
- Magazine landing copy reframed to invite shopping without disturbing the existing paywall/subscribe mechanics
- One hidden perk element (hover- or click-triggered), styled with existing ornament/typography components, revealing a static promo code and/or a subscribe-flow prompt
- The perk must be genuinely, verifiably easy to miss — no visual signposting, no nav entry, no onboarding tooltip

**Should have (differentiators, P2):**
- Shoppable-editorial voice using house vocabulary ("Shop the House of Houses," not "Buy Now") rather than generic ecommerce phrasing
- Heritage/house-code microcopy surfaced more prominently (existing `est`/`cat` fields on `STORES`)
- Scarcity framing kept implicit via the existing quarterly "issue" cadence rather than countdown timers

**Defer (explicitly out of scope / v2+):**
- Real, validated/redeemable discount codes tied to a backend — no backend exists, and building fake validation is an anti-pattern per architecture research
- Multiple hidden perks, leaderboards, or any collection mechanic
- Copy/CTA rework on About/Article pages
- Return-visit/dwell-time-gated perk variant (only revisit if the simple hover/click version proves too easy or too hard to find in real usage)

### Architecture Approach

Add exactly one new file, `perks.jsx`, following the project's flat, five-file, zero-build convention (no `src/`, no bundler). It loads between `ornaments.jsx` and `components.jsx` in both HTML entry points and exports a single composite `<HiddenPerk />` component with fully self-contained state via a local `usePerkFound()` hook — not lifted to `app.jsx`, since only one component ever needs to read it. The single integration point is one line inside `Footer` (`components.jsx`), which already mounts on every route outside the route switch, giving sitewide presence with zero routing/prop changes. The only cross-feature coupling allowed is a **read-only** check of the existing `ladidier_subscribed` key, to decide whether the perk reveal shows a subscribe CTA or just the code — the perk feature must never write that key.

**Major components:**
1. `perks.jsx` (new) — owns the perk's storage key, static code constant, `usePerkFound()` hook, trigger mark, and reveal panel — self-contained, single-instance
2. `components.jsx` (`Footer`) — one-line mount point (`<HiddenPerk />`) — no other changes
3. `pages.jsx` — copy/CTA edits only, inside `HomePage`, `StoresPage`, `MagazinePage`, `SubscribeBanner` — no new components or state
4. `styles.css` — perk-mark and reveal-panel rules reusing the existing `.paywall-gate` gold-border/cream-bg visual language and z-index conventions (between `.mobile-overlay` [100] and `.twk-panel` [2147483646])
5. Both `Ladidier Portal.html` and `Ladidier Portal-print.html` — both need the new `<script>` tag for `perks.jsx`, since `PrintApp` also renders `Footer`

### Critical Pitfalls

1. **Copy drifts into mass-market ecommerce voice** (exclamation points, ALL CAPS, countdown urgency) — avoid by using editorial imperative CTAs ("Discover the Collection") and reading new copy aloud next to the copy it replaces to check for tone jarring.
2. **New CTAs visually clash with the existing noir/gold palette** — avoid by reusing existing `.btn` / `.btn.solid` / `.btn.ghost` classes exclusively; increase emphasis via size/whitespace/position, never new color contrast.
3. **Hover-only hidden perk is unreachable on touch devices and keyboard** — the codebase's hover-heavy pattern (`:hover` throughout `styles.css`) will get copy-pasted into the perk trigger by default; it must ship with a real click/tap handler and `:focus`/`:focus-visible` styles, with `:hover` layered on top as a bonus, not the only path. Test on an actual touch device and via keyboard tab-through.
4. **The discoverability paradox** — over-indexing on "must not distract" can make the perk unfindable in practice, defeating the milestone's business goal even though every literal acceptance criterion passes. Validate with a cold-read test (someone unfamiliar with the change browses ~60-90 seconds unprompted).
5. **Hidden perk collides with the existing subscribe flow** — building the perk's subscribe-prompt path without checking `ladidier_subscribed` first can re-prompt already-subscribed users or stack two overlays. Branch perk behavior on the existing flag before building.

Two additional pitfalls worth flagging for phase planning: the discount code is trivially exposed via View Source (an accepted architectural limitation, not a bug — copy must not claim scarcity/single-use the site can't enforce), and new perk/CTA markup can silently collide with the existing mobile `!important` cascade from the recent v1.0 responsive work (commit `a386bcd`) — every new element needs an explicit on-device mobile regression check, not just a desktop-resize check.

## Implications for Roadmap

Based on research, suggested phase structure:

### Phase 1: Copy & CTA Conversion Pass
**Rationale:** Zero new files, zero new state — pure content/JSX editing on the existing component tree (`pages.jsx`, `SubscribeBanner`). Finalizes the site's shopping-mall tone and CTA wording before the hidden perk's reveal-panel copy is written, avoiding a second copy pass on that panel.
**Delivers:** Home, Stores, and Magazine read and convert like a premium shopping mall; explicit primary CTA on each page; per-store "Visit the Boutique →" CTAs wired to existing `STORES[].url`; friction/dead-end audit across the three pages.
**Addresses:** All P1 table-stakes features except the hidden perk (FEATURES.md): primary CTA hierarchy, per-store CTAs, above-the-fold clarity, house-vocabulary copy.
**Avoids:** Pitfall 1 (mass-market voice drift), Pitfall 2 (CTA styling clash), and the mobile-regression half of Pitfall 8 for this page set.

### Phase 2: Hidden Perks Discovery Feature
**Rationale:** Technically independent of Phase 1, but sequenced after it because the perk reveal panel's subscribe-upsell/code copy should echo the finalized conversion voice from Phase 1 rather than needing its own separate tone pass.
**Delivers:** New `perks.jsx` file with self-contained `<HiddenPerk />` component (trigger + reveal panel + `usePerkFound()` hook), mounted once in `Footer`; static display-only discount code and/or subscribe-flow routing, gated on existing `ladidier_subscribed`; script tag added to both `Ladidier Portal.html` and `Ladidier Portal-print.html`.
**Uses:** `localStorage`, `IntersectionObserver`/`mousemove` + CSS custom properties, CSS keyframes (STACK.md) — no new dependencies.
**Implements:** `perks.jsx` as a self-contained feature file (Architecture Pattern 1), self-contained state (Pattern 2), display-only code with no validation logic (Pattern 3).

### Phase Ordering Rationale

- Copy-first, perk-second is directly recommended by ARCHITECTURE.md's "Suggested Build Order" — the two workstreams touch almost entirely disjoint files (`pages.jsx` copy edits vs. new `perks.jsx` + one `Footer` line) and could technically run in parallel, but sequencing avoids a second editing pass on the perk reveal's copy once final CTA tone is locked.
- Keeping the phases split along "copy only" vs. "new feature file" also keeps each phase's diff independently reviewable — a copy-only PR, then a feature-only PR — which matches the "no breaking changes to existing routing/layouts" constraint by minimizing surface area per change.
- Both phases carry their own mandatory mobile-regression and accessibility checks (Pitfall 3, Pitfall 8) as explicit done-criteria rather than a final combined QA pass, since PITFALLS.md maps these risks to each phase independently.

### Research Flags

Phases likely needing deeper research during planning:
- Neither phase requires `/gsd-research-phase` in the traditional sense (new-tech-uncertainty) — this milestone's research is unusually complete and codebase-grounded (HIGH confidence architecture, HIGH confidence stack). However, Phase 2 (Hidden Perks) would benefit from a lightweight design-validation step during planning — specifically deciding the exact trigger element/location and running the "cold-read" discoverability test (Pitfall 4) — since that's a UX judgment call, not something further desk research can resolve.

Phases with standard patterns (skip research-phase):
- **Phase 1 (Copy & CTA):** Pure content editing on an established component/CSS system; no technical unknowns.
- **Phase 2 (Hidden Perks):** All technical patterns (localStorage, IntersectionObserver, CSS custom-property hover tracking, static code display) are already proven in this exact codebase; the only open question is UX tuning (subtlety/findability), not technology.

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | Grounded directly in codebase inspection; no new technology decisions needed, only pattern-reuse confirmation |
| Features | MEDIUM | WebSearch-verified across multiple luxury-ecommerce/mall-directory sources, cross-checked against existing codebase data model (`STORES`, `SubscribeBanner`) |
| Architecture | HIGH | Pure integration-architecture question answered entirely from existing, already-shipped codebase conventions (script load order, export pattern, localStorage precedent, z-index/styling conventions) |
| Pitfalls | MEDIUM | No direct case study exists for "luxury editorial portal adds hidden perk"; synthesized from adjacent domains (luxury ecommerce CRO, easter-egg UX, WCAG hover/focus rules) plus direct repo inspection for codebase-specific risks (mobile `!important` cascade, print-export crash risk) |

**Overall confidence:** HIGH

### Gaps to Address

- **Exact hidden-perk trigger location/visual treatment:** FEATURES.md and ARCHITECTURE.md both narrow this to "hover-reveal on an existing ornament" or "whispered footer link" as the best-fit patterns, but the final choice (which ornament, what visual tell) is a design decision to make during phase planning, not something further research resolves.
- **Discoverability tuning (Pitfall 4):** Cannot be validated on paper — requires a real cold-read test with someone unfamiliar with the change after the feature is built. Flag this as an explicit acceptance check in Phase 2's done-criteria rather than trying to resolve it during planning.
- **Discount code value/copy specifics:** Research confirms the code must be static, display-only, and honestly framed (no false scarcity claims), but the actual code string and exact reveal copy are content decisions for the copy/perk phases themselves, not research gaps.

## Sources

### Primary (HIGH confidence)
- Direct codebase inspection: `app.jsx`, `pages.jsx`, `components.jsx`, `ornaments.jsx`, `styles.css`, `Ladidier Portal.html`, `Ladidier Portal-print.html`, `print-app.jsx`, `.planning/PROJECT.md` — authoritative source for existing patterns, constraints, and integration points across all four research files
- [MDN: Clipboard.writeText()](https://developer.mozilla.org/en-US/docs/Web/API/Clipboard/writeText) — secure-context requirement confirmation
- [Hover Actions and Accessibility: Addressing a Common WCAG Violation — BOIA](https://www.boia.org/blog/hover-actions-and-accessibility-addressing-a-common-wcag-violation) — WCAG SC 2.1.1 / 1.4.13 grounding
- [WCAG Content on Hover or Focus Explained — GetStark](https://www.getstark.co/wcag-explained/perceivable/distinguishable/content-on-hover-or-focus/) — official WCAG success-criterion explanation

### Secondary (MEDIUM confidence)
- [7 Luxury Copywriting Examples and Strategies — Carmine Mastropierro](https://carminemastropierro.com/luxury-copywriting/); [How to create a seamless luxury website — Webflow Blog](https://webflow.com/blog/luxury-brand-websites); [Cheat sheet: Farfetch vs Net-a-Porter — Glossy](https://www.glossy.co/fashion/cheat-sheet-how-farfetch-and-net-a-porter-stack-up/) — luxury CTA/voice conventions
- [Mall of America Directory](https://www.mallofamerica.com/directory); [Mall Directory: what it is — Zapt Tech](https://zapt.tech/en/blog/Mall-directory:-what-it-is--how-it-works--and-why-your-mall-needs-one./) — multi-brand directory CTA patterns
- [Several Ways to Hide Easter Eggs on your Website — Bryan Braun](https://www.bryanbraun.com/2018/04/01/several-ways-to-hide-easter-eggs-on-your-website/); [The power of Easter Eggs in tech — UX Collective](https://uxdesign.cc/the-power-of-easter-eggs-in-tech-4491bb87bcdf); [The Art of Brand Easter Eggs — Phable](https://www.phable.io/phable-labs/the-art-of-brand-easter-eggs) — discovery-mechanic precedent
- [Luxury eCommerce UX — ConvertCart](https://www.convertcart.com/blog/luxury-product-page-ecommerce); [CRO for Luxury Ecommerce — Intuitia](https://www.intuitia.tech/blog/conversion-rate-optimization-for-luxury-ecommerce/); [6 Mistakes to Avoid When Designing CTAs — AccuRanker](https://www.accuranker.com/blog/mistakes-to-avoid-when-designing-your-ctas/) — CRO/pitfall synthesis

### Tertiary (LOW confidence)
- [canvas-confetti on jsDelivr/UNPKG](https://www.jsdelivr.com/package/npm/canvas-confetti) — used only to confirm one rejected alternative was CDN-viable before recommending against it on tone grounds; not load-bearing for the final recommendation

---
*Research completed: 2026-08-20*
*Ready for roadmap: yes*
