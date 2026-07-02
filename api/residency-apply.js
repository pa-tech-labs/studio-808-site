// Vercel serverless function — accepts Studio 808 Residency applications.
//
// Validates server-side, drops obvious bots via a honeypot, inserts a row into
// the Lumentry Supabase project's `residency_applications` table using the
// service_role key (server-side only — never exposed to the client), then emails
// a notification via Resend. A failed email does NOT fail the request: the
// application is already saved.
//
// Set in Vercel env vars for studio-808-site:
//   SUPABASE_URL                 https://eesphuovfbwfiqqldqtu.supabase.co
//   SUPABASE_SERVICE_ROLE_KEY    (Lumentry project service_role key — secret)
//   RESEND_API_KEY               (Resend API key — secret)
//   RESIDENCY_NOTIFY_TO          (optional, default paul@studio-808.com)
//   RESIDENCY_NOTIFY_FROM        (optional, default residency@send.studio-808.com)

const PLATFORMS = ['Instagram', 'TikTok', 'YouTube', 'Other']
const DISCIPLINES = ['DJ', 'Singer', 'Rapper', 'Producer', 'Other']
const WHY_MAX = 280

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function clean(v) {
  return typeof v === 'string' ? v.trim() : ''
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const body = req.body ?? {}

  // Honeypot: real users never fill this hidden field. If it has content, treat
  // it as a bot — respond 200 so the bot thinks it succeeded, but insert nothing.
  if (clean(body.company)) {
    return res.status(200).json({ ok: true })
  }

  const application = {
    name: clean(body.name),
    email: clean(body.email),
    phone: clean(body.phone) || null,
    primary_platform: clean(body.primary_platform),
    handle_url: clean(body.handle_url),
    additional_platforms: clean(body.additional_platforms) || null,
    discipline: clean(body.discipline),
    work_links: clean(body.work_links) || null,
    why_text: clean(body.why_text),
    consent_ad_disclosure: body.consent_ad_disclosure === true,
    status: 'new',
  }

  // Server-side validation.
  const errors = []
  if (!application.name) errors.push('Name is required.')
  if (!application.email) errors.push('Email is required.')
  else if (!EMAIL_RE.test(application.email)) errors.push('Email looks invalid.')
  if (!application.primary_platform) errors.push('Primary platform is required.')
  else if (!PLATFORMS.includes(application.primary_platform)) errors.push('Invalid primary platform.')
  if (!application.handle_url) errors.push('Handle or profile URL is required.')
  if (!application.discipline) errors.push('Discipline is required.')
  else if (!DISCIPLINES.includes(application.discipline)) errors.push('Invalid discipline.')
  if (!application.why_text) errors.push('Please tell us why Studio 808.')
  else if (application.why_text.length > WHY_MAX) errors.push(`"Why Studio 808" must be ${WHY_MAX} characters or fewer.`)
  if (!application.consent_ad_disclosure) errors.push('You must agree to the ASA ad-disclosure statement.')

  if (errors.length) {
    return res.status(400).json({ error: errors[0], errors })
  }

  const supabaseUrl = process.env.SUPABASE_URL
  const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceRole) {
    console.error('[residency-apply] SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY not set')
    return res.status(500).json({ error: 'Applications are not configured yet. Please email info@studio-808.com.' })
  }

  // Insert via PostgREST using the service_role key (bypasses RLS).
  let inserted
  try {
    const dbRes = await fetch(`${supabaseUrl}/rest/v1/residency_applications`, {
      method: 'POST',
      headers: {
        apikey: serviceRole,
        Authorization: `Bearer ${serviceRole}`,
        'Content-Type': 'application/json',
        Prefer: 'return=representation',
      },
      body: JSON.stringify(application),
    })

    if (!dbRes.ok) {
      const detail = await dbRes.text()
      console.error('[residency-apply] insert failed:', dbRes.status, detail)
      return res.status(500).json({ error: 'Could not save your application. Please try again.' })
    }

    const rows = await dbRes.json()
    inserted = Array.isArray(rows) ? rows[0] : rows
  } catch (err) {
    console.error('[residency-apply] insert error:', err.message)
    return res.status(500).json({ error: 'Could not save your application. Please try again.' })
  }

  // Notify — best effort. Never fail the request if the email doesn't send.
  await sendNotification(application, inserted).catch(err =>
    console.error('[residency-apply] notify error:', err.message),
  )

  return res.status(200).json({ ok: true })
}

async function sendNotification(application, inserted) {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    console.warn('[residency-apply] RESEND_API_KEY not set — skipping notification email')
    return
  }

  const to = process.env.RESIDENCY_NOTIFY_TO || 'paul@studio-808.com'
  const from = process.env.RESIDENCY_NOTIFY_FROM || 'Studio 808 Residency <residency@send.studio-808.com>'

  const esc = s =>
    String(s ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')

  const row = (label, value) =>
    value
      ? `<tr><td style="padding:6px 12px 6px 0;color:#666;vertical-align:top;white-space:nowrap;">${esc(label)}</td><td style="padding:6px 0;color:#111;white-space:pre-wrap;">${esc(value)}</td></tr>`
      : ''

  const html = `
    <div style="font-family:system-ui,sans-serif;font-size:14px;line-height:1.5;">
      <h2 style="margin:0 0 4px;">New Residency application</h2>
      <p style="margin:0 0 16px;color:#666;">${esc(application.name)} &lt;${esc(application.email)}&gt;</p>
      <table style="border-collapse:collapse;">
        ${row('Name', application.name)}
        ${row('Email', application.email)}
        ${row('Phone', application.phone)}
        ${row('Primary platform', application.primary_platform)}
        ${row('Handle / URL', application.handle_url)}
        ${row('Other platforms', application.additional_platforms)}
        ${row('Discipline', application.discipline)}
        ${row('Recent work', application.work_links)}
        ${row('Why Studio 808', application.why_text)}
        ${row('Ad-disclosure consent', application.consent_ad_disclosure ? 'Yes' : 'No')}
      </table>
      ${inserted && inserted.id ? `<p style="margin:16px 0 0;color:#999;font-size:12px;">Application ID: ${esc(inserted.id)}</p>` : ''}
    </div>`

  const emailRes = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from,
      to: [to],
      reply_to: application.email,
      subject: `New Residency application — ${application.name}`,
      html,
    }),
  })

  if (!emailRes.ok) {
    const detail = await emailRes.text()
    throw new Error(`Resend ${emailRes.status}: ${detail}`)
  }
}
