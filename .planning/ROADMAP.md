# Roadmap: LaDidiér Portal — v1.0 Mobile Responsiveness & Vercel Deploy

## Overview

Three phases deliver the full v1.0 milestone. Phase 1 adds the mobile navigation overlay (a discrete, testable component). Phase 2 completes the CSS pass across every page component and layout. Phase 3 commits all changes, deploys to Vercel, and confirms the live site works on real devices. Each phase delivers a coherent, independently verifiable capability.

## Phases

- [ ] **Phase 1: Mobile Navigation** - Hamburger button + full-screen overlay nav with close behavior and active-route highlight
- [ ] **Phase 2: Responsive Layouts** - Full mobile CSS pass covering footer, heroes, store rows, plan cards, article/magazine pages, tweaks panel, and tap targets
- [ ] **Phase 3: Vercel Deploy** - Commit all changes, push to repository, confirm live Vercel URL renders correctly on mobile and desktop

## Phase Details

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
- [ ] 01-02-PLAN.md — React components: MobileNav overlay component + hamburger wiring in Nav
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
**Plans**: TBD
**UI hint**: yes

### Phase 3: Vercel Deploy
**Goal**: All responsive changes are live at the Vercel URL and confirmed working across device sizes
**Depends on**: Phase 2
**Requirements**: VERL-01, VERL-02, VERL-03
**Success Criteria** (what must be TRUE):
  1. All responsive changes are committed to the repository with a clear commit message
  2. A push to the connected repository triggers a successful Vercel redeploy (no build errors)
  3. The live Vercel URL displays the mobile nav overlay and responsive layouts correctly on a real or simulated mobile device
**Plans**: TBD

## Progress

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Mobile Navigation | 1/2 | In progress | - |
| 2. Responsive Layouts | 0/TBD | Not started | - |
| 3. Vercel Deploy | 0/TBD | Not started | - |

---
*Roadmap created: 2026-05-19 — v1.0 Mobile Responsiveness & Vercel Deploy*
*Phase 1 planned: 2026-05-19 — 2 plans, 2 waves*
