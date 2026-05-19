---
quick_id: 260519-rat
slug: use-mag-cover-png-from-assets-folder-on-
description: use Mag cover.png from assets folder on magazine cover
date: 2026-05-19
---

# Quick Task: Use Mag cover.png on magazine cover

## Task
Set `assets/Mag cover.png` as the magazine cover image and fix the CSS `url()` quoting so the filename space renders correctly.

## Changes
- `components.jsx` line 10: `IMG.cover = "assets/Mag cover.png"`
- `components.jsx` line 396: `url("${photo}")` (quoted URL for filename with space)
