'use client'

import Link from 'next/link'
import { fmtDate, fmtMoney, fulfillmentTone, PageHead, Panel, paymentTone, Status, stockTag, Tag, useApi } from '@/components/admin/ui'
import type { OrderRow } from '@/lib/orders'
import { fulfillmentLabel, LOW_STOCK, paymentLabel } from '@/lib/statuses'

type Stats = {
  revenue30Cents: number
  paidOrders30: number
  toFulfil: number
  awaitingPayment: number
  failed7: number
  newInquiries: number
  products: { id: string; name: string; stock: number; state: 'ok' | 'low' | 'sold_out' }[]
  recent: OrderRow[]
  setup: { payments: string | null; webhook: boolean; notifications: boolean }
}

export default function Overview() {
  const { data, error, loading, reload } = useApi<Stats>('/api/admin/stats')

  const warnings = data
    ? [
        data.setup.payments && `Checkout is off: ${data.setup.payments}`,
        !data.setup.webhook && 'STRIPE_WEBHOOK_SECRET is not set, so paid orders will not update here.',
        data.failed7 > 0 && `${data.failed7} payment${data.failed7 > 1 ? 's' : ''} failed in the last 7 days. Do not ship those orders.`,
        ...data.products.filter((p) => p.state === 'sold_out').map((p) => `${p.name} is sold out. Buy buttons are disabled.`),
        ...data.products.filter((p) => p.state === 'low').map((p) => `${p.name} is running low (${p.stock} left).`),
        !data.setup.notifications && 'CONTACT_WEBHOOK_URL is not set, so new enquiries and orders are not emailed. They still appear here.',
      ].filter(Boolean)
    : []

  return (
    <>
      <PageHead eyebrow="Dashboard" title="Overview" />
      <Status loading={loading} error={error} retry={reload} empty={!data}>
        {data && (
          <div className="grid gap-8">
            <div className="grid grid-cols-2 border-l border-t border-line lg:grid-cols-4">
              <Stat label="Revenue · 30 days" value={fmtMoney(data.revenue30Cents)} note={`${data.paidOrders30} paid order${data.paidOrders30 === 1 ? '' : 's'}, net of refunds`} />
              <Stat label="To fulfil" value={data.toFulfil} note="Paid, not yet shipped" href="/admin/orders?fulfillment=unfulfilled" alert={data.toFulfil > 0} />
              <Stat label="Awaiting payment" value={data.awaitingPayment} note="Open Stripe checkouts" />
              <Stat label="New enquiries" value={data.newInquiries} note="Not yet opened" href="/admin/inquiries" alert={data.newInquiries > 0} />
            </div>

            {warnings.length > 0 && (
              <Panel title="Needs attention">
                <ul className="grid gap-3 text-sm">
                  {warnings.map((w) => (
                    <li key={String(w)} className="flex gap-3">
                      <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-ember" aria-hidden="true" />
                      {w}
                    </li>
                  ))}
                </ul>
              </Panel>
            )}

            <div className="grid gap-8 lg:grid-cols-[1fr_20rem]">
              <Panel title="Latest orders" actions={<Link href="/admin/orders" className="ulink text-xs text-ash">All orders</Link>}>
                {data.recent.length ? (
                  <div className="-m-5 overflow-x-auto">
                    <table className="atable min-w-[36rem]">
                      <thead>
                        <tr><th>Order</th><th>Customer</th><th>Total</th><th>Payment</th><th>Fulfilment</th></tr>
                      </thead>
                      <tbody>
                        {data.recent.map((o) => (
                          <tr key={o.id}>
                            <td>
                              <Link href={`/admin/orders/${o.id}`} className="ulink font-semibold">{o.number}</Link>
                              <p className="text-xs text-ash">{fmtDate(o.createdAt)}</p>
                            </td>
                            <td>{o.customerName}</td>
                            <td className="tabular-nums">{fmtMoney(o.totalCents, o.currency)}</td>
                            <td><Tag tone={paymentTone[o.paymentStatus]}>{paymentLabel[o.paymentStatus]}</Tag></td>
                            <td><Tag tone={fulfillmentTone[o.fulfillment]}>{fulfillmentLabel[o.fulfillment]}</Tag></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-sm text-ash">No orders yet. They appear here as soon as a customer starts checkout.</p>
                )}
              </Panel>
              <Panel title="Stock" actions={<Link href="/admin/products" className="ulink text-xs text-ash">Products</Link>}>
                <ul className="grid gap-4 text-sm">
                  {data.products.map((p) => (
                    <li key={p.id} className="flex items-center justify-between gap-3">
                      <Link href={`/admin/products/${p.id}`} className="ulink truncate">{p.name}</Link>
                      {stockTag(p.stock, LOW_STOCK)}
                    </li>
                  ))}
                </ul>
              </Panel>
            </div>
          </div>
        )}
      </Status>
    </>
  )
}

function Stat({ label, value, note, href, alert }: { label: string; value: React.ReactNode; note: string; href?: string; alert?: boolean }) {
  const body = (
    <>
      <p className="text-[0.625rem] font-semibold uppercase tracking-[0.2em] text-ash">{label}</p>
      <p className={`font-price mt-3 text-[2.4rem] leading-none tabular-nums ${alert ? 'text-ember' : 'text-bone'}`}>{value}</p>
      <p className="mt-2 text-xs text-ash">{note}</p>
    </>
  )
  const cls = 'block border-b border-r border-line p-5 transition-colors'
  return href ? <Link href={href} className={`${cls} hover:bg-ink-2`}>{body}</Link> : <div className={cls}>{body}</div>
}
