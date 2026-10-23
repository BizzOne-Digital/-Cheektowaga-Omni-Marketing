'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Field, fmtDate, fmtMoney, PageHead, Pager, paymentTone, qs, Status, Tag, Toolbar, useApi, useDebounced } from '@/components/admin/ui'
import type { OrderRow } from '@/lib/orders'
import { PAYMENT_STATUSES, paymentLabel } from '@/lib/statuses'

type List = { items: OrderRow[]; total: number; page: number; pages: number }

// One Stripe Checkout payment per order, so this lists orders by their verified payment details.
export default function PaymentsPage() {
  const [q, setQ] = useState('')
  const [payment, setPayment] = useState('')
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [page, setPage] = useState(1)
  const query = useDebounced(q)
  const filter = <T,>(set: (v: T) => void) => (v: T) => (set(v), setPage(1))

  const { data, error, loading, reload } = useApi<List>(`/api/admin/orders?${qs({ q: query, payment, from, to, page })}`)

  return (
    <>
      <PageHead eyebrow="Stripe" title="Payments" />
      <p className="-mt-4 mb-8 max-w-2xl text-sm text-ash">
        Statuses come from signed Stripe webhooks and can&rsquo;t be changed here. Refunds are issued in the Stripe Dashboard and update automatically. Card numbers are never stored, only the brand and last four digits.
      </p>
      <Toolbar>
        <Field label="Search" className="lg:w-72">
          <input className="ainput" type="search" value={q} onChange={(e) => filter(setQ)(e.target.value)} placeholder="Order no. or pi_ / cs_ reference" />
        </Field>
        <Field label="Status">
          <select className="ainput" value={payment} onChange={(e) => filter(setPayment)(e.target.value)}>
            <option value="">All</option>
            {PAYMENT_STATUSES.map((s) => <option key={s} value={s}>{paymentLabel[s]}</option>)}
          </select>
        </Field>
        <Field label="From"><input className="ainput" type="date" value={from} onChange={(e) => filter(setFrom)(e.target.value)} /></Field>
        <Field label="To"><input className="ainput" type="date" value={to} onChange={(e) => filter(setTo)(e.target.value)} /></Field>
      </Toolbar>

      <Status loading={loading} error={error} retry={reload} empty={!data?.items.length} emptyText="No payments match these filters.">
        {data && (
          <>
            <div className="overflow-x-auto border border-line">
              <table className="atable min-w-[52rem]">
                <thead>
                  <tr><th>Date</th><th>Order</th><th>Amount</th><th>Status</th><th>Method</th><th>Reference</th></tr>
                </thead>
                <tbody>
                  {data.items.map((o) => (
                    <tr key={o.id}>
                      <td className="whitespace-nowrap text-ash">{fmtDate(o.createdAt)}</td>
                      <td><Link href={`/admin/orders/${o.id}`} className="ulink font-semibold">{o.number}</Link></td>
                      <td className="tabular-nums">{fmtMoney(o.totalCents, o.currency)} <span className="text-xs uppercase text-ash">{o.currency}</span></td>
                      <td><Tag tone={paymentTone[o.paymentStatus]}>{paymentLabel[o.paymentStatus]}</Tag></td>
                      <td className="capitalize text-ash">{o.method ?? '—'}</td>
                      <td><code className="text-xs text-ash">{o.reference ?? '—'}</code></td>
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
