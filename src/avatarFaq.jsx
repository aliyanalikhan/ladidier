/* ─────────────────────────────────────────────────────────────
   LADIDIÉR — AI video avatar FAQ concierge
   One persistent video element, one reducer as the single
   source of truth, portalled to document.body. Every media path
   comes from avatarFaqData.js — none is restated here (FAQ-04).
   ───────────────────────────────────────────────────────────── */
import { useReducer, useRef, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { avatarReducer, initAvatarState } from './avatarReducer.js';
import { AVATAR_INTRO_SRC, AVATAR_IDLE_SRC, FAQ_CATEGORIES, FAQ_QUESTIONS_BY_ID } from './avatarFaqData.js';
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

/* All 15 questions under their 4 locked category headings, in the
   locked D-01 order, unconditionally — no accordion, no collapse,
   no drill-down, no search (FAQ-03's category-first navigation is
   Phase 11 scope; this phase's populated state is "all of them,
   always"). Every string is read from the data module at render
   time (FAQ-04): no question text, category label, or media path
   is copied into this file. activeQuestionId is threaded through
   because the hook already returns it and Phase 11's selected/
   Playing state (FAQ-02) will consume it — but it deliberately
   drives NO visual difference this phase, and no local copy of
   the active question lives here: the reducer stays the single
   source of truth. */
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

/* Interim widget (D-04): the full plain question list under the
   video — Phase 11 builds the launcher and bespoke chrome on this
   same DOM position without relocating it (D-03). */
function AIAvatarFAQ() {
    const {
        phase, activeQuestionId, videoRef, videoSrc, muted, loop, blocked,
        onIntroEnded, onAnswerEnded, askQuestion, retryPlay,
    } = useVideoAvatar();

    // Portaled straight to document.body: HomePage's root carries the
    // site-wide .page-fade entry animation, which animates `transform`
    // and so establishes a containing block for any position: fixed
    // descendant for its 0.5s duration — without the portal the widget
    // computes its offsets against that ancestor's box instead of the
    // viewport, a mispositioned flash at exactly the moment the intro
    // starts. Same bug as the reader modal (quick task 260901-1lc),
    // same fix. The portal changes only where the DOM lands — React's
    // component tree and unmount behavior are unaffected, so the
    // route-keyed unmount still works.
    return createPortal(
        <div className="avatar-faq-widget">
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
            <FAQCategories
                categories={FAQ_CATEGORIES}
                activeQuestionId={activeQuestionId}
                onSelect={askQuestion}
            />
        </div>,
        document.body
    );
}

export { AIAvatarFAQ };
