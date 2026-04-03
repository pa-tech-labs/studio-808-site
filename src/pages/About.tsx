import SEO from '../components/SEO'
import { BG, SURF, TEXT, MUTED, BORDER, F_BODY, ACCENT, sectionLabel, btnPrimary } from '../styles'

const BOOK_URL = 'https://book.studio-808.com'

const stats = [
  { value: '2014', label: 'Est.' },
  { value: '4', label: 'Studios' },
  { value: '10k+', label: 'Sessions booked' },
  { value: '5 min', label: 'From station' },
]

export default function About() {
  return (
    <>
      <SEO
        title="About Studio 808 | Chelmsford's Creative Hub Since 2014"
        description="Studio 808 was founded in 2014 with a simple mission: make everyone feel welcome. Chelmsford's home for DJs, producers, podcasters and content creators."
        canonical="/about-us"
      />

      {/* Page header */}
      <section style={{ paddingTop: '152px', paddingBottom: '80px', paddingLeft: '24px', paddingRight: '24px', borderBottom: `1px solid ${BORDER}` }}>
        <div style={{ maxWidth: '1240px', margin: '0 auto' }}>
          <span style={sectionLabel}>Our Story</span>
          <h1 className="mh" style={{ fontSize: 'clamp(36px, 5.5vw, 64px)', color: TEXT, margin: '0 0 20px', lineHeight: 1.05, letterSpacing: '-0.02em', maxWidth: '700px' }}>
            A Decade of <em>Creative Spaces.</em>
          </h1>
          <p style={{ fontFamily: F_BODY, fontSize: '17px', color: MUTED, margin: 0, lineHeight: 1.65, maxWidth: '540px' }}>
            Founded in 2014, Studio 808 has been Chelmsford's home for DJs, producers, podcasters and content creators for over ten years.
          </p>
        </div>
      </section>

      {/* Stats band */}
      <section style={{ background: SURF, borderBottom: `1px solid ${BORDER}`, padding: '48px 24px' }}>
        <div style={{ maxWidth: '1240px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '32px', textAlign: 'center' }}>
          {stats.map(({ value, label }) => (
            <div key={label}>
              <p style={{ fontFamily: '"DM Serif Display", Georgia, serif', fontSize: 'clamp(32px, 4vw, 48px)', color: TEXT, margin: '0 0 6px', fontWeight: 400, lineHeight: 1 }}>{value}</p>
              <p style={{ fontFamily: F_BODY, fontSize: '13px', color: MUTED, margin: 0, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Story section */}
      <section className="section" style={{ background: BG, borderBottom: `1px solid ${BORDER}` }}>
        <div style={{ maxWidth: '1240px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '60px', alignItems: 'center' }}>
          {/* Image */}
          <div style={{ borderRadius: '16px', overflow: 'hidden', aspectRatio: '4/3', background: 'rgba(240,237,232,0.04)', border: `1px solid ${BORDER}` }}>
            <img src="/images/studios/studio3-prodj-2.jpg" alt="Studio 808 Chelmsford — reception and studio entrance" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
          </div>
          {/* Text */}
          <div>
            <span style={sectionLabel}>Who we are</span>
            <h2 className="mh" style={{ fontSize: 'clamp(28px, 4vw, 44px)', color: TEXT, margin: '0 0 24px', letterSpacing: '-0.02em', lineHeight: 1.1 }}>
              Everyone's <em>Welcome Here.</em>
            </h2>
            <p style={{ fontFamily: F_BODY, fontSize: '15px', color: MUTED, lineHeight: 1.75, margin: '0 0 16px' }}>
              Studio 808 was built on a simple idea: that professional creative spaces shouldn't be exclusive to the few. Whether you're picking up decks for the first time, recording your debut EP or building a podcast audience — you belong here.
            </p>
            <p style={{ fontFamily: F_BODY, fontSize: '15px', color: MUTED, lineHeight: 1.75, margin: '0 0 16px' }}>
              Over the past decade, thousands of artists, producers, DJs and creators have used Studio 808 to develop their craft. Many of them are now touring DJs, signed artists and successful content creators.
            </p>
            <p style={{ fontFamily: F_BODY, fontSize: '15px', color: MUTED, lineHeight: 1.75, margin: '0 0 36px' }}>
              We've invested continuously in the best equipment — Pioneer CDJ-3000s, Neve 1073, Neumann U87, Focal SM9 — so our members can practise and record with the same tools they'll encounter on the biggest stages.
            </p>
            <a href={BOOK_URL} target="_blank" rel="noopener noreferrer"
              style={btnPrimary}
              onMouseEnter={e => (e.currentTarget.style.opacity = '0.88')}
              onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
            >
              Book a Session
            </a>
          </div>
        </div>
      </section>

      {/* Location */}
      <section className="section" style={{ background: SURF, borderBottom: `1px solid ${BORDER}` }}>
        <div style={{ maxWidth: '1240px', margin: '0 auto', textAlign: 'center' }}>
          <span style={sectionLabel}>Location</span>
          <h2 className="mh" style={{ fontSize: 'clamp(28px, 4vw, 44px)', color: TEXT, margin: '0 0 48px', letterSpacing: '-0.02em', lineHeight: 1.1 }}>
            Find <em>Us.</em>
          </h2>
          <div style={{ maxWidth: '560px', margin: '0 auto', background: BG, border: `1px solid ${BORDER}`, borderRadius: '16px', padding: '36px' }}>
            <p style={{ fontFamily: F_BODY, fontSize: '16px', color: TEXT, fontWeight: 600, margin: '0 0 8px' }}>Studio 808 Ltd</p>
            <p style={{ fontFamily: F_BODY, fontSize: '15px', color: MUTED, margin: '0 0 20px', lineHeight: 1.7 }}>
              Unit 11–11A Robjohns House<br />
              Navigation Road<br />
              Chelmsford, CM2 6ND
            </p>
            <a href="mailto:info@studio-808.com" style={{ fontFamily: F_BODY, fontSize: '15px', color: ACCENT, textDecoration: 'none', fontWeight: 500, display: 'block', marginBottom: '24px' }}>
              info@studio-808.com
            </a>
            <p style={{ fontFamily: F_BODY, fontSize: '14px', color: 'rgba(240,237,232,0.4)', margin: 0, lineHeight: 1.6 }}>
              Five minutes walk from Chelmsford railway station. Street parking available on Navigation Road and nearby Springfield Road.
            </p>
          </div>
        </div>
      </section>
    </>
  )
}
