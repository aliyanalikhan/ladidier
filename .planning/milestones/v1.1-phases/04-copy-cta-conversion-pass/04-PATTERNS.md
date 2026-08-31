# Phase 4: Copy & CTA Conversion Pass - Pattern Map

**Mapped:** 2026-08-20
**Files analyzed:** 1 file modified (`pages.jsx`), 8 functions inside it; 0 new files
**Analogs found:** 8 / 8 (all analogs are sibling patterns within the same file/codebase — this phase is a copy-editing pass, not new construction, so every "analog" is an existing pattern already proven in this exact codebase)

## Note on Phase Shape

This phase creates **zero new files**. All work is JSX/copy edits inside 8 existing functions in one file, `pages.jsx` (953 lines). Because there is no "new file" needing an external analog, this PATTERNS.md instead maps each **edit site** to the **closest existing sibling pattern already in the codebase** that the edit must match stylistically/structurally — i.e., "when you touch this CTA, copy the button-class/voice/wiring convention already used at this other exact location." All line numbers below were verified live against the current `pages.jsx` (953 lines) on 2026-08-20 and match RESEARCH.md's line map (off by ≤1 line, negligible drift).

`/assets` was checked directly this session: **no PDF file exists anywhere in the project** (`find ... -iname "*.pdf"` returned nothing), confirming RESEARCH.md Assumption A4. The "Download issue (PDF)" button (D-10) must be repurposed, not wired to a real download.

## File Classification

| Edit Site (function, in `pages.jsx`) | Role | Data Flow | Closest Analog (in-file sibling) | Match Quality |
|---|---|---|---|---|
| `HeroManifest` (lines 9-57) — CTA row lines 41-54 | component (hero) | request-response (client-side route change) | `HeroSplit` lines 84-87 (already-correct primary/secondary `.btn.solid`/`.btn` ordering pattern) | exact |
| `HeroSplit` (lines 59-104) — CTA row lines 84-87 | component (hero) | request-response | `HeroIndex` line 135-137 (`.btn.solid` promoted-primary pattern, already shopping-forward) | exact |
| `HeroIndex` (lines 106-168) — CTA line 135-137 | component (hero) | request-response | Self-consistent already; use as reference for the other two heroes | exact (reference) |
| `StoresPreview` (lines 232-264) — eyebrow line 238, CTA line 243, card line 249-257 | component (card grid) | CRUD (read-only render of `STORES[]`) | `StoresPage` grid view lines 725-750 (same `STORES.map()` + `<a href={s.url}>` card pattern, one level more detailed) | exact |
| `SubscribeBanner` (lines 339-365) — dead button line 359 | component (shared CTA banner, 5 call sites) | event-driven (button click, no network) | `Nav`'s route-link click handler, `components.jsx:104` (`window.scrollTo({ top: 0, behavior: "smooth" })` pattern) | role-match (only existing scroll-behavior precedent in codebase) |
| `MagazinePage` (lines 371-580) — lede lines 418-421, paywall heading 469-474, PDF button line 564 | component (page, paywall gated) | request-response + event-driven (paywall state machine, untouched) | `SubscribeBanner`'s existing `setRoute("subscribe")` pattern (line 358) for the PDF-button repurpose | role-match |
| `StoresPage` list view (lines 699-723) — row line 708 | component (dense list row) | CRUD (read-only render) | `HeroIndex` list rows, lines 146-156 (identical `.store-row onClick={() => window.open(s.url, ...)}` pattern, already in-file) | exact |
| `StoresPage` grid view (lines 725-750) — CTA label line 742 | component (card grid) | CRUD (read-only render) | `StoresPreview` card, lines 249-257 (same `<a href={s.url}>` wrapper pattern) | exact |
| `StoresPage` header lede (lines 677-681) | component (page intro copy) | N/A (static text) | `MagazinePage` header lede, lines 418-421 (sibling page-head copy block, same `<p className="lede">` structure) | role-match |

## Pattern Assignments

### `HeroManifest` CTA row — lines 41-54 (D-01, D-02, D-03)

**Analog:** `HeroSplit` lines 84-87 for the primary/secondary reordering shape; `HeroManifest`'s own existing secondary button (line 43, "Enter the stores") is already on-voice and already routes to `stores` — RESEARCH.md recommends promoting this exact string/handler to first position rather than inventing a new one.

**Current code** (`pages.jsx:41-54`):
```jsx
<Reveal delay={1100}>
  <div className="flex gap-16" style={{ flexWrap: "wrap", alignItems: "center" }}>
    <button className="btn solid" onClick={() => setRoute("magazine")}>Read the issue</button>
    <button className="btn" onClick={() => setRoute("stores")}>Enter the stores</button>
    <div className="flex center gap-12" style={{ marginLeft: 24, color: "var(--mute)", fontSize: 13 }}>
      ...
    </div>
  </div>
</Reveal>
```

**Pattern to copy:** Swap class + order only — do not touch the surrounding `<Reveal>`/marquee JSX. First button gets `className="btn solid"` + `setRoute("stores")` + shopping-voice label; second button drops to `className="btn"` (non-solid) + `setRoute("magazine")` + kept/lightly-reworded "Read the issue" label. This is a class-swap + reorder, not new markup.

---

### `HeroSplit` CTA row — lines 84-87 (D-01, D-02, D-03)

**Current code** (`pages.jsx:84-87`):
```jsx
<div className="flex gap-16" style={{ marginTop: 40, flexWrap: "wrap", animation: "pageFade .9s 1.05s ease both" }}>
  <button className="btn solid" onClick={() => setRoute("magazine")}>Open the issue</button>
  <button className="btn ghost" onClick={() => setRoute("subscribe")}>How to subscribe →</button>
</div>
```

**Pattern to copy:** This is the file's clearest existing primary(`.solid`)/secondary(`.ghost`) two-button pattern — reuse this exact class pairing shape. Insert the new shopping CTA as a third first-position `.btn.solid` button routing to `stores`, demote "Open the issue" to `.btn` (drop `.solid`, keep or drop `.ghost` per visual weight desired — RESEARCH.md recommends demoting to plain `.btn`, non-solid), keep "How to subscribe →" as the existing `.ghost` tertiary. Do not touch the `<div style={{marginTop:64...}}>` detail-row block below it (lines 89-93) — that's data display, not a CTA.

---

### `HeroIndex` CTA — lines 135-137 (D-01, D-02, D-03; likely wording-alignment only)

**Current code** (`pages.jsx:135-137`):
```jsx
<button className="btn solid" style={{ alignSelf: "flex-start", animation: "pageFade .9s 1.15s ease both" }} onClick={() => setRoute("stores")}>
  The full directory →
</button>
```

**Pattern to copy:** Already `.btn.solid`, already first/primary, already routes to `stores` — this is the reference pattern the other two heroes are being brought in line with. Per RESEARCH.md, this button likely needs wording-only alignment to D-01's house vocabulary (e.g. `Shop the Houses →`), not restructuring. Do not alter the inline `style` object or `animation` timing — copy edits only.

---

### `StoresPreview` — eyebrow (line 238), section CTA (line 243), card CTA text (lines 249-257) (D-06, D-08, D-01)

**Current code** (`pages.jsx:236-244`):
```jsx
<div className="flex between" style={{ marginBottom: 56, alignItems: "flex-end", gap: 32, flexWrap: "wrap" }}>
  <div>
    <div className="eyebrow" style={{ marginBottom: 14 }}>The Directory · 11 Houses</div>
    <h2 className="display h2" style={{ margin: 0, maxWidth: "18ch" }}>
      Every door leads somewhere worth lingering.
    </h2>
  </div>
  <button className="btn ghost" onClick={() => setRoute("stores")}>Open the directory →</button>
</div>
```

**D-08 fix pattern — computed count, precedent already in this exact file** (`pages.jsx:158`):
```jsx
<span className="mono muted" style={{ fontSize: 12 }}>+ {STORES.length - 6} more houses inside</span>
```
Apply the same `{STORES.length}` interpolation technique to line 238: `The Directory · {STORES.length} Houses` (computed, not hardcoded `14`, per CONTEXT.md's preference to prevent future drift).

**Current card markup** (`pages.jsx:246-260`, for D-06 heritage-microcopy):
```jsx
<div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 24 }}>
  {STORES.map((s, i) => (
    <Reveal key={s.id} delay={i * 50}>
      <a href={s.url} target="_blank" rel="noopener noreferrer"
         className="lift" style={{ display: "block", border: "1px solid var(--line)", background: "var(--bg)", padding: 18 }}>
        <div className="ph photo" style={{ aspectRatio: "9/16", "--bg-image": `url(${s.img})` }} data-tag={`N° ${s.id}`} data-label={s.cat.toUpperCase()}></div>
        <div style={{ paddingTop: 18, display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
          <div className="display" style={{ fontSize: 22, fontWeight: 400, letterSpacing: "-.01em" }}>{s.name}</div>
          <div className="mono" style={{ fontSize: 11, color: "var(--mute)" }}>{s.id}</div>
        </div>
        <div className="eyebrow" style={{ marginTop: 4 }}>{s.cat}</div>
      </a>
    </Reveal>
  ))}
</div>
```
Only `{s.cat}` (category) currently renders — `est` is not yet shown here, per D-08's finding. **Analog for adding `est`:** `StoresPage` grid view (lines 740-741) already shows both fields side by side:
```jsx
// Source: pages.jsx:740-741 (StoresPage grid view — pattern to copy the "Est." display convention from)
<span className="mono" style={{ fontSize: 11, color: "var(--mute)" }}>Est. {s.est}</span>
```
Copy this exact `<span className="mono" style={{fontSize:11,color:"var(--mute)"}}>Est. {s.est}</span>` convention into `StoresPreview`'s card (e.g. adjacent to or replacing the bare `<div className="eyebrow">{s.cat}</div>` line 256) — do not invent new styling for the Est. display, reuse the `.mono`/`var(--mute)` treatment already established at `StoresPage:740`.

---

### `SubscribeBanner` — lines 339-365 (D-01, D-09; shared across 5 pages — see Shared Patterns)

**Current code** (`pages.jsx:357-360`, the exact broken button):
```jsx
<div className="flex gap-16" style={{ marginTop: 28, flexWrap: "wrap" }}>
  <button className="btn solid" onClick={() => setRoute("subscribe")}>Choose your subscription</button>
  <button className="btn ghost">Continue reading freely →</button>
</div>
```

**Fix pattern — reuse the codebase's one existing smooth-scroll precedent** (`components.jsx:104`, `Nav`'s route link):
```jsx
// Source: components.jsx:104 (Nav component — existing scroll-to-top-on-navigate pattern)
onClick={(e) => { e.preventDefault(); setRoute(slug); window.scrollTo({ top: 0, behavior: "smooth" }); }}
```
Apply the `window.scrollTo({ top: 0, behavior: "smooth" })` call (without the `setRoute`, since D-09 wants dismiss/continue-in-place behavior, not navigation) to give the "Continue reading freely →" button a real, non-inert `onClick`. This is the only smooth-scroll precedent in the codebase — reuse it rather than inventing new scroll logic.

---

### `MagazinePage` — lede (lines 418-421), paywall heading (lines 469-474, do not reword), PDF button (line 564) (D-07, D-10)

**Lede — safe-to-edit copy zone** (`pages.jsx:418-421`):
```jsx
<p className="lede" style={{ marginTop: 28 }}>
  The Spring · Summer issue. Thirty-two stories on the small obsessions that
  make a life. Open to all readers, always.
</p>
```
Analog for tone: `StoresPage`'s lede (lines 678-681, see below) is the sibling "page-head lede" pattern in this same file — both are `<p className="lede">` blocks introducing a page; match register/length when drafting the shopping-adjacent rework.

**Paywall heading — must NOT be reworded (mechanic clarity boundary)** (`pages.jsx:469-474`):
```jsx
<h2 className="display" style={{ fontSize: "clamp(24px, 2.5vw, 36px)", fontWeight: 300, letterSpacing: "-.02em", color: "var(--noir)" }}>
  Subscribe to See All Pages
</h2>
<p className="lede" style={{ fontSize: 16, marginTop: 14, color: "var(--ink)", maxWidth: "50ch", margin: "14px auto 0" }}>
  The Maiden Digital Edition is reserved for members. Join LaDidiér to unlock all 32 stories and receive quarterly printed copies at your door.
</p>
```
Do not touch this heading's transactional clarity ("Subscribe to See All Pages" / "Unlock Issue" button text) per CTA-06. Shopping tie-in belongs in the lede (above) and cover-story panel copy, not this gate.

**PDF button — dead CTA, confirmed no PDF asset exists anywhere in project (`find` verified this session)** (`pages.jsx:562-565`):
```jsx
<div className="flex gap-16" style={{ marginTop: 28, flexWrap: "wrap" }}>
  <button className="btn solid" onClick={() => setRoute("article")}>Read the letter</button>
  <button className="btn">Download issue (PDF)</button>
</div>
```
**Analog for the fix:** the sibling button in the same `<div>` already shows the correct wiring shape — `className="btn"` + `onClick={() => setRoute(...)}`. Repurpose the PDF button using this exact pattern, e.g. `onClick={() => setRoute("magazine")}` scoped to scroll/focus the flipbook iframe (`iframeRef` already exists at line 373, currently unused for this purpose), or relabel + route to an existing destination (`article`/`subscribe`) per D-10's guidance. Do not add a `download`/`href` attribute — no backing file exists.

---

### `StoresPage` list view row — line 708 (D-04)

**Analog:** `HeroIndex`'s identical row pattern, already in this file (`pages.jsx:148-154`):
```jsx
// Source: pages.jsx:148 (HeroIndex, home-page mini-index — same store-row pattern, no aria-label yet either)
<div className="store-row" onClick={() => window.open(s.url, "_blank", "noopener,noreferrer")}>
```

**Target — current code to modify** (`pages.jsx:708-719`):
```jsx
<div className="store-row" onClick={() => window.open(s.url, "_blank", "noopener,noreferrer")}>
  <span className="num mono">{s.id}</span>
  <div>
    <div className="name">{s.name}</div>
    <div style={{ color: "var(--mute)", fontSize: 13, marginTop: 4, fontStyle: "italic" }}>
      {s.tagline}
    </div>
  </div>
  <span className="cat">{s.cat}</span>
  <span className="pill">Est. {s.est}</span>
  <span className="arrow">→</span>
</div>
```
Add `aria-label={`Visit the Boutique — ${s.name}`}` to the outer `<div className="store-row" ...>` only — do not add visible text (would widen the row per D-04), and do not touch `.arrow`'s bare `→` content. Note: `.store-row .cat`/`.pill` are `display: none` below 920px (`styles.css:454`) — irrelevant to the `aria-label` fix since ARIA attributes aren't visual, flagged for awareness only.

---

### `StoresPage` grid view CTA label — line 742 (D-05)

**Analog:** `StoresPreview`'s card wrapper (`pages.jsx:249`) — same `<a href={s.url} target="_blank" rel="noopener noreferrer">` card-link pattern already correctly wired; this edit is label-text-only.

**Current code** (`pages.jsx:740-743`):
```jsx
<div className="flex between" style={{ marginTop: 18, paddingTop: 14, borderTop: "1px solid var(--line)" }}>
  <span className="mono" style={{ fontSize: 11, color: "var(--mute)" }}>Est. {s.est}</span>
  <span className="mono" style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: ".1em" }}>Enter →</span>
</div>
```
Change only the text node `Enter →` to `Visit the Boutique →` (D-05 locked exact string). No class/structural change — the `<span className="mono" style={{...}}>` wrapper stays identical.

---

### `StoresPage` header lede — lines 677-681 (CTA-04)

**Current code** (`pages.jsx:677-681`):
```jsx
<p style={{ margin: 0, color: "var(--ink)", fontSize: 15 }}>
  Each store stands on its own. Together, they form the LaDidiér universe —
  united by craft, by patience, and by a refusal to rush a good thing.
</p>
```
**Analog:** `MagazinePage`'s lede (`pages.jsx:418-421`, `<p className="lede">`) — sibling page-head copy block in the same file, same editorial cadence (long sentence, em-dash rhythm). Note this paragraph uses a plain `<p style={{...}}>` without `className="lede"` — keep that as-is (don't add the class, that would change visual size/weight outside this phase's scope); only the words change, per CTA-04's action-inviting-without-losing-cadence direction from RESEARCH.md.

---

## Shared Patterns

### `.btn` / `.btn.solid` / `.btn.ghost` — the only three button treatments in the codebase
**Source:** `styles.css:180-192`
```css
.btn { ... }
.btn:hover { background: var(--fg); color: var(--bg); transform: translateY(-1px); }
.btn.solid { background: var(--fg); color: var(--bg); }
.btn.solid:hover { background: var(--gold); color: var(--noir); border-color: var(--gold); }
.btn.ghost { border-color: transparent; padding-left: 0; padding-right: 0; }
.btn.ghost:hover { background: transparent; color: var(--fg); transform: none; text-decoration: underline; text-underline-offset: 6px; }
```
**Apply to:** Every CTA touched in this phase (all 3 heroes, `StoresPreview`, `SubscribeBanner`, `MagazinePage`'s PDF-button repurpose). Never introduce a new `style={{background: ...}}` override on a touched button — reclass/reorder only. Never leave two `.btn.solid` buttons adjacent in the same row (visual-hierarchy clash) — exactly one primary per CTA cluster.

### `STORES[]` data model — already has every field this phase needs
**Source:** `components.jsx:38-51` (14 entries, confirmed)
```jsx
{ id: "01", name: "Ladidiér Jewelry", cat: "Jewelry", tint: "blush", est: "MMXXI",
  tagline: "Heirlooms in waiting.", img: IMG.s_jewelry, url: "https://www.ladidierjewelry.com/" },
```
**Apply to:** Any store-card/row edit (D-04, D-05, D-06). No data-model changes — this phase is rendering-only against existing fields (`url`, `est`, `cat`, `tagline`).

### `window.open(s.url, "_blank", "noopener,noreferrer")` — existing external-link pattern
**Source:** used identically at `pages.jsx:148` (`HeroIndex`), `pages.jsx:708` (`StoresPage` list), and via `<a target="_blank" rel="noopener noreferrer">` at `pages.jsx:249` (`StoresPreview`) and `pages.jsx:730` (`StoresPage` grid).
**Apply to:** Do not introduce a new external-link mechanism; every store CTA in this phase reuses one of these two exact idioms (`window.open(...)` for click-anywhere rows, `<a target="_blank" rel="noopener noreferrer">` for card wrappers).

### `{STORES.length}` computed-count pattern
**Source:** `pages.jsx:158` (existing precedent, `HeroIndex`)
```jsx
<span className="mono muted" style={{ fontSize: 12 }}>+ {STORES.length - 6} more houses inside</span>
```
**Apply to:** D-08's fix at `StoresPreview` line 238 — compute `{STORES.length}` rather than hardcoding a new stale number.

## No Analog Found

None. Every edit site in this phase has a strong in-file (or same-codebase) sibling pattern to copy from — expected for a pure copy/CTA pass on an already-established, internally consistent codebase.

## Metadata

**Analog search scope:** `pages.jsx` (full file, 953 lines), `components.jsx` (`STORES[]` lines 38-51, `Nav` line 104), `styles.css` (`.btn`/`.store-row` sections, lines 180-192, 367-368, 454)
**Files scanned:** 3 (`pages.jsx`, `components.jsx`, `styles.css`) + directory listing of `/assets` (confirmed no PDF exists, resolving RESEARCH.md's Assumption A4)
**Pattern extraction date:** 2026-08-20
