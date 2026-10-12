import { useEffect, useState } from 'react'
import { getAudioPage } from '../../lib/sanity'
import type { AudioPageData } from '../../lib/audioPage'

// One fetch shared by every /audio render. A failed read counts as "no page",
// which keeps /audio switched off: it is off by default until it is ready.
let audioPage: Promise<AudioPageData | null> | null = null

function load(): Promise<AudioPageData | null> {
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

/** undefined while loading, then the page data (null when there is none). */
export function useAudioPage(): AudioPageData | null | undefined {
  const [data, setData] = useState<AudioPageData | null | undefined>(undefined)

  useEffect(() => {
    let live = true
    load().then(v => { if (live) setData(v) })
    return () => { live = false }
  }, [])

  return data
}
