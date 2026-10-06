// Catalog. Specs follow the Toptraking L16PRO 4G listing (toptraking.com/product/l16pro-4g-senior-care-tracking-watch).
// Where that listing contradicts itself (location history 90 vs 30 days) no number is stated.
// Photos: public/media/l16/photo-1..7.jpg (white background, shown on white panels).
export type Product = {
  id: string
  name: string
  model: string
  finish: string
  swatch: string
  line: string
  description: string
  priceCents: number
  images: { src: string; alt: string }[] // first image is the main one
}

// Prices are final; while false the UI flags pricing as provisional and live checkout is blocked.
export const PRICING_CONFIRMED = true

export const products: Product[] = [
  {
    id: 'l16-pro',
    name: 'L16 Pro 4G',
    model: 'L16 PRO',
    finish: 'Black',
    swatch: '#151515',
    line: 'Safety and health on one wrist.',
    description:
      'A 4G GPS watch with a one-touch SOS button, fall alarm, two-way calling and heart-rate, blood-pressure, SpO2 and temperature monitoring.',
    priceCents: 4900,
    images: [
      { src: '/media/l16/photo-1.jpg', alt: 'L16 Pro 4G watch in black with the orange SOS button, front three-quarter view' },
      { src: '/media/l16/photo-3.jpg', alt: 'L16 Pro 4G watch face showing time, steps and signal' },
      { src: '/media/l16/photo-4.jpg', alt: 'L16 Pro 4G watch showing the SOS alert screen' },
      { src: '/media/l16/photo-5.jpg', alt: 'L16 Pro 4G measuring heart rate, strap open' },
      { src: '/media/l16/photo-6.jpg', alt: 'L16 Pro 4G heart-rate screen, side view' },
      { src: '/media/l16/photo-7.jpg', alt: 'L16 Pro 4G with strap open, clock screen' },
      { src: '/media/l16/photo-2.jpg', alt: 'Back of the L16 Pro 4G showing the health sensors and magnetic charging pins' },
    ],
  },
]

export const getProduct = (id: string) => products.find((p) => p.id === id)

export const money = (cents: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(cents / 100)

// Headline features (home page rail). Facts from the listing only.
export const features = [
  { stat: '4G', title: 'Global connection', text: '2G, 3G, 4G and Wi-Fi. Takes a nano-SIM and is e-SIM compatible.' },
  { stat: 'SOS', title: 'One-touch SOS', text: 'Press the SOS key to raise an alarm. Low-battery alerts too.' },
  { stat: 'GPS', title: 'Location & geo-fence', text: 'GPS positioning, location history, and an alert when the wearer leaves a set area.' },
  { stat: 'Fall', title: 'Fall alarm', text: 'Built-in gravity sensor raises an alarm when a fall is detected.' },
  { stat: 'Call', title: 'Two-way calling', text: 'Talk directly through the watch over its own 4G connection.' },
  { stat: 'HR', title: 'Health monitoring', text: 'Heart rate, blood pressure, SpO2 and temperature, plus steps.' },
  { stat: 'IP66', title: 'Water resistant', text: 'Rated IP66 against dust and water jets for everyday wear.' },
  { stat: '4–5', title: 'Days per charge', text: '680 mAh battery: 4–5 days normal use, up to 6–7 days on 4G standby.' },
]

export const specs: [label: string, value: string][] = [
  ['Model', 'L16 PRO'],
  ['Network', '2G GSM 850 / 900 / 1800 / 1900 MHz · 3G WCDMA B1, B8 · 4G LTE B1, B3, B5, B7, B8, B9, B19, B20, B28, B40, B41 · Wi-Fi'],
  ['SIM', 'Nano-SIM, e-SIM compatible (SIM and data plan not included)'],
  ['Location', 'GPS, geo-fence alerts, location history; Bluetooth 5.0 for indoor location'],
  ['Safety', 'SOS alarm, fall alarm, low-battery alert'],
  ['Calling', 'Two-way voice calls'],
  ['Health', 'Heart rate, blood pressure, SpO2 and temperature monitoring; pedometer; medication reminder'],
  ['Sensors', 'PPG heart-rate and SpO2 sensor, temperature sensor, 3D accelerometer'],
  ['Display', '1.0″ TFT, 128 × 64'],
  ['Processor', 'Unisoc W307 (Cortex-A53, 1 GHz) + GR5515 sensor hub, 128 MB RAM, RTOS'],
  ['Battery', '680 mAh lithium polymer · 3–4 days very frequent use · 4–5 days normal use · 6–7 days 4G standby'],
  ['Charging', 'Magnetic 2-pin'],
  ['Water resistance', 'IP66'],
  ['App', 'Web or mobile app, compatible with Android and iPhone'],
  ['Materials', 'PC + ABS case, silicone 18 mm sport strap'],
  ['Size & weight', '55 × 31 × 14.8 mm · 40 g'],
  ['Colour', 'Black'],
]

export const healthNote =
  'SOS, calling and location need an active nano-SIM with a 4G data plan (not included). Health readings are for general wellness reference only; the L16 Pro 4G is not a medical device.'
