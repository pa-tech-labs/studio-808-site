import { useEffect, useState } from 'react'
import { getMembershipPage } from '../lib/sanity'
import { membershipPageContent, type MembershipPageContent } from '../lib/membershipPageContent.js'
import { fetchCueMembership, mapSanityTiers, mergePlans, type MembershipPlan, type MembershipRoom } from '../lib/membershipPlans.js'

// Membership copy and plans, shared by /membership and the studio pages'
// membership teasers. One Sanity read and one Cue read per page load.
//
// Copy: the Sanity "membershipPage" singleton, or the bundled copy when it
// is missing or slow. The Sanity client retries failed requests with
// backoff, so an outage would hold a page blank for a long time: past the
// cap the bundled copy is used and a late answer is ignored.
//
// Plans: Cue's live tiers merged with the singleton's tiers, falling back to
// them (lib/membershipPlans.js). `rooms` is the tier rooms' public rate and
// hours from the same Cue response, [] when Cue leaves them out.

export type MembershipPlans = { plans: MembershipPlan[]; source: 'cue' | 'sanity'; rooms: MembershipRoom[] }

const SANITY_WAIT_MS = 3000

let contentPromise: Promise<MembershipPageContent> | null = null
let plansPromise: Promise<MembershipPlans> | null = null
let settledContent: MembershipPageContent | undefined
let settledPlans: MembershipPlans | undefined

function load() {
  if (!contentPromise) {
    const cap = new Promise<null>(resolve => setTimeout(() => resolve(null), SANITY_WAIT_MS))
    const doc = Promise.race([getMembershipPage().catch(() => null), cap])
    contentPromise = doc.then(d => (settledContent = d ?? membershipPageContent))
    plansPromise = Promise.all([doc, fetchCueMembership()]).then(([d, cue]) => {
      const stored = d?.tiers?.length ? d.tiers : membershipPageContent.tiers
      const merged = mergePlans(cue.plans, mapSanityTiers(stored), cue.rooms)
      if (import.meta.env.DEV && merged.source === 'sanity') console.info('[membership] Cue tiers unavailable, showing Sanity tiers')
      return (settledPlans = { ...merged, rooms: cue.rooms })
    })
  }
  return { contentPromise, plansPromise: plansPromise! }
}

/** Copy (undefined while loading) and plans (undefined until Cue answers or gives up). */
export function useMembershipData(): { content: MembershipPageContent | undefined; plans: MembershipPlans | undefined } {
  const [content, setContent] = useState(settledContent)
  const [plans, setPlans] = useState(settledPlans)

  useEffect(() => {
    if (settledContent && settledPlans) return
    let live = true
    const { contentPromise, plansPromise } = load()
    contentPromise.then(c => { if (live) setContent(c) })
    plansPromise.then(p => { if (live) setPlans(p) })
    return () => { live = false }
  }, [])

  return { content, plans }
}
