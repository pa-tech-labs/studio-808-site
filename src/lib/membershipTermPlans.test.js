// Run: npm test
//
// /membership with prepaid term plans and the founding offer closing. The
// Cue responses come from lib/cueFixtures.js, the same ones a dev build
// renders with ?cue-fixture=<name>.

import { test } from 'node:test'
import assert from 'node:assert/strict'
import { cueFixture, fixtureFetch } from './cueFixtures.js'
import {
  djCardModel, fetchCueMembership, formatPounds, foundingPriceFor, heroPlanKey, mapCueRooms, mapCueTiers, mapSanityTiers,
  mergePlans, parseFoundingStatus, planTerms, plansForTrack, priceFromLabel, roomsPhrase, trackShowsFounding,
} from './membershipPlans.js'
import { membershipPageContent } from './membershipPageContent.js'

function load(name) {
  const fx = cueFixture(name)
  return {
    plans: mergePlans(mapCueTiers(fx.tiers), mapSanityTiers(membershipPageContent.tiers), mapCueRooms(fx.tiers)).plans,
    rooms: mapCueRooms(fx.tiers),
    founding: parseFoundingStatus(fx.founding),
    body: fx.tiers,
  }
}
const card = (fx, key) => djCardModel(fx.plans.find(p => p.key === key), fx)

// ── Rolling plus two term plans, founding closed ─────────────────────────────

test('term plans, founding closed: the DJ tab shows rolling first, then the terms by length', () => {
  const fx = load('term-plans')
  assert.deepEqual(plansForTrack(fx.plans, 'dj').map(p => p.key), ['dj-rolling', 'dj-3m', 'dj-6m'])
  assert.deepEqual(planTerms(fx.plans, 'dj'), [0], 'term plans never add a term toggle to the DJ tab')
})

test('term plans, founding closed: the rolling card', () => {
  const m = card(load('term-plans'), 'dj-rolling')
  assert.deepEqual(m.headline, { amount: '£25', unit: '/mo' })
  assert.equal(m.was, '')
  assert.equal(m.subline, '')
  assert.deepEqual(m.credit, { amount: '£25 booking credit every month', note: 'Unused credit expires each month' })
  assert.deepEqual(m.perks, ['Member rates on all rooms', 'Members-only late-night hours'], 'Cue\'s own credit line gives way to the derived one')
  assert.equal(m.terms, 'Monthly rolling. Cancel anytime.')
  assert.equal(m.saving, '')
})

test('term plans, founding closed: the 3-month card', () => {
  const m = card(load('term-plans'), 'dj-3m')
  assert.deepEqual(m.headline, { amount: '£75', unit: 'for 3 months' })
  assert.equal(m.subline, '£25 a month, paid upfront')
  assert.deepEqual(m.credit, { amount: '£25 booking credit every month', note: 'Unused credit expires each month' })
  assert.equal(m.discount, '')
  assert.equal(m.terms, 'Paid upfront for the full term. Does not renew automatically.')
  assert.equal(m.saving, '', 'no saving line when the per-month cost matches monthly')
})

test('term plans, founding closed: the 6-month card', () => {
  const m = card(load('term-plans'), 'dj-6m')
  assert.deepEqual(m.headline, { amount: '£132', unit: 'for 6 months' })
  assert.equal(m.subline, '£22 a month, paid upfront')
  assert.deepEqual(m.credit, { amount: '£25 booking credit every month', note: 'Unused credit rolls over until your term ends' })
  assert.equal(m.discount, '10% off every booking in Studios 1, 2 and 3')
  assert.equal(m.saving, 'Save £18 against monthly over 6 months')
  assert.equal(m.terms, 'Paid upfront for the full term. Does not renew automatically.')
  assert.equal(m.termMonths, 6)
})

test('term plans, founding closed: Best value is the lowest per-month cost, and the selector reads from it', () => {
  const fx = load('term-plans')
  assert.equal(heroPlanKey(fx.plans, 'dj', fx.founding), 'dj-6m')
  assert.equal(priceFromLabel(fx.plans, 'dj'), 'from £22/mo')
  assert.equal(priceFromLabel(fx.plans, 'producer'), 'from £100/mo')
})

test('term plans, founding closed: nothing founding on either tab', () => {
  const fx = load('term-plans')
  assert.equal(fx.body.founding_offer_open, false)
  assert.equal(trackShowsFounding(fx.plans, 'dj', fx.founding), false)
  assert.equal(trackShowsFounding(fx.plans, 'producer', fx.founding), false)
  for (const p of fx.plans) assert.equal(foundingPriceFor(p, fx.founding), null, p.name)
  // The Sanity tiers still carry founding prices; a closed offer ignores them.
  assert.equal(fx.plans.find(p => p.key === 'dj-rolling').foundingPrice, 20)
})

test('a plan whose offer is closed shows no founding price while another plan\'s is open', () => {
  const fx = load('founding-open')
  const founding = { ...fx.founding, plans: { ...fx.founding.plans, 'dj-resident': { open: false, price: null } } }
  assert.equal(foundingPriceFor(fx.plans.find(p => p.key === 'dj-rolling'), founding), 20)
  assert.equal(foundingPriceFor(fx.plans.find(p => p.key === 'dj-resident'), founding), null)
})

// ── Founding open: the page as it was ────────────────────────────────────────

test('founding open: founding prices, the founding line, and Best value on the entry plan, as today', () => {
  const fx = load('founding-open')
  assert.deepEqual(plansForTrack(fx.plans, 'dj').map(p => p.key), ['dj-rolling', 'dj-resident'])
  assert.equal(trackShowsFounding(fx.plans, 'dj', fx.founding), true)
  assert.equal(trackShowsFounding(fx.plans, 'producer', fx.founding), true)
  assert.equal(heroPlanKey(fx.plans, 'dj', fx.founding), 'dj-rolling')
  const m = card(fx, 'dj-rolling')
  assert.deepEqual(m.headline, { amount: '£20', unit: '/mo' })
  assert.equal(m.was, '£25')
  assert.equal(m.terms, '', 'the founding terms in the footnote cover a founding card')
  assert.equal(foundingPriceFor(fx.plans.find(p => p.key === 'dj-resident'), fx.founding), 45)
  assert.equal(priceFromLabel(fx.plans, 'dj'), 'from £25/mo')
})

test('founding open on the rolling plan: term plans never take a founding price, and the saving is against what monthly costs', () => {
  const fx = load('term-plans-founding-open')
  assert.equal(foundingPriceFor(fx.plans.find(p => p.key === 'dj-6m'), fx.founding), null)
  assert.equal(heroPlanKey(fx.plans, 'dj', fx.founding), 'dj-rolling', '£20 founding beats £22 a month')
  assert.equal(card(fx, 'dj-6m').saving, '', '6 x £20 is less than £132, so no saving to claim')
})

// ── On sale or not ───────────────────────────────────────────────────────────

test('a plan off sale in Cue is not rendered: Cue leaves it out, and nothing else names it', () => {
  const fx = cueFixture('term-plans')
  const offSale = { ...fx.tiers, tiers: fx.tiers.tiers.filter(t => t.id !== 'dj-3m') }
  const plans = mapCueTiers(offSale)
  assert.deepEqual(plansForTrack(plans, 'dj').map(p => p.key), ['dj-rolling', 'dj-6m'])
  assert.ok(!plans.some(p => p.key === 'dj-resident'), '808 Resident is off sale in this fixture, so absent')
})

test('a prepaid plan without a term price, and a day pass, are never shown', () => {
  const plans = mapCueTiers({ tiers: [
    { id: 'broken', name: 'Broken term', membership_type: 'dj', monthly_price: 25, billing_model: 'prepaid_term', term_months: 3, term_price_pence: null },
    { id: 'pass', name: 'Day Pass', membership_type: 'dj', monthly_price: 15, billing_model: 'one_off_pass' },
  ] })
  assert.deepEqual(plans, [])
})

test('a prepaid plan is read from its term price, whatever monthly_price holds', () => {
  const [p] = mapCueTiers({ tiers: [
    { id: 't', name: 'DJ 6', membership_type: 'dj', monthly_price: 0, billing_model: 'prepaid_term', term_months: 6, term_price_pence: 13250, per_month_equivalent_pence: null, monthly_credit_pence: 2500 },
  ] })
  assert.equal(p.termPrice, 132.5)
  assert.equal(p.monthlyPrice, 22.08)
  const m = djCardModel(p, { plans: [p] })
  assert.deepEqual(m.headline, { amount: '£132.50', unit: 'for 6 months' })
  assert.equal(m.subline, '£22.08 a month, paid upfront')
})

// ── Cue unreachable ──────────────────────────────────────────────────────────

test('Cue down: the Sanity plans show, with nothing founding even though they store founding prices', async () => {
  const cue = await fetchCueMembership({ fetchImpl: fixtureFetch('cue-down') })
  assert.deepEqual(cue.plans, [])
  const merged = mergePlans(cue.plans, mapSanityTiers(membershipPageContent.tiers), cue.rooms)
  assert.equal(merged.source, 'sanity')
  const live = parseFoundingStatus(cueFixture('founding-open').founding)
  assert.equal(trackShowsFounding(merged.plans, 'dj', live), false)
  assert.equal(trackShowsFounding(merged.plans, 'producer', live), false)
  for (const p of merged.plans) assert.equal(foundingPriceFor(p, live), null, p.name)
})

// ── Formatting ───────────────────────────────────────────────────────────────

test('money keeps whole pounds whole and otherwise shows pence', () => {
  assert.equal(formatPounds(75), '£75')
  assert.equal(formatPounds(132.5), '£132.50')
  assert.equal(formatPounds(18), '£18')
})

test('roomsPhrase', () => {
  assert.equal(roomsPhrase(['Studio 1', 'Studio 2', 'Studio 3']), 'Studios 1, 2 and 3')
  assert.equal(roomsPhrase(['Studio 4']), 'Studio 4')
  assert.equal(roomsPhrase(['Studio 4', 'The Loft']), 'Studio 4 and The Loft')
  assert.equal(roomsPhrase([]), '')
})
