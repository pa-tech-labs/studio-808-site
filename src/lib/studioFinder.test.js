// Run: npm test

import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
  decodeAnswers, encodeAnswers, matchRule, nextQuestion, progress, pruneAnswers, resultBookingUrl,
  studioPageHref, validateTutorRequest, visibleQuestions, withoutLastAnswer,
} from './studioFinder.js'
import { questions as seedQuestions, rules as seedRules } from '../../scripts/studioFinderSeedContent.js'

const when = (questionKey, equals) => ({ questionKey, equals })

// ── Rule matching ────────────────────────────────────────────────────────────

test('first matching rule wins, even when a later one also matches', () => {
  const rules = [
    { conditions: [when('a', '1')], studio: 'first' },
    { conditions: [when('a', '1')], studio: 'second' },
    { conditions: [], studio: 'fallback' },
  ]
  assert.equal(matchRule(rules, { a: '1' }).studio, 'first')
})

test('conditions within a rule are AND', () => {
  const rules = [
    { conditions: [when('level', 'experienced'), when('format', 'cdj')], studio: 'both' },
    { conditions: [], studio: 'fallback' },
  ]
  assert.equal(matchRule(rules, { level: 'experienced', format: 'cdj' }).studio, 'both')
  assert.equal(matchRule(rules, { level: 'experienced', format: 'vinyl' }).studio, 'fallback')
  assert.equal(matchRule(rules, { format: 'cdj' }).studio, 'fallback')
})

test('the fallback matches when nothing else does', () => {
  const rules = [{ conditions: [when('a', '1')], studio: 'x' }, { conditions: [], studio: 'fallback' }]
  assert.equal(matchRule(rules, {}).studio, 'fallback')
})

test('a skipped answer (empty string) does not satisfy a condition on a real value', () => {
  const rules = [{ conditions: [when('level', 'pro')], studio: 'pro' }, { conditions: [], studio: 'fb' }]
  assert.equal(matchRule(rules, { level: '' }).studio, 'fb')
})

test('no rules at all gives null rather than throwing', () => {
  assert.equal(matchRule([], { a: '1' }), null)
  assert.equal(matchRule(undefined, {}), null)
})

// ── showIf ───────────────────────────────────────────────────────────────────

const Q = [
  { key: 'purpose', title: 'P', options: [] },
  { key: 'level', title: 'L', options: [], showIf: [when('purpose', 'dj')] },
  { key: 'production', title: 'Pr', options: [], showIf: [when('purpose', 'produce')] },
  { key: 'tutor', title: 'T', options: [] },
]

test('showIf hides a question until its earlier answer matches', () => {
  assert.deepEqual(visibleQuestions(Q, {}).map(q => q.key), ['purpose', 'tutor'])
  assert.deepEqual(visibleQuestions(Q, { purpose: 'dj' }).map(q => q.key), ['purpose', 'level', 'tutor'])
  assert.deepEqual(visibleQuestions(Q, { purpose: 'produce' }).map(q => q.key), ['purpose', 'production', 'tutor'])
})

test('showIf with several conditions needs all of them', () => {
  const qs = [{ key: 'x', title: 'X', options: [], showIf: [when('a', '1'), when('b', '2')] }]
  assert.equal(visibleQuestions(qs, { a: '1' }).length, 0)
  assert.equal(visibleQuestions(qs, { a: '1', b: '2' }).length, 1)
})

test('the tutor question disappears when the tutor feature is off', () => {
  assert.deepEqual(visibleQuestions(Q, {}, { tutorEnabled: false }).map(q => q.key), ['purpose'])
})

test('nextQuestion walks the shown questions and ends with null', () => {
  assert.equal(nextQuestion(Q, {}).key, 'purpose')
  assert.equal(nextQuestion(Q, { purpose: 'dj' }).key, 'level')
  assert.equal(nextQuestion(Q, { purpose: 'dj', level: '' }).key, 'tutor') // '' = skipped, counts as answered
  assert.equal(nextQuestion(Q, { purpose: 'dj', level: 'pro', tutor: 'no' }), null)
})

test('changing an early answer prunes the branch it closed', () => {
  assert.deepEqual(pruneAnswers(Q, { purpose: 'produce', level: 'pro', tutor: 'no' }), { purpose: 'produce', tutor: 'no' })
})

test('back removes the latest answer and anything it opened', () => {
  assert.deepEqual(withoutLastAnswer(Q, { purpose: 'dj', level: 'pro', tutor: 'no' }), { purpose: 'dj', level: 'pro' })
  assert.deepEqual(withoutLastAnswer(Q, { purpose: 'dj' }), {})
  assert.deepEqual(withoutLastAnswer(Q, {}), {})
})

test('progress starts at the longest possible path and only shrinks', () => {
  assert.deepEqual(progress(Q, {}), { answered: 0, total: 4 })
  assert.deepEqual(progress(Q, { purpose: 'dj' }), { answered: 1, total: 3 })
  assert.deepEqual(progress(seedQuestions, {}).total, 6)
  assert.deepEqual(progress(seedQuestions, { purpose: 'dj' }).total, 5)
  assert.deepEqual(progress(seedQuestions, { purpose: 'produce' }).total, 3)
})

// ── The seed content, end to end ─────────────────────────────────────────────

function seedResult(answers) {
  const kept = pruneAnswers(seedQuestions, answers)
  return matchRule(seedRules, kept).studioSortOrder
}

test('seed: vinyl or both goes to Studio 3', () => {
  assert.equal(seedResult({ purpose: 'dj', level: 'starting', format: 'vinyl', source: 'laptop' }), 3)
  assert.equal(seedResult({ purpose: 'dj', level: 'learning', format: 'both', source: 'usb' }), 3)
})

test('seed: pro or content creator goes to Studio 3 with the recording bolt-on', () => {
  const kept = { purpose: 'dj', level: 'pro', format: 'cdj', source: 'laptop' }
  const rule = matchRule(seedRules, kept)
  assert.equal(rule.studioSortOrder, 3)
  assert.deepEqual(rule.addOns, ['Recording and streaming bolt-on'])
})

test('seed: experienced on CDJs goes to Studio 3; learning on CDJs with a laptop goes to Studio 2', () => {
  assert.equal(seedResult({ purpose: 'dj', level: 'experienced', format: 'cdj', source: 'usb' }), 3)
  assert.equal(seedResult({ purpose: 'dj', level: 'learning', format: 'cdj', source: 'laptop' }), 2)
})

test('seed: laptop goes to Studio 2, everything else DJ goes to Studio 1', () => {
  assert.equal(seedResult({ purpose: 'dj', level: 'starting', format: 'cdj', source: 'laptop' }), 2)
  assert.equal(seedResult({ purpose: 'dj', level: 'starting', format: 'cdj', source: 'streaming' }), 1)
  assert.equal(seedResult({ purpose: 'dj', level: '', format: '', source: '' }), 1)
})

test('seed: production with an engineer goes to Studio 4, self-service to Studio 2', () => {
  assert.equal(seedResult({ purpose: 'produce', production: 'engineer' }), 4)
  assert.equal(seedResult({ purpose: 'produce', production: 'self' }), 2)
})

test('seed: stale DJ answers cannot leak into a producer result', () => {
  // Chose DJ + vinyl, went back, switched to producing: vinyl is pruned.
  assert.equal(seedResult({ purpose: 'produce', format: 'vinyl', production: 'self' }), 2)
})

test('seed: the last rule is the fallback and is the only one without conditions', () => {
  const empty = seedRules.map((r, i) => (r.conditions.length === 0 ? i : -1)).filter(i => i !== -1)
  assert.deepEqual(empty, [seedRules.length - 1])
})

test('seed: every condition names a real question and one of its option values', () => {
  const values = new Map(seedQuestions.map(q => [q.key, new Set(q.options.map(o => o.value))]))
  const all = [...seedRules.flatMap(r => r.conditions), ...seedQuestions.flatMap(q => q.showIf ?? [])]
  for (const c of all) {
    assert.ok(values.has(c.questionKey), `unknown question ${c.questionKey}`)
    assert.ok(values.get(c.questionKey).has(c.equals), `${c.questionKey} has no option ${c.equals}`)
  }
})

// ── Result links ─────────────────────────────────────────────────────────────

test('the Book button uses the studio slug, and the plain page without one', () => {
  assert.equal(resultBookingUrl({ cueRoomSlug: 'studio-3' }), 'https://book.studio-808.com/book?room=studio-3')
  assert.equal(resultBookingUrl({ cueRoomSlug: null }), 'https://book.studio-808.com/book')
  assert.equal(resultBookingUrl(null), 'https://book.studio-808.com/book')
})

test('See the studio uses pageHref, else the DJ / production split', () => {
  assert.equal(studioPageHref({ pageHref: '/somewhere', sortOrder: 1 }), '/somewhere')
  assert.equal(studioPageHref({ pageHref: null, sortOrder: 2 }), '/dj-studio')
  assert.equal(studioPageHref({ sortOrder: 4 }), '/main-production-studio')
})

// ── URL hash ─────────────────────────────────────────────────────────────────

test('answers round-trip through the hash, skips included', () => {
  const a = { purpose: 'dj', level: '', format: 'vinyl' }
  assert.deepEqual(decodeAnswers('#' + encodeAnswers(a)), a)
  assert.deepEqual(decodeAnswers(''), {})
  assert.deepEqual(decodeAnswers('#%E0%A4%A'), {}) // malformed escape
  assert.deepEqual(decodeAnswers('#purpose=DJ&Bad=1&x=<b>'), {}) // not key/value shaped
})

// ── Tutor form ───────────────────────────────────────────────────────────────

const good = { name: 'Sam', email: 'sam@example.com', phone: '', preferredDays: ['Sat', 'Mon'], answers: [{ question: 'What are you here for?', answer: 'DJ mixing' }], studio: 'Studio 1' }

test('tutor: a complete request is ok and normalised', () => {
  const r = validateTutorRequest(good)
  assert.equal(r.ok, true)
  assert.deepEqual(r.value.preferredDays, ['Mon', 'Sat'])
  assert.equal(r.value.phone, null)
  assert.equal(r.value.answers.length, 1)
})

test('tutor: name, email and at least one day are required', () => {
  const r = validateTutorRequest({})
  assert.equal(r.ok, false)
  assert.deepEqual(Object.keys(r.errors).sort(), ['email', 'name', 'preferredDays'])
})

test('tutor: a malformed email is refused', () => {
  for (const email of ['sam', 'sam@', 'sam@example', 'sam @example.com', 'a@b.c'.padStart(210, 'x')]) {
    assert.ok(validateTutorRequest({ ...good, email }).errors.email, email)
  }
})

test('tutor: phone is optional but checked when given', () => {
  assert.equal(validateTutorRequest({ ...good, phone: '+44 7700 900123' }).ok, true)
  assert.ok(validateTutorRequest({ ...good, phone: 'call me' }).errors.phone)
})

test('tutor: unknown days are dropped, and answers are capped', () => {
  const r = validateTutorRequest({ ...good, preferredDays: ['Sat', 'Funday'], answers: Array.from({ length: 50 }, (_, i) => ({ question: `q${i}`, answer: 'a' })) })
  assert.deepEqual(r.value.preferredDays, ['Sat'])
  assert.equal(r.value.answers.length, 20)
})
