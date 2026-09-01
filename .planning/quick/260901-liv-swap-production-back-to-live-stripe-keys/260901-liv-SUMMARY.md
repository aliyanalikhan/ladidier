---
phase: 260901-liv
plan: "01"
subsystem: infra
tags: [stripe, vercel, production, deploy]
status: complete

# Dependency graph
requires:
  - phase: 260901-1lc
    provides: the original test-mode swap this task reverts
provides:
  - Production Vercel env now on live Stripe keys/prices/webhook secret
  - Fresh live webhook endpoint we_1UAt0BPJb1GC1KXLWwtLc8oL (old we_1Tddc9PJb1GC1KXLhWvobblq deleted)
affects: [checkout, billing, webhooks, production-config]
---

# Quick Task 260901-liv Summary

**Status:** complete

Reverted the intentional Stripe test-mode swap made for 260901-1lc. Production is back on live
Stripe processing — **real customers can now be charged real money.**

The user provided a live secret key, two product ids, and a webhook URL, but that wasn't quite
enough to do this safely: the 2 product ids can't unambiguously fill the 4 monthly/yearly price
slots the app needs, and a webhook URL isn't the signing secret. Resolved both read-only against
the live Stripe API first (found the 4 exact price ids; found an existing live webhook endpoint
whose secret Stripe won't re-expose), asked the user how to handle the webhook secret specifically
(they chose: create a new endpoint via API), then wrote:

- `STRIPE_SECRET_KEY` → the live secret key given
- `STRIPE_PRICE_ONLINE_MONTHLY` / `_YEARLY`, `STRIPE_PRICE_HARDCOPY_MONTHLY` / `_YEARLY` → the 4
  resolved live price ids (not the 2 product ids, to avoid checkout ambiguity)
- `STRIPE_WEBHOOK_SECRET` → from a freshly-created live webhook endpoint (old one deleted)

All 6 set on Vercel Production, then a fresh `vercel --prod` deploy was triggered (env var changes
alone don't take effect on an already-built deployment). Verified live: `GET
https://ladidier.com/api/prices` now returns real live-mode amounts.

No code changed — infra/config only. STATE.md's stale "production is on test mode" warning was
replaced with a note that it's resolved (history preserved in a collapsed section). This closes
Phase 8's "Production gate."

The user explicitly declined key rotation despite pasting live secrets into chat — flagged once,
respected per their instruction; it's their account.
