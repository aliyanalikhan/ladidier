---
phase: 260902-mag
plan: "01"
subsystem: magazine
tags: [magazine-reader, subscribe-page, copy, react]
status: human_needed

# Dependency graph
requires:
  - phase: 260901-mbr
    provides: activePlan-driven "Current plan"/"Switch" card relabeling on SubscribePage
  - phase: 260901-1lc
    provides: the member-gated full-issue reader this task's spread view builds on
provides:
  - Two-page spread view in the in-site magazine reader
  - Magazine page bottom section as an image instead of the shared text banner
  - Sitewide removal of "free reading" language/CTAs
  - 4-plan Subscribe page (Plan 1-4) replacing the 3-card + billing-toggle layout
affects: [magazine-page, subscribe-page, home-page, article-page, print-build]
---

# Quick Task 260902-mag Summary

**Status:** human_needed (code-level complete and visually verified under `vite dev`; the reader's live page-fetching and Stripe-driven prices need a real deploy to verify end to end)

Delivered a bundle of magazine/paywall changes:

1. **Spread reader**: the in-site issue reader now shows two facing pages side by side (page 1
   and the last page solo as covers, everything between paired 2+3, 4+5, ...), matching how art
   and headlines actually cross the gutter in the issue. Responsive fallback stacks pages under
   700px width.
2. **Magazine page bottom**: now a full image (the user's supplied astronaut/manifesto graphic)
   with a single membership CTA, replacing the shared text banner — scoped to this one page only.
3. **New highlight**: added the user's supplied photo as a new "Building Vol. 2: A Conversation"
   entry; a second highlight slot is pending a follow-up image from the user.
4. **"Free reading" language removed everywhere it appeared**: the shared bottom-of-page banner
   (Home/Article/Stores/About), Home's hero lede, the Article body, and the Subscribe page's hero
   and FAQ — the FAQ answer in particular was flatly wrong post-260901-1lc (claimed the paywall
   "hasn't arrived yet"), now corrected.
5. **Subscribe page redesigned around 4 explicit plans** (Plan 1: Online Monthly, Plan 2: Hard
   Copy Monthly, Plan 3: Online Yearly, Plan 4: Hard Copy Yearly), replacing the old 3-card +
   shared billing-toggle layout and removing the free Reader tier entirely. No backend or Stripe
   changes — same 4 real products, same `/api/checkout` call shape, so no entitlement risk.

Before writing code, three real ambiguities were resolved with the user via AskUserQuestion
(given this app is now a live payment system per the prior task): whether "1 edition" plans
meant building real one-time purchases (declined — relabeled the existing subscriptions instead,
zero Stripe/checkout risk), what "spread like the other one" referred to (the retired Heyzine
flipbook's feel, rebuilt natively rather than re-integrating the third-party service), and how to
handle a referenced-but-missing 4th image (proceed with the one photo, second pending).

`npm run build` passes. Verified visually in the browser across Home, Magazine, Article, and
Subscribe pages. Not verified: the reader's actual page-fetch behavior and Stripe-driven price
labels against a live member session — both require a real deploy (plain `vite dev` doesn't run
the `/api/*` serverless functions), same category as prior sessions' pending live-deploy checks.
