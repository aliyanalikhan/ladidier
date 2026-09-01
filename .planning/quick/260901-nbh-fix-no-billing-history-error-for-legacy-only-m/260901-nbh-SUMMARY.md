---
phase: 260901-nbh
plan: "01"
subsystem: billing
tags: [stripe, subscribe-page, account-page, bugfix]
status: human_needed

# Dependency graph
requires:
  - phase: 260901-mbr
    provides: activePlan state in src/app.jsx, "Your Membership" panel and card CTAs in SubscribePage
provides:
  - Correct activePlan-based gating for any UI that opens /api/account/portal
affects: [subscribe-page, account-page]
---

# Quick Task 260901-nbh Summary

**Status:** human_needed (code-level complete; needs live verification against a real legacy-only-member account — not reproducible in this environment)

Fixed "No billing history" errors reachable from the Manage-billing UI added in the immediately
prior task (260901-mbr), plus an identical pre-existing gap on `AccountPage`.

Root cause: `isMember` is true for two different reasons — a legacy checkout-session cookie
(no linked Stripe customer) or an account-linked active subscription (has one) — but both
`SubscribePage`'s new membership panel and `AccountPage`'s "Manage billing" button were gated on
`isMember` alone, and portal access requires the latter specifically.

Fix: gate both on `activePlan` instead, which is only non-null when the account-linked path
resolved a real customer. `AccountPage` now takes an `activePlan` prop and shows explanatory text
in place of a dead button when it's null.

`npm run build` passes. Verified in the browser (props temporarily hardcoded to the buggy shape,
reverted before commit) that: (1) SubscribePage falls back cleanly to the original plan-picker for
a legacy-only member, and (2) AccountPage shows "Billing management isn't available for this
membership yet." instead of a button that would 400. Not verified against a real legacy-only
account on a live deploy — no Stripe/OAuth/DB credentials in this environment.
