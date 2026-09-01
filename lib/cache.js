// A single bounded TTL cache implementation, shared by every Stripe-derived
// active/inactive memo in this codebase (the legacy entitlement memo in
// lib/membership.js and the account status memo in lib/account.js). Both
// cache the same kind of thing — a boolean — with the same shape of risk
// (an unbounded stream of distinct keys growing a warm instance's memory
// forever), so one implementation, instantiated twice, replaces two
// hand-rolled memos that previously drifted in field names and eviction.
export function createTtlCache({ ttlMs, maxEntries }) {
  const store = new Map();

  return {
    get(key) {
      const entry = store.get(key);
      if (!entry) return undefined;
      if (entry.expiresAt <= Date.now()) {
        store.delete(key);
        return undefined;
      }
      return entry.value;
    },
    set(key, value) {
      if (!store.has(key) && store.size >= maxEntries) {
        // A Map iterates in insertion order, so the first key it yields is
        // the oldest inserted entry.
        const oldestKey = store.keys().next().value;
        store.delete(oldestKey);
      }
      store.set(key, { value, expiresAt: Date.now() + ttlMs });
    },
  };
}
