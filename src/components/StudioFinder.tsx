// "Find your studio" wizard: a full-screen overlay at /find-your-studio.
//
// Everything it asks and recommends comes from the Sanity "Studio finder"
// singleton (schemaTypes/studioFinder.ts); the logic is in lib/studioFinder.js.
// State is the answers map alone, mirrored into the URL hash so a refresh
// keeps the customer's place. No localStorage.

import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { BG, SURF, TEXT, MUTED, BORDER, BORDER_SM, ACCENT, F_BODY, btnSecondary } from '../styles'
import { useStudioFinder } from '../hooks/useStudioFinder'
import { formatPrice, sanityImageUrl, type FinderStudio, type SanityStudioFinder } from '../lib/sanity'
import {
  DAYS, TUTOR_QUESTION_KEY, TUTOR_YES, decodeAnswers, encodeAnswers, matchRule, nextQuestion, progress,
  pruneAnswers, resultBookingUrl, studioPageHref, validateTutorRequest, visibleQuestions, withoutLastAnswer,
  type Answers, type FinderQuestion,
} from '../lib/studioFinder.js'
import { FINDER_PATH, backgroundOf } from '../lib/studioFinderRoute'
import Headline from './Headline'
import { splitStudioName, studioLabel } from '../lib/studioName.js'

// Used when a studio document has no hero image, keyed by sortOrder.
const STATIC_HERO: Record<number, string> = {
  1: '/images/studios/studio1-performer-1.jpg',
  2: '/images/studios/studio2-creator-1.jpg',
  3: '/images/studios/studio3-prodj-1.jpg',
  4: '/images/studios/studio4-production-1.jpg',
}

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
  // Which way the next step slides in: forward from the right, back from the left.
  const [dir, setDir] = useState<1 | -1>(1)

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

  const answer = (key: string, value: string) => { setDir(1); setAnswers(a => pruneAnswers(questions, { ...a, [key]: value }, opts)) }
  const back = () => { setDir(-1); setAnswers(a => withoutLastAnswer(questions, a, opts)) }
  const restart = () => { setDir(-1); setAnswers({}) }

  return (
    <Shell onClose={close}>
      {/* One bar for the whole wizard, so its fill can grow between steps. */}
      <div aria-hidden="true" className="sf-progress">
        <div style={{ transform: `scaleX(${question ? (answered) / Math.max(total, 1) : 1})` }} />
      </div>
      {question ? (
        <QuestionStep
          key={question.key}
          dir={dir}
          question={question}
          title={question.key === TUTOR_QUESTION_KEY && finder.tutor?.questionCopy ? finder.tutor.questionCopy : question.title}
          current={answered + 1}
          total={total}
          onAnswer={v => answer(question.key, v)}
          onBack={answered > 0 ? back : null}
        />
      ) : (
        <Result
          key="result"
          dir={dir}
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
        .sf-progress { max-width: 620px; height: 3px; margin: 8px auto 14px; background: ${BORDER}; border-radius: 2px; overflow: hidden; }
        .sf-progress > div { height: 100%; background: #e8355a; transform-origin: left center; transition: transform 420ms var(--s8-ease); }
        .sf-step { animation: sf-in 320ms var(--s8-ease) both; }
        .sf-step[data-dir="-1"] { animation-name: sf-in-back; }
        @keyframes sf-in { from { opacity: 0; transform: translateX(36px); } to { opacity: 1; transform: none; } }
        @keyframes sf-in-back { from { opacity: 0; transform: translateX(-36px); } to { opacity: 1; transform: none; } }
        .sf-option { transition: transform 220ms var(--s8-ease), border-color 220ms ease, background-color 220ms ease; box-shadow: var(--mp-shadow); }
        .sf-option:focus-visible { border-color: rgba(232,53,90,0.4) !important; background: #1d1d1d !important; }
        @media (hover: hover) and (pointer: fine) {
          .sf-option:hover { transform: translateY(-3px); border-color: rgba(232,53,90,0.4) !important; background: #1a1a1a !important; }
        }
        .sf-result-card { padding: 16px; }
        .sf-result-card img { animation: sf-photo 900ms var(--s8-ease) both; }
        @keyframes sf-photo { from { opacity: 0; transform: scale(1.04); } to { opacity: 1; transform: none; } }
        .sf-submit { position: relative; display: inline-flex; align-items: center; justify-content: center; gap: 10px; min-width: 200px; min-height: 46px; transition: background-color 240ms ease, color 240ms ease, border-color 240ms ease; }
        .sf-submit[data-state="sending"] { cursor: progress; }
        .sf-submit[data-state="sent"] { background: #e8355a !important; border-color: #e8355a !important; color: #0d0d0d !important; }
        .sf-spin { width: 18px; height: 18px; border-radius: 999px; border: 2px solid rgba(240,237,232,0.25); border-top-color: ${TEXT}; animation: sf-spin 700ms linear infinite; }
        @keyframes sf-spin { to { transform: rotate(360deg); } }
        .sf-tick path { stroke-dasharray: 24; stroke-dashoffset: 24; animation: sf-tick 380ms var(--s8-ease) 60ms forwards; }
        @keyframes sf-tick { to { stroke-dashoffset: 0; } }
        .sf-done { animation: s8-rise 500ms var(--s8-ease) both; }
        @media (prefers-reduced-motion: reduce) {
          .sf-step, .sf-result-card img, .sf-done { animation: none; }
          .sf-progress > div, .sf-option, .sf-submit { transition: none; }
          .sf-option:hover { transform: none; }
          .sf-spin { animation: none; border-top-color: rgba(240,237,232,0.25); }
          .sf-tick path { animation: none; stroke-dashoffset: 0; }
        }
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

function QuestionStep({ question, title, current, total, onAnswer, onBack, dir }: {
  dir: 1 | -1
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
    <div className="sf-step" data-dir={dir} style={{ maxWidth: '620px', margin: '0 auto' }}>
      <p style={{ fontFamily: F_BODY, fontSize: '13px', fontWeight: 600, color: 'rgba(240,237,232,0.72)', margin: '0 0 18px' }}>
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
            {o.helper && <span style={{ display: 'block', fontWeight: 400, fontSize: '14px', color: 'rgba(240,237,232,0.72)', marginTop: '4px' }}>{o.helper}</span>}
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

function Result({ finder, answers, readable, onBack, onRestart, dir }: {
  dir: 1 | -1
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
  // Studio names in Sanity are "Studio 1, dash, Performer": shown apart, never with the dash.
  const { room: name, role } = splitStudioName(studio)
  const addOns = rule?.addOns ?? []

  return (
    <div className="sf-step" data-dir={dir}>
      <p style={{ fontFamily: F_BODY, fontSize: '13px', fontWeight: 600, color: 'rgba(240,237,232,0.72)', margin: '0 0 18px' }}>
        {labels.heading || 'Your studio'}
      </p>

      {studio ? (
        <div className="sf-result s8-card s8-static sf-result-card">
          {image && (
            <div style={{ overflow: 'hidden', borderRadius: '10px' }}>
              <img src={image} alt={studioLabel(studio)} width="900" height="675" style={{ width: '100%', height: 'auto', aspectRatio: '4 / 3', objectFit: 'cover', display: 'block' }} />
            </div>
          )}
          <div style={{ padding: '8px 4px' }}>
            <h2 ref={headingRef} tabIndex={-1} className="mh" style={{ fontSize: 'clamp(30px, 6vw, 48px)', color: TEXT, lineHeight: 1.05, letterSpacing: '-0.02em', margin: '0 0 8px', outline: 'none' }}>
              <span className="s8-seq" style={{ display: 'block', '--s': 0 } as CSSProperties}>{name}</span>
            </h2>
            {role && <p className="s8-subline s8-seq" style={{ fontSize: 'clamp(22px, 4vw, 30px)', margin: '0 0 12px', '--s': 1 } as CSSProperties}>{role}</p>}
            <p className="s8-seq" style={{ fontFamily: F_BODY, fontSize: '15px', color: 'var(--s8-coral-text)', fontWeight: 700, margin: '0 0 16px', '--s': 2 } as CSSProperties}>{formatPrice(studio)}</p>
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
              <a href={resultBookingUrl(studio)} className="s8-btn s8-seq" style={{ padding: '16px 28px', fontSize: '15px', '--s': 3 } as CSSProperties}>
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
          <a href={resultBookingUrl(null)} className="s8-btn" style={{ padding: '16px 28px' }}>{labels.bookLabel || 'Book a studio'}</a>
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
  // sent: the button shows its tick for a moment; done: the thank-you replaces the form.
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'done' | 'failed'>('idle')
  useEffect(() => {
    if (status !== 'sent') return
    const t = window.setTimeout(() => setStatus('done'), 900)
    return () => window.clearTimeout(t)
  }, [status])
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

  if (status === 'done') {
    return (
      <div style={box} role="status" className="sf-done">
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

      <button
        type="submit"
        className="sf-submit"
        data-state={status}
        disabled={status === 'sending' || status === 'sent'}
        aria-busy={status === 'sending'}
        style={{ ...btnSecondary, marginTop: '20px', cursor: 'pointer' }}
      >
        {status === 'sending' ? (
          <><span className="sf-spin" aria-hidden="true" /><span className="s8-sr">Sending</span></>
        ) : status === 'sent' ? (
          <><svg className="sf-tick" width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="M4.5 10.5 8.3 14 15.5 6.5" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" /></svg><span className="s8-sr">Sent</span></>
        ) : 'Send to the tutor'}
      </button>
      <span className="s8-sr" role="status">{status === 'sending' ? 'Sending your request' : status === 'sent' ? 'Sent' : ''}</span>
    </form>
  )
}
