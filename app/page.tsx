import { StickyCta } from '@/components/hero'
import { FeatureRail, Featured, Hero, ImageStory, Intro, Marquee, PriceCompare, PromoBanner, Values } from '@/components/sections'
import { getBanners, getContent, getFeatured } from '@/lib/catalog'

export default async function Home() {
  const [product, content, banners] = await Promise.all([getFeatured(), getContent(), getBanners()])
  return (
    <>
      <Hero product={product} content={content} />
      <PromoBanner product={product} banners={banners} />
      <Marquee words={content.marqueeWords} />
      <Featured product={product} />
      <FeatureRail product={product} />
      <Intro />
      <ImageStory />
      <Values />
      <PriceCompare product={product} />
      <StickyCta />
    </>
  )
}
