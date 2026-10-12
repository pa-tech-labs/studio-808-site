// vercel.json routes, walked the way Vercel's legacy `routes` do: rules in
// order until one ends the request; { handle: 'filesystem' } serves a file if
// one exists at the path. `vercel dev` ignores `has`, so this is where the
// host rules are checked.
//
// Run: npm test

import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const config = JSON.parse(readFileSync('vercel.json', 'utf8'))
const routes = config.routes

// The build output (dist/) plus the serverless functions in api/.
const FILES = new Set([
  '/index.html', '/sitemap.xml', '/robots.txt', '/assets/index-abc.js', '/assets/index-abc.css', '/images/logo.png', '/videos/hero.mp4',
  '/audio/index.html', '/audio/terms/index.html', '/audio/sitemap.xml', '/audio/robots.txt', '/audio/404.html',
  '/api/audio-enquiry', '/api/chat', '/api/tutor-request',
])
const fileAt = path => (FILES.has(path) ? path : FILES.has(`${path.replace(/\/$/, '')}/index.html`) ? `${path.replace(/\/$/, '')}/index.html` : null)

function hostMatches(route, host) {
  return (route.has ?? []).every(h => h.type === 'host' && h.value === host)
}

/** { status, location?, file?, headers } for a request. */
function resolve(host, path) {
  const headers = {}
  for (const r of routes) {
    if (r.handle === 'filesystem') {
      const file = fileAt(path)
      if (file) return { status: 200, file, headers }
      continue
    }
    if (!hostMatches(r, host)) continue
    const m = new RegExp(r.src, 'i').exec(path)
    if (!m) continue
    const sub = s => s.replace(/\$(\d)/g, (_, i) => m[Number(i)] ?? '')
    if (r.continue) { Object.assign(headers, r.headers); continue }
    if (r.headers?.Location) return { status: r.status, location: sub(r.headers.Location), headers }
    if (r.dest) {
      const dest = sub(r.dest)
      return { status: r.status ?? (fileAt(dest) ? 200 : 404), file: fileAt(dest), headers }
    }
    if (r.status) return { status: r.status, headers }
  }
  return { status: 404, headers }
}

const AUDIO = 'voice.studio-808.com'
const WWW = 'www.studio-808.com'

test('audio host: / and /terms serve the prerendered pages', () => {
  assert.deepEqual(resolve(AUDIO, '/'), { status: 200, file: '/audio/index.html', headers: resolve(AUDIO, '/').headers })
  assert.equal(resolve(AUDIO, '/terms').file, '/audio/terms/index.html')
  assert.equal(resolve(AUDIO, '/terms/').file, '/audio/terms/index.html')
})

test('audio host: its own sitemap and robots, not the main ones', () => {
  assert.equal(resolve(AUDIO, '/sitemap.xml').file, '/audio/sitemap.xml')
  assert.equal(resolve(AUDIO, '/robots.txt').file, '/audio/robots.txt')
  assert.equal(resolve(WWW, '/sitemap.xml').file, '/sitemap.xml')
  assert.equal(resolve(WWW, '/robots.txt').file, '/robots.txt')
})

test('audio host: the enquiry function passes through; other functions do not', () => {
  assert.equal(resolve(AUDIO, '/api/audio-enquiry').file, '/api/audio-enquiry')
  assert.equal(resolve(AUDIO, '/api/audio-enquiry.js').file, '/api/audio-enquiry')
  for (const p of ['/api/chat', '/api/tutor-request', '/api/nope']) {
    assert.deepEqual([resolve(AUDIO, p).status, resolve(AUDIO, p).file], [404, '/audio/404.html'], p)
  }
})

test('audio host: app assets load; any other path is a 404 with the branded page', () => {
  assert.equal(resolve(AUDIO, '/assets/index-abc.js').file, '/assets/index-abc.js')
  assert.equal(resolve(AUDIO, '/images/logo.png').status, 200)
  for (const p of ['/dj-studio', '/membership', '/blog/anything', '/audio', '/audio/terms', '/nope']) {
    const r = resolve(AUDIO, p)
    assert.deepEqual([r.status, r.file], [404, '/audio/404.html'], p)
  }
})

test('audio host: security headers on every response, autoplay allowed for self', () => {
  for (const p of ['/', '/terms', '/sitemap.xml', '/assets/index-abc.js', '/nope']) {
    const h = resolve(AUDIO, p).headers
    assert.match(h['Permissions-Policy'], /autoplay=\(self\)/, p)
    assert.equal(h['X-Content-Type-Options'], 'nosniff', p)
    assert.ok(h['Strict-Transport-Security'], p)
    assert.equal(h['Referrer-Policy'], 'strict-origin-when-cross-origin', p)
  }
  assert.deepEqual(resolve(WWW, '/').headers, {}, 'main site headers unchanged')
})

test('www and apex /audio paths serve the app shell; the 301 lives in middleware.ts', () => {
  for (const host of [WWW, 'studio-808.com']) {
    for (const p of ['/audio', '/audio/', '/audio/terms']) {
      const r = resolve(host, p)
      // The app shell, not the subdomain's prerendered file (whose canonical
      // and og:url point at voice.studio-808.com).
      assert.deepEqual([r.status, r.file], [200, '/index.html'], `${host}${p}`)
    }
  }
  const mainHosts = ['www.studio-808.com', 'studio-808.com']
  const mainToSubdomain = routes.filter(r => mainHosts.includes(r.has?.[0]?.value) && /voice\.studio-808\.com/.test(r.headers?.Location ?? ''))
  assert.deepEqual(mainToSubdomain, [], 'no www or apex redirect to the subdomain left in vercel.json')
})

test('the old name, audio.studio-808.com, 301s every path to the same path on voice', () => {
  const OLD = 'audio.studio-808.com'
  for (const [from, to] of [['/', 'https://voice.studio-808.com/'], ['/terms', 'https://voice.studio-808.com/terms'], ['/sitemap.xml', 'https://voice.studio-808.com/sitemap.xml'], ['/production-studio', 'https://voice.studio-808.com/production-studio'], ['/api/audio-enquiry', 'https://voice.studio-808.com/api/audio-enquiry']]) {
    const r = resolve(OLD, from)
    assert.equal(r.status, 301, from)
    assert.equal(r.location, to, from)
  }
  assert.equal(routes.findIndex(r => r.has?.[0]?.value === OLD), 0, 'first rule, ahead of every other redirect')
})

test('main site behaves as before: SPA fallback, files, API, the old redirect', () => {
  for (const p of ['/', '/dj-studio', '/membership', '/blog/some-post', '/find-your-studio']) {
    assert.equal(resolve(WWW, p).file, p === '/' ? '/index.html' : '/index.html', p)
    assert.equal(resolve(WWW, p).status, 200, p)
  }
  assert.equal(resolve(WWW, '/assets/index-abc.js').file, '/assets/index-abc.js')
  assert.equal(resolve(WWW, '/api/chat').file, '/api/chat')
  assert.equal(resolve(WWW, '/api/missing').status, 404, 'api paths never fall back to the app')
  assert.deepEqual(resolve(WWW, '/production-studio'), { status: 308, location: '/main-production-studio', headers: {} })
})

test('preview deployments (any other host) keep /audio in the app, no redirect', () => {
  const preview = 'studio-808-site-abc.vercel.app'
  assert.equal(resolve(preview, '/audio').file, '/audio/index.html')
  assert.equal(resolve(preview, '/audio/terms').file, '/audio/terms/index.html')
  assert.equal(resolve(preview, '/dj-studio').file, '/index.html')
})

test('config shape: routes only (no rewrites/redirects/headers alongside), build unchanged', () => {
  for (const k of ['rewrites', 'redirects', 'headers', 'cleanUrls', 'trailingSlash']) assert.equal(k in config, false, k)
  assert.equal(config.outputDirectory, 'dist')
  assert.equal(config.buildCommand, 'npm install --legacy-peer-deps && npm run build')
  assert.equal(routes.filter(r => r.handle === 'filesystem').length, 1)
})
