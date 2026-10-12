// Run: npm test

import { test } from 'node:test'
import assert from 'node:assert/strict'
import { audioBasePath, audioPageOf, audioPath, isAudioHost } from './audioHost.js'
import { audioBaseUrl, audioCanonical, buildAudioHead, buildAudioJsonLd } from './audioSeo.js'

const SUB = 'voice.studio-808.com'

test('only voice.studio-808.com is the audio host (case and port ignored)', () => {
  assert.equal(isAudioHost(SUB), true)
  assert.equal(isAudioHost('VOICE.Studio-808.com'), true)
  assert.equal(isAudioHost('voice.studio-808.com:443'), true)
  for (const h of ['audio.studio-808.com', 'www.studio-808.com', 'studio-808.com', 'voice.studio-808.com.evil.example', 'xvoice.studio-808.com', 'localhost:5173', '', null, undefined]) {
    assert.equal(isAudioHost(h), false, String(h))
  }
})

test('paths: root on the subdomain, /audio elsewhere', () => {
  assert.equal(audioBasePath(SUB), '')
  assert.equal(audioBasePath('www.studio-808.com'), '/audio')
  assert.equal(audioPath(SUB), '/')
  assert.equal(audioPath(SUB, 'terms'), '/terms')
  assert.equal(audioPath(SUB, 'home', 'rates'), '/#rates')
  assert.equal(audioPath('www.studio-808.com'), '/audio')
  assert.equal(audioPath('www.studio-808.com', 'terms'), '/audio/terms')
  assert.equal(audioPath('localhost:5173', 'home', 'faq'), '/audio#faq')
})

test('which audio page a pathname is', () => {
  assert.equal(audioPageOf(SUB, '/'), 'home')
  assert.equal(audioPageOf(SUB, '/terms'), 'terms')
  assert.equal(audioPageOf(SUB, '/terms/'), 'terms')
  assert.equal(audioPageOf(SUB, '/audio'), null)
  assert.equal(audioPageOf('www.studio-808.com', '/audio'), 'home')
  assert.equal(audioPageOf('www.studio-808.com', '/audio/'), 'home')
  assert.equal(audioPageOf('www.studio-808.com', '/audio/terms'), 'terms')
  assert.equal(audioPageOf('www.studio-808.com', '/'), null)
})

test('canonical, OG url and JSON-LD url follow the host when no canonicalUrl is set', () => {
  const page = { seo: {} }
  assert.equal(audioBaseUrl(page, 'https://voice.studio-808.com'), 'https://voice.studio-808.com')
  assert.equal(audioCanonical(page, 'home', 'https://voice.studio-808.com'), 'https://voice.studio-808.com/')
  assert.equal(audioCanonical(page, 'terms', 'https://voice.studio-808.com'), 'https://voice.studio-808.com/terms')
  assert.equal(audioCanonical(page, 'terms', 'https://www.studio-808.com'), 'https://www.studio-808.com/audio/terms')
  const head = buildAudioHead({ page, route: 'terms', origin: 'https://voice.studio-808.com' })
  assert.equal(head.og.url, 'https://voice.studio-808.com/terms')
  const ld = buildAudioJsonLd({ data: { page, clips: [], credits: [] }, origin: 'https://voice.studio-808.com' })
  assert.equal(ld['@graph'][0].url, 'https://voice.studio-808.com/')
  assert.equal(ld['@graph'][0]['@id'], 'https://voice.studio-808.com/#business')
})
