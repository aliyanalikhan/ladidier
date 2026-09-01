---
phase: 260901-nbh
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - src/app.jsx
  - src/pages.jsx
---

# Quick Task: fix "No billing history" error on Manage billing

## Trigger

User report (verbatim): "No billing history"

That string is the literal error `api/account-router.js`'s `handlePortal` returns (400) when
`user.stripe_customer_id` is missing, surfaced verbatim by `handleManageBilling`'s
`alert(data.error || ...)` in both `SubscribePage` and `AccountPage`.

## Root cause

`isMember` is true whenever *either* the legacy checkout-session-cookie path or the
account-linked path grants access (`src/app.jsx`'s OR-of-both resolver). Only the account-linked
path implies a `stripe_customer_id` exists to open a billing portal for. A visitor who bought a
subscription anonymously (pre-account-link) and *separately* signed in with Google on the same
browser gets `isMember = true` and a non-null `user`, but has no linked Stripe customer — so any
UI gated on `isMember && user` that then calls `/api/account/portal` hits this dead end.

The 260901-mbr quick task (this session, immediately prior) introduced exactly this gate in
`SubscribePage`'s new "Your Membership" panel and per-card CTAs. `AccountPage`'s "Manage billing"
button had the identical, pre-existing gap (rendered unconditionally for any signed-in user
regardless of `isMember`/billing-link status) — not caused by 260901-mbr, but the same root cause
and the same user-facing error, so fixed together.

## Fix

`api/account-router.js`'s `status` action already returns `active: !!plan` — `plan` (now
`activePlan` in `src/app.jsx` state) is non-null *if and only if* the account-linked path found an
active subscription tied to a real `stripe_customer_id`. That makes `activePlan` (not `isMember`)
the precise, already-available signal for "a billing portal exists for this visitor."

- `src/pages.jsx` `SubscribePage`: changed the "Your Membership" panel and all 3 plan-card CTA
  conditionals from `isMember && user` to `activePlan && user`. A legacy-only member now falls
  back to the original plan-picker cards untouched — correct, since there's nothing to manage or
  upgrade without a linked customer.
- `src/pages.jsx` `AccountPage`: now accepts an `activePlan` prop; the "Manage billing →" button
  only renders when `activePlan` is truthy, otherwise a plain-text line explains billing
  management isn't available yet (or, if not a member at all, that subscribing unlocks it).
- `src/app.jsx`: passes `activePlan` into `AccountPage` (already computed and already passed to
  `SubscribePage` from the 260901-mbr task).

## Verification

- `npm run build` — succeeds, deterministic output.
- Manual browser verification via `vite dev` + Chrome with `isMember: true, activePlan: null,
  user: {...}` temporarily hardcoded in `src/app.jsx` (the exact legacy-only-member shape that
  triggered the bug), reverted before commit and confirmed via `git diff`:
  - Subscribe page: no "Your Membership" panel; cards show the original "Continue, no charge" /
    "Become a member" / "Take the print edition" — no path left that calls the billing portal.
  - Account page: "Billing management isn't available for this membership yet." replaces the
    button — confirmed no dead "Manage billing" control remains reachable.
- Not verified live: this requires a real account that is member-via-legacy-cookie-only
  (subscribed anonymously, later signed in) against a live deploy with real Stripe/DB — not
  reproducible in this environment. Same live-deploy-check category as prior quick tasks.
