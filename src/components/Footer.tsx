import { Link } from 'react-router-dom'

const BOOK_URL = 'https://book.studio-808.com'

export default function Footer() {
  return (
    <footer style={{ background: '#080808', borderTop: '1px solid rgba(240,237,232,0.08)', padding: '64px 24px 40px' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '48px', marginBottom: '48px' }}>
          {/* Brand */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <div style={{ width: '36px', height: '36px', background: '#e8355a', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontFamily: '"DM Serif Display", serif', color: '#fff', fontSize: '16px' }}>8</span>
              </div>
              <span style={{ fontFamily: '"DM Serif Display", serif', fontSize: '20px', color: '#f0ede8' }}>Studio 808</span>
            </div>
            <p style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '14px', color: 'rgba(240,237,232,0.5)', lineHeight: 1.6, margin: 0 }}>
              Chelmsford's creative hub for DJs, producers, podcasters and content creators since 2014.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '11px', fontWeight: 600, color: 'rgba(240,237,232,0.4)', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 16px' }}>Studios</h4>
            {[
              { to: '/studios', label: 'All Studios' },
              { to: '/dj-studio', label: 'DJ Studios' },
              { to: '/main-production-studio', label: 'Production Studio' },
              { to: '/podcast-studio', label: 'Podcast Studio' },
            ].map(({ to, label }) => (
              <Link key={to} to={to} style={{ display: 'block', fontFamily: '"DM Sans", sans-serif', fontSize: '14px', color: 'rgba(240,237,232,0.6)', textDecoration: 'none', marginBottom: '10px' }}>{label}</Link>
            ))}
          </div>

          {/* Pages */}
          <div>
            <h4 style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '11px', fontWeight: 600, color: 'rgba(240,237,232,0.4)', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 16px' }}>Company</h4>
            {[
              { to: '/about-us', label: 'About Us' },
              { to: '/blog', label: 'Blog' },
              { to: '/contact', label: 'Contact' },
            ].map(({ to, label }) => (
              <Link key={to} to={to} style={{ display: 'block', fontFamily: '"DM Sans", sans-serif', fontSize: '14px', color: 'rgba(240,237,232,0.6)', textDecoration: 'none', marginBottom: '10px' }}>{label}</Link>
            ))}
            <a href={BOOK_URL} target="_blank" rel="noopener noreferrer" style={{ display: 'block', fontFamily: '"DM Sans", sans-serif', fontSize: '14px', color: '#e8355a', textDecoration: 'none', fontWeight: 600 }}>Book Online →</a>
          </div>

          {/* Contact */}
          <div>
            <h4 style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '11px', fontWeight: 600, color: 'rgba(240,237,232,0.4)', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 16px' }}>Contact</h4>
            <p style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '14px', color: 'rgba(240,237,232,0.6)', margin: '0 0 8px', lineHeight: 1.5 }}>
              Unit 11–11A Robjohns House<br />
              Navigation Road<br />
              Chelmsford, CM2 6ND
            </p>
            <a href="mailto:info@studio-808.com" style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '14px', color: 'rgba(240,237,232,0.6)', textDecoration: 'none', display: 'block', marginBottom: '8px' }}>info@studio-808.com</a>
            <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
              {[
                { href: 'https://instagram.com/studio808chlm', label: 'Instagram' },
                { href: 'https://facebook.com/studio808chelmsford', label: 'Facebook' },
              ].map(({ href, label }) => (
                <a key={href} href={href} target="_blank" rel="noopener noreferrer" style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '13px', color: 'rgba(240,237,232,0.5)', textDecoration: 'none', border: '1px solid rgba(240,237,232,0.12)', borderRadius: '6px', padding: '6px 12px' }}>{label}</a>
              ))}
            </div>
          </div>
        </div>

        <div style={{ borderTop: '1px solid rgba(240,237,232,0.08)', paddingTop: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <p style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '13px', color: 'rgba(240,237,232,0.3)', margin: 0 }}>
            © {new Date().getFullYear()} Studio 808 Ltd. All rights reserved.
          </p>
          <p style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '13px', color: 'rgba(240,237,232,0.3)', margin: 0 }}>
            Unit 11–11A Robjohns House, Navigation Road, Chelmsford CM2 6ND
          </p>
        </div>
      </div>
    </footer>
  )
}
