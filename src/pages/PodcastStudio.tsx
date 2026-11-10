import SEO from '../components/SEO'
import PhotoBackdrop, { type BackdropLayout } from '../components/PhotoBackdrop'
import PoweredByConsole from '../components/PoweredByConsole'
import './PodcastStudio.css'
import { BG, SURF, TEXT, MUTED, BORDER, F_BODY, ACCENT, sectionLabel, btnPrimary } from '../styles'

const PODYARD_URL = 'https://podyard.studio'

// Photo backdrops (components/PhotoBackdrop.tsx). The stops keep every block
// of copy at WCAG AA against the brightest pixel behind it at 1440, 390 and
// 320; the measurements are in the PR that added them. Move a stop, re-measure.

// Hero: the brick set. Wide: the photo sits right (mics and right sofa) and the
// left half fades to solid ground under the heading. Narrow: a band above the
// copy that fades down into it (band height lives in PodcastStudio.css).
// The narrow layout runs up to 1024px so the copy never shares a row with it.
const HERO_BACKDROP: { base: BackdropLayout; wide: BackdropLayout & { minWidth: number } } = {
  base: {
    focal: '80% 50%',
    height: 'var(--pod-hero-band)',
    fades: [{ direction: 'to bottom', stops: [[0, 0], ['56px', 0], [34, 0.5], [58, 0.5], [88, 0]] }],
  },
  wide: {
    minWidth: 1024,
    focal: '85% 58%',
    fades: [
      // Solid until the intro paragraph ends (24px gutter + 540px measure, or
      // 44% once the 1240px container centres), then up to half strength.
      { direction: 'to right', stops: [[0, 0], ['max(44%, 600px)', 0], ['max(76%, calc(600px + 26%))', 0.5], [100, 0.5]] },
      { direction: 'to bottom', stops: [[0, 0], [16, 0], [36, 1], [78, 1], [100, 0]] },
    ],
  },
}

// Introducing Podyard: the walnut set, full bleed. Wide: the TV and its logo
// sit in the middle track between the copy and the card, fading out on both
// sides. Narrow: a band above the card with the TV in it.
const INTRO_BACKDROP_WIDE: BackdropLayout & { minWidth: number } = {
  minWidth: 1100,
  focal: '50% 0%',
  fades: [
    { direction: 'to right', stops: [[0, 0], ['calc(50% - 200px)', 0], ['calc(50% - 60px)', 0.6], ['calc(50% + 60px)', 0.6], ['calc(50% + 260px)', 0], [100, 0]] },
    { direction: 'to bottom', stops: [[0, 0], [8, 1], [62, 1], [100, 0]] },
  ],
}
const INTRO_BACKDROP_BAND: BackdropLayout = {
  focal: '50% 30%',
  left: 'calc(50% - 50vw)',
  width: '100vw',
  height: 'calc(var(--pod-card-band) + 80px)',
  fades: [{ direction: 'to bottom', stops: [[0, 0], [14, 0.55], [58, 0.55], [84, 0]] }],
}

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
        title="Podcast Studio Chelmsford | Podyard | Professional Podcast Recording"
        description="Podcast recording in Chelmsford at Podyard, Studio 808's sister studio. Professional studio, editing, video podcasts and distribution support."
        canonical="/podcast-studio"
        image="/images/studios/studio4-production-1.jpg"
      />

      {/* Page header */}
      <section className="pod-hero" style={{ paddingBottom: '80px', paddingLeft: '24px', paddingRight: '24px', borderBottom: `1px solid ${BORDER}` }}>
        <PhotoBackdrop src="/podcast/brick" {...HERO_BACKDROP} />
        <div style={{ maxWidth: '1240px', margin: '0 auto' }}>
          <span style={sectionLabel}>Podcast Studio</span>
          <h1 className="mh" style={{ fontSize: 'clamp(36px, 5.5vw, 64px)', color: TEXT, margin: '0 0 20px', lineHeight: 1.05, letterSpacing: '-0.02em', maxWidth: '700px' }}>
            Podcast Recording <em>in Chelmsford.</em>
          </h1>
          <p style={{ fontFamily: F_BODY, fontSize: '17px', color: MUTED, margin: 0, lineHeight: 1.65, maxWidth: '540px' }}>
            Studio 808 no longer offers podcast studio hire directly, but you're in good hands. Our sister studio, Podyard, now handles all podcast and content creation bookings.
          </p>
        </div>
      </section>

      {/* Main content */}
      <section className="section pod-intro" style={{ background: BG, borderBottom: `1px solid ${BORDER}` }}>
        <PhotoBackdrop src="/podcast/walnut" base={{ hidden: true }} wide={INTRO_BACKDROP_WIDE} />
        <div className="pod-grid" style={{ maxWidth: '1240px', margin: '0 auto' }}>
          {/* Details */}
          <div className="pod-copy">
            <div style={{ background: BG, border: `1px solid ${BORDER}`, borderRadius: '12px', padding: '16px 20px', marginBottom: '32px', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontFamily: F_BODY, fontSize: '13px', fontWeight: 600, color: ACCENT }}>Introducing Podyard</span>
            </div>
            <h2 className="mh" style={{ fontSize: 'clamp(28px, 4vw, 44px)', color: TEXT, margin: '0 0 20px', letterSpacing: '-0.02em', lineHeight: 1.1 }}>
              Professional Podcast &amp; <em>Content Creation.</em>
            </h2>
            <p style={{ fontFamily: F_BODY, fontSize: '15px', color: MUTED, lineHeight: 1.7, margin: '0 0 16px' }}>
              Podyard is Studio 808's sister studio in Chelmsford, built for podcast recording, production and content creation. Same Studio 808 standard of quality, with a dedicated focus on spoken-word and video content.
            </p>
            <p style={{ fontFamily: F_BODY, fontSize: '15px', color: MUTED, lineHeight: 1.7, margin: '0 0 32px' }}>
              Whether you're launching your first podcast, recording a series or producing branded content for your business, Podyard has you covered.
            </p>
            <p style={{ fontFamily: F_BODY, fontSize: '11px', fontWeight: 600, color: MUTED, textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 14px' }}>What's included</p>
            <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 36px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {features.map(item => (
                <li key={item} style={{ fontFamily: F_BODY, fontSize: '14px', color: 'rgba(240,237,232,0.7)', display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                  <span style={{ color: ACCENT, fontSize: '8px', flexShrink: 0, marginTop: '5px' }}>●</span> {item}
                </li>
              ))}
            </ul>
            <a href={PODYARD_URL} target="_blank" rel="noopener noreferrer"
              style={btnPrimary}
              onMouseEnter={e => (e.currentTarget.style.opacity = '0.88')}
              onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
            >
              Book with Podyard
            </a>
          </div>

          {/* Booking card, with the walnut set as a band above it when stacked */}
          <div className="pod-card-wrap">
          <PhotoBackdrop src="/podcast/walnut" base={INTRO_BACKDROP_BAND} wide={{ minWidth: 1100, hidden: true }} />
          <div style={{ background: SURF, border: `1px solid ${BORDER}`, borderRadius: '16px', padding: '40px 32px', textAlign: 'center' }}>
            <div style={{ width: '56px', height: '56px', background: ACCENT, borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', fontSize: '24px' }}>
              🎙
            </div>
            <h3 className="mh" style={{ fontSize: '24px', color: TEXT, margin: '0 0 12px', letterSpacing: '-0.01em' }}>
              Book a <em>Podcast Session.</em>
            </h3>
            <p style={{ fontFamily: F_BODY, fontSize: '14px', color: MUTED, margin: '0 0 28px', lineHeight: 1.6 }}>
              Book your podcast recording session directly with Podyard.
            </p>
            <a href={PODYARD_URL} target="_blank" rel="noopener noreferrer"
              style={{ ...btnPrimary, display: 'block', textAlign: 'center', marginBottom: '16px' }}
              onMouseEnter={e => (e.currentTarget.style.opacity = '0.88')}
              onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
            >
              Book Now with Podyard
            </a>
            <PoweredByConsole />
          </div>
          </div>
        </div>
      </section>
    </>
  )
}
