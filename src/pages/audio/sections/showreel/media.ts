// Writes to the active media element. The element lives in React state, so
// these go through plain functions rather than assigning in components.

import type { AudioClip } from '../../../../lib/audioPage'
import { audioImageUrl } from '../../image'

export function seekMedia(el: HTMLMediaElement, seconds: number) {
  el.currentTime = seconds
}

/** Play from the start if the clip had finished. */
export function playMedia(el: HTMLMediaElement): Promise<void> {
  if (el.ended) el.currentTime = 0
  return el.play()
}

/** Stop an element that is being replaced, and drop its download. */
export function releaseMedia(el: HTMLMediaElement) {
  el.pause()
  el.removeAttribute('src')
  el.load()
}

export function toggleMuted(el: HTMLMediaElement) {
  el.muted = !el.muted
}

/** The clip's image (cover, else video poster) as a square of `size` px. */
export function clipThumb(clip: AudioClip, size: number): string | null {
  return audioImageUrl(clip.coverImage, size, size) ?? audioImageUrl(clip.posterImage, size, size)
}
