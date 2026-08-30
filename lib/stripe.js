import Stripe from 'stripe';

let client = null;

// Stripe's constructor throws when the key is missing. Doing that at module
// scope takes the whole function down before any handler runs, which Vercel
// surfaces as a bare FUNCTION_INVOCATION_FAILED with nothing in the logs.
// Constructing lazily lets each handler catch it and say what's actually wrong.
export function getStripe() {
  if (client) return client;

  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error('STRIPE_SECRET_KEY is not set');

  client = new Stripe(key);
  return client;
}
