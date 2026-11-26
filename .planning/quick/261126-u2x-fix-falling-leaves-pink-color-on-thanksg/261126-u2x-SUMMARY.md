---
phase: 261126-u2x
plan: "01"
subsystem: home-thanksgiving
tags: [thanksgiving, falling-leaves, color-palette, svg, visual-polish]
status: complete
commit: 28e0c16
---

# Quick Task 261126-u2x Summary: Fix Falling Leaves Pink Color on Thanksgiving Theme

**Status:** complete

## Context & Root Cause
On the seasonal Thanksgiving theme, falling leaves previously relied on system emojis (`["🍂", "🍁", "🍂", "🍁", ...]`). On Windows systems using Segoe UI Emoji, the maple leaf emoji (`🍁`, `U+1F341`) is rendered in a vibrant hot pink / magenta color. Because half of the leaves were `🍁`, Windows users saw a continuous shower of bright pink leaves across the home page instead of warm autumnal foliage. Furthermore, OS emojis vary significantly in color balance, sizing, and style across platforms (Windows vs macOS vs iOS vs Android).

## Changes Made
1. **Bespoke Autumn Leaf SVG Components (`src/pages.jsx`)**:
   - Replaced raw emojis with a dedicated `AutumnLeaf` component rendering clean botanical vector silhouettes:
     - `maple`: jagged 5-point maple leaf silhouette
     - `oak`: undulating lobed oak leaf silhouette
     - `birch`: pointed tear-drop leaf with elegant leaf-vein division
   - Configured an `AUTUMN_LEAVES` array with authentic Thanksgiving harvest tones:
     - `#C85A17` (burnt orange)
     - `#D48B28` (warm amber gold)
     - `#9E381C` (deep rust)
     - `#B5501B` (terracotta)
     - `#E09C32` (harvest gold)
     - `#A2481A` (cinnamon / russet)
     - `#8B2E1E` (deep burgundy / wine)
     - `#C46822` (spiced amber)
   - Every single leaf has an explicit hex fill color — guaranteeing 100% color fidelity and eliminating all pink/magenta vendor emoji rendering across every operating system and browser.

2. **CSS Polish (`src/styles.css`)**:
   - Updated `.thanks-leaves span` to `inline-flex` with centering and subtle dark drop-shadow (`filter: drop-shadow(0 2px 6px rgba(0, 0, 0, 0.4))`).
   - Retained staggered entry delays (`0s` to `9.1s`) and varying durations (`9s` to `12s`) with 3D-like drifting and rotating animation.
   - Retained `prefers-reduced-motion` compliance.

3. **Production Build & Verification**:
   - Executed `npm run build` with Vite — all modules bundled cleanly in ~680ms with zero errors.
   - Generated updated production bundle in `dist/`.

## Commits
- `28e0c16`: `fix(home): replace emoji leaves with bespoke SVG autumn foliage to fix pink hue`
