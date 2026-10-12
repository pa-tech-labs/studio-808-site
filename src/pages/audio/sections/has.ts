// Does a section have anything to show? Each section renders nothing when
// its data is empty, and the header only links to sections that render, so
// both use these.

import type { AudioPage, AudioPageData } from '../../../lib/audioPage'
import { audioEngineers } from '../../../lib/audioSeo.js'
import { groupClips } from '../../../lib/showreel.js'

const text = (s: string | null | undefined) => Boolean(s && s.trim())
const some = <T,>(a: T[] | null | undefined) => Array.isArray(a) && a.length > 0

export const hasShowreel = (d: AudioPageData) => groupClips(d.clips).length > 0

export const hasCaseStudy = (p: AudioPage | null | undefined) => {
  const c = p?.caseStudy
  return Boolean(c?.enabled && c?.cleared && (text(c.heading) || some(c.body) || text(c.quote)))
}

export const hasRoom = (p: AudioPage | null | undefined) => {
  const r = p?.room
  return Boolean(r && (text(r.heading) || text(r.body) || some(r.gallery) || some(r.gearList) || some(r.specs)))
}

/** The engineers to show: the list, else the old single engineer. */
export const engineersOf = (p: AudioPage | null | undefined) => audioEngineers(p)

export const hasEngineer = (p: AudioPage | null | undefined) => engineersOf(p).length > 0

export const hasServices = (p: AudioPage | null | undefined) => some(p?.services?.filter(s => text(s.title)))

export const hasRates = (p: AudioPage | null | undefined) => some(p?.rates?.tiers?.filter(t => text(t.name)))

export const hasProcess = (p: AudioPage | null | undefined) => some(p?.process?.filter(s => text(s.title)))

export const hasFaqs = (p: AudioPage | null | undefined) => some(p?.faqs?.filter(f => text(f.question) && text(f.answer)))

export const hasEnquiry = (p: AudioPage | null | undefined) => {
  const e = p?.enquiry
  return Boolean(e && (text(e.heading) || text(e.body) || some(e.projectTypes)))
}

export const hasTerms = (p: AudioPage | null | undefined) => some(p?.terms)
