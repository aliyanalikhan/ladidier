---
phase: 260901-b1a-fix-10-bugs-found-in-code-review-of-comm
verified: 2026-09-01T00:00:00Z
status: human_needed
score: 13/13 must-haves verified (code-level)
behavior_unverified: 0
overrides_applied: 0
human_verification:
  - test: "Cross-device member: sign in on a browser with no legacy member cookie, on an account with an active subscription. Open the Magazine reader and click Download PDF."
    expected: "Both the reader and GET /api/issue/pdf return 200, not 403."
    why_human: "Requires a live deploy with real Google OAuth + Stripe test-mode checkout to exercise the account-linked membership path end to end; not reproducible from static code/unit probes alone."
  - test: "Legacy member unaffected: in a browser holding the legacy member cookie but signed out, open the reader and download the PDF."
    expected: "Both still work (200), confirming the legacy path is bridged, not replaced."
    why_human: "Requires a live deploy and a real completed Checkout Session cookie."
  - test: "curl -i -H 'Cookie: ladidier_session=%E0%A4%A' https://<host>/api/auth/me"
    expected: "200 with a null user, not 500."
    why_human: "Requires a live deployed host; the unit-level readCookie/readSession probes already confirm the underlying decode guard, but this exercises the full serverless route."
  - test: "Shared computer: as a signed-in account-path member, sign out from the Account page, then from the Subscribe page. Inspect DevTools > Application > Local Storage."
    expected: "None of ladidier_member, ladidier_member_checked, ladidier_subscribed remain; Magazine page shows the free teaser."
    why_human: "Requires a real browser session with DevTools inspection; code-level check confirms clearMemberLocalState is called from both handlers, but the end-to-end remount/storage-clear behavior needs visual confirmation."
  - test: "Profile retention: sign out and sign back in with Google."
    expected: "Name and avatar on the Account page are unchanged even if a subsequent id_token omits a claim."
    why_human: "Requires a real Google OAuth round trip; no automated substitute exists for a live OAuth claim shape."
  - test: "Interval fidelity: signed out, pick Monthly, choose a paid plan, complete Google sign-in."
    expected: "Resumed Stripe Checkout shows the monthly price, not yearly."
    why_human: "Requires a live Stripe Checkout session and real OAuth redirect round-trip."
  - test: "Print build: open /print.html."
    expected: "Stacked pages render, print dialog opens, no console error, no sign-in link in the nav."
    why_human: "Visual/browser rendering check; code-level check confirms explicit null/false props are passed, but visual output requires a browser."
---

# Quick Task 260901-b1a: Fix 10 Bugs Found in Code Review Verification Report

**Task Goal:** Fix 10 bugs (BUG-01 through BUG-10) found in code review of commit a850d59 (Phase 7-9 OAuth/database/Stripe-linking/account-page work).
**Verified:** 2026-09-01
**Status:** human_needed
**Branch checked:** `main` (live repo, not a worktree) — commits `1f9bf60`, `6c9b124`, `28b13ce`, merged via `ceca8e9`, all present in `git log`.

## Goal Achievement

All 3 tasks' code-level claims were independently re-verified by reading the actual files on `main` and re-running the plan's own `<verify>` probes as fresh shell invocations (not trusting the executor's self-reported PASS). Every probe passed. Additionally, `npm run build` was re-run and succeeded, producing both `dist/index.html` and `dist/print.html` bundles.

### Observable Truths

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | BUG-01: account-only member gets 200 from issue routes, not 403 | ✓ VERIFIED | `lib/access.js` `hasIssueAccess` falls through to `readSession` + `checkUserActiveMembership` when the legacy check declines; `api/issue/pdf.js`/`api/issue/page.js` both call `hasIssueAccess`. Re-ran probe: `legacy`/`anon`/`bad`/`dead` cases all matched expected (`anon=false, legacy=true, bad=false, dead=false`). |
| 2 | BUG-01: legacy cookie-only member still gets 200 | ✓ VERIFIED | `hasIssueAccess` checks `checkActiveMembership` (legacy) first and returns `true` immediately on a grant — same probe as above, `legacy` case returned `true`. |
| 3 | BUG-01: visitor with neither valid cookie nor linked subscription gets 403 | ✓ VERIFIED | Same probe, `anon` case (`req('')`) returned `false`, mapping to a 403 in both routes' `if (!active)` branch. |
| 4 | BUG-02: isMember settles to one deterministic value, OR of both sources, no second writer can overwrite it | ✓ VERIFIED | `src/app.jsx` has exactly one `useEffect([authReady, user])` that owns `isMember`; both `/api/entitlement` and `/api/account/status` are awaited under a single `Promise.all`, resolved via the documented tri-state table. Grep-confirmed exactly one `Promise.all(` and exactly 2 `setIsMember(true)` occurrences (the resolver's true-branch and the distinct one-shot verify-session effect) — no competing second writer exists. |
| 5 | BUG-03: malformed cookie never produces an unhandled URIError | ✓ VERIFIED | `lib/membership.js` `readCookie` wraps `decodeURIComponent` in try/catch returning `null`; `lib/session.js` `readSession`'s `try` now wraps the entire function body. Re-ran probe: all 4 assertions (decode guard, valid decode, malformed session, empty session) passed. |
| 6 | BUG-04: sign-out from either page clears the 3 localStorage keys | ✓ VERIFIED | `clearMemberLocalState()` defined once in `src/pages.jsx`, called from both `SubscribePage.handleSignOut` (line 830, before a full navigation to `/#subscribe`) and `AccountPage.handleSignOut` (line 1276, before navigation to `/`). Grep-confirmed 3 total call/definition occurrences. |
| 7 | BUG-05: null id_token claim keeps stored profile value | ✓ VERIFIED | `lib/db.js` `upsertUser` conflict branch: `name = coalesce(excluded.name, users.name)`, `picture = coalesce(excluded.picture, users.picture)`, `email = excluded.email` (direct). Grep-confirmed all 3 patterns present exactly once. |
| 8 | BUG-06: active subscription found regardless of abandoned/incomplete history | ✓ VERIFIED | `lib/account.js` exports `hasActiveSubscription({customerId, stripe})`, querying once per `ACTIVE_STATUSES` entry concurrently with `limit: 1`, no `status: 'all'` or `limit: 5` remaining. Re-ran probe: active/empty/trialing cases all matched, and query set never included `'all'`, included both `'active'` and `'trialing'`. |
| 9 | BUG-07: chosen billing interval survives 401 re-login | ✓ VERIFIED | `src/pages.jsx` `startLogin(product, interval = billing)` persists `interval` as `billing` in the stored payload; `startCheckout`'s 401 branch calls `startLogin(product, interval)` with its own `interval` parameter, not the closure's stale `billing` state. Resume effect still destructures `billing: savedBilling`, preserving in-flight sessionStorage intents. |
| 10 | BUG-08: one bounded TTL cache backs both memos | ✓ VERIFIED | `lib/cache.js` `createTtlCache({ttlMs, maxEntries})` implements live-hit get, expired-entry deletion, oldest-first eviction at capacity. `lib/membership.js` and `lib/account.js` both instantiate it (60s TTL, 500-entry cap, separate instances). No raw `new Map` remains in either file. Re-ran probe: cap eviction and TTL expiry both behaved as expected. |
| 11 | BUG-09: print bundle passes explicit auth props, byte-identical output | ✓ VERIFIED | `src/print-app.jsx` passes `user={null} authReady={false}` explicitly to both `Nav` and `SubscribePage`. Grep-confirmed exactly 2 occurrences each. |
| 12 | BUG-10: one shared validator, no per-call-site allowlist copy | ✓ VERIFIED | `lib/routes.js` exports `safeReturnTo(raw)`, import-free. All 3 call sites (`api/auth/google.js`, `api/auth/callback.js`, `src/components.jsx` Nav) import and call it; no leftover inline `a-z]+$` regex found elsewhere. Re-ran probe: all 11 test cases (including uppercase, hyphen, dot, null, undefined, non-string) matched expected fallback behavior. |
| 13 | Regression: entitlement/verify-session/webhook/stripe untouched; membership.js export surface intact | ✓ VERIFIED | `git diff --name-only a850d59 -- api/entitlement.js api/verify-session.js api/webhook.js lib/stripe.js` printed nothing (byte-identical). Re-ran export-surface probe (5 exports, cookie name, active statuses) — PASS. Re-ran `checkActiveMembership` behavior probe (none/cancelled cases) — PASS. `git diff --name-only a850d59 -- package.json package-lock.json` printed nothing (no dependency drift). |

**Score:** 13/13 truths verified at the code level (structural correctness, unit probes, and build all confirmed on `main`). 0 behavior-unverified (all state-transition/race-condition claims — notably BUG-02's "no second writer" and BUG-08's cache eviction — were confirmed either by direct structural absence-of-race inspection or by an executable probe, not presence alone).

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `lib/access.js` | New: two-path issue-content gate | ✓ VERIFIED | Exists, exports `hasIssueAccess`, wired into both issue routes |
| `lib/cache.js` | New: one bounded TTL cache | ✓ VERIFIED | Exists, exports `createTtlCache`, used by 2 callers |
| `lib/routes.js` | New: one returnTo validator | ✓ VERIFIED | Exists, exports `safeReturnTo`, import-free, used by 3 callers |
| `lib/membership.js` | Decode guard + TTL cache swap | ✓ VERIFIED | `readCookie` guarded; `createTtlCache` in use; 5 legacy exports intact |
| `lib/session.js` | `readSession` never-throws restructure | ✓ VERIFIED | `try` wraps entire function body |
| `lib/account.js` | `hasActiveSubscription` extraction + TTL cache swap | ✓ VERIFIED | New export present; `createTtlCache` in use |
| `lib/db.js` | `upsertUser` coalesce | ✓ VERIFIED | Coalesce on name/picture, direct on email |
| `api/issue/pdf.js` | Gate on `hasIssueAccess` | ✓ VERIFIED | Imports and calls it; no direct `lib/membership.js` import |
| `api/issue/page.js` | Gate on `hasIssueAccess` | ✓ VERIFIED | Same as above |
| `api/auth/google.js` | Use `safeReturnTo` | ✓ VERIFIED | Imports and calls it |
| `api/auth/callback.js` | Use `safeReturnTo` | ✓ VERIFIED | Imports and calls it |
| `src/app.jsx` | Single `isMember` resolver | ✓ VERIFIED | One effect, one `Promise.all`, tri-state resolution |
| `src/pages.jsx` | `clearMemberLocalState` + interval fidelity | ✓ VERIFIED | Both present and wired |
| `src/print-app.jsx` | Explicit print props | ✓ VERIFIED | `user={null} authReady={false}` on both components |
| `src/components.jsx` | Use `safeReturnTo` in Nav | ✓ VERIFIED | Imports and calls it |

### Key Link Verification

| From | To | Via | Status |
|------|----|----|--------|
| `api/issue/pdf.js`, `api/issue/page.js` | `hasIssueAccess` (`lib/access.js`) | direct call | ✓ WIRED |
| `hasIssueAccess` | `checkActiveMembership` OR `readSession` + `checkUserActiveMembership` | internal logic | ✓ WIRED |
| `lib/session.js` `readSession` | `lib/membership.js` `readCookie` | decode guard dependency | ✓ WIRED |
| `src/app.jsx` resolver | `isMember` → `MagazinePage`/`AccountPage` | prop passing | ✓ WIRED |
| `SubscribePage.handleSignOut`, `AccountPage.handleSignOut` | `clearMemberLocalState` | direct call | ✓ WIRED |
| `lib/cache.js` `createTtlCache` | `lib/membership.js`, `lib/account.js` memos | instantiation | ✓ WIRED |
| `api/auth/google.js`, `api/auth/callback.js`, `src/components.jsx` Nav | `safeReturnTo` (`lib/routes.js`) | import + call | ✓ WIRED |
| `lib/account.js` `checkUserActiveMembership` | `hasActiveSubscription` → `ACTIVE_STATUSES` | delegation | ✓ WIRED |

### Regression Invariant (independently re-run)

| Check | Command | Result |
|-------|---------|--------|
| Legacy files byte-identical | `git diff --name-only a850d59 -- api/entitlement.js api/verify-session.js api/webhook.js lib/stripe.js` | Empty — PASS |
| membership.js export surface | node probe (5 exports, cookie name, active statuses) | PASS |
| Legacy entitlement behavior | node probe (none/cancelled cases) | PASS |
| No dependency drift | `git diff --name-only a850d59 -- package.json package-lock.json` | Empty — PASS |
| Both bundles build | `npm run build` | PASS — emitted `dist/index.html`, `dist/print.html`, main + print JS/CSS chunks |

### Behavioral Spot-Checks (re-run fresh, not trusting executor)

| Behavior | Command | Result | Status |
|----------|---------|--------|--------|
| readCookie/readSession decode guard | node probe | PASS | ✓ PASS |
| hasIssueAccess OR-gate + fail-closed | node probe | PASS | ✓ PASS |
| hasActiveSubscription per-status query | node probe | PASS | ✓ PASS |
| createTtlCache cap eviction + TTL expiry | node probe | PASS | ✓ PASS |
| safeReturnTo 11-case table | node probe | PASS | ✓ PASS |
| Structural grep gates (all 3 tasks) | shell grep counts | all matched expected counts | ✓ PASS |
| Debt-marker scan (15 modified files) | grep for TBD/FIXME/XXX/TODO/HACK/PLACEHOLDER | no matches | ✓ PASS |
| Full build | `npm run build` | succeeded, both entries | ✓ PASS |

### Requirements Coverage

| Requirement | Description | Status | Evidence |
|-------------|-------------|--------|----------|
| BUG-01 | Issue routes honor account-based membership | ✓ SATISFIED | `lib/access.js` + issue route wiring |
| BUG-02 | Deterministic isMember resolution | ✓ SATISFIED | Single resolver in `src/app.jsx` |
| BUG-03 | readCookie/readSession never throw | ✓ SATISFIED | Decode guard + try restructure |
| BUG-04 | Sign-out clears localStorage membership hints | ✓ SATISFIED | `clearMemberLocalState` wired to both handlers |
| BUG-05 | Null OAuth claims don't erase profile | ✓ SATISFIED | Coalesce in `upsertUser` |
| BUG-06 | Active subscription not paged out of view | ✓ SATISFIED | `hasActiveSubscription` per-status queries |
| BUG-07 | Billing interval survives re-login | ✓ SATISFIED | `startLogin`/`startCheckout` interval threading |
| BUG-08 | One bounded TTL cache implementation | ✓ SATISFIED | `lib/cache.js` used by both memos |
| BUG-09 | Print bundle explicit auth props | ✓ SATISFIED | `src/print-app.jsx` explicit props |
| BUG-10 | One shared returnTo validator | ✓ SATISFIED | `lib/routes.js` used by all 3 call sites |

### Anti-Patterns Found

None. All 15 created/modified files scanned clean of TBD/FIXME/XXX/TODO/HACK/PLACEHOLDER markers and other stub indicators.

### Human Verification Required

The plan's own `<verification>` section explicitly defers 7 checks to "Manual verification (after deploy)" because they require a live production/staging deployment with real Google OAuth and Stripe test-mode credentials — none of which is available in this static-code verification pass. These are NOT code defects; they are end-to-end runtime confirmations the plan itself scheduled for post-deploy. Listed in frontmatter `human_verification` above:

1. Cross-device member access (BUG-01/BUG-02) via live deploy
2. Legacy member unaffected (BUG-01) via live deploy
3. Malformed cookie curl against production host (BUG-03)
4. Shared-computer sign-out DevTools inspection (BUG-04)
5. Profile retention via real Google sign-in round trip (BUG-05)
6. Interval fidelity via live Stripe Checkout resume (BUG-07)
7. Print build visual/console check at `/print.html` (BUG-09)

### Gaps Summary

No code-level gaps found. All 10 bugs (BUG-01 through BUG-10) are fixed exactly as the plan specified, verified by direct source inspection (not trusting SUMMARY.md claims) and by independently re-running every unit-level `<verify>` probe from the plan as fresh shell invocations — all passed. The regression invariant holds: `api/entitlement.js`, `api/verify-session.js`, `api/webhook.js`, and `lib/stripe.js` are byte-identical to commit `a850d59`, `lib/membership.js` keeps its full export surface/cookie name/active-status set/behavior, and no dependency drift occurred. `npm run build` succeeds for both entry points. The `human_needed` status reflects only the 7 live-deploy manual checks the plan itself scheduled for after deployment — not any defect found in this verification pass.

---
*Verified: 2026-09-01*
*Verifier: Claude (gsd-verifier)*
