# Roadmap: LaDidiér Portal

## Milestones

- ✅ **v1.0 Mobile Responsiveness & Vercel Deploy** - Phases 1-3 (shipped 2026-08-20, confirmed live)
- 🚧 **v1.1 Shopping Mall Conversion Pass** - Phases 4-6 (in progress)

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
- [ ] 06-02-PLAN.md — TreasureHuntComplete popup (HOUSE20 + subscribe branch) + append the .treasure-* CSS block to styles.css
- [ ] 06-03-PLAN.md — Wire it in: 4 page mounts, Nav dot cluster, app-root popup mount, script tag in both HTML entry points + print suppression
- [ ] 06-04-PLAN.md — Phase gate: 12-gate static sweep + human verification of TREAS-01..06 at desktop and 375px + Phase 5 regression
**UI hint**: yes

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4 → 5 → 6

| Phase | Milestone | Plans Complete | Status | Completed |
|-------|-----------|----------------|--------|-----------|
| 1. Mobile Navigation | v1.0 | 2/2 | Complete | 2026-05-19 |
| 2. Responsive Layouts | v1.0 | -/- | Complete | 2026-08-20 |
| 3. Vercel Deploy | v1.0 | -/- | Complete | 2026-08-20 |
| 4. Copy & CTA Conversion Pass | v1.1 | 5/5 | Complete   | 2026-08-20 |
| 5. Hidden Perks Discovery Feature | v1.1 | 1/3 | In Progress|  |
| 6. Mall Treasure Hunt | v1.1 | 0/4 | Planned | - |

---
*Roadmap created: 2026-05-19 — v1.0 Mobile Responsiveness & Vercel Deploy*
*Phase 1 planned: 2026-05-19 — 2 plans, 2 waves*
*v1.0 confirmed shipped: 2026-08-20*
*v1.1 roadmap added: 2026-08-20 — Phase 4 (Copy & CTA Conversion Pass), Phase 5 (Hidden Perks Discovery Feature)*
*Phase 4 planned: 2026-08-20 — 5 plans, 5 waves (all sequential: every plan edits pages.jsx)*
*Phase 5 planned: 2026-08-21 — 3 plans, 3 waves (sequential: build → wire → verify; Plan 02 would break the site if it landed before Plan 01)*
*Phase 6 added: 2026-08-22 — Mall Treasure Hunt (multi-page hidden-icon hunt with subscribe/WhatsApp capture reward), runs alongside Phase 5's single hidden perk*
*Phase 6 planned: 2026-08-22 — 4 plans, 4 waves (sequential: build core → popup+CSS → wire in → gate; every plan after 01 depends on the file the previous one created)*
