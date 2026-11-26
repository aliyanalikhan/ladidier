import assert from 'node:assert/strict';
import { ipCountry, countryName, parseSignup, welcomeEmail } from '../lib/signup.js';

const from = (headers) => ipCountry(new Request('https://x.test', { headers }));
assert.equal(from({ 'x-vercel-ip-country': 'PK' }), 'PK');
assert.equal(from({}), 'ZZ');
assert.equal(from({ 'x-vercel-ip-country': 'T1' }), 'ZZ');
assert.equal(countryName('PK'), 'Pakistan');
assert.equal(countryName('ZZ'), 'Unknown country');

const ok = { email: ' Reader@Example.com ', consent: true };
assert.equal(parseSignup(ok), 'reader@example.com');
for (const bad of [{ email: 'nope' }, { email: 'a@b.com,c@d.com' }, { consent: 'on' }]) {
  assert.equal(parseSignup({ ...ok, ...bad }), null, JSON.stringify(bad));
}
assert.equal(parseSignup(null), null);

const env = { EBOOK_URL: 'https://example.com/book.pdf' };
assert.equal(welcomeEmail('US', {}).subject, 'Welcome to LaDidiér');
assert.doesNotMatch(welcomeEmail('US', env).text, /book\.pdf/);
assert.match(welcomeEmail('FR', env).text, /book\.pdf/);
assert.equal(welcomeEmail('FR', {}), null);
const two = { EBOOK_URL: ' https://example.com/a  https://example.com/b ' };
assert.match(welcomeEmail('FR', two).text, /\nhttps:\/\/example\.com\/a\nhttps:\/\/example\.com\/b\n/);
const { html } = welcomeEmail('FR', two);
assert.ok(html.includes('href="https://example.com/a"') && html.includes('href="https://example.com/b"'));
const odd = welcomeEmail('FR', { EBOOK_URL: 'example.com/c?x=1&y="' }).html;
assert.ok(odd.includes('href="https://example.com/c?x=1&amp;y=&quot;"'));
assert.ok(!welcomeEmail('US', env).html.includes('book.pdf'));
console.log('signup checks passed');
