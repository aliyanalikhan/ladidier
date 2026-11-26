import { ensureSchema } from '../lib/db.js';
import { ipCountry, parseSignup } from '../lib/signup.js';
import { subscribe } from '../lib/subscribe.js';

// shortcut: only a honeypot against bots, add rate limiting or double opt-in if abused.
export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'Invalid JSON' }, { status: 400 });
  }
  if (body?.website) return Response.json({ sent: true });

  const email = parseSignup(body);
  if (!email) {
    return Response.json({ error: 'Enter a valid email and tick the box.' }, { status: 400 });
  }

  try {
    await ensureSchema();
    const sent = await subscribe(email, ipCountry(request), 'the website form');
    return Response.json({ sent });
  } catch (err) {
    console.error('[signup] error:', err.message);
    return Response.json({ error: 'We could not save your signup. Please try again.' }, { status: 500 });
  }
}
