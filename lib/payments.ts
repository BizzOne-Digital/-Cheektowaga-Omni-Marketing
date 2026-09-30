import 'server-only'
import Stripe from 'stripe'
import { getProduct } from './products'

// Payment provider boundary. To swap Stripe for another processor, replace the
// body of createCheckout / getCheckout — the API routes and UI only use these two.

export type Customer = { name: string; email: string; phone: string; address: string; city: string; postal: string; country: string }
export type OrderInput = { productId: string; quantity: number; customer: Customer }

const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY) : null
export const paymentsEnabled = () => stripe !== null

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

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
  return { productId: product.id, quantity, customer: Object.fromEntries(fields.map((f) => [f, c[f].trim()])) as Customer }
}

export async function createCheckout(order: OrderInput, origin: string) {
  if (!stripe) throw new Error('not_configured')
  const product = getProduct(order.productId)!
  const { customer } = order
  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    customer_email: customer.email,
    line_items: [
      {
        quantity: order.quantity,
        price_data: {
          currency: 'usd',
          unit_amount: product.priceCents,
          product_data: { name: `${product.name} — ${product.finish}`, description: product.line },
        },
      },
    ],
    phone_number_collection: { enabled: false },
    metadata: {
      product_id: product.id,
      customer_name: customer.name,
      customer_phone: customer.phone,
      ship_to: `${customer.address}, ${customer.city} ${customer.postal}, ${customer.country}`,
    },
    success_url: `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/checkout/cancel`,
  })
  return session.url!
}

export async function getCheckout(sessionId: string) {
  if (!stripe) return null
  try {
    const s = await stripe.checkout.sessions.retrieve(sessionId)
    return { paid: s.payment_status === 'paid', email: s.customer_email, total: s.amount_total ?? 0, name: s.metadata?.customer_name }
  } catch {
    return null
  }
}
