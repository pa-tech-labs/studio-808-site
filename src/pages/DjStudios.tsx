import SEO from '../components/SEO'
import StudioCarousel from '../components/StudioCarousel'
import { BG, SURF, TEXT, MUTED, BORDER, F_BODY, ACCENT, sectionLabel, btnPrimary } from '../styles'

const BOOK_URL = 'https://book.studio-808.com'

const studios = [
  {
    id: 'studio-1',
    num: '01',
    name: 'Studio 1 — Performer',
    images: ['/images/studios/studio1-performer-1.jpg', '/images/studios/studio1-performer-2.jpg'],
    price: '£25/hr · 2hr min',
    capacity: 'Up to 8 people',
    desc: 'The most advanced standalone DJ setup available. The Pioneer AlphaTheta XDJ-AZ connects directly to Beatport Streaming, TIDAL and rekordbox cloud library — no laptop, no USB, just plug in and play. Ideal for DJs at any level who want a professional, self-contained practice environment.',
    equipment: [
      'Pioneer AlphaTheta XDJ-AZ (standalone)',
      '2× Adam T7V studio monitors',
      'Beatport / TIDAL / rekordbox streaming built-in',
      'No laptop required',
      'Air conditioning',
      'Wheelchair accessible',
    ],
    note: null,
  },
  {
    id: 'studio-2',
    num: '02',
    name: 'Studio 2 — Creator',
    images: ['/images/studios/studio2-creator-1.jpg', '/images/studios/studio2-creator-2.jpg'],
    price: '£35/hr · 2hr min',
    capacity: 'Up to 4 people',
    desc: "Chelmsford's most versatile room. Studio 2 bridges the gap between DJing and music production — use it for DJ practice, beat-making, recording vocals, or all three in the same session. Bring your laptop and connect seamlessly to the studio's interface and monitors.",
    equipment: [
      'Pioneer DDJ-RX3 DJ controller',
      'Yamaha HS8 studio monitors (production desk)',
      'KRK Rokit RP5 G5 (DJ booth)',
      'NI Komplete Kontrol M32 keyboard',
      'Rode NT1 condenser microphone',
      'Focusrite Scarlett 4i4 audio interface',
      '2× Beyerdynamic DT 770 headphones',
      'Asus ProArt display monitor',
    ],
    note: 'Bring your own laptop. DAW not provided.',
  },
  {
    id: 'studio-3',
    num: '03',
    name: 'Studio 3 — Pro DJ',
    images: ['/images/studios/studio3-prodj-1.jpg', '/images/studios/studio3-prodj-2.jpg'],
    price: '£35/hr · 2hr min',
    capacity: 'Up to 8 people',
    desc: "Essex's definitive club-standard DJ booth. The same setup you'll find in Fabric, Printworks and festival back-stages — CDJ-3000 multis, DJM-A9, Technics 1210s and a full RMX-1000 effects unit. Whether you're preparing for a gig, recording a mix or shooting content, Studio 3 has everything in one room.",
    equipment: [
      '2× Pioneer CDJ-3000 media players',
      '1× Pioneer CDJ-2000 NXS media player',
      'Pioneer DJM-A9 mixer',
      'Pioneer RMX-1000 remix station',
      '2× Technics SL-1210 MK2 turntables',
      '2× Pioneer VM-80 monitors',
      'Shure SM58 vocal microphone',
      'In-room computer for audio capture',
      '4K camera for content recording',
      'Air conditioning',
    ],
    note: 'Styluses are not provided — please bring your own if using vinyl.',
  },
]

export default function DjStudios() {
  return (
    <>
      <SEO
        title="DJ Studios Chelmsford | Studio 808 — From £25/hr"
        description="Three professional DJ studios in Chelmsford from £25/hr. Pioneer CDJ-3000s, DJM-A9, XDJ-AZ, Technics 1210s. 2-hour minimum booking. Book online."
        canonical="/dj-studio"
        image="/images/studios/studio3-prodj-1.jpg"
      />

      {/* Page header */}
      <section style={{ paddingTop: '152px', paddingBottom: '80px', paddingLeft: '24px', paddingRight: '24px', borderBottom: `1px solid ${BORDER}` }}>
        <div style={{ maxWidth: '1240px', margin: '0 auto' }}>
          <span style={sectionLabel}>DJ Studios</span>
          <h1 className="mh" style={{ fontSize: 'clamp(36px, 5.5vw, 64px)', color: TEXT, margin: '0 0 20px', lineHeight: 1.05, letterSpacing: '-0.02em', maxWidth: '700px' }}>
            Three Rooms. <em>One Standard.</em>
          </h1>
          <p style={{ fontFamily: F_BODY, fontSize: '17px', color: MUTED, margin: 0, lineHeight: 1.65, maxWidth: '540px' }}>
            From beginner to touring DJ — Studio 808 has the right room for your session. All three DJ studios are available to book online by the hour, with a 2-hour minimum.
          </p>
        </div>
      </section>

      {/* Studio sections */}
      {studios.map((s, idx) => (
        <section
          key={s.id}
          className="section"
          style={{ borderBottom: `1px solid ${BORDER}`, background: idx % 2 === 1 ? SURF : BG }}
        >
          <div style={{ maxWidth: '1240px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '60px', alignItems: 'start' }}>
            {/* Image */}
            <StudioCarousel images={s.images} alt={`${s.name} DJ studio at Studio 808, Chelmsford`} />
            {/* Content */}
            <div>
              <span style={{ fontFamily: F_BODY, fontSize: '11px', fontWeight: 700, color: ACCENT, textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: '12px' }}>
                Studio {s.num}
              </span>
              <h2 className="mh" style={{ fontSize: 'clamp(28px, 4vw, 40px)', color: TEXT, margin: '0 0 12px', letterSpacing: '-0.02em', lineHeight: 1.1 }}>
                {s.name.split(' — ')[0]} — <em>{s.name.split(' — ')[1]}</em>
              </h2>
              <div style={{ display: 'flex', gap: '14px', alignItems: 'center', marginBottom: '24px' }}>
                <span style={{ fontFamily: F_BODY, fontSize: '15px', color: ACCENT, fontWeight: 700 }}>{s.price}</span>
                <span style={{ color: BORDER, fontSize: '16px' }}>·</span>
                <span style={{ fontFamily: F_BODY, fontSize: '14px', color: MUTED }}>{s.capacity}</span>
              </div>
              <p style={{ fontFamily: F_BODY, fontSize: '15px', color: MUTED, lineHeight: 1.7, margin: '0 0 28px' }}>{s.desc}</p>
              <p style={{ fontFamily: F_BODY, fontSize: '11px', fontWeight: 600, color: 'rgba(240,237,232,0.3)', textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 14px' }}>Equipment</p>
              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 24px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {s.equipment.map(item => (
                  <li key={item} style={{ fontFamily: F_BODY, fontSize: '14px', color: 'rgba(240,237,232,0.7)', display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                    <span style={{ color: ACCENT, fontSize: '8px', flexShrink: 0, marginTop: '5px' }}>●</span> {item}
                  </li>
                ))}
              </ul>
              {s.note && (
                <div style={{ background: 'rgba(232,53,90,0.07)', border: '1px solid rgba(232,53,90,0.18)', borderRadius: '10px', padding: '12px 16px', marginBottom: '28px' }}>
                  <p style={{ fontFamily: F_BODY, fontSize: '13px', color: 'rgba(240,237,232,0.6)', margin: 0 }}>⚠ {s.note}</p>
                </div>
              )}
              <a href={BOOK_URL}
                style={btnPrimary}
                onMouseEnter={e => (e.currentTarget.style.opacity = '0.88')}
                onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
              >
                Book {s.name.split(' — ')[0]}
              </a>
            </div>
          </div>
        </section>
      ))}
    </>
  )
}
