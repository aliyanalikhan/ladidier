# Pitfalls Research

**Domain:** Conversion-copy/CTA rework + hidden-discovery mechanic on an existing luxury editorial site (React 18 CDN, no build step, static/client-side)
**Researched:** 2026-08-20
**Confidence:** MEDIUM — grounded in current CRO/UX/accessibility sources plus direct inspection of this codebase (`styles.css`, `app.jsx`, `pages.jsx`); no domain-specific case study exists for "luxury editorial portal adds hidden perk," so synthesis is from adjacent domains (luxury ecommerce CRO, easter-egg UX, WCAG hover/focus rules).

## Critical Pitfalls

### Pitfall 1: "Shopping Mall" Copy Drifts Into Mass-Market Ecommerce Voice

**What goes wrong:**
Copy rewritten toward "shop now" urgency imports generic ecommerce tone — exclamation points, all-caps sale banners, "LIMITED TIME," "BUY NOW 50% OFF" — that reads like a discount retailer, not a luxury house. The brand feel (quiet, editorial, restrained) breaks even though every literal requirement ("clear CTA," "shopping mall not house-listing tone") is technically met.

**Why it happens:**
Conversion copywriting patterns are optimized for mass-market urgency and scarcity, which is the opposite instinct from luxury copywriting (implicit scarcity, understatement, letting product/imagery do persuasion). Writers pattern-match "conversion" to "hard sell" by default.

**How to avoid:**
Keep urgency implicit, not shouted. Use editorial imperative voice ("Discover the Collection," "Step Inside") rather than retail-urgency voice ("SHOP NOW — SALE ENDS SOON"). Luxury brands that convert well (e.g. The Ordinary's "Discover Now") use quiet, single-word or short-phrase CTAs and trust that persuasion has already happened via imagery/copy above the fold — the CTA is a confirmation, not a pitch. Read every new copy block aloud next to the existing house-listing copy it replaces; if the tone shift is jarring, it's too far.

**Warning signs:**
Exclamation points, ALL CAPS discount call-outs, countdown/urgency language, generic "Shop Now!!" buttons that could belong to any retailer, copy that names a price/percentage discount outside the hidden-perks feature.

**Phase to address:**
Copy & CTA rewrite phase (Home/Stores/Magazine copy pass).

---

### Pitfall 2: New CTAs Visually Clash With the Existing Restrained Palette

**What goes wrong:**
New "Shop Now / Browse Categories" buttons are styled with high-contrast, retail-style treatment (bright fills, heavy shadows, badge-like urgency styling) that looks bolted onto the noir/gold editorial palette already defined in `styles.css` (`--fg`, `--bg`, `--gold`, `--noir`). The page visually splits into "editorial" and "sale banner" zones.

**Why it happens:**
"Make the CTA prominent" gets solved with contrast tricks borrowed from generic CRO advice, without checking that the existing `.btn`, `.btn.solid`, `.btn.ghost` classes (already tuned to the palette, with existing hover treatments at lines 188–192 of `styles.css`) are reused instead of new one-off button styles.

**How to avoid:**
Reuse the existing `.btn` / `.btn.solid` / `.btn.ghost` classes for all new CTAs rather than inventing new button treatments. Where more emphasis is genuinely needed, increase size/spacing/position (more whitespace around it, higher on the page) rather than reaching for color contrast outside the existing gold/noir system.

**Warning signs:**
A new CTA button doesn't visually belong to the same design system as five-month-old buttons on the same page; a designer/reviewer says "that looks like a different site."

**Phase to address:**
Copy & CTA rewrite phase.

---

### Pitfall 3: Hover-Only Hidden Perk Is Invisible on Touch Devices (Accessibility + Mobile)

**What goes wrong:**
The hidden perk is implemented as a hover-reveal (opacity/transform on `:hover`, following the exact pattern already used throughout this codebase — `.store-row:hover`, `.lift:hover`, `.nav a:hover::before`). On mobile — this site's stated core value is "feel like luxury magazine on any device" — there is no hover state at all, so the perk is not just hard to find, it is structurally unreachable for the majority of visitors, and unreachable via keyboard/assistive tech too.

**Why it happens:**
The codebase already leans heavily on hover for its editorial "reveal" feel (arrow slide-ins, lift-on-hover cards), so a hidden perk naturally gets implemented the same way by pattern-matching existing code — without separately validating a touch/keyboard path. WCAG 2.1.1 requires all functionality be operable via keyboard; SC 1.4.13 requires hover/focus-triggered content to also be dismissible, hoverable, and persistent — but the more basic failure here is simpler: hover has no touch equivalent at all, so it must ship with a genuine tap/focus trigger, not just a CSS media-query fallback.

**How to avoid:**
Design the perk trigger as a real interactive element (button/link with `tabindex`, visible focus style, `aria-*` where appropriate) that responds to click/tap AND keyboard `Enter`/`Space`, with `:hover` as a bonus desktop affordance layered on top — not the only affordance. Test the discovery path on an actual touch device or touch-emulated devtools, and by tabbing through the page with a keyboard, before considering the feature done.

**Warning signs:**
The perk trigger's only CSS state is `:hover`; no `:focus` or `:focus-visible` rule exists for it; testing only happened by moving a mouse in a desktop browser; grep of the new CSS for the trigger shows `:hover` but no `:focus`.

**Phase to address:**
Hidden Perks feature phase — should be a stated acceptance check, not an afterthought.

---

### Pitfall 4: The Discoverability Paradox — Too Subtle to Ever Be Found

**What goes wrong:**
In the effort to satisfy "genuinely easy to miss" and "must not add visible clutter," the perk is made so subtle that its real-world find rate is effectively zero. The feature ships, works correctly, and is never triggered by real users — the discount code / subscribe prompt it's meant to surface never gets used, and the milestone's actual business goal (drive perceived value / conversion) is not met even though every literal acceptance criterion passes.

**Why it happens:**
"Subtle" and "findable" pull in opposite directions, and it's easy to over-index on the "must not distract" half of the requirement while under-testing the "discoverable" half — especially because the person building it already knows exactly where the perk is, so it never feels hidden to them the way it will to a first-time visitor.

**How to avoid:**
Design for "findable through curiosity, not chance" — a slightly unusual visual detail (a subtly different weight/glow/motion on one ornament, a slightly non-standard interaction on an otherwise decorative element) that rewards attentive browsing rather than requiring pixel-hunting or a specific unlikely gesture. Validate with a cold read: have someone unfamiliar with the change browse the live page for 60–90 seconds without being told a perk exists, and see if they find it. If nobody in an informal test finds it within a normal browsing session, it's too hidden; if everyone notices it immediately on page load, it's not hidden enough.

**Warning signs:**
No one outside the person who built it has ever found it without being told where to look; the trigger requires an action no real user would organically perform (e.g., hovering a specific corner pixel for 3+ seconds, or right-clicking).

**Phase to address:**
Hidden Perks feature phase.

---

### Pitfall 5: Discount Code Is Trivially Exposed by "View Source" (No Backend)

**What goes wrong:**
Because this is explicitly a static/client-side site with no backend or API (out of scope by design), any discount code embedded in the JSX/JS to be revealed by the perk is present in the shipped bundle from page load — visible via "View Source," browser devtools, or a simple text search of the deployed JS, regardless of how well the UI hides the trigger. The "hidden" perk's payload is never actually secret.

**Why it happens:**
The team is solving a UI/UX hiding problem ("don't show it in the DOM/visually") while the actual constraint is architectural (no backend means no server-side secret). These are different problems and a UI-only solution doesn't address the second one.

**How to avoid:**
Treat this as a known, accepted limitation, not a bug to fix within this milestone's constraints (no backend is explicitly out of scope). Choose a discount code/value that's fine to be "soft-secret" — a marketing nicety rather than a fraud-sensitive asset (modest, non-stacking, no strict expiry enforcement needed). Do not promise "limited to first N finders" or "single use" copy that the static architecture cannot actually enforce, since that would be a false claim to the user given no backend exists to enforce it.

**Warning signs:**
Copy or product language implies exclusivity/scarcity/single-use ("only a few codes left," "one per visitor") that the static architecture has no way to enforce; the code string appears in plaintext in a `.jsx` file with no obfuscation and the surrounding copy makes claims beyond what that architecture can back up.

**Phase to address:**
Hidden Perks feature phase — resolve as a scoping/copy decision early, not a late surprise.

---

### Pitfall 6: Hidden Perk Reveal Collides With the Existing Subscribe Flow

**What goes wrong:**
The site already has a subscribe flow with a `localStorage`-backed `ladidier_subscribed` flag (`app.jsx` line 50, set in `pages.jsx` lines 481 and 766) and its own modal/overlay UI. A new hidden-perk feature that also surfaces a "subscribe" prompt, without checking this existing flag, can (a) ask already-subscribed users to subscribe again, which reads as broken/repetitive, or (b) stack two overlays/modals on screen at once if both flows can trigger in the same session, or (c) invent a second, parallel "has this user engaged" flag that drifts out of sync with the original.

**Why it happens:**
The perk feature is built as an isolated new component without first reading how the existing subscribe state and modal are implemented, since they live in different files (`pages.jsx` vs wherever the new perk component is added).

**How to avoid:**
Before building, read the existing `ladidier_subscribed` check and subscribe modal implementation in `pages.jsx`/`app.jsx`. Branch perk behavior on that existing flag: already-subscribed visitors who find the perk should see the discount-code path, not a duplicate subscribe prompt. Ensure only one overlay/modal can be visible at a time (the perk reveal should check/close any other open overlay, or use a shared overlay-management pattern if one exists).

**Warning signs:**
A newly subscribed test user still sees "subscribe to reveal your perk" copy; two modals appear stacked in a manual test where both are plausible in the same session; a new `localStorage` key is added for the perk that duplicates information already tracked by `ladidier_subscribed`.

**Phase to address:**
Hidden Perks feature phase.

---

### Pitfall 7: Hidden Perk Re-Triggers Every Visit, Becoming a Distraction (Violates "No Distraction" Requirement)

**What goes wrong:**
Without a persisted "already found / already dismissed" state, the perk element re-appears or re-animates on every page load or every session, becoming a recurring, noticeable interruption rather than a one-time delightful discovery — directly violating the constraint that perks "do not distract from or block the shopping flow." The opposite failure also occurs: if state is persisted too aggressively (e.g., permanently hidden site-wide after first view on any device), returning users or users on a second device never get a chance to discover it, and QA/testing becomes confusing because the perk "disappears" after first encounter with no visible way to reset it during testing.

**Why it happens:**
Persistence design (what counts as "found," per-device vs. account-level, whether repeat visits should occasionally re-surface something new) is an easy detail to skip when the main effort goes into the visual hiding mechanic.

**How to avoid:**
Persist a "found" flag in `localStorage` (consistent with the existing `ladidier_subscribed` pattern) the first time the perk is actually triggered/opened, and suppress the reveal animation/prompt on subsequent visits from that flag — while leaving the underlying static ornament/trigger element in place so it doesn't look like the feature vanished. Document a manual reset path (clear the specific `localStorage` key) for QA and for reviewing the feature later.

**Warning signs:**
Refreshing the page repeatedly re-triggers the same reveal animation or prompt; there's no way to distinguish "never found" from "found and dismissed" in the stored state; QA can't tell if the feature disappeared because it broke or because it was already found.

**Phase to address:**
Hidden Perks feature phase.

---

### Pitfall 8: New Styles Break the Existing Mobile Layout via the Fragile `!important` Cascade

**What goes wrong:**
Recent commits show the mobile responsive layer already relies on `!important` overrides to beat existing inline/desktop grid styles (see commit `a386bcd` "override all inline grid styles on mobile layout using important styles"). New CTA buttons or a hidden-perk trigger element added without care can either get silently overridden by these existing mobile `!important` rules (so the new element looks fine on desktop but is broken/invisible/misplaced on mobile), or can require yet another `!important` override, deepening an already-fragile cascade the project explicitly wants preserved ("existing routing and the responsive layouts from v1.0 must be preserved exactly").

**Why it happens:**
Adding markup/CSS for new copy or CTAs is done by eye on desktop first, and the mobile pass is treated as a final check rather than validated against the specific selectors already fighting for specificity in `styles.css`.

**How to avoid:**
Before adding new elements to Home/Stores/Magazine, grep `styles.css` for the mobile media-query block and any existing `!important` rules touching the container/section being changed, so new CSS is added in a way that doesn't need to fight them. Test every new CTA and the perk trigger at mobile breakpoints (not just resize-the-desktop-window — use the same manual on-device/touch-emulated check used in v1.0 Phase 2) as part of the phase's done-criteria, not a separate follow-up.

**Warning signs:**
A new element looks correct on desktop but is misaligned, overflowing, or missing at ≤480px; a new CSS rule needed its own `!important` to take effect.

**Phase to address:**
Both the Copy & CTA rewrite phase and the Hidden Perks feature phase — each should include an explicit mobile-regression check against the v1.0 layouts before being marked done.

---

## Technical Debt Patterns

| Shortcut | Immediate Benefit | Long-term Cost | When Acceptable |
|----------|-------------------|-----------------|------------------|
| Hardcode the discount code as a plaintext string in JSX | Fast to ship, no infra needed | Anyone can find it via View Source, defeating "hidden"; no expiry/reuse control | Acceptable given the no-backend constraint — just don't make marketing promises (scarcity/single-use) the architecture can't back |
| Reuse the existing subscribe modal/overlay DOM for the perk reveal instead of a separate component | Less new code, consistent visual language | Couples two features' state/CSS; a change to one risks breaking the other | Acceptable if the reuse is a deliberate shared component, not copy-pasted markup with diverging state |
| Add new `!important` CSS to force a new element's mobile layout | Fast fix when the existing cascade fights you | Deepens an already-fragile override chain the project wants to keep stable | Acceptable only as a narrowly scoped, well-commented override — never as a first resort |
| Global find/replace of button/CTA copy across `components.jsx` shared components | Fast, one edit updates every page | Bleeds tone/CTA changes into out-of-scope pages (About, Article) that share the same components | Never acceptable without first checking which pages consume the shared component being edited |

## Integration Gotchas

Since this is a static, backend-free site, "integration" here means integrating the new feature with the site's own existing systems, not third-party services.

| Integration | Common Mistake | Correct Approach |
|-------------|-----------------|-------------------|
| Existing `ladidier_subscribed` localStorage flag | Building the perk's subscribe-prompt path without checking this flag first, re-prompting already-subscribed users | Branch perk behavior on the existing flag; already-subscribed visitors get the discount-code path, not a duplicate subscribe ask |
| Hash router (`app.jsx`) | Implementing the hidden perk as a new hash route (e.g. `#/secret`) — discoverable via URL bar autocomplete/history, and arguably a "new nav destination" the constraint disallows | Implement the perk as an in-page interactive element/component, not a route |
| Tweaks panel (`tweaks-panel.jsx`) | New perk trigger accidentally becomes visible/toggleable through the existing dev tweaks panel in production | Verify the tweaks panel doesn't expose or interact with the perk trigger; keep them independent |
| Shared components (`components.jsx`) | Editing a shared CTA/button component for tone reasons without checking which out-of-scope pages (About, Article) also render it | Grep for all usages of a shared component before changing its copy or default styling |

## Performance Traps

| Trap | Symptoms | Prevention | When It Breaks |
|------|----------|-----------|------------------|
| Animated "sparkle/glow" hover treatment applied broadly for the perk's decorative styling | Janky scroll/hover on low-end mobile devices | Scope animation to the single trigger element only; use `transform`/`opacity` (already the pattern in this codebase) not layout-affecting properties | Noticeable once more than one or two animated elements are on screen at once on a mid-range phone |
| Scroll/mouse-move listener used to detect "near the hidden element" for a proximity-reveal effect | Scroll jank, battery drain on mobile | Prefer CSS-only hover/focus triggers over JS scroll/mousemove listeners; if JS is required, throttle/debounce it | Breaks as soon as the listener isn't debounced, even at this site's small scale |

## Security Mistakes

| Mistake | Risk | Prevention |
|---------|------|-----------|
| Treating the client-embedded discount code as if it were secret/fraud-controlled | Code gets scraped/shared publicly and used far beyond intended "genuine finders," undermining the discount's economics | Choose a code/value the business is fine with being informally public; don't message it as strictly limited or single-use |
| Storing "found the perk" or discount state in a way that's trivially editable via devtools (expected for localStorage) and then trusting it for anything beyond UI state | None severe at this site's scope, but avoid building future logic (e.g., "don't show the discount reveal twice") that assumes this client-side flag is tamper-proof | Only use the localStorage flag to control UI presentation, never anything that must not be user-alterable |

## UX Pitfalls

| Pitfall | User Impact | Better Approach |
|---------|-------------|-------------------|
| Perk reveal implemented as a popup/interstitial (modal-on-load, exit-intent) | Directly breaks the "must not distract from or block shopping flow" requirement; reads as a generic retail dark pattern, clashing with luxury tone | Make the perk something the user opts into by interacting with an ambient element, never something that appears unprompted over the content |
| Hidden perk trigger visually indistinguishable from the existing decorative ornaments (`ornaments.jsx`) | Users either never register it as interactive, or start clicking every ornament in confusion, adding friction rather than delight | Give the trigger one small, consistent, intentional tell (a subtly different motion, weight, or reveal on interaction) so attentive users can learn to recognize it, without it looking like every other ornament |
| New CTA copy uses generic urgency language ("SALE!" "LIMITED TIME!") on a luxury audience that expects restraint | Erodes trust/brand perception for the exact shoppers most likely to convert on a luxury site | Use quiet, brand-voiced imperative CTAs ("Discover the Collection") and let implicit scarcity/quality carry the persuasion |

## "Looks Done But Isn't" Checklist

- [ ] **Hidden Perks feature:** Often missing a genuine touch/tap trigger — verify on an actual touch device or touch-emulated devtools, not just a resized desktop browser window.
- [ ] **New CTA buttons:** Often missing visible `:focus`/`:focus-visible` states — verify by tabbing through Home/Stores/Magazine with a keyboard only, no mouse.
- [ ] **Copy rewrite scope:** Often bleeds into out-of-scope pages via shared components — verify About and Article page copy/CTA styling is byte-for-byte unchanged.
- [ ] **Discount code reveal:** Often missing "already subscribed" / "already found" handling — verify a returning, already-subscribed test user doesn't get re-asked to subscribe, and a user who already found the perk doesn't get the same intrusive reveal animation again.
- [ ] **Hidden perk subtlety:** Often over- or under-tuned without real validation — verify with a cold read (someone unfamiliar with the change browsing for ~60–90 seconds) that it's neither impossible to find nor impossible to miss.
- [ ] **Mobile regression:** Often verified only on desktop-resized-to-mobile-width — verify new CTAs and the perk trigger against the same on-device checks used for the v1.0 mobile responsive pass.

## Recovery Strategies

| Pitfall | Recovery Cost | Recovery Steps |
|---------|----------------|-----------------|
| Brand voice drifted too commercial after ship | LOW | Copy lives as isolated text strings in `pages.jsx`; revise flagged blocks page by page without structural changes |
| Hover-only perk found inaccessible on mobile/keyboard | MEDIUM | Add a real click/tap handler and `:focus`/`:focus-visible` CSS alongside the existing `:hover` rule; retest on-device |
| Discount code scraped/overused | LOW–MEDIUM | Rotate the code string in source and redeploy; treat as expected maintenance given the static-site constraint, not an emergency |
| New CTA/perk element broke mobile layout | MEDIUM | Audit the mobile media-query block and existing `!important` rules for the affected container in `styles.css`; scope a narrow, targeted override rather than adding more global `!important`s |
| Perk re-triggers annoyingly on every visit | LOW | Add/fix the `localStorage` "found" flag check consistent with the existing `ladidier_subscribed` pattern |

## Pitfall-to-Phase Mapping

The roadmap for this milestone does not exist yet; based on the two feature groups in PROJECT.md ("copy/CTA/conversion cleanup" and "hidden perks"), pitfalls map as follows:

| Pitfall | Prevention Phase | Verification |
|---------|-------------------|---------------|
| Brand voice drifts commercial (Pitfall 1) | Copy & CTA rewrite phase | Read new copy aloud against replaced copy; check for urgency/all-caps language |
| CTA styling clashes with palette (Pitfall 2) | Copy & CTA rewrite phase | Confirm all new CTAs use existing `.btn` classes, not new one-off styles |
| Hover-only perk unreachable on touch/keyboard (Pitfall 3) | Hidden Perks feature phase | Manual test on touch device + full keyboard-only tab-through |
| Discoverability paradox — too hidden or too obvious (Pitfall 4) | Hidden Perks feature phase | Cold-read test with someone unfamiliar with the change |
| Discount code exposed via View Source (Pitfall 5) | Hidden Perks feature phase (scoping decision) | Confirm no copy makes scarcity/single-use claims the static architecture can't enforce |
| Perk collides with existing subscribe flow (Pitfall 6) | Hidden Perks feature phase | Test perk behavior as both a subscribed and non-subscribed user; confirm no duplicate/stacked modals |
| Perk re-triggers every visit (Pitfall 7) | Hidden Perks feature phase | Refresh/revisit test confirms reveal only fires once per found-state |
| New elements break mobile layout (Pitfall 8) | Both phases | On-device mobile check against v1.0 layouts as an explicit done-criterion |

## Sources

- [Luxury eCommerce UX: The 5 Signals High-Converting Product Pages Share — ConvertCart](https://www.convertcart.com/blog/luxury-product-page-ecommerce) — MEDIUM confidence, single-source CRO commentary
- [Conversion Rate Optimization for Luxury Ecommerce: Tips & Strategies — Intuitia](https://www.intuitia.tech/blog/conversion-rate-optimization-for-luxury-ecommerce) — MEDIUM confidence
- [6 Mistakes to Avoid When Designing Your CTAs — AccuRanker](https://www.accuranker.com/blog/mistakes-to-avoid-when-designing-your-ctas/) — MEDIUM confidence, generic CRO advice cross-checked against luxury-specific sources
- [The power of Easter Eggs in tech — UX Collective](https://uxdesign.cc/the-power-of-easter-eggs-in-tech-4491bb87bcdf) — MEDIUM confidence, informs the discoverability-paradox framing
- [The Importance of Discoverability in UX Design — Dovetail](https://dovetail.com/ux/discoverability/) — MEDIUM confidence
- [Hover Actions and Accessibility: Addressing a Common WCAG Violation — BOIA](https://www.boia.org/blog/hover-actions-and-accessibility-addressing-a-common-wcag-violation) — HIGH confidence, direct WCAG SC 2.1.1 / 1.4.13 grounding
- [WCAG Content on Hover or Focus Explained — GetStark](https://www.getstark.co/wcag-explained/perceivable/distinguishable/content-on-hover-or-focus/) — HIGH confidence, official WCAG success-criterion explanation
- [Coupon Code UX: Hidden vs Visible Field — CustomFit.ai](https://www.customfit.ai/blog/checkout-pricing/coupon-code-ux-hidden-vs-visible) — MEDIUM confidence, informs discount-scarcity-claims pitfall
- Direct repo inspection: `/Users/aech/Documents/Ladidier/styles.css` (hover selectors, mobile `!important` overrides), `/Users/aech/Documents/Ladidier/app.jsx` and `pages.jsx` (existing `ladidier_subscribed` localStorage flow), `/Users/aech/Documents/Ladidier/.planning/PROJECT.md` (milestone scope/constraints) — HIGH confidence, primary source

---
*Pitfalls research for: Conversion copy/CTA + hidden perks discovery mechanic on an existing luxury editorial React portal*
*Researched: 2026-08-20*
