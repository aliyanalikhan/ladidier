import { readSession } from '../../lib/session.js';

const PRIVATE_HEADERS = {
  'Cache-Control': 'private, no-store',
};

export async function GET(request) {
  const session = await readSession(request.headers.get('cookie'));

  if (!session) {
    return Response.json({ user: null }, { headers: PRIVATE_HEADERS });
  }

  return Response.json(
    {
      user: {
        id: session.uid,
        email: session.email,
        name: session.name,
      },
    },
    { headers: PRIVATE_HEADERS }
  );
}
