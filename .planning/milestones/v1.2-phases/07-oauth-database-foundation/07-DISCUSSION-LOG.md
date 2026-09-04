# Phase 7: OAuth + Database Foundation - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-09-01
**Phase:** 07-oauth-database-foundation
**Areas discussed:** Sign-in entry points, Session duration, Sign-in failure UX, Consent screen launch readiness

---

## Sign-in entry points

| Option | Description | Selected |
|--------|-------------|----------|
| Subscribe page only | Matches the draft plan exactly — sign-in appears where it's needed (before buying a paid plan). A full Nav/Account entry point comes naturally with Phase 9's Account page. | |
| Also add a Nav indicator | Add a small "Sign in" / signed-in indicator in the main Nav now, so visitors can sign in from anywhere — even though the Account page itself doesn't exist until Phase 9. | ✓ |

**User's choice:** Also add a Nav indicator

**Follow-up:** Since the Account page doesn't exist yet, asked what the Nav indicator should do when clicked.

| Option | Description | Selected |
|--------|-------------|----------|
| Signed out: opens Google sign-in. Signed in: shows email, does nothing else yet | A small text/link in Nav — signed in shows the user's email/name with no dropdown or menu yet | |
| Signed out: opens Google sign-in. Signed in: routes to Subscribe page | Reuses the existing Subscribe page's sign-out button as the only account-related action available pre-Phase-9 | ✓ |

**User's choice:** Signed in routes to Subscribe page

---

## Session duration

| Option | Description | Selected |
|--------|-------------|----------|
| 30 days | Matches the draft plan. Reasonable for a membership site — most visitors don't want to re-sign-in on every visit | |
| Shorter (e.g. 7 days) | Tighter security window at the cost of more frequent re-sign-ins | ✓ |
| Renew on activity | Session extends itself each time the user visits, rather than a fixed 30-day countdown from sign-in | |

**User's choice:** Shorter (7 days)
**Notes:** Interpreted as a flat 7-day expiry (not renew-on-activity) — user picked the "shorter" option specifically, not the renewal option.

---

## Sign-in failure UX

| Option | Description | Selected |
|--------|-------------|----------|
| Silent/generic is fine | Matches the draft plan and security best practice. User just lands back on Subscribe as if nothing happened. | ✓ |
| Show a visible message | Add a visible "Sign-in didn't work, please try again" banner on return — still generic, just more visible than silence | |

**User's choice:** Silent/generic is fine — no changes to the draft plan's failure handling needed.

---

## Consent screen launch readiness

| Option | Description | Selected |
|--------|-------------|----------|
| Publish immediately | Move to "Published" as part of Phase 7's setup — non-sensitive scopes, no Google review required. Real visitors can sign in as soon as Phase 7 ships. | ✓ |
| Keep in Testing for now | Restrict sign-in to accounts added manually until ready to launch publicly | |

**User's choice:** Publish immediately

---

## Claude's Discretion

- Exact `returnTo` fallback handling for the new Nav sign-in link on routes that aren't valid `returnTo` destinations
- Precise Nav element styling/placement for the new sign-in indicator

## Deferred Ideas

- Hard Copy in-app address collection (draft plan's Task 6) — belongs to Phase 9, must be replanned (not reused verbatim) since the "keep Stripe's own address collection too" decision conflicts with Task 6's approach of removing it
- Stripe-customer linking (`customer_email`/`metadata` on Checkout Session) — belongs to Phase 8
- A real Account page/menu behind the Nav sign-in indicator — belongs to Phase 9
- Migrating pre-login Stripe subscribers into accounts — deferred past v1.2 entirely
