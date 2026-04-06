import { useState } from 'react'
import SEO from '../components/SEO'
import { BG, SURF, TEXT, MUTED, BORDER, F_BODY, ACCENT, sectionLabel, btnPrimary } from '../styles'

const BOOK_URL = 'https://book.studio-808.com'

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

const FORM_URL = 'https://access-hub-production.up.railway.app/api/forms/47a08cea-a18e-442d-8c4d-16cd07255ba3/submit'

const SERVICES = ['Recording Studio', 'DJ Studio', 'Podcast Studio', 'Voiceovers', 'Audiobooks']

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' })
  const [selectedServices, setSelectedServices] = useState<string[]>([])
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')

  return (
    <>
      <SEO
        title="Contact Studio 808 | Chelmsford Music Studios"
        description="Get in touch with Studio 808. Email info@studio-808.com or book a studio online. Unit 11–11A Robjohns House, Navigation Road, Chelmsford CM2 6ND."
        canonical="/contact"
        image="/images/studios/studio1-performer-1.jpg"
      />

      {/* Page header */}
      <section style={{ paddingTop: '152px', paddingBottom: '80px', paddingLeft: '24px', paddingRight: '24px', borderBottom: `1px solid ${BORDER}` }}>
        <div style={{ maxWidth: '1240px', margin: '0 auto' }}>
          <span style={sectionLabel}>Get in touch</span>
          <h1 className="mh" style={{ fontSize: 'clamp(36px, 5.5vw, 64px)', color: TEXT, margin: '0 0 20px', lineHeight: 1.05, letterSpacing: '-0.02em', maxWidth: '700px' }}>
            Say <em>Hello.</em>
          </h1>
          <p style={{ fontFamily: F_BODY, fontSize: '17px', color: MUTED, margin: 0, lineHeight: 1.65, maxWidth: '540px' }}>
            Questions about our studios, equipment or services? Get in touch and we'll get back to you as soon as possible.
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="section" style={{ background: BG }}>
        <div style={{ maxWidth: '1240px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '60px' }}>

          {/* Contact details */}
          <div>
            <span style={sectionLabel}>Details</span>
            <h2 className="mh" style={{ fontSize: 'clamp(24px, 3vw, 36px)', color: TEXT, margin: '0 0 32px', letterSpacing: '-0.02em', lineHeight: 1.1 }}>
              How to <em>Reach Us.</em>
            </h2>
            {[
              { label: 'Email', value: 'info@studio-808.com', href: 'mailto:info@studio-808.com' },
              { label: 'Book Online', value: 'book.studio-808.com', href: BOOK_URL },
            ].map(({ label, value, href }) => (
              <div key={label} style={{ marginBottom: '28px' }}>
                <p style={{ fontFamily: F_BODY, fontSize: '11px', fontWeight: 600, color: 'rgba(240,237,232,0.3)', textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 6px' }}>{label}</p>
                <a href={href} target={href.startsWith('http') ? '_blank' : undefined} rel="noopener noreferrer"
                  style={{ fontFamily: F_BODY, fontSize: '15px', color: ACCENT, textDecoration: 'none', fontWeight: 500 }}>
                  {value}
                </a>
              </div>
            ))}
            <div style={{ marginBottom: '36px' }}>
              <p style={{ fontFamily: F_BODY, fontSize: '11px', fontWeight: 600, color: 'rgba(240,237,232,0.3)', textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 6px' }}>Address</p>
              <p style={{ fontFamily: F_BODY, fontSize: '15px', color: 'rgba(240,237,232,0.7)', margin: 0, lineHeight: 1.7 }}>
                Studio 808 Ltd<br />
                Unit 11–11A Robjohns House<br />
                Navigation Road<br />
                Chelmsford, CM2 6ND
              </p>
            </div>
            <a href={BOOK_URL}
              style={btnPrimary}
              onMouseEnter={e => (e.currentTarget.style.opacity = '0.88')}
              onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
            >
              Book a Studio Online
            </a>
          </div>

          {/* Contact form */}
          <div style={{ background: SURF, border: `1px solid ${BORDER}`, borderRadius: '16px', padding: '40px 36px' }}>
            <span style={sectionLabel}>Message us</span>
            <h2 className="mh" style={{ fontSize: 'clamp(22px, 3vw, 32px)', color: TEXT, margin: '0 0 28px', letterSpacing: '-0.02em', lineHeight: 1.1 }}>
              Send a <em>Message.</em>
            </h2>
            {status === 'sent' ? (
              <div style={{ textAlign: 'center', padding: '40px 0' }}>
                <p style={{ fontFamily: F_BODY, fontSize: '18px', fontWeight: 600, color: TEXT, margin: '0 0 8px' }}>Message sent!</p>
                <p style={{ fontFamily: F_BODY, fontSize: '14px', color: MUTED, margin: 0 }}>Thanks for getting in touch — we'll get back to you soon.</p>
              </div>
            ) : (
            <form
              onSubmit={async e => {
                e.preventDefault()
                setStatus('sending')
                try {
                  const res = await fetch(FORM_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name: form.name, email: form.email, phone: form.phone || null, message: form.message || null, selected_services: selectedServices }),
                  })
                  if (!res.ok) throw new Error()
                  setStatus('sent')
                } catch {
                  setStatus('error')
                }
              }}
              style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}
            >
              {[
                { id: 'name', label: 'Your Name', type: 'text', placeholder: 'Full name' },
                { id: 'email', label: 'Email Address', type: 'email', placeholder: 'you@example.com' },
                { id: 'phone', label: 'Phone', type: 'tel', placeholder: '+44 7xxx xxxxxx' },
              ].map(({ id, label, type, placeholder }) => (
                <div key={id}>
                  <label htmlFor={id} style={{ display: 'block', fontFamily: F_BODY, fontSize: '13px', fontWeight: 500, color: TEXT, marginBottom: '8px' }}>{label}</label>
                  <input
                    id={id}
                    type={type}
                    placeholder={placeholder}
                    value={form[id as 'name' | 'email' | 'phone']}
                    onChange={e => setForm(f => ({ ...f, [id]: e.target.value }))}
                    style={inputStyle}
                  />
                </div>
              ))}
              <div>
                <label htmlFor="message" style={{ display: 'block', fontFamily: F_BODY, fontSize: '13px', fontWeight: 500, color: TEXT, marginBottom: '8px' }}>Message</label>
                <textarea
                  id="message"
                  placeholder="How can we help?"
                  rows={5}
                  value={form.message}
                  onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                  style={{ ...inputStyle, height: 'auto', padding: '14px 16px', resize: 'vertical', lineHeight: 1.5 }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontFamily: F_BODY, fontSize: '13px', fontWeight: 500, color: TEXT, marginBottom: '10px' }}>I'm interested in</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
                  {SERVICES.map(s => {
                    const checked = selectedServices.includes(s)
                    return (
                      <label key={s} onClick={() => setSelectedServices(prev => checked ? prev.filter(x => x !== s) : [...prev, s])}
                        style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 14px', border: `1px solid ${checked ? ACCENT : BORDER}`, borderRadius: '10px', cursor: 'pointer', background: checked ? 'rgba(232,53,90,0.08)' : 'transparent', transition: 'border-color 0.15s, background 0.15s' }}>
                        <div style={{ width: '18px', height: '18px', borderRadius: '5px', flexShrink: 0, border: `2px solid ${checked ? ACCENT : BORDER}`, background: checked ? ACCENT : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s' }}>
                          {checked && (
                            <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M1.5 5l2.5 2.5 4.5-4.5" />
                            </svg>
                          )}
                        </div>
                        <span style={{ fontFamily: F_BODY, fontSize: '14px', color: TEXT, fontWeight: checked ? 600 : 400 }}>{s}</span>
                      </label>
                    )
                  })}
                </div>
              </div>
              {status === 'error' && (
                <p style={{ fontFamily: F_BODY, fontSize: '13px', color: '#ef4444', margin: 0 }}>
                  Something went wrong. Please try again or email us at info@studio-808.com
                </p>
              )}
              <button
                type="submit"
                disabled={status === 'sending'}
                style={{ ...btnPrimary, border: 'none', cursor: 'pointer', textAlign: 'center', opacity: status === 'sending' ? 0.6 : 1 }}
                onMouseEnter={e => { if (status !== 'sending') e.currentTarget.style.opacity = '0.88' }}
                onMouseLeave={e => { if (status !== 'sending') e.currentTarget.style.opacity = '1' }}
              >
                {status === 'sending' ? 'Sending…' : 'Send Message'}
              </button>
            </form>
            )}
          </div>
        </div>
      </section>
    </>
  )
}
