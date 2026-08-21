# Phase 6: Mall Treasure Hunt - Context

**Gathered:** 2026-08-22
**Status:** Ready for planning

<domain>
## Phase Boundary

This phase adds a second, gamified discovery mechanic alongside Phase 5's single hidden perk: 4 distinct hidden icons (shopping bag, gift box, plus 2 more) placed across the Home, Stores, Magazine, and Article pages. A visitor who clicks all 4 within one browser session triggers a "You found the treasure!" completion reveal with a discount code distinct from Phase 5's `HOUSE10`, plus the same subscribe-flow branching Phase 5 uses. This explicitly supersedes the original v1.1 milestone decision that hidden perks would ship as "one real discovery mechanic, not gamified" — see `PROJECT.md` Key Decisions and `REQUIREMENTS.md` Out of Scope, both updated 2026-08-22 to reflect this. Requirements: TREAS-01 through TREAS-06 (see `REQUIREMENTS.md`).

</domain>

<decisions>
## Implementation Decisions

### Icon aesthetic
- **D-01:** The 4 icons are distinct, literal shapes (shopping bag, gift box, plus 2 more — Claude's discretion for the remaining two, on-brand e-commerce/gift shapes like a price tag or ribbon/bow) — a deliberate departure from Phase 5's abstract flourish-glyph language, chosen explicitly over reskinning to match Phase 5.
- **D-02:** Icons render as small full-color illustrated icons, not flat gold/monochrome silhouettes — another deliberate departure from the site's existing icon restraint (the `.paywall-gate` lock glyph, Phase 5's perk mark).

### Page placement
- **D-03:** One icon each on Home, Stores, Magazine, and Article (`app.jsx` routes: `home`, `stores`, `magazine`, `article`) — extends beyond the milestone's original Home/Stores/Magazine focus into Article, since there's no per-product page on this site to use instead.
- **D-04:** Each page defines 2-3 pre-defined, layout-safe "hiding zones" (margins, corners, near existing ornaments — NOT arbitrary x/y coordinates, which risk covering buttons/text or breaking at ≤480px). The icon's zone is randomly re-chosen on every fresh page load (not fixed per session) — a visitor who reloads mid-search may see the icon move.

### Bonus / reward mechanic
- **D-05:** The completion reward is cosmetic-only, mirroring Phase 5's existing subscribe-form pattern exactly (`pages.jsx:484-491`) — there is no backend anywhere on this site (per `PROJECT.md` Constraints), so no email/WhatsApp form actually sends or stores anything server-side. This directly contradicts the original pitch's "feeds his subscriber list" framing — surfaced and explicitly accepted by the user in favor of simplicity over building a manual `mailto:`/`wa.me`-link alternative.
- **D-06:** The reward code is a distinct static string, different from Phase 5's `HOUSE10` — exact string is Claude's discretion, in the same "House of Houses" vocabulary established in Phase 4/5. Like `HOUSE10`, this is explicitly a display-only constant, never a "redeem"/"validate" flow (same reasoning as Phase 5 D-06/D-07 — no backend exists to validate against).
- **D-07:** The completion popup uses the exact same `ladidier_subscribed`-branching Phase 5 uses (read-only): subscribed visitors see the code only; unsubscribed visitors also see a subscribe CTA that routes to the real `/subscribe` page. This is the one place a genuine subscribe conversion can actually happen — not the cosmetic capture form.

### Progress & session mechanics
- **D-08:** A subtle progress indicator lives in the **nav bar/header** (not the Footer, where Phase 5's perk mark lives) — visible on every page. It renders as filled-vs-hollow dots/glyphs (e.g. `●●○○` for 2 of 4 found), NOT a literal "2/4" numeric count, to stay in the site's ornamental visual language rather than reading as a game HUD. It is completely invisible/absent until at least 1 icon has been found this session.
- **D-09:** Per-hunt found-progress uses **`sessionStorage`**, not `localStorage` — this is a deliberate, explicit departure from every other stateful flag on this site (`ladidier_subscribed`, `ladidier_perk_found`, both `localStorage`). Progress resets when the browser tab/window closes; a visitor must find all 4 icons across pages within one sitting.
- **D-10:** Completion itself is tracked separately from per-session progress, via a **persistent `localStorage`** one-time flag (naming: `ladidier_treasure_completed`, mirroring `ladidier_perk_found`'s naming convention). Once set, the 4 icons never spawn again for that visitor on any future visit or session — "only one time for a person," per the user's explicit requirement. This is the one piece of hunt state that persists past a session close, specifically to enforce one-time-only.

### Claude's Discretion
- The exact shapes of the 3rd and 4th icons (beyond shopping bag and gift box).
- The exact reward code string (distinct from `HOUSE10`, same house vocabulary).
- The exact 2-3 safe-zone coordinates/positions per page (must clear real content and remain safe at ≤480px, per Phase 5's Pitfall 8 `!important`-cascade lesson).
- Exact popup copy for the completion reveal (elevated-editorial voice, consistent with Phase 4 D-01 and Phase 5 D-07's honest "present this" framing — no false urgency/countdown language, per the same pitfalls that applied to Phase 5).
- Exact nav-bar dot-indicator styling and how it avoids colliding with the mobile hamburger toggle (`.nav-hamburger`, `components.jsx:137`) at narrow widths.
- Icon click/tap and keyboard-focus mechanics — same accessibility bar as Phase 5 (PERK-02 precedent): reachable via click/tap AND keyboard focus, not hover-only.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Requirements & project context
- `.planning/REQUIREMENTS.md` — TREAS-01..06 (this phase's locked requirements, added 2026-08-22)
- `.planning/PROJECT.md` — Current Milestone section (Mall Treasure Hunt target feature, added 2026-08-22), Key Decisions (supersedes the "not gamified" decision), Out of Scope (leaderboards/competitive mechanics still excluded — this is not that)
- `.planning/ROADMAP.md` — Phase 6 goal, success criteria, `Depends on: Phase 5`

### Prior phase context — read in full, this phase reuses Phase 5's patterns extensively
- `.planning/phases/05-hidden-perks-discovery-feature/05-CONTEXT.md` — D-06/D-07 (display-only code framing, honest "present this" copy), D-08/D-09 (subscribe-flow branching on `ladidier_subscribed`, read-only), D-04 (no auto-dismiss guidance likely applies to the completion popup too)
- `.planning/phases/05-hidden-perks-discovery-feature/05-RESEARCH.md` — Pitfalls 3-8 (hover-only accessibility, discoverability paradox, code exposure via View Source, subscribe-flow collision, re-trigger-every-visit distraction, mobile `!important` cascade) all apply identically here
- `perks.jsx` — the `HiddenPerk` component, `usePerkFound()` hook pattern, and `Object.assign(window, {...})` export convention this phase's new file should follow
- `.planning/phases/04-copy-cta-conversion-pass/04-CONTEXT.md` — D-01 (elevated CTA voice the completion popup's subscribe CTA must match)

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `perks.jsx` — `usePerkFound()` hook and `Object.assign(window, {...})` export convention are the direct template for this phase's new hook/component (e.g. `useTreasureHunt()`, `TreasureIcon`, `TreasureComplete`)
- `.paywall-gate` CSS class (`styles.css`) — reused by Phase 5's `.perk-reveal`; the completion popup should follow the same reuse-don't-reinvent precedent
- `ladidier_subscribed` localStorage flag (`app.jsx:50`, `pages.jsx:487,772`) — read-only reuse, same as Phase 5
- `.nav-hamburger` (`components.jsx:137`) and the `nav` / `nav-right` structure (`components.jsx:123-137`) — the progress-dot indicator's natural insertion point

### Established Patterns
- Every top-level file is a global-scope `<script type="text/babel">` exported via `Object.assign(window, {...})` — no modules, no bundler. New treasure-hunt file(s) should follow this exact convention, loaded after `perks.jsx` and before `components.jsx` in both HTML entry points (same load-order requirement Phase 5 discovered).
- `app.jsx`'s route switch (`case "home"`, `"stores"`, `"magazine"`, `"article"`) is where each of the 4 target pages renders — icon-mounting likely needs a per-route wrapper or per-page prop, since (unlike Phase 5's single Footer mount) this phase needs 4 different mount points across different page components.
- Both HTML entry points (`Ladidier Portal.html`, `Ladidier Portal-print.html`) needed the new `<script>` tag for Phase 5's `perks.jsx` — the print entry point's `PrintApp` also renders `Footer`; verify at planning time whether `PrintApp` renders any of Home/Stores/Magazine/Article (likely not, since it's a print-specific view) to determine if the new file needs loading there too.

### Integration Points
- `pages.jsx`: `HomePage`, `StoresPage`, `MagazinePage`, `ArticlePage` — one icon mount point needed in each
- `components.jsx`: `Nav` — progress-dot indicator mount point, near `.nav-hamburger`
- `app.jsx`: route switch — confirms the 4 target pages and their prop-passing conventions (`setRoute`, `isSubscribed`)
- No changes expected to `ornaments.jsx`, `tweaks-panel.jsx`, or Phase 5's `perks.jsx` itself (the two mechanics coexist, not integrate)

</code_context>

<specifics>
## Specific Ideas

- 4 distinct full-color illustrated icons: shopping bag, gift box, + 2 more (Claude's discretion)
- Reward code: distinct from `HOUSE10` (Claude's discretion for exact string)
- Progress indicator: dot/glyph style (e.g. `●●○○`), in the nav bar, not a numeric "2/4"
- One-time completion: `ladidier_treasure_completed` persistent flag, icons never reappear after first completion
- Per-session hunt progress: `sessionStorage`, resets on tab/window close

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope. The original pitch's "feeds his subscriber list" framing was addressed head-on (see D-05) rather than deferred: given no backend exists, real lead capture isn't buildable in this phase or milestone without a genuinely new capability (a backend/email service), which is out of scope.

</deferred>

---

*Phase: 6-Mall Treasure Hunt*
*Context gathered: 2026-08-22*
