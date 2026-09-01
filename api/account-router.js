import { readSession } from '../lib/session.js';
import { checkUserActiveMembership } from '../lib/account.js';
import { getStripe } from '../lib/stripe.js';
import { getUserById } from '../lib/db.js';

// Consolidated router for /api/account/* (portal, status) — kept as one
// Vercel Function instead of two to stay under the Hobby plan's 12
// Serverless Functions cap. vercel.json rewrites each public path here with
// the matched segment appended as an `action` query param; the two handlers
// below are otherwise byte-for-byte what used to live in api/account/*.js.

async function handlePortal(request) {
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

async function handleStatus(request) {
  const session = await readSession(request.headers.get('cookie'));
  if (!session) {
    return Response.json(
      { active: false },
      { headers: { 'Cache-Control': 'private, no-store' } }
    );
  }

  try {
    const stripe = getStripe();
    const active = await checkUserActiveMembership({
      userId: session.uid,
      stripe,
    });

    return Response.json(
      { active },
      { headers: { 'Cache-Control': 'private, no-store' } }
    );
  } catch (err) {
    console.error('[account/status] Error:', err.message);
    return Response.json(
      { active: false },
      { headers: { 'Cache-Control': 'private, no-store' }, status: 500 }
    );
  }
}

export async function GET(request) {
  const action = new URL(request.url).searchParams.get('action');
  switch (action) {
    case 'portal':
      return handlePortal(request);
    case 'status':
      return handleStatus(request);
    default:
      return new Response('Not found', { status: 404 });
  }
}
