---
phase: 260901-liv
plan: 01
type: infra
wave: 1
depends_on: []
files_modified: []
---

# Quick Task: swap Vercel Production off Stripe test mode back to live

## Trigger

User pasted live Stripe credentials directly in the command, requesting a swap back to live mode:
- `sk_live_...` (secret key)
- `pk_live_...` (publishable key — not used anywhere in this codebase, not applied)
- `mk_...` (unrecognized prefix, doesn't match any Stripe key format or anything this codebase
  reads — not applied)
- `https://ladidier.com/api/webhook` (the webhook *URL*, not the signing secret the app needs)
- `prod_VAyHWfX8XdHh2z` (Online product), `prod_VAyJTIfn7UVWi3` (Hard Copy product)

This reverts the intentional test-mode swap logged in STATE.md (made for 260901-1lc, to test the
ÉCLAT Vol. 2 gate end-to-end) and closes ROADMAP.md Phase 8's "Production gate" note.

## What was incomplete in what was provided

- Two `prod_` ids can't fill 4 `STRIPE_PRICE_*` slots (online/hardcopy × monthly/yearly) without
  ambiguity — `lib/plans.js`'s `resolvePriceId` only auto-resolves a product id to a price when
  the product has exactly one active recurring price; both these products have two (monthly +
  yearly), so pointing both interval slots at the same product id would have thrown at checkout.
- The webhook *URL* isn't the signing secret `STRIPE_WEBHOOK_SECRET` needs, and a live-mode
  webhook endpoint for that URL already existed (`we_1Tddc9PJb1GC1KXLhWvobblq`) — Stripe never
  re-exposes an existing endpoint's secret via the API, only at creation time.

## What was done (read-only steps first, then confirmed with the user, then writes)

1. Read-only: `GET /v1/prices` (live secret key) to resolve the exact 4 price ids:
   - Online monthly `price_1UAcKWPJb1GC1KXLQXdnjoIx`, yearly `price_1UAcLFPJb1GC1KXLASxWEXx9`
   - Hard Copy monthly `price_1UAcMuPJb1GC1KXLZkUfuMuv`, yearly `price_1UAcNgPJb1GC1KXLLMvf3Tjh`
2. Read-only: `GET /v1/webhook_endpoints` — found the existing live endpoint, confirmed its secret
   isn't retrievable.
3. Asked the user how to source the webhook secret (paste existing vs. create new via API) —
   they chose create-new.
4. `POST /v1/webhook_endpoints` — created a new live endpoint at the same URL with the event set
   `api/webhook.js`'s switch statement actually handles (checkout.session.completed +
   async_payment_succeeded/failed, invoice.paid/payment_succeeded/payment_failed,
   customer.subscription.updated/deleted), captured its one-time `secret`.
5. `DELETE` the old endpoint (`we_1Tddc9PJb1GC1KXLhWvobblq`) to avoid duplicate deliveries.
6. `vercel env rm` then `vercel env add` (via `--prod` pinned to CLI 59.10.0 — 59.11.0 had a
   broken `@vercel/fastify` dependency on npm at the time) for all 6 vars on Production:
   `STRIPE_SECRET_KEY`, `STRIPE_PRICE_ONLINE_MONTHLY`, `STRIPE_PRICE_ONLINE_YEARLY`,
   `STRIPE_PRICE_HARDCOPY_MONTHLY`, `STRIPE_PRICE_HARDCOPY_YEARLY`, `STRIPE_WEBHOOK_SECRET`.
   Values were piped directly from a temp file under `$CLAUDE_JOB_DIR/tmp` into the CLI's stdin,
   never echoed to terminal output; the temp file was deleted immediately after.
7. `vercel --prod --yes` to trigger a fresh production deployment — env var changes alone don't
   affect an already-built deployment, since Vercel bakes them in at deploy time.
8. Verified: `curl https://ladidier.com/api/prices` on the live domain returns real live-mode
   amounts (was returning Stripe test-mode amounts before this task).

## Note on key exposure

The user pasted live secret credentials directly into a chat session and explicitly said not to
rotate them, stating the conversation is safe. That was flagged once; per their explicit
instruction, no rotation was performed by this task. This is the user's own Stripe account and
their call to make.

## Verification

- `curl https://ladidier.com/api/prices` → live amounts confirmed (not test-mode).
- No code files changed — this was infrastructure/config only, hence no `npm run build` needed
  and no source-code commit for the swap itself (STATE.md's update is committed separately).
- Not verified: an actual end-to-end live Checkout + webhook delivery round trip (would mean a
  real charge) — out of scope for automated verification; the webhook endpoint is confirmed
  `enabled` and the events line up with what `api/webhook.js` handles.
