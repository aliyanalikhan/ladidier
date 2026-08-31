# Project Research Summary

**Project:** LaDidier Portal
**Domain:** Accounts & Cross-Device Membership (v1.2) — adding Google OAuth + persistent Postgres identity + Stripe-customer linking to an existing live-payments, zero-build-framework Vercel serverless app (Stripe Checkout already in production)
**Researched:** 2026-09-01
**Confidence:** MEDIUM-HIGH

## Executive Summary

This milestone adds Google OAuth sign-in, a Postgres users/addresses database, and a durable link between a signed-in account and its Stripe Customer, on top of a live app that already has real, paying subscribers on a cookie-only entitlement system. The technical foundation (draft plan at `.planning/quick/260831-8ug-.../260831-8ug-PLAN.md`) is validated and current: `@neondatabase/serverless` for Postgres (not the deprecated `@vercel/postgres`), hand-rolled Google OAuth via `fetch` (justified because the ID token is fetched server-to-server, not accepted from an untrusted browser channel), and HMAC-signed httpOnly session cookies via `crypto.subtle`. No new auth framework or JWT library is needed.

The one piece of real, new engineering beyond that draft plan is the reverse Stripe link: persisting `stripe_customer_id` on the `users` row and using it (not `customer_email`, which does not deduplicate) to find-or-create a Stripe Customer at checkout time. This is the mechanism that actually makes membership cross-device, and it is the highest-risk area: naive implementations risk duplicate Stripe customers, race-condition overwrites, or account/billing takeover via unverified email matching. The safe path: UNIQUE constraint on `stripe_customer_id`, link at checkout-creation time via `ensureStripeCustomer`, never auto-link pre-login purchases by email this milestone, and delegate billing management to Stripe's hosted Customer Portal.

The dominant architectural constraint is coexistence, not replacement: `api/entitlement.js`, `api/verify-session.js`, `api/webhook.js`, `lib/membership.js`, `lib/stripe.js` must stay byte-for-byte untouched so the live per-browser entitlement flow never regresses. The new account/session system is additive (`api/account/*`, `lib/account.js`), OR'd into client state, never able to revoke access the legacy flow granted. A second cross-cutting risk: Production currently runs Stripe test-mode keys, so account-linking work tested against Production now writes ids that break after the pending revert to live keys — this must be a hard phase-completion gate.

## Key Findings

### Recommended Stack

Only one new package: `@neondatabase/serverless` (1.1.0, MIT, zero deps), HTTP-mode (`neon()`) — avoids all connection-pooling concerns since each query is a stateless HTTPS fetch. Google OAuth uses global `fetch` (three calls: authorize redirect, token exchange, decode `id_token`) with no JWT/JWKS library needed since the token is server-to-server. Session cookies reuse the existing `crypto.subtle` HMAC pattern from `api/webhook.js`. No auth framework, no dotenv, no Google API client SDK.

**Core technologies:**
- `@neondatabase/serverless` (HTTP mode) — the only non-deprecated Postgres path from Vercel
- Hand-rolled Google OAuth via `fetch` — no library needed given the trusted server-to-server channel
- `crypto.subtle` (Web Crypto) — HMAC session cookie, consistent with existing webhook signature verification
- Watch item: Vercel deprecates Node.js 20 on Oct 1, 2026 — pin Node 22+ before/alongside this milestone

### Expected Features

The largest gap between what's drafted and what this milestone promises is `users.stripe_customer_id` — without it, "cross-device membership" isn't real.

**Must have:** Google sign-in/out with persistent session; account page name+avatar from Google's `id_token`; `stripe_customer_id` captured at/after checkout; membership status sourced from the same check as the legacy path; "Manage billing" via Stripe Customer Portal; saved address view/edit reusing the existing `addresses` table/`api/address.js`.

**Should have:** Delegating billing entirely to the Customer Portal (disciplined, not a corner cut); receipt/purchase history via the Portal rather than a custom list.

**Defer:** Claim-previous-purchase flow for pre-login subscribers; multiple addresses (schema is one-per-user by design); account deletion/export; admin dashboard; additional OAuth providers; password reset (no password exists).

### Architecture Approach

Strictly additive, two-lane design: the existing cookie flow (`ladidier_member_session` → `api/entitlement.js`) stays untouched; a new parallel account flow (`ladidier_session` → `api/account/status.js` → `lib/account.js` → `lib/db.js` + shared `lib/stripe.js`) runs beside it. Client-side, an additive `useEffect` in `src/app.jsx` can only turn membership access on, never off.

**Major components:**
1. `lib/db.js` (extend) — schema owner; add nullable UNIQUE `stripe_customer_id` column
2. `lib/account.js` (new) — orchestration seam importing `lib/db.js` + `lib/stripe.js` for find-or-create/verify logic
3. `api/account/status.js` + `api/account/portal.js` (new) — sibling endpoints reusing `ACTIVE_STATUSES` from `lib/membership.js`
4. `api/checkout.js` (the one legacy file touched) — calls `ensureStripeCustomer` before `sessions.create`, passing `customer:` not `customer_email`

### Critical Pitfalls

1. `customer_email` on Checkout Session creates duplicate Stripe customers — use stored customer id via `customer:`, never `customer_email` once one exists
2. Auto-linking by email match enables account/billing takeover — require `email_verified` at the linking step specifically; never auto-attach existing customers this milestone
3. Concurrent checkouts race and create duplicate customers — UNIQUE constraint on `users.stripe_customer_id`, DB as concurrency source of truth
4. Webhook stays log-only — don't silently make it a linking writer without an `event.id` dedupe table and idempotent upserts
5. Test-mode key contamination — Production is on Stripe test-mode keys; gate Phase 2's "done" state on the live-key revert

## Implications for Roadmap

### Phase 1: OAuth + Database Foundation
**Rationale:** Everything depends on identity existing first; already drafted/validated (260831-8ug), execute largely as-is plus pin Node 22+ and verify connection-string naming.
**Delivers:** `lib/db.js` schema, `lib/session.js`, four `api/auth/*` routes, checkout login-gate, `api/address.js`.
**Addresses:** Google sign-in/out, session persistence, saved address collection.
**Avoids:** Pitfalls 5/6/9/10 (connection string, module-scope throws, consent screen Testing status, Preview redirect URI), and establishes the Pitfall 7 frozen-files check for every later phase.

### Phase 2: Stripe-Customer Linking
**Rationale:** The actual cross-device-membership mechanism and highest-risk phase; needs deliberate design, depends on Phase 1's `users` table.
**Delivers:** `stripe_customer_id` column (UNIQUE, nullable), `lib/account.js`'s `ensureStripeCustomer`, `api/checkout.js` modified to pass `customer:`.
**Uses:** `@neondatabase/serverless` schema extension, Stripe idempotency keys.
**Implements:** `lib/account.js` orchestration seam.
**Must gate on:** Stripe test-mode-key revert to live before this phase is done in Production (Pitfall 8).

### Phase 3: Account & Billing Page
**Rationale:** Depends on Phase 2's linked customer; the user-facing payoff, pure consumer of prior APIs.
**Delivers:** `api/account/status.js`, `api/account/portal.js`, `AccountPage`, additive `isMember` effect, real `Nav` link.
**Addresses:** Profile, membership status, Manage billing via Portal, saved-address view/edit.
**Avoids:** Modifying `api/entitlement.js`; replacing the legacy cookie system; email-match auto-linking in the status endpoint.

### Cross-cutting gates (every phase)
- `git diff` against the five frozen files must be empty at every phase verification step (Pitfall 7)
- Stripe live-key revert (secret key, publishable key, webhook secret together) verified via one successful webhook delivery before Phase 2 is marked done in Production (Pitfalls 8, 11)
- OAuth consent screen moved out of "Testing" before real users are driven to sign-in (Pitfall 9)

### Phase Ordering Rationale

Identity must exist before anything links to it (1→2→3 is a strict dependency chain). Stripe-customer linking is isolated into its own phase because it concentrates the highest-severity risks (duplicate customers, takeover, test-mode contamination) — bundling it elsewhere would bury review-worthy risk. This keeps legacy-file regression risk checkable at every phase boundary.

### Research Flags

Needs deeper research during planning:
- **Phase 2 (Stripe-Customer Linking):** concurrency/idempotency design and the webhook log-only-vs-actor decision need explicit review before task planning — this is where the highest-severity pitfalls concentrate.

Standard patterns (research-phase can likely be skipped):
- **Phase 1:** already validated by prior draft plan plus fresh stack research
- **Phase 3:** Stripe Customer Portal integration is a well-documented pattern; UI follows existing SubscribePage/Nav conventions

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | MEDIUM-HIGH | Versions/deprecation verified via `npm view` (HIGH); broader best-practice claims cross-checked but not library-doc verified (MEDIUM) |
| Features | MEDIUM | Stripe Portal/dedup behavior verified against official docs; OAuth-to-Stripe linking UX is synthesized general practice (LOW for the claim-flow specifics) |
| Architecture | HIGH | Derived directly from reading the live codebase and existing draft plan |
| Pitfalls | MEDIUM-HIGH | Codebase-specific findings are HIGH (read directly from source); websearch-derived findings (Stripe races, Neon pooling, OAuth CSRF) are MEDIUM, cross-checked |

**Overall confidence:** MEDIUM-HIGH

### Gaps to Address

- Claim/reconciliation flow for pre-login subscribers: deferred per PROJECT.md; exact confirmation-step design not yet specified — flag for a future milestone's requirements phase.
- Whether the webhook becomes a linking actor: open decision for Phase 2 planning, needs an explicit recorded choice.
- Test-mode-to-live-mode revert timing: external operational dependency; confirm current status before planning Phase 2 in detail.
- Connection-string env var naming (`DATABASE_URL` vs `POSTGRES_URL`) varies by integration install — confirm during Phase 1 provisioning.

## Sources

### Primary (HIGH confidence)
- Direct codebase reads: `api/entitlement.js`, `lib/membership.js`, `lib/stripe.js`, `api/checkout.js`, `api/verify-session.js`, `api/webhook.js`, `lib/plans.js`, `src/app.jsx`, `src/pages.jsx`, `src/components.jsx`, `package.json`, `index.html`
- `npm view @neondatabase/serverless` / `@vercel/postgres deprecated` — direct registry queries
- `.planning/PROJECT.md` and `.planning/quick/260831-8ug-.../260831-8ug-PLAN.md`

### Secondary (MEDIUM confidence)
- Stripe official docs: Customer Portal, guest-customer/email-dedup behavior, idempotency
- Neon docs: serverless driver reference, Vercel-Postgres migration guides, connection methods
- Google Identity docs: backend-auth token-endpoint exemption, ID-token verification
- `stripe-node` GitHub issue #476 — duplicate-customer-by-email acknowledged API gap
- Vercel changelog — Node.js 20 deprecation date

### Tertiary (LOW confidence)
- Google account-linking guidance, Auth0/Stripe sync blog example, general account-page UX articles — used only to shape claim-flow/account-page UX ideas, needs validation if pursued

---
*Research completed: 2026-09-01*
*Ready for roadmap: yes*
