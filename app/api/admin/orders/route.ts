import type { Filter } from 'mongodb'
import { adminRoute } from '@/lib/admin-api'
import { cols, type OrderDoc } from '@/lib/db'
import { orderRow } from '@/lib/orders'
import { FULFILLMENT_STATUSES, PAYMENT_STATUSES } from '@/lib/statuses'
import { dateRange, ok, paging, search } from '@/lib/validate'

// Orders and the Payments view share this list.
// ?q= order number, customer name/email, Stripe session or payment id · ?payment= · ?fulfillment= · ?from=&to= · ?page=
export const GET = adminRoute(async (req) => {
  const sp = new URL(req.url).searchParams
  const { page, limit, skip } = paging(sp)
  const q = search(sp)
  const payment = sp.get('payment')
  const fulfillment = sp.get('fulfillment')

  const filter: Filter<OrderDoc> = { ...dateRange(sp) }
  if (PAYMENT_STATUSES.includes(payment as never)) filter['payment.status'] = payment as OrderDoc['payment']['status']
  if (FULFILLMENT_STATUSES.includes(fulfillment as never)) filter.fulfillment = fulfillment as OrderDoc['fulfillment']
  if (q)
    filter.$or = [
      { number: q },
      { 'customer.name': q },
      { 'customer.email': q },
      { 'payment.checkoutSessionId': q },
      { 'payment.paymentIntentId': q },
    ]

  const { orders } = await cols()
  const [items, total] = await Promise.all([
    orders.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).toArray(),
    orders.countDocuments(filter),
  ])
  return ok({ items: items.map(orderRow), total, page, pages: Math.max(1, Math.ceil(total / limit)) })
})
