// Run: npm test

import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
  clock, fetchCueMembership, fetchCueTiers, fillTerms, formatPounds, foundingPriceFor, joinUrl, loadPlans, mapCueRooms,
  mapCueTiers, mapSanityTiers, memberHoursWeek, mergePlans, parseFoundingStatus, perHourLabel, plansForTrack,
  priceFromLabel, producerRoom, producerSavings, tiersUrl, withDefaultPerks,
} from './membershipPlans.js'
import { DEFAULT_PERKS } from '../config/membershipPerks.js'
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
    monthlyPrice: 100, hoursPerMonth: 8, commitmentMonths: 6, foundingPrice: null, monthlyCredit: null, included: [], roomId: null,
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

test('mergePlans takes names, prices and perks from Cue, and the founding price from Sanity by name', () => {
  const cue = mapCueTiers({ tiers: [{ id: 'dj', name: '808 DJ', monthly_price: 30, membership_type: 'dj', perks: ['Cue perk'] }] })
  const stored = mapSanityTiers([{ track: 'dj', name: ' 808 dj ', monthlyPrice: 25, foundingPrice: 20, included: ['Sanity perk'] }])
  const { plans, source } = mergePlans(cue, stored)
  assert.equal(source, 'cue')
  assert.equal(plans.length, 1)
  assert.equal(plans[0].monthlyPrice, 30, 'price is Cue\'s, not the stored one')
  assert.deepEqual(plans[0].included, ['Cue perk'], 'perks are membership_tiers.perks')
  assert.equal(plans[0].foundingPrice, 20)
})

test('mergePlans gives a tier with empty perks its type\'s defaults, filled from the plan and its room', () => {
  const cue = mapCueTiers({ tiers: [{ id: 'p', name: 'P', monthly_price: 100, hours_per_month: 8, commitment_months: 6, membership_type: 'producer', room_venue_id: 'r4', perks: [] }] })
  const [p] = mergePlans(cue, [], [{ id: 'r4', name: 'Studio 4' }]).plans
  assert.equal(p.included.length, DEFAULT_PERKS.producer.length)
  assert.equal(p.included[0], '8 hours a month in Studio 4')
  assert.ok(p.included.every(line => !line.includes('{')), 'no placeholder left')
})

test('withDefaultPerks drops a default line whose placeholder has no value', () => {
  const plan = { track: 'producer', hoursPerMonth: 8, commitmentMonths: 6, included: [] }
  assert.deepEqual(withDefaultPerks(plan, '', { producer: ['{hours} hours in {room}', 'Always'] }).included, ['Always'])
  assert.deepEqual(withDefaultPerks({ ...plan, included: ['Own'] }, 'Studio 4').included, ['Own'], 'own perks are kept')
})

test('mergePlans does not take a founding price across tracks', () => {
  const cue = mapCueTiers({ tiers: [{ id: 'x', name: 'Same', monthly_price: 10, membership_type: 'dj', perks: ['Cue'] }] })
  const stored = mapSanityTiers([{ track: 'producer', name: 'Same', monthlyPrice: 10, foundingPrice: 5 }])
  assert.equal(mergePlans(cue, stored).plans[0].foundingPrice, null)
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
  assert.deepEqual(plans.find(p => p.name === '808 Resident').included, DEFAULT_PERKS.dj, 'empty Cue perks take the DJ defaults')
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
  assert.equal(foundingPriceFor(dj, parseFoundingStatus(null)), 20, 'unknown keeps the offer, as the founding line does')
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

// ── Rooms, savings and members-only hours ────────────────────────────────────

// Studio 4 as Cue's tiers endpoint returns it (2026-10-04): public Mon-Thu
// 10:00-19:00, Fri 10:00-21:00, closed weekends; weekends gated to producers.
const S4 = 'a17bddfa-1d00-472c-bcff-3fba2f3bb414'
const av = (d, open, o = '10:00', c = '19:00') => ({ day_of_week: d, is_open: open, open_time: o, close_time: c })
const ROOM_BODY = {
  tiers: [
    { id: 'p8-3', name: 'P 8/3', monthly_price: 160, hours_per_month: 8, commitment_months: 3, membership_type: 'producer', room_venue_id: S4, perks: [] },
    { id: 'p16-3', name: 'P 16/3', monthly_price: 260, hours_per_month: 16, commitment_months: 3, membership_type: 'producer', room_venue_id: S4, perks: [] },
    { id: 'p8-6', name: 'P 8/6', monthly_price: 100, hours_per_month: 8, commitment_months: 6, membership_type: 'producer', room_venue_id: S4, perks: [] },
    { id: 'p16-6', name: 'P 16/6', monthly_price: 200, hours_per_month: 16, commitment_months: 6, membership_type: 'producer', room_venue_id: S4, perks: [] },
  ],
  rooms: [{
    id: S4, name: 'Studio 4', price_per_hour: 55,
    availability: [av(0, false, '10:00', '22:00'), av(1, true), av(2, true), av(3, true), av(4, true), av(5, true, '10:00', '21:00'), av(6, false, '10:00', '22:00')],
    member_hours: [
      { day_of_week: 0, start_time: '10:00', end_time: '22:00', min_membership_type: 'producer', min_tier_id: null },
      { day_of_week: 6, start_time: '10:00', end_time: '22:00', min_membership_type: 'producer', min_tier_id: null },
    ],
  }],
}

test('mapCueRooms maps the rate, hours and gates, and reads no rooms as []', () => {
  const [room] = mapCueRooms(ROOM_BODY)
  assert.equal(room.rate, 55)
  assert.equal(room.availability.length, 7)
  assert.deepEqual(room.memberHours[0], { day: 0, start: '10:00', end: '22:00', type: 'producer', tierId: null })
  assert.equal(mapCueRooms({ rooms: [{ id: 'x', price_per_hour: 0 }] })[0].rate, null, 'no £0 rate')
  for (const body of [null, CUE_BODY, { rooms: 'nope' }]) assert.deepEqual(mapCueRooms(body), [])
})

test('fetchCueMembership returns plans and rooms, and empties on failure', async () => {
  const ok = await fetchCueMembership({ fetchImpl: async () => okResponse(ROOM_BODY) })
  assert.equal(ok.plans.length, 4)
  assert.equal(ok.rooms[0].name, 'Studio 4')
  assert.deepEqual(await fetchCueMembership({ fetchImpl: async () => { throw new Error('x') } }), { plans: [], rooms: [] })
})

test('producerSavings works each plan out from the room rate, with the 6-month 8-hour plan featured', () => {
  const plans = mapCueTiers(ROOM_BODY)
  const room = producerRoom(plans, mapCueRooms(ROOM_BODY))
  assert.equal(room.id, S4)
  const { rows, featuredKey, rate } = producerSavings(plans, room.rate)
  assert.equal(rate, 55)
  assert.equal(featuredKey, 'p8-6')
  assert.deepEqual(rows.find(r => r.key === 'p8-6'), {
    key: 'p8-6', name: 'P 8/6', hoursPerMonth: 8, commitmentMonths: 6,
    publicCost: 440, memberPrice: 100, perHour: 12.5, savingPerHour: 42.5, savingPerMonth: 340, percent: 77,
  })
  const r163 = rows.find(r => r.key === 'p16-3')
  assert.equal(r163.perHour, 16.25)
  assert.equal(r163.savingPerMonth, 620)
  assert.equal(r163.percent, 70)
})

test('producerSavings follows the rate it is given, never a fixed one', () => {
  const { rows } = producerSavings(mapCueTiers(ROOM_BODY), 60)
  assert.equal(rows.find(r => r.key === 'p8-6').savingPerMonth, 380)
})

test('producerSavings shows nothing without a rate, and leaves out plans that save nothing', () => {
  assert.deepEqual(producerSavings(mapCueTiers(ROOM_BODY), null).rows, [])
  const { rows, featuredKey } = producerSavings(mapCueTiers(ROOM_BODY), 15)
  assert.deepEqual(rows.map(r => r.key), ['p8-6', 'p16-6'], '£20/hr and £16.25/hr save nothing against £15/hr')
  assert.equal(featuredKey, 'p8-6')
})

test('memberHoursWeek derives the public and members-only hours from the room', () => {
  const week = memberHoursWeek(mapCueRooms(ROOM_BODY)[0], [])
  assert.deepEqual(week.days.map(d => d.short), ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'])
  const mon = week.days[0]
  assert.deepEqual([clock(mon.public[0]), clock(mon.public[1])], ['10:00', '19:00'])
  assert.deepEqual(mon.members, [])
  assert.equal(clock(week.days[4].public[1]), '21:00')
  assert.equal(week.days[5].public, null)
  assert.deepEqual(week.days[5].members.map(r => r.map(clock)), [['10:00', '22:00']])
  assert.deepEqual(week.axis.map(clock), ['10:00', '22:00'])
  assert.equal(week.hasWeekends, true)
  assert.equal(week.hasEvenings, false, 'no weekday tail is gated in this data')
})

test('memberHoursWeek reads a gated weekday tail as an evening, and ignores gates for other types', () => {
  const room = mapCueRooms(ROOM_BODY)[0]
  room.memberHours.push(
    { day: 1, start: '19:00', end: '23:00', type: null, tierId: 'p8-6' },
    { day: 2, start: '19:00', end: '23:00', type: 'dj', tierId: null },
  )
  const week = memberHoursWeek(room, ['p8-6'])
  assert.deepEqual(week.days[0].members.map(r => r.map(clock)), [['19:00', '23:00']])
  assert.deepEqual(week.days[1].members, [], 'a DJ gate is not a producer slot')
  assert.equal(week.hasEvenings, true)
  assert.equal(clock(week.axis[1]), '23:00')
})

test('memberHoursWeek takes the public hours out of a gate that overlaps them', () => {
  const room = mapCueRooms(ROOM_BODY)[0]
  room.memberHours.push({ day: 5, start: '16:00', end: '23:00', type: 'producer', tierId: null })
  assert.deepEqual(memberHoursWeek(room).days[4].members.map(r => r.map(clock)), [['21:00', '23:00']])
})
