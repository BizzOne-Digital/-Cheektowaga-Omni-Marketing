import Link from 'next/link'

export const metadata = { title: 'Page not found', robots: { index: false } }

export default function NotFound() {
  const ticks = Array.from({ length: 12 }, (_, i) => i)
  return (
    <section className="wrap relative grid min-h-[100svh] place-content-center gap-10 py-32 text-center" aria-labelledby="nf-title">
      <div className="relative mx-auto grid place-items-center">
        <p aria-hidden="true" className="mega select-none text-[clamp(9rem,34vw,30rem)] leading-none text-transparent [-webkit-text-stroke:1px_rgb(245_242_237/0.18)]">404</p>
        <svg viewBox="0 0 200 200" className="absolute size-[clamp(7rem,20vw,14rem)]" aria-hidden="true">
          <circle cx="100" cy="100" r="92" fill="#080808" stroke="#E06D34" strokeWidth="1.5" />
          {ticks.map((i) => (
            <line key={i} x1="100" x2="100" y1="16" y2={i % 3 ? 24 : 30} stroke="#F5F2ED" strokeOpacity={i % 3 ? 0.35 : 0.9} strokeWidth="2" transform={`rotate(${i * 30} 100 100)`} />
          ))}
          <g className="origin-center animate-[spin_6s_linear_infinite_reverse]">
            <line x1="100" y1="100" x2="100" y2="38" stroke="#E06D34" strokeWidth="4" strokeLinecap="round" />
          </g>
          <g className="origin-center animate-[spin_1.5s_linear_infinite_reverse]">
            <line x1="100" y1="112" x2="100" y2="26" stroke="#F5F2ED" strokeWidth="1.5" strokeLinecap="round" />
          </g>
          <circle cx="100" cy="100" r="5" fill="#E06D34" />
        </svg>
      </div>
      <div>
        <h1 id="nf-title" className="mega text-[clamp(2.2rem,6vw,5.5rem)]">
          Time seems to have <span className="display font-normal normal-case italic tracking-normal text-ember">disappeared.</span>
        </h1>
        <p className="mx-auto mt-6 max-w-md text-ash">The page you&rsquo;re looking for could not be found.</p>
      </div>
      <Link href="/" className="btn mx-auto" data-magnetic>Return Home <span className="btn-arrow" aria-hidden="true">→</span></Link>
    </section>
  )
}
