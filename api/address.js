import { readSession } from '../lib/session.js';
import { getAddress, upsertAddress } from '../lib/db.js';

export async function GET(request) {
  const session = await readSession(request.headers.get('cookie'));
  if (!session) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const address = await getAddress(session.uid);
    return Response.json({ address: address || {} });
  } catch (err) {
    console.error('[address GET] error:', err.message);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request) {
  const session = await readSession(request.headers.get('cookie'));
  if (!session) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  try {
    const address = await upsertAddress(session.uid, {
      line1: body.line1 || null,
      city: body.city || null,
      state: body.state || null,
      postal_code: body.postal_code || null,
      country: body.country || null,
    });
    return Response.json({ success: true, address });
  } catch (err) {
    console.error('[address POST] error:', err.message);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
