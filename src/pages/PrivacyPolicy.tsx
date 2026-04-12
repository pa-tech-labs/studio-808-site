import { useEffect } from 'react'
import SEO from '../components/SEO'
import { BG, TEXT, MUTED, BORDER, F_HEAD, F_BODY, ACCENT, sectionLabel } from '../styles'

const EMAIL = 'admin@studio-808.com'

export default function PrivacyPolicy() {
  useEffect(() => { window.scrollTo(0, 0) }, [])

  return (
    <>
      <SEO
        title="Privacy Policy | Studio 808"
        description="How Studio 808 collects, uses and protects your personal data. Read our full privacy policy."
        canonical="/privacy"
      />

      {/* Header */}
      <section style={{ paddingTop: '152px', paddingBottom: '60px', paddingLeft: '24px', paddingRight: '24px', borderBottom: `1px solid ${BORDER}` }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <span style={sectionLabel}>Legal</span>
          <h1 className="mh" style={{ fontSize: 'clamp(32px, 5vw, 52px)', color: TEXT, margin: '0 0 16px', lineHeight: 1.1, letterSpacing: '-0.02em' }}>
            Privacy Policy
          </h1>
          <p style={{ fontFamily: F_BODY, fontSize: '14px', color: MUTED, margin: 0 }}>Last updated: April 2026</p>
        </div>
      </section>

      {/* Body */}
      <section style={{ background: BG, padding: '64px 24px 100px' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <style>{`
            .pp h2 { font-family: ${F_HEAD}; font-size: 22px; color: ${TEXT}; margin: 48px 0 16px; font-weight: 400; line-height: 1.25; }
            .pp h2:first-child { margin-top: 0; }
            .pp p { font-family: ${F_BODY}; font-size: 15px; color: rgba(240,237,232,0.7); line-height: 1.75; margin: 0 0 16px; }
            .pp ul { font-family: ${F_BODY}; font-size: 15px; color: rgba(240,237,232,0.7); line-height: 1.75; margin: 0 0 16px; padding-left: 24px; }
            .pp li { margin-bottom: 6px; }
            .pp a { color: ${ACCENT}; text-decoration: none; }
            .pp a:hover { text-decoration: underline; }
          `}</style>

          <div className="pp">
            <h2>1. Who we are</h2>
            <p>
              Studio 808 is a trading name of Studio 808 Ltd, a company registered in England and Wales. We operate recording, production, DJ, and podcast studios at Navigation Road, Unit 11–11A Robjohns House, Chelmsford, Essex, CM2 6ND.
            </p>
            <p>Contact: <a href={`mailto:${EMAIL}`}>{EMAIL}</a></p>

            <h2>2. What data we collect</h2>
            <p>When you book a session, create an account, or contact us, we may collect:</p>
            <ul>
              <li>Your name, email address, phone number, and date of birth</li>
              <li>Booking history and session preferences</li>
              <li>Payment information (processed securely by Stripe — we do not store card details)</li>
              <li>Messages sent via our contact form, WhatsApp, email, or in-app chat</li>
              <li>Device information and IP address when you use our website or booking platform</li>
              <li>Push notification tokens if you use our mobile app</li>
            </ul>

            <h2>3. How we use your data</h2>
            <p>We use your information to:</p>
            <ul>
              <li>Process and manage your studio bookings</li>
              <li>Send booking confirmations, door access codes, and session reminders</li>
              <li>Send promotional offers, loyalty rewards, and marketing communications (only with your consent)</li>
              <li>Provide customer support</li>
              <li>Improve our services and website</li>
              <li>Comply with legal obligations</li>
            </ul>

            <h2>4. Lawful basis for processing</h2>
            <p>We process your data under the following lawful bases (UK GDPR):</p>
            <ul>
              <li><strong>Contract:</strong> to fulfil your booking and provide our services</li>
              <li><strong>Consent:</strong> for marketing communications — you can withdraw consent at any time</li>
              <li><strong>Legitimate interest:</strong> to improve our services, prevent fraud, and ensure security</li>
            </ul>

            <h2>5. Third-party services</h2>
            <p>We share data with the following third parties only as necessary to provide our services:</p>
            <ul>
              <li><strong>Stripe:</strong> payment processing</li>
              <li><strong>Supabase:</strong> database hosting (EU region)</li>
              <li><strong>Resend:</strong> transactional emails</li>
              <li><strong>Meta (WhatsApp Business API):</strong> messaging</li>
              <li><strong>Vercel:</strong> website hosting</li>
              <li><strong>Google Analytics:</strong> anonymous website usage analytics</li>
            </ul>
            <p>We do not sell your personal data to any third party.</p>

            <h2>6. Data retention</h2>
            <p>
              We retain your personal data for as long as your account is active or as needed to provide our services. Booking records are retained for up to 6 years for accounting and legal purposes. You can request deletion of your account and personal data at any time by emailing <a href={`mailto:${EMAIL}`}>{EMAIL}</a>.
            </p>

            <h2>7. Your rights</h2>
            <p>Under UK GDPR, you have the right to:</p>
            <ul>
              <li>Access the personal data we hold about you</li>
              <li>Correct any inaccurate data</li>
              <li>Request deletion of your data</li>
              <li>Object to or restrict processing</li>
              <li>Data portability</li>
              <li>Withdraw consent for marketing at any time</li>
            </ul>
            <p>To exercise any of these rights, contact us at <a href={`mailto:${EMAIL}`}>{EMAIL}</a>.</p>

            <h2>8. Cookies</h2>
            <p>
              Our website uses essential cookies to ensure functionality. We also use Google Analytics (GA4) to understand how visitors use our site. You can disable cookies in your browser settings.
            </p>

            <h2>9. Security</h2>
            <p>
              We take appropriate technical and organisational measures to protect your data, including encrypted connections (HTTPS), secure authentication, and access controls.
            </p>

            <h2>10. Changes to this policy</h2>
            <p>
              We may update this policy from time to time. Any changes will be posted on this page with an updated revision date.
            </p>

            <h2>11. Contact</h2>
            <p>If you have any questions about this privacy policy or how we handle your data, contact us at:</p>
            <p>
              Email: <a href={`mailto:${EMAIL}`}>{EMAIL}</a><br />
              Address: Studio 808, Navigation Road, Unit 11–11A Robjohns House, Chelmsford, Essex, CM2 6ND
            </p>
          </div>
        </div>
      </section>
    </>
  )
}
