// After `vite build`: the build output for audio.studio-808.com.
//
//   dist/audio/index.html        / with its head and JSON-LD prerendered
//   dist/audio/terms/index.html  /terms likewise
//   dist/audio/sitemap.xml       served as audio.studio-808.com/sitemap.xml
//   dist/audio/robots.txt        served as audio.studio-808.com/robots.txt
//   dist/audio/404.html          served for any other path on the subdomain
//
// and the main site's dist/sitemap.xml with no /audio entries (those pages
// now live on the subdomain). vercel.json maps the subdomain's paths here.
//
// Reads Sanity's public CDN, no token. Fails the build if Sanity cannot be
// reached or has no audioPage: shipping link previews with empty meta would
// be worse than a failed deploy (the previous deployment stays live).

import { mkdir, readFile, writeFile } from 'node:fs/promises'
import imageUrlBuilder from '@sanity/image-url'
import { AUDIO_PAGE_QUERY } from '../src/lib/audioPageQuery.js'
import { AUDIO_ORIGIN } from '../src/lib/audioHost.js'
import { makeAudioImageUrl } from '../src/lib/audioImageUrl.js'
import { audioOgImageSource, buildAudioHead, buildAudioJsonLd, OG_HEIGHT, OG_WIDTH } from '../src/lib/audioSeo.js'
import { addSitemapEntries } from './sitemap.js'
import { audioNotFoundHtml, audioRobotsTxt, audioSitemapXml, prerenderHtml } from './audioPrerender.js'

// Vercel sets these as real env vars; locally they live in .env files, which
// only Vite reads on its own.
for (const f of ['.env', '.env.local']) {
  try { process.loadEnvFile(f) } catch { /* no such file */ }
}

function fail(message) {
  console.error(`\n[audio] BUILD FAILED: ${message}\n[audio] The 808 Audio pages need their Sanity content at build time for link previews.\n`)
  process.exit(1)
}

const projectId = process.env.VITE_SANITY_PROJECT_ID || process.env.SANITY_STUDIO_PROJECT_ID
const dataset = process.env.VITE_SANITY_DATASET || 'production'
if (!projectId) fail('VITE_SANITY_PROJECT_ID is not set.')

let data
try {
  const url = `https://${projectId}.apicdn.sanity.io/v2024-01-01/data/query/${dataset}?query=${encodeURIComponent(AUDIO_PAGE_QUERY)}`
  const res = await fetch(url, { signal: AbortSignal.timeout(15000) })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  data = (await res.json()).result
} catch (err) {
  fail(`Sanity could not be reached (${err.message}).`)
}
if (!data?.page) fail('Sanity returned no audioPage document.')

const builder = imageUrlBuilder({ projectId, dataset })
const imageUrl = makeAudioImageUrl(img => builder.image(img))
const ogImage = imageUrl(audioOgImageSource(data.page), OG_WIDTH, OG_HEIGHT)

const indexHtml = await readFile('dist/index.html', 'utf8')
for (const route of ['home', 'terms']) {
  const head = buildAudioHead({ page: data.page, route, origin: AUDIO_ORIGIN, ogImage })
  const jsonLd = buildAudioJsonLd({ data, route, origin: AUDIO_ORIGIN, ogImage, imageUrl })
  const dir = route === 'terms' ? 'dist/audio/terms' : 'dist/audio'
  await mkdir(dir, { recursive: true })
  await writeFile(`${dir}/index.html`, prerenderHtml(indexHtml, { head, jsonLd }))
  console.log(`[audio] ${dir}/index.html: "${head.title}", canonical ${head.canonical}${head.robots ? `, ${head.robots}` : ''}`)
}

await writeFile('dist/audio/sitemap.xml', audioSitemapXml(data.page))
await writeFile('dist/audio/robots.txt', audioRobotsTxt())
await writeFile('dist/audio/404.html', audioNotFoundHtml())

const mainSitemap = await readFile('dist/sitemap.xml', 'utf8')
await writeFile('dist/sitemap.xml', addSitemapEntries(mainSitemap, []))

const listed = (audioSitemapXml(data.page).match(/<loc>/g) ?? []).length
console.log(`[audio] sitemap.xml: ${listed} URL(s)${data.page._updatedAt ? `, lastmod ${String(data.page._updatedAt).slice(0, 10)}` : ''}; robots.txt and 404.html written; main sitemap has no /audio entries`)
