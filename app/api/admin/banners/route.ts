import { ObjectId } from 'mongodb'
import { adminRoute } from '@/lib/admin-api'
import { bannerDto, bannerFields, type BannerFields } from '@/lib/banners'
import { cols, type BannerDoc } from '@/lib/db'
import { body, HttpError, list, objectId, ok } from '@/lib/validate'

export const GET = adminRoute(async () => {
  const items = await (await cols()).banners.find().sort({ sortOrder: 1, _id: 1 }).toArray()
  return ok({ items: items.map(bannerDto) })
})

export const POST = adminRoute(async (req) => {
  const b = await body(req)
  const fields = Object.fromEntries(Object.entries(bannerFields).map(([k, parse]) => [k, parse(b[k])])) as BannerFields
  const { banners } = await cols()
  const last = await banners.find().sort({ sortOrder: -1 }).limit(1).next()
  const now = new Date()
  const doc: BannerDoc = { _id: new ObjectId(), ...fields, sortOrder: (last?.sortOrder ?? -1) + 1, createdAt: now, updatedAt: now }
  await banners.insertOne(doc)
  return ok(bannerDto(doc), 201)
})

// Reorder: { order: [id, id, ...] } in display order.
export const PUT = adminRoute(async (req) => {
  const ids = list((await body(req)).order, 'Order', 1, 50).map((id) => objectId(String(id)))
  const { banners } = await cols()
  if ((await banners.countDocuments({ _id: { $in: ids } })) !== ids.length) throw new HttpError(409, 'Banners changed. Reload and try again.')
  const now = new Date()
  await banners.bulkWrite(ids.map((_id, i) => ({ updateOne: { filter: { _id }, update: { $set: { sortOrder: i, updatedAt: now } } } })))
  return ok({ ok: true })
})
