---
status: complete
quick_id: 260519-rat
date: 2026-05-19
commit: f54c505
---

# Summary: Use Mag cover.png on magazine cover

## What was done
- Changed `IMG.cover` from `assets/eclat-cover.png` → `assets/Mag cover.png`
- Fixed `MagazineCover` component: wrapped the CSS `url()` value in quotes (`url("${photo}")`) so the space in the filename is parsed correctly by the browser

## Why the fix was needed
CSS `url()` without quotes fails when the path contains spaces. `url(assets/Mag cover.png)` is invalid; `url("assets/Mag cover.png")` is correct.

## Files changed
- `components.jsx` — IMG.cover path + url() quote fix

## Commit
`f54c505` feat: use Mag cover.png as magazine cover image
