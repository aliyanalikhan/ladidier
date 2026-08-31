---
phase: quick-260831-ndu
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - src/pages.jsx
autonomous: true
---

<objective>
Extend today's earlier ÉCLAT Vol. 2 rebuild (quick task 260831-mis, commits e5e8b04/ba6f20f/926c736)
from the dedicated Magazine page onto the Home page. Home still shows the OLD fictional magazine
identity in two spots — the generated `MagazineCover` mockup ornament in the hero, and the
`FeaturedStories` strip pulling from the fictional placeholder `STORIES` array — while the real
Magazine page now shows the real ÉCLAT Vol. 2 cover and six real highlight stories. This plan makes
Home consistent with that by reusing the exact same real assets and the same `ISSUE_HIGHLIGHTS`
array already defined at module scope in `src/pages.jsx` (no new content to source or images to
extract — everything needed already exists on disk from the prior task).

Output: HeroSplit's cover slot shows the real ÉCLAT Vol. 2 cover photo instead of the generated
mockup; FeaturedStories shows the same six real highlight stories instead of the fictional ones.
</objective>

<execution_context>
@$HOME/.claude/gsd-core/workflows/execute-plan.md
</execution_context>

<context>
@.planning/STATE.md

Read before the task: the current `src/pages.jsx` already contains, from the prior quick task:
- `ISSUE_HIGHLIGHTS` (module-scope const, ~line 401, just above `MagazinePage`) — six objects of
  shape `{ img, kicker, title, dek }`, each `img` pointing at `/assets/eclat/*.jpg` (already on
  disk, already committed).
- `MagazinePage`'s cover section (~line 466-491) — the exact `.ph.photo` real-cover pattern to
  reuse: `<div className="ph photo float-slow" style={{ aspectRatio: "1600/2263", "--bg-image":
  \`url(/assets/eclat-vol2-cover.jpg)\` }} data-tag="Vol. 2 · Sep 2026" data-label="THE COVER" />`
- `MagazinePage`'s highlights grid (~line 500-509) — the exact non-clickable `.art-card` pattern
  for a highlight: `<article className="art-card"><div className="ph photo" style={{ aspectRatio:
  "4/5", "--bg-image": \`url(${h.img})\` }} data-tag={h.kicker} data-label="ÉCLAT VOL. 2" />...`
Do not regenerate, re-crop, or add any image assets — everything needed is already committed.
</context>

<constraints_for_every_task>
- Do not touch `src/components.jsx` (defines `MagazineCover`, `STORIES`, `ISSUE`) — leave those
  definitions as they are; this plan only stops importing/using `MagazineCover` and `STORIES` in
  `FeaturedStories`/`HeroSplit`, it does not delete their source definitions.
- Do not touch `HeroManifest` or `HeroIndex` — neither renders a magazine cover image, so there is
  nothing for this plan to change in them.
- Do not touch `MagazinePage`, `ArticlePage`, `SubscribeBanner`, or anything under `api/`/`lib/`.
- Keep every existing `.ph.photo` / `.art-card` / `.art-title` / `.art-meta` / `.eyebrow` class
  convention — no new CSS.
- `ArticlePage` (route "article") becomes unreachable from Home after this change (it already
  became unreachable from the Magazine page in the prior task) — do not delete `ArticlePage`
  itself or its route registration; leaving a page component unreached by any link is fine and
  out of scope here.
</constraints_for_every_task>

<tasks>

<task type="auto">
  <name>Task 1: Swap Home's hero cover and featured-stories content for the real ÉCLAT Vol. 2 content</name>
  <files>src/pages.jsx</files>
  <action>
**Import cleanup** — `MagazineCover` (top of file, in the `import { ... } from './components.jsx'`
block) becomes unused once the change below lands; remove it from that destructured import list.
Leave `STORES`, `ISSUE`, `STORIES`, and every other imported name untouched — `STORIES` is still
used by `ArticlePage`'s "Continue reading" strip (~line 579, unrelated to this plan) and `ISSUE`
is still used by the eyebrow labels this plan leaves alone.

**`HeroSplit`** (~line 118-122) — replace:
  ```
  <div style={{ position: "relative" }} className="float-slow">
    <MagazineCover tint={ISSUE.cover} vol={ISSUE.vol} no={ISSUE.no} season={ISSUE.season} title={ISSUE.title} tilt />
    <div className="mono" style={{ position: "absolute", right: 0, top: -28, fontSize: 11, letterSpacing: ".08em", textTransform: "uppercase", color: "var(--mute)" }}>
      ↘ Current issue
    </div>
  </div>
  ```
  with the real cover photo in the same wrapper (keep the wrapper's own `float-slow` class; do NOT
  also add `float-slow` to the inner `.ph.photo` div — the outer wrapper already animates, and
  MagazinePage's cover only carries `float-slow` on the div itself because it has no animated
  wrapper around it):
  ```
  <div style={{ position: "relative" }} className="float-slow">
    <div className="ph photo" style={{ aspectRatio: "1600/2263", "--bg-image": `url(/assets/eclat-vol2-cover.jpg)` }} data-tag="Vol. 2 · Sep 2026" data-label="THE COVER"></div>
    <div className="mono" style={{ position: "absolute", right: 0, top: -28, fontSize: 11, letterSpacing: ".08em", textTransform: "uppercase", color: "var(--mute)" }}>
      ↘ Current issue
    </div>
  </div>
  ```

**`FeaturedStories`** (~line 196-254) — this is the only other place on Home showing fictional
magazine content. Change its data source from the fictional `STORIES` array to the real,
already-defined `ISSUE_HIGHLIGHTS` array, and drop the dead click-through to the fictional
`ArticlePage` (same non-clickable, presentational treatment `MagazinePage`'s highlight grid
already established — these are real editorial pieces with no article page behind them yet, so a
card that looks clickable but goes to unrelated placeholder content would be misleading):

  1. Change `const featured = STORIES.slice(0, 4);` to `const featured = ISSUE_HIGHLIGHTS.slice(0, 3);`
     (`ISSUE_HIGHLIGHTS` has 6 items total: index 0 is the lead, 1-2 are the two mid stories —
     `featured.slice(1, 3)` below already isolates those correctly once `featured` holds 3 items).
  2. Lead story `<article>` (~line 213): remove `onClick={() => setRoute("article")}` and
     `style={{ cursor: "pointer" }}` (leave `className="art-card lift"` as-is — `lift` is a hover
     animation class unrelated to click behavior). Change the meta line from
     `<div className="art-meta" style={{ marginTop: 16 }}>{featured[0].author} · {featured[0].read} read</div>`
     to `<div className="art-meta" style={{ marginTop: 16 }}>{featured[0].dek}</div>` (`ISSUE_HIGHLIGHTS`
     items have no `author`/`read` fields — real bylines aren't fabricated here, the `dek` field
     is the real one-line summary already written for these stories). Change the `data-label`
     from `"EDITORIAL · LEAD"` to `"ÉCLAT VOL. 2"` to match the label already used on the
     Magazine page's highlight cards. Also swap `key={s.id}` usage below since `ISSUE_HIGHLIGHTS`
     items have no `id` field — see step 3.
  3. The two mid-story `<article>`s (`featured.slice(1, 3).map((s, i) => ...)`, ~line 224-235):
     change the `.map` key from `key={s.id}` to `key={s.title}` (matches the key strategy
     `MagazinePage`'s highlight grid already uses for this same data shape), remove
     `onClick={() => setRoute("article")}` and `cursor: "pointer"` from the `<article>`'s style
     (keep `className="art-card lift"`), change `data-label="STORY"` to `data-label="ÉCLAT VOL. 2"`,
     and change the meta line from `{s.author} · {s.read}` to `{s.dek}`.
  4. The "Also in the issue" column (~line 238-250): change
     `{STORIES.slice(4, 8).map((s, i) => (` to `{ISSUE_HIGHLIGHTS.slice(3, 6).map((s, i) => (`
     (the remaining 3 of the 6 real highlights). Change the wrapping element from a fake
     navigation link to a plain non-interactive row — replace
     `<a key={s.id} href="#" onClick={(e) => { e.preventDefault(); setRoute("article"); }} className="lift" style={{ paddingBlock: 14, borderBottom: "1px solid var(--line)", display: "block" }}>`
     / closing `</a>` with
     `<div key={s.title} style={{ paddingBlock: 14, borderBottom: "1px solid var(--line)" }}>` /
     closing `</div>` (drop the now-inapplicable `lift` hover class along with the link semantics —
     `lift` is meant to signal an interactive/hoverable element, and this row no longer is one).
     Change the meta line from `{s.author} · {s.read}` to `{s.dek}`.

  The section's `eyebrow`/`h2` header text ("The Magazine — Vol. {ISSUE.vol} N°{ISSUE.no}" /
  "Stories from this season's issue.") and the "All stories →" button (still routing to
  `setRoute("magazine")`) are unrelated to which stories populate the grid — leave both exactly
  as they are, matching the precedent set on `MagazinePage` of leaving `ISSUE`-based header copy
  untouched while swapping only the underlying content grid.
  </action>
  <verify>
    <automated>npm run build &amp;&amp; node -e "const p=require('fs').readFileSync('src/pages.jsx','utf8'); const ok = !/MagazineCover/.test(p) &amp;&amp; /eclat-vol2-cover\.jpg/.test((p.match(/function HeroSplit[\s\S]*?\n}\n/)||[''])[0]) &amp;&amp; /ISSUE_HIGHLIGHTS\.slice\(0, 3\)/.test(p) &amp;&amp; /ISSUE_HIGHLIGHTS\.slice\(3, 6\)/.test(p) &amp;&amp; !/setRoute\(\"article\"\)/.test((p.match(/function FeaturedStories[\s\S]*?\n}\n/)||[''])[0]); process.exit(ok ? 0 : 1)"</automated>
    <manual>Run the dev server, open Home (default hero), and confirm: the hero's cover slot
    shows the real ÉCLAT Vol. 2 photo (not the generated "EBUKA OSUORAH" mockup), and the
    "Stories from this season's issue" grid below shows the same six real ÉCLAT Vol. 2 highlights
    (Paul Onwuanibe, AMVCA, Lagos, Chef Efi, World Cup, Afrobeats) with none of the cards clickable
    to a fake article. "All stories →" still opens the Magazine page.</manual>
  </verify>
  <done>Home's default hero shows the real ÉCLAT Vol. 2 cover photo. `FeaturedStories` shows the
  same six real `ISSUE_HIGHLIGHTS` items used on the Magazine page, with no click-through to the
  fictional `ArticlePage`. `npm run build` succeeds. `src/components.jsx` is untouched.</done>
</task>

</tasks>

<verification>
1. `npm run build` succeeds.
2. `git diff` touches only `src/pages.jsx`.
3. Manual click-through on Home: hero cover is the real photo; featured-stories grid shows the
   six real highlights with no dead links; "All stories →" still reaches the Magazine page, whose
   own cover/highlights are unchanged from the prior task.
</verification>

<success_criteria>
- Home page no longer shows the generated fictional `MagazineCover` mockup or the fictional
  `STORIES` placeholder content anywhere — both magazine surfaces on Home (hero cover,
  featured-stories grid) now show the same real ÉCLAT Vol. 2 content as the Magazine page.
- No new images, no changes to `src/components.jsx`, no changes to the Magazine page itself.
</success_criteria>

<output>
Commit the task atomically as it completes. Create
`.planning/quick/260831-ndu-swap-the-home-page-s-fictional-magazine-/260831-ndu-SUMMARY.md`
with `status: complete` in its frontmatter once done.
</output>
