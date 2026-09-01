---
phase: 260901-mbr
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - lib/plans.js
  - lib/account.js
  - api/account-router.js
  - api/checkout.js
  - src/app.jsx
  - src/pages.jsx
---

# Quick Task: Subscribe page recognizes existing members

## Trigger

User request (verbatim): "when user is subscribed to an package it would show the subscription
plan which is active in his account and on subscription page dont show then becom a membbor
again when subscribed, just to upgrade and manage current package. and go to manage billing page"

This closes a known gap called out in STATE.md's 260901-1lc entry: "Subscribe page still doesn't
recognize an existing member (risk of accidental double-subscribe)."

## Approach

1. **Resolve which plan is active**, not just whether membership is active. Added
   `planForPriceId(stripe, priceId)` to `lib/plans.js` (reverse-matches a subscription's Stripe
   price id against the 4 `PRICE_ENV` entries) and `getActiveSubscriptionPlan` /
   `getUserMembershipPlan` to `lib/account.js` (finds the customer's one active/trialing
   subscription and resolves it to `{product, interval, cancelAtPeriodEnd}`, 60s-cached same as
   the existing boolean check). Extracted `resolvePriceId` out of `api/checkout.js` into
   `lib/plans.js` so both call sites share one resolution + cache instead of duplicating it.

2. **Surface it over the wire**: `api/account-router.js`'s `status` action now returns
   `{active, plan}` instead of just `{active}` (backward-compatible addition, not a breaking
   change to the shape). `checkUserActiveMembership` (used by the higher-frequency issue-gating
   path in `lib/access.js`) was left untouched — only the Subscribe/Account status path needed
   the richer plan data.

3. **Thread it through the frontend**: `src/app.jsx`'s membership resolver effect now also
   captures `plan` from the account-status response into a new `activePlan` state, passed to
   `SubscribePage` alongside the existing `isMember`. The post-Stripe-Checkout verify-session
   effect also fetches `/api/account/status` once directly (the resolver effect's own 6-hour
   recheck-skip guard would otherwise leave `activePlan` null for hours right after a purchase).

4. **Redesign SubscribePage's member state** (`src/pages.jsx`): added a "Your Membership" summary
   panel (plan name + interval, cancellation notice if `cancelAtPeriodEnd`, "Manage billing →"
   button hitting the existing `/api/account/portal` route) shown whenever `isMember && user`.
   Each of the 3 plan cards' CTA is now conditional: the Reader card shows a disabled "Included
   in your membership"; whichever paid card matches `currentProduct` shows a disabled "Current
   plan ✓"; the other paid card shows "Upgrade →". "Upgrade" deliberately routes to the same
   Stripe billing portal rather than a second Checkout session — Checkout would create a second,
   duplicate subscription instead of changing the existing one, and the portal is Stripe's own
   safe place to switch plans. When `activePlan` couldn't be resolved (legacy-cookie-only member,
   or a misconfigured price env), both paid cards fall back to "Upgrade →" rather than guessing
   which one is current.

Left unchanged, deliberately: a member who is *not* signed in (legacy checkout-session cookie
only, no linked Google account) still sees the original plan-picker/"Become a member" flow — there
is no Stripe customer id to open a billing portal for, and no way to know which of the 4 plans
that cookie belongs to without extending the legacy `api/entitlement.js` path, which STATE.md notes
was deliberately left untouched by the prior bug-fix pass. AccountPage's separate
"Status: Active (Digital & Print)" hardcoded line was also left as-is — out of scope (this task
was specifically about the Subscribe page).

## Verification

- `node --check` on all 4 modified server files (`lib/plans.js`, `lib/account.js`,
  `api/account-router.js`, `api/checkout.js`) — passes.
- `npm run build` — succeeds, deterministic output.
- Manual browser verification via `vite dev` + Chrome, screenshotting 3 states with `isMember`/
  `activePlan` temporarily hardcoded in `src/app.jsx` (reverted before commit, confirmed via
  `git diff`):
  - Not a member: unchanged original 3-card "Become a member" flow, no console errors beyond the
    expected `/api/*` 404s (those routes don't run under plain `vite dev`, only under `vercel dev`
    or a real deploy).
  - Member with a resolved plan (`online`/`yearly`): "Your Membership: ÉcLAT Online — Yearly" panel
    + "Manage billing →"; Reader card "Included in your membership"; Online card "Current plan ✓";
    Hard Copy card "Upgrade →".
  - Member with unresolved plan (`activePlan: null`): "Active membership" panel + "Manage billing
    →"; both paid cards show "Upgrade →".
- Not verified live: an actual Stripe checkout → billing portal round trip, since this environment
  has no Stripe/OAuth/DB credentials. That's a live-deploy check, same category as the 7 items
  already pending from 260901-b1a.
