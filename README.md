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
| Product (L16 Pro Smartwatch, **$99**), client-approved heading and copy, specs, SIM/health note | `lib/products.ts`. Specs follow the Toptraking L16PRO 4G listing, reworded. Add objects to `products` to sell more models. |
| Product photos — **TEMPORARY** | `public/media/l16/photo-1..7.jpg` (Toptraking gallery, white background). Replace with the client's own photos when they arrive: overwrite the files or edit `images` in `lib/products.ts`. |
| Product video | `public/media/l16-pro.mp4` (client's L16 Pro video from affordablesmartwatches.com, re-encoded, no audio). Plays in the hero card and on the Watches page. |
| Promo banner | `public/media/l16-pro-banner.webp` (client's banner). Shows below the hero, links to /watches. It has the price ($99) baked in, so replace it if the price changes. |
| Brand copy, contact details, story | `lib/site.ts` (`about`, `tagline`, `pillars`, `contact`), `app/story/page.tsx`. Client to supply final store/contact wording. |
| Policies | `app/legal/[slug]/page.tsx` (Privacy, Terms, Shipping, Returns). |
| Ship-to countries | `shipCountries` in `lib/site.ts` (currently US, Canada). |

## Pricing, shipping & tax checklist

| Item | Where | Status |
|------|-------|--------|
| Price | `priceCents` in `lib/products.ts` (9900 = $99.00). Also baked into the promo banner image. | Set |
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
There is no database: the Stripe Dashboard (Payments) is the order record, with customer, shipping address and product on each payment.

Safety: live keys are refused while `PRICING_CONFIRMED = false`, and the client never sends prices.

### Go-live checklist
1. **Test first** with `sk_test_...` keys and card `4242 4242 4242 4242`. Forward webhooks locally with `stripe listen --forward-to localhost:3000/api/stripe/webhook` (it prints a `whsec_` secret for `.env.local`).
2. Set final prices in `lib/products.ts` and `PRICING_CONFIRMED = true`.
3. Stripe Dashboard (live mode): activate the account, set the business name/support email shown on Checkout, enable **customer email receipts** (Settings → Customer emails).
4. Developers → Webhooks → **Add endpoint** `https://<domain>/api/stripe/webhook` with events `checkout.session.completed`, `checkout.session.async_payment_succeeded`, `checkout.session.async_payment_failed`. Copy its signing secret.
5. In Vercel → Environment Variables (Production): `STRIPE_SECRET_KEY=sk_live_...`, `STRIPE_WEBHOOK_SECRET=whsec_...` (the live endpoint's), `NEXT_PUBLIC_SITE_URL`, optional `STRIPE_SHIPPING_RATE_ID` (a **live** shipping rate). Redeploy.
6. Place one real low-value order, confirm the alert arrives and the payment shows in the Dashboard, then refund it.

## Motion

All scroll animation is driven by data attributes (`data-split`, `data-reveal`, `data-speed`, …) handled in `components/motion.tsx`. Reduced-motion users get static content.
