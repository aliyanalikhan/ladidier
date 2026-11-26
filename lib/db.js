import { neon } from '@neondatabase/serverless';

let _sql = null;

// Connecting at module scope throws when the environment variable is absent,
// which takes the entire serverless function down before any handler can run —
// Vercel surfaces that as a bare FUNCTION_INVOCATION_FAILED with nothing in the logs.
// Constructing lazily lets each handler catch it and report what is actually missing.
function getSql() {
  if (!_sql) {
    const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL;
    if (!connectionString) {
      throw new Error('DATABASE_URL (or POSTGRES_URL) is not set');
    }
    _sql = neon(connectionString);
  }
  return _sql;
}

export const sql = (...args) => getSql()(...args);
sql.query = (...args) => getSql().query(...args);

// DDL statements that define the schema for Phase 7. Exactly one table: users.
// ACCT-02 relies on the unique constraint on google_sub as the conflict target
// for atomic upserts during Google sign-in.
// LINK-01 adds stripe_customer_id as a unique constraint.
export const SCHEMA_SQL = [
  `create table if not exists users (
    id bigint generated always as identity primary key,
    google_sub text not null unique,
    email text not null,
    name text,
    picture text,
    created_at timestamptz not null default now(),
    last_login_at timestamptz not null default now()
  )`,
  `alter table users add column if not exists stripe_customer_id text unique;`,
  `create table if not exists addresses (
    user_id bigint primary key references users(id),
    line1 text,
    city text,
    state text,
    postal_code text,
    country text
  )`,
  `create table if not exists signups (
    email text primary key,
    country text not null,
    created_at timestamptz not null default now(),
    gift_sent_at timestamptz
  )`
];

let _schemaPromise = null;

// Memoised in a module-level promise so the DDL check costs at most one round
// trip per warm instance lifecycle. If the query fails, reset the memo to null
// before rethrowing so a transient startup failure does not permanently poison
// the warm container for subsequent requests.
export function ensureSchema() {
  if (!_schemaPromise) {
    _schemaPromise = (async () => {
      for (const statement of SCHEMA_SQL) {
        await sql.query(statement);
      }
    })().catch((err) => {
      _schemaPromise = null;
      throw err;
    });
  }
  return _schemaPromise;
}

// Upsert a user on Google sign-in. Sign-in is the only user write path; doing an
// atomic upsert keyed on google_sub guarantees that two simultaneous sign-in
// callbacks from multiple tabs never create duplicate records (ACCT-02).
export async function upsertUser({ sub, email, name, picture }) {
  const rows = await sql`
    insert into users (google_sub, email, name, picture)
    values (${sub}, ${email}, ${name ?? null}, ${picture ?? null})
    on conflict (google_sub)
    do update set
      email = excluded.email,
      name = coalesce(excluded.name, users.name),
      picture = coalesce(excluded.picture, users.picture),
      last_login_at = now()
    returning id, email, name
  `;
  return rows[0];
}

// Retrieve a user record including their stripe_customer_id.
export async function getUserById(id) {
  const rows = await sql`
    select id, google_sub, email, name, picture, stripe_customer_id
    from users
    where id = ${id}
  `;
  return rows[0] || null;
}

// Link a Stripe Customer ID to a user account, ensuring it is only written once.
// Returns the stripe_customer_id that won the write.
export async function setStripeCustomerId(userId, customerId) {
  const rows = await sql`
    update users
    set stripe_customer_id = ${customerId}
    where id = ${userId} and stripe_customer_id is null
    returning stripe_customer_id
  `;
  return rows[0] ? rows[0].stripe_customer_id : null;
}

// Retrieve the saved delivery address for a user.
export async function getAddress(userId) {
  const rows = await sql`
    select line1, city, state, postal_code, country
    from addresses
    where user_id = ${userId}
  `;
  return rows[0] || null;
}

// Upsert the saved delivery address for a user.
export async function upsertAddress(userId, { line1, city, state, postal_code, country }) {
  const rows = await sql`
    insert into addresses (user_id, line1, city, state, postal_code, country)
    values (${userId}, ${line1}, ${city}, ${state}, ${postal_code}, ${country})
    on conflict (user_id)
    do update set
      line1 = excluded.line1,
      city = excluded.city,
      state = excluded.state,
      postal_code = excluded.postal_code,
      country = excluded.country
    returning line1, city, state, postal_code, country
  `;
  return rows[0];
}

