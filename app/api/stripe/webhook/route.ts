import { NextResponse } from 'next/server'
import { dbConfigured } from '@/lib/db'
import { applyStripeEvent } from '@/lib/orders'
import { describeSession, verifyWebhook } from '@/lib/payments'
import { notify } from '@/lib/notify'

// Stripe → this endpoint. Add it in Dashboard → Developers → Webhooks:
//   URL: https://<your-domain>/api/stripe/webhook
//   Events: checkout.session.completed, checkout.session.async_payment_succeeded,
//           checkout.session.async_payment_failed, checkout.session.expired, charge.refunded
// This is the source of truth for paid orders — the success page can be skipped by the shopper.
// Verified events update the order's payment status in MongoDB (lib/orders.ts); nothing else can.
export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
  const raw = await req.text() // signature is computed over the exact raw body
  let event
  try {
    event = verifyWebhook(raw, req.headers.get('stripe-signature'))
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'invalid'
    if (msg === 'not_configured') {
      console.error('[stripe webhook] STRIPE_WEBHOOK_SECRET / STRIPE_SECRET_KEY not set')
      return NextResponse.json({ error: 'not configured' }, { status: 503 })
    }
    console.warn('[stripe webhook] rejected:', msg)
    return NextResponse.json({ error: 'invalid signature' }, { status: 400 })
  }

  if (dbConfigured) {
    try {
      // false = Stripe re-sent an event we already applied: skip it (and its alert).
      if (!(await applyStripeEvent(event))) return NextResponse.json({ received: true, duplicate: true })
    } catch (err) {
      console.error('[stripe webhook] could not record event', event.id, (err as Error).message)
      return NextResponse.json({ error: 'temporarily unavailable' }, { status: 500 }) // Stripe retries
    }
  }

  const session = event.data.object as Parameters<typeof describeSession>[0]
  let subject: string | null = null
  if (event.type === 'checkout.session.completed') {
    // Card payments are paid immediately; delayed methods (bank debits) arrive later as async_payment_succeeded.
    subject = session.payment_status === 'paid' ? 'Paid order' : null
    if (!subject) console.info('[stripe webhook] session completed, payment pending:', session.id)
  } else if (event.type === 'checkout.session.async_payment_succeeded') {
    subject = 'Paid order (delayed payment cleared)'
  } else if (event.type === 'checkout.session.async_payment_failed') {
    subject = 'Payment FAILED — do not ship'
  }

  if (subject) {
    const summary = describeSession(session)
    console.info(`[stripe webhook] ${subject}\n${summary}`)
    const result = await notify({
      type: subject,
      name: session.metadata?.customer_name ?? '',
      email: session.customer_details?.email ?? session.customer_email ?? '',
      phone: session.metadata?.customer_phone ?? '',
      message: summary,
    })
    if (result === 'failed') console.error('[stripe webhook] order alert could not be delivered to CONTACT_WEBHOOK_URL')
  }

  // Always 200 once verified, so Stripe doesn't retry events we've already logged.
  return NextResponse.json({ received: true })
}
