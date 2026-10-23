import { adminRoute } from '@/lib/admin-api'
import { cols } from '@/lib/db'
import { parseProduct, PRODUCT_ID } from '@/lib/product-input'
import { cleanupUploads } from '@/lib/uploads'
import { body, HttpError, int, ok } from '@/lib/validate'

const productId = (id: string) => {
  if (!PRODUCT_ID.test(id)) throw new HttpError(404, 'Product not found.')
  return id
}

export const GET = adminRoute<{ id: string }>(async (_req, { id }) => {
  const p = await (await cols()).products.findOne({ _id: productId(id) })
  if (!p) throw new HttpError(404, 'Product not found.')
  const { _id, createdAt, updatedAt, ...rest } = p
  return ok({ ...rest, id: _id, createdAt: createdAt.toISOString(), updatedAt: updatedAt.toISOString() })
})

/**
 * Updates the fields sent. A stock change must include `expectedStock` (the value the editor loaded):
 * if an order reserved units in the meantime, the save is refused instead of overwriting the count.
 */
export const PATCH = adminRoute<{ id: string }>(async (req, { id }) => {
  const b = await body(req)
  const fields = parseProduct(b, true)
  const filter: { _id: string; stock?: number } = { _id: productId(id) }
  if (fields.stock !== undefined) filter.stock = int(b.expectedStock, 'Expected stock', 0, 100_000)

  const { products } = await cols()
  const { video, ...set } = fields
  const clearVideo = 'video' in b && !video // empty video field removes it
  const before = await products.findOneAndUpdate(
    filter,
    { $set: { ...set, ...(video && { video }), updatedAt: new Date() }, ...(clearVideo && { $unset: { video: '' as const } }) },
    { returnDocument: 'before', projection: { images: 1 } },
  )
  if (!before) {
    if (await products.findOne({ _id: filter._id }, { projection: { _id: 1 } }))
      throw new HttpError(409, 'Stock changed while you were editing (an order may have come in). Reload the product and try again.')
    throw new HttpError(404, 'Product not found.')
  }
  // Images removed or replaced in this save: delete their stored uploads unless used elsewhere.
  if (set.images) {
    const kept = new Set(set.images.map((i) => i.src))
    await cleanupUploads(before.images.map((i) => i.src).filter((src) => !kept.has(src)))
  }
  return ok({ ok: true })
})

export const DELETE = adminRoute<{ id: string }>(async (_req, { id }) => {
  const { products } = await cols()
  // The storefront is built around at least one product.
  if ((await products.countDocuments({}, { limit: 2 })) < 2) throw new HttpError(409, "This is the only product. Add another before deleting it.")
  const deleted = await products.findOneAndDelete({ _id: productId(id) }, { projection: { images: 1 } })
  if (!deleted) throw new HttpError(404, 'Product not found.')
  await cleanupUploads(deleted.images.map((i) => i.src))
  return ok({ ok: true }) // past orders keep their own name and price snapshot
})
