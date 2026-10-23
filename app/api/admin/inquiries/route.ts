import type { Filter } from 'mongodb'
import { adminRoute } from '@/lib/admin-api'
import { cols, type InquiryDoc } from '@/lib/db'
import { INQUIRY_STATUSES } from '@/lib/statuses'
import { dateRange, ok, paging, search } from '@/lib/validate'

// ?q= name/email/phone/message · ?status= · ?from=&to= · ?page=
export const GET = adminRoute(async (req) => {
  const sp = new URL(req.url).searchParams
  const { page, limit, skip } = paging(sp)
  const q = search(sp)
  const status = sp.get('status')

  const filter: Filter<InquiryDoc> = { ...dateRange(sp) }
  if (INQUIRY_STATUSES.includes(status as never)) filter.status = status as InquiryDoc['status']
  if (q) filter.$or = [{ name: q }, { email: q }, { phone: q }, { message: q }]

  const { inquiries } = await cols()
  const [items, total, unread] = await Promise.all([
    inquiries.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).toArray(),
    inquiries.countDocuments(filter),
    inquiries.countDocuments({ status: 'new' }),
  ])
  return ok({
    items: items.map(({ _id, createdAt, updatedAt, ...i }) => ({ ...i, id: _id.toHexString(), createdAt: createdAt.toISOString(), updatedAt: updatedAt.toISOString() })),
    unread,
    total,
    page,
    pages: Math.max(1, Math.ceil(total / limit)),
  })
})
