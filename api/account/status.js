import { readSession } from '../../lib/session.js';
import { checkUserActiveMembership } from '../../lib/account.js';
import { getStripe } from '../../lib/stripe.js';

export async function GET(request) {
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
