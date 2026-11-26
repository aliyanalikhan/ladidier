// Pure rules for the welcome-gift signup; checked by scripts/check-signup.mjs.
const regions = new Intl.DisplayNames(['en'], { type: 'region', fallback: 'none' });

// Returns { email, country, countryName }, or null if the request is not acceptable.
export function parseSignup(body) {
  const email = typeof body?.email === 'string' ? body.email.trim().toLowerCase() : '';
  const country = typeof body?.country === 'string' ? body.country : '';
  if (email.length > 254 || !/^[^\s@<>,;"]+@[^\s@<>,;"]+\.[^\s@<>,;"]+$/.test(email)) return null;
  if (!/^[A-Z]{2}$/.test(country) || !regions.of(country)) return null;
  if (body.consent !== true) return null;
  return { email, country, countryName: regions.of(country) };
}

// Returns the reader's welcome email, or null while an international reader's
// ebook is not configured (so it can still be sent later).
export function welcomeEmail(country, env) {
  const us = country === 'US';
  if (!us && !env.EBOOK_URL) return null;
  const body = us ? "You're on our list." : `Your free ebook is here: ${env.EBOOK_URL}`;
  return {
    subject: us ? 'Welcome to LaDidiér' : 'Your free LaDidiér ebook',
    text: `Welcome to LaDidiér.\n\n${body}\n\nTo stop receiving emails from us, reply with "unsubscribe".`,
  };
}
