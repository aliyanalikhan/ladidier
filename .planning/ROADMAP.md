# Roadmap: LaDidiér Portal

## Milestones

- ✅ **v1.0 Mobile Responsiveness & Vercel Deploy** - Phases 1-3 (shipped 2026-08-20, confirmed live)
- 🚧 **v1.1 Shopping Mall Conversion Pass** - Phases 4-6 (in progress)
- 🚧 **v1.2 Accounts & Cross-Device Membership** - Phases 7-9 (planned)

## Phases

<details>
<summary>✅ v1.0 Mobile Responsiveness & Vercel Deploy (Phases 1-3) - SHIPPED 2026-08-20</summary>

### Phase 1: Mobile Navigation
**Goal**: Users on phones can open, navigate, and close a full-screen overlay nav
**Depends on**: Nothing (first phase)
**Requirements**: MOB-01, MOB-02, MOB-03, MOB-04
**Success Criteria** (what must be TRUE):
  1. On screens ≤768px, desktop nav links are hidden and a hamburger button is visible in the nav bar
  2. Tapping the hamburger opens a full-screen overlay displaying all navigation links
  3. The overlay closes when the user taps the × button or presses Escape
  4. The currently active route is visually distinct from other links in the overlay
**Plans**: 2 plans

Plans:
- [x] 01-01-PLAN.md — Mobile nav CSS: hamburger, overlay, link states, animations, media query
- [x] 01-02-PLAN.md — React components: MobileNav overlay component + hamburger wiring in Nav
**UI hint**: yes

### Phase 2: Responsive Layouts
**Goal**: Every page and component renders correctly and comfortably on phone-width screens
**Depends on**: Phase 1
**Requirements**: RESP-01, RESP-02, RESP-03, RESP-04, RESP-05, RESP-06, RESP-07, RESP-08, RESP-09, RESP-10
**Success Criteria** (what must be TRUE):
  1. Footer collapses to a single column at ≤480px with no overflow or clipped content
  2. Hero sections (Manifest, Split, Index) display text cleanly at phone width — no horizontal scroll, no overflowing elements
  3. Store rows, subscribe plan cards, and magazine article grids stack to a single column on phone screens and remain tappable
  4. The tweaks panel opens full-width and is scrollable on a phone screen
  5. All interactive elements (buttons, nav links, store links) meet the 44px minimum tap target size
**Plans**: Complete (work confirmed live; formal plan log left stale — see STATE.md history)
**UI hint**: yes

### Phase 3: Vercel Deploy
**Goal**: All responsive changes are live at the Vercel URL and confirmed working across device sizes
**Depends on**: Phase 2
**Requirements**: VERL-01, VERL-02, VERL-03
**Success Criteria** (what must be TRUE):
  1. All responsive changes are committed to the repository with a clear commit message
  2. A push to the connected repository triggers a successful Vercel redeploy (no build errors)
  3. The live Vercel URL displays the mobile nav overlay and responsive layouts correctly on a real or simulated mobile device
**Plans**: Complete (confirmed live by user 2026-08-20)

</details>

### 🚧 v1.1 Shopping Mall Conversion Pass (In Progress)

**Milestone Goal:** Make the portal read and convert like a premium online shopping mall on Home, Stores, and Magazine, introduce a subtle "hidden perks" discovery feature, and add a multi-page "Mall Treasure Hunt" that rewards browsing with a subscriber-growth hook.

#### Phase 4: Copy & CTA Conversion Pass — COMPLETE 2026-08-21
**Goal**: Home, Stores, and Magazine read and convert like a premium shopping mall, with clear, working CTAs
**Depends on**: Phase 3
**Requirements**: CTA-01, CTA-02, CTA-03, CTA-04, CTA-05, CTA-06, CTA-07
**Success Criteria** (what must be TRUE):
  1. Home page shows one prominent primary shopping CTA (e.g. "Shop the Houses") positioned above the existing "Read the issue" CTA, and its copy reads in a shopping-mall voice rather than a house-listing/real-estate tone
  2. Every store card on the Stores page has a "Visit the Boutique →" CTA linking to that store's existing URL, with est./category heritage microcopy shown more prominently than today
  3. Stores page intro/section copy reads in a premium shopping-mall voice, not house-listing tone
  4. Magazine landing page copy is reframed to invite shopping without disrupting the existing paywall/subscribe mechanics
  5. Every CTA across Home, Stores, and Magazine resolves to a working destination — no dead-end sections
**Plans**: 5 plans

Plans:
- [x] 04-01-PLAN.md — Promote a "Shop the Houses" primary CTA in all 3 Home hero variants, demote the reading CTA to secondary
- [x] 04-02-PLAN.md — Home StoresPreview: computed house count, heritage Est. microcopy on all 14 cards, "Discover the Directory →" CTA
- [x] 04-03-PLAN.md — Stores page: shopping-voice intro, "Visit the Boutique →" on Gallery cards, per-store aria-label on Index rows
- [x] 04-04-PLAN.md — Magazine shopping reframe (paywall mechanics untouched) + repair both dead CTAs (PDF button, SubscribeBanner)
- [x] 04-05-PLAN.md — CTA-07 friction audit: static gate sweep + human click-through at desktop and ≤480px
**UI hint**: yes
**Status**: Complete (2026-08-21) — all 7 static gates PASS, developer approved live click-through

#### Phase 5: Hidden Perks Discovery Feature
**Goal**: A subtle, premium-styled discovery element reveals a discount code or subscribe prompt without disrupting browsing or shopping flow
**Depends on**: Phase 4
**Requirements**: PERK-01, PERK-02, PERK-03, PERK-04, PERK-05, PERK-06
**Success Criteria** (what must be TRUE):
  1. A single hidden-perk element exists on the site (e.g. in the Footer), styled to match existing ornament/typography language, with no visual signposting, nav entry, or onboarding tooltip pointing to it
  2. The perk is reachable via click/tap and via keyboard focus (not hover-only), so it works on touch devices and for keyboard users
  3. Activating the perk reveals a static, display-only discount code
  4. The reveal branches on the existing `ladidier_subscribed` flag — subscribed users see the code only, unsubscribed users also see a subscribe-flow prompt
  5. The perk reveal does not block, overlay-trap, or interrupt normal browsing/shopping flow
**Plans**: 3 plans

Plans:
- [x] 05-01-PLAN.md — Build perks.jsx (HiddenPerk, usePerkFound, HOUSE10 reveal panel) + .perk-mark/.perk-reveal styles
- [x] 05-02-PLAN.md — Wire it in: HiddenPerk mount in Footer + perks.jsx script tag in both HTML entry points
- [ ] 05-03-PLAN.md — Phase gate: 10-gate static sweep + 6-requirement manual pass at desktop/≤480px + cold-read discoverability test
**UI hint**: yes

#### Phase 6: Mall Treasure Hunt
**Goal**: Visitors who explore multiple pages (Home, Stores, Magazine, Article) can discover 4 distinct hidden icons (shopping bag, gift box, plus 2 more); finding all of them within one session triggers a "You found the treasure!" reveal with a discount code distinct from Phase 5's HOUSE10, plus the same subscribe-flow prompt Phase 5 uses. Runs alongside the existing single hidden perk from Phase 5 (not a replacement) — this is a second, deliberately gamified discovery mechanic.
**Depends on**: Phase 5
**Requirements**: TREAS-01, TREAS-02, TREAS-03, TREAS-04, TREAS-05, TREAS-06
**Success Criteria** (what must be TRUE):
  1. Four distinct hidden icons exist across Home, Stores, Magazine, and Article, rendered as literal full-color e-commerce icons in randomized layout-safe positions per page load
  2. Finding all 4 icons within one browser session reveals a "You found the treasure!" popup with a discount code distinct from HOUSE10
  3. The reveal branches on the existing `ladidier_subscribed` flag — subscribed visitors see the code only, unsubscribed visitors also see a subscribe-flow CTA
  4. A subtle nav-bar dot/glyph progress indicator shows found-count once at least 1 icon is found this session, invisible before that
  5. Once a visitor completes the hunt once, the icons never reappear for them on any future visit or session
**Plans**: 4 plans

Plans:
- [x] 06-01-PLAN.md — Build treasure.jsx core: sessionStorage progress layer + CustomEvent sync, 4 full-color SVG glyphs, TreasureIcon, TreasureProgress
- [x] 06-02-PLAN.md — TreasureHuntComplete popup (HOUSE20 + subscribe branch) + append the .treasure-* CSS block to styles.css
- [x] 06-03-PLAN.md — Wire it in: 4 page mounts, Nav dot cluster, app-root popup mount, script tag in both HTML entry points + print suppression
- [ ] 06-04-PLAN.md — Phase gate: 12-gate static sweep + human verification of TREAS-01..06 at desktop and 375px + Phase 5 regression
**UI hint**: yes

### 🚧 v1.2 Accounts & Cross-Device Membership (Planned)

**Milestone Goal:** Replace per-browser entitlement with real user accounts (Google login) that tie subscription/membership to the person, not the browser — with a billing/profile area, built on a real database.

**Summary:**
- [ ] **Phase 7: OAuth + Database Foundation** - Google sign-in, persistent session cookies, and a real users database
- [ ] **Phase 8: Stripe-Customer Linking** - Cross-device membership via an idempotently linked Stripe customer
- [ ] **Phase 9: Account & Billing Page** - Profile, subscription status, Stripe Customer Portal, and saved address

#### Phase 7: OAuth + Database Foundation
**Goal**: Users can sign in with Google, their session persists, and their identity is stored in a real, persistent database rather than only a per-browser cookie
**Depends on**: Nothing new — continues phase numbering after Phase 6; no functional dependency on v1.1 work
**Requirements**: AUTH-01, AUTH-02, AUTH-03, AUTH-04, ACCT-01, ACCT-02
**Success Criteria** (what must be TRUE):
  1. A visitor can click "Sign in with Google" and, after completing Google's consent screen, lands back on the site signed in
  2. A signed-in visitor's session survives a full page reload and a hash-route navigation, via a signed httpOnly session cookie
  3. A signed-in visitor can sign out, and the next request treats them as signed-out
  4. Selecting a paid plan (ÉcLAT Online or Hard Copy) while signed out routes through Google sign-in before reaching Stripe Checkout; the free Reader tier remains a one-click unlock with no sign-in and no network call
  5. Signing in with the same Google account more than once never creates a second user record — exactly one persistent row per Google account, keyed on the Google account id
**Plans**: 3 plans

Plans:
- [ ] 07-01-PLAN.md — Tracer: package legitimacy gate, Vercel Postgres + Google OAuth provisioning, `users` schema + `lib/db.js` + `lib/session.js` + the four `api/auth/*` routes
- [ ] 07-02-PLAN.md — Client auth state in `App`, Nav sign-in indicator (+ `.nav-signin` CSS), Subscribe page sign-in/sign-out row
- [ ] 07-03-PLAN.md — 401 session gate on `POST /api/checkout`, sign-in-then-resume flow on Subscribe, and the phase click-through gate on production

**Planning note (kept for Phase 8/9 reference)**: these plans reuse Tasks 1-5 of the unexecuted draft `.planning/quick/260831-8ug-user-should-login-before-subscription-al/260831-8ug-PLAN.md` rather than re-deriving the approach — do not delete or move that file. Two deliberate deviations from it: the session lifetime is 7 days (not 30), and its Task 6 (addresses table, `lib/shipping.js`, `api/address.js`, in-app address form) is deferred to Phase 9 and must be replanned there rather than copied. That draft's `api/checkout.js` change also passes `customer_email` into Stripe Checkout session creation; Phase 7 deliberately omits it and Phase 8 must use a stored `customer:` id instead — `customer_email` is the exact anti-pattern that creates duplicate Stripe customers (see Phase 8).
**Regression check**: `git diff` against `api/entitlement.js`, `api/verify-session.js`, `api/webhook.js`, `lib/membership.js`, `lib/stripe.js` must be empty

#### Phase 8: Stripe-Customer Linking
**Goal**: A signed-in user's membership/subscription status follows their account across devices and browsers, via a Stripe customer durably and idempotently linked to their user record — this is the mechanism that makes membership actually cross-device
**Depends on**: Phase 7 (needs the `users` table and a signed-in identity to link a Stripe customer to)
**Requirements**: LINK-01, LINK-02, LINK-03, LINK-04
**Success Criteria** (what must be TRUE):
  1. Starting checkout for a paid plan while signed in creates, or reuses, exactly one Stripe customer for that account — never a duplicate — via a UNIQUE `stripe_customer_id` column on `users`, created idempotently at checkout time
  2. A signed-in user's membership/subscription status is read from their linked Stripe customer, not from a per-browser cookie
  3. A member who signs in with the same Google account on a new device or browser sees their active membership immediately, without repurchasing
  4. `api/entitlement.js`, `api/verify-session.js`, `api/webhook.js`, `lib/membership.js`, and `lib/stripe.js` remain byte-for-byte unmodified — `git diff` against these five files is empty
**Plans**: TBD
**Highest-risk phase** (per research/SUMMARY.md): concentrates the duplicate-Stripe-customer, race-condition, and account/billing-takeover-by-email risks. Design must use a UNIQUE constraint on `stripe_customer_id`, link via a `lib/account.js`-style `ensureStripeCustomer` seam at checkout-creation time, use `customer:` (never `customer_email`) once a customer exists, and must NOT auto-link an existing Stripe customer by email match this milestone (unverified-email linking enables takeover). The webhook (`api/webhook.js`) stays log-only per LINK-04 — it must not become a linking actor without its own explicit, separately-reviewed design.
**Production gate**: this phase is not "done" in Production until verified against LIVE (not test-mode) Stripe keys — Production is currently running Stripe test-mode keys (see STATE.md, Out-of-band work, as of 2026-09-01). Confirm the live-key revert (secret key, publishable key, webhook secret together) with one successful live webhook delivery before marking this phase complete in Production.

#### Phase 9: Account & Billing Page
**Goal**: Signed-in users have a self-service account page showing their profile, membership status, billing management, and a saved delivery address
**Depends on**: Phase 8 (billing status and the Customer Portal both need the linked Stripe customer)
**Requirements**: PROF-01, PROF-02, PROF-03, PROF-04, PROF-05
**Success Criteria** (what must be TRUE):
  1. A signed-in user's account page shows their name and avatar as returned by Google
  2. The account page shows the user's current membership/subscription status, sourced from the Phase 8 Stripe-customer link
  3. The account page has a "Manage billing" action that opens Stripe's hosted Customer Portal, where the user can view invoices and upgrade, downgrade, or cancel
  4. A signed-in user can view and edit one saved delivery address on the account page, persisted in the database
  5. The account-page address is stored and edited independently of the address Stripe Checkout collects at purchase time — editing one never overwrites or is overwritten by the other
**Plans**: TBD
**Regression check**: `git diff` against `api/entitlement.js`, `api/verify-session.js`, `api/webhook.js`, `lib/membership.js`, `lib/stripe.js` must be empty
**UI hint**: yes

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4 → 5 → 6 → 7 → 8 → 9

| Phase | Milestone | Plans Complete | Status | Completed |
|-------|-----------|----------------|--------|-----------|
| 1. Mobile Navigation | v1.0 | 2/2 | Complete | 2026-05-19 |
| 2. Responsive Layouts | v1.0 | -/- | Complete | 2026-08-20 |
| 3. Vercel Deploy | v1.0 | -/- | Complete | 2026-08-20 |
| 4. Copy & CTA Conversion Pass | v1.1 | 5/5 | Complete   | 2026-08-20 |
| 5. Hidden Perks Discovery Feature | v1.1 | 1/3 | In Progress|  |
| 6. Mall Treasure Hunt | v1.1 | 0/4 | Planned | - |
| 7. OAuth + Database Foundation | v1.2 | 0/3 | Planned | - |
| 8. Stripe-Customer Linking | v1.2 | 0/TBD | Planned | - |
| 9. Account & Billing Page | v1.2 | 0/TBD | Planned | - |

---
*Roadmap created: 2026-05-19 — v1.0 Mobile Responsiveness & Vercel Deploy*
*Phase 1 planned: 2026-05-19 — 2 plans, 2 waves*
*v1.0 confirmed shipped: 2026-08-20*
*v1.1 roadmap added: 2026-08-20 — Phase 4 (Copy & CTA Conversion Pass), Phase 5 (Hidden Perks Discovery Feature)*
*Phase 4 planned: 2026-08-20 — 5 plans, 5 waves (all sequential: every plan edits pages.jsx)*
*Phase 5 planned: 2026-08-21 — 3 plans, 3 waves (sequential: build → wire → verify; Plan 02 would break the site if it landed before Plan 01)*
*Phase 6 added: 2026-08-22 — Mall Treasure Hunt (multi-page hidden-icon hunt with subscribe/WhatsApp capture reward), runs alongside Phase 5's single hidden perk*
*Phase 6 planned: 2026-08-22 — 4 plans, 4 waves (sequential: build core → popup+CSS → wire in → gate; every plan after 01 depends on the file the previous one created)*
*Phase 7 planned: 2026-09-01 — 3 plans, 3 waves (sequential: tracer proves sign-in end-to-end → client surfaces consume it → checkout gate and phase click-through; Plans 02 and 03 both edit src/pages.jsx so they cannot share a wave)*
*v1.2 roadmap added: 2026-09-01 — Phase 7 (OAuth + Database Foundation), Phase 8 (Stripe-Customer Linking), Phase 9 (Account & Billing Page), continuing phase numbering from Phase 6; derived from research/SUMMARY.md's validated three-phase dependency chain (identity → linking → UI). Phase 7 has an existing unexecuted draft plan to reuse (260831-8ug); Phase 8 is flagged highest-risk and gated on the pending Stripe live-key revert; all three phases carry a standing regression check against the five frozen legacy entitlement files.*
