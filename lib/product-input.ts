import 'server-only'
import type { ProductDoc } from './db'
import { HttpError, int, link, list, text } from './validate'

type Editable = Omit<ProductDoc, '_id' | 'createdAt' | 'updatedAt'>

// Whitelisted product fields: anything else in the request body is ignored (no mass assignment).
const rules: { [K in keyof Editable]-?: (v: unknown) => Editable[K] } = {
  name: (v) => text(v, 'Name', 80),
  model: (v) => text(v, 'Model', 40),
  finish: (v) => text(v, 'Finish / colour', 40),
  swatch: (v) => {
    const s = text(v, 'Swatch colour', 7)
    if (!/^#[0-9a-f]{6}$/i.test(s)) throw new HttpError(400, 'Swatch colour must be a hex value like #151515.')
    return s
  },
  brand: (v) => text(v, 'Brand', 60, { required: false }),
  category: (v) => text(v, 'Category', 60, { required: false }),
  heading: (v) => text(v, 'Page heading', 160),
  line: (v) => text(v, 'Tagline', 160),
  description: (v) => text(v, 'Description', 1000, { multiline: true }),
  priceCents: (v) => int(v, 'Price (cents)', 50, 1_000_000), // Stripe minimum is $0.50
  stock: (v) => int(v, 'Stock', 0, 100_000),
  sortOrder: (v) => int(v, 'Display order', -1000, 1000),
  video: (v) => link(v, 'Video', { required: false }) || undefined,
  images: (v) =>
    list(v, 'Images', 1, 30).map((img, i) => {
      const o = (img ?? {}) as Record<string, unknown>
      return { src: link(o.src, `Image ${i + 1} URL`), alt: text(o.alt, `Image ${i + 1} description`, 200) }
    }),
  specs: (v) => specList(v, 'Specifications'),
  featureTable: (v) => specList(v, 'Feature list'),
}

function specList(v: unknown, field: string) {
  return list(v, field, 0, 60).map((row, i) => {
    const o = (row ?? {}) as Record<string, unknown>
    return { label: text(o.label, `${field} row ${i + 1} label`, 60), value: text(o.value, `${field} row ${i + 1} value`, 500) }
  })
}

/** Validates a full product (create) or only the fields present (update). */
export function parseProduct(b: Record<string, unknown>, partial: boolean): Partial<Editable> {
  const out: Partial<Editable> = {}
  for (const key of Object.keys(rules) as (keyof Editable)[]) {
    if (!(key in b)) {
      if (!partial && key !== 'video') rules[key](undefined) // throws "X is required."
      continue
    }
    Object.assign(out, { [key]: rules[key](b[key]) })
  }
  return out
}

export const PRODUCT_ID = /^[a-z0-9](?:[a-z0-9-]{0,38}[a-z0-9])?$/
