import { ObjectId } from 'mongodb'
import { NextResponse } from 'next/server'
import { clientIp, rateLimit } from '@/lib/auth'
import { cols, dbConfigured } from '@/lib/db'
import { notify } from '@/lib/notify'

// Saves enquiries (contact form) to MongoDB for /admin/inquiries, then forwards them to
// CONTACT_WEBHOOK_URL (e.g. Formspree, Zapier, Make). A saved enquiry is never lost if forwarding fails.
// Without either, the form reports it is not connected.
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export async function POST(req: Request) {
  if (dbConfigured && !(await rateLimit('contact', clientIp(req), 5, 600).catch(() => true)))
    return NextResponse.json({ error: 'Too many messages. Please try again in a few minutes, or email us directly.' }, { status: 429 })

  const body = (await req.json().catch(() => null)) as Record<string, unknown> | null
  const clean = Object.fromEntries(
    Object.entries(body ?? {})
      .filter(([, v]) => typeof v === 'string')
      .map(([k, v]) => [k.slice(0, 40), (v as string).replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '').trim().slice(0, 2000)]),
  )
  // Honeypot: a hidden field people never fill. Bots get a normal-looking success and nothing is stored.
  const { website, ...fields } = clean
  if (website) return NextResponse.json({ ok: true })
  if (!fields.name || !fields.message || !EMAIL.test(fields.email ?? ''))
    return NextResponse.json({ error: 'Please complete name, a valid email and message.' }, { status: 400 })

  let saved: Awaited<ReturnType<typeof save>> | null = null
  if (dbConfigured) saved = await save(fields).catch((err) => (console.error('[contact] could not save enquiry:', err.message), null))

  const result = await notify(fields)
  if (saved) {
    await saved.markDelivery(result).catch(() => {})
    if (result === 'failed') console.error('[contact] enquiry saved but CONTACT_WEBHOOK_URL forward failed')
    return NextResponse.json({ ok: true })
  }
  if (result === 'not_configured') return NextResponse.json({ error: 'not_configured' }, { status: 503 })
  if (result === 'failed') return NextResponse.json({ error: 'Message could not be delivered. Please email us directly.' }, { status: 502 })
  return NextResponse.json({ ok: true })
}

async function save(f: Record<string, string>) {
  const { inquiries } = await cols()
  const now = new Date()
  const { insertedId } = await inquiries.insertOne({
    _id: new ObjectId(),
    name: f.name.slice(0, 200),
    email: f.email.slice(0, 200),
    phone: (f.phone ?? '').slice(0, 200),
    message: f.message,
    source: (f.type || 'Contact form').slice(0, 60),
    status: 'new',
    notes: '',
    delivery: 'pending',
    createdAt: now,
    updatedAt: now,
  })
  return { markDelivery: (delivery: 'sent' | 'failed' | 'not_configured') => inquiries.updateOne({ _id: insertedId }, { $set: { delivery } }) }
}
