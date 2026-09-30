'use client'

import { useEffect, useRef } from 'react'
import gsap from 'gsap'

// Desktop-only cursor: grows over links/buttons, shows a label over [data-cursor],
// and pulls [data-magnetic] elements toward the pointer.
export function Cursor() {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!matchMedia('(pointer: fine) and (prefers-reduced-motion: no-preference)').matches) return
    const el = ref.current!
    const ring = el.querySelector<HTMLElement>('.cursor-ring')!
    const dot = el.querySelector<HTMLElement>('.cursor-dot')!
    const label = ring.querySelector('span')!
    const rx = gsap.quickTo(ring, 'x', { duration: 0.5, ease: 'power3' })
    const ry = gsap.quickTo(ring, 'y', { duration: 0.5, ease: 'power3' })
    let magnet: HTMLElement | null = null

    const move = (e: PointerEvent) => {
      rx(e.clientX)
      ry(e.clientY)
      gsap.set(dot, { x: e.clientX, y: e.clientY })
      if (magnet) {
        const r = magnet.getBoundingClientRect()
        gsap.to(magnet, { x: (e.clientX - r.left - r.width / 2) * 0.3, y: (e.clientY - r.top - r.height / 2) * 0.35, duration: 0.6, ease: 'power3' })
      }
    }
    const over = (e: PointerEvent) => {
      const t = e.target as HTMLElement
      const labelled = t.closest<HTMLElement>('[data-cursor]')
      const interactive = t.closest('a, button, input, textarea, select, label')
      const m = t.closest<HTMLElement>('[data-magnetic]')
      if (magnet && magnet !== m) gsap.to(magnet, { x: 0, y: 0, duration: 0.8, ease: 'elastic.out(1, 0.4)' })
      magnet = m
      label.textContent = labelled?.dataset.cursor ?? ''
      el.dataset.state = labelled ? 'label' : interactive ? 'hover' : ''
    }
    addEventListener('pointermove', move)
    addEventListener('pointerover', over)
    return () => {
      removeEventListener('pointermove', move)
      removeEventListener('pointerover', over)
    }
  }, [])

  return (
    <div ref={ref} className="cursor" aria-hidden="true">
      <div className="cursor-ring fixed left-0 top-0">
        <span />
      </div>
      <div className="cursor-dot" />
    </div>
  )
}
