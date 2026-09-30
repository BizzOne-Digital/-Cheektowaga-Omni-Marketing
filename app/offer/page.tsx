import type { Metadata } from 'next'
import Link from 'next/link'
import { ClaimButton, ProductVisual } from '@/components/order'
import { OfferFeature } from '@/components/sections'
import { products } from '@/lib/products'
import { offer, site } from '@/lib/site'

export const metadata: Metadata = {
  title: 'Special Offer',
  description: `Donate $${offer.donation} USD to ${offer.charity}, pay applicable shipping and handling, and receive the featured smart watch for free.`,
  alternates: { canonical: '/offer' },
}

export default function OfferPage() {
  const featured = products[0]
  return (
    <>
      <section className="wrap grid gap-14 pb-24 pt-40 lg:grid-cols-12 lg:pt-48" aria-labelledby="offer-page-title">
        <div className="lg:col-span-7">
          <p className="eyebrow" data-reveal="fade">Special offer</p>
          <h1 id="offer-page-title" className="mt-8">
            <span data-split className="mega block text-[clamp(3.6rem,10.5vw,11rem)]">Give ${offer.donation}.</span>
            <span data-split data-delay="0.12" className="display block text-[clamp(3.2rem,9.5vw,10rem)] italic text-ember">Get the watch.</span>
          </h1>
          <p className="mt-10 max-w-xl text-lg leading-relaxed text-bone/85" data-reveal data-delay="0.3">{offer.summary}</p>
          <div className="mt-10 flex flex-wrap gap-3" data-reveal data-delay="0.4">
            <ClaimButton />
            <Link href="/watches" className="btn btn-ghost">Shop all watches</Link>
          </div>
        </div>
        <div className="relative lg:col-span-5" data-cursor="Claim">
          <div className="product-stage aspect-[4/5]" data-reveal="mask">
            <ProductVisual product={featured} className="render size-full" />
          </div>
          <div className="absolute -bottom-6 left-6 right-6 border border-line bg-ink/80 p-5 backdrop-blur-md" data-reveal data-delay="0.6">
            <p className="text-[0.625rem] font-semibold uppercase tracking-[0.22em] text-ash">Featured watch</p>
            <p className="mt-1 font-semibold">{featured.name} · {featured.finish}</p>
          </div>
        </div>
      </section>

      <section className="wrap py-24" aria-labelledby="how-title">
        <h2 id="how-title" data-split className="display text-[clamp(2.6rem,5vw,5rem)]">How it <span className="italic text-ember">works.</span></h2>
        <ol className="mt-14 grid border-t border-line md:grid-cols-3" data-stagger>
          {[
            ['Donate', `Make a $${offer.donation} USD donation to ${offer.charity}.`],
            ['Ship', 'Pay the applicable shipping and handling for your watch.'],
            ['Receive', 'Receive the featured smart watch at no additional product cost.'],
          ].map(([t, d], i) => (
            <li key={t} className={`grid gap-6 border-b border-line py-10 md:pr-8 ${i ? 'md:border-l md:pl-8' : ''}`}>
              <span className="mega text-7xl text-ember">0{i + 1}</span>
              <p className="display text-4xl">{t}</p>
              <p className="max-w-xs text-ash">{d}</p>
            </li>
          ))}
        </ol>
        <p className="mt-10 max-w-2xl text-sm leading-relaxed text-ash" data-reveal>
          Questions about the offer? Contact {site.contact.name} at{' '}
          <a className="ulink text-bone" href={`mailto:${site.contact.email}`}>{site.contact.email}</a> or{' '}
          <a className="ulink text-bone" href={`tel:${site.contact.tel}`}>{site.contact.phone}</a>. For questions about donations themselves, please contact{' '}
          <a className="ulink text-bone" href={offer.charityHref} target="_blank" rel="noopener noreferrer">{offer.charity}</a> directly.
        </p>
      </section>

      <OfferFeature detailed />
    </>
  )
}
