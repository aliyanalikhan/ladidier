/* The FAQ-to-video data behind the AI avatar concierge: the 15 locked
   questions, their four categories, and the /assets/avatar/ clip each
   answer plays. Plain data only — no React import, no JSX — the same
   role theme.js plays. Question ids q1..q15 map 1:1 and sequentially
   onto the Q1..Q15 source clips, so array order is the only ordering
   signal. */

/* Base path for every avatar clip. These are runtime URL strings served
   by Vite's public/ static passthrough from the site root, not
   bundler-resolved imports — the directory need not exist for this
   module to load. */
export const AVATAR_ASSET_BASE = "/assets/avatar";

export const AVATAR_INTRO_SRC = `${AVATAR_ASSET_BASE}/INTRO.mp4`;
export const AVATAR_IDLE_SRC = `${AVATAR_ASSET_BASE}/Idle.mp4`;

export const FAQ_CATEGORIES = Object.freeze([
    {
        id: "about",
        label: "About LaDidiér",
        // keyword is the one-word chip form of `label`, living here so
        // no component restates a category string (FAQ-04). `label`
        // stays the long-form name Phase 11 will use for headings.
        keyword: "About",
        questions: [
            { id: "q1", question: "What is LaDidiér?", videoSrc: `${AVATAR_ASSET_BASE}/Q1.mp4` },
            { id: "q2", question: "What types of products do you sell?", videoSrc: `${AVATAR_ASSET_BASE}/Q2.mp4` },
            { id: "q3", question: "How do I know what size to order?", videoSrc: `${AVATAR_ASSET_BASE}/Q3.mp4` },
            { id: "q4", question: "What should I do if an item I want is sold out?", videoSrc: `${AVATAR_ASSET_BASE}/Q4.mp4` },
            { id: "q5", question: "Will you restock an item that is currently unavailable?", videoSrc: `${AVATAR_ASSET_BASE}/Q5.mp4` },
        ],
    },
    {
        id: "shipping",
        label: "Shipping & Delivery",
        keyword: "Shipping",
        questions: [
            { id: "q6", question: "Where does LaDidiér ship?", videoSrc: `${AVATAR_ASSET_BASE}/Q6.mp4` },
            { id: "q7", question: "How much does shipping cost?", videoSrc: `${AVATAR_ASSET_BASE}/Q7.mp4` },
            { id: "q8", question: "How long will it take for my order to arrive?", videoSrc: `${AVATAR_ASSET_BASE}/Q8.mp4` },
            { id: "q9", question: "How can I track my order?", videoSrc: `${AVATAR_ASSET_BASE}/Q9.mp4` },
            { id: "q10", question: "What should I do if my package says delivered, but I haven't received it?", videoSrc: `${AVATAR_ASSET_BASE}/Q10.mp4` },
        ],
    },
    {
        id: "orders",
        label: "Orders, Returns & Exchanges",
        keyword: "Returns",
        questions: [
            { id: "q11", question: "Can I change or cancel my order after I place it?", videoSrc: `${AVATAR_ASSET_BASE}/Q11.mp4` },
            { id: "q12", question: "What is your return and exchange policy?", videoSrc: `${AVATAR_ASSET_BASE}/Q12.mp4` },
            { id: "q13", question: "What should I do if I receive the wrong item or my item arrives damaged?", videoSrc: `${AVATAR_ASSET_BASE}/Q13.mp4` },
        ],
    },
    {
        id: "payments",
        label: "Payments & Customer Support",
        keyword: "Payments",
        questions: [
            { id: "q14", question: "What payment methods do you accept?", videoSrc: `${AVATAR_ASSET_BASE}/Q14.mp4` },
            { id: "q15", question: "How can I contact LaDidiér if I need additional help?", videoSrc: `${AVATAR_ASSET_BASE}/Q15.mp4` },
        ],
    },
]);

/* Derived once at module load from FAQ_CATEGORIES and shared by every
   importer — the same question objects by reference, not clones, so
   concurrent consumers observe one identical mapping. */
export const FAQ_QUESTIONS_BY_ID = Object.freeze(
    Object.fromEntries(
        FAQ_CATEGORIES.flatMap((category) => category.questions).map((question) => [question.id, question])
    )
);

/* The ids shown before any drill-down (Q-1): the lead question of each
   of the four categories in D-01 order, so the opening view spans every
   topic area rather than exhausting one. This array is the single place
   the opening set is defined — nothing else should hardcode a second
   starter list. */
export const FAQ_STARTER_IDS = Object.freeze(["q1", "q6", "q12", "q14"]);
