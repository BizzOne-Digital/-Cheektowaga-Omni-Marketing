import type { Metadata } from 'next'
import Link from 'next/link'
import { ImageStory, Marquee, PageHeader, Values } from '@/components/sections'
import { site } from '@/lib/site'

export const metadata: Metadata = {
  title: 'Our Story',
  description: site.about,
  alternates: { canonical: '/story' },
}

export default function StoryPage() {
  return (
    <>
      <PageHeader eyebrow="Our story" title="A new way" accent="to pass the time." />

      <section className="wrap grid gap-14 pb-32 lg:grid-cols-12" aria-label="About">
        <div className="lg:col-span-5">
          <div className="aspect-[3/4] overflow-hidden" data-reveal="mask">
            <img src="/watch-hero.png" alt="Smart watch with a glowing orange face above a concrete plinth" className="size-full object-cover" loading="lazy" />
          </div>
        </div>
        <div className="grid content-center gap-12 lg:col-span-6 lg:col-start-7">
          <p data-scrub-words className="display text-[clamp(2rem,3.6vw,3.4rem)] leading-[1.08]">
            Associated with {site.associated.name} and {site.associated.site}, {site.about}
          </p>
          <dl className="grid gap-0 border-t border-line text-sm" data-stagger>
            <div className="flex justify-between gap-6 border-b border-line py-5"><dt className="text-ash">Associated with</dt><dd>{site.associated.name}</dd></div>
            <div className="flex justify-between gap-6 border-b border-line py-5"><dt className="text-ash">Website</dt><dd><a className="ulink" href={site.associated.href} target="_blank" rel="noopener noreferrer">{site.associated.site}</a></dd></div>
            <div className="flex justify-between gap-6 border-b border-line py-5"><dt className="text-ash">{site.social.platform}</dt><dd><a className="ulink" href={site.social.href} target="_blank" rel="noopener noreferrer">{site.social.handle}</a></dd></div>
            <div className="flex justify-between gap-6 border-b border-line py-5"><dt className="text-ash">Contact</dt><dd>{site.contact.name}</dd></div>
          </dl>
          <div className="flex flex-wrap gap-3" data-reveal>
            <Link href="/watches" className="btn" data-magnetic>Shop Watches <span className="btn-arrow" aria-hidden="true">→</span></Link>
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
