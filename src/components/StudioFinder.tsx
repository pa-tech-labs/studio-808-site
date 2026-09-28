// "Find your studio" wizard: a full-screen overlay at /find-your-studio.
//
// Everything it asks and recommends comes from the Sanity "Studio finder"
// singleton (schemaTypes/studioFinder.ts); the logic is in lib/studioFinder.js.
// State is the answers map alone, mirrored into the URL hash so a refresh
// keeps the customer's place. No localStorage.

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { BG, SURF, TEXT, MUTED, BORDER, BORDER_SM, ACCENT, F_BODY, btnPrimary, btnSecondary } from '../styles'
import { useStudioFinder } from '../hooks/useStudioFinder'
import { formatPrice, sanityImageUrl, type FinderStudio, type SanityStudioFinder } from '../lib/sanity'
import {
  DAYS, TUTOR_QUESTION_KEY, TUTOR_YES, decodeAnswers, encodeAnswers, matchRule, nextQuestion, progress,
  pruneAnswers, resultBookingUrl, studioPageHref, validateTutorRequest, visibleQuestions, withoutLastAnswer,
  type Answers, type FinderQuestion,
} from '../lib/studioFinder.js'
import { FINDER_PATH, backgroundOf } from '../lib/studioFinderRoute'
import Headline from './Headline'

// Used when a studio document has no hero image, keyed by sortOrder.
const STATIC_HERO: Record<number, string> = {
  1: '/images/studios/studio1-performer-1.jpg',
  2: '/images/studios/studio2-creator-1.jpg',
  3: '/images/studios/studio3-prodj-1.jpg',
  4: '/images/studios/studio4-production-1.jpg',
}

const accentButton: React.CSSProperties = { ...btnPrimary, background: ACCENT, color: '#fff', textAlign: 'center' }
const linkButton: React.CSSProperties = {
  background: 'none', border: 'none', padding: '8px 0', cursor: 'pointer',
  fontFamily: F_BODY, fontSize: '14px', color: MUTED, textDecoration: 'underline', textUnderlineOffset: '3px',
}

/** Mounted once in App; renders only on /find-your-studio. */
export default function StudioFinder() {
  const location = useLocation()
  if (location.pathname !== FINDER_PATH) return null
  return <FinderGate />
}

function FinderGate() {
  const finder = useStudioFinder()
  const location = useLocation()
  if (finder === undefined) return <Shell onClose={null}><p style={{ fontFamily: F_BODY, color: MUTED }}>Loading...</p></Shell>
  if (finder === null) {
    const bg = backgroundOf(location)
    return <Navigate to={bg ? bg.pathname + bg.search : '/'} replace />
  }
  return <Wizard finder={finder} />
}

function Wizard({ finder }: { finder: SanityStudioFinder }) {
  const location = useLocation()
  const navigate = useNavigate()
  const questions = useMemo(() => finder.questions ?? [], [finder])
  const tutorEnabled = Boolean(finder.tutor?.enabled)
  const opts = useMemo(() => ({ tutorEnabled }), [tutorEnabled])

  const [answers, setAnswers] = useState<Answers>(() => pruneAnswers(questions, decodeAnswers(location.hash), opts))

  // Mirror answers into the hash. replaceState keeps react-router's own
  // history state (the background page), and adds no history entries.
  useEffect(() => {
    const hash = encodeAnswers(answers)
    const url = window.location.pathname + window.location.search + (hash ? `#${hash}` : '')
    window.history.replaceState(window.history.state, '', url)
  }, [answers])

  const close = useCallback(() => {
    // Opened from a page on this site: go back to it. Arrived directly: home.
    if (backgroundOf(location)) navigate(-1)
    else navigate('/', { replace: true })
  }, [location, navigate])

  const question = nextQuestion(questions, answers, opts)
  const { answered, total } = progress(questions, answers, opts)

  const answer = (key: string, value: string) => setAnswers(a => pruneAnswers(questions, { ...a, [key]: value }, opts))
  const back = () => setAnswers(a => withoutLastAnswer(questions, a, opts))
  const restart = () => setAnswers({})

  return (
    <Shell onClose={close}>
      {question ? (
        <QuestionStep
          key={question.key}
          question={question}
          title={question.key === TUTOR_QUESTION_KEY && finder.tutor?.questionCopy ? finder.tutor.questionCopy : question.title}
          current={answered + 1}
          total={total}
          onAnswer={v => answer(question.key, v)}
          onBack={answered > 0 ? back : null}
        />
      ) : (
        <Result
          finder={finder}
          answers={answers}
          readable={readableAnswers(visibleQuestions(questions, answers, opts), answers)}
          onBack={back}
          onRestart={restart}
        />
      )}
    </Shell>
  )
}

function readableAnswers(shown: FinderQuestion[], answers: Answers) {
  return shown.map(q => ({
    question: q.title,
    answer: answers[q.key] === '' ? 'Skipped' : (q.options.find(o => o.value === answers[q.key])?.label ?? answers[q.key]),
  }))
}

// ── Shell: overlay, close button, Escape, scroll lock ────────────────────────

function Shell({ onClose, children }: { onClose: (() => void) | null; children: React.ReactNode }) {
  useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = prev }
  }, [])

  useEffect(() => {
    if (!onClose) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Find your studio"
      className="sf-overlay"
      style={{ position: 'fixed', inset: 0, zIndex: 10001, background: BG, overflowY: 'auto', WebkitOverflowScrolling: 'touch' }}
    >
      <style>{`
        .sf-option:hover, .sf-option:focus-visible { border-color: ${BORDER_SM} !important; background: #1d1d1d !important; }
        .sf-option:focus-visible, .sf-overlay a:focus-visible, .sf-overlay button:focus-visible, .sf-overlay input:focus-visible { outline: 2px solid ${TEXT}; outline-offset: 2px; }
        .sf-day input:focus-visible + span { outline: 2px solid ${TEXT}; outline-offset: 2px; }
        .sf-input { width: 100%; box-sizing: border-box; background: ${SURF}; color: ${TEXT}; border: 1px solid ${BORDER_SM}; border-radius: 10px; padding: 12px 14px; font-family: ${F_BODY}; font-size: 16px; }
        .sf-result { display: grid; grid-template-columns: 1fr; gap: 28px; }
        @media (min-width: 820px) { .sf-result { grid-template-columns: 1.1fr 1fr; gap: 48px; align-items: start; } }
      `}</style>
      <div style={{ maxWidth: '980px', margin: '0 auto', padding: '20px 16px 64px', minHeight: '100%', boxSizing: 'border-box' }}>
        <div style={{ display: 'flex', justifyContent: 'flex-end', minHeight: '44px' }}>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              style={{ width: '44px', height: '44px', borderRadius: '999px', border: `1px solid ${BORDER_SM}`, background: 'transparent', color: TEXT, fontSize: '22px', lineHeight: 1, cursor: 'pointer' }}
            >
              ×
            </button>
          )}
        </div>
        {children}
      </div>
    </div>
  )
}

// ── One question ─────────────────────────────────────────────────────────────

function QuestionStep({ question, title, current, total, onAnswer, onBack }: {
  question: FinderQuestion
  title: string
  current: number
  total: number
  onAnswer: (value: string) => void
  onBack: (() => void) | null
}) {
  const headingRef = useRef<HTMLHeadingElement>(null)
  const listRef = useRef<HTMLDivElement>(null)

  // Each new question takes focus, so screen readers announce it and keyboard
  // users start at the top rather than on a button that no longer exists.
  useEffect(() => { headingRef.current?.focus() }, [])

  // Up/down arrows move between answers.
  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return
    const buttons = Array.from(listRef.current?.querySelectorAll<HTMLButtonElement>('button') ?? [])
    const i = buttons.indexOf(document.activeElement as HTMLButtonElement)
    const next = e.key === 'ArrowDown' ? Math.min(i + 1, buttons.length - 1) : Math.max(i - 1, 0)
    buttons[i === -1 ? 0 : next]?.focus()
    e.preventDefault()
  }

  return (
    <div style={{ maxWidth: '620px', margin: '0 auto', paddingTop: '8px' }}>
      <div aria-hidden="true" style={{ height: '3px', background: BORDER, borderRadius: '2px', overflow: 'hidden', marginBottom: '14px' }}>
        <div style={{ width: `${Math.round(((current - 1) / Math.max(total, 1)) * 100)}%`, height: '100%', background: TEXT, transition: 'width 0.25s' }} />
      </div>
      <p style={{ fontFamily: F_BODY, fontSize: '12px', letterSpacing: '0.08em', textTransform: 'uppercase', color: MUTED, margin: '0 0 18px' }}>
        Question {current} of {total}
      </p>
      <h2
        ref={headingRef}
        tabIndex={-1}
        className="mh"
        style={{ fontSize: 'clamp(28px, 6vw, 44px)', color: TEXT, lineHeight: 1.1, letterSpacing: '-0.02em', margin: '0 0 10px', outline: 'none' }}
      >
        <Headline text={title} />
      </h2>
      {question.helper && <p style={{ fontFamily: F_BODY, fontSize: '15px', color: MUTED, margin: '0 0 8px', lineHeight: 1.6 }}>{question.helper}</p>}

      <div ref={listRef} role="group" aria-label={title} onKeyDown={onKeyDown} style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '24px' }}>
        {question.options.map(o => (
          <button
            key={o.value}
            type="button"
            className="sf-option"
            onClick={() => onAnswer(o.value)}
            style={{
              textAlign: 'left', width: '100%', cursor: 'pointer',
              background: SURF, color: TEXT, border: `1px solid ${BORDER}`, borderRadius: '14px',
              padding: '18px 20px', fontFamily: F_BODY, fontSize: '16px', fontWeight: 600,
              transition: 'border-color 0.15s, background 0.15s', minHeight: '56px',
            }}
          >
            {o.label}
            {o.helper && <span style={{ display: 'block', fontWeight: 400, fontSize: '14px', color: MUTED, marginTop: '4px' }}>{o.helper}</span>}
          </button>
        ))}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '22px', minHeight: '40px' }}>
        {onBack ? <button type="button" onClick={onBack} style={linkButton}>Back</button> : <span />}
        {question.skippable && <button type="button" onClick={() => onAnswer('')} style={linkButton}>Skip</button>}
      </div>
    </div>
  )
}

// ── Result ───────────────────────────────────────────────────────────────────

function Result({ finder, answers, readable, onBack, onRestart }: {
  finder: SanityStudioFinder
  answers: Answers
  readable: { question: string; answer: string }[]
  onBack: () => void
  onRestart: () => void
}) {
  const headingRef = useRef<HTMLHeadingElement>(null)
  useEffect(() => { headingRef.current?.focus() }, [])

  const rule = matchRule(finder.rules ?? [], answers)
  const studio: FinderStudio | null = rule?.studio ?? null
  const wantsTutor = Boolean(finder.tutor?.enabled) && answers[TUTOR_QUESTION_KEY] === TUTOR_YES
  const labels = finder.result ?? {}

  const image = studio ? (sanityImageUrl(studio.heroImage, 900) ?? STATIC_HERO[studio.sortOrder] ?? null) : null
  // Studio names in Sanity are "Studio 1 \u2014 Performer"; the tagline is the tail.
  const [name, nameTail] = (studio?.name ?? '').split(' \u2014 ')
  const addOns = rule?.addOns ?? []

  return (
    <div style={{ paddingTop: '8px' }}>
      <p style={{ fontFamily: F_BODY, fontSize: '12px', letterSpacing: '0.08em', textTransform: 'uppercase', color: MUTED, margin: '0 0 18px' }}>
        {labels.heading || 'Your studio'}
      </p>

      {studio ? (
        <div className="sf-result">
          {image && (
            <img src={image} alt={studio.name} style={{ width: '100%', aspectRatio: '4 / 3', objectFit: 'cover', borderRadius: '16px', display: 'block' }} />
          )}
          <div>
            <h2 ref={headingRef} tabIndex={-1} className="mh" style={{ fontSize: 'clamp(30px, 6vw, 48px)', color: TEXT, lineHeight: 1.05, letterSpacing: '-0.02em', margin: '0 0 8px', outline: 'none' }}>
              {name} <em>{studio.tagline || nameTail}</em>
            </h2>
            <p style={{ fontFamily: F_BODY, fontSize: '15px', color: ACCENT, fontWeight: 700, margin: '0 0 16px' }}>{formatPrice(studio)}</p>
            {rule?.reason && <p style={{ fontFamily: F_BODY, fontSize: '17px', color: TEXT, lineHeight: 1.55, margin: '0 0 12px' }}>{rule.reason}</p>}
            {studio.shortDescription && <p style={{ fontFamily: F_BODY, fontSize: '15px', color: MUTED, lineHeight: 1.65, margin: '0 0 16px' }}>{studio.shortDescription}</p>}
            {addOns.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', margin: '0 0 16px' }}>
                {addOns.map(a => (
                  <span key={a} style={{ fontFamily: F_BODY, fontSize: '12px', fontWeight: 600, color: TEXT, border: `1px solid ${BORDER_SM}`, borderRadius: '999px', padding: '5px 12px' }}>+ {a}</span>
                ))}
              </div>
            )}
            {rule?.memberLine && <p style={{ fontFamily: F_BODY, fontSize: '14px', color: MUTED, margin: '0 0 20px' }}>{rule.memberLine}</p>}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '8px', maxWidth: '360px' }}>
              <a href={resultBookingUrl(studio)} style={{ ...accentButton, padding: '16px 28px', fontSize: '15px' }}>
                {labels.bookLabel || 'Book this studio'}
              </a>
              <Link to={studioPageHref(studio)} style={{ ...btnSecondary, textAlign: 'center' }}>
                See the studio
              </Link>
            </div>
          </div>
        </div>
      ) : (
        // A rule whose studio reference is broken. Never guess a room.
        <div>
          <h2 ref={headingRef} tabIndex={-1} className="mh" style={{ fontSize: 'clamp(28px, 6vw, 44px)', color: TEXT, margin: '0 0 16px', outline: 'none' }}>
            Take a look at <em>our studios</em>
          </h2>
          <a href={resultBookingUrl(null)} style={{ ...accentButton, padding: '16px 28px' }}>{labels.bookLabel || 'Book a studio'}</a>
        </div>
      )}

      {wantsTutor && <TutorForm finder={finder} studioName={studio?.name ?? null} readable={readable} />}

      <div style={{ display: 'flex', gap: '24px', marginTop: '32px' }}>
        <button type="button" onClick={onBack} style={linkButton}>Back</button>
        <button type="button" onClick={onRestart} style={linkButton}>{labels.restartLabel || 'Start again'}</button>
      </div>
    </div>
  )
}

// ── Tutor form ───────────────────────────────────────────────────────────────

type TutorErrors = ReturnType<typeof validateTutorRequest>['errors']

function TutorForm({ finder, studioName, readable }: {
  finder: SanityStudioFinder
  studioName: string | null
  readable: { question: string; answer: string }[]
}) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [days, setDays] = useState<string[]>([])
  const [company, setCompany] = useState('') // honeypot
  const [errors, setErrors] = useState<TutorErrors>({})
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'failed'>('idle')
  const [serverError, setServerError] = useState<string | null>(null)

  const t = finder.tutor ?? {}

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    const payload = { name, email, phone, preferredDays: days, studio: studioName, answers: readable }
    const check = validateTutorRequest(payload)
    setErrors(check.errors)
    if (!check.ok) return
    setStatus('sending'); setServerError(null)
    try {
      const res = await fetch('/api/tutor-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...check.value, company }),
      })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body?.error || 'Something went wrong. Please try again.')
      }
      setStatus('sent')
    } catch (err) {
      setStatus('failed')
      setServerError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
    }
  }

  const box: React.CSSProperties = { marginTop: '48px', padding: '24px 20px', background: SURF, border: `1px solid ${BORDER}`, borderRadius: '16px', maxWidth: '620px' }

  if (status === 'sent') {
    return (
      <div style={box} role="status">
        <p style={{ fontFamily: F_BODY, fontSize: '16px', color: TEXT, margin: 0, lineHeight: 1.6 }}>
          {t.successMessage || "Thanks. We'll be in touch to arrange a session."}
        </p>
      </div>
    )
  }

  const err = (m?: string) => m && <p style={{ fontFamily: F_BODY, fontSize: '13px', color: ACCENT, margin: '6px 0 0' }}>{m}</p>
  const label: React.CSSProperties = { display: 'block', fontFamily: F_BODY, fontSize: '13px', fontWeight: 600, color: TEXT, margin: '0 0 6px' }

  return (
    <form onSubmit={submit} noValidate style={box}>
      <h3 className="mh" style={{ fontSize: '24px', color: TEXT, margin: '0 0 8px' }}>
        <Headline text={t.formTitle || 'Book in with a tutor'} />
      </h3>
      {t.formIntro && <p style={{ fontFamily: F_BODY, fontSize: '15px', color: MUTED, lineHeight: 1.6, margin: '0 0 20px' }}>{t.formIntro}</p>}

      {/* Honeypot: hidden from people, filled by bots. */}
      <input type="text" name="company" value={company} onChange={e => setCompany(e.target.value)} tabIndex={-1} autoComplete="off" aria-hidden="true" style={{ position: 'absolute', left: '-9999px', width: '1px', height: '1px' }} />

      <div style={{ display: 'grid', gap: '16px' }}>
        <div>
          <label htmlFor="sf-name" style={label}>Name</label>
          <input id="sf-name" className="sf-input" value={name} onChange={e => setName(e.target.value)} autoComplete="name" aria-invalid={Boolean(errors.name)} />
          {err(errors.name)}
        </div>
        <div>
          <label htmlFor="sf-email" style={label}>Email</label>
          <input id="sf-email" className="sf-input" type="email" inputMode="email" value={email} onChange={e => setEmail(e.target.value)} autoComplete="email" aria-invalid={Boolean(errors.email)} />
          {err(errors.email)}
        </div>
        <div>
          <label htmlFor="sf-phone" style={label}>Phone <span style={{ fontWeight: 400, color: MUTED }}>(optional)</span></label>
          <input id="sf-phone" className="sf-input" type="tel" inputMode="tel" value={phone} onChange={e => setPhone(e.target.value)} autoComplete="tel" aria-invalid={Boolean(errors.phone)} />
          {err(errors.phone)}
        </div>
        <fieldset style={{ border: 'none', padding: 0, margin: 0 }}>
          <legend style={label}>Preferred days</legend>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {DAYS.map(d => {
              const on = days.includes(d)
              return (
                <label key={d} className="sf-day" style={{ cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={on}
                    onChange={() => setDays(ds => (on ? ds.filter(x => x !== d) : [...ds, d]))}
                    style={{ position: 'absolute', opacity: 0, width: '1px', height: '1px' }}
                  />
                  <span style={{
                    display: 'inline-block', minWidth: '48px', textAlign: 'center', fontFamily: F_BODY, fontSize: '14px', fontWeight: 600,
                    padding: '10px 12px', borderRadius: '999px', border: `1px solid ${on ? TEXT : BORDER_SM}`,
                    background: on ? TEXT : 'transparent', color: on ? BG : TEXT,
                  }}>{d}</span>
                </label>
              )
            })}
          </div>
          {err(errors.preferredDays)}
        </fieldset>
      </div>

      {serverError && <p role="alert" style={{ fontFamily: F_BODY, fontSize: '14px', color: ACCENT, margin: '16px 0 0' }}>{serverError}</p>}

      <button type="submit" disabled={status === 'sending'} style={{ ...btnSecondary, marginTop: '20px', cursor: 'pointer', opacity: status === 'sending' ? 0.6 : 1 }}>
        {status === 'sending' ? 'Sending...' : 'Send to the tutor'}
      </button>
    </form>
  )
}
