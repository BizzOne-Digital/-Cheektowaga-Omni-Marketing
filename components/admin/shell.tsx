'use client'

import { CreditCard, ExternalLink, FileText, Image as ImageIcon, Inbox, LayoutDashboard, LogOut, Menu, Package, ShoppingBag, X } from 'lucide-react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'
import { site } from '@/lib/site'
import { api } from './ui'

const nav = [
  { href: '/admin', label: 'Overview', icon: LayoutDashboard },
  { href: '/admin/orders', label: 'Orders', icon: ShoppingBag },
  { href: '/admin/products', label: 'Products', icon: Package },
  { href: '/admin/banners', label: 'Home banners', icon: ImageIcon },
  { href: '/admin/inquiries', label: 'Enquiries', icon: Inbox },
  { href: '/admin/payments', label: 'Payments', icon: CreditCard },
  { href: '/admin/content', label: 'Site copy', icon: FileText },
]

type Toast = { id: number; text: string; tone: 'ok' | 'bad' }
type ConfirmOpts = { title: string; body: string; confirm: string; danger?: boolean }
const Ctx = createContext<{ toast: (text: string, tone?: Toast['tone']) => void; confirm: (o: ConfirmOpts) => Promise<boolean> }>({
  toast: () => {},
  confirm: async () => false,
})
/** toast('Saved.') and `await confirm({...})` from any admin page. */
export const useAdmin = () => useContext(Ctx)

export function AdminShell({ email, children }: { email: string; children: React.ReactNode }) {
  const path = usePathname()
  const router = useRouter()
  const [menu, setMenu] = useState(false)
  const [toasts, setToasts] = useState<Toast[]>([])
  const [ask, setAsk] = useState<(ConfirmOpts & { resolve: (v: boolean) => void }) | null>(null)
  const dialog = useRef<HTMLDialogElement>(null)

  useEffect(() => setMenu(false), [path])
  useEffect(() => {
    if (ask) dialog.current?.showModal()
  }, [ask])

  const toast = useCallback((text: string, tone: Toast['tone'] = 'ok') => {
    const id = Date.now() + Math.random()
    setToasts((t) => [...t, { id, text, tone }])
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), tone === 'bad' ? 7000 : 3500)
  }, [])
  const confirm = useCallback((o: ConfirmOpts) => new Promise<boolean>((resolve) => setAsk({ ...o, resolve })), [])
  const answer = (v: boolean) => {
    ask?.resolve(v)
    dialog.current?.close()
    setAsk(null)
  }

  async function logout() {
    await api('/api/admin/logout', { method: 'POST' }).catch(() => {})
    router.replace('/admin/login')
    router.refresh()
  }

  const active = (href: string) => (href === '/admin' ? path === href : path.startsWith(href))

  return (
    <Ctx.Provider value={{ toast, confirm }}>
      <div className="min-h-svh lg:grid lg:grid-cols-[16rem_1fr]">
        {/* Mobile top bar */}
        <div className="sticky top-0 z-30 flex items-center justify-between border-b border-line bg-ink/95 px-4 py-3 backdrop-blur-md lg:hidden">
          <Link href="/admin" className="flex items-center gap-3">
            <img src={site.logo.mark} alt="" width={28} height={28} className="size-7" />
            <span className="text-[0.6875rem] font-semibold uppercase tracking-[0.2em]">Admin</span>
          </Link>
          <button type="button" className="grid size-11 place-items-center" onClick={() => setMenu(true)} aria-label="Open menu" aria-expanded={menu}>
            <Menu className="size-5" />
          </button>
        </div>

        {menu && <div className="fixed inset-0 z-40 bg-black/70 lg:hidden" onClick={() => setMenu(false)} aria-hidden="true" />}
        <aside
          className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-line bg-ink-2 transition-transform duration-500 ease-[var(--ease-expo)] lg:sticky lg:top-0 lg:z-auto lg:h-svh lg:w-auto lg:translate-x-0 ${menu ? 'translate-x-0' : '-translate-x-full'}`}
          aria-label="Admin navigation"
        >
          <div className="flex items-center justify-between border-b border-line px-5 py-5">
            <Link href="/admin" className="grid gap-3">
              <img src={site.logo.full} alt={site.name} width={802} height={700} className="h-auto w-24" />
              <span className="eyebrow">Admin</span>
            </Link>
            <button type="button" className="grid size-11 place-items-center lg:hidden" onClick={() => setMenu(false)} aria-label="Close menu">
              <X className="size-5" />
            </button>
          </div>
          <nav className="flex-1 overflow-y-auto py-4">
            <ul>
              {nav.map(({ href, label, icon: Icon }) => (
                <li key={href}>
                  <Link
                    href={href}
                    aria-current={active(href) ? 'page' : undefined}
                    className={`flex items-center gap-3 border-l-2 px-5 py-3 text-sm transition-colors ${active(href) ? 'border-ember bg-ember/10 text-bone' : 'border-transparent text-ash hover:bg-ink-3 hover:text-bone'}`}
                  >
                    <Icon className="size-4 shrink-0" aria-hidden="true" />
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <div className="grid gap-1 border-t border-line p-3 text-sm">
            <a href="/" target="_blank" rel="noopener" className="flex items-center gap-3 px-2 py-2.5 text-ash hover:text-bone">
              <ExternalLink className="size-4" aria-hidden="true" /> View site
            </a>
            <button type="button" onClick={logout} className="flex items-center gap-3 px-2 py-2.5 text-left text-ash hover:text-bone">
              <LogOut className="size-4" aria-hidden="true" /> Sign out
            </button>
            <p className="truncate px-2 pt-2 text-xs text-ash/70" title={email}>{email}</p>
          </div>
        </aside>

        <div className="min-w-0 px-4 py-8 sm:px-8 lg:px-12 lg:py-12">
          <div className="mx-auto max-w-6xl">{children}</div>
        </div>
      </div>

      <div className="fixed bottom-4 right-4 z-[80] grid w-[min(100%-2rem,24rem)] gap-2" aria-live="polite">
        {toasts.map((t) => (
          <p key={t.id} role={t.tone === 'bad' ? 'alert' : 'status'} className={`border-l-2 bg-ink-3 px-4 py-3 text-sm shadow-[0_20px_40px_rgb(0_0_0/0.5)] ${t.tone === 'bad' ? 'border-[#ff7a4d] text-[#ffb190]' : 'border-ember text-bone'}`}>
            {t.text}
          </p>
        ))}
      </div>

      <dialog ref={dialog} className="confirm" aria-labelledby="confirm-title" onCancel={() => answer(false)}>
        {ask && (
          <div className="grid gap-5 p-6">
            <h2 id="confirm-title" className="display text-3xl">{ask.title}</h2>
            <p className="text-sm leading-relaxed text-ash">{ask.body}</p>
            <div className="flex flex-wrap justify-end gap-3">
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => answer(false)} autoFocus>Cancel</button>
              <button type="button" className={`btn btn-sm ${ask.danger ? 'btn-danger' : ''}`} onClick={() => answer(true)}>{ask.confirm}</button>
            </div>
          </div>
        )}
      </dialog>
    </Ctx.Provider>
  )
}
