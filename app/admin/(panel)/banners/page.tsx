'use client'

import { ArrowDown, ArrowUp } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useAdmin } from '@/components/admin/shell'
import { ImageField, Thumb } from '@/components/admin/image-field'
import { api, Field, PageHead, Panel, Status, Tag, useApi } from '@/components/admin/ui'
import type { BannerDto } from '@/lib/banners'

type Draft = Pick<BannerDto, 'src' | 'alt' | 'href' | 'width' | 'height' | 'enabled'>

// Pixel size of an uploaded file, stored so the banner reserves its space without layout shift.
const imageSize = (file: File) =>
  new Promise<{ width: number; height: number }>((resolve) => {
    const img = new Image()
    img.onload = () => (resolve({ width: img.naturalWidth, height: img.naturalHeight }), URL.revokeObjectURL(img.src))
    img.onerror = () => resolve({ width: 1600, height: 576 })
    img.src = URL.createObjectURL(file)
  })

export default function BannersPage() {
  const { toast, confirm } = useAdmin()
  const { data, error, loading, reload } = useApi<{ items: BannerDto[] }>('/api/admin/banners')
  const [items, setItems] = useState<BannerDto[]>([])
  useEffect(() => setItems(data?.items ?? []), [data])

  async function reorder(i: number, by: number) {
    const next = [...items]
    ;[next[i], next[i + by]] = [next[i + by], next[i]]
    setItems(next)
    try {
      await api('/api/admin/banners', { method: 'PUT', body: { order: next.map((b) => b.id) } })
      toast('Order saved.')
    } catch (e) {
      toast((e as Error).message, 'bad')
      reload()
    }
  }

  async function remove(b: BannerDto) {
    if (!(await confirm({ title: 'Delete this banner?', body: 'It disappears from the home page now. The image file itself is kept in storage.', confirm: 'Delete banner', danger: true }))) return
    try {
      await api(`/api/admin/banners/${b.id}`, { method: 'DELETE' })
      toast('Banner deleted.')
      reload()
    } catch (e) {
      toast((e as Error).message, 'bad')
    }
  }

  return (
    <>
      <PageHead eyebrow="Home page" title="Banners" />
      <p className="-mt-4 mb-8 max-w-2xl text-sm text-ash">
        Promo banners show below the hero on the home page, in this order, full width. Use 1600 × 576 px images (25:9) to match the current banner. Turn a banner off to hide it without deleting it.
      </p>
      <Status loading={loading} error={error} retry={reload} empty={!items.length} emptyText="No banners. The home page shows none until you add one.">
        <ul className="grid gap-6">
          {items.map((b, i) => (
            <li key={b.id}>
              <BannerEditor
                banner={b}
                tools={
                  <div className="flex gap-1">
                    <button type="button" className="grid size-9 place-items-center border border-line text-ash hover:text-bone disabled:opacity-30" disabled={i === 0} onClick={() => reorder(i, -1)} aria-label="Move banner up"><ArrowUp className="size-4" /></button>
                    <button type="button" className="grid size-9 place-items-center border border-line text-ash hover:text-bone disabled:opacity-30" disabled={i === items.length - 1} onClick={() => reorder(i, 1)} aria-label="Move banner down"><ArrowDown className="size-4" /></button>
                  </div>
                }
                onSaved={(saved) => setItems((list) => list.map((x) => (x.id === saved.id ? saved : x)))}
                onDelete={() => remove(b)}
              />
            </li>
          ))}
        </ul>
      </Status>
      <div className="mt-10">
        <NewBanner onCreated={reload} />
      </div>
    </>
  )
}

function BannerFields({ draft, set, onImage }: { draft: Draft; set: (d: Partial<Draft>) => void; onImage: (url: string, file?: File) => void }) {
  return (
    <div className="grid gap-5">
      {draft.src ? (
        <div className="overflow-hidden border border-line" title="Preview">
          <Thumb src={draft.src} className="h-auto w-full" />
        </div>
      ) : (
        <p className="border border-dashed border-line-strong px-6 py-10 text-center text-sm text-ash">Upload an image to preview the banner.</p>
      )}
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Image description" hint="Read by screen readers. Include any text that's in the image, e.g. the price." className="sm:col-span-2">
          <input className="ainput" required maxLength={300} value={draft.alt} onChange={(e) => set({ alt: e.target.value })} />
        </Field>
        <Field label="Links to" hint="A site path like /watches, or a full https:// address.">
          <input className="ainput" required value={draft.href} onChange={(e) => set({ href: e.target.value })} />
        </Field>
        <div className="flex flex-wrap items-end gap-3">
          {/* No Remove: a banner needs an image. Delete the banner instead. The old upload is deleted on save. */}
          <ImageField value={draft.src} folder="pages" removable={false} previewClass="hidden" onChange={onImage} />
          <label className="flex min-h-10 items-center gap-2 text-sm">
            <input type="checkbox" className="size-4 accent-[var(--color-ember)]" checked={draft.enabled} onChange={(e) => set({ enabled: e.target.checked })} />
            Show on home page
          </label>
        </div>
      </div>
    </div>
  )
}

function useBannerDraft(initial: Draft) {
  const [draft, setDraft] = useState(initial)
  const [busy, setBusy] = useState(false)
  const set = (d: Partial<Draft>) => setDraft((x) => ({ ...x, ...d }))
  const onImage = async (src: string, file?: File) => set({ src, ...(file && (await imageSize(file))) })
  return { draft, setDraft, set, onImage, busy, setBusy }
}

function BannerEditor({ banner, tools, onSaved, onDelete }: { banner: BannerDto; tools: React.ReactNode; onSaved: (b: BannerDto) => void; onDelete: () => void }) {
  const { toast } = useAdmin()
  const { src, alt, href, width, height, enabled } = banner
  const { draft, set, onImage, busy, setBusy } = useBannerDraft({ src, alt, href, width, height, enabled })
  const dirty = (Object.keys(draft) as (keyof Draft)[]).some((k) => draft[k] !== banner[k])

  async function save(e: React.FormEvent) {
    e.preventDefault()
    setBusy(true)
    try {
      onSaved(await api<BannerDto>(`/api/admin/banners/${banner.id}`, { method: 'PATCH', body: draft }))
      toast('Banner saved. The home page shows it now.')
    } catch (err) {
      toast((err as Error).message, 'bad')
    } finally {
      setBusy(false)
    }
  }

  return (
    <form onSubmit={save}>
      <Panel title={draft.enabled ? 'Live' : 'Hidden'} actions={<div className="flex items-center gap-3">{draft.enabled ? <Tag tone="ok">On</Tag> : <Tag tone="mute">Off</Tag>}{tools}</div>}>
        <BannerFields draft={draft} set={set} onImage={onImage} />
        <div className="mt-5 flex flex-wrap justify-end gap-3 border-t border-line pt-5">
          <button type="button" className="btn btn-danger btn-sm" onClick={onDelete}>Delete</button>
          <button type="submit" className="btn btn-sm" disabled={!dirty || busy}>{busy ? 'Saving…' : 'Save banner'}</button>
        </div>
      </Panel>
    </form>
  )
}

function NewBanner({ onCreated }: { onCreated: () => void }) {
  const { toast } = useAdmin()
  const empty: Draft = { src: '', alt: '', href: '/watches', width: 1600, height: 576, enabled: true }
  const { draft, setDraft, set, onImage, busy, setBusy } = useBannerDraft(empty)

  async function create(e: React.FormEvent) {
    e.preventDefault()
    if (!draft.src) return toast('Upload an image first.', 'bad')
    setBusy(true)
    try {
      await api('/api/admin/banners', { method: 'POST', body: draft })
      toast('Banner added.')
      setDraft(empty)
      onCreated()
    } catch (err) {
      toast((err as Error).message, 'bad')
    } finally {
      setBusy(false)
    }
  }

  return (
    <form onSubmit={create}>
      <Panel title="Add a banner">
        <BannerFields draft={draft} set={set} onImage={onImage} />
        <div className="mt-5 flex justify-end border-t border-line pt-5">
          <button type="submit" className="btn btn-sm" disabled={busy || !draft.src}>Add banner</button>
        </div>
      </Panel>
    </form>
  )
}
