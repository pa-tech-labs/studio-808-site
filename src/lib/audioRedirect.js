// The www and apex /audio paths move to voice.studio-808.com with a 301, but
// only once the subdomain is live: AUDIO_SUBDOMAIN_LIVE=true in the Vercel
// environment. Until then they keep serving the app on www. Used by
// middleware.ts at the repo root; plain JS so node's test runner can check it.

import { VOICE_ORIGIN } from './audioHost.js'

/** The hosts whose /audio paths move (the main site). */
export const REDIRECT_HOSTS = ['www.studio-808.com', 'studio-808.com']

/** True only for the exact string "true". */
export function subdomainLive(env) {
  return env?.AUDIO_SUBDOMAIN_LIVE === 'true'
}

/**
 * Where a request should go, or null to let it through.
 *   www.studio-808.com/audio          -> https://voice.studio-808.com/
 *   www.studio-808.com/audio/terms?x  -> https://voice.studio-808.com/terms?x
 * Only on the main hosts, only for /audio and /audio/..., only when live.
 * Files under /audio (public/audio, e.g. /audio/studio-808-wordmark.png) are
 * not pages: they stay where they are on every host.
 */
export function audioRedirectTarget(requestUrl, host, env) {
  if (!subdomainLive(env)) return null
  const h = String(host ?? '').toLowerCase().replace(/:\d+$/, '')
  if (!REDIRECT_HOSTS.includes(h)) return null
  const url = new URL(requestUrl)
  const m = /^\/audio(\/.*)?$/.exec(url.pathname)
  if (!m || /^\/[^/]+\.[a-z0-9]+$/i.test(m[1] ?? '')) return null
  return `${VOICE_ORIGIN}${m[1] && m[1] !== '/' ? m[1] : '/'}${url.search}`
}
