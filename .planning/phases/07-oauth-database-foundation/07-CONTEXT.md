# Phase 7: OAuth + Database Foundation - Context

**Gathered:** 2026-09-01
**Status:** Ready for planning

<domain>
## Phase Boundary

Google sign-in, a persistent signed session, and a real Postgres database backing user identity — for an existing site that already sells paid Stripe subscriptions via a per-browser cookie. This phase delivers AUTH-01..04 and ACCT-01..02 only.

**Explicitly NOT this phase** (later phases in the v1.2 roadmap):
- Linking a signed-in account to a Stripe customer for cross-device membership (Phase 8 — LINK-01..04)
- The account/profile/billing page, and the saved delivery address feature (Phase 9 — PROF-01..05)
- Migrating pre-login Stripe subscribers into accounts (out of scope for v1.2 entirely)

</domain>

<decisions>
## Implementation Decisions

### Reuse of the existing draft plan (260831-8ug)

- **D-01:** Phase 7 reuses Tasks 1–5 of `.planning/quick/260831-8ug-user-should-login-before-subscription-al/260831-8ug-PLAN.md` as its technical foundation almost as-is: package legitimacy check (already resolved — `@neondatabase/serverless`), Vercel Postgres + Google OAuth provisioning, the `users` table + `lib/db.js` + `lib/session.js` + four `api/auth/*` routes (the OAuth tracer), client-side auth state in `src/app.jsx`/`SubscribePage`, and the server-side login gate on `api/checkout.js`. — **Reversibility:** reversible — this is a scoping decision, not a code commitment; the planner can still deviate from the draft's exact task shape.
- **D-02:** Task 6 of the draft plan (the `addresses` table, `lib/shipping.js`, `api/address.js`, the in-app `AddressForm`, and removing Stripe's own shipping/phone collection for Hard Copy) is explicitly OUT of Phase 7. It belongs to Phase 9 (PROF-04/05) — and Phase 9 must NOT reuse Task 6's approach of deleting Stripe's own address collection, because the user has since decided (during milestone requirements) that the saved-address feature coexists with Stripe's own checkout address collection rather than replacing it. Flagging this now so Phase 9 planning doesn't blindly copy Task 6. — **Reversibility:** reversible.
- **D-03:** Task 5's `customer_email` and `metadata: { user_id, plan }` additions to `stripe.checkout.sessions.create` are deferred to Phase 8, not built in Phase 7. Research (`.planning/research/PITFALLS.md`) flagged `customer_email` as the exact anti-pattern that creates duplicate Stripe customers — Phase 8 replaces it with a stored `customer:` id via `ensureStripeCustomer`. Phase 7's `api/checkout.js` change is scoped to ONLY the session-check / 401 gate (AUTH-04), nothing else in that file. — **Reversibility:** reversible — a smaller diff than the draft plan's Task 5.

### Sign-in entry points

- **D-04:** Add a small sign-in indicator to the main Nav (next to the existing `#search` / `#account` stubs in `src/components.jsx`), in addition to the Subscribe page's sign-in row from the draft plan. Signed out: shows "Sign in", click starts Google OAuth (`returnTo` defaults sensibly, e.g. current route if it maps to a valid `returnTo` value, else `subscribe`). Signed in: shows the user's Google account (email or name), and clicking it routes to the Subscribe page (today's only account-related surface) rather than opening a menu. — **Reversibility:** reversible.
- **D-05:** Correction to prior research: the existing `<a href="#account">EN · USD</a>` stub in `Nav` (src/components.jsx:139) is a dead language/currency toggle, NOT an account link — despite its href name. Do not repurpose it for sign-in; add a separate new Nav element for the sign-in indicator, and leave the EN · USD stub untouched.

### Session duration

- **D-06:** Session cookie lifetime is 7 days (not the draft plan's 30 days). Update `lib/session.js`'s `exp` calculation accordingly (7 days out in unix-seconds, not 30). No "renew on activity" logic — a flat 7-day expiry from sign-in time, matching the draft's other mechanics exactly except for this one constant. — **Reversibility:** reversible — a single constant.

### Sign-in failure UX

- **D-07:** Keep the draft plan's failure behavior exactly as designed: a failed sign-in (state mismatch, denied consent, invalid token claims) redirects silently to `/?auth=failed#subscribe` with the state cookie cleared and no visible error message or banner. No UI work needed beyond what the draft plan already specifies. — **Reversibility:** reversible.

### Consent screen launch readiness

- **D-08:** As part of Task 2 (the human-action provisioning checkpoint), also move the Google OAuth consent screen from "Testing" to "Published" (In production) before considering Phase 7 done. The requested scopes (`openid`, `email`, `profile`) are non-sensitive, so this does not require Google's verification review — it's a dashboard toggle. This means real visitors (not just added test users) can sign in as soon as Phase 7 ships. Add this as an explicit step in the provisioning checkpoint's instructions and verification.

### Claude's Discretion

- Exact `returnTo` handling for the new Nav sign-in link when the current route isn't a valid returnTo destination (fall back to `subscribe`, matching the draft plan's existing validation regex `/^[a-z]+$/`).
- Precise Nav element styling/placement, following the existing `.mono` / nav-right pattern already used by `#search` and the EN · USD stub.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Prior locked technical plan (primary reuse source)
- `.planning/quick/260831-8ug-user-should-login-before-subscription-al/260831-8ug-PLAN.md` — Tasks 1–5 are Phase 7's technical foundation (schema, OAuth routes, session cookie, client wiring, checkout gate). Task 6 (addresses) is explicitly OUT of scope for this phase — see D-02.

### Milestone research (validated the draft plan's stack choices)
- `.planning/research/STACK.md` — confirms `@neondatabase/serverless` is current/non-deprecated; confirms hand-rolled OAuth via `fetch` is sound; flags Vercel's Node 20 deprecation (Oct 1, 2026) — verify Node 22+ runtime during Task 2 provisioning
- `.planning/research/ARCHITECTURE.md` — additive, two-lane design: new account/session system runs beside the existing per-browser cookie flow, never replacing it
- `.planning/research/PITFALLS.md` — OAuth security pitfalls (CSRF/state, id_token verification — already addressed in the draft plan's design); flags `customer_email` as a duplicate-customer anti-pattern (informs D-03)
- `.planning/research/SUMMARY.md` — overall phase sequencing rationale (identity → linking → UI)

### Project-level
- `.planning/PROJECT.md` — v1.2 milestone goal, "do not touch" constraint on `api/entitlement.js`, `api/verify-session.js`, `api/webhook.js`, `lib/membership.js`, `lib/stripe.js`
- `.planning/REQUIREMENTS.md` — AUTH-01..04, ACCT-01..02 (this phase's exact scope)
- `.planning/ROADMAP.md` — Phase 7 success criteria and regression-check requirement

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `lib/stripe.js` — the lazy env-var-read-inside-handler pattern (never at module scope) that `lib/db.js` and `lib/session.js` must follow exactly, per the draft plan's own reasoning (a module-scope throw is an invisible `FUNCTION_INVOCATION_FAILED` on Vercel)
- `lib/membership.js` — has an existing `readCookie` helper; `lib/session.js` should import and reuse it rather than writing a second cookie parser (per draft plan)
- `api/checkout.js` — existing origin-derivation pattern (`x-forwarded-proto`/`x-forwarded-host`) that `api/auth/google.js`'s redirect_uri construction should match exactly

### Established Patterns
- Every serverless route uses the plain web-handler signature: `export async function GET(request)` / `POST(request)`, returning `Response`/`Response.json(...)` — no framework, no router
- Cookies use `HttpOnly; Secure; SameSite=Lax` (Lax specifically because OAuth returns are a cross-site top-level GET)
- `Cache-Control: private, no-store` on any per-visitor JSON response (established by `api/entitlement.js`)

### Integration Points
- `src/app.jsx` — existing `isMember`/entitlement `useEffect` pattern; the new auth-state effect (`/api/auth/me`) follows the same guard-flag/cleanup shape, added alongside (not replacing) it
- `src/components.jsx` `Nav` (around line 139) — new sign-in indicator goes here, as a new element; the existing `#account` href is an unrelated EN · USD stub (see D-05), not a real account link
- `src/pages.jsx` `SubscribePage` — sign-in/sign-out row and the checkout-gate resume flow, per the draft plan's Tasks 4–5

</code_context>

<specifics>
## Specific Ideas

- 7-day session length (not the draft plan's 30 days) — see D-06
- Nav sign-in indicator, separate from the dead EN · USD `#account` stub — see D-04/D-05
- Publish the OAuth consent screen (out of Testing mode) as part of Phase 7's provisioning checkpoint — see D-08

</specifics>

<deferred>
## Deferred Ideas

- Hard Copy in-app address collection and the `addresses` table (Task 6 of the draft plan) — belongs to Phase 9, and must be replanned there (not reused verbatim) since it conflicts with the "keep Stripe's own address collection too" decision from milestone requirements
- Stripe-customer linking, `customer_email`/`metadata` on Checkout Session creation — belongs to Phase 8
- A real Account page / menu behind the Nav sign-in indicator — belongs to Phase 9
- Migrating pre-login Stripe subscribers into accounts — deferred past v1.2 entirely (see PROJECT.md)

### Reviewed Todos (not folded)
None — no pending todos matched this phase (`todo.match-phase` returned 0 matches).

</deferred>

---

*Phase: 7-oauth-database-foundation*
*Context gathered: 2026-09-01*
