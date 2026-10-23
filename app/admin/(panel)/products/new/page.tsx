'use client'

import { ProductForm } from '@/components/admin/product-form'
import { PageHead } from '@/components/admin/ui'

export default function NewProductPage() {
  return (
    <>
      <PageHead eyebrow="Catalogue" title="Add product" />
      <ProductForm />
    </>
  )
}
