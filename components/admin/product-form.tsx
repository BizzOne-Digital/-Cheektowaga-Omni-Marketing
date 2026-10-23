'use client'

import { ArrowDown, ArrowUp, Trash2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import type { ProductData, Spec } from '@/lib/products'
import { LOW_STOCK } from '@/lib/statuses'
import { ImageField, Thumb, uploadImage } from './image-field'
import { useAdmin } from './shell'
import { api, Field, fmtMoney, Panel, stockTag } from './ui'

type Form = Omit<ProductData, 'priceCents' | 'video'> & { price: string; video: string }

const blank: Form = {
  id: '', name: '', model: '', finish: '', swatch: '#151515', brand: '', category: '', heading: '', line: '', description: '',
  price: '', stock: 0, sortOrder: 0, video: '', images: [], specs: [], featureTable: [],
}

const move = <T,>(list: T[], i: number, by: number) => {
  const j = i + by
  if (j < 0 || j >= list.length) return list
  const copy = [...list]
  ;[copy[i], copy[j]] = [copy[j], copy[i]]
  return copy
}

/** Create (no `initial`) or edit a product. All fields are validated again on the server. */
export function ProductForm({ initial }: { initial?: ProductData }) {
  const router = useRouter()
  const { toast } = useAdmin()
  const [form, setForm] = useState<Form>(() => (initial ? { ...initial, price: (initial.priceCents / 100).toFixed(2), video: initial.video ?? '' } : blank))
  const [loadedStock, setLoadedStock] = useState(initial?.stock ?? 0) // sent as expectedStock so a concurrent order isn't overwritten
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [newPath, setNewPath] = useState('')
  const set = <K extends keyof Form>(k: K, v: Form[K]) => setForm((f) => ({ ...f, [k]: v }))
  const priceCents = Math.round(Number.parseFloat(form.price) * 100)

  async function upload(files: FileList | null) {
    if (!files?.length) return
    setUploading(true)
    for (const file of Array.from(files)) {
      try {
        const url = await uploadImage(file, 'products')
        setForm((f) => ({ ...f, images: [...f.images, { src: url, alt: `${f.name || 'Product'} photo` }] }))
      } catch (e) {
        toast((e as Error).message, 'bad')
      }
    }
    setUploading(false)
  }

  async function save(e: React.FormEvent) {
    e.preventDefault()
    if (saving) return
    if (!form.images.length) return toast('Add at least one image.', 'bad')
    if (!Number.isFinite(priceCents) || priceCents < 50) return toast('Enter a price of at least $0.50.', 'bad')
    setSaving(true)
    const { price, ...rest } = form
    const payload = { ...rest, priceCents, video: form.video.trim() }
    try {
      if (initial) {
        await api(`/api/admin/products/${initial.id}`, { method: 'PATCH', body: { ...payload, expectedStock: loadedStock } })
        setLoadedStock(form.stock)
        toast('Product saved. The site shows the changes now.')
        router.refresh()
      } else {
        await api('/api/admin/products', { method: 'POST', body: payload })
        toast('Product created.')
        router.replace(`/admin/products/${form.id}`)
      }
    } catch (err) {
      toast((err as Error).message, 'bad')
    } finally {
      setSaving(false)
    }
  }

  const main = form.images[0]

  return (
    <form onSubmit={save} className="grid gap-6 lg:grid-cols-[1fr_20rem] lg:items-start">
      <div className="grid gap-6">
        <Panel title="Details">
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Name" className="sm:col-span-2"><input className="ainput" required maxLength={80} value={form.name} onChange={(e) => set('name', e.target.value)} /></Field>
            {!initial && (
              <Field label="Product ID" hint="Lowercase letters, numbers and dashes. Used in orders; can't be changed later." className="sm:col-span-2">
                <input className="ainput" required pattern="[a-z0-9](?:[a-z0-9\-]{0,38}[a-z0-9])?" maxLength={40} value={form.id} onChange={(e) => set('id', e.target.value.toLowerCase())} />
              </Field>
            )}
            <Field label="Model"><input className="ainput" required maxLength={40} value={form.model} onChange={(e) => set('model', e.target.value)} /></Field>
            <Field label="Finish / colour"><input className="ainput" required maxLength={40} value={form.finish} onChange={(e) => set('finish', e.target.value)} /></Field>
            <Field label="Brand"><input className="ainput" maxLength={60} value={form.brand} onChange={(e) => set('brand', e.target.value)} /></Field>
            <Field label="Category"><input className="ainput" maxLength={60} value={form.category} onChange={(e) => set('category', e.target.value)} /></Field>
            <Field label="Swatch colour">
              <span className="flex gap-2">
                <input type="color" className="h-10 w-12 cursor-pointer border border-line-strong bg-ink-2" value={form.swatch} onChange={(e) => set('swatch', e.target.value)} aria-label="Pick swatch colour" />
                <input className="ainput" required pattern="#[0-9a-fA-F]{6}" value={form.swatch} onChange={(e) => set('swatch', e.target.value)} />
              </span>
            </Field>
            <Field label="Display order" hint="Lowest is featured on the site.">
              <input className="ainput" type="number" required min={-1000} max={1000} step={1} value={form.sortOrder} onChange={(e) => set('sortOrder', Number(e.target.value))} />
            </Field>
          </div>
        </Panel>

        <Panel title="Price & stock">
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Price (USD)" hint="Charged at checkout. Existing orders keep their price.">
              <input className="ainput" type="number" required min={0.5} max={10000} step={0.01} value={form.price} onChange={(e) => set('price', e.target.value)} />
            </Field>
            <Field label="Units in stock" hint="0 shows Sold Out everywhere and blocks checkout.">
              <span className="flex gap-2">
                <input className="ainput" type="number" required min={0} max={100000} step={1} value={form.stock} onChange={(e) => set('stock', Math.max(0, Math.trunc(Number(e.target.value))))} />
                <button type="button" className="btn btn-ghost btn-sm shrink-0" onClick={() => set('stock', 0)} disabled={form.stock === 0}>Sold out</button>
              </span>
            </Field>
          </div>
        </Panel>

        <Panel title="Copy">
          <div className="grid gap-5">
            <Field label="Page heading" hint={`${form.heading.length}/160 · used for SEO and screen readers`}><input className="ainput" required maxLength={160} value={form.heading} onChange={(e) => set('heading', e.target.value)} /></Field>
            <Field label="Tagline" hint={`${form.line.length}/160`}><input className="ainput" required maxLength={160} value={form.line} onChange={(e) => set('line', e.target.value)} /></Field>
            <Field label="Description" hint={`${form.description.length}/1000`}><textarea className="ainput" required maxLength={1000} value={form.description} onChange={(e) => set('description', e.target.value)} /></Field>
          </div>
        </Panel>

        <Panel title={`Images (${form.images.length})`}>
          <p className="mb-4 text-xs text-ash">The first image is the main photo. White-background photos look best. JPG, PNG, WebP or GIF, up to 8 MB (about 4 MB when hosted on Vercel). Removed or replaced uploads are deleted when you save.</p>
          <ul className="grid gap-3">
            {form.images.map((img, i) => (
              <li key={`${img.src}-${i}`} className="grid grid-cols-[4.5rem_1fr_auto] items-center gap-3 border border-line p-2">
                <div className="aspect-square bg-white p-1"><Thumb src={img.src} className="size-full object-contain" /></div>
                <div className="grid min-w-0 gap-1">
                  <input className="ainput" required maxLength={200} value={img.alt} aria-label={`Image ${i + 1} description`} placeholder="Describe the photo (for accessibility)" onChange={(e) => set('images', form.images.map((x, j) => (j === i ? { ...x, alt: e.target.value } : x)))} />
                  <span className="flex min-w-0 items-center gap-3">
                    <ImageField value={img.src} folder="products" removable={false} previewClass="hidden" onChange={(src) => set('images', form.images.map((x, j) => (j === i ? { ...x, src } : x)))} />
                    <span className="truncate text-xs text-ash">{i === 0 ? 'Main · ' : ''}{img.src}</span>
                  </span>
                </div>
                <RowTools i={i} n={form.images.length} label={`image ${i + 1}`} onMove={(by) => set('images', move(form.images, i, by))} onRemove={() => set('images', form.images.filter((_, j) => j !== i))} />
              </li>
            ))}
          </ul>
          <div className="mt-4 grid gap-3 sm:grid-cols-[auto_1fr_auto] sm:items-end">
            <label className={`btn btn-sm ${uploading ? 'pointer-events-none opacity-60' : ''}`}>
              {uploading ? 'Uploading…' : 'Upload images'}
              <input type="file" accept="image/jpeg,image/png,image/webp,image/gif" multiple className="sr-only" onChange={(e) => (upload(e.target.files), (e.target.value = ''))} />
            </label>
            <Field label="Or add an existing path"><input className="ainput" value={newPath} placeholder="/media/vl16/photo-1.jpg" onChange={(e) => setNewPath(e.target.value)} /></Field>
            <button type="button" className="btn btn-ghost btn-sm" disabled={!newPath.trim()} onClick={() => (set('images', [...form.images, { src: newPath.trim(), alt: `${form.name || 'Product'} photo` }]), setNewPath(''))}>Add</button>
          </div>
        </Panel>

        <SpecEditor title="Specifications" hint="Shown under “The details” on the Watches page." rows={form.specs} onChange={(v) => set('specs', v)} />
        <SpecEditor title="Feature list" hint="Shown under “Every feature” on the Watches page. A value of “Supported” shows a dot." rows={form.featureTable} onChange={(v) => set('featureTable', v)} />

        <Panel title="Video">
          <Field label="Product video path" hint="Optional. Plays in “See it in action” on the Watches page. Leave empty to hide it.">
            <input className="ainput" value={form.video} placeholder="/media/vl16-pro.mp4" onChange={(e) => set('video', e.target.value)} />
          </Field>
        </Panel>
      </div>

      <aside className="grid gap-4 lg:sticky lg:top-8">
        <Panel title="Preview">
          <div className="grid gap-4">
            <div className="product-stage light relative aspect-[4/5]">{main && <Thumb src={main.src} className="absolute inset-0 size-full object-contain p-[8%]" />}</div>
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="display text-3xl">{form.name || 'Product name'}</p>
                <p className="mt-1 flex items-center gap-2 text-sm text-ash"><span className="size-3 rounded-full border border-line-strong" style={{ background: form.swatch }} />{form.finish || 'Finish'}</p>
              </div>
              <p className="text-xl font-semibold tabular-nums">{Number.isFinite(priceCents) ? fmtMoney(priceCents) : '—'}</p>
            </div>
            <p className="text-sm italic text-ember-soft">{form.line}</p>
            <div className="flex flex-wrap items-center gap-2">
              {stockTag(form.stock, LOW_STOCK)}
              <button type="button" className={`btn btn-sm ${form.stock <= 0 ? 'opacity-60' : ''}`} tabIndex={-1} aria-hidden="true">{form.stock <= 0 ? 'Sold out' : 'Buy now →'}</button>
            </div>
          </div>
        </Panel>
        <button type="submit" className="btn w-full" disabled={saving || uploading}>{saving ? 'Saving…' : initial ? 'Save changes' : 'Create product'}</button>
        <button type="button" className="btn btn-ghost w-full" onClick={() => router.push('/admin/products')}>Back to products</button>
      </aside>
    </form>
  )
}

function RowTools({ i, n, label, onMove, onRemove }: { i: number; n: number; label: string; onMove: (by: number) => void; onRemove: () => void }) {
  const cls = 'grid size-9 place-items-center border border-line text-ash transition-colors hover:text-bone disabled:opacity-30'
  return (
    <div className="flex gap-1">
      <button type="button" className={cls} disabled={i === 0} onClick={() => onMove(-1)} aria-label={`Move ${label} up`}><ArrowUp className="size-4" /></button>
      <button type="button" className={cls} disabled={i === n - 1} onClick={() => onMove(1)} aria-label={`Move ${label} down`}><ArrowDown className="size-4" /></button>
      <button type="button" className={`${cls} hover:!text-[#ff9b73]`} onClick={onRemove} aria-label={`Remove ${label}`}><Trash2 className="size-4" /></button>
    </div>
  )
}

function SpecEditor({ title, hint, rows, onChange }: { title: string; hint: string; rows: Spec[]; onChange: (rows: Spec[]) => void }) {
  const edit = (i: number, k: keyof Spec, v: string) => onChange(rows.map((r, j) => (j === i ? { ...r, [k]: v } : r)))
  return (
    <Panel title={`${title} (${rows.length})`} actions={<button type="button" className="btn btn-ghost btn-sm" disabled={rows.length >= 60} onClick={() => onChange([...rows, { label: '', value: '' }])}>Add row</button>}>
      <p className="mb-4 text-xs text-ash">{hint}</p>
      {rows.length === 0 && <p className="text-sm text-ash">No rows. This section is hidden until you add one.</p>}
      <ul className="grid gap-2">
        {rows.map((r, i) => (
          <li key={i} className="grid gap-2 sm:grid-cols-[12rem_1fr_auto] sm:items-center">
            <input className="ainput" required maxLength={60} value={r.label} placeholder="Label" aria-label={`${title} row ${i + 1} label`} onChange={(e) => edit(i, 'label', e.target.value)} />
            <input className="ainput" required maxLength={500} value={r.value} placeholder="Value" aria-label={`${title} row ${i + 1} value`} onChange={(e) => edit(i, 'value', e.target.value)} />
            <RowTools i={i} n={rows.length} label={`row ${i + 1}`} onMove={(by) => onChange(move(rows, i, by))} onRemove={() => onChange(rows.filter((_, j) => j !== i))} />
          </li>
        ))}
      </ul>
    </Panel>
  )
}
