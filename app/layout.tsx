import type { Metadata, Viewport } from 'next'
import { Instrument_Serif, Manrope } from 'next/font/google'
import { BgStage } from '@/components/bg-stage'
import { Cursor } from '@/components/cursor'
import { Footer } from '@/components/footer'
import { Loader } from '@/components/loader'
import { Motion } from '@/components/motion'
import { Nav } from '@/components/nav'
import { OrderProvider } from '@/components/order'
import { site } from '@/lib/site'
import './globals.css'

const serif = Instrument_Serif({ subsets: ['latin'], weight: '400', style: ['normal', 'italic'], variable: '--font-serif', display: 'swap' })
const sans = Manrope({ subsets: ['latin'], variable: '--font-manrope', display: 'swap' })

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: site.title, template: `%s | ${site.name}` },
  description: site.description,
  alternates: { canonical: '/' },
  openGraph: { type: 'website', siteName: site.name, title: site.title, description: site.description, url: '/', images: [{ url: site.heroPoster, alt: 'Smart watch with a glowing orange face on a dark plinth' }] },
  twitter: { card: 'summary_large_image', title: site.title, description: site.description, images: [site.heroPoster] },
  robots: { index: true, follow: true },
}

export const viewport: Viewport = { colorScheme: 'dark', themeColor: '#080808' }

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    { '@type': 'Organization', name: site.name, url: site.url, email: site.contact.email, telephone: site.contact.tel, description: site.about, logo: `${site.url}${site.logo.original}`, sameAs: [site.social.href] },
    { '@type': 'WebSite', name: site.name, url: site.url },
  ],
}

// Runs before paint: enables motion initial states and skips the splash after the first visit.
const boot = `(function(d){try{if(!matchMedia('(prefers-reduced-motion: reduce)').matches)d.classList.add('motion-ok');if(sessionStorage.getItem('asw-intro'))d.classList.add('seen')}catch(e){}})(document.documentElement)`

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${serif.variable} ${sans.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: boot }} />
      </head>
      {/* Browser extensions often inject attributes into <body>; don't flag those as mismatches. */}
      <body suppressHydrationWarning>
        <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[200] focus:bg-ember focus:px-4 focus:py-3 focus:text-ink">
          Skip to content
        </a>
        <Loader />
        <BgStage />
        <OrderProvider>
          <Nav />
          <main id="main">{children}</main>
          <Footer />
        </OrderProvider>
        <Motion />
        <Cursor />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }} />
      </body>
    </html>
  )
}
