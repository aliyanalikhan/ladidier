import { readCookie } from './membership.js';

export const SESSION_COOKIE = 'ladidier_session';
export const OAUTH_STATE_COOKIE = 'ladidier_oauth_state';

// 7-day session lifetime (D-06). A single constant derives both the payload exp
// timestamp and the Set-Cookie Max-Age header. Keeping a single source of truth
// prevents timing drift where the browser still sends a cookie that the server
// considers expired.
export const SESSION_TTL_SECONDS = 7 * 24 * 60 * 60;

let _hmacKey = null;

// Lazily import the HMAC signing key from SESSION_SECRET. Constructing lazily
// prevents module-scope crashes during serverless cold starts if configuration
// is being inspected or initialized.
async function getHmacKey() {
  if (!_hmacKey) {
    const secret = process.env.SESSION_SECRET;
    if (!secret) {
      throw new Error('SESSION_SECRET is not set');
    }
    const encoder = new TextEncoder();
    _hmacKey = await crypto.subtle.importKey(
      'raw',
      encoder.encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );
  }
  return _hmacKey;
}

function base64UrlEncode(buffer) {
  return Buffer.from(buffer).toString('base64url');
}

function base64UrlDecode(str) {
  return Buffer.from(str, 'base64url');
}

// Signs a session payload: { uid, email, name }. Sets exp to now + SESSION_TTL_SECONDS.
// Returns "base64url(payload).base64url(hmac)".
export async function signSession(payload) {
  const key = await getHmacKey();
  const exp = Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS;
  const fullPayload = { ...payload, exp };
  const payloadJson = JSON.stringify(fullPayload);
  const payloadB64 = base64UrlEncode(Buffer.from(payloadJson, 'utf8'));

  const encoder = new TextEncoder();
  const signatureBuffer = await crypto.subtle.sign(
    'HMAC',
    key,
    encoder.encode(payloadB64)
  );
  const signatureB64 = base64UrlEncode(signatureBuffer);

  return `${payloadB64}.${signatureB64}`;
}

// Reads and validates the session cookie from a raw Cookie header string.
// Returns the payload if valid and unexpired, or null if missing, invalid, or expired.
// Never throws — malformed or tampered cookies represent anonymous visitors.
export async function readSession(cookieHeader) {
  try {
    const rawCookie = readCookie(cookieHeader, SESSION_COOKIE);
    if (!rawCookie) return null;

    const dotIndex = rawCookie.indexOf('.');
    if (dotIndex === -1) return null;

    const payloadB64 = rawCookie.slice(0, dotIndex);
    const signatureB64 = rawCookie.slice(dotIndex + 1);
    if (!payloadB64 || !signatureB64) return null;

    const key = await getHmacKey();
    const encoder = new TextEncoder();
    const expectedSigBuffer = await crypto.subtle.sign(
      'HMAC',
      key,
      encoder.encode(payloadB64)
    );
    const expectedSigB64 = base64UrlEncode(expectedSigBuffer);

    // Constant-time string comparison to prevent timing side-channel attacks on signatures
    const sigA = Buffer.from(signatureB64, 'utf8');
    const sigB = Buffer.from(expectedSigB64, 'utf8');
    if (sigA.length !== sigB.length) return null;

    let diff = 0;
    for (let i = 0; i < sigA.length; i++) {
      diff |= sigA[i] ^ sigB[i];
    }
    if (diff !== 0) return null;

    const payloadJson = base64UrlDecode(payloadB64).toString('utf8');
    const payload = JSON.parse(payloadJson);

    const now = Math.floor(Date.now() / 1000);
    if (!payload.exp || typeof payload.exp !== 'number' || payload.exp < now) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

// Session cookie set header value.
// SameSite must be Lax (not Strict) to ensure session cookies accompany normal
// navigation across pages.
export function sessionCookie(value) {
  return [
    `${SESSION_COOKIE}=${encodeURIComponent(value)}`,
    'Path=/',
    'HttpOnly',
    'Secure',
    'SameSite=Lax',
    `Max-Age=${SESSION_TTL_SECONDS}`,
  ].join('; ');
}

export function clearSessionCookie() {
  return [
    `${SESSION_COOKIE}=`,
    'Path=/',
    'HttpOnly',
    'Secure',
    'SameSite=Lax',
    'Max-Age=0',
  ].join('; ');
}

// OAuth state cookie set header value.
// SameSite MUST be Lax (never Strict): the user returns from accounts.google.com
// via a top-level GET navigation. SameSite=Strict would withhold the state cookie,
// causing every OAuth return flow to fail verification.
export function stateCookie(value) {
  return [
    `${OAUTH_STATE_COOKIE}=${encodeURIComponent(value)}`,
    'Path=/api/auth',
    'HttpOnly',
    'Secure',
    'SameSite=Lax',
    'Max-Age=600',
  ].join('; ');
}

export function clearStateCookie() {
  return [
    `${OAUTH_STATE_COOKIE}=`,
    'Path=/api/auth',
    'HttpOnly',
    'Secure',
    'SameSite=Lax',
    'Max-Age=0',
  ].join('; ');
}
