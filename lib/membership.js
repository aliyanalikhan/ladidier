// Paid access is Stripe's decision, not the browser's. Rather than keep our own
// subscription table, we remember which Checkout Session belongs to this browser
// and ask Stripe for that subscription's current status. Stripe is the store, so
// there is nothing to keep in sync and no stale row to revoke.
export const MEMBER_COOKIE = 'ladidier_member_session';

// Statuses that grant access. Everything else — canceled, past_due, unpaid,
// incomplete, incomplete_expired, paused — means the money stopped arriving,
// so the digital edition closes again on the next check.
export const ACTIVE_STATUSES = new Set(['active', 'trialing']);

export function readCookie(header, name) {
  if (!header) return null;
  for (const part of header.split(';')) {
    const [key, ...rest] = part.trim().split('=');
    if (key === name) return decodeURIComponent(rest.join('=')) || null;
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
