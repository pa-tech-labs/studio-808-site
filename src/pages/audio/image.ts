import { urlFor } from '../../lib/sanity'
import type { SanityImage } from '../../lib/sanity'

/** A Sanity image, or (dev fixture only) a plain URL standing in for one. */
export type AudioImageSource = (SanityImage & { alt?: string | null }) | { url: string; alt?: string | null }

/** The image's URL at the given width (and height, which crops to the hotspot). */
export function audioImageUrl(image: AudioImageSource | null | undefined, width: number, height?: number): string | null {
  if (!image) return null
  if ('url' in image) return image.url
  if (!image.asset) return null
  const b = urlFor(image).width(width).auto('format')
  return (height ? b.height(height).fit('crop') : b).url()
}

/** A logo scaled to the given height, aspect ratio preserved, never cropped. */
export function audioLogoUrl(image: AudioImageSource | null | undefined, height: number): string | null {
  if (!image) return null
  if ('url' in image) return image.url
  if (!image.asset) return null
  return urlFor(image).height(height).fit('max').auto('format').url()
}
