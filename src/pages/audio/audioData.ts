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
  // page before Sanity has any; &logos=N keeps only the first N logos.
  // Vite drops this branch from production builds.
  const params = new URLSearchParams(window.location.search)
  if (import.meta.env.DEV && params.has('fixture')) {
    return import('./devFixture').then(m => {
      const n = Number(params.get('logos'))
      if (!params.has('logos') || !Number.isFinite(n)) return m.AUDIO_FIXTURE
      let kept = 0
      const credits = m.AUDIO_FIXTURE.credits.filter(c => !c.logo || kept++ < n)
      return { ...m.AUDIO_FIXTURE, credits }
    })
  }
  audioPage ??= getAudioPage().catch(() => null)
  return audioPage
}
