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

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', message: '' })

  return (
    <>
      <SEO
        title="Contact Studio 808 | Chelmsford Music Studios"
        description="Get in touch with Studio 808. Email info@studio-808.com or book a studio online. Unit 11–11A Robjohns House, Navigation Road, Chelmsford CM2 6ND."
        canonical="/contact"
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
            <a href={BOOK_URL} target="_blank" rel="noopener noreferrer"
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
            <form
              action={`mailto:info@studio-808.com?subject=Enquiry from ${encodeURIComponent(form.name)}&body=${encodeURIComponent(form.message)}%0A%0AFrom: ${encodeURIComponent(form.name)}%0AEmail: ${encodeURIComponent(form.email)}`}
              method="get"
              encType="text/plain"
              style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}
            >
              {[
                { id: 'name', label: 'Your Name', type: 'text', placeholder: 'Full name' },
                { id: 'email', label: 'Email Address', type: 'email', placeholder: 'you@example.com' },
              ].map(({ id, label, type, placeholder }) => (
                <div key={id}>
                  <label htmlFor={id} style={{ display: 'block', fontFamily: F_BODY, fontSize: '13px', fontWeight: 500, color: TEXT, marginBottom: '8px' }}>{label}</label>
                  <input
                    id={id}
                    type={type}
                    placeholder={placeholder}
                    value={form[id as 'name' | 'email']}
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
              <button
                type="submit"
                style={{ ...btnPrimary, border: 'none', cursor: 'pointer', textAlign: 'center' }}
                onMouseEnter={e => (e.currentTarget.style.opacity = '0.88')}
                onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
              >
                Send Message
              </button>
              <p style={{ fontFamily: F_BODY, fontSize: '12px', color: 'rgba(240,237,232,0.3)', margin: 0 }}>
                This will open your email client. Alternatively, email us directly at info@studio-808.com
              </p>
            </form>
          </div>
        </div>
      </section>
    </>
  )
}
