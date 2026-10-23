import { adminRoute } from '@/lib/admin-api'
import { contentDefaults, contentRules, mergeContent, type Content } from '@/lib/content'
import { cols } from '@/lib/db'
import { body, list, ok, text } from '@/lib/validate'

export const GET = adminRoute(async () => {
  const doc = await (await cols()).settings.findOne({ _id: 'content' })
  return ok({ content: mergeContent(doc), defaults: contentDefaults, updatedAt: doc?.updatedAt?.toISOString() ?? null })
})

// Saves the whole set of editable fields (and nothing else).
export const PUT = adminRoute(async (req) => {
  const b = await body(req)
  const content = {} as Content
  for (const [key, rule] of Object.entries(contentRules) as [keyof Content, (typeof contentRules)[keyof Content]][]) {
    const value =
      rule.kind === 'text'
        ? text(b[key], rule.label, rule.max)
        : list(b[key], rule.label, rule.min, rule.max).map((item, i) => text(item, `${rule.label} ${i + 1}`, rule.itemMax))
    Object.assign(content, { [key]: value })
  }
  const updatedAt = new Date()
  await (await cols()).settings.updateOne({ _id: 'content' }, { $set: { ...content, updatedAt } }, { upsert: true })
  return ok({ content, defaults: contentDefaults, updatedAt: updatedAt.toISOString() })
})
