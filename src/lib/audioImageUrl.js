// Sanity image URLs for /audio, shared by the browser (pages/audio/image.ts)
// and the build-time prerender, so both produce the same URLs: WebP, never
// upscaled (fit max), cropped to the hotspot when a height is given. A plain
// { url } (the dev fixture) is passed through.

/** `imageFor(image)` is a @sanity/image-url builder's .image(). */
export function makeAudioImageUrl(imageFor) {
  return (image, width, height) => {
    if (!image) return null
    if (typeof image.url === 'string') return image.url
    if (!image.asset) return null
    const b = imageFor(image).width(width).format('webp')
    return (height ? b.height(height).fit('crop') : b.fit('max')).url()
  }
}
