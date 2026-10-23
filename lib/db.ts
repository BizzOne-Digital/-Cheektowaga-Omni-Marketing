import 'server-only'
import { MongoClient, type Binary, type Db, type ObjectId } from 'mongodb'
import type { ProductData } from './products'
import type { Content } from './content'
import { indexes } from './indexes'
import type { FulfillmentStatus, InquiryStatus, PaymentStatus } from './statuses'

// MongoDB Atlas. MONGODB_URI is server-only; the browser never talks to the database.
const uri = process.env.MONGODB_URI?.trim()
const dbName = process.env.MONGODB_DB?.trim() || 'smartwatch'
export const dbConfigured = !!uri

export type ProductDoc = Omit<ProductData, 'id'> & { _id: string; createdAt: Date; updatedAt: Date }
export type AdminDoc = { _id: ObjectId; email: string; passwordHash: string; createdAt: Date; lastLoginAt?: Date }
export type SessionDoc = { _id: string; adminId: ObjectId; expiresAt: Date; createdAt: Date }
export type RateLimitDoc = { _id: string; count: number; expiresAt: Date }
export type Customer = { name: string; email: string; phone: string; address: string; city: string; state: string; postal: string; country: string }
export type HistoryEntry = { at: Date; kind: 'payment' | 'fulfillment' | 'stock'; to: string; by: string; note?: string }
export type OrderDoc = {
  _id: ObjectId
  number: string // ASW-XXXXXXXX, shown to staff and in Stripe metadata
  productId: string
  productName: string // snapshot at order time
  unitPriceCents: number // snapshot from the server catalog, never from the client
  quantity: number
  subtotalCents: number
  customer: Customer
  // Provider-verified state. Only Stripe webhooks (or the checkout route on creation) write this.
  payment: {
    provider: 'stripe'
    status: PaymentStatus
    checkoutSessionId?: string
    paymentIntentId?: string
    amountTotalCents?: number
    amountRefundedCents?: number
    currency?: string
    method?: string // e.g. "visa •••• 4242"
    livemode?: boolean
    paidAt?: Date
    updatedAt: Date
  }
  fulfillment: FulfillmentStatus // internal, set by admins
  stockReserved: boolean // units taken from products.stock; flips false when they're put back
  history: HistoryEntry[]
  createdAt: Date
  updatedAt: Date
}
export type InquiryDoc = {
  _id: ObjectId
  name: string
  email: string
  phone: string
  message: string
  source: string
  status: InquiryStatus
  notes: string
  delivery: 'sent' | 'failed' | 'not_configured' | 'pending' // CONTACT_WEBHOOK_URL forward result
  createdAt: Date
  updatedAt: Date
}
export type BannerDoc = {
  _id: ObjectId
  key?: string // stable seed key
  src: string
  alt: string
  href: string
  width: number
  height: number
  enabled: boolean
  sortOrder: number
  createdAt: Date
  updatedAt: Date
}
export type SettingsDoc = Partial<Content> & { _id: 'content'; updatedAt: Date }
export type StoredUploadDoc = {
  _id: ObjectId
  folder: string
  filename: string
  mimeType: string
  size: number
  data: Binary
  createdAt: Date
  updatedAt: Date
}
export type StripeEventDoc ={ _id: string; type: string; createdAt: Date }

// One client per server instance, reused across requests, hot reloads and warm serverless invocations.
const g = globalThis as typeof globalThis & { _mongo?: Promise<Db> }

export function getDb(): Promise<Db> {
  if (!uri) return Promise.reject(new Error('MONGODB_URI is not set'))
  g._mongo ??= new MongoClient(uri, { serverSelectionTimeoutMS: 8000, maxPoolSize: 10 })
    .connect()
    .then(async (client) => {
      const db = client.db(dbName)
      await ensureIndexes(db)
      return db
    })
    .catch((err) => {
      g._mongo = undefined // retry on the next request instead of caching the failure
      throw err
    })
  return g._mongo
}

export async function cols() {
  const db = await getDb()
  return {
    products: db.collection<ProductDoc>('products'),
    orders: db.collection<OrderDoc>('orders'),
    inquiries: db.collection<InquiryDoc>('inquiries'),
    banners: db.collection<BannerDoc>('banners'),
    settings: db.collection<SettingsDoc>('settings'),
    admins: db.collection<AdminDoc>('admins'),
    sessions: db.collection<SessionDoc>('sessions'),
    rateLimits: db.collection<RateLimitDoc>('rate_limits'),
    stripeEvents: db.collection<StripeEventDoc>('stripe_events'),
    uploads: db.collection<StoredUploadDoc>('stored_uploads'),
  }
}

// createIndex is a no-op when the index already exists. Runs once per server instance.
const ensureIndexes = (db: Db) => Promise.all(indexes.map(([name, keys, options]) => db.collection(name).createIndex(keys, options ?? {})))
