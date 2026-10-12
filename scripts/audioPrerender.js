// Build-time output for audio.studio-808.com: the prerendered <head> of / and
// /terms, the subdomain's sitemap and robots.txt, and its 404 page. Pure
// functions, tested in tests/audioPrerender.test.js; scripts/buildAudio.js
// runs them after `vite build`.
//
// Link previews (Slack, WhatsApp, LinkedIn) do not run JavaScript, so the
// real title, description, canonical, Open Graph, Twitter and JSON-LD are
// written into the HTML. Each baked tag carries data-audio-prerender; once
// the app's own head (pages/audio/AudioHead.tsx) has mounted, it removes
// them, so a browser never ends up with two canonicals. (With React 19,
// react-helmet-async renders through React's head hoisting and does not
// adopt existing tags, hence the explicit marker.)

export const PRERENDER_ATTR = 'data-audio-prerender'

import { AUDIO_ORIGIN } from '../src/lib/audioHost.js'
import { audioHeadTags, jsonLdString } from '../src/lib/audioSeo.js'

const attr = s => String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
const text = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

/** The head tags as HTML, one per line. */
export function audioHeadHtml({ head, jsonLd }) {
  const lines = audioHeadTags(head).map(t => {
    if (t.tag === 'link') return `<link ${PRERENDER_ATTR} rel="${attr(t.rel)}" href="${attr(t.href)}" />`
    const key = 'property' in t ? `property="${attr(t.property)}"` : `name="${attr(t.name)}"`
    return `<meta ${PRERENDER_ATTR} ${key} content="${attr(t.content)}" />`
  })
  if (jsonLd) lines.push(`<script ${PRERENDER_ATTR} type="application/ld+json">${jsonLdString(jsonLd)}</script>`)
  return lines.join('\n    ')
}

/**
 * The app's index.html with the audio head baked in: the title replaced, the
 * main site's own JSON-LD (Studio 808) and its hero video preload removed,
 * and the audio tags added before </head>. The app bundle is left as is.
 */
export function prerenderHtml(indexHtml, { head, jsonLd }) {
  if (!/<title>[\s\S]*?<\/title>/.test(indexHtml) || !indexHtml.includes('</head>')) {
    throw new Error('index.html has no <title> or </head> to fill')
  }
  return indexHtml
    .replace(/<title>[\s\S]*?<\/title>/, `<title ${PRERENDER_ATTR}>${text(head.title)}</title>`)
    .replace(/\s*<script type="application\/ld\+json">[\s\S]*?<\/script>/g, '')
    .replace(/\s*<link rel="preload" as="video"[^>]*>/g, '')
    .replace(/\s*<\/head>/, `\n    ${audioHeadHtml({ head, jsonLd })}\n  </head>`)
}

/** The subdomain sitemap: / and, when there are terms, /terms. Empty when the page is off or noindex. */
export function audioSitemapXml(page, origin = AUDIO_ORIGIN) {
  const listed = page && page.enabled === true && page.seo?.noindex !== true
  const lastmod = page?._updatedAt ? String(page._updatedAt).slice(0, 10) : ''
  const url = (loc, freq, priority) =>
    `  <url><loc>${text(loc)}</loc>${lastmod ? `<lastmod>${lastmod}</lastmod>` : ''}<changefreq>${freq}</changefreq><priority>${priority}</priority></url>`
  const urls = listed
    ? [url(`${origin}/`, 'monthly', '1.0'), ...(Array.isArray(page.terms) && page.terms.length ? [url(`${origin}/terms`, 'yearly', '0.3')] : [])]
    : []
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join('\n')}${urls.length ? '\n' : ''}</urlset>\n`
}

/** robots.txt for the subdomain: everything allowed, its own sitemap. */
export function audioRobotsTxt(origin = AUDIO_ORIGIN) {
  return `User-agent: *\nAllow: /\n\nSitemap: ${origin}/sitemap.xml\n`
}

/**
 * The subdomain's 404 page: standalone HTML in the 808 Audio look (no app
 * bundle), with a link back to /. Served with status 404 by vercel.json.
 */
export function audioNotFoundHtml() {
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="robots" content="noindex" />
    <title>Page not found | 808 Audio</title>
    <link rel="icon" type="image/png" href="/images/logo.png" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,600;9..40,700&display=swap" rel="stylesheet" />
    <style>
      html, body { margin: 0; background: #0f0f0e; color: #f0ede8; font-family: 'DM Sans', system-ui, sans-serif; -webkit-font-smoothing: antialiased; }
      main { min-height: 100dvh; box-sizing: border-box; display: flex; flex-direction: column; justify-content: center; max-width: 1200px; margin: 0 auto; padding: 48px 20px; }
      .mark { display: inline-flex; flex-direction: column; gap: 3px; margin-bottom: 64px; color: #f0ede8; font-weight: 700; font-size: 18px; letter-spacing: -0.02em; text-decoration: none; }
      .mark i { width: 2.05em; height: 1px; background: #e8355a; }
      h1 { margin: 0; font-size: clamp(36px, 5.6vw, 64px); font-weight: 600; letter-spacing: -0.035em; line-height: 1.05; }
      p { margin: 16px 0 32px; color: #a8a49c; font-size: 17px; }
      .btn { align-self: flex-start; display: inline-flex; align-items: center; min-height: 44px; padding: 0 24px; border-radius: 4px; background: #f0ede8; color: #0f0f0e; font-weight: 600; font-size: 15px; text-decoration: none; }
      a:focus-visible { outline: 2px solid #9fb4c6; outline-offset: 3px; }
      @media (min-width: 768px) { main { padding: 48px 40px; } }
    </style>
  </head>
  <body>
    <main>
      <a class="mark" href="/"><span>808 Audio</span><i aria-hidden="true"></i></a>
      <h1>Page not found</h1>
      <p>There is nothing at this address.</p>
      <a class="btn" href="/">Back to 808 Audio</a>
    </main>
  </body>
</html>
`
}
