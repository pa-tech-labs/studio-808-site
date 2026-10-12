import { urlFor } from '../../lib/sanity'
import type { SanityImage } from '../../lib/sanity'
import { makeAudioImageUrl } from '../../lib/audioImageUrl.js'

// Every Sanity image on /audio is requested as WebP at the size it is shown,
// never upscaled (fit max), and cropped to the editor's hotspot when a height
// is given. The URL rules live in lib/audioImageUrl.js, shared with the
// build-time prerender so both produce the same URLs.

/** A Sanity image, or (dev fixture only) a plain URL standing in for one. */
export type AudioImageSource = (SanityImage & { alt?: string | null }) | { url: string; alt?: string | null }

const imageUrl = makeAudioImageUrl(urlFor)

/** The image's URL at the given width (and height, which crops to the hotspot). */
export function audioImageUrl(image: AudioImageSource | null | undefined, width: number, height?: number): string | null {
  return imageUrl(image, width, height)
}

/**
 * A srcset of the image at each width. With an aspect ratio (width / height)
 * every candidate is cropped to it; without one, the original shape is kept.
 * Null for the dev fixture's plain URLs.
 */
export function audioImageSrcSet(image: AudioImageSource | null | undefined, widths: number[], aspect?: number): string | null {
  if (!image || 'url' in image || !image.asset) return null
  return widths
    .map(w => `${imageUrl(image, w, aspect ? Math.round(w / aspect) : undefined)} ${w}w`)
    .join(', ')
}

/** A logo scaled to the given height, aspect ratio preserved, never cropped. */
export function audioLogoUrl(image: AudioImageSource | null | undefined, height: number): string | null {
  if (!image) return null
  if ('url' in image) return image.url
  if (!image.asset) return null
  return urlFor(image).height(height).fit('max').format('webp').url()
}
