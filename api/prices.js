import Stripe from 'stripe';
import { PRICE_ENV, PRODUCTS } from '../lib/plans.js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Amounts change rarely, so hold the last answer for the life of a warm
// instance rather than calling Stripe on every page view.
const TTL_MS = 5 * 60 * 1000;
let cache = null;

async function loadPrices() {
  if (cache && Date.now() - cache.at < TTL_MS) return cache.data;

  // One retrieve per configured plan, in parallel. A plan whose env var is
  // missing or whose id is bad resolves to null and is simply left out, so one
  // broken price never blanks the whole pricing page.
  const entries = await Promise.all(
    Object.entries(PRICE_ENV).map(async ([planKey, envName]) => {
      const id = process.env[envName];
      if (!id) {
        console.error(`[stripe] ${envName} is not set`);
        return [planKey, null];
      }
      try {
        const price = await stripe.prices.retrieve(id);
        if (!price.active) {
          console.warn(`[stripe] ${envName} -> ${id} is archived`);
          return [planKey, null];
        }
        return [planKey, {
          amount: price.unit_amount,
          currency: price.currency,
          interval: price.recurring?.interval ?? null,
        }];
      } catch (err) {
        console.error(`[stripe] could not retrieve ${envName}: ${err.message}`);
        return [planKey, null];
      }
    })
  );

  const byPlanKey = Object.fromEntries(entries);

  // Reshape into { online: { monthly, yearly }, hardcopy: { … } }.
  const data = {};
  for (const [product, intervals] of Object.entries(PRODUCTS)) {
    data[product] = {};
    for (const [interval, planKey] of Object.entries(intervals)) {
      data[product][interval] = byPlanKey[planKey];
    }
  }

  cache = { at: Date.now(), data };
  return data;
}

export async function GET() {
  try {
    const prices = await loadPrices();
    return Response.json(prices, {
      // Let the CDN serve this so a burst of visitors doesn't become a burst of
      // Stripe calls; stale-while-revalidate keeps it warm without blocking.
      headers: { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600' },
    });
  } catch (err) {
    console.error('[stripe] could not load prices:', err);
    return Response.json({ error: 'Could not load prices' }, { status: 502 });
  }
}
