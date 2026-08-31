# Phase 6: Mall Treasure Hunt - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-08-22
**Phase:** 6-Mall Treasure Hunt
**Areas discussed:** Scope conflict reconciliation, Icon aesthetic, Which pages, Bonus capture mechanic, Progress visibility

---

## Scope Conflict Reconciliation

| Option | Description | Selected |
|--------|-------------|----------|
| Update the docs now | Flip PROJECT.md's Out-of-Scope line and Key Decisions to reflect the new second mechanic | ✓ |
| Leave docs as-is, proceed anyway | Note the tension in CONTEXT.md only | |
| Actually, hold off | Remove Phase 6 from the roadmap | |

**User's choice:** Update the docs now.
**Notes:** PROJECT.md and REQUIREMENTS.md both explicitly listed "gamified/multiple hidden perks system" as Out of Scope for v1.1, carried from Phase 5's discuss-phase. Both documents were updated 2026-08-22 to record the Mall Treasure Hunt as a deliberate, explicit supersession of that earlier decision — not an oversight.

---

## Icon Aesthetic

| Option | Description | Selected |
|--------|-------------|----------|
| Reskin to match Phase 5 | Ornamental glyphs matching the perk mark's visual language | |
| Literal icons as pitched | Recognizable shopping-bag/gift-box shapes | ✓ |
| You decide | Claude designs to fit the brand | |

**User's choice:** Literal icons as pitched.

**Follow-up — icon count:**
| Option | Selected |
|--------|----------|
| 4 distinct icons | ✓ |
| 3 distinct icons | |
| Same icon repeated | |

**Follow-up — render style:**
| Option | Selected |
|--------|----------|
| Flat gold/monochrome silhouettes | |
| Small full-color illustrated icons | ✓ |

**Notes:** User explicitly chose the bigger stylistic departure from Phase 5's restraint — 4 distinct, full-color illustrated icons (shopping bag, gift box confirmed; 2 more left to Claude's discretion).

---

## Which Pages

| Option | Description | Selected |
|--------|-------------|----------|
| Home, Stores, Magazine, Article | One icon each on 4 distinct pages | ✓ |
| Home, Stores, Magazine only | Double up an icon on one page | |
| You decide | | |

**Follow-up — placement within a page:**
| Option | Selected |
|--------|----------|
| One quiet fixed spot per page | |
| Randomized position | ✓ |

**Follow-up — random scope clarification:**
| Option | Selected |
|--------|----------|
| Randomize among 2-3 safe spots per page | ✓ |
| Fully arbitrary position | |

**Follow-up — re-roll timing:**
| Option | Selected |
|--------|----------|
| Re-randomize on every fresh page load | ✓ |
| Fixed per browser session | |

**User's choice:** Home/Stores/Magazine/Article, 2-3 pre-defined safe zones per page, re-randomized on every load.

---

## Bonus Capture Mechanic

| Option | Description | Selected |
|--------|-------------|----------|
| Cosmetic form + mailto:/wa.me links | Real but manual — visitor has to send it themselves | |
| Cosmetic-only, matches Phase 5 | localStorage flag only, nothing ever sent anywhere | ✓ |
| Skip the capture entirely | Just show the code + a link to /subscribe | |

**User's choice:** Cosmetic-only, matches Phase 5.

**Follow-up — reward code:**
| Option | Selected |
|--------|----------|
| Different static code | ✓ |
| Same HOUSE10 code | |
| You decide | |

**Follow-up — subscribe CTA:**
| Option | Selected |
|--------|----------|
| Yes, same subscribe-flow branching as Phase 5 | ✓ |
| No CTA, just show the code | |

**Notes:** Explicitly surfaced that the original pitch's "feeds his subscriber list" framing isn't achievable without a backend, which doesn't exist on this site. User accepted the cosmetic-only tradeoff rather than building a manual mailto:/wa.me alternative.

---

## Progress Visibility

| Option | Description | Selected |
|--------|-------------|----------|
| Small persistent progress mark | Subtle indicator once 1+ found | ✓ |
| Fully invisible until completion | Matches Phase 5's ethos exactly | |

**Follow-up — persistence:**
| Option | Selected |
|--------|----------|
| Persists indefinitely across visits | |
| Resets each session | ✓ |

**Follow-up — session scope clarification:**
| Option | Selected |
|--------|----------|
| Resets when browser tab/window closes (sessionStorage) | ✓ |
| Resets per magazine issue | |

**Follow-up — mark placement:**
| Option | Selected |
|--------|----------|
| Near the Phase 5 perk mark in the Footer | |
| Somewhere else entirely | ✓ → **Nav bar / header** (free-text follow-up) |

**Follow-up — mark style:**
| Option | Selected |
|--------|----------|
| Subtle dot/glyph indicator | ✓ |
| Literal "2/4 found" text | |

**Free-text interjection — one-time completion rule:** User typed: "the treasure will only for onne time for a personn." — interpreted as: once a visitor completes the hunt, it should not be repeatable.

**Follow-up — one-time rule mechanism:**
| Option | Selected |
|--------|----------|
| Icons stop appearing after first completion | ✓ |
| Icons keep appearing, no new popup/reward | |
| Icons keep appearing, popup says "already claimed" | |

**User's choice:** sessionStorage-based per-session progress (resets on tab close), nav-bar dot/glyph indicator (not numeric), plus a separate persistent `localStorage` completion flag so icons never reappear after a visitor's first full completion.

---

## Claude's Discretion

- The 3rd and 4th icon shapes (beyond shopping bag and gift box)
- The exact reward code string (distinct from HOUSE10, same house vocabulary)
- The exact 2-3 safe-zone coordinates per page
- Exact completion-popup copy (elevated-editorial voice, no false urgency)
- Exact nav-bar dot-indicator styling and mobile-hamburger collision avoidance
- Icon click/tap/keyboard-focus accessibility mechanics (same bar as Phase 5's PERK-02)

## Deferred Ideas

None — the "feeds his subscriber list" idea was addressed directly (see Bonus Capture Mechanic above) rather than deferred, since building real capture would require a backend that's out of scope for this project.
