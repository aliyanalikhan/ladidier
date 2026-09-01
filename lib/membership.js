// Paid access is Stripe's decision, not the browser's. Rather than keep our own
// subscription table, we remember which Checkout Session belongs to this browser
// and ask Stripe for that subscription's current status. Stripe is the store, so
// there is nothing to keep in sync and no stale row to revoke.
import { createTtlCache } from './cache.js';

export const MEMBER_COOKIE = 'ladidier_member_session';

// Statuses that grant access. Everything else — canceled, past_due, unpaid,
// incomplete, incomplete_expired, paused — means the money stopped arriving,
// so the digital edition closes again on the next check.
export const ACTIVE_STATUSES = new Set(['active', 'trialing']);

export function readCookie(header, name) {
  if (!header) return null;
  for (const part of header.split(';')) {
    const [key, ...rest] = part.trim().split('=');
    if (key === name) {
      // A malformed percent-encoding in the raw cookie value must not throw
      // up through every caller — it is indistinguishable from "cookie absent".
      try {
        return decodeURIComponent(rest.join('=')) || null;
      } catch {
        return null;
      }
    }
  }
  return null;
}

// httpOnly so page scripts can neither read nor forge it. The value is a
// Checkout Session id: unguessable, and only meaningful because Stripe itself
// validates it — so a stolen cookie is the only way to borrow someone's access,
// the same exposure any session cookie carries.
export function memberCookie(sessionId) {
  return [
    `${MEMBER_COOKIE}=${encodeURIComponent(sessionId)}`,
    'Path=/',
    'HttpOnly',
    'Secure',
    'SameSite=Lax',
    `Max-Age=${60 * 60 * 24 * 365}`,
  ].join('; ');
}

// Same status check api/entitlement.js makes, factored out so the gated issue
// routes (api/issue/pdf.js, api/issue/page.js) don't each re-implement it.
// api/entitlement.js is left untouched on purpose — its existing behaviour must
// keep working byte-for-byte — this is an additive helper, not a refactor of it.
//
// A member reading the issue page-by-page would otherwise cost one Stripe call
// per page turn. Memoizing per warm instance for a short TTL keeps that off
// Stripe's rate limit without materially delaying a revoked subscription from
// losing access (60s is short enough that "just cancelled, still reading" is
// an acceptable, brief overlap).
const ENTITLEMENT_CACHE_TTL_MS = 60 * 1000;
// 500: one entry per warm-instance visitor is the right bound here — enough
// headroom for a busy instance without letting a stream of distinct
// checkout-session ids grow this memo without limit.
const entitlementCache = createTtlCache({ ttlMs: ENTITLEMENT_CACHE_TTL_MS, maxEntries: 500 });

export async function checkActiveMembership(request, stripe) {
  const sessionId = readCookie(request.headers.get('cookie'), MEMBER_COOKIE);
  if (!sessionId) return false;

  const cached = entitlementCache.get(sessionId);
  if (cached !== undefined) return cached;

  let active = false;
  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['subscription'],
    });
    active = ACTIVE_STATUSES.has(session.subscription?.status ?? null);
  } catch (err) {
    // Unknown or tampered cookie values land here. Fail closed.
    console.error(`[stripe] issue entitlement check failed: ${err.message}`);
    active = false;
  }

  entitlementCache.set(sessionId, active);
  return active;
}
