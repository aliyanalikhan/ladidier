import { readSession } from '../../lib/session.js';
import { getStripe } from '../../lib/stripe.js';
import { getUserById } from '../../lib/db.js';

export async function GET(request) {
  const session = await readSession(request.headers.get('cookie'));
  if (!session) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const user = await getUserById(session.uid);
    if (!user || !user.stripe_customer_id) {
      return Response.json({ error: 'No billing history' }, { status: 400 });
    }

    const stripe = getStripe();
    
    // Get the origin dynamically based on request headers.
    const proto = request.headers.get('x-forwarded-proto') ?? 'https';
    const host = request.headers.get('x-forwarded-host') ?? request.headers.get('host');
    const origin = `${proto}://${host}`;

    const portalSession = await stripe.billingPortal.sessions.create({
      customer: user.stripe_customer_id,
      return_url: `${origin}/#account`,
    });

    return Response.json({ url: portalSession.url });
  } catch (err) {
    console.error('[account/portal] Error:', err.message);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
