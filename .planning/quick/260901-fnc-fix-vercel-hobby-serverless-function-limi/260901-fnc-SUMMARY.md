---
phase: 260901-fnc
plan: "01"
subsystem: infra
tags: [vercel, deploy, serverless-functions, routing]
status: complete

# Dependency graph
requires:
  - phase: 09-account-and-billing-page
    provides: api/auth/*, api/account/*, api/issue/* route handlers being consolidated here
provides:
  - api/auth-router.js — consolidated /api/auth/{google,callback,logout,me} handler
  - api/account-router.js — consolidated /api/account/{portal,status} handler
  - api/issue-router.js — consolidated /api/issue/{page,pdf} handler
  - vercel.json rewrites mapping the old public paths to the new router files
affects: [auth, billing, magazine-reader, deploy]
---

# Quick Task 260901-fnc Summary

**Status:** complete

Fixed the Vercel deploy failure (`main` push blocked by "No more than 12 Serverless Functions can be added to a Deployment on the Hobby plan") by consolidating 3 route groups from 8 files down to 3 router files, dropping the total `api/` function count from 14 to 9. Public URLs are unchanged — `vercel.json` `rewrites` map each old path (`/api/auth/google`, `/api/issue/pdf`, etc.) to its new router file with the matched segment passed through as an `?action=` query param, so no frontend or Google OAuth Console changes were needed.

Deleted: `api/auth/{google,callback,logout,me}.js`, `api/account/{portal,status}.js`, `api/issue/{page,pdf}.js`.
Added: `api/auth-router.js`, `api/account-router.js`, `api/issue-router.js`.
Updated: `vercel.json` (added `rewrites`, retargeted the `issue` `includeFiles` function config to `api/issue-router.js`), and 3 stale file-path comments in `lib/access.js`, `lib/membership.js`, `lib/routes.js`.

`npm run build` passes. Not yet verified on an actual Vercel deploy — that's the next step once this is pushed.
