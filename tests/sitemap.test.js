// The /audio sitemap entries (scripts/sitemap.js) and robots.txt.
//
// Run: npm test

import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { addSitemapEntries, audioSitemapEntries, robotsAllows } from '../scripts/sitemap.js'

const xml = readFileSync('public/sitemap.xml', 'utf8')
const robots = readFileSync('public/robots.txt', 'utf8')

test('a live page lists /audio and /audio/terms with lastmod from _updatedAt', () => {
  const entries = audioSitemapEntries({ _updatedAt: '2026-10-12T15:14:58Z', enabled: true, noindex: null, hasTerms: true })
  assert.deepEqual(entries.map(e => [e.loc, e.lastmod]), [
    ['https://www.studio-808.com/audio', '2026-10-12'],
    ['https://www.studio-808.com/audio/terms', '2026-10-12'],
  ])
  const out = addSitemapEntries(xml, entries)
  assert.match(out, /<url><loc>https:\/\/www\.studio-808\.com\/audio<\/loc><lastmod>2026-10-12<\/lastmod>/)
  assert.match(out, /<loc>https:\/\/www\.studio-808\.com\/audio\/terms<\/loc>/)
  assert.ok(out.trim().endsWith('</urlset>'))
  assert.equal((out.match(/<url>/g) ?? []).length, (xml.match(/<url>/g) ?? []).length + 2, 'existing entries kept')
})

test('no terms, no terms entry; off or noindex, no entries', () => {
  assert.deepEqual(audioSitemapEntries({ enabled: true, hasTerms: false }).map(e => e.loc), ['https://www.studio-808.com/audio'])
  assert.deepEqual(audioSitemapEntries({ enabled: false, hasTerms: true }), [])
  assert.deepEqual(audioSitemapEntries({ enabled: true, noindex: true, hasTerms: true }), [])
})

test('Sanity unreachable: both routes, no lastmod', () => {
  const entries = audioSitemapEntries(null)
  assert.equal(entries.length, 2)
  assert.ok(entries.every(e => e.lastmod === undefined))
  assert.doesNotMatch(addSitemapEntries(xml, entries), /<lastmod>/)
})

test('re-running replaces the /audio entries instead of duplicating them', () => {
  const once = addSitemapEntries(xml, audioSitemapEntries({ _updatedAt: '2026-10-01', enabled: true, hasTerms: true }))
  const twice = addSitemapEntries(once, audioSitemapEntries({ _updatedAt: '2026-10-12', enabled: true, hasTerms: true }))
  assert.equal((twice.match(/\/audio</g) ?? []).length, 1)
  assert.doesNotMatch(twice, /2026-10-01/)
})

test('robots.txt does not block /audio', () => {
  assert.equal(robotsAllows(robots, '/audio'), true)
  assert.equal(robotsAllows(robots, '/audio/terms'), true)
  assert.equal(robotsAllows('User-agent: *\nDisallow: /audio', '/audio/terms'), false)
  assert.equal(robotsAllows('User-agent: Googlebot\nDisallow: /audio\nUser-agent: *\nAllow: /', '/audio'), true)
})
