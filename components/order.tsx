'use client'

import { createContext, useContext, useEffect, useRef, useState } from 'react'
import { getProduct, money, PRICING_CONFIRMED, products, type Product } from '@/lib/products'
import { offer, shipCountries, site } from '@/lib/site'
import { WatchRender } from './watch-render'
import { Field } from './field'

type Mode = { kind: 'buy'; productId: string } | { kind: 'offer' }
type Status = { state: 'idle' | 'sending' | 'sent' | 'offline' | 'error'; message?: string }

const OrderCtx = createContext<(m: Mode) => void>(() => {})
export const useOrder = () => useContext(OrderCtx)

// shippingAtCheckout: a Stripe shipping rate is configured server-side and is added on Stripe's page.
export function OrderProvider({ children, shippingAtCheckout = false }: { children: React.ReactNode; shippingAtCheckout?: boolean }) {
  const dialog = useRef<HTMLDialogElement>(null)
  const [mode, setMode] = useState<Mode | null>(null)

  const open = (m: Mode) => {
    setMode(m)
    dialog.current?.showModal()
  }

  // Keep aria-invalid in sync with the CSS :user-invalid state for assistive tech.
  useEffect(() => {
    const sync = (e: Event) => {
      const el = e.target as HTMLElement
      if (el.matches?.('input, textarea, select')) el.setAttribute('aria-invalid', String(el.matches(':user-invalid')))
    }
    document.addEventListener('blur', sync, true)
    document.addEventListener('input', sync)
    return () => {
      document.removeEventListener('blur', sync, true)
      document.removeEventListener('input', sync)
    }
  }, [])

  return (
    <OrderCtx.Provider value={open}>
      {children}
      <dialog
        ref={dialog}
        className="sheet"
        aria-labelledby="order-title"
        onClick={(e) => e.target === dialog.current && dialog.current.close()}
        onClose={() => setTimeout(() => setMode(null), 700)}
      >
        {mode && <OrderPanel key={mode.kind === 'buy' ? mode.productId : 'offer'} mode={mode} shippingAtCheckout={shippingAtCheckout} close={() => dialog.current?.close()} />}
      </dialog>
    </OrderCtx.Provider>
  )
}

export function BuyButton({ productId, className = 'btn', children = 'Buy Now' }: { productId: string; className?: string; children?: React.ReactNode }) {
  const open = useOrder()
  return (
    <button type="button" className={className} onClick={() => open({ kind: 'buy', productId })} data-magnetic>
      {children} <span className="btn-arrow" aria-hidden="true">→</span>
    </button>
  )
}

export function ClaimButton({ className = 'btn', children = 'Claim Offer' }: { className?: string; children?: React.ReactNode }) {
  const open = useOrder()
  return (
    <button type="button" className={className} onClick={() => open({ kind: 'offer' })} data-magnetic>
      {children} <span className="btn-arrow" aria-hidden="true">→</span>
    </button>
  )
}

export function ProductVisual({ product, className = '' }: { product: Product; className?: string }) {
  const label = `${product.name} in ${product.finish} — placeholder image`
  return product.image ? (
    <img src={product.image} alt={label} className={`object-cover ${className}`} loading="lazy" />
  ) : (
    <WatchRender colorway={product.colorway} label={label} className={className} />
  )
}

function OrderPanel({ mode, close, shippingAtCheckout }: { mode: Mode; close: () => void; shippingAtCheckout: boolean }) {
  const isOffer = mode.kind === 'offer'
  const product = isOffer ? products[0] : getProduct(mode.productId)!
  const [qty, setQty] = useState(1)
  const [status, setStatus] = useState<Status>({ state: 'idle' })
  const [lastOrder, setLastOrder] = useState<Record<string, string>>({})
  const subtotal = product.priceCents * qty

  // Coming back from Stripe with the browser's Back button restores this page from cache; re-enable the form.
  useEffect(() => {
    const onShow = (e: PageTransitionEvent) => e.persisted && setStatus({ state: 'idle' })
    addEventListener('pageshow', onShow)
    return () => removeEventListener('pageshow', onShow)
  }, [])

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const data = Object.fromEntries(new FormData(e.currentTarget)) as Record<string, string>
    setLastOrder(data)
    setStatus({ state: 'sending' })

    if (isOffer && offer.claimUrl) {
      window.location.href = offer.claimUrl
      return
    }

    const res = isOffer
      ? await post('/api/contact', {
          type: 'Special offer claim',
          name: data.name,
          email: data.email,
          phone: data.phone,
          message: `Offer claim: $${offer.donation} donation to ${offer.charity} + shipping & handling for ${product.name}.\nShip to: ${data.address}, ${data.city} ${data.postal}, ${data.country}`,
        })
      : await post('/api/checkout', { productId: product.id, quantity: qty, customer: data })

    if (res.error === 'not_configured') return setStatus({ state: 'offline' })
    if (res.error) return setStatus({ state: 'error', message: res.error })
    if (res.url) {
      window.location.href = res.url
      return
    }
    setStatus({ state: 'sent' })
  }

  const mailto = () => {
    const d = lastOrder
    const subject = isOffer ? 'Special offer claim' : `Order: ${product.name} x${qty}`
    const body = `${subject}\n\nName: ${d.name}\nEmail: ${d.email}\nPhone: ${d.phone}\nShip to: ${d.address}, ${d.city} ${d.postal}, ${d.country}`
    return `mailto:${site.contact.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
  }

  return (
    <div className="flex min-h-full flex-col">
      <div className="sticky top-0 z-10 flex items-center justify-between border-b border-line bg-ink-2/90 px-6 py-4 backdrop-blur-md sm:px-10">
        <p className="eyebrow">{isOffer ? 'Special offer' : 'Your order'}</p>
        <button type="button" onClick={close} className="group flex min-h-11 items-center gap-3 text-[0.6875rem] font-semibold uppercase tracking-[0.2em] text-ash hover:text-bone">
          Close
          <span className="relative block size-4" aria-hidden="true">
            <span className="absolute top-1/2 h-px w-4 rotate-45 bg-current transition-transform duration-500 group-hover:rotate-[135deg]" />
            <span className="absolute top-1/2 h-px w-4 -rotate-45 bg-current transition-transform duration-500 group-hover:rotate-45" />
          </span>
        </button>
      </div>

      <div className="grid grid-cols-[7rem_1fr] items-center gap-6 border-b border-line px-6 py-8 sm:grid-cols-[9rem_1fr] sm:px-10">
        <div className="product-stage aspect-[3/4] overflow-hidden">
          <ProductVisual product={product} className="render size-full" />
        </div>
        <div>
          <h2 id="order-title" className="display text-4xl sm:text-5xl">
            {isOffer ? (
              <>
                Give ${offer.donation}.<br />
                <span className="italic text-ember">Get the watch.</span>
              </>
            ) : (
              product.name
            )}
          </h2>
          <p className="mt-3 text-sm text-ash">
            {isOffer ? `${product.name} · ${product.finish}` : `${product.finish} · ${product.line}`}
          </p>
          {!isOffer && (
            <p className="mt-4 flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <span className="text-2xl font-semibold tabular-nums">{money(product.priceCents)}</span>
              <span className="text-xs text-ash">USD each</span>
              {!PRICING_CONFIRMED && <span className="border border-champagne/40 px-2 py-0.5 text-[0.625rem] font-semibold uppercase tracking-[0.18em] text-champagne">Provisional price</span>}
            </p>
          )}
        </div>
      </div>

      {status.state === 'sent' ? (
        <Notice title="Claim sent." body={`Thank you, ${lastOrder.name}. We'll reply to ${lastOrder.email} with the donation and shipping steps.`} close={close} />
      ) : status.state === 'offline' ? (
        <Notice
          title={isOffer ? 'Offer claims aren’t connected online yet.' : 'Online payment isn’t connected yet.'}
          body={`Nothing has been charged and no order was placed. Send your ${isOffer ? 'claim' : 'order'} to ${site.contact.name} directly and it will be confirmed personally.`}
          close={close}
        >
          <a href={mailto()} className="btn">Email this {isOffer ? 'claim' : 'order'} <span className="btn-arrow" aria-hidden="true">→</span></a>
          <a href={`tel:${site.contact.tel}`} className="btn btn-ghost">Call {site.contact.phone}</a>
        </Notice>
      ) : (
        <form onSubmit={submit} className="grid flex-1 gap-10 px-6 py-8 sm:px-10">
          {isOffer ? (
            <ol className="grid gap-4 border-l border-ember pl-5 text-sm text-ash">
              <li><span className="text-bone">01 —</span> Donate ${offer.donation} USD to {offer.charity}.</li>
              <li><span className="text-bone">02 —</span> Cover the applicable shipping and handling.</li>
              <li><span className="text-bone">03 —</span> Receive the featured smart watch at no additional product cost.</li>
            </ol>
          ) : (
            <fieldset className="flex items-center justify-between gap-6">
              <legend className="sr-only">Quantity</legend>
              <span className="text-[0.6875rem] font-semibold uppercase tracking-[0.2em] text-ash" aria-hidden="true">Quantity</span>
              <div className="flex items-center border border-line-strong">
                <button type="button" className="grid size-12 place-items-center text-lg transition-colors hover:bg-ink-4 disabled:opacity-30" onClick={() => setQty((q) => Math.max(1, q - 1))} disabled={qty <= 1} aria-label="Decrease quantity">−</button>
                <output className="w-12 text-center font-semibold tabular-nums" aria-live="polite" aria-label="Quantity">{qty}</output>
                <button type="button" className="grid size-12 place-items-center text-lg transition-colors hover:bg-ink-4 disabled:opacity-30" onClick={() => setQty((q) => Math.min(10, q + 1))} disabled={qty >= 10} aria-label="Increase quantity">+</button>
              </div>
            </fieldset>
          )}

          <fieldset className="grid gap-6">
            <legend className="mb-6 text-[0.6875rem] font-semibold uppercase tracking-[0.2em] text-bone">Your details</legend>
            <Field id="f-name" name="name" label="Full name" autoComplete="name" />
            <div className="grid gap-6 sm:grid-cols-2">
              <Field id="f-email" name="email" label="Email" type="email" autoComplete="email" error="Enter a valid email address." />
              <Field id="f-phone" name="phone" label="Phone" type="tel" autoComplete="tel" />
            </div>
          </fieldset>

          <fieldset className="grid gap-6">
            <legend className="mb-6 text-[0.6875rem] font-semibold uppercase tracking-[0.2em] text-bone">Shipping</legend>
            <Field id="f-address" name="address" label="Street address" autoComplete="street-address" />
            <div className="grid gap-6 sm:grid-cols-3">
              <Field id="f-city" name="city" label="City" autoComplete="address-level2" />
              <Field id="f-postal" name="postal" label="Postal / ZIP" autoComplete="postal-code" />
              <div className="field">
                <label htmlFor="f-country">Country <span className="text-ember" aria-hidden="true">*</span></label>
                <select id="f-country" name="country" required autoComplete="country" defaultValue={shipCountries[0][0]}>
                  {shipCountries.map(([code, label]) => <option key={code} value={code}>{label}</option>)}
                </select>
              </div>
            </div>
          </fieldset>

          {!isOffer && (
            <div className="grid gap-4">
              <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.2em] text-bone">Payment</p>
              <div className="flex items-center justify-between gap-4 border border-ember/60 bg-ember/5 px-5 py-4">
                <span className="flex items-center gap-3 text-sm">
                  <span className="grid size-4 place-items-center rounded-full border border-ember"><span className="size-2 rounded-full bg-ember" /></span>
                  Card &amp; wallet payment
                </span>
                <span className="text-xs text-ash">Secured by Stripe</span>
              </div>
              <p className="text-xs leading-relaxed text-ash">You&rsquo;ll be taken to Stripe&rsquo;s secure checkout to pay. Card details never touch this site.</p>
            </div>
          )}

          <div className="mt-auto grid gap-5 border-t border-line pt-8">
            {isOffer ? (
              <dl className="grid gap-3 text-sm">
                <Row term={`Donation to ${offer.charity}`} value={`$${offer.donation}.00 USD`} />
                <Row term="Shipping & handling" value="Applicable rate" />
                <Row term="Smart watch" value="No additional product cost" strong />
              </dl>
            ) : (
              <dl className="grid gap-3 text-sm">
                <Row term={`${product.name} × ${qty}`} value={money(subtotal)} />
                <Row term="Shipping & handling" value={shippingAtCheckout ? 'Added at secure checkout' : 'To be confirmed'} />
                <Row term={shippingAtCheckout ? 'Subtotal' : 'Order total'} value={shippingAtCheckout ? money(subtotal) : `${money(subtotal)} + shipping`} strong />
              </dl>
            )}

            {status.state === 'error' && (
              <p role="alert" className="border-l-2 border-[#ff7a4d] pl-4 text-sm text-[#ffb190]">{status.message}</p>
            )}

            <button type="submit" className="btn w-full" disabled={status.state === 'sending'}>
              {status.state === 'sending' ? 'Please wait…' : isOffer ? 'Claim Offer' : `Continue to payment · ${money(subtotal)}`}
              <span className="btn-arrow" aria-hidden="true">→</span>
            </button>
            <p className="text-center text-xs text-ash">
              Questions? <a className="ulink text-bone" href={`mailto:${site.contact.email}`}>{site.contact.email}</a>
            </p>
          </div>
        </form>
      )}
    </div>
  )
}


function Row({ term, value, strong }: { term: string; value: string; strong?: boolean }) {
  return (
    <div className={`flex items-baseline justify-between gap-6 ${strong ? 'border-t border-line pt-3 text-base font-semibold' : 'text-ash'}`}>
      <dt>{term}</dt>
      <dd className="text-right tabular-nums text-bone">{value}</dd>
    </div>
  )
}

function Notice({ title, body, close, children }: { title: string; body: string; close: () => void; children?: React.ReactNode }) {
  return (
    <div className="grid flex-1 content-start gap-6 px-6 py-10 sm:px-10" role="status">
      <p className="display text-4xl">{title}</p>
      <p className="max-w-md text-ash">{body}</p>
      <div className="flex flex-wrap gap-3">
        {children}
        <button type="button" onClick={close} className="btn btn-ghost">Back to the store</button>
      </div>
    </div>
  )
}

async function post(url: string, body: unknown): Promise<{ error?: string; url?: string }> {
  try {
    const res = await fetch(url, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) })
    return await res.json()
  } catch {
    return { error: 'Connection problem. Please check your network and try again.' }
  }
}
