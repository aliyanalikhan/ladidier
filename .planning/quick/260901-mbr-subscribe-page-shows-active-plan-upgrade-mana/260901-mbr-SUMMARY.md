---
phase: 260901-mbr
plan: "01"
subsystem: billing
tags: [stripe, subscribe-page, membership, react]
status: human_needed

# Dependency graph
requires:
  - phase: 09-account-and-billing-page
    provides: api/account/status (now api/account-router.js), api/account/portal, isMember resolver in src/app.jsx
provides:
  - lib/plans.js planForPriceId() — resolves a Stripe price id back to {product, interval}
  - lib/account.js getActiveSubscriptionPlan() / getUserMembershipPlan() — active plan lookup, 60s cached
  - api/account-router.js status action now returns {active, plan}
  - src/app.jsx activePlan state, threaded into SubscribePage
affects: [subscribe-page, account-page, checkout]
---

# Quick Task 260901-mbr Summary

**Status:** human_needed (code-level complete; live Stripe verification pending — no Stripe/OAuth/DB credentials in this environment)

Closed the known gap where a signed-in member visiting the Subscribe page saw the same
"Become a member" pitch as a new visitor, risking an accidental duplicate subscription.

The page now shows a "Your Membership" panel (active plan + interval, cancellation notice if set
to end, "Manage billing →") and relabels each pricing card's button: the active plan reads
"Current plan ✓" (disabled), the free Reader tier reads "Included in your membership" (disabled),
and the other paid plan reads "Upgrade →" — which opens the same Stripe billing portal as
AccountPage's "Manage billing" button, rather than a second Checkout session, so switching plans
can't create a duplicate subscription.

Which plan is "active" is resolved server-side by matching the customer's live Stripe subscription
price against the 4 configured `PRICE_ENV` prices (`lib/plans.js` `planForPriceId`, `lib/account.js`
`getActiveSubscriptionPlan`/`getUserMembershipPlan`), returned from `/api/account/status` as a new
`plan` field alongside the existing `active` boolean, and threaded through `src/app.jsx`'s existing
membership resolver into a new `activePlan` state.

Scoped to signed-in, account-linked members only (the primary path since Phase 7-9). A member via
the legacy pre-login checkout-session cookie only, not signed in, still sees the original flow —
there's no linked Stripe customer to resolve a plan for or open a billing portal to.

`npm run build` passes. Manually verified all 3 render states (non-member, member-with-known-plan,
member-with-unknown-plan) via `vite dev` + Chrome with temporarily hardcoded props (reverted before
commit — confirmed clean via `git diff`). Not yet verified against a real Stripe billing portal
round trip on an actual deploy.
