import { getStripe } from '../lib/stripe.js';

export async function POST(request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) {
    console.error('[stripe] STRIPE_WEBHOOK_SECRET is not set');
    return new Response('Webhook not configured', { status: 500 });
  }

  let stripe;
  try {
    stripe = getStripe();
  } catch (err) {
    // 500 rather than 400 on purpose: Stripe retries 5xx for up to three days,
    // so events survive a misconfiguration instead of being dropped as invalid.
    console.error(`[stripe] ${err.message}`);
    return new Response('Webhook not configured', { status: 500 });
  }

  // Signature verification needs the exact bytes Stripe sent. Read the body as
  // text and do not parse it first — any reserialisation breaks the signature.
  const raw = await request.text();
  const signature = request.headers.get('stripe-signature');

  let event;
  try {
    event = await stripe.webhooks.constructEventAsync(raw, signature, secret);
  } catch (err) {
    console.error(`[stripe] signature verification failed: ${err.message}`);
    return new Response(`Webhook Error: ${err.message}`, { status: 400 });
  }

  // Access is re-checked on each return via /api/verify-session, so there is no
  // entitlement store to write to and these branches are an audit trail today.
  // Stripe redelivers events and does not guarantee order — if you add real
  // side effects here, dedupe on event.id and return 200 before the slow work.
  switch (event.type) {
    // completed fires as soon as checkout finishes, which for delayed-notification
    // methods is BEFORE the money arrives — hence the payment_status gate.
    // async_payment_succeeded is the one that fires when those later settle.
    case 'checkout.session.completed':
    case 'checkout.session.async_payment_succeeded': {
      const session = event.data.object;
      if (session.payment_status === 'unpaid') {
        console.log(`[stripe] ${event.type} session=${session.id} still unpaid — not fulfilling`);
        break;
      }
      console.log(
        `[stripe] FULFILL session=${session.id} status=${session.payment_status} ` +
        `customer=${session.customer} email=${session.customer_details?.email}`
      );
      break;
    }
    case 'checkout.session.async_payment_failed': {
      const session = event.data.object;
      console.warn(`[stripe] async payment FAILED session=${session.id} customer=${session.customer}`);
      break;
    }
    case 'invoice.paid':
    case 'invoice.payment_succeeded': {
      const invoice = event.data.object;
      console.log(`[stripe] invoice paid invoice=${invoice.id} customer=${invoice.customer}`);
      break;
    }
    case 'invoice.payment_failed': {
      const invoice = event.data.object;
      console.warn(`[stripe] invoice payment FAILED invoice=${invoice.id} customer=${invoice.customer}`);
      break;
    }
    case 'customer.subscription.deleted': {
      const subscription = event.data.object;
      console.log(`[stripe] subscription ended subscription=${subscription.id} customer=${subscription.customer}`);
      break;
    }
    default:
      console.log(`[stripe] unhandled event ${event.type}`);
  }

  return Response.json({ received: true });
}
