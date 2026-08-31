# LaDidiér Portal

## What This Is

LaDidiér is a luxury editorial portal for a house of eleven stores — jewelry, cosmetics, perfume, womenswear, menswear, coffee, pets, home, travel, skincare, and hair. It combines a quarterly magazine with a unified storefront directory, built as a React + plain HTML/CSS single-page app deployed on Vercel.

## Core Value

Every page must feel like opening a luxury magazine — and it must do so on any device, at any screen size.

## Current Milestone: v1.2 — Accounts & Cross-Device Membership

**Goal:** Replace per-browser entitlement with real user accounts (Google login) that tie subscription/membership to the person, not the browser — with a billing/profile area, built on a real database.

**Target features:**
- Google OAuth login (sign in / sign up)
- User accounts backed by a real database — first milestone where the project needs persistent storage beyond Stripe
- Each account linked to its Stripe customer, so membership/subscription status follows the user across devices — fixes the "membership is per-browser" known gap
- Account page: profile info (name, avatar from Google) + billing/subscription management (view status, manage/cancel)
- Session management (logged-in state) replacing/supplementing the current cookie flags (`ladidier_subscribed` / `ladidier_member`)
- Existing pre-login Stripe subscribers are NOT migrated in this milestone — handled later

## Requirements

### Validated

<!-- Shipped and confirmed valuable. -->

- Full-screen overlay mobile navigation (hamburger → overlay with all nav links) — v1.0, Phase 1
- Comprehensive mobile CSS pass — footer, heroes, store rows, plan cards, article/magazine pages — v1.0, Phase 2
- Vercel deployment of the responsive site — v1.0, Phase 3 (confirmed live by user)
- Home, Stores, and Magazine copy reads like a premium shopping mall, not a real-estate/house-listing site — v1.1, Phase 4
- Home, Stores, and Magazine each have a clear, prominent primary CTA — v1.1, Phase 4
- Basic conversion-cleanup pass applied to Home, Stores, and Magazine — v1.1, Phase 4
- A subtle, premium-styled "hidden perk" discovery element exists on the site, surfacing a discount code or subscribe prompt — v1.1, Phase 5
- The "Mall Treasure Hunt" second discovery mechanic — 3-4 hidden icons across multiple pages ending in a discount code + subscribe/WhatsApp capture reveal — v1.1, Phase 6

### Active

- [ ] User can sign in / sign up with Google OAuth
- [ ] User accounts are backed by a real, persistent database (not just Stripe)
- [ ] A logged-in user's account is linked to their Stripe customer, so membership/subscription status follows them across devices and browsers
- [ ] Account page shows profile info (name, avatar from Google)
- [ ] Account page shows billing/subscription status and lets the user manage or cancel it
- [ ] Session management reflects logged-in state, replacing/supplementing the existing `ladidier_subscribed` / `ladidier_member` cookie flags

### Known Gaps

<!-- Shipped but incomplete; recorded so they aren't rediscovered as surprises. -->

- **Membership is per-browser.** The entitlement cookie is tied to one browser, so a member on a new device or after clearing cookies has no way to restore access. Genuine cross-device recovery needs a verified email round-trip (an email provider plus an identity step), which no storage choice avoids. **Being addressed in v1.2** — Google OAuth login ties entitlement to the account instead of the browser.
- **The webhook logs but does not act.** With Stripe as the source of truth, `api/webhook.js` is an audit trail; access is decided by `api/entitlement`. If side effects are ever added there (emails, provisioning), dedupe on `event.id` first — Stripe redelivers events and does not guarantee order.
- **Revocation lags by up to 6 hours.** Membership is re-checked at most every 6 hours per browser, so a cancellation can leave access open until the next check.
- **Delayed-notification payment methods would break the return flow.** Dynamic payment methods are on, and access is granted only when `payment_status` is `paid`. If SEPA Direct Debit or similar is enabled in the Dashboard, a buyer would finish Checkout without immediate access and no way to reclaim it.

### Out of Scope

- Native mobile app — web-first is the current priority
- ~~Backend/API integration — the portal is a static/client-side site~~ — **reversed 2026-08-31**: charging for membership cannot be done client-side, so the project now has Vercel serverless functions under `api/` (see Key Decisions)
- Copy/CTA rewrites on About or Article pages (not primary landing pages in v1.1)
- Leaderboards, competitive/social mechanics, or more than two discovery mechanics — v1.1 shipped exactly two: Phase 5's single hidden perk, and Phase 6's Mall Treasure Hunt
- Migrating existing pre-login Stripe subscribers into the new account system — v1.2 only needs to work for new sign-ins going forward; existing subscribers are handled in a later milestone
- Email/password or other non-Google login methods — v1.2 ships Google OAuth only

## Context

The site is built with React 18 loaded via CDN (no build step), Babel standalone for JSX, and a single `styles.css`. Page content lives in `pages.jsx` (HomePage, MagazinePage, ArticlePage, StoresPage, SubscribePage, AboutPage), shared UI in `components.jsx`, and decorative elements in `ornaments.jsx`. Routing is a simple hash router in `app.jsx`.

Paid membership was added 2026-08-31 and is live on `ladidier.com`. Two Stripe products — ÉcLAT Online and ÉcLAT Hard Copy — are sold monthly or yearly via Stripe-hosted Checkout. Five serverless functions sit in `api/`: `checkout` (creates a session), `verify-session` (confirms payment on return and sets an httpOnly cookie), `entitlement` (re-asks Stripe whether the subscription is still active), `prices` (serves live amounts so the page never hardcodes them), and `webhook` (signature-verified audit trail). Shared helpers are in `lib/`.

Two separate flags now exist where one used to be conflated: `ladidier_subscribed` means "gave us an address" and only decides whether perks/treasure prompts appear; `ladidier_member` means "has a live paid subscription" and gates the interactive digital edition. Only the server can grant the latter.

v1.0 (mobile responsiveness) shipped and is confirmed live on Vercel by the user — the roadmap/state tracking for it was left partially stale (Phase 2/3 weren't formally closed out even though the work is done), but the milestone itself is complete.

v1.1 (Shopping Mall Conversion Pass) is complete — copy/CTA/conversion work on Home/Stores/Magazine, the hidden perk, and the Mall Treasure Hunt all shipped. v1.2 continues phase numbering from where v1.1 left off.

**Production is currently running Stripe test-mode keys (as of 2026-09-01)**, swapped in to test the ÉCLAT Vol. 2 gating feature end-to-end. No real customer can complete a real purchase until reverted — see STATE.md's Out-of-band work section for details. This should be reverted before or alongside v1.2 work touching Stripe/checkout.

## Constraints

- **Tech stack**: the browser-facing site stays React 18 CDN + Babel standalone + plain CSS with no build step. `package.json` and npm exist only for the serverless functions in `api/`, which Vercel installs and runs server-side — no bundler was introduced for the front end (amended 2026-08-31; originally "no npm, no build tools")
- **Secrets never in the repo**: Stripe keys and the webhook signing secret live in Vercel environment variables, marked Sensitive. `.env*` is gitignored. Price ids are configuration, not secrets, but still belong in env vars rather than `vercel.json` — which has no `env` property and silently ignores one
- **No breaking changes**: Tweaks panel, existing routing, and the responsive layouts from v1.0 must be preserved exactly
- **Hidden perks must stay hidden**: the discovery element must not add visible clutter, extra nav items, or interrupt the shopping/browsing flow

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Full-screen overlay nav (not drawer/dropdown) | Matches the luxury editorial feel of the brand | Shipped v1.0 |
| No mobile build pipeline | Site has no npm/webpack — keep it zero-build | Shipped v1.0 |
| Copy/CTA/conversion scope limited to Home, Stores, Magazine | These are the pages people land on first; About/Article deferred | Shipped v1.1 Phase 4 |
| Hidden perks ships as one real discovery mechanic, not a gamified system | Keep it subtle and low-effort to build/maintain per user's brief | Shipped v1.1 Phase 5, then superseded 2026-08-22 |
| Add a second, gamified discovery mechanic (Mall Treasure Hunt) alongside the Phase 5 perk, rather than replacing it | User wants a multi-page browsing incentive + subscriber-growth hook; explicitly chose "keep both" over replacing the existing perk | Shipped v1.1 Phase 6 |
| Sell membership through Stripe-hosted Checkout, adding a serverless backend | Taking money client-side is impossible; Stripe-hosted Checkout keeps card data off our infrastructure and needs no bundler for the front end | Live 2026-08-31 |
| Treat Stripe as the entitlement store rather than adding a database | The only question is "is this subscription still paid for", which Stripe already answers. An httpOnly cookie holds the Checkout Session id and `api/entitlement` re-checks status, so cancellations and failed renewals revoke access with no data to keep in sync | Superseded 2026-09-01 — v1.2 adds a real database for user accounts |
| Read prices from Stripe at runtime instead of hardcoding them | Hardcoded €96/€240 had already drifted — the live prices are USD $15–$100. The page now displays whatever Stripe charges, so the two cannot disagree | Live 2026-08-31 |
| Digital edition is for paying members only; the free Reader tier does not unlock it | The paywall copy says "reserved for members" and the Reader card never promised the edition. Previously both the free tier and any typed email unlocked it, so the paid tiers gated nothing | Live 2026-08-31 |
| Name the site's products after the Stripe products (ÉcLAT Online / Hard Copy) rather than inventing tiers | The page sold "The Annual" and "The Patron", which mapped onto nothing in Stripe; Patron was described as a superset of Annual while Online is a lesser format than Hard Copy, so no mapping was coherent | Live 2026-08-31 |
| Login via Google OAuth only (no email/password, no other providers) | Fastest signup, no password-reset flow to build/maintain; user chose this over email+password or magic link | v1.2 — Pending |
| Add a real persistent database for user accounts, linked to Stripe customer id | Google login + cross-device membership needs an identity record that Stripe alone can't provide; Stripe remains the source of truth for subscription status, the DB stores identity/profile and the link to the Stripe customer | v1.2 — Pending |
| Don't migrate pre-login Stripe subscribers this milestone | Keeps v1.2 scoped to new sign-ins; migrating existing subscribers needs its own flow (e.g. claim-by-email) and is deferred | v1.2 — Pending |

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
*Last updated: 2026-09-01 — v1.1 (Shopping Mall Conversion Pass) shipped; milestone v1.2 (Accounts & Cross-Device Membership) started*
