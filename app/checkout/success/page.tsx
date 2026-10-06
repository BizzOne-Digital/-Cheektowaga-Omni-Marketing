import type { Metadata } from 'next'
import Link from 'next/link'
import { getCheckout } from '@/lib/payments'
import { money } from '@/lib/products'
import { site } from '@/lib/site'

export const metadata: Metadata = { title: 'Order confirmation', robots: { index: false } }

export default async function Success({ searchParams }: { searchParams: Promise<{ session_id?: string }> }) {
  const { session_id } = await searchParams
  const order = session_id ? await getCheckout(session_id) : null
  const first = order?.name ? `, ${order.name.split(' ')[0]}` : ''
  const email = <a className="ulink text-bone" href={`mailto:${site.contact.email}`}>{site.contact.email}</a>

  return (
    <section className="wrap grid min-h-[100svh] content-center gap-10 py-32">
      <p className="eyebrow">{order?.state === 'paid' ? 'Order confirmed' : order?.state === 'processing' ? 'Payment processing' : 'Order status'}</p>
      <h1 data-split className="mega text-[clamp(3rem,9vw,9rem)]">
        {order?.state === 'paid' ? <>Thank you{first}.</> : order?.state === 'processing' ? <>Almost there{first}.</> : <>We&rsquo;re checking.</>}
      </h1>
      {order?.state === 'paid' ? (
        <p className="max-w-lg text-lg text-ash" data-reveal>
          Your payment of <span className="text-bone">{money(order.total)}</span> was received. A receipt is on its way to{' '}
          <span className="text-bone">{order.email}</span>. We&rsquo;ll be in touch about shipping.
        </p>
      ) : order?.state === 'processing' ? (
        <p className="max-w-lg text-lg text-ash" data-reveal>
          Your order is placed and your payment of <span className="text-bone">{money(order.total)}</span> is still being processed by your bank.
          A receipt will be sent to <span className="text-bone">{order.email}</span> once it clears. Nothing more is needed from you.
        </p>
      ) : (
        <p className="max-w-lg text-lg text-ash" data-reveal>
          We couldn&rsquo;t confirm this payment yet. If you were charged, contact {email} and we&rsquo;ll sort it out.
        </p>
      )}
      <Link href="/" className="btn w-fit" data-magnetic>Return Home <span className="btn-arrow" aria-hidden="true">→</span></Link>
    </section>
  )
}
