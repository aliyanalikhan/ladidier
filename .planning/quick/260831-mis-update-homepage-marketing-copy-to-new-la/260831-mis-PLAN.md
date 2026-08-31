---
phase: quick-260831-mis
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - index.html
  - src/pages.jsx
  - src/app.jsx
autonomous: true
---

<objective>
Rebrand the site's tagline and welcome messaging away from "A House of Houses" toward "LaDidiér,
the world curated," fix a stale store count, and restructure the Magazine page so it no longer
promises an in-site interactive reading session — it now leads with the real ÉCLAT Vol. 2 cover
and a set of real highlight stories, keeps the existing order/subscribe flow untouched, and points
readers wanting the interactive edition to the separate reading platform that is still in
development.

Purpose: the business has decided the website's job is now to sell across all fourteen houses
plus travel, with the magazine as one piece of that world rather than the site's whole identity.
The interactive flipbook is being retired in favor of a dedicated reading platform (in
development); this site's magazine page should tease the issue, not simulate reading it.

Output: updated hero tagline and manifesto welcome copy, a corrected store count, and a
rebuilt Magazine page body (front cover + highlight stories, no flipbook/paywall).
</objective>

<execution_context>
@$HOME/.claude/gsd-core/workflows/execute-plan.md
</execution_context>

<context>
@.planning/STATE.md

Read before the first code task:
@src/theme.js (confirms THEME.hero = "split", i.e. HeroSplit is the hero variant real visitors see)
@src/components.jsx (confirms IMG, STORES, ISSUE, MagazineCover — do not modify this file)

Six real photos have already been extracted from the ÉCLAT Vol. 2 PDF the founder supplied and
committed to the working tree at:
  public/assets/eclat-vol2-cover.jpg          (full front cover, 1600x2263)
  public/assets/eclat/spotlight-onuwanibe.jpg (Paul Onwuanibe portrait)
  public/assets/eclat/amvca-looks.jpg         (AMVCA red-carpet couture)
  public/assets/eclat/lagos-city.jpg          (Lagos night street-food scene)
  public/assets/eclat/chef-efi.jpg            (Chef Efi holding lobsters)
  public/assets/eclat/world-cup.jpg           (Spain's World Cup trophy lift)
  public/assets/eclat/afrobeats.jpg           (concert crowd)
These are already reviewed and approved — treat them as fixed assets, do not regenerate or
re-crop them. They are untracked new files; add them in Task 2's commit.
</context>

<constraints_for_every_task>
- Do not touch `src/components.jsx`, `src/ornaments.jsx`, `src/treasure.jsx`, `src/theme.js`,
  `src/print-app.jsx`, or any file under `api/` or `lib/` — this is a copy/content-structure
  change only, with zero effect on checkout, auth, or entitlement logic.
- Do not change the global `ISSUE` object or the placeholder `STORIES` array in
  `src/components.jsx` — those still back the Home page's `FeaturedStories` / `ArticlePage`
  fiction ("On Luxe & Larger Living", Adeva D.'s editor's letter) and are out of scope here.
  The new real ÉCLAT Vol. 2 highlight content is local to `MagazinePage` only.
- Keep every existing `.btn` / `.eyebrow` / `.lede` / `.ph.photo` / `.mono` class usage and
  inline-style conventions already in `src/pages.jsx` — no new CSS files or classes needed;
  everything below reuses patterns already in the file (see `FeaturedStories`, `StoresPreview`).
- Do not touch the pricing cards, FAQ, or `SubscribeBanner` in `SubscribePage` / `MagazinePage`
  — the order flow for ÉcLAT Online / ÉcLAT Hard Copy stays exactly as it is.
</constraints_for_every_task>

<tasks>

<task type="auto">
  <name>Task 1: Rebrand tagline + welcome copy, fix stale store count, retitle the page</name>
  <files>index.html, src/pages.jsx</files>
  <action>
**index.html** — change the `<title>` from `LaDidiér — A House of Houses` to
`LaDidiér — The World Curated`.

**src/pages.jsx**, `HeroManifest` (~line 41) — the eyebrow currently reads:
`<div className="eyebrow">A House of Houses · Est. <RomanReveal value="MMXXI" /></div>`
Change the literal text only, keeping the `RomanReveal` element intact:
`<div className="eyebrow">LaDidiér, the World Curated · Est. <RomanReveal value="MMXXI" /></div>`

**src/pages.jsx**, `Manifesto()` (~lines 294-316) — this is the full-width mission-statement
block shown on every Home page load, directly under the hero. Replace ONLY the founder's-note
display paragraph (currently "We believe in a softer maximalism. In scent as architecture...
One house, fourteen rooms, and an open invitation to wander.") with this exact copy, keeping
the same `<p className="display" style={{...}}>` wrapper, font-size clamp, and the existing
`<em style={{ fontStyle: "italic" }} className="gold-text">` treatment applied to "shopping and
travel" and "your world" (pick two short em-phrases from the new copy, do not add more than two
— match the current paragraph's restraint of two italic emphases):

  "Welcome to LaDidiér—a refined destination for considered finds, everyday essentials,
  elevated lifestyle pieces, and unforgettable journeys. From the beautifully practical to the
  wonderfully unexpected, LaDidiér brings shopping and travel together in one inspiring world,
  designed to help you discover more, experience more, and live with intention. Your taste.
  Your travels. Your world."

Also change the preceding `<div className="eyebrow">House Note · I</div>` to
`<div className="eyebrow">Welcome · I</div>` so the eyebrow matches the new welcome framing
rather than the retired "house note" conceit. Leave the Crest/Laurel ornaments and the stats
row below (Houses / Issues per year / Established / Universe counters) untouched.

**src/pages.jsx**, `SubscribePage` Reader plan card (~line 913) — fix the stale count:
`<li>· Access to all 11 stores</li>` → `<li>· Access to all 14 stores</li>`
(STORES.length is 14; this literal was never updated when houses 12-14 were added. Do not
switch it to `{STORES.length}` interpolation — every sibling `<li>` in that list is a plain
string literal, and mixing one interpolated item into an otherwise-static list is an
inconsistency this plan doesn't need to introduce.)
  </action>
  <verify>
    <automated>npm run build</automated>
    <manual>Grep the repo for "House of Houses" (case-insensitive) across index.html and
    src/*.jsx — the only remaining hits should be inside .planning/ historical docs, never in
    shipped source. Grep for "11 stores" — zero hits in src/.</manual>
  </verify>
  <done>index.html title reads "LaDidiér — The World Curated"; the default (split) hero's
  eyebrow and the Home page manifesto both carry the new brand language; the Reader plan card
  says "14 stores".</done>
</task>

<task type="auto">
  <name>Task 2: Rebuild the Magazine page — real cover + highlight stories, retire the flipbook</name>
  <files>src/pages.jsx, src/app.jsx, public/assets/eclat-vol2-cover.jpg, public/assets/eclat/spotlight-onuwanibe.jpg, public/assets/eclat/amvca-looks.jpg, public/assets/eclat/lagos-city.jpg, public/assets/eclat/chef-efi.jpg, public/assets/eclat/world-cup.jpg, public/assets/eclat/afrobeats.jpg</files>
  <action>
**src/pages.jsx** — rewrite `MagazinePage`. Delete: the `showPaywall` state, the `iframeRef`
(and its `useRef` import if `MagazinePage` was the file's only user of `useRef` — check before
removing the import from the `import { useState, useEffect, useRef } from 'react';` line at the
top), the whole `useEffect` that listens for Heyzine `postMessage`/`blur`/a 15s timer, the
`<section>` containing the `<iframe src="https://heyzine.com/flip-book/fb035e2aea.html">` and
its paywall/preview-indicator overlays, and the ornamental "Cover Story" section further down
that renders `<MagazineCover .../>` with the "On the Quiet Audacity of Wanting More" copy and
the `iframeRef.current.scrollIntoView(...)` button (that button has nothing to scroll to once
the iframe is gone). `MagazinePage` no longer needs the `isMember` prop — drop it from the
function signature, and drop `isMember={isMember}` from the `<MagazinePage .../>` call site in
`src/app.jsx` (~line 129; leave every other prop and the rest of `isMember`'s use in app.jsx,
e.g. the entitlement recheck logic, completely untouched).

Keep the existing `<header className="page-head">` block and `<TreasureIcon page="magazine" />`
exactly as they are, except soften the lede's closing clause — "Open to all readers, always."
is no longer accurate once reading happens off-site or in print. Change the lede to:
  "The Spring · Summer issue. Thirty-two stories on the small obsessions that make a life —
  and the fourteen houses that made them. Preview the cover and this issue's highlights below,
  then read the full issue in print or take it home as ÉcLAT Online."

Replace the deleted iframe/paywall section and the deleted ornamental cover-story section with
ONE new section, in this shape (reuse the `.ph.photo` background-image div convention already
used throughout this file — see `FeaturedStories` for the exact pattern — rather than raw `img`
tags):

  1. A two-column split (`display: grid`, similar proportions to the deleted cover-story
     section: cover image column ~1fr, text column ~1.2fr) showing:
     - Left: `<div className="ph photo float-slow" style={{ aspectRatio: "1600/2263",
       "--bg-image": \`url(/assets/eclat-vol2-cover.jpg)\` }} data-tag="Vol. 2 · Sep 2026"
       data-label="THE COVER" />`
     - Right: an `eyebrow` reading "This Issue's Cover", a heading using the real cover line
       ("The Power of Vision: Paul Onwuanibe — On Leadership, Legacy, and Rebuilding Africa's
       Business Landscape"), a short lede-style paragraph inviting the reader to the highlights
       below, and a note in the file's existing `.mono`/`muted` small-text style reading:
       "Want to turn every page? Our interactive reading platform is launching soon." — plain
       text, no link, no button (confirmed: no URL exists for it yet).
     - Below or beside that: the two existing CTA buttons `Shop the Houses` /
       `View membership plans →` are NOT needed here — keep exactly one CTA,
       `<button className="btn solid" onClick={() => setRoute("subscribe")}>Order this issue →</button>`,
       so the order path stays the single funnel into the untouched `SubscribePage` pricing
       cards.

  2. A "Highlights from this issue" grid below it: an `eyebrow` + `h2` header ("Highlights from
     this issue"), then a responsive grid (`repeat(auto-fit, minmax(260px, 1fr))`, gap 32,
     matching `StoresPreview`'s grid) of six presentational cards — NOT wrapped in a clickable
     `onClick`/`cursor:pointer` (there is no article page behind these yet; do not link them to
     the placeholder `ArticlePage`, which is unrelated fictional content and would mislead).
     Define the six cards as a local `const ISSUE_HIGHLIGHTS = [...]` array inside
     `MagazinePage` (or just above it), each `{ img, kicker, title, dek }`, using exactly:

     1. img: "/assets/eclat/spotlight-onuwanibe.jpg", kicker: "Cover Story · Spotlight",
        title: "The Power of Vision: Paul Onwuanibe", dek: "On leadership, legacy, and
        rebuilding Africa's business landscape — three decades of building across a continent."
     2. img: "/assets/eclat/amvca-looks.jpg", kicker: "Couture, Culture & Icons",
        title: "The Looks That Owned the Night", dek: "Inside the AMVCA red carpet, where
        sculptural gowns and reimagined tailoring turned Lagos into a living couture runway."
     3. img: "/assets/eclat/lagos-city.jpg", kicker: "Urban Pulse",
        title: "Lagos: The City That Never Sleeps", dek: "A city of seekers, where a
        Rolls-Royce passes a danfo and the night never quite ends."
     4. img: "/assets/eclat/chef-efi.jpg", kicker: "At the Chef's Table",
        title: "Cracked Open: Inside Chef Efi's Culinary Revolution", dek: "A Cantonese-style
        ginger-scallion lobster, and the philosophy of a chef who believes good cooking depends
        on timing."
     5. img: "/assets/eclat/world-cup.jpg", kicker: "Global Sport",
        title: "The World Cup That Had It All", dek: "Dramatic comebacks, breakout stars, and
        Spain lifting the trophy — a retrospective on the tournament that stopped the world."
     6. img: "/assets/eclat/afrobeats.jpg", kicker: "Culture · Music · Connection",
        title: "One Beat, Many Nations, One World", dek: "When the beat drops, borders
        disappear — how Afrobeats became the rhythm bringing the world together."

     Each card: `<div className="ph photo" style={{ aspectRatio: "4/5", "--bg-image":
     \`url(${h.img})\` }} data-tag={h.kicker} data-label="ÉCLAT VOL. 2" />` followed by a title
     (`art-title` class, matching `FeaturedStories`) and the `dek` in the file's existing small
     muted-paragraph style (see how `art-meta` or `.lede`-adjacent small text is styled
     elsewhere — do not invent a new text style).

  Keep `<SubscribeBanner setRoute={setRoute} />` at the end of `MagazinePage`, unchanged.
  </action>
  <verify>
    <automated>npm run build &amp;&amp; node -e "const p=require('fs').readFileSync('src/pages.jsx','utf8'); const a=require('fs').readFileSync('src/app.jsx','utf8'); const ok = !/heyzine\.com/i.test(p) &amp;&amp; !/showPaywall/.test(p) &amp;&amp; /eclat-vol2-cover\.jpg/.test(p) &amp;&amp; /ISSUE_HIGHLIGHTS/.test(p) &amp;&amp; !/MagazinePage[^;]*isMember/.test(a); process.exit(ok ? 0 : 1)"</automated>
    <manual>Run the dev server, open the Magazine route, and confirm: the real ÉCLAT cover
    photo renders, six highlight cards render with real titles/images, there is no iframe and
    no "Subscribe to See All Pages" overlay anywhere on the page, and "Order this issue →"
    navigates to the Subscribe page with its three pricing cards intact.</manual>
  </verify>
  <done>MagazinePage no longer references Heyzine, `showPaywall`, or the fictional "Quiet
  Audacity" cover-story panel. It shows the real Vol. 2 cover, a plain-text "interactive
  reading platform is launching soon" note with no dead link, six real highlight-story cards,
  and a single CTA into the unchanged Subscribe/order flow. `npm run build` succeeds.</done>
</task>

</tasks>

<verification>
1. `npm run build` succeeds with no new warnings about undefined refs or unused imports.
2. `git diff` touches only `index.html`, `src/pages.jsx`, `src/app.jsx`, and the six new/untracked
   `public/assets/eclat*` image files — nothing under `api/`, `lib/`, or `src/components.jsx`.
3. Manual click-through: Home hero and manifesto show the new copy; Magazine page shows the real
   cover + six highlights with no flipbook/paywall; "Order this issue" reaches the existing
   Subscribe pricing cards unchanged.
</verification>

<success_criteria>
- Tagline "A House of Houses" is gone from the page `<title>` and the default hero; replaced with
  "LaDidiér, the World Curated" language.
- The founder's-note manifesto paragraph on Home is replaced with the supplied "Welcome to
  LaDidiér..." copy.
- The Reader plan card says "14 stores", matching `STORES.length`.
- The Magazine page leads with the real ÉCLAT Vol. 2 cover and six real highlight stories, has no
  interactive flipbook or paywall gate, tells the reader the interactive platform is launching
  soon (no dead link), and still funnels ordering through the untouched Subscribe pricing cards.
</success_criteria>

<output>
Commit each task atomically as it completes. Create
`.planning/quick/260831-mis-update-homepage-marketing-copy-to-new-la/260831-mis-SUMMARY.md`
with `status: complete` in its frontmatter once both tasks are done.
</output>
