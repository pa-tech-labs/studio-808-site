// Run: npm test
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { buildSubmission, CONTACT_FORM_ID, fetchFormGuard, readSubmitResult, RETRY_MESSAGES, submitUrl, tokenUrl } from './cueForm.js'

const TOKEN_BODY = { render_token: 'fr1.1794.sig', honeypot_field: 'company_website', turnstile_site_key: null, turnstile_field: 'turnstile_token', min_fill_ms: 3000 }
const res = (status, body) => ({ ok: status >= 200 && status < 300, status, json: async () => body })

test('the contact form fetches its token from, and posts to, its own Cue form', () => {
  assert.equal(tokenUrl(CONTACT_FORM_ID), `https://access-hub-production.up.railway.app/api/forms/${CONTACT_FORM_ID}/render-token`)
  assert.equal(submitUrl(CONTACT_FORM_ID), `https://access-hub-production.up.railway.app/api/forms/${CONTACT_FORM_ID}/submit`)
})

test('fetchFormGuard maps the token response, and throws on a failure', async () => {
  let url
  const g = await fetchFormGuard('f1', { api: 'https://cue.test', fetchImpl: async u => { url = u; return res(200, TOKEN_BODY) } })
  assert.equal(url, 'https://cue.test/api/forms/f1/render-token')
  assert.deepEqual(g, { renderToken: 'fr1.1794.sig', honeypotField: 'company_website', turnstileSiteKey: null, turnstileField: 'turnstile_token', minFillMs: 3000 })
  const on = await fetchFormGuard('f1', { fetchImpl: async () => res(200, { ...TOKEN_BODY, turnstile_site_key: '0x4AAA' }) })
  assert.equal(on.turnstileSiteKey, '0x4AAA')
  await assert.rejects(fetchFormGuard('f1', { fetchImpl: async () => res(429, {}) }))
  await assert.rejects(fetchFormGuard('f1', { fetchImpl: async () => res(200, { nope: 1 }) }))
})

test('buildSubmission adds the token and an empty honeypot, and the Turnstile token only when the check is on', async () => {
  const fields = { name: 'Peter', email: 'p@example.com' }
  const off = await fetchFormGuard('f1', { fetchImpl: async () => res(200, TOKEN_BODY) })
  assert.deepEqual(buildSubmission(fields, off, { turnstileToken: 'ignored' }), { ...fields, render_token: 'fr1.1794.sig', company_website: '' })
  const on = { ...off, turnstileSiteKey: '0x4AAA' }
  assert.deepEqual(buildSubmission(fields, on, { turnstileToken: 'ts' }), { ...fields, render_token: 'fr1.1794.sig', company_website: '', turnstile_token: 'ts' })
  // Whatever a bot typed into the hidden field is sent as-is, so Cue can catch it.
  assert.equal(buildSubmission(fields, off, { honeypotValue: 'x' }).company_website, 'x')
})

test('readSubmitResult tells a refused security check and a rate limit apart from other failures', async () => {
  assert.equal(await readSubmitResult(res(200, { success: true })), 'sent')
  assert.equal(await readSubmitResult(res(400, { code: 'TURNSTILE_FAILED' })), 'turnstile')
  assert.equal(await readSubmitResult(res(429, { code: 'RATE_LIMITED' })), 'rate_limited')
  assert.equal(await readSubmitResult(res(400, { error: 'Name and email are required.' })), 'error')
  assert.equal(await readSubmitResult({ ok: false, status: 500, json: async () => { throw new Error('html') } }), 'error')
  for (const m of Object.values(RETRY_MESSAGES)) assert.ok(m.length > 10)
})
