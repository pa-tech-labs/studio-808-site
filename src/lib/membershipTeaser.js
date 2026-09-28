// The short membership teaser on /dj-studio and /main-production-studio: the
// pure part, so the node:test suite can check which track and which fallback
// it picks without rendering React. Everything comes from the same sources as
// /membership: copy and perks from the membershipPage singleton (or its
// bundled copy), plans from Cue (or the singleton's tiers).

import { membershipPageContent } from './membershipPageContent.js'
import { formatPounds, foundingPriceFor, joinUrl, plansForTrack } from './membershipPlans.js'

const PERK_COUNT = 3

/** The first sentence of a paragraph, for a one-line intro. */
export function firstSentence(text) {
  const t = String(text ?? '').trim()
  const m = t.match(/^(.+?[.!?])(\s|$)/)
  return m ? m[1] : t
}

/**
 * The teaser's price line. DJ plans show the founding price while it is on
 * offer (FoundingBadge's rule: unknown keeps it, known-full drops it) next to
 * the standard price. Producer founding is recognition only, so producer
 * plans show the standard price. Empty until there are plans.
 */
export function teaserPriceLine(plans, track, founding) {
  const list = plansForTrack(plans, track)
  if (list.length === 0) return ''
  const cheapest = list.reduce((a, b) => (b.monthlyPrice < a.monthlyPrice ? b : a))
  const from = list.length > 1 ? 'From ' : ''
  const standard = `${formatPounds(cheapest.monthlyPrice)}/mo`
  const founder = foundingPriceFor(cheapest, founding)
  return founder != null
    ? `${from}${formatPounds(founder)}/mo founding, then ${standard}`
    : `${from}${standard}`
}

/**
 * Three perks for the track. The track's cards are used when they are perks
 * (the DJ cards carry icons); numbered cards are steps (the producer's "How
 * it works"), so the entry plan's "What's included" is used instead.
 */
export function teaserPerks(copy, plans, track) {
  const cards = (copy?.perks ?? []).filter(p => p?.title)
  if (cards.some(p => p.icon)) {
    return cards.slice(0, PERK_COUNT).map(p => ({ title: p.title, body: p.body ?? '' }))
  }
  const entry = plansForTrack(plans, track)[0]
  return (entry?.included ?? []).slice(0, PERK_COUNT).map(title => ({ title, body: '' }))
}

/**
 * Everything the teaser renders, for one track. `content` is the singleton
 * (null or undefined reads as the bundled copy); `plans` may be empty while
 * Cue is loading. An unknown track reads as DJ, like /membership's ?type=.
 */
export function teaserModel({ track, content, plans, founding }) {
  const t = track === 'producer' ? 'producer' : 'dj'
  const c = content ?? membershipPageContent
  const copy = c[t] ?? membershipPageContent[t]
  const remaining = t === 'dj' ? founding?.dj ?? null : founding?.producer ?? null
  return {
    track: t,
    eyebrow: c.eyebrow || membershipPageContent.eyebrow,
    heading: copy.heading || membershipPageContent[t].heading,
    intro: firstSentence(copy.intro || membershipPageContent[t].intro),
    priceLine: teaserPriceLine(plans, t, founding),
    creditLine: copy.creditLine || '',
    perks: teaserPerks(copy, plans, t),
    founding: {
      show: remaining !== 0 && Boolean(copy.foundingBadgeLabel),
      label: copy.foundingBadgeLabel || '',
      remaining,
      cap: t === 'dj' ? founding?.djCap ?? 15 : founding?.producerCap ?? 3,
    },
    seeHref: `/membership?type=${t}`,
    joinHref: joinUrl(t),
    joinLabel: copy.cta?.buttonLabel || (t === 'dj' ? 'Join the DJ Membership' : 'Join the Producer Membership'),
  }
}
