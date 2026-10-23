import { adminRoute } from '@/lib/admin-api'
import { cols } from '@/lib/db'
import { orderRow } from '@/lib/orders'
import { paymentsBlocked } from '@/lib/payments'
import { LOW_STOCK } from '@/lib/statuses'
import { ok } from '@/lib/validate'

const DAY = 86_400_000

// Dashboard overview: everything here is computed from the database (and server config), nothing is hardcoded.
export const GET = adminRoute(async () => {
  const { orders, inquiries, products } = await cols()
  const since30 = new Date(Date.now() - 30 * DAY)
  const since7 = new Date(Date.now() - 7 * DAY)
  const paidStates = { $in: ['paid', 'partially_refunded'] as ('paid' | 'partially_refunded')[] }

  const [revenue, toFulfil, awaitingPayment, failed7, newInquiries, stock, recent] = await Promise.all([
    orders
      .aggregate<{ cents: number; count: number }>([
        { $match: { 'payment.status': paidStates, 'payment.paidAt': { $gte: since30 } } },
        { $group: { _id: null, cents: { $sum: { $subtract: [{ $ifNull: ['$payment.amountTotalCents', 0] }, { $ifNull: ['$payment.amountRefundedCents', 0] }] } }, count: { $sum: 1 } } },
      ])
      .toArray(),
    orders.countDocuments({ 'payment.status': paidStates, fulfillment: { $in: ['unfulfilled', 'processing'] } }),
    orders.countDocuments({ 'payment.status': { $in: ['pending', 'processing'] } }),
    orders.countDocuments({ 'payment.status': 'failed', updatedAt: { $gte: since7 } }),
    inquiries.countDocuments({ status: 'new' }),
    products.find({}, { projection: { name: 1, stock: 1 } }).sort({ sortOrder: 1 }).toArray(),
    orders.find().sort({ createdAt: -1 }).limit(6).toArray(),
  ])

  return ok({
    revenue30Cents: revenue[0]?.cents ?? 0,
    paidOrders30: revenue[0]?.count ?? 0,
    toFulfil,
    awaitingPayment,
    failed7,
    newInquiries,
    products: stock.map((p) => ({ id: p._id, name: p.name, stock: p.stock, state: p.stock <= 0 ? 'sold_out' : p.stock <= LOW_STOCK ? 'low' : 'ok' })),
    recent: recent.map(orderRow),
    setup: {
      payments: paymentsBlocked(), // null when checkout can run
      webhook: !!process.env.STRIPE_WEBHOOK_SECRET?.trim(),
      notifications: !!process.env.CONTACT_WEBHOOK_URL,
    },
  })
})
