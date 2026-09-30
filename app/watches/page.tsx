import type { Metadata } from 'next'
import { StickyCta } from '@/components/hero'
import { BuyButton, ProductVisual } from '@/components/order'
import { Marquee, OfferFeature, PageHeader, Price } from '@/components/sections'
import { PRICING_CONFIRMED, products } from '@/lib/products'
import { site } from '@/lib/site'

export const metadata: Metadata = {
  title: 'Watches',
  description: 'Browse the Affordable Smart Watches collection and order online.',
  alternates: { canonical: '/watches' },
}

// Product schema carries only facts we have; price is added once it is confirmed.
const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': products.map((p) => ({
    '@type': 'Product',
    name: `${p.name} — ${p.finish}`,
    description: p.description,
    brand: { '@type': 'Brand', name: site.name },
    ...(PRICING_CONFIRMED ? { offers: { '@type': 'Offer', priceCurrency: 'USD', price: (p.priceCents / 100).toFixed(2), url: `${site.url}/watches#${p.id}` } } : {}),
  })),
}

export default function WatchesPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }} />
      <PageHeader eyebrow={`The collection · ${String(products.length).padStart(2, '0')} watches`} title="The watches." accent="choose yours.">
        Connected watches with a sport-ready attitude. Pick a finish, choose a quantity and order in a minute.
      </PageHeader>

      <nav aria-label="Jump to watch" className="wrap mb-10">
        <ul className="grid grid-cols-2 border-t border-line md:grid-cols-4" data-stagger>
          {products.map((p, i) => (
            <li key={p.id} className={`border-b border-line ${i % 2 ? 'border-l' : ''} md:border-l md:first:border-l-0`}>
              <a href={`#${p.id}`} className="group flex items-center justify-between gap-3 px-1 py-5 text-sm md:px-5">
                <span><span className="text-ember">0{i + 1}</span>&nbsp;&nbsp;{p.finish}</span>
                <span className="translate-x-[-6px] text-ember opacity-0 transition duration-500 group-hover:translate-x-0 group-hover:opacity-100" aria-hidden="true">↓</span>
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <div className="wrap grid gap-32 py-16 lg:gap-48">
        {products.map((p, i) => (
          <article key={p.id} id={p.id} className="group grid scroll-mt-28 items-center gap-10 lg:grid-cols-12" aria-labelledby={`${p.id}-name`}>
            <div className={`relative lg:col-span-7 ${i % 2 ? 'lg:order-2' : ''}`} data-cursor="Buy">
              <div className="product-stage aspect-[4/5]" data-reveal="mask" style={{ '--stage-glow': `${p.colorway.glow}33` } as React.CSSProperties}>
                <ProductVisual product={p} className={p.image ? 'render size-full' : 'render absolute inset-0 m-auto h-[80%] w-auto'} />
                {!p.image && <span className="floor" aria-hidden="true" />}
              </div>
              <p aria-hidden="true" className={`mega pointer-events-none absolute -top-[0.35em] text-[clamp(5rem,13vw,13rem)] outline-text ${i % 2 ? '-left-2 lg:-left-[6%]' : '-right-2 lg:-right-[6%]'}`} data-speed="0.2">
                0{i + 1}
              </p>
            </div>
            <div className={`lg:col-span-5 ${i % 2 ? 'lg:order-1 lg:pr-10' : 'lg:pl-10'}`}>
              <p className="eyebrow" data-reveal="fade">{p.finish}</p>
              <h2 id={`${p.id}-name`} data-split className="mega mt-6 text-[clamp(2.8rem,5.5vw,5.6rem)]">{p.name}</h2>
              <p className="display mt-4 text-3xl italic text-ember-soft" data-reveal>{p.line}</p>
              <p className="mt-6 max-w-md leading-relaxed text-ash" data-reveal>{p.description}</p>
              <div className="mt-8 flex flex-wrap items-center justify-between gap-6 border-y border-line py-6" data-reveal>
                <Price product={p} />
                <BuyButton productId={p.id} />
              </div>
              <p className="mt-4 text-xs text-ash" data-reveal>Placeholder image and details — final specifications to follow.</p>
            </div>
          </article>
        ))}
      </div>

      <div className="mt-32"><Marquee words={['Give $35', 'Get the watch', 'Special offer']} /></div>
      <OfferFeature />
      <StickyCta />
    </>
  )
}
