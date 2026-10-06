'use client'

import { useState } from 'react'
import type { Product } from '@/lib/products'

// Main photo + thumbnails. Photos have white backgrounds, so they sit on white panels.
export function Gallery({ product }: { product: Product }) {
  const [active, setActive] = useState(0)
  const main = product.images[active]
  return (
    <div className="grid gap-3">
      <div className="product-stage light relative aspect-square" data-reveal="mask">
        <img key={main.src} src={main.src} alt={main.alt} className="render absolute inset-0 size-full object-contain p-[6%]" />
      </div>
      <ul className="grid grid-cols-4 gap-3 sm:grid-cols-7" aria-label="Product photos">
        {product.images.map((img, i) => (
          <li key={img.src}>
            <button
              type="button"
              onClick={() => setActive(i)}
              aria-label={`Show photo ${i + 1}: ${img.alt}`}
              aria-current={i === active ? 'true' : undefined}
              className={`block aspect-square w-full bg-white p-1 outline-offset-2 transition-[box-shadow,opacity] duration-300 ${i === active ? 'shadow-[0_0_0_2px_#E06D34]' : 'opacity-70 hover:opacity-100'}`}
            >
              <img src={img.src} alt="" className="size-full object-contain" loading="lazy" />
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
