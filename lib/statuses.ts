// Status values and labels shared by the API and the admin UI.

// Verified by Stripe webhooks only. An admin can never set these.
export const PAYMENT_STATUSES = ['pending', 'processing', 'paid', 'failed', 'expired', 'refunded', 'partially_refunded'] as const
export type PaymentStatus = (typeof PAYMENT_STATUSES)[number]
export const paymentLabel: Record<PaymentStatus, string> = {
  pending: 'Awaiting payment',
  processing: 'Processing',
  paid: 'Paid',
  failed: 'Failed',
  expired: 'Abandoned',
  refunded: 'Refunded',
  partially_refunded: 'Part refunded',
}

export const FULFILLMENT_STATUSES = ['unfulfilled', 'processing', 'shipped', 'delivered', 'cancelled'] as const
export type FulfillmentStatus = (typeof FULFILLMENT_STATUSES)[number]
export const fulfillmentLabel: Record<FulfillmentStatus, string> = {
  unfulfilled: 'Unfulfilled',
  processing: 'Processing',
  shipped: 'Shipped',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
}

// Allowed admin moves. Processing/shipped/delivered also need a paid order (checked on the server).
// Cancel is allowed until shipped, once Stripe has settled the payment (not while it's pending).
export const nextFulfillment: Record<FulfillmentStatus, FulfillmentStatus[]> = {
  unfulfilled: ['processing', 'cancelled'],
  processing: ['shipped', 'cancelled'],
  shipped: ['delivered'],
  delivered: [],
  cancelled: [],
}

export const INQUIRY_STATUSES = ['new', 'read', 'in_progress', 'resolved'] as const
export type InquiryStatus = (typeof INQUIRY_STATUSES)[number]
export const inquiryLabel: Record<InquiryStatus, string> = { new: 'New', read: 'Read', in_progress: 'In progress', resolved: 'Resolved' }

export const LOW_STOCK = 3
