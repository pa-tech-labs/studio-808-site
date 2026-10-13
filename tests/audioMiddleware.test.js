// middleware.ts: the www and apex /audio 301 to voice.studio-808.com, gated
// on AUDIO_SUBDOMAIN_LIVE. Imports the real middleware (Node strips the
// TypeScript) and its decision helper.
//
// Run: npm test

import { test, afterEach } from 'node:test'
import assert from 'node:assert/strict'
import middleware, { config } from '../middleware.ts'
import { audioMiddlewareAction, audioRedirectTarget, subdomainLive } from '../src/lib/audioRedirect.js'

afterEach(() => { delete process.env.AUDIO_SUBDOMAIN_LIVE })

const req = (url, host = new URL(url).host) => new Request(url, { headers: { host } })
const passesThrough = res => res.headers.get('x-middleware-next') === '1' && !res.headers.get('location')
const rewritesTo = res => res.headers.get('x-middleware-rewrite')

test('matcher covers /audio and everything under it', () => {
  assert.deepEqual(config.matcher, ['/audio', '/audio/:path*'])
  assert.equal(config.runtime, 'nodejs')
})

test('not live (unset): www and apex /audio pages get the app shell, never a 301', () => {
  // vercel.json has no www or apex /audio rule (it would end the request
  // before Vercel ever reached the middleware), so the shell comes from here.
  for (const url of ['https://www.studio-808.com/audio', 'https://www.studio-808.com/audio/', 'https://www.studio-808.com/audio/terms', 'https://studio-808.com/audio']) {
    const res = middleware(req(url))
    assert.notEqual(res.status, 301, url)
    assert.equal(res.headers.get('location'), null, url)
    assert.equal(rewritesTo(res), `${new URL(url).origin}/index.html`, url)
  }
})

test('not live: anything other than the exact string "true" counts as off', () => {
  for (const v of ['', 'false', 'TRUE', '1', 'yes', ' true']) {
    process.env.AUDIO_SUBDOMAIN_LIVE = v
    const res = middleware(req('https://www.studio-808.com/audio'))
    assert.equal(res.status === 301 || res.headers.get('location') !== null, false, JSON.stringify(v))
    assert.equal(rewritesTo(res), 'https://www.studio-808.com/index.html', JSON.stringify(v))
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
    'https://www.studio-808.com/audio/studio-808-wordmark.png', // a file in public/audio, not a page
  ]) {
    assert.equal(passesThrough(middleware(req(url))), true, url)
  }
})

test('files under /audio are never redirected or rewritten', () => {
  for (const live of ['true', '']) {
    process.env.AUDIO_SUBDOMAIN_LIVE = live
    assert.equal(passesThrough(middleware(req('https://www.studio-808.com/audio/studio-808-wordmark.png'))), true, `live=${live}`)
  }
})

test('the decision helper: redirect, app shell or nothing', () => {
  const live = { AUDIO_SUBDOMAIN_LIVE: 'true' }
  assert.deepEqual(audioMiddlewareAction('https://www.studio-808.com/audio/terms?x=1', 'www.studio-808.com', live), { redirect: 'https://voice.studio-808.com/terms?x=1' })
  assert.deepEqual(audioMiddlewareAction('https://www.studio-808.com/audio/terms', 'www.studio-808.com', {}), { rewrite: '/index.html' })
  assert.equal(audioMiddlewareAction('https://studio-808-site-abc.vercel.app/audio', 'studio-808-site-abc.vercel.app', live), null)
  assert.equal(audioMiddlewareAction('https://voice.studio-808.com/audio', 'voice.studio-808.com', live), null)
  assert.equal(audioMiddlewareAction('https://www.studio-808.com/audiobooks', 'www.studio-808.com', live), null)
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
