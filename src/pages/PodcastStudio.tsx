import SEO from '../components/SEO'
import { BG, SURF, TEXT, MUTED, BORDER, F_BODY, ACCENT, sectionLabel, btnPrimary } from '../styles'

const PA_MEDIA_BOOK = 'https://pa-media-7049.lumentry.io/book'

const features = [
  'Professional podcast recording studio',
  'Multi-guest recording (remote and in-person)',
  'Podcast editing and post-production',
  'Video podcast recording',
  'Branded content creation',
  'Distribution and publishing support',
]

export default function PodcastStudio() {
  return (
    <>
      <SEO
        title="Podcast Studio Chelmsford | PA Media — Professional Podcast Recording"
        description="Professional podcast recording and production in Chelmsford. Studio 808's podcast services are now provided by PA Media — our sister company specialising in content creation."
        canonical="/podcast-studio"
      />

      {/* Page header */}
      <section style={{ paddingTop: '152px', paddingBottom: '80px', paddingLeft: '24px', paddingRight: '24px', borderBottom: `1px solid ${BORDER}` }}>
        <div style={{ maxWidth: '1240px', margin: '0 auto' }}>
          <span style={sectionLabel}>Podcast Studio</span>
          <h1 className="mh" style={{ fontSize: 'clamp(36px, 5.5vw, 64px)', color: TEXT, margin: '0 0 20px', lineHeight: 1.05, letterSpacing: '-0.02em', maxWidth: '700px' }}>
            Podcast Recording <em>in Chelmsford.</em>
          </h1>
          <p style={{ fontFamily: F_BODY, fontSize: '17px', color: MUTED, margin: 0, lineHeight: 1.65, maxWidth: '540px' }}>
            Studio 808 no longer offers podcast studio hire directly — but you're in good hands. Our sister company, PA Media, now handles all podcast and content creation bookings.
          </p>
        </div>
      </section>

      {/* Main content */}
      <section className="section" style={{ background: BG, borderBottom: `1px solid ${BORDER}` }}>
        <div style={{ maxWidth: '1240px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '60px', alignItems: 'start' }}>
          {/* Details */}
          <div>
            <div style={{ background: SURF, border: `1px solid ${BORDER}`, borderRadius: '12px', padding: '16px 20px', marginBottom: '32px', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontFamily: F_BODY, fontSize: '13px', fontWeight: 600, color: ACCENT }}>Introducing PA Media</span>
            </div>
            <h2 className="mh" style={{ fontSize: 'clamp(28px, 4vw, 44px)', color: TEXT, margin: '0 0 20px', letterSpacing: '-0.02em', lineHeight: 1.1 }}>
              Professional Podcast &amp; <em>Content Creation.</em>
            </h2>
            <p style={{ fontFamily: F_BODY, fontSize: '15px', color: MUTED, lineHeight: 1.7, margin: '0 0 16px' }}>
              PA Media is Studio 808's sister company, specialising in professional podcast recording, production and content creation. They offer the same Studio 808 standard of quality with a dedicated focus on spoken-word and video content.
            </p>
            <p style={{ fontFamily: F_BODY, fontSize: '15px', color: MUTED, lineHeight: 1.7, margin: '0 0 32px' }}>
              Whether you're launching your first podcast, recording a series or producing branded content for your business — PA Media has you covered.
            </p>
            <p style={{ fontFamily: F_BODY, fontSize: '11px', fontWeight: 600, color: 'rgba(240,237,232,0.3)', textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 14px' }}>What's included</p>
            <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 36px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {features.map(item => (
                <li key={item} style={{ fontFamily: F_BODY, fontSize: '14px', color: 'rgba(240,237,232,0.7)', display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                  <span style={{ color: ACCENT, fontSize: '8px', flexShrink: 0, marginTop: '5px' }}>●</span> {item}
                </li>
              ))}
            </ul>
            <a href={PA_MEDIA_BOOK} target="_blank" rel="noopener noreferrer"
              style={btnPrimary}
              onMouseEnter={e => (e.currentTarget.style.opacity = '0.88')}
              onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
            >
              Book with PA Media
            </a>
          </div>

          {/* Booking card */}
          <div style={{ background: SURF, border: `1px solid ${BORDER}`, borderRadius: '16px', padding: '40px 32px', textAlign: 'center' }}>
            <div style={{ width: '56px', height: '56px', background: ACCENT, borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', fontSize: '24px' }}>
              🎙
            </div>
            <h3 className="mh" style={{ fontSize: '24px', color: TEXT, margin: '0 0 12px', letterSpacing: '-0.01em' }}>
              Book a <em>Podcast Session.</em>
            </h3>
            <p style={{ fontFamily: F_BODY, fontSize: '14px', color: MUTED, margin: '0 0 28px', lineHeight: 1.6 }}>
              Book your podcast recording session directly with PA Media. Same-day bookings available.
            </p>
            <a href={PA_MEDIA_BOOK} target="_blank" rel="noopener noreferrer"
              style={{ ...btnPrimary, display: 'block', textAlign: 'center', marginBottom: '16px' }}
              onMouseEnter={e => (e.currentTarget.style.opacity = '0.88')}
              onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
            >
              Book Now with PA Media
            </a>
            <p style={{ fontFamily: F_BODY, fontSize: '12px', color: 'rgba(240,237,232,0.3)', margin: 0 }}>Powered by Lumentry booking</p>
          </div>
        </div>
      </section>
    </>
  )
}
