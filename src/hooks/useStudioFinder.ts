import { useEffect, useState } from 'react'
import { getStudioFinder, type SanityStudioFinder } from '../lib/sanity'

// One fetch per page load, shared by the home section, the nav link and the
// overlay. `undefined` = still loading; `null` = off (missing document,
// enabled=false, or a failed fetch), in which case every entry point renders
// nothing.

let pending: Promise<SanityStudioFinder | null> | null = null
let settled: SanityStudioFinder | null | undefined
let warned = false

function load(): Promise<SanityStudioFinder | null> {
  if (!pending) {
    pending = getStudioFinder()
      .then(doc => {
        const usable = doc && doc.enabled && (doc.questions?.length ?? 0) > 0 && (doc.rules?.length ?? 0) > 0 ? doc : null
        if (!usable && import.meta.env.DEV && !warned) {
          warned = true
          console.info('[studio-finder] hidden:', !doc ? 'no Studio finder document in Sanity' : !doc.enabled ? 'enabled is off' : 'no questions or rules')
        }
        settled = usable
        return usable
      })
      .catch(err => {
        if (import.meta.env.DEV && !warned) {
          warned = true
          console.info('[studio-finder] hidden: fetch failed', err)
        }
        settled = null
        return null
      })
  }
  return pending
}

export function useStudioFinder(): SanityStudioFinder | null | undefined {
  const [finder, setFinder] = useState<SanityStudioFinder | null | undefined>(settled)
  useEffect(() => {
    if (settled !== undefined) return
    let cancelled = false
    load().then(f => { if (!cancelled) setFinder(f) })
    return () => { cancelled = true }
  }, [])
  return finder
}
