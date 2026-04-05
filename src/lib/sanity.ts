import { createClient } from '@sanity/client'
import imageUrlBuilder from '@sanity/image-url'

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
      note, pageHref, heroImage, galleryImages, sortOrder
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

export async function getSiteSettings(): Promise<SanitySettings | null> {
  if (!isConfigured()) return null
  return sanityClient.fetch<SanitySettings | null>(
    `*[_type == "siteSettings"][0] {
      siteName, contactEmail, phone, bookingUrl, address, socialLinks
    }`,
  )
}

// ── Formatting helpers ────────────────────────────────────────────────────────

export function formatPrice(studio: SanityStudio): string {
  return `£${studio.hourlyRate}/hr · ${studio.minimumHours}hr min`
}

/** Returns an image URL from a Sanity image asset, or null if not present. */
export function sanityImageUrl(image: SanityImage | undefined, width = 800): string | null {
  if (!image?.asset) return null
  return urlFor(image).width(width).url()
}
