// The main site's sitemap and robots.txt after the move of /audio to
// voice.studio-808.com.
//
// Run: npm test

import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { addSitemapEntries, robotsAllows } from '../scripts/sitemap.js'

const xml = readFileSync('public/sitemap.xml', 'utf8')
const robots = readFileSync('public/robots.txt', 'utf8')

test('the main sitemap lists no /audio paths', () => {
  assert.doesNotMatch(xml, /\/audio/)
  const stale = xml.replace('</urlset>', '  <url><loc>https://www.studio-808.com/audio</loc><lastmod>2026-10-12</lastmod></url>\n  <url><loc>https://www.studio-808.com/audio/terms</loc></url>\n</urlset>')
  const out = addSitemapEntries(stale, [])
  assert.doesNotMatch(out, /\/audio/)
  assert.equal((out.match(/<url>/g) ?? []).length, (xml.match(/<url>/g) ?? []).length, 'every other entry kept')
  assert.ok(out.trim().endsWith('</urlset>'))
})

test('entries can still be added (for future main-site pages)', () => {
  const out = addSitemapEntries(xml, [{ loc: 'https://www.studio-808.com/new', lastmod: '2026-10-12', changefreq: 'monthly', priority: '0.5' }])
  assert.match(out, /<loc>https:\/\/www\.studio-808\.com\/new<\/loc><lastmod>2026-10-12<\/lastmod>/)
})

test('robots.txt helper', () => {
  assert.equal(robotsAllows(robots, '/'), true)
  assert.equal(robotsAllows('User-agent: *\nDisallow: /audio', '/audio/terms'), false)
  assert.equal(robotsAllows('User-agent: Googlebot\nDisallow: /audio\nUser-agent: *\nAllow: /', '/audio'), true)
})
