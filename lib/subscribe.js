// Saves a reader and sends the emails; used by the form and by Google sign-in.
// Environment (Vercel):
//   RESEND_API_KEY    required to send any email
//   SIGNUP_NOTIFY_TO  owner address told about each new signup; also the reply-to
//   SIGNUP_FROM       sender on a Resend-verified domain; needed to email readers
//   EBOOK_URL         download link for international readers
import { sql } from './db.js';
import { countryName, welcomeEmail } from './signup.js';

// Resolves to '' on success, otherwise the reason the email was not sent.
async function sendEmail(message) {
  if (!process.env.RESEND_API_KEY) return 'RESEND_API_KEY is not set';
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
    if (res.ok) return '';
    const reason = `Resend rejected it: ${res.status} ${await res.text()}`;
    console.error('[signup] email rejected:', reason);
    return reason;
  } catch (err) {
    console.error('[signup] email failed:', err.message);
    return err.message;
  }
}

// Call ensureSchema() first. Resolves to true once the reader has been emailed.
export async function subscribe(email, country, source) {
  const added = await sql`
    insert into signups (email, country) values (${email}, ${country})
    on conflict (email) do nothing returning email
  `;
  // The stored country decides the email, and each address is emailed only once.
  const [row] = await sql`select country, gift_sent_at from signups where email = ${email}`;

  let sent = Boolean(row.gift_sent_at);
  const welcome = welcomeEmail(row.country, process.env);
  let reason = 'EBOOK_URL is not set';
  if (!sent && welcome) {
    reason = await sendEmail({ to: email, reply_to: process.env.SIGNUP_NOTIFY_TO, ...welcome });
    sent = !reason;
    if (sent) await sql`update signups set gift_sent_at = now() where email = ${email}`;
  }

  if (added.length && process.env.SIGNUP_NOTIFY_TO) {
    const name = countryName(row.country);
    await sendEmail({
      to: process.env.SIGNUP_NOTIFY_TO,
      subject: `New LaDidiér signup (${name})`,
      text: `Email: ${email}\nCountry: ${name}\nSigned up with: ${source}\nEmail to reader: ${sent ? 'sent' : `NOT sent, please follow up manually
Reason: ${reason}`}`,
    });
  }

  return sent;
}
