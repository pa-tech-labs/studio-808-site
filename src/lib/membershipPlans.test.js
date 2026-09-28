// Run: npm test

import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
  fetchCueTiers, fillTerms, formatPounds, foundingPriceFor, joinUrl, loadPlans, mapCueTiers, mapSanityTiers,
  mergePlans, parseFoundingStatus, perHourLabel, plansForTrack, priceFromLabel, tiersUrl,
} from './membershipPlans.js'
import { membershipPageContent } from './membershipPageContent.js'

// A trimmed copy of Cue's live /api/membership/tiers response (2026-09-28).
const CUE_BODY = {
  tiers: [
    { id: 'creators', name: '808 Creators', monthly_price: 0, hours_per_month: 0, commitment_months: 0, membership_type: 'custom', perks: ['Invite-only'] },
    { id: 'dj', name: '808 DJ', monthly_price: 25, hours_per_month: 0, commitment_months: 0, membership_type: 'dj', perks: ['Cue perk for 808 DJ'] },
    { id: 'resident', name: '808 Resident', monthly_price: 50, hours_per_month: 0, commitment_months: 0, membership_type: 'dj', perks: [] },
    { id: 'p16-6', name: 'Producer Membership - 16hrs/mo (6 Month)', monthly_price: 200, hours_per_month: 16, commitment_months: 6, membership_type: 'producer', perks: [] },
    { id: 'p8-3', name: 'Producer Membership - 8hrs/mo (3 Month)', monthly_price: 160, hours_per_month: 8, commitment_months: 3, membership_type: 'producer', perks: [] },
    { id: 'p8-6', name: 'Producer Membership - 8hrs/mo (6 Month)', monthly_price: '100', hours_per_month: 8, commitment_months: 6, membership_type: 'producer', perks: null },
  ],
}

const okResponse = body => ({ ok: true, json: async () => body })

// ── Cue mapping ──────────────────────────────────────────────────────────────

test('mapCueTiers keeps DJ and producer tiers and drops invite-only custom tiers', () => {
  const plans = mapCueTiers(CUE_BODY)
  assert.deepEqual(plans.map(p => p.name), [
    '808 DJ', '808 Resident',
    'Producer Membership - 16hrs/mo (6 Month)', 'Producer Membership - 8hrs/mo (3 Month)', 'Producer Membership - 8hrs/mo (6 Month)',
  ])
  assert.ok(!plans.some(p => p.name === '808 Creators'))
})

test('mapCueTiers maps fields and coerces numeric strings', () => {
  const p = mapCueTiers(CUE_BODY).find(x => x.key === 'p8-6')
  assert.deepEqual(p, {
    key: 'p8-6', track: 'producer', name: 'Producer Membership - 8hrs/mo (6 Month)',
    monthlyPrice: 100, hoursPerMonth: 8, commitmentMonths: 6, foundingPrice: null, included: [],
  })
  assert.deepEqual(mapCueTiers(CUE_BODY).find(x => x.key === 'dj').included, ['Cue perk for 808 DJ'])
})

test('mapCueTiers drops tiers with no name or no positive price', () => {
  const plans = mapCueTiers({ tiers: [
    { name: '', monthly_price: 25, membership_type: 'dj' },
    { name: 'Free', monthly_price: 0, membership_type: 'dj' },
    { name: 'Broken', monthly_price: 'abc', membership_type: 'dj' },
    { name: 'No price', membership_type: 'producer' },
    null,
  ] })
  assert.deepEqual(plans, [])
})

test('mapCueTiers reads any unexpected body as no plans', () => {
  for (const body of [null, undefined, '<!doctype html>', {}, { tiers: 'nope' }, []]) {
    assert.deepEqual(mapCueTiers(body), [])
  }
})

// ── Sanity mapping and merge ─────────────────────────────────────────────────

test('mapSanityTiers maps the stored tiers, keeping founding prices', () => {
  const plans = mapSanityTiers(membershipPageContent.tiers)
  assert.equal(plans.length, 6)
  const dj = plans.find(p => p.name === '808 DJ')
  assert.equal(dj.monthlyPrice, 25)
  assert.equal(dj.foundingPrice, 20)
  assert.ok(dj.included.length > 0)
  assert.equal(plans.find(p => p.track === 'producer').foundingPrice, null)
})

test('mapSanityTiers skips incomplete tiers', () => {
  assert.deepEqual(mapSanityTiers([{ track: 'dj', name: 'X' }, { track: 'band', name: 'Y', monthlyPrice: 5 }, { name: 'Z', monthlyPrice: 5 }]), [])
  assert.deepEqual(mapSanityTiers(null), [])
})

test('mergePlans takes names and prices from Cue and included lists from Sanity by name', () => {
  const cue = mapCueTiers({ tiers: [{ id: 'dj', name: '808 DJ', monthly_price: 30, membership_type: 'dj', perks: ['Cue perk'] }] })
  const stored = mapSanityTiers([{ track: 'dj', name: ' 808 dj ', monthlyPrice: 25, foundingPrice: 20, included: ['Sanity perk'] }])
  const { plans, source } = mergePlans(cue, stored)
  assert.equal(source, 'cue')
  assert.equal(plans.length, 1)
  assert.equal(plans[0].monthlyPrice, 30, 'price is Cue\'s, not the stored one')
  assert.deepEqual(plans[0].included, ['Sanity perk'])
  assert.equal(plans[0].foundingPrice, 20)
})

test('mergePlans keeps Cue perks when Sanity has no tier of that name, or an empty list', () => {
  const cue = mapCueTiers(CUE_BODY)
  const stored = mapSanityTiers([{ track: 'dj', name: '808 DJ', monthlyPrice: 25, included: [] }])
  const dj = mergePlans(cue, stored).plans.find(p => p.name === '808 DJ')
  assert.deepEqual(dj.included, ['Cue perk for 808 DJ'])
})

test('mergePlans does not match a name across tracks', () => {
  const cue = mapCueTiers({ tiers: [{ id: 'x', name: 'Same', monthly_price: 10, membership_type: 'producer', perks: [] }] })
  const stored = mapSanityTiers([{ track: 'dj', name: 'Same', monthlyPrice: 10, included: ['DJ only'] }])
  assert.deepEqual(mergePlans(cue, stored).plans[0].included, [])
})

test('mergePlans falls back to the Sanity tiers when Cue gave nothing', () => {
  const stored = mapSanityTiers(membershipPageContent.tiers)
  assert.deepEqual(mergePlans([], stored), { plans: stored, source: 'sanity' })
  assert.deepEqual(mergePlans(null, stored), { plans: stored, source: 'sanity' })
})

// ── Fetching with fallback ───────────────────────────────────────────────────

test('loadPlans uses Cue when the request succeeds', async () => {
  let calledWith
  const fetchImpl = async url => { calledWith = url; return okResponse(CUE_BODY) }
  const { plans, source } = await loadPlans({ fetchImpl, sanityTiers: membershipPageContent.tiers })
  assert.equal(source, 'cue')
  assert.equal(calledWith, tiersUrl())
  assert.equal(plans.length, 5)
  assert.ok(plans.find(p => p.name === '808 Resident').included.length > 0, 'included list comes from Sanity')
})

test('loadPlans falls back to Sanity on a network error, a non-2xx, HTML, or an empty list', async () => {
  const failures = {
    network: async () => { throw new TypeError('Failed to fetch') },
    status: async () => ({ ok: false, json: async () => ({ error: 'Server error.' }) }),
    html: async () => ({ ok: true, json: async () => { throw new SyntaxError('Unexpected token <') } }),
    empty: async () => okResponse({ tiers: [] }),
  }
  for (const [name, fetchImpl] of Object.entries(failures)) {
    const { plans, source } = await loadPlans({ fetchImpl, sanityTiers: membershipPageContent.tiers })
    assert.equal(source, 'sanity', name)
    assert.equal(plans.length, 6, name)
  }
})

test('fetchCueTiers gives up after the timeout', async () => {
  const fetchImpl = (_url, init) => new Promise((_resolve, reject) => {
    init.signal.addEventListener('abort', () => reject(new Error('aborted')))
  })
  assert.deepEqual(await fetchCueTiers({ fetchImpl, timeoutMs: 10 }), [])
})

// ── Display helpers ──────────────────────────────────────────────────────────

test('plansForTrack orders by term, then hours, then price', () => {
  const producer = plansForTrack(mapCueTiers(CUE_BODY), 'producer')
  assert.deepEqual(producer.map(p => p.key), ['p8-3', 'p8-6', 'p16-6'])
  assert.deepEqual(plansForTrack(mapCueTiers(CUE_BODY), 'dj').map(p => p.key), ['dj', 'resident'])
})

test('priceFromLabel reads "from" only when prices differ', () => {
  const plans = mapCueTiers(CUE_BODY)
  assert.equal(priceFromLabel(plans, 'producer'), 'from £100/mo')
  assert.equal(priceFromLabel(plans, 'dj'), 'from £25/mo')
  assert.equal(priceFromLabel(plans.filter(p => p.key === 'dj'), 'dj'), '£25/mo')
  assert.equal(priceFromLabel([], 'dj'), '')
})

test('formatPounds and perHourLabel', () => {
  assert.equal(formatPounds(25), '£25')
  assert.equal(formatPounds(16.25), '£16.25')
  assert.equal(perHourLabel({ monthlyPrice: 260, hoursPerMonth: 16 }), '£16.25/hr')
  assert.equal(perHourLabel({ monthlyPrice: 100, hoursPerMonth: 8 }), '£12.50/hr')
  assert.equal(perHourLabel({ monthlyPrice: 25, hoursPerMonth: 0 }), '')
})

test('fillTerms fills {months}', () => {
  assert.equal(fillTerms('{months}-month minimum, then {months}', { commitmentMonths: 6 }), '6-month minimum, then 6')
  assert.equal(fillTerms(null, { commitmentMonths: 3 }), '')
})

test('joinUrl pre-selects the track with Cue\'s ?type= parameter', () => {
  assert.equal(joinUrl('dj'), 'https://book.studio-808.com/membership?type=dj')
  assert.equal(joinUrl('producer'), 'https://book.studio-808.com/membership?type=producer')
  assert.equal(joinUrl('other'), 'https://book.studio-808.com/membership')
})

// ── Founding ─────────────────────────────────────────────────────────────────

const LIVE_STATUS = { cap: 15, taken: 7, remaining: 8, prices: { '808 DJ': 2000, '808 Resident': 4500 }, producer: { cap: 3, taken: 1, remaining: 2 } }

test('parseFoundingStatus reads counts, caps and prices in pounds', () => {
  assert.deepEqual(parseFoundingStatus(LIVE_STATUS), {
    dj: 8, producer: 2, djCap: 15, producerCap: 3, prices: { '808 DJ': 20, '808 Resident': 45 },
  })
})

test('parseFoundingStatus reads a failed or HTML response as unknown', () => {
  for (const body of [null, '<!doctype html>', {}]) {
    const s = parseFoundingStatus(body)
    assert.equal(s.dj, null)
    assert.equal(s.producer, null)
    assert.equal(s.djCap, 15)
    assert.equal(s.producerCap, 3)
  }
})

test('foundingPriceFor: live price while places remain, stored price while unknown, none when full', () => {
  const [dj] = mergePlans(mapCueTiers(CUE_BODY), mapSanityTiers(membershipPageContent.tiers)).plans
  assert.equal(dj.name, '808 DJ')
  assert.equal(foundingPriceFor(dj, parseFoundingStatus({ ...LIVE_STATUS, prices: { '808 DJ': 1800 } })), 18)
  assert.equal(foundingPriceFor(dj, parseFoundingStatus(null)), 20, 'unknown keeps the offer, as FoundingBadge does')
  assert.equal(foundingPriceFor(dj, parseFoundingStatus({ ...LIVE_STATUS, remaining: 0 })), null)
})

test('foundingPriceFor never discounts a producer plan or raises a price', () => {
  const producer = { track: 'producer', name: 'P', monthlyPrice: 100, foundingPrice: 80 }
  assert.equal(foundingPriceFor(producer, parseFoundingStatus(LIVE_STATUS)), null)
  const odd = { track: 'dj', name: '808 DJ', monthlyPrice: 15, foundingPrice: null }
  assert.equal(foundingPriceFor(odd, parseFoundingStatus(LIVE_STATUS)), null)
})

// ── Seed content ─────────────────────────────────────────────────────────────

test('membership copy has no em dashes', () => {
  assert.ok(!JSON.stringify(membershipPageContent).includes('\u2014'))
})

test('every array item in the seed content has a unique _key', () => {
  const walk = (node, path) => {
    if (Array.isArray(node)) {
      const objects = node.filter(x => x && typeof x === 'object')
      const keys = objects.map(x => x._key)
      assert.ok(keys.every(Boolean), `${path}: item without _key`)
      assert.equal(new Set(keys).size, keys.length, `${path}: duplicate _key`)
      node.forEach((x, i) => walk(x, `${path}[${i}]`))
    } else if (node && typeof node === 'object') {
      for (const [k, v] of Object.entries(node)) walk(v, `${path}.${k}`)
    }
  }
  walk(membershipPageContent, 'membershipPage')
})
