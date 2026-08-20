# Feature Research

**Domain:** Luxury multi-brand editorial/ecommerce portal — conversion copy/CTA rework + subtle "hidden perks" discovery mechanic
**Researched:** 2026-08-20
**Confidence:** MEDIUM (WebSearch-verified across multiple sources; cross-checked against current codebase conventions in `pages.jsx`, `components.jsx`, `ornaments.jsx`)

## Feature Landscape

### Table Stakes (Users Expect These)

Features/copy conventions users assume exist on a premium multi-brand shopping destination. Missing these makes the site read as a portfolio/editorial piece rather than a place to buy.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| One clear primary CTA per landing page, above the fold | Every luxury multi-brand site (Net-a-Porter, Mytheresa, mall directories like Mall of America) leads with a single unambiguous next action — "Shop," "Discover the Collection," "Browse Stores" | LOW | Home already has `Read the issue` / `Enter the stores` — needs the *shopping* verb promoted to primary weight, magazine kept secondary. Reuse existing `.btn solid` / `.btn ghost` hierarchy. |
| Per-store CTA on directory/store cards ("Visit the Boutique →", "Shop [Store] →") | Mall directories and multi-brand retailers always pair a brand tile with an explicit action, not just a name + tagline | LOW | `STORES` array in `components.jsx` already has a real external `url` per store (e.g. `https://thescntshop.com/`) and a poetic `tagline` — the data model already supports this, only the visible CTA label/affordance is missing. |
| Above-the-fold clarity: what this is + what to do next | Mall directory convention ("500+ stores, browse now") — visitors need to grasp "this is a shoppable house of stores" within one screen, not after reading editorial copy | LOW | Home hero already states "Fourteen stores. One magazine." — good bones, needs a shopping-forward CTA sitting next to it. |
| Consistent CTA visual hierarchy (1 primary solid + 1 secondary ghost/link, never 2+ solid buttons competing) | Standard ecommerce/luxury UX pattern; conflicting CTAs measurably hurt conversion | LOW | Codebase already has `.btn solid`, `.btn ghost` classes — just needs disciplined application per page, not new component work. |
| Newsletter/subscribe CTA present but subordinate to the shopping CTA | Expected on any editorial-commerce hybrid; but should never outrank "go shop" as the primary action on Home/Stores | LOW | `SubscribeBanner` already exists at the bottom of pages — leave it as the secondary/closing CTA, don't promote it above the shopping CTA. |
| Friction removal: no dead-end pages, no orphaned "read more" that never resolves to an action | Any page that only *describes* and never *invites* a next step reads as real-estate/editorial listing, not shopping-mall | LOW | Applies mainly to Stores and Magazine landing sections — audit for any block ending in prose with no button/link. |

### Differentiators (Competitive Advantage)

Features/copy patterns that set LaDidiér apart from generic ecommerce while still converting. Should reinforce Core Value: "every page must feel like opening a luxury magazine."

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| Shoppable-editorial voice — magazine diction that resolves in an action ("Shop the House of Houses," "Enter the Boutiques," not "Buy Now") | Luxury copywriting research consistently shows high-end brands avoid blunt transactional verbs ("Buy," "Snag Yours") in favor of "Discover," "Explore the Collection," "Shop the Edit" — direct enough to convert, elevated enough to stay on-brand | LOW | Directly resolves the PROJECT.md tension: "Shop Now" as literal button copy is fine as a *concept* (be unambiguous, be an action), but the actual wording should stay inside the house's established vocabulary (est. dates, Roman numerals, "House of Houses," per-store taglines) rather than generic dot-com phrasing. |
| Heritage/house-code framing per category (jewelry house, perfumery, atelier, roastery) instead of generic ecommerce category labels | Multi-brand luxury retailers signal value through heritage messaging (founding year, house codes) — this is literally already modeled in the `STORES` data (`est: "MMXXI"`, `cat: "Jewelry"`) | LOW | Copy work only — surface the existing `est` and `cat` fields more prominently in CTA-adjacent microcopy on the Stores page (e.g. "Jewelry House · Est. MMXXI · Shop the Collection →"). |
| Hidden Perks discovery mechanic — one subtle, premium-styled discoverable element tied to a discount code or subscribe prompt | This milestone's headline differentiator. Real-world precedent: brands hide a "secret" discount page or link discoverable only by curious/loyal visitors (not advertised in nav), rewarding attentiveness rather than interrupting browsing — this is the "insider access" feeling luxury brands cultivate | MEDIUM | See Hidden Perks Mechanics section below for pattern options, complexity, and dependency notes. |
| Scarcity/exclusivity microcopy without discount-banner tone (e.g., quarterly "issue" framing already doubles as a soft urgency device) | Avoids the countdown-timer/urgency-banner tone that reads as mass-market and undermines luxury trust | LOW | Already partially present via `Vol. / N°/season` issue framing — extend the same device to the Hidden Perk reveal copy (e.g. frame the perk as tied to "this issue" rather than a generic sitewide sale). |

### Anti-Features (Commonly Requested, Often Problematic)

Patterns that look like good conversion tactics but break the luxury feel or exceed this milestone's explicit scope.

| Feature | Why Requested | Why Problematic | Alternative |
|---------|---------------|------------------|-------------|
| Countdown timers / "Sale ends in 2:59:59" urgency banners | Common ecommerce conversion tactic, proven on mass-market sites | Reads as high-pressure/mass-market; breaks luxury trust; no real inventory/sale system exists in this static-site architecture to back it honestly | Use the existing quarterly "issue" cadence (Vol./N°/season) as the soft urgency device — "this issue only" instead of a ticking clock |
| Gamified spin-to-win / discount wheel popups | Surface appeal: high engagement metrics on generic ecommerce | Explicitly out of scope per PROJECT.md ("no gamified hidden perks system"); also reads as discount-mall/impulse-retail, not luxury | Single, quiet, non-modal discovery element (see Hidden Perks Mechanics) |
| Aggressive exit-intent modals demanding email before leaving | Common growth-hacking pattern for capturing emails | Interrupts the editorial reading flow the brand is built on; explicitly conflicts with the "unobtrusive by design" constraint in PROJECT.md | Keep the existing passive `SubscribeBanner` at the bottom of pages; let the Hidden Perk (if it surfaces a subscribe prompt) be opt-in and easy to dismiss |
| Multiple/repeatable hidden perks, leaderboards, or a "collect them all" mechanic | Seems like it would drive more engagement/replay value | Explicitly out of scope per PROJECT.md; also requires state tracking, uniqueness logic, and a reward ladder — real backend/complexity creep for a static client-side site | Ship exactly one working discovery mechanic, styled premium, done well |
| Live/validated discount codes requiring server-side redemption | Feels more "real" and trustworthy than a static code | Out of scope — PROJECT.md constraint: "no backend/API integration, portal is static/client-side" | Display a static promo code as the reveal payload (same pattern many boutique/DTC sites use for a "email us this code" or manually-honored code), or route the discovery straight into the existing subscribe flow instead of a redeemable code |
| Literal generic "Shop Now" / "Buy Now" button text everywhere, verbatim | PROJECT.md names this as an example CTA | Taken too literally it reads like a discount outlet, not a house of luxury stores, undercutting the "premium mall not bargain mall" positioning research consistently found | Use the *concept* (unambiguous, single, transactional CTA) but phrase it in house vocabulary — "Shop the Houses," "Enter the Boutique," "Browse the Collections" — while keeping one plain "Shop Now"-equivalent for scan-ability on the Stores page grid where clarity beats cleverness |

## Hidden Perks Mechanics — Researched Patterns

Real-world precedent for subtle, non-gamified discovery mechanics, ranked by fit for this project's "premium, low-distraction" requirement and by implementation complexity against the existing zero-build React+CSS stack.

| Pattern | How It Works | Precedent | Complexity | Fit |
|---------|--------------|-----------|------------|-----|
| Hover-reveal on an existing ornament | A decorative element already on the page (e.g. the `Monogram` watermark, `Crest`, or `Laurel` in `ornaments.jsx`) reveals a faint prompt/code on `:hover`, invisible otherwise | Established front-end easter-egg pattern — hover states are the most common place to hide UI because they only surface if the cursor happens to land there | LOW | Best fit — reuses existing ornament components, purely CSS-driven, genuinely easy to miss, no new state needed for the "found" moment itself |
| "Whispered" footer/margin link (faint text, near-invisible until hover/focus) | A single small link styled at very low opacity or matching background, sitting in the footer or margin, that brightens on hover and reveals a perk | Real brand precedent: brands and newsletters (e.g. travel/lifestyle editorial brands) hide a "secret link" in each edition/page that rewards attentive readers | LOW | Strong fit — matches the "unobtrusive by design" constraint exactly; no interaction pattern beyond hover+click |
| Click on a non-nav decorative element (e.g. click the Crest icon 1x, or click the issue Roman numeral) | A single click on an element that looks purely decorative (not a link) triggers a reveal panel/toast | Common in brand easter eggs (logo-click reveals, source-code hidden messages) | LOW–MEDIUM | Good fit if paired with a subtle visual cue (cursor changes to pointer) so it's discoverable but not signposted |
| Scroll-depth trigger near page bottom | A small reveal (not a popup) fades in once a visitor scrolls near the very bottom of a long page (e.g. end of an Article or bottom of Stores) | Common "you made it this far" reward pattern on content sites | LOW | Decent fit but less "hidden" — scroll-triggered content is a known, semi-expected pattern, so it reads more like a designed feature than a true discovery. Best used as a secondary/backup surface, not the primary mechanic. |
| Return-visit / dwell-time triggered reveal (localStorage-tracked) | Perk only becomes discoverable after N visits or after spending time on site, rewarding loyal/attentive visitors | Mirrors the existing `ladidier_subscribed` localStorage pattern already in the codebase | MEDIUM | Good thematic fit ("insider access for regulars") but adds state-tracking complexity beyond a single milestone's "one real mechanic" brief — only pursue if the simpler hover/click patterns feel too easy to find in testing |
| Keyboard sequence (Konami-code style) | A specific keypress sequence unlocks a perk | Common on tech/gaming sites | MEDIUM | Weakest fit — reads as a "programmer/gamer" easter egg convention, not a luxury-fashion one; higher complexity (global key listener) for a tone mismatch. Avoid. |

**Recommended approach:** Combine the hover-reveal-on-ornament pattern (or the whispered footer link) as the discovery trigger with a simple, non-modal reveal (an inline panel or toast styled with existing typography/ornament components, not a `alert()` or takeover modal) that surfaces either: (a) a static promo code string, or (b) a direct link into the existing `SubscribePage`/`SubscribeBanner` flow. This keeps the mechanic to CSS + one small React state flag, consistent with "fully built, not just prototyped" while staying inside the zero-build, no-backend constraint.

## Feature Dependencies

```
Hidden Perks reveal (discount code path)
    └──requires──> Static, non-validated promo code string (no backend redemption)
                       └──requires──> Out-of-Scope constraint: no backend/API integration

Hidden Perks reveal (subscribe path)
    └──requires──> Existing SubscribePage / SubscribeBanner routing
                       └──enhances──> Existing localStorage subscribe flow (`ladidier_subscribed`)

Hidden Perks "found" state (optional, for one-time reveal polish)
    └──requires──> New localStorage flag (e.g. `ladidier_perk_found`), same pattern as `ladidier_subscribed`

Per-store CTA ("Shop [Store] →")
    └──requires──> Existing STORES[].url field (already present in components.jsx)

Copy/CTA rework on Home, Stores, Magazine
    └──requires──> No new components — content/microcopy edits within existing HeroManifest, HeroSplit, StoresPage, MagazinePage bodies
    └──enhances──> Existing .btn solid / .btn ghost hierarchy (reuse, don't redesign)

Hidden Perks discovery element ──conflicts──> Gamified/multi-perk system (explicitly out of scope)
Hidden Perks discovery element ──conflicts──> Modal/popup-based reveal (violates "unobtrusive," "does not distract")
```

### Dependency Notes

- **Hidden Perks (discount path) requires a static, non-validated code:** the project has no backend, so the "discount" is a display-only string. This should be framed honestly in copy (e.g., a code to mention at checkout on the destination store's own external site, or a code for a future promotion) rather than implying live cart integration that doesn't exist.
- **Hidden Perks (subscribe path) enhances existing infrastructure:** routing a discovered perk straight into `SubscribePage`/`SubscribeBanner` is the lowest-complexity option since that flow, its localStorage flag, and its UI already exist and are proven.
- **Per-store CTA requires no new data modeling:** `STORES[].url` already holds each boutique's real external site — the milestone work is purely surfacing it as a visible CTA, not building new plumbing.
- **Hidden Perks discovery conflicts with gamified/modal patterns:** both are explicitly out of scope per PROJECT.md and conflict with the "must not distract from or block the shopping flow" constraint — any implementation using `alert()`, a full-screen modal, or a multi-step scavenger hunt should be rejected at design time.

## MVP Definition

### Launch With (v1.1 — this milestone)

- [ ] Home hero promotes a shopping-forward CTA (e.g. "Shop the Houses") to primary visual weight, alongside the existing "Read the issue" as secondary — essential to satisfy PROJECT.md's core requirement
- [ ] Stores page: each store card carries an explicit CTA label (not just tagline + image) pointing at its existing `url` — essential, closes the loop between "browse" and "buy"
- [ ] Magazine landing copy reframed to invite shopping (not just reading) where relevant, without disturbing the paywall/subscribe mechanics already built — essential per PROJECT.md scope
- [ ] One hidden perk element, hover- or click-triggered, styled with existing ornament/typography components, revealing either a static promo code or a direct subscribe-flow prompt — essential, this is the headline new feature
- [ ] Hidden perk is verifiably easy to miss in normal browsing (no visual signposting, no nav entry, no onboarding tooltip) — essential per explicit constraint

### Add After Validation (v1.x)

- [ ] Return-visit/dwell-time gated variant of the hidden perk, if user testing shows the simple hover/click version is found too quickly or too rarely — trigger: real usage feedback after this milestone ships
- [ ] Extend copy/CTA rework to About and Article pages — trigger: PROJECT.md currently defers these explicitly; revisit once Home/Stores/Magazine prove out

### Future Consideration (v2+)

- [ ] Real, validated discount codes tied to a backend/commerce layer — defer until/unless the project moves off the static-site architecture (explicitly out of scope constraint today)
- [ ] Multiple hidden perks or a light collection mechanic — defer per explicit PROJECT.md exclusion; only reconsider if the single-perk mechanic proves popular and the team wants to invest in real backend/state support

## Feature Prioritization Matrix

| Feature | User Value | Implementation Cost | Priority |
|---------|------------|---------------------|----------|
| Shopping-forward primary CTA on Home | HIGH | LOW | P1 |
| Per-store CTA on Stores page cards | HIGH | LOW | P1 |
| Magazine landing copy reframed toward shopping | MEDIUM | LOW | P1 |
| Hidden Perk (hover/click reveal, static code or subscribe route) | HIGH | MEDIUM | P1 |
| House-code/heritage microcopy pass (est. dates, categories surfaced) | MEDIUM | LOW | P2 |
| Return-visit-gated perk variant | LOW-MEDIUM | MEDIUM | P3 |
| Copy/CTA rework on About/Article | LOW (out of scope this milestone) | LOW | P3 |
| Live/validated discount redemption | MEDIUM | HIGH (needs backend) | P3 (blocked by constraint) |

**Priority key:**
- P1: Must have for this milestone
- P2: Should have, add when possible within this milestone
- P3: Nice to have / explicitly deferred

## Competitor Feature Analysis

| Feature | Net-a-Porter / Mytheresa (luxury multi-brand ecommerce) | Mall of America / Simon malls (physical mall directory sites) | Our Approach |
|---------|-----------------------------------------------------------|------------------------------------------------------------------|--------------|
| Primary CTA verb | "Discover," "Shop the Edit," rarely bare "Buy Now" | "Browse Stores," "Explore," "Take Me There" (wayfinding-flavored) | Blend both registers: house-vocabulary verbs ("Shop the Houses," "Enter the Boutiques") for hero copy, plainer "Shop Now"-equivalent on the Stores grid where scanability matters |
| Per-brand/store entry | Product grid, brand logo, "Shop [Brand]" | Store tile, category tag, "Visit Store" / directory link | Store card with tagline (existing) + explicit CTA to the store's real external `url` (existing field, currently under-surfaced) |
| Directory framing | Editorial "Shop the Story," curated collections | Literal count + "browse the directory" | Reuse existing "Fourteen stores. One magazine." framing, paired with an explicit CTA |
| Discount/loyalty discovery | Rarely gamified; usually a private-sale/insider-access email program | Not typically present (physical malls) | Hidden Perk mechanic as the analog to an "insider access" program, expressed as a quiet on-site discovery rather than an email program (no backend to support real membership tiers) |
| Urgency tactics | Minimal — "New In," seasonal framing, not countdowns | Minimal — informational, wayfinding-first | Reuse existing quarterly "issue" cadence (Vol./N°/season) as the only urgency device; avoid countdowns/banners |

## Sources

- [The Fundamentals of Effective eCommerce Copywriting in 2025 | Lounge Lizard](https://www.loungelizard.com/blog/the-fundamentals-of-effective-ecommerce-copywriting/)
- [Best 4 Copywriting Services for Luxury Brands (2025) | Awisee](https://awisee.com/blog/copywriting-services-for-luxury-brands/)
- [A Copywriting Guide for Fashion Brands with Examples | Insidea](https://insidea.com/blog/marketing/fashion-brands/a-copywriting-guide)
- [7 Luxury Copywriting Examples and Strategies | Carmine Mastropierro](https://carminemastropierro.com/luxury-copywriting/)
- [Best Multi-Brand Websites | Great Examples of Strategy | We Are Fine](https://www.wearefine.com/news/best-multi-brand-websites/)
- [How to create a seamless luxury website with 7 examples | Webflow Blog](https://webflow.com/blog/luxury-brand-websites)
- [20 Best Luxury Brand Websites in 2026 | Nakada Design](https://nakadadesign.com/stories/20-best-luxury-brand-websites-2026)
- [Cheat sheet: How Farfetch and Net-a-Porter stack up | Glossy](https://www.glossy.co/fashion/cheat-sheet-how-farfetch-and-net-a-porter-stack-up/)
- [Mall of America Directory – Browse 500+ Stores & Map](https://www.mallofamerica.com/directory)
- [Mall Directory: what it is, how it works, and why your mall needs one | Zapt Tech](https://zapt.tech/en/blog/Mall-directory:-what-it-is--how-it-works--and-why-your-mall-needs-one./)
- [How Interactive Mall Directories Cater to Individual Preferences | Rise Vision](https://www.risevision.com/blog/interactive-mall-directories)
- [Several Ways to Hide Easter Eggs on your Website | Bryan Braun](https://www.bryanbraun.com/2018/04/01/several-ways-to-hide-easter-eggs-on-your-website/)
- ['Secret' Discount Page Hack to Boost Sales! | Medium](https://medium.com/@growthbranch/try-this-secret-discount-page-hack-to-boost-your-sales-instantly-3d27720c0a72)
- [Superfan Codeword Discounts (Shopify App)](https://apps.shopify.com/codeword-secret-discounts)
- [The Art of Brand Easter Eggs | Phable](https://www.phable.io/phable-labs/the-art-of-brand-easter-eggs)
- Codebase inspection: `/Users/aech/Documents/Ladidier/pages.jsx`, `/Users/aech/Documents/Ladidier/components.jsx`, `/Users/aech/Documents/Ladidier/ornaments.jsx`, `/Users/aech/Documents/Ladidier/app.jsx` (existing CTA hierarchy, STORES data model, subscribe flow, ornament components)

---
*Feature research for: Luxury multi-brand editorial/ecommerce portal — v1.1 Shopping Mall Conversion Pass*
*Researched: 2026-08-20*
