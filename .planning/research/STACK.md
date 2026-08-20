# Stack Research

**Domain:** Client-side conversion copy/CTA rework + hidden-perks discovery mechanic (zero-build React CDN site)
**Researched:** 2026-08-20
**Confidence:** HIGH

## Recommended Stack

### Core Technologies

No new core technologies are required. The copy/CTA rework is a content and CSS change to existing JSX (`pages.jsx`, `components.jsx`). The hidden-perks mechanic is fully achievable with browser-native APIs already in use elsewhere in this codebase — adding any library (even via CDN `<script>`) would be scope creep against the milestone's own constraint ("no npm, no build tools") and against the "unobtrusive by design" / "not a gamified system" requirement.

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| Web Storage API (`localStorage`) | Native (all evergreen browsers) | Persist "perk found" state across visits | Already the project's exact pattern — `app.jsx:50` reads `ladidier_subscribed` via `localStorage.getItem` in a `useState` lazy initializer, and `pages.jsx:481,766` write it via `localStorage.setItem`. Reuse this identical pattern for a new `ladidier_perk_found` (or similarly named) key — zero new concepts for the codebase to carry. |
| `IntersectionObserver` | Native (all evergreen browsers) | Trigger a reveal only when the hidden element scrolls into view | Already used twice in `ornaments.jsx` (`CountUp`, `RomanReveal`) for scroll-triggered animation. This is the established "reveal on scroll" primitive in this project — reuse it rather than inventing a new one. |
| CSS custom properties + `mousemove` listener | Native | Cursor-driven, hover-triggered subtle reveal (e.g. a gold glow that "finds" the perk under the cursor) | Already implemented as the `Spotlight` component in `ornaments.jsx:135-153`, which tracks `--mx`/`--my` CSS vars from `mousemove` and is consumed by `.spotlight` in `styles.css:739-747`. The same technique (container-relative mouse tracking → CSS var → `background: radial-gradient(...)`) is the natural mechanism for a "you have to notice it" discovery element. |
| CSS `@keyframes` + `transition` | Native | Reveal/hide animation (fade, scale, shimmer) for the perk element and its popover | Matches every existing animation in `styles.css` (`stgIn`, `lrDraw`, `floaty`, `drift`, `pageFade`, `mobileOverlayIn/Out`) — all hand-written CSS keyframes, no animation library anywhere in the codebase. |
| `prefers-reduced-motion` media query | Native | Disable/simplify the reveal animation for users who request reduced motion | Already respected at `styles.css:917-920` for `.stg-i`, `.lr-draw path`, marquees, tickers. Any new reveal animation must be added to that existing media query block, not skipped. |

### Supporting Libraries

None. There is no supporting-library gap for this milestone — see "What NOT to Use" below for the libraries that were considered and rejected.

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| — | — | — | No additions needed; all required behavior is covered by native Web APIs already patterned in this codebase. |

### Development Tools

No new tools. Continue editing `.jsx` files directly and testing via the existing zero-build `Ladidier Portal.html` (React 18.3.1 UMD + Babel standalone 7.29.0 in-browser JSX transform, both loaded via `unpkg` with SRI `integrity` hashes — confirmed unchanged in `Ladidier Portal.html:16-18`).

| Tool | Purpose | Notes |
|------|---------|-------|
| Browser DevTools → Application → Local Storage | Manually clear/inspect `ladidier_perk_found` during testing | Same workflow already used for `ladidier_subscribed`. |
| Browser DevTools → Rendering → Emulate `prefers-reduced-motion` | Verify the perk reveal degrades correctly | Required check given the existing reduced-motion contract in `styles.css`. |

## Installation

```bash
# No installation required.
# This is a zero-build project: React 18, ReactDOM 18, and Babel standalone
# are already loaded via <script> tags with Subresource Integrity hashes in
# "Ladidier Portal.html". No package.json, no npm install, no bundler.
# All new code for this milestone is added directly to existing .jsx files.
```

## Alternatives Considered

| Recommended | Alternative | When to Use Alternative |
|-------------|-------------|--------------------------|
| Native CSS `:hover` / `mousemove` reveal (extends `Spotlight` pattern) | `framer-motion` / `react-spring` via CDN `<script>` | Only if the project ever adopts a build step — these libraries assume ES module bundling for tree-shaking and don't have a clean, small UMD CDN story. Not appropriate here. |
| Native CSS keyframes for reveal/sparkle | `canvas-confetti` (CDN, ~3.5KB gzip, MIT, no deps) | Only if the brand direction explicitly wants a literal confetti burst. Confirmed viable via jsDelivr/unpkg CDN with no build step if ever needed — but the milestone brief explicitly says "not a gamified system" and "unobtrusive," and a confetti burst reads as playful/gamified, which conflicts with the luxury-editorial tone already established by the existing gold-glow/laurel-draw ornament vocabulary. Recommend against for this milestone. |
| Static, single hardcoded discount code string | Client-side "generated" per-visit code (`crypto.randomUUID()`, random alphanumeric, etc.) | Only if there is a backend or third-party service (e.g., Shopify, a coupon API) to validate codes against. This project has no backend (explicitly out of scope in `PROJECT.md`), so a per-user "generated" code cannot be validated by anyone downstream — it would look real but be functionally meaningless, which is worse than a plain static code. A single static/rotating-by-hand code (e.g. `LADIDIER15`) that store staff can honor manually is the honest, working pattern for a static site. |
| `localStorage` boolean flag, same shape as `ladidier_subscribed` | `sessionStorage`, cookies, or a custom "perk state" context/reducer | `sessionStorage` would forget the perk on tab close (undesirable — a "found perk" should stay found). Cookies add server-round-trip overhead and consent-banner concerns for zero benefit on a static site. A dedicated context/reducer is unnecessary architecture for one boolean flag when the sibling `isSubscribed` flag already lives as plain `useState` + `localStorage` in `app.jsx`. |
| Native `<details>`/`<summary>` as an *option* for the reveal container | Custom `useState`-driven show/hide `<div>` | `<details>` gives free keyboard/screen-reader accessibility for the "opened" state, but its default disclosure triangle and browser-styling quirks fight the bespoke gold/serif aesthetic. Recommend a controlled `<div>` (matching how every other overlay in this app, e.g. mobile nav, is built) unless accessibility auditing later flags a gap. |

## What NOT to Use

| Avoid | Why | Use Instead |
|-------|-----|--------------|
| Any new npm package, even "install later" | Milestone constraint is explicit: "no npm, no build tools." Adding a package.json now creates a half-migrated state (some code assumes a bundler, most doesn't) and breaks the project's core selling point of zero-build simplicity. | Native browser APIs, or a CDN `<script>` with pinned version + SRI hash only if genuinely unavoidable (none needed this milestone). |
| A "real" discount-code generation/validation scheme (HMAC-signed codes, per-user codes, expiry logic) | There is no backend to check signatures or expiry against, and the milestone explicitly excludes backend/API work. Building crypto-flavored code generation with no server to validate it is false security theater — it looks functional but validates nothing. | One static, human-readable code (or a small fixed set of them) that staff can honor manually; treat it as marketing copy, not a security mechanism. |
| Gamification primitives (progress bars, "X of Y perks found," collectible badges, leaderboards) | Explicitly out of scope per `PROJECT.md`: "Multiple/gamified hidden perks system (leaderboards, collection mechanics) — this milestone ships one working discovery mechanic." | A single discovery element, single reveal, single localStorage flag. |
| Third-party animation/confetti/particle libraries loaded via CDN | Adds an external network dependency (with its own CDN uptime risk) and a tone (playful/gamey) that doesn't match the luxury-editorial ornament vocabulary already established. Also inconsistent with the fact that zero external libraries beyond React/Babel exist in this codebase today. | Extend `ornaments.jsx` with a small hand-drawn SVG "spark"/shimmer component in the same style as `Laurel`/`Flourish`/`DecoCorner`, animated with a new CSS `@keyframes` block. |
| A generic analytics/AB-testing SDK to "measure conversion" | Not requested in `PROJECT.md` requirements, and pulling in an SDK for this milestone is scope creep beyond "copy rewrite + CTA + hidden perk." | If conversion measurement is wanted later, treat as a separate, explicitly-scoped milestone decision — Vercel Analytics (already compatible with static Vercel deployments) would be the lowest-friction native option if/when requested. |
| Building the "hidden perk" as a new top-level route (`#perks`) or nav item | Milestone constraint: "must not add visible clutter, extra nav items, or interrupt the shopping/browsing flow." A route implies discoverability via navigation, which defeats "hidden." | An in-page element embedded inside an existing ornament/section on Home, Stores, or Magazine, revealed only by hover/scroll-into-view/click — no routing change, no nav change. |

## Stack Patterns by Variant

**If the reveal trigger is hover-based (desktop-first):**
- Extend the existing `Spotlight` pattern (`ornaments.jsx:135-153`) — track `mousemove` over a container, expose `--mx`/`--my` CSS vars, and gate the perk's opacity/`pointer-events` on proximity to a fixed target point (e.g. `Math.hypot` distance check on mousemove) rather than a literal `:hover` on a tiny element (which is hard to hit and thus hard to test, not "subtle-but-findable").
- Pair with a `touchstart`/long-press fallback for mobile, since hover doesn't exist there (see next variant).

**If the reveal trigger needs to work on mobile/touch (the responsive layouts from v1.0 must be preserved):**
- Use a tap-and-hold (`touchstart` + timer, cancel on `touchend`/`touchmove`) or double-tap on the same ornament element, not a hover-only mechanism — hover has no equivalent on touch devices and the perk must be reachable on the mobile layouts already shipped in Phase 2.
- Keep the same `IntersectionObserver` scroll-reveal gate on both desktop and mobile so the element only becomes interactive once it's actually been scrolled into view (avoids a dead hotspot the user never scrolls past).

**If the perk's payload is a discount code:**
- Render it as inline text plus a "Copy code" button using `navigator.clipboard.writeText()` — native Clipboard API, requires a secure context (HTTPS), which the existing Vercel deployment already satisfies. No fallback library needed; `document.execCommand('copy')` is deprecated and unnecessary here.

**If the perk's payload is a magazine-subscribe prompt instead of a code:**
- Reuse the existing `ladidier_subscribed` flag/flow from `app.jsx`/`pages.jsx` rather than building a second subscribe mechanism — the perk reveal should just surface the same subscribe CTA/form already validated in v1.0's `SubscribePage`, in a more premium/gift-like wrapper.

## Version Compatibility

| Package A | Compatible With | Notes |
|-----------|------------------|-------|
| React 18.3.1 (UMD, `unpkg`, SRI-pinned) | Babel standalone 7.29.0 (UMD, `unpkg`, SRI-pinned) | Confirmed unchanged in `Ladidier Portal.html:16-18` — this milestone does not touch these versions or the script-loading order (`ornaments.jsx` → `components.jsx` → `pages.jsx` → `app.jsx`, each `type="text/babel"`). New hidden-perk code should load in the same order (helper components in `ornaments.jsx`, page-level wiring in `pages.jsx`/`app.jsx`) to avoid `ReferenceError`s from Babel's in-browser, load-order-dependent global evaluation. |
| `IntersectionObserver` | All evergreen browsers (Chrome, Firefox, Safari, Edge) | No polyfill present or needed in this codebase; already relied on unconditionally in `ornaments.jsx`. |
| `navigator.clipboard.writeText()` | Secure contexts only (HTTPS) | Vercel deployment (`vercel.json` present, confirmed live per `PROJECT.md`) is HTTPS by default — no gap. |

## Sources

- Direct codebase inspection (`app.jsx`, `ornaments.jsx`, `pages.jsx`, `styles.css`, `Ladidier Portal.html`) — HIGH confidence, this is the authoritative source for "what pattern to reuse."
- [MDN: Clipboard.writeText()](https://developer.mozilla.org/en-US/docs/Web/API/Clipboard/writeText) — HIGH confidence, confirms secure-context requirement, satisfied by existing Vercel HTTPS deployment.
- [canvas-confetti on jsDelivr](https://www.jsdelivr.com/package/npm/canvas-confetti) / [UNPKG](https://unpkg.com/browse/canvas-confetti@1.6.0) — MEDIUM confidence (WebSearch, cross-referenced across jsDelivr/unpkg/cdnjs/GitHub listings), used only to confirm this alternative is CDN-viable before recommending against it on tone/scope grounds, not stack grounds.
- `.planning/PROJECT.md` — HIGH confidence, source of milestone constraints ("no npm, no build tools," "hidden perks must stay hidden," backend explicitly out of scope).

---
*Stack research for: LaDidiér Portal v1.1 — Shopping Mall Conversion Pass*
*Researched: 2026-08-20*
