import { ensureStripeCustomer } from '../lib/account.js';
import { PRICE_ENV, resolvePriceId } from '../lib/plans.js';
import { readSession } from '../lib/session.js';
import { getStripe } from '../lib/stripe.js';

// Hard Copy posts a printed magazine, so Checkout collects a shipping address
// and phone number and stores them on the Stripe Customer. Online is digital
// only and is asked for neither — no point making a reader type an address to
// receive a PDF.
const SHIPS_PHYSICALLY = /^hardcopy_/;

// Stripe requires an explicit country list; there is no "anywhere" option.
// Override with a comma-separated SHIPPING_COUNTRIES env var when fulfilment
// reach changes, so it doesn't need a code change.
const DEFAULT_SHIPPING_COUNTRIES = [
  'US', 'CA', 'GB', 'IE', 'FR', 'DE', 'ES', 'IT', 'NL', 'BE', 'SE', 'DK',
  'NO', 'FI', 'AT', 'CH', 'PT', 'PL', 'AU', 'NZ', 'NG', 'ZA', 'AE', 'SG', 'JP',
];

function shippingCountries() {
  const raw = process.env.SHIPPING_COUNTRIES;
  if (!raw) return DEFAULT_SHIPPING_COUNTRIES;

  const list = raw.split(',').map((c) => c.trim().toUpperCase()).filter(Boolean);
  // An empty or malformed override would make Stripe reject the session, so fall
  // back rather than ship a broken checkout.
  return list.length ? list : DEFAULT_SHIPPING_COUNTRIES;
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

  // Every key in PRICE_ENV is a paid plan (online or hardcopy), so checking
  // for an authenticated session here gates all paid subscriptions before any
  // price resolution or Stripe round trip. The free Reader tier is handled
  // entirely on the client and never reaches this route.
  const session = await readSession(request.headers.get('cookie'));
  if (!session) {
    return Response.json({ error: 'Sign in to subscribe' }, { status: 401 });
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
    const customer = await ensureStripeCustomer({
      userId: session.uid,
      email: session.email,
      name: session.name,
      stripe
    });

    const checkoutSession = await stripe.checkout.sessions.create({
      customer,
      mode: 'subscription',
      line_items: [{ price, quantity: 1 }],
      // Only ask for a delivery address when something physical is being posted.
      ...(SHIPS_PHYSICALLY.test(planType)
        ? {
            shipping_address_collection: { allowed_countries: shippingCountries() },
            phone_number_collection: { enabled: true },
          }
        : {}),
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

    return Response.json({ url: checkoutSession.url });
  } catch (err) {
    // Log the detail, return something opaque — Stripe errors can echo config.
    console.error('[stripe] could not create Checkout Session:', err);
    return Response.json({ error: 'Could not start checkout' }, { status: 502 });
  }
}
