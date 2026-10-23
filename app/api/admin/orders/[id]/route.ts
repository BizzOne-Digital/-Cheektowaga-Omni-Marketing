import { adminRoute } from '@/lib/admin-api'
import { cols } from '@/lib/db'
import { orderDetail, updateFulfillment } from '@/lib/orders'
import { dashboardUrl } from '@/lib/payments'
import { FULFILLMENT_STATUSES } from '@/lib/statuses'
import { body, HttpError, objectId, ok, oneOf, text } from '@/lib/validate'

async function load(id: string) {
  const order = await (await cols()).orders.findOne({ _id: objectId(id) })
  if (!order) throw new HttpError(404, 'Order not found.')
  const pi = order.payment.paymentIntentId
  return orderDetail(order, pi ? dashboardUrl(pi, order.payment.livemode ?? false) : null)
}

export const GET = adminRoute<{ id: string }>(async (_req, { id }) => ok(await load(id)))

// Only the fulfilment status (plus an optional note, e.g. a tracking number) can change here.
// Prices, items and payment status are not editable: payment status comes from Stripe webhooks only.
export const PATCH = adminRoute<{ id: string }>(async (req, { id }, admin) => {
  const b = await body(req)
  const to = oneOf(b.fulfillment, 'Status', FULFILLMENT_STATUSES)
  const note = text(b.note, 'Note', 300, { required: false })
  await updateFulfillment(objectId(id), to, admin.email, note)
  return ok(await load(id))
})
