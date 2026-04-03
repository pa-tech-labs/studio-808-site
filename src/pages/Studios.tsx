import { Link } from 'react-router-dom'
import SEO from '../components/SEO'
import { BG, SURF, TEXT, MUTED, BORDER, F_BODY, ACCENT, sectionLabel, btnPrimary, btnSecondary } from '../styles'

const BOOK_URL = 'https://book.studio-808.com'

const studios = [
  {
    id: 'studio-1',
    name: 'Studio 1 — Performer',
    subtitle: 'DJ Studio',
    price: 'From £10/hr',
    capacity: 'Up to 8 people',
    href: '/dj-studio',
    highlights: ['Pioneer AlphaTheta XDJ-AZ', 'Streaming-ready (Beatport / TIDAL / rekordbox)', 'No laptop needed', 'Air conditioning', 'Wheelchair accessible'],
    desc: 'The ultimate self-contained DJ experience. The XDJ-AZ is the most advanced standalone controller Pioneer has ever made — streaming, USB and cloud library all in one unit.',
  },
  {
    id: 'studio-2',
    name: 'Studio 2 — Creator',
    subtitle: 'Hybrid DJ & Production',
    price: 'From £8/hr',
    capacity: 'Up to 4 people',
    href: '/dj-studio',
    highlights: ['Pioneer DDJ-RX3', 'Yamaha HS8 monitors (production desk)', 'KRK RP5 G5 (DJ booth)', 'Rode NT1 microphone', 'Focusrite Scarlett 4i4', 'NI Komplete Kontrol M32'],
    desc: "Chelmsford's most versatile studio. Switch between DJing and production without moving rooms — ideal for producers who also play live sets.",
  },
  {
    id: 'studio-3',
    name: 'Studio 3 — Pro DJ',
    subtitle: 'Club Booth',
    price: 'From £14/hr',
    capacity: 'Up to 8 people',
    href: '/dj-studio',
    highlights: ['2× CDJ-3000', 'CDJ-2000 NXS', 'DJM-A9 mixer', 'RMX-1000', '2× Technics 1210 MK2', '2× Pioneer VM-80 monitors', '4K camera for content', 'In-room computer for audio capture'],
    desc: "Essex's most advanced club-standard DJ booth. Vinyl, digital, and hybrid — this is the room touring DJs use to prepare for festival and club dates.",
  },
  {
    id: 'studio-4',
    name: 'Studio 4 — Pro Production',
    subtitle: 'Recording & Production Studio',
    price: 'From £60/hr',
    capacity: 'Up to 5 people',
    href: '/main-production-studio',
    highlights: ['Focal SM9 monitors', 'Neve 1073 preamp', 'UA Apollo 8x interface', 'Neumann U87 microphone', 'SPL Tube Vitalizer', 'Novation Summit & Korg Minilogue XD'],
    desc: 'A serious recording environment for serious artists. Available dry hire or with one of our experienced house engineers. Mixing and mastering services also available.',
  },
]

export default function Studios() {
  return (
    <>
      <SEO
        title="Studios | Studio 808 Chelmsford"
        description="Four professional music studios in Chelmsford — DJ studios from £8/hr, production studio from £60/hr. Pioneer CDJ-3000s, Neve 1073, Neumann U87. Book online."
        canonical="/studios"
      />

      {/* Page header */}
      <section style={{ paddingTop: '152px', paddingBottom: '80px', paddingLeft: '24px', paddingRight: '24px', borderBottom: `1px solid ${BORDER}`, textAlign: 'center' }}>
        <div style={{ maxWidth: '640px', margin: '0 auto' }}>
          <span style={sectionLabel}>Studios</span>
          <h1 className="mh" style={{ fontSize: 'clamp(36px, 5.5vw, 60px)', color: TEXT, margin: '0 0 20px', lineHeight: 1.05, letterSpacing: '-0.02em' }}>
            Our Studios. <em>Your craft.</em>
          </h1>
          <p style={{ fontFamily: F_BODY, fontSize: '17px', color: MUTED, margin: '0 0 36px', lineHeight: 1.65 }}>
            Four fully-equipped studios, one location. From solo DJ practice to full-band recording — we have a room for every creative need.
          </p>
          <a href={BOOK_URL} target="_blank" rel="noopener noreferrer"
            style={btnPrimary}
            onMouseEnter={e => (e.currentTarget.style.opacity = '0.88')}
            onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
          >
            Book Online
          </a>
        </div>
      </section>

      {/* Studio cards */}
      <section style={{ padding: '80px 24px', background: BG }}>
        <div style={{ maxWidth: '1240px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {studios.map((s, idx) => (
            <div
              key={s.id}
              style={{
                background: SURF,
                border: `1px solid ${BORDER}`,
                borderRadius: '16px',
                overflow: 'hidden',
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              }}
            >
              {/* Photo */}
              <div style={{
                background: 'rgba(240,237,232,0.03)',
                minHeight: '340px',
                overflow: 'hidden',
                order: idx % 2 === 0 ? 0 : 1,
              }}>
                <img
                  src=""
                  alt={`${s.name} — ${s.subtitle} at Studio 808 Chelmsford`}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', minHeight: '340px', display: 'block' }}
                />
              </div>
              {/* Content */}
              <div style={{ padding: '44px 40px', order: idx % 2 === 0 ? 1 : 0 }}>
                <span style={{ fontFamily: F_BODY, fontSize: '11px', fontWeight: 600, color: ACCENT, textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: '10px' }}>
                  {s.subtitle}
                </span>
                <h2 className="mh" style={{ fontSize: 'clamp(24px, 3vw, 32px)', color: TEXT, margin: '0 0 10px', letterSpacing: '-0.02em' }}>
                  {s.name}
                </h2>
                <div style={{ display: 'flex', gap: '14px', marginBottom: '20px', alignItems: 'center' }}>
                  <span style={{ fontFamily: F_BODY, fontSize: '14px', color: ACCENT, fontWeight: 700 }}>{s.price}</span>
                  <span style={{ color: BORDER, fontSize: '16px' }}>·</span>
                  <span style={{ fontFamily: F_BODY, fontSize: '14px', color: MUTED }}>{s.capacity}</span>
                </div>
                <p style={{ fontFamily: F_BODY, fontSize: '15px', color: MUTED, lineHeight: 1.7, margin: '0 0 24px' }}>{s.desc}</p>
                <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 32px', display: 'flex', flexDirection: 'column', gap: '7px' }}>
                  {s.highlights.map(h => (
                    <li key={h} style={{ fontFamily: F_BODY, fontSize: '13px', color: 'rgba(240,237,232,0.65)', display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                      <span style={{ color: ACCENT, fontSize: '8px', flexShrink: 0, marginTop: '5px' }}>●</span> {h}
                    </li>
                  ))}
                </ul>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  <a href={BOOK_URL} target="_blank" rel="noopener noreferrer"
                    style={btnPrimary}
                    onMouseEnter={e => (e.currentTarget.style.opacity = '0.88')}
                    onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
                  >
                    Book Now
                  </a>
                  <Link to={s.href} style={btnSecondary}>Full Details</Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  )
}
