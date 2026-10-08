import type { Metadata } from 'next'
import { StickyCta } from '@/components/hero'
import { Gallery } from '@/components/gallery'
import { BuyButton } from '@/components/order'
import { FeatureTable, Marquee, OfferFeature, Price } from '@/components/sections'
import { healthNote, highlights, money, PRICING_CONFIRMED, products, specs } from '@/lib/products'
import { site } from '@/lib/site'

const product = products[0]

export const metadata: Metadata = {
  title: product.name,
  description: `${product.name}: ${product.description} ${PRICING_CONFIRMED ? `${money(product.priceCents)} USD.` : ''}`.trim(),
  alternates: { canonical: '/watches' },
  openGraph: { images: [{ url: product.images[0].src, alt: product.images[0].alt }] },
}

// Product schema carries only facts we have (no ratings, reviews or availability claims).
const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': products.map((p) => ({
    '@type': 'Product',
    name: p.name,
    model: p.model,
    color: p.finish,
    description: p.description,
    image: p.images.map((i) => `${site.url}${i.src}`),
    brand: { '@type': 'Brand', name: site.name },
    ...(PRICING_CONFIRMED ? { offers: { '@type': 'Offer', priceCurrency: 'USD', price: (p.priceCents / 100).toFixed(2), url: `${site.url}/watches` } } : {}),
  })),
}

export default function WatchesPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }} />
      <header className="wrap pb-16 pt-40 lg:pb-20 lg:pt-48">
        <p className="eyebrow" data-reveal="fade">{product.name} · {product.model}</p>
        <h1 className="mt-8" aria-label={product.heading}>
          <span data-split className="mega block text-[clamp(2.8rem,7.5vw,8rem)]">Peace of mind on your wrist:</span>
          <span data-split data-delay="0.12" className="display mt-2 block text-[clamp(2.4rem,6vw,6.5rem)] italic text-ember">The L16 Pro Smartwatch</span>
        </h1>
        <p className="mt-10 max-w-2xl text-lg leading-relaxed text-ash" data-reveal data-delay="0.3">{product.description}</p>
      </header>

      <article id={product.id} className="wrap group grid scroll-mt-28 items-center gap-10 py-8 lg:grid-cols-12" aria-labelledby="product-name">
        <div className="relative lg:col-span-7" data-cursor="Buy">
          <Gallery product={product} />
        </div>
        <div className="lg:col-span-5 lg:pl-10">
          <p className="eyebrow" data-reveal="fade">{product.finish}</p>
          <h2 id="product-name" data-split className="mega mt-6 text-[clamp(2.6rem,4.6vw,4.6rem)]">{product.name}</h2>
          <p className="display mt-4 text-3xl italic text-ember-soft" data-reveal>{product.line}</p>
          <ul className="mt-8 grid gap-5 text-sm" data-stagger>
            {highlights.map((h) => (
              <li key={h.title} className="flex gap-3">
                <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-ember" aria-hidden="true" />
                <span><span className="font-semibold text-bone">{h.title}.</span> <span className="text-ash">{h.text}</span></span>
              </li>
            ))}
          </ul>
          <div className="mt-8 flex flex-wrap items-center justify-between gap-6 border-y border-line py-6" data-reveal>
            <Price product={product} />
            <BuyButton productId={product.id} />
          </div>
          <a href="#specs" className="ulink mt-6 inline-flex items-center gap-3 text-[0.75rem] font-semibold uppercase tracking-[0.2em]" data-reveal>
            Full specifications <span className="text-ember" aria-hidden="true">↓</span>
          </a>
        </div>
      </article>

      <FeatureTable product={product} />

      {product.video && (
        <section className="wrap pt-32" aria-labelledby="video-title">
          <div className="mb-10 flex flex-wrap items-end justify-between gap-6">
            <h2 id="video-title" data-split className="display text-[clamp(2.4rem,4.6vw,4.6rem)]">
              See it <span className="italic text-ember">in action.</span>
            </h2>
            <p className="max-w-sm text-sm text-ash" data-reveal>SIM setup, fitting, the SOS key and the main screens, in about a minute.</p>
          </div>
          <div className="overflow-hidden border border-line-strong bg-white" data-reveal="mask">
            <video src={product.video} controls muted playsInline preload="metadata" className="aspect-video w-full" aria-label={`${product.name} product video (no sound)`} />
          </div>
        </section>
      )}

      <section id="specs" className="wrap scroll-mt-28 py-32" aria-labelledby="specs-title">
        <div className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <p className="eyebrow" data-reveal="fade">Specifications</p>
            <h2 id="specs-title" data-split className="display mt-6 text-[clamp(2.6rem,5vw,5rem)]">
              The <span className="italic text-ember">details.</span>
            </h2>
          </div>
          <div className="lg:col-span-8">
            <dl className="border-t border-line" data-stagger>
              {specs.map(([label, value]) => (
                <div key={label} className="grid gap-2 border-b border-line py-5 sm:grid-cols-[12rem_1fr] sm:gap-8">
                  <dt className="text-[0.6875rem] font-semibold uppercase tracking-[0.2em] text-ash">{label}</dt>
                  <dd className="leading-relaxed">{value}</dd>
                </div>
              ))}
            </dl>
            <p className="mt-8 max-w-2xl text-xs leading-relaxed text-ash" data-reveal>{healthNote}</p>
          </div>
        </div>
      </section>

      <div className="mt-16"><Marquee words={['Give $35', 'Get the watch', 'Special offer']} /></div>
      <OfferFeature />
      <StickyCta />
    </>
  )
}
