import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// A session id in the URL proves only that someone reached the success page.
// Ask Stripe whether that session was actually paid before granting access.
export async function POST(request) {
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

    return Response.json({
      paid,
      email: paid ? session.customer_details?.email ?? null : null,
    });
  } catch (err) {
    // Unknown or malformed ids land here; treat them all as simply not paid.
    console.error(`[stripe] could not retrieve session: ${err.message}`);
    return Response.json({ paid: false }, { status: 400 });
  }
}
