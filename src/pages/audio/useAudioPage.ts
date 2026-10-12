import { useEffect, useState } from 'react'
import type { AudioPageData } from '../../lib/audioPage'
import { loadAudioPage } from './audioData'

/** undefined while loading, then the page data (null when there is none). */
export function useAudioPage(): AudioPageData | null | undefined {
  const [data, setData] = useState<AudioPageData | null | undefined>(undefined)

  useEffect(() => {
    let live = true
    loadAudioPage().then(v => { if (live) setData(v) })
    return () => { live = false }
  }, [])

  return data
}
