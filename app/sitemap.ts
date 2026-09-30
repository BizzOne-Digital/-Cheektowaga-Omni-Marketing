import type { MetadataRoute } from 'next'
import { nav, site } from '@/lib/site'

export default function sitemap(): MetadataRoute.Sitemap {
  return nav.map((n) => ({ url: `${site.url}${n.href === '/' ? '' : n.href}`, changeFrequency: 'weekly', priority: n.href === '/' ? 1 : 0.8 }))
}
