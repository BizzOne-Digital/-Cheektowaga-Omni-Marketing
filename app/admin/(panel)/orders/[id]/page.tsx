'use client'

import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useAdmin } from '@/components/admin/shell'
import { api, Field, fmtDate, fmtMoney, fulfillmentTone, PageHead, Panel, paymentTone, Status, Tag, useApi } from '@/components/admin/ui'
import type { OrderDetail } from '@/lib/orders'
import { fulfillmentLabel, nextFulfillment, paymentLabel, type FulfillmentStatus } from '@/lib/statuses'

export default function OrderPage() {
  const { id } = useParams<{ id: string }>()
  const { toast, confirm } = useAdmin()
  const { data, error, loading, reload } = useApi<OrderDetail>(`/api/admin/orders/${id}`)
  const [order, setOrder] = useState<OrderDetail>()
  const [to, setTo] = useState<FulfillmentStatus | ''>('')
  const [note, setNote] = useState('')
  const [busy, setBusy] = useState(false)
  useEffect(() => setOrder(data), [data])

  const o = order
  const paid = o && (o.paymentStatus === 'paid' || o.paymentStatus === 'partially_refunded')
  const open = o && (o.paymentStatus === 'pending' || o.paymentStatus === 'processing')
  // Only moves the server will accept, so the menu never offers something that will be refused.
  const options = o ? nextFulfillment[o.fulfillment].filter((s) => (s === 'cancelled' ? !open : paid)) : []

  async function update() {
    if (!o || !to || busy) return
    const cancelling = to === 'cancelled'
    const ok = await confirm({
      title: cancelling ? 'Cancel this order?' : `Mark as ${fulfillmentLabel[to].toLowerCase()}?`,
      body: cancelling
        ? `${o.number} will be cancelled and its ${o.quantity} unit${o.quantity > 1 ? 's' : ''} returned to stock. This does not refund the customer: issue any refund in Stripe, and it will show here automatically.`
        : `${o.number} moves from ${fulfillmentLabel[o.fulfillment]} to ${fulfillmentLabel[to]}. This can't be undone.`,
      confirm: cancelling ? 'Cancel order' : 'Update order',
      danger: cancelling,
    })
    if (!ok) return
    setBusy(true)
    try {
      setOrder(await api<OrderDetail>(`/api/admin/orders/${o.id}`, { method: 'PATCH', body: { fulfillment: to, note } }))
      setTo('')
      setNote('')
      toast('Order updated.')
    } catch (e) {
      toast((e as Error).message, 'bad')
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      <Link href="/admin/orders" className="ulink mb-6 inline-block text-xs uppercase tracking-[0.2em] text-ash">← Orders</Link>
      <Status loading={loading} error={error} retry={reload} empty={!o}>
        {o && (
          <>
            <PageHead eyebrow={`Placed ${fmtDate(o.createdAt)}`} title={o.number}>
              <Tag tone={paymentTone[o.paymentStatus]}>{paymentLabel[o.paymentStatus]}</Tag>
              <Tag tone={fulfillmentTone[o.fulfillment]}>{fulfillmentLabel[o.fulfillment]}</Tag>
            </PageHead>

            <div className="grid gap-6 lg:grid-cols-[1fr_22rem]">
              <div className="grid content-start gap-6">
                <Panel title="Items">
                  <dl className="grid gap-3 text-sm">
                    <Row term={`${o.productName} × ${o.quantity}`} value={fmtMoney(o.subtotalCents)} />
                    <Row term="Unit price at order time" value={fmtMoney(o.unitPriceCents)} />
                    <Row term="Charged by Stripe (incl. shipping & tax)" value={o.payment.amountTotalCents != null ? fmtMoney(o.payment.amountTotalCents, o.currency) : 'Not paid yet'} strong />
                    {!!o.payment.amountRefundedCents && <Row term="Refunded" value={`− ${fmtMoney(o.payment.amountRefundedCents, o.currency)}`} />}
                  </dl>
                </Panel>

                <Panel title="Customer & shipping">
                  <div className="grid gap-6 text-sm sm:grid-cols-2">
                    <div className="grid gap-1">
                      <p className="font-semibold">{o.customer.name}</p>
                      <a className="ulink w-fit text-ash" href={`mailto:${o.customer.email}`}>{o.customer.email}</a>
                      <a className="ulink w-fit text-ash" href={`tel:${o.customer.phone}`}>{o.customer.phone}</a>
                    </div>
                    <address className="not-italic leading-relaxed text-ash">
                      {o.customer.address}<br />
                      {o.customer.city}, {o.customer.state} {o.customer.postal}<br />
                      {o.customer.country}
                    </address>
                  </div>
                </Panel>

                <Panel title="History">
                  <ol className="grid gap-3 text-sm">
                    {[...o.history].reverse().map((h, i) => (
                      <li key={i} className="grid gap-1 border-l border-line-strong pl-4 sm:grid-cols-[11rem_1fr]">
                        <span className="text-xs text-ash">{fmtDate(h.at)}</span>
                        <span>
                          <span className="capitalize">{h.kind}</span>: {h.to.replace(/_/g, ' ')} <span className="text-ash">· {h.by}</span>
                          {h.note && <span className="block text-ash">“{h.note}”</span>}
                        </span>
                      </li>
                    ))}
                  </ol>
                </Panel>
              </div>

              <div className="grid content-start gap-6">
                <Panel title="Fulfilment">
                  {options.length ? (
                    <div className="grid gap-4">
                      <Field label="Move to">
                        <select className="ainput" value={to} onChange={(e) => setTo(e.target.value as FulfillmentStatus)}>
                          <option value="">Choose…</option>
                          {options.map((s) => <option key={s} value={s}>{fulfillmentLabel[s]}</option>)}
                        </select>
                      </Field>
                      <Field label="Note (optional)" hint="e.g. carrier and tracking number">
                        <input className="ainput" value={note} maxLength={300} onChange={(e) => setNote(e.target.value)} />
                      </Field>
                      <button type="button" className="btn btn-sm" disabled={!to || busy} onClick={update}>{busy ? 'Saving…' : 'Update status'}</button>
                    </div>
                  ) : (
                    <p className="text-sm text-ash">
                      {open
                        ? 'Waiting for Stripe to confirm the payment. Fulfilment unlocks once it is paid.'
                        : o.fulfillment === 'delivered' || o.fulfillment === 'cancelled'
                          ? `This order is ${fulfillmentLabel[o.fulfillment].toLowerCase()}. No further changes.`
                          : 'This order was not paid, so it can’t be fulfilled.'}
                    </p>
                  )}
                </Panel>

                <Panel title="Payment">
                  <dl className="grid gap-3 text-sm">
                    <Row term="Status (from Stripe)" value={paymentLabel[o.paymentStatus]} />
                    {o.payment.method && <Row term="Method" value={o.payment.method} />}
                    {o.payment.paidAt && <Row term="Paid" value={fmtDate(o.payment.paidAt)} />}
                    <Row term="Mode" value={o.payment.livemode ? 'Live' : 'Test'} />
                    {o.payment.paymentIntentId && <Row term="Payment ID" value={<code className="break-all text-xs">{o.payment.paymentIntentId}</code>} />}
                    {o.payment.checkoutSessionId && <Row term="Checkout ID" value={<code className="break-all text-xs">{o.payment.checkoutSessionId}</code>} />}
                  </dl>
                  {o.payment.dashboard && (
                    <a href={o.payment.dashboard} target="_blank" rel="noopener noreferrer" className="btn btn-ghost btn-sm mt-5 w-full">Open in Stripe ↗</a>
                  )}
                  <p className="mt-4 text-xs leading-relaxed text-ash">Payment status is set by verified Stripe events only. Refunds are made in Stripe and appear here automatically.</p>
                </Panel>
              </div>
            </div>
          </>
        )}
      </Status>
    </>
  )
}

function Row({ term, value, strong }: { term: string; value: React.ReactNode; strong?: boolean }) {
  return (
    <div className={`flex items-baseline justify-between gap-4 ${strong ? 'border-t border-line pt-3 font-semibold' : ''}`}>
      <dt className="text-ash">{term}</dt>
      <dd className="text-right tabular-nums">{value}</dd>
    </div>
  )
}
