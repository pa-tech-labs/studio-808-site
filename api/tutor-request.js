// Vercel serverless function: a "Find your studio" visitor asks for a DJ tutor.
//
// Validates with the same validateTutorRequest the form uses, drops obvious
// bots via a honeypot (like residency-apply.js), rate-limits by IP, then
// emails the tutor contact via Resend and sends the customer a short
// confirmation from the same sender. Nothing is stored and nothing is written
// to Sanity: the email IS the request, so a failed tutor email fails the
// request (the customer is told to try again) while a failed confirmation
// does not.
//
// Set in Vercel env vars for studio-808-site:
//   RESEND_API_KEY       (already set for the application forms)
//   TUTOR_REQUEST_TO     where requests go (required)
//   TUTOR_REQUEST_CC     optional CC, comma-separated for several
//   TUTOR_REQUEST_FROM   optional, default Studio 808 <tutor@send.studio-808.com>

import { validateTutorRequest } from '../src/lib/studioFinder.js'

// Per-IP limit. In memory, so it holds per warm function instance rather than
// globally: enough to stop one client hammering the endpoint, not a
// distributed flood (the honeypot and Vercel's own protection cover more).
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

const esc = s =>
  String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const body = req.body ?? {}

  // Honeypot: real people never fill this hidden field. Pretend it worked.
  if (typeof body.company === 'string' && body.company.trim()) {
    return res.status(200).json({ ok: true })
  }

  if (rateLimited(clientIp(req))) {
    return res.status(429).json({ error: 'Too many requests. Please try again in a few minutes.' })
  }

  const { ok, errors, value } = validateTutorRequest(body)
  if (!ok) {
    const first = Object.values(errors)[0]
    return res.status(400).json({ error: first, errors })
  }

  const apiKey = process.env.RESEND_API_KEY
  const to = (process.env.TUTOR_REQUEST_TO ?? '').trim()
  if (!apiKey || !to) {
    console.error('[tutor-request] RESEND_API_KEY or TUTOR_REQUEST_TO not set')
    return res.status(500).json({ error: 'Tutor requests are not set up yet. Please email info@studio-808.com.' })
  }
  const cc = (process.env.TUTOR_REQUEST_CC ?? '').split(',').map(s => s.trim()).filter(Boolean)
  const from = process.env.TUTOR_REQUEST_FROM || 'Studio 808 <tutor@send.studio-808.com>'

  try {
    await sendEmail(apiKey, {
      from,
      to: [to],
      ...(cc.length ? { cc } : {}),
      reply_to: value.email,
      subject: `DJ tutor request - ${value.name}`,
      html: tutorHtml(value),
    })
  } catch (err) {
    console.error('[tutor-request] notify failed:', err.message)
    return res.status(502).json({ error: 'We could not send your request. Please try again.' })
  }

  // Confirmation: best effort. The request has already reached the tutor.
  await sendEmail(apiKey, {
    from,
    to: [value.email],
    subject: 'We have your tutor request',
    html: confirmationHtml(value),
  }).catch(err => console.error('[tutor-request] confirmation failed:', err.message))

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

// Email HTML: every line is its own <tr>/<p>. No white-space:pre-wrap, which
// Outlook ignores.
const row = (label, v) =>
  v ? `<tr><td style="padding:6px 12px 6px 0;color:#666;vertical-align:top;">${esc(label)}</td><td style="padding:6px 0;color:#111;">${esc(v)}</td></tr>` : ''

function tutorHtml(v) {
  return `
    <div style="font-family:system-ui,sans-serif;font-size:14px;line-height:1.5;">
      <h2 style="margin:0 0 4px;">New DJ tutor request</h2>
      <p style="margin:0 0 16px;color:#666;">From the Find your studio wizard on studio-808.com</p>
      <table style="border-collapse:collapse;">
        ${row('Name', v.name)}
        ${row('Email', v.email)}
        ${row('Phone', v.phone)}
        ${row('Preferred days', v.preferredDays.join(', '))}
        ${row('Recommended studio', v.studio)}
      </table>
      ${v.answers.length ? `<h3 style="margin:20px 0 6px;font-size:14px;">Their answers</h3><table style="border-collapse:collapse;">${v.answers.map(a => row(a.question, a.answer)).join('')}</table>` : ''}
      <p style="margin:16px 0 0;color:#999;font-size:12px;">Reply to this email to reach ${esc(v.name)} directly.</p>
    </div>`
}

function confirmationHtml(v) {
  return `
    <div style="font-family:system-ui,sans-serif;font-size:15px;line-height:1.6;color:#111;">
      <p style="margin:0 0 12px;">Hi ${esc(v.name.split(' ')[0])},</p>
      <p style="margin:0 0 12px;">Thanks for asking about a DJ tutor session. We have passed your details to our DJ tutor, who will be in touch to arrange a time.</p>
      <p style="margin:0 0 12px;">You told us these days suit you: ${esc(v.preferredDays.join(', '))}.</p>
      <p style="margin:0;">Studio 808, Chelmsford</p>
    </div>`
}
