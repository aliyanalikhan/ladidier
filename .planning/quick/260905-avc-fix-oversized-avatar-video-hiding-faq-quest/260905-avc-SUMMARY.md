---
phase: 260905-avc
plan: "01"
subsystem: avatar-faq
tags: [avatar-video, css, bugfix, phase-10]
status: complete

# Dependency graph
requires:
  - phase: 10-03
    provides: .avatar-faq-video / .avatar-faq-questions layout this fixes
provides:
  - .avatar-faq-video capped at a fixed 240px height with object-fit cover
affects: [avatar-faq-widget]
---

# Quick Task 260905-avc Summary

**Status:** complete

## What the user reported

"avatar audio is not coming" and "ui is not good of avatar popup" (with a screenshot showing the
widget mostly filled by a plain portrait video, no visible question buttons).

## Root cause (verified live in-browser, not guessed)

`.avatar-faq-video` (`src/styles.css`) had `width: 100%` with no height constraint, so the video
rendered at its natural aspect ratio. The real footage is portrait (~1076×1924, ~9:16), which at
the widget's ~345px content width computes to **~616px tall** — taller than the widget's entire
`max-height: 600px` budget by itself.

Because the video has `flex: none` (never shrinks) inside the `.avatar-faq-widget` flex column,
the flex model gave it its full intrinsic height and left `.avatar-faq-questions` (`flex: 1;
min-height: 0`) **0px of remaining space**. Confirmed via live DOM measurement:
`.avatar-faq-questions` had `clientHeight: 0` with all 15 `<button>`s present but invisible and
functionally unreachable by scroll (the widget's own `overflow-y: auto` only had ~16px of scroll
room — the height of the video's overflow past the 600px cap, not enough to reveal any button
row).

This explains **both** complaints as one bug: real mouse/touch users could not see or click any
FAQ question, so `askQuestion()` never fired, the reducer never entered `answering` phase, and the
avatar was never heard — only the always-muted intro/idle loop ever played. Verified the audio
pipeline itself is correct: forcing a trusted click (real mouse click via automation, and
separately a keyboard-focus + Enter) on a question button did unmute (`muted: false`), advance
`currentTime`, and play with `volume: 1` — the state machine, reducer, and autoplay-unmute logic
from 10-02/10-03 all work as designed. The only defect was the video's missing height cap.

Not a Phase 11 scope gap: the interim CSS's own comment says "the video stays put at the top while
the list scrolls in its own area beneath it" and the UI-SPEC's overflow contract promises "all 15
buttons stay reachable by scroll" — this was already broken against Phase 10's own stated intent,
not a deferred polish item.

## Fix

`src/styles.css` `.avatar-faq-video`: added `height: 240px; object-fit: cover;` so the video is
cropped to a fixed, reasonable panel height regardless of the source footage's aspect ratio,
restoring `.avatar-faq-questions` to its intended ~358px of scrollable space (verified live).

## Verification

- Reloaded the widget: intro video now renders as a cropped 240px-tall panel with the full
  "About LaDidiér" category and its 5 questions visible immediately underneath, no scroll needed.
- Real mouse click on "What is LaDidiér?" → video switches to `Q1.mp4`, `muted: false`,
  `paused: false`, `currentTime` advancing, `volume: 1` — audio plays.
- `npm run build` passes.

## Known gap (not in scope here)

The widget's plain, unstyled appearance (no launcher button, no close/collapse chrome, flat white
background) is Phase 10's documented interim state (D-04) — real chrome is explicit Phase 11 scope
(WIDGET-01..04). Only the layout-breaking oversized-video bug was fixed here.
