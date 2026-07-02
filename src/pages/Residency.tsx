import { useState } from 'react'
import SEO from '../components/SEO'
import { BG, SURF, TEXT, MUTED, MUTED_LT, BORDER, F_BODY, ACCENT, sectionLabel, btnPrimary } from '../styles'

const APPLY_URL = '/api/residency-apply'
const WHY_MAX = 280

const PLATFORMS = ['Instagram', 'TikTok', 'YouTube', 'Other']
const DISCIPLINES = ['DJ', 'Singer', 'Rapper', 'Producer', 'Other']

const inputStyle: React.CSSProperties = {
  width: '100%',
  height: '48px',
  background: BG,
  border: `1px solid ${BORDER}`,
  borderRadius: '10px',
  padding: '0 16px',
  fontFamily: F_BODY,
  fontSize: '14px',
  color: TEXT,
  outline: 'none',
  boxSizing: 'border-box',
}

const textareaStyle: React.CSSProperties = {
  ...inputStyle,
  height: 'auto',
  padding: '14px 16px',
  resize: 'vertical',
  lineHeight: 1.5,
}

const selectStyle: React.CSSProperties = {
  ...inputStyle,
  appearance: 'none',
  WebkitAppearance: 'none',
  MozAppearance: 'none',
  cursor: 'pointer',
  // Chevron drawn as an inline SVG background so it matches the dark theme.
  backgroundImage:
    "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8' fill='none' stroke='%23f0ede8' stroke-width='1.6' stroke-linecap='round' stroke-linejoin='round'><path d='M1 1.5 6 6.5 11 1.5'/></svg>\")",
  backgroundRepeat: 'no-repeat',
  backgroundPosition: 'right 16px center',
  paddingRight: '40px',
}

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontFamily: F_BODY,
  fontSize: '13px',
  fontWeight: 500,
  color: TEXT,
  marginBottom: '8px',
}

const hintStyle: React.CSSProperties = {
  fontFamily: F_BODY,
  fontSize: '12px',
  color: MUTED,
  margin: '6px 0 0',
  lineHeight: 1.5,
}

type Status = 'idle' | 'sending' | 'sent' | 'error'

const EMPTY = {
  name: '',
  email: '',
  phone: '',
  primary_platform: '',
  handle_url: '',
  additional_platforms: '',
  discipline: '',
  work_links: '',
  why_text: '',
}

export default function Residency() {
  const [form, setForm] = useState({ ...EMPTY })
  const [company, setCompany] = useState('') // honeypot — must stay empty
  const [consent, setConsent] = useState(false)
  const [status, setStatus] = useState<Status>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  const set = (key: keyof typeof EMPTY) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => setForm(f => ({ ...f, [key]: e.target.value }))

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!consent) {
      setErrorMsg('Please confirm you understand the ASA ad-disclosure requirement.')
      setStatus('error')
      return
    }
    setStatus('sending')
    setErrorMsg('')
    try {
      const res = await fetch(APPLY_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, company, consent_ad_disclosure: consent }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data?.error || 'Something went wrong.')
      }
      setStatus('sent')
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Something went wrong.')
      setStatus('error')
    }
  }

  const whyLeft = WHY_MAX - form.why_text.length

  return (
    <>
      <SEO
        title="Studio 808 Residency | Apply for Monthly Studio Hours"
        description="Apply for the Studio 808 Residency — monthly studio hours for content creators in exchange for content. Chelmsford music studios for DJs, singers, rappers and producers."
        canonical="/residency"
        image="/images/studios/studio1-performer-1.jpg"
      />

      {/* Page header */}
      <section style={{ paddingTop: '152px', paddingBottom: '80px', paddingLeft: '24px', paddingRight: '24px', borderBottom: `1px solid ${BORDER}` }}>
        <div style={{ maxWidth: '1240px', margin: '0 auto' }}>
          <span style={sectionLabel}>Studio 808 Residency</span>
          <h1 className="mh" style={{ fontSize: 'clamp(36px, 5.5vw, 64px)', color: TEXT, margin: '0 0 20px', lineHeight: 1.05, letterSpacing: '-0.02em', maxWidth: '760px' }}>
            Create Here. <em>Grow Here.</em>
          </h1>
          <p style={{ fontFamily: F_BODY, fontSize: '17px', color: MUTED, margin: 0, lineHeight: 1.65, maxWidth: '600px' }}>
            Our Residency gives content creators monthly studio hours in exchange for content made at Studio 808. Tell us about your work and why you'd be a great fit.
          </p>
        </div>
      </section>

      {/* Form */}
      <section className="section" style={{ background: BG }}>
        <div style={{ maxWidth: '680px', margin: '0 auto' }}>
          <div style={{ background: SURF, border: `1px solid ${BORDER}`, borderRadius: '16px', padding: '40px 36px' }}>
            {status === 'sent' ? (
              <div style={{ textAlign: 'center', padding: '40px 0' }}>
                <div style={{ width: '56px', height: '56px', margin: '0 auto 20px', borderRadius: '999px', background: 'rgba(232,53,90,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={ACCENT} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 12.5l5 5L20 6.5" />
                  </svg>
                </div>
                <p style={{ fontFamily: F_BODY, fontSize: '20px', fontWeight: 600, color: TEXT, margin: '0 0 10px' }}>Application received!</p>
                <p style={{ fontFamily: F_BODY, fontSize: '15px', color: MUTED, margin: 0, lineHeight: 1.6, maxWidth: '380px', marginLeft: 'auto', marginRight: 'auto' }}>
                  Thanks for applying to the Studio 808 Residency. We review every application personally and will be in touch if it's a fit.
                </p>
              </div>
            ) : (
              <>
                <span style={sectionLabel}>Apply</span>
                <h2 className="mh" style={{ fontSize: 'clamp(22px, 3vw, 32px)', color: TEXT, margin: '0 0 28px', letterSpacing: '-0.02em', lineHeight: 1.1 }}>
                  Your <em>Application.</em>
                </h2>

                <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                  {/* Honeypot — visually hidden, off the tab order, never seen by humans */}
                  <div aria-hidden="true" style={{ position: 'absolute', left: '-9999px', width: '1px', height: '1px', overflow: 'hidden' }}>
                    <label htmlFor="company">Company</label>
                    <input id="company" name="company" type="text" tabIndex={-1} autoComplete="off" value={company} onChange={e => setCompany(e.target.value)} />
                  </div>

                  <div>
                    <label htmlFor="name" style={labelStyle}>Name <span style={{ color: ACCENT }}>*</span></label>
                    <input id="name" type="text" required placeholder="Full name" value={form.name} onChange={set('name')} style={inputStyle} />
                  </div>

                  <div>
                    <label htmlFor="email" style={labelStyle}>Email <span style={{ color: ACCENT }}>*</span></label>
                    <input id="email" type="email" required placeholder="you@example.com" value={form.email} onChange={set('email')} style={inputStyle} />
                  </div>

                  <div>
                    <label htmlFor="phone" style={labelStyle}>Phone <span style={{ color: MUTED }}>(optional)</span></label>
                    <input id="phone" type="tel" placeholder="+44 7xxx xxxxxx" value={form.phone} onChange={set('phone')} style={inputStyle} />
                  </div>

                  <div>
                    <label htmlFor="primary_platform" style={labelStyle}>Primary platform <span style={{ color: ACCENT }}>*</span></label>
                    <select id="primary_platform" required value={form.primary_platform} onChange={set('primary_platform')} style={{ ...selectStyle, color: form.primary_platform ? TEXT : MUTED }}>
                      <option value="" disabled>Select a platform</option>
                      {PLATFORMS.map(p => <option key={p} value={p} style={{ color: '#111' }}>{p}</option>)}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="handle_url" style={labelStyle}>Handle or profile URL <span style={{ color: ACCENT }}>*</span></label>
                    <input id="handle_url" type="text" required placeholder="@yourhandle or https://…" value={form.handle_url} onChange={set('handle_url')} style={inputStyle} />
                  </div>

                  <div>
                    <label htmlFor="additional_platforms" style={labelStyle}>Additional platforms <span style={{ color: MUTED }}>(optional)</span></label>
                    <input id="additional_platforms" type="text" placeholder="Other handles or links, comma separated" value={form.additional_platforms} onChange={set('additional_platforms')} style={inputStyle} />
                  </div>

                  <div>
                    <label htmlFor="discipline" style={labelStyle}>Discipline <span style={{ color: ACCENT }}>*</span></label>
                    <select id="discipline" required value={form.discipline} onChange={set('discipline')} style={{ ...selectStyle, color: form.discipline ? TEXT : MUTED }}>
                      <option value="" disabled>Select a discipline</option>
                      {DISCIPLINES.map(d => <option key={d} value={d} style={{ color: '#111' }}>{d}</option>)}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="work_links" style={labelStyle}>Recent work <span style={{ color: MUTED }}>(2-3 links)</span></label>
                    <textarea id="work_links" rows={3} placeholder={'Links to recent posts or your best work\nOne URL per line'} value={form.work_links} onChange={set('work_links')} style={textareaStyle} />
                    <p style={hintStyle}>Paste 2-3 links, one per line.</p>
                  </div>

                  <div>
                    <label htmlFor="why_text" style={labelStyle}>Why Studio 808? <span style={{ color: ACCENT }}>*</span></label>
                    <textarea id="why_text" rows={4} required maxLength={WHY_MAX} placeholder="What do you want to create with us, and why is Studio 808 the right fit?" value={form.why_text} onChange={set('why_text')} style={textareaStyle} />
                    <p style={{ ...hintStyle, textAlign: 'right', color: whyLeft <= 20 ? ACCENT : MUTED }}>{whyLeft} characters left</p>
                  </div>

                  {/* ASA ad-disclosure consent */}
                  <label onClick={() => setConsent(c => !c)} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', padding: '14px 16px', border: `1px solid ${consent ? ACCENT : BORDER}`, borderRadius: '10px', cursor: 'pointer', background: consent ? 'rgba(232,53,90,0.08)' : 'transparent', transition: 'border-color 0.15s, background 0.15s' }}>
                    <div style={{ width: '20px', height: '20px', borderRadius: '6px', flexShrink: 0, marginTop: '1px', border: `2px solid ${consent ? ACCENT : BORDER}`, background: consent ? ACCENT : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s' }}>
                      {consent && (
                        <svg width="11" height="11" viewBox="0 0 10 10" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M1.5 5l2.5 2.5 4.5-4.5" />
                        </svg>
                      )}
                    </div>
                    <span style={{ fontFamily: F_BODY, fontSize: '13.5px', color: MUTED_LT, lineHeight: 1.5 }}>
                      I understand that content created as part of this program will be labelled as an ad in line with ASA guidelines. <span style={{ color: ACCENT }}>*</span>
                    </span>
                  </label>

                  {status === 'error' && (
                    <p style={{ fontFamily: F_BODY, fontSize: '13px', color: '#ef4444', margin: 0, lineHeight: 1.5 }}>
                      {errorMsg || 'Something went wrong. Please try again or email info@studio-808.com'}
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={status === 'sending'}
                    style={{ ...btnPrimary, border: 'none', cursor: status === 'sending' ? 'default' : 'pointer', textAlign: 'center', opacity: status === 'sending' ? 0.6 : 1 }}
                    onMouseEnter={e => { if (status !== 'sending') e.currentTarget.style.opacity = '0.88' }}
                    onMouseLeave={e => { if (status !== 'sending') e.currentTarget.style.opacity = '1' }}
                  >
                    {status === 'sending' ? 'Submitting…' : 'Submit Application'}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </section>
    </>
  )
}
