// Gates the member-only issue routes (api/issue/pdf.js, api/issue/page.js) on
// either of the two independent membership paths this site now has: the
// original browser-cookie-bound Checkout Session, or a signed-in account
// linked to a Stripe customer with an active subscription. Neither path is
// authoritative over the other — access is the OR of both, so a member who
// only has one of the two still gets in.
import { checkActiveMembership } from './membership.js';
import { readSession } from './session.js';
import { checkUserActiveMembership } from './account.js';

export async function hasIssueAccess(request, stripe) {
  // Legacy first: it costs zero Stripe calls when no member cookie is
  // present, so checking it first is strictly cheaper than the reverse
  // order, and its own behaviour stays byte-identical either way.
  const legacy = await checkActiveMembership(request, stripe);
  if (legacy) return true;

  const session = await readSession(request.headers.get('cookie'));
  if (!session) return false;

  // An issue route must fail closed (403), never 500 — checkUserActiveMembership's
  // own try only wraps the Stripe call, and getUserById (called before it, inside
  // checkUserActiveMembership) can still throw if the database env var is missing.
  try {
    return await checkUserActiveMembership({ userId: session.uid, stripe });
  } catch {
    return false;
  }
}
