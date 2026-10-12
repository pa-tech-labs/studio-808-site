// The /audio page's GROQ query, in plain JS so the build scripts (prerender,
// sitemap) can import it without TypeScript. Types live in audioPage.ts.
//
// The query does NOT filter on `cleared`: every clip and credit comes back
// with its `cleared` flag, and the frontend decides what to show.

export const AUDIO_PAGE_QUERY = `{
  "page": *[_id == "audioPage"][0] {
    _updatedAt, enabled, seo, hero,
    "heroImageSize": hero.backgroundImage.asset->metadata.dimensions{ width, height }, showreelIntro, caseStudy, room, engineersHeading, engineers, engineer,
    services, rates, process, faqs, enquiry, footer, terms, termsUpdated
  },
  "clips": *[_type == "audioClip"] | order(order asc) {
    _id, _createdAt, title, clipType, client, production, talent, engineer, description,
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
