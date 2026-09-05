---
phase: quick-260905-twl
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - src/styles.css
autonomous: false
requirements: [QUICK-260905-twl]

estimate:
  tokens: 26000
  raw_tokens: 26000
  tasks: 2
  confidence: low

must_haves:
  truths:
    - "At desktop width the avatar widget in Home's Manifesto left column renders visibly wider than its previous 320px cap."
    - "All four edges of the widget dissolve softly into the page background instead of terminating at a crisp line."
    - "No hard 1px outline is drawn around the widget."
    - "The widget's corners are rounded and clip the video to the rounded shape."
    - "Every interactive control inside .avatar-faq-overlay (pills, badges, More topics, Back, chips) stays fully opaque and legible — the feather never reaches them."
  artifacts:
    - "src/styles.css — the single .avatar-faq-widget rule (currently lines 1315-1325) and its banner comment (1307-1314)"
  key_links:
    - "mask-composite (standard) / -webkit-mask-composite (legacy) is load-bearing: without it the two mask layers composite with the default `add` (union) and the fade silently disappears."
    - ".avatar-faq-overlay's 16px padding is the legibility budget — the fade band at each edge must resolve to fewer than 16px at the new widget width, or pill edges get feathered."
    - "overflow: hidden must survive the edit — it is what clips .avatar-faq-video (position:absolute; inset:0) to the new border-radius before the mask is applied on top."
---

<objective>
Polish the in-flow avatar FAQ widget from a plain hard-edged rectangle into a designed media frame: a moderately larger box, rounded corners matching the site's existing framed-media radius, and a soft feather on all four edges so the widget dissolves into the page instead of ending at a 1px line.

Purpose: The user's response to quick task 260905-t26's open sizing question was not "approved" but a styling request — "make avatar box size a bit big and alligned professinoally also avayar box all edges should fade like giving it an profesisnoal design". This resolves the sizing question (bigger, not smaller) and adds the edge-fade treatment.

Output: One rewritten contiguous region of `src/styles.css` — the `.avatar-faq-widget` banner comment plus the rule itself. No other file changes.
</objective>

<execution_context>
@$HOME/.claude/gsd-core/workflows/execute-plan.md
@$HOME/.claude/gsd-core/templates/summary.md
</execution_context>

<context>
@.planning/STATE.md

Read only the region you are about to edit plus the reuse target:
- `src/styles.css` lines 1300-1345 — the banner comment, `.avatar-faq-widget`, `.avatar-faq-video`, and the top of `.avatar-faq-overlay`
- `src/styles.css` lines 937-970 — `.paywall-gate` / `.magazine-frame`, the site's existing framed-media language (`border-radius: 8px`, large-blur soft shadow)

Confirmed during planning, do NOT re-derive:
- `.avatar-faq-widget` appears **exactly once** in `src/styles.css` (line 1315) and once in `src/avatarFaq.jsx` (line 349, the className). There are no responsive overrides of this selector anywhere — a single scoped edit is complete.
- The banner comment (1307-1314) and the rule (1315-1325) are **contiguous**, so this whole change is one single-block replacement.
- `src/styles.css` is currently ~1439 lines.
- Parent is `Manifesto()`'s `.col.gap-24`, the `1fr` track of a `1fr 1.4fr` grid with `gap: 80`. At a 1200px container the left column is ~433px, at 1024px it is ~360px — `min(100%, …)` handles the narrow case, no media query needed.
- The last CSS-only quick task (260905-avc, commit 0f30e58) committed `src/styles.css` **only** and did not rebuild `dist/`. Match that precedent.
</context>

<editing_protocol>
`src/styles.css` has a documented history of whole-file reformat corruption on multi-block diffs — STATE.md `[Phase 10-02]` (file ballooned to 2353 lines) and `[Phase 10-03]` (1374 ins / 331 del on a 38-line intent). Standing lesson: multi-block edits go through a Node script with found-exactly-once assertions; single-block edits may use the Edit tool, always followed by `git diff --stat`.

This change is deliberately structured as **one single-block contiguous replacement** (lines 1307-1325) so the Edit tool is the correct instrument. Rules:

1. ONE `Edit` call. Replace the contiguous banner-comment + rule region in a single `old_string` → `new_string`. Do not issue separate edits for the width, the radius, the border removal, and the mask.
2. Immediately after the Edit, run `git diff --numstat -- src/styles.css`.
3. **Tripwire:** expect roughly ≤ 45 insertions and ≤ 20 deletions. If insertions + deletions ≥ 80, or `wc -l < src/styles.css` falls outside 1435-1500, the file was reformatted — STOP, run `git restore src/styles.css`, and retry with a tighter `old_string`. Do not attempt to hand-repair a reformatted file.
4. Do not stage or commit `dist/`. The working tree already carries pre-existing uncommitted `dist/` churn from earlier tasks — leave it exactly as found; `git add` only `src/styles.css` and the planning artifacts.
</editing_protocol>

<technical_findings>
Two things were verified during planning that contradict the literal CSS suggested in the task context. Both are corrections of source-text errors, not scope changes — the same pattern as `[Phase 10-03]`'s recorded "plan's literal CSS text was corrected in implementation".

**Finding 1 — the suggested radial-gradient mask produces no fade at all.**

The context proposed `radial-gradient(ellipse 82% 88% at 50% 50%, #000 72%, transparent 100%)`. In a radial gradient, percentage radii resolve against the box's width and height, so `ellipse 82% 88%` gives rx = 0.82·W and ry = 0.88·H. The distance from the centre to a left/right edge is only 0.5·W, which sits at 0.5/0.82 = **61%** along the gradient ray; to a top/bottom edge, 0.5/0.88 = **57%**. Both land before the `#000 72%` opaque stop, so every edge of the box is fully opaque. The declaration would be dead CSS.

Worse, a centred radial vignette cannot satisfy this widget's constraints at *any* radius. Solving for the bottom-left corner of the bottom pill — the point 16px in from the left edge and 16px up from the bottom, i.e. (0.458·W, 0.476·H) from centre — staying fully opaque under a `#000 75%` stop requires rx = ry ≥ 88% of the box, which (per the arithmetic above) leaves the side edges fully opaque again. Corners are geometrically farther from the centre than edge midpoints, and this widget's controls run nearly the full width right down to the bottom corners. Radial vignette and pill legibility are mutually exclusive here.

**Use instead: two composited linear-gradient edge bands.** This feathers a uniform band at each of the four edges, keeps the rectangle's shape, and leaves the entire interior — including the bottom corners where the pills live — fully opaque.

**Finding 2 — an outer `box-shadow` cannot coexist with a mask on the same element.**

Per CSS Masking L1 the mask painting area defaults to `border-box` and everything outside it is clipped. An outer `box-shadow` paints outside the border box, so a mask erases it entirely. `filter: drop-shadow()` does not help (filters are applied before clipping/masking), and neither does a `::before`/`::after` (a pseudo-element is a descendant and is masked too). The only fix is a wrapper element carrying the shadow while the inner element carries the mask — which requires a change to `src/avatarFaq.jsx`, explicitly out of this task's scope.

They also conflict aesthetically: a drop shadow implies a crisp silhouette casting it, which is precisely what a feathered edge removes. The user's literal ask was the fade ("all edges should fade"); the shadow was an elaboration in the task framing. So: **implement the fade, do not add a dead `box-shadow` declaration, record why in the banner comment, and surface the wrapper option as a question at the checkpoint.** Do not silently omit it — Task 2 must ask.

An `inset` box-shadow would survive the mask but is a different visual language from `.magazine-frame` and would be hidden under the vignette anyway. Not a substitute; do not add one.
</technical_findings>

<tasks>

<task type="tracer">
  <name>Task 1: Resize, round, and feather .avatar-faq-widget in one scoped edit</name>
  <files>src/styles.css</files>
  <precondition>`.avatar-faq-widget {` occurs exactly once in src/styles.css. If `grep -c` returns anything other than 1, halt — the file is not in the state this plan was written against.</precondition>
  <action>
Replace the contiguous region covering the `.avatar-faq-widget` banner comment and rule (currently lines 1307-1325) with an updated banner comment and an updated rule, in a SINGLE Edit call per `<editing_protocol>`. Five changes to the rule:

1. **Size.** Change `width: min(100%, 320px)` to `width: min(100%, 380px)`. 380px is a +18.75% step — a clear "a bit bigger" without doubling, sitting mid-range of the 360-400px band the request allows, and comfortably inside the ~433px left column at a 1200px container. Keep `aspect-ratio: 9 / 16` unchanged (the footage is portrait). Note in the summary that this takes the rendered height from ~569px to ~676px, which is the specific thing Task 2's checkpoint is asking the user to judge.

2. **Rounded corners.** Add `border-radius: 8px`, matching the value already used by `.magazine-frame` and `.paywall-gate` — reuse the site's existing framed-media radius, do not pick a new one.

3. **Remove the hard outline.** Delete the `--mute` outline declaration. A crisp 1px rectangle drawn around a box whose edges are supposed to dissolve is self-contradictory and would read as a rendering bug. **Comment-text discipline:** do not restate that removed declaration verbatim anywhere between the rule's braces — Task 1's verify negative-greps the rule body for it. Explain the removal in the banner comment ABOVE the selector, phrased in prose (e.g. "the 1px --mute outline was dropped"), never as a copy of the declaration syntax.

4. **Four-edge feather.** Add a two-layer linear-gradient mask, composited with intersect, with the `-webkit-` twin (Safari and pre-120 Chrome need the legacy `source-in` keyword). Starting values:

   - horizontal layer: `linear-gradient(to right, transparent 0, #000 3%, #000 97%, transparent 100%)`
   - vertical layer: `linear-gradient(to bottom, transparent 0, #000 2%, #000 98%, transparent 100%)`
   - `mask-composite: intersect;` and `-webkit-mask-composite: source-in;`

   At the new 380px width, 3% is an ~11.4px side band; at the ~676px height, 2% is a ~13.5px top/bottom band. Both stay under `.avatar-faq-overlay`'s 16px padding, so the pills, badges, chips, "More topics" and "Back" sit entirely inside the fully-opaque core. You may tune within 2-4% horizontal and 1.5-3% vertical, but the hard constraint is that **each band must resolve to fewer than 16px at 380px width / 676px height** — the fade is required on all four edges, and shrinking it to nothing to be safe is not an acceptable resolution.

   Emit both the standard and the `-webkit-` prefixed forms of `mask-image` and `mask-composite`.

5. **Keep `overflow: hidden`.** It is still load-bearing: it clips `.avatar-faq-video` (`position:absolute; inset:0`) to the rounded shape before the mask is applied over the top. Keep `position: relative` and `background: var(--noir)` unchanged.

**Banner comment** (above the selector) must record, in prose: this is quick task 260905-twl; the widget is now 380px and softly feathered on all four edges rather than outlined; the `--mute` outline was dropped because a hard line under a faded edge reads as broken; the composite declaration is load-bearing (with the default `add` the two layers union and the feather silently vanishes — degradation is "no fade", never "no content", which is the acceptable failure mode on a browser lacking mask-composite entirely); and that no outer `box-shadow` is present because a mask clips to `border-box` and would erase it, so matching `.magazine-frame`'s lift shadow would require a wrapper element in `src/avatarFaq.jsx`.

Do NOT touch `.avatar-faq-video`, `.avatar-faq-overlay`, `.avatar-faq-pill*`, `.avatar-faq-chips`, `.avatar-faq-chip`, `.avatar-faq-more-btn`, `.avatar-faq-tap-to-play`, or any `.jsx`/`.js` file. No new dependencies, no new files.
  </action>
  <verify>
    <automated>node -e 'const fs=require("fs");const c=fs.readFileSync("src/styles.css","utf8");let f=0;const say=m=>{console.log("FAIL: "+m);f=1};if((c.match(/\.avatar-faq-widget/g)||[]).length!==1)say("selector count != 1");const b=c.split(".avatar-faq-widget {")[1].split("}")[0];const body=b.split("\n").filter(l=>!l.trim().startsWith("/*")&&!l.trim().startsWith("*")).join("\n");for(const s of ["width: min(100%, 380px)","border-radius: 8px","overflow: hidden","aspect-ratio: 9 / 16","mask-image","-webkit-mask-image","mask-composite","-webkit-mask-composite","linear-gradient(to right","linear-gradient(to bottom"])if(!b.includes(s))say("missing: "+s);if(/border:\s*1px solid var\(--mute\)/.test(body))say("hard outline still in rule body");if(/box-shadow/.test(body))say("box-shadow present — it would be clipped by the mask (see technical_findings)");const n=c.split("\n").length;if(n<1435||n>1500)say("file line count "+n+" outside 1435-1500 — suspected reformat corruption");process.exit(f)'</automated>
    <manual>`git diff --numstat -- src/styles.css` shows insertions + deletions &lt; 80. Anything at or above that means reformat corruption — `git restore src/styles.css` and retry.</manual>
  </verify>
  <done>`src/styles.css` contains exactly one `.avatar-faq-widget` rule, capped at 380px, with `border-radius: 8px`, `overflow: hidden`, `aspect-ratio: 9 / 16`, both prefixed and unprefixed two-layer mask declarations, no `--mute` outline and no `box-shadow`; the assertion script exits 0 and the diff is under 80 changed lines.</done>
  <reversibility rating="reversible">Pure presentational CSS in a single rule; `git restore src/styles.css` fully undoes it.</reversibility>
</task>

<task type="checkpoint:human-verify" gate="blocking">
  <what-built>
    `.avatar-faq-widget` is now 380px wide (up from 320px, so ~676px tall at 9:16), has 8px rounded corners matching `.magazine-frame`, has lost its 1px `--mute` outline, and softly feathers to transparent over an ~11px band on the left/right edges and ~13px on the top/bottom, revealing the page background behind it.
  </what-built>
  <how-to-verify>
    Run `npm run dev`, open the Home page, and scroll to the Manifesto section (the "Welcome · I" block with the Crest and Laurel). The avatar widget sits in the left column, beside the large "Welcome to LaDidiér…" paragraph.

    Four things to judge:
    1. **Size** — does 380px read as "a bit bigger" and well-proportioned against the paragraph column, or is the new ~676px height now too tall for the column? This is the open question left unresolved by quick task 260905-t26; your answer settles it.
    2. **Fade** — are all four edges visibly dissolving into the page, with no hard line anywhere? (If the edges look perfectly crisp, your browser is silently ignoring `mask-composite` — say so and we will add a fallback.)
    3. **Legibility** — are the lettered question pills, the "More topics" link, the keyword chips and "Back" all still fully crisp and readable? Nothing near the bottom or the sides should look washed out. Click a question to confirm the pills still work normally.
    4. **Shadow decision** — the site's `.magazine-frame` look also includes a soft drop shadow. It was deliberately **not** added: a CSS mask clips to the border box and erases an outer `box-shadow` entirely, so the declaration would do nothing. Adding a real shadow needs a wrapper element in `src/avatarFaq.jsx`, which was outside this task's scope. Do you want that shadow as a follow-up, or does the feathered edge alone read as finished?

    Optional and worth a glance: with rounded corners now in play, the "Tap to play" fallback button is still pinned at a square `top:12px; left:12px`. It only appears if autoplay is blocked (it did not trigger on the physical-iPhone pass in D-10), so it was left alone — mention it if you want it nudged inward.
  </how-to-verify>
  <resume-signal>Type "approved", or describe what to change (size, fade strength, or the shadow follow-up).</resume-signal>
</task>

</tasks>

<threat_model>
## Trust Boundaries

| Boundary | Description |
|----------|-------------|
| (none introduced) | This change is presentational CSS on an existing element. No new input crosses any boundary, no network call, no data handling, no new package-manager install. |

## STRIDE Threat Register

| Threat ID | Category | Component | Severity | Disposition | Mitigation Plan |
|-----------|----------|-----------|----------|-------------|-----------------|
| T-twl-01 | Denial of Service | `.avatar-faq-widget` mask hiding interactive controls | low | mitigate | A mis-tuned fade band could render the question pills unclickable-looking (a usability, not security, failure). Mitigated by the hard band-width constraint in Task 1 (band must stay under `.avatar-faq-overlay`'s 16px padding) and by Task 2's blocking legibility check. |
| T-twl-02 | Tampering | `src/styles.css` whole-file reformat corruption | medium | mitigate | Documented recurrence in `[Phase 10-02]` / `[Phase 10-03]`. Mitigated by `<editing_protocol>`: single-block Edit, `git diff --numstat` immediately after, line-count tripwire in the automated verify, restore-and-retry on anomaly. |
| T-twl-SC | Tampering | npm/pip/cargo installs | n/a | accept | No packages are installed by this task; no legitimacy audit is required. |
</threat_model>

<verification>
1. Assertion script in Task 1 exits 0.
2. `git diff --numstat -- src/styles.css` reports a single file, under 80 changed lines total.
3. `git status --porcelain` shows no modification to `src/avatarFaq.jsx`, `src/pages.jsx`, `src/print-app.jsx`, `src/avatarReducer.js`, `src/avatarReducer.test.js`, or `src/avatarFaqData.js`, and no newly staged `dist/` paths.
4. Task 2's blocking checkpoint is approved by the developer.
</verification>

<success_criteria>
- The avatar widget renders at a 380px cap with 8px rounded corners and no hard outline.
- All four edges visibly feather into the page background at desktop width.
- Every control inside `.avatar-faq-overlay` remains fully opaque and clickable.
- Exactly one file changed (`src/styles.css`), under 80 lines of diff.
- The omitted drop shadow is explained in the banner comment and answered by the developer at the checkpoint, not silently dropped.
</success_criteria>

<output>
Create `.planning/quick/260905-twl-polish-the-embedded-avatar-widget-s-visu/260905-twl-SUMMARY.md` when done. Record: the chosen width and why; the final fade percentages and their pixel equivalents; the developer's answer on the drop-shadow follow-up; and whether the "Tap to play" positioning was flagged.

Commit `src/styles.css` and the planning artifacts only — do NOT stage `dist/` (matching commit 0f30e58, the last CSS-only quick task).
</output>
