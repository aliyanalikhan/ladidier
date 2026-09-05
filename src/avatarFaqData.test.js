/* Tests for src/avatarFaqData.js — run with `node --test src/avatarFaqData.test.js`.
   Uses only the Node built-in runner (node:test + node:assert/strict); no new
   dependencies. package.json declares "type": "module", so both files are ESM. */

import test from "node:test";
import assert from "node:assert/strict";

import {
    AVATAR_ASSET_BASE,
    AVATAR_INTRO_SRC,
    AVATAR_IDLE_SRC,
    FAQ_CATEGORIES,
    FAQ_QUESTIONS_BY_ID,
    FAQ_STARTER_IDS,
} from "./avatarFaqData.js";

const FLAT = FAQ_CATEGORIES.flatMap((category) => category.questions);

test("FAQ_CATEGORIES has exactly 4 categories in the locked D-01 order", () => {
    assert.equal(FAQ_CATEGORIES.length, 4);
    assert.deepEqual(
        FAQ_CATEGORIES.map((category) => category.id),
        ["about", "shipping", "orders", "payments"]
    );
});

test("the four label values are the D-01 category labels exactly, in order", () => {
    assert.deepEqual(
        FAQ_CATEGORIES.map((category) => category.label),
        ["About LaDidiér", "Shipping & Delivery", "Orders, Returns & Exchanges", "Payments & Customer Support"]
    );
});

test("flattening FAQ_CATEGORIES yields exactly 15 questions, q1..q15 in order", () => {
    assert.equal(FLAT.length, 15);
    assert.deepEqual(
        FLAT.map((question) => question.id),
        Array.from({ length: 15 }, (_, index) => `q${index + 1}`)
    );
});

test("per-category question counts are 5, 5, 3, 2 in that order", () => {
    assert.deepEqual(
        FAQ_CATEGORIES.map((category) => category.questions.length),
        [5, 5, 3, 2]
    );
});

test("every question maps 1:1 and sequentially onto Q1..Q15 clips", () => {
    FLAT.forEach((question, index) => {
        const position = index + 1;
        assert.equal(question.videoSrc, `${AVATAR_ASSET_BASE}/Q${position}.mp4`);
    });
});

test("intro and idle sources are under AVATAR_ASSET_BASE and distinct from every question clip", () => {
    assert.ok(AVATAR_INTRO_SRC.startsWith(`${AVATAR_ASSET_BASE}/`));
    assert.ok(AVATAR_IDLE_SRC.startsWith(`${AVATAR_ASSET_BASE}/`));
    assert.notEqual(AVATAR_INTRO_SRC, AVATAR_IDLE_SRC);
    for (const question of FLAT) {
        assert.notEqual(AVATAR_INTRO_SRC, question.videoSrc);
        assert.notEqual(AVATAR_IDLE_SRC, question.videoSrc);
    }
});

test("FAQ_QUESTIONS_BY_ID has exactly 15 keys", () => {
    assert.equal(Object.keys(FAQ_QUESTIONS_BY_ID).length, 15);
});

test("FAQ_QUESTIONS_BY_ID.q10 is object-identical to the tenth question reached through FAQ_CATEGORIES", () => {
    assert.equal(FAQ_QUESTIONS_BY_ID.q10, FLAT[9]);
});

test("re-importing the module returns the same FAQ_QUESTIONS_BY_ID object identity", async () => {
    const dynamic = await import("./avatarFaqData.js");
    assert.equal(dynamic.FAQ_QUESTIONS_BY_ID, FAQ_QUESTIONS_BY_ID);
    assert.equal(dynamic.FAQ_CATEGORIES, FAQ_CATEGORIES);
});

test("FAQ_CATEGORIES and FAQ_QUESTIONS_BY_ID are both frozen", () => {
    assert.equal(Object.isFrozen(FAQ_CATEGORIES), true);
    assert.equal(Object.isFrozen(FAQ_QUESTIONS_BY_ID), true);
});

test("the q10 question string is stored untruncated — longer than 60 characters", () => {
    assert.ok(FAQ_QUESTIONS_BY_ID.q10.question.length > 60);
});

test("FAQ_STARTER_IDS holds 3 to 4 ids", () => {
    assert.ok(FAQ_STARTER_IDS.length >= 3 && FAQ_STARTER_IDS.length <= 4);
});

test("every FAQ_STARTER_IDS id resolves in FAQ_QUESTIONS_BY_ID", () => {
    for (const id of FAQ_STARTER_IDS) {
        assert.ok(FAQ_QUESTIONS_BY_ID[id], `expected FAQ_QUESTIONS_BY_ID.${id} to exist`);
    }
});

test("the FAQ_STARTER_IDS ids map onto four distinct categories", () => {
    const idToCategory = new Map();
    for (const category of FAQ_CATEGORIES) {
        for (const question of category.questions) {
            idToCategory.set(question.id, category.id);
        }
    }
    const categoriesHit = new Set(FAQ_STARTER_IDS.map((id) => idToCategory.get(id)));
    assert.equal(categoriesHit.size, 4);
});

test("all 15 question strings are byte-identical to the D-01 text", () => {
    const D01_QUESTIONS = [
        "What is LaDidiér?",
        "What types of products do you sell?",
        "How do I know what size to order?",
        "What should I do if an item I want is sold out?",
        "Will you restock an item that is currently unavailable?",
        "Where does LaDidiér ship?",
        "How much does shipping cost?",
        "How long will it take for my order to arrive?",
        "How can I track my order?",
        "What should I do if my package says delivered, but I haven't received it?",
        "Can I change or cancel my order after I place it?",
        "What is your return and exchange policy?",
        "What should I do if I receive the wrong item or my item arrives damaged?",
        "What payment methods do you accept?",
        "How can I contact LaDidiér if I need additional help?",
    ];
    assert.deepEqual(
        FLAT.map((question) => question.question),
        D01_QUESTIONS
    );
});
