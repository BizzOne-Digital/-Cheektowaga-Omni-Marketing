import Link from 'next/link'
import { money, products } from '@/lib/products'
import { legal, nav, site } from '@/lib/site'

export function Footer() {
  return (
    <footer className="relative mt-32 overflow-hidden border-t border-line bg-ink/80">
      <div className="wrap pt-24">
        <div className="grid gap-10 lg:grid-cols-[1.4fr_1fr] lg:items-end">
          <h2 data-split className="mega text-[clamp(3.4rem,11vw,11.5rem)]">
            Time,<br />
            <span className="display font-normal normal-case italic tracking-[-0.03em] text-ember">connected.</span>
          </h2>
          <div className="grid gap-6 lg:justify-items-end lg:text-right" data-reveal>
            <p className="max-w-sm text-ash">Connected watches, a clear price and a simple way to order. The collection is live now.</p>
            <Link href="/watches" className="btn w-fit" data-magnetic>
              Shop Watches <span className="btn-arrow" aria-hidden="true">→</span>
            </Link>
          </div>
        </div>

        <div className="mt-24 grid gap-12 border-t border-line py-14 sm:grid-cols-2 lg:grid-cols-4" data-stagger>
          <div className="grid content-start gap-5">
            <img src={site.logo.full} alt={`${site.name} logo`} width={802} height={700} className="h-auto w-40" loading="lazy" />
            <p className="max-w-xs text-sm leading-relaxed text-ash">{site.about}</p>
          </div>
          <div className="grid content-start gap-3 text-sm">
            <p className="eyebrow mb-2">Contact</p>
            <p className="text-ash">{site.contact.name}</p>
            <a className="ulink w-fit" href={`tel:${site.contact.tel}`}>{site.contact.phone}</a>
            <a className="ulink w-fit" href={`mailto:${site.contact.email}`}>{site.contact.email}</a>
          </div>
          <div className="grid content-start gap-3 text-sm">
            <p className="eyebrow mb-2">Shop</p>
            <Link className="ulink w-fit" href="/watches">{products[0].name}</Link>
            <p className="text-ash">{money(products[0].priceCents)} USD</p>
            <Link className="ulink w-fit text-ash hover:text-bone" href="/offer">Special offer</Link>
          </div>
          <div className="grid content-start gap-3 text-sm">
            <p className="eyebrow mb-2">Explore</p>
            <ul className="grid grid-cols-2 gap-3">
              {nav.map((n) => (
                <li key={n.href}><Link className="ulink text-ash hover:text-bone" href={n.href}>{n.label}</Link></li>
              ))}
            </ul>
          </div>
        </div>

        <div className="flex flex-col gap-4 border-t border-line py-8 text-xs text-ash md:flex-row md:items-center md:justify-between">
          <p>© {new Date().getFullYear()} {site.name}. All rights reserved.</p>
          <ul className="flex flex-wrap gap-x-6 gap-y-2">
            {Object.entries(legal).map(([slug, label]) => (
              <li key={slug}><Link className="ulink hover:text-bone" href={`/legal/${slug}`}>{label}</Link></li>
            ))}
          </ul>
        </div>
      </div>
      <p aria-hidden="true" className="mega pointer-events-none -mb-[3vw] select-none whitespace-nowrap text-center text-[19vw] outline-text">ASW · ASW</p>
    </footer>
  )
}
