import { NextResponse } from 'next/server'
import { createCheckout, parseOrder, paymentsEnabled } from '@/lib/payments'

export async function POST(req: Request) {
  const order = parseOrder(await req.json().catch(() => null))
  if (typeof order === 'string') return NextResponse.json({ error: order }, { status: 400 })
  if (!paymentsEnabled()) return NextResponse.json({ error: 'not_configured' }, { status: 503 })
  try {
    const url = await createCheckout(order, new URL(req.url).origin)
    return NextResponse.json({ url })
  } catch (err) {
    console.error('checkout failed', err)
    return NextResponse.json({ error: 'Payment could not be started. Please try again.' }, { status: 502 })
  }
}
