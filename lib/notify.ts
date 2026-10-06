import 'server-only'

// Sends a JSON payload to CONTACT_WEBHOOK_URL (Formspree, Zapier, Make, own API).
// Used by the contact form, offer claims and Stripe paid-order alerts.
export async function notify(payload: Record<string, unknown>): Promise<'sent' | 'not_configured' | 'failed'> {
  const hook = process.env.CONTACT_WEBHOOK_URL
  if (!hook) return 'not_configured'
  const res = await fetch(hook, {
    method: 'POST',
    headers: { 'content-type': 'application/json', accept: 'application/json' },
    body: JSON.stringify({ ...payload, submittedAt: new Date().toISOString() }),
  }).catch(() => null)
  return res?.ok ? 'sent' : 'failed'
}
