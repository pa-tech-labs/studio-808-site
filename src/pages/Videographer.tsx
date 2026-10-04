import { useRef, useState } from 'react'
import SEO from '../components/SEO'
import { BG, SURF, TEXT, MUTED, MUTED_LT, BORDER, F_BODY, ACCENT, sectionLabel, btnPrimary } from '../styles'

const APPLY_URL = '/api/videographer-apply'
const ABOUT_MAX = 400
const CV_MAX_BYTES = 4 * 1024 * 1024 // 4MB
const CV_ACCEPT = '.pdf,.doc,.docx'
const CV_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
]

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
  location: '',
  has_car: '',
  showreel_url: '',
  experience: '',
  about_text: '',
}

// Read a File into a base64 string (without the data: URL prefix).
function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const result = String(reader.result || '')
      resolve(result.includes(',') ? result.split(',')[1] : result)
    }
    reader.onerror = () => reject(new Error('Could not read the file.'))
    reader.readAsDataURL(file)
  })
}

export default function Videographer() {
  const [form, setForm] = useState({ ...EMPTY })
  const [company, setCompany] = useState('') // honeypot — must stay empty
  const [cv, setCv] = useState<File | null>(null)
  const [cvError, setCvError] = useState('')
  const [status, setStatus] = useState<Status>('idle')
  const [errorMsg, setErrorMsg] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  const set = (key: keyof typeof EMPTY) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => setForm(f => ({ ...f, [key]: e.target.value }))

  const onCv = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCvError('')
    const file = e.target.files?.[0] ?? null
    if (!file) { setCv(null); return }
    if (!CV_TYPES.includes(file.type)) {
      setCv(null)
      setCvError('CV must be a PDF, DOC or DOCX file.')
      if (fileRef.current) fileRef.current.value = ''
      return
    }
    if (file.size > CV_MAX_BYTES) {
      setCv(null)
      setCvError('CV must be 4MB or smaller.')
      if (fileRef.current) fileRef.current.value = ''
      return
    }
    setCv(file)
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('sending')
    setErrorMsg('')
    try {
      let cvPayload: { filename: string; type: string; data: string } | undefined
      if (cv) {
        cvPayload = { filename: cv.name, type: cv.type, data: await fileToBase64(cv) }
      }
      const res = await fetch(APPLY_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, company, cv: cvPayload }),
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

  const aboutLeft = ABOUT_MAX - form.about_text.length

  return (
    <>
      <SEO
        title="Assistant Videographer (Volunteer) | Studio 808"
        description="Volunteer as an Assistant Videographer at Studio 808. Help film DJ sets and interviews for our new YouTube series. Real set experience and credits. Chelmsford area."
        canonical="/videographer"
        image="/images/studios/studio1-performer-1.jpg"
      />

      {/* Page header */}
      <section style={{ paddingTop: '152px', paddingBottom: '80px', paddingLeft: '24px', paddingRight: '24px', borderBottom: `1px solid ${BORDER}` }}>
        <div style={{ maxWidth: '1240px', margin: '0 auto' }}>
          <span style={sectionLabel}>New YouTube Series · Volunteer Role</span>
          <h1 className="mh" style={{ fontSize: 'clamp(36px, 5.5vw, 64px)', color: TEXT, margin: '0 0 20px', lineHeight: 1.05, letterSpacing: '-0.02em', maxWidth: '760px' }}>
            Assistant <em>Videographer.</em>
          </h1>
          <p style={{ fontFamily: F_BODY, fontSize: '17px', color: MUTED, margin: 0, lineHeight: 1.65, maxWidth: '600px' }}>
            Help us film DJ sets and interviews for our new YouTube series. Real set experience, real credits, and a genuine foot in the door of the industry. Cameras and drones provided. You'll need to be within 10 miles of Chelmsford and have your own car.
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
                  Thanks for applying to be an Assistant Videographer at Studio 808. We review every application personally and will be in touch if it's a fit.
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
                    <label htmlFor="location" style={labelStyle}>Where are you based? <span style={{ color: ACCENT }}>*</span></label>
                    <input id="location" type="text" required placeholder="Town or postcode" value={form.location} onChange={set('location')} style={inputStyle} />
                    <p style={hintStyle}>You'll need to be within 10 miles of Chelmsford.</p>
                  </div>

                  <div>
                    <label htmlFor="has_car" style={labelStyle}>Do you have a car? <span style={{ color: ACCENT }}>*</span></label>
                    <select id="has_car" required value={form.has_car} onChange={set('has_car')} style={{ ...selectStyle, color: form.has_car ? TEXT : MUTED }}>
                      <option value="" disabled>Select an option</option>
                      <option value="yes" style={{ color: '#111' }}>Yes</option>
                      <option value="no" style={{ color: '#111' }}>No</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="showreel_url" style={labelStyle}>Showreel or portfolio <span style={{ color: MUTED }}>(optional)</span></label>
                    <input id="showreel_url" type="text" placeholder="@yourhandle or https://…" value={form.showreel_url} onChange={set('showreel_url')} style={inputStyle} />
                    <p style={hintStyle}>A link to your best work: reel, Instagram, YouTube, Vimeo, anything.</p>
                  </div>

                  <div>
                    <label htmlFor="experience" style={labelStyle}>Experience & kit <span style={{ color: MUTED }}>(optional)</span></label>
                    <textarea id="experience" rows={3} placeholder="Any filming/editing experience, gear you own, and your general availability." value={form.experience} onChange={set('experience')} style={textareaStyle} />
                  </div>

                  <div>
                    <label htmlFor="about_text" style={labelStyle}>Tell us about yourself <span style={{ color: ACCENT }}>*</span></label>
                    <textarea id="about_text" rows={4} required maxLength={ABOUT_MAX} placeholder="Who you are and why you'd like to get involved with the series." value={form.about_text} onChange={set('about_text')} style={textareaStyle} />
                    <p style={{ ...hintStyle, textAlign: 'right', color: aboutLeft <= 30 ? ACCENT : MUTED }}>{aboutLeft} characters left</p>
                  </div>

                  {/* CV upload */}
                  <div>
                    <label htmlFor="cv" style={labelStyle}>CV <span style={{ color: MUTED }}>(optional)</span></label>
                    <input
                      ref={fileRef}
                      id="cv"
                      type="file"
                      accept={CV_ACCEPT}
                      onChange={onCv}
                      style={{ display: 'none' }}
                    />
                    <label
                      htmlFor="cv"
                      style={{
                        display: 'flex', alignItems: 'center', gap: '12px',
                        minHeight: '48px', padding: '10px 16px',
                        background: BG, border: `1px solid ${cvError ? '#ef4444' : BORDER}`,
                        borderRadius: '10px', cursor: 'pointer',
                        fontFamily: F_BODY, fontSize: '14px', color: cv ? TEXT : MUTED,
                      }}
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={ACCENT} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                        <polyline points="17 8 12 3 7 8" />
                        <line x1="12" y1="3" x2="12" y2="15" />
                      </svg>
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {cv ? cv.name : 'Upload your CV (PDF, DOC or DOCX)'}
                      </span>
                      {cv && (
                        <button
                          type="button"
                          onClick={e => { e.preventDefault(); setCv(null); setCvError(''); if (fileRef.current) fileRef.current.value = '' }}
                          style={{ marginLeft: 'auto', background: 'none', border: 'none', color: MUTED, cursor: 'pointer', fontSize: '13px', fontFamily: F_BODY, flexShrink: 0 }}
                        >
                          Remove
                        </button>
                      )}
                    </label>
                    <p style={{ ...hintStyle, color: cvError ? '#ef4444' : MUTED }}>
                      {cvError || 'Max 4MB. Optional: a showreel link is just as good.'}
                    </p>
                  </div>

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

                  <p style={{ ...hintStyle, textAlign: 'center' }}>
                    This is a volunteer role. <span style={{ color: MUTED_LT }}>Cameras and drones are provided.</span>
                  </p>
                </form>
              </>
            )}
          </div>
        </div>
      </section>
    </>
  )
}
