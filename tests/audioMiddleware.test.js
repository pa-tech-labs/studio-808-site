// middleware.ts: the www and apex /audio 301 to voice.studio-808.com, gated
// on AUDIO_SUBDOMAIN_LIVE. Imports the real middleware (Node strips the
// TypeScript) and its decision helper.
//
// Run: npm test

import { test, afterEach } from 'node:test'
import assert from 'node:assert/strict'
import middleware, { config } from '../middleware.ts'
import { audioRedirectTarget, subdomainLive } from '../src/lib/audioRedirect.js'

afterEach(() => { delete process.env.AUDIO_SUBDOMAIN_LIVE })

const req = (url, host = new URL(url).host) => new Request(url, { headers: { host } })
const passesThrough = res => res.headers.get('x-middleware-next') === '1' && !res.headers.get('location')

test('matcher covers /audio and everything under it', () => {
  assert.deepEqual(config.matcher, ['/audio', '/audio/:path*'])
  assert.equal(config.runtime, 'nodejs')
})

test('not live (unset): every /audio request passes through', () => {
  for (const url of ['https://www.studio-808.com/audio', 'https://www.studio-808.com/audio/terms', 'https://studio-808.com/audio']) {
    const res = middleware(req(url))
    assert.equal(passesThrough(res), true, url)
    assert.notEqual(res.status, 301, url)
  }
})

test('not live: anything other than the exact string "true" counts as off', () => {
  for (const v of ['', 'false', 'TRUE', '1', 'yes', ' true']) {
    process.env.AUDIO_SUBDOMAIN_LIVE = v
    assert.equal(passesThrough(middleware(req('https://www.studio-808.com/audio'))), true, JSON.stringify(v))
  }
})

test('live: www and apex /audio paths 301 to the subdomain, path and query kept', () => {
  process.env.AUDIO_SUBDOMAIN_LIVE = 'true'
  const cases = [
    ['https://www.studio-808.com/audio', 'https://voice.studio-808.com/'],
    ['https://www.studio-808.com/audio/', 'https://voice.studio-808.com/'],
    ['https://www.studio-808.com/audio/terms', 'https://voice.studio-808.com/terms'],
    ['https://www.studio-808.com/audio?utm_source=x', 'https://voice.studio-808.com/?utm_source=x'],
    ['https://studio-808.com/audio/terms', 'https://voice.studio-808.com/terms'],
  ]
  for (const [from, to] of cases) {
    const res = middleware(req(from))
    assert.equal(res.status, 301, from)
    assert.equal(res.headers.get('location'), to, from)
  }
})

test('live: other hosts and look-alike paths pass through', () => {
  process.env.AUDIO_SUBDOMAIN_LIVE = 'true'
  for (const url of [
    'https://voice.studio-808.com/audio',          // the subdomain's own /audio: vercel.json 404s it
    'https://audio.studio-808.com/audio',          // the old host: vercel.json 301s it to voice
    'https://studio-808-site-abc.vercel.app/audio', // preview deployments keep /audio
    'http://localhost:5173/audio',
    'https://www.studio-808.com/audiobooks',        // not /audio or /audio/...
  ]) {
    assert.equal(passesThrough(middleware(req(url))), true, url)
  }
})

test('the helper on its own', () => {
  assert.equal(subdomainLive({ AUDIO_SUBDOMAIN_LIVE: 'true' }), true)
  assert.equal(subdomainLive({}), false)
  assert.equal(subdomainLive(undefined), false)
  const live = { AUDIO_SUBDOMAIN_LIVE: 'true' }
  assert.equal(audioRedirectTarget('https://www.studio-808.com/audio', 'WWW.Studio-808.com:443', live), 'https://voice.studio-808.com/')
  assert.equal(audioRedirectTarget('https://www.studio-808.com/audio', 'www.studio-808.com', {}), null)
  assert.equal(audioRedirectTarget('https://www.studio-808.com/', 'www.studio-808.com', live), null)
})
