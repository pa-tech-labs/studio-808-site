// Where the Studio 808 Voice pages live, depending on the host. On
// voice.studio-808.com they are the site root (/ and /terms); everywhere else
// (www, preview deployments, localhost) they sit under /audio. Every path,
// link, canonical and sitemap URL for the audio tree comes through here.
// (The code keeps the "audio" names: they are identifiers, not copy.)

export const VOICE_HOST = 'voice.studio-808.com'
export const VOICE_ORIGIN = `https://${VOICE_HOST}`
/** The service's first host name: 301s to voice.studio-808.com (vercel.json). */
export const OLD_AUDIO_HOST = 'audio.studio-808.com'
export const MAIN_ORIGIN = 'https://www.studio-808.com'

/** True on voice.studio-808.com (any case, any port). */
export function isAudioHost(host) {
  return String(host ?? '').toLowerCase().replace(/:\d+$/, '') === VOICE_HOST
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
