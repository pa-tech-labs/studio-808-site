// Vercel serverless function — accepts Studio 808 Assistant Videographer applications.
//
// Validates server-side, drops obvious bots via a honeypot, optionally uploads a
// CV to the private `videographer-cvs` storage bucket, inserts a row into the
// Lumentry Supabase project's `videographer_applications` table using the
// service_role key (server-side only — never exposed to the client), then emails
// a notification via Resend with a short-lived signed link to the CV. A failed
// email does NOT fail the request: the application is already saved.
//
// The CV arrives as base64 inside the JSON body. Vercel caps the request body at
// ~4.5MB, so the client limits CVs to 4MB before base64 encoding.
//
// Set in Vercel env vars for studio-808-site:
//   SUPABASE_URL                 https://eesphuovfbwfiqqldqtu.supabase.co
//   SUPABASE_SERVICE_ROLE_KEY    (Lumentry project service_role key — secret)
//   RESEND_API_KEY               (Resend API key — secret)
//   VIDEOGRAPHER_NOTIFY_TO       (optional, default paul@studio-808.com)
//   VIDEOGRAPHER_NOTIFY_FROM     (optional, default videographer@send.lumentry.io)

export const config = {
  api: {
    // Allow room for a base64-encoded CV (4MB file ≈ 5.4MB encoded).
    bodyParser: { sizeLimit: '6mb' },
  },
}

const ABOUT_MAX = 400
const CV_MAX_BYTES = 4 * 1024 * 1024 // 4MB
const CV_BUCKET = 'videographer-cvs'
const ALLOWED_CV_TYPES = {
  'application/pdf': 'pdf',
  'application/msword': 'doc',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function clean(v) {
  return typeof v === 'string' ? v.trim() : ''
}

function slugify(s) {
  return String(s || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40) || 'applicant'
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
    location: clean(body.location),
    has_car: body.has_car === true || body.has_car === 'yes',
    showreel_url: clean(body.showreel_url) || null,
    experience: clean(body.experience) || null,
    about_text: clean(body.about_text),
    status: 'new',
  }

  // Server-side validation.
  const errors = []
  if (!application.name) errors.push('Name is required.')
  if (!application.email) errors.push('Email is required.')
  else if (!EMAIL_RE.test(application.email)) errors.push('Email looks invalid.')
  if (!application.location) errors.push('Location is required.')
  if (body.has_car !== true && body.has_car !== 'yes' && body.has_car !== false && body.has_car !== 'no')
    errors.push('Please tell us whether you have a car.')
  if (!application.about_text) errors.push('Please tell us a little about yourself.')
  else if (application.about_text.length > ABOUT_MAX) errors.push(`"About you" must be ${ABOUT_MAX} characters or fewer.`)

  // Validate the CV up front (if one was attached) before we touch the network.
  let cvBuffer = null
  let cvExt = null
  if (body.cv && body.cv.data) {
    const type = clean(body.cv.type)
    cvExt = ALLOWED_CV_TYPES[type]
    if (!cvExt) {
      errors.push('CV must be a PDF, DOC or DOCX file.')
    } else {
      try {
        cvBuffer = Buffer.from(String(body.cv.data), 'base64')
      } catch {
        errors.push('Could not read the CV file.')
      }
      if (cvBuffer && cvBuffer.length > CV_MAX_BYTES) {
        errors.push('CV must be 4MB or smaller.')
        cvBuffer = null
      }
    }
  }

  if (errors.length) {
    return res.status(400).json({ error: errors[0], errors })
  }

  const supabaseUrl = process.env.SUPABASE_URL
  const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceRole) {
    console.error('[videographer-apply] SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY not set')
    return res.status(500).json({ error: 'Applications are not configured yet. Please email info@studio-808.com.' })
  }

  // Upload the CV (best-effort-ish: if it fails we still take the application,
  // but we surface a soft error so the applicant can email it instead).
  if (cvBuffer) {
    const cvFilename = clean(body.cv.filename) || `cv.${cvExt}`
    const objectPath = `${slugify(application.name)}/${Date.now()}-${slugify(application.name)}.${cvExt}`
    try {
      const upRes = await fetch(
        `${supabaseUrl}/storage/v1/object/${CV_BUCKET}/${objectPath}`,
        {
          method: 'POST',
          headers: {
            apikey: serviceRole,
            Authorization: `Bearer ${serviceRole}`,
            'Content-Type': Object.keys(ALLOWED_CV_TYPES).find(k => ALLOWED_CV_TYPES[k] === cvExt),
            'x-upsert': 'true',
          },
          body: cvBuffer,
        },
      )
      if (upRes.ok) {
        application.cv_path = objectPath
        application.cv_filename = cvFilename
      } else {
        console.error('[videographer-apply] CV upload failed:', upRes.status, await upRes.text())
      }
    } catch (err) {
      console.error('[videographer-apply] CV upload error:', err.message)
    }
  }

  // Insert via PostgREST using the service_role key (bypasses RLS).
  let inserted
  try {
    const dbRes = await fetch(`${supabaseUrl}/rest/v1/videographer_applications`, {
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
      console.error('[videographer-apply] insert failed:', dbRes.status, detail)
      return res.status(500).json({ error: 'Could not save your application. Please try again.' })
    }

    const rows = await dbRes.json()
    inserted = Array.isArray(rows) ? rows[0] : rows
  } catch (err) {
    console.error('[videographer-apply] insert error:', err.message)
    return res.status(500).json({ error: 'Could not save your application. Please try again.' })
  }

  // Notify — best effort. Never fail the request if the email doesn't send.
  await sendNotification(application, inserted, { supabaseUrl, serviceRole }).catch(err =>
    console.error('[videographer-apply] notify error:', err.message),
  )

  return res.status(200).json({ ok: true })
}

// Ask Supabase Storage for a signed URL to the CV (valid 7 days) so the reviewer
// can download it straight from the notification email.
async function signCv(cvPath, { supabaseUrl, serviceRole }) {
  if (!cvPath) return null
  try {
    const res = await fetch(`${supabaseUrl}/storage/v1/object/sign/${CV_BUCKET}/${cvPath}`, {
      method: 'POST',
      headers: {
        apikey: serviceRole,
        Authorization: `Bearer ${serviceRole}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ expiresIn: 60 * 60 * 24 * 7 }),
    })
    if (!res.ok) return null
    const { signedURL } = await res.json()
    return signedURL ? `${supabaseUrl}/storage/v1${signedURL}` : null
  } catch {
    return null
  }
}

async function sendNotification(application, inserted, storage) {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    console.warn('[videographer-apply] RESEND_API_KEY not set — skipping notification email')
    return
  }

  const to = process.env.VIDEOGRAPHER_NOTIFY_TO || 'paul@studio-808.com'
  const from = process.env.VIDEOGRAPHER_NOTIFY_FROM || 'Studio 808 <videographer@send.lumentry.io>'

  const cvUrl = await signCv(application.cv_path, storage)

  const esc = s =>
    String(s ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')

  const row = (label, value) =>
    value
      ? `<tr><td style="padding:6px 12px 6px 0;color:#666;vertical-align:top;white-space:nowrap;">${esc(label)}</td><td style="padding:6px 0;color:#111;white-space:pre-wrap;">${esc(value)}</td></tr>`
      : ''

  const cvRow = application.cv_path
    ? `<tr><td style="padding:6px 12px 6px 0;color:#666;vertical-align:top;white-space:nowrap;">CV</td><td style="padding:6px 0;color:#111;">${
        cvUrl
          ? `<a href="${esc(cvUrl)}">${esc(application.cv_filename || 'Download CV')}</a> <span style="color:#999;">(link valid 7 days)</span>`
          : esc(application.cv_filename || 'Attached — see storage bucket')
      }</td></tr>`
    : ''

  const html = `
    <div style="font-family:system-ui,sans-serif;font-size:14px;line-height:1.5;">
      <h2 style="margin:0 0 4px;">New Assistant Videographer application</h2>
      <p style="margin:0 0 16px;color:#666;">${esc(application.name)} &lt;${esc(application.email)}&gt;</p>
      <table style="border-collapse:collapse;">
        ${row('Name', application.name)}
        ${row('Email', application.email)}
        ${row('Phone', application.phone)}
        ${row('Location', application.location)}
        ${row('Has a car', application.has_car ? 'Yes' : 'No')}
        ${row('Showreel / portfolio', application.showreel_url)}
        ${row('Experience', application.experience)}
        ${row('About', application.about_text)}
        ${cvRow}
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
      subject: `New Videographer application — ${application.name}`,
      html,
    }),
  })

  if (!emailRes.ok) {
    const detail = await emailRes.text()
    throw new Error(`Resend ${emailRes.status}: ${detail}`)
  }
}
