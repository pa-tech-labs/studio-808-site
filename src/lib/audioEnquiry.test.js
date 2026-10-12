// Run: npm test

import { test } from 'node:test'
import assert from 'node:assert/strict'
import { enquirySubject, enquiryText, isHoneypot, isIsoDate, oneLine, validateAudioEnquiry } from './audioEnquiry.js'

const good = {
  name: '  Alex Reed ',
  company: 'Northfield Press',
  email: 'alex@northfield.example',
  phone: '+44 (0)1245 000 000',
  projectType: 'Audiobook',
  length: '60,000 words',
  deadline: '2026-12-01',
  message: 'Unabridged narration, one narrator, ACX delivery.',
  consent: true,
}

test('a complete enquiry passes, with values trimmed', () => {
  const r = validateAudioEnquiry(good, { projectTypes: ['Audiobook', 'Commercial'], today: '2026-10-12' })
  assert.equal(r.ok, true)
  assert.deepEqual(r.errors, {})
  assert.equal(r.value.name, 'Alex Reed')
})

test('only name, email, project type, message and consent are required', () => {
  const r = validateAudioEnquiry({ name: 'A', email: 'a@b.co', projectType: 'Other', message: 'Ten chars!', consent: true })
  assert.equal(r.ok, true)
  const empty = validateAudioEnquiry({})
  assert.deepEqual(Object.keys(empty.errors).sort(), ['consent', 'email', 'message', 'name', 'projectType'])
})

test('field formats are checked', () => {
  const r = validateAudioEnquiry({ ...good, email: 'alex@', phone: 'call me', deadline: '2026-02-30', message: 'short' })
  assert.ok(r.errors.email)
  assert.ok(r.errors.phone)
  assert.ok(r.errors.deadline)
  assert.ok(r.errors.message)
  assert.ok(validateAudioEnquiry({ ...good, phone: '12345' }).errors.phone, 'too few digits')
  assert.ok(validateAudioEnquiry({ ...good, name: 'x'.repeat(121) }).errors.name)
  assert.ok(validateAudioEnquiry({ ...good, message: 'x'.repeat(5001) }).errors.message)
})

test('the project type must be one of the options when the form passes them', () => {
  assert.ok(validateAudioEnquiry({ ...good, projectType: 'Wedding video' }, { projectTypes: ['Audiobook'] }).errors.projectType)
  assert.equal(validateAudioEnquiry({ ...good, projectType: 'Wedding video' }).ok, true, 'the server accepts any short value')
})

test('a past deadline is rejected only when today is known', () => {
  assert.ok(validateAudioEnquiry({ ...good, deadline: '2026-10-11' }, { today: '2026-10-12' }).errors.deadline)
  assert.equal(validateAudioEnquiry({ ...good, deadline: '2026-10-12' }, { today: '2026-10-12' }).ok, true)
})

test('consent must be ticked; form values "on" and "true" count', () => {
  assert.ok(validateAudioEnquiry({ ...good, consent: false }).errors.consent)
  assert.ok(validateAudioEnquiry({ ...good, consent: 'yes please' }).errors.consent)
  assert.equal(validateAudioEnquiry({ ...good, consent: 'on' }).ok, true)
  assert.equal(validateAudioEnquiry({ ...good, consent: 'true' }).ok, true)
})

test('honeypot: the hidden website field', () => {
  assert.equal(isHoneypot({ website: 'http://spam.example' }), true)
  assert.equal(isHoneypot({ website: '   ' }), false)
  assert.equal(isHoneypot({ company: 'Acme' }), false, 'company is a real field here')
  assert.equal(isHoneypot(null), false)
})

test('dates', () => {
  assert.equal(isIsoDate('2028-02-29'), true)
  assert.equal(isIsoDate('2026-02-29'), false)
  assert.equal(isIsoDate('12/01/2026'), false)
})

test('subject uses company, else name, and is one line', () => {
  const v = validateAudioEnquiry(good).value
  assert.equal(enquirySubject(v), 'Studio 808 Voice enquiry: Audiobook from Northfield Press')
  assert.equal(enquirySubject({ ...v, company: '' }), 'Studio 808 Voice enquiry: Audiobook from Alex Reed')
  assert.equal(enquirySubject({ ...v, company: 'Evil\r\nBcc: x@y.z' }), 'Studio 808 Voice enquiry: Audiobook from Evil Bcc: x@y.z')
  assert.equal(oneLine('a\n\n b'), 'a b')
})

test('the text body carries every field', () => {
  const text = enquiryText(validateAudioEnquiry(good).value)
  for (const s of ['Alex Reed', 'Northfield Press', 'alex@northfield.example', '+44 (0)1245 000 000', 'Audiobook', '60,000 words', '2026-12-01', 'ACX delivery', 'Consent to reply: Yes']) {
    assert.ok(text.includes(s), s)
  }
  assert.match(enquiryText({ ...validateAudioEnquiry(good).value, phone: '' }), /Phone: -/)
})
