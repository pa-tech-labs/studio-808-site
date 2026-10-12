// Run: npm test

import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
  audioBaseUrl, audioCanonical, audioEngineers, audioHeadTags, buildAudioHead, buildAudioJsonLd,
  isoDuration, jsonLdString, parseUkAddress,
} from './audioSeo.js'

const ORIGIN = 'https://www.studio-808.com'
const OG = 'https://cdn.sanity.io/images/p/d/og.jpg?w=1200&h=630&fit=crop&fm=webp'
const imageUrl = (img, w, h) => (img ? `https://img.test/${img.id}?w=${w}&h=${h ?? ''}` : null)

const page = {
  _updatedAt: '2026-10-12T15:14:58Z',
  seo: { metaTitle: 'Voiceover and Audiobook Recording Studio in Essex | Studio 808 Voice', metaDescription: 'Professional voiceover recording in Chelmsford.' },
  hero: { headline: 'Broadcast-grade voice recording' },
  footer: { addressLine: 'Unit 11, Robjohns House, Navigation Road, Chelmsford CM2 6ND', email: 'info@studio-808.com', phone: '01245 000000' },
  engineers: [{ name: 'Paul', role: 'Engineer' }, { name: 'Heetan', role: 'Recording engineer' }],
  services: [{ title: 'Audiobook recording', description: 'Narration to ACX spec.' }, { title: '' }],
  faqs: [{ question: 'Do you provide talent?', answer: 'Yes.' }, { question: 'Half', answer: '' }],
}
const clips = [
  { _id: 'a1', title: 'Chapter one', cleared: true, audioUrl: 'https://cdn.test/a1.mp3', durationSeconds: 75, coverImage: { id: 'c1' }, transcript: 'Hello.', client: 'Hachette', production: 'The Book' },
  { _id: 'v1', title: 'TV spot', cleared: true, mediaType: 'video', videoUrl: 'https://cdn.test/v1.mp4', videoMimeType: 'video/mp4', durationSeconds: 30, posterImage: { id: 'p1' }, _createdAt: '2026-10-01T10:00:00Z' },
  { _id: 'x1', title: 'Not cleared', cleared: false, audioUrl: 'https://cdn.test/x1.mp3' },
]
const data = { page, clips, credits: [] }
const byType = (g, t) => g['@graph'].filter(n => n['@type'] === t)

// ── Head ─────────────────────────────────────────────────────────────────

test('home head: title, description, canonical from the origin, OG and Twitter', () => {
  const h = buildAudioHead({ page, route: 'home', origin: ORIGIN, ogImage: OG })
  assert.equal(h.title, page.seo.metaTitle)
  assert.equal(h.description, page.seo.metaDescription)
  assert.equal(h.canonical, 'https://www.studio-808.com/audio/')
  assert.equal(h.robots, null)
  assert.equal(h.og.site_name, 'Studio 808 Voice')
  assert.equal(h.og.type, 'website')
  assert.equal(h.og.url, h.canonical)
  assert.equal(h.og.image, OG)
  assert.equal(h.og.imageWidth, 1200)
  assert.equal(h.og.imageHeight, 630)
  assert.equal(h.twitter.card, 'summary_large_image')
})

test('terms head: fixed title, canonical under the same base', () => {
  const h = buildAudioHead({ page, route: 'terms', origin: ORIGIN, ogImage: null })
  assert.equal(h.title, 'Service terms | Studio 808 Voice')
  assert.equal(h.canonical, 'https://www.studio-808.com/audio/terms')
  assert.equal(h.og.image, null)
})

test('seo.canonicalUrl becomes the base for both routes', () => {
  const p = { ...page, seo: { ...page.seo, canonicalUrl: 'https://voice.studio-808.com/' } }
  assert.equal(audioBaseUrl(p, ORIGIN), 'https://voice.studio-808.com')
  assert.equal(audioCanonical(p, 'home', ORIGIN), 'https://voice.studio-808.com/')
  assert.equal(audioCanonical(p, 'terms', ORIGIN), 'https://voice.studio-808.com/terms')
})

test('noindex adds robots on both routes; missing SEO falls back to defaults', () => {
  const p = { seo: { noindex: true } }
  assert.equal(buildAudioHead({ page: p, route: 'home', origin: ORIGIN }).robots, 'noindex, follow')
  assert.equal(buildAudioHead({ page: p, route: 'terms', origin: ORIGIN }).robots, 'noindex, follow')
  const empty = buildAudioHead({ page: null, route: 'home', origin: ORIGIN })
  assert.ok(empty.title.includes('Studio 808 Voice'))
  assert.ok(empty.description.length > 20)
})

test('rendered head tags: canonical, robots only when set, OG image size only with an image', () => {
  const tags = audioHeadTags(buildAudioHead({ page, route: 'home', origin: ORIGIN, ogImage: OG }))
  const find = (k, v) => tags.find(t => t[k] === v)
  assert.equal(find('rel', 'canonical').href, 'https://www.studio-808.com/audio/')
  assert.equal(find('name', 'robots'), undefined)
  assert.equal(find('property', 'og:image:width').content, '1200')
  assert.equal(find('property', 'og:site_name').content, 'Studio 808 Voice')
  assert.equal(find('name', 'twitter:card').content, 'summary_large_image')
  assert.equal(find('name', 'twitter:image').content, OG)
  for (const t of tags) assert.ok((t.content ?? t.href).length > 0, JSON.stringify(t))

  const noImg = audioHeadTags(buildAudioHead({ page: { seo: { noindex: true } }, route: 'terms', origin: ORIGIN }))
  assert.equal(noImg.find(t => t.name === 'robots').content, 'noindex, follow')
  assert.equal(noImg.some(t => t.property?.startsWith('og:image')), false)
  assert.equal(noImg.some(t => t.name === 'twitter:image'), false)
})

// ── JSON-LD ──────────────────────────────────────────────────────────────

test('LocalBusiness: required fields, address parsed, engineers as employees', () => {
  const g = buildAudioJsonLd({ data, origin: ORIGIN, ogImage: OG, imageUrl })
  assert.equal(g['@context'], 'https://schema.org')
  const [b] = byType(g, 'LocalBusiness')
  assert.equal(b['@id'], 'https://www.studio-808.com/audio/#business')
  assert.equal(b.name, 'Studio 808 Voice')
  assert.match(b.additionalType, /Recording_studio/)
  assert.deepEqual(b.parentOrganization, { '@type': 'Organization', name: 'Studio 808 Ltd', url: 'https://www.studio-808.com/' })
  assert.deepEqual(b.address, { '@type': 'PostalAddress', streetAddress: 'Unit 11, Robjohns House, Navigation Road', addressLocality: 'Chelmsford', postalCode: 'CM2 6ND', addressCountry: 'GB' })
  assert.equal(b.telephone, '01245 000000')
  assert.equal(b.email, 'info@studio-808.com')
  assert.equal(b.url, 'https://www.studio-808.com/audio/')
  assert.equal(b.image, OG)
  assert.deepEqual(b.areaServed, ['Essex', 'London', 'United Kingdom'])
  assert.deepEqual(b.openingHoursSpecification[0].dayOfWeek, ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'])
  assert.equal(b.openingHoursSpecification[0].opens, '09:00')
  assert.equal(b.openingHoursSpecification[0].closes, '18:00')
  assert.deepEqual(b.sameAs, [])
  assert.deepEqual(b.employee, [{ '@type': 'Person', name: 'Paul', jobTitle: 'Engineer' }, { '@type': 'Person', name: 'Heetan', jobTitle: 'Recording engineer' }])
})

test('Service per titled service, pointing at the business', () => {
  const services = byType(buildAudioJsonLd({ data, origin: ORIGIN }), 'Service')
  assert.equal(services.length, 1)
  assert.equal(services[0].name, 'Audiobook recording')
  assert.deepEqual(services[0].provider, { '@id': 'https://www.studio-808.com/audio/#business' })
})

test('FAQPage from complete FAQs only', () => {
  const [faq] = byType(buildAudioJsonLd({ data, origin: ORIGIN }), 'FAQPage')
  assert.equal(faq.mainEntity.length, 1)
  assert.deepEqual(faq.mainEntity[0], { '@type': 'Question', name: 'Do you provide talent?', acceptedAnswer: { '@type': 'Answer', text: 'Yes.' } })
})

test('Audio and VideoObject per cleared clip', () => {
  const g = buildAudioJsonLd({ data, origin: ORIGIN, imageUrl })
  const [a] = byType(g, 'AudioObject')
  const [v] = byType(g, 'VideoObject')
  assert.equal(byType(g, 'AudioObject').length + byType(g, 'VideoObject').length, 2, 'the uncleared clip is left out')
  assert.equal(a.name, 'Chapter one')
  assert.equal(a.contentUrl, 'https://cdn.test/a1.mp3')
  assert.equal(a.encodingFormat, 'audio/mpeg', 'guessed from the extension')
  assert.equal(a.duration, 'PT1M15S')
  assert.equal(a.thumbnailUrl, 'https://img.test/c1?w=800&h=800')
  assert.equal(a.transcript, 'Hello.')
  assert.match(a.description, /The Book, Hachette/)
  assert.equal(v.encodingFormat, 'video/mp4')
  assert.equal(v.duration, 'PT30S')
  assert.equal(v.thumbnailUrl, 'https://img.test/p1?w=1280&h=720')
  assert.equal(v.uploadDate, '2026-10-01T10:00:00Z')
})

test('the old single engineer is used until the list has someone', () => {
  assert.deepEqual(audioEngineers({ engineer: { name: 'Paul' } }).map(e => e.name), ['Paul'])
  assert.deepEqual(audioEngineers({ engineer: { name: 'Paul' }, engineers: [{ name: 'Sam' }] }).map(e => e.name), ['Sam'])
  assert.deepEqual(audioEngineers({ engineer: { name: 'Paul' }, engineers: [{ name: '' }] }).map(e => e.name), ['Paul'])
  assert.deepEqual(audioEngineers(null), [])
})

test('empty source data renders nothing', () => {
  assert.equal(buildAudioJsonLd({ data: null, origin: ORIGIN }), null)
  assert.equal(buildAudioJsonLd({ data: { page: null, clips: [], credits: [] }, origin: ORIGIN }), null)
  const g = buildAudioJsonLd({ data: { page: {}, clips: [], credits: [] }, origin: ORIGIN })
  assert.deepEqual(g['@graph'].map(n => n['@type']), ['LocalBusiness'], 'no services, FAQ or clips')
  const [b] = g['@graph']
  for (const k of ['address', 'telephone', 'email', 'image', 'employee']) assert.equal(k in b, false, k)
})

test('terms page carries the business only', () => {
  const g = buildAudioJsonLd({ data, route: 'terms', origin: ORIGIN })
  assert.deepEqual(g['@graph'].map(n => n['@type']), ['LocalBusiness'])
})

test('helpers', () => {
  assert.equal(isoDuration(45), 'PT45S')
  assert.equal(isoDuration(3725), 'PT1H2M5S')
  assert.equal(isoDuration(120), 'PT2M')
  assert.equal(isoDuration(0), undefined)
  assert.equal(parseUkAddress(''), null)
  assert.equal(parseUkAddress('Navigation Road, Chelmsford cm2 6nd').postalCode, 'CM2 6ND')
  assert.equal(parseUkAddress('Somewhere without a postcode').addressLocality, 'Chelmsford')
  assert.equal(jsonLdString({ a: '</script><script>x' }).includes('</script>'), false)
})
