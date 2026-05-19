# LaDidiér Portal

## What This Is

LaDidiér is a luxury editorial portal for a house of eleven stores — jewelry, cosmetics, perfume, womenswear, menswear, coffee, pets, home, travel, skincare, and hair. It combines a quarterly magazine with a unified storefront directory, built as a React + plain HTML/CSS single-page app deployed on Vercel.

## Core Value

Every page must feel like opening a luxury magazine — and it must do so on any device, at any screen size.

## Current Milestone: v1.0 — Mobile Responsiveness & Vercel Deploy

**Goal:** Make the LaDidiér portal fully responsive across all screen sizes and deploy the updated site live on Vercel.

**Target features:**
- Full-screen overlay mobile navigation (hamburger → overlay with all nav links)
- Comprehensive mobile CSS pass — footer, heroes, store rows, plan cards, article/magazine pages
- Vercel deployment of the updated responsive site

## Requirements

### Validated

<!-- Shipped and confirmed valuable. -->

(None yet — ship to validate)

### Active

- [ ] User sees a hamburger menu on screens ≤768px
- [ ] Tapping hamburger opens a full-screen nav overlay with all navigation links
- [ ] User can close the mobile nav overlay by tapping a close button or pressing Escape
- [ ] Footer collapses to a single column on screens ≤480px
- [ ] Hero sections (Manifest, Split, Index) display correctly on phone screens
- [ ] Store rows remain readable and tappable on phone screens
- [ ] Subscribe plan cards stack vertically on mobile
- [ ] Article and Magazine page layouts adapt for phone width
- [ ] Updated site deploys successfully on existing Vercel project

### Out of Scope

- Native mobile app — web-first is the current priority
- Backend/API integration — the portal is a static/client-side site
- New pages or features beyond responsiveness

## Context

The site is built with React 18 loaded via CDN (no build step), Babel standalone for JSX, and a single `styles.css`. A `vercel.json` already exists with a rewrite rule pointing `/` to `Ladidier Portal.html`. There is already a partial responsive breakpoint at `@media (max-width: 920px)` in `styles.css` that handles tablets — the mobile pass needs to extend this to ~480px and fill the nav gap entirely.

The user has an existing Vercel project connected to this codebase.

## Constraints

- **Tech stack**: React 18 CDN + Babel standalone + plain CSS — no npm, no build tools
- **No breaking changes**: Tweaks panel and all desktop layouts must be preserved exactly

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Full-screen overlay nav (not drawer/dropdown) | Matches the luxury editorial feel of the brand | — Pending |
| No mobile build pipeline | Site has no npm/webpack — keep it zero-build | — Pending |

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
*Last updated: 2026-05-19 after milestone v1.0 started*
