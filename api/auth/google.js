import { stateCookie } from '../../lib/session.js';
import { safeReturnTo } from '../../lib/routes.js';

export async function GET(request) {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  if (!clientId) {
    console.error('[auth] GOOGLE_CLIENT_ID is not set');
    return new Response('Auth is not configured', { status: 500 });
  }

  const sessionSecret = process.env.SESSION_SECRET;
  if (!sessionSecret) {
    console.error('[auth] SESSION_SECRET is not set');
    return new Response('Auth is not configured', { status: 500 });
  }

  const url = new URL(request.url);
  const rawReturnTo = url.searchParams.get('returnTo');
  const returnTo = safeReturnTo(rawReturnTo);

  const nonce = crypto.randomUUID();
  const statePayload = `${nonce}:${returnTo}`;

  const proto = request.headers.get('x-forwarded-proto') ?? 'https';
  const host = request.headers.get('x-forwarded-host') ?? request.headers.get('host');
  const origin = `${proto}://${host}`;
  const redirectUri = `${origin}/api/auth/callback`;

  const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
  authUrl.searchParams.set('client_id', clientId);
  authUrl.searchParams.set('redirect_uri', redirectUri);
  authUrl.searchParams.set('response_type', 'code');
  authUrl.searchParams.set('scope', 'openid email profile');
  authUrl.searchParams.set('state', nonce);
  authUrl.searchParams.set('access_type', 'online');
  authUrl.searchParams.set('prompt', 'select_account');

  return new Response(null, {
    status: 302,
    headers: {
      Location: authUrl.toString(),
      'Set-Cookie': stateCookie(statePayload),
      'Cache-Control': 'no-cache, no-store, must-revalidate',
    },
  });
}
