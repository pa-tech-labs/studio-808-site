import { useEffect, useState } from 'react'
import { getAudioPage } from '../../lib/sanity'
import type { AudioPageData } from '../../lib/audioPage'

// One fetch shared by every /audio render. A failed read counts as "no page",
// which keeps /audio switched off: it is off by default until it is ready.
let audioPage: Promise<AudioPageData | null> | null = null

function load(): Promise<AudioPageData | null> {
  // Dev only: /audio?fixture shows placeholder content, for working on the
  // page before Sanity has any. Vite drops this branch from production builds.
  if (import.meta.env.DEV && new URLSearchParams(window.location.search).has('fixture')) {
    return import('./devFixture').then(m => m.AUDIO_FIXTURE)
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
