import type { Metadata } from 'next'
import { ContactForm } from '@/components/contact-form'
import { PageHeader } from '@/components/sections'
import { site } from '@/lib/site'

export const metadata: Metadata = {
  title: 'Contact',
  description: `Contact ${site.name} — call ${site.contact.phone} or email ${site.contact.email}.`,
  alternates: { canonical: '/contact' },
}

export default function ContactPage() {
  return (
    <>
      <PageHeader eyebrow="Contact" title="Let’s talk" accent="time." />
      <section className="wrap grid gap-16 pb-16 lg:grid-cols-12" aria-label="Contact details and form">
        <div className="grid content-start gap-10 lg:col-span-5" data-stagger>
          <div>
            <p className="eyebrow">Speak to</p>
            <p className="display mt-4 text-5xl">{site.contact.name}</p>
          </div>
          <a href={`tel:${site.contact.tel}`} className="group block border-t border-line pt-6" data-cursor="Call">
            <span className="text-[0.6875rem] font-semibold uppercase tracking-[0.2em] text-ash">Phone</span>
            <span className="mega mt-3 block text-[clamp(2rem,4.2vw,3.6rem)] transition-colors duration-500 group-hover:text-ember">{site.contact.phone}</span>
          </a>
          <a href={`mailto:${site.contact.email}`} className="group block border-t border-line pt-6" data-cursor="Email">
            <span className="text-[0.6875rem] font-semibold uppercase tracking-[0.2em] text-ash">Email</span>
            <span className="display mt-3 block break-all text-[clamp(1.8rem,3.4vw,3rem)] transition-colors duration-500 group-hover:text-ember">{site.contact.email}</span>
          </a>
          <a href={site.social.href} target="_blank" rel="noopener noreferrer" className="group block border-t border-line pt-6" data-cursor="Follow">
            <span className="text-[0.6875rem] font-semibold uppercase tracking-[0.2em] text-ash">{site.social.platform}</span>
            <span className="display mt-3 block break-all text-[clamp(1.8rem,3.4vw,3rem)] transition-colors duration-500 group-hover:text-ember">{site.social.handle}</span>
          </a>
        </div>
        <div className="border-t border-line pt-10 lg:col-span-6 lg:col-start-7 lg:border-t-0 lg:pt-0" data-reveal>
          <ContactForm />
        </div>
      </section>
    </>
  )
}
