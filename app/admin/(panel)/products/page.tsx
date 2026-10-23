'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useAdmin } from '@/components/admin/shell'
import { api, Field, fmtMoney, PageHead, Pager, qs, Status, stockTag, Toolbar, useApi, useDebounced } from '@/components/admin/ui'
import { LOW_STOCK } from '@/lib/statuses'

type Item = { id: string; name: string; model: string; finish: string; category: string; priceCents: number; stock: number; sortOrder: number; image: { src: string; alt: string } | null }
type List = { items: Item[]; categories: string[]; total: number; page: number; pages: number }

export default function ProductsPage() {
  const { toast, confirm } = useAdmin()
  const [q, setQ] = useState('')
  const [stock, setStock] = useState('')
  const [category, setCategory] = useState('')
  const [page, setPage] = useState(1)
  const [busy, setBusy] = useState<string | null>(null)
  const query = useDebounced(q)
  const filter = <T,>(set: (v: T) => void) => (v: T) => (set(v), setPage(1))
  const { data, error, loading, reload } = useApi<List>(`/api/admin/products?${qs({ q: query, stock, category, page })}`)

  async function soldOut(p: Item) {
    if (!(await confirm({ title: 'Mark as sold out?', body: `${p.name} stock goes from ${p.stock} to 0. Buy buttons switch to Sold Out across the site straight away, and checkout refuses new orders.`, confirm: 'Mark sold out' }))) return
    run(p.id, () => api(`/api/admin/products/${p.id}`, { method: 'PATCH', body: { stock: 0, expectedStock: p.stock } }), `${p.name} is now sold out.`)
  }

  async function remove(p: Item) {
    if (!(await confirm({ title: 'Delete this product?', body: `${p.name} will be removed from the site. Past orders keep their own copy of the name and price. This can't be undone.`, confirm: 'Delete product', danger: true }))) return
    run(p.id, () => api(`/api/admin/products/${p.id}`, { method: 'DELETE' }), `${p.name} deleted.`)
  }

  async function run(id: string, fn: () => Promise<unknown>, done: string) {
    setBusy(id)
    try {
      await fn()
      toast(done)
      reload()
    } catch (e) {
      toast((e as Error).message, 'bad')
    } finally {
      setBusy(null)
    }
  }

  return (
    <>
      <PageHead eyebrow="Catalogue" title="Products">
        <Link href="/admin/products/new" className="btn btn-sm">Add product</Link>
      </PageHead>
      <p className="-mt-4 mb-8 max-w-2xl text-sm text-ash">The product with the lowest display order is the one featured across the home, watches and compare pages.</p>
      <Toolbar>
        <Field label="Search" className="lg:w-72">
          <input className="ainput" type="search" value={q} onChange={(e) => filter(setQ)(e.target.value)} placeholder="Name, model or ID" />
        </Field>
        <Field label="Stock">
          <select className="ainput" value={stock} onChange={(e) => filter(setStock)(e.target.value)}>
            <option value="">All</option>
            <option value="in_stock">In stock</option>
            <option value="low">Low ({LOW_STOCK} or fewer)</option>
            <option value="sold_out">Sold out</option>
          </select>
        </Field>
        {!!data?.categories.length && (
          <Field label="Category">
            <select className="ainput" value={category} onChange={(e) => filter(setCategory)(e.target.value)}>
              <option value="">All</option>
              {data.categories.map((c) => <option key={c}>{c}</option>)}
            </select>
          </Field>
        )}
      </Toolbar>

      <Status loading={loading} error={error} retry={reload} empty={!data?.items.length} emptyText="No products match these filters.">
        {data && (
          <>
            <div className="overflow-x-auto border border-line">
              <table className="atable min-w-[50rem]">
                <thead>
                  <tr><th>Product</th><th>Category</th><th>Price</th><th>Stock</th><th>Order</th><th><span className="sr-only">Actions</span></th></tr>
                </thead>
                <tbody>
                  {data.items.map((p) => (
                    <tr key={p.id}>
                      <td>
                        <div className="flex items-center gap-4">
                          <div className="size-14 shrink-0 bg-white p-1">{p.image && <img src={p.image.src} alt="" className="size-full object-contain" loading="lazy" />}</div>
                          <div>
                            <Link href={`/admin/products/${p.id}`} className="ulink font-semibold">{p.name}</Link>
                            <p className="text-xs text-ash">{p.model} · {p.finish} · <code>{p.id}</code></p>
                          </div>
                        </div>
                      </td>
                      <td className="text-ash">{p.category || '—'}</td>
                      <td className="tabular-nums">{fmtMoney(p.priceCents)}</td>
                      <td>{stockTag(p.stock, LOW_STOCK)}</td>
                      <td className="tabular-nums text-ash">{p.sortOrder}</td>
                      <td>
                        <div className="flex justify-end gap-2">
                          <Link href={`/admin/products/${p.id}`} className="btn btn-ghost btn-sm">Edit</Link>
                          {p.stock > 0 && <button type="button" className="btn btn-ghost btn-sm" disabled={busy === p.id} onClick={() => soldOut(p)}>Sold out</button>}
                          <button type="button" className="btn btn-danger btn-sm" disabled={busy === p.id} onClick={() => remove(p)}>Delete</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pager page={data.page} pages={data.pages} total={data.total} onPage={setPage} />
          </>
        )}
      </Status>
    </>
  )
}
