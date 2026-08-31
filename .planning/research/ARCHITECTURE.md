# Architecture Research

**Domain:** Adding Google OAuth + Postgres accounts, with Stripe-customer linking, to an existing Stripe-only serverless (Vercel) app
**Researched:** 2026-09-01
**Confidence:** HIGH — based directly on reading the live codebase (`api/entitlement.js`, `lib/membership.js`, `lib/stripe.js`, `api/checkout.js`, `api/verify-session.js`, `api/webhook.js`, `src/app.jsx`, `src/pages.jsx`, `src/components.jsx`, `package.json`, `index.html`) and the existing unexecuted draft plan `.planning/quick/260831-8ug-.../260831-8ug-PLAN.md`, not on general web research. This is a codebase-specific integration design, not an ecosystem survey.

## Standard Architecture

### System Overview

```
┌────────────────────────────────────────────────────────────────────────┐
│                         BROWSER (React 18, no build-tool                │
│                         constraint violated already: Vite bundles it)   │
├────────────────────────────────────────────────────────────────────────┤
│  src/app.jsx (hash router)                                              │
│    ├─ isMember  (legacy, per-browser)   ──┐                             │
│    ├─ user / authReady  (NEW, per-account)─┤─► OR'd into effective      │
│    └─ route switch → pages.jsx             │    "can see digital issue" │
├────────────────────────────────────────────────────────────────────────┤
│                    VERCEL SERVERLESS FUNCTIONS (api/)                   │
│                                                                          │
│  LEGACY LANE (untouched, byte-for-byte)   NEW LANE (this milestone)     │
│  ┌───────────────────────────────┐        ┌──────────────────────────┐ │
│  │ api/checkout.js*    (MODIFIED)│        │ api/auth/google.js       │ │
│  │ api/verify-session.js         │        │ api/auth/callback.js     │ │
│  │ api/entitlement.js            │        │ api/auth/me.js           │ │
│  │ api/webhook.js                │        │ api/auth/logout.js       │ │
│  │ api/prices.js                 │        │ api/address.js           │ │
│  └───────────────┬───────────────┘        │ api/account/status.js   │ │
│                  │                        │ api/account/portal.js   │ │
│                  │                        └────────────┬─────────────┘ │
├──────────────────┼─────────────────────────────────────┼───────────────┤
│                  ▼                                      ▼               │
│  lib/membership.js (untouched)          lib/session.js (new)            │
│  lib/stripe.js (untouched, SHARED) ◄────┴── lib/account.js (new)        │
│                  │                              │                       │
│                  │                       lib/db.js (new)                │
├──────────────────┼──────────────────────────────┼───────────────────────┤
│                  ▼                              ▼                       │
│             Stripe API                   Neon/Postgres (via             │
│      (checkout.sessions,                 @neondatabase/serverless)      │
│       customers, subscriptions,                 │                      │
│       billingPortal)                     Google OAuth (accounts.google) │
└──────────────────────────────────────────────────────────────────────────┘
```

*`api/checkout.js` is the one legacy file that must be touched — both by the old draft plan (login gate, hardcopy address) and by this milestone (customer creation/linking). Everything else in the legacy lane stays byte-for-byte.

### Component Responsibilities

| Component | Responsibility | Status this milestone |
|-----------|----------------|------------------------|
| `lib/stripe.js` | Lazy singleton Stripe client | Untouched — reused (imported) by every new Stripe-touching module |
| `lib/membership.js` | Cookie name, `ACTIVE_STATUSES` set, `readCookie`, per-browser entitlement cache | Untouched — `ACTIVE_STATUSES` is imported/reused, not re-declared, by the new account-status endpoint |
| `api/entitlement.js` | Per-browser (cookie) "is this Checkout Session's subscription active" | Untouched, no new logic added |
| `api/verify-session.js` | Confirms a just-completed Checkout Session, sets `ladidier_member_session` | Untouched |
| `api/webhook.js` | Signature-verified audit log of Stripe events | Untouched |
| `api/checkout.js` | Creates a Checkout Session | Modified (already scheduled by the draft plan for the login gate + hardcopy address gate); this milestone adds one more responsibility: find-or-create the caller's Stripe Customer and pass `customer:` into `sessions.create` |
| `lib/db.js` (new) | Owns the Postgres schema and every parameterised query — the draft plan's own convention ("the only place that knows the schema") | New — extend with one additive column and two new query functions |
| `lib/session.js` (new) | HMAC-signed httpOnly session cookie (`ladidier_session`) and OAuth state cookie | New, as drafted |
| `lib/account.js` (new) | Orchestrates `lib/db.js` + `lib/stripe.js` to answer "what is this signed-in user's Stripe customer id, and is it active" — the seam that keeps Stripe-customer logic out of `lib/db.js` (pure SQL) and out of `api/checkout.js` (route handler) | New — this milestone's addition, not in the draft plan |
| `api/auth/google.js`, `api/auth/callback.js`, `api/auth/me.js`, `api/auth/logout.js` | Google OAuth 2.0 flow, session issuance | New, as drafted — unchanged by this milestone |
| `api/address.js` | In-app Hard Copy delivery address, keyed to the signed-in user | New, as drafted — unchanged by this milestone |
| `api/account/status.js` (new) | Given a session, return profile + live Stripe membership status for that **account** (not that browser) | New — this milestone |
| `api/account/portal.js` (new) | Given a session, mint a Stripe Billing Portal URL for that account's customer | New — this milestone |

## Recommended Project Structure

```
api/
├── auth/
│   ├── google.js       # unchanged from draft plan
│   ├── callback.js     # unchanged from draft plan
│   ├── me.js            # unchanged from draft plan
│   └── logout.js        # unchanged from draft plan
├── account/             # NEW this milestone
│   ├── status.js        # GET — profile + live membership status for the account
│   └── portal.js        # POST — Stripe Billing Portal redirect URL
├── address.js            # unchanged from draft plan
├── checkout.js           # MODIFIED (draft plan's login gate/address gate + this
│                          #   milestone's customer find-or-create)
├── entitlement.js         # DO NOT TOUCH
├── verify-session.js      # DO NOT TOUCH
├── webhook.js             # DO NOT TOUCH
└── prices.js              # DO NOT TOUCH
lib/
├── stripe.js              # DO NOT TOUCH — imported by lib/account.js and api/account/*
├── membership.js          # DO NOT TOUCH — ACTIVE_STATUSES imported by lib/account.js
├── db.js                  # extend: add stripe_customer_id column + 2 query fns
├── session.js              # unchanged from draft plan
├── shipping.js             # unchanged from draft plan
└── account.js              # NEW — Stripe-customer linking + status logic
src/
├── app.jsx                 # extend: add an ADDITIVE effect/state for account-based
│                            #   entitlement; add "account" route case
├── pages.jsx                # extend: add AccountPage; SubscribePage unaffected beyond
│                            #   the draft plan's own edits
└── components.jsx           # extend: Nav gets a real account link (currently a dead
                              #   `href="#account"` stub that only renders "EN · USD")
```

### Structure Rationale

- **`api/account/` as its own folder, not a modification to `api/entitlement.js`.** `api/entitlement.js` answers one question — "does this cookie's Checkout Session still have an active subscription" — for the pre-login flow. Bolting a second, unrelated question ("does this logged-in user have an active subscription via their linked customer") onto the same file conflates two independent trust boundaries (cookie vs. session) in one handler, and violates the draft plan's own hard constraint that `api/entitlement.js` must keep working byte-for-byte. A sibling endpoint costs nothing and keeps the diff on the do-not-touch file at zero.
- **`lib/account.js` as a new layer above `lib/db.js`, not folded into `lib/db.js`.** The draft plan's own comment on `lib/db.js` calls it "the only place that knows the schema" — i.e., SQL only. Stripe-customer find-or-create logic needs both a DB read/write and a Stripe API call; putting that orchestration in `lib/db.js` would make it import `lib/stripe.js`, which breaks the existing separation (`lib/stripe.js` and `lib/membership.js` currently know nothing about Postgres, and should stay that way). `lib/account.js` is the seam: it imports both `lib/db.js` and `lib/stripe.js`, but neither of those needs to know about the other.

## Architectural Patterns

### Pattern 1: Two independent, additive entitlement lanes (do not merge)

**What:** The pre-login cookie flow (`ladidier_member_session` → `api/entitlement.js`) and the new logged-in flow (`ladidier_session` → `api/account/status.js`) are two separate, parallel checks that both terminate in "is a subscription active," but never share a code path or a cookie.

**When to use:** Exactly this situation — an existing entitlement mechanism has live paying users depending on it, and a new identity layer is being added that must not regress them, and migration between the two is explicitly out of scope for this milestone (per PROJECT.md: "Existing pre-login Stripe subscribers are NOT migrated in this milestone").

**Trade-offs:** A member who bought before signing in with Google, then later signs in, gets **two disconnected identities** — the browser's Checkout Session cookie and a fresh, unlinked `users` row — until a future migration milestone reconciles them by email or a claim flow. This is a known, accepted gap, not an oversight; do not try to silently auto-link by matching email in `api/account/status.js`, since an unverified match on Stripe's `customer_details.email` from the anonymous flow is not proof of account ownership — that reconciliation deserves its own reviewed design.

**Example (client-side OR, additive to the existing effect in `src/app.jsx`):**
```jsx
// Existing effect (UNTOUCHED): sets isMember from the per-browser cookie via /api/entitlement.
// NEW, separate effect, added alongside it — never inside it:
useEffect(() => {
  if (!authReady || !user) return;
  let cancelled = false;
  fetch("/api/account/status", { credentials: "same-origin" })
    .then((r) => r.json())
    .then((d) => { if (!cancelled && d.active) setIsMember(true); })
    .catch((err) => console.error("Could not verify account membership:", err));
  return () => { cancelled = true; };
}, [authReady, user]);
```
`setIsMember(true)` only ever turns access **on** from the new lane; it never turns it off, so a false/slow response from the new endpoint cannot revoke access the legacy cookie already granted — the legacy effect remains the sole authority for revocation, exactly as it is today.

### Pattern 2: Link the Stripe Customer at checkout-creation time, not at webhook or verify-session time

**What:** Because the draft plan already gates `POST /api/checkout` behind a signed-in session (Task 5 of the draft plan), by the time a request reaches `stripe.checkout.sessions.create`, the caller's `uid` is already known. Find-or-create the user's Stripe Customer **inside `api/checkout.js`**, before creating the Checkout Session, and pass `customer: stripeCustomerId` (replacing the plain `customer_email` the draft plan proposed). Persist the customer id on the `users` row immediately.

**When to use:** Any time the identity that needs linking to a Stripe object is already authenticated before that Stripe object is created — this avoids needing to react to Stripe's asynchronous webhook or the return-trip `verify-session` call to discover "whose purchase was this," which would require touching two do-not-touch files.

**Trade-offs:** This only links customers for **new** checkouts created after this milestone ships. It does not, and should not, try to retroactively link old Checkout Sessions or Stripe Customers created before login existed — that is exactly the deferred migration.

**Example:**
```js
// inside api/checkout.js POST, after the session/login-gate check the draft
// plan already adds, and before stripe.checkout.sessions.create:
import { ensureStripeCustomer } from '../lib/account.js';

const customerId = await ensureStripeCustomer(session.uid, session.email, stripe);
// ... sessions.create({ ..., customer: customerId, /* no customer_email */ })
```
```js
// lib/account.js
import { getSql } from './db.js';      // or getStripeCustomerId/linkStripeCustomer helpers in lib/db.js
import { ACTIVE_STATUSES } from './membership.js';

// Idempotent by design: re-reads the column after an optimistic UPDATE so a
// double-click race creates at most one extra, unused Stripe Customer rather
// than two conflicting rows in `users`.
export async function ensureStripeCustomer(userId, email, stripe) {
  const existing = await getStripeCustomerId(userId);
  if (existing) return existing;

  const customer = await stripe.customers.create({ email, metadata: { user_id: String(userId) } });
  const linked = await linkStripeCustomerIfUnset(userId, customer.id);
  return linked; // returns the id that actually won the race, not necessarily customer.id
}
```

### Pattern 3: Account/billing status delegates to Stripe's hosted Billing Portal, never reimplements cancel/manage

**What:** `api/account/portal.js` calls `stripe.billingPortal.sessions.create({ customer, return_url })` and returns the URL for the client to redirect to. The account page never calls `stripe.subscriptions.update` / `.del` directly.

**When to use:** Whenever "manage or cancel" is a requirement and Stripe is already the source of truth for subscription state — exactly this project's existing philosophy (`lib/stripe.js`'s whole reason for existing is "the only question is 'is this subscription still paid for', which Stripe already answers").

**Trade-offs:** Requires enabling the Customer Portal in the Stripe Dashboard (a `user_setup` dashboard task, same category as the OAuth consent screen in the draft plan) and, since production currently runs Stripe **test-mode** keys (per PROJECT.md, 2026-09-01), the portal must be tested in test mode and re-verified after the pending revert to live keys. Saves rebuilding proration/cancellation UI and logic that Stripe already ships.

## Data Flow

### Request Flow — Account/Billing page

```
Account page mounts
    ↓
GET /api/auth/me            (unchanged, draft plan)  → { user: { id, email, name, picture } }
    ↓ (parallel)
GET /api/account/status     (NEW)                     → { linked, active, status, plan, currentPeriodEnd }
    │
    ├─ readSession(cookie) → uid                       [lib/session.js, unchanged]
    ├─ getStripeCustomerId(uid)                         [lib/db.js / lib/account.js]
    │     └─ no row / no customer id → { linked: false, active: false }   (no Stripe call — cheap default)
    └─ has customer id → stripe.subscriptions.list({ customer, status: 'all' })
          └─ map status through ACTIVE_STATUSES          [imported from lib/membership.js, NOT re-declared]
    ↓
User clicks "Manage billing"
    ↓
POST /api/account/portal    (NEW) → { url }  → window.location.href = url
    ↓
Stripe-hosted portal: cancel / update payment method / view invoices
    ↓
return_url back to #account → GET /api/account/status re-fetched to reflect the change
```

### Key Data Flows

1. **Sign-in → link (new, once per user):** Google OAuth (draft plan, unchanged) creates/updates a `users` row keyed on `google_sub`. The **first paid checkout** after that (this milestone) is what actually creates the Stripe Customer and writes `stripe_customer_id` — signing in alone does not create a Stripe Customer, since a Reader-tier (free) user may never need one.
2. **Legacy entitlement (unchanged):** `ladidier_member_session` cookie → `api/entitlement.js` → Stripe Checkout Session → expanded subscription status. Zero new code touches this path.
3. **Account entitlement (new):** `ladidier_session` cookie → `api/account/status.js` → `users.stripe_customer_id` → Stripe Customer's subscriptions → status, reusing `ACTIVE_STATUSES` from `lib/membership.js` so "what counts as active" can never drift between the two lanes.
4. **Client merge (new, additive):** `src/app.jsx`'s existing `isMember` effect is left alone; a second effect ORs in the account-based result. Revocation authority stays entirely with the existing legacy effect.

## Scaling Considerations

| Scale | Architecture Adjustments |
|-------|--------------------------|
| Current (single-digit to low hundreds of members) | Exactly as designed above — no caching needed on `api/account/status.js` beyond `Cache-Control: private, no-store` (matching the existing `PRIVATE` header pattern in `api/entitlement.js`/`api/auth/me.js`) |
| Growth | If `api/account/status.js` calls become frequent (e.g. rendered on every page, not just the account page), add the same short-TTL in-memory per-warm-instance cache pattern `lib/membership.js` already uses for `checkActiveMembership` — keyed on `stripe_customer_id` instead of session id |
| Much larger | Neon/Postgres connection handling via `@neondatabase/serverless` is already HTTP-based (no pooled TCP connections to manage) per the draft plan's package choice, so this does not become a bottleneck before Stripe API rate limits would |

### Scaling Priorities

1. **First bottleneck:** Stripe API calls per account-status check, if the account page is polled aggressively — mitigate with the same TTL-cache pattern already established in `lib/membership.js`, applied inside `lib/account.js` rather than duplicated.
2. **Second bottleneck:** `ensureSchema()`'s one DDL round-trip per cold start (already an accepted, documented trade-off in the draft plan's threat register) — adding one more `alter table` statement for `stripe_customer_id` does not change this risk profile.

## Anti-Patterns

### Anti-Pattern 1: Modifying `api/entitlement.js` to also check the session cookie

**What people do:** Add an `else if (session) { check stripe_customer_id }` branch to the existing entitlement handler so there's "one endpoint" for membership status.
**Why it's wrong:** Violates the explicit, hard constraint carried over from the draft plan ("the existing paid-member entitlement path must keep working byte-for-byte") and conflates two independent trust boundaries (an anonymous Checkout Session cookie vs. an authenticated user session) in a file whose entire job today is answering one narrow question correctly for the pre-login flow. It also makes the do-not-touch list meaningless the moment it's convenient to ignore.
**Do this instead:** A sibling `api/account/status.js`, with the client-side OR happening in `src/app.jsx`, not on the server.

### Anti-Pattern 2: Replacing `ladidier_member_session`/`ladidier_member` with the new session everywhere

**What people do:** Treat the new `ladidier_session` as a full replacement and rip out the old cookie plumbing since "now we have real accounts."
**Why it's wrong:** Every live paying member today has no `users` row and no Google session — only the old cookie. Removing or bypassing the old lane locks out every current paying customer the moment this ships, which is the one outcome both PROJECT.md and the draft plan explicitly forbid.
**Do this instead:** Coexist. New session is the primary check for anyone signed in; old cookie logic is untouched and remains the only check for anyone who bought before this milestone and never signs in.

### Anti-Pattern 3: Linking Stripe customers by matching email address after the fact

**What people do:** In `api/account/status.js`, if there's no `stripe_customer_id`, fall back to `stripe.customers.list({ email: user.email })` and auto-link the first match.
**Why it's wrong:** `customer_details.email` on an old, pre-login Checkout Session is unverified user input from Stripe's own hosted form, not proof that the Google-authenticated visitor now looking at the account page is the same person. Silently attaching someone else's subscription (or a wrong one, if there are multiple Stripe Customers sharing an email) is an entitlement/PII leak. This is precisely the "claim by email" flow PROJECT.md defers to a later milestone specifically because it needs its own verification step (e.g., re-confirming via the email itself), not an implicit lookup.
**Do this instead:** Leave `linked: false` for these users this milestone; design the claim flow later, deliberately, per PROJECT.md's own deferred-scope note.

## Integration Points

### External Services

| Service | Integration Pattern | Notes |
|---------|---------------------|-------|
| Google OAuth 2.0 / OIDC | Hand-rolled `fetch`-based flow, four routes under `api/auth/` (already designed in the draft plan) | No new integration needed beyond the draft plan; this milestone does not add scopes or touch the OAuth routes |
| Stripe (Customers, Billing Portal) | New calls via the **existing, shared** `getStripe()` singleton from `lib/stripe.js` — `stripe.customers.create`, `stripe.subscriptions.list`, `stripe.billingPortal.sessions.create` | Do not construct a second Stripe client; do not duplicate `ACTIVE_STATUSES`. Verify Billing Portal is enabled in the Stripe Dashboard (test mode first, given the current test-key state noted in PROJECT.md) |
| Neon/Postgres | `@neondatabase/serverless`, via `lib/db.js`'s lazy `sql` wrapper (already designed in the draft plan) | This milestone's only schema change: one additive, nullable `stripe_customer_id text unique` column on `users` — added via the same `ensureSchema()` memoised-DDL pattern, not a new migration mechanism |

### Internal Boundaries

| Boundary | Communication | Notes |
|----------|---------------|-------|
| `api/checkout.js` (modified) ↔ `lib/account.js` (new) | Direct function call (`ensureStripeCustomer`) | The one legacy file this milestone must touch; keep the diff to "gate + find-or-create customer," nothing else |
| `api/account/status.js` (new) ↔ `lib/membership.js` (untouched) | Import of `ACTIVE_STATUSES` only | Read-only reuse; `lib/account.js`/`api/account/*` must never write to or wrap `MEMBER_COOKIE` — that cookie belongs solely to the legacy lane |
| `src/app.jsx` (extended) ↔ `api/account/status.js` (new) | `fetch`, additive `useEffect`, OR'd into `isMember` | Must not replace or reorder the existing entitlement effect; new effect can only ever set `isMember` to `true`, never `false` |
| `src/components.jsx` `Nav` (extended) ↔ `src/app.jsx` | Existing prop-drilling pattern (`route`, `setRoute`) | The current `href="#account"` link is a dead stub (`onClick` calls `preventDefault()` and renders "EN · USD") — repurpose or replace it deliberately; do not leave two competing `#account` behaviors |

## Answers to the Specific Integration Questions

1. **Coexist, don't replace.** `ladidier_member_session`/`ladidier_member`/`ladidier_subscribed` stay exactly as they are (already true per the draft plan's own constraint list). The new `ladidier_session` becomes the primary check for anyone who signs in; the old cookie flow remains the sole and unmodified fallback/authority for anyone who hasn't. Client-side, this is one additive `useEffect` in `src/app.jsx` that can only turn `isMember` on, never off.

2. **`lib/account.js`, new, alongside `lib/db.js`/`lib/session.js`.** It owns the "find-or-create Stripe Customer for this user" and "is this account's linked customer active" logic, importing `lib/db.js` (SQL) and `lib/stripe.js` (the existing shared Stripe client) — neither of which should import the other. `api/entitlement.js` is **not modified**; a new `api/account/status.js` sits beside it, reading the session and calling `lib/account.js`.

3. **`GET /api/account/status` + `POST /api/account/portal`.** Status reuses `ACTIVE_STATUSES` imported from `lib/membership.js` (no duplicated logic) and the shared `getStripe()` client from `lib/stripe.js`. Manage/cancel is delegated entirely to Stripe's hosted Billing Portal rather than reimplementing subscription mutation.

4. **No new tooling — the project already runs through Vite** (`package.json`'s `vite build`, `index.html`'s `<script type="module" src="/src/main.jsx">`), despite PROJECT.md's "no build step" framing referring to *not needing a bundler pipeline decision*, not literal CDN/Babel-in-browser (there is no CDN `<script>` tag for React in `index.html` — it's a module entry point). Add `AccountPage` to `src/pages.jsx` following the existing page-component pattern (see `SubscribePage`), export it, import it in `src/app.jsx`, add a `case "account":` to the route switch, and give it a real link in `Nav` (`src/components.jsx`) — most naturally by replacing the currently-dead `href="#account"` stub rather than adding a second, confusingly-named nav entry.

5. **Build order:**
   1. Draft plan's own baseline, unmodified in intent: `lib/db.js` (users/addresses schema) + `lib/session.js` + the four `api/auth/*` routes + the checkout login gate — this is prerequisite identity infrastructure this milestone builds on, not replaces.
   2. Schema extension: add `stripe_customer_id` to `users` in `lib/db.js`'s `ensureSchema()`.
   3. `lib/account.js`: find-or-create/link logic, built and unit-testable against the extended schema before touching any route.
   4. Modify `api/checkout.js` again (on top of the draft plan's own edit) to call `ensureStripeCustomer` and pass `customer:` instead of `customer_email`.
   5. `api/account/status.js` and `api/account/portal.js` — depend on step 3/4 having a real, linked customer to query against.
   6. Client: additive `isMember` effect in `src/app.jsx`, then `AccountPage` in `src/pages.jsx`, then the `Nav` link — UI is last because it's a pure consumer of every API above.
   7. Regression pass covering both the draft plan's own verification list (pre-login member cookie untouched, Reader one-click unlock unchanged, `git diff` touches none of the four do-not-touch files) and this milestone's additions (new checkout creates and links a Stripe Customer exactly once even under a double-click race; account page reflects Stripe status; Billing Portal cancel round-trips back to an updated status).

## Sources

- Direct codebase reads (HIGH confidence, primary source): `api/entitlement.js`, `lib/membership.js`, `lib/stripe.js`, `api/checkout.js`, `api/verify-session.js`, `api/webhook.js`, `lib/plans.js`, `src/app.jsx`, `src/pages.jsx` (SubscribePage), `src/components.jsx` (Nav), `package.json`, `index.html`
- `.planning/PROJECT.md` — milestone goal, requirements, deferred-migration decision, current test-mode-keys caveat
- `.planning/quick/260831-8ug-user-should-login-before-subscription-al/260831-8ug-PLAN.md` — baseline OAuth/DB/session architecture, do-not-touch list, threat register (used as the validated starting point per the research brief)

---
*Architecture research for: adding accounts (Google OAuth + Postgres + Stripe-customer linking) to an existing Stripe-only serverless app*
*Researched: 2026-09-01*
