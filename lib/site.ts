// Single source of truth for brand, contact and availability copy.
export const site = {
  name: 'Affordable Smart Watches',
  url: process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000',
  title: 'Affordable Elder Care Smartwatches for Seniors | VL16 Pro 4G GPS & SOS',
  description:
    'Affordable elder care smartwatches for seniors. Give your parent or grandparent the VL16 Pro: 4G calling, GPS location tracking, fall alerts, heart-rate monitoring and one-touch SOS, with no monthly fee. Peace of mind for families.',
  keywords: ['elder care smartwatch', 'smartwatch for seniors', 'senior GPS watch', 'fall detection watch for elderly', 'SOS watch for elderly parents', 'medical alert watch', 'affordable elder care watch', 'GPS tracker for elderly'],
  // Brand line from the client's earlier banner on affordablesmartwatches.com.
  tagline: 'More connectivity. More freedom.',
  about:
    'Affordable Smart Watches brings practical 4G safety smartwatches to families at a fair price, helping seniors stay independent and the people who love them stay reassured.',
  // Logo source: public/logo/smartlogo.png (navy). White versions are generated for the dark UI.
  logo: { full: '/logo/logo-white.png', mark: '/logo/mark-white.png', original: '/logo/smartlogo.png' },
  // Client will supply final store/contact wording; update here.
  contact: { name: 'Herbert Reid', phone: '604 256 4183', tel: '+16042564183', email: 'herbertreid@hotmail.com' },
  // VL16 Pro product video from the manufacturer's Alibaba listing, re-encoded without audio.
  heroVideo: '/media/vl16-pro.mp4',
  // Client's VL16 Pro banner (public/media/banner.jpeg, resized to webp). Price $125 is baked in.
  promoBanner: '/media/vl16-pro-banner.webp',
  // Hero clock shows US Eastern time.
  timeZone: 'America/New_York',
  timeLabel: 'New York',
}

export const nav = [
  { href: '/', label: 'Home' },
  { href: '/watches', label: 'Watches' },
  { href: '/compare', label: 'Compare' },
  { href: '/story', label: 'Story' },
  { href: '/contact', label: 'Contact' },
]

// The VL16 Pro is sold to US customers only. Checkout enforces this twice (lib/payments.ts):
// the buyer's IP country (Vercel geo header) and a US shipping address.
export const availability = {
  short: 'US customers only',
  long: 'Available to customers in the United States only. We ship to US addresses only. Orders from Canada and other countries can’t be accepted.',
}

// Ship-to states (50 states + DC). Country is fixed to US.
export const usStates: [code: string, label: string][] = [
  ['AL', 'Alabama'], ['AK', 'Alaska'], ['AZ', 'Arizona'], ['AR', 'Arkansas'], ['CA', 'California'], ['CO', 'Colorado'],
  ['CT', 'Connecticut'], ['DE', 'Delaware'], ['DC', 'District of Columbia'], ['FL', 'Florida'], ['GA', 'Georgia'],
  ['HI', 'Hawaii'], ['ID', 'Idaho'], ['IL', 'Illinois'], ['IN', 'Indiana'], ['IA', 'Iowa'], ['KS', 'Kansas'],
  ['KY', 'Kentucky'], ['LA', 'Louisiana'], ['ME', 'Maine'], ['MD', 'Maryland'], ['MA', 'Massachusetts'],
  ['MI', 'Michigan'], ['MN', 'Minnesota'], ['MS', 'Mississippi'], ['MO', 'Missouri'], ['MT', 'Montana'],
  ['NE', 'Nebraska'], ['NV', 'Nevada'], ['NH', 'New Hampshire'], ['NJ', 'New Jersey'], ['NM', 'New Mexico'],
  ['NY', 'New York'], ['NC', 'North Carolina'], ['ND', 'North Dakota'], ['OH', 'Ohio'], ['OK', 'Oklahoma'],
  ['OR', 'Oregon'], ['PA', 'Pennsylvania'], ['RI', 'Rhode Island'], ['SC', 'South Carolina'], ['SD', 'South Dakota'],
  ['TN', 'Tennessee'], ['TX', 'Texas'], ['UT', 'Utah'], ['VT', 'Vermont'], ['VA', 'Virginia'], ['WA', 'Washington'],
  ['WV', 'West Virginia'], ['WI', 'Wisconsin'], ['WY', 'Wyoming'],
]

export const legal = {
  privacy: 'Privacy Policy',
  terms: 'Terms',
  shipping: 'Shipping',
  returns: 'Returns',
} as const
