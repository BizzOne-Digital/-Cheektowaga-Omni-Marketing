// Single source of truth for brand, contact and offer copy.
export const site = {
  name: 'Affordable Smart Watches',
  url: process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000',
  title: 'Affordable Smart Watches | L16 Pro 4G Safety Smartwatch',
  description:
    'Shop the L16 Pro Smartwatch from Affordable Smart Watches: 4G calling, GPS location tracking, fall alerts and one-touch SOS that helps seniors stay independent and families stay reassured.',
  // From the client's L16 Pro banner on affordablesmartwatches.com.
  tagline: 'More connectivity. More freedom.',
  pillars: ['Stay connected.', 'Live healthier.', 'Do more.'],
  about:
    'Affordable Smart Watches brings practical 4G safety smartwatches to families at a fair price, helping seniors stay independent and the people who love them stay reassured.',
  // Logo source: public/logo/smartlogo.png (navy). White versions are generated for the dark UI.
  logo: { full: '/logo/logo-white.png', mark: '/logo/mark-white.png', original: '/logo/smartlogo.png' },
  // Client will supply final store/contact wording; update here.
  contact: { name: 'Herbert Reid', phone: '604 256 4183', tel: '+16042564183', email: 'herbertreid@hotmail.com' },
  // L16 Pro product video from the client's site, re-encoded without audio.
  heroVideo: '/media/l16-pro.mp4',
  promoBanner: '/media/l16-pro-banner.webp',
  // Hero clock shows US Eastern time.
  timeZone: 'America/New_York',
  timeLabel: 'New York',
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

// Countries the store ships to (ISO codes, as Stripe requires). Add more as needed.
export const shipCountries: [code: string, label: string][] = [
  ['US', 'United States'],
  ['CA', 'Canada'],
]

export const legal = {
  privacy: 'Privacy Policy',
  terms: 'Terms',
  shipping: 'Shipping',
  returns: 'Returns',
} as const
