'use client'

import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { markIntroReady } from './motion'

// Splash intro: plays once per session, tied to real page load (max ~2.6s).
export function Loader() {
  const root = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = root.current
    if (!el || document.documentElement.classList.contains('seen')) return markIntroReady()
    sessionStorage.setItem('asw-intro', '1')
    document.documentElement.style.overflow = 'hidden'
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches
    const finish = () => {
      document.documentElement.style.overflow = ''
      el.style.display = 'none'
    }

    if (reduce) {
      markIntroReady()
      gsap.to(el, { opacity: 0, duration: 0.4, delay: 0.3, onComplete: finish })
      return
    }

    const count = el.querySelector('[data-count-l]')!
    const progress = { v: 0 }
    const loaded = new Promise<void>((r) => (document.readyState === 'complete' ? r() : addEventListener('load', () => r(), { once: true })))
    const cap = new Promise<void>((r) => setTimeout(r, 1600))

    const intro = gsap.timeline()
    intro
      .from('[data-l-word]', { yPercent: 120, duration: 1.1, ease: 'expo.out', stagger: 0.08 })
      .from('[data-l-rule]', { scaleX: 0, duration: 1.2, ease: 'expo.inOut' }, 0.1)
      .from('[data-l-dot]', { scale: 0, duration: 0.8, ease: 'back.out(3)' }, 0.5)
      .to(progress, { v: 86, duration: 1.4, ease: 'power2.out', onUpdate: () => void (count.textContent = String(Math.round(progress.v)).padStart(3, '0')) }, 0)

    Promise.race([Promise.all([loaded, cap]), new Promise((r) => setTimeout(r, 2600))]).then(() => {
      gsap
        .timeline({ onComplete: finish })
        .to(progress, { v: 100, duration: 0.35, ease: 'power1.out', onUpdate: () => void (count.textContent = String(Math.round(progress.v)).padStart(3, '0')) })
        .to('[data-l-bar]', { scaleX: 1, duration: 0.35, ease: 'power1.out' }, '<')
        .to('[data-l-word]', { yPercent: -120, duration: 0.7, ease: 'expo.in', stagger: 0.04 })
        .add(markIntroReady, '-=0.2')
        .to(el, { clipPath: 'inset(0% 0% 100% 0%)', duration: 1.1, ease: 'expo.inOut' }, '-=0.25')
    })
    gsap.to('[data-l-bar]', { scaleX: 0.86, duration: 1.4, ease: 'power2.out' })
  }, [])

  return (
    <div
      ref={root}
      className="loader fixed inset-0 z-[100] flex flex-col justify-between bg-ink p-[var(--gutter)]"
      style={{ clipPath: 'inset(0% 0% 0% 0%)' }}
      aria-hidden="true"
    >
      <div className="flex items-center justify-between text-[0.6875rem] font-semibold uppercase tracking-[0.28em] text-ash">
        <span>The pop-up collection</span>
        <span>Loading the collection</span>
      </div>

      <div>
        <div className="overflow-hidden pt-[0.08em] pb-[0.04em]">
          <p data-l-word className="mega leading-[0.9] text-[clamp(3.2rem,13vw,13rem)]">Affordable</p>
        </div>
        <div className="flex items-end gap-[2vw] overflow-hidden pb-[0.12em] pt-[0.04em]">
          <p data-l-word className="display italic text-[clamp(3rem,12vw,12rem)] text-ember">smart</p>
          <p data-l-word className="mega leading-[0.9] text-[clamp(3.2rem,13vw,13rem)]">watches</p>
          <span data-l-dot className="mb-[2.2vw] size-[1.6vw] min-h-3 min-w-3 rounded-full bg-ember" />
        </div>
      </div>

      <div>
        <div data-l-rule className="relative h-px origin-left bg-line-strong">
          <div data-l-bar className="absolute inset-0 origin-left scale-x-0 bg-ember" />
        </div>
        <div className="mt-4 flex items-center justify-between text-[0.6875rem] font-semibold uppercase tracking-[0.28em] text-ash">
          <span>Time, connected</span>
          <span data-count-l className="tabular-nums text-bone">000</span>
        </div>
      </div>
    </div>
  )
}
