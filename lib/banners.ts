import 'server-only'
import type { BannerDoc } from './db'
import { bool, int, link, text } from './validate'

export const bannerDto = (b: BannerDoc) => ({
  id: b._id.toHexString(),
  src: b.src,
  alt: b.alt,
  href: b.href,
  width: b.width,
  height: b.height,
  enabled: b.enabled,
  sortOrder: b.sortOrder,
  updatedAt: b.updatedAt.toISOString(),
})
export type BannerDto = ReturnType<typeof bannerDto>

// Whitelisted, validated banner fields.
export const bannerFields = {
  src: (v: unknown) => link(v, 'Image'),
  alt: (v: unknown) => text(v, 'Image description', 300),
  href: (v: unknown) => link(v, 'Link'),
  width: (v: unknown) => int(v, 'Width', 100, 8000),
  height: (v: unknown) => int(v, 'Height', 50, 8000),
  enabled: (v: unknown) => bool(v, 'Enabled'),
}
export type BannerFields = { [K in keyof typeof bannerFields]: ReturnType<(typeof bannerFields)[K]> }
