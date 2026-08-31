---
phase: quick-260901-1lc
plan: 01
subsystem: full-stack
tags: [react, api, stripe, entitlement, security]

requires: []
provides:
  - Member-gated in-site issue reader (IssueReader modal, 62 pages)
  - Member-gated PDF download of the full issue
  - Shared checkActiveMembership() helper in lib/membership.js
  - Compressed web-appropriate copies of the ÉCLAT Vol. 2 PDF (content/, not public/)
affects: [magazine-page, api]

actuals:
  tokens: 9000
  tasks: 1
  commits: 1

tech-stack:
  added: []
  patterns:
    - "Gated static content served from content/ (outside public/) through an API route that checks entitlement before reading the file from disk — the only way client-side hiding of a download/reader link becomes a real gate rather than security theater"
    - "React portal (createPortal to document.body) for any fixed-position modal mounted inside a page whose root carries a transform-animating class (.page-fade) — a transform-animation ancestor creates a new containing block that breaks position:fixed for descendants"
    - "Per-warm-instance short-TTL memoization (checkActiveMembership's entitlementCache) for a Stripe entitlement check that could otherwise be called dozens of times in one reading session"

key-files:
  created:
    - api/issue/pdf.js
    - api/issue/page.js
    - content/eclat-vol2-issue.pdf
    - content/eclat-vol2-pages/page-01.jpg through page-62.jpg
  modified:
    - lib/membership.js
    - vercel.json
    - src/app.jsx
    - src/pages.jsx
    - src/styles.css

key-decisions:
  - "Confirmed with the user via AskUserQuestion before building: both an in-site reader AND a PDF download (not just one); orchestrator compresses the 188MB source PDF itself (not asked to wait for a pre-compressed file); Reader (free) plan's pricing-card copy left untouched."
  - "content/ chosen over public/assets/ specifically so the files are not directly fetchable — a static public/ asset cannot be gated by any server-side check, since Vite/Vercel serves it to anyone who knows the URL regardless of client-side isMember logic."
  - "checkActiveMembership factored into lib/membership.js as an ADDITIVE export, not a refactor of api/entitlement.js — that route's existing behavior must keep working byte-for-byte per a standing project rule from an earlier plan."
  - "No distinction made between Online and Hard Copy subscribers for digital access — matches the Hard Copy pricing card's own existing copy ('Everything in Online' is its first bullet), so treating any active subscription as entitled is correct, not an oversight."
  - "vercel.json's functions.includeFiles added explicitly rather than trusting Vercel's automatic file tracing, because the page image filename is built from a runtime query parameter (page-${n}.jpg), which static analysis cannot follow — untested assumption here since it can only be confirmed on a real Vercel deploy, flagged as the one open risk in this task."

patterns-established:
  - "Any future member-gated downloadable/servable asset should follow this same content/ + API-route-with-entitlement-check shape, not a public/ file with a client-side check."

requirements-completed: []

coverage:
  - id: D1
    description: "A member (valid active-subscription cookie) can read all 62 pages in-site and download a PDF of the full issue"
    verification:
      - kind: other
        ref: "Visual/functional test via Vite dev server with localStorage.ladidier_member spoofed (client-side render path only — see D2 for the actual server-side gate verification); reader modal opened centered, Next advanced the page counter to 2/62, Close closed it"
        status: pass
    human_judgment: true
    rationale: "Did not test an actual paid Stripe checkout end-to-end (would require a real charge); the entitlement mechanism itself is a reuse of api/entitlement.js's already-production logic, not new untested code, but the full paid path was not walked live"
  - id: D2
    description: "Nobody without a verified active Stripe subscription can reach the PDF or any page image, even with a forged cookie or a guessed URL"
    verification:
      - kind: other
        ref: "curl against local `vercel dev`: no cookie -> 403 on both routes; garbage/forged member cookie -> still 403 (fails closed); invalid `n` (0, 63, non-numeric, path-traversal string, null byte) all rejected — auth checked before any file-path logic runs"
        status: pass
    human_judgment: false
  - id: D3
    description: "Free-visitor Magazine page experience is unchanged"
    verification:
      - kind: other
        ref: "Browser screenshot comparison before/after clearing the isMember spoof — cover + 6 highlights + 'Want to turn every page? ... launching soon' + 'Order this issue' CTA all pixel-identical to the pre-existing state"
        status: pass
    human_judgment: false
  - id: D4
    description: "npm run build succeeds; api/entitlement.js and api/verify-session.js are untouched"
    verification:
      - kind: other
        ref: "npm run build exit 0 after every change; git diff confirms neither file was touched"
        status: pass
    human_judgment: false

duration: ~45min
completed: 2026-09-01
status: complete
---

# Quick Task 260901-1lc: Gate ÉCLAT Vol. 2 Full Issue Behind Membership Summary

**Fixed the gap surfaced in conversation** — subscribing to ÉcLAT Online charged a real recurring
Stripe subscription but delivered no visible benefit, because `MagazinePage` no longer took an
`isMember` prop at all once the old interactive-flipbook paywall was retired. Members now get an
in-site page-by-page reader (62 pages) and a PDF download of the full ÉCLAT Vol. 2 issue, both
gated by a real server-side check against the same Stripe-backed entitlement system the site
already uses — not a client-side-only "hide the button" gate.

## What Was Built

- **`content/eclat-vol2-issue.pdf`** (15.3MB) and **`content/eclat-vol2-pages/page-01.jpg`...`page-62.jpg`**
  (~15MB total) — re-rendered from the 188MB source PDF at web-appropriate quality (1200px wide,
  JPEG quality 72). Deliberately placed outside `public/` so no static URL can reach them.
- **`lib/membership.js`**: added `checkActiveMembership(request, stripe)`, reusing
  `api/entitlement.js`'s exact session-cookie -> Stripe -> subscription-status logic, with a 60s
  per-warm-instance cache so a 62-page reading session doesn't cost 62 Stripe API calls.
  `api/entitlement.js` itself is untouched.
- **`api/issue/pdf.js`**: `GET`, checks entitlement, streams the PDF with
  `Content-Disposition: attachment` or 403s.
- **`api/issue/page.js`**: `GET ?n=`, checks entitlement, validates `n` as a bounded integer
  before it ever touches a file path (the filename is always a literal `page-${padded}.jpg`
  template, never the raw query value — path traversal is prevented by construction), returns
  the JPEG or 403/400s.
- **`vercel.json`**: added `functions["api/issue/*.js"].includeFiles: "content/**"` so Vercel's
  file tracing (which can't follow a runtime-computed filename) still ships the content directory.
- **`src/app.jsx`**: `isMember` passed back into `MagazinePage` at the route switch.
- **`src/pages.jsx`**: new `IssueReader` modal component (fetches one page image at a time via
  `fetch` + object URL, Prev/Next/Escape navigation, Close), and `MagazinePage`'s cover section
  now branches on `isMember` — members see "Read the full issue →" / "Download PDF"; everyone
  else sees the existing "launching soon" / "Order this issue" state, unchanged.
- **`src/styles.css`**: new `.reader-*` classes for the modal, following the file's existing
  design-token conventions.

## Bug Found And Fixed During Build

`IssueReader`'s backdrop uses `position: fixed`, but `MagazinePage`'s root
`<div className="page-fade">` carries the site's entry animation
(`animation: pageFade .5s ease both`, which animates `transform`). An ancestor with an active
transform animation establishes a new containing block for `position: fixed` descendants, so the
modal rendered correctly in the DOM tree but landed visually mid-document instead of centered on
screen — reproduced and confirmed via browser screenshot, then fixed by rendering `IssueReader`
through `createPortal(..., document.body)`, mounting it outside the animated subtree entirely
(the same reason the site's mobile nav overlay is mounted at the app root rather than inside a
page).

## Verification

- `npm run build` succeeded after every change.
- `node --check` passed on all three touched/new server files.
- Local `vercel dev` + curl: confirmed the server-side gate fails closed against no cookie, a
  forged cookie, and every malformed/out-of-range `n` value tested (including a path-traversal
  string and a null byte) — auth is checked before page-number validation, so unauthenticated
  callers learn nothing about the valid range either.
- Browser: member-view CTA copy, reader modal (centered, header, page counter, Next/Close),
  and the unchanged free-visitor view all visually confirmed via screenshots, both before and
  after the portal fix.

## Known Gaps (not in scope for this task, flagged for follow-up)

- No one-time, non-subscription "just buy this issue" purchase path exists — raised in an earlier
  conversation turn, unrelated to this fix.
- The Subscribe page still doesn't know if the visitor is already a member, so nothing stops an
  accidental second subscription — also raised earlier, not addressed here.
- Hard Copy and Online subscribers get identical digital access (any active subscription =
  entitled). This matches the Hard Copy pricing card's own "Everything in Online" promise, so it's
  intentional, not a bug — noted here so it isn't mistaken for one later.
- The `vercel.json` `includeFiles` config could only be verified by reading Vercel's documented
  behavior and this project's directory layout — it was not confirmed against an actual production
  deploy in this session. If page images 404 in production after deploying, this is the first
  place to check.

## Issues Encountered

The `.page-fade` / `position: fixed` containing-block bug above — found via browser testing, not
anticipated in advance, fixed with a portal.

---
*Phase: quick-260901-1lc*
*Completed: 2026-09-01*
