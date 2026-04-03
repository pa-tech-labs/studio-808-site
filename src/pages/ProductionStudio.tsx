import SEO from '../components/SEO'

const BOOK_URL = 'https://book.studio-808.com'

const equipment = [
  'Focal SM9 reference monitors',
  'SPL Tube Vitalizer channel strip',
  'Neve 1073 microphone preamp',
  'Universal Audio Apollo 8x interface',
  'Neumann U87 condenser microphone',
  'Novation Summit synthesiser',
  'Korg Minilogue XD synthesiser',
  'Akai MPC (standalone)',
  'Selection of microphones',
]

const services = [
  { name: 'Dry Hire', price: 'From £60/hr', desc: 'Room only — bring your own engineer or work independently. Ideal for experienced producers and mix engineers.' },
  { name: 'With Engineer', price: 'From £100/hr', desc: 'Includes the room and one of our experienced house engineers. Perfect for recording sessions, vocal takes and artist production.' },
  { name: 'Mixing & Mastering', price: '£150/track', desc: 'Professional mix and master from our in-house team. Delivery within agreed timeframe.' },
  { name: 'Custom Track Production', price: '£600–£1,000', desc: 'Full custom track production from idea to finished master. Price varies by complexity and number of revisions.' },
]

export default function ProductionStudio() {
  return (
    <>
      <SEO
        title="Production Studio Chelmsford | Studio 808 — Neve 1073 · Neumann U87"
        description="Professional recording studio in Chelmsford. Focal SM9 monitors, Neve 1073, UA Apollo 8x, Neumann U87. Dry hire from £60/hr or with engineer from £100/hr."
        canonical="/main-production-studio"
      />

      {/* Header */}
      <section style={{ padding: '72px 24px 60px', borderBottom: '1px solid rgba(240,237,232,0.06)' }}>
        <div style={{ maxWidth: '760px' }}>
          <span style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '12px', fontWeight: 600, color: '#e8355a', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Studio 4 — Production</span>
          <h1 style={{ fontFamily: '"DM Serif Display", serif', fontSize: 'clamp(32px, 5vw, 52px)', color: '#f0ede8', margin: '12px 0 20px', fontWeight: 400, lineHeight: 1.1 }}>Pro Production<br />Studio Chelmsford</h1>
          <p style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '17px', color: 'rgba(240,237,232,0.55)', margin: 0, lineHeight: 1.65, maxWidth: '560px' }}>
            Our flagship recording and production studio. First floor, acoustically treated, with an industry-standard signal chain from mic to monitor.
          </p>
        </div>
      </section>

      {/* Main content */}
      <section style={{ padding: '80px 24px', borderBottom: '1px solid rgba(240,237,232,0.06)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '56px', alignItems: 'start' }}>
          <div style={{ background: 'rgba(240,237,232,0.04)', border: '1px solid rgba(240,237,232,0.08)', borderRadius: '12px', height: '400px', overflow: 'hidden' }}>
            <img src="" alt="Studio 4 production studio at Studio 808 Chelmsford — Focal SM9 monitors, Neve 1073" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
          <div>
            <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', flexWrap: 'wrap' }}>
              <div style={{ background: '#111111', border: '1px solid rgba(240,237,232,0.08)', borderRadius: '8px', padding: '12px 16px' }}>
                <p style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '11px', color: 'rgba(240,237,232,0.4)', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 4px' }}>Dry Hire</p>
                <p style={{ fontFamily: '"DM Serif Display", serif', fontSize: '20px', color: '#f0ede8', margin: 0 }}>From £60<span style={{ fontSize: '13px', color: 'rgba(240,237,232,0.4)' }}>/hr</span></p>
              </div>
              <div style={{ background: '#111111', border: '1px solid rgba(240,237,232,0.08)', borderRadius: '8px', padding: '12px 16px' }}>
                <p style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '11px', color: 'rgba(240,237,232,0.4)', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 4px' }}>With Engineer</p>
                <p style={{ fontFamily: '"DM Serif Display", serif', fontSize: '20px', color: '#f0ede8', margin: 0 }}>From £100<span style={{ fontSize: '13px', color: 'rgba(240,237,232,0.4)' }}>/hr</span></p>
              </div>
              <div style={{ background: '#111111', border: '1px solid rgba(240,237,232,0.08)', borderRadius: '8px', padding: '12px 16px' }}>
                <p style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '11px', color: 'rgba(240,237,232,0.4)', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 4px' }}>Capacity</p>
                <p style={{ fontFamily: '"DM Serif Display", serif', fontSize: '20px', color: '#f0ede8', margin: 0 }}>5 people</p>
              </div>
            </div>
            <h2 style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '11px', fontWeight: 600, color: 'rgba(240,237,232,0.35)', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 14px' }}>Equipment</h2>
            <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 32px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {equipment.map(item => (
                <li key={item} style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '14px', color: 'rgba(240,237,232,0.7)', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ color: '#e8355a', fontSize: '9px', flexShrink: 0 }}>●</span> {item}
                </li>
              ))}
            </ul>
            <div style={{ background: 'rgba(240,237,232,0.04)', border: '1px solid rgba(240,237,232,0.08)', borderRadius: '8px', padding: '16px 18px', marginBottom: '28px' }}>
              <p style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '13px', color: 'rgba(240,237,232,0.6)', margin: 0, lineHeight: 1.6 }}>
                <strong style={{ color: '#f0ede8' }}>Booking with an engineer?</strong> Please email <a href="mailto:info@studio-808.com" style={{ color: '#e8355a' }}>info@studio-808.com</a> at least 24 hours before your session to discuss your project and confirm requirements.
              </p>
            </div>
            <a href={BOOK_URL} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-block', background: '#e8355a', color: '#fff', textDecoration: 'none', fontFamily: '"DM Sans", sans-serif', fontSize: '15px', fontWeight: 600, padding: '13px 28px', borderRadius: '8px' }}>
              Book Studio 4
            </a>
          </div>
        </div>
      </section>

      {/* Services */}
      <section style={{ padding: '80px 24px', background: '#111111', borderBottom: '1px solid rgba(240,237,232,0.06)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h2 style={{ fontFamily: '"DM Serif Display", serif', fontSize: 'clamp(26px, 3.5vw, 38px)', color: '#f0ede8', margin: '0 0 40px', fontWeight: 400 }}>Services &amp; Pricing</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
            {services.map(svc => (
              <div key={svc.name} style={{ background: '#080808', border: '1px solid rgba(240,237,232,0.08)', borderRadius: '12px', padding: '28px' }}>
                <p style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '12px', fontWeight: 600, color: '#e8355a', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 8px' }}>{svc.name}</p>
                <p style={{ fontFamily: '"DM Serif Display", serif', fontSize: '24px', color: '#f0ede8', margin: '0 0 12px', fontWeight: 400 }}>{svc.price}</p>
                <p style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '14px', color: 'rgba(240,237,232,0.55)', margin: 0, lineHeight: 1.6 }}>{svc.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
