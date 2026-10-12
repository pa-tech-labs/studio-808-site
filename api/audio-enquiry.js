// Vercel serverless function: an enquiry from the Studio 808 Voice page (/audio).
//
// Same pattern as tutor-request.js: validates with the validateAudioEnquiry
// the form uses, drops bots via a honeypot (the hidden "website" field;
// "company" is a real field here), rate-limits by IP in memory, then emails
// the enquiry as plain text via Resend with reply-to set to the enquirer.
// Nothing is stored: the email IS the enquiry, so a failed send fails the
// request and the visitor is offered retry and a mailto fallback.
//
// Only the Studio 808 Voice sites may post: https://voice.studio-808.com and
// https://www.studio-808.com (plus a preview deployment's own URL, and
// localhost under vercel dev). The form posts same-origin, so no CORS headers
// are sent and other sites' browsers cannot read the response anyway.
//
// Set in Vercel env vars for studio-808-site:
//   RESEND_API_KEY       (already set for the other forms)
//   AUDIO_ENQUIRY_TO     where enquiries go (required)
//   AUDIO_ENQUIRY_CC     optional CC, comma-separated for several
//   AUDIO_ENQUIRY_FROM   optional, default Studio 808 Voice <voice@send.studio-808.com>

import { enquirySubject, enquiryText, isAllowedEnquiryOrigin, isHoneypot, requestOrigin, validateAudioEnquiry } from '../src/lib/audioEnquiry.js'

// Per-IP limit, per warm instance: stops one client hammering the endpoint,
// not a distributed flood (the honeypot and Vercel's protection cover more).
const WINDOW_MS = 10 * 60 * 1000
const MAX_PER_WINDOW = 5
const hits = new Map()

function rateLimited(ip, now = Date.now()) {
  const recent = (hits.get(ip) ?? []).filter(t => now - t < WINDOW_MS)
  recent.push(now)
  hits.set(ip, recent)
  if (hits.size > 5000) {
    for (const [k, ts] of hits) if (ts.every(t => now - t >= WINDOW_MS)) hits.delete(k)
  }
  return recent.length > MAX_PER_WINDOW
}

function clientIp(req) {
  const fwd = req.headers?.['x-forwarded-for']
  const first = (Array.isArray(fwd) ? fwd[0] : fwd ?? '').split(',')[0].trim()
  return first || req.headers?.['x-real-ip'] || req.socket?.remoteAddress || 'unknown'
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  if (!isAllowedEnquiryOrigin(requestOrigin(req.headers), process.env)) {
    return res.status(403).json({ error: 'Enquiries can only be sent from the Studio 808 Voice website.' })
  }

  const body = req.body && typeof req.body === 'object' ? req.body : {}

  // Honeypot: pretend it worked so the bot moves on.
  if (isHoneypot(body)) return res.status(200).json({ ok: true })

  if (rateLimited(clientIp(req))) {
    return res.status(429).json({ error: 'Too many enquiries from this connection. Please try again in a few minutes, or email us.' })
  }

  const { ok, errors, value } = validateAudioEnquiry(body)
  if (!ok) {
    return res.status(400).json({ error: Object.values(errors)[0], errors })
  }

  const apiKey = process.env.RESEND_API_KEY
  const to = (process.env.AUDIO_ENQUIRY_TO ?? '').split(',').map(s => s.trim()).filter(Boolean)
  if (!apiKey || to.length === 0) {
    console.error('[audio-enquiry] RESEND_API_KEY or AUDIO_ENQUIRY_TO not set')
    return res.status(500).json({ error: 'Enquiries are not set up yet. Please email us instead.' })
  }
  const cc = (process.env.AUDIO_ENQUIRY_CC ?? '').split(',').map(s => s.trim()).filter(Boolean)
  const from = process.env.AUDIO_ENQUIRY_FROM || 'Studio 808 Voice <voice@send.studio-808.com>'

  try {
    await sendEmail(apiKey, {
      from,
      to,
      ...(cc.length ? { cc } : {}),
      reply_to: value.email,
      subject: enquirySubject(value),
      text: enquiryText(value),
    })
  } catch (err) {
    console.error('[audio-enquiry] send failed:', err.message)
    return res.status(502).json({ error: 'We could not send your enquiry. Please try again, or email us.' })
  }

  return res.status(200).json({ ok: true })
}

async function sendEmail(apiKey, payload) {
  const r = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  if (!r.ok) throw new Error(`Resend ${r.status}: ${await r.text()}`)
}
