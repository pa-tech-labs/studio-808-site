// Studio 808 Voice tracking: the cookie consent record and the GA4 / Google
// Ads events the page sends. Plain JS so node's test runner can import it;
// src/pages/audio/analytics.ts and ConsentBanner.tsx do the browser side.
//
// Nothing loads before consent. Until the visitor accepts, no Google script
// is fetched and no cookie is set; window events from the page are dropped.

/** localStorage key for the visitor's choice. Bump the version to ask everyone again. */
export const CONSENT_KEY = 'a8-consent-v1'

/** UK ICO guidance: ask again after a while. Six months. */
export const CONSENT_MAX_AGE_MS = 182 * 24 * 60 * 60 * 1000

/**
 * The stored choice: 'granted', 'denied', or null when the visitor has not
 * chosen (or chose so long ago that we ask again, or the record is unreadable).
 */
export function readConsent(raw, now = Date.now()) {
  if (typeof raw !== 'string' || !raw) return null
  try {
    const r = JSON.parse(raw)
    if (r?.choice !== 'granted' && r?.choice !== 'denied') return null
    const at = Date.parse(r.at)
    if (!Number.isFinite(at) || now - at > CONSENT_MAX_AGE_MS || at - now > 60_000) return null
    return r.choice
  } catch {
    return null
  }
}

/** The string to store for a choice. */
export function consentRecord(choice, now = Date.now()) {
  return JSON.stringify({ choice: choice === 'granted' ? 'granted' : 'denied', at: new Date(now).toISOString() })
}

// ── Google tag ids from the environment ────────────────────────────────────

/** A GA4 measurement id like G-ABC123XYZ, or '' when unset or malformed. */
export function ga4Id(v) {
  const s = String(v ?? '').trim()
  return /^G-[A-Z0-9]{4,}$/i.test(s) ? s.toUpperCase() : ''
}

/**
 * A Google Ads conversion as Google shows it for gtag: "AW-123456789/AbC-dEf_1".
 * Returns { tagId: 'AW-123456789', sendTo: 'AW-123456789/AbC-dEf_1' }, or null
 * when unset or malformed.
 */
export function adsConversion(v) {
  const m = /^(AW-\d{6,})\/([A-Za-z0-9_-]+)$/.exec(String(v ?? '').trim())
  return m ? { tagId: m[1], sendTo: `${m[1]}/${m[2]}` } : null
}

// ── Events ─────────────────────────────────────────────────────────────────

/**
 * The gtag events for one window event from the page, as [name, params]
 * pairs. Unknown types give []:
 *
 *   'audio:play'     -> audio_play     { clip_id, clip_title, media_type }
 *   'audio:complete' -> audio_complete { clip_id, clip_title, media_type }
 *   'audio:enquiry'  -> generate_lead  { project_type, lead_source, form: 'voice_enquiry' }
 *                       and, with an Ads conversion, conversion { send_to }
 *
 * 'audio:enquiry' only fires on the form's success state (Enquiry.tsx).
 */
export function trackingEvents(type, detail, { ads } = {}) {
  const d = detail ?? {}
  switch (type) {
    case 'audio:play':
    case 'audio:complete':
      return [[type === 'audio:play' ? 'audio_play' : 'audio_complete', { clip_id: d.clipId, clip_title: d.title, media_type: d.mediaType }]]
    case 'audio:enquiry': {
      const events = [['generate_lead', { project_type: d.projectType, lead_source: d.source, form: 'voice_enquiry' }]]
      if (ads?.sendTo) events.push(['conversion', { send_to: ads.sendTo }])
      return events
    }
    default:
      return []
  }
}

export const TRACKED_EVENTS = ['audio:play', 'audio:complete', 'audio:enquiry']
