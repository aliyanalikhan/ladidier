import { getUserById, setStripeCustomerId } from './db.js';
import { ACTIVE_STATUSES } from './membership.js';
import { createTtlCache } from './cache.js';

// Idempotently create or retrieve a Stripe Customer linked to a given user.
export async function ensureStripeCustomer({ userId, email, name, stripe }) {
  let user = await getUserById(userId);
  if (!user) {
    throw new Error('User not found');
  }

  // If already linked, reuse the existing Stripe customer
  if (user.stripe_customer_id) {
    return user.stripe_customer_id;
  }

  // Idempotently create a new customer in Stripe
  const customer = await stripe.customers.create(
    {
      email,
      name,
      metadata: { user_id: String(userId) },
    },
    {
      idempotencyKey: `create-cust-${userId}`,
    }
  );

  // Attempt to write the customer ID.
  const wonId = await setStripeCustomerId(userId, customer.id);
  
  if (wonId) {
    return wonId;
  }

  // If wonId is null, a concurrent checkout beat us to the update.
  // Re-read the user row to get the winner's customer ID.
  user = await getUserById(userId);
  return user.stripe_customer_id;
}

// In-memory cache for subscription status per serverless instance
// to respect Stripe API rate limits. Same 60-second freshness window and
// per-instance scope as the legacy entitlement memo in lib/membership.js;
// a separate instance keeps Stripe-customer-id keys from ever colliding
// with that memo's checkout-session-id keys.
const statusCache = createTtlCache({ ttlMs: 60 * 1000, maxEntries: 500 });

// A customer holding several abandoned or incomplete checkouts alongside one
// genuinely active subscription can push that active row outside a bounded
// all-statuses page — the subscription is real, but invisible. Querying once
// per status in ACTIVE_STATUSES, filtered server-side, removes that window:
// a single hit at limit 1 for any granting status is proof enough. Kept
// cache-free and separately exported so the Stripe query is independently
// verifiable with a stub; checkUserActiveMembership owns caching as its own
// concern.
export async function hasActiveSubscription({ customerId, stripe }) {
  const results = await Promise.all(
    [...ACTIVE_STATUSES].map((status) =>
      stripe.subscriptions.list({ customer: customerId, status, limit: 1 })
    )
  );
  return results.some(({ data }) => data.length > 0);
}

export async function checkUserActiveMembership({ userId, stripe }) {
  const user = await getUserById(userId);
  if (!user || !user.stripe_customer_id) {
    return false;
  }

  const cacheKey = user.stripe_customer_id;
  const cached = statusCache.get(cacheKey);
  if (cached !== undefined) {
    return cached;
  }

  try {
    const active = await hasActiveSubscription({ customerId: user.stripe_customer_id, stripe });

    // Cache the result for 60 seconds
    statusCache.set(cacheKey, active);

    return active;
  } catch (err) {
    console.error('[stripe] Error fetching subscriptions:', err.message);
    return false;
  }
}
