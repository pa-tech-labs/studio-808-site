// The one analytics hook for the Studio 808 Voice shell. Google's tag
// (gtag.js) is loaded only after the visitor accepts cookies in the consent
// banner (ConsentBanner.tsx); before that nothing is fetched and the page's
// window events are dropped. Which events go where is in lib/voiceTracking.js:
//
//   'audio:play'     (Showreel, first play of each clip) -> audio_play
//   'audio:complete' (Showreel, a clip finished)          -> audio_complete
//   'audio:enquiry'  (Enquiry, success state only)        -> generate_lead, plus a
//                                                            Google Ads conversion when set
//
// Configured at build time (Vercel env vars, both optional):
//   VITE_GA4_MEASUREMENT_ID        e.g. G-ABC123XYZ
//   VITE_GOOGLE_ADS_CONVERSION_ID  the conversion's send_to, e.g. AW-123456789/AbCdEfGh
// With neither set there is nothing to consent to, so no banner shows.

import { TRACKED_EVENTS, adsConversion, ga4Id, trackingEvents } from '../../lib/voiceTracking.js'

type Gtag = (...args: unknown[]) => void
type W = Window & { gtag?: Gtag; dataLayer?: unknown[] }

const GA4 = ga4Id(import.meta.env.VITE_GA4_MEASUREMENT_ID)
const ADS = adsConversion(import.meta.env.VITE_GOOGLE_ADS_CONVERSION_ID)

/** True when there is a Google tag to ask consent for. */
export const trackingConfigured = Boolean(GA4 || ADS)

let loaded = false

/** Loads gtag.js and configures GA4 and Ads. Call only once the visitor has accepted. */
export function loadGoogleTag() {
  if (loaded || !trackingConfigured) return
  loaded = true
  const w = window as W
  w.dataLayer = w.dataLayer || []
  // gtag.js reads the arguments object itself, not an array.
  w.gtag = function gtag() {
    // eslint-disable-next-line prefer-rest-params
    w.dataLayer!.push(arguments)
  }
  w.gtag('consent', 'default', {
    analytics_storage: 'granted',
    ad_storage: ADS ? 'granted' : 'denied',
    ad_user_data: ADS ? 'granted' : 'denied',
    ad_personalization: 'denied',
  })
  w.gtag('js', new Date())
  if (GA4) w.gtag('config', GA4)
  if (ADS) w.gtag('config', ADS.tagId)

  const s = document.createElement('script')
  s.async = true
  s.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(GA4 || ADS!.tagId)}`
  document.head.appendChild(s)
}

/**
 * The visitor withdrew consent: tell the tag to stop, and delete the cookies
 * it set (_ga, _ga_*, _gid, _gcl_*), on this host and the parent domain.
 */
export function revokeGoogleTag() {
  const w = window as W
  if (loaded && typeof w.gtag === 'function') {
    w.gtag('consent', 'update', { analytics_storage: 'denied', ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied' })
  }
  loaded = false
  const host = window.location.hostname
  const domains = ['', host, `.${host}`, `.${host.split('.').slice(-2).join('.')}`]
  for (const c of document.cookie.split(';')) {
    const name = c.split('=')[0].trim()
    if (!/^(_ga|_gid|_gat|_gcl_)/.test(name)) continue
    for (const d of domains) document.cookie = `${name}=; Max-Age=0; path=/${d ? `; domain=${d}` : ''}`
  }
}

/** Starts forwarding the page's window events to gtag; returns the function that stops it. */
export function forwardAudioAnalytics(): () => void {
  const w = window as W
  const handlers = TRACKED_EVENTS.map(type => {
    const fn = (e: Event) => {
      if (!loaded || typeof w.gtag !== 'function') return
      for (const [name, params] of trackingEvents(type, (e as CustomEvent).detail, { ads: ADS })) w.gtag('event', name, params)
    }
    window.addEventListener(type, fn)
    return [type, fn] as const
  })
  return () => handlers.forEach(([type, fn]) => window.removeEventListener(type, fn))
}
