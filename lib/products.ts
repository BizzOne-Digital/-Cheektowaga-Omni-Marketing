// Catalog. Specs follow the Alibaba listing's key attributes (Vivistar "4G GPS elderly smart watch VL16P",
// alibaba.com/product-detail/4G-Smart-Watch-Phone-VL16-Alert_1600177032079.html); where the listing is silent
// (bands, size, weight, app, box) the manufacturer's VL16 Pro spec sheet fills in. Banner, name and price follow
// affordablesmartwatches.com.
// Photos: public/media/vl16/photo-1..22.jpg and video public/media/vl16-pro.mp4, from the manufacturer's Alibaba listing.
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
  soldOut?: boolean // true: Buy buttons show SOLD OUT and checkout refuses the order
}

// Prices are final; while false the UI flags pricing as provisional and live checkout is blocked.
export const PRICING_CONFIRMED = true

export const products: Product[] = [
  {
    id: 'vl16-pro',
    name: 'VL16 Pro Smartwatch',
    model: 'VL16 PRO',
    finish: 'Black',
    swatch: '#151515',
    heading: 'Peace of Mind on Your Wrist: The VL16 Pro Smartwatch',
    line: 'Peace of mind on your wrist.',
    description:
      'A 4G safety smartwatch with GPS location tracking, fall alerts, heart-rate and health monitoring, and a one-touch SOS that notifies family, helping seniors stay independent and caregivers stay reassured.',
    priceCents: 12500,
    soldOut: true,
    video: '/media/vl16-pro.mp4',
    images: [
      { src: '/media/vl16/photo-1.jpg', alt: 'Two VL16 Pro Smartwatches in black, one showing the clock and one the heart-rate screen' },
      { src: '/media/vl16/photo-2.jpg', alt: 'VL16 Pro Smartwatch in black with the heart key, clock screen showing time, steps and signal' },
      { src: '/media/vl16/photo-3.jpg', alt: 'VL16 Pro Smartwatch showing the SOS alert screen after a fall' },
      { src: '/media/vl16/photo-4.jpg', alt: 'VL16 Pro Smartwatch from the side, front and back' },
      { src: '/media/vl16/photo-5.jpg', alt: 'Back of the VL16 Pro Smartwatch showing the heart-rate, SpO2 and temperature sensors' },
      { src: '/media/vl16/photo-6.jpg', alt: 'VL16 Pro Smartwatch showing the temperature screen' },
      { src: '/media/vl16/photo-7.jpg', alt: 'Senior checking the VL16 Pro Smartwatch on their wrist' },
      { src: '/media/vl16/photo-8.jpg', alt: 'VL16 Pro Smartwatch in red and white, with sleep and clock screens' },
      { src: '/media/vl16/photo-9.jpg', alt: 'VL16 Pro Smartwatch showing heart rate, SpO2 and blood pressure' },
      { src: '/media/vl16/photo-10.jpg', alt: 'VL16 Pro Smartwatch with water splash, waterproof design' },
      { src: '/media/vl16/photo-11.jpg', alt: 'VL16 Pro Smartwatch SOS call screen: hold for 3 seconds to call an emergency contact' },
      { src: '/media/vl16/photo-12.jpg', alt: 'Senior checking health readings on the VL16 Pro Smartwatch' },
      { src: '/media/vl16/photo-13.jpg', alt: 'VL16 Pro Smartwatch location screen with emergency positioning on a map' },
      { src: '/media/vl16/photo-14.jpg', alt: 'VL16 Pro Smartwatch medication reminder: time to take medicine' },
      { src: '/media/vl16/photo-15.jpg', alt: 'VL16 Pro Smartwatch side view, heart-rate monitoring' },
      { src: '/media/vl16/photo-16.jpg', alt: 'VL16 Pro Smartwatch on its magnetic charging dock with USB-C socket' },
      { src: '/media/vl16/photo-17.jpg', alt: 'VL16 Pro Smartwatch health screen: heart rate, blood pressure, SpO2 and temperature' },
      { src: '/media/vl16/photo-18.jpg', alt: 'VL16 Pro Smartwatch with the family app: safe zones and location history' },
      { src: '/media/vl16/photo-19.jpg', alt: 'VL16 Pro Smartwatches in their gift boxes, with the SOS screen' },
      { src: '/media/vl16/photo-20.jpg', alt: 'VL16 Pro Smartwatch temperature screen, black and white models' },
      { src: '/media/vl16/photo-21.jpg', alt: 'VL16 Pro Smartwatch from the side, front and back with feature icons' },
      { src: '/media/vl16/photo-22.jpg', alt: 'VL16 Pro Smartwatch: 2G, 3G, 4G and Wi-Fi global roaming' },
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
    text: 'The VL16 Pro runs on its own 4G connection with a nano-SIM, so the wearer can get out and about without carrying a phone, and help is always one button away.',
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
    text: 'Press and hold the SOS key to call up to three emergency contacts. SOS, safe-zone and low-battery alarms go to the family app, and two-way calling lets them talk straight away.',
  },
  {
    title: 'Peace of mind for family and caregivers',
    text: 'Heart rate, blood pressure, SpO2, temperature and steps appear in the app, with medication reminders on the watch, so loved ones can see how the day is going.',
  },
]

// Short feature panels (home page rail).
export const features = [
  { stat: 'SOS', title: 'One-touch SOS', text: 'Press and hold the SOS key to call your emergency contacts.' },
  { stat: 'GPS', title: 'Location tracking', text: 'Live location, location history and safe-zone alerts in the app.' },
  { stat: 'Fall', title: 'Fall alerts', text: 'Detects a fall and raises an alarm automatically.' },
  { stat: 'Alert', title: 'Family notifications', text: 'SOS, safe-zone and low-battery alarms go straight to the app.' },
  { stat: 'Call', title: 'Two-way calling', text: 'Talk directly through the watch over its own 4G connection.' },
  { stat: 'HR', title: 'Health monitoring', text: 'Heart rate, blood pressure, SpO2 and temperature, plus steps.' },
  { stat: '4G', title: 'Works on its own', text: '4G, Wi-Fi and Bluetooth with its own SIM card. No phone needed nearby.' },
  { stat: 'GPS+', title: 'Accurate location', text: 'GPS, BeiDou, Wi-Fi and LBS positioning work together, indoors and out.' },
  { stat: 'IP67', title: 'Everyday tough', text: 'IP67 water and dust resistance for everyday splashes and rain.' },
  { stat: '4 days', title: 'Long battery life', text: '650 mAh battery: up to 4 days per charge.' },
]

export const specs: [label: string, value: string][] = [
  ['Model', 'VL16 Pro (VL16P)'],
  ['Network', '4G LTE B1, B3, B5, B7, B8, B9, B19, B20, B28, B40, B41 · 3G WCDMA B1, B8 · 2G GSM 850 / 900 / 1800 / 1900 MHz · Wi-Fi · Bluetooth'],
  ['SIM', 'Supports a SIM card (SIM and data plan not included)'],
  ['Location', 'GPS + BeiDou + Wi-Fi + LBS; safe-zone (geo-fence) alerts and 30-day location history in the app'],
  ['Safety', 'SOS button, fall alert, low-battery alert'],
  ['Calling', 'Two-way voice calls, call reminder; hold the SOS key to call up to three emergency contacts'],
  ['Health & fitness', 'Heart rate, blood pressure, SpO2 and body temperature; fitness and sleep tracking; mood tracker; medication reminder'],
  ['Other functions', 'Calendar, alarm clock, countdown, chronograph, message reminder and push messages, remote control from the app'],
  ['Sensors', 'Heart-rate / SpO2 optical sensor, temperature sensor, gyroscope'],
  ['Display', 'TFT touchscreen, 320 × 240, rectangular'],
  ['Processor', 'Unisoc SC8521E dual-core 1.3 GHz'],
  ['Operating system', 'Android'],
  ['Battery', '650 mAh · up to 4 days'],
  ['Charging', 'Magnetic charging dock with USB-C socket'],
  ['Water resistance', 'IP67, dustproof'],
  ['App', 'Web or mobile app, compatible with Android and iPhone. Alerts: SOS, safe zone, low battery. Data kept for 30 days'],
  ['Materials', 'Plastic case, silicone strap'],
  ['Camera', 'None'],
  ['Size & weight', '55 × 31 × 14.8 mm · 40 g'],
  ['Colour', 'Black'],
  ['In the box', 'VL16 Pro Smartwatch, user manual (English), screwdriver, SIM pin, gift box'],
]

// Full feature list from the Alibaba listing's key attributes (Watches page).
export const featureTable: [feature: string, detail: string][] = [
  ['SOS alarm', 'Supported'],
  ['Geo-fence alert', 'Automatic alarm when the wearer leaves the set safe zone'],
  ['Positioning', 'GPS, BeiDou, Wi-Fi and LBS'],
  ['Waterproof', 'IP67, dustproof'],
  ['Two-way call', 'Supported'],
  ['Health monitoring', 'Heart rate, blood pressure, SpO2 and temperature'],
  ['Medication reminder', 'Supported'],
  ['Fall alarm', 'Supported'],
  ['Historical track', 'View location history from the past 30 days'],
  ['Pedometer & fitness tracker', 'Supported'],
  ['Sleep tracker', 'Supported'],
  ['Battery', '650 mAh, up to 4 days'],
  ['Gyroscope', 'Supported'],
  ['Dimensions', '55 × 31 × 14.8 mm'],
  ['Weight', '40 g'],
  ['Screen', 'TFT touchscreen, 320 × 240 resolution'],
  ['Compatible with Apple & Android', 'Supported'],
]

export const healthNote =
  'SOS, calling and location need an active nano-SIM with a 4G data plan (not included). Health readings are for general wellness reference only; the VL16 Pro Smartwatch is not a medical device.'
