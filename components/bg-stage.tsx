// Site-wide animated background: drifting ember light, a giant slowly turning dial
// with a sweeping second hand (rotates further with scroll), editorial column guides, film grain.
export function BgStage() {
  const ticks = Array.from({ length: 120 }, (_, i) => i)
  return (
    <>
      <div className="bg-stage" aria-hidden="true">
        <div className="bg-glow" />
        <div className="bg-glow two" />
        <div className="bg-columns">
          {Array.from({ length: 6 }, (_, i) => <span key={i} />)}
        </div>
        {/* Each layer is its own element so rotation stays on the compositor (no SVG repaint per frame). */}
        <div className="bg-dial">
          <div className="bg-dial-scroll absolute inset-0">
            <div className="spin-slow absolute inset-0">
              <svg viewBox="0 0 1000 1000" className="size-full">
                <circle cx="500" cy="500" r="490" fill="none" stroke="#F5F2ED" strokeOpacity="0.06" />
                <circle cx="500" cy="500" r="360" fill="none" stroke="#F5F2ED" strokeOpacity="0.045" strokeDasharray="2 10" />
                {ticks.map((i) => (
                  <line
                    key={i}
                    x1="500"
                    x2="500"
                    y1={i % 10 === 0 ? 20 : 34}
                    y2="52"
                    stroke={i % 10 === 0 ? '#E06D34' : '#F5F2ED'}
                    strokeOpacity={i % 10 === 0 ? 0.5 : 0.1}
                    strokeWidth={i % 10 === 0 ? 2 : 1}
                    transform={`rotate(${i * 3} 500 500)`}
                  />
                ))}
              </svg>
            </div>
            <div className="sweep-smooth absolute inset-0">
              <svg viewBox="0 0 1000 1000" className="size-full">
                <defs>
                  <linearGradient id="bg-sweep" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0" stopColor="#E06D34" stopOpacity="0" />
                    <stop offset="1" stopColor="#E06D34" stopOpacity="0.16" />
                  </linearGradient>
                </defs>
                <path d="M500 500 L500 80 A420 420 0 0 0 356 105 Z" fill="url(#bg-sweep)" />
                <line x1="500" y1="500" x2="500" y2="70" stroke="#E06D34" strokeOpacity="0.35" />
                <circle cx="500" cy="500" r="4" fill="#E06D34" fillOpacity="0.6" />
              </svg>
            </div>
          </div>
        </div>
      </div>
      <div className="grain" aria-hidden="true" />
      <div className="scroll-progress" aria-hidden="true" />
    </>
  )
}
