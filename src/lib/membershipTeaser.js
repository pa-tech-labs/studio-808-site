// The short membership teaser on /dj-studio and /main-production-studio: the
// pure part, so the node:test suite can check which track and which fallback
// it picks without rendering React. Everything comes from the same sources as
// /membership: copy and perks from the membershipPage singleton (or its
// bundled copy), plans from Cue (or the singleton's tiers).

import { membershipPageContent } from './membershipPageContent.js'
import { formatPounds, foundingPriceFor, heroPlanKey, joinUrl, plansForTrack } from './membershipPlans.js'
import { fillMinHours } from './roomPricing.js'

const PERK_COUNT = 3

/** The first sentence of a paragraph, for a one-line intro. */
export function firstSentence(text) {
  const t = String(text ?? '').trim()
  const m = t.match(/^(.+?[.!?])(\s|$)/)
  return m ? m[1] : t
}

/**
 * The teaser's price line. DJ plans show the founding price while it is on
 * offer (the founding rule: unknown keeps it, known-full drops it) next to
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
 * Three points for the track, beside the plan card. The track's cards as
 * they are: perks when they carry icons (DJ), or numbered steps (the
 * producer's "How it works"), which the teaser shows as a numbered list. The
 * entry plan's "What's included" is the fallback with no cards; with the
 * plan card now listing it, it is never the first choice.
 */
export function teaserPerks(copy, plans, track) {
  const cards = (copy?.perks ?? []).filter(p => p?.title)
  if (cards.length > 0) return cards.slice(0, PERK_COUNT).map(p => ({ title: p.title, body: p.body ?? '' }))
  const entry = plansForTrack(plans, track)[0]
  return (entry?.included ?? []).slice(0, PERK_COUNT).map(title => ({ title, body: '' }))
}

/** True when the track's cards are steps (no icons), so the teaser numbers them. */
export function teaserPerksAreSteps(copy) {
  const cards = (copy?.perks ?? []).filter(p => p?.title)
  return cards.length > 0 && !cards.some(p => p.icon)
}

/**
 * Everything the teaser renders, for one track. `content` is the singleton
 * (null or undefined reads as the bundled copy); `plans` may be empty while
 * Cue is loading. `minBookingHours` (Cue's) fills {minHours} in the perks. An unknown track reads as DJ, like /membership's ?type=.
 */
export function teaserModel({ track, content, plans, founding, minBookingHours = null }) {
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
    // {minHours} in a perk is Cue's minimum booking length ("2 hours").
    perks: teaserPerks(copy, plans, t).map(p => ({ title: fillMinHours(p.title, minBookingHours), body: fillMinHours(p.body, minBookingHours) })),
    perksAreSteps: teaserPerksAreSteps(copy),
    // The one founding line, as on /membership: the note, then the places left.
    founding: {
      show: remaining !== 0 && Boolean(copy.foundingPriceNote),
      note: copy.foundingPriceNote || '',
      remaining,
      cap: t === 'dj' ? founding?.djCap ?? 15 : founding?.producerCap ?? 3,
    },
    /** The plan the teaser shows as a card: /membership's "Best value" plan. */
    heroKey: heroPlanKey(plans, t),
    bestValueLabel: copy.bestValueLabel || membershipPageContent[t].bestValueLabel,
    compareLabel: copy.compareLabel || membershipPageContent[t].compareLabel,
    creditBackLine: copy.creditBackLine || membershipPageContent[t].creditBackLine || '',
    terms: copy.standardTerms || '',
    foundingTerms: copy.foundingTerms || '',
    planJoinLabel: copy.joinLabel || 'Join Now',
    seeHref: `/membership?type=${t}`,
    joinHref: joinUrl(t),
    joinLabel: copy.cta?.buttonLabel || (t === 'dj' ? 'Join the DJ Membership' : 'Join the Producer Membership'),
  }
}
