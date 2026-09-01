# Phase 7: OAuth + Database Foundation - Pattern Map

**Mapped:** 2026-09-01
**Files analyzed:** 12 (Tasks 1-5 of the draft plan only — Task 6 address/shipping files are OUT of scope per CONTEXT.md D-02)
**Analogs found:** 12 / 12

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|-------------------|------|-----------|-----------------|---------------|
| `package.json` | config | n/a | `package.json` (self, add dep + script) | exact |
| `lib/db.js` | service (lazy client factory + schema/queries) | CRUD | `lib/stripe.js` (lazy client) + `lib/membership.js` (query/helper shape) | exact (lazy-init) / role-match (queries) |
| `lib/session.js` | utility (cookie crypto) | transform | `lib/membership.js` (cookie read/write helpers) | role-match |
| `api/auth/google.js` | route (OAuth redirect starter) | request-response | `api/checkout.js` (origin derivation, env-var validation, redirect building) | role-match |
| `api/auth/callback.js` | route (OAuth callback / token exchange) | request-response | `api/verify-session.js` (server-to-server verification then Set-Cookie) | role-match |
| `api/auth/me.js` | route (session read-only) | request-response | `api/entitlement.js` (cookie read, private cache-control, JSON status) | exact |
| `api/auth/logout.js` | route (cookie clear) | request-response | `api/verify-session.js` (Set-Cookie header pattern, shape) | partial |
| `scripts/db-setup.mjs` | utility (one-shot script) | batch | none in codebase (new pattern) | no analog |
| `src/app.jsx` (auth-state effect) | provider/hook (top-level state + effect) | request-response | `src/app.jsx` lines 32-61 (existing `isMember` entitlement effect) | exact |
| `src/pages.jsx` `SubscribePage` (sign-in row, gate) | component | request-response | `src/pages.jsx` lines 796-869 (`SubscribePage`'s existing `handleSelectPlan`/checkout fetch) | exact |
| `src/components.jsx` `Nav` (sign-in indicator) | component | request-response | `src/components.jsx` lines 133-142 (`Nav` right-side links) | exact |
| `api/checkout.js` (session gate only, AUTH-04) | route (modify existing) | request-response | `api/checkout.js` itself (existing plan/env validation ordering) | exact |

## Pattern Assignments

### `lib/db.js` (service, CRUD)

**Analog 1 — lazy client construction:** `lib/stripe.js` (full file, 18 lines)
```javascript
let client = null;

// Stripe's constructor throws when the key is missing. Doing that at module
// scope takes the whole function down before any handler runs, which Vercel
// surfaces as a bare FUNCTION_INVOCATION_FAILED with nothing in the logs.
// Constructing lazily lets each handler catch it and say what's actually wrong.
export function getStripe() {
  if (client) return client;

  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error('STRIPE_SECRET_KEY is not set');

  client = new Stripe(key);
  return client;
}
```
Copy this exact lazy-memoize-in-module-variable shape for `getSql()` in `lib/db.js` — construct `neon(connectionString)` only on first call, never at module scope, throw a named `Error` when the env var is missing so the handler can catch and log it (draft plan's `lib/db.js` code block already follows this shape almost verbatim — use it as-is).

**Analog 2 — query/helper factoring:** `lib/membership.js` (full file, 71 lines)
- Shows the project convention of exporting small named async functions (`checkActiveMembership`) that take `(request, dependency)` and do try/catch around the external call, logging `console.error(\`[stripe] ...: ${err.message}\`)` then failing closed. Mirror this shape for `upsertUser`, `getAddress` (future), etc. in `lib/db.js` — but Postgres errors should generally rethrow rather than fail silently, since a broken DB call is a 500, not an implicit "no".
- Also shows the in-memory `Map()`-based per-warm-instance memoization pattern (`entitlementCache`) that `lib/db.js`'s `ensureSchema()` memoized promise should follow structurally (reset the memo on failure, as instructed in the draft plan).

---

### `lib/session.js` (utility, transform)

**Analog:** `lib/membership.js` lines 12-34 (cookie read + cookie-string builder)
```javascript
export function readCookie(header, name) {
  if (!header) return null;
  for (const part of header.split(';')) {
    const [key, ...rest] = part.trim().split('=');
    if (key === name) return decodeURIComponent(rest.join('=')) || null;
  }
  return null;
}

// httpOnly so page scripts can neither read nor forge it. ...
export function memberCookie(sessionId) {
  return [
    `${MEMBER_COOKIE}=${encodeURIComponent(sessionId)}`,
    'Path=/',
    'HttpOnly',
    'Secure',
    'SameSite=Lax',
    `Max-Age=${60 * 60 * 24 * 365}`,
  ].join('; ');
}
```
Import `readCookie` directly from `lib/membership.js` (do not re-implement) as CONTEXT.md/draft plan mandate. Model `sessionCookie(value)` / `clearSessionCookie()` / `stateCookie(value)` / `clearStateCookie()` on `memberCookie`'s array-join-with-`; `-separator shape, substituting `Max-Age=${7 * 24 * 60 * 60}` per CONTEXT D-06 (7 days, not the draft's 30), and `Path=/api/auth` + `Max-Age=600` for the state cookie. Keep the exact same header-string-array-join style.

---

### `api/auth/google.js` (route, request-response)

**Analog:** `api/checkout.js` lines 109-111 (origin derivation) and lines 82-99 (query/env validation ordering)
```javascript
const proto = request.headers.get('x-forwarded-proto') ?? 'https';
const host = request.headers.get('x-forwarded-host') ?? request.headers.get('host');
const origin = `${proto}://${host}`;
```
```javascript
const envName = PRICE_ENV[planType];
if (!envName) {
  return Response.json({ error: 'Unknown plan' }, { status: 400 });
}

const configured = process.env[envName];
if (!configured) {
  console.error(`[stripe] ${envName} is not set`);
  return Response.json({ error: 'Checkout is not configured' }, { status: 500 });
}
```
Copy the origin-derivation line-for-line into `api/auth/google.js` for building `redirect_uri`. Copy the "check env var present, log and 500 with opaque message" ordering for `GOOGLE_CLIENT_ID`/`SESSION_SECRET` validation before building the redirect.

---

### `api/auth/callback.js` (route, request-response)

**Analog:** `api/verify-session.js` (full file, 49 lines)
```javascript
export async function POST(request) {
  let stripe;
  try {
    stripe = getStripe();
  } catch (err) {
    console.error(`[stripe] ${err.message}`);
    return Response.json({ paid: false, error: 'Stripe is not configured' }, { status: 500 });
  }
  ...
  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    const paid = session.status === 'complete' && session.payment_status === 'paid';
    const headers = paid ? { 'Set-Cookie': memberCookie(sessionId) } : undefined;
    return Response.json({ paid, email: paid ? session.customer_details?.email ?? null : null }, { headers });
  } catch (err) {
    console.error(`[stripe] could not retrieve session: ${err.message}`);
    return Response.json({ paid: false }, { status: 400 });
  }
}
```
This is the closest existing shape to "exchange something with an external service server-to-server, then set a cookie on success, fail closed on any error." `api/auth/callback.js` should follow the same try/catch envelope: exchange the `code` at Google's token endpoint, validate id_token claims, and set the session cookie only on the success path — matching this file's "construct headers object conditionally on success" idiom. Note callback.js needs TWO Set-Cookie headers (session set + state cleared) so per the draft plan use `new Headers()` + `headers.append(...)` twice instead of the plain-object `{ 'Set-Cookie': ... }` this analog uses (that form only carries one).

---

### `api/auth/me.js` (route, request-response)

**Analog:** `api/entitlement.js` (full file, 44 lines) — exact match
```javascript
// Never let this sit in a shared cache — the answer is per-visitor.
const PRIVATE = { 'Cache-Control': 'private, no-store' };

export async function GET(request) {
  const sessionId = readCookie(request.headers.get('cookie'), MEMBER_COOKIE);

  if (!sessionId) {
    return Response.json({ active: false }, { headers: PRIVATE });
  }
  ...
}
```
Copy this file's structure directly: read cookie via `readSession(request.headers.get('cookie'))`, respond `{ user: null }` with the same `PRIVATE` cache-control constant when absent, `{ user: { id, email, name } }` when present. No external network call needed here (session is self-verifying via HMAC), so this is even simpler than the analog.

---

### `api/auth/logout.js` (route, request-response)

**Analog:** `api/verify-session.js` line 35 (Set-Cookie header construction) — partial match, adapted to a POST-only clear
```javascript
const headers = paid ? { 'Set-Cookie': memberCookie(sessionId) } : undefined;
return Response.json({ paid, ... }, { headers });
```
`api/auth/logout.js` returns `Response.json({ ok: true }, { headers: { 'Set-Cookie': clearSessionCookie() } })` — same object-header shape since only one Set-Cookie is needed here (unlike callback.js).

---

### `scripts/db-setup.mjs` (utility, batch)

**No analog found** — this project has no scripts directory or precedent for a standalone Node script. Follow the draft plan's own spec exactly: import `ensureSchema` from `../lib/db.js`, `--env-file` for local env loading (no dotenv dependency, matching the project's zero-dependency taste per CONTEXT.md/constraints), log applied tables, exit 0.

---

### `src/app.jsx` (auth-state effect) (provider/hook, request-response)

**Analog:** `src/app.jsx` lines 29-61 (existing `isMember` entitlement effect) — exact match, same file
```javascript
useEffect(() => {
  const CHECKED_AT = "ladidier_member_checked";
  const RECHECK_AFTER = 6 * 60 * 60 * 1000;
  const checkedAt = Number(localStorage.getItem(CHECKED_AT) || 0);
  if (isMember && Date.now() - checkedAt < RECHECK_AFTER) return;

  let cancelled = false;
  fetch("/api/entitlement", { credentials: "same-origin" })
    .then((r) => r.json())
    .then((d) => {
      if (cancelled) return;
      ...
    })
    .catch((err) => console.error("Could not verify membership:", err));

  return () => { cancelled = true; };
}, []);
```
Copy the `let cancelled = false` guard-flag + cleanup-function shape exactly for the new `/api/auth/me` effect. Per CONTEXT.md's integration note: "the new auth-state effect follows the same guard-flag/cleanup shape, added alongside (not replacing) it" — do not merge into the existing effect, add a separate `useEffect`. Do NOT mirror `user` into localStorage the way `isMember` is mirrored (draft plan Task 4 explicitly forbids this — httpOnly cookie is the only trustworthy record).

---

### `src/pages.jsx` `SubscribePage` (sign-in row + gate) (component, request-response)

**Analog:** `src/pages.jsx` lines 796, 837-869 (same file, `SubscribePage`'s signature and `handleSelectPlan`) — exact match, same file/component being extended
```javascript
function SubscribePage({ setRoute, isSubscribed, setIsSubscribed }) {
  ...
  const handleSelectPlan = async (product) => {
    if (product === "reader") {
      setIsSubscribed(true);
      localStorage.setItem("ladidier_subscribed", "true");
      setRoute("magazine");
      return;
    }

    setPlan(product);
    setLoading(true);
    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planType: `${product}_${billing}` }),
      });

      if (!response.ok) throw new Error('Checkout response not ok');
      const data = await response.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error('No checkout URL returned');
      }
    } catch (err) {
      console.error('Checkout error:', err);
      alert('Failed to initiate checkout. Please try again later.');
    } finally {
      setLoading(false);
    }
  };
```
This is the exact function being widened per Task 5: keep the `reader` branch first and byte-for-byte unchanged (draft plan explicitly requires this — verification checks it), then extract the checkout POST into `startCheckout`, add the `if (!user) { startLogin(product); return; }` gate before it, and add 401/409 branches to the fetch's error handling. Widen the component signature the same way — add `user, setUser, authReady` as new destructured props alongside the existing `setRoute, isSubscribed, setIsSubscribed`, matching how `App`'s `case "magazine":` block at `src/app.jsx:129` already passes `isMember` down as a prop (`<MagazinePage setRoute={go} isMember={isMember} />`) — same "lift state in App, pass down as props" convention to reuse for `user`/`setUser`/`authReady` on the Subscribe route.

---

### `src/components.jsx` `Nav` (sign-in indicator) (component, request-response)

**Analog:** `src/components.jsx` lines 136-140 (Nav's `nav-right` block) — exact match, same file
```jsx
<div className="nav-right">
  <a href="#search" onClick={(e) => e.preventDefault()}>Search</a>
  {item("subscribe", "Subscribe")}
  <a href="#account" onClick={(e) => e.preventDefault()} className="mono" style={{ fontSize: 11, letterSpacing: ".1em" }}>EN · USD</a>
  <TreasureProgress />
  <button className="nav-hamburger" ...
```
Add the new sign-in indicator as a new sibling element inside `nav-right`, following the same inline-style/`className="mono"` convention as the `EN · USD` stub — but as its own new `<a>`/`<button>`, per CONTEXT D-05 (do NOT repurpose the existing `#account` href). Signed-out click starts `window.location.href = "/api/auth/google?returnTo=..."` (same pattern as the Subscribe page's sign-in button); signed-in click calls `setRoute("subscribe")` (same convention as `item("subscribe", "Subscribe")`'s route-set behavior) rather than a dropdown menu.

---

### `api/checkout.js` (route, modify existing) — session gate only (AUTH-04)

**Analog:** `api/checkout.js` itself, lines 82-99 (existing plan/env validation ordering — this file IS its own best analog for where to insert the new check)
```javascript
const envName = PRICE_ENV[planType];
if (!envName) {
  return Response.json({ error: 'Unknown plan' }, { status: 400 });
}

const configured = process.env[envName];
```
Per CONTEXT D-03, Phase 7's change to this file is scoped ONLY to inserting the session check — no `customer_email`/`metadata` (deferred to Phase 8). Insert `import { readSession } from '../lib/session.js';` at the top (alongside the existing `import { getStripe } from '../lib/stripe.js';`), and insert the 401 gate immediately after the `if (!envName) { ... }` block and BEFORE `resolvePriceId` is called (per draft plan Task 5), reusing the exact `Response.json({ error: ... }, { status: N })` return shape already used twice in this same file.

---

## Shared Patterns

### Lazy env-var-read-inside-handler (never module scope)
**Source:** `lib/stripe.js` (full file)
**Apply to:** `lib/db.js` (`getSql()`), `lib/session.js` (HMAC key import)
```javascript
let client = null;
export function getStripe() {
  if (client) return client;
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error('STRIPE_SECRET_KEY is not set');
  client = new Stripe(key);
  return client;
}
```
Rationale documented in the file's own comment: a module-scope throw is an invisible `FUNCTION_INVOCATION_FAILED` on Vercel with nothing in the logs.

### Cookie read/parse
**Source:** `lib/membership.js` lines 12-19 (`readCookie`)
**Apply to:** `lib/session.js` — import directly, do not duplicate.

### Cache-Control: private, no-store on per-visitor JSON
**Source:** `api/entitlement.js` line 5 (`const PRIVATE = { 'Cache-Control': 'private, no-store' };`)
**Apply to:** `api/auth/me.js` GET response (both `{ user: null }` and `{ user: {...} }` branches)

### Origin derivation from forwarded headers
**Source:** `api/checkout.js` lines 109-111
**Apply to:** `api/auth/google.js` (building `redirect_uri`)

### Plain web-handler signature, no framework
**Source:** every existing `api/*.js` file (`export async function GET(request)` / `POST(request)`, returning `Response`/`Response.json(...)`)
**Apply to:** all four new `api/auth/*.js` routes

### Fail-closed error handling with opaque client message + detailed server log
**Source:** `api/entitlement.js` lines 16-22, `api/checkout.js` lines 74-80/101-107
```javascript
try {
  stripe = getStripe();
} catch (err) {
  console.error(`[stripe] ${err.message}`);
  return Response.json({ error: 'Stripe is not configured' }, { status: 500 });
}
```
**Apply to:** all new `lib/db.js` / `lib/session.js` consumers in `api/auth/*.js` — log the specific missing var/failure, return a generic message to the client.

### Guard-flag + cleanup shape for fetch-in-useEffect
**Source:** `src/app.jsx` lines 32-61 (existing `isMember` effect)
**Apply to:** new `/api/auth/me` effect in `src/app.jsx` (Task 4)

## No Analog Found

| File | Role | Data Flow | Reason |
|------|------|-----------|--------|
| `scripts/db-setup.mjs` | utility | batch | No `scripts/` directory or standalone Node-script precedent exists in this codebase yet; follow the draft plan's own spec (imports `ensureSchema`, uses Node's built-in `--env-file`, no dotenv). |

## Metadata

**Analog search scope:** `lib/`, `api/`, `api/auth/` (new dir), `src/app.jsx`, `src/components.jsx`, `src/pages.jsx`, `package.json`
**Files scanned:** `lib/stripe.js`, `lib/membership.js`, `api/checkout.js`, `api/entitlement.js`, `api/verify-session.js`, `src/app.jsx`, `src/components.jsx`, `src/pages.jsx` (SubscribePage range), `package.json`
**Pattern extraction date:** 2026-09-01
