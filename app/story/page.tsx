import type { Metadata } from 'next'
import Link from 'next/link'
import { ImageStory, Marquee, PageHeader, Values } from '@/components/sections'
import { products } from '@/lib/products'
import { site } from '@/lib/site'

export const metadata: Metadata = {
  title: 'Our Story',
  description: site.about,
  alternates: { canonical: '/story' },
}

const promises = [
  ['Safety first', 'Every feature we choose has one job: helping someone get help faster, from the SOS key to fall alerts.'],
  ['Fair prices', 'Peace of mind shouldn\u2019t be a luxury. We keep our watches affordable so more families can have it.'],
  ['Simple by design', 'One button for help, a clear screen, and an app the whole family can use.'],
]

export default function StoryPage() {
  return (
    <>
      <PageHeader eyebrow="Our story" title="Care, made" accent="affordable." />

      <section className="wrap grid gap-14 pb-32 lg:grid-cols-12" aria-label="About us">
        <div className="lg:col-span-5">
          <div className="product-stage light relative aspect-[3/4]" data-reveal="mask">
            <img src={products[0].images[3].src} alt={products[0].images[3].alt} className="absolute inset-0 size-full object-contain p-[8%]" loading="lazy" />
          </div>
        </div>
        <div className="grid content-center gap-10 lg:col-span-6 lg:col-start-7">
          <p data-scrub-words className="display text-[clamp(2rem,3.6vw,3.4rem)] leading-[1.08]">
            Growing older shouldn&rsquo;t mean giving up independence, and caring for someone shouldn&rsquo;t mean constant worry.
          </p>
          <div className="grid gap-5 leading-relaxed text-ash" data-stagger>
            <p>
              {site.name} exists to close that gap. We bring families practical, well-made 4G safety watches at a price that makes sense,
              so the people you love can keep living life their way, with help always within reach.
            </p>
            <p>
              Our first watch, the L16 Pro, puts the essentials on one wrist: GPS location, fall alerts, a one-touch SOS key that notifies family,
              two-way calling and everyday health readings. Simple for the wearer. Reassuring for everyone else.
            </p>
          </div>
          <dl className="grid gap-0 border-t border-line text-sm" data-stagger>
            {promises.map(([t, d]) => (
              <div key={t} className="grid gap-1 border-b border-line py-5 sm:grid-cols-[11rem_1fr] sm:gap-6">
                <dt className="font-semibold text-bone">{t}</dt>
                <dd className="text-ash">{d}</dd>
              </div>
            ))}
          </dl>
          <div className="flex flex-wrap gap-3" data-reveal>
            <Link href="/watches" className="btn" data-magnetic>Meet the L16 Pro <span className="btn-arrow" aria-hidden="true">→</span></Link>
            <Link href="/contact" className="btn btn-ghost">Get in touch</Link>
          </div>
        </div>
      </section>

      <Marquee />
      <Values />
      <ImageStory />
    </>
  )
}
