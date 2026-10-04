// Run: npm test

import { test } from 'node:test'
import assert from 'node:assert/strict'
import { mapCueRooms, minBookingHoursOf } from './membershipPlans.js'
import { daysLabel, fillMinHours, fromPrice, fromPriceLine, hoursText, minimumText, priceRows, sharedDays } from './roomPricing.js'

// Studio 4 as Cue's tiers endpoint returns it (2026-10-04, after access-hub #548).
const weekday = d => [
  { day_of_week: d, start_time: '10:00', end_time: '14:00', label: 'Super Off-Peak', price_per_hour: 37.5 },
  { day_of_week: d, start_time: '14:00', end_time: '16:00', label: 'Off-Peak', price_per_hour: 40 },
  { day_of_week: d, start_time: '16:00', end_time: d === 5 ? '21:00' : '19:00', label: 'Peak', price_per_hour: 55 },
]
const BODY = {
  min_booking_hours: 2,
  rooms: [{ id: 's4', name: 'Studio 4', price_per_hour: 55, availability: [], member_hours: [], bands: [1, 2, 3, 4, 5].flatMap(weekday) }],
}
const BANDS = mapCueRooms(BODY)[0].bands

test('mapCueRooms reads the bands, and [] from a Cue without them', () => {
  assert.equal(BANDS.length, 15)
  assert.deepEqual(BANDS[0], { day: 1, start: '10:00', end: '14:00', label: 'Super Off-Peak', price: 37.5 })
  assert.deepEqual(mapCueRooms({ rooms: [{ id: 'x', name: 'X', price_per_hour: 30 }] })[0].bands, [])
})

test('mapCueRooms drops bands with no price or no times', () => {
  const bands = mapCueRooms({ rooms: [{ id: 'x', bands: [
    { day_of_week: 1, start_time: '10:00', end_time: '12:00', label: 'Free', price_per_hour: 0 },
    { day_of_week: 1, start_time: null, end_time: '12:00', label: 'Broken', price_per_hour: 20 },
  ] }] })[0].bands
  assert.deepEqual(bands, [])
})

test('minBookingHoursOf reads Cue\'s minimum, null when absent', () => {
  assert.equal(minBookingHoursOf(BODY), 2)
  assert.equal(minBookingHoursOf({}), null)
  assert.equal(minBookingHoursOf({ min_booking_hours: 0 }), null)
})

test('priceRows: Studio 4\'s three weekday bands, cheapest first, Friday\'s late peak as a note', () => {
  const rows = priceRows(BANDS)
  assert.deepEqual(rows.map(r => [r.label, r.price, r.start, r.end, r.days, r.notes]), [
    ['Super Off-Peak', 37.5, '10:00', '14:00', 'Weekdays', []],
    ['Off-Peak', 40, '14:00', '16:00', 'Weekdays', []],
    ['Peak', 55, '16:00', '19:00', 'Weekdays', ['Fri to 21:00']],
  ])
  assert.deepEqual(rows.map(r => Math.round(r.share * 9)), [4, 2, 3], 'shares of the 9-hour weekday')
  assert.equal(sharedDays(rows), 'Weekdays')
})

test('priceRows follows a price change in Cue, never a stored copy', () => {
  const cheaper = BANDS.map(b => (b.label === 'Super Off-Peak' ? { ...b, price: 35 } : b))
  assert.equal(priceRows(cheaper)[0].price, 35)
  assert.equal(fromPrice(cheaper), 35)
})

test('fromPrice and fromPriceLine lead with the lowest band, empty with none', () => {
  assert.equal(fromPrice(BANDS), 37.5)
  assert.equal(fromPriceLine(BANDS, 2), 'From £37.50/hr · 2hr min')
  assert.equal(fromPriceLine(BANDS, null), 'From £37.50/hr')
  assert.equal(fromPrice([]), null)
  assert.equal(fromPriceLine([], 2), '')
})

test('daysLabel names day sets the way people say them', () => {
  assert.equal(daysLabel([1, 2, 3, 4, 5]), 'Weekdays')
  assert.equal(daysLabel([0, 6]), 'Weekends')
  assert.equal(daysLabel([1, 2, 3, 4]), 'Mon to Thu')
  assert.equal(daysLabel([5]), 'Fri')
  assert.equal(daysLabel([1, 3]), 'Mon, Wed')
  assert.equal(daysLabel([0, 1, 2, 3, 4, 5, 6]), 'Every day')
})

test('hoursText and minimumText', () => {
  assert.equal(hoursText(2), '2 hours')
  assert.equal(hoursText(1), '1 hour')
  assert.equal(minimumText(2), '2-hour minimum')
  assert.equal(minimumText(null), '')
})

test('fillMinHours derives the minimum from Cue, and never shows a raw placeholder', () => {
  const copy = 'Book sessions of {minHours} or more, any combination, until your hours are used.'
  assert.equal(fillMinHours(copy, 2), 'Book sessions of 2 hours or more, any combination, until your hours are used.')
  assert.equal(fillMinHours(copy, 3), 'Book sessions of 3 hours or more, any combination, until your hours are used.')
  assert.equal(fillMinHours(copy, null), 'Book sessions in any combination, until your hours are used.')
  assert.equal(fillMinHours('No placeholder here.', 2), 'No placeholder here.')
  assert.ok(!fillMinHours('At least {minHours}.', null).includes('{'))
})
