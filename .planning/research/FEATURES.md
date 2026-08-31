# Feature Research

**Domain:** Accounts, cross-device membership, and billing/profile for a small luxury editorial membership site (existing Stripe-hosted Checkout, adding Google OAuth + Postgres)
**Researched:** 2026-09-01
**Confidence:** MEDIUM (Stripe-specific behavior verified against official docs surfaced in search; UX conventions and OAuth-to-Stripe linking patterns are synthesized general practice, not a single authoritative source — flagged LOW where applicable)

## Context Recap (from PROJECT.md and the 260831-8ug plan)

This milestone builds on top of an already-drafted (unexecuted or partially-executed) plan that:
- Adds `@neondatabase/serverless` (Postgres) with a `users` table keyed on `google_sub`, and an `addresses` table keyed on `user_id` (one row per user, `unique` constraint).
- Hand-rolls Google OAuth over `api/auth/google.js` / `api/auth/callback.js` / `api/auth/me.js` / `api/auth/logout.js`, with an HMAC-signed httpOnly `ladidier_session` cookie, independent of the existing `ladidier_member_session` entitlement cookie.
- Gates the two paid plans behind sign-in at `api/checkout.js`, passing `customer_email` and `metadata: { user_id }` into `stripe.checkout.sessions.create`.
- Explicitly forbids touching `api/verify-session.js`, `api/entitlement.js`, `api/webhook.js`, `lib/membership.js`, `lib/stripe.js` — the existing per-browser entitlement path must keep working byte-for-byte.
- Already builds an in-app address form + `addresses` table + `api/address.js`, but scoped narrowly to Hard Copy checkout (collecting the delivery address before Stripe instead of via Stripe's own shipping collection).

This FEATURES.md covers the account/billing/profile surface **on top of** that foundation: what's still missing to call the milestone (Google login + cross-device membership + billing/profile page) actually done.

## Feature Landscape

### Table Stakes (Users Expect These)

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Google sign-in / sign-out | Locked scope decision; users need *some* way to prove identity to unlock cross-device membership | LOW (already drafted in the 260831-8ug plan — hand-rolled OAuth, no new dependency) | Already scoped: `api/auth/google.js`, `callback.js`, `me.js`, `logout.js` |
| Session persists across reload/navigation | Baseline expectation for any "logged in" state | LOW (already drafted — HMAC-signed httpOnly cookie) | `lib/session.js` in the 260831-8ug plan |
| Account page shows name + avatar | Explicit target feature; also the cheapest possible "this worked" confirmation for the user after OAuth | LOW | Google's `id_token` already carries `name` and `picture`; no extra API call needed |
| **Persist Stripe customer id on the user record** | This is *the* mechanism that makes membership cross-device — without it, "linked to their Stripe customer" is not actually true | MEDIUM | **New work, not yet in any drafted plan.** Requires capturing the `customer` id Stripe creates during Checkout and writing it to `users.stripe_customer_id`. Cleanest point to do this: `checkout.session.completed` in `api/webhook.js` (which today only logs) or synchronously in `api/verify-session.js` on return. Either choice touches a file the 260831-8ug plan explicitly protects — this milestone must consciously decide to extend one of them, not silently leave `metadata.user_id` as a write-only breadcrumb (flagged as accepted risk T-Q8UG-11 in that plan). |
| Account page shows current subscription status | Explicit target feature; without it "billing management" has nothing to manage | LOW-MEDIUM | Re-derive from the existing entitlement check (`lib/membership.js` / `api/entitlement.js`) rather than inventing a second status source — two sources of truth for "am I subscribed" is exactly the bug this milestone is fixing |
| Manage / cancel billing | Explicit target feature | LOW if routed through Stripe Customer Portal, HIGH if self-rolled — **see recommendation below** | Depends on `stripe_customer_id` existing on the user row |
| Saved delivery address, viewable/editable from the account page | Explicit target feature, additive to Stripe's own checkout-time address collection | LOW | **Reuses, does not duplicate**, the `addresses` table + `api/address.js` already drafted in 260831-8ug for Hard Copy checkout. The new work is surfacing/editing that same row from the account page, not a second address system. |
| Cookie-flag replacement/coexistence handled cleanly | Explicit target: session management "replacing/supplementing" `ladidier_subscribed`/`ladidier_member` | MEDIUM | The 260831-8ug plan deliberately keeps `ladidier_session` and `ladidier_member_session` as two independent cookies. This milestone's account page needs to read *both* (who is signed in, and are they entitled) without collapsing them into one concept prematurely — full unification is a larger, later refactor. |

### Differentiators (Not Required, But Valuable)

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| "Manage billing" opens the Stripe-hosted Customer Portal instead of a custom cancel button | Zero new UI to build/maintain for plan switches, payment-method updates, invoice history, proration, and tax — Stripe already solved all of it | LOW (one new serverless route calling `stripe.billingPortal.sessions.create`, same hosted-redirect pattern the site already uses for Checkout) | See Q1 analysis below — this is the recommended default, not a stretch feature |
| Purchase/receipt history on the account page (beyond current status) | Nice-to-have transparency; largely provided for free once the Customer Portal is wired up (it already lists invoices) | LOW if delegated to the Portal, MEDIUM+ if built as a custom list | Don't build a second invoice list — link to the Portal's own "Billing history" |
| Editable address label / multiple saved addresses | Slightly more convenient for a household with more than one delivery address | MEDIUM | Current schema is one address per user (`unique` on `user_id`) by design; multi-address needs a schema change. Defer unless requested — see anti-features |

### Anti-Features (Explicitly Skip for This Scope)

| Feature | Why it seems appealing | Why it's wrong for this milestone | Alternative |
|---------|------------------------|-----------------------------------|-------------|
| Password reset / "forgot password" flow | Standard for most auth systems | There is no password — Google OAuth is the only login method (locked decision). Building this would be pure waste and a second identity system to maintain. | If Google sign-in fails, the fix is retrying Google's own account-recovery flow, not the site's |
| Email/password or other social login providers | "More options is friendlier" | Explicitly out of scope (PROJECT.md, locked). Each added provider is a second account-linking edge case (see Q2) and a second consent screen to maintain. | Google only |
| Auto-linking a Google login to a pre-login Stripe customer purely by matching email, silently | Feels seamless — "we recognized you" | Explicitly deferred this milestone (PROJECT.md: pre-login subscribers are NOT migrated). Doing it silently and partially now also risks attaching the wrong person's purchase/address history if the email match is coincidental or the Stripe customer's email was never verified. | New sign-ins get a fresh Stripe customer at first post-login checkout (already the drafted behavior via `customer_email`). Build an explicit, user-confirmed "claim your previous purchase" flow as its own later milestone — see Q2 below. |
| Self-rolled cancel/plan-change/payment-method UI against the raw Billing API | Feels more "on-brand" than sending users to a Stripe-hosted page | Materially higher complexity (Elements/SetupIntent for card updates, proration math, dunning/retry states) for a two-product, two-interval catalog that doesn't need that flexibility; directly conflicts with this project's stated preference to avoid adding dependencies/surface area where avoidable | Stripe Customer Portal — same "hosted redirect" trust model the site already uses for Checkout |
| Two-factor authentication / MFA setup on the account page | "More secure" reads as a good default | Google already owns the actual credential (password, 2FA, passkeys) — bolting a second MFA layer onto a session cookie that merely proves "Google vouched for this person" adds UI and support burden with no real security gain for a boutique membership site | Rely on Google's own account security; keep the session cookie short-lived and HMAC-signed as already drafted |
| Self-service account deletion / data export in this milestone | Feels like a natural profile-page feature, and is generally good practice | Not in the locked target feature list; needs a decision on what happens to the Stripe customer and subscription on deletion, which is genuinely more design work than shipping value here | Defer to a dedicated privacy/compliance milestone; a "contact us to delete your account" line is sufficient for now |
| Admin dashboard for viewing/managing all member accounts | Feels like an obvious companion to "now we have a user database" | Nobody asked for it and it's a large surface (auth-for-staff, audit logging, PII exposure) with no stated need this milestone | Query Postgres directly via the Vercel/Neon console when needed, as the 260831-8ug plan's own verification steps already do |
| Migrating/backfilling pre-login Stripe subscribers into the new account system | "Might as well do it while we're in here" | Explicitly out of scope this milestone (PROJECT.md, twice-stated) | Deferred to its own milestone with a proper claim-by-email-verification flow |

## Feature Dependencies

```
Google OAuth login + session cookie (already drafted, 260831-8ug)
    └──requires──> Postgres users table (already drafted)

Cross-device membership ("linked to their Stripe customer")
    └──requires──> users.stripe_customer_id column (NEW — not in any drafted plan)
                       └──requires──> a write path that captures the Stripe customer id
                                       at/after checkout (extend api/webhook.js or
                                       api/verify-session.js — currently audit-only/
                                       protected files)

Account page "billing status"
    └──requires──> Cross-device membership (must read the SAME status source as
                     the public entitlement check — no second source of truth)

Account page "manage/cancel billing" (Stripe Customer Portal)
    └──requires──> users.stripe_customer_id (a portal session needs a customer id)
    └──requires──> Stripe Dashboard: Customer Portal configuration (business profile,
                     which actions are allowed — dashboard-only, no CLI, same category
                     of one-time setup as the Google OAuth consent screen)

Account page "saved address"
    └──reuses────> addresses table + api/address.js (already drafted for Hard Copy
                     checkout in 260831-8ug) — NOT a new schema

Multiple saved addresses (differentiator, deferred)
    └──conflicts──> current `addresses.user_id UNIQUE` constraint (one row per user
                     by design) — would need a schema migration
```

### Dependency Notes

- **The single biggest gap between "what's drafted" and "what this milestone promises" is `users.stripe_customer_id`.** The 260831-8ug plan links a user to Stripe only in one direction (`metadata.user_id` written onto the Checkout Session — write-only, and its own threat register calls this out as accepted-risk). Cross-device membership requires the reverse link too: given a signed-in user, find their Stripe customer, and that has to be written somewhere durable during or right after checkout.
- **This touches the "protected files" boundary from the prior plan.** `api/webhook.js`, `api/verify-session.js`, `api/entitlement.js`, and `lib/membership.js` were explicitly off-limits in 260831-8ug so the old per-browser flow wouldn't regress. This milestone's core promise (cross-device membership) cannot be delivered without extending at least one of them — that's an explicit, conscious scope decision for the roadmap/planning phase, not an oversight.
- **The address book is not a new feature — it's a new surface on an existing feature.** Treat "show/edit my saved address on the account page" as reusing `api/address.js` and the `addresses` table, with the account page becoming a second caller of the same endpoint (alongside the Hard Copy checkout flow). Avoid the temptation to model it as a separate "profile addresses" concept.
- **Billing management depends on the customer-id link, not on the database in general.** Wiring up the Stripe Customer Portal doesn't need any new schema beyond `stripe_customer_id` — it's a thin serverless route (`api/billing-portal.js` or similar) mirroring the existing `api/checkout.js` pattern.

## MVP Definition

### Launch With (v1 — this milestone)

- [ ] Google OAuth login/logout, session cookie — *already drafted, execute as-is*
- [ ] `users.stripe_customer_id` captured at/after checkout — *new work, required for everything below*
- [ ] Account page: name + avatar from Google, sign-out
- [ ] Account page: current membership status, sourced from the same check the public entitlement path uses
- [ ] Account page: "Manage billing" button → `stripe.billingPortal.sessions.create` → Stripe-hosted portal (handles plan change, payment method, cancel, invoice history)
- [ ] Account page: saved delivery address, view/edit — reusing the existing `addresses` table/API
- [ ] Session cookie and entitlement cookie coexist without the account page contradicting either

### Add After Validation (v1.x)

- [ ] Explicit "claim your previous purchase" flow for pre-login Stripe subscribers (deferred migration, needs a verification step — see Q2)
- [ ] Multiple saved addresses / labeled address book (needs schema change to drop the one-per-user constraint)
- [ ] Surfacing a lightweight receipt/purchase list on the account page (only if the Customer Portal's own history proves insufficient in practice)

### Future Consideration (v2+)

- [ ] Self-service account deletion / data export
- [ ] Admin visibility into member accounts (internal tool, not user-facing)
- [ ] Additional OAuth providers (would break the current "Google only" decision — only revisit if that decision itself is revisited)

## Feature Prioritization Matrix

| Feature | User Value | Implementation Cost | Priority |
|---------|------------|----------------------|----------|
| Google sign-in/out + session | HIGH | LOW (already drafted) | P1 |
| `stripe_customer_id` linkage | HIGH (unlocks cross-device membership, the milestone's core goal) | MEDIUM | P1 |
| Account page profile (name/avatar) | MEDIUM | LOW | P1 |
| Billing status + Customer Portal link | HIGH | LOW (portal) / HIGH (self-rolled — avoid) | P1 |
| Saved address view/edit on account page | MEDIUM | LOW (reuses existing table/API) | P1 |
| Claim-existing-purchase flow | MEDIUM (only affects pre-login subscribers) | MEDIUM-HIGH (needs a verification mechanism) | P3 (deferred by decision, not by priority) |
| Multiple addresses | LOW | MEDIUM | P3 |
| Account deletion/export | LOW (no current demand signal) | MEDIUM | P3 |

**Priority key:** P1 must have for this milestone · P2 should have, add when possible · P3 explicitly deferred/future

## Answers to the Research Questions

### Q1 — Self-rolled billing management vs. Stripe Customer Portal

**Recommendation: route "manage/cancel" through `stripe.billingPortal.sessions.create`, not a self-rolled UI.**

The site's stated preference to avoid adding dependencies where avoidable actually argues *for* the Portal, not against it: it needs no new npm package (same `stripe` SDK already used for Checkout, same lazy-env-var pattern as `lib/stripe.js`), and it's the same "hosted redirect" trust model the site already uses successfully for Checkout — a small serverless route that creates a session and 302s the browser to a Stripe-owned URL, then returns via `return_url`. A self-rolled equivalent would instead need to be built and maintained against the raw Billing API (list subscriptions, `SetupIntent`/Elements for card updates, manual proration and cancellation-timing logic, dunning/past-due states) — real, ongoing surface area for a two-product catalog that gets nothing extra from being custom.

The one non-negotiable prerequisite is a `customer` id on hand (portal sessions are created *for* a customer), which loops back to the `stripe_customer_id` gap above. There's also a one-time Dashboard configuration step (Settings → Billing → Customer portal — business profile, which self-service actions are allowed, e.g. immediate vs. end-of-period cancellation) that is dashboard-only, no CLI path, in the same category as the Google OAuth consent-screen setup already required by the prior plan.

### Q2 — First-login flow when the Google email already has a pre-login Stripe customer

**For this milestone: do not auto-link.** PROJECT.md already locks this decision — pre-login subscribers are explicitly not migrated. The practical effect: a first Google sign-in creates a `users` row with no `stripe_customer_id`; if that person then buys a plan, `api/checkout.js` creates a *new* Stripe customer via `customer_email` (already the drafted behavior), and that new customer id is what gets linked. Their earlier, pre-login purchase remains unlinked and untouched, exactly as scoped.

**When the claim flow is built later** (v1.x/deferred), the general pattern synthesized from Google's account-linking guidance and common Stripe/Auth0 integrations is: look up Stripe customers by email server-side, and if exactly one match exists, treat it as a *candidate* link rather than an automatic one — require an explicit user confirmation step before attaching it, because email match alone isn't proof of ownership (Stripe customer emails aren't necessarily verified, and can be stale or shared). Google's own `email_verified: true` claim (already checked in the drafted OAuth callback) meaningfully de-risks this compared to email/password systems, but "de-risks" isn't "proves" — a confirmation step (e.g., "We found a ÉcLAT membership under this email — is this yours?") is the safer default once this work is scoped. This finding is LOW confidence — it's synthesized general practice, not a single documented Stripe-endorsed procedure.

**Separately, regardless of the claim flow:** the existing `api/checkout.js` should look up an existing Stripe customer by email before creating a new one on *every* checkout (not just first-login-with-history cases), to avoid duplicate Stripe Customer objects for the same signed-in user across repeat purchases. This is a well-documented Stripe pattern (search/list by email, pass the existing `customer` id if found, fall back to `customer_email` only when no match exists) and is orthogonal to the account-claiming question — it's about not fragmenting *this* user's own Stripe records once they're signed in and already linked.

### Q3 — Saved-address "address book" feature shape

Keep it deliberately small: **one saved address per account**, surfaced and editable from the account page, reusing the exact `addresses` table and `api/address.js` endpoint already drafted for the Hard Copy checkout flow in 260831-8ug (full name, line1/line2, city, region, postal code, country, phone — all already modeled). The account page becomes a second UI surface (alongside the Hard Copy checkout modal) that reads/writes the same row via the same session-scoped endpoint. Do not build a second "profile addresses" table or a multi-address model unless a real need for it appears — the current schema's `unique` constraint on `addresses.user_id` is a deliberate one-address-per-member design, not an oversight.

This stays additive to, not a replacement for, Stripe Checkout's own address collection at time of purchase — per the locked scope, both coexist. The account-page address book is about *convenience and record-keeping tied to the person* (so it survives across devices and purchases), while Stripe's checkout-time collection remains the actual shipping address used for that specific order unless the flow is later changed to prefill Stripe's collection from the saved address (an optimization, not required this milestone).

### Q4 — Table stakes vs. differentiator vs. anti-feature for the account/profile page

See the tables above for full detail; the short version:

- **Table stakes:** identity (name/avatar from Google), sign-out, current membership status, a working manage/cancel path, and the saved address — all six are explicit target features and none is safely skippable without the milestone feeling incomplete.
- **Differentiator:** delegating billing entirely to the Stripe Customer Portal is *technically* the "easy" choice but is also the right one — it's listed as a differentiator only in the sense that a site this size choosing not to over-build custom billing UI is itself a good, disciplined choice, not a corner cut.
- **Anti-features to explicitly skip this milestone:** password reset (no password exists — Google OAuth only), any non-Google login method, silent auto-linking of pre-login purchases by email match, a self-rolled billing UI, MFA/2FA on top of the session cookie, self-service account deletion/export, an admin member-management dashboard, and any work toward migrating pre-login subscribers. All of these are either explicitly locked out of scope by PROJECT.md or add real complexity for no feature this milestone actually promises.

## Sources

- [Integrate the customer portal with the API — Stripe Documentation](https://docs.stripe.com/customer-management/integrate-customer-portal) (MEDIUM confidence — Stripe official docs, surfaced via web search)
- [Customer Self-serve Subscription and Billing Portals — Stripe](https://stripe.com/resources/more/self-serve-subscription-management-and-billing-portals) (MEDIUM)
- [Create a portal session — Stripe API Reference](https://docs.stripe.com/api/customer_portal/sessions/create?lang=node) (MEDIUM)
- [Streamlined Linking with OAuth and Sign in with Google — Google for Developers](https://developers.google.com/identity/account-linking/oauth-with-sign-in-linking) (LOW-MEDIUM — general account-linking pattern, not Stripe-specific)
- [Sync Stripe Customers and Auth0 Users — Auth0 Labs](https://developer.auth0.com/resources/labs/actions/sync-stripe-customers-and-auth0-users) (LOW — third-party integration example, not a Stripe-endorsed procedure)
- [Guest customers — Stripe Documentation](https://docs.stripe.com/docs/payments/checkout/guest-customers) (MEDIUM — duplicate-customer-by-email behavior)
- [Things you should avoid while integrating Stripe subscriptions — Medium](https://medium.com/@harisbakhabarpk/things-you-should-avoid-while-integrating-stripe-subscriptions-28c9d1974308) (LOW — practitioner blog, cross-checked against Stripe's own guest-customer docs)
- [Designing profile, account, and setting pages for better UX — Medium/Bootcamp](https://medium.com/design-bootcamp/designing-profile-account-and-setting-pages-for-better-ux-345ef4ca1490) (LOW — general UX opinion piece)
- [Account settings Page Design Examples — Nicelydone](https://nicelydone.club/pages/account-settings) (LOW — pattern catalog, not a primary source)
- Internal: `.planning/PROJECT.md` (locked scope decisions for this milestone)
- Internal: `.planning/quick/260831-8ug-user-should-login-before-subscription-al/260831-8ug-PLAN.md` (drafted foundation this milestone builds on)

---
*Feature research for: Google-OAuth accounts + cross-device membership + billing/profile page (LaDidiér Portal v1.2)*
*Researched: 2026-09-01*
