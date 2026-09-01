// Which prices are sellable, and the env var holding each one's Stripe price id.
//
// Keys are the plan identifiers the client sends to /api/checkout, formed as
// `${product}_${interval}`. Keeping them server-side means the browser picks a
// plan, never a price — so it can't ask to be charged an amount of its choosing.
//
// Amounts, currency and interval all live on the Price in Stripe. Nothing here
// records what a plan costs, which is what stops the site from displaying one
// number while Stripe charges another.
export const PRICE_ENV = {
  online_monthly: 'STRIPE_PRICE_ONLINE_MONTHLY',
  online_yearly: 'STRIPE_PRICE_ONLINE_YEARLY',
  hardcopy_monthly: 'STRIPE_PRICE_HARDCOPY_MONTHLY',
  hardcopy_yearly: 'STRIPE_PRICE_HARDCOPY_YEARLY',
};

// Groups the flat plan keys above into the shape the Subscribe page renders:
// one card per product, one price per billing interval.
export const PRODUCTS = {
  online: { monthly: 'online_monthly', yearly: 'online_yearly' },
  hardcopy: { monthly: 'hardcopy_monthly', yearly: 'hardcopy_yearly' },
};

// Resolved product -> price lookups, kept for the life of a warm instance so a
// repeat checkout (or plan lookup) does not pay for the extra round trip.
// Shared by api/checkout.js and lib/account.js's planForPriceId below, so
// there is exactly one cache and one resolution path for "what does this env
// var actually point to in Stripe" — not one per caller.
const priceCache = new Map();

// The env vars accept either a Price id (price_…) or a Product id (prod_…).
// A Product is only a name; the amount and interval live on its Price, so a
// prod_ id has to be resolved before it can go in line_items.
export async function resolvePriceId(stripe, configured) {
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

// Reverse lookup: given a Stripe price id from an active subscription, find
// which of the four sellable plan keys it corresponds to, so the Subscribe
// page can show a member which plan they actually hold instead of asking
// them to pick one again.
export async function planForPriceId(stripe, priceId) {
  for (const [planKey, envName] of Object.entries(PRICE_ENV)) {
    const configured = process.env[envName];
    if (!configured) continue;

    try {
      const resolved = await resolvePriceId(stripe, configured);
      if (resolved === priceId) {
        const [product, interval] = planKey.split('_');
        return { product, interval };
      }
    } catch (err) {
      // A misconfigured price/product for this one plan key shouldn't fail
      // the whole lookup — just skip it and keep checking the others.
      console.error(`[plans] could not resolve ${envName}: ${err.message}`);
    }
  }
  return null;
}
