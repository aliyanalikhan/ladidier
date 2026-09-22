import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { getStripe } from '../lib/stripe.js';
import { hasIssueAccess } from '../lib/access.js';

// Consolidated router for /api/issue/* (page, pdf) — kept as one Vercel
// Function instead of two to stay under the Hobby plan's 12 Serverless
// Functions cap. vercel.json rewrites each public path here with the matched
// segment appended as an `action` query param; the two handlers below are
// otherwise byte-for-byte what used to live in api/issue/*.js.

// Never let this sit in a shared cache — the answer is per-visitor.
const PRIVATE = { 'Cache-Control': 'private, no-store' };

// Kept in lock-step with content/eclat-vol2-pages/, which was rendered once
// from the source PDF and committed alongside this route.
const TOTAL_PAGES = 62;
const PAGES_DIR = path.join(process.cwd(), 'content', 'eclat-vol2-pages');

// Lives outside public/ on purpose. Anything under public/ is served to
// anyone who knows (or guesses) the URL, with no server in the loop to check
// a cookie — that would make the membership gate below pure theatre. Keeping
// the file here means the only way to it is this route's entitlement check.
const PDF_PATH = path.join(process.cwd(), 'content', 'eclat-vol2-issue.pdf');

async function handlePage(request) {
  // Complimentary reading access: pages can be read in the reader without subscription.
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

async function handlePdf(request, stripe) {
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

export async function GET(request) {
  const action = new URL(request.url).searchParams.get('action');
  if (action === 'page') {
    return handlePage(request);
  }

  let stripe;
  try {
    stripe = getStripe();
  } catch (err) {
    console.error(`[stripe] ${err.message}`);
    return Response.json({ error: 'Stripe is not configured' }, { status: 500, headers: PRIVATE });
  }

  switch (action) {
    case 'pdf':
      return handlePdf(request, stripe);
    default:
      return new Response('Not found', { status: 404, headers: PRIVATE });
  }
}
