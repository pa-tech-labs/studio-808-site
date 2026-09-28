// api/tutor-request.js with Resend stubbed. Lives outside api/ because Vercel
// deploys every file in api/ as a function.
//
// Run: npm test

import { test, beforeEach, afterEach } from 'node:test'
import assert from 'node:assert/strict'

const sent = []
let failCall = -1 // index of the Resend call to fail, -1 = none
const realFetch = globalThis.fetch

beforeEach(() => {
  sent.length = 0
  failCall = -1
  process.env.RESEND_API_KEY = 'test-key'
  process.env.TUTOR_REQUEST_TO = 'tutor@example.com'
  process.env.TUTOR_REQUEST_CC = 'a@example.com, b@example.com'
  globalThis.fetch = async (url, init) => {
    const i = sent.push({ url, body: JSON.parse(init.body) }) - 1
    const ok = i !== failCall
    return { ok, status: ok ? 200 : 500, text: async () => 'stub' }
  }
})
afterEach(() => { globalThis.fetch = realFetch })

// Fresh module per test so the in-memory rate limiter starts empty.
let n = 0
const load = async () => (await import(`../api/tutor-request.js?t=${n++}`)).default

function call(handler, body, { method = 'POST', ip = '1.2.3.4' } = {}) {
  return new Promise(resolve => {
    const res = {
      statusCode: 200,
      status(c) { this.statusCode = c; return this },
      json(b) { resolve({ status: this.statusCode, body: b }) },
    }
    handler({ method, body, headers: { 'x-forwarded-for': `${ip}, 10.0.0.1` } }, res)
  })
}

const good = { name: 'Sam Lee', email: 'sam@example.com', phone: '', preferredDays: ['Sat'], studio: 'Studio 1', answers: [{ question: 'What are you here for?', answer: 'DJ mixing' }] }

test('a valid request emails the tutor (with CC and reply-to) and confirms to the customer', async () => {
  const r = await call(await load(), good)
  assert.equal(r.status, 200)
  assert.equal(sent.length, 2)
  assert.deepEqual(sent[0].body.to, ['tutor@example.com'])
  assert.deepEqual(sent[0].body.cc, ['a@example.com', 'b@example.com'])
  assert.equal(sent[0].body.reply_to, 'sam@example.com')
  assert.match(sent[0].body.html, /DJ mixing/)
  assert.deepEqual(sent[1].body.to, ['sam@example.com'])
  assert.equal(sent[0].body.from, sent[1].body.from)
})

test('the email is validated server-side', async () => {
  const r = await call(await load(), { ...good, email: 'not-an-email' })
  assert.equal(r.status, 400)
  assert.ok(r.body.errors.email)
  assert.equal(sent.length, 0)
})

test('customer text is escaped in the email', async () => {
  await call(await load(), { ...good, name: '<script>x</script>' })
  assert.doesNotMatch(sent[0].body.html, /<script>/)
})

test('the honeypot returns 200 and sends nothing', async () => {
  const r = await call(await load(), { ...good, company: 'Acme' })
  assert.equal(r.status, 200)
  assert.equal(sent.length, 0)
})

test('more than five requests from one IP in the window are refused', async () => {
  const h = await load()
  for (let i = 0; i < 5; i++) assert.equal((await call(h, good)).status, 200)
  assert.equal((await call(h, good)).status, 429)
  assert.equal((await call(h, good, { ip: '5.6.7.8' })).status, 200)
})

test('a failed tutor email fails the request', async () => {
  failCall = 0
  assert.equal((await call(await load(), good)).status, 502)
  assert.equal(sent.length, 1) // no confirmation for a request that never arrived
})

test('a failed confirmation still returns 200: the tutor has the request', async () => {
  failCall = 1
  assert.equal((await call(await load(), good)).status, 200)
  assert.equal(sent.length, 2)
})

test('missing TUTOR_REQUEST_TO is a 500, not a silent success', async () => {
  delete process.env.TUTOR_REQUEST_TO
  assert.equal((await call(await load(), good)).status, 500)
  assert.equal(sent.length, 0)
})

test('only POST is accepted', async () => {
  assert.equal((await call(await load(), good, { method: 'GET' })).status, 405)
})
