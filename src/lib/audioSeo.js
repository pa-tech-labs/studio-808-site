// SEO for the /audio tree (later audio.studio-808.com): head tags and JSON-LD,
// built from the audioPage singleton. Plain JS with no React or DOM so node's
// test runner can check it. Image URLs come in through `imageUrl`, so this
// file never needs the Sanity client.

import { mediaTypeOf, mediaUrlOf, visibleClips } from './showreel.js'

export const SITE_NAME = '808 Audio'
export const OG_WIDTH = 1200
export const OG_HEIGHT = 630
export const AREA_SERVED = ['Essex', 'London', 'United Kingdom']
const PARENT = { '@type': 'Organization', name: 'Studio 808 Ltd', url: 'https://www.studio-808.com/' }
const DEFAULT_TITLE = '808 Audio | Voiceover and audiobook recording in Chelmsford, Essex'
const DEFAULT_DESCRIPTION = 'Voiceover and audiobook recording studio in Chelmsford, Essex, with an engineer on every session.'
const TERMS_TITLE = 'Service terms | 808 Audio'
const TERMS_DESCRIPTION = 'Service terms for recording sessions at 808 Audio, Chelmsford.'

const text = s => (typeof s === 'string' && s.trim() ? s.trim() : '')
const some = a => Array.isArray(a) && a.length > 0
const stripSlash = s => s.replace(/\/+$/, '')

/** The engineers to show: the list, else the old single engineer. */
export function audioEngineers(page) {
  const ok = e => Boolean(e && (text(e.name) || some(e.bio)))
  const list = (page?.engineers ?? []).filter(ok)
  if (list.length) return list
  return ok(page?.engineer) ? [page.engineer] : []
}

/**
 * The URL of the /audio root: seo.canonicalUrl when set (the subdomain, where
 * /audio becomes the root), otherwise this origin's /audio. No trailing slash.
 */
export function audioBaseUrl(page, origin) {
  const canonical = text(page?.seo?.canonicalUrl)
  return canonical ? stripSlash(canonical) : `${stripSlash(origin)}/audio`
}

/** The canonical URL of a route: 'home' or 'terms'. */
export function audioCanonical(page, route, origin) {
  const base = audioBaseUrl(page, origin)
  return route === 'terms' ? `${base}/terms` : `${base}/`
}

/**
 * Everything the <head> needs for one route.
 * `ogImage` is the 1200x630 share image URL (or null).
 */
export function buildAudioHead({ page, route, origin, ogImage }) {
  const seo = page?.seo ?? {}
  const isTerms = route === 'terms'
  const title = isTerms ? TERMS_TITLE : text(seo.metaTitle) || DEFAULT_TITLE
  const description = isTerms ? TERMS_DESCRIPTION : text(seo.metaDescription) || DEFAULT_DESCRIPTION
  const canonical = audioCanonical(page, route, origin)
  return {
    title,
    description,
    canonical,
    robots: seo.noindex === true ? 'noindex, follow' : null,
    og: {
      title,
      description,
      type: 'website',
      url: canonical,
      site_name: SITE_NAME,
      image: ogImage || null,
      imageWidth: ogImage ? OG_WIDTH : null,
      imageHeight: ogImage ? OG_HEIGHT : null,
    },
    twitter: { card: 'summary_large_image', title, description, image: ogImage || null },
  }
}

/** The head as a flat list of tags, in the order they are rendered. */
export function audioHeadTags(head) {
  const tags = [
    { tag: 'meta', name: 'description', content: head.description },
    { tag: 'link', rel: 'canonical', href: head.canonical },
  ]
  if (head.robots) tags.push({ tag: 'meta', name: 'robots', content: head.robots })
  const og = head.og
  tags.push(
    { tag: 'meta', property: 'og:title', content: og.title },
    { tag: 'meta', property: 'og:description', content: og.description },
    { tag: 'meta', property: 'og:type', content: og.type },
    { tag: 'meta', property: 'og:url', content: og.url },
    { tag: 'meta', property: 'og:site_name', content: og.site_name },
  )
  if (og.image) {
    tags.push(
      { tag: 'meta', property: 'og:image', content: og.image },
      { tag: 'meta', property: 'og:image:width', content: String(og.imageWidth) },
      { tag: 'meta', property: 'og:image:height', content: String(og.imageHeight) },
    )
  }
  tags.push(
    { tag: 'meta', name: 'twitter:card', content: head.twitter.card },
    { tag: 'meta', name: 'twitter:title', content: head.twitter.title },
    { tag: 'meta', name: 'twitter:description', content: head.twitter.description },
  )
  if (head.twitter.image) tags.push({ tag: 'meta', name: 'twitter:image', content: head.twitter.image })
  return tags
}

// ── JSON-LD ─────────────────────────────────────────────────────────────────

const UK_POSTCODE = /([A-Z]{1,2}\d[A-Z\d]?\s*\d[A-Z]{2})\s*$/i

/**
 * "Unit 11, Robjohns House, Navigation Road, Chelmsford CM2 6ND" to a
 * PostalAddress. The town is the last comma part before the postcode
 * (Chelmsford when it cannot be told); the street is everything before it.
 */
export function parseUkAddress(line) {
  const raw = text(line)
  if (!raw) return null
  const m = UK_POSTCODE.exec(raw)
  const postalCode = m ? m[1].toUpperCase().replace(/\s+/g, ' ') : undefined
  const rest = (m ? raw.slice(0, m.index) : raw).replace(/[\s,]+$/, '')
  const parts = rest.split(',').map(s => s.trim()).filter(Boolean)
  const last = parts.at(-1) ?? ''
  const locality = parts.length > 1 && !/\d/.test(last) ? parts.pop() : 'Chelmsford'
  return {
    '@type': 'PostalAddress',
    streetAddress: parts.join(', ') || rest,
    addressLocality: locality,
    ...(postalCode ? { postalCode } : {}),
    addressCountry: 'GB',
  }
}

/** Seconds as an ISO 8601 duration: 75 to PT1M15S. */
export function isoDuration(seconds) {
  if (!Number.isFinite(seconds) || seconds <= 0) return undefined
  const s = Math.round(seconds)
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const r = s % 60
  return `PT${h ? `${h}H` : ''}${m ? `${m}M` : ''}${r || (!h && !m) ? `${r}S` : ''}`
}

const EXT_MIME = { mp3: 'audio/mpeg', m4a: 'audio/mp4', wav: 'audio/wav', ogg: 'audio/ogg', aac: 'audio/aac', flac: 'audio/flac', mp4: 'video/mp4', webm: 'video/webm', mov: 'video/quicktime' }
function mimeOf(url, given) {
  if (text(given)) return given
  const ext = /\.([a-z0-9]+)(?:\?|#|$)/i.exec(url ?? '')?.[1]?.toLowerCase()
  return ext ? EXT_MIME[ext] : undefined
}

/** Drops undefined, null and empty-string values (an intentional [] stays). */
const compact = o => Object.fromEntries(Object.entries(o).filter(([, v]) => v !== undefined && v !== null && v !== ''))

/**
 * The page's JSON-LD as one @graph, or null when there is no page.
 * route 'terms' carries the business only.
 * `imageUrl(image, width, height)` turns a Sanity image into a URL.
 */
export function buildAudioJsonLd({ data, route = 'home', origin, ogImage, imageUrl = () => null }) {
  const page = data?.page
  if (!page) return null
  const base = audioBaseUrl(page, origin)
  const home = `${base}/`
  const businessId = `${base}/#business`
  const footer = page.footer ?? {}

  const engineers = audioEngineers(page)
    .filter(e => text(e.name))
    .map(e => compact({ '@type': 'Person', name: text(e.name), jobTitle: text(e.role) }))

  const business = compact({
    '@type': 'LocalBusiness',
    '@id': businessId,
    additionalType: 'http://www.productontology.org/id/Recording_studio',
    name: SITE_NAME,
    url: home,
    image: ogImage || undefined,
    description: text(page.seo?.metaDescription) || undefined,
    telephone: text(footer.phone) || undefined,
    email: text(footer.email) || undefined,
    address: parseUkAddress(footer.addressLine) ?? undefined,
    areaServed: AREA_SERVED,
    openingHoursSpecification: [{
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      opens: '09:00',
      closes: '18:00',
    }],
    parentOrganization: PARENT,
    employee: engineers.length ? engineers : undefined,
    sameAs: [],
  })

  const graph = [business]
  if (route !== 'terms') {
    ;(page.services ?? []).filter(s => text(s?.title)).forEach((s, i) => {
      graph.push(compact({
        '@type': 'Service',
        '@id': `${base}/#service-${i + 1}`,
        name: text(s.title),
        serviceType: text(s.title),
        description: text(s.description) || undefined,
        provider: { '@id': businessId },
        areaServed: AREA_SERVED,
      }))
    })

    const faqs = (page.faqs ?? []).filter(f => text(f?.question) && text(f?.answer))
    if (faqs.length) {
      graph.push({
        '@type': 'FAQPage',
        '@id': `${base}/#faq`,
        mainEntity: faqs.map(f => ({
          '@type': 'Question',
          name: text(f.question),
          acceptedAnswer: { '@type': 'Answer', text: text(f.answer) },
        })),
      })
    }

    for (const clip of visibleClips(data.clips)) {
      const video = mediaTypeOf(clip) === 'video'
      const url = mediaUrlOf(clip)
      const thumb = video
        ? imageUrl(clip.posterImage, 1280, 720) || imageUrl(clip.coverImage, 1280, 720)
        : imageUrl(clip.coverImage, 800, 800)
      const by = [text(clip.production), text(clip.client)].filter(Boolean).join(', ')
      graph.push(compact({
        '@type': video ? 'VideoObject' : 'AudioObject',
        '@id': `${base}/#clip-${clip._id}`,
        name: text(clip.title),
        description: text(clip.description) || (by ? `${text(clip.title)}, recorded at 808 Audio for ${by}.` : `${text(clip.title)}, recorded at 808 Audio.`),
        contentUrl: url,
        encodingFormat: mimeOf(url, video ? clip.videoMimeType : clip.audioMimeType),
        duration: isoDuration(clip.durationSeconds),
        thumbnailUrl: thumb || undefined,
        uploadDate: text(clip._createdAt) || undefined,
        transcript: text(clip.transcript) || undefined,
        creator: text(clip.talent) ? { '@type': 'Person', name: text(clip.talent) } : undefined,
        publisher: { '@id': businessId },
      }))
    }
  }

  return { '@context': 'https://schema.org', '@graph': graph }
}

/** JSON for a <script type="application/ld+json">, safe against "</script>". */
export function jsonLdString(obj) {
  return JSON.stringify(obj).replace(/</g, '\\u003c')
}
