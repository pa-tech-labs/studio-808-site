import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { BG, TEXT, MUTED, BORDER, F_BODY } from '../styles'
import { getSiteSettings, type SanitySettings } from '../lib/sanity'

const DEFAULT_SETTINGS: SanitySettings = {
  siteName: 'Studio 808',
  contactEmail: 'info@studio-808.com',
  phone: null,
  bookingUrl: 'https://book.studio-808.com',
  address: 'Unit 11–11A Robjohns House\nNavigation Road\nChelmsford, CM2 6ND',
  socialLinks: [
    { platform: 'Instagram', url: 'https://instagram.com/studio808chlm' },
    { platform: 'Facebook',  url: 'https://facebook.com/studio808chelmsford' },
  ],
}

export default function Footer() {
  const [settings, setSettings] = useState<SanitySettings>(DEFAULT_SETTINGS)

  useEffect(() => {
    getSiteSettings()
      .then(s => { if (s) setSettings(s) })
      .catch(() => { /* use defaults */ })
  }, [])

  const addressLines = settings.address?.split('\n') ?? []

  return (
    <footer style={{ background: BG, borderTop: `1px solid ${BORDER}`, padding: '80px 24px 40px' }}>
      <div style={{ maxWidth: '1240px', margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '48px', marginBottom: '64px' }}>

          {/* Brand */}
          <div style={{ gridColumn: 'span 1' }}>
            <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
              <img src="/images/logo.png" alt="Studio 808" style={{ height: '40px', width: 'auto' }} />
            </Link>
            <p style={{ fontFamily: F_BODY, fontSize: '14px', color: MUTED, lineHeight: 1.65, margin: '0 0 24px', maxWidth: '240px' }}>
              Chelmsford's creative hub for DJs, producers and content creators. Est. 2014.
            </p>
            <div style={{ display: 'flex', gap: '10px' }}>
              {settings.socialLinks.map(({ url, platform }) => (
                <a
                  key={url}
                  href={url}
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
                  {platform}
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
              href={settings.bookingUrl}
              style={{ display: 'inline-block', fontFamily: F_BODY, fontSize: '13px', fontWeight: 600, color: TEXT, textDecoration: 'none', background: 'rgba(240,237,232,0.08)', border: '1px solid rgba(240,237,232,0.12)', borderRadius: '999px', padding: '8px 16px', marginTop: '4px' }}
            >
              Book Online →
            </a>
          </div>

          {/* Contact */}
          <div>
            <p style={{ fontFamily: F_BODY, fontSize: '11px', fontWeight: 600, color: 'rgba(240,237,232,0.3)', textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 20px' }}>Contact</p>
            <p style={{ fontFamily: F_BODY, fontSize: '14px', color: 'rgba(240,237,232,0.55)', margin: '0 0 12px', lineHeight: 1.6 }}>
              {addressLines.map((line, i) => (
                <span key={i}>{line}{i < addressLines.length - 1 ? <br /> : null}</span>
              ))}
            </p>
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
