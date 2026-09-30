// PLACEHOLDER CATALOG — names, prices and renders are stand-ins until the client
// supplies the final catalog and negotiated prices. Swap `image` for real photography.
export type Colorway = { case: [string, string, string]; band: string; accent: string; glow: string }

export type Product = {
  id: string
  name: string
  finish: string
  line: string
  description: string
  priceCents: number
  image?: string
  colorway: Colorway
}

// Flip to true once prices are negotiated; while false the UI flags pricing as provisional.
export const PRICING_CONFIRMED = false

export const products: Product[] = [
  {
    id: 'smart-watch-one',
    name: 'Smart Watch One',
    finish: 'Obsidian',
    line: 'Connected daily performance.',
    description: 'The signature piece. A dark, quiet case with a warm orange face that reads at a glance.',
    priceCents: 4900,
    image: '/watch-hero.png',
    colorway: { case: ['#0d0d0d', '#3a3a3a', '#141414'], band: '#121212', accent: '#E06D34', glow: '#E06D34' },
  },
  {
    id: 'smart-watch-sport',
    name: 'Smart Watch Sport',
    finish: 'Ember',
    line: 'Built for people who keep moving.',
    description: 'A black case paired with a signature orange sport band, made for training days and weekends.',
    priceCents: 5900,
    colorway: { case: ['#0f0f0f', '#444', '#161616'], band: '#E06D34', accent: '#F5F2ED', glow: '#F29A68' },
  },
  {
    id: 'smart-watch-silver',
    name: 'Smart Watch Silver',
    finish: 'Moonstone',
    line: 'Clean lines for everyday wear.',
    description: 'A bright silver-tone case with a graphite band. Sharp enough for the office, easy on the weekend.',
    priceCents: 6900,
    colorway: { case: ['#6f6c68', '#e4e1db', '#8d8a86'], band: '#2a2a2a', accent: '#F29A68', glow: '#F29A68' },
  },
  {
    id: 'smart-watch-classic',
    name: 'Smart Watch Classic',
    finish: 'Graphite',
    line: 'A quieter take on connected time.',
    description: 'A gunmetal-tone case with a deep brown band and champagne details for a more classic look.',
    priceCents: 7900,
    colorway: { case: ['#2c2e31', '#7b7e82', '#3b3d40'], band: '#2b1d15', accent: '#D8C7A6', glow: '#D8C7A6' },
  },
]

export const getProduct = (id: string) => products.find((p) => p.id === id)

export const money = (cents: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(cents / 100)
