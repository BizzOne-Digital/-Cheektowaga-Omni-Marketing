// Catalog. Specs follow the Toptraking L16PRO 4G listing (toptraking.com/product/l16pro-4g-senior-care-tracking-watch),
// reworded. Where that listing contradicts itself (location history 90 vs 30 days) no number is stated.
// TEMPORARY PHOTOS: public/media/l16/photo-1..7.jpg are stand-ins until the client's own product photos arrive.
// Swap the files (or the src values below) — every page reads images from here.
export type Product = {
  id: string
  name: string
  model: string
  finish: string
  swatch: string
  heading: string
  line: string
  description: string
  priceCents: number
  images: { src: string; alt: string }[] // first image is the main one
  video?: string
}

// Prices are final; while false the UI flags pricing as provisional and live checkout is blocked.
export const PRICING_CONFIRMED = true

export const products: Product[] = [
  {
    id: 'l16-pro',
    name: 'L16 Pro Smartwatch',
    model: 'L16 PRO',
    finish: 'Black',
    swatch: '#151515',
    heading: 'Peace of Mind on Your Wrist: The L16 Pro Smartwatch',
    line: 'Peace of mind on your wrist.',
    description:
      'A 4G safety smartwatch with GPS location tracking, fall alerts and a one-touch SOS button that notifies family, helping seniors stay independent and caregivers stay reassured.',
    priceCents: 9900,
    video: '/media/l16-pro.mp4',
    images: [
      { src: '/media/l16/photo-1.jpg', alt: 'L16 Pro Smartwatch in black with the orange SOS button, front three-quarter view' },
      { src: '/media/l16/photo-3.jpg', alt: 'L16 Pro Smartwatch face showing time, steps and signal' },
      { src: '/media/l16/photo-4.jpg', alt: 'L16 Pro Smartwatch showing the SOS alert screen' },
      { src: '/media/l16/photo-5.jpg', alt: 'L16 Pro Smartwatch measuring heart rate, strap open' },
      { src: '/media/l16/photo-6.jpg', alt: 'L16 Pro Smartwatch heart-rate screen, side view' },
      { src: '/media/l16/photo-7.jpg', alt: 'L16 Pro Smartwatch with strap open, clock screen' },
      { src: '/media/l16/photo-2.jpg', alt: 'Back of the L16 Pro Smartwatch showing the health sensors and magnetic charging pins' },
    ],
  },
]

export const getProduct = (id: string) => products.find((p) => p.id === id)

// Whole-dollar amounts show without decimals ($99), others with cents ($99.50).
export const money = (cents: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: cents % 100 ? 2 : 0 }).format(cents / 100)

// Client-approved product story (senior safety focus). Facts from the listing only.
export const highlights = [
  {
    title: 'Independence, with a safety net',
    text: 'The L16 Pro runs on its own 4G connection with a nano-SIM, so the wearer can get out and about without carrying a phone, and help is always one button away.',
  },
  {
    title: 'GPS location tracking',
    text: 'Family and caregivers can see where the watch is in the companion app, look back at its location history, and set safe zones that send an alert if the wearer leaves them.',
  },
  {
    title: 'Fall alert system',
    text: 'A built-in motion sensor recognises a fall and raises an alarm, without the wearer needing to press anything.',
  },
  {
    title: 'Emergency contact notifications',
    text: 'One press of the orange SOS key raises an emergency alert. SOS, safe-zone and low-battery alarms go to the family app, and two-way calling lets them talk straight away.',
  },
  {
    title: 'Peace of mind for family and caregivers',
    text: 'Heart rate, blood pressure, SpO2, temperature and steps appear in the app, with medication reminders on the watch, so loved ones can see how the day is going.',
  },
]

// Short feature panels (home page rail).
export const features = [
  { stat: 'SOS', title: 'One-touch SOS', text: 'Press the orange key to send an emergency alert to family.' },
  { stat: 'GPS', title: 'Location tracking', text: 'Live location, location history and safe-zone alerts in the app.' },
  { stat: 'Fall', title: 'Fall alerts', text: 'Detects a fall and raises an alarm automatically.' },
  { stat: 'Alert', title: 'Family notifications', text: 'SOS, safe-zone and low-battery alarms go straight to the app.' },
  { stat: 'Call', title: 'Two-way calling', text: 'Talk directly through the watch over its own 4G connection.' },
  { stat: 'HR', title: 'Health monitoring', text: 'Heart rate, blood pressure, SpO2 and temperature, plus steps.' },
  { stat: '4G', title: 'Works on its own', text: '2G, 3G, 4G and Wi-Fi with a nano-SIM. No phone needed nearby.' },
  { stat: 'IP66', title: 'Everyday tough', text: 'IP66 water resistance and a 680 mAh battery: 4–5 days normal use.' },
]

export const specs: [label: string, value: string][] = [
  ['Model', 'L16 PRO'],
  ['Network', '2G GSM 850 / 900 / 1800 / 1900 MHz · 3G WCDMA B1, B8 · 4G LTE B1, B3, B5, B7, B8, B9, B19, B20, B28, B40, B41 · Wi-Fi'],
  ['SIM', 'Nano-SIM, e-SIM compatible (SIM and data plan not included)'],
  ['Location', 'GPS, safe-zone (geo-fence) alerts, location history; Bluetooth 5.0 for indoor location'],
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

// Full feature list from the Toptraking L16PRO listing (Watches page).
export const featureTable: [feature: string, detail: string][] = [
  ['SOS alarm', 'Supported'],
  ['Geo-fence alert', 'Automatic alarm when the wearer leaves the set safe zone'],
  ['GPS positioning', 'Supported'],
  ['Waterproof', 'IP66'],
  ['Two-way call', 'Supported'],
  ['Health monitoring', 'Heart rate, blood pressure, SpO2 and temperature'],
  ['Medication reminder', 'Supported'],
  ['Fall alarm', 'Supported'],
  ['Historical track', 'View location history from the past 90 days'],
  ['Pedometer', 'Supported'],
  ['Battery', '680 mAh'],
  ['Gravity sensor', 'Supported'],
  ['Dimensions', '55 × 31 × 14.8 mm'],
  ['Weight', '40 g'],
  ['Screen', '1.0″ TFT, 128 × 64 resolution'],
  ['Compatible with Apple & Android', 'Supported'],
]

export const healthNote =
  'SOS, calling and location need an active nano-SIM with a 4G data plan (not included). Health readings are for general wellness reference only; the L16 Pro Smartwatch is not a medical device.'
