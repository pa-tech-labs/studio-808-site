// The /audio page. Sections run in this order. Each renders nothing when its
// content is empty (or, for the engineers, switched off in Sanity), so the
// page closes up around it. The build-time prerender renders this same tree.

import { useOutletContext } from 'react-router-dom'
import type { AudioPageData } from '../../lib/audioPage'
import AudioHead from './AudioHead'
import Hero from './sections/Hero'
import { RecordedFor, VoicesRecorded } from './sections/CreditsWall'
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
      <AudioHead data={data} route="home" />
      <Hero hero={data.page?.hero} size={data.page?.heroImageSize} />
      <RecordedFor credits={data.credits ?? []} />
      <Process data={data} />
      <VoicesRecorded credits={data.credits ?? []} />
      <Showreel data={data} />
      <CaseStudy data={data} />
      <Room data={data} />
      <Engineer data={data} />
      <Services data={data} />
      <Rates data={data} />
      <FAQ data={data} />
      <Enquiry data={data} />
    </>
  )
}
