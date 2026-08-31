# Phase 4: Copy & CTA Conversion Pass - Research

**Researched:** 2026-08-20
**Domain:** Pure JSX/copy editing on a zero-build React 18 (CDN) + Babel-standalone luxury editorial/ecommerce site — no new dependencies, no new components, no new state
**Confidence:** HIGH

## Summary

This phase is a content-editing task, not a technology task. Every change happens inside eight existing functions in one 954-line file, `pages.jsx` (`HomePage`, `HeroManifest`, `HeroSplit`, `HeroIndex`, `StoresPreview`, `SubscribeBanner`, `MagazinePage`, `StoresPage`), reusing the existing `.btn` / `.btn.solid` / `.btn.ghost` button classes and the existing `STORES[]` data model (`components.jsx`) which already carries every field needed (`url`, `est`, `cat`, `tagline`). No CSS classes need to be invented; the site's grid layouts (`StoresPreview`'s home-page cards use `repeat(auto-fit, minmax(...))`, which is self-responsive) do not require new mobile media-query work for the heritage-microcopy addition. The milestone-level research already done (`.planning/research/{SUMMARY,FEATURES,PITFALLS}.md`) fully covers voice/tone conventions and CRO pitfalls for this domain — this document does not repeat that, it grounds it against the actual line-by-line code so a planner can write literal task steps.

Direct codebase inspection surfaced two facts that sharpen the CONTEXT.md scope and must inform planning:

1. **`SubscribeBanner` is rendered on five pages, not two.** CONTEXT.md states it's "rendered at the bottom of both `HomePage` and `StoresPage`," but `grep -n "SubscribeBanner" pages.jsx` shows it is also rendered in `MagazinePage` (line 578), `ArticlePage` (line 656), and `AboutPage` (line 946) — five call sites total, one shared function body (lines 339–365). Fixing D-09's dead "Continue reading freely →" button (a functional bug fix) is safe and desirable everywhere it renders. But any CTA-voice rewording of `SubscribeBanner`'s copy (D-01) will be visible on Article and About pages too, even though those pages are explicitly out of scope for this phase (REQUIREMENTS.md "Out of Scope: Copy/CTA rework on About or Article pages"). This is not a blocker — it's the same shared component rendering everywhere, so a tone-consistent edit is not really "rework" of those pages — but the planner should treat `SubscribeBanner`'s copy edit as an explicit, deliberate exception to the About/Article boundary, not an oversight, and word the plan/task so the executor doesn't try to special-case the banner per page (it takes no page-identifying prop to do so cleanly anyway).
2. **A second stale-count bug exists outside this phase's page scope.** `SubscribePage` (line 805, not in this phase's edit list) reads "Access to all 11 stores" — the same class of bug as D-08's "11 Houses," but on a page (`SubscribePage`) that is not one of the eight functions CONTEXT.md scopes this phase to. Flagging as an open item, not an in-scope fix — see Open Questions.

**Primary recommendation:** Treat this as eight targeted, independent JSX edits (one per function), each reusing existing `.btn`/`.btn.solid`/`.btn.ghost` classes and existing `STORES[]`/`ISSUE` data, verified against the specific mobile breakpoints already fighting for specificity in `styles.css` (`.store-row .cat, .store-row .pill { display: none; }` at ≤920px is the one override directly relevant to D-04/D-05).

## Architectural Responsibility Map

This is a single-tier, client-only static site — there is no backend, no SSR, no build step. All work happens in one tier.

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Hero CTA copy/order (Home) | Browser / Client (React CDN, in-browser Babel transform) | — | `pages.jsx` functions render directly in-browser; no server involved |
| Per-store CTA label + heritage microcopy (Stores, Home preview) | Browser / Client | — | Reads static `STORES[]` array already in `components.jsx`, rendered client-side |
| Magazine landing reframe | Browser / Client | — | `MagazinePage` paywall/subscribe logic is pure client-side React state (`useState`, `localStorage`) |
| Dead-CTA fix (`SubscribeBanner`) | Browser / Client | — | Add an `onClick` handler; no new state/route needed, everything is local to the component |
| Stale count fix (D-08) | Browser / Client | — | Either hardcode `14` or compute `STORES.length` — both are pure client-side JS |

## User Constraints (from CONTEXT.md)

### Locked Decisions

- **D-01 (CTA voice):** All new/reworked CTAs use elevated editorial phrasing ("Shop the Houses", "Discover the Directory", "Visit the Boutique"), not literal ecommerce phrasing ("Shop Now", "Browse Categories"). Applies to Home hero CTAs, per-store CTAs, and any subscribe-banner copy touched in this phase.
- **D-02 (Home hero scope):** The copy/CTA rework applies to all 3 hero variants (`HeroManifest`, `HeroSplit`, `HeroIndex` in `pages.jsx`), not just the current default (Split) — toggling the Tweaks-panel hero style must never reveal stale, pre-rework copy.
- **D-03 (CTA order):** In each hero variant, the new shopping-forward CTA is promoted to the first/primary button position, ahead of the existing "Read the issue" / "Open the issue" / directory CTA (which moves to secondary position, not removed).
- **D-04 (Stores list view):** List view (dense single-line rows) stays icon-only (the existing bare "→"), but gets an `aria-label="Visit the Boutique"` (or similar) added for accessibility — do not add visible inline text that would widen the row.
- **D-05 (Stores grid view):** Grid view replaces its current "Enter →" label with "Visit the Boutique →".
- **D-06 (Heritage microcopy on Home):** Est. year + category added to Home's `StoresPreview` cards (`pages.jsx`), which currently show only name + category — this is what "surfaced more prominently" means for this phase. The Stores page's own Est./category display does not need restyling.
- **D-07 (Magazine reframe):** Light touch only — reword `MagazinePage`'s header lede and paywall copy toward a shopping-adjacent framing. Do **not** add a new store cross-sell section or component.
- **D-08 (Stale count bug):** `StoresPreview` on Home reads "The Directory · 11 Houses" but `STORES` has 14 entries. Update to match (or compute from `STORES.length`).
- **D-09 (Dead CTA bug):** `SubscribeBanner`'s "Continue reading freely →" button has no `onClick`. Wire it to a real dismiss/continue affordance.

### Claude's Discretion

- Exact final copy strings (headlines, ledes, button labels beyond the ones explicitly named in D-01/D-05) — draft in the elevated-editorial voice; no further user round-trip needed unless ambiguous.
- Whether "11 Houses" fix becomes a hardcoded "14 Houses" or a computed `{STORES.length} Houses` — prefer computed to prevent future drift; either satisfies the requirement.

### Deferred Ideas (OUT OF SCOPE)

- Explicit store cross-sell section inside Magazine (linking specific articles/stories to the houses that inspired them) — light-touch tone-only reframe chosen instead; revisit in a future milestone if needed.

## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| CTA-01 | Home page has one clear, prominent primary shopping CTA above "Read the issue" | D-02/D-03 mapped to exact line numbers in all 3 hero functions (Code Examples section); `.btn solid` reused for the promoted CTA |
| CTA-02 | Home page copy reads shopping-mall voice, not house-listing/real-estate tone | Voice patterns and worked examples below (Copy & CTA Voice Patterns section), grounded in `.planning/research/FEATURES.md`/`PITFALLS.md` Pitfall 1 |
| CTA-03 | Each store card has "Visit the Boutique →" CTA to `STORES[].url` | `STORES[].url` field confirmed present for all 14 entries (`components.jsx:38-51`); grid-view markup located at `pages.jsx:742` |
| CTA-04 | Stores page intro/section copy reads shopping-mall voice | `StoresPage` header copy located at `pages.jsx:669-681`; voice patterns below |
| CTA-05 | Store cards surface est./category more prominently | D-06 scope clarified to `StoresPreview` (Home) only; `StoresPage`'s own list/grid views already show `est`/`cat` and don't need restyling |
| CTA-06 | Magazine copy reframed to invite shopping without disrupting paywall/subscribe | `MagazinePage` paywall mechanics fully mapped (Integration Points section) — exact lines that must NOT change vs. copy-only lines that may |
| CTA-07 | No dead-end CTAs, every CTA resolves | Friction Audit Findings section below enumerates every CTA/link across the 3 in-scope pages with current destination status |

## Standard Stack

No new libraries, no new dependencies, no version changes. Confirmed via direct inspection of `Ladidier Portal.html`:

| Library | Version | Purpose | Why Standard (for this project) |
|---------|---------|---------|----------------------------------|
| React | 18.3.1 (CDN, `unpkg.com/react@18.3.1`) | UI runtime | Already pinned, no build step, `[VERIFIED: Ladidier Portal.html:16]` |
| @babel/standalone | 7.29.0 (CDN) | In-browser JSX transform | Already pinned, `[VERIFIED: Ladidier Portal.html:18]` |

**Installation:** None required — this phase adds zero packages.

**Version verification:** Not applicable — no `package.json` exists in this repo; the site is deliberately zero-build (confirmed: `ls` shows no `package.json`, `node_modules`, or bundler config at repo root `[VERIFIED: directory listing]`).

## Architecture Patterns

### System Architecture Diagram

```
Browser loads Ladidier Portal.html
        │
        ▼
  <script> tags load in order:
  React CDN → Babel CDN → tweaks-panel.jsx → ornaments.jsx → components.jsx → pages.jsx → app.jsx
        │
        ▼
  app.jsx (hash router) renders one page function from pages.jsx based on route
        │
        ├── route "home"     → HomePage → [HeroManifest | HeroSplit | HeroIndex] (per tweaks-panel setting)
        │                                 → StoreMarquee, Manifesto, FeaturedStories, StoresPreview
        │                                 → SubscribeBanner  ◄─┐
        ├── route "stores"   → StoresPage → list/grid toggle → per-store <a href={s.url}> or onClick(window.open)
        │                                 → SubscribeBanner  ◄─┤  same function,
        ├── route "magazine" → MagazinePage → Heyzine iframe + paywall overlay (useState/localStorage)
        │                                 → SubscribeBanner  ◄─┤  5 render sites,
        ├── route "article"  → ArticlePage → SubscribeBanner  ◄─┤  1 shared body
        └── route "about"    → AboutPage  → SubscribeBanner  ◄─┘
```

A reader following CTA-01 through CTA-07: a user lands on Home → sees a hero (one of 3 variants, chosen by tweaks-panel state) → clicks the newly-primary shopping CTA → routes to Stores → sees each store card with "Visit the Boutique →" → clicks → `window.open(s.url, "_blank")` opens the real external store site. Separately, a user reading Magazine sees reframed copy → hits the existing paywall after 15s/interaction (unchanged mechanic) → subscribes or continues → reaches `SubscribeBanner` at page bottom with a now-functional secondary CTA.

### Recommended Project Structure

No new files. All edits confined to one file:

```
pages.jsx
├── HeroManifest()      # lines 9–57    — D-01, D-02, D-03
├── HeroSplit()          # lines 59–104  — D-01, D-02, D-03 (current default hero, tweaks-panel)
├── HeroIndex()           # lines 106–168 — D-01, D-02, D-03
├── StoresPreview()      # lines 232–264 — D-06, D-08
├── HomePage()            # lines 322–336 — composes the above, no direct copy edits expected
├── SubscribeBanner()    # lines 339–365 — D-01 (voice), D-09 (dead CTA) — shared by 5 pages
├── MagazinePage()        # lines 371–581 — D-07 (light-touch reframe only)
└── StoresPage()          # lines 665–755 — CTA-04 (intro voice), D-04 (list aria-label), D-05 (grid label)
```

`components.jsx` (`STORES[]`, `Footer`, `Nav`) is read-only reference data for this phase — no edits expected there per CONTEXT.md, confirmed by inspection: `STORES[].url`/`.est`/`.cat`/`.tagline` already present for all 14 entries.

### Pattern 1: Reuse `.btn` variants for CTA hierarchy, never invent new button styles

**What:** The codebase has exactly three button treatments: `.btn` (outline/ghost-ish default), `.btn.solid` (filled, highest visual weight), `.btn.ghost` (no border, underline-on-hover, lowest weight). All existing CTAs across `pages.jsx` already use these three classes exclusively.
**When to use:** Every CTA touched in this phase — promoting a CTA to "primary" means giving it `.btn.solid` and first position, not a new color or size.
**Example (current HeroSplit, showing the pattern to extend, not replace):**
```jsx
// Source: pages.jsx:85-86 (existing code, current desktop default hero)
<button className="btn solid" onClick={() => setRoute("magazine")}>Open the issue</button>
<button className="btn ghost" onClick={() => setRoute("subscribe")}>How to subscribe →</button>
```
D-03 requires the shopping CTA to become the new first `.btn.solid`, with the magazine CTA demoted to a secondary treatment (`.btn` or `.btn.ghost`) in second position — not removed, not both left `.solid` (Pitfall 2 in `.planning/research/PITFALLS.md`: "never 2+ solid buttons competing").

### Pattern 2: `STORES[]` already has every field D-05/D-06 need — no data model change

**What:** `components.jsx:38-51` defines all 14 stores with `id`, `name`, `cat`, `tint`, `est`, `tagline`, `img`, `url`. Every CTA/microcopy requirement in this phase is a rendering change against fields that already exist.
**When to use:** Any store-card edit (grid label, list aria-label, home preview heritage microcopy).
**Example:**
```jsx
// Source: components.jsx:38 (existing data, unedited)
{ id: "01", name: "Ladidiér Jewelry", cat: "Jewelry", tint: "blush", est: "MMXXI",
  tagline: "Heirlooms in waiting.", img: IMG.s_jewelry, url: "https://www.ladidierjewelry.com/" },
```

### Pattern 3: Grid-view store CTA edit is a single-line label swap

**What:** The grid view's CTA is currently a static label at the bottom of each card, not a separate button — it's the last `<span>` inside the existing `<a href={s.url}>` card wrapper.
**When to use:** D-05.
**Example — exact current code to change:**
```jsx
// Source: pages.jsx:740-743 (StoresPage, grid view — current code)
<div className="flex between" style={{ marginTop: 18, paddingTop: 14, borderTop: "1px solid var(--line)" }}>
  <span className="mono" style={{ fontSize: 11, color: "var(--mute)" }}>Est. {s.est}</span>
  <span className="mono" style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: ".1em" }}>Enter →</span>
</div>
```
Only the text `Enter →` becomes `Visit the Boutique →`; no structural/class changes needed. The entire card is already `<a href={s.url} target="_blank" rel="noopener noreferrer">` (`pages.jsx:730`), so the CTA already resolves correctly — this is a label-only fix, not a wiring fix.

### Pattern 4: List-view row is icon-only by design — add `aria-label` to the `<a>`/row wrapper, not the arrow span

**What:** D-04 requires the visible arrow to stay bare, but the interactive element needs an accessible name. The list-view row is a `<div className="store-row" onClick={...}>` (not a native `<a>`), so keyboard/screen-reader accessibility for it is a pre-existing gap this phase should not deepen — but D-04 only asks for an `aria-label`, not a full keyboard-accessibility rework (that's a larger, unscoped change; flag if the planner wants to go further, see Open Questions).
**Example — exact current code:**
```jsx
// Source: pages.jsx:708-719 (StoresPage, list view — current code)
<div className="store-row" onClick={() => window.open(s.url, "_blank", "noopener,noreferrer")}>
  <span className="num mono">{s.id}</span>
  <div>
    <div className="name">{s.name}</div>
    <div style={{ color: "var(--mute)", fontSize: 13, marginTop: 4, fontStyle: "italic" }}>{s.tagline}</div>
  </div>
  <span className="cat">{s.cat}</span>
  <span className="pill">Est. {s.est}</span>
  <span className="arrow">→</span>
</div>
```
Add `aria-label="Visit the Boutique — {s.name}"` (or similar, per-store so screen readers get store name, not a generic label repeated 14 times) to the outer `.store-row` div. Note: `window.open(s.url, "_blank", "noopener,noreferrer")` has a bug independent of this phase — the third argument to `window.open` is a comma-separated features string, not `rel` attributes; `"noopener,noreferrer"` as a features string is actually valid syntax for `noopener`/`noreferrer` window features in Chromium/Firefox (this is a legitimate, if slightly unusual, cross-browser-supported pattern) — `[ASSUMED — not verified against MDN in this session; behaves correctly in mainstream browsers per general knowledge, low risk, not blocking, flagged for awareness only]`.

### Pattern 5: `MagazinePage`'s paywall/subscribe mechanics are isolated from its copy — safe to reword around them

**What:** D-07 requires copy-only changes. The paywall logic (`useState`, `useEffect` with `postMessage`/timer/blur listeners, `localStorage.setItem("ladidier_subscribed", "true")`) is entirely separate from the surrounding JSX text nodes.
**When to use:** MagazinePage header lede (`pages.jsx:418-421`) and the paywall gate copy (`pages.jsx:469-473`, `"Subscribe to See All Pages"` heading and its lede) are safe to reword. The `<form onSubmit>` handler (`pages.jsx:476-483`), the `iframe src`, the `useEffect` timer/listener logic (`pages.jsx:375-408`), and the `showPaywall`/`isSubscribed` state wiring must not change.
**Example — safe-to-edit text (do not touch the surrounding structure):**
```jsx
// Source: pages.jsx:414-421 (MagazinePage header — copy-only edit zone)
<div className="eyebrow" style={{ marginBottom: 18 }}>The Magazine</div>
<h1 className="display h2" style={{ margin: 0 }}>
  <em style={{ fontStyle: "italic", color: "var(--gold)" }}>On Luxe</em> &amp; Larger Living.
</h1>
<p className="lede" style={{ marginTop: 28 }}>
  The Spring · Summer issue. Thirty-two stories on the small obsessions that
  make a life. Open to all readers, always.
</p>
```

### Anti-Patterns to Avoid

- **New button colors/shadows for "more emphasis":** Contradicts Pitfall 2 (`.planning/research/PITFALLS.md`) — increase emphasis via position/size/whitespace, reuse `.btn.solid`.
- **Editing `SubscribeBanner`'s `onClick`-wiring bug (D-09) differently per call site:** `SubscribeBanner` takes no page-identity prop; a single fix in the one function body (`pages.jsx:339-365`) automatically applies everywhere it renders — do not add conditional logic branching on which page called it.
- **Treating `StoresPage`'s own Est./category display as needing a rework:** D-06 explicitly scopes heritage-microcopy work to `StoresPreview` (Home) only; `StoresPage` list/grid views already show `est`/`cat` prominently and are out of scope for restyling (though the grid view's CTA label still changes per D-05, and the list view still needs the aria-label per D-04).
- **Adding a new CSS class for the promoted primary CTA:** Not needed — `.btn.solid` already exists and is used elsewhere; reordering + reclassing existing buttons is sufficient for D-03.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| CTA visual hierarchy (primary vs. secondary) | New button component/class | Existing `.btn`, `.btn.solid`, `.btn.ghost` (styles.css:180-192) | Already tuned to the noir/gold palette with hover states; a new class would visually clash (Pitfall 2) |
| "N stores" copy that can't drift again | Hardcoded string re-checked manually each time | `{STORES.length}` computed inline, following the exact pattern already used at `pages.jsx:158` (`+ {STORES.length - 6} more houses inside`) and `pages.jsx:90` (`<CountUp to={14} />`, though that one is still hardcoded) | The codebase already has a precedent for computing store count from the array; reuse it instead of hardcoding a second stale number |
| Store card accessible name | New `<button>` wrapper around the row, restructuring the DOM | Add `aria-label` directly to the existing `.store-row` `<div onClick>` (D-04 scope) | Matches the minimal-change instruction in CONTEXT.md; a full semantic-HTML rework of `.store-row` (div→button/a) is a larger accessibility change outside this phase's stated scope |

**Key insight:** Every "don't hand-roll" item in this phase is really "don't invent a new pattern — the exact pattern needed already exists once in this codebase; find and reuse it."

## Copy & CTA Voice Patterns

Grounded in `.planning/research/FEATURES.md` (luxury copywriting conventions, MEDIUM confidence, WebSearch-verified across multiple sources) and `.planning/research/PITFALLS.md` Pitfall 1, applied concretely to this phase's exact edit sites. These are illustrative drafts satisfying D-01's voice constraint — `[ASSUMED — exact final strings are Claude's-discretion per CONTEXT.md, not locked]`. The *technique* (elevated imperative verbs, house vocabulary, implicit scarcity) is `[CITED: .planning/research/FEATURES.md, PITFALLS.md Pitfall 1]`.

**The core technique:** Replace a bare "browse/read" imperative with a possessive or immersive verb ("Shop," "Enter," "Discover," "Step into") + a house-branded noun ("the Houses," "the Boutique," "the Directory") — never a generic ecommerce noun ("Products," "Categories," "Catalog") and never punctuation-driven urgency (no exclamation points, no ALL CAPS beyond the site's existing `.mono`/`.eyebrow` uppercase-tracking convention, which is a typographic style not an urgency device).

| Edit site | Current copy | Pattern to apply | Illustrative draft (discretion) |
|-----------|--------------|-------------------|----------------------------------|
| `HeroManifest` primary CTA (`pages.jsx:42`) | `Read the issue` (currently primary/`.solid`) | New shopping CTA promoted to `.solid`/first position (D-03); "Read the issue" demoted to `.btn` (non-solid), second position | `Shop the Houses` (new, first, `.solid`) / `Read the issue` (kept, second, `.btn`) |
| `HeroManifest` secondary/existing (`pages.jsx:43`) | `Enter the stores` (`.btn`, second) | Either becomes the new primary CTA's home (recommended: reuse this exact copy for D-03's promoted CTA, since it's already on-voice and already points to `stores`), or stays as a tertiary link | Promote to `.solid`/first: `Enter the stores` — already on-brand, no new string needed |
| `HeroSplit` primary CTA (`pages.jsx:85`) | `Open the issue` (`.solid`, first) | New shopping CTA to first/`.solid`; demote to second/non-solid | `Shop the Houses` (new, first) / `Open the issue` (kept, second, drop `.solid`) |
| `HeroSplit` secondary (`pages.jsx:86`) | `How to subscribe →` (`.ghost`, second) | Keep as tertiary — subscribe should stay subordinate to both shopping and reading per FEATURES.md table-stakes row ("Newsletter/subscribe CTA present but subordinate") | No change needed to this specific button's role, only its visual position may shift right as a third element |
| `HeroIndex` primary CTA (`pages.jsx:135-137`) | `The full directory →` (`.solid`, already routes to `stores`) | Already shopping-forward and already primary — likely needs no reordering, only possible wording alignment with D-01's house-vocabulary style | Could stay as-is, or align to `Shop the Houses →` / `Enter the Boutiques →` for cross-hero consistency — planner's call |
| `StoresPreview` section eyebrow (`pages.jsx:238`) | `The Directory · 11 Houses` (stale count, D-08) | Compute from `STORES.length`; consider whether "Directory" (wayfinding register) or "Boutiques"/"Houses" (shopping register) reads more shopping-forward per CTA-02 | `The Directory · {STORES.length} Houses` (bug fix only) or `Shop the Houses · {STORES.length} Doors` (bug fix + tone) |
| `StoresPreview` CTA (`pages.jsx:243`) | `Open the directory →` | Align to D-01 house vocabulary | `Discover the Directory →` (an explicitly pre-approved D-01 phrase) |
| `StoresPage` header lede (`pages.jsx:678-681`) | "Each store stands on its own. Together, they form the LaDidiér universe — united by craft, by patience, and by a refusal to rush a good thing." | CTA-04: shift from descriptive/editorial-only toward inviting action, while keeping the existing editorial cadence (long sentence, semicolon/em-dash rhythm already established) | Add a closing shopping-forward clause or adjacent CTA, e.g. append "— walk in, and see for yourself." or similar; full rewrite is content work, not a research question |
| `StoresPage` grid CTA (`pages.jsx:742`) | `Enter →` | D-05 locked wording | `Visit the Boutique →` (exact string required by D-05) |
| `MagazinePage` header lede (`pages.jsx:418-421`) | "The Spring · Summer issue. Thirty-two stories on the small obsessions that make a life. Open to all readers, always." | CTA-06: light-touch shopping tie-in without disturbing paywall mechanics — reference the houses that inspired the stories | e.g. append or rework toward "...make a life — the same fourteen houses that inspired them are one click away." (illustrative only) |
| `MagazinePage` paywall gate heading (`pages.jsx:469-471`) | "Subscribe to See All Pages" | Light shopping-adjacent framing without changing the transactional clarity of the paywall ask (it must still clearly mean "subscribe to read more") | Keep transactional clarity; shopping tie-in belongs in the lede/surrounding copy, not the paywall CTA button itself — do not soften "Subscribe to See All Pages"/"Unlock Issue" into vaguer language, since CTA-06 explicitly says "without disrupting the existing paywall/subscribe mechanics," and mechanic clarity is part of that |
| `SubscribeBanner` (`pages.jsx:347-359`) | "Reading is free. Belonging is optional." / "Choose your subscription" / "Continue reading freely →" (dead) | D-01 voice + D-09 bug fix (wire the dead button) | Copy can stay close to current (already on-voice); D-09's fix is functional (`onClick`), not necessarily a rewording — e.g. wire "Continue reading freely →" to smooth-scroll dismiss or simply remove focus/no-op-but-real handler; exact behavior is Claude's discretion per CONTEXT.md D-09 ("no-op scroll-past is fine") |

**Cross-cutting rule for CTA-02/CTA-04 (voice, not just CTA labels):** The existing prose in `HeroSplit`'s lede ("A magazine for the soft-spoken maximalist...") and `StoresPage`'s lede already largely reads in the target voice — CTA-02/CTA-04 are about the CTA/action layer and any remaining real-estate-coded language ("stands on its own," which reads slightly listing-like), not a full prose rewrite. Read each touched paragraph aloud next to its replacement per Pitfall 1's stated mitigation before finalizing.

## Friction Audit Findings

Every CTA/link across the three in-scope pages (`HomePage`, `StoresPage`, `MagazinePage`), current destination status, confirmed by direct code read (not assumption) — this satisfies CTA-07's audit requirement as a starting checklist for the planner:

| Location | Element | Current behavior | Status |
|----------|---------|-------------------|--------|
| `HeroManifest` (`pages.jsx:42-43`) | "Read the issue" / "Enter the stores" | `setRoute("magazine")` / `setRoute("stores")` | Working |
| `HeroSplit` (`pages.jsx:85-86`) | "Open the issue" / "How to subscribe →" | `setRoute("magazine")` / `setRoute("subscribe")` | Working |
| `HeroIndex` (`pages.jsx:135-137, 159-162`) | "The full directory →" / per-store rows / "See all →" | `setRoute("stores")` / `window.open(s.url, ...)` / `setRoute("stores")` | Working |
| `FeaturedStories` (`pages.jsx:182, 188, 201, 218`) | "All stories →" / article cards | `setRoute("magazine")` / `setRoute("article")` | Working (out of this phase's requirement list, but on Home — no action needed, included for completeness) |
| `StoresPreview` (`pages.jsx:243, 249`) | "Open the directory →" / per-store card `<a href={s.url}>` | `setRoute("stores")` / real external link | Working |
| `SubscribeBanner` (`pages.jsx:358-359`) | "Choose your subscription" / "Continue reading freely →" | `setRoute("subscribe")` / **no `onClick` — dead** | **D-09 confirmed bug — must fix** |
| `StoresPage` list view (`pages.jsx:708`) | Row click | `window.open(s.url, "_blank", "noopener,noreferrer")` | Working (needs `aria-label` per D-04, not a destination fix) |
| `StoresPage` grid view (`pages.jsx:730`) | Card `<a href={s.url}>` | Real external link | Working (needs label text swap per D-05, not a destination fix) |
| `StoresPage` view toggle (`pages.jsx:683-694`) | "Index" / "Gallery" buttons | `setView("list")` / `setView("grid")` | Working, in-page state, not a navigation CTA |
| `MagazinePage` paywall form (`pages.jsx:476-490`) | "Unlock Issue" | `setIsSubscribed(true)` + `localStorage.setItem` | Working — do not touch |
| `MagazinePage` preview indicator (`pages.jsx:525-541`) | "Subscribe to See All →" | `setShowPaywall(true)` | Working |
| `MagazinePage` cover-story panel (`pages.jsx:563-564`) | "Read the letter" / "Download issue (PDF)" | `setRoute("article")` / **no `onClick` on the PDF button — dead** | **New finding, not in CONTEXT.md's named bugs** — "Download issue (PDF)" (`pages.jsx:564`) has no `onClick` and no `href`; it is a second dead CTA on a page in this phase's scope. Flag for planner: does this satisfy CTA-07 ("every CTA resolves to a working destination")? No PDF asset is confirmed to exist in `/assets` for this. See Open Questions. |
| `MagazinePage` bottom | `SubscribeBanner` | Same component as above | Same D-09 fix applies here too (this page renders `SubscribeBanner`) |

**One additional dead CTA found beyond CONTEXT.md's D-09:** `MagazinePage`'s "Download issue (PDF)" button (`pages.jsx:564`, `<button className="btn">Download issue (PDF)</button>`) has no `onClick` handler and no download target — same bug class as D-09, on an in-scope page, not previously flagged in CONTEXT.md. This is squarely inside CTA-07's literal requirement ("every CTA across Home, Stores, and Magazine resolves to a working destination — no dead-end sections"). Recommend the planner treat this as an in-scope fix alongside D-09, sized identically (small, isolated), since it was discovered during this phase's own friction audit — exactly the audit CTA-07 asks for.

## Integration Points

- **`app.jsx` (hash router):** Not touched. Confirmed no route-name changes needed — all CTA fixes reuse existing `setRoute("...")` calls or existing `window.open`/`<a href>` patterns.
- **`tweaks-panel.jsx`:** Not touched, but relevant — it controls `heroVariant` (which of `HeroManifest`/`HeroSplit`/`HeroIndex` renders), which is exactly why D-02 requires the CTA rework applied to all three, not just the current default (`HeroSplit`, per `print-app.jsx:38` and general codebase convention). Confirm this by checking how `heroVariant` is set/read if the planner wants to verify the default in the live app (not required for this phase's edits, just context).
- **`print-app.jsx` / `Ladidier Portal-print.html`:** `PrintApp` renders `HomePage` (with `heroVariant="split"` hardcoded), `MagazinePage`, `ArticlePage`, `StoresPage`, `SubscribePage` — meaning every edit in this phase's scope also renders in the print build. No script-tag changes needed (this phase adds no new files), but the planner should note that `SubscribeBanner`'s fix/reword will visibly appear in the print export too (harmless — it's a copy/behavior fix, and print output presumably doesn't execute `onClick` handlers anyway, but the text will print).
- **`components.jsx` (`STORES[]`, `Footer`):** Read-only for this phase. `Footer` itself contains several other dead links (Press, Contact, Concierge, Shipping, Returns, Instagram, Substack, Pinterest, TikTok — all `onClick={(e) => e.preventDefault()}`, confirmed at `components.jsx:326-343`), but `Footer` is explicitly out of this phase's edit scope per CONTEXT.md ("No changes expected to `app.jsx`, `components.jsx`... beyond possibly an `aria-label` attribute") and renders on every page, not just Home/Stores/Magazine — CTA-07's audit is scoped to the three named pages' own content sections, not the sitewide footer. Do not fix Footer's dead links in this phase; flag as a separate future cleanup if desired (see Open Questions).

## Common Pitfalls

(Full analysis already in `.planning/research/PITFALLS.md`; below is the phase-specific application.)

### Pitfall 1: Copy drifts into mass-market ecommerce voice
**What goes wrong:** Exclamation points, "BUY NOW," countdown language creeping into the shopping-forward rewrite.
**Why it happens:** Conversion-copywriting instinct defaults to urgency; this codebase's existing voice (Roman numerals, "House of Houses," quiet imperative) is the opposite register.
**How to avoid:** Every new CTA/lede should be readable aloud immediately after the sentence it replaces without a tonal jump. Use the Copy & CTA Voice Patterns table above as the calibration reference.
**Warning signs:** Any new string containing `!`, `SALE`, `NOW`, a percentage/price outside the existing Subscribe plan cards, or a countdown.

### Pitfall 2: New CTAs visually clash with the existing palette
**What goes wrong:** A new button gets a one-off style (new color, shadow, badge) instead of `.btn`/`.btn.solid`/`.btn.ghost`.
**How to avoid:** Every code snippet in this document's Architecture Patterns section shows the existing class names to reuse — grep `styles.css:180-192` before writing any new button markup.
**Warning signs:** A `style={{ background: ... }}` inline override on a new/changed `<button>` that isn't already present in the pattern being extended.

### Pitfall 3 (new, codebase-specific): `SubscribeBanner` copy edits bleed into out-of-scope pages
**What goes wrong:** Since `SubscribeBanner` renders on `ArticlePage` and `AboutPage` too (confirmed 5 total call sites, not 2 — see Summary), a well-intentioned tone pass on its copy technically edits content on pages explicitly marked out of scope this milestone.
**Why it happens:** CONTEXT.md's code-context section undercounted the call sites ("both HomePage and StoresPage"); a planner working only from CONTEXT.md without re-checking the file would not know this.
**How to avoid:** Accept this as a deliberate, scoped exception (fixing a shared bug + aligning shared voice is different from "rework of Article/About page content") and say so explicitly in the plan, rather than trying to special-case the banner per calling page (which `SubscribeBanner`'s current signature — `{ setRoute }`, no page-identity prop — doesn't support without new plumbing that would itself be out of scope).
**Warning signs:** A reviewer flags "why did Article/About page copy change, that's out of scope" without realizing it's the one shared component.

### Pitfall 4 (new, codebase-specific): Mobile breakpoint hides `.cat`/`.pill` on `.store-row` — don't design microcopy that depends on them being visible
**What goes wrong:** `styles.css:453-454` (`@media (max-width: 920px)`) sets `.store-row .cat, .store-row .pill { display: none; }` — meaning on any screen ≤920px (not just phone), the list view's category and Est. pill are already invisible today. If D-04's aria-label work assumes visual category/est context is always present for sighted users, it isn't below 920px.
**Why it happens:** Easy to test only on desktop-width browser and miss that the breakpoint is 920px, not the more commonly-checked 480px/768px.
**How to avoid:** The aria-label fix (D-04) is unaffected by this (ARIA labels aren't visual), but if any additional list-view text is considered, verify against this specific breakpoint, not just phone width.
**Warning signs:** New copy that assumes `.cat`/`.pill` are always visible next to the arrow.

## Code Examples

### Computing store count instead of hardcoding (D-08 fix pattern)
```jsx
// Source: pages.jsx:158 (existing precedent in this exact file — reuse this pattern)
<span className="mono muted" style={{ fontSize: 12 }}>+ {STORES.length - 6} more houses inside</span>

// Applied to D-08's target at pages.jsx:238 (current):
<div className="eyebrow" style={{ marginBottom: 14 }}>The Directory · 11 Houses</div>
// Becomes (computed, preferred per CONTEXT.md discretion note):
<div className="eyebrow" style={{ marginBottom: 14 }}>The Directory · {STORES.length} Houses</div>
```

### Wiring a real handler onto a previously dead button (D-09 fix pattern)
```jsx
// Source: pages.jsx:357-360 (current, broken)
<div className="flex gap-16" style={{ marginTop: 28, flexWrap: "wrap" }}>
  <button className="btn solid" onClick={() => setRoute("subscribe")}>Choose your subscription</button>
  <button className="btn ghost">Continue reading freely →</button>
</div>

// Minimal fix satisfying D-09 ("no-op scroll-past is fine... must not be an inert-looking
// clickable button with zero behavior"):
<button className="btn ghost" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
  Continue reading freely →
</button>
// Note: window.scrollTo pattern already used elsewhere in this codebase for smooth scroll
// (Source: components.jsx:104, Nav's route links: `window.scrollTo({ top: 0, behavior: "smooth" })`)
```

### Per-store CTA label change, list view aria-label (D-04/D-05 combined pattern)
```jsx
// Grid view (pages.jsx:742) — D-05, label text only:
<span className="mono" style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: ".1em" }}>Visit the Boutique →</span>

// List view (pages.jsx:708) — D-04, add aria-label to the row wrapper:
<div className="store-row" onClick={() => window.open(s.url, "_blank", "noopener,noreferrer")}
     aria-label={`Visit the Boutique — ${s.name}`}>
```

## State of the Art

Not applicable in the conventional sense — this phase makes no library/framework choices. The one relevant "current vs. legacy" distinction is internal to the codebase, not the ecosystem:

| Old Approach (elsewhere in codebase) | Current Approach (recommended for this phase) | When Changed | Impact |
|---------------------------------------|--------------------------------------------------|---------------|--------|
| Hardcoded counts (`"11 Houses"`, `<CountUp to={14} />` at `pages.jsx:90`) | Computed from `STORES.length` where practical (`pages.jsx:158` precedent) | This phase, for D-08's specific target | Prevents the exact class of bug D-08 fixes from recurring; note `CountUp to={14}` elsewhere is out of this phase's edit scope (not named in CONTEXT.md decisions) and may be left as-is |

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | Illustrative copy strings ("Shop the Houses" applied to specific new locations, "Discover the Directory →" for `StoresPreview`, etc.) are drafts, not locked requirements | Copy & CTA Voice Patterns | Low — CONTEXT.md explicitly grants Claude's Discretion on exact final strings; executor should treat these as starting points, adjust for fit/rhythm |
| A2 | `window.open(s.url, "_blank", "noopener,noreferrer")`'s third-argument string behaves as intended (equivalent to setting `noopener`/`noreferrer` window features) across mainstream browsers | Pattern 4 (Architecture Patterns) | Low — pre-existing code, not changed by this phase; flagged for awareness only, not a blocking issue for planning |
| A3 | `heroVariant="split"` is the live default hero (confirmed only via `print-app.jsx:38`'s hardcoded print default, not directly confirmed against the interactive app's tweaks-panel default state) | Integration Points | Low — D-02 already requires all 3 variants be updated regardless of which is default, so this doesn't change scope either way |
| A4 | `MagazinePage`'s "Download issue (PDF)" button (`pages.jsx:564`) has no backing PDF asset anywhere in `/assets` — not exhaustively verified by directory listing in this session | Friction Audit Findings | Medium — if a PDF does exist and just needs an `href`, the fix is trivial (add `href`+`download`); if no PDF exists, the fix is either removing the button, disabling it with explanatory copy, or routing it elsewhere — the planner should do a quick `ls assets/` check before deciding the approach, this materially changes task sizing |

**If this table is empty:** N/A — see rows above.

## Open Questions (RESOLVED)

1. **(RESOLVED — D-10) Should the newly-discovered "Download issue (PDF)" dead button (`pages.jsx:564`) be fixed in this phase?**
   - What we know: It's on `MagazinePage`, which is in this phase's scope; it has no `onClick`/`href`; CTA-07 literally requires "every CTA... resolves to a working destination — no dead-end sections" on Magazine.
   - Resolution: User confirmed no PDF asset exists in the project. Decision captured as CONTEXT.md D-10 — repurpose into a working CTA (e.g. "View full issue →" wired to the flipbook) rather than removing it or faking a download. Implemented in plan 04-04.

2. **(RESOLVED — deferred) `SubscribePage`'s "Access to all 11 stores" (line 805) — same stale-count bug as D-08, different page.**
   - What we know: `SubscribePage` is not one of the eight functions CONTEXT.md scopes this phase to (it's not Home/Stores/Magazine).
   - Resolution: User chose to defer. Recorded in CONTEXT.md's Deferred Ideas as a candidate for a future `/gsd-capture` quick task or a Subscribe/Footer-focused phase. Not fixed by any Phase 4 plan.

3. **(RESOLVED — deferred) `Footer`'s several `preventDefault()`-only links (Press, Contact, Concierge, Shipping, Returns, social icons) — same "dead CTA" pattern as D-09, but explicitly out of this phase's component-edit scope.**
   - What we know: `Footer` renders on every page including the three in this phase's scope, but CONTEXT.md explicitly excludes `components.jsx` from expected edits (aria-label only).
   - Resolution: User chose to defer — footer is sitewide chrome, not page content, and CONTEXT.md's component-edit boundary excludes it. Recorded in CONTEXT.md's Deferred Ideas. Plan 04-05 explicitly reports rather than fixes this during the friction audit.

## Environment Availability

Skipped — this phase has no external tool/service/runtime dependencies beyond the already-loaded CDN scripts (React, Babel), which are confirmed present and pinned in `Ladidier Portal.html` (see Standard Stack). No install, no new CLI, no new service.

## Validation Architecture

No automated test framework exists in this repository — confirmed by directory listing: no `package.json`, no `node_modules`, no `jest.config.*`/`vitest.config.*`/`*.test.*` files anywhere in the tree `[VERIFIED: find/ls at repo root]`. This is expected and consistent with the project's explicit zero-build constraint (PROJECT.md: "Tech stack: React 18 CDN + Babel standalone + plain CSS — no npm, no build tools"). Introducing a test framework is out of scope for this milestone and this phase's content-editing nature does not warrant it.

### Test Framework
| Property | Value |
|----------|-------|
| Framework | None — manual/visual QA only (by design, zero-build static site) |
| Config file | — |
| Quick run command | Open `Ladidier Portal.html` (or the Vercel preview URL) in a browser and navigate to the changed route |
| Full suite command | Manual pass across Home (all 3 hero variants via tweaks-panel), Stores (list + grid view), Magazine, at desktop and ≤480px widths |

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Manual Check | File Exists? |
|--------|----------|-----------|---------------|--------------|
| CTA-01 | Shopping CTA is primary, above "Read the issue," on Home | manual/visual | Load Home in each of the 3 tweaks-panel hero styles; confirm shopping CTA renders first/solid | N/A (no test infra) |
| CTA-02 | Home copy reads shopping-mall voice | manual/editorial review | Read new copy aloud next to replaced copy per Pitfall 1 mitigation | N/A |
| CTA-03 | Every store card has "Visit the Boutique →" CTA to real URL | manual/visual + click-through | Click each of 14 store cards in grid view; confirm correct external `url` opens in new tab | N/A |
| CTA-04 | Stores intro copy reads shopping-mall voice | manual/editorial review | Same as CTA-02, applied to `StoresPage` header | N/A |
| CTA-05 | Est./category surfaced on `StoresPreview` (Home) | manual/visual | Confirm est. year + category visible on each of the 14 home-page store preview cards | N/A |
| CTA-06 | Magazine copy reframed, paywall mechanics unchanged | manual/functional | Confirm paywall still triggers at 15s / on iframe interaction; confirm "Unlock Issue" still sets `ladidier_subscribed` | N/A |
| CTA-07 | No dead-end CTAs on Home/Stores/Magazine | manual/click-through | Click every CTA/link enumerated in Friction Audit Findings table above; confirm each navigates/opens/executes | N/A |

### Sampling Rate
- **Per task commit:** Manually reload the changed page in-browser (no build step, instant reflect) and click the specific CTA(s) touched.
- **Per wave merge:** Full manual pass across Home (all 3 hero variants), Stores (both view toggles), Magazine — desktop width.
- **Phase gate:** Repeat the full manual pass at ≤480px width (matches the existing v1.0 mobile-regression convention referenced in `.planning/research/PITFALLS.md` Pitfall 8) before `/gsd-verify-work`.

### Wave 0 Gaps
None — no test infrastructure gap exists to fill, since this project deliberately has none and this phase's scope doesn't warrant introducing one. The "test suite" for this phase is the Friction Audit Findings table above, used as a manual checklist.

## Security Domain

`security_enforcement` is not present in `.planning/config.json` — treated as enabled per instructions, so this section is included. However, this phase is pure static-content/copy editing with no new inputs, no new external calls beyond the pre-existing `STORES[].url` links (which already use `target="_blank" rel="noopener noreferrer"` correctly at every existing call site — confirmed `pages.jsx:249, 730`), and no authentication/session/crypto surface. Most ASVS categories are not applicable.

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-------------------|
| V2 Authentication | No | No auth in this phase's scope; existing `ladidier_subscribed` localStorage flag is a client-side preference flag, not an authentication mechanism, and is not modified by this phase |
| V3 Session Management | No | Not applicable |
| V4 Access Control | No | Not applicable — static content site |
| V5 Input Validation | No | This phase adds no new form fields or user input; the existing paywall email `<input type="email" required>` (`pages.jsx:485`) is unmodified |
| V6 Cryptography | No | Not applicable |
| V14 Configuration | Yes (minor) | New `aria-label` attributes and `onClick` handlers must not introduce `javascript:` URLs or unescaped user data — trivially satisfied since all new handlers use static strings/existing `setRoute`/`window.open`/`window.scrollTo` calls, no `dangerouslySetInnerHTML`, no dynamic string interpolation into `href` beyond the already-existing `s.url` field |

### Known Threat Patterns for this stack

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|-----------------------|
| `target="_blank"` without `rel="noopener noreferrer"` (reverse tabnabbing) | Tampering (of the opener window via `window.opener`) | Already correctly applied at every existing external-link call site touched by this phase (`pages.jsx:249, 730`); no new external-link patterns are introduced — confirm any new `window.open`/`<a target="_blank">` call added during this phase (there shouldn't be any beyond what's already audited above) follows the same pattern |

No other threat patterns are applicable — this phase introduces no new attack surface (no new inputs, no new external calls, no new client-side storage keys).

## Sources

### Primary (HIGH confidence)
- Direct codebase inspection this session: `pages.jsx` (full file, 954 lines), `components.jsx` (STORES[]/Footer/Nav sections), `styles.css` (`.btn`/`.store-row`/media-query sections, lines 180-192, 353-370, 440-560), `print-app.jsx`, `Ladidier Portal.html`, `.planning/config.json`, `.planning/PROJECT.md`, `.planning/ROADMAP.md`, `.planning/REQUIREMENTS.md`, `.planning/STATE.md` — authoritative source for every line-numbered claim in this document
- `.planning/phases/04-copy-cta-conversion-pass/04-CONTEXT.md` — locked decisions D-01 through D-09, discretion areas, deferred ideas (copied verbatim above)

### Secondary (MEDIUM confidence)
- `.planning/research/SUMMARY.md`, `.planning/research/FEATURES.md`, `.planning/research/PITFALLS.md` — milestone-level research already completed 2026-08-20, WebSearch-verified luxury copywriting/CRO conventions and pitfalls; this document builds on that research and does not re-derive it (see those files' own Sources sections for the underlying WebSearch citations: Carmine Mastropierro luxury copywriting, Webflow luxury website blog, Glossy Farfetch/Net-a-Porter cheat sheet, BOIA/GetStark WCAG hover-focus explainers, among others)

### Tertiary (LOW confidence)
- None — all claims in this document are either direct codebase verification or inherited from the already-vetted milestone research files.

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — zero new dependencies, versions confirmed by direct file read of `Ladidier Portal.html`
- Architecture: HIGH — every integration point (SubscribeBanner's 5 call sites, STORES[] fields, .btn class reuse, mobile breakpoint at 920px) confirmed by direct code inspection, not inference
- Pitfalls: MEDIUM-HIGH — general voice/CRO pitfalls inherited at MEDIUM confidence from milestone research; codebase-specific pitfalls (SubscribeBanner scope bleed, 920px breakpoint, second dead CTA) are HIGH confidence, directly verified this session

**Research date:** 2026-08-20
**Valid until:** Effectively indefinite for the architectural/code-location claims (static codebase, won't drift until someone else edits `pages.jsx`); ~30 days for the voice/copywriting convention claims inherited from milestone research (external UX trends move slowly, but re-verify if this phase is deferred a full quarter)
