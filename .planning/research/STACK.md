# Stack Research

**Domain:** Client-side HTML5 video playback widget (AI avatar FAQ concierge) in an existing React 19 + Vite SPA
**Researched:** 2026-09-04
**Confidence:** HIGH

## Recommended Stack

### Core Technologies

No new runtime dependencies are needed. Everything this feature requires is already in the project or is a native browser API.

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| Native `<video>` element (HTML5) | n/a (browser built-in) | Plays Idle.mp4, INTRO.mp4, Q1–Q15.mp4 | The assets are already-encoded local MP4s with no need for adaptive streaming, DRM, YouTube/Vimeo embedding, or multi-platform URL parsing. A raw `<video>` element gives full control over `muted`, `playsInline`, `preload`, `currentTime`, and the `play()`/`pause()` promise — exactly what a 4-state avatar needs, with zero bundle cost |
| React 19.2.8 built-in hooks (`useReducer`, `useRef`, `useEffect`) | Already in `package.json` (`^19.2.8`) | Drives the INTRO → IDLE → ANSWERING → IDLE state machine and holds the video DOM ref | A 4-state, single-actor state machine (with one "cut immediately to new answer" transition) is well within what `useReducer` + a ref handles cleanly. No state-machine library changes the architecture here — it would only wrap the same `videoRef.current.play()`/`.pause()` calls |
| Vite ^8.2.2 + `@vitejs/plugin-react` ^6.1.1 (already installed) | Already in `package.json` | Build tool serving `public/` as static passthrough | No config changes needed for playback itself; only the `public/assets/avatar/` placement (already decided in Key Decisions) and optional `vercel.json` cache headers (see below) touch the build/deploy layer |
| Plain CSS (`styles.css`, `theme.js`) | Already in project | Widget chrome, launcher button, category/question list, focus states | Matches the existing "no CSS framework" constraint; a floating popup with a video pane and a question list is straightforward with the current design system tokens |

### Supporting Libraries

None are needed. This section is intentionally empty — see "What NOT to Use" below for the libraries that look tempting but add unjustified weight.

### Development Tools

| Tool | Purpose | Notes |
|------|---------|-------|
| Browser DevTools Network throttling | Verify preload/lazy-load behavior under slow connections | Test with the 15 FAQ videos set to `preload="none"` (see Static Asset Delivery section) to confirm only the clicked answer downloads |
| `vercel dev` / a Vercel preview deployment | Verify Range-request (seek/scrub) behavior and Cache-Control headers actually applied in production, not just local Vite dev server | Vite's dev server and Vercel's edge network handle range requests and caching differently; confirm on an actual Vercel preview before considering this shippable |

## Installation

```bash
# No installation needed — this milestone adds zero new npm packages.
# The video widget is built entirely from:
#   - the native <video> element
#   - React 19's built-in useReducer/useRef/useEffect (already a dependency)
#   - plain CSS (already the project's styling approach)
```

## Alternatives Considered

| Recommended | Alternative | When to Use Alternative |
|-------------|-------------|-------------------------|
| Native `<video>` + a local custom hook | `react-player` | Only if you needed a single component to abstract over YouTube/Vimeo/Twitch/SoundCloud/local-file URLs interchangeably. This project has 16 local MP4s and no external platform sources, so that abstraction buys nothing and costs bundle size + an API surface built for a problem you don't have. (Note: as of 2026, `react-player`'s maintenance has been taken over by Mux — a sign it's actively maintained, not that it's needed here.) |
| Native `<video>` + a local custom hook | `video.js` / `plyr` (full media-framework players) | Use these if you need a themeable, keyboard-accessible player *chrome* (scrub bar, volume slider, fullscreen button, quality menu) out of the box. This widget's brief explicitly calls for a bespoke, non-chatbot, luxury-styled UI with its own question list as the "controls" — the FAQ questions *are* the UI, not a standard transport bar. A generic player skin would fight the design brief, not help it |
| `useReducer` for the 4-state machine | `xstate` / `@xstate/react` | Reach for XState when a state machine has many states, parallel/hierarchical regions, or needs to be visualized/tested as a formal chart (common in complex checkout flows, multi-step wizards). INTRO → IDLE → ANSWERING → IDLE with one "interrupt mid-answer" transition is small enough that XState's ~15-20kb (or its dependency footprint) and ceremony outweigh the benefit. If the FAQ widget later grows branching logic (e.g., a "did this help?" follow-up flow), XState becomes worth revisiting |
| `public/assets/avatar/*.mp4` served as-is | Vercel Blob Storage / a dedicated video CDN (Mux, Cloudinary, Bunny) | Revisit if: (a) file sizes grow past what's comfortable in a git repo, (b) you need on-the-fly transcoding/adaptive bitrate, or (c) Fast Origin Transfer bandwidth costs become material (see Pitfalls). For 16 fixed, pre-encoded files under GitHub's 100MB/file limit, the existing `public/assets/` convention this project already uses for images is the lowest-complexity choice and was already decided in PROJECT.md's Key Decisions |

## What NOT to Use

| Avoid | Why | Use Instead |
|-------|-----|-------------|
| `react-player` | Pulls in an abstraction layer (URL sniffing, provider-specific players, lazy-loaded provider bundles) for a problem — "play this one of 16 known local MP4 files" — that doesn't need URL polymorphism. Adds bundle weight and an extra dependency to keep patched for zero functional gain here | A local `<video ref={videoRef} />` plus a small custom hook (e.g. `useAvatarPlayer`) that exposes `play(src)`, `pause()`, and the current phase |
| `video.js` / `plyr` / other full player-chrome libraries | Ship their own CSS/skin system and default controls UI that would need to be entirely overridden to match the luxury design system — you'd pay the bundle cost and then hide most of what you paid for | Custom-styled play state indicators (if any) built with the existing plain-CSS design system; the FAQ question list is the primary control surface, not a scrub bar |
| `xstate` for this specific state machine | Overkill for 4 states and one interrupt transition; adds a dependency, a new mental model, and boilerplate (machine config, actions, guards) that a 15-line `useReducer` covers | `useReducer` with an explicit `{ phase: 'INTRO' | 'IDLE' | 'ANSWERING', activeQuestionId }` state shape |
| `<link rel="preload" as="video">` in `index.html` | Browser support for preloading `<video>` via `<link>` is inconsistent (notably weak/removed in some Chromium versions for the `video` `as` value) and it would force-download large files before they're needed, working against the "only load what's clicked" goal | The native `preload` attribute on each `<video>` element, tuned per phase (see Static Asset Delivery below), and lazy-swapping `src` on demand |
| Autoplay-with-sound on page load for INTRO | No 2026 browser (Chrome, Safari, Firefox, Edge) allows unmuted autoplay without a preceding user gesture on the page/site — it will silently fail or throw on the `play()` promise | `muted` autoplay for INTRO and IDLE (already decided in PROJECT.md), unmuted playback only inside a click handler for FAQ answers (direct user gesture) |
| Mounting/unmounting a separate `<video>` element per FAQ answer | Causes flicker, re-triggers browser decode/allocation overhead per swap, and complicates "cut immediately to the new answer" when a question is clicked mid-answer (two elements racing) | One persistent `<video>` element per phase context (or one for INTRO/IDLE + one for ANSWERING), swapping `.src`/`currentSrc` and calling `.load()` + `.play()` — the standard pattern for HLS-free single-source swaps |

## Stack Patterns by Variant

**If you want a reusable hook (recommended over inlining logic in the component):**
- Write a small local hook, e.g. `src/hooks/useAvatarPlayer.js`, that wraps a single `videoRef`, exposes `playSrc(url, { muted, loop })`, `phase`, and handles the `play()` promise rejection path (see Pitfall below) — this satisfies the PROJECT.md architecture note (`VideoController` as a separate concern from `AvatarVideo`/`FAQCategories`) without pulling in a dependency
- Because it's ~30-50 lines of plain React and keeps the FAQ-to-video mapping (a plain JS object/array) completely decoupled from playback mechanics, matching the "reusable component architecture" requirement already in scope

**If targeting iOS Safari (required — it's the strictest browser):**
- Every `<video>` element needs both `muted` and `playsInline` attributes set before the first `play()` call, or Safari will block autoplay and/or force fullscreen takeover on tap
- Because Safari uniquely requires `playsInline` for inline (non-fullscreen) playback on iPhone, and requires either `muted` or no audio track for ANY autoplay (including the very first `play()` call triggered without a direct tap)

**If a `play()` call might be rejected (autoplay blocked, e.g., iOS Low Power Mode or unusual privacy settings):**
- Always treat `videoRef.current.play()` as returning a Promise and handle rejection by falling back to a visible "tap to begin" affordance rather than a silent broken widget
- Because Chrome, Safari, and Firefox all reserve the right to reject autoplay even when muted (data-saver modes, low-power modes, some in-app browsers), and an unhandled rejected promise here would otherwise just look like the widget silently failed to open

**If switching FAQ answers while one is already playing (explicit requirement — "switching questions mid-answer cuts immediately"):**
- On question click: set `videoRef.current.muted = false`, set `.src` to the new answer's URL, call `.load()`, then `.play()` — all synchronously inside the click handler (no `await` before `.play()`)
- Because calling `.play()` synchronously within the click event handler preserves the browser's "transient activation" from the user gesture, which is what allows unmuted playback; inserting an `await` (e.g., for an unrelated async call) before `.play()` risks the gesture expiring in some browsers and the unmuted `play()` being blocked

## Version Compatibility

| Package A | Compatible With | Notes |
|-----------|-----------------|-------|
| react@19.2.8 / react-dom@19.2.8 | vite@8.2.2, @vitejs/plugin-react@6.1.1 | Already installed and building successfully per the existing `package.json` — no version changes needed for this milestone |
| Native `<video>` (HTML5) | All evergreen browsers (Chrome, Safari, Firefox, Edge) at current versions | MP4/H.264 playback is universally supported; no polyfill needed. Confirm the source files are H.264/AAC in an MP4 container (the most broadly compatible combination) rather than a codec needing browser-specific handling |
| Vite `public/` directory | Vercel static file serving | Files referenced as root-absolute paths (e.g. `/assets/avatar/Idle.mp4`) are copied byte-for-byte into the `dist` output and served as-is by Vercel's CDN with no transformation — confirmed compatible with the project's existing `framework: "vite"` `vercel.json` setup |

## Static Asset Delivery: Vite + Vercel Considerations

These aren't new dependencies, but they are real integration points with the existing build/deploy setup that affect whether the widget feels "instant" or "sluggish."

**1. `preload` strategy per video, not one blanket setting:**
- INTRO and Idle: `preload="auto"` — both are needed immediately on page load; the browser should start buffering them right away
- The 15 FAQ answer videos: `preload="none"` on each `<video>` (or don't mount them at all until selected — a single shared `<video>` element with `src` set on click is simpler and avoids 15 preload decisions entirely). With ~250MB total assets and a largest single file of ~31MB, downloading all 15 up front would be a real load-time and bandwidth cost for zero benefit, since only one is ever played per click

**2. Byte-range (seek) support is automatic, not something to configure:**
- Vercel's CDN and origin both honor HTTP Range requests for static files out of the box (this is standard for static file serving, and Safari specifically *requires* range-request support or it will refuse to play a source at all — it probes with a 2-byte range request before committing to a video source). No `vercel.json` configuration is needed to get this; it's default behavior for static assets, not something to build yourself

**3. Cache-Control needs an explicit `vercel.json` header rule — this is the one real action item:**
- Vercel's default header for static files is `Cache-Control: public, max-age=0, must-revalidate` at the browser layer (the CDN edge caches for up to 31 days regardless, but returning visitors' browsers will still revalidate every load without an explicit override)
- Since these video files are fixed, versioned-by-filename assets that won't change silently, add a header rule to the existing `vercel.json` (the project already has one, with no `headers` block yet) scoping a long-lived, immutable cache to just this path:
  ```json
  {
    "headers": [
      {
        "source": "/assets/avatar/(.*)",
        "headers": [
          { "key": "Cache-Control", "value": "public, max-age=31536000, immutable" }
        ]
      }
    ]
  }
  ```
- Because without this, a returning visitor's browser re-validates (and potentially re-downloads) multi-megabyte video files on every homepage visit instead of serving them instantly from local disk cache. If a video file is ever replaced with different content in the future, use a new filename (e.g. `Q3-v2.mp4`) rather than overwriting `Q3.mp4` in place, since `immutable` tells browsers to never re-check that exact URL

**4. Bandwidth cost is a real, non-technology consideration — flag it, don't ignore it:**
- Vercel's Hobby plan includes 100GB/month of data transfer with a hard cap (no overage billing — the project pauses); Pro plan bills Fast Origin/Data Transfer usage-based beyond included allowances. Video is one of the more bandwidth-heavy content types by nature
- This isn't a stack decision, but it's worth surfacing to the roadmap/PROJECT.md owner: monitor actual usage after launch, since a widget that autoplays a muted idle loop for every homepage visitor (even those who never click a question) adds baseline bandwidth that a static page doesn't have. (Muted idle/intro videos are small relative to the 15 answer videos, which are the larger cost driver and are already gated behind a click.)

## Sources

- `package.json` (this repo) — verified installed versions: react@19.2.8, react-dom@19.2.8, vite@8.2.2, @vitejs/plugin-react@6.1.1 (HIGH confidence — first-party, read directly from the project)
- `vite.config.js`, `vercel.json` (this repo) — verified current build/deploy config, confirmed no existing `headers` block (HIGH confidence — first-party)
- [Autoplay policy in Chrome | Chrome for Developers](https://developer.chrome.com/blog/autoplay) — Chrome's autoplay rules (MEDIUM-HIGH confidence — official vendor docs via web search)
- [Autoplay Policy Design Rationale — Chromium](https://www.chromium.org/audio-video/autoplay/autoplay-policy-design-rationale/) — cross-browser autoplay rationale (MEDIUM-HIGH confidence — official project docs)
- [Video and Audio Autoplay Policies Across Browsers — TestMu AI](https://www.testmuai.com/blog/video-audio-autoplay-policies-across-browsers/) — cross-browser comparison confirming Safari requires `playsInline` + muted/no-audio-track, Chrome/Firefox require gesture for sound (MEDIUM confidence — third-party summary, cross-checked against Chromium's own docs)
- [HTTP Range Requests explained — http.dev](https://http.dev/range-request) and [Serving Video with HTTP Range Requests — smoores.dev](https://smoores.dev/post/http_range_requests/) — confirms Safari's range-request probing behavior for video sources (MEDIUM confidence)
- [Vercel Limits — vercel.com/docs/limits](https://vercel.com/docs/limits) (fetched directly, last_updated 2026-09-03) — confirmed Static File uploads limit (100MB Hobby / 1GB Pro, applies to CLI deploys), no separate per-file static-asset limit distinct from that (HIGH confidence — official, current docs)
- [Cache-Control headers — Vercel docs](https://vercel.com/docs/caching/cache-control-headers) and [Caching on Vercel's Edge Network](https://vercel.com/docs/edge-network/caching) — confirmed default `public, max-age=0, must-revalidate` browser header vs. 31-day edge cache, and the `vercel.json` `headers` override pattern (MEDIUM-HIGH confidence — official docs surfaced via web search, pattern is standard and low-risk to verify on a preview deploy)
- [Vite: Static Asset Handling](https://vite.dev/guide/assets) — confirmed `public/` directory is copied as-is with root-absolute references, and that Vite's asset-preload plugin only covers *imported/bundled* assets, not `public/` files (HIGH confidence — official Vite docs)
- Vercel Hobby plan 100GB/month Fast Data Transfer cap with hard pause on overage — cross-referenced across multiple 2026 pricing summaries (MEDIUM confidence — third-party summaries of vendor pricing, treat as directionally correct and verify current numbers on vercel.com/pricing before launch)

---
*Stack research for: AI Video Avatar FAQ Concierge widget (client-side video playback)*
*Researched: 2026-09-04*
