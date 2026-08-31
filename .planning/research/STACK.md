# Stack Research

**Domain:** Adding Google OAuth login + persistent user database to a zero-build, serverless-functions-only Vercel app (with existing Stripe Checkout)
**Researched:** 2026-09-01
**Confidence:** MEDIUM (npm registry checked directly for versions/deprecation status — HIGH; broader ecosystem/best-practice claims cross-checked across multiple independent sources but not Context7/library-doc verified — MEDIUM)

## Verdict on the 2026-08-31 draft plan

The draft plan at `.planning/quick/260831-8ug-.../260831-8ug-PLAN.md` is **still current and should be treated as validated, not stale**. Every one of its five technical decisions holds up against research made today (2026-09-01):

| Decision in the draft plan | Status |
|---|---|
| `@neondatabase/serverless` (not `@vercel/postgres`) | **Confirmed correct.** `@vercel/postgres` is deprecated on npm today; its own deprecation notice literally points at Neon's SDKs. |
| Hand-rolled Google OAuth with `fetch`, no library | **Confirmed reasonable** — see below, with one nuance worth calling out explicitly. |
| HMAC-signed httpOnly cookie via `crypto.subtle` | **Confirmed current best practice** for this runtime; no change needed. |
| `stripe_customer_id` stored on the user row (not looked up by email at request time) | **Confirmed as Stripe's own recommended pattern.** |
| Lazy env-var reads inside handlers, never module scope | Not a research question — this is your own established house convention (matches `lib/stripe.js`) and remains correct. |

The one thing NOT in the draft plan that's worth adding to it: **flag the Node.js runtime version** before this work ships (see Vercel gotchas below) — this is new information as of September 2026, not something the 2026-08-31 plan could have known.

## Recommended Stack

### Core Technologies (new additions only)

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| `@neondatabase/serverless` | `1.1.0` (current, verified via `npm view`) | Postgres client for `lib/db.js` | The only non-deprecated path to Postgres from a Vercel serverless function today. MIT, zero runtime dependencies, official Neon package, and the exact one Neon's/Vercel's own migration guides point at now that `@vercel/postgres` (last version `0.10.0`) carries an npm deprecation notice telling installers to move to it. |
| Google OAuth 2.0 authorization-code flow via `fetch` (no package) | n/a — built on Node's global `fetch` | Login | Hand-rolling three `fetch` calls (redirect to `accounts.google.com`, POST to `oauth2.googleapis.com/token`, decode the returned `id_token`) is well inside "reasonable and secure" for this specific flow — see the dedicated section below for why the usual "never hand-roll OAuth" warning doesn't fully apply here. |
| Web Crypto (`crypto.subtle`, global) | n/a — built into Node runtime | Session cookie HMAC signing/verification | `globalThis.crypto.subtle` is stable in every Node.js version Vercel currently runs (20/22/24). It's already this codebase's house style (`api/webhook.js`'s `constructEventAsync` uses the same primitive family for Stripe's own signature verification), so this is consistency, not a new pattern. |

### Supporting Libraries — none needed

No new package is needed beyond `@neondatabase/serverless`. Specifically:
- **No JWT/JOSE library** for verifying the Google `id_token` — see rationale below.
- **No auth framework** (NextAuth/Auth.js, Lucia, etc.) — these assume a framework-shaped app (Next.js API routes, a router, middleware chain) that this project deliberately doesn't have. Bolting one onto four standalone web-handler files would fight the zero-dependency, zero-framework house style rather than serve it.
- **No dotenv** — Node 20+'s built-in `--env-file` flag (already used by the draft plan's `scripts/db-setup.mjs`) covers local env loading without a dependency.

### Development Tools

| Tool | Purpose | Notes |
|------|---------|-------|
| `vercel dev` | Local serving of `/api/*` routes | Required — `vite`'s dev server does not proxy to `api/`, so OAuth callback and DB routes must be hand-tested through `vercel dev`, not `npm run dev`. Already noted correctly in the draft plan. |
| `vercel env pull .env.local` | Sync Postgres connection string + OAuth secrets locally | Confirm which name Vercel actually injects (`DATABASE_URL`, `POSTGRES_URL`, or both) after provisioning — this varies by how the Neon integration is installed. |

## Installation

```bash
# Core (the only new package)
npm install @neondatabase/serverless

# Nothing else — Google OAuth uses global fetch, session signing uses global crypto.subtle
```

## Answers to the Five Specific Questions

### 1. Is `@neondatabase/serverless` + Vercel's Neon integration still current in 2026?

**Yes, unchanged and confirmed.** `npm view @vercel/postgres deprecated` returns an explicit deprecation notice: *"choose an alternate storage solution from the Vercel Marketplace... migrate to Neon's SDKs."* `@neondatabase/serverless` is at `1.1.0`, MIT licensed, zero runtime dependencies, actively published by the official Neon org — the same package the draft plan already switched to.

One small, non-blocking UI change since the draft plan was written: Vercel's own docs now describe provisioning as going through **Vercel Marketplace → the Neon integration → Install**, rather than the plan's phrasing of "Storage tab → Create Database → Postgres." In practice the Storage tab still routes there, so Task 2's dashboard instructions in the draft plan will still work, but if the exact button labels don't match, that's why — not a sign anything is broken.

### 2. Is hand-rolling Google OAuth with `fetch` still reasonable, or is there a lightweight library worth adding?

**Reasonable, with an important nuance the draft plan already got right.** Google's own documentation is often quoted as "never hand-roll ID token verification — use a client library," and blanket web advice repeats that. But that blanket advice is about tokens arriving over an **untrusted channel** (e.g., handed to your server by client-side JS after a browser redirect). This project's flow is different: the `id_token` is fetched by *your server*, directly, from `oauth2.googleapis.com/token`, over TLS, authenticated with your `client_secret` in a server-to-server POST. Google's own backend-auth documentation states exactly this exception: when you obtain the ID token this way, you already know it came from Google, and it's acceptable to decode it without a JWKS signature check — the network trust boundary is doing that job instead.

That means for *this specific flow*, no JWT library is needed to reduce risk — decoding the payload is a two-line base64url split, which is what the draft plan already does, plus its own manual claim checks (`aud`, `iss`, `exp`, `email_verified`). Those claim checks are the part that actually matters and the draft plan already has them.

If you ever change the flow to accept an ID token from the *browser* directly (e.g., Google Identity Services' one-tap/button flow posting a token to your server instead of a full redirect), that would cross back into the "must verify signature via JWKS" case — at that point, `jose` (npm, zero runtime dependencies, tree-shakeable, actively maintained) would be the lightweight addition worth making, in preference to `google-auth-library` (which pulls in `gaxios` and other Google Cloud-shaped dependencies this project doesn't otherwise need). Not needed now — noted for if the login method ever changes.

### 3. Best-practice way to store/verify HMAC-signed session cookies with Web Crypto on Vercel?

The draft plan's design is current best practice, unchanged:
- `crypto.subtle.importKey('raw', ..., { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'])` built lazily from `SESSION_SECRET`, mirroring `getStripe()`'s lazy-construction pattern.
- Cookie value as `base64url(payload) + '.' + base64url(hmac)`.
- Verification recomputes the HMAC and compares in **constant time** (accumulate an XOR/difference over every byte, compare once at the end) rather than a short-circuiting `===`, which is the standard mitigation for timing side-channels on a MAC comparison.
- `HttpOnly; Secure; SameSite=Lax` — Lax, not Strict, specifically because the OAuth return trip from `accounts.google.com` arrives as a cross-site top-level GET, which `SameSite=Strict` would drop the state cookie on.

No changes needed here; this is exactly the shape a hand-rolled signed-cookie session takes across every current reference for Vercel/Workers/Node Web Crypto usage, and it already matches this codebase's own `constructEventAsync` precedent in `api/webhook.js`.

### 4. How should `users` link to Stripe — create-or-lookup-by-email?

**Store `stripe_customer_id` on the user row; do not look up by email at request time.** This matches Stripe's own stated guidance, not just a convention: Stripe does **not** enforce email uniqueness across customers, so relying on `customers.list({ email })` or the Customer Search API as your source of truth for "does this person already have a Stripe customer" is explicitly discouraged by Stripe — two different real customers, or the same person checking out twice before your DB write lands, can produce ambiguous or duplicate matches. Stripe's documented recommendation is to keep your own mapping of identity → `stripe_customer_id`.

Concretely, for this project:
- Add a nullable `stripe_customer_id text` column to `users`.
- On first checkout attempt (not first login — a signed-in user who never buys shouldn't need a Stripe customer at all), if the user row has no `stripe_customer_id`, create one with `stripe.customers.create({ email, metadata: { user_id } }, { idempotencyKey: ... })` and persist the returned id back onto the user row before creating the Checkout Session. Use an **idempotency key** (Stripe's own mechanism, already available on the `stripe` package already installed) derived from something stable like the user's id, so a retried request from a flaky connection can't create a second Stripe customer for the same person.
- Pass that `customer` id into `stripe.checkout.sessions.create({ customer: stripe_customer_id, ... })` instead of (or alongside) `customer_email`, so the resulting subscription is attached to a durable customer record you can look up again later for the billing-management part of the account page (Stripe Billing Portal, or listing invoices/subscriptions by customer id) — this is what makes "membership follows the account across devices" actually work, versus the existing per-Checkout-Session cookie approach.
- This is purely additive to the existing Stripe integration; nothing in `lib/stripe.js`, `lib/membership.js`, or the webhook needs to change for this milestone's scope (account page billing management is a read against the stored customer id, and the existing entitlement path can remain untouched, exactly as the draft plan's constraints already require).

### 5. Vercel-specific gotchas for Postgres connection pooling?

**The connection-pooling concern mostly doesn't apply to the driver this project uses — but there is one live gotcha unrelated to pooling that needs attention before this ships.**

- `neon(connectionString)` — the HTTP-mode client this draft plan's `lib/db.js` design already uses via the tagged template — issues each query as a **stateless HTTPS fetch**, not a persistent TCP connection. There is no connection pool to exhaust, no cold-start connection-setup penalty to worry about, and no "too many connections" failure mode from concurrent serverless invocations, because there's nothing being held open between them. This is exactly the right driver mode for this app's one-query-per-request pattern, and no additional pooling configuration (PgBouncer, `-pooler` connection string, `@vercel/functions`' `attachDatabasePool`) is needed or beneficial here.
- The pooling machinery that *does* come up in Vercel+Postgres research (PgBouncer via `pg`/`node-postgres`, `attachDatabasePool`) is for the TCP driver path, which is the *other* way to talk to Neon/Postgres from Vercel — not applicable unless this project later needs interactive multi-statement transactions or long-lived connections, at which point `Pool`/`Client` over WebSockets (still from `@neondatabase/serverless`) is the documented next step, not a different package.
- One real limit worth knowing: the HTTP driver caps request/response size at 64 MB — irrelevant at this project's scale (small identity/address rows) but worth knowing if a future migration script ever bulk-inserts.
- If a single request ever needs more than one write to be atomic (e.g., inserting a user row and an address row together), reach for `sql.transaction()` — the HTTP client's built-in non-interactive batched-transaction helper — rather than switching drivers.
- **The actual gotcha to flag for this milestone:** Vercel is deprecating **Node.js 20** for Builds and Functions on **October 1, 2026** — one month from today. This project's `package.json` has no `engines` field pinning a Node version, meaning it's running on whatever the Vercel project's dashboard setting currently specifies. Before or alongside this milestone's work, confirm the Vercel project's Node.js version is set to 22 or later (Project Settings → General → Node.js Version) — this isn't specific to the OAuth/DB work, but landing new serverless routes is a natural moment to check it, since a function that starts failing to deploy in early October would look exactly like a self-inflicted regression from this milestone's code if not checked now.

## Alternatives Considered

| Recommended | Alternative | When to Use Alternative |
|-------------|-------------|--------------------------|
| `@neondatabase/serverless` (`neon()` HTTP mode) | `@neondatabase/serverless` `Pool`/`Client` (WebSocket mode) | Only if this project later needs interactive, multi-round-trip transactions across several dependent statements — not needed for the users/addresses schema in the draft plan. |
| `@neondatabase/serverless` | `@neondatabase/vercel-postgres-compat` | Only relevant if migrating an *existing* codebase that already imports `import { sql } from '@vercel/postgres'` and wants a drop-in shim rather than a rewrite. This project has no existing Postgres code at all, so there's nothing to shim — go straight to the real package, as the draft plan already does. |
| Hand-rolled OAuth + manual claim checks | `jose` for full JWKS signature verification | If the login method ever changes to accept an ID token handed to the server by browser-side JS (rather than fetched server-to-server from Google's token endpoint), signature verification becomes mandatory and `jose` is the right lightweight addition at that point. |
| Hand-rolled OAuth | Auth.js / NextAuth, Lucia, Clerk, etc. | If this project ever adopts a framework (Next.js, etc.) or needs more than one login provider — a full auth library earns its dependency weight once there's more than one provider's worth of OAuth-flow edge cases to maintain. For "Google only, forever" on four static handler files, it's more machinery than the problem needs. |
| `stripe_customer_id` stored on user row | Stripe Customer Search API (`customers.search`) at request time | Never as the source of truth for this project — Stripe explicitly warns Search is eventually consistent (can lag up to ~an hour during incidents) and unsuitable for read-after-write flows like "did we just create this customer." |

## What NOT to Use

| Avoid | Why | Use Instead |
|-------|-----|--------------|
| `@vercel/postgres` | Deprecated on npm as of its own package metadata; Vercel's white-labeled Postgres storage was retired in favor of the Neon Marketplace integration. New installs will start from a dead end. | `@neondatabase/serverless` |
| `google-auth-library` | Full Google API client SDK — pulls in `gaxios` and other Google Cloud-shaped dependencies for a feature this project can get from three `fetch` calls. Overkill for "verify one ID token." | Nothing (hand-rolled `fetch`), or `jose` if signature verification ever becomes necessary |
| `jsonwebtoken` (the older, CommonJS, `Buffer`-oriented JWT library) | Not needed at all for this milestone (no signature verification is being done), and if it ever is needed, `jose` is the actively-recommended modern successor built on Web Crypto, which is already this project's cryptography primitive of choice. | `jose`, only if the login flow changes to require JWKS verification |
| Looking up Stripe customers by email at checkout time | Stripe does not enforce email uniqueness; two customers can share an email, and Search/List-by-email is eventually consistent — not safe for "does this user already have a customer" logic. | Store `stripe_customer_id` on the `users` row; create once with an idempotency key |
| A full auth framework (NextAuth/Auth.js/Lucia) | Assumes a router/middleware-chain shape this project's four standalone `export async function GET/POST` handlers don't have; would be more surface area to maintain than the one-provider flow it replaces. | Hand-rolled OAuth, as already planned |

## Stack Patterns by Variant

**If this milestone's login flow ever grows to accept a client-side Google Identity Services token (not just the server-to-server redirect flow):**
- Add `jose` and verify the ID token's signature against Google's JWKS (`https://www.googleapis.com/oauth2/v3/certs`).
- Because a token arriving via browser JS is no longer covered by Google's "received directly from the token endpoint" exemption — it's back to an untrusted channel.

**If a future feature needs multi-statement atomic writes (e.g., creating a user and an address transactionally):**
- Use `sql.transaction([...])` from `@neondatabase/serverless`'s HTTP client rather than switching to `Pool`/WebSocket mode.
- Because the HTTP client already supports non-interactive batched transactions, and switching drivers would add connection-lifecycle management (`pool.end()`) this app doesn't otherwise need.

## Version Compatibility

| Package A | Compatible With | Notes |
|-----------|------------------|-------|
| `@neondatabase/serverless@1.1.0` | Node.js 20/22/24 (Vercel Node runtime), `"type": "module"` (already set in this project's `package.json`) | No known incompatibilities; ships ESM, matches this project's existing module type. |
| `crypto.subtle` (global) | Node.js 20/22/24 | Stable; no polyfill needed on any Node version Vercel currently supports. |
| `stripe@22.6.0` (already installed) | `idempotencyKey` option on `customers.create` | No version bump needed — idempotency keys are a long-standing feature of the Stripe Node SDK already in use. |

## Sources

- `npm view @neondatabase/serverless version / dependencies / license` — direct npm registry query, confirms `1.1.0`, MIT, zero dependencies (HIGH confidence, primary source)
- `npm view @vercel/postgres deprecated` — direct npm registry query, confirms deprecation notice text verbatim (HIGH confidence, primary source)
- Neon docs, "Migrate from Vercel Postgres SDK to the Neon serverless driver" (neon.com/guides/vercel-sdk-migration) and "Vercel Postgres Transition Guide" (neon.com/docs/guides/vercel-postgres-transition-guide) — cross-checked against the npm deprecation notice (MEDIUM confidence)
- Neon docs, serverless driver reference (neon.com/docs/serverless/serverless-driver) — confirms HTTP-mode has no persistent connections / no pooling requirement, `transaction()` for batched writes, 64MB request cap (MEDIUM confidence)
- Google Identity docs, "Authenticate with a backend server" (developers.google.com/identity/sign-in/web/backend-auth) — source for the token-endpoint signature-verification exemption (MEDIUM confidence, cross-checked across two searches with consistent wording)
- Google Identity docs, "Verify the Google ID token on your server side" (developers.google.com/identity/gsi/web/guides/verify-google-id-token) — general JWKS-verification guidance, used as the contrast case (MEDIUM confidence)
- `jose` npm package page and GitHub (panva/jose) — zero-dependency, Web-Crypto-based JWT library, cited as the fallback option (MEDIUM confidence)
- Stripe community discussion + Stripe idempotency documentation (stripe.com/blog/idempotency, docs.stripe.com/api/idempotent_requests) — source for "Stripe does not enforce email uniqueness, maintain your own mapping" guidance (MEDIUM confidence, Stripe's own words quoted from search results)
- Vercel changelog, "Node.js 20 is being deprecated" (vercel.com/changelog/node-js-20-is-being-deprecated) — Oct 1, 2026 deprecation date (MEDIUM confidence, time-sensitive — verify directly in Vercel dashboard before shipping)
- Vercel Marketplace / Neon integration docs (vercel.com/docs/marketplace-storage, vercel.com/marketplace/neon) — current provisioning flow terminology (MEDIUM confidence)

---
*Stack research for: Google OAuth + persistent user DB + Stripe-customer linking, added to an existing zero-build React CDN + Vercel serverless-functions app*
*Researched: 2026-09-01*
