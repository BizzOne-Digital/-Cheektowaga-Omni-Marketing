import type { Filter } from 'mongodb'
import { adminRoute } from '@/lib/admin-api'
import { cols, type ProductDoc } from '@/lib/db'
import { parseProduct, PRODUCT_ID } from '@/lib/product-input'
import { LOW_STOCK } from '@/lib/statuses'
import { body, HttpError, ok, paging, search } from '@/lib/validate'

// ?q= name/model/id · ?stock=in_stock|low|sold_out · ?category= · ?page=
export const GET = adminRoute(async (req) => {
  const sp = new URL(req.url).searchParams
  const { page, limit, skip } = paging(sp)
  const q = search(sp)
  const stock = sp.get('stock')
  const category = sp.get('category')?.slice(0, 60)

  const filter: Filter<ProductDoc> = {}
  if (q) filter.$or = [{ name: q }, { model: q }, { _id: q as never }]
  if (stock === 'sold_out') filter.stock = { $lte: 0 }
  if (stock === 'low') filter.stock = { $gt: 0, $lte: LOW_STOCK }
  if (stock === 'in_stock') filter.stock = { $gt: 0 }
  if (category) filter.category = category

  const { products } = await cols()
  const [items, total, categories] = await Promise.all([
    products.find(filter).sort({ sortOrder: 1, _id: 1 }).skip(skip).limit(limit).toArray(),
    products.countDocuments(filter),
    products.distinct('category'),
  ])
  return ok({
    items: items.map((p) => ({
      id: p._id,
      name: p.name,
      model: p.model,
      finish: p.finish,
      category: p.category,
      priceCents: p.priceCents,
      stock: p.stock,
      sortOrder: p.sortOrder,
      image: p.images[0] ?? null,
      updatedAt: p.updatedAt.toISOString(),
    })),
    categories: categories.filter(Boolean).sort(),
    total,
    page,
    pages: Math.max(1, Math.ceil(total / limit)),
  })
})

export const POST = adminRoute(async (req) => {
  const b = await body(req)
  const id = typeof b.id === 'string' ? b.id.trim() : ''
  if (!PRODUCT_ID.test(id)) throw new HttpError(400, 'Product ID must be 1–40 lowercase letters, numbers or dashes (used in links and orders).')
  const fields = parseProduct(b, false) as Omit<ProductDoc, '_id' | 'createdAt' | 'updatedAt'>
  const now = new Date()
  try {
    await (await cols()).products.insertOne({ ...fields, _id: id, createdAt: now, updatedAt: now })
  } catch (err) {
    if ((err as { code?: number }).code === 11000) throw new HttpError(409, `A product with ID "${id}" already exists.`)
    throw err
  }
  return ok({ id }, 201)
})
