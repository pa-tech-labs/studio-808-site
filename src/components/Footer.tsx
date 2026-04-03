import { Link } from 'react-router-dom'
import { BG, TEXT, MUTED, BORDER, F_HEAD, F_BODY, ACCENT } from '../styles'

const BOOK_URL = 'https://book.studio-808.com'

export default function Footer() {
  return (
    <footer style={{ background: BG, borderTop: `1px solid ${BORDER}`, padding: '80px 24px 40px' }}>
      <div style={{ maxWidth: '1240px', margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '48px', marginBottom: '64px' }}>

          {/* Brand */}
          <div style={{ gridColumn: 'span 1' }}>
            <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
              <div style={{ width: '34px', height: '34px', background: ACCENT, borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <span style={{ fontFamily: F_HEAD, color: '#fff', fontSize: '16px' }}>8</span>
              </div>
              <span style={{ fontFamily: F_HEAD, fontSize: '19px', color: TEXT }}>Studio 808</span>
            </Link>
            <p style={{ fontFamily: F_BODY, fontSize: '14px', color: MUTED, lineHeight: 1.65, margin: '0 0 24px', maxWidth: '240px' }}>
              Chelmsford's creative hub for DJs, producers and content creators. Est. 2014.
            </p>
            <div style={{ display: 'flex', gap: '10px' }}>
              {[
                { href: 'https://instagram.com/studio808chlm',      label: 'Instagram' },
                { href: 'https://facebook.com/studio808chelmsford',  label: 'Facebook' },
              ].map(({ href, label }) => (
                <a
                  key={href}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    fontFamily: F_BODY, fontSize: '12px', color: MUTED,
                    textDecoration: 'none',
                    border: '1px solid rgba(240,237,232,0.14)',
                    borderRadius: '999px', padding: '6px 14px',
                    transition: 'border-color 0.15s, color 0.15s',
                  }}
                >
                  {label}
                </a>
              ))}
            </div>
          </div>

          {/* Studios links */}
          <div>
            <p style={{ fontFamily: F_BODY, fontSize: '11px', fontWeight: 600, color: 'rgba(240,237,232,0.3)', textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 20px' }}>Studios</p>
            {[
              { to: '/dj-studio',              label: 'DJ Studios' },
              { to: '/main-production-studio', label: 'Production Studio' },
              { to: '/podcast-studio',         label: 'Podcast Studio' },
            ].map(({ to, label }) => (
              <Link key={to} to={to} style={{ display: 'block', fontFamily: F_BODY, fontSize: '14px', color: 'rgba(240,237,232,0.55)', textDecoration: 'none', marginBottom: '12px', transition: 'color 0.15s' }}>{label}</Link>
            ))}
          </div>

          {/* Company links */}
          <div>
            <p style={{ fontFamily: F_BODY, fontSize: '11px', fontWeight: 600, color: 'rgba(240,237,232,0.3)', textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 20px' }}>Company</p>
            {[
              { to: '/about-us', label: 'About Us' },
              { to: '/blog',     label: 'Blog' },
              { to: '/contact',  label: 'Contact' },
            ].map(({ to, label }) => (
              <Link key={to} to={to} style={{ display: 'block', fontFamily: F_BODY, fontSize: '14px', color: 'rgba(240,237,232,0.55)', textDecoration: 'none', marginBottom: '12px' }}>{label}</Link>
            ))}
            <a
              href={BOOK_URL}
              target="_blank"
              rel="noopener noreferrer"
              style={{ display: 'inline-block', fontFamily: F_BODY, fontSize: '13px', fontWeight: 600, color: TEXT, textDecoration: 'none', background: 'rgba(240,237,232,0.08)', border: '1px solid rgba(240,237,232,0.12)', borderRadius: '999px', padding: '8px 16px', marginTop: '4px' }}
            >
              Book Online →
            </a>
          </div>

          {/* Contact */}
          <div>
            <p style={{ fontFamily: F_BODY, fontSize: '11px', fontWeight: 600, color: 'rgba(240,237,232,0.3)', textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 20px' }}>Contact</p>
            <p style={{ fontFamily: F_BODY, fontSize: '14px', color: 'rgba(240,237,232,0.55)', margin: '0 0 12px', lineHeight: 1.6 }}>
              Unit 11–11A Robjohns House<br />
              Navigation Road<br />
              Chelmsford, CM2 6ND
            </p>
            <a href="mailto:info@studio-808.com" style={{ fontFamily: F_BODY, fontSize: '14px', color: 'rgba(240,237,232,0.55)', textDecoration: 'none', display: 'block' }}>
              info@studio-808.com
            </a>
          </div>
        </div>

        {/* Bottom bar */}
        <div style={{ borderTop: `1px solid ${BORDER}`, paddingTop: '28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <p style={{ fontFamily: F_BODY, fontSize: '13px', color: 'rgba(240,237,232,0.25)', margin: 0 }}>
            © {new Date().getFullYear()} Studio 808 Ltd. All rights reserved.
          </p>
          <p style={{ fontFamily: F_BODY, fontSize: '13px', color: 'rgba(240,237,232,0.25)', margin: 0 }}>
            Navigation Road, Chelmsford CM2 6ND
          </p>
        </div>
      </div>
    </footer>
  )
}
