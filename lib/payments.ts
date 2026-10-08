import 'server-only'
import Stripe from 'stripe'
import { getProduct, money, PRICING_CONFIRMED } from './products'
import { shipCountries, site } from './site'

// Payment provider boundary. To swap Stripe for another processor, replace the bodies
// below — the API routes and UI only use these exports.

export type Customer = { name: string; email: string; phone: string; address: string; city: string; postal: string; country: string }
export type OrderInput = { productId: string; quantity: number; customer: Customer }

const key = process.env.STRIPE_SECRET_KEY?.trim()
// Secret (sk_) or restricted (rk_) keys only. A publishable key here is a config mistake.
const validKey = !!key && /^(sk|rk)_(test|live)_/.test(key)
if (key && !validKey) console.error('[stripe] STRIPE_SECRET_KEY must start with sk_ or rk_ — payments disabled.')

const stripe = validKey ? new Stripe(key!) : null
export const isLiveMode = validKey && key!.includes('_live_')

// Optional Stripe Shipping Rate (Dashboard → Product catalog → Shipping rates), e.g. shr_123.
const shippingRate = process.env.STRIPE_SHIPPING_RATE_ID?.trim() || null
export const shippingAtCheckout = !!shippingRate

// Sales tax via Stripe Tax. Turn on (STRIPE_AUTOMATIC_TAX=true) only after the origin address and
// tax registrations are set up in Stripe → Tax. Prices are then tax-exclusive and Stripe adds tax
// at checkout from the customer's billing address.
export const taxAtCheckout = process.env.STRIPE_AUTOMATIC_TAX?.trim().toLowerCase() === 'true'

/**
 * Why checkout can't run, or null if it can.
 * Live mode is refused while catalog prices are still placeholders, so real cards are never
 * charged a provisional price.
 */
export function paymentsBlocked(): string | null {
  if (!stripe) return 'Stripe is not configured (STRIPE_SECRET_KEY missing or invalid).'
  if (isLiveMode && !PRICING_CONFIRMED) return 'Live mode is blocked until PRICING_CONFIRMED = true in lib/products.ts.'
  return null
}

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const COUNTRIES = new Set(shipCountries.map(([code]) => code))

// Never trust the client: price always comes from the server-side catalog.
export function parseOrder(body: unknown): OrderInput | string {
  const b = body as Partial<OrderInput> | null
  const product = b?.productId ? getProduct(b.productId) : undefined
  if (!product) return 'Unknown product.'
  const quantity = Number(b?.quantity)
  if (!Number.isInteger(quantity) || quantity < 1 || quantity > 10) return 'Quantity must be between 1 and 10.'
  const c = b?.customer ?? ({} as Customer)
  const fields = ['name', 'email', 'phone', 'address', 'city', 'postal', 'country'] as const
  for (const f of fields) if (typeof c[f] !== 'string' || !c[f].trim() || c[f].length > 200) return `Missing ${f}.`
  if (!EMAIL.test(c.email)) return 'Invalid email.'
  if (!COUNTRIES.has(c.country.trim().toUpperCase())) return 'We don’t ship to that country yet.'
  const customer = Object.fromEntries(fields.map((f) => [f, c[f].trim()])) as Customer
  customer.country = customer.country.toUpperCase()
  return { productId: product.id, quantity, customer }
}

export async function createCheckout(order: OrderInput, requestOrigin: string) {
  if (!stripe) throw new Error('not_configured')
  const product = getProduct(order.productId)!
  const { customer } = order
  // Prefer the configured public URL so redirects never depend on the request's Host header.
  const origin = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') || requestOrigin
  // Each value stays well under Stripe's 500-char metadata limit (inputs are capped at 200).
  const metadata = {
    product_id: product.id,
    quantity: String(order.quantity),
    customer_name: customer.name,
    customer_phone: customer.phone,
    ship_line1: customer.address,
    ship_city: customer.city,
    ship_postal: customer.postal,
    ship_country: customer.country,
  }

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    customer_email: customer.email,
    line_items: [
      {
        quantity: order.quantity,
        price_data: {
          currency: 'usd',
          unit_amount: product.priceCents,
          ...(taxAtCheckout && { tax_behavior: 'exclusive' as const }),
          product_data: { name: `${product.name} — ${product.finish}`, description: product.line, metadata: { product_id: product.id } },
        },
      },
    ],
    ...(shippingRate && { shipping_options: [{ shipping_rate: shippingRate }] }),
    ...(taxAtCheckout && { automatic_tax: { enabled: true }, billing_address_collection: 'required' as const }),
    payment_intent_data: {
      description: `${site.name}: ${product.name} × ${order.quantity}`,
      // Structured shipping shows on the payment in the Stripe Dashboard and in receipts.
      shipping: {
        name: customer.name,
        phone: customer.phone,
        address: { line1: customer.address, city: customer.city, postal_code: customer.postal, country: customer.country },
      },
      metadata,
    },
    metadata,
    success_url: `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/checkout/cancel`,
  })
  return session.url!
}

export type CheckoutStatus = { state: 'paid' | 'processing' | 'unpaid'; email: string | null; total: number; name?: string }

export async function getCheckout(sessionId: string): Promise<CheckoutStatus | null> {
  if (!stripe || !/^cs_(test|live)_[A-Za-z0-9]+$/.test(sessionId)) return null
  try {
    const s = await stripe.checkout.sessions.retrieve(sessionId)
    const state = s.payment_status === 'paid' || s.payment_status === 'no_payment_required' ? 'paid' : s.status === 'complete' ? 'processing' : 'unpaid'
    return { state, email: s.customer_details?.email ?? s.customer_email, total: s.amount_total ?? 0, name: s.metadata?.customer_name }
  } catch {
    return null
  }
}

/** Verifies a webhook signature. Throws if the payload wasn't sent by Stripe. */
export function verifyWebhook(rawBody: string, signature: string | null) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET?.trim()
  if (!stripe || !secret) throw new Error('not_configured')
  if (!signature) throw new Error('missing signature')
  return stripe.webhooks.constructEvent(rawBody, signature, secret)
}

/** Plain-text order summary for the owner notification. */
export function describeSession(s: Stripe.Checkout.Session) {
  const product = getProduct(s.metadata?.product_id ?? '')
  const m = s.metadata ?? {}
  return [
    `${product ? `${product.name} — ${product.finish}` : s.metadata?.product_id} × ${s.metadata?.quantity ?? '?'}`,
    `Total paid: ${money(s.amount_total ?? 0)} ${s.currency?.toUpperCase() ?? ''}`,
    `Customer: ${s.metadata?.customer_name ?? s.customer_details?.name ?? ''} · ${s.customer_details?.email ?? s.customer_email ?? ''} · ${s.metadata?.customer_phone ?? ''}`,
    `Ship to: ${[m.ship_line1, m.ship_city, m.ship_postal, m.ship_country].filter(Boolean).join(', ')}`,
    `Stripe session: ${s.id}`,
  ].join('\n')
}
