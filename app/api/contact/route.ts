import { NextResponse } from 'next/server'
import { notify } from '@/lib/notify'

// Forwards enquiries (contact form + offer claims) to CONTACT_WEBHOOK_URL
// (e.g. Formspree, Zapier, Make). Without it the form reports it is not connected.
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as Record<string, unknown> | null
  const clean = Object.fromEntries(
    Object.entries(body ?? {})
      .filter(([, v]) => typeof v === 'string')
      .map(([k, v]) => [k.slice(0, 40), (v as string).trim().slice(0, 2000)]),
  )
  if (!clean.name || !clean.message || !EMAIL.test(clean.email ?? ''))
    return NextResponse.json({ error: 'Please complete name, a valid email and message.' }, { status: 400 })

  const result = await notify(clean)
  if (result === 'not_configured') return NextResponse.json({ error: 'not_configured' }, { status: 503 })
  if (result === 'failed') return NextResponse.json({ error: 'Message could not be delivered. Please email us directly.' }, { status: 502 })
  return NextResponse.json({ ok: true })
}
