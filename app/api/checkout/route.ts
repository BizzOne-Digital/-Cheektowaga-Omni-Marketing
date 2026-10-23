import { NextResponse } from 'next/server'
import { abandonOrder, attachSession, reserveOrder } from '@/lib/orders'
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

  // Stock is checked and reserved in the database here, so a stale page can't buy a sold-out watch.
  let placed
  try {
    placed = await reserveOrder(order)
  } catch (err) {
    console.error('[checkout] database unavailable:', (err as Error).message)
    return NextResponse.json({ error: 'not_configured' }, { status: 503 })
  }
  if (typeof placed === 'string') return NextResponse.json({ error: placed }, { status: placed === 'Unknown product.' ? 400 : 409 })

  try {
    const session = await createCheckout(order, placed, new URL(req.url).origin)
    await attachSession(placed.orderId, session.id).catch((err) => console.error('[checkout] could not store session id:', err.message))
    return NextResponse.json({ url: session.url })
  } catch (err) {
    await abandonOrder(placed.orderId).catch((e) => console.error('[checkout] could not release stock:', e.message))
    const e = err as { type?: string; statusCode?: number; message?: string }
    console.error(`[checkout] Stripe session failed: ${e.type ?? 'Error'} (${e.statusCode ?? '-'}) ${e.message ?? err}`)
    return NextResponse.json({ error: 'Payment could not be started. Please try again.' }, { status: 502 })
  }
}
