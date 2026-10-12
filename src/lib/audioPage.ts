// The 808 Audio page query and the shape it returns. Schemas live in
// schemaTypes/audioPage.ts, audioClip.ts and audioCredit.ts.
//
// The query does NOT filter on `cleared`: every clip and credit comes back
// with its `cleared` flag, and the frontend decides what to show.

import type { SanityImage } from './sanity'

export const AUDIO_PAGE_QUERY = `{
  "page": *[_id == "audioPage"][0] {
    enabled, seo, hero, showreelIntro, caseStudy, room, engineer,
    services, rates, process, faqs, enquiry, footer, terms, termsUpdated
  },
  "clips": *[_type == "audioClip"] | order(order asc) {
    _id, title, clipType, client, production, talent, engineer, description,
    "mediaType": coalesce(mediaType, "audio"),
    "audioUrl": audioFile.asset->url,
    "audioMimeType": audioFile.asset->mimeType,
    "peaksUrl": peaks.asset->url,
    "videoUrl": videoFile.asset->url,
    "videoMimeType": videoFile.asset->mimeType,
    posterImage, durationSeconds, transcript, coverImage, cleared, featured, order
  },
  "credits": *[_type == "audioCredit"] | order(order asc) {
    _id, name, logo, "logoAspect": logo.asset->metadata.dimensions.aspectRatio,
    talent, talentPhoto, creditType, url, cleared, order
  }
}`

/** A Sanity image with optional alt text. */
export type AudioImage = SanityImage & { alt?: string | null }

/** A Portable Text block array, rendered as-is. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type PortableText = any[]

export type AudioClipType = 'audiobook' | 'broadcast' | 'commercial' | 'elearning' | 'podcast' | 'other'
export type AudioCreditType = Exclude<AudioClipType, 'other'>
/** Missing (clips saved before the field existed) means audio. */
export type AudioMediaType = 'audio' | 'video'

export interface AudioLink { _key?: string; label?: string | null; href?: string | null }

/** The "808 Audio page" singleton (schemaTypes/audioPage.ts). */
export interface AudioPage {
  enabled?: boolean | null
  seo?: {
    metaTitle?: string | null
    metaDescription?: string | null
    ogImage?: SanityImage | null
    canonicalUrl?: string | null
    noindex?: boolean | null
  } | null
  hero?: {
    eyebrow?: string | null
    headline?: string | null
    subheadline?: string | null
    primaryCtaLabel?: string | null
    primaryCtaHref?: string | null
    secondaryCtaLabel?: string | null
    secondaryCtaHref?: string | null
    backgroundImage?: AudioImage | null
  } | null
  showreelIntro?: { heading?: string | null; body?: string | null } | null
  caseStudy?: {
    enabled?: boolean | null
    eyebrow?: string | null
    heading?: string | null
    client?: string | null
    body?: PortableText | null
    quote?: string | null
    quoteAttribution?: string | null
    image?: AudioImage | null
    cleared?: boolean | null
  } | null
  room?: {
    heading?: string | null
    body?: string | null
    gallery?: (AudioImage & { _key?: string })[] | null
    gearList?: string[] | null
    specs?: { _key?: string; label?: string | null; value?: string | null }[] | null
  } | null
  engineer?: {
    name?: string | null
    role?: string | null
    bio?: PortableText | null
    headshot?: AudioImage | null
    credits?: string[] | null
  } | null
  services?: {
    _key?: string
    title?: string | null
    description?: string | null
    icon?: string | null
    typicalUse?: string | null
  }[] | null
  rates?: {
    intro?: string | null
    vatNote?: string | null
    tiers?: {
      _key?: string
      name?: string | null
      price?: string | null
      unit?: string | null
      includes?: string[] | null
      featured?: boolean | null
    }[] | null
  } | null
  process?: { _key?: string; step?: number | null; title?: string | null; description?: string | null }[] | null
  faqs?: { _key?: string; question?: string | null; answer?: string | null }[] | null
  enquiry?: {
    heading?: string | null
    body?: string | null
    successMessage?: string | null
    projectTypes?: string[] | null
    /** Internal only. Never render this. */
    recipientNote?: string | null
  } | null
  footer?: {
    companyLine?: string | null
    addressLine?: string | null
    phone?: string | null
    email?: string | null
    links?: AudioLink[] | null
  } | null
  /** Service terms for /audio/terms, as Portable Text. */
  terms?: PortableText | null
  /** ISO date, e.g. 2026-10-12. */
  termsUpdated?: string | null
}

/** One audioClip document (schemaTypes/audioClip.ts). Show only when `cleared`. */
export interface AudioClip {
  _id: string
  title: string
  clipType?: AudioClipType | null
  client?: string | null
  production?: string | null
  talent?: string | null
  engineer?: string | null
  description?: string | null
  /** The query coalesces a missing value to "audio"; still treat null as audio. */
  mediaType?: AudioMediaType | null
  audioUrl?: string | null
  audioMimeType?: string | null
  peaksUrl?: string | null
  videoUrl?: string | null
  videoMimeType?: string | null
  posterImage?: SanityImage | null
  durationSeconds?: number | null
  transcript?: string | null
  coverImage?: SanityImage | null
  cleared?: boolean | null
  featured?: boolean | null
  order?: number | null
}

/** One audioCredit document (schemaTypes/audioCredit.ts). Show only when `cleared`. */
export interface AudioCredit {
  _id: string
  name: string
  logo?: SanityImage | null
  /** Logo width / height, from the asset's metadata. Sizes the logo row before images load. */
  logoAspect?: number | null
  talent?: string | null
  talentPhoto?: SanityImage | null
  creditType?: AudioCreditType | null
  url?: string | null
  cleared?: boolean | null
  order?: number | null
}

/** What AUDIO_PAGE_QUERY returns. `page` is null until the singleton exists. */
export interface AudioPageData {
  page: AudioPage | null
  clips: AudioClip[]
  credits: AudioCredit[]
}
