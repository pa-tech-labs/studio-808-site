// After `vite build`: the build output for voice.studio-808.com.
//
//   dist/audio/index.html        / with its head, JSON-LD and body prerendered
//   dist/audio/terms/index.html  /terms likewise
//   dist/audio/sitemap.xml       served as voice.studio-808.com/sitemap.xml
//   dist/audio/robots.txt        served as voice.studio-808.com/robots.txt
//   dist/audio/404.html          served for any other path on the subdomain
//
// and the main site's dist/sitemap.xml with no /audio entries (those pages
// now live on the subdomain). vercel.json maps the subdomain's paths here.
//
// Reads Sanity's public CDN, no token. Fails the build if Sanity cannot be
// reached or has no audioPage: shipping link previews with empty meta would
// be worse than a failed deploy (the previous deployment stays live).

import { mkdir, readFile, rm, writeFile } from 'node:fs/promises'
import { pathToFileURL } from 'node:url'
import { build } from 'vite'
import imageUrlBuilder from '@sanity/image-url'
import { AUDIO_PAGE_QUERY } from '../src/lib/audioPageQuery.js'
import { VOICE_ORIGIN } from '../src/lib/audioHost.js'
import { makeAudioImageUrl } from '../src/lib/audioImageUrl.js'
import { audioOgImageSource, buildAudioHead, buildAudioJsonLd, OG_HEIGHT, OG_WIDTH } from '../src/lib/audioSeo.js'
import { addSitemapEntries } from './sitemap.js'
import { audioNotFoundHtml, audioRobotsTxt, audioSitemapXml, manifestCss, prerenderHtml } from './audioPrerender.js'
import { VOICE_HOST } from '../src/lib/audioHost.js'

// Vercel sets these as real env vars; locally they live in .env files, which
// only Vite reads on its own.
for (const f of ['.env', '.env.local']) {
  try { process.loadEnvFile(f) } catch { /* no such file */ }
}

function fail(message) {
  console.error(`\n[audio] BUILD FAILED: ${message}\n[audio] The Studio 808 Voice pages need their Sanity content at build time for link previews.\n`)
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

// The page body, so crawlers and no-JS clients get the copy: the same React
// components, rendered once here (src/pages/audio/prerenderEntry.tsx), with
// the Voice route's CSS linked from Vite's manifest. Only for an enabled page;
// a disabled one redirects away in the app and gets no body.
let renderAudioBody = null
let stylesheets = []
if (data.page.enabled === true) {
  try {
    await build({
      logLevel: 'warn',
      publicDir: false,
      build: { ssr: 'src/pages/audio/prerenderEntry.tsx', outDir: 'dist-ssr', emptyOutDir: true },
    })
    ;({ renderAudioBody } = await import(pathToFileURL('dist-ssr/prerenderEntry.js').href))
    const manifest = JSON.parse(await readFile('dist/.vite/manifest.json', 'utf8'))
    stylesheets = manifestCss(manifest, 'src/pages/audio/AudioRoute.tsx')
    if (!stylesheets.length) throw new Error('no CSS for src/pages/audio/AudioRoute.tsx in the build manifest')
  } catch (err) {
    fail(`the body prerender could not be built (${err.message}).`)
  } finally {
    await rm('dist-ssr', { recursive: true, force: true })
  }
}
// The manifest is a build artefact, not something to serve.
await rm('dist/.vite', { recursive: true, force: true })

const indexHtml = await readFile('dist/index.html', 'utf8')
for (const route of ['home', 'terms']) {
  const head = buildAudioHead({ page: data.page, route, origin: VOICE_ORIGIN, ogImage })
  const jsonLd = buildAudioJsonLd({ data, route, origin: VOICE_ORIGIN, ogImage, imageUrl })
  const body = renderAudioBody ? renderAudioBody(data, route, VOICE_HOST) : ''
  const dir = route === 'terms' ? 'dist/audio/terms' : 'dist/audio'
  await mkdir(dir, { recursive: true })
  await writeFile(`${dir}/index.html`, prerenderHtml(indexHtml, { head, jsonLd, body, stylesheets: body ? stylesheets : [] }))
  console.log(`[audio] ${dir}/index.html: "${head.title}", canonical ${head.canonical}${head.robots ? `, ${head.robots}` : ''}, body ${body ? `${Math.round(body.length / 1024)} KB` : 'not prerendered'}`)
}

await writeFile('dist/audio/sitemap.xml', audioSitemapXml(data.page))
await writeFile('dist/audio/robots.txt', audioRobotsTxt())
await writeFile('dist/audio/404.html', audioNotFoundHtml())

const mainSitemap = await readFile('dist/sitemap.xml', 'utf8')
await writeFile('dist/sitemap.xml', addSitemapEntries(mainSitemap, []))

const listed = (audioSitemapXml(data.page).match(/<loc>/g) ?? []).length
console.log(`[audio] sitemap.xml: ${listed} URL(s)${data.page._updatedAt ? `, lastmod ${String(data.page._updatedAt).slice(0, 10)}` : ''}; robots.txt and 404.html written; main sitemap has no /audio entries`)
