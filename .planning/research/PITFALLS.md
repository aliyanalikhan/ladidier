# Pitfalls Research

**Domain:** AI Video Avatar FAQ Concierge — floating autoplay video widget added to an existing production React 19 + Vite + Vercel e-commerce site
**Researched:** 2026-09-04
**Confidence:** HIGH (Vercel platform limits, WebKit/browser autoplay policy, and all codebase-specific claims verified directly against `vercel.com/docs/limits`, WebKit's official policy post, and this repo's `app.jsx`/`styles.css`/`perks.jsx`/`treasure.jsx`); MEDIUM on a few React-video-lifecycle specifics that are well-documented community patterns rather than spec text.

## Critical Pitfalls

### Pitfall 1: Unhandled `play()` promise rejection silently breaks the intro/idle autoplay

**What goes wrong:**
`videoEl.play()` returns a Promise. When the browser's autoplay policy blocks it (unmuted audio, low-power mode, no user gesture in the chain), the promise **rejects** with `NotAllowedError` (policy block) or `AbortError` (a new load/play call interrupted the pending one). If the code calls `.play()` without `.catch()`, this surfaces only as an uncaught promise rejection in the console — the widget silently shows a frozen first frame or black box with no visible error and no fallback UI, and nothing in React state reflects that playback never started.

**Why it happens:**
`<video autoPlay>` (the JSX prop) and manual `ref.current.play()` calls are treated as equally fire-and-forget by most implementations copied from tutorials, which rarely show the rejection-handling branch. It's also easy to fire `.play()` again inside a `useEffect` cleanup race (e.g., switching FAQ videos) before the previous call has resolved, producing an `AbortError` that has nothing to do with policy but looks identical in a naive catch-all.

**How to avoid:**
Always branch on the returned promise: `const p = videoEl.play(); if (p) p.then(...).catch(err => { ... })`. Treat `NotAllowedError` and `AbortError` differently — AbortError from a legitimate rapid src-switch is expected and should be swallowed; NotAllowedError means autoplay was genuinely blocked and the widget must fall back to a visible "tap to start" affordance (poster image + play control) rather than an invisible failure. Because intro/idle are muted per the milestone's own decision, `NotAllowedError` should be rare on both desktop and iOS (muted autoplay is broadly allowed) — but it is not impossible (e.g., iOS Low Power Mode still throttles/blocks video). Because the FAQ-answer videos autoplay *with sound* on click, that click event is the user gesture that authorizes it — the `play()` call must happen synchronously (or in a promise chain directly attributable to the click), not after an `await` for something unrelated (e.g., an analytics call) that can cause some browsers to no longer treat the resulting `play()` as gesture-attributed.

**Warning signs:** Console shows "Uncaught (in promise) DOMException: play() request was interrupted" or "NotAllowedError"; QA reports the widget "just doesn't play sometimes" with no repro pattern; works locally but fails intermittently in production/incognito/mobile.

**Phase to address:** Video state machine / `VideoController` implementation phase — build the promise-handling wrapper as the single chokepoint all playback goes through, before wiring any UI on top of it.

---

### Pitfall 2: iOS Safari blocks or degrades autoplay despite `muted` — missing `playsInline`, Low Power Mode, and `webkit-playsinline`

**What goes wrong:**
On iOS Safari, a `<video>` without the `playsInline` (React prop; HTML `playsinline`) attribute is forced into fullscreen the moment it plays — completely breaking a "floating popup" widget concept, since the intro video would take over the whole screen instead of playing inside the small widget. Separately, iOS Low Power Mode (very common — kicks in automatically at 20% battery, and many users leave it on permanently) can prevent even muted autoplay from starting at all, with no JS-visible error distinguishing it from a generic policy block.

**Why it happens:** `playsInline` is a React/HTML attribute that must be set explicitly (`<video playsInline muted autoPlay .../>` and, for very old iOS/WebKit, historically also `webkit-playsinline`); it is not the default, and it is easy to omit if the component was first built/tested on desktop Chrome, where the difference isn't observable at all. Low Power Mode's effect is invisible in a desktop dev environment entirely.

**How to avoid:** Always set `muted` + `playsInline` + `autoPlay` together on the intro/idle `<video>` elements (all three, not just autoplay+muted) — this is WebKit's documented minimum for inline muted autoplay on iPhone. Treat a failed/blocked autoplay (from Pitfall 1's rejection handler) as an expected, handled state with a visible tap-to-play fallback rather than assuming muted autoplay always succeeds on iOS. Test on an actual iPhone in Low Power Mode, not just a desktop browser with device emulation — emulation does not reproduce this failure mode.

**Warning signs:** Widget works in Chrome DevTools' mobile emulation but the intro fullscreens or never plays on a real iPhone; support reports specific to iPhone users; works on iPhone until the battery drops or the tester intentionally enables Low Power Mode.

**Phase to address:** Video state machine phase (attribute wiring) plus a dedicated mobile-device QA pass before ship (real iPhone, not emulator).

---

### Pitfall 3: ~250MB of committed video assets can hard-fail deployment or blow past bandwidth limits depending on Vercel plan tier

**What goes wrong:**
Vercel enforces a **Static File Uploads** limit that is separate from GitHub's per-file 100MB limit already accounted for in this project's decision log: **100 MB total on the Hobby plan, 1 GB on Pro**. If this project is ever deployed from a Hobby-tier team/account, committing ~250MB of new video under `public/assets/avatar/` will make the deployment fail outright at build/upload time — not degrade gracefully, just fail. Separately, every play of the ~31MB intro plus repeated ~5.5MB idle loops plus any ~9–24MB FAQ answer counts against **Fast Data Transfer** (100GB/month included on Hobby with hard pause-on-exceed and no overage billing; usage-based on Pro). Because the widget auto-opens and autoplays the 31MB intro on *every* homepage load — not on-demand — homepage traffic volume directly multiplies against this large fixed payload in a way the rest of the site's lightweight images do not.

**Why it happens:** The "under GitHub's 100MB per-file limit" reasoning in this project's own decision log addresses only the per-file limit, not Vercel's separate *total static-file-upload* ceiling, which is easy to miss because it's not the number most people think of when they think "Vercel limits." Since this project already sells live paid memberships via Stripe (confirmed live in production), it is already required to be on a paid, commercial-use-permitted Vercel plan — but this must be actively verified, not assumed, before this milestone ships, since a Hobby-tier misconfiguration would only surface as a broken production deploy the moment this branch merges.

**How to avoid:** Confirm the Vercel project's plan tier (Pro or higher) before merging — this is a one-line dashboard check but a hard blocker if wrong. Independently of plan tier, do not naively bundle all ~250MB to autoplay on every load: only the ~5.5MB idle + ~31MB intro need to load on initial homepage visit; the 15 FAQ answer videos (9–24MB each) should load on-demand (only when a given question is actually clicked), not prefetched eagerly, or the effective "page weight" for every homepage visitor balloons toward the full 250MB regardless of which question (if any) they ask. Consider `preload="none"` or `preload="metadata"` on FAQ-answer `<video>` elements until selection, and browser-cache-friendly filenames/headers so a repeat visitor within the cache window doesn't re-download idle/intro.

**Warning signs:** Deployment fails at the build/upload step with a size-limit error; Vercel dashboard bandwidth graph shows a sudden step-change after this feature ships; mobile users complain about data usage on a page they didn't interact with beyond landing.

**Phase to address:** Asset-integration / deployment-readiness phase — verify plan tier and lazy-loading strategy before the first production deploy that includes the video files, not after.

---

### Pitfall 4: Eager-loading or eager-autoplaying the FAQ answer videos tanks perceived homepage load time and Core Web Vitals

**What goes wrong:** Even with correct plan tier and bandwidth budget, if the browser is told to preload (or the code mounts) all 15 `<video>` elements with real `src` attributes on initial render, the browser will start fetching all of them (or at minimum their metadata/moov headers) concurrently with the critical CSS/JS/font requests the rest of the homepage needs for first paint — directly competing for the same connection pool and degrading LCP/FCP on a page whose "Core Value" is explicitly about feeling premium and fast on any device.

**Why it happens:** The natural, simplest implementation is to render all 15 `<video>` tags up front (e.g., one per FAQ answer, toggled with CSS visibility) because it makes the "switch instantly on click" requirement trivial to implement — but that trivial approach is exactly what causes the eager-fetch problem, since browsers begin fetching `<video src>` (even without `autoplay`) per their default `preload="metadata"` (Chrome/Firefox) or more aggressive `preload="auto"` behavior on some UAs.

**How to avoid:** Render at most one active FAQ-answer `<video>` element at a time (mount/swap `src` on demand, or conditionally render the element itself), and use `preload="none"` on any FAQ videos before they're selected. Load the 31MB intro and 5.5MB idle only — nothing else — until the visitor actually clicks a question. If a "premium" feel calls for pre-warming the *next likely* click, do this only after intro+idle have already started, using `requestIdleCallback`/`IntersectionObserver`-gated prefetch, not blocking initial paint.

**Warning signs:** Lighthouse/PageSpeed LCP regression measured before/after this feature; Network tab shows 15 concurrent large video requests on page load; homepage "feels slow" reports concentrated on mobile/throttled connections.

**Phase to address:** Video-loading-strategy design, ideally decided in the same phase as the `VideoController`/FAQ-to-video-mapping architecture, since retrofitting lazy loading after all 15 are wired as always-mounted elements is a rework, not a tweak.

---

### Pitfall 5: React state drifts from actual `<video>` playback state, especially across rapid FAQ switches

**What goes wrong:** If the state machine (INTRO → IDLE → ANSWERING → IDLE) is driven purely by React state set at the moment a question is *clicked*, rather than by the video element's own `onPlay`/`onPause`/`onEnded`/`onError` events, the UI can show "answering Q7" while the actual `<video>` is still buffering Q3's teardown, has errored, or has already looped back to idle — because network/decode timing is asynchronous and not guaranteed to match the order state was set in. This is worse specifically for the "switching questions mid-answer cuts immediately to the new answer" requirement: naively setting `videoEl.src = newSrc` while a previous `play()` promise is still pending throws an `AbortError` (see Pitfall 1) and can leave a stale `onEnded` handler from the *previous* video still attached, firing after the new video is already playing and incorrectly forcing an early return-to-idle.

**Why it happens:** It's simpler to write `setCurrentQuestion(q); videoRef.current.src = faqVideos[q]; videoRef.current.play();` inline in a click handler than to route all transitions through the video element's own events as the single source of truth — but the moment two rapid clicks happen (a real, likely user behavior for a FAQ widget — people click around), the second click's effects can interleave with the first's in-flight promise/event callbacks.

**How to avoid:** Make native `<video>` events (`onPlay`, `onPause`, `onEnded`, `onError`, `onLoadedData`) the single source of truth for "what is actually playing" React state, not the click handler's intent. In the click handler, only set an "intended question" ref/state and call `.load()`+`.play()`; let the actual UI state (e.g. "now answering: Q7") update from `onPlay` firing on the *current* `src`, and guard every event handler with a check that the event's target/currentSrc still matches the currently-intended question (a monotonically incrementing "generation" counter compared inside each handler is the standard fix — if the generation captured in the closure doesn't match the latest generation, the handler is stale and should no-op). Always call `.catch()` on `AbortError` from an intentional rapid switch and treat it as expected, not as an error to surface.

**Warning signs:** Rapidly clicking between 2-3 FAQ questions causes audio from the wrong answer, or the video visibly "stutters" back to idle before the intended answer finishes; bug reports that only repro with fast/repeated clicking, never with deliberate slow single clicks.

**Phase to address:** `VideoController` implementation phase — this needs to be a deliberate design decision (generation/version guarding), not something patched in after QA finds it, since retrofitting stale-closure guards into an already-built click-driven implementation touches every transition path.

---

### Pitfall 6: `<video>` event listener leaks and duplicate handlers across question switches

**What goes wrong:** If event listeners for `onEnded`/`onTimeUpdate`/etc. are attached imperatively via `addEventListener` inside a `useEffect` that re-runs on every question change (or attached without a cleanup function at all), each switch can add another listener on top of the previous ones instead of replacing them — so after clicking through several FAQ questions, a single `ended` event fires the "return to idle" logic multiple times, or fires logic bound to a question the user already left, and long browsing sessions on the homepage accumulate listeners that never get garbage collected (the `<video>` element itself is likely being reused/kept mounted per the "no video generation, just switch src" design, so listeners attached to it persist across the widget's entire lifetime unless explicitly removed).

**Why it happens:** JSX's `onEnded={handler}` prop form handles cleanup automatically (React removes the old handler when the prop reference changes), but any code that reaches into the DOM via `ref.current.addEventListener(...)` manually — often done for finer control over the video element than JSX event props conveniently offer — requires an explicit matching `removeEventListener` in the `useEffect` cleanup, which is easy to forget especially when the effect's dependency array is edited later without re-checking the cleanup.

**How to avoid:** Prefer JSX event props (`onEnded`, `onPlay`, `onError`, etc.) directly on the `<video>` element wherever possible — React handles listener lifecycle correctly for these. Where imperative `addEventListener` is genuinely needed, always return a cleanup function from the same `useEffect` that removes exactly the listener(s) it added, and keep the effect's dependency array minimal and stable (e.g., depend on a stable ref, not on the changing `currentQuestion` value, if the handler itself reads the current question from a ref rather than from a closure).

**Warning signs:** "Return to idle" fires twice or with a visible flicker after several question clicks in one session; React DevTools/Chrome performance profiler shows a growing listener count on the video element over time; behavior only degrades the longer a single page session runs.

**Phase to address:** `VideoController` implementation phase, verified with a manual QA pass that clicks through all 15 questions in one session and confirms no double-firing.

---

### Pitfall 7: `prefers-reduced-motion` doesn't stop `<video>` autoplay automatically — it must be checked explicitly in JS

**What goes wrong:** The `prefers-reduced-motion: reduce` CSS media query — which this codebase already uses correctly for its existing animations (`mobile-overlay`, hidden-perk reveal, treasure-hunt reveal all have `@media (prefers-reduced-motion: reduce)` blocks) — has **no effect on `<video autoplay>`** by default. CSS can only suppress CSS animations/transitions; it cannot stop a video element from playing. If the team assumes "we already handle reduced-motion elsewhere in this codebase, so it's covered," the auto-opening, autoplaying intro video will play at full motion for every visitor who has explicitly told their OS they want reduced motion — including vestibular-disorder users this preference exists to protect, which is a real accessibility regression on a page that otherwise respects the setting everywhere else.

**Why it happens:** The mismatch between "we have `prefers-reduced-motion` CSS elsewhere" and "video autoplay needs its own JS-side check" is subtle and easy to miss precisely *because* the codebase's existing reduced-motion coverage creates a false sense that the concern is already handled project-wide.

**How to avoid:** In the component that triggers the intro/idle autoplay, explicitly check `window.matchMedia('(prefers-reduced-motion: reduce)').matches` before calling `.play()` (and listen for changes, since a user can toggle the OS setting without reloading in some browsers). When reduced motion is preferred, skip autoplay entirely and show a static poster frame with an explicit "Play intro" control instead — do not just play at a slower speed or skip only the CSS entrance animation while still autoplaying the video itself.

**Warning signs:** Accessibility audit or manual `prefers-reduced-motion: reduce` OS toggle test still shows the intro video autoplaying; no `matchMedia` reference anywhere in the new widget's code despite the milestone's own accessibility requirement explicitly naming reduced-motion.

**Phase to address:** Accessibility pass within the same phase that builds the state machine — this is cheap to add at build time and expensive to retrofit once autoplay logic is scattered across multiple call sites.

---

### Pitfall 8: Auto-opening popup with autoplaying audio-bearing content creates an unannounced, potentially disorienting context change for screen reader and keyboard users

**What goes wrong:** The widget is a deliberate product choice to auto-open and autoplay on every homepage load (explicitly not a pitfall to flag as "should it autoplay"). But *how* it auto-opens matters for users who are not visually scanning the page: if the widget's DOM is inserted and/or receives focus programmatically on mount without any announcement, a screen reader user gets no indication that new interactive content just appeared, while a sighted keyboard user tabbing through the page can suddenly land inside the widget with no warning of how they got there or how to get back out. Separately, since the FAQ answer videos are meant to have audio, a screen reader user who has that audio playing simultaneously with their own screen-reader speech gets two overlapping audio streams with no way to have discovered a mute control first (WCAG 1.4.2, "Audio Control," specifically requires a way to pause/stop/adjust volume for any auto-playing audio over 3 seconds).

**Why it happens:** "Auto-open on load" is trivial to implement as "render the widget's popup markup already expanded," which satisfies the visual/product requirement completely while saying nothing about how assistive tech users are supposed to discover and control it.

**How to avoid:** Do not move keyboard focus into the widget automatically on mount — let it appear visually (per the approved design) without hijacking focus, so keyboard/screen-reader users encounter it in the natural tab order or via a clearly labeled landmark, not by ambush. Give the popup an accessible name (`aria-label`) and, if it's implemented as a dialog-like region, use `role="region"` (not `role="dialog"`/`aria-modal="true"` unless it truly is meant to block interaction with the rest of the page — see Pitfall 9) so screen readers announce it as a distinct, navigable area rather than trapping. Provide an always-reachable, always-visible mute/volume or pause control satisfying WCAG 1.4.2 for any audio-bearing playback, not just a way to close the whole widget.

**Warning signs:** VoiceOver/NVDA testing shows the widget's content is either invisible to the screen reader or unexpectedly grabs focus on page load; keyboard-only test shows Tab lands inside the widget before reaching the main nav.

**Phase to address:** Accessibility/UI-spec phase, decided before implementation — retrofitting correct ARIA semantics onto an already-built popup is much costlier than choosing the right role/labeling up front.

---

### Pitfall 9: Copying this codebase's "no real focus trap" popup pattern without deciding whether the AI widget needs one

**What goes wrong:** This codebase already has two precedents for fixed-position popups, and they intentionally differ: the mobile nav overlay (`.mobile-overlay`, `role="dialog"`, `aria-modal="true"`, Escape-to-close) is a genuine full-screen modal that *should* trap attention because it replaces the whole viewport, while the hidden-perk and treasure-hunt reveal panels (`.perk-reveal`, `.treasure-reveal`) are deliberately built with **no backdrop, no scroll lock, and no focus trap**, specifically so the page behind stays fully interactive (documented explicitly in this codebase's own Phase 6 planning: "A z-index: 500 fixed card that could not be dismissed would trap the visitor... mitigated by three independent dismissal paths... no focus trap"). If the AI avatar widget is built by copy-pasting one of these without deciding which model fits, the most likely accidental failure mode is a *real* keyboard trap: an autoplaying video + interactive FAQ list + close button assembled without deliberately reasoning about Tab order, styled to look non-modal (small popup, page visible behind it) but implemented with `aria-modal="true"` or an ad-hoc `onKeyDown` handler that intercepts Tab and never returns focus to the page — the worst of both precedents combined.

**Why it happens:** The two existing precedents look superficially similar in CSS (both `position: fixed`, both dismissible with Escape) but diverge specifically on focus-trapping, and that distinction is easy to lose when pattern-matching against "the existing popup code" rather than re-deriving the requirement (WCAG 2.1.2, no keyboard trap) for this specific new widget.

**How to avoid:** Decide explicitly, as a documented decision (not an emergent accident): since the widget is persistent and non-blocking by product intent (a "concierge" the user can ignore and keep browsing, not a modal gate), follow the perk/treasure-reveal precedent — no focus trap, no backdrop, no scroll lock, Escape closes it, and every interactive element inside (question buttons, close button) is reachable via normal Tab order and none of them intercept Tab/Shift+Tab to cycle only within the widget. Verify with a real keyboard-only walkthrough: Tab all the way through the page with the widget open and confirm focus never gets stuck.

**Warning signs:** Tabbing through the homepage with the widget open causes focus to cycle only among the widget's own controls without ever reaching Nav/Footer links; any `onKeyDown` handler in the new widget calls `e.preventDefault()` on Tab.

**Phase to address:** UI/accessibility spec phase — this is a one-sentence decision to write down early, and a five-minute manual test to run at the end of implementation.

---

### Pitfall 10: Mobile viewport units and safe-area insets break a bottom-right fixed popup on real phones

**What goes wrong:** A bottom-right `position: fixed` widget positioned with plain `bottom`/`right` pixel values (as `.perk-reveal`'s `left: 24px; bottom: 24px` pattern does) can end up partially hidden behind iOS Safari's collapsing/expanding bottom toolbar, or behind Android's gesture-navigation bar, especially since those UI chrome elements resize the *visual* viewport dynamically as the user scrolls — a fixed element anchored to `bottom: 24px` of the *layout* viewport can visually sit underneath browser chrome that wasn't accounted for at implementation/design time. On notched/rounded-corner iPhones, a bottom-right corner widget can also visually collide with the home-indicator safe area if padding doesn't account for `env(safe-area-inset-bottom)`.

**Why it happens:** Desktop browser testing and even most emulators don't reproduce mobile browser chrome's dynamic resize behavior, so a widget that looks correctly positioned in Chrome DevTools' device toolbar can still sit wrong on an actual phone mid-scroll.

**How to avoid:** Add `padding-bottom: env(safe-area-inset-bottom)` (with a pixel fallback for browsers that don't support it) to the widget's outer fixed container. If any part of the widget's sizing logic uses `100vh`, prefer `100dvh`/`100svh` (dynamic/small viewport height units) instead, since plain `vh` does not account for mobile browser chrome resizing and is a well-known source of "the last N pixels are cut off on mobile" bugs. Test the actual launcher position on a real iPhone (with the home indicator) and a real Android phone (with gesture nav), not only in an emulator.

**Warning signs:** Widget looks fine in desktop responsive-mode testing but is reported as "half off-screen" or "overlapping the phone's home button/gesture bar" only from real-device testers.

**Phase to address:** Mobile responsiveness pass within the widget's UI implementation phase — this project has a strong existing precedent (v1.0's dedicated mobile CSS pass phase) of treating mobile viewport quirks as a first-class, explicitly tested concern, not an afterthought.

---

### Pitfall 11: z-index placed incorrectly relative to the existing mobile nav overlay lets the widget "leak" audio/video on top of (or vanish oddly beneath) the full-screen mobile menu

**What goes wrong:** This codebase's current z-index vocabulary (verified directly in `styles.css`) is: `.mobile-overlay` (the full-screen hamburger nav) at **100**, and `.perk-reveal` / `.treasure-reveal` both at **500** (the `tweaks-panel.jsx` component referenced in this codebase's own prior research as bounding the top of that range no longer exists in the current codebase — it was removed when the Tweaks panel was retired — so 500 is currently the *highest* fixed-position z-index in the app). If the new AI avatar widget is given a z-index below 100, opening the mobile hamburger menu on the homepage (a near-certain user action on mobile, where this widget also has to work) will visually cover the widget with the opaque full-screen nav — which is probably the *right* visual behavior, but only if the code *also* explicitly pauses (or at minimum mutes) the widget's video while the nav overlay is open; otherwise the idle loop (or an in-progress FAQ answer's audio) keeps playing, fully audible, underneath a full-screen menu the user is trying to read, with zero visual indication anything is still running — draining battery/bandwidth and, worse, playing unexpected audio while the user's attention and screen reader (if any) are on the nav. Conversely, if it's given a z-index at or above 500 to guarantee "always visible," it will float on top of the full-screen mobile nav overlay, potentially obscuring or intercepting taps on nav links.

**Why it happens:** Copying "just use a big z-index to be safe" (a common instinct for "floating always-on-top widgets") ignores that this app already has an established, deliberately ordered z-index scale, and that the correct fix for the interaction between two overlapping fixed elements is rarely "highest number wins" — it's "decide which one should be visually and functionally on top in this specific coexistence scenario, then also handle the non-visual state (audio/playback) of whichever one loses."

**How to avoid:** Place the widget's z-index below `.mobile-overlay`'s 100 (so opening the hamburger menu correctly covers it) unless there's a deliberate product reason for the concierge to remain reachable while the nav is open (unlikely, given the nav overlay is meant to be a focused, full-screen navigation moment). Regardless of the chosen z-index, explicitly listen for the nav overlay's open/close state (it's already tracked in this codebase's `Nav`/mobile-overlay component state) and pause (not just visually hide) the widget's active video when the mobile nav opens, resuming or leaving it paused per product decision when the nav closes. Document the chosen z-index value inline in `styles.css` next to the existing `.mobile-overlay: 100` / `.perk-reveal, .treasure-reveal: 500` comments, continuing this codebase's established practice of keeping the z-index scale legible in one place rather than scattering ad hoc values.

**Warning signs:** Opening the mobile menu on a phone with a FAQ answer playing still produces audible sound with no visible source; the widget's launcher button is visible and possibly tappable through/around the full-screen mobile nav overlay when it shouldn't be.

**Phase to address:** UI implementation phase, specifically the moment the widget's CSS is authored — check both existing z-index locations (this codebase previously required checking two files for its full z-index vocabulary; today it is fully contained in `styles.css` alone since `tweaks-panel.jsx` no longer exists, but that should be re-verified against the current file, not assumed from historical research documents).

---

### Pitfall 12: Rendering the widget outside the route-keyed `<main>` tree means hash-route navigation away from home does not stop its video

**What goes wrong:** This app's routing (`app.jsx`) works by swapping which page component renders inside `<main key={route}>{page}</main>` — the `key={route}` forces React to fully unmount the previous page's component tree and mount the new one on every hash change. Components mounted *inside* that switch (i.e., as part of whichever page component is currently rendering, such as `HomePage`) are automatically unmounted when the user navigates away, which would automatically stop any video inside them via the component's own unmount/cleanup. However, `Footer` and `TreasureHuntComplete` are rendered *outside* and *unconditionally* alongside `<main>` in `App()`, persisting across every route change without remounting. If the AI avatar widget is implemented the same way — mounted once at the `App()` level and shown/hidden purely via a `route === "home"` conditional render *value* rather than a full conditional mount/unmount, or (worse) shown/hidden via CSS visibility while staying mounted — its `<video>` element keeps existing in the DOM and can keep playing (the idle loop, or a mid-answer video) after the user has hash-navigated to Stores, Magazine, Subscribe, or Account, directly violating the "homepage only" scoping and continuing to burn bandwidth/battery/audio off-screen.

**Why it happens:** "Homepage only" is easy to satisfy visually (CSS `display: none` when `route !== "home"`) without necessarily stopping playback, especially if the developer's mental model is "it's hidden, so it doesn't matter" — but a hidden `<video>` element continues decoding and playing exactly as before unless explicitly paused, and a component that isn't unmounted doesn't get its cleanup effects run.

**How to avoid:** Mount the widget so it is torn down (not merely hidden) when `route !== "home"` — either by rendering it conditionally as a child of `HomePage` itself (so it shares `HomePage`'s own mount/unmount lifecycle driven by the existing `key={route}` mechanism, requiring no new logic), or, if it must live at the `App()` level for some structural reason, explicitly call `.pause()` on the active video element in a `useEffect` keyed on `route` changing away from `"home"`, in addition to (not instead of) hiding it visually. Prefer the `HomePage`-child placement — it reuses an already-correct, already-tested unmount mechanism instead of adding a new one that has to be gotten right independently.

**Warning signs:** Navigate from Home to Stores/Magazine via the nav or Back/Forward browser buttons while a FAQ answer or the idle loop is playing, then check for audio/CPU/network activity attributable to the (now invisible) widget; Chrome's Media tab (`chrome://media-internals`) still lists an active player after leaving the homepage route.

**Phase to address:** Component architecture / placement decision at the very start of implementation — where the widget is mounted in the component tree is a foundational choice that's expensive to change once other logic (intro-once tracking, state machine) has been built assuming a particular mount lifecycle.

---

### Pitfall 13: "Intro plays once" state must survive component remounts, or hash-navigating home-away-home replays the 31MB intro every time

**What goes wrong:** The milestone spec is explicit: INTRO plays once on load, then the widget settles into the looping IDLE state. If "once" is tracked only in local component state (e.g., `useState(false)` for `hasPlayedIntro`) and the widget is correctly unmounted when navigating away from home (per the fix in Pitfall 12), then navigating Home → Stores → Home again remounts the widget fresh, resets that local state, and replays the full 31MB intro from scratch on every return to the homepage within the same session — which is very plausible real user behavior (browsing Stores, then clicking the logo/Home nav link back) and directly contradicts "once."

**Why it happens:** Fixing Pitfall 12 (correct unmount on route change) and satisfying "intro plays once" pull in opposite directions if "once" is tracked only in that same component's local state — the correct fix for one pitfall can silently reintroduce the other unless the "has the intro played" flag is deliberately stored somewhere that outlives the component's mount lifecycle.

**How to avoid:** Persist the "intro has played this session" flag outside the component — `sessionStorage` (resets naturally on a real new visit/tab, matching "once per session" intent) is the natural fit here, mirroring this codebase's own existing pattern of using `localStorage` for longer-lived flags (`ladidier_subscribed`, `ladidier_member`) — `sessionStorage` for a session-scoped flag is the analogous choice at a shorter scope. On mount, check that flag before deciding whether to play INTRO or start directly in IDLE.

**Warning signs:** Manual test: load home (intro plays), navigate to Stores, navigate back to Home via nav link — if the intro plays a second time, this pitfall is present.

**Phase to address:** Same phase as Pitfall 12 — the mount-lifecycle decision and the "once" persistence decision need to be made together, since one is the direct consequence of correctly fixing the other.

---

## Technical Debt Patterns

| Shortcut | Immediate Benefit | Long-term Cost | When Acceptable |
|----------|-------------------|-----------------|------------------|
| Always-mounted `<video>` per FAQ answer, toggled with CSS `display` | Trivial "instant switch" implementation | Eager fetch of some/all 15 large videos, competing with page-load-critical requests (Pitfall 4) | Never for production; only as a disposable local prototype to validate the state-machine UX before wiring real assets |
| Tracking playback state purely in React state, ignoring native video events as source of truth | Faster to write, fewer event handlers | Race conditions and desync under rapid clicking (Pitfall 5) | Only acceptable if the product truly disables rapid switching (e.g., disables other question buttons while one is answering) — but the milestone spec explicitly requires "switching questions mid-answer cuts immediately," so this shortcut is not compatible with the actual requirement |
| Skipping `sessionStorage` persistence for "intro played once" and relying on component state | One less piece of state to wire | Intro replays on every home-navigation-return within a session (Pitfall 13) | Never — this is cheap to do correctly and the milestone spec is explicit about "once" |
| Testing only in desktop Chrome + DevTools mobile emulation, skipping a real iPhone pass | Faster iteration during build | Misses iOS-specific autoplay/fullscreen/Low-Power-Mode failures that emulation cannot reproduce (Pitfall 2) | Acceptable for early prototyping only; not acceptable before this phase is marked done, given the milestone explicitly requires mobile responsiveness |

## Integration Gotchas

| Integration | Common Mistake | Correct Approach |
|-------------|-----------------|-------------------|
| Existing hash router (`app.jsx`, `key={route}` on `<main>`) | Mounting the widget at the `App()` level (like `Footer`/`TreasureHuntComplete`) and only hiding it via CSS/conditional render value when off-home | Mount it as a child of `HomePage` so it shares `HomePage`'s existing correct unmount lifecycle, or explicitly `.pause()` on route change if it must live at `App()` level (Pitfall 12) |
| Existing z-index vocabulary (`.mobile-overlay: 100`, `.perk-reveal`/`.treasure-reveal: 500`) | Picking an arbitrary large z-index "to be safe," causing the widget to float on top of the full-screen mobile nav overlay | Place below 100 so the mobile nav correctly covers it, and pair with an explicit pause of the widget's video while the nav overlay is open (Pitfall 11) |
| Existing hidden-perk (`.perk-reveal`, bottom-left) and treasure-hunt (`.treasure-reveal`, centered) discovery popups | None currently occupy bottom-right, so direct visual collision is unlikely — but assuming this without checking after any future redesign of those elements | Re-verify `.perk-reveal`/`.treasure-reveal` positioning in `styles.css` if either is redesigned in a future phase, since the AI widget's bottom-right placement was chosen assuming that corner stays free |
| Existing popup accessibility patterns (`role="dialog"` + `aria-modal="true"` on `.mobile-overlay`; Escape-to-close but no focus trap on `.perk-reveal`/`.treasure-reveal`) | Blending the two patterns — using `aria-modal="true"` semantics on a widget that is visually non-blocking, creating a real keyboard trap | Deliberately choose the non-modal (`.perk-reveal`/`.treasure-reveal`-style) pattern for this persistent, non-blocking widget (Pitfall 9) |
| Vercel deployment (`vercel.json`, git-integrated deploys) | Assuming GitHub's 100MB-per-file limit is the only relevant platform limit | Separately verify Vercel's own Static File Uploads limit (100MB Hobby / 1GB Pro) against the plan tier actually in use (Pitfall 3) |

## Performance Traps

| Trap | Symptoms | Prevention | When It Breaks |
|------|----------|------------|-----------------|
| Eagerly preloading all 15 FAQ answer videos | Network tab shows many large concurrent requests on homepage load; degraded LCP | `preload="none"` + mount-on-demand per FAQ video (Pitfall 4) | Immediately, on first production homepage load with real assets — not a scale problem, a day-one problem |
| Autoplaying 31MB intro on every homepage visit with no session-level guard | Repeat visitors re-download/re-decode the intro on every return to home; bandwidth usage scales linearly with page views, not unique sessions | `sessionStorage`-backed "played once" flag (Pitfall 13) | Noticeable immediately in Vercel's Fast Data Transfer usage once real traffic hits the homepage repeatedly per session |
| No cache-control / long-lived caching for the static video files | Same visitor re-downloads idle/intro video on every fresh page load across sessions, not just within one session | Ensure static assets under `public/assets/avatar/` get appropriately long `Cache-Control` treatment (Vercel's default static asset caching should apply, but verify response headers rather than assume) | At any meaningful repeat-visitor volume |
| Video-lifecycle race conditions under rapid clicking | Wrong audio plays, or video flickers back to idle prematurely (Pitfall 5) | Generation/version-guarded event handlers | As soon as a real user clicks through FAQ questions faster than a video's network+decode round trip |

## Security Mistakes

| Mistake | Risk | Prevention |
|---------|------|------------|
| None specific to this feature beyond general web hygiene — this is client-side static video playback with no new data flows, no new API endpoints, and no user input beyond button clicks | N/A | Confirm the widget introduces no new `api/` routes and no new persisted user data; if a future iteration adds a "type a question" text input, that would need its own security research pass (not covered by this milestone's scope of pre-recorded FAQ videos only) |

## UX Pitfalls

| Pitfall | User Impact | Better Approach |
|---------|-------------|-------------------|
| Autoplaying intro with no visible mute/close affordance in the first second | User feels ambushed by an auto-opening widget with no immediate way to silence/dismiss it | Ensure the close/mute controls are visible and rendered *before* or *simultaneously with* the first autoplay frame, not added after a delay |
| Widget stays fully visually/audibly active while the user opens the mobile hamburger nav | Confusing overlapping audio, wasted battery/data, feels broken | Pause on nav-overlay-open (Pitfall 11) |
| No visible fallback when autoplay is blocked (Pitfall 1/2) | Widget appears broken — frozen frame, no explanation, no way to start it manually | Always render a visible "tap to play" affordance the instant a blocked-autoplay rejection is caught |
| Video state visually lags behind or contradicts the clicked FAQ question during rapid switching | Feels laggy/buggy, undermines the "premium" positioning this whole feature exists to reinforce | Generation-guarded event-driven state (Pitfall 5) |

## "Looks Done But Isn't" Checklist

- [ ] **Autoplay:** Often missing rejection handling — verify by testing in an environment where autoplay is blocked (e.g., a fresh incognito profile with autoplay disabled in browser settings) and confirming a visible fallback appears rather than a silent failure.
- [ ] **"Homepage only" scoping:** Often missing actual playback-stop on route change, only visual hiding — verify by checking for continued audio/network activity after hash-navigating away from home mid-playback (Pitfall 12).
- [ ] **"Intro plays once":** Often broken by remount-reset — verify by navigating Home → another page → Home again within one browser session and confirming the intro does not replay (Pitfall 13).
- [ ] **Reduced motion:** Often assumed covered by existing site-wide CSS handling — verify with an explicit OS-level `prefers-reduced-motion: reduce` toggle test that autoplay itself (not just CSS animation) is suppressed (Pitfall 7).
- [ ] **Rapid FAQ switching:** Often untested beyond single deliberate clicks — verify by rapidly clicking through several different FAQ questions in quick succession and confirming no wrong-audio or premature-idle-return occurs (Pitfall 5).
- [ ] **Mobile nav interaction:** Often untested in combination — verify by opening the widget, then opening the mobile hamburger menu, and confirming the widget's video/audio actually pauses, not just visually disappears (Pitfall 11).
- [ ] **iOS real-device behavior:** Often only tested via desktop emulation — verify on an actual iPhone, including with Low Power Mode enabled, that intro/idle plays inline (not fullscreen) and starts at all (Pitfall 2).
- [ ] **Vercel deployment plan tier:** Often assumed fine because GitHub's per-file limit was checked — verify the Vercel project's actual plan tier supports the combined ~250MB static asset total before merging (Pitfall 3).

## Recovery Strategies

| Pitfall | Recovery Cost | Recovery Steps |
|---------|-----------------|------------------|
| Deployment fails due to Vercel static-file-upload limit | LOW | Upgrade the Vercel team/project to Pro (already effectively required by this project's live Stripe billing per its own commercial-use terms) — no code change needed, just a plan-tier fix |
| Video keeps playing after route change | LOW–MEDIUM | Add a `useEffect` on `route` (or move the widget under `HomePage`) that calls `.pause()` on the active `<video>` ref when leaving home; low-risk, isolated change |
| Intro replays on every home revisit | LOW | Swap the "played once" flag from component state to `sessionStorage`; isolated, low-risk change |
| Rapid-click race conditions producing wrong audio | MEDIUM | Introduce a generation counter guarding all event handlers; touches every transition path in `VideoController`, so budget real regression-testing time across all 15 questions, not just a spot check |
| Autoplay silently blocked with no fallback UI shipped | LOW–MEDIUM | Add the `.catch()` branch and a "tap to play" fallback UI; low code cost, but needs real-device (not just emulator) verification before calling it fixed |
| Focus trap accidentally created | MEDIUM | Audit all `onKeyDown`/`aria-modal` usage in the widget against the deliberate non-modal precedent (`.perk-reveal`/`.treasure-reveal`); may require restructuring how Escape/close is wired if `aria-modal="true"` was set alongside custom Tab interception |

## Pitfall-to-Phase Mapping

| Pitfall | Prevention Phase | Verification |
|---------|-------------------|----------------|
| 1. Unhandled `play()` rejection | `VideoController` implementation | Force a blocked-autoplay scenario (browser autoplay setting disabled) and confirm visible fallback, not silent failure |
| 2. iOS autoplay/fullscreen/Low Power Mode | Video state machine + mobile QA pass | Manual test on a real iPhone, including with Low Power Mode on |
| 3. Vercel static-file/bandwidth limits | Deployment-readiness / asset-integration phase | Confirm plan tier in Vercel dashboard before merging; confirm lazy-loading strategy for FAQ videos |
| 4. Eager preload hurting perceived load | Video-loading-strategy design (same phase as component architecture) | Lighthouse/PageSpeed LCP measured before/after; Network tab shows only intro+idle fetched on initial load |
| 5. State/playback desync under rapid switching | `VideoController` implementation | Manual rapid-click-through-all-15-questions test |
| 6. Event listener leaks | `VideoController` implementation | Long single-session click-through-all-questions test checking for duplicate "return to idle" firing |
| 7. `prefers-reduced-motion` not honored for autoplay | Accessibility pass within state-machine phase | OS-level reduced-motion toggle test confirming autoplay itself is suppressed |
| 8. Unannounced auto-open / no audio control | UI/accessibility spec phase | Screen reader (VoiceOver/NVDA) walkthrough of homepage load; confirm audio control satisfies WCAG 1.4.2 |
| 9. Accidental keyboard trap | UI/accessibility spec phase | Keyboard-only full-page Tab walkthrough with widget open |
| 10. Mobile viewport/safe-area issues | Mobile responsiveness pass within UI implementation | Real-device test on notched iPhone and gesture-nav Android |
| 11. z-index vs. mobile nav overlay | UI implementation (CSS authoring) | Open mobile nav while widget is mid-playback; confirm both visual coverage and playback pause |
| 12. Route change doesn't stop video | Component architecture / mount-placement decision (start of implementation) | Hash-navigate away from home mid-playback; confirm no residual audio/network activity |
| 13. Intro replays on remount | Same phase as #12 | Home → other page → Home within one session; confirm intro does not replay |

## Sources

- [Vercel Limits documentation](https://vercel.com/docs/limits) — official, HIGH confidence — Static File Uploads (100MB Hobby / 1GB Pro), Fast Data Transfer allowances, build time/size limits
- [New `<video>` Policies for iOS — WebKit blog](https://webkit.org/blog/6784/new-video-policies-for-ios/) — official browser-vendor source, HIGH confidence — `playsinline` + `muted` requirements for inline autoplay on iPhone
- Community references on `play()` promise rejection handling and iOS autoplay/Low-Power-Mode quirks (Medium/SiteLint/Bitmovin autoplay-policy writeups surfaced via web search) — MEDIUM confidence, cross-checked against WebKit's own documented policy for the muted+playsinline+autoplay requirement specifically
- This repository, read directly during research (HIGH confidence, verified facts):
  - `src/app.jsx` — hash-router mechanics, `key={route}` remount behavior, where `Footer`/`TreasureHuntComplete` are mounted outside the route-keyed tree
  - `src/styles.css` — current z-index vocabulary (`.mobile-overlay: 100` at line 583, `.perk-reveal: 500` at line 1113, `.treasure-reveal: 500` at line 1254, `.reader-backdrop: 200` at line 979) and existing `prefers-reduced-motion` blocks
  - `src/perks.jsx` / `src/treasure.jsx` — existing Escape-to-close, no-focus-trap popup pattern; existing `aria-*` usage
  - `src/components.jsx` — existing full-screen `.mobile-overlay` with `role="dialog"`/`aria-modal="true"` and Escape-to-close, as the contrasting modal precedent
  - `.planning/milestones/v1.1-phases/05-hidden-perks-discovery-feature/` and `06-mall-treasure-hunt/` planning docs — historical z-index research (used to confirm `tweaks-panel.jsx`'s `2147483646` no longer applies, since that file has been removed from the current codebase per `PROJECT.md`'s note that "the Tweaks panel is gone")
  - `.planning/PROJECT.md` — current milestone scope, tech stack (React 19 + Vite + Vercel), and prior decision log entry on the GitHub 100MB-per-file rationale for `public/assets/avatar/`

---
*Pitfalls research for: AI Video Avatar FAQ Concierge widget (v1.3 milestone)*
*Researched: 2026-09-04*
