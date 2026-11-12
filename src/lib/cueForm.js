// The site's own forms that post to a Cue (Marketing > Forms) form: today the
// contact page (src/pages/Contact.tsx). Every other form on the site posts to
// this site's own /api functions and never reaches Cue.
//
// Cue screens a native form exactly as it screens its embed
// (access-hub server/forms/spamGuard.js), so on page load we fetch a signed
// render token, send it back with an empty honeypot field, and send the
// Turnstile token when Cue returns a site key. A post without a fresh token,
// or sooner than 3 s after the token, is quarantined by Cue and never reaches
// the studio's inbox, while still answering success. So never post without one.

export const CUE_API = 'https://access-hub-production.up.railway.app'
export const CONTACT_FORM_ID = '47a08cea-a18e-442d-8c4d-16cd07255ba3'

export const tokenUrl = (formId, api = CUE_API) => `${api}/api/forms/${formId}/render-token`
export const submitUrl = (formId, api = CUE_API) => `${api}/api/forms/${formId}/submit`

/**
 * GET the render token. Resolves
 * { renderToken, honeypotField, turnstileSiteKey, turnstileField, minFillMs },
 * or throws on any failure (the caller retries or tells the visitor).
 */
export async function fetchFormGuard(formId, { api = CUE_API, fetchImpl = globalThis.fetch } = {}) {
  const res = await fetchImpl(tokenUrl(formId, api), { headers: { Accept: 'application/json' }, cache: 'no-store' })
  if (!res.ok) throw new Error(`render-token ${res.status}`)
  const b = await res.json()
  if (!b || typeof b.render_token !== 'string' || typeof b.honeypot_field !== 'string') throw new Error('render-token: bad body')
  return {
    renderToken: b.render_token,
    honeypotField: b.honeypot_field,
    turnstileSiteKey: typeof b.turnstile_site_key === 'string' && b.turnstile_site_key ? b.turnstile_site_key : null,
    turnstileField: typeof b.turnstile_field === 'string' ? b.turnstile_field : 'turnstile_token',
    minFillMs: Number.isFinite(b.min_fill_ms) ? b.min_fill_ms : 3000,
  }
}

/** The JSON body: the visitor's fields plus the three guard fields. */
export function buildSubmission(fields, guard, { honeypotValue = '', turnstileToken = null } = {}) {
  const body = { ...fields, render_token: guard.renderToken, [guard.honeypotField]: honeypotValue }
  if (guard.turnstileSiteKey && turnstileToken) body[guard.turnstileField] = turnstileToken
  return body
}

/**
 * What a submit response means for the page.
 * 'sent' | 'turnstile' (redo the check, keep the typing) | 'rate_limited' | 'error'
 */
export async function readSubmitResult(res) {
  if (res.ok) return 'sent'
  let code = null
  try { code = (await res.json())?.code ?? null } catch { /* not JSON */ }
  if (res.status === 400 && code === 'TURNSTILE_FAILED') return 'turnstile'
  if (res.status === 429) return 'rate_limited'
  return 'error'
}

export const RETRY_MESSAGES = {
  turnstile: "We couldn't confirm the security check. Please complete it again and press Send. Your message is still here.",
  rate_limited: "You've sent a few messages in a short while. Please wait a few minutes and try again, or email info@studio-808.com.",
  error: 'Your message did not send. Please try again, or email us at info@studio-808.com.',
  not_ready: 'The form is still getting ready. Please try again in a moment, or email info@studio-808.com.',
  check_pending: 'Please complete the security check above the button, then press Send.',
}
