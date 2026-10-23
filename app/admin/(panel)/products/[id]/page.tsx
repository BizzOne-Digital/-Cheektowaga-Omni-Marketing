'use client'

import Link from 'next/link'
import { useParams } from 'next/navigation'
import { ProductForm } from '@/components/admin/product-form'
import { PageHead, Status, useApi } from '@/components/admin/ui'
import type { ProductData } from '@/lib/products'

export default function EditProductPage() {
  const { id } = useParams<{ id: string }>()
  const { data, error, loading, reload } = useApi<ProductData & { updatedAt: string }>(`/api/admin/products/${id}`)
  return (
    <>
      <Link href="/admin/products" className="ulink mb-6 inline-block text-xs uppercase tracking-[0.2em] text-ash">← Products</Link>
      <PageHead eyebrow={`Product · ${id}`} title={data?.name ?? 'Edit product'} />
      {/* Form mounts once with loaded data; key resets it if the product is reloaded. */}
      <Status loading={loading} error={error} retry={reload} empty={!data}>
        {data && <ProductForm key={data.updatedAt} initial={data} />}
      </Status>
    </>
  )
}
