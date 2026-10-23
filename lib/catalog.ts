import 'server-only'
import { cache } from 'react'
import { connection } from 'next/server'
import { contentDefaults, mergeContent } from './content'
import { cols, dbConfigured, type BannerDoc, type ProductDoc } from './db'
import { products as seedProducts, withStock, type Product } from './products'
import { site } from './site'

// Public reads. Pages render per request so admin edits (stock, specs, banners, copy) show immediately.
// If MongoDB is missing or down, the site falls back to the code defaults instead of erroring;
// checkout still refuses orders then, because it reserves stock in the database.

// Legacy /uploads/... paths pointed at local disk, which doesn't survive a serverless deploy: show a placeholder instead.
export const PLACEHOLDER = '/media/placeholder.svg'
const displaySrc = (src: string) => (src.startsWith('/uploads/') ? PLACEHOLDER : src)

export const docToProduct = ({ _id, createdAt, updatedAt, ...p }: ProductDoc): Product =>
  withStock({ ...p, id: _id, images: p.images.map((i) => ({ ...i, src: displaySrc(i.src) })) })

async function fromDb<T>(what: string, read: () => Promise<T>, fallback: T): Promise<T> {
  await connection()
  if (!dbConfigured) return fallback
  try {
    return await read()
  } catch (err) {
    console.error(`[catalog] ${what} unavailable, using defaults:`, (err as Error).message)
    return fallback
  }
}

export const getProducts = cache(() =>
  fromDb(
    'products',
    async () => {
      const docs = await (await cols()).products.find().sort({ sortOrder: 1, _id: 1 }).toArray()
      return docs.length ? docs.map(docToProduct) : seedProducts.map(withStock)
    },
    seedProducts.map(withStock),
  ),
)

/** The product the storefront is built around (lowest sortOrder). */
export const getFeatured = cache(async () => (await getProducts())[0])

export type Banner = Pick<BannerDoc, 'src' | 'alt' | 'href' | 'width' | 'height'> & { id: string }
export const defaultBanner: Banner = {
  id: 'default',
  src: site.promoBanner,
  alt: 'VL16 Pro Smartwatch, affordable smart watches. Heart rate monitoring, fitness tracking, smart notifications, long battery life. $125 USD.',
  href: '/watches',
  width: 1600,
  height: 576,
}

export const getBanners = cache(() =>
  fromDb(
    'banners',
    async () => {
      const docs = await (await cols()).banners.find({ enabled: true }).sort({ sortOrder: 1, _id: 1 }).toArray()
      return docs.map(({ _id, src, alt, href, width, height }): Banner => ({ id: _id.toHexString(), src: displaySrc(src), alt, href, width, height }))
    },
    [defaultBanner],
  ),
)

export const getContent = cache(() =>
  fromDb(
    'content',
    async () => mergeContent(await (await cols()).settings.findOne({ _id: 'content' })),
    contentDefaults,
  ),
)
