// "Find your studio" wizard: the pure logic, with no React and no Sanity
// client, so the overlay, the api/tutor-request.js function and the node:test
// suite all share one copy. Plain JS with a .d.ts beside it, like
// roomBookingUrl.js.
//
// Answers are a flat map of question key -> option value. A key present with
// an empty string means the question was skipped. A key absent means it has
// not been reached yet. That map is the wizard's whole state, and it is what
// the URL hash carries.

import { roomBookingUrl } from './roomBookingUrl.js'

/** The question whose "yes" answer opens the tutor form. */
export const TUTOR_QUESTION_KEY = 'tutor'
export const TUTOR_YES = 'yes'

/** True when every condition's question was answered with that exact value. */
export function conditionsMatch(conditions, answers) {
  return (conditions ?? []).every(c => c && answers[c.questionKey] === c.equals)
}

/**
 * Questions to ask for these answers, in order. A question with showIf is
 * shown only when all of its conditions match the answers so far. The tutor
 * question is dropped when the tutor feature is off, since a yes would lead
 * nowhere.
 */
export function visibleQuestions(questions, answers, { tutorEnabled = true } = {}) {
  return (questions ?? []).filter(q => {
    if (!q?.key) return false
    if (q.key === TUTOR_QUESTION_KEY && !tutorEnabled) return false
    return conditionsMatch(q.showIf, answers)
  })
}

/**
 * Drop answers to questions that are no longer shown, walking in order so a
 * changed early answer prunes the whole branch after it. Keeps a stale
 * "format=vinyl" from matching a rule after the customer switched to
 * producing.
 */
export function pruneAnswers(questions, answers, opts) {
  const kept = {}
  for (const q of questions ?? []) {
    if (!q?.key || !(q.key in answers)) continue
    const shown = visibleQuestions([q], kept, opts).length === 1
    if (shown) kept[q.key] = answers[q.key]
  }
  return kept
}

/** The first shown question still unanswered, or null when the wizard is done. */
export function nextQuestion(questions, answers, opts) {
  return visibleQuestions(questions, answers, opts).find(q => !(q.key in answers)) ?? null
}

/**
 * Progress for the "Question n of m" line. `total` counts every question that
 * could still be asked: one whose showIf conditions each either match or name
 * a question not answered yet. So it starts at the longest path and only
 * shrinks as branches close, rather than growing mid-way ("1 of 2", then
 * "2 of 5").
 */
export function progress(questions, answers, { tutorEnabled = true } = {}) {
  const possible = (questions ?? []).filter(q => {
    if (!q?.key) return false
    if (q.key === TUTOR_QUESTION_KEY && !tutorEnabled) return false
    return (q.showIf ?? []).every(c => c && (!(c.questionKey in answers) || answers[c.questionKey] === c.equals))
  })
  const answered = possible.filter(q => q.key in answers).length
  return { answered, total: possible.length }
}

/** The answers with the most recently answered shown question removed (Back). */
export function withoutLastAnswer(questions, answers, opts) {
  const answered = visibleQuestions(questions, answers, opts).filter(q => q.key in answers)
  const last = answered[answered.length - 1]
  if (!last) return answers
  const next = { ...answers }
  delete next[last.key]
  return pruneAnswers(questions, next, opts)
}

/** First rule whose conditions ALL match. A rule with no conditions always matches. */
export function matchRule(rules, answers) {
  return (rules ?? []).find(r => r && conditionsMatch(r.conditions, answers)) ?? null
}

/** The Book button's href for a matched studio (plain booking page without a slug). */
export function resultBookingUrl(studio) {
  return roomBookingUrl(studio?.cueRoomSlug)
}

/**
 * The studio's own page on this site. pageHref when set, else the same split
 * the home page cards use: DJ studios 1 to 3, production 4.
 */
export function studioPageHref(studio) {
  if (studio?.pageHref) return studio.pageHref
  return (studio?.sortOrder ?? 0) <= 3 ? '/dj-studio' : '/main-production-studio'
}

// ── URL hash ─────────────────────────────────────────────────────────────────

/** Answers -> "purpose=dj&level=" (empty value = skipped). */
export function encodeAnswers(answers) {
  const p = new URLSearchParams()
  for (const [k, v] of Object.entries(answers ?? {})) p.set(k, v ?? '')
  return p.toString()
}

// Same shapes the schema enforces for question keys and option values, so a
// hand-edited or mangled hash can only ever produce answers the wizard could
// have produced itself.
const KEY_RE = /^[a-z][a-z0-9_]{0,39}$/
const VALUE_RE = /^[a-z0-9_-]{0,100}$/

/** "#purpose=dj&level=" -> answers. Anything that is not key=value shaped is ignored. */
export function decodeAnswers(hash) {
  const raw = String(hash ?? '').replace(/^#/, '')
  const out = {}
  for (const [k, v] of new URLSearchParams(raw)) {
    if (KEY_RE.test(k) && VALUE_RE.test(v)) out[k] = v
  }
  return out
}

// ── Tutor request ────────────────────────────────────────────────────────────

export const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const PHONE_RE = /^[0-9+()\-\s]{6,30}$/
const MAX_ANSWERS = 20

const str = v => (typeof v === 'string' ? v.trim() : '')

/**
 * Validate and normalise a tutor request. Used by the form before it posts
 * AND by api/tutor-request.js, so the browser and the server refuse exactly
 * the same things. Returns { ok, errors (field -> message), value }.
 *
 * `answers` is the wizard's answers as readable pairs,
 * [{ question, answer }], so the email needs no Sanity lookup.
 */
export function validateTutorRequest(input) {
  const errors = {}
  const name = str(input?.name)
  const email = str(input?.email)
  const phone = str(input?.phone)
  const days = Array.isArray(input?.preferredDays) ? input.preferredDays.filter(d => DAYS.includes(d)) : []
  const studio = str(input?.studio).slice(0, 100)
  const answers = (Array.isArray(input?.answers) ? input.answers : [])
    .slice(0, MAX_ANSWERS)
    .map(a => ({ question: str(a?.question).slice(0, 200), answer: str(a?.answer).slice(0, 200) }))
    .filter(a => a.question)

  if (!name) errors.name = 'Please tell us your name.'
  else if (name.length > 100) errors.name = 'Please keep your name under 100 characters.'
  if (!email) errors.email = 'Please enter your email.'
  else if (email.length > 200 || !EMAIL_RE.test(email)) errors.email = 'That email address does not look right.'
  if (phone && !PHONE_RE.test(phone)) errors.phone = 'That phone number does not look right.'
  if (days.length === 0) errors.preferredDays = 'Pick at least one day that suits you.'

  const ok = Object.keys(errors).length === 0
  // Keep DAYS order regardless of click order.
  const preferredDays = DAYS.filter(d => days.includes(d))
  return { ok, errors, value: { name, email, phone: phone || null, preferredDays, studio: studio || null, answers } }
}
