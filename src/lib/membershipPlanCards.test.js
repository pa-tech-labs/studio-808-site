// Run: npm test

import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
  foundingSummary, heroPlanKey, mapCueTiers, parseFoundingStatus, pickTerm, planDisplayName, planSlug, planTerms,
  planValue, termLabel, creditBackLine,
} from './membershipPlans.js'

// Cue's live tiers (2026-10-04), trimmed to the fields the cards read.
const PLANS = mapCueTiers({
  tiers: [
    { id: 'dj', name: '808 DJ', monthly_price: 25, hours_per_month: 0, commitment_months: 0, membership_type: 'dj', monthly_credit_pence: 2500 },
    { id: 'resident', name: '808 Resident', monthly_price: 50, hours_per_month: 0, commitment_months: 0, membership_type: 'dj', monthly_credit_pence: 5000 },
    { id: 'p8-3', name: 'Producer Membership - 8hrs/mo (3 Month)', monthly_price: 160, hours_per_month: 8, commitment_months: 3, membership_type: 'producer' },
    { id: 'p16-3', name: 'Producer Membership - 16hrs/mo (3 Month)', monthly_price: 260, hours_per_month: 16, commitment_months: 3, membership_type: 'producer' },
    { id: 'p8-6', name: 'Producer Membership - 8hrs/mo (6 Month)', monthly_price: 100, hours_per_month: 8, commitment_months: 6, membership_type: 'producer' },
    { id: 'p16-6', name: 'Producer Membership - 16hrs/mo (6 Month)', monthly_price: 200, hours_per_month: 16, commitment_months: 6, membership_type: 'producer' },
  ],
})
const plan = key => PLANS.find(p => p.key === key)
const FOUNDING = parseFoundingStatus({ cap: 15, remaining: 6, prices: { '808 DJ': 2000, '808 Resident': 4500 }, producer: { cap: 3, remaining: 2 } })

test('planDisplayName builds producer titles from the hours and keeps DJ names', () => {
  assert.equal(planDisplayName(plan('p8-6')), '8 hours a month')
  assert.equal(planDisplayName(plan('p16-3')), '16 hours a month')
  assert.equal(planDisplayName(plan('resident')), '808 Resident')
  assert.equal(planDisplayName(null), '')
})

test('termLabel is a pill for a minimum term and empty without one', () => {
  assert.equal(termLabel(6), '6-month')
  assert.equal(termLabel(0), '')
})

test('planSlug gives every tier a distinct anchor', () => {
  assert.equal(planSlug(plan('p8-6')), 'plan-producer-8h-6m')
  assert.equal(planSlug(plan('resident')), 'plan-dj-808-resident')
  assert.equal(new Set(PLANS.map(planSlug)).size, PLANS.length)
})

test('planTerms and pickTerm: producers default to the longest term, a valid request wins', () => {
  assert.deepEqual(planTerms(PLANS, 'producer'), [3, 6])
  assert.deepEqual(planTerms(PLANS, 'dj'), [0])
  assert.equal(pickTerm(PLANS, 'producer', null), 6)
  assert.equal(pickTerm(PLANS, 'producer', '3'), 3)
  assert.equal(pickTerm(PLANS, 'producer', '12'), 6, 'an unknown term falls back')
  assert.equal(pickTerm([], 'producer', '3'), 0)
})

test('heroPlanKey picks the 6-month 8-hour producer plan and the entry DJ plan', () => {
  assert.equal(heroPlanKey(PLANS, 'producer'), 'p8-6')
  assert.equal(heroPlanKey(PLANS, 'dj'), 'dj')
  assert.equal(heroPlanKey([], 'dj'), null)
})

test('heroPlanKey falls back to the lowest hourly rate when there is no 6-month 8-hour plan', () => {
  const without = PLANS.filter(p => p.key !== 'p8-6')
  assert.equal(heroPlanKey(without, 'producer'), 'p16-6')
})

test('planValue: producer plans save against the room rate, matching the savings block', () => {
  assert.deepEqual(planValue(plan('p8-6'), 55), { perHour: 12.5, saving: 340, credit: null })
  assert.deepEqual(planValue(plan('p16-3'), 55), { perHour: 16.25, saving: 620, credit: null })
  assert.deepEqual(planValue(plan('p8-6'), null), { perHour: 12.5, saving: null, credit: null }, 'no rate, no saving')
})

test('planValue: DJ plans show the monthly credit from Cue, never a hardcoded figure', () => {
  assert.deepEqual(planValue(plan('dj'), 55), { perHour: null, saving: null, credit: 25 })
  assert.deepEqual(planValue(plan('resident'), 55), { perHour: null, saving: null, credit: 50 })
  assert.deepEqual(planValue({ ...plan('dj'), monthlyCredit: null }, 55), { perHour: null, saving: null, credit: null })
})

test('creditBackLine fills {credit} and hides with no credit', () => {
  assert.equal(creditBackLine(null, 25), '£25 credit back every month, plus member rates and members-only hours')
  assert.equal(creditBackLine('{credit} back, monthly', 50), '£50 back, monthly')
  assert.equal(creditBackLine('{credit} back', 12.5), '£12.50 back')
  assert.equal(creditBackLine(null, null), '')
  assert.equal(creditBackLine(null, 0), '')
})

test('mapCueTiers reads monthly_credit_pence as pounds', () => {
  assert.equal(plan('dj').monthlyCredit, 25)
  assert.equal(plan('p8-6').monthlyCredit, null)
})

test('foundingSummary: one line with a count and places taken, never a made-up count', () => {
  assert.deepEqual(foundingSummary('Founding price, locked for life', 2, 3), {
    show: true, label: 'Founding price, locked for life', count: '2 of 3 places left', taken: 1, cap: 3,
  })
  const unknown = foundingSummary('Founding price, locked for life', null, 3)
  assert.equal(unknown.show, true)
  assert.equal(unknown.count, '')
  assert.equal(unknown.taken, null)
  assert.equal(foundingSummary('Founding price, locked for life', 0, 3).show, false, 'gone once full')
  assert.equal(foundingSummary('', 2, 3).show, false, 'no copy, no line')
})
