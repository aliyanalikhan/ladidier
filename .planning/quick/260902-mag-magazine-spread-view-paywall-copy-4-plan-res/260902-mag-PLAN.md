---
phase: 260902-mag
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - src/pages.jsx
  - src/styles.css
  - src/print-app.jsx
  - public/assets/eclat/manifesto-one-love.png
  - public/assets/eclat/highlight-conversation.jpg
---

# Quick Task: magazine spread reader, paywall copy cleanup, 4-plan Subscribe redesign

## Trigger

User request bundled several changes: a two-page "spread" view for the in-site magazine reader
(pages that visually cut across the gutter were being shown split in half); replacing the
Magazine page's bottom text section with a supplied image; adding a supplied photo to the issue
highlights; removing all "free reading" language and CTAs sitewide (the magazine is no longer
free to read); and restructuring the Subscribe page's pricing from a 3-card + billing-toggle
layout into 4 explicit numbered plans.

Two attached images ([Image #3]/[Image #4]) were referenced for highlights but only one came
through — per the user's own choice, only the one photo was added; a second is pending.

## Clarifications resolved before implementing (asked via AskUserQuestion)

1. **"Plans" scope** — the requested scheme (Plan 1: buy 1 edition online, Plan 2: hard copy 1
   edition, Plan 3: 1yr online, Plan 4: 1yr hard copy) implied one-time non-subscription
   purchases, which this app doesn't support (checkout is subscription-mode only; membership
   access is checked via active-subscription status — STATE.md already flags "no one-time
   non-subscription purchase path" as a known gap). User chose: relabel the 4 existing real
   products (Online/Hard Copy × Monthly/Yearly subscriptions) as Plan 1-4, no new Stripe
   products or checkout/entitlement changes. Monthly became "buy 1 edition"'s stand-in (Plans
   1-2), yearly stayed the "1 year subscription" framing (Plans 3-4).
2. **"Spread like the other one"** — nothing named "spread" exists in the codebase. User
   confirmed they meant the visual feel of the retired Heyzine flipbook (STATE.md: retired in
   260831-mis). Built as a native two-page layout in the existing custom `IssueReader`, not a
   re-integration of the third-party Heyzine service.
3. **Missing 4th image** — user chose to add the one photo now (highlights) and send a second
   later.

## Changes

**Magazine reader spread view** (`IssueReader` in `src/pages.jsx`): rewrote page-count-based
pagination (`pageNum`) into spread-based pagination (`spreadIndex` + `pagesForSpread()`). Page 1
(front cover) and page 62 (back cover) show solo; pages 2-61 pair up as 30 facing spreads
(2+3, 4+5, ... 60+61) — matching how the issue is actually laid out, where art/headlines cross
the gutter between two facing pages. Fetches both page images in a spread in parallel. Nav/arrow
keys move by spread, not by page. `.reader-modal` widens to `min(1400px, 96vw)` for a spread
(`.reader-modal-spread`), and stacks to a single column under 700px where two facing pages would
be too small to read (`src/styles.css`).

**Magazine page bottom section** (`MagazinePage`): replaced the shared `<SubscribeBanner/>` call
with a dedicated image section using the user's supplied astronaut/manifesto image
(`public/assets/eclat/manifesto-one-love.png`, saved at its native 1122×1402 aspect ratio so
`background-size: cover` doesn't crop it) plus a single "Discover your membership →" CTA. Only
this one page's bottom section changed — `SubscribeBanner` itself (shared across Home, Article,
Stores, About) keeps its text-based treatment.

**Highlights** (`ISSUE_HIGHLIGHTS`): added one entry using the user's supplied photo
(`public/assets/eclat/highlight-conversation.jpg`) — "Building Vol. 2: A Conversation." A second
highlight slot is pending the user's follow-up image.

**"Free reading" language removed sitewide:**
- `SubscribeBanner` (shared, Home/Article/Stores/About): replaced "Reading is free. Belonging is
  optional." eyebrow and full paragraph with the copy the user supplied as a reference image
  (verbatim: "The World, Curated. Your Place Within It." / the discover-stories paragraph /
  "Enter the World of LaDidiér" lead-in), renamed the CTA button from "Choose your subscription"
  to "Discover your membership →", and removed the second "Continue reading freely →" button
  entirely.
- HomePage `HeroSplit` lede: dropped "Read freely;" from the subscribe pitch.
- `ArticlePage` body: dropped "Read freely." from the closing paragraph.
- `SubscribePage` hero: replaced "Reading is free.<br/>Belonging is by design." with "Belonging
  is by design." alone; rewrote the lede (previously "Every story on Ladidier.com is open...")
  to describe membership benefits instead of claiming free access, since the free Reader tier
  this lede referred to no longer exists (see below).
- `SubscribePage` FAQ: the first question ("When does the paywall arrive?") answered that the
  paywall hadn't happened yet — now stale, since the full issue is already member-gated
  (260901-1lc). Rewritten to state the paywall is live: cover story/Editor's Letter stay public,
  the rest of the issue is for members.

**Subscribe page restructured into 4 explicit plans** (`SubscribePage`): removed the free
"Reader" tier card and the shared Monthly/Yearly billing toggle entirely. Replaced with
`SUBSCRIBE_PLANS`, a fixed array of the 4 real product×interval combinations, each rendered as
its own card (Plan 1: Online Monthly, Plan 2: Hard Copy Monthly — "Limited · 250" badge, Plan 3:
Online Yearly — featured/"Most chosen", Plan 4: Hard Copy Yearly — "Limited · 250" badge).
`priceLabel`/`perLabel` now take explicit `(product, interval)` instead of reading shared
`plan`/`billing` state; `handleSelectPlan`/`startCheckout` take an explicit interval per card
(no behavior change to `/api/checkout` — same `planType` string, same 4 Stripe prices, so no
backend or entitlement changes). The already-shipped "Current plan ✓" / "Switch to this plan →"
member-state relabeling (from 260901-mbr/260901-nbh) now compares both `product` AND `interval`
against `activePlan` to correctly identify which ONE of the 4 cards is active, instead of just
`product` against 2 cards.

**`src/print-app.jsx`**: updated a comment left stale by the free-Reader-tier card's removal (it
referenced a button that no longer exists); no behavioral change.

## Verification

- `npm run build` — succeeds, deterministic output, no console/reference errors.
- Manual browser verification via `vite dev` + Chrome across Home, Magazine, Article, and
  Subscribe pages:
  - `SubscribeBanner`'s new copy renders correctly on Home/Article (eyebrow, paragraph, single
    CTA, no second button) — confirms the shared component change propagates everywhere it's
    used.
  - Magazine page: manifesto image renders uncropped at full size; new highlight card renders
    with the supplied photo, title, and dek.
  - Subscribe page: all 4 plan cards render with correct badges, no billing toggle, no free
    Reader card, updated hero/lede, updated FAQ answer.
- Not verified: the reader's live spread-fetch behavior (needs a real member session + working
  `/api/issue/page`, which don't run under plain `vite dev`) and `/api/prices`-driven price
  labels (same reason) — both are existing, unmodified backend routes, only the frontend
  pagination/rendering changed, so this is a live-deploy check, not a new risk.
