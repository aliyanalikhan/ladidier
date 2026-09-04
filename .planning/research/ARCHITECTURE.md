# Architecture Research

**Domain:** React 19 SPA feature addition — floating video-driven FAQ widget
**Researched:** 2026-09-04
**Confidence:** HIGH (codebase conventions read directly from `app.jsx`/`perks.jsx`/`treasure.jsx`; video-autoplay and state-machine patterns corroborated across MDN/browser-vendor docs and multiple independent React sources)

## Standard Architecture

### System Overview

```
┌──────────────────────────────────────────────────────────────────────┐
│  App (app.jsx)                                                        │
│  owns: route, isMember, isSubscribed, user, activePlan                │
│  ┌─────────┐  ┌──────────────────────────────┐  ┌──────────┐         │
│  │  Nav    │  │  <main key={route}>            │  │ Footer   │        │
│  └─────────┘  │    page = <HomePage .../>       │  └──────────┘        │
│               │  ┌────────────────────────────┐ │                     │
│               │  │ HomePage (pages.jsx)        │ │                     │
│               │  │  Hero*                      │ │                     │
│               │  │  StoreMarquee                │ │                     │
│               │  │  TreasureIcon page="home"    │ │  ← existing sibling │
│               │  │  Manifesto                   │ │    pattern to copy  │
│               │  │  FeaturedStories              │ │                     │
│               │  │  StoresPreview                 │ │                     │
│               │  │  SubscribeBanner               │ │                     │
│               │  │  AIAvatarFAQ  ◄── NEW          │ │                     │
│               │  └────────────────────────────┘ │                     │
│               └──────────────────────────────┘  │                     │
│  TreasureHuntComplete  ← global, cross-page (site-wide hunt)          │
└──────────────────────────────────────────────────────────────────────┘

AIAvatarFAQ (new, homepage-only — does NOT get an App.jsx-level mount)
  ├─ useVideoAvatar()      → reducer: phase (intro/idle/answering) + activeQuestionId
  ├─ AvatarVideo            → single <video> element, ref-controlled, no business logic
  └─ FAQCategories          → 4 categories × 15 questions, reads avatarFaqData.js
```

The key structural fact from `app.jsx` (line 227: `<main key={route}>{page}</main>`) is that **the entire page subtree remounts on every route change**. Anything mounted inside `HomePage` is destroyed and recreated each time the user (re)navigates to `#home` — this is why AIAvatarFAQ belongs inside `HomePage`, not in `App`: it gets the "intro autoplays on load" behavior for free, every time, with zero extra wiring.

### Component Responsibilities

| Component | Responsibility | Typical Implementation |
|-----------|----------------|-------------------------|
| `AIAvatarFAQ` | Outer shell: floating launcher chrome, open/closed panel state, click-outside/Escape-to-close, composes the two pieces below | `useState` for panel open/closed (mirrors `HiddenPerk`'s `open` pattern) |
| `useVideoAvatar` (the "VideoController") | Owns the phase state machine and the video-src/muted/loop derivation; the single source of truth both children read from | `useReducer` + a `useRef` to the `<video>` DOM node + one `useEffect` syncing state → imperative video API |
| `AvatarVideo` | Pure presentational `<video>` wrapper; renders whatever src/muted/loop/onEnded it's given, no state of its own | Controlled component, forwards `ref` |
| `FAQCategories` | Renders 4 categories × N questions from the data module, highlights the active question, emits `onSelect(questionId)` | Plain map over `avatarFaqData.js`, no video/DOM knowledge |
| `avatarFaqData.js` | Static content: category labels, question text, video file paths | Plain JS array/object, no React import — same role `theme.js` already plays for the palette |

## Recommended Project Structure

```
src/
├── avatarFaqData.js     # NEW — plain data: categories → questions → video paths
├── avatarFaq.jsx         # NEW — AIAvatarFAQ, AvatarVideo, FAQCategories, useVideoAvatar
├── pages.jsx             # MODIFIED — import + mount <AIAvatarFAQ /> inside HomePage
├── styles.css            # MODIFIED — append .avatar-faq-* rules (global stylesheet convention)
├── perks.jsx             # unchanged — reference pattern
├── treasure.jsx          # unchanged — reference pattern
├── theme.js              # unchanged — reference pattern for "plain data module" convention
└── app.jsx               # unchanged — no route/state wiring needed

public/assets/
└── avatar/               # NEW — INTRO.mp4, Idle.mp4, Q1.mp4 … Q15.mp4 (copied in, static)
```

### Structure Rationale

- **`avatarFaq.jsx` as one file, not four:** `perks.jsx` and `treasure.jsx` both bundle several components (`HiddenPerk`; `TreasureIcon`/`TreasureProgress`/`TreasureHuntComplete`) in a single file and export only what other files need to import, at the bottom (`export { HiddenPerk }` / `export { TreasureIcon, TreasureProgress, TreasureHuntComplete }`). This project's convention is **one file per feature**, not one file per component. Splitting `AvatarVideo`/`FAQCategories`/`useVideoAvatar` into separate files would be idiomatic React elsewhere but would break the established pattern here for no benefit — the whole feature is small enough (a launcher, one video element, one list) to read as a single file, same as the other two features.
- **`avatarFaqData.js` as its own file, separate from `avatarFaq.jsx`:** this is the one deliberate deviation from "one file per feature," and it's justified by an explicit project requirement ("FAQ-to-video mapping kept as a separate data structure from UI logic," PROJECT.md) plus existing precedent — `theme.js` already sits next to `app.jsx`/`pages.jsx` as a plain-JS (non-JSX) data/config module consumed by components rather than containing any. `avatarFaqData.js` plays the identical role: a non-technical editor can open it and add a 16th question or change a video filename without touching component code.
- **No new folders.** The codebase is flat (`src/*.jsx` + `src/*.js`), no `components/` or `features/` subdirectories exist anywhere. Introducing one for this feature alone would be inconsistent with every other feature module in the project.

## Architectural Patterns

### Pattern 1: Single-file feature module, mounted as a page sibling

**What:** A self-contained `.jsx` file owns all of a feature's local state, renders its own DOM (usually `position: fixed`/`absolute`, so it doesn't participate in page layout), and exports only its top-level component(s) for a page to mount as a plain JSX sibling — no props threaded through `App`, no context, no global store.
**When to use:** Features that are visually/behaviorally self-contained and don't need to share state with the rest of the app. `HiddenPerk`, `TreasureIcon`, and now `AIAvatarFAQ` all qualify — none of them need anything from `App`'s route/auth/membership state.
**Trade-offs:** Very low coupling and easy to delete/disable (remove one import + one JSX line). The cost is that if a future feature *does* need cross-page state, this pattern doesn't scale to that — but `AIAvatarFAQ` is explicitly homepage-only, so that limitation doesn't apply here.

**Example (matches `pages.jsx` today):**
```jsx
// pages.jsx
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

### Pattern 2: `useReducer` finite state machine for the video phases

**What:** Model `intro | idle | answering` as a true finite state machine via `useReducer`, not three independent booleans/`useState` calls. The reducer is the *only* place transition rules live (e.g., "answering → answering directly, skipping idle, when a new question is clicked mid-answer").
**When to use:** Whenever a component has a small number of **mutually exclusive** states with explicit transition rules — exactly this widget's spec (INTRO → IDLE → ANSWERING → IDLE, with the mid-answer interrupt rule). This is the textbook case the React community consistently reaches for `useReducer` over `useState` soup, because a reducer can enforce "only these transitions are legal" in one place instead of scattering `if` guards across multiple `setX` calls that can drift out of sync.
**Trade-offs:** Slightly more ceremony than three `useState`s for a trivial case, but this case isn't trivial — it has a non-obvious interrupt rule that a plain `useState` version would need to re-derive correctly in every event handler. A reducer collapses that into one switch statement, and unit-testing "what state comes after this action" needs no DOM/video mocking at all.

**Example:**
```jsx
function avatarReducer(state, action) {
  switch (action.type) {
    case "INTRO_ENDED":
      return { phase: "idle", questionId: null };
    case "ASK":
      // Legal from idle OR answering — this is the "cut immediately" rule.
      return { phase: "answering", questionId: action.questionId };
    case "ANSWER_ENDED":
      // Guard against a stale onEnded firing after the user already
      // switched questions (src changed before the old video's end event).
      if (state.questionId !== action.questionId) return state;
      return { phase: "idle", questionId: null };
    default:
      return state;
  }
}

function useVideoAvatar() {
  const [state, dispatch] = useReducer(avatarReducer, { phase: "intro", questionId: null });
  const videoRef = useRef(null);

  const videoSrc =
    state.phase === "intro" ? AVATAR_INTRO_SRC :
    state.phase === "idle"  ? AVATAR_IDLE_SRC :
    FAQ_QUESTIONS_BY_ID[state.questionId].videoSrc;

  const muted = state.phase !== "answering";
  const loop = state.phase === "idle";

  // Sync declarative state → imperative <video> API. This is the one place
  // that talks to the DOM node directly — everything else stays declarative.
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = muted;      // set the IDL property, not just the JSX attribute —
                           // some browsers only honor autoplay if muted is set
                           // this way before play() is called.
    v.load();              // changing the `src` attribute does not reliably
                           // reload/reset playback across browsers on its own.
    v.play().catch((err) => {
      // Autoplay can still be blocked (e.g. iOS Low Power Mode). Fail silently
      // for muted intro/idle; a rejected ANSWERING play (user-initiated click)
      // should surface a visible "tap to play" affordance instead.
      console.error("Avatar video play() rejected:", err);
    });
  }, [videoSrc, muted]);

  return {
    phase: state.phase,
    activeQuestionId: state.questionId,
    videoRef, videoSrc, muted, loop,
    onIntroEnded: () => dispatch({ type: "INTRO_ENDED" }),
    onAnswerEnded: () => dispatch({ type: "ANSWER_ENDED", questionId: state.questionId }),
    askQuestion: (questionId) => dispatch({ type: "ASK", questionId }),
  };
}
```

### Pattern 3: One persistent `<video>` element, src swapped in place

**What:** A single `<video>` DOM node lives for the whole widget's lifetime; transitions change its `src`/`muted`/`loop` rather than mounting/unmounting different `<video>` elements per clip.
**When to use:** Any UI that plays one-of-many clips sequentially (exactly this case: 17 clips, only one ever playing).
**Trade-offs:** Do **not** put `key={videoSrc}` on the `<video>` element to force a remount on every question change — that's the tempting shortcut but it recreates the DOM node, drops any buffered data, and can cause a visible flash/black-frame between clips. Keep the node stable and drive it through the effect in Pattern 2 instead.

### Pattern 4: Content-as-data, separate from the component tree

**What:** The FAQ categories/questions/video paths live in a plain `.js` module with no React import, structured as nested plain objects/arrays, exposing both the nested shape (for rendering categories) and a flat `id → question` lookup (for O(1) resolution inside the reducer/effect).
**When to use:** Whenever content is expected to change independently of logic — exactly the stated requirement ("easy to edit later"). This project already has the identical pattern in `theme.js`.
**Trade-offs:** None meaningful at this scale (15 questions, 4 categories). At larger scale this is also exactly the shape that would let the data move to a CMS/JSON fetch later without touching any component.

**Example:**
```js
// avatarFaqData.js — no React import, no JSX
export const AVATAR_ASSET_BASE = "/assets/avatar";
export const AVATAR_INTRO_SRC = `${AVATAR_ASSET_BASE}/INTRO.mp4`;
export const AVATAR_IDLE_SRC = `${AVATAR_ASSET_BASE}/Idle.mp4`;

export const FAQ_CATEGORIES = [
  {
    id: "about",
    label: "About LaDidiér",
    questions: [
      { id: "q1", question: "What is LaDidiér?", videoSrc: `${AVATAR_ASSET_BASE}/Q1.mp4` },
      // ...
    ],
  },
  { id: "shipping", label: "Shipping & Delivery", questions: [ /* q5–q8 */ ] },
  { id: "orders",   label: "Orders, Returns & Exchanges", questions: [ /* q9–q12 */ ] },
  { id: "payments", label: "Payments & Customer Support", questions: [ /* q13–q15 */ ] },
];

// Flat lookup so the reducer/effect never walks the nested tree.
export const FAQ_QUESTIONS_BY_ID = Object.fromEntries(
  FAQ_CATEGORIES.flatMap((c) => c.questions).map((q) => [q.id, q])
);
```

## Data Flow

### Request Flow (a question click)

```
[User clicks a question in FAQCategories]
    ↓
askQuestion(questionId)  →  dispatch({ type: "ASK", questionId })
    ↓
avatarReducer  →  { phase: "answering", questionId }
    ↓
videoSrc recomputed  →  FAQ_QUESTIONS_BY_ID[questionId].videoSrc
    ↓
useEffect([videoSrc, muted])  →  video.muted=false; video.load(); video.play()
    ↓
<video onEnded={onAnswerEnded}>  fires when the clip finishes
    ↓
dispatch({ type: "ANSWER_ENDED", questionId })  →  guarded against stale events
    ↓
phase: "idle"  →  videoSrc = AVATAR_IDLE_SRC (loops muted, unattended)
```

### State Management

```
useVideoAvatar()  (lives inside AIAvatarFAQ)
    ↓ returns
{ phase, activeQuestionId, videoRef, videoSrc, muted, loop, askQuestion, onIntroEnded, onAnswerEnded }
    ↓ passed as props
AvatarVideo (ref, src, muted, loop, onEnded)   FAQCategories (categories, activeQuestionId, onSelect=askQuestion)
```

Neither child owns state; both are pure consumers of the single reducer in the parent. This avoids the two-sources-of-truth bug the project's own `app.jsx` explicitly called out and fixed once already (the membership-resolution comment about "two separate effects... whichever settled last silently won") — don't reintroduce that shape here by giving `AvatarVideo` its own "is playing" state that could drift from the reducer's `phase`.

### Key Data Flows

1. **Mount → intro → idle:** On first mount, `phase` starts at `"intro"`, the effect loads/plays `INTRO.mp4` muted; its `onEnded` dispatches `INTRO_ENDED`, dropping to `"idle"` and swapping to the looping `Idle.mp4` (native `loop` attribute — no need to re-dispatch on every idle loop iteration).
2. **Idle → answering → idle:** A question click always wins immediately, whether coming from idle or from a different in-progress answer, because `ASK` is legal from both phases in the reducer and the src-swap effect doesn't care what the previous src was.
3. **Route away and back:** Because `<main key={route}>` unmounts `HomePage` on navigation, `AIAvatarFAQ`'s reducer resets to `"intro"` on every return to the homepage — this is the desired behavior per the milestone spec ("opens automatically on page load"), not a bug to work around.

## Scaling Considerations

This is a static, client-only widget with no backend and a fixed content set (15 questions), so "scaling" here means asset growth and content growth, not traffic.

| Scale | Architecture Adjustments |
|-------|---------------------------|
| Current (15 Q&A, ~250MB total) | Plain files in `public/assets/avatar/`, all under GitHub's 100MB/file limit — no changes needed, matches existing `public/assets/` convention for images |
| Question count grows to 30-40 | `avatarFaqData.js` shape already accommodates this (just append entries); consider lazy-loading only the active category's video metadata isn't necessary since `<video>` elements load on demand via `src`, not eagerly |
| Total asset size grows past a few GB / needs CDN delivery | Swap `AVATAR_ASSET_BASE` from `/assets/avatar` to a CDN URL in one place in `avatarFaqData.js` — no component changes needed, which is the payoff of centralizing paths in the data module now |

### Scaling Priorities

1. **First real constraint:** repo/deploy size from committing ~250MB of video directly into `public/assets/`. This is a Key Decision already made in PROJECT.md (accepted for this milestone since all files are under the 100MB/file limit), not something to solve architecturally here — but worth flagging if the asset count/size grows meaningfully in a future milestone, since Vercel and git both have practical repo-size ergonomics limits well before any per-file limit is hit.
2. **Second:** if a future milestone wants this site-wide instead of homepage-only, the reducer/data module need no changes — only the mount point moves from `HomePage` to `App` (following the existing `TreasureHuntComplete` precedent for a cross-page mount), which is exactly why keeping `AIAvatarFAQ` self-contained (no props from `App`) pays off later.

## Anti-Patterns

### Anti-Pattern 1: One `<video>` element per clip, toggled with CSS `display`

**What people do:** Render all 17 `<video>` tags in the DOM simultaneously and show/hide the active one with `display: none`/`block`.
**Why it's wrong:** Browsers eagerly start fetching `<video>` sources (even without `autoplay`) depending on the `preload` default, so this can trigger up to 17 concurrent network requests for ~250MB of video on page load. It also multiplies event-listener wiring (`onEnded` on 17 elements instead of 1) for no benefit.
**Do this instead:** One persistent `<video>` element with `src` swapped imperatively (Pattern 3).

### Anti-Pattern 2: Keying the video element by clip id to force a remount

**What people do:** `<video key={videoSrc} src={videoSrc} />`, relying on React's remount-on-key-change to "reset" playback.
**Why it's wrong:** Destroys and recreates the DOM node on every question click — visible flash/black frame, loses any pre-buffered data, and re-runs `autoplay` policy checks from scratch every time instead of once.
**Do this instead:** Stable node + `useEffect` that calls `.load()`/`.play()` on src change (Pattern 2/3).

### Anti-Pattern 3: Letting `AvatarVideo` or `FAQCategories` own their own copy of "which question is active"

**What people do:** Give the video component local `useState` for "am I playing" and the FAQ list local `useState` for "which one did I click," syncing them via effects that watch each other's props.
**Why it's wrong:** Two sources of truth that can desync — this project's own `app.jsx` had exactly this bug once (two independent effects writing `isMember`, "whichever settled last silently won") and fixed it by consolidating into one resolver. Don't reintroduce the pattern here.
**Do this instead:** One reducer in the parent (`useVideoAvatar`), both children are pure props-in/callback-out.

### Anti-Pattern 4: Hardcoding video file paths inline in JSX

**What people do:** `<video src="/assets/avatar/Q7.mp4">` scattered across the FAQ list markup, or a `switch` on question id inside the component that returns a path string.
**Why it's wrong:** Violates the project's explicit requirement to keep FAQ-to-video mapping separate from UI logic, and makes future edits (renaming a file, adding Q16) require touching component code instead of data.
**Do this instead:** All paths live in `avatarFaqData.js` (Pattern 4); components only ever see a `videoSrc` value that was already resolved.

## Integration Points

### External Services

None. This feature is fully static/client-side — pre-recorded video files, no live AI inference, no new API route under `api/`, no new environment variables. This is worth calling out explicitly since the feature name ("AI Video Avatar") could otherwise suggest a live model call; per PROJECT.md it is "existing video files... no video generation/synthesis."

### Internal Boundaries

| Boundary | Communication | Notes |
|----------|---------------|-------|
| `pages.jsx` (`HomePage`) ↔ `avatarFaq.jsx` (`AIAvatarFAQ`) | Plain JSX mount, no props | Mirrors `<TreasureIcon page="home" />`, except `AIAvatarFAQ` needs no props at all — it's fully self-contained, unlike `TreasureIcon` which needs to know which page it's on |
| `AIAvatarFAQ` ↔ `useVideoAvatar` | Direct hook call, same file | Hook, not a separate component — no visual output of its own, so a hook is the idiomatic React 19 shape rather than a wrapper component |
| `avatarFaq.jsx` ↔ `avatarFaqData.js` | Static `import` | One-directional; the data module never imports from the component file |
| `avatarFaq.jsx` ↔ `styles.css` | className hooks (`avatar-faq-*`) | Follow the existing convention — no CSS modules/styled-components in this codebase, one global stylesheet, palette via `var(--gold)` etc. from `theme.js` |
| `avatarFaq.jsx` ↔ `public/assets/avatar/*.mp4` | Static `src` URLs resolved at runtime, not imported/bundled | Vite serves `public/` verbatim at the site root, matching how `public/assets/*.jpeg` image paths are already referenced elsewhere in `pages.jsx` |

**Explicitly not touched:** `app.jsx` (no new route/state — homepage-only per Key Decision), `theme.js` (no new palette tokens needed, reuse existing CSS custom properties), any `api/*` serverless function.

### Suggested Build Order

1. **`avatarFaqData.js`** — define the shape first (categories → questions → video paths + the flat lookup). Nothing else can be written against a moving target; this file has zero dependencies on anything else in the feature.
2. **`useVideoAvatar` reducer** — write and manually exercise the state machine (phase transitions, the mid-answer interrupt rule, the stale-`ANSWER_ENDED` guard) before wiring it to any DOM node. A reducer is trivially testable without a browser.
3. **`AvatarVideo` + the DOM-sync effect** — wire the reducer's output to a real `<video>` element (muted intro/idle, unmuted answering, `.load()`+`.play()` on src change, `onEnded` wired back to `dispatch`).
4. **`FAQCategories`** — render the 4-category list from `avatarFaqData.js`, wire clicks to `askQuestion`.
5. **`AIAvatarFAQ` shell** — floating launcher chrome, open/closed panel state (reuse the `HiddenPerk`/`TreasureHuntComplete` outside-click + Escape pattern), compose the pieces above.
6. **Styling** — `.avatar-faq-*` rules in `styles.css`, using existing palette custom properties, matching the luxury-editorial visual language (not a generic chat-widget look, per PROJECT.md).
7. **Mount** — one import + one JSX line in `HomePage` (`pages.jsx`).
8. **A11y/responsive polish** — `aria-live` status region, `aria-pressed`/keyboard nav on question buttons, focus management on open/close, `prefers-reduced-motion` handling for the *widget's own* entrance/UI animation (not the concierge video itself, which is core content and should still autoplay muted regardless — reduced-motion should suppress decorative slide-in/fade flourishes, not the feature's function), and a visible "tap to play" fallback for the rare case where `video.play()`'s promise rejects (Safari Low Power Mode, etc.).

## Sources

- Direct reads: `src/app.jsx`, `src/perks.jsx`, `src/treasure.jsx`, `src/pages.jsx` (`HomePage`), `.planning/PROJECT.md` — primary source, HIGH confidence, these are the actual conventions in this repo.
- [Turning your React Component into a Finite State Machine With useReducer — DEV Community](https://dev.to/rohanfaiyazkhan/turning-your-react-component-into-a-finite-state-machine-with-usereducer-14nm)
- [How to Use `useReducer` as a Finite State Machine — Kyle Shevlin](https://kyleshevlin.com/how-to-use-usereducer-as-a-finite-state-machine/)
- [React Video Player Component Using Hooks, TypeScript, and xState — Joel Hooks](https://joelhooks.com/react-video-player/)
- [Autoplay your videos — Mux docs](https://www.mux.com/docs/guides/web-autoplay-your-videos)
- [Video `autoplay` Attribute Considered Harmful — Mux blog](https://www.mux.com/blog/video-autoplay-considered-harmful)
- [Autoplay muted HTML5 video using React on mobile (Safari/iOS) — Medium](https://medium.com/@BoltAssaults/autoplay-muted-html5-video-safari-ios-10-in-react-673ae50ba1f5)

---
*Architecture research for: AI Video Avatar FAQ Concierge widget (LaDidiér v1.3)*
*Researched: 2026-09-04*
