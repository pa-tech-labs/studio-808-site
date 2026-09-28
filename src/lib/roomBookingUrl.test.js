// Run: npm test   (node's built-in runner, no extra dependencies)

import { test } from 'node:test'
import assert from 'node:assert/strict'
import { BOOKING_PAGE_URL, CUE_ROOM_SLUG_PATTERN, roomBookingUrl } from './roomBookingUrl.js'

test('slug present: adds ?room= to the booking page', () => {
  assert.equal(roomBookingUrl('studio-2'), 'https://book.studio-808.com/book?room=studio-2')
  assert.equal(roomBookingUrl('studio-4'), 'https://book.studio-808.com/book?room=studio-4')
})

test('slug present with surrounding space: trimmed', () => {
  assert.equal(roomBookingUrl('  studio-1 '), 'https://book.studio-808.com/book?room=studio-1')
})

test('slug missing: plain booking page, never a guessed room', () => {
  for (const missing of [null, undefined, '', '   ']) {
    assert.equal(roomBookingUrl(missing), BOOKING_PAGE_URL)
  }
})

test('slug malformed: plain booking page', () => {
  for (const bad of ['Studio-2', 'studio 2', 'studio_2', 'studio-2&x=1', 'x'.repeat(41), 42]) {
    assert.equal(roomBookingUrl(bad), BOOKING_PAGE_URL)
  }
})

test('existing query params on the base are kept', () => {
  const base = 'https://book.studio-808.com/book?utm_source=site&utm_campaign=dj'
  assert.equal(
    roomBookingUrl('studio-3', base),
    'https://book.studio-808.com/book?utm_source=site&utm_campaign=dj&room=studio-3',
  )
})

test('existing query params are kept when the slug is missing', () => {
  const base = 'https://book.studio-808.com/book?utm_source=site'
  assert.equal(roomBookingUrl(null, base), base)
})

test('a room param already on the base is replaced, not duplicated', () => {
  assert.equal(
    roomBookingUrl('studio-2', 'https://book.studio-808.com/book?room=studio-1&utm_source=site'),
    'https://book.studio-808.com/book?room=studio-2&utm_source=site',
  )
})

test('a hash on the base survives', () => {
  assert.equal(
    roomBookingUrl('studio-1', 'https://book.studio-808.com/book?utm_source=site#top'),
    'https://book.studio-808.com/book?utm_source=site&room=studio-1#top',
  )
})

test('slug pattern matches the booking side: lowercase, digits, hyphens, 1 to 40', () => {
  assert.ok(CUE_ROOM_SLUG_PATTERN.test('studio-1'))
  assert.ok(CUE_ROOM_SLUG_PATTERN.test('x'.repeat(40)))
  assert.ok(!CUE_ROOM_SLUG_PATTERN.test(''))
  assert.ok(!CUE_ROOM_SLUG_PATTERN.test('x'.repeat(41)))
  assert.ok(!CUE_ROOM_SLUG_PATTERN.test('Studio-1'))
})
