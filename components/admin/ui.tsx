'use client'

import { useCallback, useEffect, useState } from 'react'
import type { FulfillmentStatus, InquiryStatus, PaymentStatus } from '@/lib/statuses'

/* ---------------- API ---------------- */

export class ApiError extends Error {}

/** fetch wrapper for /api/admin/*. Sends JSON, throws ApiError with the server's message, and returns to login on 401. */
export async function api<T = unknown>(url: string, init: { method?: string; body?: unknown } = {}): Promise<T> {
  let res: Response
  try {
    res = await fetch(url, {
      method: init.method ?? 'GET',
      headers: init.body instanceof FormData || init.body === undefined ? undefined : { 'content-type': 'application/json' },
      body: init.body instanceof FormData ? init.body : init.body === undefined ? undefined : JSON.stringify(init.body),
      cache: 'no-store',
    })
  } catch {
    throw new ApiError('Connection problem. Check your network and try again.')
  }
  if (res.status === 401) {
    window.location.href = '/admin/login'
    throw new ApiError('Your session has ended. Please sign in again.')
  }
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new ApiError(data.error ?? `Request failed (${res.status}).`)
  return data as T
}

/** Loads a GET endpoint; re-runs when the URL changes or reload() is called. */
export function useApi<T>(url: string | null) {
  const [state, setState] = useState<{ data?: T; error?: string; loading: boolean }>({ loading: !!url })
  const [tick, setTick] = useState(0)
  useEffect(() => {
    if (!url) return
    let live = true
    setState((s) => ({ ...s, loading: true, error: undefined }))
    api<T>(url)
      .then((data) => live && setState({ data, loading: false }))
      .catch((e: Error) => live && setState((s) => ({ ...s, error: e.message, loading: false })))
    return () => {
      live = false
    }
  }, [url, tick])
  const reload = useCallback(() => setTick((t) => t + 1), [])
  return { ...state, reload }
}

/** Debounced value for search boxes. */
export function useDebounced<T>(value: T, ms = 300) {
  const [v, setV] = useState(value)
  useEffect(() => {
    const t = setTimeout(() => setV(value), ms)
    return () => clearTimeout(t)
  }, [value, ms])
  return v
}

export const qs = (params: Record<string, string | number | undefined | null>) =>
  new URLSearchParams(Object.entries(params).filter(([, v]) => v !== '' && v != null).map(([k, v]) => [k, String(v)])).toString()

/* ---------------- Format ---------------- */

export const fmtMoney = (cents: number, currency = 'usd') =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: currency.toUpperCase() }).format(cents / 100)
export const fmtDate = (iso: string) => new Date(iso).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })

/* ---------------- Pieces ---------------- */

export function PageHead({ eyebrow, title, children }: { eyebrow: string; title: string; children?: React.ReactNode }) {
  return (
    <header className="mb-8 flex flex-wrap items-end justify-between gap-4 border-b border-line pb-6">
      <div>
        <p className="eyebrow">{eyebrow}</p>
        <h1 className="display mt-3 text-[clamp(2.2rem,4vw,3.4rem)]">{title}</h1>
      </div>
      {children && <div className="flex flex-wrap gap-3">{children}</div>}
    </header>
  )
}

type Tone = 'ok' | 'warn' | 'bad' | 'info' | 'mute'
export const Tag = ({ tone, children }: { tone: Tone; children: React.ReactNode }) => <span className={`tag tag-${tone}`}>{children}</span>

export const paymentTone: Record<PaymentStatus, Tone> = {
  pending: 'mute',
  processing: 'warn',
  paid: 'ok',
  failed: 'bad',
  expired: 'mute',
  refunded: 'info',
  partially_refunded: 'info',
}
export const fulfillmentTone: Record<FulfillmentStatus, Tone> = { unfulfilled: 'warn', processing: 'info', shipped: 'ok', delivered: 'ok', cancelled: 'mute' }
export const inquiryTone: Record<InquiryStatus, Tone> = { new: 'info', read: 'mute', in_progress: 'warn', resolved: 'ok' }
export const stockTag = (stock: number, low: number) =>
  stock <= 0 ? <Tag tone="bad">Sold out</Tag> : stock <= low ? <Tag tone="warn">Low · {stock}</Tag> : <Tag tone="ok">In stock · {stock}</Tag>

export function Toolbar({ children }: { children: React.ReactNode }) {
  return <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:flex lg:flex-wrap lg:items-end">{children}</div>
}

export function Pager({ page, pages, total, onPage }: { page: number; pages: number; total: number; onPage: (p: number) => void }) {
  return (
    <nav className="mt-6 flex flex-wrap items-center justify-between gap-4 text-sm text-ash" aria-label="Pagination">
      <p>
        {total} result{total === 1 ? '' : 's'} · page {page} of {pages}
      </p>
      <div className="flex gap-2">
        <button type="button" className="btn btn-ghost btn-sm" disabled={page <= 1} onClick={() => onPage(page - 1)}>Previous</button>
        <button type="button" className="btn btn-ghost btn-sm" disabled={page >= pages} onClick={() => onPage(page + 1)}>Next</button>
      </div>
    </nav>
  )
}

/** Loading / error / empty states around a list or panel. Renders children when there's data. */
export function Status({ loading, error, empty, emptyText, retry, children }: { loading: boolean; error?: string; empty?: boolean; emptyText?: string; retry?: () => void; children?: React.ReactNode }) {
  if (error)
    return (
      <div role="alert" className="flex flex-wrap items-center justify-between gap-4 border-l-2 border-[#ff7a4d] bg-ink-2 px-5 py-4 text-sm">
        <span className="text-[#ffb190]">{error}</span>
        {retry && <button type="button" className="btn btn-ghost btn-sm" onClick={retry}>Try again</button>}
      </div>
    )
  if (loading && empty !== false)
    return (
      <div className="grid gap-2" aria-busy="true" aria-label="Loading">
        {[0, 1, 2].map((i) => <div key={i} className="h-12 animate-pulse bg-ink-2" />)}
      </div>
    )
  if (empty) return <p className="border border-dashed border-line-strong px-6 py-10 text-center text-sm text-ash">{emptyText ?? 'Nothing here yet.'}</p>
  return <div className={loading ? 'opacity-60 transition-opacity' : ''}>{children}</div>
}

export function Field({ label, hint, children, className = '' }: { label: string; hint?: React.ReactNode; children: React.ReactNode; className?: string }) {
  return (
    <label className={`alabel ${className}`}>
      {label}
      {children}
      {hint && <span className="text-[0.75rem] font-normal normal-case tracking-normal text-ash/80">{hint}</span>}
    </label>
  )
}

export function Panel({ title, children, actions }: { title: string; children: React.ReactNode; actions?: React.ReactNode }) {
  return (
    <section className="border border-line bg-ink-2/60">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-5 py-4">
        <h2 className="text-[0.6875rem] font-semibold uppercase tracking-[0.2em] text-bone">{title}</h2>
        {actions}
      </div>
      <div className="p-5">{children}</div>
    </section>
  )
}
