// A room's public price list, from Cue's bands (the tiers endpoint's
// rooms[].bands, access-hub #548): the pure part, so the node:test suite can
// check it. Nothing here hardcodes a price, a time or a minimum: when Cue sends
// no bands, every function returns its empty answer and the page falls back
// to the Sanity values.
//
// Plain JS with a .d.ts beside it, like membershipPlans.js.

import { formatPounds } from './membershipPlans.js'

const DAY_SHORT = { 0: 'Sun', 1: 'Mon', 2: 'Tue', 3: 'Wed', 4: 'Thu', 5: 'Fri', 6: 'Sat' }
/** Monday first, Sunday last: the order the days read in. */
const weekOrder = d => (d === 0 ? 7 : d)
const toMin = t => Number(t.slice(0, 2)) * 60 + Number(t.slice(3, 5))
/** Minutes in [start, end), an end at or before the start running past midnight. */
const spanMinutes = (start, end) => {
  const s = toMin(start)
  let e = toMin(end)
  if (e <= s) e += 1440
  return e - s
}

/** "Weekdays", "Weekends", "Every day", "Mon to Thu", "Mon, Wed" or "Fri". */
export function daysLabel(days) {
  const set = [...new Set(days)].sort((a, b) => weekOrder(a) - weekOrder(b))
  const key = set.join(',')
  if (key === '1,2,3,4,5') return 'Weekdays'
  if (key === '6,0') return 'Weekends'
  if (set.length === 7) return 'Every day'
  if (set.length === 1) return DAY_SHORT[set[0]]
  const run = set.every((d, i) => i === 0 || weekOrder(d) === weekOrder(set[i - 1]) + 1)
  return run ? `${DAY_SHORT[set[0]]} to ${DAY_SHORT[set[set.length - 1]]}` : set.map(d => DAY_SHORT[d]).join(', ')
}

/** "From" price: the lowest band, or null with no bands. */
export function fromPrice(bands) {
  const prices = (bands ?? []).map(b => b.price).filter(p => p > 0)
  return prices.length ? Math.min(...prices) : null
}

/**
 * The bands as rows people read, cheapest first: one per label and price,
 * with its usual window and any day that runs differently as a note.
 * Studio 4's live bands give:
 *   Super Off-Peak  Weekdays 10:00 to 14:00  £37.50
 *   Off-Peak        Weekdays 14:00 to 16:00  £40
 *   Peak            Weekdays 16:00 to 19:00  £55   note "Fri to 21:00"
 * `share` is the row's usual window as a fraction of all rows' windows
 * together, for the bar beside it.
 */
export function priceRows(bands) {
  const groups = new Map()
  for (const b of bands ?? []) {
    const key = `${b.label}|${b.price}`
    if (!groups.has(key)) groups.set(key, { label: b.label, price: b.price, entries: [] })
    groups.get(key).entries.push(b)
  }
  const rows = [...groups.values()].map(g => {
    // The usual window: the one most days share (earliest start on a tie).
    const counts = new Map()
    for (const e of g.entries) counts.set(`${e.start}-${e.end}`, (counts.get(`${e.start}-${e.end}`) ?? 0) + 1)
    const [usual] = [...counts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))[0]
    const [start, end] = usual.split('-')
    const others = g.entries.filter(e => `${e.start}-${e.end}` !== usual)
    // Group the exceptions by their own window, so "Fri to 21:00" reads once.
    const byWindow = new Map()
    for (const e of others) {
      const k = `${e.start}-${e.end}`
      if (!byWindow.has(k)) byWindow.set(k, { start: e.start, end: e.end, days: [] })
      byWindow.get(k).days.push(e.day)
    }
    const notes = [...byWindow.values()].map(x =>
      x.start === start ? `${daysLabel(x.days)} to ${x.end}` : `${daysLabel(x.days)} ${x.start} to ${x.end}`)
    return {
      label: g.label,
      price: g.price,
      start,
      end,
      days: daysLabel(g.entries.map(e => e.day)),
      notes,
      minutes: spanMinutes(start, end),
    }
  })
  rows.sort((a, b) => a.price - b.price || toMin(a.start) - toMin(b.start))
  const total = rows.reduce((n, r) => n + r.minutes, 0)
  return rows.map(({ minutes, ...r }) => ({ ...r, share: total > 0 ? minutes / total : 0 }))
}

/** The days every row shares ("Weekdays"), or '' when the rows differ. */
export function sharedDays(rows) {
  const days = [...new Set((rows ?? []).map(r => r.days))]
  return days.length === 1 ? days[0] : ''
}

/** "2 hours", "1 hour", "1.5 hours". */
export function hoursText(hours) {
  const n = Math.round(Number(hours) * 100) / 100
  return `${n} hour${n === 1 ? '' : 's'}`
}

/** "2-hour minimum". Empty without a minimum. */
export function minimumText(hours) {
  const n = Math.round(Number(hours) * 100) / 100
  return n > 0 ? `${n}-hour minimum` : ''
}

/** "From £37.50/hr · 2hr min": the short price line for cards and bars. Empty with no bands. */
export function fromPriceLine(bands, minHours) {
  const from = fromPrice(bands)
  if (from == null) return ''
  return minHours > 0 ? `From ${formatPounds(from)}/hr · ${minHours}hr min` : `From ${formatPounds(from)}/hr`
}

/**
 * Fills {minHours} in Sanity copy with Cue's minimum ("2 hours"). Without a
 * minimum, "sessions of {minHours} or more, any combination," reads as
 * "sessions in any combination,", and any other {minHours} is dropped, so
 * the sentence never shows a raw placeholder.
 */
export function fillMinHours(text, minHours) {
  const t = String(text ?? '')
  if (!t.includes('{minHours}')) return t
  if (Number(minHours) > 0) return t.replace(/\{minHours\}/g, hoursText(minHours))
  return t
    .replace(/sessions of \{minHours\} or more, any combination/g, 'sessions in any combination')
    .replace(/\s*\{minHours\}/g, '')
}
