import { ensureSchema, upsertUser } from '../../lib/db.js';
import { readCookie } from '../../lib/membership.js';
import {
  OAUTH_STATE_COOKIE,
  clearStateCookie,
  sessionCookie,
  signSession,
} from '../../lib/session.js';
import { safeReturnTo } from '../../lib/routes.js';

export async function GET(request) {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');

  const proto = request.headers.get('x-forwarded-proto') ?? 'https';
  const host = request.headers.get('x-forwarded-host') ?? request.headers.get('host');
  const origin = `${proto}://${host}`;
  const redirectUri = `${origin}/api/auth/callback`;

  // On any failure, redirect to /?auth=failed#subscribe with the state cookie cleared.
  // Never leak error details or reveal which check failed (D-07).
  const failRedirect = () => {
    const headers = new Headers();
    headers.set('Location', `${origin}/?auth=failed#subscribe`);
    headers.append('Set-Cookie', clearStateCookie());
    return new Response(null, { status: 302, headers });
  };

  const rawStateCookie = readCookie(request.headers.get('cookie'), OAUTH_STATE_COOKIE);
  if (!code || !state || !rawStateCookie) {
    return failRedirect();
  }

  const [savedNonce, savedReturnTo] = rawStateCookie.split(':');
  if (!savedNonce || state !== savedNonce) {
    return failRedirect();
  }

  const returnTo = safeReturnTo(savedReturnTo);

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    console.error('[auth] Google OAuth credentials are not set');
    return failRedirect();
  }

  let tokenData;
  try {
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }),
    });

    if (!tokenRes.ok) {
      console.error('[auth] Token exchange failed with status', tokenRes.status);
      return failRedirect();
    }

    tokenData = await tokenRes.json();
  } catch (err) {
    console.error('[auth] Error contacting Google token endpoint:', err);
    return failRedirect();
  }

  const idToken = tokenData.id_token;
  if (!idToken) {
    return failRedirect();
  }

  // Parse and validate ID token payload claims.
  //
  // Signature verification note: We do not independently verify the cryptographic signature
  // of id_token here because it was received directly over a TLS connection in a server-to-server
  // response from Google's authenticated token endpoint (oauth2.googleapis.com). Google's OIDC
  // documentation explicitly states local signature verification is not required when exchanging
  // the authorization code directly with their token endpoint over TLS.
  let claims;
  try {
    const parts = idToken.split('.');
    if (parts.length < 2) return failRedirect();
    const payloadJson = Buffer.from(parts[1], 'base64url').toString('utf8');
    claims = JSON.parse(payloadJson);
  } catch {
    return failRedirect();
  }

  const validIssuer =
    claims.iss === 'accounts.google.com' || claims.iss === 'https://accounts.google.com';
  const validAudience = claims.aud === clientId;
  const now = Math.floor(Date.now() / 1000);
  const unexpired = typeof claims.exp === 'number' && claims.exp > now;
  const emailVerified = claims.email_verified === true;

  if (!validIssuer || !validAudience || !unexpired || !emailVerified || !claims.sub || !claims.email) {
    console.error('[auth] ID token claims validation failed');
    return failRedirect();
  }

  let user;
  try {
    await ensureSchema();
    user = await upsertUser({
      sub: claims.sub,
      email: claims.email,
      name: claims.name,
      picture: claims.picture,
    });
  } catch (err) {
    console.error('[auth] Failed to persist user in database:', err);
    return failRedirect();
  }

  let sessionValue;
  try {
    sessionValue = await signSession({
      uid: user.id,
      email: user.email,
      name: user.name,
    });
  } catch (err) {
    console.error('[auth] Failed to sign session cookie:', err);
    return failRedirect();
  }

  const headers = new Headers();
  headers.set('Location', `${origin}/#${returnTo}`);
  headers.append('Set-Cookie', sessionCookie(sessionValue));
  headers.append('Set-Cookie', clearStateCookie());

  return new Response(null, {
    status: 302,
    headers,
  });
}
