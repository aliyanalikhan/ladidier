# Phase 10: Avatar Video Engine — Data, State Machine & Playback - Research

**Researched:** 2026-09-05
**Domain:** Client-side HTML5 video state machine (React 19 + Vite SPA) — FAQ-to-video data module, `useReducer` finite state machine, imperative `<video>` control
**Confidence:** HIGH

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**FAQ Content & Video Mapping**
- **D-01:** The 15 real FAQ questions, in category order, are locked. Video mapping is sequential: `Q1.mp4` through `Q15.mp4` map 1:1 to questions 1–15 in the order listed.

  **About LaDidiér (Q1–Q5):** What is LaDidiér? / What types of products do you sell? / How do I know what size to order? / What should I do if an item I want is sold out? / Will you restock an item that is currently unavailable?

  **Shipping & Delivery (Q6–Q10):** Where does LaDidiér ship? / How much does shipping cost? / How long will it take for my order to arrive? / How can I track my order? / What should I do if my package says delivered, but I haven't received it?

  **Orders, Returns & Exchanges (Q11–Q13):** Can I change or cancel my order after I place it? / What is your return and exchange policy? / What should I do if I receive the wrong item or my item arrives damaged?

  **Payments & Customer Support (Q14–Q15):** What payment methods do you accept? / How can I contact LaDidiér if I need additional help?

  This exact text/order/category grouping is the source of truth for `avatarFaqData.js`'s `FAQ_CATEGORIES` structure.

**Interim UI & Production Exposure**
- **D-02:** The Phase 10 interim UI ships live to production when this phase merges — no feature flag, no branch gate.
- **D-03:** The interim UI is positioned bottom-right, sized/shaped roughly like the final widget will be. Phase 11 must not relocate or restructure this mount point.
- **D-04:** No visual polish in Phase 10 — plain HTML buttons and a `<video>` tag, minimal CSS for positioning/usability only. Luxury styling is Phase 11 (WIDGET-03).

**Video Asset Handling**
- **D-05:** Copying the 17 source files (`Idle.mp4`, `INTRO.mp4`, `Q1.mp4`–`Q15.mp4`, ~250MB total) from `D:\ttt\LaDidier Avatar` into `public/assets/avatar/` is in scope.
- **D-06:** Filenames kept exactly as sourced (mixed case preserved) — no renaming/normalization.
- **D-07:** Committed as plain files via normal `git add`/`git commit` — no Git LFS, no external storage/CDN.
- **D-08:** Verifying the Vercel project's plan tier supports ~250MB of static assets (Hobby caps at 100MB total static-file uploads; Pro allows 1GB) is **in scope for this phase, before merging** — because D-02 means this phase's own deploy is what pushes the video to production. **Reversibility: one-way** — a failed production deploy from an unverified tier would only surface after merge.

**Manual Verification Approach**
- **D-09:** The user will personally click through the full sequence (intro → idle → answer → idle, including mid-answer interrupts) on the deployed/dev site before this phase is done.
- **D-10:** The user has access to a real iPhone and will personally verify muted+playsInline+autoplay behavior on it, including Low Power Mode — not deferred as a known gap.

### Claude's Discretion
- Exact reducer/state-machine implementation shape (phase/questionId reducer, generation-counter guard against stale `ANSWER_ENDED` events, `.catch()` handling on `play()`) — fully specified below; no further user input needed.
- Mount placement inside `HomePage` (not `App`) to inherit route-keyed remount/unmount — architecture decision, not a product choice.
- `sessionStorage`-backed "intro played once" flag mechanics.
- Exact interim-UI markup/minimal CSS shape (D-04), as long as it's functional, positioned bottom-right, and unstyled.
- `preload="none"` / on-demand mounting strategy for the 15 answer videos vs. eager intro+idle load.

### Deferred Ideas (OUT OF SCOPE)
None — discussion stayed within phase scope. Widget launcher/accordion visual chrome is Phase 11 (WIDGET-01..04, FAQ-01..03); accessibility/reduced-motion/responsive polish is Phase 12 (A11Y-01..05).
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| AVATAR-01 | Widget auto-opens on homepage load and autoplays the intro video (muted, per browser autoplay policy) | Pattern 2 (reducer starts at `phase: "intro"`); Pitfall A (play() promise rejection handling); Pitfall B (iOS playsInline/muted/autoPlay triad) |
| AVATAR-02 | After the intro finishes, the idle video loops continuously until a question is selected | Pattern 2 (`INTRO_ENDED` → `phase: "idle"`, native `loop` attribute, no re-dispatch needed per loop iteration) |
| AVATAR-03 | Selecting a question immediately plays that question's answer video with audio enabled | Pattern 2 (`ASK` action, `muted = phase !== "answering"`); Stack note on synchronous `.play()` inside the click handler (preserves user-gesture attribution for unmuted playback) |
| AVATAR-04 | When an answer video finishes, playback automatically returns to the looping idle video | Pattern 2 (`ANSWER_ENDED` → `phase: "idle"`) |
| AVATAR-05 | Selecting a different question while an answer is playing cuts immediately to the new answer — no queueing or waiting | Pattern 2 (`ASK` is legal from both `idle` and `answering`); Pitfall C (generation-counter guard against stale `ANSWER_ENDED`/`AbortError` events) — **highest-risk requirement in this phase, build and manually exercise the reducer before wiring the DOM** |
| AVATAR-06 | The intro plays once per homepage visit — not on every re-render, only on navigate-away-and-back | Pitfall D (mount inside `HomePage` so `<main key={route}>` gives correct unmount) + Pitfall E (`sessionStorage`-backed flag, not component state — must be fixed together with D) |
| FAQ-04 | The FAQ-to-video mapping lives in its own data file, separate from UI/component code | Pattern 4 (`avatarFaqData.js`, plain data module, no React import, mirrors `theme.js`'s existing role) |

</phase_requirements>

## Summary

This phase has no new npm dependencies and touches almost nothing outside three new/modified files: `src/avatarFaqData.js` (new plain-data module), `src/avatarFaq.jsx` (new — `useVideoAvatar` reducer + `AvatarVideo` + interim question-button markup), and one import + one JSX line in `src/pages.jsx`'s `HomePage`. The entire engine is native `<video>` + React 19's built-in `useReducer`/`useRef`/`useEffect` — no state-machine library, no player framework. The build order that matters most: write `avatarFaqData.js` first, then write and manually exercise the `useVideoAvatar` reducer with no DOM at all (dispatch actions, assert on `state.phase`/`state.questionId`), and only then wire it to a real `<video>` element. AVATAR-05 (mid-answer interrupt) is the requirement most likely to regress if this order is skipped, because its correctness depends entirely on the reducer's transition table and a generation-counter guard against stale async events — not on anything DOM-related.

**Two corrections to the existing milestone-level research** were found by reading this session's actual source files, both load-bearing for planning:

1. **The project is NOT zero-build CDN+Babel.** `package.json`, `vite.config.js`, and `src/main.jsx` (`createRoot(...).render(<App />)`, real ESM imports) confirm this is a genuine Vite build with `react@19.2.8`/`vite@8.2.2`, matching `.planning/PROJECT.md`'s own "Note on the tech-stack constraint" flag that this drifted during v1.2. Standard JSX + `import`/`export` syntax is correct; no CDN/Babel-standalone constraints apply.
2. **The mobile nav's open/close state is not exposed outside `Nav`.** `src/components.jsx`'s `menuOpen`/`isClosing` `useState` calls are local to the `Nav` function component with no `dispatchEvent`/prop-lift/export. The UI-SPEC's "required pairing" (pause the widget's video when the mobile nav opens) cannot be satisfied without a small code change — see Pitfall F below, which proposes reusing this codebase's own existing `CustomEvent` pattern from `treasure.jsx`.

A third, newly-discovered pitfall (not present in the milestone-level `PITFALLS.md`) is specific to this codebase's `HomePage` markup: `HomePage`'s root `<div className="page-fade">` animates `transform`, which creates a CSS containing block for `position: fixed` descendants for the animation's 0.5s duration — the exact bug this project already hit and fixed once for the reader modal (quick task `260901-1lc`, fixed via `createPortal`). See Pitfall G below.

**Primary recommendation:** Build `avatarFaqData.js` → `useVideoAvatar` reducer (manually exercised, no DOM) → `AvatarVideo` + DOM-sync effect → interim question buttons → mount in `HomePage` via `createPortal(document.body)`, in that order. Verify D-08 (Vercel plan tier) via dashboard before merging — it cannot be determined from this repo's filesystem.

## Architectural Responsibility Map

This app is a pure client-side SPA (no SSR framework — `main.jsx` calls `createRoot(...).render(<App />)` directly) plus a set of Vercel serverless functions under `api/` for unrelated backend concerns (auth, billing). There is no "Frontend Server (SSR)" tier in this stack.

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| FAQ-to-video data mapping (FAQ-04) | Browser / Client | — | Plain JS module, bundled and shipped to the client; no server involvement, mirrors `theme.js` |
| Video phase/transition state machine (AVATAR-01..06) | Browser / Client | — | `useReducer` running entirely in the browser; no state crosses to a server |
| Video playback (`<video>` element, autoplay policy compliance) | Browser / Client | — | Native browser API; autoplay policy enforcement happens in the browser engine itself |
| Video asset delivery (17 MP4 files) | CDN / Static | Browser / Client | Vercel serves `public/assets/avatar/*.mp4` as static passthrough (CDN edge); the browser is the consumer that fetches/decodes/plays |
| Mobile-nav-open → video-pause signal | Browser / Client | — | Cross-component browser-side coordination (`CustomEvent`), no network involved |
| Deployment size/plan-tier verification (D-08) | CDN / Static (ops) | — | A Vercel dashboard/plan-tier concern, not application code — must be verified by a human, not inferable from the repo |

## Standard Stack

### Core

No new dependencies — this section documents the already-installed versions this phase relies on, verified directly against this repo's `package.json`.

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|---------------|
| `react` / `react-dom` | `^19.2.8` [VERIFIED: package.json:12-13] | `useReducer`, `useRef`, `useEffect`, `createPortal` for the state machine and DOM-sync effect | Already installed; a 4-state single-actor machine with one interrupt transition is textbook `useReducer` territory — no state-machine library is justified |
| Native `<video>` element (HTML5) | n/a — browser built-in | Plays all 17 local MP4 clips | Full control over `muted`/`playsInline`/`preload`/`.load()`/`.play()`; no adaptive streaming or multi-source abstraction needed for fixed local files |
| `vite` / `@vitejs/plugin-react` | `^8.2.2` / `^6.1.1` [VERIFIED: package.json:14,18] | Build tool; serves `public/` as static passthrough | Already the project's build pipeline — no config changes needed for playback logic itself |
| Plain CSS (`src/styles.css`, `src/theme.js`) | n/a | Minimal interim positioning CSS (D-04) | Matches the existing no-framework, single-global-stylesheet convention; zero new palette tokens needed |

### Supporting

None — intentionally empty. See "Alternatives Considered" below for what was deliberately rejected.

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Native `<video>` + local `useReducer` hook | `react-player` | Adds a URL-polymorphism abstraction (YouTube/Vimeo/local-file interchangeability) this project doesn't need — 17 fixed local MP4s, zero external platform sources |
| `useReducer` | `xstate`/`@xstate/react` | Overkill for 4 states + 1 interrupt transition; adds a dependency and a new mental model for no architectural gain at this scale |
| `public/assets/avatar/*.mp4` static files | Vercel Blob / a video CDN | Explicit `PROJECT.md` decision — all files under GitHub's 100MB/file limit, avoids a new storage dependency for this milestone |

**Installation:**
```bash
# No installation needed — zero new npm packages for this phase.
```

**Version verification:** `react@19.2.8` and `vite@8.2.2` confirmed both installed (`package.json`) AND current on the npm registry via `npm view react version` → `19.2.8`, `npm view vite version` → `8.2.2` — no drift between installed and latest.

## Package Legitimacy Audit

**Not applicable — this phase introduces zero new npm packages.** All functionality is built from already-installed `react`/`react-dom` (verified above) and native browser APIs. No `package.json` changes are expected as part of this phase's plan.

## Architecture Patterns

### System Architecture Diagram

```
Homepage load / navigate to #home
        │
        ▼
<main key={route}> remounts HomePage  ──────────────────────────────┐
        │                                                            │ (route away from
        ▼                                                            │  home unmounts
HomePage mounts AIAvatarFAQ (via createPortal → document.body,       │  everything below,
  see Pitfall G)                                                     │  stopping playback
        │                                                            │  automatically)
        ▼                                                            │
useVideoAvatar() reducer initializes                                 │
  state = { phase: "intro", questionId: null }                       │
        │                                                            │
        ├─ sessionStorage check (Pitfall E) ──► if intro already      │
        │    played this session, start at phase: "idle" instead     │
        ▼                                                            │
DOM-sync useEffect: video.muted=true; video.load(); video.play()      │
  .catch(err => distinguish AbortError vs NotAllowedError)            │
        │                                                            │
        ▼                                                            │
<video onEnded={dispatch INTRO_ENDED}>  ── plays INTRO.mp4 muted ────┘
        │
        ▼
phase: "idle" → videoSrc = Idle.mp4, loop=true, muted=true (loops unattended)
        │
        │◄──────────────────────────────────────────────┐
        ▼                                                 │
[User clicks a question button]                            │
        │                                                  │
        ▼                                                  │
dispatch({ type: "ASK", questionId })                       │
  — legal from BOTH "idle" and "answering" (AVATAR-05)        │
        │                                                    │
        ▼                                                    │
phase: "answering", questionId=N, generation++ (Pitfall C)     │
        │                                                       │
        ▼                                                       │
DOM-sync effect: video.muted=false; video.load(); video.play()   │
  (synchronous inside click handler — preserves gesture attribution)
        │                                                         │
        ▼                                                         │
<video onEnded={...}> fires when QN.mp4 finishes                   │
        │                                                          │
        ▼                                                          │
dispatch({ type: "ANSWER_ENDED", questionId: N, generation: G })     │
  — guarded: if G !== current generation, no-op (stale event)         │
        │                                                              │
        └──────────────────────────────► phase: "idle" ────────────────┘

Parallel, cross-component (Pitfall F):
Nav's mobile hamburger opens ──dispatchEvent(CustomEvent)──► AIAvatarFAQ listens
  (mirrors treasure.jsx's TREASURE_EVENT pattern)                │
                                                                    ▼
                                                        video.pause() (not just hidden)
```

### Recommended Project Structure

```
src/
├── avatarFaqData.js     # NEW — plain data: FAQ_CATEGORIES, FAQ_QUESTIONS_BY_ID, asset paths (FAQ-04)
├── avatarFaq.jsx         # NEW — AIAvatarFAQ (interim shell), useVideoAvatar (reducer), AvatarVideo
├── pages.jsx             # MODIFIED — import + mount <AIAvatarFAQ /> inside HomePage
├── components.jsx        # MODIFIED — Nav's openMenu/closeMenu dispatch a CustomEvent (Pitfall F)
├── styles.css            # MODIFIED — append minimal .avatar-faq-* positioning rules (D-04)
├── perks.jsx             # unchanged — reference pattern (Escape/outside-click, no focus trap)
├── treasure.jsx          # unchanged — reference pattern (CustomEvent cross-component signal)
├── theme.js              # unchanged — reference pattern for "plain data module"
└── app.jsx               # unchanged — no route/state wiring needed

public/assets/
└── avatar/               # NEW — Idle.mp4, INTRO.mp4, Q1.mp4…Q15.mp4 (copied in, 255.66MB — see Asset Inventory)
```

### Pattern 1: Single-file feature module, mounted as a page sibling

**What:** A self-contained `.jsx` file owns all local state, renders its own DOM (`position: fixed`), and is mounted as a plain JSX sibling — no props threaded through `App`, no context.
**When to use:** Self-contained, homepage-only features with no cross-page state need — exactly `HiddenPerk`'s and `TreasureIcon`'s pattern.
**Example (verified against actual `pages.jsx`):**
```jsx
// pages.jsx — verbatim import style used by TreasureIcon [VERIFIED: src/pages.jsx:24]
import { TreasureIcon } from './treasure.jsx';
import { AIAvatarFAQ } from './avatarFaq.jsx';

function HomePage({ setRoute, heroVariant }) {
  return (
    <div className="page-fade">
      {/* ...hero, marquee, manifesto, etc... */}
      <TreasureIcon page="home" />
      <AIAvatarFAQ />
    </div>
  );
}
```
Verbatim current `HomePage` body [VERIFIED: src/pages.jsx:365-380]:
```
function HomePage({ setRoute, heroVariant }) {
  return (
    <div className="page-fade">
      {heroVariant === "manifest" && <HeroManifest setRoute={setRoute} />}
      {heroVariant === "split"    && <HeroSplit    setRoute={setRoute} />}
      {heroVariant === "index"    && <HeroIndex    setRoute={setRoute} />}

      <StoreMarquee />
      <TreasureIcon page="home" />
      <Manifesto />
      <FeaturedStories setRoute={setRoute} />
      <StoresPreview setRoute={setRoute} />
      <SubscribeBanner setRoute={setRoute} />
    </div>
  );
}
```

### Pattern 2: `useReducer` finite state machine for the video phases

**What:** Model `intro | idle | answering` as a true FSM via `useReducer`. The reducer is the only place transition rules live.
**When to use:** Small number of mutually exclusive states with explicit, non-obvious transition rules — exactly AVATAR-01..06's spec.
**Example [CITED: research/ARCHITECTURE.md Pattern 2, cross-checked against Kyle Shevlin's useReducer-as-FSM writeup and this repo's own reducer-avoidance-of-two-sources-of-truth precedent in app.jsx]:**
```jsx
function avatarReducer(state, action) {
  switch (action.type) {
    case "INTRO_ENDED":
      return { phase: "idle", questionId: null, generation: state.generation };
    case "ASK":
      // Legal from idle OR answering — this is the "cut immediately" rule (AVATAR-05).
      return { phase: "answering", questionId: action.questionId, generation: state.generation + 1 };
    case "ANSWER_ENDED":
      // Guard against a stale onEnded firing after the user already switched questions.
      if (action.generation !== state.generation) return state;
      return { phase: "idle", questionId: null, generation: state.generation };
    default:
      return state;
  }
}

function useVideoAvatar() {
  const [state, dispatch] = useReducer(avatarReducer, {
    phase: "intro", questionId: null, generation: 0,
  });
  const videoRef = useRef(null);

  const videoSrc =
    state.phase === "intro" ? AVATAR_INTRO_SRC :
    state.phase === "idle"  ? AVATAR_IDLE_SRC :
    FAQ_QUESTIONS_BY_ID[state.questionId].videoSrc;

  const muted = state.phase !== "answering";
  const loop = state.phase === "idle";

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = muted;   // set the IDL property before play(), not just the JSX attribute
    v.load();           // changing `src` does not reliably reload playback across browsers alone
    const p = v.play();
    if (p) p.catch((err) => {
      if (err.name === "AbortError") return; // expected on rapid src-switch — swallow
      console.error("Avatar video play() rejected:", err); // real NotAllowedError — show "Tap to play"
    });
  }, [videoSrc, muted]);

  return {
    phase: state.phase,
    activeQuestionId: state.questionId,
    videoRef, videoSrc, muted, loop,
    onIntroEnded: () => dispatch({ type: "INTRO_ENDED" }),
    onAnswerEnded: () => dispatch({ type: "ANSWER_ENDED", generation: state.generation }),
    askQuestion: (questionId) => dispatch({ type: "ASK", questionId }),
  };
}
```
Note: this shape adds a `generation` counter directly into reducer state (vs. a separate ref) so the guard travels with the dispatched action itself — closes Pitfall C without a second piece of mutable state to keep in sync.

### Pattern 3: One persistent `<video>` element, src swapped in place

**What:** A single `<video>` DOM node lives for the widget's whole lifetime; transitions change `src`/`muted`/`loop`, never mount/unmount per clip.
**Do NOT** put `key={videoSrc}` on the element to force a remount — recreates the DOM node, drops buffered data, causes a visible flash between clips.

### Pattern 4: Content-as-data, separate from the component tree

**What:** FAQ categories/questions/video paths live in a plain `.js` module with no React import — the same role `theme.js` already plays [VERIFIED: src/theme.js:1-46, no React import present, exports plain constants/objects].
**Example, using the locked D-01 content verbatim:**
```js
// avatarFaqData.js — no React import, no JSX
export const AVATAR_ASSET_BASE = "/assets/avatar";
export const AVATAR_INTRO_SRC = `${AVATAR_ASSET_BASE}/INTRO.mp4`;
export const AVATAR_IDLE_SRC = `${AVATAR_ASSET_BASE}/Idle.mp4`;

export const FAQ_CATEGORIES = [
  {
    id: "about", label: "About LaDidiér",
    questions: [
      { id: "q1", question: "What is LaDidiér?", videoSrc: `${AVATAR_ASSET_BASE}/Q1.mp4` },
      { id: "q2", question: "What types of products do you sell?", videoSrc: `${AVATAR_ASSET_BASE}/Q2.mp4` },
      { id: "q3", question: "How do I know what size to order?", videoSrc: `${AVATAR_ASSET_BASE}/Q3.mp4` },
      { id: "q4", question: "What should I do if an item I want is sold out?", videoSrc: `${AVATAR_ASSET_BASE}/Q4.mp4` },
      { id: "q5", question: "Will you restock an item that is currently unavailable?", videoSrc: `${AVATAR_ASSET_BASE}/Q5.mp4` },
    ],
  },
  {
    id: "shipping", label: "Shipping & Delivery",
    questions: [
      { id: "q6", question: "Where does LaDidiér ship?", videoSrc: `${AVATAR_ASSET_BASE}/Q6.mp4` },
      { id: "q7", question: "How much does shipping cost?", videoSrc: `${AVATAR_ASSET_BASE}/Q7.mp4` },
      { id: "q8", question: "How long will it take for my order to arrive?", videoSrc: `${AVATAR_ASSET_BASE}/Q8.mp4` },
      { id: "q9", question: "How can I track my order?", videoSrc: `${AVATAR_ASSET_BASE}/Q9.mp4` },
      { id: "q10", question: "What should I do if my package says delivered, but I haven't received it?", videoSrc: `${AVATAR_ASSET_BASE}/Q10.mp4` },
    ],
  },
  {
    id: "orders", label: "Orders, Returns & Exchanges",
    questions: [
      { id: "q11", question: "Can I change or cancel my order after I place it?", videoSrc: `${AVATAR_ASSET_BASE}/Q11.mp4` },
      { id: "q12", question: "What is your return and exchange policy?", videoSrc: `${AVATAR_ASSET_BASE}/Q12.mp4` },
      { id: "q13", question: "What should I do if I receive the wrong item or my item arrives damaged?", videoSrc: `${AVATAR_ASSET_BASE}/Q13.mp4` },
    ],
  },
  {
    id: "payments", label: "Payments & Customer Support",
    questions: [
      { id: "q14", question: "What payment methods do you accept?", videoSrc: `${AVATAR_ASSET_BASE}/Q14.mp4` },
      { id: "q15", question: "How can I contact LaDidiér if I need additional help?", videoSrc: `${AVATAR_ASSET_BASE}/Q15.mp4` },
    ],
  },
];

export const FAQ_QUESTIONS_BY_ID = Object.fromEntries(
  FAQ_CATEGORIES.flatMap((c) => c.questions).map((q) => [q.id, q])
);
```

### Anti-Patterns to Avoid

- **One `<video>` per clip, toggled with `display`:** Browsers eagerly fetch `<video src>` per their `preload` default — 17 mounted elements can trigger up to 17 concurrent large network requests on page load.
- **`key={videoSrc}` to force a remount:** Destroys/recreates the DOM node on every click — visible flash, loses buffered data, re-runs autoplay policy checks from scratch.
- **Local `useState` copies of "which question is active" inside `AvatarVideo`/question-list components:** Two sources of truth that can desync — this project's own `app.jsx` had exactly this bug once (two effects writing `isMember`, "whichever settled last silently won") and fixed it by consolidating into one resolver. One reducer in the parent only.
- **Hardcoding video paths inline in JSX** (`<video src="/assets/avatar/Q7.mp4">` or a `switch` in the component): Violates FAQ-04 directly. All paths live in `avatarFaqData.js`.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|--------------|-----|
| 4-state video phase machine with one interrupt transition | A hand-rolled set of `useState` booleans (`isIntroPlaying`, `isAnswering`, ...) with `if` guards scattered across handlers | `useReducer` with an explicit switch statement (Pattern 2) | A `useState`-soup version has to re-derive the "ASK is legal from both idle and answering" rule in every event handler; a reducer centralizes it in one place and is trivially unit-testable with no DOM |
| Stale-event guarding on rapid clicks | Manual boolean flags (`isSwitching`) toggled in click handlers | A monotonic `generation` counter compared inside the reducer itself (Pattern 2, Pitfall C) | Boolean flags don't compose across 3+ rapid clicks in a row; a counter comparison is correct for any number of rapid switches |
| Cross-component "mobile nav is open" signal | A new global state library or prop-drilling `menuOpen` through `App` → `HomePage` → `AIAvatarFAQ` | `window.dispatchEvent(new CustomEvent(...))`, mirroring `treasure.jsx`'s existing `TREASURE_EVENT` pattern verbatim | This project has already solved "a deeply nested/sibling component needs a signal from an unrelated component" exactly once, with this exact mechanism — reuse it instead of introducing a second competing pattern |

**Key insight:** Every "don't hand-roll" item above already has a working precedent inside this exact codebase (not just "the React ecosystem in general"). Reuse the precedent; don't introduce a second pattern for the same problem.

## Common Pitfalls

### Pitfall A: Unhandled `play()` promise rejection silently breaks autoplay
**What goes wrong:** `videoEl.play()` returns a Promise; an unhandled rejection (`NotAllowedError` on real policy block, `AbortError` on a legitimate rapid src-switch) surfaces only as a console error — the widget shows a frozen frame with no visible failure state.
**Why it happens:** Tutorials rarely show the rejection-handling branch; `<video autoPlay>` and manual `.play()` calls are treated as fire-and-forget.
**How to avoid:** Always branch on the returned promise. Swallow `AbortError` (expected on rapid switching). Show a visible "Tap to play" fallback (already specified in the UI-SPEC's Copywriting Contract) on `NotAllowedError`, and re-issue `.play()` from that click's own handler to preserve gesture attribution.
**Warning signs:** "Uncaught (in promise) DOMException" in console; "just doesn't play sometimes" bug reports with no repro pattern.

### Pitfall B: iOS Safari blocks/degrades autoplay without the full `muted`+`playsInline`+`autoPlay` triad
**What goes wrong:** Missing `playsInline` forces the video fullscreen the instant it plays on iPhone — breaking the floating-widget concept entirely. Low Power Mode can block even muted autoplay with no distinguishing JS error.
**Why it happens:** The difference is invisible on desktop Chrome, where most initial development happens.
**How to avoid:** Set all three attributes together on every `<video>` element from the start. Per D-10, real iPhone testing (including Low Power Mode) is the user's own explicit verification step for this phase — the code must be written assuming this test will run, i.e. always have the "Tap to play" fallback ready, not added as an afterthought once the real-device test fails.

### Pitfall C: React state drifts from actual `<video>` playback state under rapid FAQ switching
**What goes wrong:** If phase transitions are driven by click-handler intent alone (not native `<video>` events), a stale `onEnded` from a previous clip can fire after a new clip is already playing, forcing an incorrect early return-to-idle — directly breaking AVATAR-05.
**How to avoid:** Generation-counter guard (Pattern 2) — every `ANSWER_ENDED` dispatch carries the generation it was fired for; the reducer no-ops if it doesn't match current generation. This must be designed into the reducer from the start, not patched in after QA finds it — retrofitting touches every transition path.
**Warning signs:** Rapidly clicking between 2-3 questions plays the wrong audio or flickers back to idle before the intended answer finishes.

### Pitfall D: Mounting outside the route-keyed `<main>` tree means route navigation doesn't stop the video
**What goes wrong:** `app.jsx`'s `<main key={route}>{page}</main>` [VERIFIED: src/app.jsx:227 — `<main key={route}>{page}</main>`] fully unmounts/remounts on every hash-route change; anything mounted *inside* whichever page is currently rendering gets this for free. `Footer` and `TreasureHuntComplete` are deliberately mounted *outside* `<main>` at the `App()` level [VERIFIED: src/app.jsx:223-229] and do NOT get this behavior — if `AIAvatarFAQ` is mounted the same way, its video keeps playing after navigating away from home.
**How to avoid:** Mount `AIAvatarFAQ` as a child of `HomePage` (inside the route-keyed subtree), not at the `App()` level. This is already the CONTEXT.md-locked architecture decision (Claude's Discretion section) — this research confirms it against the actual current line numbers.

### Pitfall E: "Intro plays once" must survive the Pitfall D fix, or it replays every home-revisit
**What goes wrong:** Fixing Pitfall D (correct unmount on route change) means `HomePage`'s local component state resets on every return to home. If "has the intro played" is tracked only in `useState`, Home → Stores → Home replays the full ~31MB intro every time — very plausible real user behavior.
**How to avoid:** Persist the flag in `sessionStorage`, not component state — this project already uses the same tier distinction (`localStorage` for `ladidier_perk_found`/`ladidier_treasure_completed` [VERIFIED: src/perks.jsx:6, src/treasure.jsx:7] vs. `sessionStorage` for `ladidier_treasure_progress` [VERIFIED: src/treasure.jsx:6,13,27] — a session-scoped flag belongs in `sessionStorage`, matching the treasure-hunt's own progress-vs-completion split).

### Pitfall F: The mobile nav's open/close state is not exposed outside `Nav` — the UI-SPEC's required pairing needs new code, not existing wiring
**What goes wrong:** The UI-SPEC states "when the mobile nav overlay opens, the widget's active `<video>` must be explicitly `.pause()`d" and PITFALLS.md (milestone-level research) says this state "is already tracked in this codebase's `Nav`/mobile-overlay component state" — true, but incomplete: reading the actual component shows `menuOpen`/`isClosing` are `useState` calls fully local to the `Nav` function [VERIFIED: src/components.jsx:116-117 — `const [menuOpen, setMenuOpen] = useState(false);` / `const [isClosing, setIsClosing] = useState(false);`], with no `dispatchEvent`, no lifted state, no export. `AIAvatarFAQ`, mounted inside `HomePage`, has no way to observe this state as the code exists today.
**Why it happens:** The milestone-level pitfalls research correctly identified the state *exists*, but didn't verify it's *reachable* from where the new widget will live — an easy gap to miss without opening `components.jsx` directly.
**How to avoid:** This codebase already has the exact solved pattern for "a component needs a signal from an unrelated component" — `treasure.jsx`'s `TREASURE_EVENT` (`"ladidier:treasure-found"`) [VERIFIED: src/treasure.jsx:9,32,36-44 — `const TREASURE_EVENT = "ladidier:treasure-found";` ... `window.dispatchEvent(new CustomEvent(TREASURE_EVENT, { detail: { found, complete } }));` ... `window.addEventListener(TREASURE_EVENT, handler);`]. The plan should add a small change to `components.jsx`'s `openMenu`/`closeMenu` functions [VERIFIED: src/components.jsx:120-124] to `window.dispatchEvent(new CustomEvent("ladidier:mobilenav", { detail: { open } }))`, and have `AIAvatarFAQ` `window.addEventListener` for it and call `.pause()` on its video ref when `open === true`. This is a genuinely new task the plan must include — it is not "already wired," contrary to what the milestone-level pitfalls research implied.
**Warning signs:** Opening the mobile hamburger menu with a FAQ answer playing still produces audible sound with no visible source.

### Pitfall G (NEW — not in milestone-level PITFALLS.md): `HomePage`'s `.page-fade` animation creates a containing block that breaks `position: fixed` for its first 0.5s
**What goes wrong:** `HomePage`'s root element is `<div className="page-fade">` [VERIFIED: src/pages.jsx:367 — `<div className="page-fade">`], and `.page-fade` is defined as `animation: pageFade .5s ease both;` with the keyframes animating `transform` [VERIFIED: src/styles.css:322-326 — `.page-fade { animation: pageFade .5s ease both; } @keyframes pageFade { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }`]. Per the CSS spec, any element with an active `transform` animation establishes a containing block for `position: fixed` descendants — for the 0.5s duration of this animation, a `fixed`-positioned `AIAvatarFAQ` mounted as a plain JSX child of `HomePage` would compute its `right`/`bottom` offsets relative to `.page-fade`'s box, not the viewport, causing a visible mispositioned flash exactly during the moment the intro video starts autoplaying (worst possible timing — draws the eye right when the animation glitch is most visible). This project has already hit and fixed this *exact* bug once: quick task `260901-1lc`'s fix log states "the reader modal's `position:fixed` backdrop was broken by `.page-fade`'s transform animation creating a containing block — fixed via `createPortal` to `document.body`" [VERIFIED: .planning/STATE.md:101].
**Why it happens:** `.page-fade`'s animation is easy to overlook as a source of a CSS containing-block change, since `transform` is not the property most developers associate with breaking `position: fixed` — and the bug only manifests during the animation's active 0.5s window, making it easy to miss in a quick visual check where the widget "looks fine" once the animation settles.
**How to avoid:** Mount `AIAvatarFAQ`'s actual DOM output via `createPortal(..., document.body)` inside the component (the component can still be imported/rendered as a JSX child of `HomePage` for lifecycle purposes — `createPortal` only changes where the DOM node lands, not React's component tree/unmount behavior), exactly mirroring the fix already applied to the reader modal.
**Warning signs:** The widget briefly appears in the wrong position (offset relative to the hero/manifesto content rather than the viewport corner) for about half a second on every homepage load, most visible on a slow device or with browser DevTools' animation slow-down.
**Phase to address:** This phase, at initial component-mount implementation — cheap to build correctly from the start (`createPortal` is a one-line wrapper), expensive to diagnose later since it's an intermittent, animation-timing-dependent visual glitch, not a hard functional failure.

## Runtime State Inventory

Not applicable — this is a greenfield feature addition (new files, new asset directory), not a rename/refactor/migration phase.

## Code Examples

### Interim UI question button (D-04 — plain, unstyled, functional only)
```jsx
// avatarFaq.jsx — interim markup per D-02..D-04 and UI-SPEC's Copywriting Contract
function FAQCategories({ categories, activeQuestionId, onSelect }) {
  return (
    <div className="avatar-faq-questions">
      {categories.map((cat) => (
        <div key={cat.id} className="avatar-faq-category">
          <p className="avatar-faq-category-label">{cat.label}</p>
          {cat.questions.map((q) => (
            <button
              key={q.id}
              type="button"
              className="avatar-faq-question-btn"
              onClick={() => onSelect(q.id)}
            >
              {q.question}
            </button>
          ))}
        </div>
      ))}
    </div>
  );
}
```

### Autoplay-rejection fallback ("Tap to play" — UI-SPEC's Error state contract)
```jsx
// Inside AIAvatarFAQ, alongside useVideoAvatar()
const [blocked, setBlocked] = useState(false);

useEffect(() => {
  const v = videoRef.current;
  if (!v) return;
  v.muted = muted;
  v.load();
  const p = v.play();
  if (p) {
    p.then(() => setBlocked(false))
     .catch((err) => {
       if (err.name === "AbortError") return;
       setBlocked(true); // real NotAllowedError — show "Tap to play"
     });
  }
}, [videoSrc, muted]);

{blocked && (
  <button type="button" onClick={() => { videoRef.current.play(); setBlocked(false); }}>
    Tap to play
  </button>
)}
```

### Portal mount, avoiding Pitfall G
```jsx
import { createPortal } from 'react-dom';

function AIAvatarFAQ() {
  // ...useVideoAvatar(), FAQ_CATEGORIES, etc.
  return createPortal(
    <div className="avatar-faq-widget">{/* video + question buttons */}</div>,
    document.body
  );
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|-------------------|---------------|--------|
| CDN + Babel-standalone React (this project's original v1.0 setup) | Real Vite build with ESM `import`/`export` | v1.2 (2026-09-01/02), per PROJECT.md's own drift note | Standard JSX/import syntax works normally in this phase's new files — no CDN-mode constraints apply |

**Deprecated/outdated:**
- `tweaks-panel.jsx` no longer exists in this codebase (confirmed absent — `THEME` is now a frozen constant in `theme.js` [VERIFIED: src/theme.js:27-33]) — do not reference its former `z-index: 2147483646` value from any historical planning doc; it does not apply.

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|----------------|
| A1 | Vercel's Static File Uploads limit is 100MB (Hobby) / 1GB (Pro), per `vercel.com/docs/limits` fetched 2026-09-03 in the milestone-level `STACK.md`/`PITFALLS.md` research (1-2 days old at time of this phase research, not independently re-fetched this session) | Package Legitimacy Audit is n/a but D-08 verification depends on this being current | If Vercel's limits changed in the last ~48h, the "verify plan tier before merge" gate (D-08) could pass/fail incorrectly — low risk given recency, but the actual dashboard check (not this cached figure) is the authoritative gate per D-08 |
| A2 | The 15 answer videos' individual sizes range ~9–24MB each, `Idle.mp4` ~5.4MB, `INTRO.mp4` ~29.9MB, totaling ~255.66MB — computed by this session directly `stat`-ing the source files at `D:\ttt\LaDidier Avatar` | Asset Inventory (Environment Availability section) | Low risk — these are exact byte counts read directly from the filesystem this session, not estimated; only risk is the source files changing between now and the copy step |
| A3 | WCAG 1.4.2 (Audio Control) applies to any auto-playing audio over 3 seconds and requires a pause/stop/volume control — carried over from milestone-level `PITFALLS.md`, not independently re-verified against the current WCAG spec text this session | Pitfall B / general a11y framing (full A11Y implementation is Phase 12 scope, not this phase) | Low risk for this phase specifically since Phase 10 ships an intentionally unstyled interim UI with no dedicated a11y pass (per CONTEXT.md scope boundary) — Phase 12 must re-verify this claim against current WCAG text before that phase's implementation |

**If this table is empty:** N/A — see entries above. All three are LOW risk to this specific phase's scope; none block planning.

## Open Questions

1. **Does the Vercel project's actual plan tier support ~250MB of static assets (D-08)?**
   - What we know: Vercel's Hobby tier caps Static File Uploads at 100MB total, Pro at 1GB (per milestone research, ~2 days old); this project already has live paid Stripe billing, which commercially requires a paid Vercel tier — but this has not been confirmed in the dashboard.
   - What's unclear: The actual configured plan tier for this specific Vercel project/team (`projectId: prj_6oGlEiRYNbPXOvPTTqWHyyZBqFyG`, `orgId: team_TNneMwMrfJWJTS1CLnpGwglM` [VERIFIED: .vercel/project.json]) — not determinable from this repo's filesystem; the Vercel CLI is not installed/on PATH in this environment either, so it cannot be checked programmatically from here.
   - Recommendation: The plan must include an explicit `checkpoint:human-verify` task, before the merge/deploy step, where the user confirms the plan tier in the Vercel dashboard directly (matches D-08's own "before merging" requirement and this project's established manual-verification precedent, D-09/D-10).

2. **Does `Idle.mp4` read as a natural "alive" loop or an obviously-repeating cheap loop?**
   - What we know: `FEATURES.md` (milestone-level research) flags this as a content-quality question dependent on footage already in hand, not resolvable through code research.
   - What's unclear: Visual quality of the actual 5.4MB `Idle.mp4` file — this session did not open/preview the video content itself.
   - Recommendation: Out of scope for this phase's plan (Phase 10 ships whatever `Idle.mp4` contains, unstyled); flag for the content owner during Phase 11 per the milestone's own existing recommendation, not blocking Phase 10.

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|-------------|-----------|---------|----------|
| `react` / `react-dom` | State machine, DOM sync | ✓ | 19.2.8 [VERIFIED: package.json:12-13] | — |
| `vite` build | Serves `public/assets/avatar/*` as static passthrough | ✓ | 8.2.2 [VERIFIED: package.json:14] | — |
| Source video files at `D:\ttt\LaDidier Avatar` | D-05 asset copy | ✓ | 17 files, 255.66MB total (computed this session — see Asset Inventory below) | — |
| Vercel CLI (local) | Optional — verifying plan tier programmatically | ✗ (not on PATH) | — | Use the Vercel web dashboard directly (D-08's actual verification path) |
| Vercel project plan tier ≥ Pro (100MB/1GB static-upload cap) | D-08 — merge gate | **UNVERIFIED — see Open Question 1** | — | None; this is a hard blocker per D-08 if the tier is Hobby |
| Real iPhone (physical device) | D-10 — muted/playsInline/autoplay + Low Power Mode verification | ✓ (per CONTEXT.md D-10 — user has access) | — | — |

**Asset Inventory (computed this session by `stat`-ing the actual source directory):**

| File | Size |
|------|------|
| Idle.mp4 | 5.40 MB |
| INTRO.mp4 | 29.90 MB |
| Q1.mp4 | 22.98 MB |
| Q2.mp4 | 23.02 MB |
| Q3.mp4 | 19.51 MB |
| Q4.mp4 | 17.61 MB |
| Q5.mp4 | 17.92 MB |
| Q6.mp4 | 8.76 MB |
| Q7.mp4 | 11.81 MB |
| Q8.mp4 | 10.13 MB |
| Q9.mp4 | 8.74 MB |
| Q10.mp4 | 17.40 MB |
| Q11.mp4 | 15.82 MB |
| Q12.mp4 | 12.25 MB |
| Q13.mp4 | 8.72 MB |
| Q14.mp4 | 9.20 MB |
| Q15.mp4 | 10.01 MB |
| **Total** | **~255.7 MB** |

**Missing dependencies with no fallback:**
- Confirmed Vercel plan tier for this project (Open Question 1) — must be resolved via a `checkpoint:human-verify` task before merge, per D-08.

**Missing dependencies with fallback:**
- Vercel CLI — use the web dashboard instead; no functional impact on the plan.

## Validation Architecture

`.planning/config.json` has no `workflow.nyquist_validation` key [VERIFIED: .planning/config.json — only `{"workflow": {"_auto_chain_active": false}}`] — absent means treat as enabled, so this section is included.

### Test Framework
| Property | Value |
|----------|-------|
| Framework | None detected — no test config, no test files anywhere in the repo (`find` for `*.test.*`/`*test*.config*` returned nothing outside `node_modules`) |
| Config file | none — see Wave 0 Gaps |
| Quick run command | n/a — no framework installed |
| Full suite command | n/a — no framework installed |

### Phase Requirements → Test Map

Given no test framework exists, this phase's realistic verification path is the manual click-through already locked in as D-09/D-10 (matching this project's own established precedent — Phase 4's CTA-07 friction-audit gate was also manual, not automated). The table below maps requirements to the manual verification steps the plan should encode as explicit checkpoint tasks, since automated tests are not a realistic Wave 0 addition for a video-timing-dependent state machine in a framework-less test environment within this single phase.

| Req ID | Behavior | Test Type | Manual Verification Step | File Exists? |
|--------|----------|-----------|---------------------------|--------------|
| AVATAR-01 | Intro autoplays muted on homepage load | manual | Load homepage fresh (new session); confirm intro plays with no sound | ❌ no automated harness — manual per D-09 |
| AVATAR-02 | Idle loops after intro ends | manual | Let intro finish; confirm idle loop starts and repeats without stalling | ❌ manual per D-09 |
| AVATAR-03 | Clicking a question plays that answer, unmuted | manual | Click each of Q1–Q15 in turn at least once; confirm correct video + audible sound | ❌ manual per D-09 |
| AVATAR-04 | Answer end returns to idle | manual | Let one answer play to completion; confirm return to looping idle | ❌ manual per D-09 |
| AVATAR-05 | Mid-answer question switch cuts immediately | manual | While Q_N is playing, click Q_M (different question) rapidly, repeat across several pairs; confirm no wrong audio/premature idle | ❌ manual per D-09 — highest-risk item, budget real time here per Pitfall C |
| AVATAR-06 | Intro plays once per session | manual | Load home (intro plays) → navigate to another page → navigate back to home; confirm intro does NOT replay | ❌ manual per D-09 |
| FAQ-04 | Data/UI separation | manual (code review) | Confirm `avatarFaqData.js` has zero React import and is the sole source of question text/video paths (grep for hardcoded `/assets/avatar/` paths outside that file) | N/A — structural check, not runtime |

### Sampling Rate
- **Per task commit:** Manual click-through of the specific phase/transition just implemented (no automated quick-run exists).
- **Per wave merge:** Full manual sequence per D-09 (intro → idle → answer → idle, multiple questions, mid-answer interrupts).
- **Phase gate:** D-09's full user click-through + D-10's real-iPhone pass, both before the phase is considered done — per CONTEXT.md, these are already the user's committed acceptance gates, not proposals.

### Wave 0 Gaps
- No test framework exists in this repo at all. Given the phase's actual verification mechanism is the CONTEXT.md-locked manual D-09/D-10 process (matching this project's existing all-manual QA precedent for Phase 4/CTA-07), introducing a test framework from scratch for this one phase is not recommended — it would be new infrastructure disproportionate to a single phase's scope and inconsistent with how every prior phase in this project has been verified.
- If the planner disagrees and wants a lightweight reducer-only unit test (the reducer in Pattern 2 is pure and framework-agnostic, so it's technically testable without any DOM/browser), that would require: `npm install --save-dev vitest`, a `vitest.config.js`, and one `avatarFaqData.test.js`/`avatarReducer.test.js` file — flagged as optional, not required, since it's the one piece of this phase's logic that's cheap to test in isolation of the manual D-09/D-10 gates.

## Security Domain

`.planning/config.json` has no `security_enforcement` key — absent means enabled, so this section is included per protocol. However, per PITFALLS.md's own Security Mistakes table (milestone-level research): "None specific to this feature beyond general web hygiene — this is client-side static video playback with no new data flows, no new API endpoints, and no user input beyond button clicks."

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|----------------|---------|--------------------|
| V2 Authentication | No | Feature has no auth surface — static video playback, no login state consumed |
| V3 Session Management | No | No new session data; `sessionStorage` usage (Pitfall E) is a client-side UX flag only, not a security session |
| V4 Access Control | No | No gated content — all 15 answer videos are publicly viewable static assets |
| V5 Input Validation | No | No free-text input anywhere in this phase's scope (explicitly out of scope per REQUIREMENTS.md's "Out of Scope" table: "Free-text chat input or AI-generated answers") — the only user input is a button click selecting one of 15 fixed, hardcoded `questionId` values |
| V6 Cryptography | No | No new cryptographic operations |

### Known Threat Patterns for this stack

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|-----------------------|
| None applicable this phase | — | This phase introduces zero new `api/*` routes, zero new persisted user data, and zero new input surfaces beyond a button click choosing among 15 fixed values — confirmed by direct comparison against `REQUIREMENTS.md`'s explicit out-of-scope list and this phase's own `CONTEXT.md` domain boundary |

## Sources

### Primary (HIGH confidence)
- This repository, read directly this session: `package.json`, `vite.config.js`, `index.html`, `vercel.json`, `.gitignore`, `.vercel/project.json`, `.planning/config.json`, `src/main.jsx`, `src/app.jsx` (lines 1-40, 180-229), `src/pages.jsx` (lines 24, 211-380), `src/components.jsx` (lines 105-200), `src/theme.js` (full), `src/perks.jsx` (full), `src/treasure.jsx` (lines 1-45), `src/styles.css` (lines 575-600, 925-930, 972-984, 1105-1163, 1248-1305) — all facts tagged `[VERIFIED: ...]` above come from these direct reads this session
- Source video directory `D:\ttt\LaDidier Avatar` — `stat`-ed directly this session for exact byte counts
- `npm view react version` → `19.2.8`, `npm view vite version` → `8.2.2` — confirmed no drift between installed and current registry versions
- `.planning/research/ARCHITECTURE.md`, `.planning/research/PITFALLS.md`, `.planning/research/STACK.md` — milestone-level research, HIGH confidence, produced 2026-09-04 (1 day before this phase research), read directly this session for Patterns 1-4, Pitfalls 1-13, and stack recommendations reused verbatim/adapted above
- `.planning/phases/10-.../10-CONTEXT.md`, `.planning/phases/10-.../10-UI-SPEC.md`, `.planning/REQUIREMENTS.md`, `.planning/STATE.md`, `.planning/PROJECT.md` — read directly this session

### Secondary (MEDIUM confidence)
- `.planning/research/FEATURES.md` — milestone-level research, MEDIUM confidence per its own stated caveat (novel product category, no direct public reference implementation)
- Vercel Limits documentation, WebKit `<video>` policy blog post — cited via milestone-level `STACK.md`/`PITFALLS.md`, not independently re-fetched this session (recency: ~1-2 days old at time of this phase research, treated as current per Assumptions Log A1)

### Tertiary (LOW confidence)
- None used directly in this phase's research beyond what's already flagged in the Assumptions Log.

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — zero new dependencies; installed versions verified directly against `package.json` and cross-checked against npm registry this session
- Architecture: HIGH — codebase conventions (mount lifecycle, z-index vocabulary, `CustomEvent` pattern, `.page-fade` containing-block behavior) verified by direct source reads this session, not inferred from milestone-level research alone
- Pitfalls: HIGH — 7 pitfalls total; 5 carried from milestone-level research (already HIGH confidence, verified against WebKit/Vercel official docs), 2 newly discovered this session (Pitfall F, Pitfall G) via direct codebase reads with exact line-number citations

**Research date:** 2026-09-05
**Valid until:** 30 days for the architectural/reducer-pattern guidance (stable); 7 days for the Vercel plan-tier claim specifically (Open Question 1) — must be re-verified at the dashboard before merge regardless of this document's age, per D-08.

---
*Phase: 10-Avatar Video Engine — Data, State Machine & Playback*
*Research completed: 2026-09-05*
