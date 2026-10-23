import 'server-only'
import { randomBytes } from 'node:crypto'
import { ObjectId } from 'mongodb'
import type Stripe from 'stripe'
import { cols, type OrderDoc } from './db'
import { paymentMethod, type OrderInput, type PlacedOrder } from './payments'
import { nextFulfillment, type FulfillmentStatus, type PaymentStatus } from './statuses'
import { HttpError } from './validate'

type Cols = Awaited<ReturnType<typeof cols>>

// Stock flow: checkout reserves units with one atomic conditional $inc (never below zero, no overselling
// from stale pages). Expired/failed payments and cancelled unshipped orders put them back exactly once
// (guarded by stockReserved). Steps are ordered so a crash between them under-counts stock, never oversells.

const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
const newOrderNumber = () => 'ASW-' + Array.from(randomBytes(8), (b) => ALPHABET[b % 32]).join('')

/** Reserves stock and records a pending order. Returns an error message for the shopper instead when it can't. */
export async function reserveOrder(order: OrderInput): Promise<PlacedOrder | string> {
  const c = await cols()
  const now = new Date()
  const product = await c.products.findOneAndUpdate(
    { _id: order.productId, stock: { $gte: order.quantity } },
    { $inc: { stock: -order.quantity }, $set: { updatedAt: now } },
    { returnDocument: 'after' },
  )
  if (!product) {
    const p = await c.products.findOne({ _id: order.productId }, { projection: { name: 1, stock: 1 } })
    if (!p) return 'Unknown product.'
    return p.stock <= 0 ? `${p.name} is sold out.` : `Only ${p.stock} left. Please lower the quantity.`
  }

  const _id = new ObjectId()
  const number = newOrderNumber()
  try {
    await c.orders.insertOne({
      _id,
      number,
      productId: product._id,
      productName: `${product.name} — ${product.finish}`,
      unitPriceCents: product.priceCents,
      quantity: order.quantity,
      subtotalCents: product.priceCents * order.quantity,
      customer: order.customer,
      payment: { provider: 'stripe', status: 'pending', updatedAt: now },
      fulfillment: 'unfulfilled',
      stockReserved: true,
      history: [{ at: now, kind: 'stock', to: `reserved ${order.quantity}`, by: 'checkout' }],
      createdAt: now,
      updatedAt: now,
    })
  } catch (err) {
    await c.products.updateOne({ _id: product._id }, { $inc: { stock: order.quantity } })
    throw err
  }
  const { name, finish, line, priceCents } = product
  return { orderId: _id.toHexString(), number, product: { id: product._id, name, finish, line, priceCents } }
}

export async function attachSession(orderId: string, sessionId: string) {
  await (await cols()).orders.updateOne({ _id: new ObjectId(orderId) }, { $set: { 'payment.checkoutSessionId': sessionId, updatedAt: new Date() } })
}

/** Stripe never got the order (session creation failed): return the stock and drop the record. */
export async function abandonOrder(orderId: string) {
  const c = await cols()
  const _id = new ObjectId(orderId)
  await releaseStock(c, _id, 'checkout', 'payment could not start')
  await c.orders.deleteOne({ _id, 'payment.checkoutSessionId': { $exists: false } })
}

async function releaseStock(c: Cols, _id: ObjectId, by: string, note: string) {
  const now = new Date()
  const order = await c.orders.findOneAndUpdate(
    { _id, stockReserved: true },
    { $set: { stockReserved: false, updatedAt: now }, $push: { history: { at: now, kind: 'stock', to: 'released', by, note } } },
  )
  if (order) await c.products.updateOne({ _id: order.productId }, { $inc: { stock: order.quantity }, $set: { updatedAt: now } })
}

/* ---------------- Stripe webhooks (the only writer of payment status) ---------------- */

/** Applies a verified Stripe event once. Returns false for a duplicate delivery. */
export async function applyStripeEvent(event: Stripe.Event): Promise<boolean> {
  const c = await cols()
  try {
    await c.stripeEvents.insertOne({ _id: event.id, type: event.type, createdAt: new Date() })
  } catch (err) {
    if ((err as { code?: number }).code === 11000) return false
    throw err
  }
  try {
    await handleEvent(c, event)
    return true
  } catch (err) {
    await c.stripeEvents.deleteOne({ _id: event.id }).catch(() => {}) // let Stripe's retry process it again
    throw err
  }
}

async function handleEvent(c: Cols, event: Stripe.Event) {
  switch (event.type) {
    case 'checkout.session.completed': {
      const s = event.data.object
      const paid = s.payment_status === 'paid' || s.payment_status === 'no_payment_required'
      const order = await orderForSession(c, s, true)
      if (order) await setPayment(c, order, paid ? 'paid' : 'processing', paid ? ['pending', 'processing'] : ['pending'], s)
      break
    }
    case 'checkout.session.async_payment_succeeded': {
      const s = event.data.object
      const order = await orderForSession(c, s, true)
      if (order) await setPayment(c, order, 'paid', ['pending', 'processing'], s)
      break
    }
    case 'checkout.session.async_payment_failed':
    case 'checkout.session.expired': {
      const s = event.data.object
      const order = await orderForSession(c, s, false)
      const failed = event.type === 'checkout.session.async_payment_failed'
      if (order && (await setPayment(c, order, failed ? 'failed' : 'expired', failed ? ['pending', 'processing'] : ['pending'], s)))
        await releaseStock(c, order._id, 'stripe', failed ? 'payment failed' : 'checkout expired')
      break
    }
    case 'charge.refunded': {
      const charge = event.data.object
      const pi = typeof charge.payment_intent === 'string' ? charge.payment_intent : charge.payment_intent?.id
      const order = pi ? await c.orders.findOne({ 'payment.paymentIntentId': pi }) : null
      if (!order) break
      const full = charge.amount_refunded >= charge.amount
      const now = new Date()
      await c.orders.updateOne(
        { _id: order._id, 'payment.status': { $in: ['paid', 'partially_refunded'] } },
        {
          $set: { 'payment.status': full ? 'refunded' : 'partially_refunded', 'payment.amountRefundedCents': charge.amount_refunded, 'payment.updatedAt': now, updatedAt: now },
          $push: { history: { at: now, kind: 'payment', to: full ? 'refunded' : 'partially_refunded', by: 'stripe' } },
        },
      )
      break
    }
  }
}

async function orderForSession(c: Cols, s: Stripe.Checkout.Session, createIfMissing: boolean) {
  const m = s.metadata ?? {}
  const byId = m.order_id && /^[a-f0-9]{24}$/.test(m.order_id) ? await c.orders.findOne({ _id: new ObjectId(m.order_id) }) : null
  if (byId) return byId
  const bySession = await c.orders.findOne({ 'payment.checkoutSessionId': s.id })
  if (bySession || !createIfMissing || !m.product_id) return bySession

  // Paid session without a stored order (placed before the database was connected): record it from Stripe's metadata.
  const now = new Date()
  const quantity = Number(m.quantity) || 1
  const unit = Math.round((s.amount_subtotal ?? 0) / quantity)
  return c.orders.findOneAndUpdate(
    { 'payment.checkoutSessionId': s.id },
    {
      $setOnInsert: {
        _id: new ObjectId(),
        number: m.order_number || newOrderNumber(),
        productId: m.product_id,
        productName: m.product_name || m.product_id,
        unitPriceCents: unit,
        quantity,
        subtotalCents: s.amount_subtotal ?? 0,
        customer: {
          name: m.customer_name ?? s.customer_details?.name ?? '',
          email: s.customer_details?.email ?? s.customer_email ?? '',
          phone: m.customer_phone ?? '',
          address: m.ship_line1 ?? '',
          city: m.ship_city ?? '',
          state: m.ship_state ?? '',
          postal: m.ship_postal ?? '',
          country: m.ship_country ?? 'US',
        },
        payment: { provider: 'stripe', status: 'pending', checkoutSessionId: s.id, updatedAt: now },
        fulfillment: 'unfulfilled',
        stockReserved: false,
        history: [{ at: now, kind: 'payment', to: 'recorded from Stripe', by: 'stripe' }],
        createdAt: new Date((s.created ?? now.getTime() / 1000) * 1000),
        updatedAt: now,
      },
    },
    { upsert: true, returnDocument: 'after' },
  )
}

/** Moves payment status forward only from the listed states (Stripe can deliver events out of order). */
async function setPayment(c: Cols, order: OrderDoc, to: PaymentStatus, from: PaymentStatus[], s: Stripe.Checkout.Session) {
  const now = new Date()
  const pi = typeof s.payment_intent === 'string' ? s.payment_intent : s.payment_intent?.id
  const method = to === 'paid' && pi ? await paymentMethod(pi) : undefined
  const res = await c.orders.updateOne(
    { _id: order._id, 'payment.status': { $in: from } },
    {
      $set: {
        'payment.status': to,
        'payment.checkoutSessionId': s.id,
        'payment.livemode': s.livemode,
        'payment.updatedAt': now,
        ...(pi && { 'payment.paymentIntentId': pi }),
        ...(s.amount_total != null && { 'payment.amountTotalCents': s.amount_total }),
        ...(s.currency && { 'payment.currency': s.currency }),
        ...(method && { 'payment.method': method }),
        ...(to === 'paid' && { 'payment.paidAt': now }),
        ...(s.customer_details?.email && !order.customer.email && { 'customer.email': s.customer_details.email }),
        updatedAt: now,
      },
      $push: { history: { at: now, kind: 'payment', to, by: 'stripe' } },
    },
  )
  return res.modifiedCount > 0
}

/* ---------------- Admin views ---------------- */

export type OrderRow = ReturnType<typeof orderRow>
export const orderRow = (o: OrderDoc) => ({
  id: o._id.toHexString(),
  number: o.number,
  createdAt: o.createdAt.toISOString(),
  customerName: o.customer.name,
  customerEmail: o.customer.email,
  productName: o.productName,
  quantity: o.quantity,
  totalCents: o.payment.amountTotalCents ?? o.subtotalCents,
  currency: o.payment.currency ?? 'usd',
  paymentStatus: o.payment.status,
  method: o.payment.method ?? null,
  reference: o.payment.paymentIntentId ?? o.payment.checkoutSessionId ?? null,
  fulfillment: o.fulfillment,
})

export type OrderDetail = ReturnType<typeof orderDetail>
export const orderDetail = (o: OrderDoc, dashboard: string | null) => ({
  ...orderRow(o),
  productId: o.productId,
  unitPriceCents: o.unitPriceCents,
  subtotalCents: o.subtotalCents,
  customer: o.customer,
  payment: { ...o.payment, paidAt: o.payment.paidAt?.toISOString() ?? null, updatedAt: o.payment.updatedAt.toISOString(), dashboard },
  stockReserved: o.stockReserved,
  history: o.history.map((h) => ({ ...h, at: h.at.toISOString() })),
  updatedAt: o.updatedAt.toISOString(),
})

/* ---------------- Admin fulfilment ---------------- */

export async function updateFulfillment(id: ObjectId, to: FulfillmentStatus, by: string, note: string) {
  const c = await cols()
  const order = await c.orders.findOne({ _id: id })
  if (!order) throw new HttpError(404, 'Order not found.')
  if (!nextFulfillment[order.fulfillment].includes(to)) throw new HttpError(409, `An order that is ${order.fulfillment} can't move to ${to}.`)
  const settledPaid = order.payment.status === 'paid' || order.payment.status === 'partially_refunded'
  if (to !== 'cancelled' && !settledPaid) throw new HttpError(409, 'Only orders Stripe has confirmed as paid can be processed or shipped.')
  if (to === 'cancelled' && (order.payment.status === 'pending' || order.payment.status === 'processing'))
    throw new HttpError(409, 'The payment is still open in Stripe. Wait until it is paid, failed or expired before cancelling.')

  const now = new Date()
  const res = await c.orders.updateOne(
    { _id: id, fulfillment: order.fulfillment }, // fails if someone else changed it meanwhile
    { $set: { fulfillment: to, updatedAt: now }, $push: { history: { at: now, kind: 'fulfillment', to, by, ...(note && { note }) } } },
  )
  if (!res.modifiedCount) throw new HttpError(409, 'This order was just changed. Reload and try again.')
  if (to === 'cancelled') await releaseStock(c, id, by, 'order cancelled before shipping')
}
