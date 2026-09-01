---
phase: 260901-b1a
plan: "01"
subsystem: auth
tags: [stripe, oauth, react, session, cache, neon]

# Dependency graph
requires:
  - phase: 09-account-and-billing-page
    provides: lib/db.js, lib/account.js, lib/session.js, api/auth/callback.js, src/app.jsx account-path membership plumbing
provides:
  - lib/access.js — hasIssueAccess(request, stripe): the OR of the legacy cookie path and the account/session path, fail-closed
  - lib/cache.js — createTtlCache({ttlMs, maxEntries}): one bounded TTL cache implementation
  - lib/routes.js — safeReturnTo(raw): the one returnTo allowlist validator, import-free
affects: [auth, billing, magazine-reader, print-build]

# Actuals (#2632)
actuals:
  tokens: 6575
  tasks: 3
  commits: 3

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Two independent membership sources resolved via a single gate (lib/access.js) that ORs them, rather than each caller re-implementing the OR"
    - "One TTL cache implementation (lib/cache.js) instantiated per caller instead of hand-rolled Map + inline expiry arithmetic"
    - "Import-free shared modules (lib/routes.js) for code that must run identically in both serverless functions and the Vite browser bundle"

key-files:
  created:
    - lib/access.js
    - lib/cache.js
    - lib/routes.js
  modified:
    - lib/membership.js
    - lib/session.js
    - lib/account.js
    - lib/db.js
    - api/issue/pdf.js
    - api/issue/page.js
    - api/auth/google.js
    - api/auth/callback.js
    - src/app.jsx
    - src/pages.jsx
    - src/print-app.jsx
    - src/components.jsx

key-decisions:
  - "hasIssueAccess checks the legacy cookie path first (zero Stripe calls when no member cookie is present) and only falls through to the account path on a decline, per the plan's cost ordering"
  - "src/app.jsx's single membership resolver reads isMember directly for the recheck-skip guard but deliberately excludes it from the effect's dependency array, to avoid the effect re-firing on its own write"
  - "Sign-out never clears the httpOnly Stripe member cookie — only the account-path's localStorage hints — preserving the legacy device-bound entitlement the ROADMAP regression invariant protects"
  - "hasActiveSubscription kept cache-free and separately exported from checkUserActiveMembership so the Stripe query is independently testable with a stub; caching stays the caller's own concern"

patterns-established:
  - "Pattern: fail-closed account-path branches — any throw between session read and the Stripe/DB call returns 403, never 500, on member-gated content routes"
  - "Pattern: shared dependency-free modules (lib/routes.js) for logic needed identically by serverless functions and the Vite client bundle"

requirements-completed: [BUG-01, BUG-02, BUG-03, BUG-04, BUG-05, BUG-06, BUG-07, BUG-08, BUG-09, BUG-10]

coverage:
  - id: D1
    description: "BUG-01/02/03/04 (Task 1): hasIssueAccess bridges the two membership paths for the issue routes; src/app.jsx has one deterministic isMember resolver; readCookie/readSession never throw on a malformed cookie; sign-out clears localStorage membership hints on both pages"
    requirement: "BUG-01"
    verification:
      - kind: unit
        ref: "node --input-type=module -e (readCookie/readSession decode guard probe) — PASS"
        status: pass
      - kind: unit
        ref: "node --input-type=module -e (hasIssueAccess anon/legacy/malformed/dead-session probe) — PASS"
        status: pass
      - kind: other
        ref: "grep-based structural gates (hasIssueAccess call count, single Promise.all, single /api/account/status reference, clearMemberLocalState call count, no direct lib/membership.js import in issue routes) — PASS"
        status: pass
      - kind: other
        ref: "npm run build — PASS"
        status: pass
    human_judgment: true
    rationale: "Cross-device sign-in, legacy-cookie-only access, malformed-cookie curl probe, and shared-computer sign-out are UI/browser flows verified in the plan's Manual verification section against a live deploy — automation covers the underlying logic but not the end-to-end browser/production behavior."
  - id: D2
    description: "BUG-05/06 (Task 2): upsertUser coalesces name/picture against the stored row on a null claim; hasActiveSubscription queries Stripe once per ACTIVE_STATUSES entry instead of a bounded all-status page"
    requirement: "BUG-05"
    verification:
      - kind: unit
        ref: "node --input-type=module -e (hasActiveSubscription active/empty/trialing probe, asserts no 'all' status query) — PASS"
        status: pass
      - kind: other
        ref: "grep-based structural gates (coalesce(excluded.name/picture), email direct-assign, no limit:5 / status:'all' in lib/account.js) — PASS"
        status: pass
      - kind: other
        ref: "node --check lib/db.js && node --check lib/account.js && npm run build — PASS"
        status: pass
    human_judgment: true
    rationale: "Profile retention (BUG-05) requires a real Google sign-in/sign-out round trip against production, listed in the plan's Manual verification section — no automated substitute exists for a live OAuth claim."
  - id: D3
    description: "BUG-07/08/09/10 (Task 3): startLogin persists the visitor's actual chosen interval through the 401 re-login path; lib/cache.js is the one TTL cache backing both memos; print build passes explicit auth props; lib/routes.js is the one returnTo validator"
    requirement: "BUG-07"
    verification:
      - kind: unit
        ref: "node --input-type=module -e (createTtlCache cap-eviction + TTL-expiry probe) — PASS"
        status: pass
      - kind: unit
        ref: "node --input-type=module -e (safeReturnTo case table, 11 cases) — PASS"
        status: pass
      - kind: other
        ref: "grep-based structural gates (no returnTo regex remaining, safeReturnTo count=6, no raw Map, createTtlCache count=4, print-app authReady/user prop counts, startLogin(product, interval) call site) — PASS"
        status: pass
      - kind: other
        ref: "npm run build — PASS"
        status: pass
    human_judgment: true
    rationale: "Interval fidelity (BUG-07) and the print build's rendered nav (BUG-09) are listed as Manual verification items in the plan requiring a live Stripe Checkout resume and a visual /print.html check — outside what a unit probe can confirm."
  - id: D4
    description: "Plan-level regression invariant: api/entitlement.js, api/verify-session.js, api/webhook.js, lib/stripe.js stay byte-identical; lib/membership.js keeps its five exports, cookie name, active-status set, 60s TTL, and fail-closed catch; no dependency added/removed/upgraded"
    verification:
      - kind: other
        ref: "git diff --name-only a850d59..HEAD -- api/entitlement.js api/verify-session.js api/webhook.js lib/stripe.js — empty (PASS)"
        status: pass
      - kind: other
        ref: "git diff --name-only a850d59..HEAD -- package.json package-lock.json — empty (PASS)"
        status: pass
      - kind: unit
        ref: "node --input-type=module -e (lib/membership.js export-surface + cookie-name + ACTIVE_STATUSES probe) — PASS"
        status: pass
      - kind: unit
        ref: "node --input-type=module -e (checkActiveMembership none/cancelled behavior probe) — PASS"
        status: pass
    human_judgment: false

# Metrics
duration: 30min
completed: 2026-09-01
status: complete
---

# Quick Task 260901-b1a: Fix 10 Bugs Found in Code Review Summary

**Bridged the legacy cookie and account-linked Stripe membership paths behind one fail-closed gate, made the client's `isMember` answer deterministic, fixed a cookie-decode 500, cleared paid-access localStorage hints on sign-out, stopped a null OAuth claim from erasing profile data, closed a Stripe paging window that could hide an active subscription, preserved the visitor's billing interval through re-login, unified two hand-rolled TTL caches into one, fixed the print build's implicit prop reliance, and unified three copies of the returnTo allowlist.**

## Performance

- **Duration:** ~30 min
- **Tasks:** 3
- **Files modified:** 15 (3 created, 12 modified)

## Accomplishments

- **BUG-01 (Task 1):** New `lib/access.js` `hasIssueAccess(request, stripe)` ORs the legacy checkout-session-cookie path with the account/session path (checked second, since it costs a Stripe call), wrapped in a `try` so a missing `DATABASE_URL` fails closed with 403 rather than 500. `api/issue/pdf.js` and `api/issue/page.js` now call it instead of the legacy-only `checkActiveMembership`.
- **BUG-02 (Task 1):** `src/app.jsx` had two competing `useEffect` hooks writing `isMember` from independent async sources — whichever settled last silently won. Replaced with one effect keyed on `[authReady, user]`, resolving both sources under a single `Promise.all` against a tri-state (`true`/`false`/`null`) table: either source `true` grants; both definitively `false` revokes; any unknown source leaves state untouched (never locks out a paying member on a dropped connection).
- **BUG-03 (Task 1):** `readCookie` in `lib/membership.js` now guards its `decodeURIComponent` call so a malformed percent-encoding returns `null` instead of throwing a `URIError`. `readSession` in `lib/session.js` had its `try` moved to wrap the entire function body, making its documented never-throws contract actually true.
- **BUG-04 (Task 1):** New `clearMemberLocalState()` helper in `src/pages.jsx` removes `ladidier_member`, `ladidier_member_checked`, and `ladidier_subscribed` from localStorage. Called from both `AccountPage.handleSignOut` and `SubscribePage.handleSignOut`; the latter now does a full page navigation to `/#subscribe` (instead of only `setUser(null)`) so App remounts against cleared storage. The httpOnly Stripe member cookie is deliberately left untouched — it is the legacy device-bound entitlement the ROADMAP regression invariant protects.
- **BUG-05 (Task 2):** `lib/db.js` `upsertUser`'s conflict branch now `coalesce`s `name` and `picture` against the stored row, so a sign-in whose id_token omits an optional claim no longer nulls out previously captured profile data. `email` still assigns directly from the excluded row.
- **BUG-06 (Task 2):** New exported, cache-free `hasActiveSubscription({customerId, stripe})` in `lib/account.js` queries Stripe once per status in `ACTIVE_STATUSES` (server-side filtered, `limit: 1`, run concurrently) instead of scanning a 5-result all-statuses page — closing the window where a customer's genuinely active subscription could be paged out of view behind several abandoned/incomplete checkouts. `checkUserActiveMembership` keeps its signature, memo, and fail-closed catch, now delegating to the new helper.
- **BUG-07 (Task 3):** `startLogin` in `src/pages.jsx` now takes an `interval` parameter (defaulted to the current `billing` state), and `startCheckout`'s 401 branch passes its own `interval` through — so the visitor's chosen billing period survives a forced re-login instead of being silently swapped for stale closure state.
- **BUG-08 (Task 3):** New `lib/cache.js` `createTtlCache({ttlMs, maxEntries})` — get/set with live-hit lookup, expired-entry deletion, and oldest-first eviction at capacity. Both `lib/membership.js`'s entitlement memo and `lib/account.js`'s status memo now instantiate it (60s TTL, 500-entry cap each, kept as separate instances so checkout-session and Stripe-customer keys never collide). The legacy TTL constant and comment in `lib/membership.js` survive verbatim.
- **BUG-09 (Task 3):** `src/print-app.jsx` now passes explicit `user={null}` and `authReady={false}` to both `Nav` and `SubscribePage`, instead of relying on `undefined` accidentally satisfying falsy checks.
- **BUG-10 (Task 3):** New import-free `lib/routes.js` exports `safeReturnTo(raw)`, the one returnTo allowlist validator. Replaced the three independent inline regex copies in `api/auth/google.js`, `api/auth/callback.js`, and `src/components.jsx`'s `Nav`.

## Task Commits

1. **Task 1: Bridge the two membership paths, make the client answer deterministic, and stop malformed cookies from 500ing** - `1f9bf60` (fix)
2. **Task 2: Stop silent profile erasure and stop paging the real subscription out of view** - `6c9b124` (fix)
3. **Task 3: Cleanup — interval fidelity, one cache, explicit print props, one route validator** - `28b13ce` (refactor)

## Files Created/Modified

- `lib/access.js` - New: `hasIssueAccess`, the two-path issue-content gate
- `lib/cache.js` - New: `createTtlCache`, the one bounded TTL cache implementation
- `lib/routes.js` - New: `safeReturnTo`, the one returnTo allowlist validator
- `lib/membership.js` - Decode guard on `readCookie`; entitlement memo now uses `createTtlCache`
- `lib/session.js` - `readSession`'s `try` now wraps the entire function body
- `lib/account.js` - New `hasActiveSubscription` helper; status memo now uses `createTtlCache`
- `lib/db.js` - `upsertUser` coalesces `name`/`picture` against the stored row
- `api/issue/pdf.js` - Gates on `hasIssueAccess` instead of `checkActiveMembership`
- `api/issue/page.js` - Gates on `hasIssueAccess` instead of `checkActiveMembership`
- `api/auth/google.js` - Uses `safeReturnTo` instead of an inline regex
- `api/auth/callback.js` - Uses `safeReturnTo` instead of an inline regex
- `src/app.jsx` - Single deterministic `isMember` resolver replacing two competing effects
- `src/pages.jsx` - `clearMemberLocalState`; `startLogin` interval param; 401 branch passes interval
- `src/print-app.jsx` - Explicit `user`/`authReady` props on `Nav` and `SubscribePage`
- `src/components.jsx` - `Nav` uses `safeReturnTo` instead of an inline regex

## Decisions Made

- `hasIssueAccess` checks the legacy cookie path first (zero Stripe calls when absent) before the account path, matching the plan's cost-ordering rationale.
- `src/app.jsx`'s membership resolver deliberately omits `isMember` from its effect dependency array (read directly instead) to avoid the effect re-triggering on its own state write.
- Sign-out clears only the account-path's localStorage hints, never the httpOnly Stripe member cookie — preserving the legacy device-bound entitlement the regression invariant protects.
- `hasActiveSubscription` stays cache-free and separately exported so the Stripe query is independently testable; `checkUserActiveMembership` owns caching as its own concern.

## Deviations from Plan

None - plan executed exactly as written. All ten findings were fixed exactly as specified in each task's `<action>`, and every `<verify>` probe in all three tasks passed as written.

## Issues Encountered

None.

## Next Phase Readiness

- All 10 findings (BUG-01..BUG-10) fixed and verified; all plan-level regression gates pass (legacy files byte-identical, `lib/membership.js` export surface/cookie-name/active-statuses/behavior unchanged, no dependency drift, both bundles build).
- Manual verification items remain, per the plan's `<verification>` section, for a live deploy: cross-device sign-in, legacy-member-unaffected check, malformed-cookie curl probe, shared-computer sign-out, profile retention on re-sign-in, interval fidelity through Checkout resume, and the print build's rendered nav — all require a live Stripe test-mode deploy, which is out of scope for this quick task's automated execution.
- No blockers for further work; three new shared modules (`lib/access.js`, `lib/cache.js`, `lib/routes.js`) are available for reuse by future phases touching membership gating, TTL caching, or route validation.

---
*Phase: 260901-b1a*
*Completed: 2026-09-01*

## Self-Check: PASSED

All 15 created/modified files confirmed present on disk (lib/access.js, lib/cache.js, lib/routes.js, lib/membership.js, lib/session.js, lib/account.js, lib/db.js, api/issue/pdf.js, api/issue/page.js, api/auth/google.js, api/auth/callback.js, src/app.jsx, src/pages.jsx, src/print-app.jsx, src/components.jsx). All 3 task commit hashes (1f9bf60, 6c9b124, 28b13ce) confirmed present in git log.
