'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { nav, site } from '@/lib/site'

export function Wordmark({ className = '' }: { className?: string }) {
  return (
    <span className={`flex items-center gap-3 ${className}`}>
      <img src={site.logo.mark} alt="" width={218} height={406} className="h-9 w-auto shrink-0" />
      <span className="whitespace-nowrap leading-none">
        <span className="block text-[0.625rem] font-semibold uppercase tracking-[0.34em] text-ash">Affordable</span>
        <span className="block text-[0.95rem] font-extrabold uppercase tracking-[-0.02em]">Smart Watches</span>
      </span>
    </span>
  )
}

export function Nav() {
  const pathname = usePathname()
  const [scrolled, setScrolled] = useState(false)
  const menu = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const onScroll = () => setScrolled(scrollY > 40)
    onScroll()
    addEventListener('scroll', onScroll, { passive: true })
    return () => removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => menu.current?.close(), [pathname])

  const active = (href: string) => (href === '/' ? pathname === '/' : pathname.startsWith(href))

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-50 border-b transition-[background-color,border-color,backdrop-filter] duration-700 ${
          scrolled ? 'border-line bg-ink/75 backdrop-blur-xl' : 'border-transparent bg-transparent'
        }`}
      >
        <div className="wrap flex h-[4.5rem] items-center justify-between gap-6 lg:h-20">
          <Link href="/" aria-label={`${site.name} — home`} className="relative z-10">
            <Wordmark />
          </Link>

          <nav aria-label="Primary" className="hidden lg:block">
            <ul className="flex items-center gap-10">
              {nav.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={active(item.href) ? 'page' : undefined}
                    className="group relative flex items-center gap-2 py-2 text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-ash transition-colors hover:text-bone aria-[current=page]:text-bone"
                  >
                    <span className={`size-1 rounded-full bg-ember transition-transform duration-500 ${active(item.href) ? 'scale-100' : 'scale-0 group-hover:scale-100'}`} />
                    <span className="relative block overflow-hidden">
                      <span className="block transition-transform duration-500 ease-[var(--ease-expo)] group-hover:-translate-y-full">{item.label}</span>
                      <span className="absolute inset-0 translate-y-full text-ember transition-transform duration-500 ease-[var(--ease-expo)] group-hover:translate-y-0" aria-hidden="true">
                        {item.label}
                      </span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="flex items-center gap-3">
            <Link href="/watches" className="btn hidden !min-h-11 md:inline-flex" data-magnetic>
              Shop Now
            </Link>
            <button
              type="button"
              onClick={() => menu.current?.showModal()}
              className="grid size-11 place-items-center lg:hidden"
              aria-label="Open menu"
              aria-haspopup="dialog"
            >
              <span className="grid gap-1.5" aria-hidden="true">
                <span className="block h-px w-6 bg-bone" />
                <span className="ml-auto block h-px w-4 bg-ember" />
              </span>
            </button>
          </div>
        </div>
      </header>

      <dialog ref={menu} className="menu lg:hidden" aria-label="Menu" onClick={(e) => e.target === menu.current && menu.current.close()}>
        <div className="flex h-full flex-col px-[var(--gutter)] pb-10">
          <div className="flex h-[4.5rem] items-center justify-between">
            <Wordmark />
            <button type="button" onClick={() => menu.current?.close()} className="grid size-11 place-items-center" aria-label="Close menu">
              <span className="relative block size-5" aria-hidden="true">
                <span className="absolute left-0 top-1/2 h-px w-5 rotate-45 bg-bone" />
                <span className="absolute left-0 top-1/2 h-px w-5 -rotate-45 bg-ember" />
              </span>
            </button>
          </div>

          <nav aria-label="Mobile" className="mt-10 flex-1">
            <ul className="grid gap-1">
              {nav.map((item, i) => (
                <li key={item.href} className="overflow-hidden border-b border-line">
                  <Link
                    href={item.href}
                    aria-current={active(item.href) ? 'page' : undefined}
                    className="menu-link flex items-baseline justify-between py-4"
                    style={{ '--i': i } as React.CSSProperties}
                  >
                    <span className={`display text-[clamp(2.6rem,12vw,4.5rem)] ${active(item.href) ? "text-ember" : ""}`}>{item.label}</span>
                    <span className="text-[0.6875rem] font-semibold tracking-[0.2em] text-ash">0{i + 1}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="grid gap-3 text-sm text-ash">
            <a href={`tel:${site.contact.tel}`} className="ulink w-fit">{site.contact.phone}</a>
            <a href={`mailto:${site.contact.email}`} className="ulink w-fit">{site.contact.email}</a>
            <Link href="/watches" className="btn mt-4 w-full">Shop Watches <span className="btn-arrow" aria-hidden="true">→</span></Link>
          </div>
        </div>
      </dialog>
    </>
  )
}
