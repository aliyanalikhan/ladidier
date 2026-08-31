import { getStripe } from '../lib/stripe.js';
import { MEMBER_COOKIE, ACTIVE_STATUSES, readCookie } from '../lib/membership.js';

// Never let this sit in a shared cache — the answer is per-visitor.
const PRIVATE = { 'Cache-Control': 'private, no-store' };

export async function GET(request) {
  const sessionId = readCookie(request.headers.get('cookie'), MEMBER_COOKIE);

  // No cookie means no claim to check, so answer without troubling Stripe.
  // This is the common case for anonymous visitors and costs nothing.
  if (!sessionId) {
    return Response.json({ active: false }, { headers: PRIVATE });
  }

  let stripe;
  try {
    stripe = getStripe();
  } catch (err) {
    console.error(`[stripe] ${err.message}`);
    return Response.json({ active: false, error: 'Stripe is not configured' }, { status: 500, headers: PRIVATE });
  }

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['subscription'],
    });

    // A subscription that has been cancelled outright disappears from the
    // session's expansion, so treat a missing one as inactive rather than
    // assuming the session still confers access.
    const status = session.subscription?.status ?? null;

    return Response.json(
      { active: ACTIVE_STATUSES.has(status), status },
      { headers: PRIVATE }
    );
  } catch (err) {
    // Unknown or tampered cookie values land here. Fail closed.
    console.error(`[stripe] entitlement check failed: ${err.message}`);
    return Response.json({ active: false }, { headers: PRIVATE });
  }
}
