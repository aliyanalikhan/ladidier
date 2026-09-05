/* ─────────────────────────────────────────────────────────────
   LADIDIÉR — AI video avatar FAQ concierge
   One persistent video element, one reducer as the single
   source of truth, mounted in-flow inside the Home page's
   Manifesto column. Every media path comes from avatarFaqData.js
   — none is restated here (FAQ-04).
   ───────────────────────────────────────────────────────────── */
import { useReducer, useRef, useEffect, useState } from 'react';
import { avatarReducer, initAvatarState } from './avatarReducer.js';
import { AVATAR_INTRO_SRC, AVATAR_IDLE_SRC, FAQ_CATEGORIES, FAQ_QUESTIONS_BY_ID, FAQ_STARTER_IDS } from './avatarFaqData.js';
import { AVATAR_MOBILENAV_EVENT } from './components.jsx';

const AVATAR_INTRO_PLAYED_KEY = "ladidier_avatar_intro_played";

/* Session-scoped on purpose (Pitfall E): "intro plays once per session"
   must survive HomePage's route-keyed unmount — which resets any React
   state — and must NOT persist across sessions the way the perk and
   treasure completion flags do. Guarded read: private mode or storage
   disabled shows the intro rather than crashing. */
function hasIntroPlayedThisSession() {
    try {
        return sessionStorage.getItem(AVATAR_INTRO_PLAYED_KEY) === "true";
    } catch (e) {
        return false;
    }
}

/* Write side, guarded identically: a storage failure (private mode,
   quota, storage disabled) must never break playback itself. Written
   on intro COMPLETION rather than on mount — navigating away three
   seconds in has not "played" the intro, and the next visit still
   gets the full thing. */
function markIntroPlayed() {
    try {
        sessionStorage.setItem(AVATAR_INTRO_PLAYED_KEY, "true");
    } catch (e) {
        // Swallowed on purpose: the flag is a UX nicety, not a contract.
    }
}

function useVideoAvatar() {
    // Lazy init: the session flag is read once at mount, not per render.
    const [state, dispatch] = useReducer(avatarReducer, hasIntroPlayedThisSession(), initAvatarState);
    const videoRef = useRef(null);
    const [blocked, setBlocked] = useState(false);

    const videoSrc =
        state.phase === 'intro' ? AVATAR_INTRO_SRC :
            state.phase === 'idle' ? AVATAR_IDLE_SRC :
                FAQ_QUESTIONS_BY_ID[state.questionId].videoSrc;

    // Unmuted only while an answer plays; the idle loop is the native
    // loop attribute, so AVATAR-02 needs no per-iteration dispatch.
    const muted = state.phase !== 'answering';
    const loop = state.phase === 'idle';

    // DOM-sync effect: the reducer changed the derived values, and this is
    // where they reach the one persistent element. Keyed on exactly the two
    // things that must reach the DOM — a missing dependency means a phase
    // change never reaches the video element.
    useEffect(() => {
        const v = videoRef.current;
        if (!v) return;
        v.muted = muted; // IDL property before play() — the JSX attribute alone is unreliable mid-life
        v.load();         // assigning src does not reliably restart playback across browsers
        const p = v.play();
        if (p) {
            p.then(() => setBlocked(false)).catch((err) => {
                if (err.name === 'AbortError') return; // expected on rapid src switch — swallow
                setBlocked(true); // real NotAllowedError (e.g. iOS Low Power Mode) — surface "Tap to play"
            });
        }
    }, [videoSrc, muted]);

    // Mobile-nav pause (Pitfall F): Nav's menu state never leaves Nav,
    // so the widget listens for the window event Nav emits instead.
    // One-directional on purpose — opening the nav pauses the video,
    // closing it does NOT auto-resume: the reducer's phase stays the
    // single source of truth for what should be playing, and a silent
    // background resume would fight it. Empty deps: bound once, reads
    // the ref (not state), so it never goes stale. Guarded detail — a
    // synthetic or malformed event must not throw.
    useEffect(() => {
        const onMobileNav = (e) => {
            if (e.detail?.open === true) videoRef.current?.pause();
        };
        window.addEventListener(AVATAR_MOBILENAV_EVENT, onMobileNav);
        return () => window.removeEventListener(AVATAR_MOBILENAV_EVENT, onMobileNav);
    }, []);

    return {
        phase: state.phase,
        activeQuestionId: state.questionId,
        videoRef, videoSrc, muted, loop, blocked,
        // Write the flag BEFORE dispatching, on completion (never on
        // mount): an interrupted intro replays on the next visit,
        // because it never actually finished (Pitfall E's other half).
        onIntroEnded: () => {
            markIntroPlayed();
            dispatch({ type: 'INTRO_ENDED' });
        },
        // The generation current when the event fires — the reducer's
        // equality guard compares against this (AVATAR-05, Pitfall C).
        onAnswerEnded: () => dispatch({ type: 'ANSWER_ENDED', generation: state.generation }),
        askQuestion: (questionId) => dispatch({ type: 'ASK', questionId }),
        retryPlay: () => {
            const v = videoRef.current;
            if (!v) return;
            const p = v.play(); // synchronous inside the click — preserves user-gesture attribution
            if (p) p.then(() => setBlocked(false)).catch(() => { });
        },
    };
}

/* The one persistent video element (Pattern 3): transitions swap
   src/muted/loop in place. No React key — a remount per clip drops
   buffered data, flashes, and re-runs autoplay policy checks. The
   muted + playsInline + autoPlay triad is set together, never
   individually: iOS Safari blocks or degrades inline autoplay
   without all three (Pitfall B). */
function AvatarVideo({ videoRef, videoSrc, muted, loop, phase, onIntroEnded, onAnswerEnded }) {
    return (
        <video
            ref={videoRef}
            src={videoSrc}
            muted={muted}
            loop={loop}
            playsInline
            autoPlay
            preload="auto"
            className="avatar-faq-video"
            onEnded={() => {
                if (phase === 'intro') onIntroEnded();
                else if (phase === 'answering') onAnswerEnded();
            }}
        />
    );
}

/* One lettered pill: a circular badge holding the positional letter
   (pure visual indexing, aria-hidden so a screen reader does not
   announce a stray letter — this is the one aria attribute in scope,
   not the Phase 12 a11y pass) plus the question label. Shared by every
   view FAQOverlay renders — starters and per-category — so there is
   only ever one pill implementation. */
function FAQPill({ letter, label, onClick }) {
    return (
        <button type="button" className="avatar-faq-pill" onClick={onClick}>
            <span className="avatar-faq-pill-badge" aria-hidden="true">{letter}</span>
            <span className="avatar-faq-pill-label">{label}</span>
        </button>
    );
}

/* The overlay chrome that floats on the video (FAQ-03's category-first
   navigation, progressive-disclosure shape): on open it shows only the
   small FAQ_STARTER_IDS set as lettered pills, never all 15 questions
   and never the 4 category headings at once. "More topics" reveals the
   4 one-word keyword chips; picking one reveals that category's
   questions as lettered pills; "Back" walks the path in reverse. Every
   one of the 15 questions stays reachable, just never shown alongside
   all the others. Every string is read from the data module at render
   time (FAQ-04): no question text, category label, keyword, or media
   path is copied into this file. activeQuestionId is threaded through
   because the hook already returns it and Phase 11's selected/Playing
   state (FAQ-02) will consume it — but it deliberately drives NO visual
   difference this phase, and no local copy of the active question
   lives here: the reducer stays the single source of truth. */
function FAQOverlay({ categories, starterIds, questionsById, activeQuestionId, onSelect }) {
    // `view` is which subset of questions is on screen ('starters',
    // 'topics', or a category id) — deliberately component state, NOT
    // reducer state: it is presentation, not playback, and must not
    // reach avatarReducer.js.
    const [view, setView] = useState('starters');

    // Selecting a question does NOT reset `view` — the visitor stays
    // where they were so they can pick a second question from the same
    // place while the answer plays. This is deliberate.

    if (view === 'topics') {
        return (
            <div className="avatar-faq-overlay">
                <div className="avatar-faq-chips">
                    {categories.map((category) => (
                        <button
                            key={category.id}
                            type="button"
                            className="avatar-faq-chip"
                            onClick={() => setView(category.id)}
                        >
                            {category.keyword}
                        </button>
                    ))}
                </div>
                <button type="button" className="avatar-faq-more-btn" onClick={() => setView('starters')}>
                    Back
                </button>
            </div>
        );
    }

    const activeCategory = view === 'starters' ? null : categories.find((category) => category.id === view);

    if (activeCategory) {
        return (
            <div className="avatar-faq-overlay">
                {activeCategory.questions.map((question, index) => (
                    <FAQPill
                        key={question.id}
                        letter={String.fromCharCode(65 + index)}
                        label={question.question}
                        onClick={() => onSelect(question.id)}
                    />
                ))}
                <button type="button" className="avatar-faq-more-btn" onClick={() => setView('topics')}>
                    Back
                </button>
            </div>
        );
    }

    // 'starters' branch — also the fallback when `view` names a
    // category id that no longer resolves, so a stale view value
    // renders a usable panel instead of an empty overlay.
    return (
        <div className="avatar-faq-overlay">
            {starterIds.map((id, index) => {
                const question = questionsById[id];
                return (
                    <FAQPill
                        key={id}
                        letter={String.fromCharCode(65 + index)}
                        label={question.question}
                        onClick={() => onSelect(question.id)}
                    />
                );
            })}
            <button type="button" className="avatar-faq-more-btn" onClick={() => setView('topics')}>
                More topics
            </button>
        </div>
    );
}

/* The engine + chrome, relocated here from AIAvatarFAQ (quick task
   260905-t26) so it can be mounted conditionally. NOT exported: this
   is the piece that must not exist in the tree until first
   scroll-visibility. Byte-identical to the old AIAvatarFAQ body
   otherwise — same hook call, same three children, same props. */
function AvatarWidgetContent() {
    const {
        phase, activeQuestionId, videoRef, videoSrc, muted, loop, blocked,
        onIntroEnded, onAnswerEnded, askQuestion, retryPlay,
    } = useVideoAvatar();

    return (
        <>
            <AvatarVideo
                videoRef={videoRef}
                videoSrc={videoSrc}
                muted={muted}
                loop={loop}
                phase={phase}
                onIntroEnded={onIntroEnded}
                onAnswerEnded={onAnswerEnded}
            />
            {blocked && (
                <button type="button" className="avatar-faq-tap-to-play" onClick={retryPlay}>
                    Tap to play
                </button>
            )}
            <FAQOverlay
                categories={FAQ_CATEGORIES}
                starterIds={FAQ_STARTER_IDS}
                questionsById={FAQ_QUESTIONS_BY_ID}
                activeQuestionId={activeQuestionId}
                onSelect={askQuestion}
            />
        </>
    );
}

/* The widget now mounts as an ordinary in-flow child of the Home
   page's Manifesto left column (quick task 260905-t26), not as a
   fixed-position overlay — so it no longer needs to be detached from
   the React tree to escape an ancestor's positioning context. Quick
   task 260905-rw7 redesigned the chrome inside it into the
   overlay-on-video look with progressive disclosure (FAQOverlay),
   replacing the interim full plain question list. Phase 11 still owns
   the launcher and any remaining bespoke chrome.

   Mount-gated on first scroll-visibility (quick task 260905-t26): the
   engine lives in AvatarWidgetContent above, split out specifically so
   it does not mount — and therefore useVideoAvatar's useReducer does
   not lazy-init into the `intro` phase — until this wrapper has
   actually seen the widget cross into view. Gating anywhere else
   (inside the hook, or just hiding the rendered content) would still
   start the reducer/video engine on page mount; only NOT mounting the
   child achieves "nothing plays until scrolled to". */
function AIAvatarFAQ() {
    const widgetRef = useRef(null);
    const [hasBeenVisible, setHasBeenVisible] = useState(false);

    // Empty deps: this effect binds once. Nothing inside it reads
    // changing state, so there is no stale-closure risk, and the
    // observer disconnects itself after its one fire — it never needs
    // to re-run. "Has been visible" is a one-way latch: once true it
    // never resets, and the observer never re-arms. "Plays once per
    // session" is already owned by hasIntroPlayedThisSession /
    // markIntroPlayed above; this observer's only job is "has the
    // visitor arrived at this section yet" — re-firing on every
    // scroll-in/scroll-out would fight the reducer for control of
    // playback, which is explicitly NOT what this gate does: scrolling
    // the section out of view and back does not pause or restart
    // anything, only the first transition into view matters, exactly
    // like "on mount" used to mean before this change.
    useEffect(() => {
        const el = widgetRef.current;
        if (!el) return;
        // No observer API support: degrade to today's play-on-mount
        // behaviour rather than silently never playing.
        if (typeof IntersectionObserver === 'undefined') {
            setHasBeenVisible(true);
            return;
        }
        const observer = new IntersectionObserver((entries) => {
            // The observer fires an initial callback on observe() with
            // the current intersection state — a visitor who lands
            // already scrolled to this section (restored scroll
            // position, deep link) gets the intro immediately rather
            // than having to scroll away and back.
            if (entries[0]?.isIntersecting) {
                setHasBeenVisible(true);
                observer.disconnect();
            }
        }, { threshold: 0.3 });
        observer.observe(el);
        return () => observer.disconnect(); // idempotent cleanup — safe if already disconnected above
    }, []);

    // Deliberately an ordinary in-flow child of the Manifesto column now
    // — it must NOT be re-detached from the tree to somewhere else in
    // the document. The old positioning reason for moving this element's
    // DOM location no longer applies once the widget is not fixed. This
    // div always renders, even empty, so the CSS-defined box reserves
    // its slot in the column from first paint — the video appearing
    // later causes no layout shift.
    return (
        <div className="avatar-faq-widget" ref={widgetRef}>
            {hasBeenVisible && <AvatarWidgetContent />}
        </div>
    );
}

export { AIAvatarFAQ };
