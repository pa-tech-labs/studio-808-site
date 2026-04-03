import { Link } from 'react-router-dom'
import SEO from '../components/SEO'

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
    desc: 'Chelmsford\'s most versatile studio. Switch between DJing and production without moving rooms — ideal for producers who also play live sets.',
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

      {/* Header */}
      <section style={{ padding: '72px 24px 60px', textAlign: 'center', borderBottom: '1px solid rgba(240,237,232,0.06)' }}>
        <div style={{ maxWidth: '640px', margin: '0 auto' }}>
          <h1 style={{ fontFamily: '"DM Serif Display", serif', fontSize: 'clamp(32px, 5vw, 52px)', color: '#f0ede8', margin: '0 0 16px', fontWeight: 400 }}>Our Studios</h1>
          <p style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '17px', color: 'rgba(240,237,232,0.55)', margin: '0 0 32px', lineHeight: 1.6 }}>
            Four fully-equipped studios, one location. From solo DJ practice to full band recording — we have a room for every creative need.
          </p>
          <a href={BOOK_URL} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-block', background: '#e8355a', color: '#fff', textDecoration: 'none', fontFamily: '"DM Sans", sans-serif', fontSize: '15px', fontWeight: 600, padding: '13px 28px', borderRadius: '8px' }}>
            Book Online
          </a>
        </div>
      </section>

      {/* Studio cards */}
      <section style={{ padding: '64px 24px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '32px' }}>
          {studios.map((s, idx) => (
            <div key={s.id} style={{ background: '#111111', border: '1px solid rgba(240,237,232,0.08)', borderRadius: '12px', overflow: 'hidden', display: 'grid', gridTemplateColumns: idx % 2 === 0 ? '1fr 1.4fr' : '1.4fr 1fr' }}>
              <div style={{ background: 'rgba(240,237,232,0.04)', minHeight: '320px', display: 'flex', alignItems: 'center', justifyContent: 'center', order: idx % 2 === 0 ? 0 : 1 }}>
                <img src="" alt={`${s.name} — ${s.subtitle} at Studio 808 Chelmsford`} style={{ width: '100%', height: '100%', objectFit: 'cover', minHeight: '320px' }} />
              </div>
              <div style={{ padding: '40px', order: idx % 2 === 0 ? 1 : 0 }}>
                <div style={{ marginBottom: '8px' }}>
                  <span style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '12px', fontWeight: 600, color: '#e8355a', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{s.subtitle}</span>
                </div>
                <h2 style={{ fontFamily: '"DM Serif Display", serif', fontSize: '28px', color: '#f0ede8', margin: '0 0 6px', fontWeight: 400 }}>{s.name}</h2>
                <div style={{ display: 'flex', gap: '16px', marginBottom: '20px' }}>
                  <span style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '14px', color: '#e8355a', fontWeight: 600 }}>{s.price}</span>
                  <span style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '14px', color: 'rgba(240,237,232,0.4)' }}>·</span>
                  <span style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '14px', color: 'rgba(240,237,232,0.5)' }}>{s.capacity}</span>
                </div>
                <p style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '15px', color: 'rgba(240,237,232,0.6)', lineHeight: 1.65, margin: '0 0 24px' }}>{s.desc}</p>
                <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 28px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {s.highlights.map(h => (
                    <li key={h} style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '13px', color: 'rgba(240,237,232,0.65)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ color: '#e8355a', fontSize: '10px' }}>●</span> {h}
                    </li>
                  ))}
                </ul>
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                  <a href={BOOK_URL} target="_blank" rel="noopener noreferrer" style={{ background: '#e8355a', color: '#fff', textDecoration: 'none', fontFamily: '"DM Sans", sans-serif', fontSize: '14px', fontWeight: 600, padding: '11px 24px', borderRadius: '8px' }}>
                    Book Now
                  </a>
                  <Link to={s.href} style={{ background: 'rgba(240,237,232,0.07)', color: '#f0ede8', textDecoration: 'none', fontFamily: '"DM Sans", sans-serif', fontSize: '14px', fontWeight: 500, padding: '11px 24px', borderRadius: '8px', border: '1px solid rgba(240,237,232,0.1)' }}>
                    Full Details
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  )
}
