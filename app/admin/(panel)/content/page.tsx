'use client'

import { useEffect, useState } from 'react'
import { useAdmin } from '@/components/admin/shell'
import { api, Field, fmtDate, PageHead, Panel, Status, useApi } from '@/components/admin/ui'
import { contentRules, type Content } from '@/lib/content'

type Res = { content: Content; defaults: Content; updatedAt: string | null }
const keys = Object.keys(contentRules) as (keyof Content)[]

// The small, fixed set of copy editable without a deploy (see lib/content.ts). Everything else stays in code.
export default function ContentPage() {
  const { toast, confirm } = useAdmin()
  const { data, error, loading, reload } = useApi<Res>('/api/admin/content')
  const [form, setForm] = useState<Content>()
  const [updatedAt, setUpdatedAt] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  useEffect(() => {
    if (data) setForm(data.content), setUpdatedAt(data.updatedAt)
  }, [data])

  const set = (k: keyof Content, v: string | string[]) => setForm((f) => f && { ...f, [k]: v })

  async function save(e: React.FormEvent) {
    e.preventDefault()
    if (!form || saving) return
    setSaving(true)
    try {
      const res = await api<Res>('/api/admin/content', { method: 'PUT', body: form })
      setForm(res.content)
      setUpdatedAt(res.updatedAt)
      toast('Saved. The home page shows the new copy now.')
    } catch (err) {
      toast((err as Error).message, 'bad')
    } finally {
      setSaving(false)
    }
  }

  async function restore() {
    if (data && (await confirm({ title: 'Restore the original copy?', body: 'The form is filled with the original wording. Nothing changes on the site until you save.', confirm: 'Restore' })))
      setForm(data.defaults)
  }

  return (
    <>
      <PageHead eyebrow="Home page" title="Site copy" />
      <p className="-mt-4 mb-8 max-w-2xl text-sm text-ash">
        Only these home-page lines are editable here. Product details are edited under Products, banners under Home banners. Page layouts, navigation, policies and legal text stay under source control.
      </p>
      <Status loading={loading} error={error} retry={reload} empty={!form}>
        {form && (
          <form onSubmit={save} className="grid gap-6">
            <Panel title="Home hero">
              <div className="grid gap-6">
                {keys.map((k) => {
                  const rule = contentRules[k]
                  const value = form[k]
                  if (rule.kind === 'text')
                    return (
                      <Field key={k} label={rule.label} hint={`${rule.help} ${(value as string).length}/${rule.max}`}>
                        <input className="ainput" required maxLength={rule.max} value={value as string} onChange={(e) => set(k, e.target.value)} />
                      </Field>
                    )
                  const list = value as string[]
                  return (
                    <fieldset key={k} className="grid gap-2">
                      <legend className="alabel mb-2">{rule.label}</legend>
                      <p className="-mt-1 mb-1 text-xs text-ash">{rule.help} {rule.min === rule.max ? `Exactly ${rule.max}.` : `${rule.min}–${rule.max} items.`} Up to {rule.itemMax} characters each.</p>
                      {list.map((item, i) => (
                        <div key={i} className="flex gap-2">
                          <input className="ainput" required maxLength={rule.itemMax} value={item} aria-label={`${rule.label} ${i + 1}`} onChange={(e) => set(k, list.map((x, j) => (j === i ? e.target.value : x)))} />
                          {list.length > rule.min && (
                            <button type="button" className="btn btn-ghost btn-sm shrink-0" onClick={() => set(k, list.filter((_, j) => j !== i))} aria-label={`Remove ${rule.label} ${i + 1}`}>Remove</button>
                          )}
                        </div>
                      ))}
                      {list.length < rule.max && (
                        <button type="button" className="btn btn-ghost btn-sm w-fit" onClick={() => set(k, [...list, ''])}>Add</button>
                      )}
                    </fieldset>
                  )
                })}
              </div>
            </Panel>
            <div className="flex flex-wrap items-center justify-between gap-4">
              <p className="text-xs text-ash">{updatedAt ? `Last saved ${fmtDate(updatedAt)}` : 'Showing the original copy (never edited).'}</p>
              <div className="flex gap-3">
                <button type="button" className="btn btn-ghost btn-sm" onClick={restore}>Restore original</button>
                <button type="submit" className="btn btn-sm" disabled={saving}>{saving ? 'Saving…' : 'Save copy'}</button>
              </div>
            </div>
          </form>
        )}
      </Status>
    </>
  )
}
