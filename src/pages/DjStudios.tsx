import SEO from '../components/SEO'

const BOOK_URL = 'https://book.studio-808.com'

const studios = [
  {
    id: 'studio-1',
    name: 'Studio 1 — Performer',
    price: 'From £10/hr',
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
    name: 'Studio 2 — Creator',
    price: 'From £8/hr',
    capacity: 'Up to 4 people',
    desc: 'Chelmsford\'s most versatile room. Studio 2 bridges the gap between DJing and music production — use it for DJ practice, beat-making, recording vocals, or all three in the same session. Bring your laptop and connect seamlessly to the studio\'s interface and monitors.',
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
    name: 'Studio 3 — Pro DJ',
    price: 'From £14/hr',
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
        title="DJ Studios Chelmsford | Studio 808 — From £8/hr"
        description="Three professional DJ studios in Chelmsford from £8/hr. Pioneer CDJ-3000s, DJM-A9, XDJ-AZ, Technics 1210s. Book online — no deposit required."
        canonical="/dj-studio"
      />

      {/* Header */}
      <section style={{ padding: '72px 24px 60px', borderBottom: '1px solid rgba(240,237,232,0.06)' }}>
        <div style={{ maxWidth: '760px' }}>
          <span style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '12px', fontWeight: 600, color: '#e8355a', textTransform: 'uppercase', letterSpacing: '0.08em' }}>DJ Studios</span>
          <h1 style={{ fontFamily: '"DM Serif Display", serif', fontSize: 'clamp(32px, 5vw, 52px)', color: '#f0ede8', margin: '12px 0 20px', fontWeight: 400, lineHeight: 1.1 }}>Three Rooms,<br />One Standard</h1>
          <p style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '17px', color: 'rgba(240,237,232,0.55)', margin: 0, lineHeight: 1.65, maxWidth: '560px' }}>
            From beginner to touring DJ — Studio 808 has the right room for your session. All three DJ studios are available to book online by the hour, with no deposit required.
          </p>
        </div>
      </section>

      {/* Studio sections */}
      {studios.map((s, idx) => (
        <section key={s.id} style={{ padding: '80px 24px', borderBottom: '1px solid rgba(240,237,232,0.06)', background: idx % 2 === 1 ? '#111111' : '#080808' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '56px', alignItems: 'start' }}>
            {/* Image */}
            <div style={{ background: 'rgba(240,237,232,0.04)', border: '1px solid rgba(240,237,232,0.08)', borderRadius: '12px', height: '360px', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <img src="" alt={`${s.name} DJ studio at Studio 808, Chelmsford`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
            {/* Content */}
            <div>
              <span style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '12px', fontWeight: 600, color: '#e8355a', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Studio 0{idx + 1}</span>
              <h2 style={{ fontFamily: '"DM Serif Display", serif', fontSize: 'clamp(26px, 3.5vw, 36px)', color: '#f0ede8', margin: '10px 0 8px', fontWeight: 400 }}>{s.name}</h2>
              <div style={{ display: 'flex', gap: '16px', marginBottom: '20px' }}>
                <span style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '15px', color: '#e8355a', fontWeight: 600 }}>{s.price}</span>
                <span style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '15px', color: 'rgba(240,237,232,0.4)' }}>·</span>
                <span style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '14px', color: 'rgba(240,237,232,0.5)' }}>{s.capacity}</span>
              </div>
              <p style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '15px', color: 'rgba(240,237,232,0.6)', lineHeight: 1.7, margin: '0 0 28px' }}>{s.desc}</p>
              <h3 style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '11px', fontWeight: 600, color: 'rgba(240,237,232,0.35)', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 14px' }}>Equipment</h3>
              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {s.equipment.map(item => (
                  <li key={item} style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '14px', color: 'rgba(240,237,232,0.7)', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ color: '#e8355a', fontSize: '9px', flexShrink: 0 }}>●</span> {item}
                  </li>
                ))}
              </ul>
              {s.note && (
                <div style={{ background: 'rgba(232,53,90,0.08)', border: '1px solid rgba(232,53,90,0.2)', borderRadius: '8px', padding: '12px 14px', marginBottom: '24px' }}>
                  <p style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '13px', color: 'rgba(240,237,232,0.6)', margin: 0 }}>⚠ {s.note}</p>
                </div>
              )}
              <a href={BOOK_URL} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-block', background: '#e8355a', color: '#fff', textDecoration: 'none', fontFamily: '"DM Sans", sans-serif', fontSize: '15px', fontWeight: 600, padding: '13px 28px', borderRadius: '8px' }}>
                Book {s.name.split(' — ')[0]}
              </a>
            </div>
          </div>
        </section>
      ))}
    </>
  )
}
