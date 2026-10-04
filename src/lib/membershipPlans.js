// Membership plans for the /membership page: the pure logic, with no React
// and no Sanity client, so the page and the node:test suite share one copy.
// Plain JS with a .d.ts beside it, like studioFinder.js.
//
// Plan names, prices and perks come from Cue's public tiers endpoint at render
// time. A tier with no perks shows its type's defaults from
// config/membershipPerks.js. The tiers stored on the Sanity membershipPage
// singleton are the fallback when that request fails.
//
// The same endpoint returns the tier rooms' public rate, opening hours and
// members-only hours, which drive the producer savings and availability
// blocks. Nothing here hardcodes a rate, a price or an opening time.

import { DEFAULT_PERKS } from '../config/membershipPerks.js'

/** Cue's API host. book.studio-808.com serves only the booking SPA, so an
 *  /api path there answers with index.html, never JSON. VITE_CUE_API_URL
 *  points a dev build at another Cue (a local one, say). */
const ENV_API_URL = typeof import.meta !== 'undefined' ? import.meta.env?.VITE_CUE_API_URL : undefined
export const CUE_API_URL = ENV_API_URL || 'https://access-hub-production.up.railway.app'

/** Studio 808's tenant on Cue. */
export const CUE_TENANT_ID = 'fcf37158-bb9e-4cc3-8573-f39e8cfe06b7'

/** Cue's membership page, where the Join buttons send people to sign up. */
export const CUE_MEMBERSHIP_URL = 'https://book.studio-808.com/membership'

export const TRACKS = ['dj', 'producer']

const DEFAULT_CAPS = { dj: 15, producer: 3 }

const isTrack = t => t === 'dj' || t === 'producer'
const toNumber = v => (v === null || v === undefined || v === '' ? NaN : Number(v))
const cleanList = list =>
  (Array.isArray(list) ? list : []).filter(s => typeof s === 'string' && s.trim()).map(s => s.trim())
const nameKey = name => String(name ?? '').trim().toLowerCase()

/**
 * Cue's join link, pre-selecting the track. Cue's MembershipPage reads
 * ?type=dj|producer (it has no ?tier= parameter).
 */
export function joinUrl(track) {
  return isTrack(track) ? `${CUE_MEMBERSHIP_URL}?type=${track}` : CUE_MEMBERSHIP_URL
}

/** The tiers endpoint URL for a tenant. */
export function tiersUrl(apiUrl = CUE_API_URL, tenantId = CUE_TENANT_ID) {
  return `${apiUrl}/api/membership/tiers?tenantId=${encodeURIComponent(tenantId)}`
}

/** The founding-status endpoint URL for a tenant. */
export function foundingStatusUrl(apiUrl = CUE_API_URL, tenantId = CUE_TENANT_ID) {
  return `${apiUrl}/api/membership/founding-status?tenant_id=${encodeURIComponent(tenantId)}`
}

/**
 * Cue's `{ tiers: [...] }` response as plans. Keeps only DJ and producer
 * tiers with a name and a price above zero, which drops invite-only tiers
 * such as "808 Creators" (membership_type "custom", £0). Returns [] for any
 * body that is not the expected shape.
 */
export function mapCueTiers(body) {
  const tiers = Array.isArray(body?.tiers) ? body.tiers : []
  const plans = []
  for (const t of tiers) {
    if (!t || !isTrack(t.membership_type)) continue
    const name = typeof t.name === 'string' ? t.name.trim() : ''
    const monthlyPrice = toNumber(t.monthly_price)
    if (!name || !(monthlyPrice > 0)) continue
    plans.push({
      key: typeof t.id === 'string' && t.id ? t.id : `${t.membership_type}-${nameKey(name)}`,
      track: t.membership_type,
      name,
      monthlyPrice,
      hoursPerMonth: Math.max(0, toNumber(t.hours_per_month) || 0),
      commitmentMonths: Math.max(0, toNumber(t.commitment_months) || 0),
      foundingPrice: null,
      // Booking credit each month in pounds (Cue sends pence), null when none.
      monthlyCredit: toNumber(t.monthly_credit_pence) > 0 ? toNumber(t.monthly_credit_pence) / 100 : null,
      included: cleanList(t.perks),
      roomId: typeof t.room_venue_id === 'string' && t.room_venue_id ? t.room_venue_id : null,
    })
  }
  return plans
}

const HHMM = /^\d{2}:\d{2}/

/**
 * Cue's `rooms` (beside `tiers`) as rooms: id, name, public rate, opening
 * hours, gated members-only rows and public price bands. A room without a positive rate keeps
 * rate null, which hides the savings block rather than showing £0. Returns
 * [] for any body without rooms, such as a Cue that predates them.
 */
export function mapCueRooms(body) {
  const rooms = Array.isArray(body?.rooms) ? body.rooms : []
  const day = d => (Number.isInteger(toNumber(d)) && toNumber(d) >= 0 && toNumber(d) <= 6 ? toNumber(d) : null)
  const time = t => (typeof t === 'string' && HHMM.test(t) ? t.slice(0, 5) : null)
  return rooms.filter(r => r && typeof r.id === 'string' && r.id).map(r => {
    const rate = toNumber(r.price_per_hour)
    return {
      id: r.id,
      name: typeof r.name === 'string' ? r.name.trim() : '',
      rate: rate > 0 ? rate : null,
      availability: (Array.isArray(r.availability) ? r.availability : [])
        .map(a => ({ day: day(a?.day_of_week), isOpen: !!a?.is_open, open: time(a?.open_time), close: time(a?.close_time) }))
        .filter(a => a.day != null && a.open && a.close),
      memberHours: (Array.isArray(r.member_hours) ? r.member_hours : [])
        .map(m => ({ day: day(m?.day_of_week), start: time(m?.start_time), end: time(m?.end_time), type: m?.min_membership_type ?? null, tierId: m?.min_tier_id ?? null }))
        .filter(m => m.day != null && m.start && m.end),
      // Public price bands (access-hub #548): [] from a Cue that predates them.
      bands: (Array.isArray(r.bands) ? r.bands : [])
        .map(b => ({ day: day(b?.day_of_week), start: time(b?.start_time), end: time(b?.end_time), label: typeof b?.label === 'string' ? b.label.trim() : '', price: toNumber(b?.price_per_hour) }))
        .filter(b => b.day != null && b.start && b.end && b.price > 0),
    }
  })
}

/** A plan's perks with its type's defaults when it has none, placeholders filled. */
export function withDefaultPerks(plan, roomName = '', defaults = DEFAULT_PERKS) {
  if (!plan || plan.included.length > 0) return plan
  const values = {
    hours: plan.hoursPerMonth > 0 ? String(plan.hoursPerMonth) : '',
    months: plan.commitmentMonths > 0 ? String(plan.commitmentMonths) : '',
    room: roomName || '',
  }
  const included = (defaults?.[plan.track] ?? [])
    .map(line => {
      let missing = false
      const out = line.replace(/\{(hours|months|room)\}/g, (_, k) => values[k] || ((missing = true), ''))
      return missing ? null : out
    })
    .filter(Boolean)
  return { ...plan, included }
}

/** The Sanity-stored tiers as plans, with the same validity rules. */
export function mapSanityTiers(tiers) {
  const plans = []
  for (const t of Array.isArray(tiers) ? tiers : []) {
    if (!t || !isTrack(t.track)) continue
    const name = typeof t.name === 'string' ? t.name.trim() : ''
    const monthlyPrice = toNumber(t.monthlyPrice)
    if (!name || !(monthlyPrice > 0)) continue
    const founding = toNumber(t.foundingPrice)
    const credit = toNumber(t.monthlyCredit)
    plans.push({
      key: t._key || `${t.track}-${nameKey(name)}`,
      track: t.track,
      name,
      monthlyPrice,
      hoursPerMonth: Math.max(0, toNumber(t.hoursPerMonth) || 0),
      commitmentMonths: Math.max(0, toNumber(t.commitmentMonths) || 0),
      foundingPrice: founding > 0 ? founding : null,
      monthlyCredit: credit > 0 ? credit : null,
      included: cleanList(t.included),
    })
  }
  return plans
}

/**
 * The plans to show. Cue's plans win whenever Cue returned any: names,
 * prices, hours, terms and perks are Cue's, a tier with no perks gets its
 * type's defaults (config/membershipPerks.js), and each takes the founding
 * price of the Sanity tier with the same name (and its monthly credit when
 * Cue sends none). With nothing from Cue, the
 * Sanity tiers are used as they are. `rooms` names {room} in the defaults.
 */
export function mergePlans(cuePlans, sanityPlans, rooms = []) {
  const cue = Array.isArray(cuePlans) ? cuePlans : []
  const stored = Array.isArray(sanityPlans) ? sanityPlans : []
  if (cue.length === 0) return { plans: stored, source: 'sanity' }
  const byName = new Map(stored.map(p => [`${p.track}:${nameKey(p.name)}`, p]))
  const roomName = id => (Array.isArray(rooms) ? rooms : []).find(r => r.id === id)?.name ?? ''
  const plans = cue.map(p => {
    const match = byName.get(`${p.track}:${nameKey(p.name)}`)
    return withDefaultPerks({ ...p, foundingPrice: match?.foundingPrice ?? p.foundingPrice, monthlyCredit: p.monthlyCredit ?? match?.monthlyCredit ?? null }, roomName(p.roomId))
  })
  return { plans, source: 'cue' }
}

/**
 * Cue's live plans and rooms. Never throws: a network error, a timeout, a
 * non-2xx or a non-JSON body (the SPA's index.html) all come back empty,
 * which mergePlans reads as "use the Sanity tiers" and the page reads as
 * "hide the savings and availability blocks".
 */
export async function fetchCueMembership({ fetchImpl = globalThis.fetch, apiUrl = CUE_API_URL, tenantId = CUE_TENANT_ID, timeoutMs = 6000 } = {}) {
  const controller = typeof AbortController === 'function' ? new AbortController() : null
  const timer = controller ? setTimeout(() => controller.abort(), timeoutMs) : null
  try {
    const res = await fetchImpl(tiersUrl(apiUrl, tenantId), controller ? { signal: controller.signal } : undefined)
    if (!res?.ok) return { plans: [], rooms: [], minBookingHours: null }
    const body = await res.json()
    return { plans: mapCueTiers(body), rooms: mapCueRooms(body), minBookingHours: minBookingHoursOf(body) }
  } catch {
    return { plans: [], rooms: [], minBookingHours: null }
  } finally {
    if (timer) clearTimeout(timer)
  }
}

/** Cue's minimum booking length in hours (the one checkout enforces), null when absent. */
export function minBookingHoursOf(body) {
  const n = toNumber(body?.min_booking_hours)
  return n > 0 ? n : null
}

/** Cue's live plans only. Never throws. */
export async function fetchCueTiers(opts) {
  return (await fetchCueMembership(opts)).plans
}

/** Cue's live plans merged with the Sanity tiers, falling back to them. Never throws. */
export async function loadPlans({ sanityTiers, ...opts } = {}) {
  const { plans, rooms } = await fetchCueMembership(opts)
  return mergePlans(plans, mapSanityTiers(sanityTiers), rooms)
}

/** One track's plans in display order: by commitment, then hours, then price. */
export function plansForTrack(plans, track) {
  return (plans ?? [])
    .filter(p => p.track === track)
    .sort((a, b) => a.commitmentMonths - b.commitmentMonths || a.hoursPerMonth - b.hoursPerMonth || a.monthlyPrice - b.monthlyPrice)
}

/** £25, £16.25: whole pounds without pence. */
export function formatPounds(amount) {
  const n = Number(amount)
  if (!Number.isFinite(n)) return ''
  return Number.isInteger(n) ? `£${n}` : `£${n.toFixed(2)}`
}

/** The selector's price line for a track: "£25/mo", or "from £100/mo" when prices differ. */
export function priceFromLabel(plans, track) {
  const prices = plansForTrack(plans, track).map(p => p.monthlyPrice)
  if (prices.length === 0) return ''
  const min = Math.min(...prices)
  const allSame = prices.every(p => p === min)
  return `${allSame ? '' : 'from '}${formatPounds(min)}/mo`
}

/** A producer plan's effective hourly rate, e.g. "£12.50/hr". Empty with no hours. */
export function perHourLabel(plan) {
  if (!plan || !(plan.hoursPerMonth > 0)) return ''
  return `${formatPounds(Math.round((plan.monthlyPrice / plan.hoursPerMonth) * 100) / 100)}/hr`
}

/**
 * Cue's founding-status body. `dj` and `producer` are places left, null when
 * unknown. `prices` maps DJ tier name to founding price in pounds (Cue sends
 * pence). Any other body, including the SPA's index.html, reads as unknown.
 */
export function parseFoundingStatus(body) {
  const remaining = v => (Number.isFinite(toNumber(v)) ? Math.max(0, toNumber(v)) : null)
  const cap = (v, d) => (toNumber(v) > 0 ? toNumber(v) : d)
  const prices = {}
  if (body && typeof body.prices === 'object' && body.prices) {
    for (const [name, pence] of Object.entries(body.prices)) {
      const n = toNumber(pence)
      if (n > 0) prices[name] = n / 100
    }
  }
  return {
    dj: remaining(body?.remaining),
    producer: remaining(body?.producer?.remaining),
    djCap: cap(body?.cap, DEFAULT_CAPS.dj),
    producerCap: cap(body?.producer?.cap, DEFAULT_CAPS.producer),
    prices,
  }
}

/**
 * The founding price to show on a DJ plan, or null for the standard price.
 * Follows the founding line's rule: the offer shows unless the pool is KNOWN to
 * be full (remaining 0); unknown keeps it. Cue's live price wins over the
 * Sanity-stored one. Producer founding is recognition only, never a discount.
 */
export function foundingPriceFor(plan, founding) {
  if (!plan || plan.track !== 'dj') return null
  if (founding?.dj === 0) return null
  const live = founding?.prices?.[plan.name]
  const price = live > 0 ? live : plan.foundingPrice
  return price > 0 && price < plan.monthlyPrice ? price : null
}

/** Fills "{months}" in a Sanity terms line with the plan's commitment. */
export function fillTerms(template, plan) {
  return String(template ?? '').replace(/\{months\}/g, String(plan?.commitmentMonths ?? ''))
}

// ── Producer savings ─────────────────────────────────────────────────────────

/** The room the producer plans book into, when Cue named one and gave its rate. */
export function producerRoom(plans, rooms) {
  const ids = new Set(plansForTrack(plans, 'producer').map(p => p.roomId).filter(Boolean))
  return (Array.isArray(rooms) ? rooms : []).find(r => ids.has(r.id)) ?? null
}

const pence = n => Math.round(n * 100) / 100

/**
 * What each producer plan saves against the room's public rate: the public
 * cost of the plan's hours, the member price, the effective hourly rate, and
 * the saving per hour, per month and as a percentage. Plans with no hours,
 * and plans that would not save anything, are left out. `featured` is the
 * 6-month 8-hour plan when there is one, else the biggest percentage saving.
 */
export function producerSavings(plans, rate) {
  if (!(rate > 0)) return { rate: null, rows: [], featuredKey: null }
  const rows = plansForTrack(plans, 'producer')
    .filter(p => p.hoursPerMonth > 0)
    .map(p => {
      const publicCost = pence(p.hoursPerMonth * rate)
      const perHour = pence(p.monthlyPrice / p.hoursPerMonth)
      const perMonth = pence(publicCost - p.monthlyPrice)
      return {
        key: p.key,
        name: p.name,
        hoursPerMonth: p.hoursPerMonth,
        commitmentMonths: p.commitmentMonths,
        publicCost,
        memberPrice: p.monthlyPrice,
        perHour,
        savingPerHour: pence(rate - perHour),
        savingPerMonth: perMonth,
        percent: Math.round((perMonth / publicCost) * 100),
      }
    })
    .filter(r => r.savingPerMonth > 0)
  const featured = rows.find(r => r.commitmentMonths === 6 && r.hoursPerMonth === 8)
    ?? [...rows].sort((a, b) => b.percent - a.percent || b.savingPerMonth - a.savingPerMonth)[0]
  return { rate, rows, featuredKey: featured?.key ?? null }
}

// ── Members-only hours ───────────────────────────────────────────────────────

/** Display order, Monday first. day_of_week is 0 = Sunday, as in Cue. */
export const WEEK = [
  { day: 1, short: 'Mon', long: 'Monday' }, { day: 2, short: 'Tue', long: 'Tuesday' },
  { day: 3, short: 'Wed', long: 'Wednesday' }, { day: 4, short: 'Thu', long: 'Thursday' },
  { day: 5, short: 'Fri', long: 'Friday' }, { day: 6, short: 'Sat', long: 'Saturday' },
  { day: 0, short: 'Sun', long: 'Sunday' },
]

const toMin = t => Number(t.slice(0, 2)) * 60 + Number(t.slice(3, 5))
/** [start, end) in minutes, an end at or before the start running past midnight. */
const span = (start, end) => {
  const s = toMin(start)
  let e = toMin(end)
  if (e <= s) e += 1440
  return [s, e]
}
/** Minutes as "19:00", wrapping past midnight. */
export const clock = m => `${String(Math.floor(m / 60) % 24).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`

function subtract([s, e], cut) {
  if (!cut || cut[1] <= s || cut[0] >= e) return [[s, e]]
  const out = []
  if (cut[0] > s) out.push([s, cut[0]])
  if (cut[1] < e) out.push([cut[1], e])
  return out
}
function merge(list) {
  const sorted = [...list].sort((a, b) => a[0] - b[0])
  const out = []
  for (const r of sorted) {
    const last = out[out.length - 1]
    if (last && r[0] <= last[1]) last[1] = Math.max(last[1], r[1])
    else out.push([...r])
  }
  return out
}

/**
 * The room's week for producers, Monday first: each day's public window
 * (null when closed to the public) and the members-only windows, which are
 * the gated hours a producer can book minus the public hours. A gated row
 * counts for producers when it is gated to the producer type or to one of
 * `producerTierIds`. Also returns the axis (earliest start, latest end) and
 * whether members-only time falls on weekday evenings and on weekends, which
 * the block's headline is built from.
 */
export function memberHoursWeek(room, producerTierIds = []) {
  const tierIds = new Set(producerTierIds)
  const gates = (room?.memberHours ?? []).filter(m => m.type === 'producer' || (m.tierId && tierIds.has(m.tierId)))
  const days = WEEK.map(w => {
    const a = (room?.availability ?? []).find(x => x.day === w.day)
    const pub = a?.isOpen ? span(a.open, a.close) : null
    const members = merge(gates.filter(g => g.day === w.day).flatMap(g => subtract(span(g.start, g.end), pub)))
    return { ...w, public: pub, members }
  })
  const all = days.flatMap(d => [...(d.public ? [d.public] : []), ...d.members])
  const axis = all.length ? [Math.min(...all.map(r => r[0])), Math.max(...all.map(r => r[1]))] : null
  const weekend = d => d.day === 0 || d.day === 6
  return {
    days,
    axis,
    hasEvenings: days.some(d => !weekend(d) && d.public && d.members.some(r => r[0] >= d.public[1])),
    hasWeekends: days.some(d => weekend(d) && d.members.length > 0),
  }
}

// ── Plan cards ───────────────────────────────────────────────────────────────

/**
 * A plan's card title. Producer tiers carry their hours and term in Cue's
 * name ("Producer Membership - 8hrs/mo (6 Month)"), so the title is built
 * from the hours ("8 hours a month") and the term shows as a pill instead.
 * Plans without hours keep their Cue name ("808 DJ").
 */
export function planDisplayName(plan) {
  if (!plan) return ''
  return plan.hoursPerMonth > 0 ? `${plan.hoursPerMonth} hours a month` : plan.name
}

/** The term pill: "6-month", or '' for a plan with no minimum term. */
export function termLabel(months) {
  return months > 0 ? `${months}-month` : ''
}

/** A stable anchor for a plan card, e.g. "plan-producer-8h-6m" or "plan-dj-808-resident". */
export function planSlug(plan) {
  if (!plan) return ''
  const tail = plan.hoursPerMonth > 0
    ? `${plan.hoursPerMonth}h-${plan.commitmentMonths}m`
    : nameKey(plan.name).replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
  return `plan-${plan.track}-${tail}`
}

/** A track's minimum terms in months, shortest first: [3, 6] for producers, [0] for DJs. */
export function planTerms(plans, track) {
  return [...new Set(plansForTrack(plans, track).map(p => p.commitmentMonths))].sort((a, b) => a - b)
}

/**
 * The term to show: the requested one when the track offers it, else the
 * longest (the cheaper per hour, and where the hero plan sits).
 */
export function pickTerm(plans, track, requested) {
  const terms = planTerms(plans, track)
  if (terms.length === 0) return 0
  const want = Number(requested)
  return terms.includes(want) ? want : terms[terms.length - 1]
}

/**
 * The one plan per track that gets the "Best value" treatment. Producer: the
 * 6-month 8-hour plan when there is one, else the lowest hourly rate (longest
 * term first). DJ: the entry plan, the cheapest.
 */
export function heroPlanKey(plans, track) {
  const list = plansForTrack(plans, track)
  if (list.length === 0) return null
  if (track === 'producer') {
    const pick = list.find(p => p.commitmentMonths === 6 && p.hoursPerMonth === 8)
      ?? [...list].filter(p => p.hoursPerMonth > 0)
        .sort((a, b) => a.monthlyPrice / a.hoursPerMonth - b.monthlyPrice / b.hoursPerMonth || b.commitmentMonths - a.commitmentMonths)[0]
    return pick?.key ?? null
  }
  return list.reduce((a, b) => (b.monthlyPrice < a.monthlyPrice ? b : a)).key
}

/**
 * The numbers under a card's price, the ones people compare. Producer plans:
 * the effective hourly rate and the monthly saving against the room's public
 * rate (`rate`, from Cue's rooms; no rate, no saving). DJ plans have no
 * hours: they show the booking credit that comes back every month
 * (Cue's monthly_credit_pence, or the Sanity tier's), null when there is none.
 */
export function planValue(plan, rate) {
  const none = { perHour: null, saving: null, credit: null }
  if (!plan) return none
  if (plan.hoursPerMonth > 0) {
    const perHour = pence(plan.monthlyPrice / plan.hoursPerMonth)
    const saving = rate > 0 ? pence(plan.hoursPerMonth * rate - plan.monthlyPrice) : 0
    return { ...none, perHour, saving: saving > 0 ? saving : null }
  }
  return plan.monthlyCredit > 0 ? { ...none, credit: plan.monthlyCredit } : none
}

/** The DJ card's credit line, "{credit}" filled: "£25 credit back every month, ...". Empty with no credit. */
export const DEFAULT_CREDIT_BACK_LINE = '{credit} credit back every month, plus member rates and members-only hours'
export function creditBackLine(template, credit) {
  if (!(credit > 0)) return ''
  return String(template || DEFAULT_CREDIT_BACK_LINE).replace(/\{credit\}/g, formatPounds(credit))
}

/**
 * The one founding line above a track's plans. Hidden once the pool is known
 * to be full. `remaining` null (count unknown) keeps the note and drops the
 * count and the bar, never a made-up number.
 */
export function foundingSummary(note, remaining, cap) {
  const label = String(note ?? '').trim()
  if (remaining === 0 || !label) return { show: false, label: '', count: '', taken: null, cap }
  if (remaining == null || !(cap > 0)) return { show: true, label, count: '', taken: null, cap }
  const left = Math.min(remaining, cap)
  return { show: true, label, count: `${left} of ${cap} places left`, taken: cap - left, cap }
}
