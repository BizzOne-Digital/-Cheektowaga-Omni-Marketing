// MongoDB indexes, created by the app on first connect (lib/db.ts) and by `pnpm seed`.
// No imports here: scripts/seed.mjs loads this file directly with Node.
type IndexSpec = [collection: string, keys: Record<string, 1 | -1>, options?: { unique?: boolean; sparse?: boolean; expireAfterSeconds?: number }]

export const indexes: IndexSpec[] = [
  ['admins', { email: 1 }, { unique: true }],
  ['sessions', { expiresAt: 1 }, { expireAfterSeconds: 0 }],
  ['rate_limits', { expiresAt: 1 }, { expireAfterSeconds: 0 }],
  ['products', { sortOrder: 1 }],
  ['orders', { number: 1 }, { unique: true }],
  ['orders', { 'payment.checkoutSessionId': 1 }, { unique: true, sparse: true }],
  ['orders', { 'payment.paymentIntentId': 1 }, { sparse: true }],
  ['orders', { createdAt: -1 }],
  ['orders', { 'payment.status': 1, createdAt: -1 }],
  ['orders', { fulfillment: 1, createdAt: -1 }],
  ['inquiries', { status: 1, createdAt: -1 }],
  ['inquiries', { createdAt: -1 }],
  ['banners', { sortOrder: 1 }],
  ['banners', { key: 1 }, { unique: true, sparse: true }],
  ['stored_uploads', { folder: 1, filename: 1 }, { unique: true }],
  ['products', { 'images.src': 1 }], // upload cleanup: "is this image still used?"
  ['banners', { src: 1 }],
  ['stripe_events', { createdAt: 1 }, { expireAfterSeconds: 90 * 24 * 3600 }],
]
