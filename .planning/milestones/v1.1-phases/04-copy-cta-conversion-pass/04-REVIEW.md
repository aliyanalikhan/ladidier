---
phase: 04-copy-cta-conversion-pass
reviewed: 2026-08-21T00:00:00Z
depth: standard
files_reviewed: 1
files_reviewed_list:
  - pages.jsx
findings:
  critical: 0
  warning: 1
  info: 2
  total: 3
status: issues_found
---

# Phase 04: Code Review Report

**Reviewed:** 2026-08-21T00:00:00Z
**Depth:** standard
**Files Reviewed:** 1
**Status:** issues_found

## Summary

Reviewed the full diff of `pages.jsx` between the phase baseline (`26e459b`) and `HEAD` — the only file this phase touched (confirmed via `git diff --stat`; `styles.css` and `components.jsx` are untouched). The change set is exactly what the plan summaries describe: CTA reordering/reclassing in the three Home hero variants, a stale-count fix (`STORES.length` replacing a hardcoded `11`), heritage microcopy on Home store-preview cards, two repaired dead CTAs (Magazine's PDF button → scroll-to-iframe, `SubscribeBanner`'s secondary CTA → scroll-to-top), an `aria-label` addition on `StoresPage`'s list-view rows, and several lede/intro rewrites.

Verification performed:
- Re-ran the full diff hunk-by-hunk against the five SUMMARY files and the UI-SPEC's locked exact strings/decisions — no mismatch found between what was claimed and what actually landed in the file.
- Ran the file through `@babel/standalone`'s `preset-react` transform — it compiles cleanly, confirming no JSX syntax errors (unclosed tags, malformed expressions) were introduced anywhere in the file, not just in the touched hunks.
- Confirmed no CSS file was touched (`git diff --stat` shows only `pages.jsx`), satisfying the UI-SPEC's "zero new CSS classes/colors" hard constraint.
- Confirmed the paywall/subscribe mechanic (the `ladidier_subscribed` localStorage key, the 15000ms fallback timer, the gate heading, the form `onSubmit` handler) is byte-identical pre/post phase.
- Confirmed all touched external-link elements (`target="_blank"` anchors, `window.open(..., "_blank", "noopener,noreferrer")` calls) retain their `noopener,noreferrer` protections — none of the diff hunks touch these attributes.
- Grepped the diff's added lines for hardcoded secrets, `eval`/`innerHTML`/`dangerouslySetInnerHTML`, `console.*`, `debugger`, and empty catch blocks — none found.
- Traced both repaired CTA handlers (`iframeRef.current && iframeRef.current.scrollIntoView(...)`, `window.scrollTo({ top: 0, behavior: "smooth" })`) against their existing precedents in the file/`components.jsx` — both reuse the codebase's established scroll idiom correctly and don't touch unrelated state.

No Critical or logic-breaking findings. The two lower-severity findings below concern an accessibility fix that doesn't fully achieve its stated goal, and a maintainability nit around copy duplication introduced by this phase's pattern of repeating an identical CTA string across three components.

## Warnings

### WR-01: `aria-label` added to a non-interactive, non-focusable `<div>` — accessibility fix is incomplete

**File:** `pages.jsx:714`
**Issue:** `StoresPage`'s Index/list view row was given `aria-label={\`Visit the Boutique — ${s.name}\`}` (per D-04/CTA-05) to make the per-store click target announce a name to screen readers. However, the element it was added to is a plain `<div className="store-row" onClick={...}>` — it has no `role="button"`, no `tabIndex`, and no `onKeyDown`/`onKeyPress` handler:

```jsx
<div className="store-row" aria-label={`Visit the Boutique — ${s.name}`} onClick={() => window.open(s.url, "_blank", "noopener,noreferrer")}>
```

Two independent problems compound here:
1. **Not keyboard-operable.** A sighted keyboard-only user (or a screen-reader user in forms/focus mode) cannot `Tab` to this row at all, so the store can never be opened without a mouse/touch pointer, regardless of whatever `aria-label` says.
2. **`aria-label` on a bare `<div>` (implicit ARIA role `generic`) is not guaranteed to be exposed as the element's accessible name.** The W3C accname computation only guarantees `aria-label` support for elements whose role supports naming (interactive/landmark/widget roles); `role="generic"` is explicitly excluded. In practice, support varies by AT/browser combination — some virtual-cursor screen readers will still read it while scanning the DOM, but NVDA/JAWS/VoiceOver do not treat a generic `<div>` as a focus stop or reliably announce it as a named unit the way they would a `<button>` or an `<a>`.

The net effect is that the accessibility gap this fix was meant to close (per D-04: "so screen readers announce the store name") is only partially closed, and the keyboard-access gap isn't addressed at all — while the summary/UI-SPEC report this as a satisfied requirement.

**Fix:** Add `role="button"` and `tabIndex={0}` plus a keyboard handler that mirrors the click behavior, e.g.:

```jsx
<div
  className="store-row"
  role="button"
  tabIndex={0}
  aria-label={`Visit the Boutique — ${s.name}`}
  onClick={() => window.open(s.url, "_blank", "noopener,noreferrer")}
  onKeyDown={(e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      window.open(s.url, "_blank", "noopener,noreferrer");
    }
  }}
>
```
(Alternatively, wrap the row contents in an `<a href={s.url} target="_blank" rel="noopener noreferrer">` the way the Gallery view and `StoresPreview` already do — that gets keyboard operability and accessible naming for free without any ARIA role-patching, and is more consistent with the rest of the file.)

## Info

### IN-01: Identical `aria-label` fix was deliberately not applied to `HeroIndex`'s structurally identical row

**File:** `pages.jsx:152` (unfixed) vs. `pages.jsx:714` (fixed)
**Issue:** `HeroIndex` renders the exact same click-to-open-external-store pattern:

```jsx
<div className="store-row" onClick={() => window.open(s.url, "_blank", "noopener,noreferrer")}>
```

This row was intentionally left without the new `aria-label` (per the 04-03 plan's documented scope boundary). Before this phase both call sites had identical (missing) accessibility support; after this phase, one has an `aria-label` and the other doesn't, for what is visually and functionally the same interaction. This is a deliberate, documented scope decision rather than an oversight, but it leaves the site in a state where the same component pattern behaves inconsistently for assistive-technology users depending on which page they're on.
**Fix:** If/when WR-01 is addressed, consider applying the same fix to `HeroIndex`'s row at the same time so the two identical patterns don't diverge further, or track it explicitly as a follow-up item rather than leaving it implicit.

### IN-02: "Shop the Houses" duplicated verbatim across three components with no shared source

**File:** `pages.jsx:42`, `pages.jsx:85`, `pages.jsx:138`
**Issue:** The new primary CTA string `"Shop the Houses"` (and `"Shop the Houses →"` in `HeroIndex`) is hand-typed identically in `HeroManifest`, `HeroSplit`, and `HeroIndex`. This is the same failure shape that produced this phase's own D-08 bug fix (`StoresPreview`'s "11 Houses" going stale because it was a literal instead of a computed/shared value) — if a future edit updates the CTA wording in one hero variant and misses the other two, the three variants will silently drift out of the "one consistent primary CTA string" guarantee that D-02/04-01-SUMMARY explicitly calls out as the point of this change.
**Fix:** Not urgent given this is a zero-build, no-abstraction codebase where literal repetition is the established convention throughout the file — but worth a one-line comment near each occurrence (or a single `const PRIMARY_CTA = "Shop the Houses";` near the top of the Home section) noting that the three strings must stay in sync, so a future editor doesn't have to rediscover the D-02 guarantee by re-reading 04-01-SUMMARY.md.

---

_Reviewed: 2026-08-21T00:00:00Z_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
