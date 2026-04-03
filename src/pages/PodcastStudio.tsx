import SEO from '../components/SEO'

const PA_MEDIA_BOOK = 'https://pa-media-7049.lumentry.io/book'

export default function PodcastStudio() {
  return (
    <>
      <SEO
        title="Podcast Studio Chelmsford | PA Media — Professional Podcast Recording"
        description="Professional podcast recording and production in Chelmsford. Studio 808's podcast services are now provided by PA Media — our sister company specialising in content creation."
        canonical="/podcast-studio"
      />

      <section style={{ padding: '72px 24px 60px', borderBottom: '1px solid rgba(240,237,232,0.06)' }}>
        <div style={{ maxWidth: '760px' }}>
          <span style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '12px', fontWeight: 600, color: '#e8355a', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Podcast Studio</span>
          <h1 style={{ fontFamily: '"DM Serif Display", serif', fontSize: 'clamp(32px, 5vw, 52px)', color: '#f0ede8', margin: '12px 0 20px', fontWeight: 400, lineHeight: 1.1 }}>Podcast Recording<br />in Chelmsford</h1>
          <p style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '17px', color: 'rgba(240,237,232,0.55)', margin: 0, lineHeight: 1.65 }}>
            Studio 808 no longer offers podcast studio hire directly — but you're in good hands. Our sister company, PA Media, now handles all podcast and content creation bookings.
          </p>
        </div>
      </section>

      <section style={{ padding: '80px 24px' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '48px', alignItems: 'center' }}>
          <div>
            <div style={{ display: 'inline-block', background: 'rgba(232,53,90,0.1)', border: '1px solid rgba(232,53,90,0.25)', borderRadius: '8px', padding: '8px 14px', marginBottom: '24px' }}>
              <span style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '13px', fontWeight: 600, color: '#e8355a' }}>Introducing PA Media</span>
            </div>
            <h2 style={{ fontFamily: '"DM Serif Display", serif', fontSize: 'clamp(24px, 3vw, 34px)', color: '#f0ede8', margin: '0 0 20px', fontWeight: 400 }}>Professional Podcast &amp; Content Creation</h2>
            <p style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '15px', color: 'rgba(240,237,232,0.6)', lineHeight: 1.7, margin: '0 0 16px' }}>
              PA Media is Studio 808's sister company, specialising in professional podcast recording, production and content creation. They offer the same Studio 808 standard of quality with a dedicated focus on spoken-word and video content.
            </p>
            <p style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '15px', color: 'rgba(240,237,232,0.6)', lineHeight: 1.7, margin: '0 0 32px' }}>
              Whether you're launching your first podcast, recording a series or producing branded content for your business — PA Media has you covered.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '32px' }}>
              {[
                'Professional podcast recording studio',
                'Multi-guest recording (remote and in-person)',
                'Podcast editing and post-production',
                'Video podcast recording',
                'Branded content creation',
                'Distribution and publishing support',
              ].map(item => (
                <div key={item} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ color: '#e8355a', fontSize: '9px', flexShrink: 0 }}>●</span>
                  <span style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '14px', color: 'rgba(240,237,232,0.7)' }}>{item}</span>
                </div>
              ))}
            </div>
            <a href={PA_MEDIA_BOOK} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-block', background: '#e8355a', color: '#fff', textDecoration: 'none', fontFamily: '"DM Sans", sans-serif', fontSize: '15px', fontWeight: 600, padding: '14px 32px', borderRadius: '8px' }}>
              Book with PA Media →
            </a>
          </div>
          <div style={{ background: '#111111', border: '1px solid rgba(240,237,232,0.08)', borderRadius: '12px', padding: '32px', textAlign: 'center' }}>
            <div style={{ width: '64px', height: '64px', background: '#e8355a', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', fontSize: '28px' }}>
              🎙
            </div>
            <h3 style={{ fontFamily: '"DM Serif Display", serif', fontSize: '22px', color: '#f0ede8', margin: '0 0 12px', fontWeight: 400 }}>Book a Podcast Session</h3>
            <p style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '14px', color: 'rgba(240,237,232,0.55)', margin: '0 0 24px', lineHeight: 1.6 }}>
              Book your podcast recording session directly with PA Media using the button below. Same-day bookings available.
            </p>
            <a href={PA_MEDIA_BOOK} target="_blank" rel="noopener noreferrer" style={{ display: 'block', background: '#e8355a', color: '#fff', textDecoration: 'none', fontFamily: '"DM Sans", sans-serif', fontSize: '15px', fontWeight: 600, padding: '13px', borderRadius: '8px', marginBottom: '16px' }}>
              Book Now with PA Media
            </a>
            <p style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '12px', color: 'rgba(240,237,232,0.35)', margin: 0 }}>Powered by Lumentry booking</p>
          </div>
        </div>
      </section>
    </>
  )
}
