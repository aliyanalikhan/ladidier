import assert from 'node:assert/strict';
import { parseSignup, welcomeEmail } from '../lib/signup.js';

const ok = { email: ' Reader@Example.com ', country: 'US', consent: true };
assert.equal(parseSignup(ok).email, 'reader@example.com');
for (const bad of [{ email: 'nope' }, { email: 'a@b.com,c@d.com' }, { country: 'usa' }, { country: 'QQ' }, { consent: 'on' }]) {
  assert.equal(parseSignup({ ...ok, ...bad }), null, JSON.stringify(bad));
}
assert.equal(parseSignup(null), null);

const env = { EBOOK_URL: 'https://example.com/book.pdf' };
assert.equal(welcomeEmail('US', {}).subject, 'Welcome to LaDidiér');
assert.doesNotMatch(welcomeEmail('US', env).text, /book\.pdf/);
assert.match(welcomeEmail('FR', env).text, /book\.pdf/);
assert.equal(welcomeEmail('FR', {}), null);
console.log('signup checks passed');
