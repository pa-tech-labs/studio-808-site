// Adds the /audio entries to the main site's sitemap. Pure functions, tested
// in tests/sitemap.test.js; scripts/buildSitemap.js runs them after the build.

export const SITE = 'https://www.studio-808.com'

const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

/**
 * The /audio URLs to list, from what Sanity says about the page.
 * `page` is { _updatedAt, enabled, noindex, hasTerms }, or null when Sanity
 * could not be reached: then both routes are listed without a lastmod rather
 * than dropped. A page that is switched off or set to noindex is not listed.
 */
export function audioSitemapEntries(page, site = SITE) {
  if (page && (page.enabled !== true || page.noindex === true)) return []
  const lastmod = page?._updatedAt ? String(page._updatedAt).slice(0, 10) : undefined
  const entries = [{ loc: `${site}/audio`, lastmod, changefreq: 'monthly', priority: '0.8' }]
  if (!page || page.hasTerms) entries.push({ loc: `${site}/audio/terms`, lastmod, changefreq: 'yearly', priority: '0.3' })
  return entries
}

/** The sitemap XML with the entries added before </urlset>, replacing any earlier /audio entries. */
export function addSitemapEntries(xml, entries) {
  const withoutOld = xml.replace(/\s*<url><loc>[^<]*\/audio(?:\/[^<]*)?<\/loc>.*?<\/url>/g, '')
  const lines = entries.map(e =>
    `  <url><loc>${esc(e.loc)}</loc>${e.lastmod ? `<lastmod>${esc(e.lastmod)}</lastmod>` : ''}<changefreq>${e.changefreq}</changefreq><priority>${e.priority}</priority></url>`,
  )
  if (!lines.length) return withoutOld
  return withoutOld.replace(/\s*<\/urlset>\s*$/, `\n${lines.join('\n')}\n</urlset>\n`)
}

/** True when robots.txt does not disallow the path for every crawler. */
export function robotsAllows(robots, path) {
  let applies = false
  for (const raw of robots.split('\n')) {
    const line = raw.replace(/#.*/, '').trim()
    const [key, ...rest] = line.split(':')
    const value = rest.join(':').trim()
    if (/^user-agent$/i.test(key)) applies = value === '*'
    else if (applies && /^disallow$/i.test(key) && value && path.startsWith(value)) return false
  }
  return true
}
