// HTML version of the reader's welcome email: tables and inline styles only, for mail clients.
const SERIF = "Georgia, 'Times New Roman', serif";
const SANS = 'Helvetica, Arial, sans-serif';
const NUMERALS = ['I', 'II', 'III', 'IV', 'V'];

const escape = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const caps = (text, color = '#B89358') =>
  `<div style="font:11px ${SANS};letter-spacing:4px;text-transform:uppercase;color:${color};">${text}</div>`;

function ebookCard(url, i) {
  const href = escape(/^https?:\/\//i.test(url) ? url : `https://${url}`);
  const numeral = NUMERALS[i] ?? String(i + 1);
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 16px;border:1px solid #D7BC85;"><tr><td align="center" style="padding:28px 20px;">
${caps(`Volume ${numeral}`)}
<div style="font:italic 24px ${SERIF};color:#0A0807;padding:10px 0 20px;">Your complimentary ebook</div>
<a href="${href}" style="display:inline-block;background:#0A0807;color:#F4EFE6;font:bold 12px ${SANS};letter-spacing:3px;text-transform:uppercase;text-decoration:none;padding:15px 32px;border-radius:40px;">Open Volume ${numeral} &rarr;</a>
</td></tr></table>`;
}

export function emailHtml(links) {
  const intro = links.length
    ? 'A gift to begin with, chosen for you. Settle in, pour something lovely, and turn the first page.'
    : "You're on our list. Stories, places and objects chosen with a discerning eye will find you here.";
  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Welcome to LaDidiér</title></head>
<body style="margin:0;padding:0;background:#0A0807;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" bgcolor="#0A0807"><tr><td align="center" style="padding:32px 12px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;">
<tr><td align="center" bgcolor="#14110F" style="padding:44px 24px;border-bottom:3px solid #B89358;">
<div style="font:34px ${SERIF};letter-spacing:8px;color:#F4EFE6;">LADIDI&Eacute;R</div>
<div style="padding-top:12px;">${caps('The World, Curated')}</div>
</td></tr>
<tr><td bgcolor="#F4EFE6" style="padding:44px 32px 28px;">
<div style="font:34px/1.25 ${SERIF};color:#0A0807;text-align:center;">Live a little larger,<br><em style="color:#9A7740;">on purpose.</em></div>
<div style="font:16px/1.7 ${SANS};color:#2A241F;text-align:center;padding:20px 0 32px;">${intro}</div>
${links.map(ebookCard).join('\n')}
<div style="font:italic 17px ${SERIF};color:#2A241F;text-align:center;padding:16px 0 0;">With warmth,<br>LaDidi&eacute;r</div>
</td></tr>
<tr><td align="center" style="padding:24px;font:12px/1.7 ${SANS};color:#8A8278;">To stop receiving emails from us, reply with &ldquo;unsubscribe&rdquo;.</td></tr>
</table></td></tr></table></body></html>`;
}
