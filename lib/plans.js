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
