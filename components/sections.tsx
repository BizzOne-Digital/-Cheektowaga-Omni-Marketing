import Link from 'next/link'
import { money, PRICING_CONFIRMED, products, type Product } from '@/lib/products'
import { offer, site } from '@/lib/site'
import { HeroVideo, UsTime } from './hero'
import { BuyButton, ClaimButton, ProductVisual } from './order'
import { WatchRender } from './watch-render'

const Arrow = () => <span className="btn-arrow" aria-hidden="true">→</span>

export function Price({ product, className = '' }: { product: Product; className?: string }) {
  return (
    <p className={`flex flex-wrap items-baseline gap-x-2 gap-y-1 ${className}`}>
      <span className="text-xl font-semibold tabular-nums">{money(product.priceCents)}</span>
      <span className="text-[0.6875rem] font-semibold uppercase tracking-[0.18em] text-ash">USD{!PRICING_CONFIRMED && ' · provisional'}</span>
    </p>
  )
}

/* ---------------- Hero ---------------- */
export function Hero() {
  return (
    <section className="relative isolate min-h-[100svh] overflow-hidden" aria-labelledby="hero-title">
      <div className="absolute inset-0 -z-10">
        <HeroVideo />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgb(8_8_8/0.92)_0%,rgb(8_8_8/0.55)_45%,rgb(8_8_8/0.15)_100%)]" />
        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-ink to-transparent" />
      </div>

      <p aria-hidden="true" className="absolute left-[calc(var(--gutter)/2-0.4rem)] top-1/2 hidden origin-center -translate-x-1/2 -rotate-90 whitespace-nowrap text-[0.625rem] font-semibold uppercase tracking-[0.5em] text-ash xl:block">
        {site.name} — Time, connected
      </p>

      <div className="wrap relative grid min-h-[100svh] grid-rows-[1fr_auto] pt-28 lg:pt-32">
        <div className="grid items-center gap-10 lg:grid-cols-12">
          <div className="relative z-10 lg:col-span-7">
            <p className="eyebrow" data-reveal="fade">The pop-up collection</p>
            <h1 id="hero-title" className="mt-8">
              <span data-split className="mega block w-max whitespace-nowrap text-[clamp(2.6rem,15vw,5rem)] lg:text-[clamp(3.4rem,9.4vw,10.5rem)]">Affordable</span>{' '}
              <span data-split data-delay="0.15" className="display block w-max whitespace-nowrap pl-[0.06em] text-[clamp(2.5rem,14vw,4.8rem)] lg:text-[clamp(3.2rem,9vw,10rem)] italic text-ember-soft">
                smart watches.
              </span>
            </h1>
            <p className="mt-8 max-w-md text-lg leading-relaxed text-bone/80" data-reveal data-delay="0.35">{site.tagline}</p>
            <div className="mt-10 flex flex-wrap gap-3" data-reveal data-delay="0.5">
              <Link href="/watches" className="btn" data-magnetic>Shop Watches <Arrow /></Link>
              <a href="#collection" className="btn btn-ghost" data-magnetic>Explore Collection</a>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-[26rem] lg:col-span-5 lg:max-w-none" data-reveal="scale" data-delay="0.2">
            <div className="relative aspect-[3/4] lg:aspect-auto lg:h-[76svh]">
              <svg viewBox="0 0 200 200" className="absolute left-1/2 top-[40%] w-[118%] -translate-x-1/2 -translate-y-1/2 opacity-80" aria-hidden="true">
                <circle cx="100" cy="100" r="96" fill="none" stroke="#E06D34" strokeOpacity="0.5" strokeWidth="0.4" />
                <circle cx="100" cy="100" r="88" fill="none" stroke="#F5F2ED" strokeOpacity="0.15" strokeWidth="0.3" strokeDasharray="0.6 2.4" className="origin-center animate-[spin_90s_linear_infinite]" />
              </svg>
              <div className="absolute inset-0 overflow-hidden [mask-image:radial-gradient(58%_52%_at_50%_44%,#000_45%,transparent_92%)]" data-speed="-0.12">
                <img src={site.heroPoster} alt="Smart Watch One with a glowing orange face, floating above a dark plinth" className="size-full scale-110 object-cover object-[50%_40%]" fetchPriority="high" />
              </div>
              <div className="absolute bottom-[12%] left-0 hidden border-l border-ember bg-ink/60 px-4 py-3 backdrop-blur-md sm:block lg:-left-10">
                <p className="text-[0.625rem] font-semibold uppercase tracking-[0.22em] text-ash">Featured</p>
                <p className="mt-1 text-sm font-semibold">{products[0].name} · {products[0].finish}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 grid grid-cols-2 border-t border-line text-[0.6875rem] font-semibold uppercase tracking-[0.22em] text-ash md:grid-cols-4" data-stagger data-delay="0.6">
          {['Connected', 'Active', 'Everyday'].map((w, i) => (
            <p key={w} className={`py-5 ${i ? 'md:border-l md:border-line md:pl-6' : ''}`}><span className="text-ember">0{i + 1}</span>&nbsp;&nbsp;{w}</p>
          ))}
          <p className="flex items-center justify-between py-5 md:border-l md:border-line md:pl-6">
            <span>{site.timeLabel} <UsTime /></span>
            <span className="relative hidden h-8 w-px overflow-hidden bg-line-strong sm:block" aria-hidden="true">
              <span className="absolute inset-x-0 top-0 h-1/2 animate-[scrollcue_2.2s_var(--ease-silk)_infinite] bg-ember" />
            </span>
          </p>
        </div>
      </div>
    </section>
  )
}

/* ---------------- Marquee ---------------- */
export function Marquee({ words = ['Time moves', 'So should you', 'Connected', 'Active', 'Affordable'] }: { words?: string[] }) {
  const row = (outline: boolean) => (
    <span className="flex shrink-0 items-center">
      {words.map((w) => (
        <span key={w} className="flex items-center">
          <span className={`mega px-[0.25em] text-[clamp(3.5rem,9vw,9rem)] ${outline ? 'outline-text' : ''}`}>{w}</span>
          <span className="size-[0.9vw] min-h-2 min-w-2 rounded-full bg-ember" />
        </span>
      ))}
    </span>
  )
  return (
    <div className="relative overflow-hidden border-y border-line py-6" aria-hidden="true">
      <div className="flex w-max" data-marquee>{row(false)}{row(false)}</div>
      <div className="flex w-max" data-marquee="reverse">{row(true)}{row(true)}</div>
    </div>
  )
}

/* ---------------- Brand intro ---------------- */
export function Intro() {
  return (
    <section className="wrap grid gap-14 py-32 lg:grid-cols-12 lg:py-44" aria-labelledby="intro-title">
      <div className="lg:col-span-4">
        <p className="eyebrow" data-reveal="fade">The story</p>
        <div className="product-stage relative mt-10 aspect-[4/5] max-w-sm" data-reveal="mask" style={{ '--stage-glow': 'rgb(242 154 104 / 0.22)' } as React.CSSProperties}>
          <WatchRender colorway={products[1].colorway} label={`${products[1].name} — placeholder render`} className="render absolute inset-0 m-auto h-[80%] w-auto -rotate-6" />
          <span className="floor" aria-hidden="true" />
        </div>
      </div>
      <div className="lg:col-span-8 lg:pt-16">
        <h2 id="intro-title" data-split className="display text-[clamp(2.8rem,6.5vw,6.5rem)]">
          A new way to <span className="italic text-ember">pass the time.</span>
        </h2>
        <p data-scrub-words className="mt-12 max-w-3xl text-[clamp(1.25rem,2.2vw,2rem)] leading-snug">
          Associated with {site.associated.name} and {site.associated.site}, {site.about}
        </p>
        <Link href="/story" className="ulink mt-12 inline-flex items-center gap-3 text-[0.75rem] font-semibold uppercase tracking-[0.2em]" data-reveal>
          Read the story <span className="text-ember" aria-hidden="true">→</span>
        </Link>
      </div>
    </section>
  )
}

/* ---------------- Featured product ---------------- */
export function Featured({ product = products[0] }: { product?: Product }) {
  return (
    <section className="relative py-24 lg:py-32" aria-labelledby="featured-title">
      <div className="wrap grid items-center gap-12 lg:grid-cols-12">
        <div className="group relative lg:col-span-7" data-cursor="Buy">
          <div className="product-stage aspect-[4/5] lg:aspect-[5/6]" data-reveal="mask">
            {product.image ? <img src={product.image} alt={`${product.name} watch face, close up`} className="render size-full scale-[1.55] object-cover object-[58%_40%]" loading="lazy" /> : <ProductVisual product={product} className="render size-full" />}
          </div>
        </div>
        <div className="lg:col-span-5 lg:pl-8">
          <p aria-hidden="true" className="mega mb-6 text-[clamp(4rem,8vw,8rem)] text-transparent [-webkit-text-stroke:1.5px_#E06D34]" data-reveal="fade">01</p>
          <p className="eyebrow" data-reveal="fade">Featured watch</p>
          <h2 id="featured-title" data-split className="mega mt-8 text-[clamp(3rem,6vw,6.2rem)]">{product.name}</h2>
          <p className="display mt-4 text-3xl italic text-ember-soft" data-reveal>{product.line}</p>
          <p className="mt-8 max-w-md leading-relaxed text-ash" data-reveal>{product.description}</p>
          <div className="mt-10 flex items-center gap-6 border-y border-line py-6" data-reveal>
            <span className="flex items-center gap-3 text-sm">
              <span className="size-4 rounded-full border border-line-strong" style={{ background: product.colorway.case[0] }} />
              {product.finish}
            </span>
            <Price product={product} className="ml-auto" />
          </div>
          <div className="mt-8 flex flex-wrap gap-3" data-reveal>
            <BuyButton productId={product.id} />
            <Link href="/watches" className="btn btn-ghost">All watches</Link>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ---------------- Horizontal collection rail ---------------- */
export function CollectionRail() {
  return (
    // Stable wrapper: GSAP moves the pinned <section> into a pin-spacer, so React must only ever remove this div.
    <div>
    <section id="collection" className="relative overflow-hidden" data-hscroll aria-labelledby="collection-title">
      <div className="flex min-h-[100svh] flex-col justify-center py-24 lg:py-0">
        <div className="rail snap-x snap-mandatory overflow-x-auto lg:overflow-visible">
          <ul data-hscroll-track className="flex w-max items-stretch gap-4 px-[var(--gutter)] lg:gap-6">
            <li className="flex w-[82vw] shrink-0 snap-start flex-col justify-between gap-10 pb-2 sm:w-[58vw] lg:w-[34vw] lg:pr-10">
              <div>
                <p className="eyebrow">The collection</p>
                <h2 id="collection-title" data-split className="display mt-6 text-[clamp(2.8rem,5.4vw,6rem)]">
                  Four ways to <span className="italic text-ember">wear time.</span>
                </h2>
                <p className="mt-6 max-w-sm text-ash">Scroll through every finish. Each one ships with the same connected core and a clear price.</p>
              </div>
              <p className="mega text-[clamp(5rem,11vw,11rem)] outline-text"><span data-count={products.length}>{String(products.length).padStart(2, '0')}</span></p>
            </li>
            {products.map((p, i) => (
              <li key={p.id} className="group w-[82vw] shrink-0 snap-start sm:w-[58vw] lg:w-[min(30vw,46svh)]" data-cursor="Buy">
                <div className="product-stage aspect-[4/5]" style={{ '--stage-glow': `${p.colorway.glow}2e` } as React.CSSProperties}>
                  <ProductVisual product={p} className={p.image ? 'render size-full object-[50%_40%]' : 'render absolute inset-0 m-auto h-[82%] w-auto'} />
                  {!p.image && <span className="floor" aria-hidden="true" />}
                  <span className="absolute left-5 top-5 text-[0.6875rem] font-semibold tracking-[0.2em] text-ash">0{i + 1} / 0{products.length}</span>
                </div>
                <div className="flex items-start justify-between gap-6 pt-6">
                  <div>
                    <h3 className="display text-3xl xl:text-4xl transition-transform duration-700 ease-[var(--ease-expo)] group-hover:translate-x-2">{p.name}</h3>
                    <p className="mt-2 text-sm text-ash">{p.finish} · {p.line}</p>
                  </div>
                  <Price product={p} className="shrink-0 flex-col !items-end !gap-0 text-right" />
                </div>
                <BuyButton productId={p.id} className="btn btn-ghost mt-5 w-full" />
              </li>
            ))}
            <li className="flex w-[70vw] shrink-0 snap-start flex-col justify-center gap-6 px-6 sm:w-[40vw] lg:w-[24vw]">
              <p className="display text-5xl">See every <span className="italic text-ember">detail.</span></p>
              <Link href="/watches" className="btn w-fit" data-magnetic>View collection <Arrow /></Link>
            </li>
          </ul>
        </div>
      </div>
    </section>
    </div>
  )
}

/* ---------------- Values ---------------- */
const values = [
  ['Connected', 'Designed around modern digital lifestyles.'],
  ['Active', 'Built for people who keep moving.'],
  ['Everyday', 'Technology designed to fit naturally into daily life.'],
]
export function Values() {
  return (
    <section className="wrap py-32 lg:py-44" aria-labelledby="values-title">
      <div className="mb-16 flex flex-wrap items-end justify-between gap-6">
        <p className="eyebrow" data-reveal="fade">Why it works</p>
        <h2 id="values-title" className="sr-only">Connected. Active. Everyday.</h2>
      </div>
      <ul className="border-t border-line">
        {values.map(([word, line], i) => (
          <li key={word} className="group grid items-center gap-4 border-b border-line py-8 md:grid-cols-12 md:py-10">
            <span className="text-[0.6875rem] font-semibold tracking-[0.2em] text-ember md:col-span-1">0{i + 1}</span>
            <p data-split className="mega text-[clamp(3.2rem,10vw,10rem)] transition-[color,transform] duration-700 ease-[var(--ease-expo)] group-hover:translate-x-4 group-hover:text-ember md:col-span-8">
              {word}.
            </p>
            <p className="max-w-xs text-ash md:col-span-3 md:justify-self-end md:text-right" data-reveal>{line}</p>
          </li>
        ))}
      </ul>
    </section>
  )
}

/* ---------------- Cinematic image story ---------------- */
export function ImageStory() {
  return (
    <section className="relative isolate flex min-h-[110svh] items-end overflow-hidden" aria-label="Time moves. So should you.">
      <div className="absolute inset-0 -z-10" data-reveal="mask">
        <div className="absolute inset-[-12%_0]" data-speed="0.3">
          <img src="/watch-hero.png" alt="" className="size-full object-cover object-[50%_45%] opacity-70" loading="lazy" />
        </div>
        <div className="absolute inset-0 bg-[linear-gradient(0deg,#080808_5%,transparent_55%,#080808_100%)]" />
      </div>
      <div className="wrap pb-24">
        <p data-split className="mega text-[clamp(4rem,14vw,15rem)]">Time moves.</p>
        <p data-split data-delay="0.1" className="display -mt-[0.1em] text-right text-[clamp(3.6rem,13vw,14rem)] italic text-ember">so should you.</p>
      </div>
    </section>
  )
}

/* ---------------- Special offer ---------------- */
export function OfferFeature({ detailed = false }: { detailed?: boolean }) {
  return (
    <section className="relative isolate overflow-hidden bg-ember text-ink" aria-labelledby="offer-title">
      <p aria-hidden="true" className="mega pointer-events-none absolute -right-[4vw] -top-[4vw] select-none text-[34vw] leading-none text-ink/[0.07]" data-speed="0.2">$35</p>
      <div className="wrap grid gap-14 py-24 lg:grid-cols-12 lg:py-36">
        <div className="lg:col-span-7">
          <p className="inline-flex items-center gap-3 text-[0.6875rem] font-bold uppercase tracking-[0.28em]">
            <span className="h-px w-7 bg-ink" /> Special offer
          </p>
          <h2 id="offer-title" className="mt-8">
            <span data-split className="mega block text-[clamp(3.8rem,10vw,10.5rem)]">Give ${offer.donation}.</span>
            <span data-split data-delay="0.12" className="display block text-[clamp(3.4rem,9vw,9.5rem)] italic">Get the watch.</span>
          </h2>
        </div>
        <div className="grid content-end gap-8 lg:col-span-5">
          <p className="text-lg leading-relaxed" data-reveal>{offer.summary}</p>
          <ol className="grid border-t border-ink/25" data-stagger>
            {[`Donate $${offer.donation} USD to ${offer.charity}`, 'Pay the applicable shipping and handling', 'Receive the featured smart watch'].map((s, i) => (
              <li key={s} className="flex gap-5 border-b border-ink/25 py-4 text-sm font-semibold">
                <span className="tabular-nums opacity-60">0{i + 1}</span>{s}
              </li>
            ))}
          </ol>
          <div className="flex flex-wrap gap-3" data-reveal>
            <ClaimButton className="btn btn-dark" />
            {!detailed && <Link href="/offer" className="btn btn-ghost !text-ink ![box-shadow:inset_0_0_0_1px_rgb(8_8_8/0.4)] hover:!text-ember">Offer details</Link>}
          </div>
        </div>
      </div>
    </section>
  )
}

/* ---------------- Inner-page header ---------------- */
export function PageHeader({ eyebrow, title, accent, children }: { eyebrow: string; title: string; accent: string; children?: React.ReactNode }) {
  return (
    <header className="wrap pb-16 pt-40 lg:pb-24 lg:pt-48">
      <p className="eyebrow" data-reveal="fade">{eyebrow}</p>
      <h1 className="mt-8">
        <span data-split className="mega block text-[clamp(3.4rem,11vw,11.5rem)]">{title}</span>
        <span data-split data-delay="0.12" className="display block text-[clamp(3rem,10vw,10.5rem)] italic text-ember">{accent}</span>
      </h1>
      {children && <div className="mt-10 max-w-xl text-lg leading-relaxed text-ash" data-reveal data-delay="0.3">{children}</div>}
    </header>
  )
}
