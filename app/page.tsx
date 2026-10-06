import { StickyCta } from '@/components/hero'
import { FeatureRail, Featured, Hero, ImageStory, Intro, Marquee, OfferFeature, Values } from '@/components/sections'

export default function Home() {
  return (
    <>
      <Hero />
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
