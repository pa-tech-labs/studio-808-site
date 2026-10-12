// Enquiry (#enquire) from audioPage.enquiry. Posts to /api/audio-enquiry,
// validated on both sides by validateAudioEnquiry (src/lib/audioEnquiry.js).
// Errors show inline under each field once the visitor has tried to send;
// focus moves to the first one. While sending the button is disabled. On
// success the form is replaced by enquiry.successMessage and an
// 'audio:enquiry' window event fires; on failure the visitor can retry, or
// email us with the enquiry prefilled.

import { useMemo, useRef, useState, type ChangeEvent, type FormEvent, type ReactNode } from 'react'
import type { AudioPageData } from '../../../lib/audioPage'
import {
  HONEYPOT_FIELD, validateAudioEnquiry, enquirySubject, enquiryText,
  type AudioEnquiryErrors, type AudioEnquiryField,
} from '../../../lib/audioEnquiry.js'
import { AUDIO_ANCHORS } from '../anchors'
import { hasEnquiry } from './has'

const DEFAULT_TYPES = ['Audiobook', 'Broadcast', 'Commercial', 'eLearning', 'Podcast', 'Other']
const PRIVACY_URL = 'https://www.studio-808.com/privacy'

type Status = 'idle' | 'sending' | 'sent' | 'failed'
type Fields = Record<Exclude<AudioEnquiryField, 'consent'>, string> & { consent: boolean; [HONEYPOT_FIELD]: string }

const EMPTY: Fields = { name: '', company: '', email: '', phone: '', projectType: '', length: '', deadline: '', message: '', consent: false, website: '' }

const ORDER: AudioEnquiryField[] = ['name', 'company', 'email', 'phone', 'projectType', 'length', 'deadline', 'message', 'consent']

const todayIso = () => {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export default function Enquiry({ data }: { data: AudioPageData }) {
  const e = data.page?.enquiry
  const contactEmail = data.page?.footer?.email || 'info@studio-808.com'
  const projectTypes = useMemo(() => {
    const list = (e?.projectTypes ?? []).map(s => s.trim()).filter(Boolean)
    return list.length ? list : DEFAULT_TYPES
  }, [e?.projectTypes])

  const [fields, setFields] = useState<Fields>(EMPTY)
  const [errors, setErrors] = useState<AudioEnquiryErrors>({})
  const [tried, setTried] = useState(false)
  const [status, setStatus] = useState<Status>('idle')
  const [serverError, setServerError] = useState('')
  const formRef = useRef<HTMLFormElement>(null)
  const doneRef = useRef<HTMLDivElement>(null)

  if (!e || !hasEnquiry(data.page)) return null

  const check = (next: Fields) => validateAudioEnquiry(next, { projectTypes, today: todayIso() })

  const set = (name: keyof Fields) => (ev: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const t = ev.target
    const v = t instanceof HTMLInputElement && t.type === 'checkbox' ? t.checked : t.value
    const next = { ...fields, [name]: v } as Fields
    setFields(next)
    if (tried) setErrors(check(next).errors)
  }

  const send = async () => {
    setStatus('sending')
    setServerError('')
    try {
      const res = await fetch('/api/audio-enquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(fields),
      })
      const body = await res.json().catch(() => ({}))
      if (res.ok && body.ok) {
        setStatus('sent')
        window.dispatchEvent(new CustomEvent('audio:enquiry', { detail: { projectType: fields.projectType } }))
        requestAnimationFrame(() => doneRef.current?.focus())
        return
      }
      if (res.status === 400 && body.errors) setErrors(body.errors)
      // The server's own wording only when it says something specific.
      setServerError(res.status === 429 || res.status === 400 ? body.error || 'We could not send your enquiry.' : 'We could not send your enquiry.')
      setStatus('failed')
    } catch {
      setServerError('We could not reach the server.')
      setStatus('failed')
    }
  }

  const onSubmit = (ev: FormEvent) => {
    ev.preventDefault()
    if (status === 'sending') return
    setTried(true)
    const r = check(fields)
    setErrors(r.errors)
    if (!r.ok) {
      const first = ORDER.find(f => r.errors[f])
      if (first) formRef.current?.querySelector<HTMLElement>(`[name="${first}"]`)?.focus()
      return
    }
    send()
  }

  const mailto = () => {
    const v = validateAudioEnquiry(fields).value
    return `mailto:${contactEmail}?subject=${encodeURIComponent(enquirySubject({ ...v, projectType: v.projectType || 'Enquiry' }))}&body=${encodeURIComponent(enquiryText(v))}`
  }

  const err = (f: AudioEnquiryField) => (errors[f] ? { 'aria-invalid': true, 'aria-describedby': `a8-err-${f}` } : {})
  const sending = status === 'sending'

  return (
    <section id={AUDIO_ANCHORS.enquire} className="a8-sec a8-enquiry" aria-labelledby="a8-enquiry-title">
      <div className="a8-wrap a8-enquiry-grid">
        <header className="a8-sec-head">
          <h2 id="a8-enquiry-title" className="a8-h2">{e.heading || 'Get a quote'}</h2>
          {e.body && <p className="a8-lead">{e.body}</p>}
          <p className="a8-enquiry-direct">Prefer email? <a href={`mailto:${contactEmail}`}>{contactEmail}</a></p>
        </header>

        {status === 'sent' ? (
          <div className="a8-form-done" ref={doneRef} tabIndex={-1} role="status">
            <svg width="20" height="20" viewBox="0 0 16 16" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 8.5l3 3 7-7" /></svg>
            <p>{e.successMessage || 'Thanks. Your enquiry is with us and we will reply within one working day.'}</p>
          </div>
        ) : (
          <form ref={formRef} className="a8-form" onSubmit={onSubmit} noValidate aria-busy={sending}>
            <div className="a8-form-grid">
              <Field id="name" label="Name" error={errors.name}>
                <input id="a8-f-name" name="name" type="text" autoComplete="name" required maxLength={120} value={fields.name} onChange={set('name')} {...err('name')} />
              </Field>
              <Field id="company" label="Company" optional error={errors.company}>
                <input id="a8-f-company" name="company" type="text" autoComplete="organization" maxLength={160} value={fields.company} onChange={set('company')} {...err('company')} />
              </Field>
              <Field id="email" label="Email" error={errors.email}>
                <input id="a8-f-email" name="email" type="email" autoComplete="email" inputMode="email" required maxLength={200} value={fields.email} onChange={set('email')} {...err('email')} />
              </Field>
              <Field id="phone" label="Phone" optional error={errors.phone}>
                <input id="a8-f-phone" name="phone" type="tel" autoComplete="tel" maxLength={40} value={fields.phone} onChange={set('phone')} {...err('phone')} />
              </Field>
              <Field id="projectType" label="Project type" error={errors.projectType}>
                <div className="a8-select">
                  <select id="a8-f-projectType" name="projectType" required value={fields.projectType} onChange={set('projectType')} {...err('projectType')}>
                    <option value="" disabled>Choose one</option>
                    {projectTypes.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              </Field>
              <Field id="length" label="Approximate length" optional error={errors.length}>
                <input id="a8-f-length" name="length" type="text" maxLength={200} placeholder="e.g. 60,000 words / 3 x 30s spots" value={fields.length} onChange={set('length')} {...err('length')} />
              </Field>
              <Field id="deadline" label="Deadline" optional error={errors.deadline}>
                <input id="a8-f-deadline" name="deadline" type="date" min={todayIso()} value={fields.deadline} onChange={set('deadline')} {...err('deadline')} />
              </Field>
              <Field id="message" label="About the project" wide error={errors.message}>
                <textarea id="a8-f-message" name="message" rows={6} required maxLength={5000} value={fields.message} onChange={set('message')} {...err('message')} />
              </Field>
            </div>

            {/* Honeypot: hidden from people and assistive tech; bots fill it. */}
            <div className="a8-hp" aria-hidden="true">
              <label htmlFor="a8-f-website">Website</label>
              <input id="a8-f-website" name={HONEYPOT_FIELD} type="text" tabIndex={-1} autoComplete="off" value={fields.website} onChange={set('website')} />
            </div>

            <div className="a8-consent">
              <label>
                <input type="checkbox" name="consent" checked={fields.consent} onChange={set('consent')} {...err('consent')} />
                <span>I agree to Studio 808 Voice using these details to reply to my enquiry, as described in the <a href={PRIVACY_URL} target="_blank" rel="noopener noreferrer">privacy policy</a>.</span>
              </label>
              {errors.consent && <p className="a8-err" id="a8-err-consent">{errors.consent}</p>}
            </div>

            {status === 'failed' && (
              <div className="a8-form-failed" role="alert">
                <p>{serverError} Try again, or <a href={mailto()}>email it to us</a> with your details filled in.</p>
              </div>
            )}

            <div className="a8-form-actions">
              <button type="submit" className="a8-btn a8-btn-solid" disabled={sending}>
                {sending ? 'Sending...' : status === 'failed' ? 'Try again' : 'Send enquiry'}
              </button>
              {tried && Object.keys(errors).length > 0 && (
                <p className="a8-form-summary" role="status">
                  {Object.keys(errors).length === 1 ? 'One field needs attention.' : `${Object.keys(errors).length} fields need attention.`}
                </p>
              )}
            </div>
          </form>
        )}
      </div>
    </section>
  )
}

function Field({ id, label, optional = false, wide = false, error, children }: {
  id: AudioEnquiryField; label: string; optional?: boolean; wide?: boolean; error?: string; children: ReactNode
}) {
  return (
    <div className={`a8-field${wide ? ' a8-field-wide' : ''}`} data-error={error ? 'true' : undefined}>
      <label htmlFor={`a8-f-${id}`}>{label}{optional && <span className="a8-optional"> (optional)</span>}</label>
      {children}
      {error && <p className="a8-err" id={`a8-err-${id}`}>{error}</p>}
    </div>
  )
}
