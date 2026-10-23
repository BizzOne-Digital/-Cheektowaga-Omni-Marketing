// End-to-end check for the admin dashboard, against a running server and a THROWAWAY database
// (it writes test orders, enquiries and stock changes). Run after `pnpm seed` on that database:
//   MONGODB_URI=... MONGODB_DB=asw_test ADMIN_EMAIL=... ADMIN_PASSWORD=... SESSION_SECRET=... \
//   STRIPE_SECRET_KEY=sk_test_dummy STRIPE_WEBHOOK_SECRET=whsec_localtest CONTACT_WEBHOOK_URL=http://127.0.0.1:9/ next start -p 3100
//   (same env) node scripts/check-admin.mjs http://localhost:3100 whsec_localtest
// Makes no calls to Stripe's API with real keys.
import assert from 'node:assert/strict'
import { MongoClient, ObjectId } from 'mongodb'
import Stripe from 'stripe'

const [base = 'http://localhost:3100', secret = 'whsec_localtest'] = process.argv.slice(2)
const { MONGODB_URI, MONGODB_DB = 'smartwatch', ADMIN_EMAIL, ADMIN_PASSWORD } = process.env
assert.ok(MONGODB_URI && ADMIN_EMAIL && ADMIN_PASSWORD, 'set MONGODB_URI, ADMIN_EMAIL and ADMIN_PASSWORD (test database only)')
const origin = new URL(base).origin
let cookie = ''

async function req(path, { method = 'GET', body, headers = {}, auth = true, raw = false } = {}) {
  const res = await fetch(base + path, {
    method,
    redirect: 'manual',
    headers: { origin, ...(body && !raw && { 'content-type': 'application/json' }), ...(auth && cookie && { cookie }), ...headers },
    body: raw ? body : body && JSON.stringify(body),
  })
  const text = await res.text()
  let json = null
  try { json = JSON.parse(text) } catch {}
  return { status: res.status, json, text, headers: res.headers }
}
const html = async (path) => (await req(path, { auth: false })).text
const step = (name) => console.log(`✓ ${name}`)

const client = await new MongoClient(MONGODB_URI).connect()
const db = client.db(MONGODB_DB)

try {
  // Known start state, even after an aborted run (and repeated runs would otherwise hit the login rate limit).
  await db.collection('products').updateOne({ _id: 'vl16-pro' }, { $set: { stock: 0 } })
  await db.collection('rate_limits').deleteMany({})

  // --- auth
  assert.equal((await req('/api/admin/stats', { auth: false })).status, 401)
  const page = await req('/admin', { auth: false })
  assert.ok([307, 308].includes(page.status) && page.headers.get('location')?.endsWith('/admin/login'), 'dashboard redirects to login')
  assert.equal((await req('/api/admin/login', { method: 'POST', body: { email: ADMIN_EMAIL, password: 'wrong-password' } })).status, 401)
  assert.equal((await req('/api/admin/login', { method: 'POST', body: { email: ADMIN_EMAIL, password: ADMIN_PASSWORD }, headers: { origin: 'https://evil.example' } })).status, 403)
  const login = await req('/api/admin/login', { method: 'POST', body: { email: ADMIN_EMAIL, password: ADMIN_PASSWORD } })
  assert.equal(login.status, 200, login.text)
  const setCookie = login.headers.get('set-cookie') ?? ''
  assert.match(setCookie, /HttpOnly/i)
  assert.match(setCookie, /SameSite=strict/i)
  cookie = setCookie.split(';')[0]
  assert.equal((await req('/admin')).status, 200)
  step('auth: 401 without session, login redirect, bad password, cross-origin refused, HttpOnly SameSite cookie')

  // CSRF: a write with a foreign Origin is refused even with a valid cookie
  assert.equal((await req('/api/admin/content', { method: 'PUT', body: {}, headers: { origin: 'https://evil.example' } })).status, 403)
  step('csrf: cross-origin write refused')

  const stats = await req('/api/admin/stats')
  assert.equal(stats.status, 200)
  assert.ok(Array.isArray(stats.json.products) && stats.json.products.length >= 1)
  step('stats from database')

  // --- products: availability is driven by stock
  const list = await req('/api/admin/products?q=vl16')
  const p = list.json.items.find((x) => x.id === 'vl16-pro')
  assert.ok(p, 'seeded product listed')
  assert.match(await html('/watches'), /Sold Out/, 'stock 0 shows Sold Out')
  assert.equal((await req('/api/admin/products/vl16-pro', { method: 'PATCH', body: { stock: 3, expectedStock: 99 } })).status, 409, 'stale stock refused')
  assert.equal((await req('/api/admin/products/vl16-pro', { method: 'PATCH', body: { stock: -1, expectedStock: p.stock } })).status, 400, 'negative stock refused')
  assert.equal((await req('/api/admin/products/vl16-pro', { method: 'PATCH', body: { stock: 3, expectedStock: p.stock } })).status, 200)
  assert.match(await html('/watches'), /Buy Now/, 'stock 3 shows Buy Now')
  assert.equal((await req('/api/admin/products/vl16-pro', { method: 'PATCH', body: { priceCents: 1, name: '<script>' } })).status, 400, 'price below Stripe minimum refused')
  step('products: stock drives Sold Out / Buy Now on the site; stale, negative and invalid updates refused')

  // specs show on the product page
  const full = (await req('/api/admin/products/vl16-pro')).json
  const specs = [...full.specs, { label: 'Admin check', value: 'Spec saved from the dashboard' }]
  assert.equal((await req('/api/admin/products/vl16-pro', { method: 'PATCH', body: { specs } })).status, 200)
  assert.match(await html('/watches'), /Spec saved from the dashboard/)
  await req('/api/admin/products/vl16-pro', { method: 'PATCH', body: { specs: full.specs } })
  step('specs: saved spec appears on /watches')

  // create + delete
  const draft = { ...full, id: 'check-temp', name: 'Temp Check Watch', sortOrder: 999 }
  assert.equal((await req('/api/admin/products', { method: 'POST', body: draft })).status, 201)
  assert.equal((await req('/api/admin/products', { method: 'POST', body: draft })).status, 409, 'duplicate id refused')
  assert.equal((await req('/api/admin/products/check-temp', { method: 'DELETE' })).status, 200)
  assert.equal((await req('/api/admin/products/vl16-pro', { method: 'DELETE' })).status, 409, 'last product kept')
  step('products: create, duplicate refused, delete, last product protected')

  // --- banners + content show on the home page
  const banners = (await req('/api/admin/banners')).json.items
  assert.ok(banners.length >= 1)
  const b = banners[0]
  assert.equal((await req(`/api/admin/banners/${b.id}`, { method: 'PATCH', body: { href: 'javascript:alert(1)' } })).status, 400, 'unsafe link refused')
  assert.equal((await req(`/api/admin/banners/${b.id}`, { method: 'PATCH', body: { alt: 'Banner alt from admin check' } })).status, 200)
  assert.match(await html('/'), /Banner alt from admin check/)
  await req(`/api/admin/banners/${b.id}`, { method: 'PATCH', body: { enabled: false } })
  assert.doesNotMatch(await html('/'), /Banner alt from admin check/)
  await req(`/api/admin/banners/${b.id}`, { method: 'PATCH', body: { enabled: true, alt: b.alt } })
  step('banners: edit shows on home, disable hides it, unsafe link refused')

  const content = (await req('/api/admin/content')).json
  const edited = { ...content.content, taglineAccent: 'Freedom from admin.' }
  assert.equal((await req('/api/admin/content', { method: 'PUT', body: { ...edited, pillars: ['only one'] } })).status, 400, 'pillar count enforced')
  assert.equal((await req('/api/admin/content', { method: 'PUT', body: edited })).status, 200)
  assert.match(await html('/'), /Freedom from admin\./)
  await req('/api/admin/content', { method: 'PUT', body: content.content })
  step('content: saved copy shows on home; limits enforced')

  // --- contact form → enquiries
  const msg = `Check message ${Date.now()}`
  assert.equal((await req('/api/contact', { method: 'POST', auth: false, body: { type: 'Contact form', name: 'Check Person', email: 'check@example.com', message: msg } })).status, 200)
  assert.equal((await req('/api/contact', { method: 'POST', auth: false, body: { name: 'Bot', email: 'bot@example.com', message: 'spam', website: 'http://spam' } })).status, 200)
  const inq = (await req(`/api/admin/inquiries?q=${encodeURIComponent(msg)}`)).json
  assert.equal(inq.total, 1, 'saved even though the email forward failed')
  assert.equal(inq.items[0].delivery, 'failed')
  assert.equal((await req('/api/admin/inquiries?q=spam')).json.total, 0, 'honeypot not stored')
  assert.equal((await req(`/api/admin/inquiries/${inq.items[0].id}`, { method: 'PATCH', body: { status: 'resolved', notes: 'Called back' } })).status, 200)
  assert.equal((await req(`/api/admin/inquiries/${inq.items[0].id}`, { method: 'DELETE' })).status, 200)
  step('enquiries: saved when forwarding fails, honeypot dropped, status/notes/delete')

  // --- checkout: server-side stock guard
  const customer = { name: 'Test Buyer', email: 'test@example.com', phone: '555 0100', address: '1 Test St', city: 'Buffalo', state: 'NY', postal: '14225', country: 'US' }
  const buy = (quantity) => req('/api/checkout', { method: 'POST', auth: false, body: { productId: 'vl16-pro', quantity, customer } })
  let r = await buy(4)
  assert.equal(r.status, 409, 'more than in stock refused')
  r = await buy(1) // reserves, then the dummy Stripe key fails → stock must come back
  assert.equal(r.status, 502)
  assert.equal((await db.collection('products').findOne({ _id: 'vl16-pro' })).stock, 3, 'stock released when Stripe fails')
  step('checkout: over-quantity refused; reservation rolled back when payment can’t start')

  // --- webhook-driven payment states on stored orders
  const sign = (event) => {
    const payload = JSON.stringify(event)
    return { payload, sig: new Stripe('sk_test_unused').webhooks.generateTestHeaderString({ payload, secret }) }
  }
  const hook = ({ payload, sig }) => req('/api/stripe/webhook', { method: 'POST', auth: false, raw: true, body: payload, headers: { 'stripe-signature': sig, 'content-type': 'application/json' } })
  async function pendingOrder(qty) {
    const _id = new ObjectId()
    await db.collection('products').updateOne({ _id: 'vl16-pro' }, { $inc: { stock: -qty } }) // as checkout would
    await db.collection('orders').insertOne({
      _id, number: `ASW-CHK${String(Date.now()).slice(-5)}${qty}`, productId: 'vl16-pro', productName: 'VL16 Pro Smartwatch — Black', unitPriceCents: 12500, quantity: qty, subtotalCents: 12500 * qty, customer,
      payment: { provider: 'stripe', status: 'pending', checkoutSessionId: `cs_test_chk_${_id}`, updatedAt: new Date() }, fulfillment: 'unfulfilled', stockReserved: true, history: [], createdAt: new Date(), updatedAt: new Date(),
    })
    return _id
  }
  const session = (_id, extra) => ({ id: `cs_test_chk_${_id}`, object: 'checkout.session', livemode: false, amount_total: 12500, amount_subtotal: 12500, currency: 'usd', payment_intent: `pi_test_${_id}`, customer_details: { email: customer.email }, metadata: { order_id: String(_id) }, ...extra })

  const paidId = await pendingOrder(1)
  // An admin can't ship an unpaid order
  assert.equal((await req(`/api/admin/orders/${paidId}`, { method: 'PATCH', body: { fulfillment: 'processing' } })).status, 409)
  assert.equal((await req(`/api/admin/orders/${paidId}`, { method: 'PATCH', body: { fulfillment: 'cancelled' } })).status, 409, 'cannot cancel while payment open')
  const done = sign({ id: `evt_chk_paid_${paidId}`, object: 'event', type: 'checkout.session.completed', data: { object: session(paidId, { payment_status: 'paid', status: 'complete' }) } })
  assert.equal((await hook(done)).status, 200)
  assert.equal((await hook(done)).json.duplicate, true, 'duplicate event skipped')
  let o = (await req(`/api/admin/orders/${paidId}`)).json
  assert.equal(o.paymentStatus, 'paid')
  assert.equal(o.payment.paymentIntentId, `pi_test_${paidId}`)
  assert.equal((await req(`/api/admin/orders/${paidId}`, { method: 'PATCH', body: { fulfillment: 'shipped' } })).status, 409, 'cannot skip processing')
  assert.equal((await req(`/api/admin/orders/${paidId}`, { method: 'PATCH', body: { fulfillment: 'processing' } })).status, 200)
  assert.equal((await req(`/api/admin/orders/${paidId}`, { method: 'PATCH', body: { fulfillment: 'shipped', note: 'UPS 1Z999' } })).status, 200)
  assert.equal((await req(`/api/admin/orders/${paidId}`, { method: 'PATCH', body: { paymentStatus: 'refunded', fulfillment: 'delivered', priceCents: 1 } })).status, 200)
  o = (await req(`/api/admin/orders/${paidId}`)).json
  assert.equal(o.fulfillment, 'delivered')
  assert.equal(o.paymentStatus, 'paid', 'payment status not writable by admin')
  assert.equal(o.unitPriceCents, 12500, 'price not writable')
  const refund = sign({ id: `evt_chk_ref_${paidId}`, object: 'event', type: 'charge.refunded', data: { object: { id: 'ch_test', object: 'charge', amount: 12500, amount_refunded: 12500, payment_intent: `pi_test_${paidId}` } } })
  assert.equal((await hook(refund)).status, 200)
  assert.equal((await req(`/api/admin/orders/${paidId}`)).json.paymentStatus, 'refunded')
  step('orders: webhook marks paid (once), fulfilment rules enforced, payment/price not editable, refund recorded')

  const stockBefore = (await db.collection('products').findOne({ _id: 'vl16-pro' })).stock
  const expId = await pendingOrder(2)
  const expire = sign({ id: `evt_chk_exp_${expId}`, object: 'event', type: 'checkout.session.expired', data: { object: session(expId, { payment_status: 'unpaid', status: 'expired' }) } })
  assert.equal((await hook(expire)).status, 200)
  assert.equal((await req(`/api/admin/orders/${expId}`)).json.paymentStatus, 'expired')
  assert.equal((await db.collection('products').findOne({ _id: 'vl16-pro' })).stock, stockBefore, 'expired checkout returns stock')
  const payments = (await req(`/api/admin/orders?q=pi_test_${paidId}`)).json
  assert.equal(payments.total, 1, 'search by payment reference')
  step('payments: expired checkout releases reserved stock; search by Stripe reference')

  // --- image uploads stored in MongoDB
  const PNG = Buffer.from('89504e470d0a1a0a0000000d49484452000000010000000108060000001f15c4890000000d4944415478da63f8cfc0f01f0005000201a5f1b0b30000000049454e44ae426082', 'hex')
  const up = (bytes, type, folder = 'pages', auth = true) => {
    const fd = new FormData()
    fd.set('file', new Blob([bytes], { type }), 'x')
    fd.set('folder', folder)
    return req('/api/upload', { method: 'POST', raw: true, body: fd, auth })
  }
  assert.equal((await up(PNG, 'image/png', 'pages', false)).status, 401, 'upload needs admin')
  assert.equal((await up(PNG, 'image/png', 'banners')).status, 400, 'folder whitelist')
  assert.equal((await up(Buffer.from('<svg/>'), 'image/png')).status, 415, 'bytes must match type')
  assert.equal((await up(Buffer.from('hello'), 'text/plain')).status, 415, 'mime whitelist')
  assert.equal((await up(Buffer.concat([PNG, Buffer.alloc(8 * 1024 * 1024)]), 'image/png')).status, 413, '8 MB cap')
  const u1 = await up(PNG, 'image/png')
  assert.equal(u1.status, 201, u1.text)
  assert.equal(u1.json.success, true)
  assert.match(u1.json.url, /^\/api\/uploads\/pages\/\d{13}-[a-f0-9]{16}\.png$/)
  const got = await fetch(base + u1.json.url)
  assert.equal(got.status, 200)
  assert.equal(got.headers.get('content-type'), 'image/png')
  assert.equal(got.headers.get('cache-control'), 'public, max-age=31536000, immutable')
  assert.ok(Buffer.from(await got.arrayBuffer()).equals(PNG), 'same bytes back')
  for (const bad of ['/api/uploads/pages/..%2F..%2Fx.png', '/api/uploads/secret/' + u1.json.filename, '/api/uploads/pages/nope.png'])
    assert.equal((await fetch(base + bad)).status, 404, bad)

  // banner replace deletes the old upload; product removal deletes unless still used elsewhere
  const u2 = await up(PNG, 'image/png')
  await req(`/api/admin/banners/${b.id}`, { method: 'PATCH', body: { src: u1.json.url } })
  assert.match(await html('/'), new RegExp(u1.json.url))
  await req(`/api/admin/banners/${b.id}`, { method: 'PATCH', body: { src: u2.json.url } })
  assert.equal((await fetch(base + u1.json.url)).status, 404, 'replaced banner image deleted')
  const prod = (await req('/api/admin/products/vl16-pro')).json
  await req('/api/admin/products/vl16-pro', { method: 'PATCH', body: { images: [...prod.images, { src: u2.json.url, alt: 'shared' }] } })
  await req('/api/admin/products/vl16-pro', { method: 'PATCH', body: { images: prod.images } })
  assert.equal((await fetch(base + u2.json.url)).status, 200, 'image still used by the banner is kept')
  await req(`/api/admin/banners/${b.id}`, { method: 'PATCH', body: { src: b.src } })
  assert.equal((await fetch(base + u2.json.url)).status, 404, 'last reference gone → deleted')
  step('uploads: auth, folder/type/size checks, served from MongoDB with immutable cache, path tricks 404, replace/remove cleanup')

  // --- logout ends the session server-side
  assert.equal((await req('/api/admin/logout', { method: 'POST' })).status, 200)
  assert.equal((await req('/api/admin/stats')).status, 401)
  step('logout invalidates the session')

  // leave the product as seeded
  const now = (await db.collection('products').findOne({ _id: 'vl16-pro' })).stock
  await db.collection('products').updateOne({ _id: 'vl16-pro' }, { $set: { stock: 0 } })
  console.log(`admin OK (reset vl16-pro stock ${now} → 0)`)
} finally {
  await client.close()
}
