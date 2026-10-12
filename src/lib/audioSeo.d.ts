import type { AudioEngineer, AudioPage, AudioPageData } from './audioPage'

export type AudioRoute = 'home' | 'terms'

export interface AudioHead {
  title: string
  description: string
  canonical: string
  robots: string | null
  og: {
    title: string
    description: string
    type: 'website'
    url: string
    site_name: string
    image: string | null
    imageWidth: number | null
    imageHeight: number | null
  }
  twitter: { card: 'summary_large_image'; title: string; description: string; image: string | null }
}

export type AudioHeadTag =
  | { tag: 'meta'; name: string; content: string }
  | { tag: 'meta'; property: string; content: string }
  | { tag: 'link'; rel: string; href: string }

export type ImageUrlFn = (image: unknown, width: number, height?: number) => string | null

export const SITE_NAME: string
export const OG_WIDTH: number
export const OG_HEIGHT: number
export const AREA_SERVED: string[]

export function audioEngineers(page: AudioPage | null | undefined): (AudioEngineer & { _key?: string })[]
export function audioBaseUrl(page: AudioPage | null | undefined, origin: string): string
export function audioCanonical(page: AudioPage | null | undefined, route: AudioRoute, origin: string): string
export function buildAudioHead(args: { page: AudioPage | null | undefined; route: AudioRoute; origin: string; ogImage?: string | null }): AudioHead
export function audioHeadTags(head: AudioHead): AudioHeadTag[]
export function parseUkAddress(line: string | null | undefined): Record<string, string> | null
export function isoDuration(seconds: number | null | undefined): string | undefined
export function buildAudioJsonLd(args: {
  data: AudioPageData | null | undefined
  route?: AudioRoute
  origin: string
  ogImage?: string | null
  imageUrl?: ImageUrlFn
}): { '@context': string; '@graph': Record<string, unknown>[] } | null
export function jsonLdString(obj: unknown): string
