---
phase: 260901-fnc
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - api/auth-router.js
  - api/account-router.js
  - api/issue-router.js
  - vercel.json
  - lib/access.js
  - lib/membership.js
  - lib/routes.js
---

# Quick Task: fix Vercel deploy failure — over the Hobby plan's 12 Serverless Functions cap

## Trigger

Push of `main` (commit `13155f5`) failed to deploy on Vercel with:

> Build Failed
> No more than 12 Serverless Functions can be added to a Deployment on the Hobby plan. Create a team (Pro plan) to deploy more.

The `api/` directory had grown to 14 files (one Vercel Function each): `api/auth/{google,callback,logout,me}.js`, `api/account/{portal,status}.js`, `api/issue/{page,pdf}.js`, plus `api/address.js`, `api/checkout.js`, `api/entitlement.js`, `api/prices.js`, `api/verify-session.js`, `api/webhook.js`.

## Approach

Consolidate the three multi-file route groups (auth, account, issue) into one physical Vercel Function each, using `vercel.json` `rewrites` to preserve every existing public URL byte-for-byte:

- `api/auth/{google,callback,logout,me}.js` (4 files) → `api/auth-router.js` (1 file)
- `api/account/{portal,status}.js` (2 files) → `api/account-router.js` (1 file)
- `api/issue/{page,pdf}.js` (2 files) → `api/issue-router.js` (1 file)

Each router dispatches on an `action` query param that `vercel.json` rewrites inject from the URL path segment (e.g. `/api/auth/google` → `/api/auth-router?action=google`), matching Vercel's documented `:param` rewrite pattern (their own `/resize/:width/:height` → `/api/sharp` example passes segments the same way). Rewrites only apply once the literal file no longer exists on the filesystem, so the four/two/two original files were deleted.

Left untouched: `api/address.js`, `api/checkout.js`, `api/entitlement.js`, `api/prices.js`, `api/verify-session.js`, `api/webhook.js` — 6 flat, unrelated functions. Total function count: 9 (was 14), leaving headroom under the 12 cap.

`vercel.json`'s existing `functions["api/issue/*.js"].includeFiles` (needed so the two content PDF/JPG bundles ship with the function) was retargeted to `api/issue-router.js`.

## Verification

- `node --check` on all three new router files — passes.
- `npm run build` — succeeds, same output shape as before.
- Grepped `src/*.jsx` for every `/api/...` fetch call used by the frontend (`/api/auth/me`, `/api/auth/google?returnTo=`, `/api/auth/logout`, `/api/account/status`, `/api/account/portal`, `/api/issue/page?n=`, `/api/issue/pdf`) — all public paths are unchanged; only the underlying function file moved.
- OAuth `redirect_uri` (`${origin}/api/auth/callback`) and the `stateCookie`/`clearStateCookie` `Path=/api/auth` scoping are both based on the *public* URL, which rewrites don't change — no Google Cloud Console update needed.
