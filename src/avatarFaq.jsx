/* ─────────────────────────────────────────────────────────────
   LADIDIÉR — AI video avatar FAQ concierge
   One persistent video element, one reducer as the single
   source of truth, portalled to document.body. Every media path
   comes from avatarFaqData.js — none is restated here (FAQ-04).
   ───────────────────────────────────────────────────────────── */
import { useReducer, useRef, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { avatarReducer, initAvatarState } from './avatarReducer.js';
import { AVATAR_INTRO_SRC, AVATAR_IDLE_SRC, FAQ_QUESTIONS_BY_ID } from './avatarFaqData.js';

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

    return {
        phase: state.phase,
        activeQuestionId: state.questionId,
        videoRef, videoSrc, muted, loop, blocked,
        onIntroEnded: () => dispatch({ type: 'INTRO_ENDED' }),
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

/* Tracer widget (D-04 interim UI): exactly one question button in
   this plan — 10-03 widens the same proven slice to all 15. */
function AIAvatarFAQ() {
    const {
        phase, videoRef, videoSrc, muted, loop, blocked,
        onIntroEnded, onAnswerEnded, askQuestion, retryPlay,
    } = useVideoAvatar();

    const q1 = FAQ_QUESTIONS_BY_ID.q1;

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
            <div className="avatar-faq-questions">
                <button
                    type="button"
                    className="avatar-faq-question-btn"
                    onClick={() => askQuestion(q1.id)}
                >
                    {q1.question}
                </button>
            </div>
        </div>,
        document.body
    );
}

export { AIAvatarFAQ };
