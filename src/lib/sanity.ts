import { createClient } from '@sanity/client'
import imageUrlBuilder from '@sanity/image-url'
import type { FinderQuestion, FinderRule } from './studioFinder.js'

const PROJECT_ID = import.meta.env.VITE_SANITY_PROJECT_ID ?? ''
const DATASET    = import.meta.env.VITE_SANITY_DATASET ?? 'production'

// Debug: confirm env vars are inlined at build time
console.log('[sanity] projectId:', PROJECT_ID || '(not set — check VITE_SANITY_PROJECT_ID env var)')

export const sanityClient = createClient({
  projectId: PROJECT_ID,
  dataset: DATASET,
  useCdn: true,
  apiVersion: '2024-01-01',
})

const builder = imageUrlBuilder(sanityClient)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const urlFor = (source: any): ReturnType<typeof builder.image> => builder.image(source)

// ── Types ─────────────────────────────────────────────────────────────────────

export interface SanityService {
  name: string
  price: string
  description: string
}

export interface SanityImage {
  asset: { _ref: string; _type: string }
  _type: 'image'
}

export interface SanityStudio {
  _id: string
  name: string
  studioNumber: string
  tagline: string
  shortDescription: string
  description: string
  hourlyRate: number
  minimumHours: number
  capacity: string
  tags: string[]
  equipment: string[]
  services?: SanityService[]
  note?: string | null
  pageHref: string
  /** Cue booking-link slug (studio-1 .. studio-4); null until set in Studio. */
  cueRoomSlug?: string | null
  heroImage?: SanityImage
  galleryImages?: SanityImage[]
  sortOrder: number
}

export interface SanityPage {
  heroHeadline: string
  heroSubtext: string
  seoTitle: string
  seoDescription: string
}

export interface SanitySettings {
  siteName: string
  contactEmail: string
  phone: string | null
  bookingUrl: string
  address: string
  socialLinks: Array<{ platform: string; url: string }>
}

/** The studio fields the finder's result screen shows. */
export interface FinderStudio {
  _id: string
  name: string
  tagline: string
  shortDescription?: string | null
  hourlyRate: number
  minimumHours: number
  heroImage?: SanityImage
  pageHref?: string | null
  cueRoomSlug?: string | null
  sortOrder: number
  studioNumber: string
}

/** The "Studio finder" singleton (schemaTypes/studioFinder.ts). */
export interface SanityStudioFinder {
  enabled?: boolean | null
  heading?: string | null
  intro?: string | null
  ctaLabel?: string | null
  questions?: FinderQuestion[] | null
  rules?: FinderRule<FinderStudio>[] | null
  tutor?: {
    enabled?: boolean | null
    questionCopy?: string | null
    formTitle?: string | null
    formIntro?: string | null
    successMessage?: string | null
  } | null
  result?: { heading?: string | null; bookLabel?: string | null; restartLabel?: string | null } | null
}

// ── Query helpers ─────────────────────────────────────────────────────────────

function isConfigured(): boolean {
  return Boolean(PROJECT_ID)
}

export async function getStudios(): Promise<SanityStudio[]> {
  if (!isConfigured()) return []
  return sanityClient.fetch<SanityStudio[]>(
    `*[_type == "studio"] | order(sortOrder asc) {
      _id, name, studioNumber, tagline, shortDescription, description,
      hourlyRate, minimumHours, capacity, tags, equipment, services,
      note, pageHref, cueRoomSlug, heroImage, galleryImages, sortOrder
    }`,
  )
}

export async function getPage(slug: string): Promise<SanityPage | null> {
  if (!isConfigured()) return null
  return sanityClient.fetch<SanityPage | null>(
    `*[_type == "page" && slug.current == $slug][0] {
      heroHeadline, heroSubtext, seoTitle, seoDescription
    }`,
    { slug },
  )
}

/**
 * A page is enabled unless its `page` document explicitly says `isEnabled: false`.
 * No document, no field, or Sanity not configured all read as enabled.
 */
export async function isPageEnabled(slug: string): Promise<boolean> {
  if (!isConfigured()) return true
  const enabled = await sanityClient.fetch<boolean | null>(
    `*[_type == "page" && slug.current == $slug][0].isEnabled`,
    { slug },
  )
  return enabled !== false
}

export async function getSiteSettings(): Promise<SanitySettings | null> {
  if (!isConfigured()) return null
  return sanityClient.fetch<SanitySettings | null>(
    `*[_type == "siteSettings"][0] {
      siteName, contactEmail, phone, bookingUrl, address, socialLinks
    }`,
  )
}

/**
 * The published Studio finder singleton, with each rule's studio expanded.
 * Null when Sanity is not configured or the document does not exist.
 */
export async function getStudioFinder(): Promise<SanityStudioFinder | null> {
  if (!isConfigured()) return null
  return sanityClient.fetch<SanityStudioFinder | null>(
    `*[_id == "studioFinder"][0] {
      enabled, heading, intro, ctaLabel,
      questions[] { key, title, helper, skippable, options[] { label, value, helper }, showIf[] { questionKey, equals } },
      rules[] {
        conditions[] { questionKey, equals }, reason, addOns, memberLine,
        studio-> { _id, name, tagline, shortDescription, hourlyRate, minimumHours, heroImage, pageHref, cueRoomSlug, sortOrder, studioNumber }
      },
      tutor, result
    }`,
  )
}

// ── Formatting helpers ────────────────────────────────────────────────────────

export function formatPrice(studio: Pick<SanityStudio, 'hourlyRate' | 'minimumHours'>): string {
  return `£${studio.hourlyRate}/hr · ${studio.minimumHours}hr min`
}

/** Returns an image URL from a Sanity image asset, or null if not present. */
export function sanityImageUrl(image: SanityImage | undefined, width = 800): string | null {
  if (!image?.asset) return null
  return urlFor(image).width(width).url()
}
