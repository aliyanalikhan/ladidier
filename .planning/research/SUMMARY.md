# Project Research Summary

**Project:** LaDidier v1.3 -- AI Video Avatar FAQ Concierge
**Domain:** Client-side floating video-FAQ widget added to an existing production React 19 + Vite + Vercel luxury e-commerce SPA
**Researched:** 2026-09-04
**Confidence:** HIGH

## Executive Summary

This milestone adds a bottom-right, auto-opening floating widget to the homepage that plays a pre-recorded "AI avatar" video (INTRO into looping IDLE into ANSWERING one of 15 FAQ clips and back to IDLE), navigated through a 4-category accordion. It is entirely client-side and static: no new npm dependencies, no backend, no video generation. Experts building this kind of thing use the native video element driven by a useReducer finite-state-machine (not a state-machine library, not a chat/player framework), a single persistent DOM node with src swapped on demand (never one video element per clip), and a plain-data module decoupling the FAQ-to-video mapping from the UI -- all of which map directly onto this codebase's existing conventions (theme.js, perks.jsx, treasure.jsx).

The recommended approach is: mount the widget as a child of HomePage (not App) so it inherits the existing route-keyed remount/unmount lifecycle for free; build one useVideoAvatar hook owning a phase/questionId reducer as the single source of truth; drive the video element imperatively (.load()/.play()) from a useEffect, always handling the play() promise rejection; and keep the 15 answer videos preload="none"/unmounted until clicked so only about 37MB (intro+idle) loads on first paint instead of the full ~250MB. Visual design should explicitly avoid generic chatbot chrome (speech bubbles, "online" dots, typing indicators) in favor of an editorial, magazine-video framing consistent with the brand's "premium, not SaaS support" positioning.

The primary risks are almost entirely lifecycle and platform-policy pitfalls rather than technology choices: unhandled autoplay-rejection on iOS (missing playsInline/Low Power Mode), video state drifting from React state under rapid FAQ-switching, the widget's video continuing to play after route navigation away from home (violating "homepage only"), the intro replaying every time a user navigates home-away-home (must be gated with sessionStorage, not component state), and Vercel's separate Static-File-Upload/bandwidth limits (distinct from the already-considered GitHub 100MB/file limit) given ~250MB of new video assets that autoplay on every homepage load. All of these are cheap to prevent at design time and expensive to retrofit, so they should be resolved in the architecture/state-machine phase, not discovered in QA.

## Key Findings

### Recommended Stack

No new runtime dependencies. The entire feature is built from the native HTML5 video element, React 19's built-in useReducer/useRef/useEffect (already installed at ^19.2.8), and the project's existing plain-CSS styling approach -- all confirmed compatible with the current Vite ^8.2.2 + Vercel static-file pipeline with zero config changes beyond one vercel.json cache-header rule.

**Core technologies:**
- Native video element -- plays all 17 MP4 clips -- full control over muted/playsInline/preload/currentTime with zero bundle cost; no adaptive streaming or multi-source abstraction is needed for 17 fixed local files
- React 19 useReducer + useRef + useEffect (already a dependency) -- drives the INTRO to IDLE to ANSWERING to IDLE state machine and syncs it to the DOM video node -- a formal state-machine library (XState) is unjustified ceremony for 4 states and one interrupt transition
- Plain CSS (styles.css, theme.js) -- widget chrome, launcher, accordion -- matches the existing no-framework, single-global-stylesheet convention
- vercel.json header rule (new, one-time addition) -- sets Cache-Control: public, max-age=31536000, immutable on /assets/avatar/(.*) so repeat visitors don't re-validate/re-download multi-MB video on every load

**Explicitly avoid:** react-player (URL-polymorphism nobody needs for 17 known local files), video.js/plyr (ship opinionated player chrome that fights the bespoke luxury design), xstate (overkill for 4 states), link rel="preload" as="video" (inconsistent browser support, defeats "only load what's clicked").

### Expected Features

This is a novel product category (no directly comparable public reference implementation exists) -- feature guidance synthesizes chat-widget UX research (HIGH confidence), browser autoplay/viewport platform behavior (HIGH confidence), and inference from adjacent AI-avatar and FAQ-accordion categories (MEDIUM confidence).

**Must have (table stakes):**
- Bottom-right fixed launcher, matching years of chat-widget convention
- Persistent, always-reachable close/minimize control (critical since the widget auto-opens uninvited)
- Bounded floating panel -- never a hero/full-page takeover (explicitly rejected by the user)
- Muted, playsInline autoplay for intro/idle (browser-enforced, not optional)
- Clear visual resolution when an answer ends -- return to a visibly distinct IDLE state, not a frozen last frame
- Category to question accordion reachable in 2 taps or fewer (4 categories, 15 questions)
- Full keyboard/screen-reader operability including a prefers-reduced-motion fallback

**Should have (differentiators):**
- Editorial/magazine-style avatar framing -- no chatbot iconography, no "online" dot, no typing indicator
- Concierge-toned status microcopy ("Playing your answer") instead of system-speak
- Smooth crossfade/immediate-cut craft on question-switch mid-answer (requires dual-buffer or careful single-node handling)
- Progressive category disclosure rather than a dense 15-item wall

**Defer (v2+):** free-text chat input (explicitly out of scope -- reintroduces the exact chatbot surface area this widget avoids), full-screen modal takeover, auto-advancing "next question" carousel, live/generative real-time avatar (Tavus/HeyGen-style -- entirely different infra and cost model), site-wide (non-homepage) rollout, multi-language videos, personalized question targeting.

### Architecture Approach

The codebase's established pattern -- a single self-contained .jsx feature file mounted as a plain JSX sibling inside a page component, with content-as-data kept in a separate plain .js module (as theme.js already does) -- applies directly here. AIAvatarFAQ should be a new avatarFaq.jsx mounted inside HomePage (not App), so it automatically inherits the existing main-tag key-by-route remount-on-navigate behavior for free, satisfying "homepage only" and "intro plays once" concerns without new plumbing (paired with sessionStorage for the "once" flag, since remount alone resets local component state).

**Major components:**
1. avatarFaqData.js -- plain data module (no React import): 4 categories to 15 questions to video paths, plus a flat id-to-question lookup; decouples content edits from component code
2. useVideoAvatar (hook, in avatarFaq.jsx) -- useReducer finite-state-machine (intro/idle/answering + questionId) that is the single source of truth; a useEffect syncs reducer state to the imperative video API (.muted, .load(), .play() with rejection handling)
3. AvatarVideo -- pure presentational video wrapper, one persistent DOM node with src swapped in place (never keyed/remounted per clip, never one element per FAQ answer)
4. FAQCategories -- renders the accordion from avatarFaqData.js, emits onSelect(questionId), owns no playback state of its own
5. AIAvatarFAQ -- outer shell composing the above: launcher chrome, open/closed panel state, no-focus-trap Escape-to-close (following the .perk-reveal/.treasure-reveal precedent, not the modal .mobile-overlay precedent)

### Critical Pitfalls

1. **Unhandled play() promise rejection** -- always .catch() the play() promise; distinguish AbortError (expected on rapid src-switch, swallow it) from NotAllowedError (real autoplay block, show a visible "tap to play" fallback)
2. **iOS Safari autoplay/fullscreen/Low Power Mode** -- muted + playsInline + autoPlay must all be set together, tested on a real iPhone (not emulation), including with Low Power Mode on
3. **State/video desync under rapid FAQ switching** -- drive UI state from native video events (onPlay/onEnded), not from click-handler intent alone; guard stale event handlers with a generation counter, since the spec explicitly requires "mid-answer click cuts immediately"
4. **Widget keeps playing after navigating away from home / intro replays on every home revisit** -- mount inside HomePage (inherits correct unmount via key-by-route) and persist "intro played" in sessionStorage, not component state -- these two fixes must be made together
5. **Vercel static-file-upload and bandwidth limits, plus eager-loading all 15 answer videos** -- verify the Vercel plan tier supports ~250MB of new static assets (Hobby caps at 100MB total uploads) before merging, and keep the 15 FAQ videos preload="none"/unmounted until clicked so only ~37MB loads on first paint

## Implications for Roadmap

Based on research, suggested phase structure:

### Phase 1: Data + State Machine Foundation
**Rationale:** Everything else (video wiring, UI, accessibility) depends on a correct FAQ-to-video data shape and a correct phase/transition model; research explicitly recommends building and manually exercising the reducer before touching any DOM node.
**Delivers:** avatarFaqData.js (categories/questions/video paths + flat lookup) and the useVideoAvatar reducer (phase transitions, mid-answer interrupt rule, stale-event guard via generation counter), unit-exercisable with no browser.
**Addresses:** FAQ-to-video mapping decoupling (table stakes), "switching mid-answer cuts immediately" (table stakes).
**Avoids:** Pitfall 5 (state/video desync), Pitfall 4 (hardcoded paths).

### Phase 2: Video Playback + Lifecycle
**Rationale:** Wires the reducer to a real video element and resolves the highest-risk browser-policy and lifecycle pitfalls before any UI/accessibility polish is layered on top -- retrofitting these later touches every transition path.
**Delivers:** AvatarVideo, the DOM-sync useEffect (muted/playsInline/.load()/.play() with rejection handling), mount placement inside HomePage, sessionStorage-backed "intro played once" flag, preload="none" + on-demand mounting for the 15 answer videos.
**Uses:** Native video element, useReducer/useRef/useEffect from STACK.md.
**Implements:** AvatarVideo + useVideoAvatar architecture components; avoids Pitfalls 1, 2, 3, 4, 12, 13.

### Phase 3: Widget UI -- Launcher, Accordion, Bespoke Chrome
**Rationale:** With playback correct and safe, build the visible product: the launcher, the 4-category accordion, and the editorial (non-chatbot) visual language that is this milestone's core differentiator.
**Delivers:** AIAvatarFAQ shell (open/closed state, no-focus-trap Escape-to-close matching .perk-reveal/.treasure-reveal precedent), FAQCategories accordion, .avatar-faq-* styles using existing design tokens, z-index placed correctly relative to .mobile-overlay(100)/.perk-reveal/.treasure-reveal(500) with the mobile nav's open state pausing widget video.
**Addresses:** Bottom-right launcher, persistent close control, bounded panel, editorial chrome, category accordion (all table stakes + top differentiator).
**Avoids:** Pitfall 9 (accidental keyboard trap), Pitfall 11 (z-index vs. mobile nav).

### Phase 4: Accessibility, Mobile, and Deployment Readiness
**Rationale:** Research repeatedly flags these as "looks done but isn't" gaps that require dedicated, explicit verification (real-device testing, OS-level toggles, dashboard checks) rather than incidental coverage -- best done as a discrete final pass before ship.
**Delivers:** prefers-reduced-motion JS-level autoplay suppression (not just CSS), keyboard/screen-reader walkthrough with WCAG 1.4.2-compliant audio control, env(safe-area-inset-bottom) + real iPhone/Android device testing, Vercel plan-tier verification, vercel.json Cache-Control header for /assets/avatar/.
**Delivers:** A shippable, verified widget.
**Avoids:** Pitfalls 3, 7, 8, 10 -- all explicitly called out as easy to silently miss without dedicated verification.

### Phase Ordering Rationale

- Data/state-machine-first because every other phase (video wiring, UI, accessibility) reads from or dispatches into it; getting the transition rules wrong here (especially the mid-answer interrupt and stale-event guard) is the most expensive thing to retrofit per PITFALLS.md.
- Playback/lifecycle before UI because browser autoplay policy, route-mount lifecycle, and session persistence are hard technical constraints that shape how the UI can even be built (e.g., a visible "tap to play" fallback must exist as a UI state, not be bolted on after).
- Bespoke UI/chrome third because it's the highest-visibility differentiator but has the lowest technical risk (per FEATURES.md, it's "almost entirely a CSS/art-direction problem") -- safe to build once playback is solid.
- Accessibility/mobile/deployment last as a dedicated verification pass, matching this project's own precedent (v1.0 had a dedicated mobile CSS pass phase) and PITFALLS.md's explicit "looks done but isn't" checklist, which spans concerns that cut across all three earlier phases and are easy to falsely assume are "already covered."

### Research Flags

Phases likely needing deeper research during planning:
- **Phase 2 (Video Playback + Lifecycle):** iOS Safari autoplay/Low-Power-Mode behavior and the generation-counter pattern for rapid-switch guarding are well-documented but subtle enough to warrant a focused research-phase pass if the implementer hasn't built this exact pattern before.
- **Phase 4 (Accessibility, Mobile, Deployment):** WCAG 1.4.2 audio-control requirements and Vercel plan-tier/bandwidth verification are one-time checks best confirmed against current official docs at plan time, not assumed from this research alone (Vercel pricing/limits pages change).

Phases with standard patterns (skip research-phase):
- **Phase 1 (Data + State Machine):** useReducer-as-FSM and plain-data-module patterns are already fully specified in ARCHITECTURE.md with working code examples matching this exact codebase's conventions.
- **Phase 3 (Widget UI):** Directly reuses this codebase's own existing .perk-reveal/.treasure-reveal popup precedent -- no external research needed, just consistent CSS/component authorship.

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | Verified directly against this repo's package.json/vite.config.js/vercel.json, plus official browser-vendor and Vercel docs |
| Features | MEDIUM | Genuinely novel product category with no public reference implementation; feature-specific claims are directional inference from adjacent categories, while browser/platform-constraint claims (autoplay, safe-area) are HIGH confidence specs |
| Architecture | HIGH | Codebase conventions read directly from app.jsx/perks.jsx/treasure.jsx/pages.jsx; state-machine and video-lifecycle patterns corroborated across multiple independent React/video sources |
| Pitfalls | HIGH | Vercel limits, WebKit autoplay policy, and all codebase-specific claims (z-index values, route/mount mechanics) verified directly against official docs and this repo's source files |

**Overall confidence:** HIGH

### Gaps to Address

- **Vercel plan tier:** Not verifiable from the codebase alone -- must be confirmed in the actual Vercel dashboard before the first production deploy that includes the ~250MB of video assets (Pitfall 3). Flag this explicitly as a pre-merge checklist item in the deployment-readiness phase.
- **Idle-loop asset quality:** FEATURES.md flags that whether Idle.mp4 reads as a natural "alive" loop vs. an obviously-repeating cheap loop is a content decision that depends on footage already in hand, not something resolvable through research -- surface to the content owner during Phase 3 rather than assuming it's fine.
- **Exact bandwidth impact at real traffic volume:** Research establishes the mechanism (muted autoplay on every homepage load times visitor volume) but not concrete numbers for this specific site's traffic -- recommend monitoring actual Vercel Fast Data Transfer usage post-launch rather than trying to pre-compute it.

## Sources

### Primary (HIGH confidence)
- This repository, read directly: package.json, vite.config.js, vercel.json, src/app.jsx, src/pages.jsx, src/perks.jsx, src/treasure.jsx, src/styles.css, src/components.jsx, .planning/PROJECT.md
- Vercel Limits documentation (vercel.com/docs/limits) -- Static File Uploads and Fast Data Transfer allowances
- Cache-Control headers -- Vercel docs, and Caching on Vercel's Edge Network
- Vite: Static Asset Handling (vite.dev/guide/assets)
- Autoplay guide for media and Web Audio APIs (MDN)
- Autoplay policy in Chrome (Chrome for Developers)
- New video Policies for iOS -- WebKit blog
- The User Experience of Customer-Service Chat: 20 Guidelines (Nielsen Norman Group)

### Secondary (MEDIUM confidence)
- Autoplay Policy Design Rationale -- Chromium
- To Play, or Not to Play - AutoPlay Policies for Safari 14 and Chrome 64 (Bitmovin)
- Using safe-area-inset to build mobile-safe layouts (Polypane)
- Tabs vs Accordions: When to Use Each in UX Design (Onething Design) / Accordion vs Tabs vs Dropdowns (Poper)
- Turning your React Component into a Finite State Machine With useReducer (DEV Community) / Kyle Shevlin: useReducer as FSM
- The Realities Of User Experience Design Within The Luxury Industry (Smashing Magazine)

### Tertiary (LOW confidence)
- Vendor/comparison content on Tavus/HeyGen/D-ID alternatives -- used only to characterize the adjacent real-time-avatar category for anti-features framing, not as a build recommendation
- Third-party summaries of Vercel Hobby-plan pricing/bandwidth caps -- directionally correct, verify current numbers on vercel.com/pricing before launch

---
*Research completed: 2026-09-04*
*Ready for roadmap: yes*
