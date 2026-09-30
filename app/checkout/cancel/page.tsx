import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = { title: 'Checkout cancelled', robots: { index: false } }

export default function Cancel() {
  return (
    <section className="wrap grid min-h-[100svh] content-center gap-10 py-32">
      <p className="eyebrow">Checkout cancelled</p>
      <h1 data-split className="mega text-[clamp(3rem,9vw,9rem)]">No charge <span className="display font-normal normal-case italic text-ember">was made.</span></h1>
      <p className="max-w-lg text-lg text-ash" data-reveal>Your payment was cancelled before completion. Your watch is still waiting.</p>
      <Link href="/watches" className="btn w-fit" data-magnetic>Back to the watches <span className="btn-arrow" aria-hidden="true">→</span></Link>
    </section>
  )
}
