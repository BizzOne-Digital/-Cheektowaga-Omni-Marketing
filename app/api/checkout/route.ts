import { NextResponse } from 'next/server'
import { blockedCountry, createCheckout, parseOrder, paymentsBlocked, US_ONLY_MESSAGE } from '@/lib/payments'

export async function POST(req: Request) {
  const country = blockedCountry(req.headers)
  if (country) {
    console.warn('[checkout] geoblocked:', country)
    return NextResponse.json({ error: US_ONLY_MESSAGE }, { status: 403 })
  }

  const order = parseOrder(await req.json().catch(() => null))
  if (typeof order === 'string') return NextResponse.json({ error: order }, { status: 400 })

  const blocked = paymentsBlocked()
  if (blocked) {
    // Reason goes to server logs only; the shopper sees the "email this order" fallback.
    console.warn('[checkout] blocked:', blocked)
    return NextResponse.json({ error: 'not_configured' }, { status: 503 })
  }

  try {
    const url = await createCheckout(order, new URL(req.url).origin)
    return NextResponse.json({ url })
  } catch (err) {
    const e = err as { type?: string; statusCode?: number; message?: string }
    console.error(`[checkout] Stripe session failed: ${e.type ?? 'Error'} (${e.statusCode ?? '-'}) ${e.message ?? err}`)
    return NextResponse.json({ error: 'Payment could not be started. Please try again.' }, { status: 502 })
  }
}
