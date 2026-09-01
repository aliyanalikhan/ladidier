import { getUserById, setStripeCustomerId } from './db.js';
import { ACTIVE_STATUSES } from './membership.js';

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
// to respect Stripe API rate limits.
const statusCache = new Map();

export async function checkUserActiveMembership({ userId, stripe }) {
  const user = await getUserById(userId);
  if (!user || !user.stripe_customer_id) {
    return false;
  }

  const cacheKey = user.stripe_customer_id;
  const cached = statusCache.get(cacheKey);
  if (cached && cached.expires > Date.now()) {
    return cached.active;
  }

  try {
    const { data: subscriptions } = await stripe.subscriptions.list({
      customer: user.stripe_customer_id,
      status: 'all',
      limit: 5,
    });

    const active = subscriptions.some((sub) => ACTIVE_STATUSES.has(sub.status));
    
    // Cache the result for 60 seconds
    statusCache.set(cacheKey, {
      active,
      expires: Date.now() + 60 * 1000,
    });

    return active;
  } catch (err) {
    console.error('[stripe] Error fetching subscriptions:', err.message);
    return false;
  }
}
