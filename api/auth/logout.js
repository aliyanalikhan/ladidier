import { clearSessionCookie } from '../../lib/session.js';

export async function POST() {
  return Response.json(
    { ok: true },
    {
      headers: {
        'Set-Cookie': clearSessionCookie(),
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    }
  );
}
