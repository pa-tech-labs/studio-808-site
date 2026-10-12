// <head> for the /audio tree: title, description, canonical, robots, Open
// Graph, Twitter and one JSON-LD script, built by src/lib/audioSeo.js from
// the audioPage singleton. Uses the react-helmet-async provider the app
// already mounts. Scoped to /audio: the main site keeps components/SEO.tsx.

import { Helmet } from 'react-helmet-async'
import type { AudioPageData } from '../../lib/audioPage'
import { audioHeadTags, buildAudioHead, buildAudioJsonLd, jsonLdString, OG_HEIGHT, OG_WIDTH, type AudioRoute } from '../../lib/audioSeo.js'
import { audioImageUrl } from './image'

export default function AudioHead({ data, route }: { data: AudioPageData; route: AudioRoute }) {
  const page = data.page
  const origin = typeof window === 'undefined' ? 'https://www.studio-808.com' : window.location.origin
  // The share image: seo.ogImage, else the hero photo, cropped to 1200x630.
  const ogImage = audioImageUrl(page?.seo?.ogImage, OG_WIDTH, OG_HEIGHT)
    ?? audioImageUrl(page?.hero?.backgroundImage, OG_WIDTH, OG_HEIGHT)
  const toAbsolute = (u: string | null) => (u && u.startsWith('/') ? `${origin}${u}` : u)

  const head = buildAudioHead({ page, route, origin, ogImage: toAbsolute(ogImage) })
  const jsonLd = buildAudioJsonLd({
    data,
    route,
    origin,
    ogImage: toAbsolute(ogImage),
    imageUrl: (img, w, h) => toAbsolute(audioImageUrl(img as Parameters<typeof audioImageUrl>[0], w, h)),
  })

  return (
    <Helmet prioritizeSeoTags>
      <title>{head.title}</title>
      {audioHeadTags(head).map((t, i) =>
        t.tag === 'link'
          ? <link key={i} rel={t.rel} href={t.href} />
          : 'property' in t
            ? <meta key={i} property={t.property} content={t.content} />
            : <meta key={i} name={t.name} content={t.content} />,
      )}
      {jsonLd && <script type="application/ld+json">{jsonLdString(jsonLd)}</script>}
    </Helmet>
  )
}
