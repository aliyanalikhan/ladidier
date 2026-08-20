# Requirements: LaDidiér Portal

**Defined:** 2026-05-19 (v1.0) · updated 2026-08-20 (v1.1)
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

## v1.1 Requirements

Requirements for the "Shopping Mall Conversion Pass" milestone. Each maps to roadmap phases.

### Copy & CTA Conversion

- [x] **CTA-01**: Home page has one clear, prominent primary shopping CTA (e.g. "Shop the Houses") positioned above the existing secondary "Read the issue" CTA
- [x] **CTA-02**: Home page copy reads in a premium shopping-mall voice rather than house-listing/real-estate tone
- [x] **CTA-03**: Each store card on the Stores page has an explicit CTA ("Visit the Boutique →") linking to that store's existing URL
- [x] **CTA-04**: Stores page intro/section copy reads in a premium shopping-mall voice rather than house-listing tone
- [x] **CTA-05**: Store cards surface heritage microcopy (est./category fields) more prominently than today
- [ ] **CTA-06**: Magazine landing page copy is reframed to invite shopping, without disrupting the existing paywall/subscribe mechanics
- [ ] **CTA-07**: Home, Stores, and Magazine pages pass a friction audit — no dead-end sections, every CTA resolves to a working destination

### Hidden Perks

- [ ] **PERK-01**: A single hidden-perk discovery element exists on the site (e.g. in the Footer), styled to match existing ornament/typography language
- [ ] **PERK-02**: The hidden perk is reachable via click/tap (not hover-only) and via keyboard focus, so it works on touch devices and for keyboard users
- [ ] **PERK-03**: The hidden perk has no visual signposting, nav entry, or onboarding tooltip pointing to it — genuinely easy to miss
- [ ] **PERK-04**: Activating the hidden perk reveals a static, display-only discount code
- [ ] **PERK-05**: The perk reveal branches on the existing `ladidier_subscribed` flag — subscribed users see the code only, unsubscribed users also see a subscribe-flow prompt
- [ ] **PERK-06**: The hidden perk does not block, overlay-trap, or interrupt normal browsing/shopping flow

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

## Out of Scope

| Feature | Reason |
|---------|--------|
| Native mobile app | Web-first priority; app is a separate product decision |
| Backend/API integration | Portal is a static/client-side site |
| Real, validated/redeemable discount codes | No backend exists to validate against — a fake-validation code would be misleading |
| Multiple hidden perks, leaderboards, or collection mechanics | Milestone scope is one working discovery mechanic, not gamification |
| Copy/CTA rework on About or Article pages | Not primary landing pages this milestone |

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
| CTA-06 | Phase 4 | Pending |
| CTA-07 | Phase 4 | Pending |
| PERK-01 | Phase 5 | Pending |
| PERK-02 | Phase 5 | Pending |
| PERK-03 | Phase 5 | Pending |
| PERK-04 | Phase 5 | Pending |
| PERK-05 | Phase 5 | Pending |
| PERK-06 | Phase 5 | Pending |

**Coverage:**
- v1.1 requirements: 13 total
- Mapped to phases: 13 (Phase 4: CTA-01..07, Phase 5: PERK-01..06)
- Unmapped: 0 ✓

---
*Requirements defined: 2026-05-19*
*Last updated: 2026-08-20 — v1.1 requirements mapped to Phase 4 (Copy & CTA Conversion Pass) and Phase 5 (Hidden Perks Discovery Feature)*
