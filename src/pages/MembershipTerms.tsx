import { useEffect } from 'react'
import SEO from '../components/SEO'
import { BG, TEXT, MUTED, BORDER, F_HEAD, F_BODY, ACCENT, sectionLabel } from '../styles'

const EMAIL = 'admin@studio-808.com'

export default function MembershipTerms() {
  useEffect(() => { window.scrollTo(0, 0) }, [])

  return (
    <>
      <SEO
        title="Producer Membership Terms | Studio 808"
        description="The terms of Studio 808 Producer Membership: minimum commitment, monthly billing, cancellation, access and hours."
        canonical="/membership-terms"
      />

      {/* Header */}
      <section style={{ paddingTop: '152px', paddingBottom: '60px', paddingLeft: '24px', paddingRight: '24px', borderBottom: `1px solid ${BORDER}` }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <span style={sectionLabel}>Membership</span>
          <h1 className="mh" style={{ fontSize: 'clamp(32px, 5vw, 52px)', color: TEXT, margin: '0 0 16px', lineHeight: 1.1, letterSpacing: '-0.02em' }}>
            Producer Membership Terms
          </h1>
          <p style={{ fontFamily: F_BODY, fontSize: '14px', color: MUTED, margin: 0 }}>Last updated: June 2026</p>
        </div>
      </section>

      {/* Body */}
      <section style={{ background: BG, padding: '64px 24px 100px' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <style>{`
            .mt h2 { font-family: ${F_HEAD}; font-size: 22px; color: ${TEXT}; margin: 48px 0 16px; font-weight: 400; line-height: 1.25; }
            .mt h2:first-child { margin-top: 0; }
            .mt p { font-family: ${F_BODY}; font-size: 15px; color: rgba(240,237,232,0.7); line-height: 1.75; margin: 0 0 16px; }
            .mt a { color: ${ACCENT}; text-decoration: none; }
            .mt a:hover { text-decoration: underline; }
          `}</style>

          <div className="mt">
            <h2>1. Minimum commitment</h2>
            <p>
              Producer Membership requires a minimum commitment of either 3 or 6 months, depending on the plan you choose at signup.
            </p>

            <h2>2. Monthly billing</h2>
            <p>
              Membership is billed automatically each month using the card you provide at signup. After your minimum term, your membership continues on a rolling monthly basis until you cancel.
            </p>

            <h2>3. Cancellation</h2>
            <p>
              Your membership continues automatically on a monthly basis after your minimum term. You may cancel at any time via your dashboard. If you cancel during your minimum commitment period, your membership remains active and payable until the end of that period. After the minimum term, cancellation takes effect at the end of your current billing month. No refunds are given for partial months.
            </p>

            <h2>4. Access and hours</h2>
            <p>
              Your monthly booking hours reset at the start of each billing cycle. Unused hours do not roll over to the following month.
            </p>

            <h2>5. Changes to membership</h2>
            <p>
              Studio 808 may amend membership pricing with 30 days notice to existing members.
            </p>

            <h2>6. Contact</h2>
            <p>
              Any questions, email <a href={`mailto:${EMAIL}`}>{EMAIL}</a>.
            </p>
          </div>
        </div>
      </section>
    </>
  )
}
