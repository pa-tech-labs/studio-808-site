// Run: npm test

import { test } from 'node:test'
import assert from 'node:assert/strict'
import { firstSentence, teaserModel, teaserPerks, teaserPriceLine } from './membershipTeaser.js'
import { mapCueTiers, mapSanityTiers, mergePlans, parseFoundingStatus } from './membershipPlans.js'
import { membershipPageContent } from './membershipPageContent.js'

const CUE_BODY = {
  tiers: [
    { id: 'creators', name: '808 Creators', monthly_price: 0, membership_type: 'custom', perks: [] },
    { id: 'dj', name: '808 DJ', monthly_price: 25, commitment_months: 0, membership_type: 'dj', perks: [] },
    { id: 'resident', name: '808 Resident', monthly_price: 50, commitment_months: 0, membership_type: 'dj', perks: [] },
    { id: 'p8-3', name: 'Producer Membership - 8hrs/mo (3 Month)', monthly_price: 160, hours_per_month: 8, commitment_months: 3, membership_type: 'producer', perks: [] },
    { id: 'p8-6', name: 'Producer Membership - 8hrs/mo (6 Month)', monthly_price: 100, hours_per_month: 8, commitment_months: 6, membership_type: 'producer', perks: [] },
  ],
}
const STORED = mapSanityTiers(membershipPageContent.tiers)
const CUE_PLANS = mergePlans(mapCueTiers(CUE_BODY), STORED).plans
const SANITY_PLANS = mergePlans([], STORED).plans
const LIVE = parseFoundingStatus({ cap: 15, remaining: 8, prices: { '808 DJ': 2000, '808 Resident': 4500 }, producer: { cap: 3, remaining: 2 } })
const UNKNOWN = parseFoundingStatus(null)
const FULL = parseFoundingStatus({ cap: 15, remaining: 0, producer: { cap: 3, remaining: 0 } })

// ── Track selection ──────────────────────────────────────────────────────────

test('the DJ teaser takes the DJ copy, perks, plans and join link', () => {
  const m = teaserModel({ track: 'dj', content: membershipPageContent, plans: CUE_PLANS, founding: LIVE })
  assert.equal(m.track, 'dj')
  assert.equal(m.heading, membershipPageContent.dj.heading)
  assert.deepEqual(m.perks.map(p => p.title), ['Play at 808 events', 'Get featured', 'Member-only discounts'])
  assert.equal(m.priceLine, 'From £20/mo founding, then £25/mo')
  assert.equal(m.creditLine, membershipPageContent.dj.creditLine)
  assert.equal(m.joinHref, 'https://book.studio-808.com/membership?type=dj')
  assert.equal(m.seeHref, '/membership?type=dj')
  assert.deepEqual(m.founding, { show: true, label: 'Founding offer - first 15 members only', remaining: 8, cap: 15 })
})

test('the producer teaser takes the producer copy, plan perks, plans and join link', () => {
  const m = teaserModel({ track: 'producer', content: membershipPageContent, plans: CUE_PLANS, founding: LIVE })
  assert.equal(m.track, 'producer')
  assert.equal(m.heading, membershipPageContent.producer.heading)
  assert.equal(m.intro, 'Stop paying day rates.')
  assert.equal(m.priceLine, 'From £100/mo', 'producer founding is never a discount')
  assert.equal(m.creditLine, '')
  assert.equal(m.perks.length, 3)
  assert.equal(m.perks[0].title, '8 hours a month in Studio 4 - the pro room', 'steps are not perks; the entry plan\'s included list is used')
  assert.equal(m.joinHref, 'https://book.studio-808.com/membership?type=producer')
  assert.equal(m.seeHref, '/membership?type=producer')
  assert.deepEqual(m.founding, { show: true, label: 'Founding producers - first 3 only', remaining: 2, cap: 3 })
})

test('an unknown track reads as DJ', () => {
  assert.equal(teaserModel({ track: 'band', content: null, plans: [], founding: UNKNOWN }).track, 'dj')
})

test('never more than three perks', () => {
  const copy = { perks: [1, 2, 3, 4, 5].map(n => ({ title: `Perk ${n}`, icon: 'tag' })) }
  assert.equal(teaserPerks(copy, [], 'dj').length, 3)
})

// ── Fallbacks ────────────────────────────────────────────────────────────────

test('missing copy falls back to the bundled copy', () => {
  const m = teaserModel({ track: 'dj', content: null, plans: SANITY_PLANS, founding: UNKNOWN })
  assert.equal(m.heading, membershipPageContent.dj.heading)
  assert.equal(m.eyebrow, membershipPageContent.eyebrow)
  assert.equal(m.perks.length, 3)
})

test('a singleton missing one track falls back to the bundled copy for that track', () => {
  const content = { ...membershipPageContent, producer: null, eyebrow: '' }
  const m = teaserModel({ track: 'producer', content, plans: SANITY_PLANS, founding: UNKNOWN })
  assert.equal(m.heading, membershipPageContent.producer.heading)
  assert.equal(m.eyebrow, membershipPageContent.eyebrow)
})

test('with Cue down, the price line comes from the Sanity tiers', () => {
  assert.equal(teaserModel({ track: 'dj', content: null, plans: SANITY_PLANS, founding: UNKNOWN }).priceLine, 'From £20/mo founding, then £25/mo')
  assert.equal(teaserModel({ track: 'producer', content: null, plans: SANITY_PLANS, founding: UNKNOWN }).priceLine, 'From £100/mo')
})

test('the price line is empty while plans load, and the rest still renders', () => {
  const m = teaserModel({ track: 'dj', content: membershipPageContent, plans: undefined, founding: UNKNOWN })
  assert.equal(m.priceLine, '')
  assert.ok(m.heading && m.perks.length === 3)
})

test('once founding places are gone, the badge and founding price go', () => {
  const dj = teaserModel({ track: 'dj', content: null, plans: CUE_PLANS, founding: FULL })
  assert.equal(dj.founding.show, false)
  assert.equal(dj.priceLine, 'From £25/mo')
  assert.equal(teaserModel({ track: 'producer', content: null, plans: CUE_PLANS, founding: FULL }).founding.show, false)
})

test('a single plan drops "From"', () => {
  const one = CUE_PLANS.filter(p => p.name === '808 DJ')
  assert.equal(teaserPriceLine(one, 'dj', FULL), '£25/mo')
})

// ── Copy ─────────────────────────────────────────────────────────────────────

test('firstSentence', () => {
  assert.equal(firstSentence('One line. Two lines.'), 'One line.')
  assert.equal(firstSentence('No full stop'), 'No full stop')
  assert.equal(firstSentence('£25.00 credit, member rates. Then more.'), '£25.00 credit, member rates.')
  assert.equal(firstSentence(null), '')
})

test('the teaser copy makes none of the retired claims', () => {
  const retired = /resets? on the 1st|on the 1st of|bonus daytime|daytime session|undiscovered|casting/i
  for (const track of ['dj', 'producer']) {
    const m = teaserModel({ track, content: membershipPageContent, plans: CUE_PLANS, founding: LIVE })
    assert.ok(!retired.test(JSON.stringify(m)), track)
    assert.ok(!JSON.stringify(m).includes('—'), `${track}: em dash`)
  }
  assert.ok(!retired.test(JSON.stringify(membershipPageContent)))
})
