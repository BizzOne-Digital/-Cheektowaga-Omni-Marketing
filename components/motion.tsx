'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SplitText } from 'gsap/SplitText'

gsap.registerPlugin(ScrollTrigger, SplitText)

// Resolves once the splash loader has finished, so intro animations play on reveal.
let resolveReady: () => void
export const introReady = new Promise<void>((r) => (resolveReady = r))
export const markIntroReady = () => resolveReady()

const EASE = 'expo.out'

/*
  One declarative motion system for every page. Server components opt in with attributes:
  data-split            headline lines rise out of a mask
  data-reveal="up|fade|mask|scale"   element entrance (mask = clip-path wipe + inner image settle)
  data-stagger          children enter one after another
  data-speed="0.2"      scroll parallax (fraction of viewport)
  data-scrub-words      words light up as you scroll through
  data-marquee          infinite drift, speeds up with scroll velocity
  data-hscroll          pinned horizontal gallery (desktop), child [data-hscroll-track]
  data-count="100"      number counts up on entry
*/
export function Motion() {
  const pathname = usePathname()

  useEffect(() => {
    let cancelled = false
    const mm = gsap.matchMedia()

    introReady.then(() => {
      if (cancelled) return
      mm.add(
        { motion: '(prefers-reduced-motion: no-preference)', desktop: '(min-width: 1024px)' },
        (ctx) => {
          const { motion, desktop } = ctx.conditions as { motion: boolean; desktop: boolean }
          const q = <T extends Element = HTMLElement>(s: string) => gsap.utils.toArray<T>(s)

          if (!motion) {
            gsap.set('[data-reveal], [data-stagger] > *', { opacity: 1 })
            gsap.set('[data-split]', { visibility: 'visible' })
            return
          }

          q('[data-split]').forEach((el) => {
            gsap.set(el, { visibility: 'visible' })
            SplitText.create(el, {
              type: 'lines',
              mask: 'lines',
              autoSplit: true,
              onSplit: (self) => {
                // Pad each mask so tight display line-heights don't crop glyph tops/bottoms.
                gsap.set(self.masks, { paddingBlock: '0.14em', marginBlock: '-0.14em' })
                return gsap.from(self.lines, {
                  yPercent: 115,
                  rotate: 2,
                  duration: 1.4,
                  ease: EASE,
                  stagger: 0.09,
                  delay: Number(el.dataset.delay ?? 0),
                  scrollTrigger: { trigger: el, start: 'top 88%', once: true },
                })
              },
            })
          })

          q('[data-reveal]').forEach((el) => {
            const kind = el.dataset.reveal
            const st = { trigger: el, start: 'top 88%', once: true }
            const delay = Number(el.dataset.delay ?? 0)
            if (kind === 'mask') {
              gsap.set(el, { opacity: 1 })
              gsap.fromTo(el, { clipPath: 'inset(100% 0% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.6, ease: 'expo.inOut', delay, scrollTrigger: st })
              const inner = el.querySelector('img, video, svg')
              if (inner) gsap.fromTo(inner, { scale: 1.3, filter: 'blur(8px)' }, { scale: 1, filter: 'blur(0px)', duration: 2, ease: EASE, delay, scrollTrigger: st })
            } else if (kind === 'scale') {
              gsap.fromTo(el, { opacity: 0, scale: 0.9, filter: 'blur(10px)' }, { opacity: 1, scale: 1, filter: 'blur(0px)', duration: 1.6, ease: EASE, delay, scrollTrigger: st })
            } else if (kind === 'fade') {
              gsap.to(el, { opacity: 1, duration: 1.2, ease: 'power2.out', delay, scrollTrigger: st })
            } else {
              gsap.fromTo(el, { opacity: 0, y: 48 }, { opacity: 1, y: 0, duration: 1.3, ease: EASE, delay, scrollTrigger: st })
            }
          })

          q('[data-stagger]').forEach((el) => {
            gsap.fromTo(el.children, { opacity: 0, y: 36 }, { opacity: 1, y: 0, duration: 1.2, ease: EASE, stagger: 0.08, delay: Number(el.dataset.delay ?? 0), scrollTrigger: { trigger: el, start: 'top 90%', once: true } })
          })

          q('[data-speed]').forEach((el) => {
            const speed = Number(el.dataset.speed)
            gsap.fromTo(el, { yPercent: -speed * 50 }, { yPercent: speed * 50, ease: 'none', scrollTrigger: { trigger: el.parentElement ?? el, start: 'top bottom', end: 'bottom top', scrub: true } })
          })

          q('[data-scrub-words]').forEach((el) => {
            const split = SplitText.create(el, { type: 'words' })
            gsap.fromTo(split.words, { opacity: 0.14 }, { opacity: 1, stagger: 0.1, ease: 'none', scrollTrigger: { trigger: el, start: 'top 80%', end: 'bottom 45%', scrub: true } })
          })

          q('[data-marquee]').forEach((el) => {
            const dir = el.dataset.marquee === 'reverse' ? 1 : -1
            const tween = gsap.fromTo(el, { xPercent: dir < 0 ? 0 : -50 }, { xPercent: dir < 0 ? -50 : 0, duration: 40, ease: 'none', repeat: -1 })
            ScrollTrigger.create({
              trigger: el,
              start: 'top bottom',
              end: 'bottom top',
              onUpdate: (self) => {
                const boost = 1 + Math.min(Math.abs(self.getVelocity()) / 300, 6)
                gsap.to(tween, { timeScale: boost, duration: 0.2, overwrite: true, onComplete: () => void gsap.to(tween, { timeScale: 1, duration: 1.2 }) })
              },
            })
          })

          if (desktop) {
            q('[data-hscroll]').forEach((el) => {
              const track = el.querySelector<HTMLElement>('[data-hscroll-track]')
              if (!track) return
              const distance = () => track.scrollWidth - window.innerWidth
              gsap.to(track, {
                x: () => -distance(),
                ease: 'none',
                scrollTrigger: { trigger: el, start: 'top top', end: () => `+=${distance()}`, pin: true, scrub: 0.8, invalidateOnRefresh: true, anticipatePin: 1 },
              })
            })
          }

          q('[data-count]').forEach((el) => {
            const to = Number(el.dataset.count)
            const obj = { v: 0 }
            gsap.to(obj, { v: to, duration: 2, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 90%', once: true }, onUpdate: () => void (el.textContent = String(Math.round(obj.v)).padStart(2, '0')) })
          })

          const dial = document.querySelector('.bg-dial-scroll')
          if (dial) gsap.to(dial, { rotate: 180, ease: 'none', scrollTrigger: { trigger: document.body, start: 'top top', end: 'bottom bottom', scrub: 1.5 } })
        },
      )
      document.fonts?.ready.then(() => ScrollTrigger.refresh())
    })

    return () => {
      cancelled = true
      mm.revert()
    }
  }, [pathname])

  return null
}
