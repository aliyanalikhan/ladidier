import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { getStripe } from '../../lib/stripe.js';
import { checkActiveMembership } from '../../lib/membership.js';

// Never let this sit in a shared cache — the answer is per-visitor.
const PRIVATE = { 'Cache-Control': 'private, no-store' };

// Kept in lock-step with content/eclat-vol2-pages/, which was rendered once
// from the source PDF and committed alongside this route.
const TOTAL_PAGES = 62;
const PAGES_DIR = path.join(process.cwd(), 'content', 'eclat-vol2-pages');

export async function GET(request) {
  let stripe;
  try {
    stripe = getStripe();
  } catch (err) {
    console.error(`[stripe] ${err.message}`);
    return Response.json({ error: 'Stripe is not configured' }, { status: 500, headers: PRIVATE });
  }

  const active = await checkActiveMembership(request, stripe);
  if (!active) {
    return Response.json({ error: 'Membership required' }, { status: 403, headers: PRIVATE });
  }

  // The page number becomes part of a filesystem path below, so it is validated
  // as a bounded integer before anything is built from it — never the raw
  // query string. This is what stops a crafted `n` from reading files outside
  // PAGES_DIR (e.g. "../../..").
  const n = Number(new URL(request.url).searchParams.get('n'));
  if (!Number.isInteger(n) || n < 1 || n > TOTAL_PAGES) {
    return Response.json({ error: 'Invalid page number' }, { status: 400, headers: PRIVATE });
  }

  const filePath = path.join(PAGES_DIR, `page-${String(n).padStart(2, '0')}.jpg`);
  let bytes;
  try {
    bytes = await readFile(filePath);
  } catch (err) {
    console.error('[issue] could not read page image:', err.message);
    return Response.json({ error: 'Page not available' }, { status: 500, headers: PRIVATE });
  }

  return new Response(bytes, {
    headers: { ...PRIVATE, 'Content-Type': 'image/jpeg' },
  });
}
