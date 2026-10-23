import { adminRoute } from '@/lib/admin-api'
import { cols, type InquiryDoc } from '@/lib/db'
import { INQUIRY_STATUSES } from '@/lib/statuses'
import { body, HttpError, objectId, ok, oneOf, text } from '@/lib/validate'

// Status and internal notes only; the customer's message is never edited.
export const PATCH = adminRoute<{ id: string }>(async (req, { id }) => {
  const b = await body(req)
  const set: Partial<Pick<InquiryDoc, 'status' | 'notes'>> = {}
  if ('status' in b) set.status = oneOf(b.status, 'Status', INQUIRY_STATUSES)
  if ('notes' in b) set.notes = text(b.notes, 'Notes', 2000, { required: false, multiline: true })
  const res = await (await cols()).inquiries.updateOne({ _id: objectId(id) }, { $set: { ...set, updatedAt: new Date() } })
  if (!res.matchedCount) throw new HttpError(404, 'Enquiry not found.')
  return ok({ ok: true })
})

export const DELETE = adminRoute<{ id: string }>(async (_req, { id }) => {
  const res = await (await cols()).inquiries.deleteOne({ _id: objectId(id) })
  if (!res.deletedCount) throw new HttpError(404, 'Enquiry not found.')
  return ok({ ok: true })
})
