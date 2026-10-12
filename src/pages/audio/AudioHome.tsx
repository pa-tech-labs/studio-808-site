// The /audio page. Sections run in this order; the placeholder slots render
// nothing until later prompts build them, so they can be filled in place.

import { useOutletContext } from 'react-router-dom'
import type { AudioPageData } from '../../lib/audioPage'
import Hero from './sections/Hero'
import CreditsWall from './sections/CreditsWall'
import Showreel from './sections/Showreel'
import CaseStudy from './sections/CaseStudy'
import Room from './sections/Room'
import Engineer from './sections/Engineer'
import Services from './sections/Services'
import Rates from './sections/Rates'
import Process from './sections/Process'
import FAQ from './sections/FAQ'
import Enquiry from './sections/Enquiry'

export default function AudioHome() {
  const data = useOutletContext<AudioPageData>()
  return (
    <>
      <Hero hero={data.page?.hero} />
      <CreditsWall credits={data.credits ?? []} />
      <Showreel data={data} />
      <CaseStudy data={data} />
      <Room data={data} />
      <Engineer data={data} />
      <Services data={data} />
      <Rates data={data} />
      <Process data={data} />
      <FAQ data={data} />
      <Enquiry data={data} />
    </>
  )
}
