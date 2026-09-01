import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { getStripe } from '../../lib/stripe.js';
import { hasIssueAccess } from '../../lib/access.js';

// Never let this sit in a shared cache — the answer is per-visitor.
const PRIVATE = { 'Cache-Control': 'private, no-store' };

// Lives outside public/ on purpose. Anything under public/ is served to
// anyone who knows (or guesses) the URL, with no server in the loop to check
// a cookie — that would make the membership gate below pure theatre. Keeping
// the file here means the only way to it is this route's entitlement check.
const PDF_PATH = path.join(process.cwd(), 'content', 'eclat-vol2-issue.pdf');

export async function GET(request) {
  let stripe;
  try {
    stripe = getStripe();
  } catch (err) {
    console.error(`[stripe] ${err.message}`);
    return Response.json({ error: 'Stripe is not configured' }, { status: 500, headers: PRIVATE });
  }

  const active = await hasIssueAccess(request, stripe);
  if (!active) {
    return Response.json({ error: 'Membership required' }, { status: 403, headers: PRIVATE });
  }

  let bytes;
  try {
    bytes = await readFile(PDF_PATH);
  } catch (err) {
    console.error('[issue] could not read PDF:', err.message);
    return Response.json({ error: 'Issue file not available' }, { status: 500, headers: PRIVATE });
  }

  return new Response(bytes, {
    headers: {
      ...PRIVATE,
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'attachment; filename="ECLAT-Vol2.pdf"',
      'Content-Length': String(bytes.length),
    },
  });
}
