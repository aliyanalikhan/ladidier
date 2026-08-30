import { PRICE_ENV } from '../lib/plans.js';
import { getStripe } from '../lib/stripe.js';

// Resolved product -> price lookups, kept for the life of a warm instance so a
// repeat checkout does not pay for the extra round trip.
const priceCache = new Map();

// The env vars accept either a Price id (price_…) or a Product id (prod_…).
// A Product is only a name; the amount and interval live on its Price, so a
// prod_ id has to be resolved before it can go in line_items.
async function resolvePriceId(stripe, configured) {
  if (configured.startsWith('price_')) return configured;

  if (!configured.startsWith('prod_')) {
    throw new Error(`expected a price_ or prod_ id, got "${configured}"`);
  }

  const cached = priceCache.get(configured);
  if (cached) return cached;

  const product = await stripe.products.retrieve(configured);
  let priceId =
    typeof product.default_price === 'string'
      ? product.default_price
      : product.default_price?.id;

  if (!priceId) {
    // No default set — fall back to the product's active recurring price, but
    // only when there is exactly one, so we never guess at what to charge.
    const { data } = await stripe.prices.list({
      product: configured,
      active: true,
      type: 'recurring',
      limit: 2,
    });
    if (data.length !== 1) {
      throw new Error(
        `${configured} has no default price and ${data.length} active recurring prices — ` +
        `set a default price in the Dashboard or use a price_ id`
      );
    }
    priceId = data[0].id;
  }

  priceCache.set(configured, priceId);
  return priceId;
}

export async function POST(request) {
  let stripe;
  try {
    stripe = getStripe();
  } catch (err) {
    console.error(`[stripe] ${err.message}`);
    return Response.json({ error: 'Stripe is not configured' }, { status: 500 });
  }

  let planType;
  try {
    ({ planType } = await request.json());
  } catch {
    return Response.json({ error: 'Malformed request body' }, { status: 400 });
  }

  // Never take an amount from the client — only a plan key we control.
  const envName = PRICE_ENV[planType];
  if (!envName) {
    return Response.json({ error: 'Unknown plan' }, { status: 400 });
  }

  const configured = process.env[envName];
  if (!configured) {
    console.error(`[stripe] ${envName} is not set`);
    return Response.json({ error: 'Checkout is not configured' }, { status: 500 });
  }

  let price;
  try {
    price = await resolvePriceId(stripe, configured);
  } catch (err) {
    console.error(`[stripe] could not resolve ${envName}: ${err.message}`);
    return Response.json({ error: 'Checkout is not configured' }, { status: 500 });
  }

  const proto = request.headers.get('x-forwarded-proto') ?? 'https';
  const host = request.headers.get('x-forwarded-host') ?? request.headers.get('host');
  const origin = `${proto}://${host}`;

  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      line_items: [{ price, quantity: 1 }],
      // payment_method_types is deliberately omitted so Stripe picks the most
      // relevant methods per customer (dynamic payment methods). Manage which
      // ones are eligible from the Dashboard, not from here.
      //
      // One caveat given there is no entitlement database: delayed-notification
      // methods such as SEPA Direct Debit settle hours or days later, so the
      // buyer would finish checkout without immediate access. If you enable one
      // in the Dashboard, you need a real entitlement store to go with it.
      integration_identifier: 'ladidier_membership_kmwrbxtq',
      // The query string goes before the hash so URLSearchParams sees session_id
      // while the hash router still reads "subscribe". {CHECKOUT_SESSION_ID} is
      // a literal Stripe placeholder — it must not be interpolated here.
      success_url: `${origin}/?session_id={CHECKOUT_SESSION_ID}#subscribe`,
      cancel_url: `${origin}/?checkout=canceled#subscribe`,
    });

    return Response.json({ url: session.url });
  } catch (err) {
    // Log the detail, return something opaque — Stripe errors can echo config.
    console.error('[stripe] could not create Checkout Session:', err);
    return Response.json({ error: 'Could not start checkout' }, { status: 502 });
  }
}
