// api/audio-enquiry.js with Resend stubbed. Lives outside api/ because Vercel
// deploys every file in api/ as a function.
//
// Run: npm test

import { test, beforeEach, afterEach } from 'node:test'
import assert from 'node:assert/strict'

const sent = []
let failSend = false
const realFetch = globalThis.fetch
const realError = console.error

beforeEach(() => {
  sent.length = 0
  failSend = false
  process.env.RESEND_API_KEY = 'test-key'
  process.env.AUDIO_ENQUIRY_TO = 'audio@example.com'
  process.env.AUDIO_ENQUIRY_CC = 'a@example.com, b@example.com'
  delete process.env.AUDIO_ENQUIRY_FROM
  delete process.env.VERCEL_ENV
  delete process.env.VERCEL_URL
  globalThis.fetch = async (url, init) => {
    sent.push({ url, body: JSON.parse(init.body) })
    return { ok: !failSend, status: failSend ? 500 : 200, text: async () => 'stub' }
  }
  console.error = () => {}
})
afterEach(() => { globalThis.fetch = realFetch; console.error = realError })

// Fresh module per test so the in-memory rate limiter starts empty.
let n = 0
const load = async () => (await import(`../api/audio-enquiry.js?t=${n++}`)).default

function call(handler, body, { method = 'POST', ip = '1.2.3.4', origin = 'https://audio.studio-808.com', referer } = {}) {
  return new Promise(resolve => {
    const res = {
      statusCode: 200,
      status(c) { this.statusCode = c; return this },
      json(b) { resolve({ status: this.statusCode, body: b }) },
    }
    const headers = { 'x-forwarded-for': `${ip}, 10.0.0.1` }
    if (origin) headers.origin = origin
    if (referer) headers.referer = referer
    handler({ method, body, headers }, res)
  })
}

const good = {
  name: 'Alex Reed', company: 'Northfield Press', email: 'alex@northfield.example', phone: '',
  projectType: 'Audiobook', length: '60,000 words', deadline: '', message: 'Unabridged narration, ACX delivery.', consent: true,
}

test('a valid enquiry is emailed as plain text, with CC, reply-to and the subject format', async () => {
  const r = await call(await load(), good)
  assert.equal(r.status, 200)
  assert.deepEqual(r.body, { ok: true })
  assert.equal(sent.length, 1)
  const m = sent[0].body
  assert.equal(sent[0].url, 'https://api.resend.com/emails')
  assert.deepEqual(m.to, ['audio@example.com'])
  assert.deepEqual(m.cc, ['a@example.com', 'b@example.com'])
  assert.equal(m.reply_to, 'alex@northfield.example')
  assert.equal(m.subject, '808 Audio enquiry: Audiobook from Northfield Press')
  assert.equal(m.html, undefined)
  assert.match(m.text, /Approximate length: 60,000 words/)
  assert.match(m.from, /808 Audio/)
})

test('no CC header when AUDIO_ENQUIRY_CC is empty', async () => {
  process.env.AUDIO_ENQUIRY_CC = ''
  await call(await load(), good)
  assert.equal('cc' in sent[0].body, false)
})

test('invalid input is a 400 with field errors and sends nothing', async () => {
  const r = await call(await load(), { ...good, email: 'nope', consent: false })
  assert.equal(r.status, 400)
  assert.ok(r.body.errors.email)
  assert.ok(r.body.errors.consent)
  assert.equal(sent.length, 0)
})

test('a missing or non-object body is a 400', async () => {
  const h = await load()
  assert.equal((await call(h, undefined)).status, 400)
  assert.equal((await call(h, 'name=x')).status, 400)
  assert.equal(sent.length, 0)
})

test('the honeypot returns 200 and sends nothing', async () => {
  const r = await call(await load(), { ...good, website: 'http://spam.example' })
  assert.equal(r.status, 200)
  assert.equal(sent.length, 0)
})

test('only POST is accepted', async () => {
  assert.equal((await call(await load(), good, { method: 'GET' })).status, 405)
})

test('a mail failure is a 502 so the form can offer retry and mailto', async () => {
  failSend = true
  const r = await call(await load(), good)
  assert.equal(r.status, 502)
  assert.ok(r.body.error)
})

test('missing config is a 500, never a silent success', async () => {
  delete process.env.AUDIO_ENQUIRY_TO
  const r = await call(await load(), good)
  assert.equal(r.status, 500)
  assert.equal(sent.length, 0)
})

test('more than five enquiries from one IP in the window are refused', async () => {
  const h = await load()
  for (let i = 0; i < 5; i++) assert.equal((await call(h, good)).status, 200)
  assert.equal((await call(h, good)).status, 429)
  assert.equal((await call(h, good, { ip: '5.6.7.8' })).status, 200)
})

test('only the two 808 sites may post', async () => {
  const h = await load()
  assert.equal((await call(h, good, { origin: 'https://www.studio-808.com' })).status, 200)
  assert.equal((await call(h, good, { origin: 'https://audio.studio-808.com' })).status, 200)
  for (const origin of ['https://evil.example', 'https://studio-808.com', 'http://audio.studio-808.com', 'https://audio.studio-808.com.evil.example', 'null']) {
    const r = await call(h, good, { origin, ip: origin })
    assert.equal(r.status, 403, origin)
  }
  assert.equal((await call(h, good, { origin: '', ip: '9.9.9.9' })).status, 403, 'no origin and no referer')
  assert.equal((await call(h, good, { origin: '', referer: 'https://audio.studio-808.com/#enquire', ip: '9.9.9.8' })).status, 200, 'referer fallback')
  assert.equal(sent.length, 3)
})

test('a preview deployment accepts its own URL; production does not', async () => {
  process.env.VERCEL_ENV = 'preview'
  process.env.VERCEL_URL = 'studio-808-site-abc123.vercel.app'
  const h = await load()
  assert.equal((await call(h, good, { origin: 'https://studio-808-site-abc123.vercel.app' })).status, 200)
  assert.equal((await call(h, good, { origin: 'https://other-abc.vercel.app', ip: '2.2.2.2' })).status, 403)
  process.env.VERCEL_ENV = 'production'
  const p = await load()
  assert.equal((await call(p, good, { origin: 'https://studio-808-site-abc123.vercel.app', ip: '3.3.3.3' })).status, 403)
})
