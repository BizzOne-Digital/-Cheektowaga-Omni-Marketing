import { adminRoute } from '@/lib/admin-api'
import { bannerDto, bannerFields } from '@/lib/banners'
import { cols } from '@/lib/db'
import { cleanupUploads } from '@/lib/uploads'
import { body, HttpError, objectId, ok } from '@/lib/validate'

// Updates only the fields sent (e.g. { enabled: false } to hide a banner).
export const PATCH = adminRoute<{ id: string }>(async (req, { id }) => {
  const b = await body(req)
  const set = Object.fromEntries(Object.entries(bannerFields).filter(([k]) => k in b).map(([k, parse]) => [k, parse(b[k])]))
  const { banners } = await cols()
  const before = await banners.findOneAndUpdate({ _id: objectId(id) }, { $set: { ...set, updatedAt: new Date() } }, { returnDocument: 'before' })
  if (!before) throw new HttpError(404, 'Banner not found.')
  if (set.src && set.src !== before.src) await cleanupUploads([before.src]) // replaced image
  return ok(bannerDto({ ...before, ...set }))
})

export const DELETE = adminRoute<{ id: string }>(async (_req, { id }) => {
  const deleted = await (await cols()).banners.findOneAndDelete({ _id: objectId(id) })
  if (!deleted) throw new HttpError(404, 'Banner not found.')
  await cleanupUploads([deleted.src])
  return ok({ ok: true })
})
