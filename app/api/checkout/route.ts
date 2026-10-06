import { NextResponse } from 'next/server'
import { createCheckout, parseOrder, paymentsBlocked } from '@/lib/payments'

export async function POST(req: Request) {
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
