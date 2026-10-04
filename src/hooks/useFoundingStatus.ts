// Live founding places from Cue's founding-status endpoint on its API host
// (CORS-permitted for this origin). If the fetch fails the counts stay
// unknown (null): the founding line keeps its note and drops the count,
// never showing a stale or made-up number (lib/membershipPlans.js,
// foundingSummary). Everything founding disappears at 0 remaining.

import { useEffect, useState } from 'react'
import { foundingStatusUrl, parseFoundingStatus, type FoundingInfo } from '../lib/membershipPlans.js'

// dj / producer: remaining places, null = unknown (fetch failed). Also the
// caps and Cue's DJ founding prices by tier name, in pounds.
export type FoundingStatus = FoundingInfo

const UNKNOWN: FoundingStatus = parseFoundingStatus(null)

export function useFoundingStatus(): FoundingStatus {
  const [status, setStatus] = useState<FoundingStatus>(UNKNOWN)
  useEffect(() => {
    let cancelled = false
    fetch(foundingStatusUrl())
      .then(r => (r.ok ? r.json() : null))
      .then(b => {
        if (cancelled || !b) return
        setStatus(parseFoundingStatus(b))
      })
      .catch(() => {})
    return () => { cancelled = true }
  }, [])
  return status
}
