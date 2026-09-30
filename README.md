# Affordable Smart Watches

Next.js 16 + Tailwind v4 + GSAP storefront. Deploys to Vercel as-is.

```bash
npm install
npm run dev
```

## Before launch — replace placeholders

| What | Where |
|------|-------|
| Hero video | Drop the file at `public/media/hero-video.mp4` (path set in `lib/site.ts` → `heroVideo`). Until then the poster shows. |
| Product names, prices, photos | `lib/products.ts`. Add `image: '/path.jpg'` per product to replace the SVG render. Set `PRICING_CONFIRMED = true` once prices are final (removes "provisional" labels and adds price to Product schema). |
| Policies | `app/legal/[slug]/page.tsx` (Privacy, Terms, Shipping, Returns). |
| Shipping cost | Shown as "To be confirmed" in `components/order.tsx` until a rate is agreed. |

## Environment (`.env.example` → `.env.local` / Vercel env)

- `STRIPE_SECRET_KEY` — enables real checkout (Stripe Checkout redirect). Without it, orders show a clear "payment not connected" state with email/phone fallback. Payment code lives only in `lib/payments.ts`; swap that file to change processor.
- `CONTACT_WEBHOOK_URL` — contact form and offer claims POST JSON here (Formspree, Zapier, Make, or own API).
- `NEXT_PUBLIC_OFFER_URL` — donation checkout link for the $35 TheUrbanSurvivor.org offer once confirmed.
- `NEXT_PUBLIC_SITE_URL` — canonical URL for SEO, sitemap and Open Graph.

## Motion

All scroll animation is driven by data attributes (`data-split`, `data-reveal`, `data-speed`, …) handled in `components/motion.tsx`. Reduced-motion users get static content.
