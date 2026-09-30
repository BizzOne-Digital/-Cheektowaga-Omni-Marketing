import { StickyCta } from '@/components/hero'
import { CollectionRail, Featured, Hero, ImageStory, Intro, Marquee, OfferFeature, Values } from '@/components/sections'

export default function Home() {
  return (
    <>
      <Hero />
      <Marquee />
      <Featured />
      <CollectionRail />
      <Intro />
      <ImageStory />
      <Values />
      <OfferFeature />
      <StickyCta />
    </>
  )
}
