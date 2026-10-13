// The www and apex /audio paths move to voice.studio-808.com with a 301, but
// only once the subdomain is live: AUDIO_SUBDOMAIN_LIVE=true in the Vercel
// environment. Until then they keep serving the app on www. Used by
// middleware.ts at the repo root; plain JS so node's test runner can check it.
//
// The middleware owns www and apex /audio outright: vercel.json has no rule
// for them, because Vercel places the middleware after vercel.json's own
// rules, and a rule that ended the request there would stop the middleware
// from ever running (the bug this replaced).

import { VOICE_ORIGIN } from './audioHost.js'

/** The hosts whose /audio paths move (the main site). */
export const REDIRECT_HOSTS = ['www.studio-808.com', 'studio-808.com']

/** The main site's app shell, served for /audio on www and apex until the move. */
export const APP_SHELL = '/index.html'

/** True only for the exact string "true". */
export function subdomainLive(env) {
  return env?.AUDIO_SUBDOMAIN_LIVE === 'true'
}

const mainHost = host => REDIRECT_HOSTS.includes(String(host ?? '').toLowerCase().replace(/:\d+$/, ''))

/** "/audio" or "/audio/..." with no file extension: a page of the audio tree, not a file. */
const audioPage = pathname => /^\/audio(\/.*)?$/.test(pathname) && !/^\/audio\/[^/]+\.[a-z0-9]+$/i.test(pathname)

/**
 * Where a request should go, or null to let it through.
 *   www.studio-808.com/audio          -> https://voice.studio-808.com/
 *   www.studio-808.com/audio/terms?x  -> https://voice.studio-808.com/terms?x
 * Only on the main hosts, only for /audio pages, only when live.
 * Files under /audio (public/audio, e.g. /audio/studio-808-wordmark.png) are
 * not pages: they stay where they are on every host.
 */
export function audioRedirectTarget(requestUrl, host, env) {
  if (!subdomainLive(env) || !mainHost(host)) return null
  const url = new URL(requestUrl)
  if (!audioPage(url.pathname)) return null
  const rest = url.pathname.slice('/audio'.length)
  return `${VOICE_ORIGIN}${rest && rest !== '/' ? rest : '/'}${url.search}`
}

/**
 * What the middleware does with a request:
 *   { redirect: url }  main host, live: 301 to voice
 *   { rewrite: path }  main host, not live: serve the app shell (not the
 *                      subdomain's prerendered /audio/index.html, whose
 *                      canonical points at voice)
 *   null               anything else (preview hosts, files): carry on as normal
 */
export function audioMiddlewareAction(requestUrl, host, env) {
  if (!mainHost(host) || !audioPage(new URL(requestUrl).pathname)) return null
  const target = audioRedirectTarget(requestUrl, host, env)
  return target ? { redirect: target } : { rewrite: APP_SHELL }
}
