// Run: npm test

import { test } from 'node:test'
import assert from 'node:assert/strict'
import { splitStudioName, studioKey, studioLabel } from './studioName.js'

test('splitStudioName separates the room and the role, whatever the dash', () => {
  assert.deepEqual(splitStudioName({ name: 'Studio 1 — Performer', tagline: 'Performer' }), { room: 'Studio 1', role: 'Performer' })
  assert.deepEqual(splitStudioName({ name: 'Studio 3 – Pro DJ' }), { room: 'Studio 3', role: 'Pro DJ' })
  assert.deepEqual(splitStudioName({ name: 'Studio 4 - Producer' }), { room: 'Studio 4', role: 'Producer' })
})

test('splitStudioName prefers the tagline, and falls back to the number', () => {
  assert.deepEqual(splitStudioName({ name: 'Studio 4 — Production', tagline: 'Producer' }), { room: 'Studio 4', role: 'Producer' })
  assert.deepEqual(splitStudioName({ name: '', studioNumber: '02', tagline: 'Creator' }), { room: 'Studio 2', role: 'Creator' })
  assert.deepEqual(splitStudioName(null), { room: '', role: '' })
})

test('studioLabel never prints an em dash', () => {
  assert.equal(studioLabel({ name: 'Studio 1 — Performer' }), 'Studio 1, Performer')
  assert.ok(!studioLabel({ name: 'Studio 2 — Creator' }).includes('—'))
})

test('studioKey pads numbers to the bundled image keys', () => {
  assert.equal(studioKey('1'), '01')
  assert.equal(studioKey('04'), '04')
  assert.equal(studioKey(3), '03')
})
