'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { useState } from 'react'
import { Field, fmtDate, fmtMoney, fulfillmentTone, PageHead, Pager, paymentTone, qs, Status, Tag, Toolbar, useApi, useDebounced } from '@/components/admin/ui'
import type { OrderRow } from '@/lib/orders'
import { FULFILLMENT_STATUSES, fulfillmentLabel, PAYMENT_STATUSES, paymentLabel } from '@/lib/statuses'

type List = { items: OrderRow[]; total: number; page: number; pages: number }

export default function OrdersPage() {
  const sp = useSearchParams()
  const [q, setQ] = useState('')
  const [payment, setPayment] = useState(sp.get('payment') ?? '')
  const [fulfillment, setFulfillment] = useState(sp.get('fulfillment') ?? '')
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [page, setPage] = useState(1)
  const query = useDebounced(q)
  const filter = <T,>(set: (v: T) => void) => (v: T) => (set(v), setPage(1))

  const { data, error, loading, reload } = useApi<List>(`/api/admin/orders?${qs({ q: query, payment, fulfillment, from, to, page })}`)

  return (
    <>
      <PageHead eyebrow="Sales" title="Orders" />
      <Toolbar>
        <Field label="Search" className="lg:w-72">
          <input className="ainput" type="search" value={q} onChange={(e) => filter(setQ)(e.target.value)} placeholder="Order no., name, email, Stripe ref" />
        </Field>
        <Field label="Payment">
          <select className="ainput" value={payment} onChange={(e) => filter(setPayment)(e.target.value)}>
            <option value="">All</option>
            {PAYMENT_STATUSES.map((s) => <option key={s} value={s}>{paymentLabel[s]}</option>)}
          </select>
        </Field>
        <Field label="Fulfilment">
          <select className="ainput" value={fulfillment} onChange={(e) => filter(setFulfillment)(e.target.value)}>
            <option value="">All</option>
            {FULFILLMENT_STATUSES.map((s) => <option key={s} value={s}>{fulfillmentLabel[s]}</option>)}
          </select>
        </Field>
        <Field label="From"><input className="ainput" type="date" value={from} onChange={(e) => filter(setFrom)(e.target.value)} /></Field>
        <Field label="To"><input className="ainput" type="date" value={to} onChange={(e) => filter(setTo)(e.target.value)} /></Field>
      </Toolbar>

      <Status loading={loading} error={error} retry={reload} empty={!data?.items.length} emptyText="No orders match these filters.">
        {data && (
          <>
            <div className="overflow-x-auto border border-line">
              <table className="atable min-w-[52rem]">
                <thead>
                  <tr><th>Order</th><th>Customer</th><th>Item</th><th>Total</th><th>Payment</th><th>Fulfilment</th></tr>
                </thead>
                <tbody>
                  {data.items.map((o) => (
                    <tr key={o.id}>
                      <td>
                        <Link href={`/admin/orders/${o.id}`} className="ulink font-semibold">{o.number}</Link>
                        <p className="text-xs text-ash">{fmtDate(o.createdAt)}</p>
                      </td>
                      <td>
                        {o.customerName}
                        <p className="text-xs text-ash">{o.customerEmail}</p>
                      </td>
                      <td className="text-ash">{o.productName} × {o.quantity}</td>
                      <td className="tabular-nums">{fmtMoney(o.totalCents, o.currency)}</td>
                      <td><Tag tone={paymentTone[o.paymentStatus]}>{paymentLabel[o.paymentStatus]}</Tag></td>
                      <td><Tag tone={fulfillmentTone[o.fulfillment]}>{fulfillmentLabel[o.fulfillment]}</Tag></td>
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
