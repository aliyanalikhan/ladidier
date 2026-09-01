// The single shared returnTo allowlist. No imports — this file must be safe
// for both the serverless functions (api/auth/google.js, api/auth/callback.js)
// and the Vite browser bundle (src/components.jsx).
//
// Allow only lowercase alphanumeric hash route names (e.g., 'subscribe')
// to prevent open-redirect vulnerabilities: a returnTo value flows straight
// into a redirect Location header, so anything wider than a bare route name
// (a slash, a dot, a hyphen, an uppercase letter, a scheme) could point a
// visitor at an attacker-controlled destination after sign-in.
const RETURN_TO_PATTERN = /^[a-z]+$/;
const FALLBACK_ROUTE = 'subscribe';

export function safeReturnTo(raw) {
  return typeof raw === 'string' && RETURN_TO_PATTERN.test(raw) ? raw : FALLBACK_ROUTE;
}
