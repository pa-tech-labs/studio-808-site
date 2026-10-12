// After `vite build`: adds /audio and /audio/terms to dist/sitemap.xml (copied
// from public/sitemap.xml), with lastmod from the audioPage document's
// _updatedAt. Reads Sanity's public CDN, no token. Never fails the build: if
// Sanity cannot be reached the two routes are listed without a lastmod.

import { readFile, writeFile } from 'node:fs/promises'
import { addSitemapEntries, audioSitemapEntries, robotsAllows } from './sitemap.js'

// Vercel sets these as real env vars; locally they live in .env files, which
// only Vite reads on its own.
for (const f of ['.env', '.env.local']) {
  try { process.loadEnvFile(f) } catch { /* no such file */ }
}

const projectId = process.env.VITE_SANITY_PROJECT_ID || process.env.SANITY_STUDIO_PROJECT_ID
const dataset = process.env.VITE_SANITY_DATASET || 'production'
const QUERY = '*[_id == "audioPage"][0]{ _updatedAt, enabled, "noindex": seo.noindex, "hasTerms": count(terms) > 0 }'

async function fetchPage() {
  if (!projectId) {
    console.warn('[sitemap] VITE_SANITY_PROJECT_ID not set; listing /audio without lastmod.')
    return null
  }
  try {
    const url = `https://${projectId}.apicdn.sanity.io/v2024-01-01/data/query/${dataset}?query=${encodeURIComponent(QUERY)}`
    const res = await fetch(url, { signal: AbortSignal.timeout(8000) })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    return (await res.json()).result ?? { enabled: false }
  } catch (err) {
    console.warn(`[sitemap] Sanity not reachable (${err.message}); listing /audio without lastmod.`)
    return null
  }
}

const page = await fetchPage()
const entries = audioSitemapEntries(page)
const xml = await readFile('dist/sitemap.xml', 'utf8')
await writeFile('dist/sitemap.xml', addSitemapEntries(xml, entries))

const robots = await readFile('dist/robots.txt', 'utf8')
for (const e of entries) {
  const path = new URL(e.loc).pathname
  if (!robotsAllows(robots, path)) console.warn(`[sitemap] robots.txt blocks ${path}`)
}
console.log(`[sitemap] ${entries.length ? entries.map(e => `${new URL(e.loc).pathname}${e.lastmod ? ` (${e.lastmod})` : ''}`).join(', ') : 'no /audio entries (page off or noindex)'}`)
