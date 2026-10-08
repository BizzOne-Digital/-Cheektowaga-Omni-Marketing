import { StickyCta } from '@/components/hero'
import { FeatureRail, Featured, Hero, ImageStory, Intro, Marquee, OfferFeature, PromoBanner, Values } from '@/components/sections'

export default function Home() {
  return (
    <>
      <Hero />
      <PromoBanner />
      <Marquee />
      <Featured />
      <FeatureRail />
      <Intro />
      <ImageStory />
      <Values />
      <OfferFeature />
      <StickyCta />
    </>
  )
}
