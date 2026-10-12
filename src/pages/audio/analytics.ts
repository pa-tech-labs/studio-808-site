// The one analytics hook for /audio. The site loads no analytics tag today,
// so this does nothing until one exists. When GA4 (gtag.js) or Google Tag
// Manager is added to index.html, these window events are forwarded as named
// GA4 events with no further code:
//
//   'audio:play'     (Showreel, first play of each clip)  -> audio_play     { clip_id, clip_title, media_type }
//   'audio:complete' (Showreel, a clip finished)           -> audio_complete { clip_id, clip_title, media_type }
//   'audio:enquiry'  (Enquiry, sent successfully)          -> audio_enquiry  { project_type }
//
// gtag is preferred; with only GTM, events go to dataLayer as { event, ... }.

type Gtag = (command: 'event', name: string, params: Record<string, unknown>) => void
type W = Window & { gtag?: Gtag; dataLayer?: Record<string, unknown>[] }

const EVENTS: Record<string, (d: Record<string, unknown>) => [string, Record<string, unknown>]> = {
  'audio:play': d => ['audio_play', { clip_id: d.clipId, clip_title: d.title, media_type: d.mediaType }],
  'audio:complete': d => ['audio_complete', { clip_id: d.clipId, clip_title: d.title, media_type: d.mediaType }],
  'audio:enquiry': d => ['audio_enquiry', { project_type: d.projectType }],
}

/** Starts forwarding; returns the function that stops it. */
export function forwardAudioAnalytics(): () => void {
  const w = window as W
  const handlers = Object.entries(EVENTS).map(([type, map]) => {
    const fn = (e: Event) => {
      const [name, params] = map(((e as CustomEvent).detail ?? {}) as Record<string, unknown>)
      if (typeof w.gtag === 'function') w.gtag('event', name, params)
      else if (Array.isArray(w.dataLayer)) w.dataLayer.push({ event: name, ...params })
    }
    window.addEventListener(type, fn)
    return [type, fn] as const
  })
  return () => handlers.forEach(([type, fn]) => window.removeEventListener(type, fn))
}
