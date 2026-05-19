# Requirements: LaDidiér Portal

**Defined:** 2026-05-19
**Core Value:** Every page must feel like opening a luxury magazine — and it must do so on any device, at any screen size.

## v1 Requirements

### Mobile Navigation

- [x] **MOB-01**: User sees a hamburger menu button in the nav on screens ≤768px (desktop nav links hidden)
- [x] **MOB-02**: Tapping the hamburger opens a full-screen overlay with all navigation links
- [x] **MOB-03**: User can close the mobile nav by tapping the close (×) button or pressing Escape
- [x] **MOB-04**: Active route is visually highlighted in the mobile nav overlay

### Responsive Layouts

- [ ] **RESP-01**: Footer collapses to a single column on screens ≤480px
- [ ] **RESP-02**: Hero Manifest layout adapts for phone width (text-only, no overflow)
- [ ] **RESP-03**: Hero Split layout stacks image below text on phone, removes tilt effect
- [ ] **RESP-04**: Hero Index layout stacks to single column on phone
- [ ] **RESP-05**: Store page rows simplified further on phone (compact single-line or card)
- [ ] **RESP-06**: Subscribe plan cards stack vertically on mobile screens
- [ ] **RESP-07**: Magazine page article grid stacks on phone
- [ ] **RESP-08**: Article page (full article view) reads comfortably on phone
- [ ] **RESP-09**: Tweaks panel is accessible on mobile (full-width, scrollable)
- [ ] **RESP-10**: Interactive elements (buttons, nav links) meet 44px minimum tap target

### Vercel Deployment

- [ ] **VERL-01**: All responsive changes are committed to the repository
- [ ] **VERL-02**: Updated code is pushed to the connected repository and triggers a Vercel redeploy
- [ ] **VERL-03**: Live Vercel URL renders the site correctly on mobile, tablet, and desktop

## v2 Requirements

### Performance

- **PERF-01**: Images lazy-load on mobile to reduce initial payload
- **PERF-02**: Fonts subset for faster mobile load

### Mobile UX Enhancements

- **UX-01**: Swipe gestures on mobile nav overlay
- **UX-02**: Pull-to-refresh behavior on magazine feed

## Out of Scope

| Feature | Reason |
|---------|--------|
| Native mobile app | Web-first priority; app is a separate product decision |
| New pages or features | This milestone is responsiveness only |
| E-commerce/checkout | Static portfolio portal, no transactions |
| Backend API integration | All data is client-side |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| MOB-01 | Phase 1 | Complete — CSS (Plan 01-01) + React hamburger button (Plan 01-02) |
| MOB-02 | Phase 1 | Complete — CSS (Plan 01-01) + MobileNav component (Plan 01-02) |
| MOB-03 | Phase 1 | Complete — CSS (Plan 01-01) + × button and Escape handler (Plan 01-02) |
| MOB-04 | Phase 1 | Complete — CSS (Plan 01-01) + active class + aria-current (Plan 01-02) |
| RESP-01 | Phase 2 | Pending |
| RESP-02 | Phase 2 | Pending |
| RESP-03 | Phase 2 | Pending |
| RESP-04 | Phase 2 | Pending |
| RESP-05 | Phase 2 | Pending |
| RESP-06 | Phase 2 | Pending |
| RESP-07 | Phase 2 | Pending |
| RESP-08 | Phase 2 | Pending |
| RESP-09 | Phase 2 | Pending |
| RESP-10 | Phase 2 | Pending |
| VERL-01 | Phase 3 | Pending |
| VERL-02 | Phase 3 | Pending |
| VERL-03 | Phase 3 | Pending |

**Coverage:**
- v1 requirements: 17 total
- Mapped to phases: 17
- Unmapped: 0 ✓

---
*Requirements defined: 2026-05-19*
*Last updated: 2026-05-19 — traceability confirmed against ROADMAP.md phases*
