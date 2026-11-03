// Run: npm test

import { test } from 'node:test'
import assert from 'node:assert/strict'
import { CONSENT_MAX_AGE_MS, adsConversion, consentRecord, ga4Id, readConsent, trackingEvents } from './voiceTracking.js'

const NOW = Date.parse('2026-11-03T12:00:00Z')

test('readConsent: round-trips a fresh choice', () => {
  assert.equal(readConsent(consentRecord('granted', NOW), NOW), 'granted')
  assert.equal(readConsent(consentRecord('denied', NOW), NOW), 'denied')
})

test('readConsent: no choice, junk, or an expired choice asks again', () => {
  for (const raw of [null, undefined, '', 'granted', '{', '{"choice":"maybe","at":"2026-11-01T00:00:00Z"}', '{"choice":"granted"}']) {
    assert.equal(readConsent(raw, NOW), null, String(raw))
  }
  assert.equal(readConsent(consentRecord('granted', NOW - CONSENT_MAX_AGE_MS - 1), NOW), null)
  assert.equal(readConsent(consentRecord('granted', NOW - CONSENT_MAX_AGE_MS + 1000), NOW), 'granted')
})

test('consentRecord: anything but granted is stored as denied', () => {
  assert.equal(JSON.parse(consentRecord('yes', NOW)).choice, 'denied')
})

test('ga4Id: accepts G- ids only', () => {
  assert.equal(ga4Id(' g-abc123xyz '), 'G-ABC123XYZ')
  for (const v of [undefined, '', 'UA-1234-1', 'AW-123456789', 'G-<script>']) assert.equal(ga4Id(v), '', String(v))
})

test('adsConversion: needs the full AW-id/label send_to', () => {
  assert.deepEqual(adsConversion('AW-123456789/AbC-dEf_1'), { tagId: 'AW-123456789', sendTo: 'AW-123456789/AbC-dEf_1' })
  for (const v of [undefined, '', 'AW-123456789', '123456789/abc', 'AW-123456789/'] ) assert.equal(adsConversion(v), null, String(v))
})

test('trackingEvents: an enquiry is a GA4 generate_lead', () => {
  assert.deepEqual(trackingEvents('audio:enquiry', { projectType: 'Audiobook', source: 'Google search' }), [
    ['generate_lead', { project_type: 'Audiobook', lead_source: 'Google search', form: 'voice_enquiry' }],
  ])
})

test('trackingEvents: plus an Ads conversion when one is configured', () => {
  const ads = adsConversion('AW-123456789/abc')
  const events = trackingEvents('audio:enquiry', { projectType: 'Commercial', source: 'Referral' }, { ads })
  assert.equal(events.length, 2)
  assert.deepEqual(events[1], ['conversion', { send_to: 'AW-123456789/abc' }])
})

test('trackingEvents: showreel events, and nothing for unknown types', () => {
  assert.deepEqual(trackingEvents('audio:play', { clipId: 'c1', title: 'Smile', mediaType: 'video' }), [
    ['audio_play', { clip_id: 'c1', clip_title: 'Smile', media_type: 'video' }],
  ])
  assert.equal(trackingEvents('audio:complete', {})[0][0], 'audio_complete')
  assert.deepEqual(trackingEvents('audio:nope', {}), [])
})
