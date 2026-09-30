import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { legal, site } from '@/lib/site'

type Props = { params: Promise<{ slug: string }> }

export const generateStaticParams = () => Object.keys(legal).map((slug) => ({ slug }))
export const dynamicParams = false

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  return { title: legal[slug as keyof typeof legal], robots: { index: false } }
}

// PLACEHOLDER — replace with the client's approved policy text.
export default async function LegalPage({ params }: Props) {
  const { slug } = await params
  const title = legal[slug as keyof typeof legal]
  if (!title) notFound()
  return (
    <section className="wrap max-w-3xl pb-24 pt-40 lg:pt-48">
      <p className="eyebrow">Policy</p>
      <h1 data-split className="display mt-8 text-[clamp(3rem,8vw,7rem)]">{title}</h1>
      <p className="mt-10 leading-relaxed text-ash" data-reveal>
        This policy is being prepared and will be published here before launch. In the meantime, contact {site.contact.name} at{' '}
        <a className="ulink text-bone" href={`mailto:${site.contact.email}`}>{site.contact.email}</a> or{' '}
        <a className="ulink text-bone" href={`tel:${site.contact.tel}`}>{site.contact.phone}</a> with any questions.
      </p>
    </section>
  )
}
