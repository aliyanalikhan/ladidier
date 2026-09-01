import { ensureSchema } from '../lib/db.js';

console.log('Running database setup and ensuring schema...');

try {
  await ensureSchema();
  console.log('Database schema applied successfully (users table ensured).');
  process.exit(0);
} catch (err) {
  console.error('Failed to apply database schema:', err);
  process.exit(1);
}
