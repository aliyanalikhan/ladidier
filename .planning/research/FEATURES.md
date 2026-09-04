# Feature Research

**Domain:** Video FAQ / "video concierge" widgets on premium e-commerce and luxury brand sites
**Researched:** 2026-09-04
**Confidence:** MEDIUM

Note on evidence base: this is a young, fast-moving product category with no single dominant published pattern library. Findings synthesize (a) general floating-widget/chat UX research (Nielsen Norman Group and industry UX guides — HIGH confidence, decades of chat-widget precedent), (b) mobile viewport/safe-area and video-autoplay platform behavior (MDN, Chromium docs, WebKit policy — HIGH confidence, these are browser specs, not opinion), and (c) inference from adjacent categories — AI avatar video platforms (Tavus, HeyGen, Synthesia, Anam), luxury digital concierge experiences, and accordion/tabs FAQ research — because no widely-documented "15-question pre-recorded video avatar popup" reference implementation exists publicly yet. Treat feature-specific claims below as MEDIUM confidence directional guidance, not settled convention; treat the browser/platform-constraint claims (autoplay, safe-area, viewport units) as HIGH confidence engineering facts.

## Feature Landscape

### Table Stakes (Users Expect These)

Features users assume exist on any floating video/chat widget. Missing these makes the widget feel broken or amateurish, regardless of how good the video content is.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Bottom-right fixed launcher position | Years of chat-widget convention trained users to look bottom-right for help; NN/g and industry UX research confirm this is the expected default and other placements get ignored or feel broken | LOW | LaDidiér's brief already locks this in. Must check for collision with any existing bottom-right/bottom-fixed elements (footer CTAs, cookie banners, subscribe toasts) before finalizing z-index and offset |
| Persistent visible close/minimize control | Users need a guaranteed, obvious way to dismiss an auto-opened overlay or it reads as an intrusive popup/ad rather than a helpful feature — this is doubly true here because the widget opens itself on load without being invited | LOW | Must be reachable and tappable (≥44px touch target) even while a video is actively playing; never let a persistent close button be the widget's only exit if it also needs a "minimize back to launcher bubble" state |
| Widget stays a small floating panel, never commandeers the full page | The brief explicitly rejects hero-section/takeover treatment; users expect a "concierge" widget to be a corner companion to browsing, not a wall between them and the site | LOW–MEDIUM | On mobile this is the single hardest constraint to hold — see Anti-Features and Complexity notes on viewport height |
| Muted, silent autoplay for intro/idle loop | Chrome and Safari only allow autoplay-without-user-gesture when the video is muted or has no audio track; unmuted autoplay on load will simply be blocked/silently fail on most browsers, especially mobile Safari | LOW | Confirmed browser platform behavior, not a design choice — HIGH confidence per MDN/Chromium/WebKit autoplay policy docs. `playsinline` is also required on iOS so the intro doesn't force fullscreen |
| Clear "answer just played" resolution — video doesn't loop the answer or leave the UI ambiguous | Once a FAQ answer video ends, the widget must visibly return to idle (or an obvious "ask another question" state); an answer video that just freezes on its last frame with no state signal feels like the widget crashed | LOW | Ties directly to the project's own INTRO→IDLE→ANSWERING→IDLE state machine requirement — the only new obligation here is a *visible* UI signal for each state transition, not just an internal one |
| Question list reachable in ≤2 taps from the launcher | With 15 questions across 4 categories, users expect a shallow path — category → question — with no additional gating screens; deep or hidden category navigation increases abandonment on a support-style micro-interaction | LOW–MEDIUM | Maps to an accordion (categories as collapsible groups, questions nested inside) — confirmed as the standard mobile-friendly pattern for FAQ-style content over horizontal tabs, which force scrolling on mobile |
| Keyboard and screen-reader operability | Already a stated project requirement (ARIA, focus states, reduced motion); also genuinely table stakes for any interactive overlay component, luxury or not — an inaccessible widget is a compliance and brand-reputation risk equally as much as a UX one | MEDIUM | Reduced-motion in particular needs a concrete fallback: users with `prefers-reduced-motion` should probably get the widget opened but paused/poster-frame rather than autoplaying video |
| Fast perceived response when a question is clicked | Users expect near-instant playback start on tap — chat-widget research shows response latency is one of the top drivers of frustration even when the "response" is scripted, not generated | LOW–MEDIUM | Since these are pre-recorded files (not generated on demand), the achievable bar is high — the risk is video *load* latency (cold buffering of a large file), not computation latency. See Complexity section |

### Differentiators (Competitive Advantage)

Features that separate a "premium video concierge" from a generic embeddable chatbot widget. These should track the project's stated goal: feel like an in-boutique concierge, not SaaS support tooling.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| Bespoke avatar framing/chrome that reads as "editorial video," not "webcam bubble" | Generic chatbot avatars are small circular headshots in speech-bubble UI; a premium video concierge instead frames the avatar like a magazine video insert — soft rounded card, generous padding, brand typography for question labels, no bright "online now" green dot or default bot iconography | LOW–MEDIUM | This is almost entirely a CSS/art-direction problem, not a technical one — highest ROI differentiator for the effort involved, and it directly serves the project's core value ("every page must feel like opening a luxury magazine") |
| Named/personified status language instead of system-speak | Chat widgets default to generic states like "typing…" or "bot is responding"; a concierge framing (e.g. a status line reading "Playing your answer" rather than "Loading," or a subtle attribution treating the avatar as a persona) reinforces the "member of staff" feel the brief is going for | LOW | Purely copy/microcopy — cheap to get right, easy to get wrong (overly cute copy breaks the luxury tone as fast as robotic copy does) |
| Smooth crossfade/cut on question-switch mid-answer rather than a jarring stop-and-reload | The brief specifies "switching questions mid-answer cuts immediately to the new answer" — a raw hard cut is fine functionally, but a very short (150–250ms) opacity crossfade between video elements reads as considered craftsmanship rather than an abrupt interruption | MEDIUM | Requires two `<video>` elements (or a buffer/swap technique) so the next clip can start decoding before the cut — see Complexity notes on preloading |
| Idle-loop micro-variation (subtle breathing/blink loop rather than an obviously repeating GIF-like loop) | A tight, obviously-looping idle video reads as cheap; if the source footage supports it, a longer or seamlessly-cut idle loop (or an idle loop that occasionally has slight variation) reads as "alive," matching the concierge illusion | MEDIUM–HIGH | Depends entirely on the pre-recorded asset quality already in hand (`Idle.mp4`) — this is a content decision more than an engineering one; if the existing idle clip loops obviously, flag it now rather than after launch, since re-shooting isn't in scope for this milestone |
| Progressive reveal of categories rather than dumping all 15 questions at once | Presenting 4 category headers first (About, Shipping, Orders/Returns, Payments) with questions revealed on category tap keeps the panel visually calm and editorial rather than a dense FAQ wall — reinforces "concierge conversation" pacing over "support ticket form" | LOW | This is the accordion/progressive-disclosure pattern validated in general FAQ UX research — pairs naturally with the 4-category structure already defined in the brief |
| Graceful re-engagement after first visit (e.g., collapses to a small persistent bubble after intro, rather than requiring users to manually close it every session) | Because the widget auto-opens with video already playing, a repeat visitor (or a user who scrolls straight to checkout) needs the widget to not re-interrupt on every navigation within the session; auto-collapsing to a small badge after the intro finishes (still expandable) reads as considerate rather than naggy | LOW–MEDIUM | Not in the current brief's explicit feature list — flag as a candidate differentiator/enhancement worth a product decision, since "opens automatically on load" was an explicit choice but doesn't preclude auto-minimizing itself once the intro has played |

### Anti-Features (Commonly Requested, Often Problematic)

Features that look appealing for this category but would work against the "premium, not chatbot" brief, or against the explicit non-goals already stated in PROJECT.md.

| Feature | Why Requested | Why Problematic | Alternative |
|---------|---------------|------------------|-------------|
| Free-text chat input ("just add a text box too, in case they have other questions") | Feels like it "completes" the experience and covers the long tail of questions the 15 videos don't answer | Explicitly out of scope per the brief ("No chat input, no text generation"); adding it reintroduces exactly the generic-chatbot surface area (typing indicators, empty states, off-topic query handling, moderation) the whole widget is designed to avoid, and implies AI generation the project doesn't have | If a user's question isn't among the 15, offer a single low-key fallback affordance — e.g. a "Still have questions? Contact us" link to existing support/contact channel — not a live input field |
| Full-screen/modal takeover video experience | Feels more "premium" and cinematic, and makes the video easier to see | Explicitly rejected by the user per Key Decisions ("user explicitly rejected a hero-section/homepage-takeover treatment"); a takeover also blocks browsing/shopping, which conflicts with the concierge framing (helpful companion, not a blocking gate) | Keep the popup a bounded floating panel; if users want a larger view, a single tap-to-expand toggle within the existing panel bounds is acceptable, a full-viewport modal is not |
| Auto-advancing "next question you might like" carousel after each answer | Common on video/content platforms, feels like it "increases engagement" | Turns a concierge FAQ into an autoplay content feed; risks unwanted audio/video continuing to play after the user's actual question was answered, and works against the calm, editorial pacing the brand voice calls for | End each answer cleanly at IDLE state per the existing state machine; let the user choose the next question deliberately from the category list |
| Live/real-time conversational AI avatar (à la Tavus/Anam real-time agents) upgrade path | Competing vendors in this space (Tavus, HeyGen, Anam, D-ID) offer real-time, generative conversational avatars, and it's tempting to scope this widget as "v1 of that" | Explicitly out of scope — the brief is 15 fixed pre-recorded clips, no generation, no synthesis; real-time avatars require a completely different infrastructure (low-latency video pipeline, LLM backend, per-session cost) that isn't part of this milestone or its budget/complexity profile | If there's future appetite for a smarter concierge, treat it as a distinct, separately-scoped future milestone — don't let this phase's architecture quietly grow toward it (e.g. don't build a generic "chat message" data model when a flat FAQ-to-video map is all that's needed) |
| Persistent unread-style notification badge / pulsing "1 new message" bait | Standard SaaS chat-widget trick to drive clicks | Manipulative-feeling pattern that reads as growth-hacking, at odds with a luxury brand voice; also factually false here (there's no new message, it's a static FAQ set) | If re-engagement is desired, use a subtle, honest affordance (e.g., a softly animated avatar thumbnail) rather than a fake unread-count badge |
| Aggressive "typing…"/thinking spinner mimicking generative chat latency | Copying visible SaaS chatbot patterns because that's the mental model most component libraries assume | These are pre-recorded, locally-available video files — simulating "thinking" delay when the actual constraint is just video buffering misrepresents the product and adds fake latency the user doesn't need to wait through | Show only real, honest state: a brief buffering indicator only if a network fetch is genuinely still in flight, otherwise cut straight to ANSWERING |

## Feature Dependencies

```
Muted autoplay intro/idle (table stakes)
    └──requires──> playsinline + muted attributes set before any programmatic .play() call
                       └──requires──> user-gesture-gated unmute path for FAQ answer audio

Category accordion navigation (table stakes)
    └──requires──> FAQ-to-video data structure decoupled from UI (already specified in brief)
                       └──enables──> Progressive category reveal (differentiator)

Smooth crossfade on question-switch (differentiator)
    └──requires──> Dual <video> element / preload-and-swap technique
                       └──enhances──> Fast perceived response on click (table stakes)

Bespoke avatar chrome/status language (differentiator)
    └──conflicts with──> Any off-the-shelf chat-widget library's default DOM/CSS (most ship strong opinionated chatbot visual defaults)

Auto-collapse-after-intro (differentiator)
    └──enhances──> Persistent close/minimize control (table stakes) — same underlying open/closed state machine, different trigger
```

### Dependency Notes

- **Muted autoplay requires `playsinline` + `muted` set before any `.play()` call:** this is a hard browser-enforced order-of-operations, not a style preference — Safari/Chrome silently reject the play promise otherwise. Get this right in the earliest video-controller work, since it blocks the entire INTRO state.
- **Category accordion requires the FAQ-to-video mapping be a separate data structure:** the brief already specifies this decoupling; it also happens to be exactly what enables the progressive-disclosure differentiator later without a rewrite.
- **Crossfade requires a dual-video-element (or equivalent buffering) technique:** a naive single `<video src>` swap will show a flash of black/poster frame on every question switch, which reads as glitchy rather than a "cut." If a true crossfade differentiator is wanted, this needs to be decided at architecture time (VideoController component), not retrofitted.
- **Bespoke chrome conflicts with off-the-shelf chat widget libraries:** this is a build-vs-buy signal — any temptation to pull in a pre-built "chatbot widget" npm package (Intercom-style, Tidio-style, etc.) should be resisted, since their default visual language is exactly what this project needs to avoid, and reskinning them is typically more work than a custom component given the existing plain-CSS design system.

## MVP Definition

### Launch With (v1)

Minimum viable product — matches the milestone's own stated target features exactly; nothing here should be cut further.

- [ ] Bottom-right floating widget, homepage only, auto-opens on load with intro autoplaying muted — why essential: this is the entire premise of the milestone per PROJECT.md
- [ ] INTRO → IDLE (loop) → ANSWERING → IDLE state machine, with immediate cut on question-switch — why essential: explicitly specified behavior, forms the technical backbone
- [ ] 15 FAQ questions in 4 categories, accordion-style navigation (category → question) — why essential: the entire content set already exists as fixed video assets; navigation just needs to expose it cleanly
- [ ] Muted autoplay for intro/idle, audio enabled on user-initiated answer playback — why essential: required by both the brief and by browser autoplay policy (non-negotiable technically, not just a preference)
- [ ] Visible open/close/minimize control at all times — why essential: table stakes for any auto-opening overlay; also the primary tool for not annoying users who don't want the widget
- [ ] Bespoke, on-brand visual chrome (typography, palette, spacing matching existing design system; no generic chatbot iconography) — why essential: explicitly the differentiator the whole milestone exists to deliver ("premium, not chatbot")
- [ ] Full responsiveness + accessibility (keyboard nav, focus states, ARIA, reduced-motion fallback) — why essential: already a stated non-negotiable requirement, and functionally required for a first-load auto-opening overlay not to be an accessibility violation

### Add After Validation (v1.x)

Features to add once the core widget is live and real usage data/feedback exists.

- [ ] Auto-collapse-to-bubble after intro finishes (if users report the auto-open feels intrusive on repeat visits) — trigger: user feedback or analytics showing high immediate-close rate
- [ ] Crossfade/smooth-cut polish between answer videos (if the raw hard-cut feels jarring in practice) — trigger: internal QA or user feedback after initial ship
- [ ] Session-based "don't reopen automatically" memory (e.g. skip auto-open on a user's 2nd+ visit within a session/day) — trigger: analytics showing repeat-visit annoyance rather than one-time delight
- [ ] Lightweight "still have a question?" fallback link to existing contact/support channel — trigger: evidence that visitors are hunting for something outside the 15 covered topics

### Future Consideration (v2+)

Explicitly deferred — do not let v1.3 architecture quietly grow toward these.

- [ ] Real-time/generative conversational avatar (Tavus/Anam-style) — why defer: fundamentally different tech (live video pipeline + LLM backend), separate cost model, separate milestone-scale effort; the current fixed-video architecture should not be built to "grow into" this
- [ ] Site-wide (not homepage-only) concierge — why defer: user explicitly scoped this to homepage only per Key Decisions; expanding scope is a deliberate future product decision, not a natural v1 extension
- [ ] Multi-language answer videos — why defer: would require re-recording all 15 assets per locale; no indication of current localization need
- [ ] Personalized answer selection (e.g. surfacing different default questions based on logged-in/member status) — why defer: adds a targeting/segmentation layer with no stated user demand yet, and the existing Google OAuth/membership system wasn't scoped for this milestone to touch

## Feature Prioritization Matrix

| Feature | User Value | Implementation Cost | Priority |
|---------|------------|---------------------|----------|
| Bottom-right auto-opening widget with state machine | HIGH | MEDIUM | P1 |
| Accordion category → question navigation | HIGH | LOW | P1 |
| Bespoke on-brand visual chrome (anti-chatbot styling) | HIGH | LOW–MEDIUM | P1 |
| Muted autoplay / audio-on-answer compliance | HIGH | LOW | P1 |
| Accessibility (keyboard, ARIA, reduced-motion) | HIGH | MEDIUM | P1 |
| Persistent close/minimize control | HIGH | LOW | P1 |
| Video preloading/buffering strategy for instant answer playback | MEDIUM–HIGH | MEDIUM–HIGH | P1 (technical prerequisite, not optional despite being invisible when done well) |
| Crossfade transition polish between videos | MEDIUM | MEDIUM | P2 |
| Auto-collapse after intro on repeat visits | MEDIUM | LOW–MEDIUM | P2 |
| "Still have questions?" fallback contact link | LOW–MEDIUM | LOW | P2 |
| Idle-loop micro-variation / seamless loop craft | LOW–MEDIUM | depends on existing asset | P3 |
| Real-time conversational avatar upgrade | HIGH (speculative) | VERY HIGH | P3 (explicitly deferred) |

**Priority key:**
- P1: Must have for launch
- P2: Should have, add when possible
- P3: Nice to have, future consideration

## Competitor / Adjacent-Category Feature Analysis

No direct, publicly-documented "15-question pre-recorded video avatar popup for luxury e-commerce" competitor was found — this is a genuinely uncommon, custom pattern rather than an off-the-shelf product category. The table below instead compares the two closest adjacent categories researched.

| Feature | Generic live-chat/chatbot widgets (Intercom/Tidio/Zoho-style) | Real-time AI avatar platforms (Tavus/Anam/HeyGen-style) | Our Approach |
|---------|--------------------------------------------|----------------------------------------------------------|--------------|
| Content source | Live human or generative text | Real-time generated video, LLM-driven | 15 fixed pre-recorded video files, no generation |
| Input mechanism | Free-text input, often with quick-reply buttons | Live microphone/text conversation | Click-a-question-card only, no input field |
| Visual identity | Small circular avatar, speech-bubble chrome, "online" status dot — strongly associated with generic SaaS support | Larger talking-head video frame, often full-panel | Editorial-card framing matching the existing luxury design system; no bot iconography |
| Status signaling | "Typing…", "Agent is online", unread badges | Live connecting/buffering indicators for a streaming session | Honest, minimal state language ("Playing," idle loop) — no fake latency simulation |
| Positioning | Bottom-right launcher (same convention) | Often embedded inline or full-panel, less consistently corner-docked | Bottom-right, matches the convention users already expect, but chrome must diverge visually |
| Scope of answers | Open-ended, can escalate to human | Open-ended, generative | Strictly the 15 known FAQs; explicit fallback to existing contact channel for anything else |

## Sources

- [Chatbot Widget Positioning: Best Practices for Visibility, UX, and More Leads (noform.ai)](https://noform.ai/blog/chatbot-widget-positioning/) — MEDIUM confidence, industry blog corroborated by NN/g
- [The User Experience of Customer-Service Chat: 20 Guidelines (Nielsen Norman Group)](https://www.nngroup.com/articles/chat-ux/) — HIGH confidence, established UX research authority
- [The Realities Of User Experience Design Within The Luxury Industry (Smashing Magazine)](https://www.smashingmagazine.com/2017/02/realities-ux-design-luxury-industry/) — MEDIUM confidence, general luxury UX principles (dated 2017, directionally still valid for restraint/simplicity norms)
- [The UI/UX of Luxury: Why Some Websites Just Feel Expensive (IIAD)](https://www.iiad.edu.in/the-circle/why-some-websites-just-feel-expensive/) — MEDIUM confidence, design-school editorial
- [Autoplay guide for media and Web Audio APIs (MDN Web Docs)](https://developer.mozilla.org/en-US/docs/Web/Media/Guides/Autoplay) — HIGH confidence, canonical browser spec documentation
- [Autoplay policy in Chrome (Chrome for Developers)](https://developer.chrome.com/blog/autoplay) — HIGH confidence, primary source from browser vendor
- [To Play, or Not to Play - AutoPlay Policies for Safari 14 and Chrome 64 (Bitmovin)](https://bitmovin.com/blog/autoplay-policies-safari-14-chrome-64/) — MEDIUM-HIGH confidence, video-industry vendor technical blog
- [Using safe-area-inset to build mobile-safe layouts (Polypane)](https://polypane.app/blog/using-safe-area-inset-to-build-mobile-safe-layouts/) — MEDIUM-HIGH confidence, browser-testing tool vendor, technically accurate against spec
- [Safe Area Insets for Mobile Layouts (ScreenMetricLab)](https://screenmetriclab.com/guides/safe-area-insets-mobile-layouts) — MEDIUM confidence
- [Mobile Pop-Up Design: Best Practices for Engagement (Digioh)](https://www.digioh.com/blog/mobile-design-best-practices-pop-ups) — MEDIUM confidence, marketing-tool vendor blog (viewport-height percentage guidance treated as directional, not exact)
- [Accordion vs Tabs vs Dropdowns: When to Use Each (Poper)](https://www.poper.ai/blog/accordion-vs-tabs/) — MEDIUM confidence
- [Tabs vs Accordions: When to Use Each in UX Design (Onething Design)](https://www.onething.design/post/tabs-vs-accordions) — MEDIUM confidence, corroborates the same accordion-for-FAQ recommendation independently
- [FAQ Accordion Design: The Complete Guide (FAQPage.com)](https://www.faqpage.com/faq-accordion-design) — MEDIUM confidence, niche/specialized source but directly on-topic
- [Skeleton loading screen design — How to improve perceived performance (LogRocket)](https://blog.logrocket.com/ux-design/skeleton-loading-screen-design/) — MEDIUM-HIGH confidence, includes the explicit caveat that skeleton screens are not recommended for video buffering
- [HTML5 Video Preload (Steve Souders / High Performance Web Sites)](https://www.stevesouders.com/blog/2013/04/12/html5-video-preload/) — MEDIUM confidence, dated but the underlying `preload` attribute behavior is still accurate
- [The top 3 D-ID alternatives (Tavus)](https://www.tavus.io/blog/the-top-d-id-alternatives-a07bc) and [HeyGen Alternatives 2026 (Layer3Labs)](https://www.layer3labs.io/comparisons/heygen-alternatives) — MEDIUM confidence, vendor/comparison content used only to characterize the adjacent real-time-avatar category for the anti-features/competitor table, not as a build recommendation

---
*Feature research for: AI Video Avatar FAQ Concierge widget (LaDidiér v1.3)*
*Researched: 2026-09-04*
