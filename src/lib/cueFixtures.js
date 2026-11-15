// Cue response fixtures for /membership: the node:test suite uses them, and a
// dev build can render the page against one with ?cue-fixture=<name> (see
// devCueFetch below; production builds never read the parameter).
//
// Shapes follow Cue's live GET /api/membership/tiers and
// /api/membership/founding-status (access-hub #677, #678, #680). The two DJ
// term plans are made up for the fixture: Cue holds them as drafts until they
// go on sale.

function fixtureData() {
  const ROOMS = [
    { id: 'room-s1', name: 'Studio 1', price_per_hour: 25, availability: [], member_hours: [], bands: [] },
    { id: 'room-s2', name: 'Studio 2', price_per_hour: 35, availability: [], member_hours: [], bands: [] },
    { id: 'room-s3', name: 'Studio 3', price_per_hour: 35, availability: [], member_hours: [], bands: [] },
    {
      id: 'room-s4', name: 'Studio 4', price_per_hour: 45,
      availability: [1, 2, 3, 4, 5].map(d => ({ day_of_week: d, is_open: true, open_time: '10:00', close_time: '18:00' })),
      member_hours: [6, 0].map(d => ({ day_of_week: d, start_time: '10:00', end_time: '18:00', min_membership_type: 'producer', min_tier_id: null })),
      bands: [],
    },
  ]

  const base = { billing_model: 'subscription', term_months: null, term_price_pence: null, per_month_equivalent_pence: null, plan_family: null, credit_rollover: false, member_discount_percent: null, member_discount_room_ids: [], member_rates: [] }

  const DJ_ROLLING = { ...base, id: 'dj-rolling', name: '808 DJ', membership_type: 'dj', monthly_price: 25, hours_per_month: 0, commitment_months: 0, room_venue_id: null, monthly_credit_pence: 2500, benefit_type: 'credit', plan_family: 'dj', perks: ['£25.00 booking credit that renews with your monthly payment and lasts until your next renewal. Unused credit does not roll over.', 'Member rates on all rooms', 'Members-only late-night hours'] }
  const DJ_RESIDENT = { ...base, id: 'dj-resident', name: '808 Resident', membership_type: 'dj', monthly_price: 50, hours_per_month: 0, commitment_months: 0, room_venue_id: null, monthly_credit_pence: 5000, benefit_type: 'credit', perks: ['£50.00 booking credit that renews with your monthly payment and lasts until your next renewal.', 'Everything in 808 DJ'] }
  const DJ_3M = { ...base, id: 'dj-3m', name: '808 DJ 3 Months', membership_type: 'dj', monthly_price: 25, hours_per_month: 0, commitment_months: 0, room_venue_id: null, monthly_credit_pence: 2500, benefit_type: 'credit', billing_model: 'prepaid_term', term_months: 3, term_price_pence: 7500, per_month_equivalent_pence: 2500, plan_family: 'dj', credit_rollover: false, perks: ['Member rates on all rooms', 'Members-only late-night hours'] }
  const DJ_6M = { ...base, id: 'dj-6m', name: '808 DJ 6 Months', membership_type: 'dj', monthly_price: 22, hours_per_month: 0, commitment_months: 0, room_venue_id: null, monthly_credit_pence: 2500, benefit_type: 'credit', billing_model: 'prepaid_term', term_months: 6, term_price_pence: 13200, per_month_equivalent_pence: 2200, plan_family: 'dj', credit_rollover: true, member_discount_percent: 10, member_discount_room_ids: ['room-s1', 'room-s2', 'room-s3'], perks: ['Member rates on all rooms', 'Members-only late-night hours'] }
  const producer = (id, hours, months, price) => ({ ...base, id, name: `Producer Membership - ${hours}hrs/mo (${months} Month)`, membership_type: 'producer', monthly_price: price, hours_per_month: hours, commitment_months: months, room_venue_id: 'room-s4', monthly_credit_pence: null, benefit_type: null, perks: [] })
  const PRODUCERS = [producer('p8-3', 8, 3, 160), producer('p16-3', 16, 3, 260), producer('p8-6', 8, 6, 100), producer('p16-6', 16, 6, 200)]
  const CREATORS = { ...base, id: 'creators', name: '808 Creators', membership_type: 'custom', monthly_price: 0, hours_per_month: 0, commitment_months: 0, room_venue_id: null, monthly_credit_pence: null, perks: ['Invite-only'] }

  const FOUNDING_PRICES = { 'dj-rolling': 2000, 'dj-resident': 4500 }
  return { ROOMS, DJ_ROLLING, DJ_RESIDENT, DJ_3M, DJ_6M, PRODUCERS, CREATORS, FOUNDING_PRICES }
}

function tiersBody(tiers, open, ROOMS) {
  const shaped = tiers.map(t => ({ ...t, founding_offer_open: open && t.membership_type !== 'custom' && t.billing_model !== 'prepaid_term' }))
  return { tiers: shaped, rooms: ROOMS, min_booking_hours: 2, founding_offer_open: shaped.some(t => t.founding_offer_open) }
}

function foundingBody(tiers, open, FOUNDING_PRICES) {
  const plans = tiers.map(t => {
    const isOpen = open && t.membership_type !== 'custom' && t.billing_model !== 'prepaid_term'
    return {
      id: t.id, name: t.name, membership_type: t.membership_type, founding_offer_open: isOpen,
      founding_price_pence: isOpen ? FOUNDING_PRICES[t.id] ?? null : null,
      founding_places: isOpen ? (t.membership_type === 'dj' ? 15 : 3) : null,
    }
  })
  return {
    cap: 15, taken: 12, remaining: 3, bannerEnabled: open,
    prices: open ? { '808 DJ': 2000, '808 Resident': 4500 } : {},
    producer: { cap: 3, taken: 1, remaining: 2 },
    min_term_months: 3,
    founding_offer_open: plans.some(p => p.founding_offer_open),
    plans,
  }
}

/** The plans on sale in each fixture. Off-sale plans are absent, as Cue leaves them out. */
function onSale(name, d) {
  switch (name) {
    // The target: rolling 808 DJ and the two prepaid plans, founding closed.
    case 'term-plans': return { tiers: [d.CREATORS, d.DJ_ROLLING, d.DJ_3M, d.DJ_6M, ...d.PRODUCERS], open: false }
    // Today's line-up with the founding offer open, no term plans.
    case 'founding-open': return { tiers: [d.CREATORS, d.DJ_ROLLING, d.DJ_RESIDENT, ...d.PRODUCERS], open: true }
    // Term plans on sale while the founding offer is still open on the rolling plan.
    case 'term-plans-founding-open': return { tiers: [d.CREATORS, d.DJ_ROLLING, d.DJ_3M, d.DJ_6M, ...d.PRODUCERS], open: true }
    default: return null
  }
}

/** A fixture's two responses: { tiers, founding }, or null for an unknown name. */
export function cueFixture(name) {
  const d = fixtureData()
  const set = onSale(name, d)
  if (!set) return null
  return { tiers: tiersBody(set.tiers, set.open, d.ROOMS), founding: foundingBody(set.tiers, set.open, d.FOUNDING_PRICES) }
}

export const FIXTURE_NAMES = ['term-plans', 'founding-open', 'term-plans-founding-open', 'cue-down']

/**
 * A fetch that answers Cue's two membership endpoints from a fixture.
 * 'cue-down' fails both, as an outage would.
 */
export function fixtureFetch(name) {
  const fx = cueFixture(name)
  return async url => {
    if (!fx) return { ok: false, status: 503, json: async () => ({ error: 'down' }) }
    const body = String(url).includes('/founding-status') ? fx.founding : fx.tiers
    return { ok: true, status: 200, json: async () => structuredClone(body) }
  }
}

/** Dev builds only: the fixture fetch named by ?cue-fixture=, else null. */
export function devCueFetch() {
  if (typeof import.meta === 'undefined' || !import.meta.env?.DEV || typeof window === 'undefined') return null
  const name = new URLSearchParams(window.location.search).get('cue-fixture')
  return name && FIXTURE_NAMES.includes(name) ? fixtureFetch(name) : null
}
