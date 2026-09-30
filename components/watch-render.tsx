'use client'

import { useEffect, useId, useState } from 'react'
import type { Colorway } from '@/lib/products'
import { usTimeParts } from '@/lib/site'

// PLACEHOLDER product render — drawn in SVG until real product photography is supplied.
// Hands show the live US Eastern time.
export function WatchRender({ colorway, className, label }: { colorway: Colorway; className?: string; label: string }) {
  const id = useId().replace(/:/g, '')
  const [live, setLive] = useState<null | { h: number; m: number; s: number }>(null)

  useEffect(() => {
    const d = new Date()
    const t = usTimeParts(d)
    const s = t.s + d.getMilliseconds() / 1000
    const m = t.m * 60 + s
    const h = (t.h % 12) * 3600 + m
    setLive({ h, m, s })
  }, [])

  const hand = (dur: number, elapsed: number | undefined, still: number) =>
    live
      ? ({ '--d': `${dur}s`, '--delay': `-${elapsed}s` } as React.CSSProperties)
      : ({ '--a': `${still}deg` } as React.CSSProperties)

  const { case: c, band, accent, glow } = colorway
  const ticks = Array.from({ length: 60 }, (_, i) => i)

  return (
    <svg viewBox="0 0 300 440" className={className} role="img" aria-label={label}>
      <defs>
        <linearGradient id={`case${id}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={c[1]} />
          <stop offset="0.45" stopColor={c[0]} />
          <stop offset="1" stopColor={c[2]} />
        </linearGradient>
        <linearGradient id={`band${id}`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#000" stopOpacity="0.55" />
          <stop offset="0.2" stopColor="#000" stopOpacity="0" />
          <stop offset="0.8" stopColor="#000" stopOpacity="0" />
          <stop offset="1" stopColor="#000" stopOpacity="0.6" />
        </linearGradient>
        <radialGradient id={`screen${id}`} cx="0.5" cy="0.48" r="0.65">
          <stop offset="0" stopColor={glow} stopOpacity="0.2" />
          <stop offset="0.55" stopColor="#060606" />
          <stop offset="1" stopColor="#020202" />
        </radialGradient>
        <linearGradient id={`glass${id}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity="0.14" />
          <stop offset="0.4" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
        <filter id={`glow${id}`} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="3.5" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* bands */}
      <rect x="94" y="-20" width="112" height="140" rx="20" fill={band} />
      <rect x="94" y="320" width="112" height="140" rx="20" fill={band} />
      <rect x="94" y="-20" width="112" height="140" rx="20" fill={`url(#band${id})`} />
      <rect x="94" y="320" width="112" height="140" rx="20" fill={`url(#band${id})`} />
      {[350, 370, 390, 410].map((y) => (
        <rect key={y} x="143" y={y} width="14" height="6" rx="3" fill="#000" opacity="0.45" />
      ))}

      {/* case */}
      <rect x="58" y="88" width="184" height="244" rx="54" fill={`url(#case${id})`} />
      <rect x="58.5" y="88.5" width="183" height="243" rx="53.5" fill="none" stroke="#fff" strokeOpacity="0.14" />
      <rect x="240" y="150" width="12" height="42" rx="5" fill={`url(#case${id})`} />
      {[156, 162, 168, 174, 180, 186].map((y) => (
        <line key={y} x1="243" x2="251" y1={y} y2={y} stroke="#000" strokeOpacity="0.35" />
      ))}
      <rect x="241" y="208" width="6" height="36" rx="3" fill={c[2]} />

      {/* screen */}
      <rect x="68" y="98" width="164" height="224" rx="46" fill="#030303" />
      <rect x="75" y="105" width="150" height="210" rx="40" fill={`url(#screen${id})`} />

      {/* dial */}
      <g filter={`url(#glow${id})`}>
        {ticks.map((i) => {
          const major = i % 5 === 0
          return (
            <line
              key={i}
              x1="150"
              x2="150"
              y1={major ? 146 : 150}
              y2="156"
              stroke={major ? accent : '#f5f2ed'}
              strokeOpacity={major ? 1 : 0.28}
              strokeWidth={major ? 3 : 1}
              strokeLinecap="round"
              transform={`rotate(${i * 6} 150 210)`}
            />
          )
        })}
        <circle cx="150" cy="210" r="46" fill="none" stroke={accent} strokeOpacity="0.35" strokeDasharray="36 12" />
      </g>
      <g>

        <g className={live ? 'hand live' : 'hand'} style={hand(43200, live?.h, 305)}>
          <rect x="145.5" y="174" width="9" height="44" rx="4.5" fill={accent} opacity="0.25" />
          <rect x="147.5" y="176" width="5" height="40" rx="2.5" fill={accent} />
        </g>
        <g className={live ? 'hand live' : 'hand'} style={hand(3600, live?.m, 60)}>
          <rect x="146.5" y="158" width="7" height="60" rx="3.5" fill={accent} opacity="0.25" />
          <rect x="148.2" y="160" width="3.6" height="56" rx="1.8" fill={accent} />
        </g>
        <g className={live ? 'hand live' : 'hand'} style={hand(60, live?.s, 180)}>
          <rect x="149.4" y="150" width="1.2" height="76" rx="0.6" fill="#f5f2ed" />
        </g>
        <circle cx="150" cy="210" r="4.5" fill="#f5f2ed" />
        <circle cx="150" cy="210" r="1.8" fill={accent} />
      </g>

      {/* glass reflection */}
      <rect x="75" y="105" width="150" height="210" rx="40" fill={`url(#glass${id})`} />
    </svg>
  )
}
