# LaDidiér Portal

## What This Is

LaDidiér is a luxury editorial portal for a house of eleven stores — jewelry, cosmetics, perfume, womenswear, menswear, coffee, pets, home, travel, skincare, and hair. It combines a quarterly magazine with a unified storefront directory, built as a React + plain HTML/CSS single-page app deployed on Vercel.

## Core Value

Every page must feel like opening a luxury magazine — and it must do so on any device, at any screen size.

## Current Milestone: v1.1 — Shopping Mall Conversion Pass

**Goal:** Make the portal read and convert like a premium online shopping mall on the pages people land on first, and introduce a subtle "hidden perks" discovery feature.

**Target features:**
- Copy rewrite on Home, Stores, and Magazine — shopping-mall tone, not house-listing tone
- Stronger CTAs on those pages (Shop Now / Browse Categories / etc.)
- Basic conversion cleanup on Home, Stores, and Magazine
- Hidden Perks feature — subtle, premium-styled discoverable elements placed around the site, tied to a discount code or magazine subscribe prompt, unobtrusive by design (fully built, not just prototyped)
- Mall Treasure Hunt — a second, gamified discovery mechanic layered on top of the single hidden perk: 3-4 small hidden icons across multiple pages, collected via a browsing hunt, ending in a reveal with a discount code and a subscribe/WhatsApp capture prompt (added mid-milestone 2026-08-22; supersedes the original "no gamification" scope decision below)

## Requirements

### Validated

<!-- Shipped and confirmed valuable. -->

- Full-screen overlay mobile navigation (hamburger → overlay with all nav links) — v1.0, Phase 1
- Comprehensive mobile CSS pass — footer, heroes, store rows, plan cards, article/magazine pages — v1.0, Phase 2
- Vercel deployment of the responsive site — v1.0, Phase 3 (confirmed live by user)

### Active

- [ ] Home, Stores, and Magazine copy reads like a premium shopping mall, not a real-estate/house-listing site
- [ ] Home, Stores, and Magazine each have a clear, prominent primary CTA (Shop Now / Browse Categories / etc.)
- [ ] Basic conversion-cleanup pass applied to Home, Stores, and Magazine (clarity, hierarchy, friction removal)
- [ ] A subtle, premium-styled "hidden perk" discovery element exists somewhere on the site
- [ ] Finding a hidden perk surfaces a discount code or a magazine-subscribe prompt
- [ ] Hidden perks are genuinely easy to miss — they do not distract from or block the shopping flow
- [ ] A second discovery mechanic — the "Mall Treasure Hunt" — places 3-4 small hidden icons across multiple pages; finding all of them surfaces a discount code and a subscribe/WhatsApp capture prompt

### Out of Scope

- Native mobile app — web-first is the current priority
- Backend/API integration — the portal is a static/client-side site
- Copy/CTA rewrites on About or Article pages (not primary landing pages this milestone)
- Leaderboards, competitive/social mechanics, or more than two discovery mechanics — the milestone ships exactly two: Phase 5's single hidden perk, and Phase 6's Mall Treasure Hunt (added 2026-08-22, superseding the original "one mechanic only" decision below)

## Context

The site is built with React 18 loaded via CDN (no build step), Babel standalone for JSX, and a single `styles.css`. Page content lives in `pages.jsx` (HomePage, MagazinePage, ArticlePage, StoresPage, SubscribePage, AboutPage), shared UI in `components.jsx`, and decorative elements in `ornaments.jsx`. Routing is a simple hash router in `app.jsx`. A subscribe flow already exists (localStorage-backed `ladidier_subscribed` flag).

v1.0 (mobile responsiveness) shipped and is confirmed live on Vercel by the user — the roadmap/state tracking for it was left partially stale (Phase 2/3 weren't formally closed out even though the work is done), but the milestone itself is complete. This new milestone continues phase numbering from where v1.0 left off.

## Constraints

- **Tech stack**: React 18 CDN + Babel standalone + plain CSS — no npm, no build tools
- **No breaking changes**: Tweaks panel, existing routing, and the responsive layouts from v1.0 must be preserved exactly
- **Hidden perks must stay hidden**: the discovery element must not add visible clutter, extra nav items, or interrupt the shopping/browsing flow

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Full-screen overlay nav (not drawer/dropdown) | Matches the luxury editorial feel of the brand | Shipped v1.0 |
| No mobile build pipeline | Site has no npm/webpack — keep it zero-build | Shipped v1.0 |
| Copy/CTA/conversion scope limited to Home, Stores, Magazine | These are the pages people land on first; About/Article deferred | — Pending |
| Hidden perks ships as one real discovery mechanic, not a gamified system | Keep it subtle and low-effort to build/maintain per user's brief | Shipped v1.1 Phase 5, then superseded 2026-08-22 |
| Add a second, gamified discovery mechanic (Mall Treasure Hunt) alongside the Phase 5 perk, rather than replacing it | User wants a multi-page browsing incentive + subscriber-growth hook; explicitly chose "keep both" over replacing the existing perk | — Pending |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd-transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd-complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-08-20 after milestone v1.1 started*
