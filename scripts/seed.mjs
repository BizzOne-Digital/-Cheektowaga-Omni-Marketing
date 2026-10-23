// Initialises MongoDB Atlas from the site's existing data. Safe to re-run: it only adds what's missing.
//   corepack pnpm seed                         (reads .env.local)
//   corepack pnpm seed -- --overwrite-products (also re-syncs product copy, specs and images from lib/products.ts;
//                                               stock and display order are kept, since the dashboard owns them)
// Seeds: indexes, the first admin (ADMIN_EMAIL / ADMIN_PASSWORD), products from lib/products.ts, the home promo
// banner from lib/site.ts, and the editable copy defaults from lib/content.ts. Never seeds orders, enquiries or
// payments, never deletes anything, and never changes an existing admin's password.
import { MongoClient, ObjectId } from 'mongodb'
import { contentDefaults } from '../lib/content.ts'
import { indexes } from '../lib/indexes.ts'
import { hashPassword, passwordProblem } from '../lib/password.ts'
import { products } from '../lib/products.ts'
import { site } from '../lib/site.ts'

const overwriteProducts = process.argv.includes('--overwrite-products')
const uri = process.env.MONGODB_URI?.trim()
const dbName = process.env.MONGODB_DB?.trim() || 'smartwatch'
if (!uri) {
  console.error('MONGODB_URI is not set. Add it to .env.local (see .env.example).')
  process.exit(1)
}

const summary = []
const note = (what, created, updated, skipped) => summary.push({ what, created, updated, skipped })
const client = new MongoClient(uri, { serverSelectionTimeoutMS: 10_000 })

try {
  await client.connect()
  const db = client.db(dbName)
  console.log(`Connected to database "${dbName}".`)

  await Promise.all(indexes.map(([name, keys, options]) => db.collection(name).createIndex(keys, options ?? {})))
  console.log(`Indexes ensured (${indexes.length}).`)

  // Admin: created once, never reset.
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase()
  const problem = !email ? 'ADMIN_EMAIL is not set' : passwordProblem(process.env.ADMIN_PASSWORD)
  if (problem) {
    console.warn(`Admin skipped: ${problem}.`)
    note('admin', 0, 0, 1)
  } else if (await db.collection('admins').findOne({ email }, { projection: { _id: 1 } })) {
    note('admin', 0, 0, 1)
  } else {
    await db.collection('admins').insertOne({ _id: new ObjectId(), email, passwordHash: await hashPassword(process.env.ADMIN_PASSWORD), createdAt: new Date() })
    note('admin', 1, 0, 0)
  }

  // Products: keyed by their existing id (e.g. "vl16-pro").
  let pc = 0, pu = 0, ps = 0
  for (const { id, stock, sortOrder, ...rest } of products) {
    const now = new Date()
    const update = overwriteProducts
      ? { $set: { ...rest, updatedAt: now }, $setOnInsert: { stock, sortOrder, createdAt: now } }
      : { $setOnInsert: { ...rest, stock, sortOrder, createdAt: now, updatedAt: now } }
    const res = await db.collection('products').updateOne({ _id: id }, update, { upsert: true })
    if (res.upsertedCount) pc++
    else if (res.modifiedCount) pu++
    else ps++
  }
  note('products', pc, pu, ps)

  // Home promo banner (the image that used to be hard-coded in lib/site.ts).
  const banner = await db.collection('banners').updateOne(
    { key: 'promo-main' },
    {
      $setOnInsert: {
        _id: new ObjectId(),
        key: 'promo-main',
        src: site.promoBanner,
        alt: 'VL16 Pro Smartwatch, affordable smart watches. Heart rate monitoring, fitness tracking, smart notifications, long battery life. $125 USD.',
        href: '/watches',
        width: 1600,
        height: 576,
        enabled: true,
        sortOrder: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    },
    { upsert: true },
  )
  note('banners', banner.upsertedCount, 0, banner.upsertedCount ? 0 : 1)

  // Editable copy: today's text as the starting point.
  const settings = await db.collection('settings').updateOne({ _id: 'content' }, { $setOnInsert: { ...contentDefaults, updatedAt: new Date() } }, { upsert: true })
  note('content settings', settings.upsertedCount, 0, settings.upsertedCount ? 0 : 1)

  console.table(summary)
  console.log('Seed complete.')
} catch (err) {
  console.error('Seed failed:', err instanceof Error ? err.message : err)
  process.exitCode = 1
} finally {
  await client.close()
}
