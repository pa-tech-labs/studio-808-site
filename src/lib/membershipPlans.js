// Membership plans for the /membership page: the pure logic, with no React
// and no Sanity client, so the page and the node:test suite share one copy.
// Plain JS with a .d.ts beside it, like studioFinder.js.
//
// Plan names and prices come from Cue's public tiers endpoint at render time.
// The tiers stored on the Sanity membershipPage singleton are the fallback
// when that request fails, and also where "What's included" comes from: a
// Cue tier picks up the included list of the Sanity tier with the same name.

/** Cue's API host. book.studio-808.com serves only the booking SPA, so an
 *  /api path there answers with index.html, never JSON. */
export const CUE_API_URL = 'https://access-hub-production.up.railway.app'

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
      included: cleanList(t.perks),
    })
  }
  return plans
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
    plans.push({
      key: t._key || `${t.track}-${nameKey(name)}`,
      track: t.track,
      name,
      monthlyPrice,
      hoursPerMonth: Math.max(0, toNumber(t.hoursPerMonth) || 0),
      commitmentMonths: Math.max(0, toNumber(t.commitmentMonths) || 0),
      foundingPrice: founding > 0 ? founding : null,
      included: cleanList(t.included),
    })
  }
  return plans
}

/**
 * The plans to show. Cue's plans win whenever Cue returned any: names,
 * prices, hours and terms are Cue's, and each takes the included list and
 * founding price of the Sanity tier with the same name (Cue's own perks when
 * there is none). With nothing from Cue, the Sanity tiers are used as they are.
 */
export function mergePlans(cuePlans, sanityPlans) {
  const cue = Array.isArray(cuePlans) ? cuePlans : []
  const stored = Array.isArray(sanityPlans) ? sanityPlans : []
  if (cue.length === 0) return { plans: stored, source: 'sanity' }
  const byName = new Map(stored.map(p => [`${p.track}:${nameKey(p.name)}`, p]))
  const plans = cue.map(p => {
    const match = byName.get(`${p.track}:${nameKey(p.name)}`)
    return {
      ...p,
      included: match?.included.length ? match.included : p.included,
      foundingPrice: match?.foundingPrice ?? p.foundingPrice,
    }
  })
  return { plans, source: 'cue' }
}

/**
 * Cue's live plans. Never throws: a network error, a timeout, a non-2xx or a
 * non-JSON body (the SPA's index.html) all come back as [], which
 * mergePlans reads as "use the Sanity tiers".
 */
export async function fetchCueTiers({ fetchImpl = globalThis.fetch, apiUrl = CUE_API_URL, tenantId = CUE_TENANT_ID, timeoutMs = 6000 } = {}) {
  const controller = typeof AbortController === 'function' ? new AbortController() : null
  const timer = controller ? setTimeout(() => controller.abort(), timeoutMs) : null
  try {
    const res = await fetchImpl(tiersUrl(apiUrl, tenantId), controller ? { signal: controller.signal } : undefined)
    return res?.ok ? mapCueTiers(await res.json()) : []
  } catch {
    return []
  } finally {
    if (timer) clearTimeout(timer)
  }
}

/** Cue's live plans merged with the Sanity tiers, falling back to them. Never throws. */
export async function loadPlans({ sanityTiers, ...opts } = {}) {
  return mergePlans(await fetchCueTiers(opts), mapSanityTiers(sanityTiers))
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
 * Follows FoundingBadge's rule: the offer shows unless the pool is KNOWN to
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
