// Email signup. Environment (Vercel):
//   RESEND_API_KEY    required to send any email
//   SIGNUP_NOTIFY_TO  owner address told about each new signup; also the reply-to
//   SIGNUP_FROM       sender on a Resend-verified domain; needed to email readers
//   EBOOK_URL         download link for international readers
import { sql, ensureSchema } from '../lib/db.js';
import { parseSignup, welcomeEmail } from '../lib/signup.js';

async function sendEmail(message) {
  if (!process.env.RESEND_API_KEY) return false;
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: process.env.SIGNUP_FROM || 'LaDidiér <onboarding@resend.dev>',
        ...message,
      }),
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) console.error('[signup] email rejected:', res.status, await res.text());
    return res.ok;
  } catch (err) {
    console.error('[signup] email failed:', err.message);
    return false;
  }
}

// shortcut: only a honeypot against bots, add rate limiting or double opt-in if abused.
export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'Invalid JSON' }, { status: 400 });
  }
  if (body?.website) return Response.json({ sent: true });

  const signup = parseSignup(body);
  if (!signup) {
    return Response.json({ error: 'Enter a valid email and country, and tick the box.' }, { status: 400 });
  }
  const { email, country, countryName } = signup;

  try {
    await ensureSchema();
    const added = await sql`
      insert into signups (email, country) values (${email}, ${country})
      on conflict (email) do nothing returning email
    `;
    // The stored country decides the email, and each address is emailed only once.
    const [row] = await sql`select country, gift_sent_at from signups where email = ${email}`;

    let sent = Boolean(row.gift_sent_at);
    const welcome = welcomeEmail(row.country, process.env);
    if (!sent && welcome) {
      sent = await sendEmail({ to: email, reply_to: process.env.SIGNUP_NOTIFY_TO, ...welcome });
      if (sent) await sql`update signups set gift_sent_at = now() where email = ${email}`;
    }

    if (added.length && process.env.SIGNUP_NOTIFY_TO) {
      await sendEmail({
        to: process.env.SIGNUP_NOTIFY_TO,
        subject: `New LaDidiér signup (${countryName})`,
        text: `Email: ${email}\nCountry: ${countryName}\nEmail to reader: ${sent ? 'sent' : 'NOT sent, please follow up manually'}`,
      });
    }

    return Response.json({ sent });
  } catch (err) {
    console.error('[signup] error:', err.message);
    return Response.json({ error: 'We could not save your signup. Please try again.' }, { status: 500 });
  }
}
