import { useEffect, useState } from 'react'
import { isPageEnabled } from './sanity'

// One fetch shared by the nav and the /residency route. A failed read keeps
// the page on, which is how the site behaved before the flag existed.
let residencyEnabled: Promise<boolean> | null = null

function loadResidencyEnabled(): Promise<boolean> {
  residencyEnabled ??= isPageEnabled('residency').catch(() => true)
  return residencyEnabled
}

/** null while loading, then whether the Residency page is switched on in Sanity. */
export function useResidencyEnabled(): boolean | null {
  const [enabled, setEnabled] = useState<boolean | null>(null)

  useEffect(() => {
    let live = true
    loadResidencyEnabled().then(v => { if (live) setEnabled(v) })
    return () => { live = false }
  }, [])

  return enabled
}
