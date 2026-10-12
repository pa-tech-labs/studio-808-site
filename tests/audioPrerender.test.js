// The build-time output for audio.studio-808.com (scripts/audioPrerender.js):
// both prerendered pages carry the expected head, and the sitemap, robots and
// 404 page are right.
//
// Run: npm test

import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { audioNotFoundHtml, audioRobotsTxt, audioSitemapXml, prerenderHtml } from '../scripts/audioPrerender.js'
import { buildAudioHead, buildAudioJsonLd } from '../src/lib/audioSeo.js'

const ORIGIN = 'https://audio.studio-808.com'
// The real index.html shell, as Vite emits it (the bundle tags are added at build).
const shell = readFileSync('index.html', 'utf8').replace('</head>', '  <script type="module" crossorigin src="/assets/index-abc.js"></script>\n  </head>')
const OG = 'https://cdn.sanity.io/images/p/production/og-1200x800.jpg?rect=0,85,1200,630&w=1200&h=630&fm=webp&fit=crop'
const page = {
  _updatedAt: '2026-10-12T15:14:58Z',
  enabled: true,
  seo: { metaTitle: 'Voiceover & Audiobook Recording | 808 Audio', metaDescription: 'Recording in "Chelmsford", Essex.', canonicalUrl: 'https://audio.studio-808.com/' },
  footer: { addressLine: 'Unit 11, Robjohns House, Navigation Road, Chelmsford CM2 6ND', email: 'info@studio-808.com' },
  faqs: [{ question: 'Q?', answer: 'A.' }],
  terms: [{ _type: 'block' }],
}
const data = { page, clips: [], credits: [] }

function render(route) {
  const head = buildAudioHead({ page, route, origin: ORIGIN, ogImage: OG })
  const jsonLd = buildAudioJsonLd({ data, route, origin: ORIGIN, ogImage: OG })
  return prerenderHtml(shell, { head, jsonLd })
}
const one = (html, re) => {
  const all = html.match(new RegExp(re, 'g')) ?? []
  assert.equal(all.length, 1, `${re} appears ${all.length} times`)
  return all[0]
}

for (const [route, path, title] of [['home', '/', 'Voiceover &amp; Audiobook Recording | 808 Audio'], ['terms', '/terms', 'Service terms | 808 Audio']]) {
  test(`prerendered ${path}: title, description, canonical, OG, Twitter, JSON-LD`, () => {
    const html = render(route)
    assert.equal(one(html, '<title[^>]*>[^<]*</title>'), `<title data-audio-prerender>${title}</title>`)
    one(html, `<link data-audio-prerender rel="canonical" href="${ORIGIN}${path}" />`)
    one(html, `<meta data-audio-prerender property="og:url" content="${ORIGIN}${path}" />`)
    one(html, '<meta data-audio-prerender name="description" content="[^"]+" />')
    one(html, '<meta data-audio-prerender property="og:title" content="[^"]+" />')
    one(html, '<meta data-audio-prerender property="og:site_name" content="808 Audio" />')
    one(html, '<meta data-audio-prerender property="og:type" content="website" />')
    one(html, '<meta data-audio-prerender property="og:image" content="https://cdn\\.sanity\\.io/[^"]+" />')
    one(html, '<meta data-audio-prerender property="og:image:width" content="1200" />')
    one(html, '<meta data-audio-prerender property="og:image:height" content="630" />')
    one(html, '<meta data-audio-prerender name="twitter:card" content="summary_large_image" />')
    one(html, '<meta data-audio-prerender name="twitter:image" content="[^"]+" />')
    const ld = JSON.parse(one(html, '<script data-audio-prerender type="application/ld\\+json">[^<]*</script>').replace(/^<script[^>]*>|<\/script>$/g, ''))
    assert.equal(ld['@graph'][0]['@type'], 'LocalBusiness')
    assert.equal(ld['@graph'][0].url, `${ORIGIN}/`)
    assert.equal(ld['@graph'].some(n => n['@type'] === 'FAQPage'), route === 'home')
  })

  test(`prerendered ${path}: the app bundle stays, main-site head extras go`, () => {
    const html = render(route)
    assert.match(html, /<script type="module" crossorigin src="\/assets\/index-abc\.js"><\/script>/)
    assert.match(html, /<div id="root"><\/div>/)
    assert.doesNotMatch(html, /Studio 808 \| Chelmsford Music Studios/)
    assert.doesNotMatch(html, /"@type": "LocalBusiness",\s*"name": "Studio 808"/)
    assert.doesNotMatch(html, /hero\.mp4/)
    assert.doesNotMatch(html, /—/)
  })
}

test('text is escaped in attributes and the title', () => {
  const html = render('home')
  assert.match(html, /content="Recording in &quot;Chelmsford&quot;, Essex\."/)
  assert.match(html, /<title data-audio-prerender>Voiceover &amp; Audiobook/)
})

test('noindex is baked in when set', () => {
  const head = buildAudioHead({ page: { ...page, seo: { ...page.seo, noindex: true } }, route: 'home', origin: ORIGIN })
  assert.match(prerenderHtml(shell, { head, jsonLd: null }), /<meta data-audio-prerender name="robots" content="noindex, follow" \/>/)
})

test('a shell without a title or </head> is refused', () => {
  assert.throws(() => prerenderHtml('<html><body></body></html>', { head: buildAudioHead({ page, route: 'home', origin: ORIGIN }), jsonLd: null }))
})

test('subdomain sitemap: / and /terms with lastmod; nothing when off or noindex', () => {
  const xml = audioSitemapXml(page)
  assert.match(xml, /<url><loc>https:\/\/audio\.studio-808\.com\/<\/loc><lastmod>2026-10-12<\/lastmod>/)
  assert.match(xml, /<loc>https:\/\/audio\.studio-808\.com\/terms<\/loc><lastmod>2026-10-12<\/lastmod>/)
  assert.doesNotMatch(xml, /www\.studio-808\.com|\/audio\//)
  assert.doesNotMatch(audioSitemapXml({ ...page, terms: [] }), /\/terms/)
  assert.doesNotMatch(audioSitemapXml({ ...page, enabled: false }), /<url>/)
  assert.doesNotMatch(audioSitemapXml({ ...page, seo: { noindex: true } }), /<url>/)
})

test('subdomain robots.txt allows all and points at its sitemap', () => {
  assert.equal(audioRobotsTxt(), 'User-agent: *\nAllow: /\n\nSitemap: https://audio.studio-808.com/sitemap.xml\n')
})

test('404 page: branded, noindex, links back to /', () => {
  const html = audioNotFoundHtml()
  assert.match(html, /<title>Page not found \| 808 Audio<\/title>/)
  assert.match(html, /<meta name="robots" content="noindex" \/>/)
  assert.match(html, /<a class="btn" href="\/">Back to 808 Audio<\/a>/)
  assert.doesNotMatch(html, /—/)
})
