import { getStripe } from '../lib/stripe.js';
import { memberCookie } from '../lib/membership.js';

// A session id in the URL proves only that someone reached the success page.
// Ask Stripe whether that session was actually paid before granting access.
export async function POST(request) {
  let stripe;
  try {
    stripe = getStripe();
  } catch (err) {
    // A config fault must not look like "not paid" — that would deny access to
    // someone who really did pay, with no way to tell the two cases apart.
    console.error(`[stripe] ${err.message}`);
    return Response.json({ paid: false, error: 'Stripe is not configured' }, { status: 500 });
  }

  let sessionId;
  try {
    ({ sessionId } = await request.json());
  } catch {
    return Response.json({ paid: false, error: 'Malformed request body' }, { status: 400 });
  }

  if (typeof sessionId !== 'string' || !sessionId.startsWith('cs_')) {
    return Response.json({ paid: false, error: 'Invalid session id' }, { status: 400 });
  }

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    const paid = session.status === 'complete' && session.payment_status === 'paid';

    // On a confirmed payment, remember this session in an httpOnly cookie so
    // /api/entitlement can re-ask Stripe later whether the subscription is still
    // running. Without it, access would be granted once and never revisited.
    const headers = paid ? { 'Set-Cookie': memberCookie(sessionId) } : undefined;

    return Response.json(
      {
        paid,
        email: paid ? session.customer_details?.email ?? null : null,
      },
      { headers }
    );
  } catch (err) {
    // Unknown or malformed ids land here; treat them all as simply not paid.
    console.error(`[stripe] could not retrieve session: ${err.message}`);
    return Response.json({ paid: false }, { status: 400 });
  }
}
