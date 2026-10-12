/** Anchor targets on the /audio page. Each section's root element takes its id. */
export const AUDIO_ANCHORS = {
  work: 'work',
  studio: 'studio',
  rates: 'rates',
  faq: 'faq',
  enquire: 'enquire',
} as const

/**
 * Scroll to an anchor on the /audio page: smooth unless reduced motion is
 * set, landing below the sticky header (each section's scroll-margin-top).
 * Keeps the hash in the URL without adding a history entry per click.
 */
export function scrollToAnchor(id: string): boolean {
  const target = document.getElementById(id)
  if (!target) return false
  const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
  target.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' })
  if (window.location.hash !== `#${id}`) window.history.replaceState(window.history.state, '', `#${id}`)
  return true
}
