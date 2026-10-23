import type { Metadata } from 'next'
import { StickyCta } from '@/components/hero'
import { PageHeader, PriceCompare } from '@/components/sections'
import { getFeatured } from '@/lib/catalog'
import { comparison, money } from '@/lib/products'

export async function generateMetadata(): Promise<Metadata> {
  const product = await getFeatured()
  return {
    title: 'Compare Prices',
    description: `Compare the ${product.name} (${money(product.priceCents)} USD, no monthly fee) with ${comparison.watches.slice(1).join(' and ')}: watch price, monthly fees and first-year cost in the US.`,
    alternates: { canonical: '/compare' },
  }
}

export default async function ComparePage() {
  const product = await getFeatured()
  return (
    <>
      <PageHeader eyebrow="Compare prices · US market" title="Compare." accent="And save.">
        See what a fall-alert watch really costs in its first year in the US, side by side.
      </PageHeader>
      <PriceCompare product={product} />
      <StickyCta />
    </>
  )
}
