// Studio 808 Voice enquiry form: one validator shared by the form (inline errors) and
// api/audio-enquiry.js (the server never trusts the client). Plain JS so node's
// test runner and the serverless function can both import it.

export const ENQUIRY_LIMITS = {
  name: 120,
  company: 160,
  email: 200,
  phone: 40,
  projectType: 80,
  length: 200,
  message: 5000,
}

/** The hidden honeypot field. Real people never fill it. */
export const HONEYPOT_FIELD = 'website'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
const PHONE_RE = /^[0-9+()\s.-]+$/
const DATE_RE = /^(\d{4})-(\d{2})-(\d{2})$/

const str = v => (typeof v === 'string' ? v.trim() : '')

/** True when the honeypot has anything in it. */
export function isHoneypot(body) {
  return str(body?.[HONEYPOT_FIELD]) !== ''
}

/** A real calendar date in YYYY-MM-DD form. */
export function isIsoDate(s) {
  const m = DATE_RE.exec(s)
  if (!m) return false
  const d = new Date(Date.UTC(+m[1], +m[2] - 1, +m[3]))
  return d.getUTCFullYear() === +m[1] && d.getUTCMonth() === +m[2] - 1 && d.getUTCDate() === +m[3]
}

/**
 * Validate an enquiry. `projectTypes`, when given (the form passes the list
 * from Sanity), limits the project type to those options; the server accepts
 * any short value since Sanity's list can change without a deploy.
 * `today` (YYYY-MM-DD) rejects a deadline in the past.
 *
 * Returns { ok, errors: { field: message }, value } with trimmed values.
 */
export function validateAudioEnquiry(body, { projectTypes, today } = {}) {
  const b = body ?? {}
  const value = {
    name: str(b.name),
    company: str(b.company),
    email: str(b.email),
    phone: str(b.phone),
    projectType: str(b.projectType),
    length: str(b.length),
    deadline: str(b.deadline),
    message: str(b.message),
    consent: b.consent === true || b.consent === 'true' || b.consent === 'on',
  }
  const errors = {}

  if (!value.name) errors.name = 'Enter your name.'
  else if (value.name.length > ENQUIRY_LIMITS.name) errors.name = 'Name is too long.'

  if (value.company.length > ENQUIRY_LIMITS.company) errors.company = 'Company name is too long.'

  if (!value.email) errors.email = 'Enter your email address.'
  else if (value.email.length > ENQUIRY_LIMITS.email || !EMAIL_RE.test(value.email)) errors.email = 'Enter a valid email address, like name@company.com.'

  if (value.phone) {
    const digits = value.phone.replace(/\D/g, '').length
    if (value.phone.length > ENQUIRY_LIMITS.phone || !PHONE_RE.test(value.phone) || digits < 7) errors.phone = 'Enter a valid phone number, or leave it blank.'
  }

  if (!value.projectType) errors.projectType = 'Choose a project type.'
  else if (value.projectType.length > ENQUIRY_LIMITS.projectType) errors.projectType = 'Choose a project type.'
  else if (Array.isArray(projectTypes) && projectTypes.length && !projectTypes.includes(value.projectType)) errors.projectType = 'Choose a project type.'

  if (value.length.length > ENQUIRY_LIMITS.length) errors.length = 'Keep this under 200 characters.'

  if (value.deadline) {
    if (!isIsoDate(value.deadline)) errors.deadline = 'Enter a valid date, or leave it blank.'
    else if (today && value.deadline < today) errors.deadline = 'The deadline is in the past.'
  }

  if (!value.message) errors.message = 'Tell us a little about the project.'
  else if (value.message.length < 10) errors.message = 'Add a little more detail.'
  else if (value.message.length > ENQUIRY_LIMITS.message) errors.message = 'Keep the message under 5,000 characters.'

  if (!value.consent) errors.consent = 'Tick the box so we can reply to you.'

  return { ok: Object.keys(errors).length === 0, errors, value }
}

/** One line, no control characters: safe for an email subject. */
export function oneLine(s) {
  return String(s ?? '').replace(/[\r\n\t\u0000-\u001f\u007f]+/g, ' ').replace(/\s+/g, ' ').trim()
}

/** "Studio 808 Voice enquiry: {projectType} from {company or name}" */
export function enquirySubject(v) {
  return oneLine(`Studio 808 Voice enquiry: ${v.projectType} from ${v.company || v.name}`).slice(0, 200)
}

/** The plain-text email body, every field on its own line. */
export function enquiryText(v) {
  const line = (label, val) => `${label}: ${val || '-'}`
  return [
    'New enquiry from the Studio 808 Voice page',
    '',
    line('Name', v.name),
    line('Company', v.company),
    line('Email', v.email),
    line('Phone', v.phone),
    line('Project type', v.projectType),
    line('Approximate length', v.length),
    line('Deadline', v.deadline),
    line('Consent to reply', v.consent ? 'Yes' : 'No'),
    '',
    'Message:',
    v.message,
    '',
    `Reply to this email to reach ${v.name} directly.`,
  ].join('\n')
}

// ── Who may post an enquiry ─────────────────────────────────────────────────

/** The production sites the enquiry form is served from. */
export const ENQUIRY_ORIGINS = ['https://voice.studio-808.com', 'https://www.studio-808.com']

/** The request's origin: the Origin header, else the Referer's origin, else ''. */
export function requestOrigin(headers) {
  const h = headers ?? {}
  const origin = String(h.origin ?? '').trim()
  if (origin && origin !== 'null') return origin.replace(/\/+$/, '').toLowerCase()
  try { return new URL(String(h.referer ?? '')).origin.toLowerCase() } catch { return '' }
}

/**
 * Whether an enquiry may come from this origin. Production accepts exactly
 * ENQUIRY_ORIGINS. A preview deployment also accepts its own URL (VERCEL_URL),
 * and `vercel dev` accepts localhost, so the form can be tested there.
 */
export function isAllowedEnquiryOrigin(origin, env = {}) {
  const o = String(origin ?? '').toLowerCase()
  if (!o) return false
  if (ENQUIRY_ORIGINS.includes(o)) return true
  if (env.VERCEL_ENV === 'preview' && env.VERCEL_URL && o === `https://${String(env.VERCEL_URL).toLowerCase()}`) return true
  if (env.VERCEL_ENV === 'development' && /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(o)) return true
  return false
}
