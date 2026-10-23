# Affordable Smart Watches

Next.js 16 + Tailwind v4 + GSAP storefront. Deploys to Vercel as-is.

```bash
corepack pnpm install
corepack pnpm dev
```

Use pnpm (the project's lockfile). Add packages with `corepack pnpm add <pkg>` so Vercel's frozen install stays in sync.

## Product & media

| What | Where |
|------|-------|
| Product (VL16 Pro Smartwatch, **$125**), client-approved heading and copy, specs, SIM/health note | **Admin → Products** (MongoDB). `lib/products.ts` is the seed data and the offline fallback. Specs follow the manufacturer's VL16 Pro spec sheet (Shenzhen Vivistar / Alibaba listing), reworded. |
| Product photos | `public/media/vl16/photo-1..22.jpg` (from the manufacturer's VL16 Pro Alibaba listing). All show in the Watches page gallery. Replace with the client's own photos when they arrive: overwrite the files or edit `images` in `lib/products.ts`. |
| Sold out | **Admin → Products → Units in stock**. 0 = Buy buttons show **SOLD OUT** and `/api/checkout` refuses the order. Checkout reserves stock in the database, so a stale page can't oversell. |
| Product video | `public/media/vl16-pro.mp4` (VL16 Pro video from the manufacturer's Alibaba listing, re-encoded, no audio). Plays in the hero card and on the Watches page. |
| Promo banner | **Admin → Home banners** (seeded with `public/media/vl16-pro-banner.webp`, (client's VL16 Pro banner, from `public/media/banner.jpeg`). Shows below the hero, links to /watches. It has the price ($125) baked in, so replace it if the price changes. |
| Home hero copy | **Admin → Site copy** (fields listed in `lib/content.ts`). |
| Brand copy, contact details, story | `lib/site.ts` (`about`, `tagline`, `contact`), `app/story/page.tsx`. Client to supply final store/contact wording. |
| Policies | `app/legal/[slug]/page.tsx` (Privacy, Terms, Shipping, Returns). |
| Ship-to / geoblock | US only. `usStates` + `availability` in `lib/site.ts`; enforced in `lib/payments.ts` (Vercel IP country + US address, state and ZIP). |
| Price comparison | `comparison` in `lib/products.ts`. Re-check competitor prices before each campaign. |

## Pricing, shipping & tax checklist

| Item | Where | Status |
|------|-------|--------|
| Price | `priceCents` in `lib/products.ts` (12500 = $125.00). Also baked into the promo banner image. | Set |
| Price lock | `PRICING_CONFIRMED` — live checkout is refused while `false`. | `true` |
| Shipping | Create a Shipping Rate in Stripe, set `STRIPE_SHIPPING_RATE_ID`. Until then the order panel says "To be confirmed" and no shipping is charged. | Waiting for rate |
| Sales tax | Set up Stripe → Tax (origin address + registrations), then `STRIPE_AUTOMATIC_TAX=true`. Prices become tax-exclusive and the order panel shows "Sales tax: calculated at checkout". | Off until set up |
| Quantity limit | 1–10 per order (`parseOrder` in `lib/payments.ts`). | Set |

## Environment (`.env.example` → `.env.local` / Vercel env)

- `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_SHIPPING_RATE_ID` — see Stripe go-live below.
- `CONTACT_WEBHOOK_URL` — contact form, offer claims and paid-order alerts POST JSON here (Formspree, Zapier, Make, or own API).
- `NEXT_PUBLIC_OFFER_URL` — donation checkout link for the $35 TheUrbanSurvivor.org offer once confirmed.
- `NEXT_PUBLIC_SITE_URL` — canonical URL for SEO, sitemap, Open Graph and Stripe redirects.

## Stripe payments

Flow: Buy Now panel → `POST /api/checkout` (validates order, prices from `lib/products.ts`) → Stripe-hosted Checkout → `/checkout/success` or `/checkout/cancel`.
Stripe confirms payment to `POST /api/stripe/webhook`, which alerts the owner via `CONTACT_WEBHOOK_URL`. All Stripe code lives in `lib/payments.ts`.
Each checkout creates an order in MongoDB (stock reserved, payment "Awaiting payment"). Signed webhooks set the payment status; admins only move fulfilment. The Stripe Dashboard stays the payment record.

Safety: live keys are refused while `PRICING_CONFIRMED = false`, and the client never sends prices.

### Go-live checklist
1. **Test first** with `sk_test_...` keys and card `4242 4242 4242 4242`. Forward webhooks locally with `stripe listen --forward-to localhost:3000/api/stripe/webhook` (it prints a `whsec_` secret for `.env.local`).
2. Set final prices in `lib/products.ts` and `PRICING_CONFIRMED = true`.
3. Stripe Dashboard (live mode): activate the account, set the business name/support email shown on Checkout, enable **customer email receipts** (Settings → Customer emails).
4. Developers → Webhooks → **Add endpoint** `https://<domain>/api/stripe/webhook` with events `checkout.session.completed`, `checkout.session.async_payment_succeeded`, `checkout.session.async_payment_failed`, `checkout.session.expired` (returns reserved stock), `charge.refunded`. Copy its signing secret.
5. In Vercel → Environment Variables (Production): `STRIPE_SECRET_KEY=sk_live_...`, `STRIPE_WEBHOOK_SECRET=whsec_...` (the live endpoint's), `NEXT_PUBLIC_SITE_URL`, optional `STRIPE_SHIPPING_RATE_ID` (a **live** shipping rate). Redeploy.
6. Place one real low-value order, confirm the alert arrives and the payment shows in the Dashboard, then refund it.

## Motion

All scroll animation is driven by data attributes (`data-split`, `data-reveal`, `data-speed`, …) handled in `components/motion.tsx`. Reduced-motion users get static content.

## Admin dashboard

`/admin` (sign in at `/admin/login`). Every page and `/api/admin/*` route checks the session on the server.

| Section | What it does |
|---------|--------------|
| Overview | Revenue (30 days), orders to fulfil, open checkouts, new enquiries, stock, setup warnings |
| Orders | Search/filter, customer and shipping details, history. Fulfilment moves: unfulfilled → processing → shipped → delivered, or cancel before shipping (returns stock; refund in Stripe). Only Stripe-paid orders can be processed |
| Products | Add / edit / delete, price, stock (0 = sold out), images (upload, replace, reorder, remove), specifications and feature list, live preview. Lowest display order is the featured product |
| Home banners | Upload/replace, description, link, show/hide, reorder |
| Enquiries | Contact form messages, status (new / read / in progress / resolved), internal notes, delete |
| Payments | Stripe-verified status, amount, method (brand + last 4), references, link to Stripe |
| Site copy | Only these home-page fields: hero label, tagline + accent, feature chips, the 3 hero pillars, scrolling words |

Security: scrypt password hashes, random session token in an HttpOnly + SameSite=Strict cookie (Secure in production; only its HMAC is stored, 8-hour expiry, logout deletes it), Origin check on every write, login rate limit (10/IP, 5/account per 15 min), contact form rate limit (5/IP per 10 min) + honeypot, whitelisted and validated fields on every API.

### Setup (MongoDB Atlas)
1. Atlas → create a cluster → **Database Access**: add a user with read/write on one database → **Network Access**: allow `0.0.0.0/0` (Vercel has no fixed IPs) → **Connect → Drivers**: copy the `mongodb+srv://` string.
2. Set `MONGODB_URI`, `SESSION_SECRET`, `ADMIN_EMAIL`, `ADMIN_PASSWORD` in `.env.local` and in Vercel → Environment Variables. See `.env.example`.
3. `corepack pnpm seed` — creates indexes, the admin, the VL16 Pro, the promo banner and the current home copy. Safe to re-run (adds only what's missing; never resets passwords or deletes). `corepack pnpm seed -- --overwrite-products` re-syncs product copy/specs/images from `lib/products.ts`, keeping stock.
4. Add `checkout.session.expired` and `charge.refunded` to the Stripe webhook events. Redeploy.
5. Set the VL16 Pro's stock in Admin → Products when units arrive (it's seeded as 0 = sold out, as before).

Image uploads are stored in MongoDB (`stored_uploads`: folder, filename, type, size, binary) via `POST /api/upload` and served from `/api/uploads/<folder>/<file>` with a one-year immutable cache, so they survive redeploys on Vercel. Products and banners store only that URL. Replacing or removing an image deletes the stored file on save (unless another product or banner still uses it). Limit 8 MB per image, but Vercel caps request bodies at 4.5 MB, so keep uploads under ~4 MB there. Old `/uploads/...` disk paths show `/media/placeholder.svg`.

Without `MONGODB_URI` the storefront still renders from `lib/products.ts` (sold out), but checkout and the dashboard are off.

### Checks
- `corepack pnpm typecheck` and `corepack pnpm build`
- `node scripts/check-admin.mjs <url> <whsec>` — end-to-end check of auth, stock, banners, copy, enquiries, checkout and webhook flows. **Use a throwaway database only**; instructions at the top of the file.
