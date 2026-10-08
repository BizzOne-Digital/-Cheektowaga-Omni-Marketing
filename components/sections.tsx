import Link from 'next/link'
import { features, featureTable, highlights, money, PRICING_CONFIRMED, products, type Product } from '@/lib/products'
import { offer, site } from '@/lib/site'
import { LoopVideo, UsTime } from './hero'
import { BuyButton, ClaimButton, ProductVisual } from './order'

const Arrow = () => <span className="btn-arrow" aria-hidden="true">→</span>

export function Price({ product, className = '' }: { product: Product; className?: string }) {
  return (
    <p className={`flex flex-wrap items-baseline gap-x-2 gap-y-1 ${className}`}>
      <span className="text-xl font-semibold tabular-nums">{money(product.priceCents)}</span>
      <span className="text-[0.6875rem] font-semibold uppercase tracking-[0.18em] text-ash">USD{!PRICING_CONFIRMED && ' · provisional'}</span>
    </p>
  )
}

/* ---------------- Hero (orange design merged with the client's L16 Pro banner) ---------------- */
const heroChips = ['4G connectivity', 'Phone calls', 'GPS location', 'Health monitoring']

export function Hero({ product = products[0] }: { product?: Product }) {
  return (
    <section className="relative isolate min-h-[100svh] overflow-hidden" aria-labelledby="hero-title">
      {/* Orange + violet light, as on the client's banner */}
      <div className="absolute inset-0 -z-10" aria-hidden="true">
        <div className="absolute -left-[20%] bottom-[-30%] h-[80vh] w-[80vw] bg-[radial-gradient(closest-side,rgb(224_109_52/0.32),transparent)]" />
        <div className="absolute -right-[15%] top-[5%] h-[70vh] w-[60vw] bg-[radial-gradient(closest-side,rgb(143_75_255/0.22),transparent)]" />
        <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-ink to-transparent" />
      </div>

      <div className="wrap relative grid min-h-[100svh] grid-rows-[1fr_auto] pt-28 lg:pt-32">
        <div className="grid items-center gap-12 lg:grid-cols-12">
          <div className="relative z-10 lg:col-span-7">
            <p className="eyebrow" data-reveal="fade">L16 Pro · Affordable smart watch</p>
            <h1 id="hero-title" className="mt-8">
              <span data-split className="mega block w-max whitespace-nowrap text-[clamp(2.6rem,15vw,5rem)] lg:text-[clamp(3.4rem,8.4vw,9.5rem)]">Affordable</span>{' '}
              <span data-split data-delay="0.15" className="display block w-max whitespace-nowrap pl-[0.06em] text-[clamp(2.5rem,14vw,4.8rem)] lg:text-[clamp(3.2rem,8vw,9rem)] italic text-ember-soft">
                smart watches.
              </span>
            </h1>
            <p className="mt-8 text-[clamp(1.25rem,2vw,1.6rem)] font-semibold" data-reveal data-delay="0.3">
              More connectivity. <span className="text-violet">More freedom.</span>
            </p>
            <ul className="mt-6 flex flex-wrap gap-2" data-stagger data-delay="0.4" aria-label="Key features">
              {heroChips.map((c) => (
                <li key={c} className="border border-line-strong bg-ink/60 px-3 py-2 text-[0.6875rem] font-semibold uppercase tracking-[0.16em] text-bone/90 backdrop-blur-sm">
                  {c}
                </li>
              ))}
            </ul>
            <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-4" data-reveal data-delay="0.5">
              <p className="flex items-baseline gap-2" aria-label={`Only ${money(product.priceCents)} US dollars`}>
                <span className="-skew-x-6 bg-violet px-2 py-0.5 text-xs font-extrabold uppercase italic tracking-[0.12em] text-white">Only</span>
                <span className="mega text-[clamp(2.6rem,4vw,3.6rem)]">{money(product.priceCents)}</span>
                <span className="text-xs font-semibold text-ash">USD</span>
              </p>
              <div className="flex flex-wrap gap-3">
                <BuyButton productId={product.id} />
                <Link href="/watches" className="btn btn-ghost" data-magnetic>See the watch</Link>
              </div>
            </div>
          </div>

          {/* Product film from the client's site */}
          <figure className="relative lg:col-span-5" data-reveal="scale" data-delay="0.2">
            <div className="relative overflow-hidden border border-line-strong bg-white shadow-[0_40px_90px_rgb(0_0_0/0.6)]">
              <LoopVideo className="aspect-video w-full object-cover" />
              <span className="absolute left-3 top-3 flex items-center gap-2 bg-ink/80 px-3 py-1.5 text-[0.625rem] font-semibold uppercase tracking-[0.2em] text-bone backdrop-blur-md">
                <span className="size-1.5 animate-pulse rounded-full bg-ember" aria-hidden="true" /> {product.name}
              </span>
            </div>
            <figcaption className="mt-3 flex justify-between text-[0.6875rem] font-semibold uppercase tracking-[0.2em] text-ash">
              <span>See it in action</span>
              <span className="text-ember">4G · SOS · GPS</span>
            </figcaption>
          </figure>
        </div>

        <div className="mt-12 grid grid-cols-2 border-t border-line text-[0.6875rem] font-semibold uppercase tracking-[0.22em] text-ash md:grid-cols-4" data-stagger data-delay="0.6">
          {site.pillars.map((w, i) => (
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

/* ---------------- Client promo banner ---------------- */
export function PromoBanner({ product = products[0] }: { product?: Product }) {
  return (
    <section className="wrap py-10" aria-label={`${product.name} promotion`}>
      <Link href="/watches" className="group block overflow-hidden border border-line transition-colors duration-500 hover:border-ember/60" data-reveal="mask" data-cursor="Shop">
        <img
          src={site.promoBanner}
          width={1280}
          height={461}
          alt={`L16 Pro, affordable smart watch. More connectivity, more freedom: 4G, calls, GPS and health. Only ${money(product.priceCents)} USD. Buy now.`}
          className="h-auto w-full transition-transform duration-1000 ease-[var(--ease-expo)] group-hover:scale-[1.02]"
          loading="lazy"
        />
      </Link>
    </section>
  )
}

/* ---------------- Marquee ---------------- */
export function Marquee({ words = ['Peace of mind', 'Stay connected', 'Live healthier', 'Do more', 'Affordable'] }: { words?: string[] }) {
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
        <p className="eyebrow" data-reveal="fade">Our story</p>
        <div className="product-stage light relative mt-10 aspect-[4/5] max-w-sm" data-reveal="mask">
          <img src={products[0].images[2].src} alt={products[0].images[2].alt} className="render absolute inset-0 size-full object-contain p-[8%]" loading="lazy" />
        </div>
      </div>
      <div className="lg:col-span-8 lg:pt-16">
        <h2 id="intro-title" data-split className="display text-[clamp(2.8rem,6.5vw,6.5rem)]">
          Made for the people <span className="italic text-ember">who matter most.</span>
        </h2>
        <p data-scrub-words className="mt-12 max-w-3xl text-[clamp(1.25rem,2.2vw,2rem)] leading-snug">
          Staying safe and connected shouldn&rsquo;t cost a fortune. {site.name} brings families well-made 4G safety watches at a fair price, starting with the L16 Pro: help at the press of a button for the wearer, and real peace of mind for everyone who cares about them.
        </p>
        <Link href="/story" className="ulink mt-12 inline-flex items-center gap-3 text-[0.75rem] font-semibold uppercase tracking-[0.2em]" data-reveal>
          Read the story <span className="text-ember" aria-hidden="true">→</span>
        </Link>
      </div>
    </section>
  )
}

/* ---------------- Product in ring (moved from the hero) ---------------- */
export function ProductRing({ product = products[0] }: { product?: Product }) {
  const img = product.images[0]
  return (
    <div className="relative mx-auto aspect-square w-full max-w-[42rem]" data-reveal="scale">
      <div className="absolute inset-[2%] bg-[radial-gradient(closest-side,rgb(224_109_52/0.28),transparent)]" aria-hidden="true" />
      <svg viewBox="0 0 200 200" className="absolute inset-0 size-full opacity-80" aria-hidden="true">
        <circle cx="100" cy="100" r="96" fill="none" stroke="#E06D34" strokeOpacity="0.5" strokeWidth="0.4" />
        <circle cx="100" cy="100" r="88" fill="none" stroke="#F5F2ED" strokeOpacity="0.15" strokeWidth="0.3" strokeDasharray="0.6 2.4" className="origin-center animate-[spin_90s_linear_infinite]" />
      </svg>
      <div className="absolute inset-[13%] overflow-hidden rounded-full bg-white shadow-[0_40px_80px_rgb(0_0_0/0.55)]" data-speed="-0.08">
        <img src={img.src} alt={img.alt} className="size-full object-contain p-[9%] transition-transform duration-1000 ease-[var(--ease-expo)] group-hover:scale-105" loading="lazy" />
      </div>
      <div className="absolute bottom-[10%] left-0 border-l border-ember bg-ink/60 px-4 py-3 backdrop-blur-md lg:-left-6">
        <p className="text-[0.625rem] font-semibold uppercase tracking-[0.22em] text-ash">Featured</p>
        <p className="mt-1 text-sm font-semibold">{product.name} · {money(product.priceCents)}</p>
      </div>
    </div>
  )
}

/* ---------------- Featured product ---------------- */
export function Featured({ product = products[0] }: { product?: Product }) {
  return (
    <section className="relative py-24 lg:py-32" aria-labelledby="featured-title">
      <div className="wrap grid items-center gap-12 lg:grid-cols-12">
        <div className="group relative lg:col-span-7" data-cursor="Buy">
          <ProductRing product={product} />
        </div>
        <div className="lg:col-span-5 lg:pl-8">
          <p aria-hidden="true" className="mega mb-6 text-[clamp(4rem,8vw,8rem)] text-transparent [-webkit-text-stroke:1.5px_#E06D34]" data-reveal="fade">01</p>
          <p className="eyebrow" data-reveal="fade">The watch · {product.model}</p>
          <h2 id="featured-title" className="mt-8" aria-label={product.heading}>
            <span data-split className="mega block text-[clamp(2.6rem,4.6vw,4.8rem)]">Peace of mind on your wrist:</span>
            <span data-split data-delay="0.1" className="display mt-2 block text-[clamp(2.2rem,3.6vw,3.8rem)] italic text-ember-soft">The L16 Pro Smartwatch</span>
          </h2>
          <p className="mt-8 max-w-md leading-relaxed text-ash" data-reveal>{product.description}</p>
          <ul className="mt-8 grid gap-3 text-sm" data-stagger>
            {highlights.map((h) => (
              <li key={h.title} className="flex gap-3"><span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-ember" aria-hidden="true" />{h.title}</li>
            ))}
          </ul>
          <div className="mt-10 flex items-center gap-6 border-y border-line py-6" data-reveal>
            <span className="flex items-center gap-3 text-sm">
              <span className="size-4 rounded-full border border-line-strong" style={{ background: product.swatch }} />
              {product.finish}
            </span>
            <Price product={product} className="ml-auto" />
          </div>
          <div className="mt-8 flex flex-wrap gap-3" data-reveal>
            <BuyButton productId={product.id} />
            <Link href="/watches" className="btn btn-ghost">Learn more</Link>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ---------------- Horizontal feature rail ---------------- */
export function FeatureRail({ product = products[0] }: { product?: Product }) {
  return (
    // Stable wrapper: GSAP moves the pinned <section> into a pin-spacer, so React must only ever remove this div.
    <div>
    <section id="collection" className="relative overflow-hidden" data-hscroll aria-labelledby="collection-title">
      <div className="flex min-h-[100svh] flex-col justify-center py-24 lg:py-0">
        <div className="rail snap-x snap-mandatory overflow-x-auto lg:overflow-visible">
          <ul data-hscroll-track className="flex w-max items-stretch gap-4 px-[var(--gutter)] lg:gap-6">
            <li className="flex w-[82vw] shrink-0 snap-start flex-col justify-between gap-10 pb-2 sm:w-[58vw] lg:w-[34vw] lg:pr-10">
              <div>
                <p className="eyebrow">Inside the {product.name}</p>
                <h2 id="collection-title" data-split className="display mt-6 text-[clamp(2.8rem,5.4vw,6rem)]">
                  Safety, <span className="italic text-ember">built in.</span>
                </h2>
                <p className="mt-6 max-w-sm text-ash">Help, location and health in one simple 4G watch that works without a phone nearby.</p>
              </div>
              <p className="mega text-[clamp(5rem,11vw,11rem)] outline-text"><span data-count={features.length}>{String(features.length).padStart(2, '0')}</span></p>
            </li>
            {features.map((f, i) => (
              <li key={f.title} className="group @container flex w-[72vw] shrink-0 snap-start flex-col justify-between gap-10 overflow-hidden border border-line bg-ink-2/70 p-7 transition-colors duration-700 hover:border-ember/60 sm:w-[44vw] lg:h-[62svh] lg:w-[min(24vw,40svh)]">
                <div className="flex items-start justify-between text-[0.6875rem] font-semibold tracking-[0.2em] text-ash">
                  <span>{String(i + 1).padStart(2, '0')} / {String(features.length).padStart(2, '0')}</span>
                  <span className="size-2 rounded-full bg-ember transition-transform duration-700 group-hover:scale-150" aria-hidden="true" />
                </div>
                <p className="mega whitespace-nowrap text-[clamp(2.4rem,26cqw,6rem)] text-bone transition-colors duration-700 group-hover:text-ember">{f.stat}</p>
                <div>
                  <h3 className="display text-3xl xl:text-4xl">{f.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-ash">{f.text}</p>
                </div>
              </li>
            ))}
            <li className="group flex w-[82vw] shrink-0 snap-start flex-col justify-between gap-6 sm:w-[58vw] lg:w-[min(30vw,46svh)]" data-cursor="Buy">
              <div className="product-stage light relative aspect-[4/5]">
                <ProductVisual product={product} className="render absolute inset-0 size-full p-[8%]" />
              </div>
              <div className="flex items-center justify-between gap-6">
                <div>
                  <p className="display text-3xl xl:text-4xl">{product.name}</p>
                  <p className="mt-1 text-sm text-ash">{product.finish}</p>
                </div>
                <Price product={product} className="shrink-0 flex-col !items-end !gap-0 text-right" />
              </div>
              <BuyButton productId={product.id} className="btn w-full" />
            </li>
          </ul>
        </div>
      </div>
    </section>
    </div>
  )
}

/* ---------------- Full feature list (Toptraking L16PRO) ---------------- */
export function FeatureTable({ product = products[0] }: { product?: Product }) {
  return (
    <section id="features" className="wrap scroll-mt-28 py-24 lg:py-32" aria-labelledby="features-title">
      <div className="mb-12 flex flex-wrap items-end justify-between gap-6">
        <div>
          <p className="eyebrow" data-reveal="fade">{product.name}</p>
          <h2 id="features-title" data-split className="display mt-6 text-[clamp(2.6rem,5vw,5rem)]">
            Every <span className="italic text-ember">feature.</span>
          </h2>
        </div>
        <Price product={product} />
      </div>
      <dl className="grid border-l border-t border-line sm:grid-cols-2 lg:grid-cols-4" data-stagger>
        {featureTable.map(([name, detail]) => (
          <div key={name} className="group flex min-h-36 flex-col justify-between gap-4 border-b border-r border-line p-6 transition-colors duration-500 hover:bg-ink-2/80">
            <dt className="text-[0.6875rem] font-semibold uppercase tracking-[0.2em] text-ash transition-colors duration-500 group-hover:text-ember">{name}</dt>
            <dd className="flex items-start gap-2 text-lg leading-snug text-bone">
              {detail === 'Supported' && <span className="mt-1.5 size-2 shrink-0 rounded-full bg-ember" aria-hidden="true" />}
              {detail}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  )
}

/* ---------------- Values ---------------- */
const values = [
  ['Safe', 'One-touch SOS and fall alerts, wherever the day goes.'],
  ['Connected', 'Its own 4G line keeps family one call away.'],
  ['Independent', 'Freedom to get out and about, with a safety net built in.'],
]
export function Values() {
  return (
    <section className="wrap py-32 lg:py-44" aria-labelledby="values-title">
      <div className="mb-16 flex flex-wrap items-end justify-between gap-6">
        <p className="eyebrow" data-reveal="fade">Why it works</p>
        <h2 id="values-title" className="sr-only">Safe. Connected. Independent.</h2>
      </div>
      <ul className="border-t border-line">
        {values.map(([word, line], i) => (
          <li key={word} className="group @container grid items-center gap-4 border-b border-line py-8 md:grid-cols-12 md:py-10">
            <span className="text-[0.6875rem] font-semibold tracking-[0.2em] text-ember md:col-span-1">0{i + 1}</span>
            <p data-split className="mega whitespace-nowrap text-[clamp(2.4rem,7cqw,7.5rem)] transition-[color,transform] duration-700 ease-[var(--ease-expo)] group-hover:translate-x-4 group-hover:text-ember md:col-span-8">
              {word}.
            </p>
            <p className="max-w-xs text-ash md:col-span-3 md:justify-self-end md:text-right" data-reveal>{line}</p>
          </li>
        ))}
      </ul>
    </section>
  )
}

/* ---------------- Cinematic statement ---------------- */
export function ImageStory() {
  return (
    <section className="relative isolate flex min-h-[90svh] items-center overflow-hidden" aria-label="More connectivity. More freedom.">
      <div className="absolute inset-0 -z-10" aria-hidden="true">
        <div className="absolute left-1/2 top-1/2 h-[70vh] w-[70vw] -translate-x-1/2 -translate-y-1/2 bg-[radial-gradient(closest-side,rgb(143_75_255/0.18),transparent)]" data-speed="0.2" />
      </div>
      <div className="wrap">
        <p data-split className="mega text-[clamp(3.4rem,11vw,12rem)]">More connectivity.</p>
        <p data-split data-delay="0.1" className="display -mt-[0.05em] text-right text-[clamp(3.2rem,10.5vw,11.5rem)] italic text-ember">more freedom.</p>
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
