// Single source of truth for brand, contact and offer copy.
export const site = {
  name: 'Affordable Smart Watches',
  url: process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000',
  title: 'Affordable Smart Watches | Connected Technology at an Accessible Price',
  description:
    'Shop Affordable Smart Watches — connected, modern watches designed for active everyday lifestyles. Explore available watches, special offers, and online ordering.',
  tagline: 'Connected technology. Sport-ready design. Everyday performance.',
  about:
    'Affordable Smart Watches is a new pop-up go-to site for innovative product marketing and great ways to pass the time.',
  associated: { name: 'Cheektowaga - Omni', site: 'cheektowagamusic.com', href: 'https://cheektowagamusic.com' },
  // Logo source: public/logo/smartlogo.png (navy). White versions are generated for the dark UI.
  logo: { full: '/logo/logo-white.png', mark: '/logo/mark-white.png', original: '/logo/smartlogo.png' },
  social: { platform: 'Instagram', handle: '@cheektowaga_music', href: 'https://www.instagram.com/cheektowaga_music/' },
  contact: { name: 'Herbert Reid', phone: '604 256 4183', tel: '+16042564183', email: 'herbertreid@hotmail.com' },
  // Replace with the client's video. Poster shows while it loads or if the file is missing.
  heroVideo: '/media/hero-video.mp4',
  heroPoster: '/watch-hero.png',
  // Clock and watch hands show US Eastern time (brand is based in Cheektowaga, NY).
  timeZone: 'America/New_York',
  timeLabel: 'New York',
}

// Current hour/minute/second in the site's US time zone, regardless of the visitor's location.
export function usTimeParts(date = new Date()) {
  const parts = new Intl.DateTimeFormat('en-US', { timeZone: site.timeZone, hour: 'numeric', minute: 'numeric', second: 'numeric', hourCycle: 'h23' }).formatToParts(date)
  const get = (t: string) => Number(parts.find((p) => p.type === t)?.value ?? 0)
  return { h: get('hour'), m: get('minute'), s: get('second') }
}

export const nav = [
  { href: '/', label: 'Home' },
  { href: '/watches', label: 'Watches' },
  { href: '/offer', label: 'Offers' },
  { href: '/story', label: 'Story' },
  { href: '/contact', label: 'Contact' },
]

export const offer = {
  donation: 35,
  charity: 'TheUrbanSurvivor.org',
  charityHref: 'https://theurbansurvivor.org',
  summary:
    'Make a $35 USD donation to TheUrbanSurvivor.org, cover shipping and handling, and receive the featured smart watch at no additional product cost.',
  // Set NEXT_PUBLIC_OFFER_URL once the donation workflow is confirmed; until then claims are sent as enquiries.
  claimUrl: process.env.NEXT_PUBLIC_OFFER_URL || null,
}

export const legal = {
  privacy: 'Privacy Policy',
  terms: 'Terms',
  shipping: 'Shipping',
  returns: 'Returns',
} as const
