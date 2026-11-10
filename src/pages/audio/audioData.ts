// The /audio page data: one fetch shared by every /audio render. Kept out of
// the lazy AudioRoute chunk so App.tsx can start the Sanity query while that
// chunk is still downloading (the query and the chunk load in parallel, which
// brings the first paint of /audio forward). Tiny: getAudioPage is already in
// the main bundle.

import { getAudioPage } from '../../lib/sanity'
import type { AudioPageData } from '../../lib/audioPage'

// A failed read counts as "no page", which keeps /audio switched off: it is
// off by default until it is ready.
let audioPage: Promise<AudioPageData | null> | null = null

export function loadAudioPage(): Promise<AudioPageData | null> {
  // Dev only: /audio?fixture shows placeholder content, for working on the
  // page before Sanity has any; &logos=N keeps only the first N logos, and
  // &testimonials=N shows N testimonials (placeholders after the first; 0
  // hides the section). Vite drops this branch from production builds.
  const params = new URLSearchParams(window.location.search)
  if (import.meta.env.DEV && params.has('fixture')) {
    return import('./devFixture').then(m => {
      let data: AudioPageData = m.AUDIO_FIXTURE
      const n = Number(params.get('logos'))
      if (params.has('logos') && Number.isFinite(n)) {
        let kept = 0
        data = { ...data, credits: data.credits.filter(c => !c.logo || kept++ < n) }
      }
      const t = Number(params.get('testimonials'))
      if (params.has('testimonials') && Number.isFinite(t)) {
        const all = [...(data.testimonials ?? []), ...m.TESTIMONIAL_EXTRAS] as NonNullable<AudioPageData['testimonials']>
        let kept = 0
        data = { ...data, testimonials: all.filter(x => x.cleared !== true || kept++ < t) }
      }
      return data
    })
  }
  audioPage ??= getAudioPage().catch(() => null)
  return audioPage
}
