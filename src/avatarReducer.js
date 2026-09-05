/* ─────────────────────────────────────────────────────────────
   LADIDIÉR — Avatar FAQ video state machine
   Pure transition logic, deliberately kept outside avatarFaq.jsx
   so it is testable with no DOM and no JSX transform (FAQ-04:
   this module holds transitions, avatarFaqData.js holds content).
   No imports — zero React dependency.
   ───────────────────────────────────────────────────────────── */

export const AVATAR_PHASES = Object.freeze({
    INTRO: 'intro',
    IDLE: 'idle',
    ANSWERING: 'answering',
});

/* Lazy initialiser for useReducer: the session flag is read once
   at mount. Coerces truthily, so an undefined from a failed
   storage read lands on the intro branch, never a broken state. */
export function initAvatarState(introAlreadyPlayed) {
    return introAlreadyPlayed
        ? { phase: AVATAR_PHASES.IDLE, questionId: null, generation: 0 }
        : { phase: AVATAR_PHASES.INTRO, questionId: null, generation: 0 };
}

export function avatarReducer(state, action) {
    switch (action.type) {
        case 'INTRO_ENDED':
            return { phase: AVATAR_PHASES.IDLE, questionId: null, generation: state.generation };

        case 'ASK':
            // Legal from idle OR answering — this single rule is what makes
            // AVATAR-05's "cut immediately, never queue" work, so it lives
            // here and nowhere else.
            return { phase: AVATAR_PHASES.ANSWERING, questionId: action.questionId, generation: state.generation + 1 };

        case 'ANSWER_ENDED':
            // Strict-equality guard against a stale onEnded firing after the
            // user already switched questions (Pitfall C). A null or absent
            // action.generation can never equal a real counter, so it falls
            // into this no-op branch rather than accidentally matching.
            if (action.generation !== state.generation) return state;
            return { phase: AVATAR_PHASES.IDLE, questionId: null, generation: state.generation };

        default:
            // Unknown type, no type key — return the identical reference so
            // React skips the re-render entirely.
            return state;
    }
}
