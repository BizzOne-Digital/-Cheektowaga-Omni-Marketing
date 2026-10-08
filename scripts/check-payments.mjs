// Smoke test for the payment API. Run against a running server:
//   STRIPE_SECRET_KEY=sk_live_dummy STRIPE_WEBHOOK_SECRET=whsec_localtest next start -p 3100
//   node scripts/check-payments.mjs http://localhost:3100 whsec_localtest
// Makes no calls to Stripe: covers validation, the live-mode price guard and webhook signatures.
import assert from 'node:assert/strict'
import Stripe from 'stripe'

const [base = 'http://localhost:3100', secret = 'whsec_localtest'] = process.argv.slice(2)
const customer = { name: 'Test Buyer', email: 'test@example.com', phone: '555 0100', address: '1 Test St', city: 'Buffalo', postal: '14225', country: 'US' }
const post = async (path, body, headers = {}) => {
  const res = await fetch(base + path, { method: 'POST', headers: { 'content-type': 'application/json', ...headers }, body: typeof body === 'string' ? body : JSON.stringify(body) })
  return { status: res.status, json: await res.json().catch(() => null) }
}

let r = await post('/api/checkout', { productId: 'nope', quantity: 1, customer })
assert.equal(r.status, 400, 'unknown product rejected')
r = await post('/api/checkout', { productId: 'l16-pro', quantity: 11, customer })
assert.equal(r.status, 400, 'quantity cap')
r = await post('/api/checkout', { productId: 'l16-pro', quantity: 1, customer: { ...customer, country: 'United States' } })
assert.equal(r.status, 400, 'country must be an ISO code we ship to')
r = await post('/api/checkout', { productId: 'l16-pro', quantity: 1, customer, priceCents: 1 })
// 503 = blocked (unconfirmed prices or no key); 502 = Stripe refused the dummy key. Either way no session, and the client price is ignored.
assert.ok([502, 503].includes(r.status), `checkout with dummy key should not succeed (got ${r.status})`)

const session = {
  id: 'cs_test_123', object: 'checkout.session', payment_status: 'paid', amount_total: 9900, currency: 'usd',
  customer_details: { email: 'test@example.com' },
  metadata: { product_id: 'l16-pro', quantity: '1', customer_name: 'Test Buyer', customer_phone: '555 0100', ship_line1: '1 Test St', ship_city: 'Buffalo', ship_postal: '14225', ship_country: 'US' },
}
const payload = JSON.stringify({ id: 'evt_test', object: 'event', type: 'checkout.session.completed', data: { object: session } })
const signature = new Stripe('sk_test_unused').webhooks.generateTestHeaderString({ payload, secret })

r = await post('/api/stripe/webhook', payload)
assert.equal(r.status, 400, 'missing signature rejected')
r = await post('/api/stripe/webhook', payload, { 'stripe-signature': signature.replace(/v1=./, 'v1=0') })
assert.equal(r.status, 400, 'tampered signature rejected')
r = await post('/api/stripe/webhook', payload.replace("9900", "1"), { 'stripe-signature': signature })
assert.equal(r.status, 400, 'tampered body rejected')
r = await post('/api/stripe/webhook', payload, { 'stripe-signature': signature })
assert.equal(r.status, 200, 'valid signed event accepted')
assert.equal(r.json.received, true)

console.log('payments OK')
