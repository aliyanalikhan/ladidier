# Pitfalls Research

**Domain:** Adding Google OAuth + Postgres + Stripe-customer linking to an existing live-payments site (LaDidiér Portal, v1.2)
**Researched:** 2026-09-01
**Confidence:** MEDIUM (websearch-derived findings cross-checked across multiple sources; codebase-specific findings are HIGH — read directly from `api/entitlement.js`, `api/webhook.js`, `lib/membership.js`, `lib/stripe.js`, `api/checkout.js`, and the draft plan)

This file is scoped to what changes because a real, paying customer base already exists on `ladidier.com`. Generic OAuth/Stripe/Postgres advice is included only where it explains *why* a specific line in this codebase is dangerous to get wrong.

## Critical Pitfalls

### Pitfall 1: `customer_email` on Checkout Session creates a second Stripe Customer instead of reusing the pre-login one

**What goes wrong:**
`api/checkout.js` currently calls `stripe.checkout.sessions.create({ ... })` with no `customer` or `customer_email` at all — Stripe creates a fresh Customer object implicitly when the buyer pays. The draft plan's Task 5 adds `customer_email: session.email`. Stripe does **not** deduplicate customers by email on Checkout Session creation — passing `customer_email` (without an explicit `customer` id) still causes Stripe to mint a brand-new Customer every time, even when a Customer with that exact email already exists from a pre-login purchase made before this milestone. The result: a member who bought under the old cookie-only flow, then later signs in with Google using the same email, gets a second, disconnected Stripe Customer and (if they check out again) a second subscription — their old subscription and payment history stay invisible to the new account.

**Why it happens:**
It reads like "obviously Stripe will match the email" — `customer_email` looks declarative, but it is only a prefill hint for Stripe's hosted page, not a lookup key. This exact trap is confirmed as a known, unresolved gap in Stripe's own API surface (see `stripe-node` issue tracker), not a one-off bug.

**How to avoid:**
Before creating a Checkout Session for a signed-in user, look up whether that user already has a `stripe_customer_id` on file (in the new `users` row). If not, search Stripe for an existing Customer by the verified Google email (`stripe.customers.list({ email })` or the Search API) and, if exactly one match is found, pass its id as `customer` (not `customer_email`) and persist it to `users.stripe_customer_id`. If none is found, let Stripe create one and capture `session.customer` from the resulting session/webhook to persist. Never pass both `customer` and `customer_email` together — Stripe will reject or ignore one.

**Warning signs:**
Multiple Stripe Customer records sharing the same email in the Dashboard; a pre-login subscriber who signs in and sees "no active subscription" despite having paid; `metadata.user_id` present on some Checkout Sessions but the Customer object it points at has no subscription history.

**Phase to address:**
The phase that implements Stripe-customer linking (after the OAuth+DB foundation phase, before or alongside the account/billing page). This must land before any production user is allowed to check out through the new gated flow.

---

### Pitfall 2: Auto-linking a Stripe customer by email without checking `email_verified` enables billing/account takeover

**What goes wrong:**
If the linking logic searches Stripe for a Customer matching the Google account's email and attaches it automatically, an attacker who controls (or once controlled) an email address — but not the Google account tied to it — could get an existing member's subscription, saved payment method, and invoice history attached to an account the attacker signs into. Google's `email_verified` claim is usually `true` for consumer Gmail, but is not guaranteed for every account type reachable through Google Sign-In (Workspace accounts with unverified custom domains, or accounts federated through Google via a third-party IdP), and the draft plan's callback already treats this as a real risk by requiring `email_verified === true` before creating any session at all — but that check protects *login*, not the separate *linking* decision that a later phase adds.

**Why it happens:**
Email feels like a stable, unique identifier, so "match by email" reads as the obviously correct join key. The two decisions — "is this login legitimate" and "should this login be allowed to attach itself to an existing paying customer's billing record" — get collapsed into one check when they need different, and stricter, scrutiny for the second.

**How to avoid:**
Require `email_verified === true` (already true in the draft plan's callback, but re-verify at the linking step specifically, not just at login) as a floor, not a sufficient condition. For linking to a *pre-existing* Stripe customer specifically (as opposed to creating a new one for a brand-new signup), treat it as a sensitive action: either (a) defer any pre-login-customer linking to the explicitly out-of-scope future migration flow (PROJECT.md already defers this — do not quietly pull it forward inside "just wire up the metadata"), or (b) if linking existing customers is in scope for this milestone, require an extra confirmation step (e.g., an emailed magic link or a re-auth) rather than silent auto-attach on first sign-in.

**Warning signs:**
Any code path that does `stripe.customers.list({ email: googleEmail })` and attaches the first result without a corroborating check; a support ticket where a user reports "someone else's card" or "someone else's order history" on their account.

**Phase to address:**
Stripe-customer-linking phase — this is the single highest-severity decision in that phase and should be explicitly designed, not incidental to "add a `customer` field to checkout."

---

### Pitfall 3: Two concurrent checkouts (or a checkout racing a webhook) create duplicate Stripe customers for the same signed-in user

**What goes wrong:**
A user with two tabs open, or a retried request after a slow network, triggers two `POST /api/checkout` calls before either has persisted a `stripe_customer_id` back to the `users` row. Both requests find "no customer on file," both let Stripe create a new Customer, and both write back — the second write wins, silently orphaning the first Customer (and, if both completed payment, a member paying twice under two identities).

**Why it happens:**
The natural-sounding pattern — "check if the user has a Stripe customer, if not create one" — has a check-then-act gap with no atomicity, and Vercel serverless functions give no in-process lock to close it (each invocation can be a cold instance).

**How to avoid:**
Add a `UNIQUE` constraint on `users.stripe_customer_id` (nullable-unique is fine in Postgres) so a second concurrent write attempting to set a different customer id on the same user fails loudly at the database rather than silently overwriting. On conflict, re-read the row and reuse whichever customer id won the race rather than proceeding with the loser. This is the same "DB-level UNIQUE constraint as the source of truth for concurrency" pattern the codebase should also apply to webhook idempotency (Pitfall 4).

**Warning signs:**
`users.stripe_customer_id` changing value across two reads without an explicit account action; two Stripe subscriptions both referencing the same `metadata.user_id`.

**Phase to address:**
Stripe-customer-linking phase, at the schema-design step — the `UNIQUE` constraint must exist in the migration that adds the column, not be bolted on after a duplicate is discovered in production.

---

### Pitfall 4: `api/webhook.js` stays log-only, so nothing there can be trusted to *dedupe* the account-linking write

**What goes wrong:**
Today `api/webhook.js` is explicitly an audit trail (`STATE.md`/`PROJECT.md` call this out as a known gap: "the webhook logs but does not act"). Once account-linking is added, there will be a strong temptation to make the webhook's `checkout.session.completed` handler the place that writes `stripe_customer_id` onto the `users` row (since it carries `metadata.user_id`). Stripe redelivers events at-least-once and out of order, so a naive "on this event, set stripe_customer_id" write, run twice (redelivery) or run out of order relative to a synchronous write done in `api/checkout.js`'s own return path, can flip the column back to an older or empty value, or double-run any side effect added alongside it.

**Why it happens:**
The webhook is the only place that reliably learns "this Checkout Session became a real, paid Customer," so it's the obvious place to write the link — but "obvious place to write" and "safe to write from twice, out of order" are different properties, and the codebase's webhook was deliberately never built to guarantee the second one.

**How to avoid:**
If the webhook is upgraded from log-only to acting on account-linking, add a `processed_webhook_events (event_id text primary key)` table and insert `event.id` inside the same transaction as any write, before any other side effect — a duplicate delivery then fails the insert and exits early rather than reapplying. Make the write itself idempotent regardless (`on conflict (id) do update set stripe_customer_id = excluded.stripe_customer_id` keyed by `user_id`, not a blind `UPDATE`), so an out-of-order redelivery converges to the same end state rather than depending on delivery order.

**Warning signs:**
`stripe_customer_id` reverting to null or to a stale value after a Stripe outage triggers event redelivery; two identical log lines for the same `event.id` in Vercel's function logs.

**Phase to address:**
Stripe-customer-linking phase — decide explicitly there whether the webhook becomes an actor (needs the dedupe table) or stays an audit trail while `api/checkout.js`'s synchronous response is the only writer (simpler, but then the webhook cannot be used to backfill a customer id if the synchronous write ever fails after Stripe already has the money).

---

### Pitfall 5: Direct (non-pooled) Neon connection string exhausts under Vercel's concurrent invocations

**What goes wrong:**
Neon issues two distinct connection strings: a direct one and a pooled one (hostname contains `-pooler`, routes through PgBouncer in transaction mode, supports far higher concurrent client counts). Vercel serverless functions open a connection per invocation rather than sharing a long-lived pool the way a traditional server would. Pointed at the *direct* endpoint, a traffic spike — even a modest one, e.g. several people completing checkout around the same time, or a burst from the `ensureSchema()` memo resetting after a cold-start blip and every warm instance re-running DDL — exhausts the direct endpoint's `max_connections` (small on small Neon compute sizes) and produces `FATAL: sorry, too many clients already`.

**Why it happens:**
The direct connection string is the one that appears first / most prominently in Neon's dashboard and "just works" in local testing at low concurrency, so it is easy to copy into `DATABASE_URL` without knowing the pooled variant exists.

**How to avoid:**
Use the pooled connection string in `DATABASE_URL` for anything hit by request traffic. The draft plan already sidesteps the TCP-pool question entirely by using `@neondatabase/serverless`, which connects over HTTP/WebSockets rather than a persistent TCP connection — confirm during Task 2's provisioning step that whichever connection string ends up in `DATABASE_URL`/`POSTGRES_URL` is compatible with `neon()`'s HTTP mode (Neon's own docs specify which string format that driver expects), not accidentally the direct TCP string meant for `pg` or an ORM.

**Warning signs:**
Intermittent `FATAL: sorry, too many clients already` or `Error: Connection terminated unexpectedly` in Vercel function logs that correlate with traffic bursts rather than a specific code path; the issue disappearing at low traffic and reappearing under load, which makes it easy to dismiss as a fluke during local testing.

**Phase to address:**
OAuth+DB foundation phase (this is a provisioning-step correctness issue, not a later add-on) — verify the connection string in Task 2's checklist explicitly names the pooled/HTTP-compatible endpoint, and add a load-test or at least a "hit `/api/auth/me` N times concurrently" smoke check before calling the phase done.

---

### Pitfall 6: `ensureSchema()` or `upsertUser()` throwing at module scope takes the whole function down with no log detail

**What goes wrong:**
This codebase has already hit this exact class of bug once — the comment in `lib/stripe.js` explains that a module-scope throw (e.g., `new Stripe(missingKey)` at the top of a file) surfaces on Vercel as a bare `FUNCTION_INVOCATION_FAILED` with nothing useful in the logs, because the module fails to load before any handler runs. `lib/db.js`'s `neon(connectionString)` construction has the identical failure shape if it is ever called at module scope instead of lazily.

**Why it happens:**
It is very easy to write `const sql = neon(process.env.DATABASE_URL)` at the top of `lib/db.js` because that is the pattern in almost every Neon quickstart — the lazy-getter pattern the draft plan specifies is a deliberate, non-default deviation from the library's own docs.

**How to avoid:**
Keep the lazy-getter pattern from the draft plan (`getSql()` memoized in a module-level variable, constructed only on first call inside a handler) for every env-var-reading module added this milestone, including any new Stripe-linking helper. Grep for `neon(` and `new Stripe(` outside of a function body as a pre-merge check.

**Warning signs:**
A Vercel function log entry that is just `FUNCTION_INVOCATION_FAILED` with no stack trace or error message; a route that works locally with `vercel dev` (where `.env.local` is always present) but 500s on a fresh deploy before env vars are confirmed set in all three Vercel environments.

**Phase to address:**
OAuth+DB foundation phase — this is already the pattern the draft plan specifies for `lib/db.js`; the pitfall is regressing it in a later phase that adds new modules (e.g., a `lib/customers.js` for Stripe-linking) without carrying the same discipline forward.

---

### Pitfall 7: The new session system silently changes behavior on the *existing* entitlement path by sharing a name, a route, or a helper

**What goes wrong:**
The single most important existing invariant is: `ladidier_member_session` (set by `verify-session.js`, read by `entitlement.js` and `lib/membership.js`) must keep working byte-for-byte for people who already paid. The new session system introduces a same-shaped concept — an httpOnly cookie read on every relevant request — which creates several ways to accidentally couple the two: naming the new cookie something that collides or is confused with the old one, having `api/checkout.js`'s new session-gate check reject a request that the old flow would have allowed (e.g., a returning member with only the old cookie, no new `ladidier_session`, trying to start a *second* subscription), or a shared `Headers`/cookie-parsing helper being "improved" in a way that changes `readCookie`'s behavior for both consumers.

**Why it happens:**
Once both systems exist side by side, every future change (a shared cookie utility, a shared "am I allowed here" check, a refactor that merges "is a member" and "is signed in" into one boolean) reads like natural cleanup — but the milestone's explicit constraint is that these stay two independent systems this cycle.

**How to avoid:**
Treat `api/verify-session.js`, `api/entitlement.js`, `api/webhook.js`, `lib/membership.js`, and `lib/stripe.js` as frozen for the duration of this milestone (the draft plan already states this constraint) and enforce it mechanically: a CI/verification step doing `git diff` against those five paths and failing the phase if any of them changed, exactly as the draft plan's own `<verification>` block already does for its scope. Extend that same check to every later phase in this milestone, not just the OAuth+DB one.

**Warning signs:**
A code review that touches any of the five frozen files "just to add one field"; a regression where an existing paying member (identifiable by having `ladidier_member_session` but no `ladidier_session`) loses access to the digital edition after a deploy.

**Phase to address:**
Every phase in this milestone — this is a standing constraint, not a one-time check. Each phase's own verification step should re-run the "these five files are untouched" diff check.

---

### Pitfall 8: Building and testing account-linking now, while Production is on Stripe test-mode keys, produces `stripe_customer_id` values that will not exist once keys are reverted to live

**What goes wrong:**
`PROJECT.md` records that Production is currently running Stripe **test-mode** keys (swapped in 2026-09-01 for unrelated QA on ÉCLAT Vol. 2 gating) and must be reverted before real purchases can resume. Any account-linking logic exercised against Production right now — a real Google sign-in creating a real `users` row, then linking against Stripe's *test-mode* customer/subscription objects — will write `stripe_customer_id` values shaped like `cus_test...` (or otherwise scoped to the test-mode account) into the new database. Test-mode and live-mode Stripe objects are entirely separate namespaces; a live-mode API key cannot retrieve a test-mode customer id and vice versa. Once keys are reverted to live, every `users` row created or linked during this window holds a `stripe_customer_id` that silently 404s (or, worse, if id spaces ever overlapped, could resolve to an unrelated object) against the live-mode API — leaving real early sign-ups looking like they have no subscription.

**Why it happens:**
The database is brand-new this milestone, so there is no existing "known good" data to compare against — a test-mode customer id looks exactly as valid as a live one to the application and to a developer glancing at the table. The temptation to "just test the full flow on Production since that's where the real users are" is strong precisely because Production is reachable and the test keys make it safe to pay with a test card.

**How to avoid:**
Do all account-linking development and testing against a **Preview** deployment (or local `vercel dev`) with its own explicit Stripe *test*-mode keys, never against Production while Production is mid-swap. Before reverting Production's keys to live, either (a) truncate/flag any `users` rows and `stripe_customer_id` values written during the test-mode window as test data and require affected users to re-link on next login, or (b) if any real person signed in for real during this window, do not silently discard their account — re-run the Stripe lookup/creation logic for them once live keys are back, since their Google identity is real even though the linked Stripe object was not. Add a boolean or timestamp column (e.g., `stripe_mode` or reuse `created_at` against a known revert date) so this population is identifiable later without guessing.

**Warning signs:**
A `stripe_customer_id` value in the `users` table that returns a "No such customer" error from the live-mode API after the revert; support reports of "I signed in and it says I have no subscription" clustered right after the key revert date.

**Phase to address:**
This is a cross-cutting sequencing concern, not a single phase's code fix — flag it explicitly in the roadmap as a dependency: **the Stripe test-mode keys must be reverted to live before the Stripe-customer-linking phase is considered done and verified in Production**, and any linking work done beforehand must be treated as throwaway/local-only until that revert happens.

---

## Moderate Pitfalls

### Pitfall 9: Google Cloud OAuth consent screen left in "Testing" publishing status blocks real customers

**What goes wrong:**
The draft plan's Task 2 sets up the OAuth consent screen as "External" with the developer's own account added under "Test users" — this is required to test sign-in at all while the app is unpublished. If the consent screen is never moved to "In production" publishing status before this ships, only pre-approved test users (capped at 100) can complete sign-in; every other real visitor sees Google's "app hasn't completed verification" / "access blocked" screen instead of the account they were promised.

**Prevention:**
Add "Publish the OAuth consent screen (move out of Testing)" as an explicit, checked step before this milestone's final release checkpoint — not just before the first local test. Since the requested scopes (`openid`, `email`, `profile`) are non-sensitive, publishing does not require Google's manual verification review, but the publish action itself is a manual dashboard step that is easy to forget because sign-in "already works" for the developer's own test account.

---

### Pitfall 10: OAuth redirect URI works on Production and localhost but breaks on every Vercel Preview deployment

**What goes wrong:**
`api/auth/google.js` derives the redirect URI from request headers the same way `api/checkout.js` derives its origin — but Google matches Authorised Redirect URIs by exact string against a fixed allow-list, and Vercel Preview deployments get a fresh hostname per deploy. The draft plan already documents this as an accepted limitation, but it can resurface as a false alarm during later phases if someone tries to demo Google sign-in on a Preview URL and assumes it is broken code rather than an unregistered hostname.

**Prevention:**
Register a stable Preview-testing convention if the team needs to test OAuth on Preview deploys regularly (e.g., a fixed `vercel.app` alias domain reused across Previews, added once to Google's Authorised Redirect URIs), or explicitly scope OAuth testing to Production + `localhost` only and document that constraint so it is not rediscovered as a bug per Preview deploy.

---

### Pitfall 11: Test-mode and live-mode Stripe webhook signing secrets are different — reverting keys without reverting the webhook secret breaks the audit trail silently

**What goes wrong:**
`STRIPE_WEBHOOK_SECRET` is mode-specific: a webhook endpoint configured for test-mode events has a different signing secret than the live-mode endpoint. Reverting `STRIPE_SECRET_KEY` (and the publishable key) back to live without also confirming `STRIPE_WEBHOOK_SECRET` points at the live-mode endpoint's secret causes `stripe.webhooks.constructEventAsync` in `api/webhook.js` to fail signature verification on every real event, returning 400 to Stripe. Stripe retries 5xx for up to three days but does **not** retry on a 400 the same way — a persistent 400 can eventually be treated as a broken endpoint.

**Prevention:**
Treat the Stripe key revert (`PROJECT.md`'s pending action) as a three-variable change, not one: `STRIPE_SECRET_KEY`, the publishable key used client-side, and `STRIPE_WEBHOOK_SECRET` together, verified by watching one real webhook delivery succeed (200) in the Stripe Dashboard's webhook logs immediately after revert.

---

### Pitfall 12: `ensureSchema()` DDL race on the first concurrent cold starts after deploy

**What goes wrong:**
Every cold Vercel instance independently runs `ensureSchema()`'s `create table if not exists` statements on first use per the draft plan's memoization design. `IF NOT EXISTS` makes this safe in the common case, but under Postgres, two truly concurrent `CREATE TABLE IF NOT EXISTS` statements can still race and one can fail with a duplicate-relation error in rare timing windows, especially right after a fresh deploy when many cold starts fire close together.

**Prevention:**
This is already flagged and accepted in the draft plan's own threat model (T-Q8UG-12) as low severity with the memo reset on failure. Keep it accepted rather than "fixing" it with a Postgres advisory lock unless it is actually observed in logs — the fix (an advisory lock around the DDL) is more complexity than the failure mode currently warrants, but note it here so a future report of a one-time deploy-time 500 is not mistaken for a new bug.

---

## Minor Pitfalls

### Pitfall 13: Signed-in state check races the resume-pending-plan effect, causing a double checkout attempt

**What goes wrong:**
The draft plan's Task 5 resume effect fires `startCheckout` as soon as `authReady && user` are both true after a Google redirect. If a slow network causes `/api/auth/me` to resolve twice (e.g., a fast-refresh or a duplicate effect fire during development), or if the user manually reloads mid-flow, `startCheckout` could fire twice before the first Stripe redirect completes.

**Prevention:**
The draft plan already removes the pending-plan key from `sessionStorage` before acting, which prevents a *second visit* from repeating the checkout, but does not fully prevent a same-tick double-fire within one page load. Add a simple in-flight guard (a ref or state flag) around `startCheckout` so a second call while one is already pending is a no-op.

---

### Pitfall 14: Local Node version mismatch breaks `--env-file` loading silently

**What goes wrong:**
`scripts/db-setup.mjs` relies on Node 20's built-in `--env-file` flag rather than a `dotenv` dependency. A contributor on an older Node version gets a flag-not-recognized error, or worse, a version that silently ignores the unknown flag and runs with no env vars loaded, producing a confusing "DATABASE_URL is not set" error that looks like a provisioning failure rather than a local tooling mismatch.

**Prevention:**
Pin/document the required Node version (20+) in `package.json`'s `engines` field so the mismatch surfaces as an install-time warning rather than a runtime mystery.

---

## Technical Debt Patterns

| Shortcut | Immediate Benefit | Long-term Cost | When Acceptable |
|----------|-------------------|-----------------|------------------|
| Hand-rolled OAuth (fetch + Web Crypto, no library) | No new dependency beyond `@neondatabase/serverless`; matches house style (`api/webhook.js` already uses raw `crypto.subtle`) | Every future OAuth edge case (token refresh, offline access, other providers) has to be hand-implemented and hand-audited; no upstream security patches | Acceptable here because scope is intentionally narrow (Google only, `openid email profile`, no refresh tokens, `access_type=online`) — revisit if a second provider or offline access is ever added |
| Skipping ID-token signature verification | Avoids fetching/caching Google's JWKS and doing RS256 verification in Web Crypto | Only safe as long as the token is read from the server-to-server token-exchange response; becomes unsafe the moment any code path accepts an `id_token` from a client-supplied value (e.g., a future "Sign in with Google" JS SDK button that posts a token to the backend) | Acceptable only for the current server-driven redirect flow; never acceptable if a client-side credential/One Tap flow is added later without adding signature verification back |
| Webhook stays log-only through this milestone | No dedupe/idempotency infrastructure needed yet | Any future phase that makes the webhook an actor (e.g., using it to backfill `stripe_customer_id`) inherits an untested code path with no existing dedupe table | Acceptable while entitlement remains Stripe-checked-live and no side effect depends on the webhook; must be revisited the moment the webhook is asked to *write* anything |
| Deferring pre-login-subscriber migration | Keeps this milestone scoped to new sign-ins only | Two populations (pre-login cookie-only members, new account-based members) coexist indefinitely with different capabilities (no cross-device access for the first group) until a claim-by-email flow ships | Acceptable per the explicit Key Decision in `PROJECT.md`; becomes a real cost if the claim flow is deferred indefinitely rather than scheduled |

## Integration Gotchas

| Integration | Common Mistake | Correct Approach |
|-------------|-----------------|-------------------|
| Google OAuth | Trusting `email_verified` at login but re-trusting the same email for a separate, more sensitive linking decision without re-checking it there | Check `email_verified === true` at both the login boundary and independently at any point where an email is used to attach an existing Stripe customer or existing account record |
| Stripe Checkout | Passing `customer_email` expecting it to dedupe against an existing Customer | Look up an existing `stripe_customer_id` on the user record (or search Stripe explicitly) and pass `customer`, not `customer_email`, when one exists |
| Stripe webhooks | Assuming `checkout.session.completed` arrives before, or exactly once relative to, a synchronous write done in `api/checkout.js`'s own response | Design any webhook-driven write to converge regardless of order/duplication: idempotent upserts keyed by a stable id, plus an `event.id` dedupe table if the webhook does more than log |
| Neon / Vercel Postgres | Using the direct (non-pooled) connection string because it is the first one shown in the dashboard | Confirm which connection string `@neondatabase/serverless`'s `neon()` expects (HTTP-mode string) during provisioning, and never point a TCP-based driver at the direct endpoint under production traffic |
| Vercel Preview deployments | Assuming OAuth "just works" on every deploy URL the way the rest of the app does | Register a fixed Preview alias if Preview-based OAuth testing is needed, or explicitly restrict OAuth testing to Production + localhost |

## Performance Traps

| Trap | Symptoms | Prevention | When It Breaks |
|------|----------|------------|-----------------|
| `ensureSchema()` DDL round trip on every cold instance | Slightly higher p99 latency on the first request to a cold `/api/auth/*` or `/api/address` instance | Accept as-is (already the draft plan's documented tradeoff) unless cold-start volume grows enough to matter | Noticeable only at very high deploy/cold-start frequency; not a concern at current traffic |
| Google token-exchange + userinfo round trip inside `api/auth/callback.js` | The callback route is slower than a typical API route because it makes an outbound HTTPS call to `oauth2.googleapis.com` before responding | Nothing to change now — this is inherent to the redirect-flow OAuth pattern; just be aware it is the slowest route in the new set | Would only matter if Vercel's function timeout were tight enough to clip a slow Google response, which is unlikely at current timeout defaults |
| In-memory `Map` caches (`entitlementCache` in `lib/membership.js`, `priceCache` in `api/checkout.js`) don't share across concurrent/parallel invocations | Cache "misses" more than expected under bursty concurrent traffic because each warm instance has its own Map | Already an accepted, documented tradeoff for the existing code; if a similar cache is added for the new session/user lookups, document the same limitation rather than assuming it behaves like a shared cache | Becomes a real correctness issue only if a future cache is used for something more sensitive than reducing a Stripe API call count (e.g., anything security-relevant) |

## Security Mistakes

| Mistake | Risk | Prevention |
|---------|------|------------|
| Auto-linking a Stripe customer to a Google account by email match alone | Account/billing takeover — an attacker's Google account gets attached to someone else's subscription and payment history | Require `email_verified === true` at the linking step specifically, and treat linking an *existing* customer as a sensitive action separate from creating a new one |
| No `UNIQUE` constraint on `users.stripe_customer_id` | Two accounts can end up pointing at the same Stripe customer, or one account's link can be silently overwritten by a race | Add the constraint in the same migration that adds the column; let the database, not application logic, be the source of truth for uniqueness |
| Treating the OAuth `state` parameter as CSRF-proof on its own, without binding it to the specific browser/session that started the flow | Login-CSRF: an attacker starts their own OAuth flow, obtains a valid `code`, and tricks a victim's browser into completing the callback with the attacker's code, linking the attacker's identity into the victim's session | The draft plan already binds `state` to an httpOnly cookie set on the same response that starts the flow (not just a bare random value compared against nothing) — preserve this; do not "simplify" state validation to a stateless signed value with no cookie tie in a later refactor |
| Writing `stripe_customer_id` values sourced from Stripe test-mode while Production is mid key-swap | Live-mode lookups against test-mode ids fail after the revert, and in the worst case a developer "fixes" this by loosening validation instead of re-linking, widening the account-linking attack surface | Do all linking development against a non-Production environment with its own test keys; treat any Production data written during the test-mode window as suspect and explicitly reconciled after revert |

## UX Pitfalls

| Pitfall | User Impact | Better Approach |
|---------|-------------|-------------------|
| A pre-login member signs in with Google (for the first time, under this milestone) and the new account shows no subscription, because linking wasn't in scope or failed | Feels broken — "I paid, why does my account say I have nothing?" — even though the old cookie flow still grants them access separately | Communicate honestly in the UI: if the account system can't yet see a pre-login purchase, say so explicitly ("Your existing membership isn't linked yet — you're still covered on this browser") rather than presenting an empty billing panel as if nothing was ever purchased |
| Losing the originally-selected plan/interval across the Google redirect | User picks "Hard Copy, yearly," is sent to sign in, and returns to a default/blank selection | Already solved in the draft plan via `sessionStorage`-held pending-plan intent and a resume effect — preserve this pattern in later phases that add more steps (e.g., inserting the address form) rather than reverting to an unconditional redirect to Stripe |
| Double-uncertainty during the Stripe test-mode window: a user who somehow completes a "purchase" right now gets no real product and no clear signal it wasn't real | Confusion/support burden if any real visitor reaches Checkout while Production is on test keys | Treat reverting to live keys as a released blocker before broadly announcing or driving traffic to any new sign-up flow tied to Stripe |

## "Looks Done But Isn't" Checklist

- [ ] **Google sign-in "works":** Often only tested with a single developer test-user account — verify a second, previously-unseen Google account can sign in cleanly, and that the consent screen's publishing status (not just "Testing") is checked before relying on this for real traffic.
- [ ] **Stripe customer linking "works":** Often only tested for a brand-new signup with no prior purchase — verify explicitly against an email that already has a pre-login Stripe customer/subscription from before this milestone, and confirm no duplicate customer is created.
- [ ] **Session system "added":** Often verified only by testing the new flow in isolation — verify the old `ladidier_member_session` cookie path still unlocks the digital edition end-to-end, unmodified, on the same deploy.
- [ ] **Database "connected":** Often verified only by `db:setup` succeeding once at low concurrency — verify with several concurrent requests (even a simple `for i in 1..20 & curl /api/auth/me` loop) that no connection-exhaustion error appears.
- [ ] **"Ready for Production":** Often verified only while Stripe is in test-mode keys — verify the full account-linking path again after the live-key revert, since test-mode and live-mode Stripe objects do not carry over.
- [ ] **Webhook signature verification "works":** Often verified only against whichever mode's webhook secret happens to be configured at test time — verify the live-mode secret specifically is in place before or immediately after the key revert.

## Recovery Strategies

| Pitfall | Recovery Cost | Recovery Steps |
|---------|----------------|------------------|
| Duplicate Stripe customers created for one person | MEDIUM | Identify the canonical customer (the one with the real subscription/payment history), update `users.stripe_customer_id` to point at it, and either delete or clearly mark the orphaned duplicate customer in Stripe's Dashboard; add the missing `UNIQUE` constraint so it cannot recur |
| Connection-pool exhaustion incident | LOW | Swap `DATABASE_URL` to the pooled/HTTP-compatible connection string, redeploy — no data loss, just a config fix |
| `stripe_customer_id` values written against test-mode data before the live-key revert | MEDIUM | Flag affected `users` rows (by creation timestamp before the revert date), clear their `stripe_customer_id`, and re-run the linking/creation logic once live keys are active; notify any real person who signed in during the window rather than silently discarding their account |
| Webhook signature verification breaks after key revert (wrong `STRIPE_WEBHOOK_SECRET`) | LOW | Update the env var to the live-mode endpoint's signing secret in the Stripe Dashboard, redeploy — Stripe retries recent failed deliveries |
| Old entitlement flow regressed by a shared-file change | HIGH | Revert the offending change to `api/verify-session.js` / `api/entitlement.js` / `api/webhook.js` / `lib/membership.js` / `lib/stripe.js` specifically (these are meant to be frozen this milestone); re-verify existing members regain access before re-attempting the change in a way that does not touch those files |

## Pitfall-to-Phase Mapping

| Pitfall | Prevention Phase | Verification |
|---------|--------------------|----------------|
| Pitfall 1 — duplicate customer via `customer_email` | Stripe-customer-linking phase | Sign in with a Google email that already has a pre-login Stripe customer; confirm exactly one Customer object exists in Stripe afterward |
| Pitfall 2 — email-based auto-link takeover risk | Stripe-customer-linking phase | Design review confirms linking to an *existing* customer requires `email_verified` plus an explicit, documented decision (deferred migration vs. confirmed claim step) — not silent auto-attach |
| Pitfall 3 — concurrent-checkout duplicate customers | Stripe-customer-linking phase (schema step) | `users.stripe_customer_id` has a `UNIQUE` constraint from the migration that introduces it; a scripted double-fire of checkout for one user produces one customer |
| Pitfall 4 — webhook dedupe if it becomes an actor | Stripe-customer-linking phase | If the webhook is upgraded from log-only, a `processed_webhook_events` table with a `UNIQUE`/primary key on `event.id` exists and is checked before any write |
| Pitfall 5 — connection exhaustion | OAuth+DB foundation phase | A concurrent-request smoke test against `/api/auth/me` or `/api/address` produces no connection errors before the phase is marked done |
| Pitfall 6 — module-scope throw pattern | OAuth+DB foundation phase | Grep check for `neon(`/`new Stripe(` outside function bodies across `lib/` and `api/` |
| Pitfall 7 — frozen-files regression | Every phase this milestone | `git diff` against the five frozen files is empty at the end of every phase's verification step |
| Pitfall 8 — test-mode-key contamination of linking data | Cross-cutting; gate the Stripe-customer-linking phase's "done" state on the live-key revert | Before marking that phase complete in Production, confirm `STRIPE_SECRET_KEY` is live-mode and no `users` row holds a customer id created during the test-mode window without being reconciled |
| Pitfall 9 — OAuth consent screen stuck in Testing | Final release checkpoint of the OAuth+DB foundation phase (or a dedicated pre-launch phase) | Consent screen publishing status is "In production" before the milestone is announced to real users |
| Pitfall 11 — mismatched webhook secret after key revert | Cross-cutting, tied to the key-revert action itself | One real webhook delivery shows 200 in Stripe's Dashboard logs immediately after revert |

## Sources

- [Verify the Google ID token on your server side — Google for Developers](https://developers.google.com/identity/gsi/web/guides/verify-google-id-token) — confidence: MEDIUM (websearch, cross-checked against Google's own backend-auth docs)
- [Authenticate with a backend server — Google for Developers](https://developers.google.com/identity/sign-in/web/backend-auth)
- [Verifying the User Info — OAuth 2.0 Simplified (oauth.com)](https://www.oauth.com/oauth2-servers/signing-in-with-google/verifying-the-user-info/)
- [Prevent customer creation race conditions · Issue #476 · stripe/stripe-node (GitHub)](https://github.com/stripe/stripe-node/issues/476) — confidence: MEDIUM (confirms the duplicate-customer race is an acknowledged, unresolved API gap)
- [Three Idempotency Patterns for Stripe Webhooks to Prevent Double Billing](https://zenn.dev/kg_filled/articles/9cc7c0c1d85bf1?locale=en)
- [Stripe Webhooks: Solving Race Conditions and Building a Reliable Handler](https://www.pedroalonso.net/blog/stripe-webhooks-solving-race-conditions/)
- [Connecting to Neon from Vercel — Neon Docs](https://neon.com/docs/guides/vercel-connection-methods) — confidence: MEDIUM (websearch of official Neon docs, cross-checked against the Neon serverless driver docs)
- [Neon serverless driver — Neon Docs](https://neon.com/docs/serverless/serverless-driver)
- [Neon on Vercel: The Connection Pooling Maze — EdgeCases](https://www.edge-cases.com/nextjs/neon-vercel-connection-pooling)
- [1 Click, Zero Permission: How a Small OAuth Mistake Leads to Total Account Takeover part 2 — Snyk Labs](https://labs.snyk.io/resources/OAuth-mistake-takeover-part-two/) — confidence: MEDIUM (real-world state-parameter CSRF case study)
- [OAuth 2.0 authentication vulnerabilities — PortSwigger Web Security Academy](https://portswigger.net/web-security/oauth)
- Codebase evidence (HIGH confidence, read directly): `C:/Users/Aliyan Khan/Documents/Ladidier/.planning/PROJECT.md`, `.planning/quick/260831-8ug-user-should-login-before-subscription-al/260831-8ug-PLAN.md`, `api/entitlement.js`, `api/webhook.js`, `lib/membership.js`, `lib/stripe.js`, `api/checkout.js`

---
*Pitfalls research for: adding Google OAuth + Postgres + Stripe-customer linking to an existing live-payments site*
*Researched: 2026-09-01*
