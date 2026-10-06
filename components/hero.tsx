'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { site } from '@/lib/site'

// Hero background video (site.heroVideo). No poster frame: the dark stage shows until it plays.
export function HeroVideo() {
  const ref = useRef<HTMLVideoElement>(null)
  const [playing, setPlaying] = useState(false)

  useEffect(() => {
    const v = ref.current
    if (!v) return
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return v.pause()
    // Autoplay can start before hydration, so the first 'playing' event may already have fired.
    if (!v.paused) setPlaying(true)
    else v.play().then(() => setPlaying(true)).catch(() => {})
  }, [])

  return (
    <video
      ref={ref}
      className="hero-video absolute inset-0 size-full object-cover"
      src={site.heroVideo}
      muted
      loop
      playsInline
      autoPlay
      preload="metadata"
      aria-hidden="true"
      data-playing={playing || undefined}
      onPlaying={() => setPlaying(true)}
    />
  )
}

// Muted looping background video. React doesn't render the muted attribute in SSR HTML,
// so playback is started from the client once mounted.
export function LoopVideo({ className = '' }: { className?: string }) {
  const ref = useRef<HTMLVideoElement>(null)
  useEffect(() => {
    const v = ref.current
    if (!v || matchMedia('(prefers-reduced-motion: reduce)').matches) return
    v.muted = true
    v.play().catch(() => {})
  }, [])
  return <video ref={ref} className={className} src={site.heroVideo} muted loop playsInline preload="metadata" aria-hidden="true" />
}

export function UsTime() {
  const [now, setNow] = useState<string>('--:--:--')
  useEffect(() => {
    const tick = () => setNow(new Date().toLocaleTimeString('en-US', { timeZone: site.timeZone, hour: '2-digit', minute: '2-digit', second: '2-digit' }))
    tick()
    const t = setInterval(tick, 1000)
    return () => clearInterval(t)
  }, [])
  return <time className="tabular-nums text-bone">{now}</time>
}

// Mobile-only purchase bar that appears after the hero and hides over the footer.
export function StickyCta() {
  const [show, setShow] = useState(false)
  useEffect(() => {
    const onScroll = () => {
      const nearEnd = innerHeight + scrollY > document.body.scrollHeight - 900
      setShow(scrollY > innerHeight * 0.8 && !nearEnd)
    }
    addEventListener('scroll', onScroll, { passive: true })
    return () => removeEventListener('scroll', onScroll)
  }, [])
  return (
    <div
      className={`fixed inset-x-0 bottom-0 z-40 border-t border-line bg-ink/85 p-3 backdrop-blur-xl transition-transform duration-700 ease-[var(--ease-expo)] lg:hidden ${show ? 'translate-y-0' : 'translate-y-full'}`}
      style={{ paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom))' }}
      aria-hidden={!show}
      inert={!show}
    >
      <Link href="/watches" className="btn w-full">Shop Watches <span className="btn-arrow" aria-hidden="true">→</span></Link>
    </div>
  )
}
