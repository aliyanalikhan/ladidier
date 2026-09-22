---
phase: 260922-mag
plan: "01"
subsystem: magazine
tags: [magazine-reader, complimentary-access, direct-link, routing]
status: complete

# Dependency graph
requires:
  - phase: 260902-mag
    provides: in-site IssueReader modal with spread view
provides:
  - Direct URL access to the in-site magazine reader window (#read, #reader, /read, /reader)
  - Complimentary access to /api/issue/page so reader opens and displays spreads without requiring subscription
  - Preserved paywall for /api/issue/pdf and untouched subscription tiers
affects: [magazine-page, routing, api/issue-router, vercel-config, vite-config]
---

# Quick Task 260922-mag: Complimentary Magazine Access Flow

## Objective
Implement direct complimentary magazine access from the Éclat website to the existing LaDidiér magazine reader window without subscription, preserving all other subscription and magazine UI on LaDidiér.

## Tasks
1. Update `api/issue-router.js` to allow complimentary reading for `action === 'page'`, keeping `action === 'pdf'` member-gated via Stripe membership.
2. Add dev server middleware in `vite.config.js` to serve page images from `content/eclat-vol2-pages/` during local Vite development.
3. Update `src/app.jsx` and `src/pages.jsx` to recognize direct reader routes (`#read`, `#reader`, `#magazine-reader`, query params `?read=1`/`?reader=1`) and open `IssueReader` directly.
4. Update `vercel.json` with redirects for `/read` and `/reader` to `/#read` and `/#reader`.
5. Verify build with `npm run build` and browser subagent testing.
