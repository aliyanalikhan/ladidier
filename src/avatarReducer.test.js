/* ─────────────────────────────────────────────────────────────
   LADIDIÉR — Avatar FAQ reducer tests (node:test, DOM-free)
   The reducer is pure: every case below runs with no DOM, no
   React, no JSX — which is exactly why it lives outside the
   widget file (RESEARCH build order, FAQ-04 separation).
   ───────────────────────────────────────────────────────────── */
import test from 'node:test';
import assert from 'node:assert/strict';
import { avatarReducer, initAvatarState, AVATAR_PHASES } from './avatarReducer.js';

/* Helpers: the two legal starting points. */
const fromIntro = () => initAvatarState(false);
const fromIdle = () => initAvatarState(true);

/* ── AVATAR_PHASES ── */

test('AVATAR_PHASES enumerates exactly intro, idle, answering', () => {
    const values = Object.values(AVATAR_PHASES);
    assert.equal(values.length, 3);
    assert.ok(values.includes('intro'));
    assert.ok(values.includes('idle'));
    assert.ok(values.includes('answering'));
});

/* ── Initial state ── */

test('initAvatarState(false) starts on the intro phase', () => {
    assert.deepEqual(initAvatarState(false), { phase: 'intro', questionId: null, generation: 0 });
});

test('initAvatarState(true) skips straight to idle — the session flag is honored (AVATAR-06)', () => {
    assert.deepEqual(initAvatarState(true), { phase: 'idle', questionId: null, generation: 0 });
});

/* ── INTRO_ENDED ── */

test('INTRO_ENDED from intro yields idle, questionId null, generation unchanged (AVATAR-02)', () => {
    assert.deepEqual(avatarReducer(fromIntro(), { type: 'INTRO_ENDED' }), {
        phase: 'idle',
        questionId: null,
        generation: 0,
    });
});

/* ── ASK ── */

test('ASK from idle yields answering with the new questionId and generation +1 (AVATAR-03)', () => {
    assert.deepEqual(avatarReducer(fromIdle(), { type: 'ASK', questionId: 'q3' }), {
        phase: 'answering',
        questionId: 'q3',
        generation: 1,
    });
});

test('ASK from answering cuts immediately — new questionId, generation +1, never idle (AVATAR-05)', () => {
    const first = avatarReducer(fromIdle(), { type: 'ASK', questionId: 'q1' });
    const second = avatarReducer(first, { type: 'ASK', questionId: 'q7' });
    assert.equal(first.phase, 'answering');
    assert.equal(second.phase, 'answering'); // no queueing, no intermediate idle
    assert.notEqual(second.phase, 'idle');
    assert.equal(second.questionId, 'q7');
    assert.equal(second.generation, 2);
});

test('three consecutive ASKs raise generation by exactly 3 and keep the last questionId', () => {
    let state = fromIdle();
    state = avatarReducer(state, { type: 'ASK', questionId: 'q1' });
    state = avatarReducer(state, { type: 'ASK', questionId: 'q2' });
    state = avatarReducer(state, { type: 'ASK', questionId: 'q3' });
    assert.equal(state.generation, 3);
    assert.equal(state.questionId, 'q3');
    assert.equal(state.phase, 'answering');
});

/* ── ANSWER_ENDED ── */

test('ANSWER_ENDED carrying the current generation returns to idle (AVATAR-04)', () => {
    let state = avatarReducer(fromIdle(), { type: 'ASK', questionId: 'q5' });
    state = avatarReducer(state, { type: 'ANSWER_ENDED', generation: 1 });
    assert.deepEqual(state, { phase: 'idle', questionId: null, generation: 1 });
});

test('ANSWER_ENDED one generation stale returns the referentially identical state (AVATAR-05, Pitfall C)', () => {
    let state = fromIdle();
    state = avatarReducer(state, { type: 'ASK', questionId: 'q1' });
    state = avatarReducer(state, { type: 'ASK', questionId: 'q2' }); // generation 2 — q1 interrupted
    const next = avatarReducer(state, { type: 'ANSWER_ENDED', generation: 1 }); // q1's late ended
    assert.equal(next, state); // same object reference — React skips the re-render
    assert.equal(next.phase, 'answering');
    assert.equal(next.questionId, 'q2');
});

test('ANSWER_ENDED one generation ahead also returns the referentially identical state — the guard is equality, not ordering', () => {
    const state = avatarReducer(fromIdle(), { type: 'ASK', questionId: 'q1' }); // generation 1
    assert.equal(avatarReducer(state, { type: 'ANSWER_ENDED', generation: 2 }), state);
});

test('adjacency boundary: generation exactly equal is honored; off by one in either direction is a no-op', () => {
    const answering = avatarReducer(fromIdle(), { type: 'ASK', questionId: 'q4' }); // generation 1
    const honored = avatarReducer(answering, { type: 'ANSWER_ENDED', generation: 1 });
    assert.equal(honored.phase, 'idle');
    assert.equal(avatarReducer(answering, { type: 'ANSWER_ENDED', generation: 0 }), answering);
    assert.equal(avatarReducer(answering, { type: 'ANSWER_ENDED', generation: 2 }), answering);
});

test('ANSWER_ENDED with generation null or absent returns the referentially identical state without throwing', () => {
    const answering = avatarReducer(fromIdle(), { type: 'ASK', questionId: 'q9' });
    assert.equal(avatarReducer(answering, { type: 'ANSWER_ENDED', generation: null }), answering);
    assert.equal(avatarReducer(answering, { type: 'ANSWER_ENDED' }), answering);
});

/* ── Degenerate actions ── */

test('an unknown action type and an action with no type key each return the referentially identical state', () => {
    const state = fromIdle();
    assert.equal(avatarReducer(state, { type: 'SOMETHING_ELSE' }), state);
    assert.equal(avatarReducer(state, {}), state);
});

/* ── The exact regression AVATAR-05 exists to prevent ── */

test('realistic interrupt: ASK q1, ASK q2 before q1 ends, then the late ANSWER_ENDED for q1 — still answering q2', () => {
    let state = fromIdle();
    state = avatarReducer(state, { type: 'ASK', questionId: 'q1' }); // generation 1
    state = avatarReducer(state, { type: 'ASK', questionId: 'q2' }); // generation 2 — q1 cut off
    state = avatarReducer(state, { type: 'ANSWER_ENDED', generation: 1 }); // q1's ended fires late
    assert.equal(state.phase, 'answering');
    assert.equal(state.questionId, 'q2');
    assert.equal(state.generation, 2);
});
