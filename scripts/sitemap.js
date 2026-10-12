// Main-site sitemap helpers. The /audio pages moved to audio.studio-808.com,
// which has its own sitemap (scripts/audioPrerender.js); scripts/buildAudio.js
// uses addSitemapEntries(xml, []) to make sure the main sitemap lists none.

export const SITE = 'https://www.studio-808.com'

const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

/** The sitemap XML with the entries added before </urlset>, dropping any /audio entries. */
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
