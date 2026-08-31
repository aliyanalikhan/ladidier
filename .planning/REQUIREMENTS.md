# Requirements: LaDidiér Portal

**Defined:** 2026-05-19 (v1.0) · updated 2026-08-20 (v1.1) · updated 2026-09-01 (v1.2)
**Core Value:** Every page must feel like opening a luxury magazine — and it must do so on any device, at any screen size.

## Shipped — v1.0 Mobile Responsiveness & Vercel Deploy

<!-- Confirmed live by user 2026-08-20. Roadmap/state tracking for Phase 2/3 was left stale but the work is done — see MILESTONES.md. -->

### Mobile Navigation

- [x] **MOB-01**: User sees a hamburger menu button in the nav on screens ≤768px (desktop nav links hidden)
- [x] **MOB-02**: Tapping the hamburger opens a full-screen overlay with all navigation links
- [x] **MOB-03**: User can close the mobile nav by tapping the close (×) button or pressing Escape
- [x] **MOB-04**: Active route is visually highlighted in the mobile nav overlay

### Responsive Layouts

- [x] **RESP-01**: Footer collapses to a single column on screens ≤480px
- [x] **RESP-02**: Hero Manifest layout adapts for phone width (text-only, no overflow)
- [x] **RESP-03**: Hero Split layout stacks image below text on phone, removes tilt effect
- [x] **RESP-04**: Hero Index layout stacks to single column on phone
- [x] **RESP-05**: Store page rows simplified further on phone (compact single-line or card)
- [x] **RESP-06**: Subscribe plan cards stack vertically on mobile screens
- [x] **RESP-07**: Magazine page article grid stacks on phone
- [x] **RESP-08**: Article page (full article view) reads comfortably on phone
- [x] **RESP-09**: Tweaks panel is accessible on mobile (full-width, scrollable)
- [x] **RESP-10**: Interactive elements (buttons, nav links) meet 44px minimum tap target

### Vercel Deployment

- [x] **VERL-01**: All responsive changes are committed to the repository
- [x] **VERL-02**: Updated code is pushed to the connected repository and triggers a Vercel redeploy
- [x] **VERL-03**: Live Vercel URL renders the site correctly on mobile, tablet, and desktop

## Shipped — v1.1 Shopping Mall Conversion Pass

<!-- Confirmed shipped 2026-09-01 — all v1.1 requirements complete, see MILESTONES.md. -->

### Copy & CTA Conversion

- [x] **CTA-01**: Home page has one clear, prominent primary shopping CTA (e.g. "Shop the Houses") positioned above the existing secondary "Read the issue" CTA
- [x] **CTA-02**: Home page copy reads in a premium shopping-mall voice rather than house-listing/real-estate tone
- [x] **CTA-03**: Each store card on the Stores page has an explicit CTA ("Visit the Boutique →") linking to that store's existing URL
- [x] **CTA-04**: Stores page intro/section copy reads in a premium shopping-mall voice rather than house-listing tone
- [x] **CTA-05**: Store cards surface heritage microcopy (est./category fields) more prominently than today
- [x] **CTA-06**: Magazine landing page copy is reframed to invite shopping, without disrupting the existing paywall/subscribe mechanics
- [x] **CTA-07**: Home, Stores, and Magazine pages pass a friction audit — no dead-end sections, every CTA resolves to a working destination

### Hidden Perks

- [x] **PERK-01**: A single hidden-perk discovery element exists on the site (e.g. in the Footer), styled to match existing ornament/typography language
- [x] **PERK-02**: The hidden perk is reachable via click/tap (not hover-only) and via keyboard focus, so it works on touch devices and for keyboard users
- [x] **PERK-03**: The hidden perk has no visual signposting, nav entry, or onboarding tooltip pointing to it — genuinely easy to miss
- [x] **PERK-04**: Activating the hidden perk reveals a static, display-only discount code
- [x] **PERK-05**: The perk reveal branches on the existing `ladidier_subscribed` flag — subscribed users see the code only, unsubscribed users also see a subscribe-flow prompt
- [x] **PERK-06**: The hidden perk does not block, overlay-trap, or interrupt normal browsing/shopping flow

### Mall Treasure Hunt

- [x] **TREAS-01**: Visitors can discover 4 distinct hidden icons (shopping bag, gift box, plus 2 more) placed across the Home, Stores, Magazine, and Article pages
- [x] **TREAS-02**: Each icon appears in one of 2-3 pre-defined layout-safe positions per page, randomly chosen on every fresh page load
- [x] **TREAS-03**: Finding all 4 icons within a single browser session triggers a "You found the treasure!" completion reveal with a discount code distinct from Phase 5's `HOUSE10`
- [x] **TREAS-04**: The completion reveal branches on the existing `ladidier_subscribed` flag — subscribed visitors see the code only, unsubscribed visitors also see a subscribe-flow CTA
- [x] **TREAS-05**: Once a visitor completes the hunt once, the icons never reappear for them on any future visit or session (persistent one-time-only completion)
- [x] **TREAS-06**: A subtle dot/glyph progress indicator in the nav bar shows found-count once at least 1 icon is found this session; invisible before that

## v1.2 Requirements

Requirements for the "Accounts & Cross-Device Membership" milestone. Each maps to roadmap phases.

### Authentication

- [ ] **AUTH-01**: User can sign in with Google (OAuth 2.0/OIDC) — the only login method
- [ ] **AUTH-02**: Signed-in session persists across page reloads via a signed httpOnly cookie
- [ ] **AUTH-03**: User can sign out, clearing their session
- [ ] **AUTH-04**: Paid plans (ÉcLAT Online, Hard Copy) require sign-in before Stripe Checkout; the free Reader tier stays sign-in-free

### Accounts Database

- [ ] **ACCT-01**: Signing in with Google creates or updates a persistent user record, keyed on the Google account id
- [ ] **ACCT-02**: Signing in twice with the same Google account never creates a duplicate user record

### Cross-Device Membership (Stripe-Customer Linking)

- [ ] **LINK-01**: A signed-in user's account is linked to a Stripe customer, created idempotently (never duplicated) at checkout time
- [ ] **LINK-02**: A signed-in user's membership/subscription status is read from their linked Stripe customer, not a per-browser cookie
- [ ] **LINK-03**: A member who signs in on a new device or browser sees their active membership immediately, without repurchasing
- [ ] **LINK-04**: The existing per-browser cookie entitlement flow (`api/entitlement.js`, `api/verify-session.js`, `api/webhook.js`, `lib/membership.js`, `lib/stripe.js`) stays byte-for-byte unmodified so current paying members never regress

### Account & Billing Page

- [ ] **PROF-01**: Signed-in user has an account page showing their name and avatar from Google
- [ ] **PROF-02**: Account page shows current membership/subscription status
- [ ] **PROF-03**: Account page has a "Manage billing" action opening Stripe's Customer Portal (view invoices, upgrade/downgrade, cancel)
- [ ] **PROF-04**: Signed-in user can view and edit one saved delivery address on their account page, stored in the database
- [ ] **PROF-05**: The saved account-page address is separate from — not a replacement for — Stripe Checkout's own address collection at purchase time

## v2 Requirements

Deferred to future milestones. Tracked but not in current roadmap.

### Performance (from v1.0)

- **PERF-01**: Images lazy-load on mobile to reduce initial payload
- **PERF-02**: Fonts subset for faster mobile load

### Mobile UX Enhancements (from v1.0)

- **UX-01**: Swipe gestures on mobile nav overlay
- **UX-02**: Pull-to-refresh behavior on magazine feed

### Conversion & Perks (from v1.1)

- **CTA-08**: Copy/CTA rework on About and Article pages
- **PERK-07**: Copy-code clipboard button (`navigator.clipboard.writeText()`) on the perk reveal
- **PERK-08**: Return-visit / dwell-time-gated perk variant, if the simple click/tap version proves too easy or too hard to find

### Accounts & Membership (from v1.2)

- **MIG-01**: Claim/reconciliation flow letting a pre-login Stripe subscriber link their existing subscription to a new Google account
- **ADDR-02**: Support for multiple saved addresses per account (v1.2 ships exactly one)
- **AUTH-05**: Additional OAuth providers or email/password login

## Out of Scope

| Feature | Reason |
|---------|--------|
| Native mobile app | Web-first priority; app is a separate product decision |
| Real, validated/redeemable discount codes | No backend exists to validate against — a fake-validation code would be misleading |
| Leaderboards or competitive/social mechanics | Not requested; v1.1 shipped two discovery mechanics (Phase 5 perk + Phase 6 treasure hunt), not a competitive game |
| Copy/CTA rework on About or Article pages | Not primary landing pages in v1.1 |
| Migrating pre-login Stripe subscribers into accounts (v1.2) | Deferred — v1.2 only needs to work for new sign-ins going forward |
| Email/password or non-Google login methods (v1.2) | Google OAuth is the only method this milestone ships |
| Self-rolled billing management UI (v1.2) | Delegated to Stripe's hosted Customer Portal per research — avoids reimplementing proration/dunning/invoice history |
| Account deletion/export, multiple saved addresses, admin dashboard (v1.2) | Not required by any target feature this milestone |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| MOB-01 | Phase 1 | Complete |
| MOB-02 | Phase 1 | Complete |
| MOB-03 | Phase 1 | Complete |
| MOB-04 | Phase 1 | Complete |
| RESP-01 | Phase 2 | Complete |
| RESP-02 | Phase 2 | Complete |
| RESP-03 | Phase 2 | Complete |
| RESP-04 | Phase 2 | Complete |
| RESP-05 | Phase 2 | Complete |
| RESP-06 | Phase 2 | Complete |
| RESP-07 | Phase 2 | Complete |
| RESP-08 | Phase 2 | Complete |
| RESP-09 | Phase 2 | Complete |
| RESP-10 | Phase 2 | Complete |
| VERL-01 | Phase 3 | Complete |
| VERL-02 | Phase 3 | Complete |
| VERL-03 | Phase 3 | Complete |
| CTA-01 | Phase 4 | Complete |
| CTA-02 | Phase 4 | Complete |
| CTA-03 | Phase 4 | Complete |
| CTA-04 | Phase 4 | Complete |
| CTA-05 | Phase 4 | Complete |
| CTA-06 | Phase 4 | Complete |
| CTA-07 | Phase 4 | Complete (friction audit passed 2026-08-21) |
| PERK-01 | Phase 5 | Complete |
| PERK-02 | Phase 5 | Complete |
| PERK-03 | Phase 5 | Complete |
| PERK-04 | Phase 5 | Complete |
| PERK-05 | Phase 5 | Complete |
| PERK-06 | Phase 5 | Complete |
| TREAS-01 | Phase 6 | Complete |
| TREAS-02 | Phase 6 | Complete |
| TREAS-03 | Phase 6 | Complete |
| TREAS-04 | Phase 6 | Complete |
| TREAS-05 | Phase 6 | Complete |
| TREAS-06 | Phase 6 | Complete |
| AUTH-01 | Phase 7 | Pending |
| AUTH-02 | Phase 7 | Pending |
| AUTH-03 | Phase 7 | Pending |
| AUTH-04 | Phase 7 | Pending |
| ACCT-01 | Phase 7 | Pending |
| ACCT-02 | Phase 7 | Pending |
| LINK-01 | Phase 8 | Pending |
| LINK-02 | Phase 8 | Pending |
| LINK-03 | Phase 8 | Pending |
| LINK-04 | Phase 8 | Pending |
| PROF-01 | Phase 9 | Pending |
| PROF-02 | Phase 9 | Pending |
| PROF-03 | Phase 9 | Pending |
| PROF-04 | Phase 9 | Pending |
| PROF-05 | Phase 9 | Pending |

**Coverage:**
- v1.1 requirements: 19 total
- Mapped to phases: 19 (Phase 4: CTA-01..07, Phase 5: PERK-01..06, Phase 6: TREAS-01..06)
- Unmapped: 0 ✓
- v1.2 requirements: 15 total
- Mapped to phases: 15 (Phase 7: AUTH-01..04 + ACCT-01..02, Phase 8: LINK-01..04, Phase 9: PROF-01..05)
- Unmapped: 0 ✓

---
*Requirements defined: 2026-05-19*
*Last updated: 2026-09-01 — v1.2 (Accounts & Cross-Device Membership) requirements mapped to Phases 7-9 in ROADMAP.md; 100% coverage confirmed*
