import SEO from '../components/SEO'

const BOOK_URL = 'https://book.studio-808.com'

export default function About() {
  return (
    <>
      <SEO
        title="About Studio 808 | Chelmsford's Creative Hub Since 2014"
        description="Studio 808 was founded in 2014 with a simple mission: make everyone feel welcome. Chelmsford's home for DJs, producers, podcasters and content creators."
        canonical="/about-us"
      />

      <section style={{ padding: '72px 24px 60px', borderBottom: '1px solid rgba(240,237,232,0.06)' }}>
        <div style={{ maxWidth: '760px' }}>
          <span style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '12px', fontWeight: 600, color: '#e8355a', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Our Story</span>
          <h1 style={{ fontFamily: '"DM Serif Display", serif', fontSize: 'clamp(32px, 5vw, 52px)', color: '#f0ede8', margin: '12px 0 20px', fontWeight: 400, lineHeight: 1.1 }}>A Decade of<br />Creative Spaces</h1>
          <p style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '17px', color: 'rgba(240,237,232,0.55)', margin: 0, lineHeight: 1.65 }}>
            Founded in 2014, Studio 808 has been Chelmsford's home for DJs, producers, podcasters and content creators for over ten years.
          </p>
        </div>
      </section>

      <section style={{ padding: '80px 24px', borderBottom: '1px solid rgba(240,237,232,0.06)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '56px', alignItems: 'center' }}>
          <div style={{ background: 'rgba(240,237,232,0.04)', border: '1px solid rgba(240,237,232,0.08)', borderRadius: '12px', height: '380px', overflow: 'hidden' }}>
            <img src="" alt="Studio 808 Chelmsford — reception and studio entrance" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
          <div>
            <h2 style={{ fontFamily: '"DM Serif Display", serif', fontSize: 'clamp(26px, 3.5vw, 38px)', color: '#f0ede8', margin: '0 0 20px', fontWeight: 400 }}>Everyone's Welcome Here</h2>
            <p style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '15px', color: 'rgba(240,237,232,0.6)', lineHeight: 1.75, margin: '0 0 16px' }}>
              Studio 808 was built on a simple idea: that professional creative spaces shouldn't be exclusive to the few. Whether you're picking up decks for the first time, recording your debut EP or building a podcast audience — you belong here.
            </p>
            <p style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '15px', color: 'rgba(240,237,232,0.6)', lineHeight: 1.75, margin: '0 0 16px' }}>
              Over the past decade, thousands of artists, producers, DJs and creators have used Studio 808 to develop their craft. Many of them are now touring DJs, signed artists and successful content creators.
            </p>
            <p style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '15px', color: 'rgba(240,237,232,0.6)', lineHeight: 1.75, margin: '0 0 32px' }}>
              We've invested continuously in the best equipment — Pioneer CDJ-3000s, Neve 1073, Neumann U87, Focal SM9 — so our members can practise and record with the same tools they'll encounter on the biggest stages.
            </p>
            <a href={BOOK_URL} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-block', background: '#e8355a', color: '#fff', textDecoration: 'none', fontFamily: '"DM Sans", sans-serif', fontSize: '15px', fontWeight: 600, padding: '13px 28px', borderRadius: '8px' }}>
              Book a Session
            </a>
          </div>
        </div>
      </section>

      <section style={{ padding: '80px 24px', background: '#111111', borderBottom: '1px solid rgba(240,237,232,0.06)' }}>
        <div style={{ maxWidth: '760px', margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontFamily: '"DM Serif Display", serif', fontSize: 'clamp(24px, 3.5vw, 36px)', color: '#f0ede8', margin: '0 0 40px', fontWeight: 400 }}>Find Us</h2>
          <div style={{ background: '#080808', border: '1px solid rgba(240,237,232,0.08)', borderRadius: '12px', padding: '32px', marginBottom: '24px' }}>
            <p style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '16px', color: '#f0ede8', fontWeight: 600, margin: '0 0 8px' }}>Studio 808 Ltd</p>
            <p style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '15px', color: 'rgba(240,237,232,0.6)', margin: '0 0 16px', lineHeight: 1.7 }}>
              Unit 11–11A Robjohns House<br />
              Navigation Road<br />
              Chelmsford, CM2 6ND
            </p>
            <a href="mailto:info@studio-808.com" style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '15px', color: '#e8355a', textDecoration: 'none', fontWeight: 500 }}>info@studio-808.com</a>
          </div>
          <p style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '14px', color: 'rgba(240,237,232,0.45)', lineHeight: 1.6 }}>
            Five minutes walk from Chelmsford railway station. Street parking available on Navigation Road and nearby Springfield Road.
          </p>
        </div>
      </section>
    </>
  )
}
