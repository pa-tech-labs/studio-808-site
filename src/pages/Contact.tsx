import { useState } from 'react'
import SEO from '../components/SEO'

const BOOK_URL = 'https://book.studio-808.com'

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', message: '' })

  return (
    <>
      <SEO
        title="Contact Studio 808 | Chelmsford Music Studios"
        description="Get in touch with Studio 808. Email info@studio-808.com or book a studio online. Unit 11–11A Robjohns House, Navigation Road, Chelmsford CM2 6ND."
        canonical="/contact"
      />

      <section style={{ padding: '72px 24px 60px', borderBottom: '1px solid rgba(240,237,232,0.06)' }}>
        <div style={{ maxWidth: '760px' }}>
          <span style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '12px', fontWeight: 600, color: '#e8355a', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Get in touch</span>
          <h1 style={{ fontFamily: '"DM Serif Display", serif', fontSize: 'clamp(32px, 5vw, 52px)', color: '#f0ede8', margin: '12px 0 20px', fontWeight: 400 }}>Contact Us</h1>
          <p style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '17px', color: 'rgba(240,237,232,0.55)', margin: 0, lineHeight: 1.65 }}>
            Questions about our studios, equipment or services? Get in touch and we'll get back to you as soon as possible.
          </p>
        </div>
      </section>

      <section style={{ padding: '80px 24px' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '56px' }}>
          {/* Contact details */}
          <div>
            <h2 style={{ fontFamily: '"DM Serif Display", serif', fontSize: '26px', color: '#f0ede8', margin: '0 0 28px', fontWeight: 400 }}>Details</h2>
            {[
              { label: 'Email', value: 'info@studio-808.com', href: 'mailto:info@studio-808.com' },
              { label: 'Book Online', value: 'book.studio-808.com', href: BOOK_URL },
            ].map(({ label, value, href }) => (
              <div key={label} style={{ marginBottom: '24px' }}>
                <p style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '11px', fontWeight: 600, color: 'rgba(240,237,232,0.35)', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 6px' }}>{label}</p>
                <a href={href} target={href.startsWith('http') ? '_blank' : undefined} rel="noopener noreferrer" style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '15px', color: '#e8355a', textDecoration: 'none' }}>{value}</a>
              </div>
            ))}
            <div style={{ marginBottom: '32px' }}>
              <p style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '11px', fontWeight: 600, color: 'rgba(240,237,232,0.35)', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 6px' }}>Address</p>
              <p style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '15px', color: 'rgba(240,237,232,0.7)', margin: 0, lineHeight: 1.7 }}>
                Studio 808 Ltd<br />
                Unit 11–11A Robjohns House<br />
                Navigation Road<br />
                Chelmsford, CM2 6ND
              </p>
            </div>
            <a href={BOOK_URL} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-block', background: '#e8355a', color: '#fff', textDecoration: 'none', fontFamily: '"DM Sans", sans-serif', fontSize: '15px', fontWeight: 600, padding: '13px 28px', borderRadius: '8px' }}>
              Book a Studio Online
            </a>
          </div>

          {/* Contact form */}
          <div>
            <h2 style={{ fontFamily: '"DM Serif Display", serif', fontSize: '26px', color: '#f0ede8', margin: '0 0 28px', fontWeight: 400 }}>Send a Message</h2>
            <form
              action={`mailto:info@studio-808.com?subject=Enquiry from ${encodeURIComponent(form.name)}&body=${encodeURIComponent(form.message)}%0A%0AFrom: ${encodeURIComponent(form.name)}%0AEmail: ${encodeURIComponent(form.email)}`}
              method="get"
              encType="text/plain"
              style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}
            >
              {[
                { id: 'name', label: 'Your Name', type: 'text', placeholder: 'Full name' },
                { id: 'email', label: 'Email Address', type: 'email', placeholder: 'you@example.com' },
              ].map(({ id, label, type, placeholder }) => (
                <div key={id}>
                  <label htmlFor={id} style={{ display: 'block', fontFamily: '"DM Sans", sans-serif', fontSize: '13px', fontWeight: 500, color: '#f0ede8', marginBottom: '6px' }}>{label}</label>
                  <input
                    id={id}
                    type={type}
                    placeholder={placeholder}
                    value={form[id as 'name' | 'email']}
                    onChange={e => setForm(f => ({ ...f, [id]: e.target.value }))}
                    style={{ width: '100%', height: '44px', background: '#111111', border: '1px solid rgba(240,237,232,0.12)', borderRadius: '8px', padding: '0 14px', fontFamily: '"DM Sans", sans-serif', fontSize: '14px', color: '#f0ede8', outline: 'none', boxSizing: 'border-box' }}
                  />
                </div>
              ))}
              <div>
                <label htmlFor="message" style={{ display: 'block', fontFamily: '"DM Sans", sans-serif', fontSize: '13px', fontWeight: 500, color: '#f0ede8', marginBottom: '6px' }}>Message</label>
                <textarea
                  id="message"
                  placeholder="How can we help?"
                  rows={5}
                  value={form.message}
                  onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                  style={{ width: '100%', background: '#111111', border: '1px solid rgba(240,237,232,0.12)', borderRadius: '8px', padding: '12px 14px', fontFamily: '"DM Sans", sans-serif', fontSize: '14px', color: '#f0ede8', outline: 'none', resize: 'vertical', boxSizing: 'border-box', lineHeight: 1.5 }}
                />
              </div>
              <button
                type="submit"
                style={{ background: '#e8355a', color: '#fff', fontFamily: '"DM Sans", sans-serif', fontSize: '15px', fontWeight: 600, padding: '13px', borderRadius: '8px', border: 'none', cursor: 'pointer' }}
              >
                Send Message
              </button>
              <p style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '12px', color: 'rgba(240,237,232,0.35)', margin: 0 }}>
                This will open your email client. Alternatively, email us directly at info@studio-808.com
              </p>
            </form>
          </div>
        </div>
      </section>
    </>
  )
}
