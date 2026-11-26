// Pure rules for the email signup; checked by scripts/check-signup.mjs.
import { emailHtml } from './emailTemplate.js';

const regions = new Intl.DisplayNames(['en'], { type: 'region', fallback: 'none' });

// Two-letter country Vercel derives from the visitor's IP; 'ZZ' when unknown (e.g. local dev).
export function ipCountry(request) {
  const code = request.headers.get('x-vercel-ip-country') ?? '';
  return /^[A-Z]{2}$/.test(code) ? code : 'ZZ';
}

export function countryName(code) {
  return (code !== 'ZZ' && regions.of(code)) || 'Unknown country';
}

// Returns the normalised email from the form, or null if the request is not acceptable.
export function parseSignup(body) {
  const email = typeof body?.email === 'string' ? body.email.trim().toLowerCase() : '';
  if (email.length > 254 || !/^[^\s@<>,;"]+@[^\s@<>,;"]+\.[^\s@<>,;"]+$/.test(email)) return null;
  return body.consent === true ? email : null;
}

// Returns the reader's welcome email, or null while an international reader's
// ebook is not configured (so it can still be sent later).
export function welcomeEmail(country, env) {
  const us = country === 'US';
  if (!us && !env.EBOOK_URL) return null;
  // EBOOK_URL may hold several links separated by spaces; each gets its own line.
  const links = us ? [] : env.EBOOK_URL.trim().split(/\s+/);
  const body = us ? "You're on our list." : `Your free ebook links:\n${links.join('\n')}`;
  return {
    subject: us ? 'Welcome to LaDidiér' : 'Your free LaDidiér ebook',
    text: `Welcome to LaDidiér.\n\n${body}\n\nTo stop receiving emails from us, reply with "unsubscribe".`,
    html: emailHtml(links),
  };
}
