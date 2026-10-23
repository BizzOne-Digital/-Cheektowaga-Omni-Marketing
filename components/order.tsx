'use client'

import { createContext, useContext, useEffect, useRef, useState } from 'react'
import { money, PRICING_CONFIRMED, type Product } from '@/lib/products'
import { availability, site, usStates } from '@/lib/site'
import { Field } from './field'

// What the order panel needs. Pages pass it from the live catalog; checkout re-checks price and stock on the server.
type OrderItem = Pick<Product, 'id' | 'name' | 'finish' | 'line' | 'priceCents'> & { image: Product['images'][number] }
type Mode = { product: OrderItem }
type Status = { state: 'idle' | 'sending' | 'offline' | 'error'; message?: string }

const OrderCtx = createContext<(m: Mode) => void>(() => {})
export const useOrder = () => useContext(OrderCtx)

// shippingAtCheckout / taxAtCheckout: configured server-side (lib/payments.ts) and added on Stripe's page.
export function OrderProvider({ children, shippingAtCheckout = false, taxAtCheckout = false }: { children: React.ReactNode; shippingAtCheckout?: boolean; taxAtCheckout?: boolean }) {
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
        {mode && <OrderPanel key={mode.product.id} mode={mode} shippingAtCheckout={shippingAtCheckout} taxAtCheckout={taxAtCheckout} close={() => dialog.current?.close()} />}
      </dialog>
    </OrderCtx.Provider>
  )
}

export function BuyButton({ product, className = 'btn', children = 'Buy Now' }: { product: Product; className?: string; children?: React.ReactNode }) {
  const open = useOrder()
  if (product.soldOut)
    return (
      <button type="button" className={`${className} cursor-not-allowed opacity-60`} disabled aria-disabled="true">
        Sold Out
      </button>
    )
  return (
    <button type="button" className={className} onClick={() => open({ product: { id: product.id, name: product.name, finish: product.finish, line: product.line, priceCents: product.priceCents, image: product.images[0] } })} data-magnetic>
      {children} <span className="btn-arrow" aria-hidden="true">→</span>
    </button>
  )
}

// Product photos have white backgrounds; place them on a white (.product-stage.light) panel.
export function ProductVisual({ product, className = '' }: { product: Pick<Product, 'images'> | OrderItem; className?: string }) {
  const img = 'image' in product ? product.image : product.images[0]
  return <img src={img.src} alt={img.alt} className={`object-contain ${className}`} loading="lazy" />
}

function OrderPanel({ mode, close, shippingAtCheckout, taxAtCheckout }: { mode: Mode; close: () => void; shippingAtCheckout: boolean; taxAtCheckout: boolean }) {
  const { product } = mode
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

    const res = await post('/api/checkout', { productId: product.id, quantity: qty, customer: data })

    if (res.error === 'not_configured') return setStatus({ state: 'offline' })
    if (res.error) return setStatus({ state: 'error', message: res.error })
    if (res.url) {
      window.location.href = res.url
      return
    }
  }

  const mailto = () => {
    const d = lastOrder
    const subject = `Order: ${product.name} x${qty}`
    const body = `${subject}\n\nName: ${d.name}\nEmail: ${d.email}\nPhone: ${d.phone}\nShip to: ${d.address}, ${d.city}, ${d.state} ${d.postal}, ${d.country}`
    return `mailto:${site.contact.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
  }

  return (
    <div className="flex min-h-full flex-col">
      <div className="sticky top-0 z-10 flex items-center justify-between border-b border-line bg-ink-2/90 px-6 py-4 backdrop-blur-md sm:px-10">
        <p className="eyebrow">Your order</p>
        <button type="button" onClick={close} className="group flex min-h-11 items-center gap-3 text-[0.6875rem] font-semibold uppercase tracking-[0.2em] text-ash hover:text-bone">
          Close
          <span className="relative block size-4" aria-hidden="true">
            <span className="absolute top-1/2 h-px w-4 rotate-45 bg-current transition-transform duration-500 group-hover:rotate-[135deg]" />
            <span className="absolute top-1/2 h-px w-4 -rotate-45 bg-current transition-transform duration-500 group-hover:rotate-45" />
          </span>
        </button>
      </div>

      <div className="grid grid-cols-[7rem_1fr] items-center gap-6 border-b border-line px-6 py-8 sm:grid-cols-[9rem_1fr] sm:px-10">
        <div className="product-stage light aspect-[3/4] overflow-hidden">
          <ProductVisual product={product} className="render size-full p-2" />
        </div>
        <div>
          <h2 id="order-title" className="display text-4xl sm:text-5xl">{product.name}</h2>
          <p className="mt-3 text-sm text-ash">{product.finish} · {product.line}</p>
          <p className="mt-4 flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <span className="text-2xl font-semibold tabular-nums">{money(product.priceCents)}</span>
            <span className="text-xs text-ash">USD each</span>
            {!PRICING_CONFIRMED && <span className="border border-champagne/40 px-2 py-0.5 text-[0.625rem] font-semibold uppercase tracking-[0.18em] text-champagne">Provisional price</span>}
          </p>
        </div>
      </div>

      {status.state === 'offline' ? (
        <Notice
          title="Online payment isn’t connected yet."
          body={`Nothing has been charged and no order was placed. Send your order to ${site.contact.name} directly and it will be confirmed personally.`}
          close={close}
        >
          <a href={mailto()} className="btn">Email this order <span className="btn-arrow" aria-hidden="true">→</span></a>
          <a href={`tel:${site.contact.tel}`} className="btn btn-ghost">Call {site.contact.phone}</a>
        </Notice>
      ) : (
        <form onSubmit={submit} className="grid flex-1 gap-10 px-6 py-8 sm:px-10">
          <p className="flex gap-3 border-l-2 border-violet bg-violet/10 px-4 py-3 text-sm">
            <span className="shrink-0 font-bold uppercase tracking-[0.14em] text-violet">US only</span>
            <span className="text-bone/85">{availability.long}</span>
          </p>

          <fieldset className="flex items-center justify-between gap-6">
            <legend className="sr-only">Quantity</legend>
            <span className="text-[0.6875rem] font-semibold uppercase tracking-[0.2em] text-ash" aria-hidden="true">Quantity</span>
            <div className="flex items-center border border-line-strong">
              <button type="button" className="grid size-12 place-items-center text-lg transition-colors hover:bg-ink-4 disabled:opacity-30" onClick={() => setQty((q) => Math.max(1, q - 1))} disabled={qty <= 1} aria-label="Decrease quantity">−</button>
              <output className="w-12 text-center font-semibold tabular-nums" aria-live="polite" aria-label="Quantity">{qty}</output>
              <button type="button" className="grid size-12 place-items-center text-lg transition-colors hover:bg-ink-4 disabled:opacity-30" onClick={() => setQty((q) => Math.min(10, q + 1))} disabled={qty >= 10} aria-label="Increase quantity">+</button>
            </div>
          </fieldset>

          <fieldset className="grid gap-6">
            <legend className="mb-6 text-[0.6875rem] font-semibold uppercase tracking-[0.2em] text-bone">Your details</legend>
            <Field id="f-name" name="name" label="Full name" autoComplete="name" />
            <div className="grid gap-6 sm:grid-cols-2">
              <Field id="f-email" name="email" label="Email" type="email" autoComplete="email" error="Enter a valid email address." />
              <Field id="f-phone" name="phone" label="Phone" type="tel" autoComplete="tel" />
            </div>
          </fieldset>

          <fieldset className="grid gap-6">
            <legend className="mb-6 text-[0.6875rem] font-semibold uppercase tracking-[0.2em] text-bone">Shipping · US addresses only</legend>
            <Field id="f-address" name="address" label="Street address" autoComplete="street-address" />
            <div className="grid gap-6 sm:grid-cols-3">
              <Field id="f-city" name="city" label="City" autoComplete="address-level2" />
              <div className="field">
                <label htmlFor="f-state">State <span className="text-ember" aria-hidden="true">*</span></label>
                <select id="f-state" name="state" required autoComplete="address-level1" defaultValue="">
                  <option value="" disabled>Select</option>
                  {usStates.map(([code, label]) => <option key={code} value={code}>{label}</option>)}
                </select>
              </div>
              <Field id="f-postal" name="postal" label="ZIP code" autoComplete="postal-code" inputMode="numeric" pattern="\d{5}(-\d{4})?" error="Enter a 5-digit US ZIP code." />
            </div>
            <input type="hidden" name="country" value="US" />
            <p className="text-xs text-ash">Country: <span className="text-bone">United States</span>. We can&rsquo;t ship to Canada or any other country.</p>
          </fieldset>

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

          <div className="mt-auto grid gap-5 border-t border-line pt-8">
            <dl className="grid gap-3 text-sm">
              <Row term={`${product.name} × ${qty}`} value={money(subtotal)} />
              <Row term="Shipping & handling" value={shippingAtCheckout ? 'Added at secure checkout' : 'To be confirmed'} />
              {taxAtCheckout && <Row term="Sales tax" value="Calculated at checkout" />}
              <Row
                term={shippingAtCheckout || taxAtCheckout ? 'Subtotal' : 'Order total'}
                value={shippingAtCheckout ? money(subtotal) : `${money(subtotal)} + shipping`}
                strong
              />
            </dl>

            {status.state === 'error' && (
              <p role="alert" className="border-l-2 border-[#ff7a4d] pl-4 text-sm text-[#ffb190]">{status.message}</p>
            )}

            <button type="submit" className="btn w-full" disabled={status.state === 'sending'}>
              {status.state === 'sending' ? 'Please wait…' : `Continue to payment · ${money(subtotal)}`}
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
