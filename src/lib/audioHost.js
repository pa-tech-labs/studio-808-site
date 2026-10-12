// Where the 808 Audio pages live, depending on the host. On audio.studio-808.com
// they are the site root (/ and /terms); everywhere else (www, preview
// deployments, localhost) they sit under /audio. Every path, link, canonical
// and sitemap URL for the audio tree comes through here.

export const AUDIO_HOST = 'audio.studio-808.com'
export const AUDIO_ORIGIN = `https://${AUDIO_HOST}`
export const MAIN_ORIGIN = 'https://www.studio-808.com'

/** True on audio.studio-808.com (any case, any port). */
export function isAudioHost(host) {
  return String(host ?? '').toLowerCase().replace(/:\d+$/, '') === AUDIO_HOST
}

/** The prefix of the audio tree on this host: '' on the subdomain, '/audio' elsewhere. */
export function audioBasePath(host) {
  return isAudioHost(host) ? '' : '/audio'
}

/**
 * The path of an audio page on this host. `page` is 'home' or 'terms';
 * `hash` (without #) is an optional anchor on the home page.
 *   subdomain: / , /terms , /#rates
 *   elsewhere: /audio , /audio/terms , /audio#rates
 */
export function audioPath(host, page = 'home', hash = '') {
  const base = audioBasePath(host)
  const path = page === 'terms' ? `${base}/terms` : base || '/'
  return hash ? `${path}#${hash}` : path
}

/** Which audio page a pathname is on this host: 'home', 'terms' or null. */
export function audioPageOf(host, pathname) {
  const p = String(pathname ?? '').replace(/\/+$/, '') || '/'
  const base = audioBasePath(host)
  if (p === (base || '/')) return 'home'
  if (p === `${base}/terms`) return 'terms'
  return null
}

/** The current browser host, or '' outside a browser. */
export function currentHost() {
  return typeof window === 'undefined' ? '' : window.location.host
}
